import * as Notifications from "expo-notifications";
import Storage from "expo-sqlite/kv-store";
import { Platform } from "react-native";
import { esReservaProxima, etiquetaFechaCorta, fechaHoraDeReserva, momentoDelRecordatorio } from "../dominio";
import type { Reserva } from "../tipos";
import { motivoDeSuspension } from "./disponibilidad";

// Notificaciones LOCALES (expo-notifications), disparadas por hechos reales de la app:
//   1. Recordatorio 2 horas antes: se programa al reservar y se cancela al cancelar.
//   2. Aviso de suspensión: al abrir "Mis reservas", si el turno de una reserva quedó
//      bloqueado (lluvia / mantenimiento), se avisa una sola vez por reserva.
// El aviso de "se liberó un turno de tu favorito" necesita un servidor que avise (push) o una
// tarea en segundo plano: no se puede resolver solo con notificaciones locales (ver dudas).

const CANAL = "turnos";
const idRecordatorio = (reservaId: string) => `recordatorio-${reservaId}`;
const claveSuspension = (reservaId: string) => `aviso:suspension:${reservaId}`;

// Mientras la app está abierta, también se muestran.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function asegurarCanal(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CANAL, {
    name: "Turnos",
    importance: Notifications.AndroidImportance.HIGH,
  });
}

export async function tienePermiso(): Promise<boolean> {
  try {
    return (await Notifications.getPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

/** Se pide en contexto (al hacer la primera reserva), no al abrir la app. */
export async function pedirPermiso(): Promise<boolean> {
  try {
    await asegurarCanal();
    const actual = await Notifications.getPermissionsAsync();
    if (actual.granted) return true;
    if (!actual.canAskAgain) return false;
    return (await Notifications.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

/** Programa el recordatorio. Devuelve false si ya pasó la hora de avisar o no se pudo. */
export async function programarRecordatorio(reserva: Reserva, nombreEspacio: string): Promise<boolean> {
  try {
    const momento = momentoDelRecordatorio(reserva);
    if (momento.getTime() <= Date.now()) return false;
    await asegurarCanal();
    await Notifications.scheduleNotificationAsync({
      identifier: idRecordatorio(reserva.id),
      content: {
        title: "Tu turno es en 2 horas",
        body: `${nombreEspacio} a las ${fechaHoraDeReserva(reserva).hora}. Llevá el código QR.`,
        data: { reservaId: reserva.id },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: momento, channelId: CANAL },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelarRecordatorio(reservaId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(idRecordatorio(reservaId));
  } catch {
    // si no existía, no pasa nada
  }
}

/** Deja los recordatorios al día con las reservas (por ejemplo, tras instalar en otro teléfono). */
export async function sincronizarRecordatorios(reservas: Reserva[], nombres: Record<string, string>): Promise<void> {
  if (!(await tienePermiso())) return;
  try {
    const programados = new Set((await Notifications.getAllScheduledNotificationsAsync()).map((n) => n.identifier));
    for (const r of reservas) {
      const existe = programados.has(idRecordatorio(r.id));
      if (esReservaProxima(r)) {
        if (!existe) await programarRecordatorio(r, nombres[r.espacioId] ?? "Tu reserva");
      } else if (existe) {
        await cancelarRecordatorio(r.id);
      }
    }
  } catch {
    // las notificaciones nunca deben romper la pantalla
  }
}

async function avisarSuspension(reserva: Reserva, nombreEspacio: string, motivo: string): Promise<void> {
  const clave = claveSuspension(reserva.id);
  try {
    if (Storage.getItemSync(clave)) return; // ya se avisó
    if (!(await tienePermiso())) return;
    const { fecha, hora } = fechaHoraDeReserva(reserva);
    await asegurarCanal();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Tu turno fue suspendido",
        body: `${nombreEspacio} · ${etiquetaFechaCorta(fecha)} a las ${hora}: ${motivo}.`,
        data: { reservaId: reserva.id },
      },
      trigger: null, // inmediata
    });
    Storage.setItemSync(clave, "1");
  } catch {
    // no es crítico
  }
}

/**
 * Revisa las reservas próximas: devuelve { reservaId: motivo } de las suspendidas, avisa una vez
 * por cada una y les saca el recordatorio (ya no hay turno que recordar).
 */
export async function revisarSuspensiones(reservas: Reserva[], nombres: Record<string, string>): Promise<Record<string, string>> {
  const suspendidas: Record<string, string> = {};
  const proximas = reservas.filter((r) => esReservaProxima(r));

  const motivos = await Promise.all(
    proximas.map((r) => motivoDeSuspension(r).catch(() => null)),
  );
  for (let i = 0; i < proximas.length; i++) {
    const motivo = motivos[i];
    if (!motivo) continue;
    suspendidas[proximas[i].id] = motivo;
    await avisarSuspension(proximas[i], nombres[proximas[i].espacioId] ?? "Tu reserva", motivo);
    await cancelarRecordatorio(proximas[i].id);
  }
  return suspendidas;
}
