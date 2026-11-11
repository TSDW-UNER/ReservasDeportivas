import {
  ESPACIOS_CONTROL,
  NOMBRES_USUARIOS,
  RESERVAS_INGRESO,
  TURNOS_INGRESO,
} from "../mocks/ingresos";
import type { Reserva } from "../tipos/reserva";
import type { Turno } from "../tipos/turno";
import { ErrorApi } from "./errorApi";

// Copias en memoria: los cambios duran hasta recargar la app.
const reservas = RESERVAS_INGRESO.map((r) => ({ ...r }));
const turnos = TURNOS_INGRESO.map((t) => ({ ...t }));

const demora = (ms = 300) => new Promise<void>((r) => setTimeout(r, ms));

export interface DatosReserva {
  reserva: Reserva;
  turno: Turno;
  titular: string;
}

export const listarEspaciosControl = () => ESPACIOS_CONTROL;

export function nombreEspacio(id: string): string {
  return ESPACIOS_CONTROL.find((e) => e.id === id)?.nombre ?? "otra cancha";
}

// null = el código no corresponde a ninguna reserva
export async function buscarPorCodigo(codigo: string): Promise<DatosReserva | null> {
  await demora();
  const reserva = reservas.find((r) => r.codigoQr === codigo);
  if (!reserva) return null;
  const turno = turnos.find((t) => t.id === reserva.turnoId);
  if (!turno) return null;
  return { reserva, turno, titular: NOMBRES_USUARIOS[reserva.usuarioId] ?? "Sin nombre" };
}

export async function marcarPresente(reservaId: string): Promise<Reserva> {
  await demora();
  const r = reservas.find((x) => x.id === reservaId);
  if (!r) throw new ErrorApi("RESERVA_NO_ENCONTRADA", "La reserva no existe.");
  r.estado = "cumplida";
  r.ingresoEn = new Date().toISOString(); // ISO con zona (UTC, "Z")
  return { ...r };
}

export async function marcarAusente(reservaId: string): Promise<Reserva> {
  await demora();
  const r = reservas.find((x) => x.id === reservaId);
  if (!r) throw new ErrorApi("RESERVA_NO_ENCONTRADA", "La reserva no existe.");
  r.estado = "ausente";
  return { ...r };
}