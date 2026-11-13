
import { RESERVAS_FIJAS } from "../mocks/datos";
import { responder } from "../mocks/servidorFalso";
import type { ReservaFija } from "../tipos";
import { USAR_MOCK } from "./config";
import { pedir } from "./http";

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
