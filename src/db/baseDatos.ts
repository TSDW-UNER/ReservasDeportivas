
import * as SQLite from "expo-sqlite";
import type { Espacio, Reserva } from "../tipos";

const VERSION_ESQUEMA = 2;

const db = SQLite.openDatabaseSync("reservas_deportivas.db");

/** Idempotente: se puede llamar en cada arranque. */
export function inicializarBaseDatos(): void {
  const fila = db.getFirstSync<{ user_version: number }>("PRAGMA user_version");
  const version = fila?.user_version ?? 0;

  // Solo se rehacen las tablas originales si la base todavía no tenía esquema.
  if (version < 1) {
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
  `);

  // Migración v2: se agrega favoritos sin borrar las cachés existentes.
  if (version < 2) {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS favoritos (
        espacioId TEXT PRIMARY KEY NOT NULL
      );
    `);
  }

  db.execSync(`PRAGMA user_version = ${VERSION_ESQUEMA};`);
}

// ---------- espacios ----------

export function guardarEspacios(espacios: Espacio[]): void {
  db.withTransactionSync(() => {
    db.runSync("DELETE FROM espacios");
    for (const e of espacios) {
      db.runSync("INSERT INTO espacios (id, datosJson) VALUES (?, ?)", [
        e.id,
        JSON.stringify(e),
      ]);
    }
  });
}

export function leerEspacios(): Espacio[] {
  return db
    .getAllSync<{ datosJson: string }>(
      "SELECT datosJson FROM espacios ORDER BY id",
    )
    .map((f) => JSON.parse(f.datosJson) as Espacio);
}

// ---------- reservas ----------

export function guardarReserva(r: Reserva): void {
  db.runSync(
    "INSERT OR REPLACE INTO reservas (id, usuarioId, estado, cancelableHasta, datosJson) VALUES (?, ?, ?, ?, ?)",
    [r.id, r.usuarioId, r.estado, r.cancelableHasta, JSON.stringify(r)],
  );
}

/** Deja guardadas exactamente las reservas que informó el servidor para esa persona. */
export function reemplazarReservasDeUsuario(
  usuarioId: string,
  reservas: Reserva[],
): void {
  db.withTransactionSync(() => {
    db.runSync("DELETE FROM reservas WHERE usuarioId = ?", [usuarioId]);
    for (const r of reservas) guardarReserva(r);
  });
}

export function leerReservasDeUsuario(usuarioId: string): Reserva[] {
  return db
    .getAllSync<{ datosJson: string }>(
      "SELECT datosJson FROM reservas WHERE usuarioId = ? ORDER BY cancelableHasta",
      [usuarioId],
    )
    .map((f) => JSON.parse(f.datosJson) as Reserva);
}

// ---------- favoritos ----------

export function guardarFavorito(espacioId: string): void {
  db.runSync("INSERT OR IGNORE INTO favoritos (espacioId) VALUES (?)", [
    espacioId,
  ]);
}

export function quitarFavorito(espacioId: string): void {
  db.runSync("DELETE FROM favoritos WHERE espacioId = ?", [espacioId]);
}

export function leerFavoritos(): string[] {
  return db
    .getAllSync<{ espacioId: string }>(
      "SELECT espacioId FROM favoritos ORDER BY espacioId",
    )
    .map((fila) => fila.espacioId);
}

export function esFavorito(espacioId: string): boolean {
  return (
    db.getFirstSync<{ espacioId: string }>(
      "SELECT espacioId FROM favoritos WHERE espacioId = ?",
      [espacioId],
    ) !== null
  );
}

// ---------- limpieza ----------

/** Para llamar al cerrar sesión: no dejar reservas de otra persona en el teléfono. */
export function borrarDatosLocales(): void {
  db.withTransactionSync(() => {
    db.runSync("DELETE FROM reservas");
  });
}
