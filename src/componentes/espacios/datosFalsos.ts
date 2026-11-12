// PROVISORIO (Integrante 2): datos de prueba para maquetar el catálogo.
// Los tipos replican el PRD (pág. 7-8). Cuando existan en src/tipos/ se importan
// desde ahí y este archivo se elimina: el catálogo pasará por src/servicios/.

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

export interface Deporte {
  id: string;
  nombre: string;
  icono: string;
  color: string;
}

export interface Espacio {
  id: string;
  nombre: string;
  deporteId: string;
  complejo: string;
  superficie: string;
  techado: boolean;
  iluminacion: boolean;
  capacidad: number;
  precioPorHora: number;
  coordenadas: Coordenadas;
  imagenes: string[];
  videoUrl: string | null;
  reglas: string;
  activo: boolean;
}

const POLIDEPORTIVO: Coordenadas = { latitud: -31.8642, longitud: -59.0281 };
const PARQUE_BERDUC: Coordenadas = { latitud: -31.8587, longitud: -59.0349 };

export const deportesFalsos: Deporte[] = [
  { id: "dep-futbol5", nombre: "Fútbol 5", icono: "football-outline", color: "#2E7D32" },
  { id: "dep-futbol11", nombre: "Fútbol 11", icono: "football-outline", color: "#1B5E20" },
  { id: "dep-basquet", nombre: "Básquet", icono: "basketball-outline", color: "#EF6C00" },
  { id: "dep-voley", nombre: "Vóley", icono: "tennisball-outline", color: "#0277BD" },
  { id: "dep-tenis", nombre: "Tenis", icono: "tennisball-outline", color: "#9E9D24" },
  { id: "dep-gimnasio", nombre: "Gimnasio", icono: "barbell-outline", color: "#6A1B9A" },
];

const foto = (id: string) => [
  `https://picsum.photos/seed/${id}-a/800/500`,
  `https://picsum.photos/seed/${id}-b/800/500`,
];

const REGLAS_SINTETICO = "No se permite calzado con tapones de aluminio.";
const REGLAS_CANCHA = "Calzado deportivo obligatorio. Respetar el horario del turno.";

