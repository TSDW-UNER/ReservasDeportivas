// src/servicios/espaciosServicio.ts
import { Espacio, Turno, Reserva } from '../tipos/tipos';
import { MOCK_ESPACIOS, MOCK_TURNOS, MOCK_RESERVAS } from '../mocks/datosMock';
import { clienteHttp, USAR_MOCK } from './clienteHttp';

export const espaciosServicio = {
  // Obtener catálogo de espacios
  async obtenerEspacios(): Promise<Espacio[]> {
    if (USAR_MOCK) {
      // Simula delay de red
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_ESPACIOS;
    }
    const res = await clienteHttp<Espacio[]>('/espacios');
    return res.datos;
  },

  // Obtener turnos por fecha (incluye manejo del caso feo sin turnos o lluvia)
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