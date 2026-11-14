
import { Alert, Linking, Platform } from "react-native";
import type { Coordenadas } from "../../tipos/espacio";

export async function abrirComoLlegar({
  latitud,
  longitud,
}: Coordenadas): Promise<void> {
  const destino = `${latitud},${longitud}`;

  const url =
    Platform.OS === "ios"
      ? `https://maps.apple.com/?daddr=${destino}`
      : `https://www.google.com/maps/dir/?api=1&destination=${destino}`;

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      "No pudimos abrir el mapa",
      "Revisá que tengas una aplicación de mapas disponible."
    );
  }
}
