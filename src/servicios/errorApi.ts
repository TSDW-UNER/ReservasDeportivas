// Todos los servicios lanzan este error, con la misma forma que la API: { codigo, mensaje }.
export class ErrorApi extends Error {
  codigo: string;

  constructor(codigo: string, mensaje: string) {
    super(mensaje);
    this.name = "ErrorApi";
    this.codigo = codigo;
  }
}