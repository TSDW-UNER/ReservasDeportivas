import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { BotonPrimario } from "../BotonPrimario";
import { CampoTexto } from "../CampoTexto";
import { formatearPrecioPorHora } from "../formato";
import { useColoresProvisorios } from "../temaProvisorio";

interface Props {
  precioActual: number;
  alGuardar: (precio: number) => void;
}

export function EditorPrecio({ precioActual, alGuardar }: Props) {
  const colores = useColoresProvisorios();
  const [texto, setTexto] = useState(String(precioActual));
  const [error, setError] = useState<string | null>(null);

  const guardar = () => {
    const precio = Number(texto);
    if (!Number.isInteger(precio) || precio <= 0) return setError("Ingresá un precio válido en pesos.");
    alGuardar(precio);
    setError(null);
  };

  return (
    <>
      <Text style={{ color: colores.textoSecundario }}>Actual: {formatearPrecioPorHora(precioActual)}</Text>
      <CampoTexto value={texto} onChangeText={setTexto} keyboardType="number-pad" placeholder="Precio por hora" />
      {error && <Text style={[estilos.error, { color: colores.error }]}>{error}</Text>}
      <BotonPrimario texto="Guardar precio" alPresionar={guardar} />
    </>
  );
}

const estilos = StyleSheet.create({
  error: { fontSize: 14 },
});
