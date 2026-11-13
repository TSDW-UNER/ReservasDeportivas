import { responder, sesionFalsa, TOKEN_FALSO } from "../mocks/servidorFalso";
import type { DatosRegistro, Usuario } from "../tipos/usuario";
import { USAR_MOCK } from "./config";
import { ErrorApi } from "./errorApi";
import { pedir } from "./http";

export interface SesionApi {
  usuario: Usuario;
  token: string;
}

// Con USAR_MOCK=true se entra sin servidor: cualquier correo y clave sirven.
//   "admin@..."     → administrador
//   "encargado@..." → encargado
//   cualquier otro  → jugador

export function ingresarApi(email: string, clave: string): Promise<SesionApi> {
  if (USAR_MOCK) return responder(() => ({ usuario: sesionFalsa(email), token: TOKEN_FALSO }));
  return pedir<SesionApi>("/auth/ingreso", {
    metodo: "POST",
    token: null,
    cuerpo: { email: email.trim().toLowerCase(), contrasena: clave },
  });
}

export function registrarApi(datos: DatosRegistro): Promise<SesionApi> {
  if (USAR_MOCK) return responder(() => ({ usuario: sesionFalsa(datos.email, datos.nombre), token: TOKEN_FALSO }));
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
  if (USAR_MOCK) {
    // Sin servidor no hay a quién preguntarle: se falla como si no hubiera red y la sesión
    // restaura el usuario guardado en el teléfono (así conserva su rol).
    return Promise.reject(new ErrorApi("SIN_CONEXION", "Modo de prueba: se usa el usuario guardado."));
  }
  return pedir<Usuario>("/yo", { token, timeoutMs: 8000 });
}
