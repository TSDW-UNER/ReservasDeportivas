import type { Turno } from "../tipos";

/**
 * Lo que dibuja la grilla: un Turno del PRD más lo que la pantalla necesita saber.
 * Vive acá (y no en src/tipos/) porque es un modelo de vista, no una entidad de la API.
 */
export interface TurnoGrilla extends Turno {
  /** El turno ya empezó o terminó: no se puede reservar aunque figure libre. */
  pasado: boolean;
  /** Se puede tocar "Reservar": libre, no pasado y espacio activo. */
  reservable: boolean;
  /** Si estado === "fijo", quién lo tiene (ej: "Grupo de los martes"). */
  titularFija: string | null;
}

export type EstadoDia = "disponible" | "completo" | "bloqueado" | "finalizado";

export interface ResumenDia {
  /**
   * disponible: hay algo para reservar.
   * completo: no hay nada libre (todo tomado o bloqueado a medias).
   * bloqueado: el día entero está en mantenimiento/lluvia.
   * finalizado: ya pasaron todos los turnos libres.
   */
  estado: EstadoDia;
  reservables: number;
  libres: number;
  reservados: number;
  fijos: number;
  mantenimiento: number;
  /** Motivo del bloqueo cuando el día entero está bloqueado. */
  motivoBloqueo: string | null;
}
