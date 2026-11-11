import type { Reserva } from "../tipos/reserva";
import type { Turno } from "../tipos/turno";
import { fechaLocal, sumarDias } from "../utils/fechas";

const hoy = fechaLocal();
const manana = fechaLocal(sumarDias(new Date(), 1));

export const ESPACIOS_CONTROL = [
  { id: "esp-01", nombre: "Cancha 1 — Fútbol 5" },
  { id: "esp-02", nombre: "Cancha 2 — Fútbol 5" },
];

export const NOMBRES_USUARIOS: Record<string, string> = {
  "usr-207": "Emiliano Ruiz",
  "usr-300": "Lucía Benítez",
};

function turno(id: string, espacioId: string, fecha: string, inicio: string, reservaId: string): Turno {
  const fin = `${String(Number(inicio.slice(0, 2)) + 1).padStart(2, "0")}:00`;
  return { id, espacioId, fecha, inicio, fin, estado: "reservado", reservaId, motivoBloqueo: null, precio: 12000 };
}

function reserva(
  id: string,
  codigoQr: string,
  turnoId: string,
  espacioId: string,
  estado: Reserva["estado"],
  usuarioId = "usr-207",
  ingresoEn: string | null = null,
): Reserva {
  return {
    id, turnoId, espacioId, usuarioId, cantidadPersonas: 10, codigoQr, estado, ingresoEn,
    creadaEn: new Date().toISOString(),
    cancelableHasta: new Date().toISOString(),
  };
}

const ingresoYa = new Date();
ingresoYa.setHours(19, 3, 0, 0);

// Códigos para probar (generá un QR con cualquier sitio, o escribilos a mano):
//   VGY-OK-1     válida, hoy, Cancha 2
//   VGY-MANANA   es de mañana            -> OTRO_DIA
//   VGY-CANCHA1  hoy, pero Cancha 1      -> OTRA_CANCHA si controlás la 2
//   VGY-CANCEL   cancelada               -> CANCELADA
//   VGY-USADA    ya ingresó a las 19:03  -> YA_INGRESO
//   cualquier otro texto                 -> NO_EXISTE
export const TURNOS_INGRESO: Turno[] = [
  turno("tur-1", "esp-02", hoy, "19:00", "res-1"),
  turno("tur-2", "esp-02", manana, "19:00", "res-2"),
  turno("tur-3", "esp-01", hoy, "20:00", "res-3"),
  turno("tur-4", "esp-02", hoy, "21:00", "res-4"),
  turno("tur-5", "esp-02", hoy, "18:00", "res-5"),
];

export const RESERVAS_INGRESO: Reserva[] = [
  reserva("res-1", "VGY-OK-1", "tur-1", "esp-02", "confirmada"),
  reserva("res-2", "VGY-MANANA", "tur-2", "esp-02", "confirmada", "usr-300"),
  reserva("res-3", "VGY-CANCHA1", "tur-3", "esp-01", "confirmada"),
  reserva("res-4", "VGY-CANCEL", "tur-4", "esp-02", "cancelada"),
  reserva("res-5", "VGY-USADA", "tur-5", "esp-02", "cumplida", "usr-207", ingresoYa.toISOString()),
];