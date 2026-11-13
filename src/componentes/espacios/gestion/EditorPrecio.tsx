
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { BotonPrimario } from "../BotonPrimario";
import { CampoTexto } from "../CampoTexto";
import { formatearPrecioPorHora } from "../formato";
import { useColoresProvisorios } from "../temaProvisorio";

interface Props {
  precioActual: number;
  alGuardar: (precio: number) => Promise<void> | void;
}

export function EditorPrecio({ precioActual, alGuardar }: Props) {
  const colores = useColoresProvisorios();

  const [texto, setTexto] = useState(String(precioActual));
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const guardar = async () => {
    const precio = Number(texto);

    if (!Number.isInteger(precio) || precio <= 0) {
      setError("Ingresá un precio válido en pesos.");
      return;
    }

    if (cargando) return;

    setCargando(true);
    setError(null);

    try {
      await alGuardar(precio);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo actualizar el precio. Probá nuevamente.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <Text style={{ color: colores.textoSecundario }}>
        Actual: {formatearPrecioPorHora(precioActual)}
      </Text>

      <CampoTexto
        value={texto}
        onChangeText={(valor) => {
          setTexto(valor);
          setError(null);
        }}
        keyboardType="number-pad"
        placeholder="Precio por hora"
      />

      {error && (
        <Text style={[estilos.error, { color: colores.error }]}>
          {error}
        </Text>
      )}

      <BotonPrimario
        texto={cargando ? "Guardando..." : "Guardar precio"}
        alPresionar={guardar}
      />
    </>
  );
}

const estilos = StyleSheet.create({
  error: {
    fontSize: 14,
  },
});
