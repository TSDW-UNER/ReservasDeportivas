import { guardarReserva, leerReservasDeUsuario, reemplazarReservasDeUsuario } from "../db/baseDatos";
import { infoCancelacion, validarReserva, type TurnoGrilla } from "../dominio";
import { cancelarReservaFalsa, crearReservaFalsa, responder, reservasDe } from "../mocks/servidorFalso";
import type { Espacio, Reserva } from "../tipos";
import { USAR_MOCK } from "./config";
import { ErrorApi } from "./errorApi";
import { pedir } from "./http";
import { esFalloDeRed, type Resultado } from "./resultado";

/** Mis reservas. Sin red, devuelve las guardadas en SQLite (con su QR) para verlas en la puerta. */
export async function listarMisReservas(usuarioId: string): Promise<Resultado<Reserva[]>> {
  try {
    const datos = USAR_MOCK ? await responder(() => reservasDe(usuarioId)) : await pedir<Reserva[]>("/reservas/mias");
    reemplazarReservasDeUsuario(usuarioId, datos);
    return { datos, desdeCache: false };
  } catch (e) {
    if (esFalloDeRed(e)) return { datos: leerReservasDeUsuario(usuarioId), desdeCache: true };
    throw e;
  }
}

export interface DatosNuevaReserva {
  usuarioId: string;
  espacio: Espacio;
  turno: TurnoGrilla;
  cantidadPersonas: number;
  /** El PRD pide indicar el deporte, pero Reserva no tiene ese campo: se envía por las dudas. */
  deporteId: string;
  /** Las reservas que ya tiene la persona, para controlar el máximo de 3 activas. */
  reservasActuales: Reserva[];
}

/** Valida con las reglas del dominio (feedback inmediato) y después reserva. */
export async function crearReserva(p: DatosNuevaReserva): Promise<Reserva> {
  const veredicto = validarReserva({
    turno: p.turno,
    espacio: p.espacio,
    cantidadPersonas: p.cantidadPersonas,
    reservasDelUsuario: p.reservasActuales,
  });
  if (!veredicto.ok) throw new ErrorApi(veredicto.codigo, veredicto.mensaje);

  const reserva = USAR_MOCK
    ? await responder(() =>
        crearReservaFalsa({
          usuarioId: p.usuarioId,
          espacioId: p.espacio.id,
          fecha: p.turno.fecha,
          inicio: p.turno.inicio,
          cantidadPersonas: p.cantidadPersonas,
        }),
      )
    : await pedir<Reserva>("/reservas", {
        metodo: "POST",
        cuerpo: {
          turnoId: p.turno.id,
          espacioId: p.espacio.id,
          fecha: p.turno.fecha,
          inicio: p.turno.inicio,
          cantidadPersonas: p.cantidadPersonas,
          deporteId: p.deporteId,
        },
      });

  guardarReserva(reserva); // queda en el teléfono: el QR se ve sin señal
  return reserva;
}

/** Cancela desde la app, solo dentro del plazo (hasta 4 horas antes). */
export async function cancelarReserva(reserva: Reserva): Promise<Reserva> {
  const info = infoCancelacion(reserva);
  if (!info.puedeCancelarEnApp) {
    throw new ErrorApi(info.estado === "fuera_de_plazo" ? "FUERA_DE_PLAZO" : "NO_CANCELABLE", info.mensaje);
  }
  const cancelada = USAR_MOCK
    ? await responder(() => cancelarReservaFalsa(reserva.id, reserva.usuarioId))
    : await pedir<Reserva>(`/reservas/${reserva.id}/cancelar`, { metodo: "POST" });

  guardarReserva(cancelada);
  return cancelada;
}
