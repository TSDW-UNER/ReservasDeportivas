import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { useColoresProvisorios } from "./temaProvisorio";

/** TextInput con los colores del tema (claro/oscuro). */
export function CampoTexto({ style, ...props }: TextInputProps) {
  const colores = useColoresProvisorios();

  return (
    <TextInput
      placeholderTextColor={colores.textoSecundario}
      style={[estilos.campo, { backgroundColor: colores.tarjeta, borderColor: colores.borde, color: colores.texto }, style]}
      {...props}
    />
  );
}

const estilos = StyleSheet.create({
  campo: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16 },
});
