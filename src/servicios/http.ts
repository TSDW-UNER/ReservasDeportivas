import { leerToken } from "../almacenamiento/tokenSeguro";
import type { RespuestaError } from "../tipos/api";
import { ErrorApi } from "./errorApi";

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL?.trim() || "http://10.0.2.2:3000"
).replace(/\/+$/, "");

type Metodo = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface Opciones {
  metodo?: Metodo;
  cuerpo?: unknown;
  // undefined = usa el token guardado; null = sin token; string = ese token
  token?: string | null;
  timeoutMs?: number;
}

// Único punto de contacto con la API.
export async function pedir<T>(
  ruta: string,
  opciones: Opciones = {},
): Promise<T> {
  const { metodo = "GET", cuerpo, timeoutMs = 60000 } = opciones;

  const token =
    opciones.token !== undefined ? opciones.token : await leerToken();

  const controlador = new AbortController();
  const reloj = setTimeout(() => controlador.abort(), timeoutMs);

  let res: Response;

  try {
    res = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: {
        Accept: "application/json",
        ...(cuerpo !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      signal: controlador.signal,
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new ErrorApi(
        "TIEMPO_AGOTADO",
        "El servidor tardó demasiado en responder. Probá de nuevo.",
      );
    }

    throw new ErrorApi(
      "SIN_CONEXION",
      "No hay conexión a internet o el servidor no está disponible.",
    );
  } finally {
    clearTimeout(reloj);
  }

  // Respuesta exitosa sin contenido.
  if (res.status === 204) {
    return undefined as T;
  }

  let json: unknown = null;

  try {
    json = await res.json();
  } catch {
    // La respuesta no contenía JSON válido.
  }

  // Manejo de errores de la API.
  if (!res.ok) {
    if (res.status >= 500) {
      console.error(
        "[ERROR API]",
        metodo,
        ruta,
        "HTTP:",
        res.status,
        "Respuesta:",
        JSON.stringify(json),
      );
    }

    const error = (json as Partial<RespuestaError> | null)?.error;

    throw new ErrorApi(
      error?.codigo ?? `HTTP_${res.status}`,
      error?.mensaje ?? `Error HTTP ${res.status}. Revisá la consola de Expo.`,
    );
  }

  // Validar el formato esperado: { datos: ... }
  if (json === null || typeof json !== "object" || !("datos" in json)) {
    throw new ErrorApi(
      "RESPUESTA_INVALIDA",
      "El servidor devolvió una respuesta con un formato inesperado.",
    );
  }

  return (json as { datos: T }).datos;
}
