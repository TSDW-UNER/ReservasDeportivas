import * as SQLite from 'expo-sqlite';
import { Espacio, Reserva } from '../tipos';

const db = SQLite.openDatabaseSync('reservas_deportivas.db');

export function inicializarBaseDatos() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS espacios (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT,
      deporte TEXT,
      complejo TEXT,
      superficie TEXT,
      iluminacion INTEGER,
      precioPorTurno REAL,
      datosJson TEXT
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS reservas (
      id TEXT PRIMARY KEY NOT NULL,
      usuarioId TEXT,
      espacioId TEXT,
      fecha TEXT,
      horaInicio TEXT,
      deporte TEXT,
      estado TEXT,
      datosJson TEXT
    );
  `);
}

export function guardarEspaciosLocal(espacios: Espacio[]) {
  for (const esp of espacios) {
    db.runSync(
      `INSERT OR REPLACE INTO espacios (id, nombre, deporte, complejo, superficie, iluminacion, precioPorTurno, datosJson) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [esp.id, esp.nombre, esp.deporte, esp.complejo, esp.superficie, esp.iluminacion ? 1 : 0, esp.precioPorTurno, JSON.stringify(esp)]
    );
  }
}

export function obtenerEspaciosLocal(): Espacio[] {
  const resultados = db.getAllSync(`SELECT datosJson FROM espacios;`) as { datosJson: string }[];
  return resultados.map(r => JSON.parse(r.datosJson));
}