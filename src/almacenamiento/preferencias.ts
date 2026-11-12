import Storage from "expo-sqlite/kv-store";
import { Usuario } from "../tipos/usuario";

const CLAVES = {
  tema: "pref:tema",
} as const;

export type PreferenciaTema = "sistema" | "claro" | "oscuro";

export function leerTema(): PreferenciaTema {
  try {
    const valor = Storage.getItemSync(CLAVES.tema);
    if (valor === "claro" || valor === "oscuro" || valor === "sistema") {
      return valor;
    }
  } catch {
    // si falla la lectura, se usa el valor por defecto
  }
  return "sistema";
}

export function guardarTema(valor: PreferenciaTema): void {
  try {
    Storage.setItemSync(CLAVES.tema, valor);
  } catch {
    // no es crítico: el tema funciona igual en esta sesión
  }
}

const CLAVE_USUARIO = "sesion:usuario";

export function leerUsuario(): Usuario | null {
  try {
    const crudo = Storage.getItemSync(CLAVE_USUARIO);
    return crudo ? (JSON.parse(crudo) as Usuario) : null;
  } catch {
    return null;
  }
}

export function guardarUsuario(usuario: Usuario): void {
  try {
    Storage.setItemSync(CLAVE_USUARIO, JSON.stringify(usuario));
  } catch {
    // no es crítico
  }
}

export function borrarUsuario(): void {
  try {
    Storage.removeItemSync(CLAVE_USUARIO);
  } catch {
    // no es crítico
  }
}