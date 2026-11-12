import type { DatosRegistro, Usuario } from "../tipos/usuario";
import { pedir } from "./http";

export interface SesionApi {
  usuario: Usuario;
  token: string;
}

export function ingresarApi(email: string, clave: string): Promise<SesionApi> {
  return pedir<SesionApi>("/auth/ingreso", {
    metodo: "POST",
    token: null,
    cuerpo: { email: email.trim().toLowerCase(), contrasena: clave },
  });
}

export function registrarApi(datos: DatosRegistro): Promise<SesionApi> {
  return pedir<SesionApi>("/auth/registro", {
    metodo: "POST",
    token: null,
    cuerpo: {
      nombre: datos.nombre.trim(),
      email: datos.email.trim().toLowerCase(),
      contrasena: datos.clave,
      telefono: datos.telefono.trim(),
    },
  });
}

// Al abrir la app: valida el token guardado. Timeout corto para no dejar el splash
// colgado si la API está dormida; en ese caso se entra con el usuario cacheado.
export function obtenerPerfil(token: string): Promise<Usuario> {
  return pedir<Usuario>("/yo", { token, timeoutMs: 8000 });
}