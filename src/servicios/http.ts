import { leerToken } from "../almacenamiento/tokenSeguro";
import type { RespuestaError } from "../tipos/api";
import { ErrorApi } from "./errorApi";

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000"
).replace(/\/+$/, "");

type Metodo = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface Opciones {
  metodo?: Metodo;
  cuerpo?: unknown;
  // undefined = usa el token guardado; null = sin token; string = ese token
  token?: string | null;
  // Render gratis tarda cerca de un minuto en despertar: el valor por defecto lo contempla
  timeoutMs?: number;
}

// Único punto de contacto con la API: agrega el Bearer, desenvuelve { datos } / { error }
// y siempre falla con ErrorApi, que es lo que ya manejan las pantallas.
export async function pedir<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  const { metodo = "GET", cuerpo, timeoutMs = 60000 } = opciones;
  const token = opciones.token !== undefined ? opciones.token : await leerToken();

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
    // fetch solo lanza si no hubo respuesta: sin red o servidor inalcanzable
    throw new ErrorApi("SIN_CONEXION", "No hay conexión a internet.");
  } finally {
    clearTimeout(reloj);
  }

  if (res.status === 204) return undefined as T; // DELETE exitoso: sin cuerpo

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    // cuerpo vacío o no JSON
  }

  if (!res.ok) {
    const e = (json as Partial<RespuestaError> | null)?.error;
    throw new ErrorApi(
      e?.codigo ?? "ERROR_INTERNO",
      e?.mensaje ?? "Algo salió mal. Probá de nuevo en un rato.",
    );
  }

  return (json as { datos: T }).datos;
}