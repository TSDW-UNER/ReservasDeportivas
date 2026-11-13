import { useNetworkState } from "expo-network";
import { createContext, useContext, type ReactNode } from "react";

const RedContext = createContext<boolean>(true);

// Estado de la red EN VIVO (no una sola lectura al arrancar): cambia cuando
// se corta o vuelve la conexión. Mientras se desconoce, se asume que hay red.
export function RedProvider({ children }: { children: ReactNode }) {
  const estado = useNetworkState();
  const hayRed = estado.isConnected !== false && estado.isInternetReachable !== false;

  return <RedContext.Provider value={hayRed}>{children}</RedContext.Provider>;
}

export const useRed = () => useContext(RedContext);
