import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Stack } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Aviso } from "../../componentes/Aviso";
import { Boton } from "../../componentes/Boton";
import { SelectorEspacio } from "../../componentes/SelectorEspacio";
import { biometriaDisponible, pedirBiometria } from "../../servicios/biometria";
import { ErrorApi } from "../../servicios/errorApi";
import {
  detallesIngreso,
  gravedadIngreso,
  listarEspacios,
  registrarIngreso,
  type Gravedad,
} from "../../servicios/ingresos";
import { useTema } from "../../tema/useTema";
import type { Espacio } from "../../tipos/espacio";
import type { Reserva } from "../../tipos/reserva";
import type { Turno } from "../../tipos/turno";
import { describirFecha, horaLocal } from "../../utils/fechas";


type Fase = "verificando" | "denegada" | "lista";

type Resultado =
  | { ok: true; reserva: Reserva; turno: Turno | null; titular: string | null }
  | { ok: false; mensaje: string; gravedad: Gravedad };

export default function Escanear() {
  const { colores } = useTema();
  const [permiso, pedirPermiso] = useCameraPermissions();

  const [fase, setFase] = useState<Fase>("verificando");
  const [espacios, setEspacios] = useState<Espacio[] | null>(null);
  const [errorEspacios, setErrorEspacios] = useState<string | null>(null);
  const [espacioId, setEspacioId] = useState<string | null>(null);

  const [linterna, setLinterna] = useState(false);
  const [manual, setManual] = useState(false);
  const [codigoManual, setCodigoManual] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  // El callback de la cámara se dispara muchas veces por segundo.
  // Un ref (y no un state) cambia al instante y evita registrar el mismo QR varias veces.
  const candado = useRef(false);

  // Etapa 1: huella antes de abrir la cámara (lo pide el PRD para el encargado)
  const verificar = useCallback(async () => {
    setFase("verificando");
    const disponible = await biometriaDisponible();
    const ok = disponible ? await pedirBiometria("Verificá tu identidad para escanear") : true;
    setFase(ok ? "lista" : "denegada");
  }, []);

  const cargarEspacios = useCallback(async () => {
    setErrorEspacios(null);
    try {
      setEspacios(await listarEspacios());
    } catch (e) {
      setErrorEspacios(e instanceof ErrorApi ? e.message : "No pudimos cargar las canchas.");
    }
  }, []);

  useEffect(() => {
    verificar();
    cargarEspacios();
  }, [verificar, cargarEspacios]);

  const reiniciar = () => {
    setResultado(null);
    setCodigoManual("");
    candado.current = false;
  };

  const procesar = async (codigo: string) => {
    const limpio = codigo.trim();
    if (!limpio || !espacioId || candado.current) return;
    candado.current = true;
    setBuscando(true);
    try {
      const reserva = await registrarIngreso(limpio, espacioId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const detalles = await detallesIngreso(reserva);
      setResultado({ ok: true, reserva, ...detalles });
    } catch (e) {
      const sinRed = e instanceof ErrorApi && (e.codigo === "SIN_CONEXION" || e.codigo === "TIEMPO_AGOTADO");
      const gravedad: Gravedad = e instanceof ErrorApi && !sinRed ? gravedadIngreso(e.codigo) : "error";
      Haptics.notificationAsync(
        gravedad === "advertencia"
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Error,
      );
      setResultado({
        ok: false,
        gravedad,
        mensaje: sinRed
          ? "No pudimos confirmar el ingreso. Probá de nuevo: si ya se había registrado, el sistema te lo va a avisar."
          : e instanceof ErrorApi
            ? e.message
            : "Ocurrió un error inesperado. Probá de nuevo.",
      });
    } finally {
      setBuscando(false);
    }
  };

  const encabezado = (
    <Stack.Screen
      options={{
        headerShown: true,
        title: "Escanear ingresos",
        headerStyle: { backgroundColor: colores.superficie },
        headerTintColor: colores.texto,
        headerTitleStyle: { color: colores.texto },
        headerShadowVisible: false,
      }}
    />
  );
  const contenedor = (hijos: React.ReactNode, bordes: ("bottom")[] | undefined = undefined) => (
    <SafeAreaView edges={bordes} style={[estilos.flex, { backgroundColor: colores.fondo }]}>
      {encabezado}
      {hijos}
    </SafeAreaView>
  );

  // ---------- Etapa 1: identidad ----------
  if (fase !== "lista") {
    return contenedor(
      <View style={estilos.centro}>
        {fase === "verificando" ? (
          <Text style={{ color: colores.textoSecundario }}>Verificando tu identidad…</Text>
        ) : (
          <>
            <Aviso tipo="error" mensaje="No pudimos verificar tu identidad. El escáner está bloqueado." />
            <Boton titulo="Reintentar" onPress={verificar} />
          </>
        )}
      </View>,
    );
  }

  // ---------- Etapa 2: elegir cancha (la API la exige) ----------
  if (!espacios || !espacioId) {
    return contenedor(
      <ScrollView contentContainerStyle={estilos.listaCanchas}>
        {errorEspacios ? (
          <>
            <Aviso tipo="error" mensaje={errorEspacios} />
            <Boton titulo="Reintentar" onPress={cargarEspacios} />
          </>
        ) : !espacios ? (
          <Text style={{ color: colores.textoSecundario }}>Cargando canchas…</Text>
        ) : (
          <>
            <Text style={[estilos.titulo, { color: colores.texto }]}>¿Qué cancha controlás?</Text>
            <Text style={{ color: colores.textoSecundario }}>
              Se validará que la reserva sea para esta cancha.
            </Text>
            <SelectorEspacio espacios={espacios} seleccionado={null} onElegir={setEspacioId} />
          </>
        )}
      </ScrollView>,
    );
  }

  // ---------- Etapa 3: permiso de cámara ----------
  if (!permiso) return contenedor(null);

  const panelResultado = buscando ? (
    <View style={[estilos.cajaValidando, { backgroundColor: colores.superficie }]}>
      <Text style={{ color: colores.texto }}>Validando…</Text>
    </View>
  ) : resultado ? (
    <TarjetaResultado resultado={resultado} espacios={espacios} onOtro={reiniciar} />
  ) : null;

  if (!permiso.granted) {
    return contenedor(
      <View style={estilos.centro}>
        <Text style={[estilos.titulo, { color: colores.texto }]}>Necesitamos la cámara</Text>
        <Text style={{ color: colores.textoSecundario, marginBottom: 12 }}>
          Se usa solamente para leer el código QR de las reservas.
        </Text>
        {permiso.canAskAgain ? (
          <Boton titulo="Permitir cámara" onPress={pedirPermiso} />
        ) : (
          <Boton titulo="Abrir ajustes" onPress={() => Linking.openSettings()} />
        )}
        {/* Sin cámara la pantalla sigue siendo útil: se carga el código a mano */}
        {panelResultado ?? (
          <ManualInput valor={codigoManual} onChange={setCodigoManual} onEnviar={() => procesar(codigoManual)} />
        )}
      </View>,
    );
  }

  // ---------- Etapa 4: visor ----------
  const mostrarPanel = buscando || !!resultado;

  return contenedor(
    <>
      <View
        style={[
          estilos.barraCancha,
          { backgroundColor: colores.superficie, borderBottomColor: colores.borde },
        ]}
      >
        <Text style={{ color: colores.texto, fontWeight: "bold", flex: 1 }} numberOfLines={1}>
          {espacios.find((e) => e.id === espacioId)?.nombre}
        </Text>
        <Pressable
          onPress={() => {
            reiniciar();
            setEspacioId(null); // vuelve a la lista de canchas
          }}
          accessibilityRole="button"
        >
          <Text style={{ color: colores.acento, fontWeight: "bold" }}>Cambiar</Text>
        </Pressable>
      </View>

      <View style={estilos.flex}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={linterna}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={mostrarPanel ? undefined : ({ data }) => procesar(data)}
        />

        <View style={estilos.marcoCentro} pointerEvents="none">
          <View style={estilos.marco} />
          <Text style={estilos.guia}>Apuntá al QR de la reserva</Text>
        </View>

        {!mostrarPanel && (
          <View style={estilos.acciones}>
            <Pressable onPress={() => setLinterna((v) => !v)} style={estilos.botonCamara}>
              <Text style={estilos.textoCamara}>{linterna ? "Apagar linterna" : "Linterna"}</Text>
            </Pressable>
            <Pressable onPress={() => setManual((v) => !v)} style={estilos.botonCamara}>
              <Text style={estilos.textoCamara}>Código a mano</Text>
            </Pressable>
          </View>
        )}

        {manual && !mostrarPanel && (
          <View style={[estilos.manual, { backgroundColor: colores.superficie }]}>
            <ManualInput valor={codigoManual} onChange={setCodigoManual} onEnviar={() => procesar(codigoManual)} />
          </View>
        )}

        {mostrarPanel && <View style={estilos.panelAbajo}>{panelResultado}</View>}
      </View>
    </>,
    ["bottom"],
  );
}

function ManualInput({
  valor,
  onChange,
  onEnviar,
}: {
  valor: string;
  onChange: (t: string) => void;
  onEnviar: () => void;
}) {
  const { colores } = useTema();
  return (
    <View style={{ gap: 8 }}>
      <TextInput
        value={valor}
        onChangeText={onChange}
        placeholder="Código de la reserva"
        placeholderTextColor={colores.textoSecundario}
        autoCapitalize="characters"
        autoCorrect={false}
        style={[estilos.input, { color: colores.texto, borderColor: colores.borde, backgroundColor: colores.fondo }]}
      />
      <Boton titulo="Validar código" disabled={!valor.trim()} onPress={onEnviar} />
    </View>
  );
}

function TarjetaResultado({
  resultado,
  espacios,
  onOtro,
}: {
  resultado: Resultado;
  espacios: Espacio[];
  onOtro: () => void;
}) {
  const { colores } = useTema();

  if (!resultado.ok) {
    const color = resultado.gravedad === "advertencia" ? colores.advertencia : colores.error;
    return (
      <View style={[estilos.tarjeta, { backgroundColor: colores.superficie, borderColor: color }]}>
        <Text style={[estilos.titulo, { color }]}>Ingreso no válido</Text>
        <Text style={{ color: colores.texto, fontSize: 15 }}>{resultado.mensaje}</Text>
        <Boton titulo="Escanear otro" onPress={onOtro} />
      </View>
    );
  }

  const { reserva, turno, titular } = resultado;
  const espacio = espacios.find((e) => e.id === reserva.espacioId);
  return (
    <View style={[estilos.tarjeta, { backgroundColor: colores.superficie, borderColor: colores.exito }]}>
      <Text style={[estilos.titulo, { color: colores.exito }]}>Ingreso registrado</Text>
      <Text style={{ color: colores.texto, fontWeight: "bold" }}>{espacio?.nombre ?? reserva.espacioId}</Text>
      {turno && (
        <Text style={{ color: colores.texto }}>
          {describirFecha(turno.fecha)} de {turno.inicio} a {turno.fin} hs
        </Text>
      )}
      <Text style={{ color: colores.textoSecundario }}>
        {titular ?? "Titular sin datos"} · {reserva.cantidadPersonas} personas
      </Text>
      {reserva.ingresoEn && (
        <Aviso tipo="exito" mensaje={`Llegaron a las ${horaLocal(reserva.ingresoEn)}.`} />
      )}
      <Boton titulo="Escanear otro" onPress={onOtro} />
    </View>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  centro: { flex: 1, padding: 24, justifyContent: "center", gap: 12 },
  titulo: { fontSize: 20, fontWeight: "bold" },
  listaCanchas: { padding: 16, gap: 12 },
  barraCancha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  marcoCentro: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  marco: { width: 240, height: 240, borderWidth: 3, borderRadius: 16, borderColor: "#FFFFFF" },
  guia: { color: "#FFFFFF", marginTop: 12, fontWeight: "bold", textShadowColor: "#000", textShadowRadius: 4 },
  acciones: { position: "absolute", top: 12, left: 12, right: 12, flexDirection: "row", justifyContent: "space-between" },
  botonCamara: { backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  textoCamara: { color: "#FFFFFF", fontWeight: "bold" },
  manual: { position: "absolute", left: 12, right: 12, top: 64, padding: 12, borderRadius: 8 },
  panelAbajo: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 12 },
  tarjeta: { borderWidth: 2, borderRadius: 12, padding: 16, gap: 8 },
  cajaValidando: { padding: 16, borderRadius: 12, alignItems: "center" },
  input: { borderWidth: 1, borderRadius: 6, padding: 12, fontSize: 16 },
});