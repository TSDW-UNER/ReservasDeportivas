import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useColoresProvisorios } from "./temaProvisorio";

export interface OpcionFiltro {
  id: string | null; // null = "Todos"
  etiqueta: string;
}

interface Props {
  opciones: OpcionFiltro[];
  seleccionado: string | null;
  alSeleccionar: (id: string | null) => void;
}

/** Fila horizontal de chips de selección única. */
export function FiltroChips({ opciones, seleccionado, alSeleccionar }: Props) {
  const colores = useColoresProvisorios();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.fila}>
      {opciones.map(({ id, etiqueta }) => {
        const activo = id === seleccionado;
        return (
          <Pressable
            key={etiqueta}
            onPress={() => alSeleccionar(id)}
            accessibilityRole="button"
            accessibilityState={{ selected: activo }}
            style={[
              estilos.chip,
              { backgroundColor: activo ? colores.primario : colores.tarjeta, borderColor: colores.borde },
            ]}
          >
            <Text style={{ color: activo ? colores.textoSobrePrimario : colores.texto, fontWeight: "600" }}>
              {etiqueta}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fila: { gap: 8, paddingVertical: 4 },
  chip: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
});
