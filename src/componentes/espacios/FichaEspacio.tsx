
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  esFavorito as consultarFavorito,
  guardarFavorito,
  quitarFavorito,
} from "../../db/baseDatos";
import { MapaEspacios } from "../mapa/MapaEspacios";
import { abrirComoLlegar } from "../mapa/navegacion";
import { BotonPrimario } from "./BotonPrimario";
import type { Espacio } from "./datosFalsos";
import { formatearPrecioPorHora } from "./formato";
import { GaleriaFotos } from "./GaleriaFotos";
import { InsigniasEspacio } from "./InsigniasEspacio";
import { ReproductorEspacio } from "./ReproductorEspacio";
import { useColoresProvisorios } from "./temaProvisorio";

interface Props {
  espacio: Espacio;
}

export function FichaEspacio({ espacio }: Props) {
  const colores = useColoresProvisorios();
  const [esFavorito, setEsFavorito] = useState(false);

  // Recupera el estado guardado al abrir la ficha.
  useEffect(() => {
    setEsFavorito(consultarFavorito(espacio.id));
  }, [espacio.id]);

  const alternarFavorito = () => {
    if (esFavorito) {
      quitarFavorito(espacio.id);
      setEsFavorito(false);
    } else {
      guardarFavorito(espacio.id);
      setEsFavorito(true);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={estilos.contenido}>
      <GaleriaFotos imagenes={espacio.imagenes} />

      <View style={estilos.seccion}>
        <View style={estilos.filaTitulo}>
          <Text style={[estilos.nombre, { color: colores.texto }]}>{espacio.nombre}</Text>
          <Pressable
            onPress={alternarFavorito}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Text style={[estilos.corazon, { color: colores.primario }]}>
              {esFavorito ? "♥" : "♡"}
            </Text>
          </Pressable>
        </View>

        <Text style={{ color: colores.textoSecundario }}>
          {espacio.complejo} · {espacio.superficie} · hasta {espacio.capacidad} personas
        </Text>
        <InsigniasEspacio espacio={espacio} detallado />
        <Text style={[estilos.precio, { color: colores.primario }]}>
          {formatearPrecioPorHora(espacio.precioPorHora)}
        </Text>
        <BotonPrimario
          texto="Ver disponibilidad y reservar"
          alPresionar={() =>
            router.push({
              pathname: "/disponibilidad/[espacioId]",
              params: { espacioId: espacio.id },
            })
          }
        />
      </View>

      <View
        style={[
          estilos.seccion,
          estilos.reglas,
          { backgroundColor: colores.secundario, borderColor: colores.primario },
        ]}
      >
        <Text style={[estilos.subtitulo, { color: colores.texto }]}>Reglas del lugar</Text>
        <Text style={{ color: colores.texto, fontSize: 15 }}>{espacio.reglas}</Text>
      </View>

      <View style={estilos.seccion}>
        <Text style={[estilos.subtitulo, { color: colores.texto }]}>Recorrido en video</Text>
        <ReproductorEspacio videoUrl={espacio.videoUrl} />
      </View>

      <View style={estilos.seccion}>
        <Text style={[estilos.subtitulo, { color: colores.texto }]}>Ubicación</Text>
        <MapaEspacios espacios={espacio} estatico />
        <BotonPrimario
          texto="Cómo llegar"
          alPresionar={() => abrirComoLlegar(espacio.coordenadas)}
        />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { paddingBottom: 32, gap: 16 },
  seccion: { paddingHorizontal: 16, gap: 8 },
  filaTitulo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  nombre: { flex: 1, fontSize: 22, fontWeight: "700" },
  corazon: { fontSize: 30 },
  precio: { fontSize: 20, fontWeight: "700" },
  reglas: {
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  subtitulo: { fontSize: 17, fontWeight: "700" },
});
