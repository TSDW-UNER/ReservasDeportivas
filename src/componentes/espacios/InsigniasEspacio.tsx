import { StyleSheet, Text, View } from "react-native";
import type { Espacio } from "./datosFalsos";
import { useColoresProvisorios } from "./temaProvisorio";

interface Props {
  espacio: Pick<Espacio, "iluminacion" | "techado">;
  /** Etiquetas largas para la ficha ("Con iluminación"), cortas para la tarjeta ("Con luz"). */
  detallado?: boolean;
}

export function InsigniasEspacio({ espacio, detallado = false }: Props) {
  const colores = useColoresProvisorios();
  const insignias = [
    espacio.iluminacion && (detallado ? "Con iluminación" : "Con luz"),
    espacio.techado && "Techado",
  ].filter(Boolean) as string[];

  return (
    <View style={estilos.fila}>
      {insignias.map((texto) => (
        <Text key={texto} style={[estilos.insignia, { backgroundColor: colores.secundario, color: colores.texto }]}>
          {texto}
        </Text>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  insignia: { fontSize: 12, fontWeight: "600", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, overflow: "hidden" },
});
