import { useTema } from "../../tema/useTema";

// Adaptador: las pantallas de espacios y gestión siguen usando estos nombres de color,
// pero ahora salen del tema de la app (useTema), así respetan la preferencia elegida
// en Perfil (claro / oscuro / sistema) y no solo la del teléfono.
const SECUNDARIO_CLARO = "#E3EEF7";
const SECUNDARIO_OSCURO = "#22303F";

export interface ColoresProvisorios {
  fondo: string;
  tarjeta: string;
  texto: string;
  textoSecundario: string;
  borde: string;
  primario: string;
  textoSobrePrimario: string;
  secundario: string;
  error: string;
}

export function useColoresProvisorios(): ColoresProvisorios {
  const { colores, esOscuro } = useTema();

  return {
    fondo: colores.fondo,
    tarjeta: colores.superficie,
    texto: colores.texto,
    textoSecundario: colores.textoSecundario,
    borde: colores.borde,
    primario: colores.acento,
    textoSobrePrimario: colores.textoSobreAcento,
    secundario: esOscuro ? SECUNDARIO_OSCURO : SECUNDARIO_CLARO,
    error: colores.error,
  };
}