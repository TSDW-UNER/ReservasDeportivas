import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTema } from "../tema/useTema";

type Tipo = "error" | "info" | "exito" | "advertencia";

interface Props {
  tipo?: Tipo;
  mensaje: string;
  // Opcional: botón de acción, por ejemplo "Reintentar"
  accion?: { titulo: string; onPress: () => void };
}

export function Aviso({ tipo = "info", mensaje, accion }: Props) {
  const { colores } = useTema();

  const color =
    tipo === "error"
      ? colores.error
      : tipo === "exito"
        ? colores.exito
        : tipo === "advertencia"
          ? colores.advertencia
          : colores.acento;

  return (
    <View
      // "alert" hace que el lector de pantalla lo anuncie apenas aparece
      accessibilityRole="alert"
      style={[
        estilos.caja,
        {
          borderColor: color,
          // color + "1A" = el mismo color con ~10% de opacidad (funciona con hex de 6 dígitos)
          backgroundColor: color + "1A",
        },
      ]}
    >
      <Text style={[estilos.mensaje, { color: colores.texto }]}>{mensaje}</Text>
      {accion && (
        <Pressable
          onPress={accion.onPress}
          accessibilityRole="button"
          style={estilos.accion}
        >
          <Text style={{ color, fontWeight: "bold" }}>{accion.titulo}</Text>
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  mensaje: { fontSize: 14 },
  accion: { marginTop: 8, alignSelf: "flex-start" },
});