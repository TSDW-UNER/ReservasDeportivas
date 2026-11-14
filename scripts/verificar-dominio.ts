// Verifica la lógica de src/dominio/ sin levantar la app.
// Uso:  npx tsx scripts/verificar-dominio.ts
import type { Espacio, Reserva, ReservaFija, Turno } from "../src/tipos";
import {
  aIsoAR, calcularCancelableHasta, construirGrilla, contarReservasActivas, diaDeSemana, etiquetaDia,
  hoyAR, infoCancelacion, proximosDias, resumirDia, validarReserva,
} from "../src/dominio";

let fallos = 0;
function eq(nombre: string, real: unknown, esperado: unknown) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) fallos++;
  console.log(`${ok ? "✅" : "❌"} ${nombre}${ok ? "" : `\n     real: ${JSON.stringify(real)}\n     esperado: ${JSON.stringify(esperado)}`}`);
}

const espacio: Espacio = {
  id: "esp-02", nombre: "Cancha 2 — Fútbol 5", deporteId: "dep-futbol5", complejo: "Polideportivo Municipal",
  superficie: "césped sintético", techado: false, iluminacion: true, capacidad: 10, precioPorHora: 12000,
  coordenadas: { latitud: -31.8642, longitud: -59.0281 }, imagenes: [], videoUrl: null, reglas: "", activo: true,
};
const fijaMartes: ReservaFija = {
  id: "fij-07", espacioId: "esp-02", titular: "Grupo de los martes", dia: 2,
  inicio: "21:00", fin: "22:00", desde: "2026-03-01", hasta: null, activa: true,
};
const turno = (inicio: string, estado: Turno["estado"], extra: Partial<Turno> = {}): Turno => ({
  id: `t-${inicio}`, espacioId: "esp-02", fecha: "2026-09-19", inicio, fin: "x", estado,
  reservaId: estado === "reservado" ? "res-1" : null, motivoBloqueo: null, precio: 12000, ...extra,
});
const AR = (iso: string) => new Date(iso); // los ISO de los tests llevan -03:00
const antes = AR("2026-09-17T10:00:00-03:00");

// --- fechas ---
eq("19/09/2026 es sábado", diaDeSemana("2026-09-19"), 6);
eq("15/09/2026 es martes", diaDeSemana("2026-09-15"), 2);
eq("etiqueta del día", etiquetaDia("2026-09-19"), "Sábado 19 de septiembre");
eq("hoyAR a las 22:30 AR (01:30 UTC del día siguiente)", hoyAR(new Date("2026-09-20T01:30:00Z")), "2026-09-19");
eq("7 días cruzando de mes", proximosDias(AR("2026-09-28T12:00:00-03:00")),
  ["2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"]);

// --- grilla básica ---
const g = construirGrilla({ espacio, fecha: "2026-09-19", turnos: [], fijas: [], ahora: antes });
eq("16 turnos, de 08:00 a 24:00", [g.length, g[0].inicio, g[15].inicio, g[15].fin], [16, "08:00", "23:00", "24:00"]);
eq("sin datos: todo libre y reservable", g.every((t) => t.estado === "libre" && t.reservable), true);

// --- reserva fija ---
const martes = construirGrilla({ espacio, fecha: "2026-09-15", turnos: [], fijas: [fijaMartes], ahora: AR("2026-09-10T10:00:00-03:00") });
const t21 = martes.find((t) => t.inicio === "21:00")!;
eq("la fija ocupa el martes 21:00", [t21.estado, t21.titularFija, t21.reservable], ["fijo", "Grupo de los martes", false]);
eq("la fija no toca otras horas del martes", martes.filter((t) => t.estado === "fijo").length, 1);
const sabado = construirGrilla({ espacio, fecha: "2026-09-19", turnos: [], fijas: [fijaMartes], ahora: antes });
eq("la fija del martes no aparece un sábado", sabado.some((t) => t.estado === "fijo"), false);
const antesDeDesde = construirGrilla({ espacio, fecha: "2026-02-24", turnos: [], fijas: [fijaMartes], ahora: AR("2026-02-01T10:00:00-03:00") });
eq("fija todavía no vigente (desde 01/03)", antesDeDesde.some((t) => t.estado === "fijo"), false);
const vencida = construirGrilla({ espacio, fecha: "2026-09-15", turnos: [], fijas: [{ ...fijaMartes, hasta: "2026-08-31" }], ahora: AR("2026-09-10T10:00:00-03:00") });
eq("fija vencida (hasta 31/08)", vencida.some((t) => t.estado === "fijo"), false);
const inactiva = construirGrilla({ espacio, fecha: "2026-09-15", turnos: [], fijas: [{ ...fijaMartes, activa: false }], ahora: AR("2026-09-10T10:00:00-03:00") });
eq("fija inactiva", inactiva.some((t) => t.estado === "fijo"), false);
const fijaDosHoras = construirGrilla({ espacio, fecha: "2026-09-15", turnos: [], fijas: [{ ...fijaMartes, inicio: "20:00", fin: "22:00" }], ahora: AR("2026-09-10T10:00:00-03:00") });
eq("fija de 2 horas ocupa 20 y 21", fijaDosHoras.filter((t) => t.estado === "fijo").map((t) => t.inicio), ["20:00", "21:00"]);

