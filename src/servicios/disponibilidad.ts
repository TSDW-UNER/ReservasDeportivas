import { construirGrilla, fechaHoraDeReserva, resumirDia, type ResumenDia, type TurnoGrilla } from "../dominio";
import { RESERVAS_FIJAS } from "../mocks/datos";
import { responder, turnosDelDia } from "../mocks/servidorFalso";
import type { Espacio, Reserva, ReservaFija, Turno } from "../tipos";
import { USAR_MOCK } from "./config";
import { pedir } from "./http";

export function listarTurnos(espacioId: string, fecha: string): Promise<Turno[]> {
  return USAR_MOCK
    ? responder(() => turnosDelDia(espacioId, fecha))
    : pedir<Turno[]>(`/espacios/${espacioId}/turnos?fecha=${fecha}`);
}

export function listarReservasFijas(espacioId: string): Promise<ReservaFija[]> {
  return USAR_MOCK
    ? responder(() => RESERVAS_FIJAS.filter((f) => f.espacioId === espacioId))
    : pedir<ReservaFija[]>(`/espacios/${espacioId}/reservas-fijas`);
}

export interface DiaDisponible {
  grilla: TurnoGrilla[];
  resumen: ResumenDia;
}

/**
 * Lo que necesita la pantalla de disponibilidad: trae los turnos y las fijas y arma la
 * grilla con el dominio (cruce de turnos + fijas + bloqueos + hora actual).
 * La disponibilidad siempre se pide en vivo: no se guarda en el teléfono porque un dato
 * viejo acá es peor que ningún dato.
 */
export async function obtenerDia(espacio: Espacio, fecha: string): Promise<DiaDisponible> {
  const [turnos, fijas] = await Promise.all([listarTurnos(espacio.id, fecha), listarReservasFijas(espacio.id)]);
  const grilla = construirGrilla({ espacio, fecha, turnos, fijas });
  return { grilla, resumen: resumirDia(grilla) };
}

/**
 * Si el turno de una reserva quedó bloqueado después de reservarlo (lluvia, mantenimiento),
 * devuelve el motivo. Si el turno sigue en pie, devuelve null.
 */
export async function motivoDeSuspension(reserva: Reserva): Promise<string | null> {
  const { fecha, hora } = fechaHoraDeReserva(reserva);
  const turnos = await listarTurnos(reserva.espacioId, fecha);
  const turno = turnos.find((t) => t.inicio === hora);
  return turno?.estado === "mantenimiento" ? (turno.motivoBloqueo ?? "Mantenimiento") : null;
}
