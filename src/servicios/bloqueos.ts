
import type { Bloqueo } from "../tipos";
import { responder } from "../mocks/servidorFalso";
import { ErrorApi } from "./errorApi";
import { USAR_MOCK } from "./config";
import { pedir } from "./http";

/** Filtros disponibles para consultar bloqueos. */
export interface FiltrosBloqueos {
  espacioId?: string;
  desde?: string;
}

/** Datos que espera la API para crear bloqueos. */
export interface DatosCrearBloqueo {
  espacioIds: string[];
  fecha: string;
  inicio?: string;
  fin?: string;
  motivo: string;
}

// Datos temporales para el modo mock.
let bloqueosMock: Bloqueo[] = [];
let siguienteIdMock = 1;

/**
 * Consulta los bloqueos.
 * La API devuelve los bloqueos desde hoy por defecto.
 */
export async function listarBloqueos(
  filtros: FiltrosBloqueos = {},
): Promise<Bloqueo[]> {
  if (USAR_MOCK) {
    return responder(() =>
      bloqueosMock
        .filter((b) => !filtros.espacioId || b.espacioId === filtros.espacioId)
        .filter((b) => !filtros.desde || b.fecha >= filtros.desde!)
        .map((b) => ({ ...b })),
    );
  }

  const parametros = new URLSearchParams();

  if (filtros.espacioId) {
    parametros.set("espacioId", filtros.espacioId);
  }

  if (filtros.desde) {
    parametros.set("desde", filtros.desde);
  }

  const consulta = parametros.toString();

  return pedir<Bloqueo[]>(
    `/bloqueos${consulta ? `?${consulta}` : ""}`,
  );
}

/** Crea bloqueos para uno o varios espacios. */
export async function crearBloqueo(
  datos: DatosCrearBloqueo,
): Promise<Bloqueo[]> {
  if (USAR_MOCK) {
    return responder(() => {
      const nuevos = datos.espacioIds.map((espacioId) => ({
        id: `blo-mock-${siguienteIdMock++}`,
        espacioId,
        fecha: datos.fecha,
        inicio: datos.inicio ?? null,
        fin: datos.fin ?? null,
        motivo: datos.motivo,
      }));

      bloqueosMock = [...bloqueosMock, ...nuevos];

      return nuevos.map((b) => ({ ...b }));
    });
  }

  return pedir<Bloqueo[]>("/bloqueos", {
    metodo: "POST",
    cuerpo: datos,
  });
}

/** Elimina un bloqueo por su identificador. */
export async function eliminarBloqueo(id: string): Promise<void> {
  if (USAR_MOCK) {
    return responder(() => {
      const existe = bloqueosMock.some((b) => b.id === id);

      if (!existe) {
        throw new ErrorApi(
          "BLOQUEO_NO_ENCONTRADO",
          "No encontramos ese bloqueo.",
        );
      }

      bloqueosMock = bloqueosMock.filter((b) => b.id !== id);
    });
  }

  return pedir<void>(`/bloqueos/${encodeURIComponent(id)}`, {
    metodo: "DELETE",
  });
}
