import { useVideoPlayer, VideoView } from "expo-video";
import { StyleSheet, Text, View } from "react-native";
import { useColoresProvisorios } from "./temaProvisorio";

interface Props {
  videoUrl: string | null;
}

/** Recorrido en video con controles nativos; si no hay video, explica por qué. */
export function ReproductorEspacio({ videoUrl }: Props) {
  return videoUrl ? <Video url={videoUrl} /> : <SinVideo />;
}

// Componente aparte: useVideoPlayer es un hook y no puede llamarse condicionalmente.
function Video({ url }: { url: string }) {
  const player = useVideoPlayer(url);
  return <VideoView player={player} nativeControls contentFit="contain" style={estilos.video} />;
}

function SinVideo() {
  const colores = useColoresProvisorios();
  return (
    <View style={[estilos.video, estilos.sinVideo, { backgroundColor: colores.secundario, borderColor: colores.borde }]}>
      <Text style={estilos.icono}>🎥</Text>
      <Text style={[estilos.mensaje, { color: colores.textoSecundario }]}>
        Este espacio no cuenta con video de recorrido
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  video: { width: "100%", aspectRatio: 16 / 9, borderRadius: 12, backgroundColor: "#000000" },
  sinVideo: { alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderStyle: "dashed", padding: 16 },
  icono: { fontSize: 32 },
  mensaje: { textAlign: "center", fontSize: 15 },
});
