import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Boton } from "../../componentes/Boton";
import { Insignia } from "../../componentes/Insignia";
import { useSesion } from "../../hooks/useSesion";
import type { PreferenciaTema } from "../../almacenamiento/preferencias";
import { useTema } from "../../tema/useTema";
import type { Rol } from "../../tipos/usuario";

const ETIQUETA_ROL: Record<Rol, string> = {
  jugador: "Jugador",
  encargado: "Encargado",
  administrador: "Administrador",
};

const OPCIONES_TEMA: { valor: PreferenciaTema; titulo: string }[] = [
  { valor: "sistema", titulo: "Sistema" },
  { valor: "claro", titulo: "Claro" },
  { valor: "oscuro", titulo: "Oscuro" },
];

function iniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Perfil() {
  const { colores, preferencia, setPreferencia } = useTema();
  const { estado, usuario, rol, salir } = useSesion();

  const esGestor = rol === "encargado" || rol === "administrador";

  const confirmarSalida = () => {
    Alert.alert("Cerrar sesión", "¿Querés cerrar tu sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: salir },
    ]);
  };

  // Selector de tema: va siempre, con o sin sesión
  const selectorTema = (
    <View style={estilos.seccion}>
      <Text style={[estilos.seccionTitulo, { color: colores.textoSecundario }]}>
        APARIENCIA
      </Text>
      <View style={estilos.fila}>
        {OPCIONES_TEMA.map((op) => {
          const activa = preferencia === op.valor;
          return (
            <Pressable
              key={op.valor}
              onPress={() => setPreferencia(op.valor)}
              accessibilityRole="radio"
              accessibilityState={{ selected: activa }}
              style={[
                estilos.opcion,
                {
                  borderColor: activa ? colores.acento : colores.borde,
                  backgroundColor: activa ? colores.acento : colores.superficie,
                },
              ]}
            >
              <Text
                style={{
                  color: activa ? colores.textoSobreAcento : colores.texto,
                  fontWeight: activa ? "bold" : "normal",
                }}
              >
                {op.titulo}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  if (estado === "cargando") {
    return (
      <View style={[estilos.centro, { backgroundColor: colores.fondo }]}>
        <Text style={{ color: colores.textoSecundario }}>Cargando perfil…</Text>
      </View>
    );
  }

  // Versión anónima
  if (!usuario) {
    return (
      <ScrollView
        style={{ backgroundColor: colores.fondo }}
        contentContainerStyle={estilos.contenido}
      >
        <Text style={[estilos.titulo, { color: colores.texto }]}>
          Ingresá para reservar y ver tus reservas
        </Text>
        <Text style={{ color: colores.textoSecundario }}>
          Podés mirar la disponibilidad sin cuenta. La cuenta se pide recién al reservar.
        </Text>
        <Boton titulo="Iniciar sesión" onPress={() => router.push("/(auth)/ingresar")} />
        <Boton
          titulo="Crear cuenta"
          variante="secundario"
          onPress={() => router.push("/(auth)/registrar")}
        />
        {selectorTema}
      </ScrollView>
    );
  }

  // Versión con sesión
  return (
    <ScrollView
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.contenido}
    >
      <View style={estilos.cabecera}>
        <View style={[estilos.avatar, { backgroundColor: colores.acento }]}>
          <Text style={[estilos.iniciales, { color: colores.textoSobreAcento }]}>
            {iniciales(usuario.nombre)}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[estilos.nombre, { color: colores.texto }]}>{usuario.nombre}</Text>
          <Text style={{ color: colores.textoSecundario }}>{usuario.email}</Text>
          <Text style={{ color: colores.textoSecundario }}>{usuario.telefono}</Text>
          <Insignia texto={ETIQUETA_ROL[usuario.rol]} />
        </View>
      </View>

      {/* Solo se muestran a los jugadores: encargado y admin no reservan turnos */}
      {rol === "jugador" && (
        <View style={estilos.seccion}>
          <Text style={[estilos.seccionTitulo, { color: colores.textoSecundario }]}>
            MI HISTORIAL
          </Text>
          <View style={estilos.fila}>
            <Tarjeta
              valor={usuario.cancelacionesTardias}
              titulo="Cancelaciones tardías"
              detalle={
                usuario.cancelacionesTardias > 0
                  ? "Cancelaste con menos de 4 horas de anticipación."
                  : "Ninguna. ¡Gracias por avisar a tiempo!"
              }
              color={usuario.cancelacionesTardias > 0 ? colores.advertencia : colores.exito}
            />
            <Tarjeta
              valor={usuario.ausencias}
              titulo="Ausencias"
              detalle={
                usuario.ausencias > 0
                  ? "Reservaste y no te presentaste."
                  : "Ninguna. ¡Seguí así!"
              }
              color={usuario.ausencias > 0 ? colores.error : colores.exito}
            />
          </View>
        </View>
      )}

      {esGestor && (
        <View style={estilos.seccion}>
          <Text style={[estilos.seccionTitulo, { color: colores.textoSecundario }]}>
            GESTIÓN
          </Text>
          <Boton
            titulo="Escanear ingresos"
            onPress={() => router.push("/(gestion)/escanear")}
          />
        </View>
      )}

      {selectorTema}

      <Boton titulo="Cerrar sesión" variante="peligro" onPress={confirmarSalida} />
    </ScrollView>
  );
}

function Tarjeta({
  valor,
  titulo,
  detalle,
  color,
}: {
  valor: number;
  titulo: string;
  detalle: string;
  color: string;
}) {
  const { colores } = useTema();
  return (
    <View
      style={[
        estilos.tarjeta,
        { backgroundColor: colores.superficie, borderColor: colores.borde },
      ]}
    >
      <Text style={[estilos.valor, { color }]}>{valor}</Text>
      <Text style={{ color: colores.texto, fontWeight: "bold", fontSize: 13 }}>{titulo}</Text>
      <Text style={{ color: colores.textoSecundario, fontSize: 12 }}>{detalle}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },
  contenido: { padding: 16, gap: 16 },
  titulo: { fontSize: 20, fontWeight: "bold" },
  cabecera: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  iniciales: { fontSize: 26, fontWeight: "bold" },
  nombre: { fontSize: 20, fontWeight: "bold" },
  seccion: { gap: 8 },
  seccionTitulo: { fontSize: 12, letterSpacing: 1 },
  fila: { flexDirection: "row", gap: 8 },
  opcion: { flex: 1, paddingVertical: 12, borderWidth: 1, borderRadius: 6, alignItems: "center" },
  tarjeta: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 12, gap: 4 },
  valor: { fontSize: 28, fontWeight: "bold" },
});