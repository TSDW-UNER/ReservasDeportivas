import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TurnoGrilla } from "../../dominio";
import { useTema } from "../../tema/useTema";
import { formatearPesos } from "../../utils/formato";

interface Props {
  turno: TurnoGrilla;
  seleccionado: boolean;
  onPress: (turno: TurnoGrilla) => void;
}

function FilaTurnoBase({ turno, seleccionado, onPress }: Props) {
  const { colores } = useTema();

  // Cada estado se distingue por TEXTO y color (no solo por color).
  let color: string = colores.exito;
  let etiqueta = `Libre · ${formatearPesos(turno.precio)}`;
  if (turno.estado === "reservado") {
    color = colores.error;
    etiqueta = "Ocupado";
  } else if (turno.estado === "fijo") {
    color = colores.acento;
    etiqueta = `Fijo · ${turno.titularFija ?? "reserva fija"}`;
  } else if (turno.estado === "mantenimiento") {
    color = colores.advertencia;
    etiqueta = `Mantenimiento${turno.motivoBloqueo ? ` · ${turno.motivoBloqueo}` : ""}`;
  } else if (turno.pasado) {
    color = colores.textoSecundario;
    etiqueta = "Ya pasó";
  }

  return (
    <Pressable
      disabled={!turno.reservable}
      onPress={() => onPress(turno)}
      accessibilityRole="button"
      accessibilityLabel={`${turno.inicio} a ${turno.fin}. ${etiqueta}`}
      accessibilityState={{ disabled: !turno.reservable, selected: seleccionado }}
      style={[
        estilos.fila,
        {
          borderColor: seleccionado ? colores.acento : colores.borde,
          backgroundColor: seleccionado ? colores.acento + "1A" : colores.superficie,
          opacity: turno.pasado ? 0.55 : 1,
        },
      ]}
    >
      <Text style={[estilos.hora, { color: colores.texto }]}>{turno.inicio}</Text>
      <View style={[estilos.punto, { backgroundColor: color }]} />
      <Text style={[estilos.etiqueta, { color: turno.reservable ? colores.texto : colores.textoSecundario }]} numberOfLines={1}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}

export const FilaTurno = memo(FilaTurnoBase);

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", minHeight: 52, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1.5, gap: 12 },
  hora: { fontSize: 16, fontWeight: "700", width: 52 },
  punto: { width: 12, height: 12, borderRadius: 6 },
  etiqueta: { flex: 1, fontSize: 15 },
});
