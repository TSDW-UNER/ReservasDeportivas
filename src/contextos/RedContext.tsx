import React, { createContext, useContext, useState, useEffect } from 'react';
import { hayConexionInternet } from '../db/baseDatos';

const RedContext = createContext<boolean>(true);

export function RedProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Chequea la conexión al iniciar usando la función que armamos en la base de datos
    hayConexionInternet().then((estado) => {
      setIsOnline(estado);
    });
  }, []);

  return (
    <RedContext.Provider value={isOnline}>
      {children}
    </RedContext.Provider>
  );
}

export const useRed = () => useContext(RedContext);