// src/mocks/datosMock.ts
import { Espacio, Turno, Reserva, ReservaFija } from '../tipos/tipos';

// Espacios deportivos de prueba
export const MOCK_ESPACIOS: Espacio[] = [
  {
    id: 'esp-1',
    nombre: 'Cancha 1 - Césped Sintético',
    deporte: 'Fútbol',
    complejo: 'Complejo Central',
    superficie: 'Sintético',
    iluminacion: true,
    precioPorTurno: 15000,
  },
  {
    id: 'esp-2',
    nombre: 'Cancha de Pádel Blindex',
    deporte: 'Pádel',
    complejo: 'Complejo Central',
    superficie: 'Cristal',
    iluminacion: true,
    precioPorTurno: 12000,
  },
  {
    id: 'esp-3',
    nombre: 'Cancha de Tenis Polvo de Ladrillo',
    deporte: 'Tenis',
    complejo: 'Club del Sur',
    superficie: 'Polvo de ladrillo',
    iluminacion: false,
    precioPorTurno: 10000,
  },
];

// Casos de prueba: grilla de turnos, días bloqueados y casos de error
export const MOCK_TURNOS: Record<string, Turno[]> = {
  // Día normal con turnos libres
  '2026-11-20': [
    { id: 't-1', espacioId: 'esp-1', fecha: '2026-11-20', horaInicio: '18:00', horaFin: '19:00', disponible: true, precio: 15000 },
    { id: 't-2', espacioId: 'esp-1', fecha: '2026-11-20', horaInicio: '19:00', horaFin: '20:00', disponible: false, precio: 15000 },
    { id: 't-3', espacioId: 'esp-1', fecha: '2026-11-20', horaInicio: '20:00', horaFin: '21:00', disponible: true, precio: 15000 },
  ],
  // Caso feo 1: Grilla sin turnos libres (todo ocupado)
  '2026-11-21': [
    { id: 't-4', espacioId: 'esp-1', fecha: '2026-11-21', horaInicio: '18:00', horaFin: '19:00', disponible: false, precio: 15000 },
    { id: 't-5', espacioId: 'esp-1', fecha: '2026-11-21', horaInicio: '19:00', horaFin: '20:00', disponible: false, precio: 15000 },
  ],
  // Caso feo 2: Día bloqueado por lluvia (lista vacía)
  '2026-11-22': [],
};

// Reservas de prueba (incluye cancelada)
export const MOCK_RESERVAS: Reserva[] = [
  {
    id: 'res-1',
    usuarioId: 'usr-100',
    espacioId: 'esp-1',
    fecha: '2026-11-20',
    horaInicio: '19:00',
    deporte: 'Fútbol',
    estado: 'confirmada',
  },
  {
    id: 'res-2',
    usuarioId: 'usr-100',
    espacioId: 'esp-2',
    fecha: '2026-11-15',
    horaInicio: '20:00',
    deporte: 'Pádel',
    estado: 'cancelada', // Caso feo: reserva cancelada
  },
];

// Caso feo 3: Reserva fija de los martes
export const MOCK_RESERVAS_FIJAS: ReservaFija[] = [
  {
    id: 'fija-1',
    usuarioId: 'usr-100',
    espacioId: 'esp-1',
    diaSemana: 'Martes',
    horaInicio: '21:00',
    deporte: 'Fútbol',
  },
];