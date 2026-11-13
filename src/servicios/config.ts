// Un solo interruptor para toda la capa de servicios.
//   EXPO_PUBLIC_USAR_MOCK=true  (por defecto) → datos falsos de src/mocks/
//   EXPO_PUBLIC_USAR_MOCK=false               → API real (src/servicios/http.ts)
//
// Rutas de la API que SUPONEN los servicios (confirmar con la cátedra cuando esté disponible):
//   GET  /espacios                          GET  /deportes
//   GET  /espacios/:id/turnos?fecha=        GET  /espacios/:id/reservas-fijas
//   GET  /reservas/mias                     POST /reservas
//   POST /reservas/:id/cancelar
export const USAR_MOCK = process.env.EXPO_PUBLIC_USAR_MOCK !== "false";
