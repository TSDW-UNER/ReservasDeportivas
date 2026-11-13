
import { guardarEspacios, leerEspacios } from "../db/baseDatos";
import { DEPORTES, ESPACIOS } from "../mocks/datos";
import { responder } from "../mocks/servidorFalso";
import type { Deporte, Espacio } from "../tipos";
import { USAR_MOCK } from "./config";
import { ErrorApi } from "./errorApi";
import { pedir } from "./http";
import { esFalloDeRed, type Resultado } from "./resultado";

/** Catálogo. Si no hay red, devuelve el último catálogo guardado en SQLite. */
export async function listarEspacios(): Promise<Resultado<Espacio[]>> {
  try {
    const datos = USAR_MOCK
      ? await responder(() => [...ESPACIOS])
      : await pedir<Espacio[]>("/espacios");

    guardarEspacios(datos);

    return { datos, desdeCache: false };
  } catch (e) {
    if (esFalloDeRed(e)) {
      const guardados = leerEspacios();

      if (guardados.length > 0) {
        return { datos: guardados, desdeCache: true };
      }
    }

    throw e;
  }
}

export async function obtenerEspacio(
  id: string,
): Promise<Resultado<Espacio | null>> {
  const { datos, desdeCache } = await listarEspacios();

  return {
    datos: datos.find((e) => e.id === id) ?? null,
    desdeCache,
  };
}

/** Actualiza el precio por hora de un espacio. */
export async function actualizarPrecioEspacio(
  id: string,
  precioPorHora: number,
): Promise<void> {
  if (!Number.isInteger(precioPorHora) || precioPorHora <= 0) {
    throw new ErrorApi(
      "PRECIO_INVALIDO",
      "El precio debe ser un número entero mayor que cero.",
    );
  }

  if (USAR_MOCK) {
    await responder(() => {
      const indice = ESPACIOS.findIndex((e) => e.id === id);

      if (indice === -1) {
        throw new ErrorApi(
          "ESPACIO_NO_ENCONTRADO",
          "No encontramos ese espacio.",
        );
      }

      ESPACIOS[indice] = {
        ...ESPACIOS[indice],
        precioPorHora,
      };
    });
  } else {
    await pedir<unknown>(
      `/espacios/${encodeURIComponent(id)}`,
      {
        metodo: "PATCH",
        cuerpo: { precioPorHora },
      },
    );
  }

  // Actualizamos también los espacios guardados en SQLite.
  const guardados = leerEspacios();

  if (guardados.length > 0) {
    guardarEspacios(
      guardados.map((espacio) =>
        espacio.id === id
          ? { ...espacio, precioPorHora }
          : espacio,
      ),
    );
  }
}

export async function listarDeportes(): Promise<Deporte[]> {
  return USAR_MOCK
    ? responder(() => [...DEPORTES])
    : pedir<Deporte[]>("/deportes");
}
