import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Aviso } from "../../componentes/Aviso";
import {
  EstadoCargando,
  EstadoError,
  EstadoVacio,
} from "../../componentes/EstadosComunes";
import { FilaTurno } from "../../componentes/grilla/FilaTurno";
import { SelectorDia } from "../../componentes/grilla/SelectorDia";
import { PanelReservar } from "../../componentes/reservas/PanelReservar";
import {
  etiquetaDia,
  hoyAR,
  proximosDias,
  type TurnoGrilla,
} from "../../dominio";
import { useCarga } from "../../hooks/useCarga";
import { useSesion } from "../../hooks/useSesion";
import { obtenerDia } from "../../servicios/disponibilidad";
import { ErrorApi } from "../../servicios/errorApi";
import { listarDeportes, obtenerEspacio } from "../../servicios/espacios";
import {
  pedirPermiso,
  programarRecordatorio,
} from "../../servicios/notificaciones";
import { crearReserva, listarMisReservas } from "../../servicios/reservas";
import { useTema } from "../../tema/useTema";

// La pantalla más importante: elegir espacio y día, ver la grilla y reservar en dos toques.
// Se puede mirar SIN cuenta; la cuenta se pide recién al tocar "Reservar".
export default function Disponibilidad() {
  const { espacioId } = useLocalSearchParams<{ espacioId: string }>();
  const { colores } = useTema();
  const { usuario } = useSesion();

  const dias = useMemo(() => proximosDias(), []);
  const [fecha, setFecha] = useState(hoyAR());
  const [seleccion, setSeleccion] = useState<TurnoGrilla | null>(null);
  const [cantidad, setCantidad] = useState<number | null>(null);
  const [reservando, setReservando] = useState(false);

  const cargaEspacio = useCarga(() => obtenerEspacio(espacioId), [espacioId]);
  const espacio = cargaEspacio.datos?.datos ?? null;

  const dia = useCarga(
    () => (espacio ? obtenerDia(espacio, fecha) : Promise.resolve(null)),
    [espacio?.id, fecha],
  );
  const previas = useCarga(
    () => (usuario ? listarMisReservas(usuario.id) : Promise.resolve(null)),
    [usuario?.id],
  );
  const deportes = useCarga(() => listarDeportes(), []);
  const nombreDeporte =
    deportes.datos?.find((d) => d.id === espacio?.deporteId)?.nombre ?? null;

  const cambiarDia = (nuevo: string) => {
    setFecha(nuevo);
    setSeleccion(null);
  };

  const reservar = async () => {
    if (!usuario) {
      Alert.alert(
        "Necesitás una cuenta",
        "Para reservar tenés que iniciar sesión. Mirar la disponibilidad no la requiere.",
        [
          { text: "Ahora no", style: "cancel" },
          { text: "Ingresar", onPress: () => router.push("/(auth)/ingresar") },
        ],
      );
      return;
    }
    if (!seleccion || !espacio) return;

    setReservando(true);
    try {
      const reserva = await crearReserva({
        usuarioId: usuario.id,
        espacio,
        turno: seleccion,
        cantidadPersonas: cantidad ?? espacio.capacidad,
        deporteId: espacio.deporteId,
        reservasActuales: previas.datos?.datos ?? [],
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const permiso = await pedirPermiso();
      const recordatorio =
        permiso && (await programarRecordatorio(reserva, espacio.nombre));
      router.replace({
        pathname: "/reserva/[id]",
        params: { id: reserva.id, recordatorio: recordatorio ? "si" : "no" },
      });
    } catch (e) {
      const error =
        e instanceof ErrorApi
          ? e
          : new ErrorApi(
              "ERROR_INTERNO",
              "No se pudo reservar. Probá de nuevo.",
            );
      Alert.alert("No se pudo reservar", error.message);
      if (
        error.codigo === "TURNO_OCUPADO" ||
        error.codigo === "TURNO_NO_DISPONIBLE" ||
        error.codigo === "TURNO_BLOQUEADO"
      ) {
        setSeleccion(null);
        dia.recargar();
      }
    } finally {
      setReservando(false);
    }
  };

  if (cargaEspacio.cargando)
    return <EstadoCargando mensaje="Cargando espacio..." />;
  if (cargaEspacio.error)
    return (
      <EstadoError
        mensaje={cargaEspacio.error.message}
        onReintentar={cargaEspacio.recargar}
      />
    );
  if (!espacio)
    return (
      <EstadoVacio
        icono="🔎"
        titulo="Espacio no encontrado"
        mensaje="Ese espacio ya no está disponible."
      />
    );

  const resumen = dia.datos?.resumen;
  const grilla = dia.datos?.grilla ?? [];

  return (
    <View style={[estilos.pantalla, { backgroundColor: colores.fondo }]}>
      <View style={estilos.cabecera}>
        <Text style={[estilos.titulo, { color: colores.texto }]}>
          {espacio.nombre}
        </Text>
        <Text style={{ color: colores.textoSecundario }}>
          {espacio.complejo} · {etiquetaDia(fecha)}
        </Text>
      </View>

      <SelectorDia
        dias={dias}
        seleccionado={fecha}
        onSeleccionar={cambiarDia}
      />

      <ScrollView contentContainerStyle={estilos.lista}>
        {dia.cargando && <EstadoCargando mensaje="Buscando turnos..." />}
        {dia.error && (
          <EstadoError
            mensaje={dia.error.message}
            onReintentar={dia.recargar}
          />
        )}

        {resumen?.estado === "bloqueado" && (
          <EstadoVacio
            icono="🌧️"
            titulo="Día bloqueado"
            mensaje={
              resumen.motivoBloqueo ?? "El espacio no está disponible este día."
            }
          />
        )}
        {resumen?.estado === "completo" && (
          <Aviso
            tipo="info"
            mensaje="No quedan turnos libres este día. Probá con otro."
          />
        )}
        {resumen?.estado === "finalizado" && (
          <Aviso
            tipo="info"
            mensaje="Ya pasaron todos los turnos libres de hoy."
          />
        )}

        {!dia.cargando &&
          !dia.error &&
          resumen?.estado !== "bloqueado" &&
          grilla.map((turno) => (
            <FilaTurno
              key={turno.id}
              turno={turno}
              seleccionado={seleccion?.id === turno.id}
              onPress={setSeleccion}
            />
          ))}
      </ScrollView>

      {seleccion && (
        <PanelReservar
          turno={seleccion}
          espacio={espacio}
          nombreDeporte={nombreDeporte}
          cantidad={cantidad ?? espacio.capacidad}
          onCantidad={setCantidad}
          onReservar={reservar}
          cargando={reservando}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  cabecera: { paddingHorizontal: 16, paddingTop: 12, gap: 2 },
  titulo: { fontSize: 20, fontWeight: "700" },
  lista: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
});
