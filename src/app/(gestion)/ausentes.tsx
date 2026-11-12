import { Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Aviso } from "../../componentes/Aviso";
import { Boton } from "../../componentes/Boton";
import { SelectorEspacio } from "../../componentes/SelectorEspacio";
import { ErrorApi } from "../../servicios/errorApi";
import {
  listarEspacios,
  marcarAusente,
  reservasPendientes,
  type ReservaPendiente,
} from "../../servicios/ingresos";
import { useTema } from "../../tema/useTema";
import type { Espacio } from "../../tipos/espacio";

export default function Ausentes() {
  const { colores } = useTema();
  const [espacios, setEspacios] = useState<Espacio[] | null>(null);
  const [espacioId, setEspacioId] = useState<string | null>(null);
  const [lista, setLista] = useState<ReservaPendiente[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);

  const mensaje = (e: unknown) =>
    e instanceof ErrorApi ? e.message : "Ocurrió un error inesperado. Probá de nuevo.";

  useEffect(() => {
    listarEspacios().then(setEspacios).catch((e) => setError(mensaje(e)));
  }, []);

  const cargar = useCallback(async (id: string) => {
    setCargando(true);
    setError(null);
    try {
      setLista(await reservasPendientes(id));
    } catch (e) {
      setError(mensaje(e));
      setLista(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (espacioId) cargar(espacioId);
  }, [espacioId, cargar]);

  const confirmar = (item: ReservaPendiente) => {
    Alert.alert(
      "No se presentó",
      "Se va a marcar la reserva como ausente. Esto cuenta como una ausencia del jugador.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Marcar ausente",
          style: "destructive",
          onPress: async () => {
            setProcesando(item.reserva.id);
            setError(null);
            try {
              await marcarAusente(item.reserva.id);
              setLista((l) => l?.filter((x) => x.reserva.id !== item.reserva.id) ?? null);
            } catch (e) {
              setError(mensaje(e)); // ej: ANTES_DE_TIEMPO: "Todavía no se puede marcar como ausente."
            } finally {
              setProcesando(null);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={[estilos.flex, { backgroundColor: colores.fondo }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Marcar ausentes",
          headerStyle: { backgroundColor: colores.superficie },
          headerTintColor: colores.texto,
          headerTitleStyle: { color: colores.texto },
          headerShadowVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text style={{ color: colores.textoSecundario }}>
          Reservas de hoy que todavía no ingresaron. Solo se pueden marcar 15 minutos después del inicio.
        </Text>

        {espacios && (
          <SelectorEspacio espacios={espacios} seleccionado={espacioId} onElegir={setEspacioId} />
        )}
        {error && <Aviso tipo="error" mensaje={error} />}
        {!espacios && !error && <Text style={{ color: colores.textoSecundario }}>Cargando canchas…</Text>}
        {espacios && !espacioId && (
          <Text style={{ color: colores.textoSecundario }}>Elegí una cancha para ver sus reservas.</Text>
        )}
        {cargando && <Text style={{ color: colores.textoSecundario }}>Cargando reservas…</Text>}

        {lista && lista.length === 0 && !cargando && (
          <Aviso tipo="info" mensaje="No hay reservas pendientes en esta cancha hoy." />
        )}

        {lista?.map((item) => (
          <View
            key={item.reserva.id}
            style={[estilos.item, { backgroundColor: colores.superficie, borderColor: colores.borde }]}
          >
            <Text style={{ color: colores.texto, fontWeight: "bold" }}>
              {item.turno ? `${item.turno.inicio} a ${item.turno.fin} hs` : "Horario sin datos"}
            </Text>
            <Text style={{ color: colores.textoSecundario }}>
              {item.titular ?? "Titular sin datos"} · {item.reserva.cantidadPersonas} personas
            </Text>
            <Boton
              titulo="No se presentó"
              variante="peligro"
              cargando={procesando === item.reserva.id}
              onPress={() => confirmar(item)}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  contenido: { padding: 16, gap: 12 },
  item: { borderWidth: 1, borderRadius: 8, padding: 12, gap: 8 },
});