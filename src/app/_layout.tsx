import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TemaProvider } from "../tema/TemaProvider";
import { useTema } from "../tema/useTema";

function Navegacion() {
  const { esOscuro, colores } = useTema();
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colores.fondo },
        }}
      >
        <Stack.Screen name="dev" />
        <Stack.Screen name="index"  />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(gestion)/escanear" />
        <Stack.Screen name="bloqueo" />
      </Stack>
      <StatusBar style={esOscuro ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  return (
    <TemaProvider>
      <Navegacion />
    </TemaProvider>
  );
}