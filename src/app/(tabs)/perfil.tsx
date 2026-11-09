import { Pressable, Text, View } from "react-native";
import { useTema } from "../../tema/useTema";

export default function Perfil() {
  const { colores, preferencia, setPreferencia } = useTema();
  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo, padding: 24, gap: 12 }}>
      <Text style={{ color: colores.texto, fontSize: 18 }}>Tema: {preferencia}</Text>
      {(["sistema", "claro", "oscuro"] as const).map((op) => (
        <Pressable key={op} onPress={() => setPreferencia(op)}>
          <Text style={{ color: colores.acento }}>{op}</Text>
        </Pressable>
      ))}
    </View>
  );
}