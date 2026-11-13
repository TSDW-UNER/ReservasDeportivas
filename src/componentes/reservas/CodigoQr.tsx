import { StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

// Fondo blanco SIEMPRE (también en modo oscuro): un QR claro sobre oscuro no lo lee la cámara.
export function CodigoQr({ valor, tamano = 240 }: { valor: string; tamano?: number }) {
  return (
    <View style={estilos.marco} accessible accessibilityLabel={`Código QR de ingreso ${valor}`}>
      <QRCode value={valor} size={tamano} color="#000000" backgroundColor="#FFFFFF" />
    </View>
  );
}

const estilos = StyleSheet.create({
  marco: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 12, alignSelf: "center" },
});
