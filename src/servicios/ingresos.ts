import type { Espacio } from "../tipos/espacio";
import type { Reserva } from "../tipos/reserva";
import type { Turno } from "../tipos/turno";
import type { Usuario } from "../tipos/usuario";
import { fechaLocal } from "../utils/fechas";
import { pedir } from "./http";

export const listarEspacios = () => pedir<Espacio[]>("/espacios");

// Valida Y registra la llegada. Los errores (CODIGO_DE_OTRO_DIA, FUERA_DE_HORARIO, etc.)
// llegan como ErrorApi con el mensaje del servidor.
export const registrarIngreso = (codigoQr: string, espacioId: string) =>
  pedir<Reserva>("/ingresos", { metodo: "POST", cuerpo: { codigoQr, espacioId } });

export const marcarAusente = (reservaId: string) =>
  pedir<Reserva>(`/reservas/${reservaId}/ausente`, { metodo: "POST" });

// Códigos que significan "el código es real pero no corresponde ahora/acá".
// El resto (inexistente, cancelada, ausente, error) es un rechazo más grave.
const ADVERTENCIAS = new Set([
  "CODIGO_DE_OTRO_DIA",
  "CODIGO_DE_OTRO_ESPACIO",
  "FUERA_DE_HORARIO",
  "INGRESO_YA_REGISTRADO",
]);

export type Gravedad = "error" | "advertencia";

export const gravedadIngreso = (codigo: string): Gravedad =>
  ADVERTENCIAS.has(codigo) ? "advertencia" : "error";

// Datos para mostrar en la tarjeta. El ingreso ya está registrado, así que si algo
// falla acá no se bloquea nada: se muestra lo que haya.
export async function detallesIngreso(reserva: Reserva) {
  const [turno, titular] = await Promise.all([
    pedir<Turno[]>(`/espacios/${reserva.espacioId}/turnos?fecha=${fechaLocal()}`)
      .then((ts) => ts.find((t) => t.id === reserva.turnoId) ?? null)
      .catch(() => null),
    pedir<Usuario>(`/usuarios/${reserva.usuarioId}`)
      .then((u) => u.nombre)
      .catch(() => null),
  ]);
  return { turno, titular };
}

export interface ReservaPendiente {
  reserva: Reserva;
  turno: Turno | null;
  titular: string | null;
}

// Reservas confirmadas de hoy en una cancha (las que todavía no ingresaron),
// con su horario y el nombre del titular.
export async function reservasPendientes(espacioId: string): Promise<ReservaPendiente[]> {
  const fecha = fechaLocal();
  const [reservas, turnos] = await Promise.all([
    pedir<Reserva[]>(`/reservas?fecha=${fecha}&espacioId=${espacioId}&estado=confirmada`),
    pedir<Turno[]>(`/espacios/${espacioId}/turnos?fecha=${fecha}`),
  ]);

  const nombres = new Map<string, string | null>();
  await Promise.all(
    [...new Set(reservas.map((r) => r.usuarioId))].map(async (id) => {
      nombres.set(
        id,
        await pedir<Usuario>(`/usuarios/${id}`).then((u) => u.nombre).catch(() => null),
      );
    }),
  );

  return reservas
    .map((reserva) => ({
      reserva,
      turno: turnos.find((t) => t.id === reserva.turnoId) ?? null,
      titular: nombres.get(reserva.usuarioId) ?? null,
    }))
    .sort((a, b) => (a.turno?.inicio ?? "").localeCompare(b.turno?.inicio ?? ""));
}