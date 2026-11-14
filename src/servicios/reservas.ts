
import {
  guardarReserva,
  leerReservasDeUsuario,
  reemplazarReservasDeUsuario,
} from "../db/baseDatos";

import {
  infoCancelacion,
  validarReserva,
  type TurnoGrilla,
} from "../dominio";

import {
  cancelarReservaFalsa,
  crearReservaFalsa,
  responder,
  reservasDe,
} from "../mocks/servidorFalso";

import type { Espacio, Reserva } from "../tipos";
import { USAR_MOCK } from "./config";
import { ErrorApi } from "./errorApi";
import { pedir } from "./http";
import { esFalloDeRed, type Resultado } from "./resultado";

/**
 * Mis reservas.
 *
 * En modo API consulta por separado las próximas y las pasadas.
 * Sin conexión, devuelve las guardadas en SQLite.
 */
export async function listarMisReservas(
  usuarioId: string,
): Promise<Resultado<Reserva[]>> {
  try {
    let datos: Reserva[];

    if (USAR_MOCK) {
      datos = await responder(() => reservasDe(usuarioId));
    } else {
      const [proximas, pasadas] = await Promise.all([
        pedir<Reserva[]>(
          "/yo/reservas?cuando=proximas&porPagina=100",
        ),
        pedir<Reserva[]>(
          "/yo/reservas?cuando=pasadas&porPagina=100",
        ),
      ]);

      datos = [...proximas, ...pasadas];
    }

    reemplazarReservasDeUsuario(usuarioId, datos);

    return { datos, desdeCache: false };
  } catch (e) {
    if (esFalloDeRed(e)) {
      return {
        datos: leerReservasDeUsuario(usuarioId),
        desdeCache: true,
      };
    }

    throw e;
  }
}

export interface DatosNuevaReserva {
  usuarioId: string;
  espacio: Espacio;
  turno: TurnoGrilla;
  cantidadPersonas: number;

  // Se conserva para los datos que necesita la pantalla.
  // No se envía porque no forma parte del payload definido por la API.
  deporteId: string;

  /** Las reservas que ya tiene la persona, para controlar el máximo de 3 activas. */
  reservasActuales: Reserva[];
}

/** Valida con las reglas del dominio y después reserva. */
export async function crearReserva(
  p: DatosNuevaReserva,
): Promise<Reserva> {
  const veredicto = validarReserva({
    turno: p.turno,
    espacio: p.espacio,
    cantidadPersonas: p.cantidadPersonas,
    reservasDelUsuario: p.reservasActuales,
  });

  if (!veredicto.ok) {
    throw new ErrorApi(veredicto.codigo, veredicto.mensaje);
  }

  const reserva = USAR_MOCK
    ? await responder(() =>
        crearReservaFalsa({
          usuarioId: p.usuarioId,
          espacioId: p.espacio.id,
          fecha: p.turno.fecha,
          inicio: p.turno.inicio,
          cantidadPersonas: p.cantidadPersonas,
        }),
      )
    : await pedir<Reserva>("/reservas", {
        metodo: "POST",
        cuerpo: {
          turnoId: p.turno.id,
          cantidadPersonas: p.cantidadPersonas,
        },
      });

  // Se guarda en el teléfono para poder consultar el QR sin señal.
  guardarReserva(reserva);

  return reserva;
}

/** Cancela desde la app, solo dentro del plazo permitido. */
export async function cancelarReserva(
  reserva: Reserva,
): Promise<Reserva> {
  const info = infoCancelacion(reserva);

  if (!info.puedeCancelarEnApp) {
    throw new ErrorApi(
      info.estado === "fuera_de_plazo"
        ? "FUERA_DE_PLAZO"
        : "NO_CANCELABLE",
      info.mensaje,
    );
  }

  const cancelada = USAR_MOCK
    ? await responder(() =>
        cancelarReservaFalsa(reserva.id, reserva.usuarioId),
      )
    : await pedir<Reserva>(
        `/reservas/${encodeURIComponent(reserva.id)}/cancelacion`,
        { metodo: "POST" },
      );

  guardarReserva(cancelada);

  return cancelada;
}
