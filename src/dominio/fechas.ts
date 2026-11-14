import { ZONA_ISO, ZONA_OFFSET_MIN } from "./constantes";

// Todo se calcula en horario de Argentina, sin importar la zona del teléfono.
// Las fechas sueltas son "AAAA-MM-DD" y las horas "HH:MM", como pide el PRD.

const MS_POR_MINUTO = 60_000;

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface FechaHora {
  fecha: string; // "AAAA-MM-DD"
  hora: string; // "HH:MM"
}

export const pad = (n: number): string => String(n).padStart(2, "0");

function partesFecha(fecha: string): { a: number; m: number; d: number } {
  const [a, m, d] = fecha.split("-").map(Number);
  return { a, m, d };
}

/** Convierte un instante a fecha y hora de Argentina. */
export function aFechaHoraAR(instante: Date): FechaHora {
  const d = new Date(instante.getTime() + ZONA_OFFSET_MIN * MS_POR_MINUTO);
  return {
    fecha: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    hora: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,
  };
}

/** "Hoy" en Argentina, aunque el teléfono esté en otra zona. */
export function hoyAR(ahora: Date = new Date()): string {
  return aFechaHoraAR(ahora).fecha;
}

/** Día de la semana de una fecha "AAAA-MM-DD" (0 = domingo). No depende de la zona. */
export function diaDeSemana(fecha: string): DiaSemana {
  const { a, m, d } = partesFecha(fecha);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay() as DiaSemana;
}

export function sumarDias(fecha: string, dias: number): string {
  const { a, m, d } = partesFecha(fecha);
  const x = new Date(Date.UTC(a, m - 1, d + dias));
  return `${x.getUTCFullYear()}-${pad(x.getUTCMonth() + 1)}-${pad(x.getUTCDate())}`;
}

/** Instante exacto en que empieza un turno. Acepta "24:00" (pasa al día siguiente). */
export function instanteDeTurno(fecha: string, hora: string): Date {
  const { a, m, d } = partesFecha(fecha);
  const [h, min] = hora.split(":").map(Number);
  return new Date(Date.UTC(a, m - 1, d, h, min) - ZONA_OFFSET_MIN * MS_POR_MINUTO);
}

/** ISO 8601 con zona de Argentina, ej: "2026-09-19T15:00:00-03:00". */
export function aIsoAR(instante: Date): string {
  const { fecha, hora } = aFechaHoraAR(instante);
  return `${fecha}T${hora}:00${ZONA_ISO}`;
}

/** "Sábado 19 de septiembre" */
export function etiquetaDia(fecha: string): string {
  const { m, d } = partesFecha(fecha);
  return `${DIAS[diaDeSemana(fecha)]} ${d} de ${MESES[m - 1]}`;
}

/** "Sáb 19" (para las pestañas de los próximos 7 días) */
export function etiquetaDiaCorta(fecha: string): string {
  const { d } = partesFecha(fecha);
  return `${DIAS[diaDeSemana(fecha)].slice(0, 3)} ${d}`;
}

/** "19/09" */
export function etiquetaFechaCorta(fecha: string): string {
  const { m, d } = partesFecha(fecha);
  return `${pad(d)}/${pad(m)}`;
}
