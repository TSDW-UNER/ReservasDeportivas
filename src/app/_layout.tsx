import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { BannerSinConexion } from "../componentes/BannerSinConexion";
import { RedProvider } from "../contextos/RedContext";
import { SesionProvider } from "../contextos/SesionContext";
import { inicializarBaseDatos } from "../db/baseDatos";
import { useSesion } from "../hooks/useSesion";
import { TemaProvider } from "../tema/TemaProvider";
import { useTema } from "../tema/useTema";

// El splash queda visible hasta que sepamos si hay sesión guardada
SplashScreen.preventAutoHideAsync();

// Las tablas tienen que existir antes de que cualquier servicio lea o escriba.
// Es síncrono e idempotente. Si fallara, la app sigue andando sin caché.
try {
  inicializarBaseDatos();
} catch (e) {
  console.warn("No se pudo inicializar SQLite:", e);
}

function Navegacion() {
  const { esOscuro, colores } = useTema();
  const { estado, rol } = useSesion();

  useEffect(() => {
    if (estado !== "cargando") SplashScreen.hideAsync();
  }, [estado]);

  const esGestor = rol === "encargado" || rol === "administrador";

  // Las pantallas apiladas (ficha, disponibilidad, reserva) llevan encabezado con botón "volver"
  const conEncabezado = {
    headerShown: true,
    headerStyle: { backgroundColor: colores.superficie },
    headerTintColor: colores.texto,
    headerTitleStyle: { color: colores.texto },
    headerShadowVisible: false,
  } as const;

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <BannerSinConexion />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colores.fondo },
        }}
      >
        <Stack.Screen name="index" />

        <Stack.Protected guard={estado !== "bloqueada"}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="espacio/[id]" options={{ ...conEncabezado, title: "Espacio" }} />
          <Stack.Screen name="disponibilidad/[espacioId]" options={{ ...conEncabezado, title: "Disponibilidad" }} />
        </Stack.Protected>

        <Stack.Protected guard={estado === "autenticada"}>
          <Stack.Screen name="reserva/[id]" options={{ ...conEncabezado, title: "Mi reserva" }} />
        </Stack.Protected>

        <Stack.Protected guard={estado === "bloqueada"}>
          <Stack.Screen name="bloqueo" />
        </Stack.Protected>

        <Stack.Protected guard={estado === "anonima"}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={estado === "autenticada" && esGestor}>
          <Stack.Screen name="(gestion)/index" />
          <Stack.Screen name="(gestion)/escanear" />
          <Stack.Screen name="(gestion)/ausentes" />
        </Stack.Protected>
      </Stack>
      <StatusBar style={esOscuro ? "light" : "dark"} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <TemaProvider>
      <RedProvider>
        <SesionProvider>
          <Navegacion />
        </SesionProvider>
      </RedProvider>
    </TemaProvider>
  );
}
