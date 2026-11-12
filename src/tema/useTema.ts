import { createContext, useContext } from "react";
import type { PreferenciaTema } from "../almacenamiento/preferencias";
import { coloresClaro, type Colores } from "./colores";

export interface TemaCtx {
  colores: Colores;
  esOscuro: boolean;
  preferencia: PreferenciaTema;
  setPreferencia: (valor: PreferenciaTema) => void;
}

export const TemaContext = createContext<TemaCtx>({
  colores: coloresClaro,
  esOscuro: false,
  preferencia: "sistema",
  setPreferencia: () => {},
});

export function useTema(): TemaCtx {
  return useContext(TemaContext);
}