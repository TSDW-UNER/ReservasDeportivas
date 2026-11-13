
/** Bloqueo de uno o varios turnos de un espacio deportivo. */
export interface Bloqueo {
  id: string;
  espacioId: string;
  fecha: string; // "AAAA-MM-DD"
  inicio: string | null; // "HH:MM"; null = día completo
  fin: string | null; // "HH:MM"; null = día completo
  motivo: string;
}
