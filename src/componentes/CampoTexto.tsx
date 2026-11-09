import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { useTema } from "../tema/useTema";

interface Props extends TextInputProps {
  etiqueta: string;
  error?: string;
  esPassword?: boolean;
}

export function CampoTexto({ etiqueta, error, esPassword, ...resto }: Props) {
  const { colores } = useTema();
  const [visible, setVisible] = useState(false);

  return (
    <View style={estilos.campo}>
      <Text style={[estilos.etiqueta, { color: colores.texto }]}>
        {etiqueta}
      </Text>

      <View
        style={[
          estilos.fila,
          {
            borderColor: error ? colores.error : colores.borde,
            backgroundColor: colores.superficie,
          },
        ]}
      >
        <TextInput
          style={[estilos.input, { color: colores.texto }]}
          placeholderTextColor={colores.textoSecundario}
          accessibilityLabel={etiqueta}
          secureTextEntry={esPassword && !visible}
          autoCapitalize={esPassword ? "none" : resto.autoCapitalize}
          {...resto}
        />
        {esPassword && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={
              visible ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            style={estilos.mostrar}
          >
            <Text style={{ color: colores.acento, fontWeight: "bold" }}>
              {visible ? "Ocultar" : "Mostrar"}
            </Text>
          </Pressable>
        )}
      </View>

      {error ? (
        <Text style={[estilos.error, { color: colores.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { marginBottom: 16 },
  etiqueta: { fontSize: 14, marginBottom: 4 },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 6,
  },
  input: { flex: 1, padding: 12, fontSize: 16 },
  mostrar: { paddingHorizontal: 12, paddingVertical: 12 },
  error: { marginTop: 4, fontSize: 13 },
});