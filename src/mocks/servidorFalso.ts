// "Servidor" en memoria: hace lo que haría la API real, con datos falsos.
// Solo lo usa src/servicios/ cuando USAR_MOCK es true. Las pantallas nunca lo importan.
//
// Casos feos del PRD, todos relativos a HOY para que la demo siempre funcione:
//   hoy + 1  → esp-01: grilla COMPLETA, sin ningún turno libre
//   hoy + 2  → TODOS los espacios: día entero bloqueado por lluvia
//   hoy + 3  → esp-02: turno de las 20:00 en mantenimiento (y hay una reserva ahí: aviso de suspensión)
//   martes   → reservas fijas (ver RESERVAS_FIJAS)
//   Espacios sin video: esp-03, 05, 07, 08 y 10
//   Reserva cancelada y reserva cumplida en el historial
//   Error de red: poné opcionesMock.errorDeRed = true
import { aIsoAR, calcularCancelableHasta, construirGrilla, hoyAR, horasDeInicio, idTurnoGenerado, infoCancelacion, pad, validarReserva } from "../dominio";
import { ErrorApi } from "../servicios/errorApi";
import type { Espacio, Reserva, Turno, Usuario } from "../tipos";
import { ESPACIOS, RESERVAS_FIJAS, USUARIO_JUGADOR } from "./datos";

/** Para probar estados de carga y de error sin tocar las pantallas. */
export const opcionesMock = { errorDeRed: false, latenciaMs: 400 };

/** Toda respuesta falsa pasa por acá: simula demora de red y, si se pide, un corte. */
export async function responder<T>(calcular: () => T): Promise<T> {
  if (opcionesMock.latenciaMs > 0) {
    await new Promise((resolver) => setTimeout(resolver, opcionesMock.latenciaMs));
  }
  if (opcionesMock.errorDeRed) throw new ErrorApi("SIN_CONEXION", "No hay conexión a internet.");
  return calcular();
}

// ---------- utilidades ----------

const MS_DIA = 86_400_000;

function diasDesdeHoy(fecha: string, ahora: Date): number {
  const [a, m, d] = fecha.split("-").map(Number);
  const [a0, m0, d0] = hoyAR(ahora).split("-").map(Number);
  return Math.round((Date.UTC(a, m - 1, d) - Date.UTC(a0, m0 - 1, d0)) / MS_DIA);
}

function sumarDiasAHoy(dias: number, ahora: Date = new Date()): string {
  const [a, m, d] = hoyAR(ahora).split("-").map(Number);
  const x = new Date(Date.UTC(a, m - 1, d + dias));
  return `${x.getUTCFullYear()}-${pad(x.getUTCMonth() + 1)}-${pad(x.getUTCDate())}`;
}

function buscarEspacio(espacioId: string): Espacio {
  const espacio = ESPACIOS.find((e) => e.id === espacioId);
  if (!espacio) throw new ErrorApi("ESPACIO_NO_ENCONTRADO", "No encontramos ese espacio.");
  return espacio;
}

function turno(espacio: Espacio, fecha: string, inicio: string, estado: Turno["estado"], extra: Partial<Turno> = {}): Turno {
  return {
    id: idTurnoGenerado(espacio.id, fecha, inicio),
    espacioId: espacio.id,
    fecha,
    inicio,
    fin: `${pad(Number(inicio.slice(0, 2)) + 1)}:00`,
    estado,
    reservaId: null,
    motivoBloqueo: null,
    precio: espacio.precioPorHora,
    ...extra,
  };
}

// ---------- reservas en memoria ----------

let contador = 1100;

function nuevaReserva(n: number, espacioId: string, fecha: string, hora: string, estado: Reserva["estado"], personas: number): Reserva {
  return {
    id: `res-${n}`,
    turnoId: idTurnoGenerado(espacioId, fecha, hora),
    espacioId,
    usuarioId: USUARIO_JUGADOR.id,
    cantidadPersonas: personas,
    codigoQr: `VGY-${n}-${fecha.slice(5).replace("-", "")}-${hora.slice(0, 2)}`,
    estado,
    ingresoEn: estado === "cumplida" ? `${fecha}T${hora}:05:00-03:00` : null,
    creadaEn: aIsoAR(new Date()),
    cancelableHasta: calcularCancelableHasta(fecha, hora),
  };
}

function reservasIniciales(): Reserva[] {
  return [
    nuevaReserva(1000, "esp-01", sumarDiasAHoy(-3), "19:00", "cumplida", 10),
    nuevaReserva(999, "esp-09", sumarDiasAHoy(-6), "10:00", "cancelada", 4), // caso feo: cancelada
    nuevaReserva(1001, "esp-04", sumarDiasAHoy(1), "19:00", "confirmada", 8),
    nuevaReserva(1002, "esp-02", sumarDiasAHoy(3), "20:00", "confirmada", 10), // caso feo: su turno está suspendido por mantenimiento
  ];
}

let reservas: Reserva[] = reservasIniciales();

/** Vuelve todo al estado inicial (útil para pruebas). */
export function reiniciarServidorFalso(): void {
  contador = 1100;
  reservas = reservasIniciales();
  opcionesMock.errorDeRed = false;
}

// ---------- lo que expone el "servidor" ----------

