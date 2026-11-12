import { useState } from "react";
import { FlatList, Image, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useColoresProvisorios } from "./temaProvisorio";

interface Props {
  imagenes: string[];
}

/** Carrusel horizontal paginado con contador "2 / 5". */
export function GaleriaFotos({ imagenes }: Props) {
  const colores = useColoresProvisorios();
  const { width } = useWindowDimensions();
  const [actual, setActual] = useState(0);

  return (
    <View>
      <FlatList
        data={imagenes}
        keyExtractor={(uri) => uri}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setActual(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={[estilos.foto, { width, backgroundColor: colores.secundario }]} />
        )}
      />
      {imagenes.length > 1 && (
        <Text style={estilos.contador}>
          {actual + 1} / {imagenes.length}
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  foto: { height: 240 },
  contador: {
    position: "absolute",
    right: 12,
    bottom: 12,
    color: "#FFFFFF",
    backgroundColor: "rgba(0,0,0,0.6)",
    fontWeight: "600",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: "hidden",
  },
});
