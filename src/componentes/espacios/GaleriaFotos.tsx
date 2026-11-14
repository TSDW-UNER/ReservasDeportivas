
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { descargarImagenesParaOffline } from "../../servicios/media";
import { useColoresProvisorios } from "./temaProvisorio";

interface Props {
  imagenes: string[];
  espacioId: string;
}

/** Carrusel horizontal paginado con almacenamiento local de fotografías. */
export function GaleriaFotos({ imagenes, espacioId }: Props) {
  const colores = useColoresProvisorios();
  const { width } = useWindowDimensions();
  const [actual, setActual] = useState(0);
  const [imagenesVisibles, setImagenesVisibles] = useState(imagenes);

  useEffect(() => {
    let activo = true;

    setActual(0);
    setImagenesVisibles(imagenes);

    if (imagenes.length === 0) return;

    descargarImagenesParaOffline(imagenes, espacioId).then((rutas) => {
      if (activo) {
        setImagenesVisibles(rutas);
      }
    });

    return () => {
      activo = false;
    };
  }, [imagenes, espacioId]);

  return (
    <View>
      <FlatList
        data={imagenesVisibles}
        keyExtractor={(uri, indice) => `${espacioId}-${indice}-${uri}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setActual(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={[
              estilos.foto,
              { width, backgroundColor: colores.secundario },
            ]}
          />
        )}
      />
      {imagenesVisibles.length > 1 && (
        <Text style={estilos.contador}>
          {actual + 1} / {imagenesVisibles.length}
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
