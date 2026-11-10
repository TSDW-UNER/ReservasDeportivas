// src/servicios/clienteHttp.ts
export const USAR_MOCK = true; // Cambiar a false cuando conecten al backend real

export interface RespuestaApi<T> {
  datos: T;
  meta?: {
    total?: number;
    pagina?: number;
  };
  error?: string;
}

const API_BASE_URL = 'https://api.reservasdeportivas.unER.edu.ar'; // Ejemplo

export async function clienteHttp<T>(endpoint: string, opciones?: RequestInit): Promise<RespuestaApi<T>> {
  try {
    const respuesta = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...opciones,
      headers: {
        'Content-Type': 'application/json',
        ...opciones?.headers,
      },
    });

    const json = await respuesta.json();

    if (!respuesta.ok) {
      return {
        datos: [] as unknown as T,
        error: json.mensaje || 'Ocurrió un error en la petición',
      };
    }

    return {
      datos: json.datos || json,
      meta: json.meta,
    };
  } catch (error) {
    return {
      datos: [] as unknown as T,
      error: 'Error de red o servidor no disponible',
    };
  }
}