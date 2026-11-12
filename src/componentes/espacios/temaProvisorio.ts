import { useColorScheme } from "react-native";

// PROVISORIO: tokens de color hasta que el tema final llegue a master
// Despues lo reemplazamos por useTema() y se elimina este archivo
const claro = {
  fondo: "#F2F4F7",
  tarjeta: "#FFFFFF",
  texto: "#111827",
  textoSecundario: "#5B6472",
  borde: "#D0D5DD",
  primario: "#0B3A5E",
  textoSobrePrimario: "#FFFFFF",
  secundario: "#E3EEF7",
  error: "#C62828",
};

const oscuro: typeof claro = {
  fondo: "#0F141A",
  tarjeta: "#1A222C",
  texto: "#E6EAF0",
  textoSecundario: "#9AA5B4",
  borde: "#2E3846",
  primario: "#5DB0F0",
  textoSobrePrimario: "#06121C",
  secundario: "#22303F",
  error: "#FF6B6B",
};

export type ColoresProvisorios = typeof claro;

export function useColoresProvisorios(): ColoresProvisorios {
  return useColorScheme() === "dark" ? oscuro : claro;
}
