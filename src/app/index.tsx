import { Redirect } from "expo-router";
import { useSesion } from "../hooks/useSesion";

export default function Index() {
  const { estado } = useSesion();

  if (estado === "cargando") return null; // el splash sigue visible
  if (estado === "bloqueada") return <Redirect href="/bloqueo" />;
  return <Redirect href={__DEV__ ? "/dev" : "/(tabs)/perfil"} />;
}