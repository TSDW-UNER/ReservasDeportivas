import type { Reserva } from "../tipos/reserva";
import type { Turno } from "../tipos/turno";
import { describirFecha, fechaLocal, horaLocal } from "../utils/fechas";

type MotivoConReserva =
  | "CANCELADA"
  | "AUSENTE"
  | "YA_INGRESO"
  | "OTRO_DIA"
  | "OTRA_CANCHA";

export type ResultadoIngreso =
  | { ok: true; reserva: Reserva; turno: Turno }
  | { ok: false; motivo: "NO_EXISTE" }
  | { ok: false; motivo: MotivoConReserva; reserva: Reserva; turno: Turno };

// Sin cámara, sin red, sin pantalla: se puede probar con datos a mano.
// espacioControlId = la cancha que el encargado está controlando (null = todas).
export function validarIngreso(
  reserva: Reserva | null,
  turno: Turno | null,
  ahora: Date,
  espacioControlId: string | null,
): ResultadoIngreso {
  if (!reserva || !turno) return { ok: false, motivo: "NO_EXISTE" };

  const fallo = (motivo: MotivoConReserva): ResultadoIngreso => ({
    ok: false,
    motivo,
    reserva,
    turno,
  });

  if (reserva.estado === "cancelada") return fallo("CANCELADA");
  if (reserva.estado === "ausente") return fallo("AUSENTE");
  if (reserva.estado === "cumplida" || reserva.ingresoEn) return fallo("YA_INGRESO");
  if (turno.fecha !== fechaLocal(ahora)) return fallo("OTRO_DIA");
  if (espacioControlId && reserva.espacioId !== espacioControlId) return fallo("OTRA_CANCHA");

  return { ok: true, reserva, turno };
}

export function mensajeIngreso(
  res: Extract<ResultadoIngreso, { ok: false }>,
  ahora: Date,
  nombreEspacio: (id: string) => string,
  espacioControlId: string | null,
): string {
  switch (res.motivo) {
    case "NO_EXISTE":
      return "Código no reconocido: no corresponde a ninguna reserva.";
    case "CANCELADA":
      return "Esta reserva fue cancelada.";
    case "AUSENTE":
      return "Esta reserva ya fue marcada como ausente.";
    case "YA_INGRESO":
      return res.reserva.ingresoEn
        ? `Este código ya se usó: ingresaron a las ${horaLocal(res.reserva.ingresoEn)}.`
        : "Este código ya se usó.";
    case "OTRO_DIA":
      return `Esta reserva es del ${describirFecha(res.turno.fecha)}, hoy es ${describirFecha(fechaLocal(ahora))}.`;
    case "OTRA_CANCHA":
      return `Esta reserva es para ${nombreEspacio(res.reserva.espacioId)}, no para ${nombreEspacio(espacioControlId ?? "")}.`;
  }
}