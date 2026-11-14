import type { Espacio, EstadoTurno, ReservaFija, Turno } from "../tipos";
import { DIAS_VISIBLES, HORA_APERTURA, HORA_CIERRE } from "./constantes";
import { diaDeSemana, hoyAR, instanteDeTurno, pad, sumarDias } from "./fechas";
import type { ResumenDia, TurnoGrilla } from "./tipos";

/**
 * EL CORAZÓN DE LA APP: arma la grilla de un día cruzando
 *   1) los turnos que informa el servicio (reservados / mantenimiento),
 *   2) las reservas fijas vigentes (reglas semanales),
 *   3) la hora actual (un turno pasado no se reserva).
 *
 * Prioridad cuando se superponen (de mayor a menor):
 *   mantenimiento  >  fijo  >  reservado  >  libre
 * Razón: si la cancha está anegada o en arreglo, nadie juega, ni siquiera la fija.
 *
 * Es una función pura: mismos datos, misma grilla. No toca red, ni disco, ni reloj
 * (el reloj entra como parámetro `ahora`).
 */

export interface ParametrosGrilla {
  espacio: Espacio;
  /** "AAAA-MM-DD" */
  fecha: string;
  /** Turnos del servicio. Pueden venir todos, solo los no libres o de otros días: se filtran. */
  turnos: Turno[];
  fijas: ReservaFija[];
  ahora?: Date;
}

/** ["08:00", "09:00", ..., "23:00"] */
export function horasDeInicio(): string[] {
  const horas: string[] = [];
  for (let h = HORA_APERTURA; h < HORA_CIERRE; h++) horas.push(`${pad(h)}:00`);
  return horas;
}

function sumarUnaHora(inicio: string): string {
  const h = Number(inicio.slice(0, 2)) + 1;
  return `${pad(h)}:00`; // el último turno termina en "24:00"
}

/**
 * Id para turnos que el servicio no mandó (los libres). Incluye el espacio porque el
 * ejemplo del PRD ("tur-0219-19") se repetiría entre canchas. Ver dudas abiertas.
 */
export function idTurnoGenerado(espacioId: string, fecha: string, inicio: string): string {
  return `tur-${espacioId}-${fecha}-${inicio.slice(0, 2)}`;
}

/** ¿Esta fija ocupa el turno de `fecha` que empieza a las `inicio`? */
export function fijaCubre(fija: ReservaFija, fecha: string, inicio: string): boolean {
  if (!fija.activa) return false;
  if (fija.dia !== diaDeSemana(fecha)) return false;
  if (fecha < fija.desde) return false;
  if (fija.hasta !== null && fecha > fija.hasta) return false;
  // "HH:MM" con cero a la izquierda se compara bien como texto
  return inicio >= fija.inicio && inicio < fija.fin;
}

export function construirGrilla(p: ParametrosGrilla): TurnoGrilla[] {
  const ahora = p.ahora ?? new Date();
  const delDia = p.turnos.filter((t) => t.espacioId === p.espacio.id && t.fecha === p.fecha);
  const fijasDelEspacio = p.fijas.filter((f) => f.espacioId === p.espacio.id);

  return horasDeInicio().map((inicio) => {
    const delServicio = delDia.find((t) => t.inicio === inicio);
    const fija = fijasDelEspacio.find((f) => fijaCubre(f, p.fecha, inicio)) ?? null;

    let estado: EstadoTurno;
    if (delServicio?.estado === "mantenimiento") estado = "mantenimiento";
    else if (fija) estado = "fijo";
    else if (delServicio?.estado === "fijo") estado = "fijo"; // el servicio ya lo marcó
    else if (delServicio?.estado === "reservado") estado = "reservado";
    else estado = "libre";

    const pasado = instanteDeTurno(p.fecha, inicio).getTime() <= ahora.getTime();

    return {
      id: delServicio?.id ?? idTurnoGenerado(p.espacio.id, p.fecha, inicio),
      espacioId: p.espacio.id,
      fecha: p.fecha,
      inicio,
      fin: sumarUnaHora(inicio),
      estado,
      reservaId: estado === "reservado" ? delServicio?.reservaId ?? null : null,
      motivoBloqueo: estado === "mantenimiento" ? delServicio?.motivoBloqueo ?? null : null,
      precio: delServicio?.precio ?? p.espacio.precioPorHora,
      pasado,
      reservable: estado === "libre" && !pasado && p.espacio.activo,
      titularFija: estado === "fijo" ? fija?.titular ?? null : null,
    };
  });
}

/** Resumen para decidir qué mostrar: grilla normal, "completo", "bloqueado por lluvia"... */
export function resumirDia(grilla: TurnoGrilla[]): ResumenDia {
  const contar = (e: EstadoTurno) => grilla.filter((t) => t.estado === e).length;
  const mantenimiento = contar("mantenimiento");
  const reservables = grilla.filter((t) => t.reservable).length;
  const libres = contar("libre");

  let estado: ResumenDia["estado"];
  if (grilla.length > 0 && mantenimiento === grilla.length) estado = "bloqueado";
  else if (reservables > 0) estado = "disponible";
  else if (libres > 0) estado = "finalizado"; // quedan libres pero ya pasaron
  else estado = "completo";

  return {
    estado,
    reservables,
    libres,
    reservados: contar("reservado"),
    fijos: contar("fijo"),
    mantenimiento,
    motivoBloqueo:
      estado === "bloqueado" ? grilla.find((t) => t.motivoBloqueo)?.motivoBloqueo ?? null : null,
  };
}

/** Los próximos días que se pueden mirar, hoy incluido: ["2026-09-19", ...]. */
export function proximosDias(ahora: Date = new Date(), cantidad: number = DIAS_VISIBLES): string[] {
  const hoy = hoyAR(ahora);
  return Array.from({ length: cantidad }, (_, i) => sumarDias(hoy, i));
}
