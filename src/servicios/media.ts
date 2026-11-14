
import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

function obtenerArchivoVideo(espacioId: string): File {
  const carpeta = new Directory(Paths.document, "videos");
  return new File(carpeta, `${espacioId}.mp4`);
}

function obtenerCarpetaImagenes(): Directory {
  return new Directory(Paths.document, "imagenes");
}

function extensionImagen(url: string): string {
  const ruta = url.split("?")[0].toLowerCase();
  const extension = ruta.split(".").pop();

  return extension && ["jpg", "jpeg", "png", "webp"].includes(extension)
    ? extension
    : "jpg";
}

function obtenerArchivoImagen(
  espacioId: string,
  indice: number,
  url: string
): File {
  const carpeta = obtenerCarpetaImagenes();
  const extension = extensionImagen(url);

  return new File(carpeta, `${espacioId}-${indice}.${extension}`);
}

export async function seleccionarImagenGaleria(): Promise<string | null> {
  try {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
    });

    return resultado.canceled ? null : resultado.assets[0].uri;
  } catch {
    return null;
  }
}

/** Devuelve la ruta local de una imagen si ya está descargada. */
export function obtenerImagenOffline(
  espacioId: string,
  indice: number,
  url: string
): string | null {
  try {
    const archivo = obtenerArchivoImagen(espacioId, indice, url);
    return archivo.exists ? archivo.uri : null;
  } catch {
    return null;
  }
}

/** Descarga las imágenes de un espacio para poder verlas sin conexión. */
export async function descargarImagenesParaOffline(
  imagenes: string[],
  espacioId: string
): Promise<string[]> {
  const carpeta = obtenerCarpetaImagenes();

  try {
    carpeta.create({ idempotent: true, intermediates: true });
  } catch {
    return imagenes.map(
      (url, indice) => obtenerImagenOffline(espacioId, indice, url) ?? url
    );
  }

  return Promise.all(
    imagenes.map(async (url, indice) => {
      try {
        const destino = obtenerArchivoImagen(espacioId, indice, url);

        if (destino.exists) return destino.uri;

        const archivo = await File.downloadFileAsync(url, destino);
        return archivo.uri;
      } catch {
        return obtenerImagenOffline(espacioId, indice, url) ?? url;
      }
    })
  );
}

/** Devuelve la ruta local del video si ya está descargado. */
export function obtenerVideoOffline(espacioId: string): string | null {
  try {
    const archivo = obtenerArchivoVideo(espacioId);
    return archivo.exists ? archivo.uri : null;
  } catch {
    return null;
  }
}

/** Descarga el video y devuelve su ruta local. */
export async function descargarVideoParaOffline(
  videoUrl: string,
  espacioId: string
): Promise<string | null> {
  try {
    const carpeta = new Directory(Paths.document, "videos");
    carpeta.create({ idempotent: true, intermediates: true });

    const destino = obtenerArchivoVideo(espacioId);

    if (destino.exists) return destino.uri;

    const archivo = await File.downloadFileAsync(videoUrl, destino);
    return archivo.uri;
  } catch {
    return null;
  }
}
