import { Pressable, StyleSheet, Text } from "react-native";
import { esReservaProxima, etiquetaDia, fechaHoraDeReserva } from "../../dominio";
import { useTema } from "../../tema/useTema";
import type { Reserva } from "../../tipos";
import { Insignia } from "../Insignia";

interface Props {
  reserva: Reserva;
  nombreEspacio: string;
  /** Motivo si el turno fue suspendido. */
  suspendida?: string;
  onPress: () => void;
}

export function TarjetaReserva({ reserva, nombreEspacio, suspendida, onPress }: Props) {
  const { colores } = useTema();
  const { fecha, hora, fin } = fechaHoraDeReserva(reserva);

  let texto = "Finalizada";
  let color: string = colores.textoSecundario;
  if (suspendida) {
    texto = "Suspendida";
    color = colores.advertencia;
  } else if (reserva.estado === "cancelada") {
    texto = "Cancelada";
    color = colores.error;
  } else if (reserva.estado === "cumplida") {
    texto = "Cumplida";
    color = colores.exito;
  } else if (reserva.estado === "ausente") {
    texto = "No te presentaste";
    color = colores.advertencia;
  } else if (esReservaProxima(reserva)) {
    texto = "Confirmada";
    color = colores.acento;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${nombreEspacio}, ${etiquetaDia(fecha)} de ${hora} a ${fin}. ${texto}`}
      style={[estilos.tarjeta, { backgroundColor: colores.superficie, borderColor: colores.borde }]}
    >
      <Text style={[estilos.nombre, { color: colores.texto }]}>{nombreEspacio}</Text>
      <Text style={{ color: colores.textoSecundario }}>
        {etiquetaDia(fecha)} · {hora} a {fin} hs
      </Text>
      <Insignia texto={texto} color={color} />
      {suspendida && <Text style={{ color: colores.advertencia, fontSize: 13 }}>Motivo: {suspendida}</Text>}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
  nombre: { fontSize: 17, fontWeight: "700" },
});
