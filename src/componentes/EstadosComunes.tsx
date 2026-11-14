import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTema } from "../tema/useTema";
import { Boton } from "./Boton";

// Los tres estados que pide el TFI en toda pantalla que lee datos: cargando, vacío y error.
// Usan el tema, así que se leen bien en modo oscuro.

export function EstadoCargando({ mensaje = "Cargando..." }: { mensaje?: string }) {
  const { colores } = useTema();
  return (
    <View style={estilos.contenedor} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colores.acento} />
      <Text style={[estilos.secundario, { color: colores.textoSecundario }]}>{mensaje}</Text>
    </View>
  );
}

interface PropsVacio {
  titulo?: string;
  mensaje?: string;
  icono?: string;
  accion?: { titulo: string; onPress: () => void };
}

export function EstadoVacio({ titulo = "Sin resultados", mensaje = "No hay nada para mostrar por ahora.", icono = "📭", accion }: PropsVacio) {
  const { colores } = useTema();
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.icono}>{icono}</Text>
      <Text style={[estilos.titulo, { color: colores.texto }]}>{titulo}</Text>
      <Text style={[estilos.secundario, { color: colores.textoSecundario }]}>{mensaje}</Text>
      {accion && (
        <View style={estilos.accion}>
          <Boton titulo={accion.titulo} onPress={accion.onPress} />
        </View>
      )}
    </View>
  );
}

export function EstadoError({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  const { colores } = useTema();
  return (
    <View style={estilos.contenedor} accessibilityRole="alert">
      <Text style={estilos.icono}>⚠️</Text>
      <Text style={[estilos.titulo, { color: colores.texto }]}>Ocurrió un problema</Text>
      <Text style={[estilos.secundario, { color: colores.textoSecundario }]}>{mensaje}</Text>
      {onReintentar && (
        <View style={estilos.accion}>
          <Boton titulo="Reintentar" onPress={onReintentar} />
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { padding: 24, alignItems: "center", justifyContent: "center", marginVertical: 20 },
  icono: { fontSize: 40 },
  titulo: { fontSize: 18, fontWeight: "bold", marginTop: 8, textAlign: "center" },
  secundario: { fontSize: 14, textAlign: "center", marginTop: 6 },
  accion: { marginTop: 16, alignSelf: "stretch" },
});
