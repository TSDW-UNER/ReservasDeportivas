
import {
  construirGrilla,
  fechaHoraDeReserva,
  resumirDia,
  type ResumenDia,
  type TurnoGrilla,
} from "../dominio";

import { RESERVAS_FIJAS } from "../mocks/datos";
import { responder, turnosDelDia } from "../mocks/servidorFalso";
import type { Espacio, Reserva, ReservaFija, Turno } from "../tipos";
import { USAR_MOCK } from "./config";
import { pedir } from "./http";

export function listarTurnos(
  espacioId: string,
  fecha: string,
): Promise<Turno[]> {
  if (USAR_MOCK) {
    return responder(() => turnosDelDia(espacioId, fecha));
  }

  return pedir<Turno[]>(
    `/espacios/${encodeURIComponent(espacioId)}/turnos?fecha=${encodeURIComponent(fecha)}`,
  );
}

export interface DiaDisponible {
  grilla: TurnoGrilla[];
  resumen: ResumenDia;
}

/**
 * Arma la grilla de disponibilidad del día.
 *
 * En modo mock:
 * - Obtiene los turnos simulados.
 * - Obtiene las reservas fijas por separado.
 *
 * En modo API:
 * - Obtiene los turnos del servidor.
 * - Los turnos fijos ya vienen identificados con estado "fijo".
 * - No consulta un endpoint adicional de reservas fijas.
 */
export async function obtenerDia(
  espacio: Espacio,
  fecha: string,
): Promise<DiaDisponible> {
  const turnos = await listarTurnos(espacio.id, fecha);

  let fijas: ReservaFija[] = [];

  if (USAR_MOCK) {
    fijas = await responder(() =>
      RESERVAS_FIJAS.filter((f) => f.espacioId === espacio.id),
    );
  }

  const grilla = construirGrilla({
    espacio,
    fecha,
    turnos,
    fijas,
  });

  return {
    grilla,
    resumen: resumirDia(grilla),
  };
}

/**
 * Si el turno de una reserva quedó bloqueado después de reservarlo
 * (lluvia, mantenimiento), devuelve el motivo.
 * Si el turno sigue en pie, devuelve null.
 */
export async function motivoDeSuspension(
  reserva: Reserva,
): Promise<string | null> {
  const { fecha, hora } = fechaHoraDeReserva(reserva);

  const turnos = await listarTurnos(reserva.espacioId, fecha);

  const turno = turnos.find((t) => t.inicio === hora);

  return turno?.estado === "mantenimiento"
    ? turno.motivoBloqueo ?? "Mantenimiento"
    : null;
}
