// Una reserva fija NO es un turno: es una regla que ocupa el mismo horario todas las semanas.
export interface ReservaFija {
  id: string;
  espacioId: string;
  titular: string;
  dia: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = domingo
  inicio: string; // "HH:MM"
  fin: string;
  desde: string; // "AAAA-MM-DD"
  hasta: string | null; // null si no tiene fin
  activa: boolean;
}
