import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRed } from "../contextos/RedContext";
import { useTema } from "../tema/useTema";

// Aviso del estado de la red (requisito 7 del TFI). Solo aparece cuando NO hay conexión.
export function BannerSinConexion() {
  const hayRed = useRed();
  const { colores, esOscuro } = useTema();
  const margen = useSafeAreaInsets();

  if (hayRed) return null;

  return (
    <View
      accessibilityRole="alert"
      style={[estilos.banner, { backgroundColor: colores.advertencia, paddingTop: margen.top + 4 }]}
    >
      <Text style={[estilos.texto, { color: esOscuro ? "#06121C" : "#FFFFFF" }]}>
        Sin conexión · mostrando datos guardados
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  banner: { paddingBottom: 6, paddingHorizontal: 12, alignItems: "center" },
  texto: { fontSize: 13, fontWeight: "600" },
});
