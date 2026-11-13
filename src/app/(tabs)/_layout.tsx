import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Tabs } from "expo-router";
import { useTema } from "../../tema/useTema";

export default function TabsLayout() {
  const { colores } = useTema();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colores.acento,
        tabBarInactiveTintColor: colores.textoSecundario,
        tabBarStyle: { backgroundColor: colores.superficie, borderTopColor: colores.borde },
        headerStyle: { backgroundColor: colores.superficie },
        headerTintColor: colores.texto,
        headerTitleStyle: { color: colores.texto },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="espacios"
        options={{ title: "Espacios", tabBarIcon: ({ color, size }) => <Ionicons name="football" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="reservas"
        options={{ title: "Mis reservas", tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: "Perfil", tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
