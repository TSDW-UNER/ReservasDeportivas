import { ErrorApi } from "./errorApi";

/** Lo que devuelven las lecturas: los datos y si vienen del teléfono (sin conexión). */
export interface Resultado<T> {
  datos: T;
  desdeCache: boolean;
}

/** ¿Falló por falta de red o por demora? Entonces conviene mostrar lo guardado. */
export function esFalloDeRed(e: unknown): boolean {
  return e instanceof ErrorApi && (e.codigo === "SIN_CONEXION" || e.codigo === "TIEMPO_AGOTADO");
}
