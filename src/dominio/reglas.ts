import type { Espacio, Reserva } from "../tipos";
import { HORAS_LIMITE_CANCELACION, MAX_RESERVAS_ACTIVAS } from "./constantes";
import type { TurnoGrilla } from "./tipos";

const MS_POR_HORA = 3_600_000;

/** Mismos códigos que va a usar la API en { error: { codigo } }. */
export type CodigoReglaReserva =
  | "ESPACIO_INACTIVO"
  | "TURNO_PASADO"
  | "TURNO_BLOQUEADO"
  | "TURNO_OCUPADO"
  | "CANTIDAD_INVALIDA"
  | "LIMITE_RESERVAS";

export type ResultadoValidacion = { ok: true } | { ok: false; codigo: CodigoReglaReserva; mensaje: string };

/**
 * Reservas activas = confirmadas cuyo turno todavía no empezó.
 * La Reserva del PRD no trae la hora del turno, pero sí cancelableHasta (= inicio - 4 hs),
 * así que el inicio se deduce de ahí. Si la API agrega la fecha del turno, usar esa.
 */
export function contarReservasActivas(reservas: Reserva[], ahora: Date = new Date()): number {
  return reservas.filter((r) => {
    if (r.estado !== "confirmada") return false;
    const inicio = new Date(r.cancelableHasta).getTime() + HORAS_LIMITE_CANCELACION * MS_POR_HORA;
    return inicio > ahora.getTime();
  }).length;
}

export function validarReserva(p: {
  turno: TurnoGrilla;
  espacio: Espacio;
  cantidadPersonas: number;
  reservasDelUsuario: Reserva[];
  ahora?: Date;
}): ResultadoValidacion {
  const ahora = p.ahora ?? new Date();
  const { turno } = p;

  if (!p.espacio.activo) {
    return { ok: false, codigo: "ESPACIO_INACTIVO", mensaje: "Este espacio no está disponible por el momento." };
  }
  if (turno.pasado) {
    return { ok: false, codigo: "TURNO_PASADO", mensaje: "Ese turno ya pasó." };
  }
  if (turno.estado === "mantenimiento") {
    return {
      ok: false,
      codigo: "TURNO_BLOQUEADO",
      mensaje: turno.motivoBloqueo ? `Turno bloqueado: ${turno.motivoBloqueo}.` : "Ese turno está bloqueado.",
    };
  }
  if (turno.estado !== "libre") {
    return { ok: false, codigo: "TURNO_OCUPADO", mensaje: "Ese turno ya fue reservado." };
  }
  if (!Number.isInteger(p.cantidadPersonas) || p.cantidadPersonas < 1) {
    return { ok: false, codigo: "CANTIDAD_INVALIDA", mensaje: "Indicá cuántas personas van a ser." };
  }
  if (contarReservasActivas(p.reservasDelUsuario, ahora) >= MAX_RESERVAS_ACTIVAS) {
    return {
      ok: false,
      codigo: "LIMITE_RESERVAS",
      mensaje: `Ya tenés ${MAX_RESERVAS_ACTIVAS} reservas activas. Cancelá una o esperá a jugarla para reservar otra.`,
    };
  }
  return { ok: true };
}
