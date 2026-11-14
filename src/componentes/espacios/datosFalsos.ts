// TEMPORAL (Integrante 2): este archivo ya no tiene datos propios.
// Los tipos viven en src/tipos/ y los datos en src/mocks/datos.ts.
// Se mantiene SOLO para que las pantallas actuales sigan compilando mientras migran a
// src/servicios/ (listarEspacios, listarDeportes, obtenerDia...). Cuando nadie lo importe, borrarlo.
export type { Coordenadas, Deporte, Espacio, ReservaFija } from "../../tipos";
export {
  DEPORTES as deportesFalsos,
  ESPACIOS as espaciosFalsos,
  RESERVAS_FIJAS as reservasFijasFalsas,
} from "../../mocks/datos";
