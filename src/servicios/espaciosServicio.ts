// src/servicios/espaciosServicio.ts
import { Espacio, Turno, Reserva } from '../tipos/tipos';
import { MOCK_ESPACIOS, MOCK_TURNOS, MOCK_RESERVAS } from '../mocks/datosMock';
import { clienteHttp, USAR_MOCK } from './clienteHttp';
import { 
  guardarEspaciosLocal, 
  obtenerEspaciosLocal, 
  guardarReservasLocal, 
  obtenerReservasLocal, 
  hayConexionInternet 
} from '../db/baseDatos';

export const espaciosServicio = {
  async obtenerEspacios(): Promise<Espacio[]> {
    const online = await hayConexionInternet();

    if (!online) {
      console.log('Sin internet. Cargando espacios desde SQLite...');
      return obtenerEspaciosLocal();
    }

    if (USAR_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      guardarEspaciosLocal(MOCK_ESPACIOS);
      return MOCK_ESPACIOS;
    }

    const res = await clienteHttp<Espacio[]>('/espacios');
    if (res.datos) guardarEspaciosLocal(res.datos);
    return res.datos;
  },

  async obtenerTurnosPorFecha(fecha: string): Promise<Turno[]> {
    if (USAR_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_TURNOS[fecha] || [];
    }
    const res = await clienteHttp<Turno[]>(`/turnos?fecha=${fecha}`);
    return res.datos;
  },

  async obtenerMisReservas(): Promise<Reserva[]> {
    const online = await hayConexionInternet();

    if (!online) {
      console.log('Sin internet. Cargando reservas desde SQLite...');
      return obtenerReservasLocal();
    }

    if (USAR_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      guardarReservasLocal(MOCK_RESERVAS);
      return MOCK_RESERVAS;
    }

    const res = await clienteHttp<Reserva[]>('/reservas/mis-reservas');
    if (res.datos) guardarReservasLocal(res.datos);
    return res.datos;
  },
};