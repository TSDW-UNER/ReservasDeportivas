// Un solo interruptor para toda la capa de servicios.
// EXPO_PUBLIC_USAR_MOCK=true  → utiliza datos simulados.
// EXPO_PUBLIC_USAR_MOCK=false → utiliza la API real.
//
// Los endpoints se documentan en cada servicio.
export const USAR_MOCK = process.env.EXPO_PUBLIC_USAR_MOCK !== "false";
