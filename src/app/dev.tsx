import { router, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTema } from "../tema/useTema";

interface Ruta {
  titulo: string;
  href: Href;
}

const GRUPOS: { nombre: string; rutas: Ruta[] }[] = [
  {
    nombre: "Acceso",
    rutas: [
      { titulo: "Ingresar", href: "/(auth)/ingresar" },
      { titulo: "Registrar", href: "/(auth)/registrar" },
      { titulo: "Bloqueo (huella)", href: "/bloqueo" },
    ],
  },
  {
    nombre: "Pestañas",
    rutas: [{ titulo: "Perfil", href: "/(tabs)/perfil" }],
  },
  {
    nombre: "Gestión",
    rutas: [{ titulo: "Escanear QR", href: "/(gestion)/escanear" }],
  },
  {
    nombre: "Herramientas",
    rutas: [{ titulo: "Mapa de rutas (_sitemap)", href: "/_sitemap" }],
  },
];

export default function Dev() {
  const { colores } = useTema();

  return (
    <SafeAreaView style={[estilos.flex, { backgroundColor: colores.fondo }]}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text style={[estilos.titulo, { color: colores.texto }]}>
          Navegador de pantallas
        </Text>
        <Text style={{ color: colores.textoSecundario, marginBottom: 16 }}>
          Solo para desarrollo. No se muestra en el build de release.
        </Text>

        {GRUPOS.map((grupo) => (
          <View key={grupo.nombre} style={estilos.grupo}>
            <Text style={[estilos.grupoTitulo, { color: colores.textoSecundario }]}>
              {grupo.nombre.toUpperCase()}
            </Text>
            {grupo.rutas.map((ruta) => (
              <Pressable
                key={ruta.titulo}
                onPress={() => router.push(ruta.href)}
                style={[
                  estilos.fila,
                  { backgroundColor: colores.superficie, borderColor: colores.borde },
                ]}
              >
                <Text style={{ color: colores.texto }}>{ruta.titulo}</Text>
                <Text style={{ color: colores.textoSecundario }}>›</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  contenido: { padding: 16 },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  grupo: { marginBottom: 20 },
  grupoTitulo: { fontSize: 12, marginBottom: 8, letterSpacing: 1 },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 8,
  },
});