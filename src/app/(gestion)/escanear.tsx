import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Stack } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Aviso } from "../../componentes/Aviso";
import { Boton } from "../../componentes/Boton";
import {
  buscarPorCodigo,
  listarEspaciosControl,
  marcarAusente,
  marcarPresente,
  nombreEspacio,
  type DatosReserva,
} from "../../servicios/ingresos";
import { biometriaDisponible, pedirBiometria } from "../../servicios/biometria";
import {
  mensajeIngreso,
  validarIngreso,
  type ResultadoIngreso,
} from "../../servicios/validarIngreso";
import { useTema } from "../../tema/useTema";
import { describirFecha, horaLocal } from "../../utils/fechas";

type Fase = "verificando" | "denegada" | "lista";

export default function Escanear() {
  const { colores } = useTema();
  const [permiso, pedirPermiso] = useCameraPermissions();

  const [fase, setFase] = useState<Fase>("verificando");
  const [espacioControl, setEspacioControl] = useState<string | null>(null);
  const [linterna, setLinterna] = useState(false);
  const [manual, setManual] = useState(false);
  const [codigoManual, setCodigoManual] = useState("");

  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoIngreso | null>(null);
  const [datos, setDatos] = useState<DatosReserva | null>(null);
  const [registro, setRegistro] = useState<string | null>(null);
  const [errorRed, setErrorRed] = useState<string | null>(null);

  // El callback de la cámara se dispara muchas veces por segundo.
  // Un ref (y no un state) cambia al instante y evita procesar el mismo QR varias veces.
  const candado = useRef(false);

  // Etapa 1: huella antes de abrir la cámara (lo pide el PRD para el encargado)
  const verificar = useCallback(async () => {
    setFase("verificando");
    // Sin huella registrada se deja pasar: la sesión ya se validó con contraseña.
    const disponible = await biometriaDisponible();
    const ok = disponible ? await pedirBiometria("Verificá tu identidad para escanear") : true;
    setFase(ok ? "lista" : "denegada");
  }, []);

  useEffect(() => {
    verificar();
  }, [verificar]);

  const reiniciar = () => {
    setResultado(null);
    setDatos(null);
    setRegistro(null);
    setErrorRed(null);
    setCodigoManual("");
    candado.current = false;
  };

  const procesar = async (codigo: string) => {
    const limpio = codigo.trim();
    if (!limpio || candado.current) return;
    candado.current = true;
    setBuscando(true);
    setErrorRed(null);
    try {
      const encontrado = await buscarPorCodigo(limpio);
      const res = validarIngreso(
        encontrado?.reserva ?? null,
        encontrado?.turno ?? null,
        new Date(),
        espacioControl,
      );
      setDatos(encontrado);
      setResultado(res);
      // Háptica distinta: éxito / advertencia (código real pero no corresponde) / error (código inválido)
      if (res.ok) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (res.motivo === "NO_EXISTE" || res.motivo === "CANCELADA")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      setErrorRed("No pudimos consultar la reserva. Probá de nuevo.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setBuscando(false);
    }
  };

  const presente = async () => {
    if (!resultado?.ok) return;
    try {
      const r = await marcarPresente(resultado.reserva.id);
      setRegistro(`Ingreso registrado a las ${horaLocal(r.ingresoEn ?? new Date().toISOString())}.`);
    } catch {
      setErrorRed("No se pudo registrar el ingreso. Probá de nuevo.");
    }
  };

  const ausente = () => {
    if (!resultado?.ok) return;
    Alert.alert(
      "No se presentó",
      "Se va a marcar la reserva como ausente. Esto cuenta como una ausencia del jugador.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Marcar ausente",
          style: "destructive",
          onPress: async () => {
            try {
              await marcarAusente(resultado.reserva.id);
              setRegistro("Reserva marcada como ausente.");
            } catch {
              setErrorRed("No se pudo marcar la ausencia. Probá de nuevo.");
            }
          },
        },
      ],
    );
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

  // ---------- Etapa 1: identidad ----------
  if (fase !== "lista") {
    return (
      <SafeAreaView style={[estilos.flex, { backgroundColor: colores.fondo }]}>
        {encabezado}
        <View style={estilos.centro}>
          {fase === "verificando" ? (
            <Text style={{ color: colores.textoSecundario }}>Verificando tu identidad…</Text>
          ) : (
            <>
              <Aviso tipo="error" mensaje="No pudimos verificar tu identidad. El escáner está bloqueado." />
              <Boton titulo="Reintentar" onPress={verificar} />
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Etapa 2: permiso de cámara ----------
  if (!permiso) {
    return (
      <SafeAreaView style={[estilos.flex, { backgroundColor: colores.fondo }]}>
        {encabezado}
      </SafeAreaView>
    );
  }
  if (!permiso.granted) {
    return (
      <SafeAreaView style={[estilos.flex, { backgroundColor: colores.fondo }]}>
        {encabezado}
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
          {/* El permiso denegado no deja sin función: se puede cargar el código a mano */}
          <Boton
            titulo="Ingresar código a mano"
            variante="secundario"
            onPress={() => setManual(true)}
          />
          {manual && (
            <ManualInput
              valor={codigoManual}
              onChange={setCodigoManual}
              onEnviar={() => procesar(codigoManual)}
            />
          )}
          {resultado && (
            <Tarjeta
              resultado={resultado}
              datos={datos}
              registro={registro}
              errorRed={errorRed}
              espacioControl={espacioControl}
              onPresente={presente}
              onAusente={ausente}
              onOtro={reiniciar}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Etapa 3: visor ----------
  const mostrarTarjeta = buscando || resultado || errorRed;

  return (
    <SafeAreaView edges={["bottom"]} style={[estilos.flex, { backgroundColor: colores.fondo }]}>
      {encabezado}

      <View style={estilos.chips}>
        {[{ id: null, nombre: "Todas" }, ...listarEspaciosControl()].map((e) => {
          const activo = espacioControl === e.id;
          return (
            <Pressable
              key={e.id ?? "todas"}
              onPress={() => setEspacioControl(e.id)}
              style={[
                estilos.chip,
                {
                  borderColor: activo ? colores.acento : colores.borde,
                  backgroundColor: activo ? colores.acento : colores.superficie,
                },
              ]}
            >
              <Text style={{ color: activo ? colores.textoSobreAcento : colores.texto, fontSize: 13 }}>
                {e.nombre}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={estilos.flex}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={linterna}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={mostrarTarjeta ? undefined : ({ data }) => procesar(data)}
        />

        <View style={estilos.marcoCentro} pointerEvents="none">
          <View style={[estilos.marco, { borderColor: "#FFFFFF" }]} />
          <Text style={estilos.guia}>Apuntá al QR de la reserva</Text>
        </View>

        {!mostrarTarjeta && (
          <View style={estilos.acciones}>
            <Pressable onPress={() => setLinterna((v) => !v)} style={estilos.botonCamara}>
              <Text style={estilos.textoCamara}>{linterna ? "Apagar linterna" : "Linterna"}</Text>
            </Pressable>
            <Pressable onPress={() => setManual((v) => !v)} style={estilos.botonCamara}>
              <Text style={estilos.textoCamara}>Código a mano</Text>
            </Pressable>
          </View>
        )}

        {manual && !mostrarTarjeta && (
          <View style={[estilos.manual, { backgroundColor: colores.superficie }]}>
            <ManualInput
              valor={codigoManual}
              onChange={setCodigoManual}
              onEnviar={() => procesar(codigoManual)}
            />
          </View>
        )}

        {mostrarTarjeta && (
          <View style={estilos.tarjetaAbajo}>
            {buscando ? (
              <View style={[estilos.cajaValidando, { backgroundColor: colores.superficie }]}>
                <Text style={{ color: colores.texto }}>Validando…</Text>
              </View>
            ) : (
              <Tarjeta
                resultado={resultado}
                datos={datos}
                registro={registro}
                errorRed={errorRed}
                espacioControl={espacioControl}
                onPresente={presente}
                onAusente={ausente}
                onOtro={reiniciar}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
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
        style={[
          estilos.input,
          { color: colores.texto, borderColor: colores.borde, backgroundColor: colores.fondo },
        ]}
      />
      <Boton titulo="Validar código" disabled={!valor.trim()} onPress={onEnviar} />
    </View>
  );
}

function Tarjeta({
  resultado,
  datos,
  registro,
  errorRed,
  espacioControl,
  onPresente,
  onAusente,
  onOtro,
}: {
  resultado: ResultadoIngreso | null;
  datos: DatosReserva | null;
  registro: string | null;
  errorRed: string | null;
  espacioControl: string | null;
  onPresente: () => void;
  onAusente: () => void;
  onOtro: () => void;
}) {
  const { colores } = useTema();

  if (errorRed) {
    return (
      <View style={[estilos.tarjeta, { backgroundColor: colores.superficie, borderColor: colores.error }]}>
        <Aviso tipo="error" mensaje={errorRed} />
        <Boton titulo="Escanear otro" onPress={onOtro} />
      </View>
    );
  }
  if (!resultado) return null;

  if (!resultado.ok) {
    const color = resultado.motivo === "NO_EXISTE" || resultado.motivo === "CANCELADA"
      ? colores.error
      : colores.advertencia;
    return (
      <View style={[estilos.tarjeta, { backgroundColor: colores.superficie, borderColor: color }]}>
        <Text style={[estilos.titulo, { color }]}>Ingreso no válido</Text>
        <Text style={{ color: colores.texto, fontSize: 15 }}>
          {mensajeIngreso(resultado, new Date(), nombreEspacio, espacioControl)}
        </Text>
        <Boton titulo="Escanear otro" onPress={onOtro} />
      </View>
    );
  }

  const { reserva, turno } = resultado;
  return (
    <View style={[estilos.tarjeta, { backgroundColor: colores.superficie, borderColor: colores.exito }]}>
      <Text style={[estilos.titulo, { color: colores.exito }]}>Reserva válida</Text>
      <Text style={{ color: colores.texto, fontWeight: "bold" }}>{nombreEspacio(reserva.espacioId)}</Text>
      <Text style={{ color: colores.texto }}>
        {describirFecha(turno.fecha)} de {turno.inicio} a {turno.fin} hs
      </Text>
      <Text style={{ color: colores.textoSecundario }}>
        {datos?.titular} · {reserva.cantidadPersonas} personas
      </Text>

      {registro ? (
        <>
          <Aviso tipo="exito" mensaje={registro} />
          <Boton titulo="Escanear otro" onPress={onOtro} />
        </>
      ) : (
        <>
          <Boton titulo="Marcar presente" onPress={onPresente} />
          <Boton titulo="No se presentó" variante="peligro" onPress={onAusente} />
          <Boton titulo="Escanear otro" variante="secundario" onPress={onOtro} />
        </>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  centro: { flex: 1, padding: 24, justifyContent: "center", gap: 12 },
  titulo: { fontSize: 20, fontWeight: "bold" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 12 },
  chip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  marcoCentro: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  marco: { width: 240, height: 240, borderWidth: 3, borderRadius: 16 },
  guia: { color: "#FFFFFF", marginTop: 12, fontWeight: "bold", textShadowColor: "#000", textShadowRadius: 4 },
  acciones: { position: "absolute", top: 12, left: 12, right: 12, flexDirection: "row", justifyContent: "space-between" },
  botonCamara: { backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  textoCamara: { color: "#FFFFFF", fontWeight: "bold" },
  manual: { position: "absolute", left: 12, right: 12, top: 64, padding: 12, borderRadius: 8 },
  tarjetaAbajo: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 12 },
  tarjeta: { borderWidth: 2, borderRadius: 12, padding: 16, gap: 8 },
  cajaValidando: { padding: 16, borderRadius: 12, alignItems: "center" },
  input: { borderWidth: 1, borderRadius: 6, padding: 12, fontSize: 16 },
});