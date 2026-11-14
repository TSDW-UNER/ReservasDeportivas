import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { esReservaProxima } from "../dominio";
import { listarEspacios } from "../servicios/espacios";
import { ErrorApi } from "../servicios/errorApi";
import { listarMisReservas } from "../servicios/reservas";
import { revisarSuspensiones, sincronizarRecordatorios } from "../servicios/notificaciones";
import type { Espacio, Reserva } from "../tipos";
import { useSesion } from "./useSesion";

interface Estado {
  reservas: Reserva[];
  espacios: Record<string, Espacio>;
  suspendidas: Record<string, string>; // reservaId -> motivo
  desdeCache: boolean;
  cargando: boolean;
  error: ErrorApi | null;
}

const INICIAL: Estado = { reservas: [], espacios: {}, suspendidas: {}, desdeCache: false, cargando: true, error: null };

/**
 * Mis reservas, siempre al día: se recarga cada vez que la pantalla toma foco.
 * Al cargar con red, también deja los recordatorios al día y avisa las suspensiones.
 */
export function useMisReservas() {
  const { usuario } = useSesion();
  const usuarioId = usuario?.id ?? null;
  const [estado, setEstado] = useState<Estado>(INICIAL);
  const [intento, setIntento] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let vigente = true;
      if (!usuarioId) {
        setEstado({ ...INICIAL, cargando: false });
        return;
      }
      setEstado((previo) => ({ ...previo, cargando: true, error: null }));

      (async () => {
        try {
          const [res, esp] = await Promise.all([
            listarMisReservas(usuarioId),
            listarEspacios().catch(() => null),
          ]);
          const espacios = Object.fromEntries((esp?.datos ?? []).map((e) => [e.id, e]));
          if (!vigente) return;
          setEstado({ reservas: res.datos, espacios, suspendidas: {}, desdeCache: res.desdeCache, cargando: false, error: null });

          if (res.desdeCache) return; // sin red no se puede saber si hubo cambios
          const nombres = Object.fromEntries(Object.values(espacios).map((e) => [e.id, e.nombre]));
          const suspendidas = await revisarSuspensiones(res.datos, nombres);
          await sincronizarRecordatorios(res.datos.filter((r) => !suspendidas[r.id]), nombres);
          if (vigente) setEstado((previo) => ({ ...previo, suspendidas }));
        } catch (e) {
          if (!vigente) return;
          const error = e instanceof ErrorApi ? e : new ErrorApi("ERROR_INTERNO", "Algo salió mal. Probá de nuevo.");
          setEstado((previo) => ({ ...previo, cargando: false, error }));
        }
      })();

      return () => {
        vigente = false;
      };
    }, [usuarioId, intento]),
  );

  const recargar = useCallback(() => setIntento((n) => n + 1), []);
  const proximas = estado.reservas
    .filter((r) => esReservaProxima(r))
    .sort((a, b) => a.cancelableHasta.localeCompare(b.cancelableHasta));
  const pasadas = estado.reservas
    .filter((r) => !esReservaProxima(r))
    .sort((a, b) => b.cancelableHasta.localeCompare(a.cancelableHasta));

  return { ...estado, proximas, pasadas, hayUsuario: usuarioId !== null, recargar };
}
