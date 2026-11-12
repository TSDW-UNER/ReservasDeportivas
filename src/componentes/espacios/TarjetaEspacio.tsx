import { memo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { Espacio } from "./datosFalsos";
import { formatearPrecioPorHora } from "./formato";
import { InsigniasEspacio } from "./InsigniasEspacio";
import { useColoresProvisorios } from "./temaProvisorio";

interface Props {
  espacio: Espacio;
}

function TarjetaEspacioBase({ espacio }: Props) {
  const colores = useColoresProvisorios();

  return (
    <View style={[estilos.tarjeta, { backgroundColor: colores.tarjeta, borderColor: colores.borde }]}>
      <Image
        source={{ uri: espacio.imagenes[0] }}
        style={[estilos.foto, { backgroundColor: colores.secundario }]}
        accessibilityLabel={`Foto de ${espacio.nombre}`}
      />
      <View style={estilos.cuerpo}>
        <Text style={[estilos.nombre, { color: colores.texto }]}>{espacio.nombre}</Text>
        <Text style={{ color: colores.textoSecundario }}>
          {espacio.complejo} · {espacio.superficie}
        </Text>
        <View style={estilos.pie}>
          <InsigniasEspacio espacio={espacio} />
          <Text style={[estilos.precio, { color: colores.primario }]}>
            {formatearPrecioPorHora(espacio.precioPorHora)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export const TarjetaEspacio = memo(TarjetaEspacioBase);

const estilos = StyleSheet.create({
  tarjeta: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  foto: { width: "100%", height: 150 },
  cuerpo: { padding: 12, gap: 4 },
  nombre: { fontSize: 17, fontWeight: "700" },
  pie: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
  precio: { fontSize: 16, fontWeight: "700" },
});
