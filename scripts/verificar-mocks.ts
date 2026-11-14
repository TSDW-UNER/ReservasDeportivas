// Verifica el "servidor falso" y las reglas de reserva sin levantar la app.
// Uso:  npx tsx scripts/verificar-mocks.ts
import { construirGrilla, instanteDeTurno, resumirDia } from "../src/dominio";
import { ESPACIOS, RESERVAS_FIJAS } from "../src/mocks/datos";
import {
  cancelarReservaFalsa, crearReservaFalsa, opcionesMock, reiniciarServidorFalso, reservasDe, responder,
  sesionFalsa, turnosDelDia,
} from "../src/mocks/servidorFalso";

let fallos = 0;
function eq(nombre: string, real: unknown, esperado: unknown) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) fallos++;
  console.log(`${ok ? "✅" : "❌"} ${nombre}${ok ? "" : `\n     real: ${JSON.stringify(real)}\n     esperado: ${JSON.stringify(esperado)}`}`);
}
async function codigoDeError(f: () => unknown): Promise<string> {
  try { await f(); return "SIN_ERROR"; } catch (e) { return (e as { codigo?: string }).codigo ?? "OTRO"; }
}

opcionesMock.latenciaMs = 0;
const ahora = new Date();
const fecha = (dias: number) => {
  const d = new Date(ahora.getTime() + dias * 86_400_000 - 3 * 3_600_000);
  return d.toISOString().slice(0, 10);
};
const esp = (id: string) => ESPACIOS.find((e) => e.id === id)!;
const dia = (id: string, f: string) =>
  resumirDia(construirGrilla({ espacio: esp(id), fecha: f, turnos: turnosDelDia(id, f, ahora), fijas: RESERVAS_FIJAS, ahora }));

(async () => {
  // --- datos ---
  eq("hay 11 espacios", ESPACIOS.length, 11);
  eq("espacios sin video", ESPACIOS.filter((e) => e.videoUrl === null).map((e) => e.id), ["esp-03", "esp-05", "esp-07", "esp-08", "esp-10"]);

  // --- casos feos ---
  eq("hoy+2 lluvia: TODOS los espacios bloqueados", ESPACIOS.every((e) => dia(e.id, fecha(2)).estado === "bloqueado"), true);
  eq("motivo de la lluvia", dia("esp-02", fecha(2)).motivoBloqueo, "Cancha anegada por la lluvia");
  eq("hoy+1 esp-01: grilla completa", dia("esp-01", fecha(1)).estado, "completo");
  eq("hoy+1 esp-02: sigue habiendo lugar", dia("esp-02", fecha(1)).estado, "disponible");
  eq("hoy+3 esp-02: 20:00 en mantenimiento", turnosDelDia("esp-02", fecha(3), ahora).find((t) => t.inicio === "20:00")?.estado, "mantenimiento");
  eq("hay reservas canceladas y cumplidas", reservasDe("usr-207").map((r) => r.estado).sort(), ["cancelada", "cumplida", "confirmada", "confirmada"].sort());

  // --- error de red ---
  opcionesMock.errorDeRed = true;
  eq("error de red simulado", await codigoDeError(() => responder(() => 1)), "SIN_CONEXION");
  opcionesMock.errorDeRed = false;
  eq("sin error de red responde", await responder(() => 42), 42);

  // --- reservar ---
  reiniciarServidorFalso();
  const f5 = fecha(5); // día sin escenarios especiales para esp-04... buscamos un turno libre
  const libre = construirGrilla({ espacio: esp("esp-06"), fecha: f5, turnos: turnosDelDia("esp-06", f5, ahora), fijas: RESERVAS_FIJAS, ahora }).find((t) => t.reservable)!;
  eq("hay un turno libre para probar", libre !== undefined, true);
  const datos = { usuarioId: "usr-207", espacioId: "esp-06", fecha: f5, inicio: libre.inicio, cantidadPersonas: 8 };
  const r = crearReservaFalsa(datos, ahora);
  eq("reserva creada: confirmada, con QR y cancelableHasta", [r.estado, r.codigoQr.startsWith("VGY-"), r.cancelableHasta.endsWith("-03:00")], ["confirmada", true, true]);
  eq("el turno pasa a reservado", turnosDelDia("esp-06", f5, ahora).find((t) => t.inicio === libre.inicio)?.estado, "reservado");
  eq("reservar el mismo turno: TURNO_OCUPADO", await codigoDeError(() => crearReservaFalsa(datos, ahora)), "TURNO_OCUPADO");

  // --- límite de 3 activas (ya tenía 2 + la de arriba = 3) ---
  const otro = construirGrilla({ espacio: esp("esp-07"), fecha: f5, turnos: turnosDelDia("esp-07", f5, ahora), fijas: RESERVAS_FIJAS, ahora }).find((t) => t.reservable)!;
  eq("4ta reserva activa: LIMITE_RESERVAS", await codigoDeError(() => crearReservaFalsa({ ...datos, espacioId: "esp-07", inicio: otro.inicio }, ahora)), "LIMITE_DE_RESERVAS");

  // --- cancelar ---
  eq("cancelar en plazo", cancelarReservaFalsa(r.id, "usr-207", ahora).estado, "cancelada");
  eq("el turno vuelve a quedar libre", turnosDelDia("esp-06", f5, ahora).some((t) => t.inicio === libre.inicio), false);
  eq("cancelar dos veces: NO_CANCELABLE", await codigoDeError(() => cancelarReservaFalsa(r.id, "usr-207", ahora)), "NO_CANCELABLE");
  eq("cancelar la de otro usuario", await codigoDeError(() => cancelarReservaFalsa("res-1001", "usr-999", ahora)), "RESERVA_NO_ENCONTRADA");

  // --- fuera de plazo: se reserva a las 14:00 un turno de las 19:00 y se intenta cancelar a las 16:00 ---
  const f6 = fecha(6);
  const catorce = instanteDeTurno(f6, "14:00");
  const dieciseis = instanteDeTurno(f6, "16:00");
  const tarde = crearReservaFalsa({ usuarioId: "usr-207", espacioId: "esp-10", fecha: f6, inicio: "19:00", cantidadPersonas: 2 }, catorce);
  eq("a las 16:00 ya no se cancela solo", await codigoDeError(() => cancelarReservaFalsa(tarde.id, "usr-207", dieciseis)), "FUERA_DE_PLAZO");

  // --- sesión falsa ---
  eq("roles falsos", [sesionFalsa("a@b.com").rol, sesionFalsa("admin@b.com").rol, sesionFalsa("encargado@b.com").rol], ["jugador", "administrador", "encargado"]);

  console.log(fallos === 0 ? "\n🎉 Todo OK" : `\n💥 ${fallos} verificación(es) fallaron`);
  if (fallos > 0) process.exit(1);
})();
