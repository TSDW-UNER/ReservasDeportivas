import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  borrarUsuario,
  guardarUsuario,
  leerUsuario,
} from "../almacenamiento/preferencias";
import {
  borrarToken,
  guardarToken,
  leerToken,
} from "../almacenamiento/tokenSeguro";
import { ingresarApi, obtenerPerfil, registrarApi } from "../servicios/auth";
import { ErrorApi } from "../servicios/errorApi";
import type { DatosRegistro, Rol, Usuario } from "../tipos/usuario";

export type EstadoSesion = "cargando" | "bloqueada" | "autenticada" | "anonima";

export interface SesionCtx {
  estado: EstadoSesion;
  usuario: Usuario | null;
  token: string | null;
  rol: Rol | null;
  ingresar(email: string, clave: string): Promise<void>;
  registrar(datos: DatosRegistro): Promise<void>;
  salir(): Promise<void>;
}

export const SesionContext = createContext<SesionCtx | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoSesion>("cargando");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Al abrir la app: ¿hay token guardado? Si lo hay, se valida.
  useEffect(() => {
    let cancelado = false;

    async function restaurar() {
      try {
        const guardado = await leerToken();
        if (!guardado) {
          if (!cancelado) setEstado("anonima");
          return;
        }

        let perfil: Usuario | null = null;
        try {
          perfil = await obtenerPerfil(guardado);
          guardarUsuario(perfil);
        } catch (e) {
          if (e instanceof ErrorApi && e.codigo === "TOKEN_INVALIDO") {
            // token vencido o inválido: se descarta
            await borrarToken();
            borrarUsuario();
            if (!cancelado) setEstado("anonima");
            return;
          }
          // sin red u otro error: se usa el usuario cacheado (modo sin conexión)
          perfil = leerUsuario();
        }

        if (cancelado) return;
        if (!perfil) {
          setEstado("anonima");
          return;
        }
        setUsuario(perfil);
        setToken(guardado);
        // TODO (biometría): acá pasará a "bloqueada" en vez de "autenticada"
        setEstado("autenticada");
      } catch {
        if (!cancelado) setEstado("anonima");
      }
    }

    restaurar();
    return () => {
      cancelado = true;
    };
  }, []);

  const iniciar = useCallback(async (u: Usuario, t: string) => {
    await guardarToken(t); // SecureStore
    guardarUsuario(u); // kv-store
    setUsuario(u);
    setToken(t);
    setEstado("autenticada");
  }, []);

  const ingresar = useCallback(
    async (email: string, clave: string) => {
      const sesion = await ingresarApi(email, clave);
      await iniciar(sesion.usuario, sesion.token);
    },
    [iniciar],
  );

  const registrar = useCallback(
    async (datos: DatosRegistro) => {
      const sesion = await registrarApi(datos);
      await iniciar(sesion.usuario, sesion.token); // entra directo, sin volver a loguearse
    },
    [iniciar],
  );

  const salir = useCallback(async () => {
    await borrarToken();
    borrarUsuario();
    setUsuario(null);
    setToken(null);
    setEstado("anonima");
  }, []);

  const valor = useMemo<SesionCtx>(
    () => ({
      estado,
      usuario,
      token,
      rol: usuario?.rol ?? null,
      ingresar,
      registrar,
      salir,
    }),
    [estado, usuario, token, ingresar, registrar, salir],
  );

  return (
    <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
  );
}