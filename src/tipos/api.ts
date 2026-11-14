export interface MetaPaginacion {
  total: number;
  pagina: number;
  porPagina: number;
}

export interface RespuestaExito<T> {
  datos: T;
  meta?: MetaPaginacion;
}

export interface RespuestaError {
  error: { codigo: string; mensaje: string };
}