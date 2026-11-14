
import type { Espacio, Turno } from "../tipos";
import { ESPACIOS } from "../mocks/datos";
import { responder, turnosDelDia } from "../mocks/servidorFalso";
import { USAR_MOCK } from "./config";
import { pedir } from "./http";

/**
 * Devuelve la agenda completa de todos los espacios activos
 * para una fecha determinada.
 */
export async function listarAgenda(fecha: string): Promise<Turno[]> {
  if (USAR_MOCK) {
    return responder(() => {
      const espaciosActivos = ESPACIOS.filter(
        (espacio) => espacio.activo,
      );

      return espaciosActivos.flatMap((espacio: Espacio) =>
        turnosDelDia(espacio.id, fecha),
      );
    });
  }

  const query = new URLSearchParams({
    pagina: "1",
    porPagina: "500",
    fecha,
  });

  return pedir<Turno[]>(`/agenda?${query.toString()}`);
}
