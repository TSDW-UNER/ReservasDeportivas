import type { Espacio, Reserva } from "../tipos";
import {
  HORAS_LIMITE_CANCELACION,
  HORAS_RECORDATORIO,
  MAX_RESERVAS_ACTIVAS,
} from "./constantes";
import { aFechaHoraAR, pad } from "./fechas";
import type { TurnoGrilla } from "./tipos";

const MS_POR_HORA = 3_600_000;

/** Mismos códigos que va a usar la API en { error: { codigo } }. */
export type CodigoReglaReserva =
  | "ESPACIO_INACTIVO"
  | "TURNO_PASADO"
  | "TURNO_BLOQUEADO"
  | "TURNO_OCUPADO"
  | "CANTIDAD_INVALIDA"
  | "CAPACIDAD_EXCEDIDA"
  | "LIMITE_DE_RESERVAS";

export type ResultadoValidacion =
  | { ok: true }
  | { ok: false; codigo: CodigoReglaReserva; mensaje: string };

/**
 * La Reserva del PRD no trae la hora del turno, pero sí cancelableHasta (= inicio - 4 hs).
 * De ahí se deduce el inicio. Si la API agrega la fecha del turno, cambiar solo esta función.
 */
export function inicioDeReserva(reserva: Reserva): Date {
  return new Date(
    new Date(reserva.cancelableHasta).getTime() +
      HORAS_LIMITE_CANCELACION * MS_POR_HORA,
  );
}

/** Fecha, hora de inicio y de fin del turno de una reserva (horario de Argentina). */
export function fechaHoraDeReserva(reserva: Reserva): {
  fecha: string;
  hora: string;
  fin: string;
} {
  const { fecha, hora } = aFechaHoraAR(inicioDeReserva(reserva));
  const fin =
    hora === "23:00"
      ? "24:00"
      : `${pad(Number(hora.slice(0, 2)) + 1)}:${hora.slice(3)}`;

  return { fecha, hora, fin };
}

/** Confirmada y todavía no empezó: es la que cuenta para el límite y la que se recuerda. */
export function esReservaProxima(
  reserva: Reserva,
  ahora: Date = new Date(),
): boolean {
  return (
    reserva.estado === "confirmada" &&
    inicioDeReserva(reserva).getTime() > ahora.getTime()
  );
}

/** Cuándo debe sonar el recordatorio (2 horas antes del turno). */
export function momentoDelRecordatorio(reserva: Reserva): Date {
  return new Date(
    inicioDeReserva(reserva).getTime() - HORAS_RECORDATORIO * MS_POR_HORA,
  );
}

/** Reservas activas = las próximas (confirmadas que todavía no empezaron). */
export function contarReservasActivas(
  reservas: Reserva[],
  ahora: Date = new Date(),
): number {
  return reservas.filter((r) => esReservaProxima(r, ahora)).length;
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
    return {
      ok: false,
      codigo: "ESPACIO_INACTIVO",
      mensaje: "Este espacio no está disponible por el momento.",
    };
  }

  if (turno.pasado) {
    return {
      ok: false,
      codigo: "TURNO_PASADO",
      mensaje: "Ese turno ya pasó.",
    };
  }

  if (turno.estado === "mantenimiento") {
    return {
      ok: false,
      codigo: "TURNO_BLOQUEADO",
      mensaje: turno.motivoBloqueo
        ? `Turno bloqueado: ${turno.motivoBloqueo}.`
        : "Ese turno está bloqueado.",
    };
  }

  if (turno.estado !== "libre") {
    return {
      ok: false,
      codigo: "TURNO_OCUPADO",
      mensaje: "Ese turno ya fue reservado.",
    };
  }

  if (!Number.isInteger(p.cantidadPersonas) || p.cantidadPersonas < 1) {
    return {
      ok: false,
      codigo: "CANTIDAD_INVALIDA",
      mensaje: "Indicá una cantidad válida de personas.",
    };
  }

  if (p.cantidadPersonas > p.espacio.capacidad) {
    return {
      ok: false,
      codigo: "CAPACIDAD_EXCEDIDA",
      mensaje: `Este espacio permite un máximo de ${p.espacio.capacidad} personas.`,
    };
  }

  if (
    contarReservasActivas(p.reservasDelUsuario, ahora) >= MAX_RESERVAS_ACTIVAS
  ) {
    return {
      ok: false,
      codigo: "LIMITE_DE_RESERVAS",
      mensaje: `Ya tenés ${MAX_RESERVAS_ACTIVAS} reservas activas. Cancelá una o esperá a jugarla para reservar otra.`,
    };
  }

  return { ok: true };
}
