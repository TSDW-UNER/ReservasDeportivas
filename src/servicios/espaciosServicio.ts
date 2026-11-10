// src/servicios/espaciosServicio.ts
import { Espacio, Turno, Reserva } from '../tipos/tipos';
import { MOCK_ESPACIOS, MOCK_TURNOS, MOCK_RESERVAS } from '../mocks/datosMock';
import { clienteHttp, USAR_MOCK } from './clienteHttp';
import { guardarEspaciosLocal, obtenerEspaciosLocal, hayConexionInternet } from '../db/baseDatos';

export const espaciosServicio = {
  // Obtener catálogo de espacios con soporte offline (SQLite + expo-network)
  async obtenerEspacios(): Promise<Espacio[]> {
    const online = await hayConexionInternet();

    // Si no hay internet, devuelve directo la caché de SQLite
    if (!online) {
      console.log('Sin conexión. Cargando espacios desde SQLite local...');
      return obtenerEspaciosLocal();
    }

    if (USAR_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Guarda copia en SQLite para uso offline futuro
      guardarEspaciosLocal(MOCK_ESPACIOS);
      return MOCK_ESPACIOS;
    }

    const res = await clienteHttp<Espacio[]>('/espacios');
    guardarEspaciosLocal(res.datos);
    return res.datos;
  },

  // Obtener turnos por fecha
  async obtenerTurnosPorFecha(fecha: string): Promise<Turno[]> {
    if (USAR_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_TURNOS[fecha] || [];
    }
    const res = await clienteHttp<Turno[]>(`/turnos?fecha=${fecha}`);
    return res.datos;
  },

  // Obtener reservas del usuario
  async obtenerMisReservas(): Promise<Reserva[]> {
    if (USAR_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_RESERVAS;
    }
    const res = await clienteHttp<Reserva[]>('/reservas/mis-reservas');
    return res.datos;
  },
};