// --- reservado y mantenimiento ---
const mix = construirGrilla({
  espacio, fecha: "2026-09-19", ahora: antes, fijas: [],
  turnos: [turno("18:00", "reservado"), turno("20:00", "mantenimiento", { motivoBloqueo: "Cancha anegada" })],
});
eq("turno reservado", mix.find((t) => t.inicio === "18:00")!.estado, "reservado");
eq("mantenimiento con motivo", [mix.find((t) => t.inicio === "20:00")!.estado, mix.find((t) => t.inicio === "20:00")!.motivoBloqueo], ["mantenimiento", "Cancha anegada"]);
const conflicto = construirGrilla({
  espacio, fecha: "2026-09-15", ahora: AR("2026-09-10T10:00:00-03:00"), fijas: [fijaMartes],
  turnos: [turno("21:00", "mantenimiento", { fecha: "2026-09-15", motivoBloqueo: "Lluvia" })],
});
eq("mantenimiento le gana a la fija", conflicto.find((t) => t.inicio === "21:00")!.estado, "mantenimiento");
eq("ignora turnos de otro día o de otro espacio", construirGrilla({
  espacio, fecha: "2026-09-19", ahora: antes, fijas: [],
  turnos: [turno("18:00", "reservado", { fecha: "2026-09-20" }), turno("19:00", "reservado", { espacioId: "esp-01" })],
}).every((t) => t.estado === "libre"), true);

// --- turnos pasados ---
const enCurso = construirGrilla({ espacio, fecha: "2026-09-19", turnos: [], fijas: [], ahora: AR("2026-09-19T19:30:00-03:00") });
eq("19:30: hasta las 19:00 pasado, 20:00 no", [enCurso.find((t) => t.inicio === "19:00")!.pasado, enCurso.find((t) => t.inicio === "20:00")!.pasado], [true, false]);
eq("turno pasado libre no es reservable", enCurso.find((t) => t.inicio === "10:00")!.reservable, false);
const manana = construirGrilla({ espacio, fecha: "2026-09-19", turnos: [], fijas: [], ahora: AR("2026-09-20T00:30:00-03:00") });
eq("al día siguiente todo el día es pasado", manana.every((t) => t.pasado), true);

// --- resumen del día (casos feos del PRD) ---
const lluvia = construirGrilla({
  espacio, fecha: "2026-09-19", ahora: antes, fijas: [],
  turnos: Array.from({ length: 16 }, (_, i) => turno(`${String(8 + i).padStart(2, "0")}:00`, "mantenimiento", { motivoBloqueo: "Cancha anegada" })),
});
eq("día entero bloqueado por lluvia", [resumirDia(lluvia).estado, resumirDia(lluvia).motivoBloqueo], ["bloqueado", "Cancha anegada"]);
const llena = construirGrilla({
  espacio, fecha: "2026-09-19", ahora: antes, fijas: [],
  turnos: Array.from({ length: 16 }, (_, i) => turno(`${String(8 + i).padStart(2, "0")}:00`, "reservado")),
});
eq("grilla completa sin libres", resumirDia(llena).estado, "completo");
eq("día normal", resumirDia(sabado).estado, "disponible");
eq("día ya terminado", resumirDia(manana).estado, "finalizado");

