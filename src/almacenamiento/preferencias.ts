import Storage from "expo-sqlite/kv-store";

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