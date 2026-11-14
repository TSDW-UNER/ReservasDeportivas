import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { etiquetaDiaCorta, hoyAR } from "../../dominio";
import { useTema } from "../../tema/useTema";

interface Props {
  dias: string[]; // "AAAA-MM-DD"
  seleccionado: string;
  onSeleccionar: (fecha: string) => void;
}

// Los próximos 7 días, en pestañas deslizables. Hoy se marca como "Hoy".
export function SelectorDia({ dias, seleccionado, onSeleccionar }: Props) {
  const { colores } = useTema();
  const hoy = hoyAR();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={estilos.fila}
    >
      {dias.map((fecha) => {
        const activo = fecha === seleccionado;
        return (
          <Pressable
            key={fecha}
            onPress={() => onSeleccionar(fecha)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activo }}
            style={[
              estilos.dia,
              {
                backgroundColor: activo ? colores.acento : colores.superficie,
                borderColor: activo ? colores.acento : colores.borde,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={{
                color: activo ? colores.textoSobreAcento : colores.texto,
                fontWeight: "700",
              }}
            >
              {fecha === hoy ? "Hoy" : etiquetaDiaCorta(fecha)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fila: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: "center",
  },
  dia: {
    width: 76,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
