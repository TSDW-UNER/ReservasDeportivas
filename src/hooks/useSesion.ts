import { useContext } from "react";
import { SesionContext, type SesionCtx } from "../contextos/SesionContext";

export function useSesion(): SesionCtx {
  const ctx = useContext(SesionContext);
  if (!ctx) {
    throw new Error("useSesion debe usarse dentro de <SesionProvider>");
  }
  return ctx;
}