export const espaciosFalsos: Espacio[] = [
  {
    id: "esp-01", nombre: "Cancha 1 — Fútbol 5", deporteId: "dep-futbol5",
    complejo: "Polideportivo Municipal", superficie: "césped sintético",
    techado: false, iluminacion: true, capacidad: 10, precioPorHora: 12000,
    coordenadas: POLIDEPORTIVO, imagenes: foto("esp-01"),
    videoUrl: "https://example.com/v/cancha1.mp4", reglas: REGLAS_SINTETICO, activo: true,
  },
  {
    id: "esp-02", nombre: "Cancha 2 — Fútbol 5", deporteId: "dep-futbol5",
    complejo: "Polideportivo Municipal", superficie: "césped sintético",
    techado: false, iluminacion: true, capacidad: 10, precioPorHora: 12000,
    coordenadas: POLIDEPORTIVO, imagenes: foto("esp-02"),
    videoUrl: "https://example.com/v/cancha2.mp4", reglas: REGLAS_SINTETICO, activo: true,
  },
  {
    id: "esp-03", nombre: "Cancha de Fútbol 11", deporteId: "dep-futbol11",
    complejo: "Polideportivo Municipal", superficie: "césped natural",
    techado: false, iluminacion: false, capacidad: 22, precioPorHora: 25000,
    coordenadas: POLIDEPORTIVO, imagenes: foto("esp-03"),
    videoUrl: null, reglas: "Prohibido ingresar con vehículos al campo.", activo: true,
  },
  {
    id: "esp-04", nombre: "Cancha de Básquet 1", deporteId: "dep-basquet",
    complejo: "Polideportivo Municipal", superficie: "cemento alisado",
    techado: true, iluminacion: true, capacidad: 10, precioPorHora: 8000,
    coordenadas: POLIDEPORTIVO, imagenes: foto("esp-04"),
    videoUrl: "https://example.com/v/basquet1.mp4", reglas: REGLAS_CANCHA, activo: true,
  },
  {
    id: "esp-05", nombre: "Cancha de Básquet 2", deporteId: "dep-basquet",
    complejo: "Polideportivo Municipal", superficie: "cemento alisado",
    techado: true, iluminacion: true, capacidad: 10, precioPorHora: 8000,
    coordenadas: POLIDEPORTIVO, imagenes: foto("esp-05"),
    videoUrl: null, reglas: REGLAS_CANCHA, activo: true,
  },
  {
    id: "esp-06", nombre: "Cancha de Básquet 3", deporteId: "dep-basquet",
    complejo: "Polideportivo Municipal", superficie: "parquet",
    techado: true, iluminacion: true, capacidad: 10, precioPorHora: 9000,
    coordenadas: POLIDEPORTIVO, imagenes: foto("esp-06"),
    videoUrl: "https://example.com/v/basquet3.mp4", reglas: REGLAS_CANCHA, activo: true,
  },
  {
    id: "esp-07", nombre: "Cancha de Vóley 1", deporteId: "dep-voley",
    complejo: "Polideportivo Municipal", superficie: "cemento alisado",
    techado: true, iluminacion: true, capacidad: 12, precioPorHora: 7000,
    coordenadas: POLIDEPORTIVO, imagenes: foto("esp-07"),
    videoUrl: null, reglas: REGLAS_CANCHA, activo: true,
  },
  {
    id: "esp-08", nombre: "Cancha de Vóley 2", deporteId: "dep-voley",
    complejo: "Polideportivo Municipal", superficie: "cemento alisado",
    techado: true, iluminacion: false, capacidad: 12, precioPorHora: 7000,
    coordenadas: POLIDEPORTIVO, imagenes: foto("esp-08"),
    videoUrl: null, reglas: REGLAS_CANCHA, activo: true,
  },
  {
    id: "esp-09", nombre: "Cancha de Tenis 1", deporteId: "dep-tenis",
    complejo: "Parque Berduc", superficie: "polvo de ladrillo",
    techado: false, iluminacion: true, capacidad: 4, precioPorHora: 6000,
    coordenadas: PARQUE_BERDUC, imagenes: foto("esp-09"),
    videoUrl: "https://example.com/v/tenis1.mp4",
    reglas: "Calzado específico para polvo de ladrillo.", activo: true,
  },
  {
    id: "esp-10", nombre: "Cancha de Tenis 2", deporteId: "dep-tenis",
    complejo: "Parque Berduc", superficie: "polvo de ladrillo",
    techado: false, iluminacion: false, capacidad: 4, precioPorHora: 6000,
    coordenadas: PARQUE_BERDUC, imagenes: foto("esp-10"),
    videoUrl: null, reglas: "Calzado específico para polvo de ladrillo.", activo: true,
  },
  {
    id: "esp-11", nombre: "Gimnasio Cerrado", deporteId: "dep-gimnasio",
    complejo: "Polideportivo Municipal", superficie: "piso flotante",
    techado: true, iluminacion: true, capacidad: 30, precioPorHora: 15000,
    coordenadas: POLIDEPORTIVO, imagenes: foto("esp-11"),
    videoUrl: "https://example.com/v/gimnasio.mp4",
    reglas: "Ingreso con calzado limpio. Prohibido comer dentro.", activo: true,
  },
];

export interface ReservaFija {
  id: string;
  espacioId: string;
  titular: string;
  dia: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = domingo
  inicio: string;
  fin: string;
  desde: string;
  hasta: string | null;
  activa: boolean;
}

export const reservasFijasFalsas: ReservaFija[] = [
  { id: "fij-07", espacioId: "esp-02", titular: "Grupo de los martes", dia: 2, inicio: "21:00", fin: "22:00", desde: "2026-03-01", hasta: null, activa: true },
  { id: "fij-08", espacioId: "esp-02", titular: "Club Atlético Villaguay", dia: 4, inicio: "19:00", fin: "20:00", desde: "2026-03-01", hasta: null, activa: true },
  { id: "fij-09", espacioId: "esp-01", titular: "Escuela N° 12", dia: 2, inicio: "20:00", fin: "21:00", desde: "2026-04-01", hasta: "2026-12-15", activa: true },
  { id: "fij-10", espacioId: "esp-04", titular: "Club Villaguay Básquet", dia: 3, inicio: "19:00", fin: "21:00", desde: "2026-03-01", hasta: null, activa: true },
  { id: "fij-11", espacioId: "esp-09", titular: "Escuela de tenis", dia: 6, inicio: "10:00", fin: "11:00", desde: "2026-03-01", hasta: null, activa: true },
];
