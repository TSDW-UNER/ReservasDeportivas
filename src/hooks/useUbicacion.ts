
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import type { Coordenadas } from "../tipos/espacio";

export const COORDENADAS_POLIDEPORTIVO: Coordenadas = {
  latitud: -31.8642,
  longitud: -59.0281,
};

interface EstadoUbicacion {
  coordenadas: Coordenadas;
  permisoConcedido: boolean;
  cargando: boolean;
}

export function useUbicacion(): EstadoUbicacion {
  const [estado, setEstado] = useState<EstadoUbicacion>({
    coordenadas: COORDENADAS_POLIDEPORTIVO,
    permisoConcedido: false,
    cargando: true,
  });

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const permiso = await Location.requestForegroundPermissionsAsync();

        if (!permiso.granted) {
          throw new Error("Permiso de ubicación no concedido");
        }

        const ubicacion = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (activo) {
          setEstado({
            coordenadas: {
              latitud: ubicacion.coords.latitude,
              longitud: ubicacion.coords.longitude,
            },
            permisoConcedido: true,
            cargando: false,
          });
        }
      } catch {
        if (activo) {
          setEstado({
            coordenadas: COORDENADAS_POLIDEPORTIVO,
            permisoConcedido: false,
            cargando: false,
          });
        }
      }
    })();

    return () => {
      activo = false;
    };
  }, []);

  return estado;
}
