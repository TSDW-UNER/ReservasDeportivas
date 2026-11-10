// src/servicios/clienteHttp.ts
import { ApiResponse, ApiError } from '../tipos/tipos';

// Cambiar a false cuando la API real esté lista
export const USAR_MOCK = true;

const BASE_URL = 'https://api.reservasdeportivas.com/v1';

export async function clienteHttp<T>(
  endpoint: string,
  opciones: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = 'MOCK_TOKEN_JWT_12345'; // Header Authorization configurado

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...opciones.headers,
  };

  try {
    const respuesta = await fetch(`${BASE_URL}${endpoint}`, {
      ...opciones,
      headers,
    });

    if (!respuesta.ok) {
      const errorData: ApiError = await respuesta.json();
      throw new Error(errorData.error?.mensaje || 'Error en la petición servidor');
    }

    const datos: ApiResponse<T> = await respuesta.json();
    return datos;
  } catch (err: any) {
    throw new Error(err.message || 'Error de red o conexión');
  }
}