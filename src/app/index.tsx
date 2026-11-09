import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href={__DEV__ ? "/dev" : "/(tabs)/perfil"} />;
}