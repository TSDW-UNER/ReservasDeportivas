import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Tabs } from "expo-router";

import { useSesion } from "../../hooks/useSesion";
import { useTema } from "../../tema/useTema";

export default function TabsLayout() {
  const { colores } = useTema();
  const { rol } = useSesion();

  const esGestor = rol === "encargado" || rol === "administrador";

  return (
    <Tabs
      screenOptions={{
        sceneStyle: { backgroundColor: colores.fondo },
        tabBarActiveTintColor: colores.acento,
        tabBarInactiveTintColor: colores.textoSecundario,
        tabBarStyle: {
          backgroundColor: colores.superficie,
          borderTopColor: colores.borde,
        },
        headerStyle: { backgroundColor: colores.superficie },
        headerTintColor: colores.texto,
        headerTitleStyle: { color: colores.texto },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="espacios"
        options={{
          title: "Espacios",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="football" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="reservas"
        options={{
          title: "Mis reservas",
          href: esGestor ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="gestion"
        options={{
          title: "Gestión",
          href: esGestor ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
