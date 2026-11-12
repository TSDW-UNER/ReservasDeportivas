import { Stack } from "expo-router";
import { useTema } from "../../tema/useTema";

export default function AuthLayout() {
  const { colores } = useTema();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.superficie },
        headerTintColor: colores.texto,
        headerTitleStyle: { color: colores.texto },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colores.fondo },
      }}
    >
      <Stack.Screen name="ingresar" options={{ title: "Iniciar sesión" }} />
      <Stack.Screen name="registrar" options={{ title: "Crear cuenta" }} />
    </Stack>
  );
}