import type { Reserva } from "../tipos";
import { HORAS_LIMITE_CANCELACION } from "./constantes";
import { aFechaHoraAR, aIsoAR, etiquetaFechaCorta, hoyAR, instanteDeTurno, sumarDias } from "./fechas";

const MS_POR_HORA = 3_600_000;

/** cancelableHasta = inicio del turno menos 4 horas. Devuelve ISO con zona. */
export function calcularCancelableHasta(fecha: string, inicio: string): string {
  const limite = new Date(instanteDeTurno(fecha, inicio).getTime() - HORAS_LIMITE_CANCELACION * MS_POR_HORA);
  return aIsoAR(limite);
}

export type EstadoCancelacion =
  | "en_plazo" // se cancela sola desde la app
  | "fuera_de_plazo" // pasaron las 4 hs: hay que avisarle a la Dirección
  | "no_cancelable"; // ya está cancelada, cumplida o ausente

export interface InfoCancelacion {
  estado: EstadoCancelacion;
  /** Habilita el botón "Cancelar reserva". */
  puedeCancelarEnApp: boolean;
  /** Texto listo para mostrar debajo del botón. */
  mensaje: string;
}

/** "15:00 de hoy" / "15:00 de mañana" / "15:00 del 19/09" */
export function textoLimite(cancelableHasta: string, ahora: Date = new Date()): string {
  const { fecha, hora } = aFechaHoraAR(new Date(cancelableHasta));
  const hoy = hoyAR(ahora);
  const cuando =
    fecha === hoy ? "de hoy" : fecha === sumarDias(hoy, 1) ? "de mañana" : `del ${etiquetaFechaCorta(fecha)}`;
  return `${hora} ${cuando}`;
}

export function infoCancelacion(reserva: Reserva, ahora: Date = new Date()): InfoCancelacion {
  if (reserva.estado !== "confirmada") {
    return { estado: "no_cancelable", puedeCancelarEnApp: false, mensaje: "Esta reserva ya no se puede cancelar." };
  }
  if (ahora.getTime() <= new Date(reserva.cancelableHasta).getTime()) {
    return {
      estado: "en_plazo",
      puedeCancelarEnApp: true,
      mensaje: `Se puede cancelar sin aviso hasta las ${textoLimite(reserva.cancelableHasta, ahora)}`,
    };
  }
  return {
    estado: "fuera_de_plazo",
    puedeCancelarEnApp: false,
    mensaje: "Ya pasó el plazo para cancelar desde la app. Avisale a la Dirección de Deportes.",
  };
}
