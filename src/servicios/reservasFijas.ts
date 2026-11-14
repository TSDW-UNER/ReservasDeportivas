
import { RESERVAS_FIJAS } from "../mocks/datos";
import { responder } from "../mocks/servidorFalso";
import type { ReservaFija } from "../tipos";
import { USAR_MOCK } from "./config";
import { pedir } from "./http";

/**
 * Datos necesarios para crear una reserva fija.
 */
export interface DatosReservaFija {
  espacioId: string;
  titular: string;
  dia: ReservaFija["dia"];
  inicio: string;
  fin: string;
  desde: string;
  hasta?: string | null;
}

/**
 * Obtiene todas las reservas fijas.
 *
 * En modo mock utiliza los datos de prueba.
 * En modo API consulta GET /fijas.
 */
export function listarReservasFijas(): Promise<ReservaFija[]> {
  if (USAR_MOCK) {
    return responder(() =>
      RESERVAS_FIJAS.map((reserva) => ({ ...reserva })),
    );
  }

  return pedir<ReservaFija[]>("/fijas");
}

/**
 * Crea una reserva fija.
 *
 * En modo API utiliza POST /fijas.
 */
export async function crearReservaFija(
  datos: DatosReservaFija,
): Promise<ReservaFija> {
  if (USAR_MOCK) {
    return responder(() => {
      const nueva: ReservaFija = {
        ...datos,
        id: `fija-${Date.now()}`,
        hasta: datos.hasta ?? null,
        activa: true,
      };

      RESERVAS_FIJAS.push(nueva);
      return nueva;
    });
  }

  return pedir<ReservaFija>("/fijas", {
    metodo: "POST",
    cuerpo: datos,
  });
}

/**
 * Actualiza una reserva fija existente.
 *
 * En modo API utiliza PATCH /fijas/:id.
 */

export async function actualizarReservaFija(
  id: string,
  datos: Partial<DatosReservaFija>,
): Promise<ReservaFija> {
  // La API no admite espacioId en las actualizaciones.
  const { espacioId: _espacioId, ...cambios } = datos;

  if (USAR_MOCK) {
    return responder(() => {
      const indice = RESERVAS_FIJAS.findIndex(
        (reserva) => reserva.id === id,
      );

      if (indice === -1) {
        throw new Error("No encontramos esa reserva fija.");
      }

      RESERVAS_FIJAS[indice] = {
        ...RESERVAS_FIJAS[indice],
        ...cambios,
      };

      return { ...RESERVAS_FIJAS[indice] };
    });
  }

  return pedir<ReservaFija>(`/fijas/${encodeURIComponent(id)}`, {
    metodo: "PATCH",
    cuerpo: cambios,
  });
}

/**
 * Da de baja una reserva fija.
 *
 * En modo API utiliza DELETE /fijas/:id.
 */
export async function eliminarReservaFija(id: string): Promise<void> {
  if (USAR_MOCK) {
    await responder(() => {
      const indice = RESERVAS_FIJAS.findIndex(
        (reserva) => reserva.id === id,
      );

      if (indice === -1) {
        throw new Error("No encontramos esa reserva fija.");
      }

      RESERVAS_FIJAS[indice] = {
        ...RESERVAS_FIJAS[indice],
        activa: false,
      };
    });

    return;
  }

  await pedir<void>(`/fijas/${encodeURIComponent(id)}`, {
    metodo: "DELETE",
  });
}
