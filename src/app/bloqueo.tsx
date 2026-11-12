import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Aviso } from "../componentes/Aviso";
import { Boton } from "../componentes/Boton";
import { CampoTexto } from "../componentes/CampoTexto";
import { useSesion } from "../hooks/useSesion";
import { biometriaDisponible } from "../servicios/biometria";
import { ErrorApi } from "../servicios/errorApi";
import { useTema } from "../tema/useTema";

export default function Bloqueo() {
  const { colores } = useTema();
  const { usuario, desbloquear, desbloquearConClave, salir } = useSesion();

  const [hayBiometria, setHayBiometria] = useState<boolean | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [usarClave, setUsarClave] = useState(false);
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);

  const entrar = () => router.replace("/(tabs)/perfil");

  const probarBiometria = useCallback(async () => {
    setError(null);
    setVerificando(true);
    const ok = await desbloquear();
    setVerificando(false);
    if (ok) entrar();
    else setError("No pudimos verificar tu identidad. Probá de nuevo o usá tu contraseña.");
  }, [desbloquear]);

  // Al abrir la pantalla: si hay biometría, se pide sola; si no, va directo a la contraseña.
  useEffect(() => {
    let activo = true;
    (async () => {
      const disponible = await biometriaDisponible();
      if (!activo) return;
      setHayBiometria(disponible);
      if (disponible) probarBiometria();
      else setUsarClave(true);
    })();
    return () => {
      activo = false;
    };
  }, [probarBiometria]);

  const confirmarClave = async () => {
    setError(null);
    setVerificando(true);
    try {
      await desbloquearConClave(clave);
      entrar();
    } catch (e) {
      setError(
        e instanceof ErrorApi
          ? e.codigo === "SIN_CONEXION"
            ? "Necesitás conexión para verificar tu contraseña."
            : e.codigo === "CREDENCIALES_INVALIDAS"
              ? "Contraseña incorrecta."
              : e.message
          : "Ocurrió un error. Probá de nuevo.",
      );
    } finally {
      setVerificando(false);
    }
  };

  return (
    <SafeAreaView style={[estilos.flex, { backgroundColor: colores.fondo }]}>
      <View style={estilos.contenido}>
        <Text style={[estilos.titulo, { color: colores.texto }]}>
          Hola, {usuario?.nombre ?? ""}
        </Text>
        <Text style={[estilos.subtitulo, { color: colores.textoSecundario }]}>
          {usarClave
            ? "Ingresá tu contraseña para continuar."
            : "Verificá tu identidad para entrar."}
        </Text>

        {error && <Aviso tipo="error" mensaje={error} />}

        {hayBiometria === false && !error && (
          <Aviso
            tipo="info"
            mensaje="Este dispositivo no tiene huella o rostro registrados. Usá tu contraseña."
          />
        )}

        {usarClave ? (
          <>
            <CampoTexto
              etiqueta="Contraseña"
              esPassword
              value={clave}
              onChangeText={setClave}
              placeholder="Ingrese su contraseña"
            />
            <Boton
              titulo="Continuar"
              cargando={verificando}
              disabled={clave.length < 6}
              onPress={confirmarClave}
            />
            {hayBiometria && (
              <Boton
                titulo="Usar huella o rostro"
                variante="secundario"
                onPress={() => {
                  setUsarClave(false);
                  probarBiometria();
                }}
              />
            )}
          </>
        ) : (
          <>
            <Boton
              titulo="Desbloquear con huella"
              cargando={verificando}
              onPress={probarBiometria}
            />
            <Boton
              titulo="Usar contraseña"
              variante="secundario"
              onPress={() => setUsarClave(true)}
            />
          </>
        )}

        <Boton titulo="Cerrar sesión" variante="peligro" onPress={salir} />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  contenido: { flex: 1, padding: 24, justifyContent: "center", gap: 12 },
  titulo: { fontSize: 24, fontWeight: "bold" },
  subtitulo: { fontSize: 15, marginBottom: 8 },
});