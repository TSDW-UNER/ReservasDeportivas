import { guardarEspacios, leerEspacios } from "../db/baseDatos";
import { DEPORTES, ESPACIOS } from "../mocks/datos";
import { responder } from "../mocks/servidorFalso";
import type { Deporte, Espacio } from "../tipos";
import { USAR_MOCK } from "./config";
import { pedir } from "./http";
import { esFalloDeRed, type Resultado } from "./resultado";

/** Catálogo. Si no hay red, devuelve el último catálogo guardado en SQLite. */
export async function listarEspacios(): Promise<Resultado<Espacio[]>> {
  try {
    const datos = USAR_MOCK ? await responder(() => [...ESPACIOS]) : await pedir<Espacio[]>("/espacios");
    guardarEspacios(datos);
    return { datos, desdeCache: false };
  } catch (e) {
    if (esFalloDeRed(e)) {
      const guardados = leerEspacios();
      if (guardados.length > 0) return { datos: guardados, desdeCache: true };
    }
    throw e;
  }
}

export async function obtenerEspacio(id: string): Promise<Resultado<Espacio | null>> {
  const { datos, desdeCache } = await listarEspacios();
  return { datos: datos.find((e) => e.id === id) ?? null, desdeCache };
}

export async function listarDeportes(): Promise<Deporte[]> {
  return USAR_MOCK ? responder(() => [...DEPORTES]) : pedir<Deporte[]>("/deportes");
}
