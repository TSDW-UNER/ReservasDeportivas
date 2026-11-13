import { router } from "expo-router";
import { RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import { Aviso } from "../../componentes/Aviso";
import { EstadoCargando, EstadoError, EstadoVacio } from "../../componentes/EstadosComunes";
import { TarjetaReserva } from "../../componentes/reservas/TarjetaReserva";
import { useMisReservas } from "../../hooks/useMisReservas";
import { useTema } from "../../tema/useTema";
import type { Reserva } from "../../tipos";

export default function MisReservas() {
  const { colores } = useTema();
  const m = useMisReservas();

  if (!m.hayUsuario) {
    return (
      <EstadoVacio
        icono="🎟️"
        titulo="Ingresá para ver tus reservas"
        mensaje="Necesitás una cuenta para reservar y ver tus turnos."
        accion={{ titulo: "Iniciar sesión", onPress: () => router.push("/(auth)/ingresar") }}
      />
    );
  }
  if (m.cargando && m.reservas.length === 0) return <EstadoCargando mensaje="Cargando tus reservas..." />;
  if (m.error && m.reservas.length === 0) return <EstadoError mensaje={m.error.message} onReintentar={m.recargar} />;

  const secciones = [
    { titulo: "Próximas", vacio: "No tenés reservas próximas.", data: m.proximas },
    { titulo: "Pasadas", vacio: "Todavía no tenés reservas pasadas.", data: m.pasadas },
  ];

  return (
    <SectionList<Reserva, (typeof secciones)[number]>
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.contenido}
      sections={secciones}
      keyExtractor={(r) => r.id}
      refreshControl={<RefreshControl refreshing={m.cargando} onRefresh={m.recargar} tintColor={colores.acento} />}
      ListHeaderComponent={m.desdeCache ? <Aviso tipo="advertencia" mensaje="Sin conexión: mostrando tus reservas guardadas." /> : undefined}
      renderSectionHeader={({ section }) => (
        <View style={{ backgroundColor: colores.fondo }}>
          <Text style={[estilos.seccion, { color: colores.textoSecundario }]}>{section.titulo.toUpperCase()}</Text>
          {section.data.length === 0 && <Text style={{ color: colores.textoSecundario, marginBottom: 8 }}>{section.vacio}</Text>}
        </View>
      )}
      renderItem={({ item }) => (
        <TarjetaReserva
          reserva={item}
          nombreEspacio={m.espacios[item.espacioId]?.nombre ?? "Espacio deportivo"}
          suspendida={m.suspendidas[item.id]}
          onPress={() => router.push({ pathname: "/reserva/[id]", params: { id: item.id } })}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      SectionSeparatorComponent={() => <View style={{ height: 8 }} />}
    />
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, paddingBottom: 32 },
  seccion: { fontSize: 12, fontWeight: "700", letterSpacing: 1, marginTop: 8, marginBottom: 6 },
});