// --- cancelación ---
eq("cancelableHasta de un turno de 19:00 = 15:00", calcularCancelableHasta("2026-09-19", "19:00"), "2026-09-19T15:00:00-03:00");
eq("cancelableHasta de un turno de 02:00 cruza el día", calcularCancelableHasta("2026-09-19", "02:00"), "2026-09-18T22:00:00-03:00");
const res = (extra: Partial<Reserva> = {}): Reserva => ({
  id: "res-1180", turnoId: "tur-0219-19", espacioId: "esp-02", usuarioId: "usr-207", cantidadPersonas: 10,
  codigoQr: "VGY-1180-0219-19", estado: "confirmada", ingresoEn: null,
  creadaEn: "2026-09-16T21:04:00-03:00", cancelableHasta: "2026-09-19T15:00:00-03:00", ...extra,
});
const c1 = infoCancelacion(res(), AR("2026-09-19T14:59:00-03:00"));
eq("14:59: en plazo", [c1.estado, c1.puedeCancelarEnApp], ["en_plazo", true]);
eq("mensaje del PRD", c1.mensaje, "Se puede cancelar sin aviso hasta las 15:00 de hoy");
eq("15:01: fuera de plazo", infoCancelacion(res(), AR("2026-09-19T15:01:00-03:00")).estado, "fuera_de_plazo");
eq("mensaje 'de mañana'", infoCancelacion(res(), AR("2026-09-18T10:00:00-03:00")).mensaje, "Se puede cancelar sin aviso hasta las 15:00 de mañana");
eq("mensaje con fecha", infoCancelacion(res(), AR("2026-09-15T10:00:00-03:00")).mensaje, "Se puede cancelar sin aviso hasta las 15:00 del 19/09");
eq("ya cancelada: no cancelable", infoCancelacion(res({ estado: "cancelada" }), antes).estado, "no_cancelable");
eq("cancelableHasta en UTC también funciona", infoCancelacion(res({ cancelableHasta: "2026-09-19T18:00:00Z" }), AR("2026-09-19T14:59:00-03:00")).mensaje, "Se puede cancelar sin aviso hasta las 15:00 de hoy");
eq("aIsoAR", aIsoAR(new Date("2026-09-19T18:00:00Z")), "2026-09-19T15:00:00-03:00");

// --- validar reserva y límite de 3 ---
const hoyMismo = AR("2026-09-17T10:00:00-03:00");
const futura = (n: number) => res({ id: `r${n}`, cancelableHasta: "2026-09-19T15:00:00-03:00" });
const libre = sabado.find((t) => t.inicio === "19:00")!;
eq("reserva válida", validarReserva({ turno: libre, espacio, cantidadPersonas: 10, reservasDelUsuario: [], ahora: hoyMismo }), { ok: true });
const v = (t: typeof libre, extra: object = {}) => validarReserva({ turno: t, espacio, cantidadPersonas: 10, reservasDelUsuario: [], ahora: hoyMismo, ...extra });
eq("turno ocupado", (v(llena[0]) as { codigo: string }).codigo, "TURNO_OCUPADO");
eq("turno bloqueado", (v(lluvia[0]) as { codigo: string }).codigo, "TURNO_BLOQUEADO");
eq("turno pasado", (v(manana[0]) as { codigo: string }).codigo, "TURNO_PASADO");
eq("fija = ocupado", (v(t21) as { codigo: string }).codigo, "TURNO_OCUPADO");
eq("cantidad 0", (v(libre, { cantidadPersonas: 0 }) as { codigo: string }).codigo, "CANTIDAD_INVALIDA");
eq("más personas que la capacidad", (v(libre, { cantidadPersonas: 11 }) as { codigo: string }).codigo, "CAPACIDAD_EXCEDIDA");
eq("justo la capacidad (10) se puede", v(libre, { cantidadPersonas: 10 }), { ok: true });
eq("espacio inactivo", (v(libre, { espacio: { ...espacio, activo: false } }) as { codigo: string }).codigo, "ESPACIO_INACTIVO");
eq("2 activas: puede reservar", v(libre, { reservasDelUsuario: [futura(1), futura(2)] }), { ok: true });
eq("3 activas: bloquea", (v(libre, { reservasDelUsuario: [futura(1), futura(2), futura(3)] }) as { codigo: string }).codigo, "LIMITE_DE_RESERVAS");
eq("canceladas y pasadas no cuentan", contarReservasActivas([
  futura(1), res({ id: "x", estado: "cancelada" }), res({ id: "y", estado: "cumplida" }),
  res({ id: "z", cancelableHasta: "2026-09-10T15:00:00-03:00" }),
], hoyMismo), 1);

console.log(fallos === 0 ? "\n🎉 Todo OK" : `\n💥 ${fallos} verificación(es) fallaron`);
if (fallos > 0) throw new Error("Fallaron verificaciones");
