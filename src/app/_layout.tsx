import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SesionProvider } from "../contextos/SesionContext";
import { useSesion } from "../hooks/useSesion";
import { TemaProvider } from "../tema/TemaProvider";
import { useTema } from "../tema/useTema";

// El splash queda visible hasta que sepamos si hay sesión guardada
SplashScreen.preventAutoHideAsync();

function Navegacion() {
  const { esOscuro, colores } = useTema();
  const { estado, rol } = useSesion();

  useEffect(() => {
    if (estado !== "cargando") SplashScreen.hideAsync();
  }, [estado]);

  const esGestor = rol === "encargado" || rol === "administrador";

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colores.fondo },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="dev" />

        {/* Público: se puede mirar sin cuenta, pero no con la sesión bloqueada */}
        <Stack.Protected guard={estado !== "bloqueada"}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

        <Stack.Protected guard={estado === "bloqueada"}>
          <Stack.Screen name="bloqueo" />
        </Stack.Protected>

        <Stack.Protected guard={estado === "anonima"}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={estado === "autenticada" && esGestor}>
          <Stack.Screen name="(gestion)/escanear" />
        </Stack.Protected>
      </Stack>
      <StatusBar style={esOscuro ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  return (
    <TemaProvider>
      <SesionProvider>
        <Navegacion />
      </SesionProvider>
    </TemaProvider>
  );
}