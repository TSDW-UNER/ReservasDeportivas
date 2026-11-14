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
import { borrarDatosLocales } from "../db/baseDatos";
import {
  borrarToken,
  guardarToken,
  leerToken,
} from "../almacenamiento/tokenSeguro";
import { ingresarApi, obtenerPerfil, registrarApi } from "../servicios/auth";
import { ErrorApi } from "../servicios/errorApi";
import type { DatosRegistro, Rol, Usuario } from "../tipos/usuario";
import { pedirBiometria } from "../servicios/biometria";

export type EstadoSesion = "cargando" | "bloqueada" | "autenticada" | "anonima";

export interface SesionCtx {
  estado: EstadoSesion;
  usuario: Usuario | null;
  token: string | null;
  rol: Rol | null;
  ingresar(email: string, clave: string): Promise<void>;
  registrar(datos: DatosRegistro): Promise<void>;
  desbloquear(): Promise<boolean>;
  desbloquearConClave(clave: string): Promise<void>;
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
          if (e instanceof ErrorApi && e.codigo === "NO_AUTENTICADO") {
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
        // hay sesión guardada: se pide huella antes de dejar entrar
        setEstado("bloqueada");
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

   // Huella o rostro. Devuelve true si desbloqueó.
  const desbloquear = useCallback(async () => {
    const ok = await pedirBiometria("Desbloqueá tu sesión");
    if (ok) setEstado("autenticada");
    return ok;
  }, []);

  // Alternativa para dispositivos sin biometría: se vuelve a validar la contraseña.
  const desbloquearConClave = useCallback(
    async (clave: string) => {
      if (!usuario) throw new ErrorApi("SIN_SESION", "No hay sesión guardada.");
      const sesion = await ingresarApi(usuario.email, clave);
      await iniciar(sesion.usuario, sesion.token);
    },
    [usuario, iniciar],
  );

  const salir = useCallback(async () => {
    await borrarToken();
    borrarUsuario();
    borrarDatosLocales(); // no dejar reservas ni QR de esta persona en el teléfono
    setUsuario(null);
    setToken(null);
    setEstado("anonima");
  }, []);

  const valor = useMemo<SesionCtx>(
    () => ({
      estado, usuario, token,
      rol: usuario?.rol ?? null,
      ingresar, registrar, salir, desbloquear, desbloquearConClave,
    }),
    [estado, usuario, token, ingresar, registrar, salir, desbloquear, desbloquearConClave],

  );
  return (
    <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
  );
}