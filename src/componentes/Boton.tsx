import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from "react-native";
import { useTema } from "../tema/useTema";

type Variante = "primario" | "secundario" | "peligro";

interface Props extends Omit<PressableProps, "children" | "style"> {
  titulo: string;
  variante?: Variante;
  cargando?: boolean;
}

export function Boton({
  titulo,
  variante = "primario",
  cargando = false,
  disabled,
  ...resto
}: Props) {
  const { colores } = useTema();
  const inactivo = disabled || cargando;

  // Cada variante define fondo, texto y borde en un solo lugar
  const fondo =
    variante === "primario"
      ? colores.acento
      : variante === "peligro"
        ? colores.error
        : "transparent";
  const texto =
    variante === "secundario" ? colores.acento : colores.textoSobreAcento;
  const borde = variante === "secundario" ? colores.acento : "transparent";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactivo, busy: cargando }}
      disabled={inactivo}
      style={({ pressed }) => [
        estilos.base,
        {
          backgroundColor: fondo,
          borderColor: borde,
          opacity: inactivo ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
      {...resto}
    >
      {cargando ? (
        <ActivityIndicator color={texto} />
      ) : (
        <Text style={[estilos.texto, { color: texto }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  texto: { fontWeight: "bold", fontSize: 16 },
});