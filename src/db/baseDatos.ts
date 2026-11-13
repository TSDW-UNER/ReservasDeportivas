import * as SQLite from "expo-sqlite";
import type { Espacio, Reserva } from "../tipos";

// Qué se guarda en el teléfono (requisito: abrir y mostrar algo sin conexión):
//   espacios → el catálogo, para ver los espacios sin señal
//   reservas → mis reservas con su código QR, para mostrarlo en la puerta
// Cada fila guarda el objeto completo en datosJson (con los tipos del PRD) más las columnas
// que se usan para filtrar.
const VERSION_ESQUEMA = 1;

const db = SQLite.openDatabaseSync("reservas_deportivas.db");

/** Idempotente: se puede llamar en cada arranque. Se llama una vez desde src/app/_layout.tsx. */
export function inicializarBaseDatos(): void {
  const fila = db.getFirstSync<{ user_version: number }>("PRAGMA user_version");
  const version = fila?.user_version ?? 0;

  if (version < VERSION_ESQUEMA) {
    // Esquema viejo o inexistente: se rehace. Son datos de caché, se vuelven a bajar.
    db.execSync(`
      DROP TABLE IF EXISTS espacios;
      DROP TABLE IF EXISTS reservas;
    `);
  }

  db.execSync(`
    CREATE TABLE IF NOT EXISTS espacios (
      id TEXT PRIMARY KEY NOT NULL,
      datosJson TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reservas (
      id TEXT PRIMARY KEY NOT NULL,
      usuarioId TEXT NOT NULL,
      estado TEXT NOT NULL,
      cancelableHasta TEXT NOT NULL,
      datosJson TEXT NOT NULL
    );
    PRAGMA user_version = ${VERSION_ESQUEMA};
  `);
}

// ---------- espacios ----------

export function guardarEspacios(espacios: Espacio[]): void {
  db.withTransactionSync(() => {
    db.runSync("DELETE FROM espacios");
    for (const e of espacios) {
      db.runSync("INSERT INTO espacios (id, datosJson) VALUES (?, ?)", [e.id, JSON.stringify(e)]);
    }
  });
}

export function leerEspacios(): Espacio[] {
  return db.getAllSync<{ datosJson: string }>("SELECT datosJson FROM espacios ORDER BY id").map((f) => JSON.parse(f.datosJson) as Espacio);
}

// ---------- reservas ----------

export function guardarReserva(r: Reserva): void {
  db.runSync(
    "INSERT OR REPLACE INTO reservas (id, usuarioId, estado, cancelableHasta, datosJson) VALUES (?, ?, ?, ?, ?)",
    [r.id, r.usuarioId, r.estado, r.cancelableHasta, JSON.stringify(r)],
  );
}

/** Deja guardadas exactamente las reservas que informó el servidor para esa persona. */
export function reemplazarReservasDeUsuario(usuarioId: string, reservas: Reserva[]): void {
  db.withTransactionSync(() => {
    db.runSync("DELETE FROM reservas WHERE usuarioId = ?", [usuarioId]);
    for (const r of reservas) guardarReserva(r);
  });
}

export function leerReservasDeUsuario(usuarioId: string): Reserva[] {
  return db
    .getAllSync<{ datosJson: string }>("SELECT datosJson FROM reservas WHERE usuarioId = ? ORDER BY cancelableHasta", [usuarioId])
    .map((f) => JSON.parse(f.datosJson) as Reserva);
}

/** Para llamar al cerrar sesión: no dejar reservas de otra persona en el teléfono. */
export function borrarDatosLocales(): void {
  db.withTransactionSync(() => {
    db.runSync("DELETE FROM reservas");
  });
}
