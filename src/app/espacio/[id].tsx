
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { EstadoCargando, EstadoError, EstadoVacio } from "../../componentes/EstadosComunes";
import { FichaEspacio } from "../../componentes/espacios/FichaEspacio";
import { useCarga } from "../../hooks/useCarga";
import { obtenerEspacio } from "../../servicios/espacios";
import { useColoresProvisorios } from "../../componentes/espacios/temaProvisorio";

export default function EspacioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colores = useColoresProvisorios();

  const cargaEspacio = useCarga(
    () => obtenerEspacio(id),
    [id],
  );

  const espacio = cargaEspacio.datos?.datos ?? null;

  if (cargaEspacio.cargando) {
    return <EstadoCargando mensaje="Cargando espacio..." />;
  }

  if (cargaEspacio.error) {
    return (
      <EstadoError
        mensaje={cargaEspacio.error.message}
        onReintentar={cargaEspacio.recargar}
      />
    );
  }

  if (!espacio) {
    return (
      <EstadoVacio
        icono="🔎"
        titulo="Espacio no encontrado"
        mensaje="No encontramos este espacio. Puede que ya no esté disponible."
      />
    );
  }

  return <FichaEspacio espacio={espacio} />;
}

const estilos = StyleSheet.create({
  centrado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
});
