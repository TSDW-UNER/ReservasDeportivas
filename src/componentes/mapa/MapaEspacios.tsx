import { useMemo } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import type { Espacio } from "../../tipos/espacio";
import { useUbicacion } from "../../hooks/useUbicacion";
import { useTema } from "../../tema/useTema";

interface Props {
  espacios: Espacio | Espacio[];
  estatico?: boolean;
  alto?: number;
}

const DELTA_MINIMO = 0.01;

export function MapaEspacios({
  espacios,
  estatico = false,
  alto = 200,
}: Props) {
  const { esOscuro } = useTema();
  const ubicacion = useUbicacion();

  const { lista, region } = useMemo(() => {
    const lista = Array.isArray(espacios) ? espacios : [espacios];

    const latitudes = lista.map((e) => e.coordenadas.latitud);
    const longitudes = lista.map((e) => e.coordenadas.longitud);

    const [minLat, maxLat] = [Math.min(...latitudes), Math.max(...latitudes)];

    const [minLng, maxLng] = [Math.min(...longitudes), Math.max(...longitudes)];

    return {
      lista,
      region: {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max((maxLat - minLat) * 1.5, DELTA_MINIMO),
        longitudeDelta: Math.max((maxLng - minLng) * 1.5, DELTA_MINIMO),
      },
    };
  }, [espacios]);

  return (
    <MapView
      style={[estilos.mapa, { height: alto }]}
      initialRegion={region}
      userInterfaceStyle={esOscuro ? "dark" : "light"}
      showsUserLocation={ubicacion.permisoConcedido}
      showsMyLocationButton={ubicacion.permisoConcedido}
      scrollEnabled={!estatico}
      zoomEnabled={!estatico}
      rotateEnabled={!estatico}
      pitchEnabled={!estatico}
    >
      {lista.map((e) => (
        <Marker
          key={e.id}
          coordinate={{
            latitude: e.coordenadas.latitud,
            longitude: e.coordenadas.longitud,
          }}
          title={e.nombre}
          description={`${e.complejo} · ${e.superficie}`}
        />
      ))}
    </MapView>
  );
}

const estilos = StyleSheet.create({
  mapa: {
    width: "100%",
    borderRadius: 12,
  },
});
