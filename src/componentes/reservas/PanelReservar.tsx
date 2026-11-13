import { Pressable, StyleSheet, Text, View } from "react-native";
import { etiquetaDia } from "../../dominio";
import type { TurnoGrilla } from "../../dominio";
import { useTema } from "../../tema/useTema";
import type { Espacio } from "../../tipos";
import { formatearPesos } from "../../utils/formato";
import { Boton } from "../Boton";

interface Props {
  turno: TurnoGrilla;
  espacio: Espacio;
  nombreDeporte: string | null;
  cantidad: number;
  onCantidad: (n: number) => void;
  onReservar: () => void;
  cargando: boolean;
}

// Barra inferior: tocás un turno libre (1er toque) y "Reservar" (2º toque).
export function PanelReservar({ turno, espacio, nombreDeporte, cantidad, onCantidad, onReservar, cargando }: Props) {
  const { colores } = useTema();
  const maximo = Math.max(espacio.capacidad, 1) * 2;

  return (
    <View style={[estilos.panel, { backgroundColor: colores.superficie, borderColor: colores.borde }]}>
      <Text style={[estilos.resumen, { color: colores.texto }]}>
        {etiquetaDia(turno.fecha)} · {turno.inicio} a {turno.fin} hs
      </Text>
      <Text style={{ color: colores.textoSecundario }}>
        {nombreDeporte ? `${nombreDeporte} · ` : ""}{formatearPesos(turno.precio)} · se paga en el lugar
      </Text>

      <View style={estilos.filaCantidad}>
        <Text style={{ color: colores.texto, fontWeight: "600" }}>¿Cuántos van a ser?</Text>
        <View style={estilos.contador}>
          <Pressable
            onPress={() => onCantidad(Math.max(1, cantidad - 1))}
            accessibilityRole="button"
            accessibilityLabel="Una persona menos"
            style={[estilos.paso, { borderColor: colores.borde }]}
          >
            <Text style={[estilos.pasoTexto, { color: colores.texto }]}>−</Text>
          </Pressable>
          <Text style={[estilos.cantidad, { color: colores.texto }]} accessibilityLiveRegion="polite">{cantidad}</Text>
          <Pressable
            onPress={() => onCantidad(Math.min(maximo, cantidad + 1))}
            accessibilityRole="button"
            accessibilityLabel="Una persona más"
            style={[estilos.paso, { borderColor: colores.borde }]}
          >
            <Text style={[estilos.pasoTexto, { color: colores.texto }]}>+</Text>
          </Pressable>
        </View>
      </View>

      <Boton titulo="Reservar" onPress={onReservar} cargando={cargando} />
    </View>
  );
}

const estilos = StyleSheet.create({
  panel: { borderTopWidth: 1, padding: 16, gap: 8 },
  resumen: { fontSize: 16, fontWeight: "700" },
  filaCantidad: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 6 },
  contador: { flexDirection: "row", alignItems: "center", gap: 14 },
  paso: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  pasoTexto: { fontSize: 22, fontWeight: "600" },
  cantidad: { fontSize: 20, fontWeight: "700", minWidth: 28, textAlign: "center" },
});
