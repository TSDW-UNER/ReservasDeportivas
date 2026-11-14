import { useCallback, useEffect, useState } from "react";
import { ErrorApi } from "../servicios/errorApi";

interface Estado<T> {
  datos: T | null;
  cargando: boolean;
  error: ErrorApi | null;
}

/**
 * Carga datos asíncronos y expone los tres estados que pide el TFI: cargando, error y datos
 * (el "vacío" lo decide la pantalla mirando si `datos` viene sin elementos).
 *
 *   const { datos, cargando, error, recargar } = useCarga(() => listarEspacios(), []);
 */
export function useCarga<T>(cargar: () => Promise<T>, dependencias: unknown[] = []) {
  const [estado, setEstado] = useState<Estado<T>>({ datos: null, cargando: true, error: null });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setEstado((previo) => ({ ...previo, cargando: true, error: null }));

    cargar()
      .then((datos) => vigente && setEstado({ datos, cargando: false, error: null }))
      .catch((e: unknown) => {
        if (!vigente) return;
        const error = e instanceof ErrorApi ? e : new ErrorApi("ERROR_INTERNO", "Algo salió mal. Probá de nuevo.");
        setEstado((previo) => ({ ...previo, cargando: false, error }));
      });

    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intento, ...dependencias]);

  const recargar = useCallback(() => setIntento((n) => n + 1), []);
  return { ...estado, recargar };
}
