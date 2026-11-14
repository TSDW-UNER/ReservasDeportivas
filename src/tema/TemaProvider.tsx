import { useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import {
  guardarTema,
  leerTema,
  type PreferenciaTema,
} from "../almacenamiento/preferencias";
import { coloresClaro, coloresOscuro } from "./colores";
import { TemaContext } from "./useTema";

export function TemaProvider({ children }: { children: ReactNode }) {
  const sistema = useColorScheme(); // "light" | "dark" | null
  const [preferencia, setPref] = useState<PreferenciaTema>(() => leerTema());

  const valor = useMemo(() => {
    const esOscuro =
      preferencia === "oscuro" ||
      (preferencia === "sistema" && sistema === "dark");

    return {
      colores: esOscuro ? coloresOscuro : coloresClaro,
      esOscuro,
      preferencia,
      setPreferencia: (nueva: PreferenciaTema) => {
        setPref(nueva);
        guardarTema(nueva);
      },
    };
  }, [preferencia, sistema]);

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}