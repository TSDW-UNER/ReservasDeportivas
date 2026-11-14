
import { useState } from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  descargarVideoParaOffline,
  obtenerVideoOffline,
} from "../../servicios/media";
import { useColoresProvisorios } from "./temaProvisorio";

interface Props {
  videoUrl: string | null;
  espacioId: string;
}

/** Reproduce el video online o desde una copia local. */
export function ReproductorEspacio({ videoUrl, espacioId }: Props) {
  return videoUrl ? (
    <Video key={espacioId} url={videoUrl} espacioId={espacioId} />
  ) : (
    <SinVideo />
  );
}

function Video({ url, espacioId }: { url: string; espacioId: string }) {
  const colores = useColoresProvisorios();
  const [videoLocal, setVideoLocal] = useState(
    () => obtenerVideoOffline(espacioId)
  );
  const [descargando, setDescargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const player = useVideoPlayer(videoLocal ?? url);

  async function descargar() {
    setDescargando(true);
    setMensaje("");

    const ruta = await descargarVideoParaOffline(url, espacioId);

    if (ruta) {
      player.replace(ruta);
      setVideoLocal(ruta);
      setMensaje("Video guardado para ver sin conexión.");
    } else {
      setMensaje("No se pudo descargar el video. Revisá tu conexión.");
    }

    setDescargando(false);
  }

  return (
    <View style={estilos.contenedor}>
      <VideoView
        player={player}
        nativeControls
        contentFit="contain"
        style={estilos.video}
      />

      {videoLocal ? (
        <Text style={[estilos.estado, { color: colores.textoSecundario }]}>
          <Text>✓ </Text>Video disponible sin conexión
        </Text>
      ) : (
        <Pressable
          onPress={descargar}
          disabled={descargando}
          style={[
            estilos.boton,
            { backgroundColor: colores.primario },
            descargando && estilos.botonDeshabilitado,
          ]}
        >
          <Text style={estilos.textoBoton}>
            {descargando ? "Descargando video..." : "Descargar para ver sin conexión"}
          </Text>
        </Pressable>
      )}

      {mensaje ? (
        <Text style={[estilos.estado, { color: colores.textoSecundario }]}>
          {mensaje}
        </Text>
      ) : null}
    </View>
  );
}

function SinVideo() {
  const colores = useColoresProvisorios();

  return (
    <View
      style={[
        estilos.video,
        estilos.sinVideo,
        {
          backgroundColor: colores.secundario,
          borderColor: colores.borde,
        },
      ]}
    >
      <Text style={estilos.icono}>🎥</Text>
      <Text style={[estilos.mensaje, { color: colores.textoSecundario }]}>
        Este espacio no cuenta con video de recorrido
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: 8,
  },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: "#000000",
  },
  sinVideo: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 16,
  },
  icono: {
    fontSize: 32,
  },
  mensaje: {
    textAlign: "center",
    fontSize: 15,
  },
  boton: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
  },
  estado: {
    fontSize: 13,
  },
});
