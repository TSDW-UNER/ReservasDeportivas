import { StyleSheet, Text, View } from "react-native";
import { useTema } from "../tema/useTema";

interface Props {
  texto: string;
  color?: string;
}

export function Insignia({ texto, color }: Props) {
  const { colores } = useTema();
  const c = color ?? colores.acento;

  return (
    <View
      style={[
        estilos.caja,
        { borderColor: c, backgroundColor: c + "26" },
      ]}
    >
      <Text style={[estilos.texto, { color: colores.texto }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  texto: { fontSize: 12, fontWeight: "bold" },
});