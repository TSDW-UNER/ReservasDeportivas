// @ts-ignore
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { espaciosFalsos } from "../../componentes/espacios/datosFalsos";
import { FichaEspacio } from "../../componentes/espacios/FichaEspacio";
import { useColoresProvisorios } from "../../componentes/espacios/temaProvisorio";

export default function EspacioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colores = useColoresProvisorios();
  const espacio = espaciosFalsos.find((e) => e.id === id);

  if (!espacio) {
    return (
      <View style={[estilos.centrado, { backgroundColor: colores.fondo }]}>
        <Text style={{ color: colores.textoSecundario, fontSize: 16 }}>No encontramos este espacio.</Text>
      </View>
    );
  }

  return <FichaEspacio espacio={espacio} />;
}

const estilos = StyleSheet.create({
  centrado: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
});
