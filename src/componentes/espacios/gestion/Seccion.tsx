import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColoresProvisorios } from "../temaProvisorio";

interface Props {
  titulo: string;
  children: ReactNode;
}

/** Tarjeta con título para agrupar un bloque del panel de gestión. */
export function Seccion({ titulo, children }: Props) {
  const colores = useColoresProvisorios();

  return (
    <View style={[estilos.seccion, { backgroundColor: colores.tarjeta, borderColor: colores.borde }]}>
      <Text style={[estilos.titulo, { color: colores.texto }]}>{titulo}</Text>
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  seccion: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
  titulo: { fontSize: 17, fontWeight: "700" },
});
