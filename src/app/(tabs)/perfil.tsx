import { router } from "expo-router";
import { ScrollView, Text, View, Pressable } from "react-native";
import { Boton } from "../../componentes/Boton";
import { useSesion } from "../../hooks/useSesion";
import { useTema } from "../../tema/useTema";

export default function Perfil() {
  const { colores, preferencia, setPreferencia } = useTema();
  const { estado, usuario, salir } = useSesion();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colores.fondo }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
    >
      {estado === "cargando" && (
        <Text style={{ color: colores.textoSecundario }}>Cargando sesión…</Text>
      )}

      {estado === "anonima" && (
        <>
          <Text style={{ color: colores.texto, fontSize: 18 }}>
            Ingresá para reservar y ver tus reservas
          </Text>
          <Boton titulo="Iniciar sesión" onPress={() => router.push("/(auth)/ingresar")} />
          <Boton titulo="Crear cuenta" variante="secundario" onPress={() => router.push("/(auth)/registrar")} />
        </>
      )}

      {usuario && (
        <View style={{ gap: 4 }}>
          <Text style={{ color: colores.texto, fontSize: 20, fontWeight: "bold" }}>
            {usuario.nombre}
          </Text>
          <Text style={{ color: colores.textoSecundario }}>{usuario.email}</Text>
          <Text style={{ color: colores.textoSecundario }}>{usuario.telefono}</Text>
          <Text style={{ color: colores.acento }}>Rol: {usuario.rol}</Text>
          <Text style={{ color: colores.texto }}>
            Cancelaciones tardías: {usuario.cancelacionesTardias}
          </Text>
          <Text style={{ color: colores.texto }}>Ausencias: {usuario.ausencias}</Text>
        </View>
      )}

      <Text style={{ color: colores.texto, fontSize: 16, marginTop: 12 }}>
        Tema: {preferencia}
      </Text>
      {(["sistema", "claro", "oscuro"] as const).map((op) => (
        <Pressable key={op} onPress={() => setPreferencia(op)}>
          <Text style={{ color: colores.acento }}>{op}</Text>
        </Pressable>
      ))}

      {usuario && (
        <Boton titulo="Cerrar sesión" variante="peligro" onPress={salir} />
      )}
    </ScrollView>
  );
}