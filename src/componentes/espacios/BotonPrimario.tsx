import { Pressable, StyleSheet, Text } from "react-native";
import { useColoresProvisorios } from "./temaProvisorio";

interface Props {
  texto: string;
  alPresionar: () => void;
}

export function BotonPrimario({ texto, alPresionar }: Props) {
  const colores = useColoresProvisorios();

  return (
    <Pressable
      onPress={alPresionar}
      accessibilityRole="button"
      style={[estilos.boton, { backgroundColor: colores.primario }]}
    >
      <Text style={[estilos.texto, { color: colores.textoSobrePrimario }]}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  texto: { fontSize: 16, fontWeight: "700" },
});
