export interface Colores {
  fondo: string;
  superficie: string;
  texto: string;
  textoSecundario: string;
  borde: string;
  acento: string;
  textoSobreAcento: string;
  exito: string;
  error: string;
  advertencia: string;
  // estados de la grilla de turnos
  libre: string;
  ocupado: string;
  fijo: string;
  mantenimiento: string;
}

export const coloresClaro: Colores = {
  fondo: "#F2F4F7",
  superficie: "#FFFFFF",
  texto: "#111827",
  textoSecundario: "#5B6472",
  borde: "#D0D5DD",
  acento: "#0B3A5E",
  textoSobreAcento: "#FFFFFF",
  exito: "#1B7F3B",
  error: "#C62828",
  advertencia: "#B26A00",
  libre: "#1B7F3B",
  ocupado: "#C62828",
  fijo: "#5E35B1",
  mantenimiento: "#B26A00",
};

export const coloresOscuro: Colores = {
  fondo: "#0F141A",
  superficie: "#1A222C",
  texto: "#E6EAF0",
  textoSecundario: "#9AA5B4",
  borde: "#2E3846",
  acento: "#5DB0F0",
  textoSobreAcento: "#06121C",
  exito: "#4CC27A",
  error: "#FF6B6B",
  advertencia: "#F2A93B",
  libre: "#4CC27A",
  ocupado: "#FF6B6B",
  fijo: "#B39DDB",
  mantenimiento: "#F2A93B",
};