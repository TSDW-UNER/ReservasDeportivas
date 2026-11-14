import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Aviso } from "../../componentes/Aviso";
import { Boton } from "../../componentes/Boton";
import { EstadoCargando, EstadoError, EstadoVacio } from "../../componentes/EstadosComunes";
import { abrirComoLlegar } from "../../componentes/mapa/navegacion";
import { CodigoQr } from "../../componentes/reservas/CodigoQr";
import { esReservaProxima, etiquetaDia, fechaHoraDeReserva, infoCancelacion } from "../../dominio";
import { useCarga } from "../../hooks/useCarga";
import { useSesion } from "../../hooks/useSesion";
import { motivoDeSuspension } from "../../servicios/disponibilidad";
import { ErrorApi } from "../../servicios/errorApi";
import { obtenerEspacio } from "../../servicios/espacios";
import { cancelarRecordatorio } from "../../servicios/notificaciones";
import { cancelarReserva, listarMisReservas } from "../../servicios/reservas";
import { useTema } from "../../tema/useTema";
import { formatearPesos } from "../../utils/formato";

// Mi reserva: datos del turno + QR para mostrarle al encargado. Funciona SIN conexión:
// la reserva y el código se leen de SQLite si no hay red.
export default function DetalleReserva() {
  const { id, recordatorio } = useLocalSearchParams<{ id: string; recordatorio?: string }>();
  const { colores } = useTema();
  const { usuario } = useSesion();
  const [cancelando, setCancelando] = useState(false);

  const carga = useCarga(async () => {
    if (!usuario) return null;
    const mias = await listarMisReservas(usuario.id);
    const reserva = mias.datos.find((r) => r.id === id) ?? null;
    if (!reserva) return null;
    const espacio = (await obtenerEspacio(reserva.espacioId).catch(() => null))?.datos ?? null;
    const suspension = esReservaProxima(reserva) && !mias.desdeCache ? await motivoDeSuspension(reserva).catch(() => null) : null;
    return { reserva, espacio, suspension, desdeCache: mias.desdeCache };
  }, [id, usuario?.id]);

  if (carga.cargando) return <EstadoCargando mensaje="Cargando tu reserva..." />;
  if (carga.error) return <EstadoError mensaje={carga.error.message} onReintentar={carga.recargar} />;
  if (!carga.datos) return <EstadoVacio icono="🎟️" titulo="Reserva no encontrada" mensaje="No encontramos esa reserva en tu cuenta." />;

  const { reserva, espacio, suspension, desdeCache } = carga.datos;
  const { fecha, hora, fin } = fechaHoraDeReserva(reserva);
  const info = infoCancelacion(reserva);
  const mostrarQr = reserva.estado === "confirmada" && !suspension;

  const confirmarCancelacion = () => {
    Alert.alert("Cancelar reserva", "¿Querés cancelar esta reserva? El turno queda libre para otra persona.", [
      { text: "No, mantener", style: "cancel" },
      {
        text: "Sí, cancelar",
        style: "destructive",
        onPress: async () => {
          setCancelando(true);
          try {
            await cancelarReserva(reserva);
            await cancelarRecordatorio(reserva.id);
            carga.recargar();
          } catch (e) {
            Alert.alert("No se pudo cancelar", e instanceof ErrorApi ? e.message : "Probá de nuevo.");
          } finally {
            setCancelando(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={estilos.contenido}>
      {recordatorio === "si" && <Aviso tipo="exito" mensaje="¡Reserva confirmada! Te vamos a avisar 2 horas antes del turno." />}
      {recordatorio === "no" && (
        <Aviso tipo="exito" mensaje="¡Reserva confirmada! Activá las notificaciones del teléfono si querés el recordatorio." />
      )}
      {desdeCache && <Aviso tipo="advertencia" mensaje="Sin conexión: mostrando la reserva guardada en tu teléfono." />}
      {suspension && <Aviso tipo="advertencia" mensaje={`Tu turno fue suspendido: ${suspension}. Comunicate con la Dirección de Deportes.`} />}
      {reserva.estado === "cancelada" && <Aviso tipo="error" mensaje="Esta reserva fue cancelada." />}

      <View style={[estilos.tarjeta, { backgroundColor: colores.superficie, borderColor: colores.borde }]}>
        <Text style={[estilos.nombre, { color: colores.texto }]}>{espacio?.nombre ?? "Espacio deportivo"}</Text>
        <Text style={{ color: colores.texto, fontSize: 16 }}>
          {etiquetaDia(fecha)} de {hora} a {fin} hs
        </Text>
        {espacio && <Text style={{ color: colores.textoSecundario }}>{espacio.complejo}</Text>}
        <Text style={{ color: colores.textoSecundario }}>
          {espacio ? `${formatearPesos(espacio.precioPorHora)} · ` : ""}se paga en el lugar · {reserva.cantidadPersonas} personas
        </Text>
      </View>

      {mostrarQr && (
        <View style={estilos.qr}>
          <CodigoQr valor={reserva.codigoQr} />
          <Text style={[estilos.codigo, { color: colores.texto }]} selectable>{reserva.codigoQr}</Text>
          <Text style={{ color: colores.textoSecundario }}>Mostráselo al encargado en la puerta</Text>
        </View>
      )}

      {espacio && <Boton titulo="Cómo llegar" variante="secundario" onPress={() => abrirComoLlegar(espacio.coordenadas)} />}

      {reserva.estado === "confirmada" && (
        <View style={estilos.cancelacion}>
          {info.puedeCancelarEnApp ? (
            <Boton titulo="Cancelar reserva" variante="peligro" cargando={cancelando} onPress={confirmarCancelacion} />
          ) : (
            <Aviso tipo="advertencia" mensaje={info.mensaje} />
          )}
          {info.puedeCancelarEnApp && <Text style={[estilos.nota, { color: colores.textoSecundario }]}>{info.mensaje}</Text>}
        </View>
      )}

      <Boton titulo="Ver todas mis reservas" variante="secundario" onPress={() => router.replace("/(tabs)/reservas")} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, gap: 14, paddingBottom: 40 },
  tarjeta: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 4 },
  nombre: { fontSize: 20, fontWeight: "700" },
  qr: { alignItems: "center", gap: 10, marginVertical: 8 },
  codigo: { fontSize: 14, fontWeight: "600", letterSpacing: 1 },
  cancelacion: { gap: 8 },
  nota: { textAlign: "center", fontSize: 13 },
});
