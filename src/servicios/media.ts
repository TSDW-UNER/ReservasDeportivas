import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

export async function seleccionarImagenGaleria(): Promise<string | null> {
  try {
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", quality: 0.8 });
    return resultado.canceled ? null : resultado.assets[0].uri;
  } catch {
    return null;
  }
}

export async function descargarVideoParaOffline(videoUrl: string, espacioId: string): Promise<string | null> {
  try {
    const carpeta = new Directory(Paths.document, "videos");
    carpeta.create({ idempotent: true, intermediates: true });

    const destino = new File(carpeta, `${espacioId}.mp4`);
    if (destino.exists) return destino.uri;

    const archivo = await File.downloadFileAsync(videoUrl, destino);
    return archivo.uri;
  } catch {
    return null;
  }
}
