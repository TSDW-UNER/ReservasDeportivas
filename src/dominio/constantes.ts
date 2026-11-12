// Reglas de negocio del PRD en un solo lugar. Si Nahuel cambia una, se cambia acá.

/** Argentina: UTC-3 todo el año (sin horario de verano). */
export const ZONA_OFFSET_MIN = -180;
export const ZONA_ISO = "-03:00";

/** Turnos de una hora, de 8:00 a 24:00. */
export const HORA_APERTURA = 8;
export const HORA_CIERRE = 24;

/** Máximo de reservas activas por persona. */
export const MAX_RESERVAS_ACTIVAS = 3;

/** Hasta cuántas horas antes del turno se cancela sola desde la app. */
export const HORAS_LIMITE_CANCELACION = 4;

/** Recordatorio antes del turno (lo usa servicios/notificaciones.ts). */
export const HORAS_RECORDATORIO = 2;

/** Cuántos días hacia adelante se pueden mirar (hoy incluido). */
export const DIAS_VISIBLES = 7;
