
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { CampoTexto } from "../../componentes/espacios/CampoTexto";
import { FiltroChips, type OpcionFiltro } from "../../componentes/espacios/FiltroChips";
import { TarjetaEspacio } from "../../componentes/espacios/TarjetaEspacio";
import { EstadoCargando, EstadoError } from "../../componentes/EstadosComunes";
import { useCarga } from "../../hooks/useCarga";
import { listarDeportes, listarEspacios } from "../../servicios/espacios";
import { useColoresProvisorios } from "../../componentes/espacios/temaProvisorio";

const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export default function EspaciosScreen() {
  const colores = useColoresProvisorios();

  const [busqueda, setBusqueda] = useState("");
  const [deporteId, setDeporteId] = useState<string | null>(null);
  const [complejo, setComplejo] = useState<string | null>(null);

  // Carga de datos desde los servicios.
  const cargaEspacios = useCarga(() => listarEspacios(), []);
  const cargaDeportes = useCarga(() => listarDeportes(), []);

  // Los servicios devuelven los datos reales de la API o la caché disponible.
  const espaciosDisponibles = cargaEspacios.datos?.datos ?? [];
  const deportesDisponibles = cargaDeportes.datos ?? [];

  // Filtros construidos dinámicamente a partir de los datos recibidos.
  const opcionesDeporte: OpcionFiltro[] = useMemo(
    () => [
      { id: null, etiqueta: "Todos" },
      ...deportesDisponibles.map(({ id, nombre }) => ({
        id,
        etiqueta: nombre,
      })),
    ],
    [deportesDisponibles],
  );

  const opcionesComplejo: OpcionFiltro[] = useMemo(
    () => [
      { id: null, etiqueta: "Todos los complejos" },
      ...Array.from(new Set(espaciosDisponibles.map((e) => e.complejo))).map(
        (nombre) => ({
          id: nombre,
          etiqueta: nombre,
        }),
      ),
    ],
    [espaciosDisponibles],
  );

  // Búsqueda y filtros aplicados sobre los espacios recibidos.
  const espaciosFiltrados = useMemo(() => {
    const consulta = normalizar(busqueda);

    return espaciosDisponibles.filter(
      (e) =>
        e.activo &&
        (!deporteId || e.deporteId === deporteId) &&
        (!complejo || e.complejo === complejo) &&
        normalizar(`${e.nombre} ${e.complejo} ${e.superficie}`).includes(consulta),
    );
  }, [espaciosDisponibles, busqueda, deporteId, complejo]);

  const filtros = (
    <View style={estilos.filtros}>
      <CampoTexto
        value={busqueda}
        onChangeText={setBusqueda}
        placeholder="Buscar cancha, complejo o superficie"
        clearButtonMode="while-editing"
        returnKeyType="search"
      />

      <FiltroChips
        opciones={opcionesDeporte}
        seleccionado={deporteId}
        alSeleccionar={setDeporteId}
      />

      <FiltroChips
        opciones={opcionesComplejo}
        seleccionado={complejo}
        alSeleccionar={setComplejo}
      />

      {cargaEspacios.datos?.desdeCache && (
        <Text style={{ color: colores.textoSecundario, fontSize: 12 }}>
          Mostrando los últimos espacios guardados. No hay conexión con el servidor.
        </Text>
      )}

      {cargaDeportes.error && (
        <EstadoError
          mensaje={cargaDeportes.error.message}
          onReintentar={cargaDeportes.recargar}
        />
      )}
    </View>
  );

  return (
    <FlatList
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.lista}
      data={espaciosFiltrados}
      keyExtractor={(e) => e.id}
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/espacio/[id]",
              params: { id: item.id },
            })
          }
          accessibilityRole="button"
          accessibilityLabel={`Ver ${item.nombre}`}
        >
          <TarjetaEspacio espacio={item} />
        </Pressable>
      )}
      ListHeaderComponent={filtros}
      ListEmptyComponent={
        cargaEspacios.cargando ? (
          <EstadoCargando mensaje="Cargando espacios..." />
        ) : cargaEspacios.error ? (
          <EstadoError
            mensaje={cargaEspacios.error.message}
            onReintentar={cargaEspacios.recargar}
          />
        ) : (
          <Text style={[estilos.vacio, { color: colores.textoSecundario }]}>
            Sin resultados. Probá con otro deporte, complejo o búsqueda.
          </Text>
        )
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
