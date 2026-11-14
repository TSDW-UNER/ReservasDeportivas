/** 12000 -> "$12.000" (sin Intl: Hermes no garantiza el locale es-AR). */
export function formatearPesos(monto: number): string {
  return `$${String(Math.round(monto)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}
