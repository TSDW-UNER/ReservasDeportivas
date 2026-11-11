import { CUENTAS_MOCK } from "../mocks/usuarios";
import type { DatosRegistro, Usuario } from "../tipos/usuario";
import { ErrorApi } from "./errorApi";

// Poné true para probar el mensaje de "sin conexión".
const SIMULAR_SIN_RED = false;

// Copia en memoria: los registros nuevos duran hasta que se recarga la app.
const cuentas = CUENTAS_MOCK.map((c) => ({ ...c }));

const demora = (ms = 600) => new Promise<void>((r) => setTimeout(r, ms));

async function simularRed() {
  await demora();
  if (SIMULAR_SIN_RED) {
    throw new ErrorApi("SIN_CONEXION", "No hay conexión a internet.");
  }
}

export interface SesionApi {
  usuario: Usuario;
  token: string;
}

// Hoy devuelve el mock; cuando llegue la API, acá va el fetch y se
// desenvuelve { datos } / { error }. Las pantallas no se enteran.
export async function ingresarApi(
  email: string,
  clave: string,
): Promise<SesionApi> {
  await simularRed();
  const cuenta = cuentas.find(
    (c) => c.usuario.email === email.trim().toLowerCase() && c.clave === clave,
  );
  if (!cuenta) {
    throw new ErrorApi("CREDENCIALES_INVALIDAS", "Email o contraseña incorrectos");
  }
  return { usuario: cuenta.usuario, token: `mock-token-${cuenta.usuario.id}` };
}

export async function registrarApi(datos: DatosRegistro): Promise<SesionApi> {
  await simularRed();
  const email = datos.email.trim().toLowerCase();
  if (cuentas.some((c) => c.usuario.email === email)) {
    throw new ErrorApi("EMAIL_EXISTENTE", "Ese email ya está registrado");
  }
  const usuario: Usuario = {
    id: `usr-${Date.now()}`,
    nombre: datos.nombre.trim(),
    email,
    telefono: datos.telefono.trim(),
    rol: "jugador", // el registro público siempre crea jugadores
    espaciosFavoritos: [],
    cancelacionesTardias: 0,
    ausencias: 0,
  };
  cuentas.push({ usuario, clave: datos.clave });
  return { usuario, token: `mock-token-${usuario.id}` };
}

// Se usa al abrir la app para validar el token guardado.
export async function obtenerPerfil(token: string): Promise<Usuario> {
  await simularRed();
  const cuenta = cuentas.find((c) => `mock-token-${c.usuario.id}` === token);
  if (!cuenta) {
    throw new ErrorApi("TOKEN_INVALIDO", "La sesión venció. Ingresá de nuevo.");
  }
  return cuenta.usuario;
}