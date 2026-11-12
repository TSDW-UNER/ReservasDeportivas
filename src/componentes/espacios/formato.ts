export const NOMBRES_DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

/** Inicios de los turnos de una hora: "08:00" ... "23:00" (el último termina a las 24:00). */
export const HORARIOS_TURNO = Array.from({ length: 16 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

/** Los próximos `cantidad` días, con fecha "AAAA-MM-DD" (hora local) y etiqueta "Mar 17/11". */
export function proximosDias(cantidad: number) {
  const hoy = new Date();
  return Array.from({ length: cantidad }, (_, i) => {
    const dia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
    const dd = String(dia.getDate()).padStart(2, "0");
    const mm = String(dia.getMonth() + 1).padStart(2, "0");
    return {
      iso: `${dia.getFullYear()}-${mm}-${dd}`,
      etiqueta: `${NOMBRES_DIA[dia.getDay()].slice(0, 3)} ${dd}/${mm}`,
    };
  });
}

/** 12000 -> "$12.000 / hr" (sin Intl: Hermes no garantiza el locale es-AR). */
export function formatearPrecioPorHora(precio: number): string {
  return `$${String(Math.round(precio)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} / hr`;
}
