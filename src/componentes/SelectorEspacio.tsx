import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTema } from "../tema/useTema";
import type { Espacio } from "../tipos/espacio";

interface Props {
  espacios: Espacio[];
  seleccionado: string | null;
  onElegir: (id: string) => void;
}

export function SelectorEspacio({ espacios, seleccionado, onElegir }: Props) {
  const { colores } = useTema();
  return (
    <View style={estilos.fila}>
      {espacios.map((e) => {
        const activo = seleccionado === e.id;
        return (
          <Pressable
            key={e.id}
            onPress={() => onElegir(e.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: activo }}
            style={[
              estilos.chip,
              {
                borderColor: activo ? colores.acento : colores.borde,
                backgroundColor: activo ? colores.acento : colores.superficie,
              },
            ]}
          >
            <Text style={{ color: activo ? colores.textoSobreAcento : colores.texto, fontSize: 13 }}>
              {e.nombre}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
});