export function turnosDelDia(espacioId: string, fecha: string, ahora: Date = new Date()): Turno[] {
  const espacio = buscarEspacio(espacioId);
  const d = diasDesdeHoy(fecha, ahora);
  const porHora = new Map<string, Turno>();
  const horas = horasDeInicio();

  if (d === 2) {
    // Caso feo: lluvia, día entero bloqueado en todos los espacios
    for (const h of horas) {
      porHora.set(h, turno(espacio, fecha, h, "mantenimiento", { motivoBloqueo: "Cancha anegada por la lluvia" }));
    }
  } else {
    if (d === 1 && espacio.id === "esp-01") {
      // Caso feo: grilla completa, nada libre
      for (const h of horas) porHora.set(h, turno(espacio, fecha, h, "reservado", { reservaId: `res-demo-${h.slice(0, 2)}` }));
    } else {
      const indice = ["esp-01", "esp-02", "esp-04"].indexOf(espacio.id);
      if (indice >= 0 && (d + indice) % 2 === 0) {
        for (const h of ["19:00", "21:00"]) {
          porHora.set(h, turno(espacio, fecha, h, "reservado", { reservaId: `res-demo-${h.slice(0, 2)}` }));
        }
      }
    }
    if (d === 3 && espacio.id === "esp-02") {
      porHora.set("20:00", turno(espacio, fecha, "20:00", "mantenimiento", { motivoBloqueo: "Reparación de la iluminación" }));
    }
  }

  // Las reservas hechas en esta sesión ocupan su turno (salvo que esté bloqueado)
  for (const r of reservas) {
    if (r.espacioId !== espacio.id || r.estado !== "confirmada") continue;
    if (!r.turnoId.startsWith(`tur-${espacio.id}-${fecha}-`)) continue;
    const hora = `${r.turnoId.slice(-2)}:00`;
    if (porHora.get(hora)?.estado === "mantenimiento") continue;
    porHora.set(hora, turno(espacio, fecha, hora, "reservado", { reservaId: r.id }));
  }

  return [...porHora.values()].sort((a, b) => a.inicio.localeCompare(b.inicio));
}

export function reservasDe(usuarioId: string): Reserva[] {
  return reservas.filter((r) => r.usuarioId === usuarioId).map((r) => ({ ...r }));
}

export interface DatosReservaFalsa {
  usuarioId: string;
  espacioId: string;
  fecha: string;
  inicio: string;
  cantidadPersonas: number;
}

export function crearReservaFalsa(d: DatosReservaFalsa, ahora: Date = new Date()): Reserva {
  const espacio = buscarEspacio(d.espacioId);
  const grilla = construirGrilla({
    espacio,
    fecha: d.fecha,
    turnos: turnosDelDia(espacio.id, d.fecha, ahora),
    fijas: RESERVAS_FIJAS,
    ahora,
  });
  const casillero = grilla.find((t) => t.inicio === d.inicio);
  if (!casillero) throw new ErrorApi("TURNO_NO_ENCONTRADO", "Ese turno no existe.");

  const veredicto = validarReserva({
    turno: casillero,
    espacio,
    cantidadPersonas: d.cantidadPersonas,
    reservasDelUsuario: reservas.filter((r) => r.usuarioId === d.usuarioId),
    ahora,
  });
  if (!veredicto.ok) throw new ErrorApi(veredicto.codigo, veredicto.mensaje);

  contador += 1;
  const reserva = nuevaReserva(contador, espacio.id, d.fecha, d.inicio, "confirmada", d.cantidadPersonas);
  reserva.usuarioId = d.usuarioId;
  reserva.creadaEn = aIsoAR(ahora);
  reservas = [...reservas, reserva];
  return { ...reserva };
}

export function cancelarReservaFalsa(reservaId: string, usuarioId: string, ahora: Date = new Date()): Reserva {
  const actual = reservas.find((r) => r.id === reservaId && r.usuarioId === usuarioId);
  if (!actual) throw new ErrorApi("RESERVA_NO_ENCONTRADA", "No encontramos esa reserva.");

  const info = infoCancelacion(actual, ahora);
  if (!info.puedeCancelarEnApp) {
    throw new ErrorApi(info.estado === "fuera_de_plazo" ? "FUERA_DE_PLAZO" : "NO_CANCELABLE", info.mensaje);
  }
  const cancelada: Reserva = { ...actual, estado: "cancelada" };
  reservas = reservas.map((r) => (r.id === reservaId ? cancelada : r));
  return { ...cancelada };
}

/** Sesión falsa para trabajar sin API. "admin" → administrador, "encargado" → encargado. */
export function sesionFalsa(email: string, nombre?: string): Usuario {
  const correo = email.trim().toLowerCase();
  const rol: Usuario["rol"] = /admin/.test(correo) ? "administrador" : /encargad/.test(correo) ? "encargado" : "jugador";
  if (rol === "jugador") return { ...USUARIO_JUGADOR, email: correo, nombre: nombre?.trim() || USUARIO_JUGADOR.nombre };
  return {
    ...USUARIO_JUGADOR,
    id: `usr-${rol}`,
    nombre: nombre?.trim() || (rol === "administrador" ? "Nahuel Ojeda" : "Marcelo"),
    email: correo,
    rol,
    espaciosFavoritos: [],
    cancelacionesTardias: 0,
  };
}

export const TOKEN_FALSO = "token-falso-solo-para-desarrollo";
