// Verifica los helpers de reserva y el caso "turno suspendido". Uso: npm run verificar
import { esReservaProxima, etiquetaFechaCorta, fechaHoraDeReserva, idTurnoGenerado, inicioDeReserva, momentoDelRecordatorio, aIsoAR } from "../src/dominio";
import { opcionesMock, reiniciarServidorFalso, reservasDe, turnosDelDia } from "../src/mocks/servidorFalso";
import type { Reserva } from "../src/tipos";

let fallos = 0;
function eq(nombre: string, real: unknown, esperado: unknown) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) fallos++;
  console.log(`${ok ? "✅" : "❌"} ${nombre}${ok ? "" : `\n     real: ${JSON.stringify(real)}\n     esperado: ${JSON.stringify(esperado)}`}`);
}

const res = (extra: Partial<Reserva> = {}): Reserva => ({
  id: "res-1180", turnoId: "tur-0219-19", espacioId: "esp-02", usuarioId: "usr-207", cantidadPersonas: 10,
  codigoQr: "VGY-1180-0219-19", estado: "confirmada", ingresoEn: null,
  creadaEn: "2026-09-16T21:04:00-03:00", cancelableHasta: "2026-09-19T15:00:00-03:00", ...extra,
});

eq("inicio de la reserva del PRD = 19:00", aIsoAR(inicioDeReserva(res())), "2026-09-19T19:00:00-03:00");
eq("fecha, hora y fin del turno", fechaHoraDeReserva(res()), { fecha: "2026-09-19", hora: "19:00", fin: "20:00" });
eq("turno de las 23:00 termina a las 24:00", fechaHoraDeReserva(res({ cancelableHasta: "2026-09-19T19:00:00-03:00" })).fin, "24:00");
eq("turno de las 08:00 (cancelable el día anterior)", fechaHoraDeReserva(res({ cancelableHasta: "2026-09-19T04:00:00-03:00" })), { fecha: "2026-09-19", hora: "08:00", fin: "09:00" });
eq("el recordatorio suena 2 horas antes (17:00)", aIsoAR(momentoDelRecordatorio(res())), "2026-09-19T17:00:00-03:00");
eq("próxima: confirmada y no empezó", esReservaProxima(res(), new Date("2026-09-19T18:00:00-03:00")), true);
eq("no próxima: ya empezó", esReservaProxima(res(), new Date("2026-09-19T19:30:00-03:00")), false);
eq("no próxima: cancelada", esReservaProxima(res({ estado: "cancelada" }), new Date("2026-09-10T10:00:00-03:00")), false);
eq("etiqueta corta de fecha", etiquetaFechaCorta("2026-09-19"), "19/09");

// El caso feo: la reserva de demo cae justo en el turno que el servidor bloquea
reiniciarServidorFalso();
opcionesMock.latenciaMs = 0;
const suspendida = reservasDe("usr-207").find((r) => r.id === "res-1002")!;
const { fecha, hora } = fechaHoraDeReserva(suspendida);
eq("la reserva de demo es de la Cancha 2 a las 20:00", [suspendida.espacioId, hora], ["esp-02", "20:00"]);
const turno = turnosDelDia("esp-02", fecha).find((t) => t.inicio === hora);
eq("su turno está en mantenimiento (se detecta la suspensión)", [turno?.estado, turno?.motivoBloqueo], ["mantenimiento", "Reparación de la iluminación"]);
eq("el id del turno coincide con el de la reserva", suspendida.turnoId, idTurnoGenerado("esp-02", fecha, hora));

console.log(fallos === 0 ? "\n🎉 Todo OK" : `\n💥 ${fallos} verificación(es) fallaron`);
if (fallos > 0) process.exit(1);
