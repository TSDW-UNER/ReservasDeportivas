import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { CampoTexto } from "../../componentes/espacios/CampoTexto";
import { deportesFalsos, espaciosFalsos } from "../../componentes/espacios/datosFalsos";
import { FiltroChips, type OpcionFiltro } from "../../componentes/espacios/FiltroChips";
import { TarjetaEspacio } from "../../componentes/espacios/TarjetaEspacio";
import { useColoresProvisorios } from "../../componentes/espacios/temaProvisorio";

const OPCIONES_DEPORTE: OpcionFiltro[] = [
  { id: null, etiqueta: "Todos" },
  ...deportesFalsos.map(({ id, nombre }) => ({ id, etiqueta: nombre })),
];

const OPCIONES_COMPLEJO: OpcionFiltro[] = [
  { id: null, etiqueta: "Todos los complejos" },
  ...[...new Set(espaciosFalsos.map((e) => e.complejo))].map((c) => ({ id: c, etiqueta: c })),
];

const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export default function EspaciosScreen() {
  const colores = useColoresProvisorios();
  const [busqueda, setBusqueda] = useState("");
  const [deporteId, setDeporteId] = useState<string | null>(null);
  const [complejo, setComplejo] = useState<string | null>(null);

  const espacios = useMemo(() => {
    const consulta = normalizar(busqueda);
    return espaciosFalsos.filter(
      (e) =>
        e.activo &&
        (!deporteId || e.deporteId === deporteId) &&
        (!complejo || e.complejo === complejo) &&
        normalizar(`${e.nombre} ${e.complejo} ${e.superficie}`).includes(consulta),
    );
  }, [busqueda, deporteId, complejo]);

  const filtros = (
    <View style={estilos.filtros}>
      <CampoTexto
        value={busqueda}
        onChangeText={setBusqueda}
        placeholder="Buscar cancha, complejo o superficie"
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
      <FiltroChips opciones={OPCIONES_DEPORTE} seleccionado={deporteId} alSeleccionar={setDeporteId} />
      <FiltroChips opciones={OPCIONES_COMPLEJO} seleccionado={complejo} alSeleccionar={setComplejo} />
    </View>
  );

  return (
    <FlatList
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.lista}
      data={espacios}
      keyExtractor={(e) => e.id}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: "/espacio/[id]", params: { id: item.id } })}
          accessibilityRole="button"
          accessibilityLabel={`Ver ${item.nombre}`}
        >
          <TarjetaEspacio espacio={item} />
        </Pressable>
      )}
      ListHeaderComponent={filtros}
      ListEmptyComponent={
        <Text style={[estilos.vacio, { color: colores.textoSecundario }]}>
          Sin resultados. Probá con otro deporte, complejo o búsqueda.
        </Text>
      }
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    />
  );
}

const estilos = StyleSheet.create({
  lista: { padding: 16, gap: 14 },
  filtros: { gap: 8 },
  vacio: { textAlign: "center", marginTop: 40, fontSize: 16 },
});
