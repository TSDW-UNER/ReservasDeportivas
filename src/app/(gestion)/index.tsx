
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { espaciosFalsos, reservasFijasFalsas } from "../../componentes/espacios/datosFalsos";
import { FiltroChips } from "../../componentes/espacios/FiltroChips";
import { EditorPrecio } from "../../componentes/espacios/gestion/EditorPrecio";
import {
  FormularioBloqueo,
  type DatosFormularioBloqueo,
} from "../../componentes/espacios/gestion/FormularioBloqueo";
import { ListaReservasFijas } from "../../componentes/espacios/gestion/ListaReservasFijas";
import { Seccion } from "../../componentes/espacios/gestion/Seccion";
import { useColoresProvisorios } from "../../componentes/espacios/temaProvisorio";
import { useSesion } from "../../hooks/useSesion";
import type { Bloqueo, Rol } from "../../tipos";
import {
  crearBloqueo,
  eliminarBloqueo,
  listarBloqueos,
} from "../../servicios/bloqueos";

const ROLES_CON_ACCESO: Rol[] = ["encargado", "administrador"];

const OPCIONES_ESPACIO = espaciosFalsos.map(({ id, nombre }) => ({
  id,
  etiqueta: nombre,
}));

function sumarUnaHora(hora: string): string {
  const horaFinal = Number(hora.slice(0, 2)) + 1;
  return `${String(horaFinal).padStart(2, "0")}:00`;
}

export default function GestionScreen() {
  const { rol } = useSesion();

  return rol && ROLES_CON_ACCESO.includes(rol) ? (
    <PanelGestion />
  ) : (
    <AccesoRestringido />
  );
}

function PanelGestion() {
  const colores = useColoresProvisorios();

  const [espacioId, setEspacioId] = useState(espaciosFalsos[0].id);
  const [precios, setPrecios] = useState<Record<string, number>>({});
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);
  const [cargandoBloqueos, setCargandoBloqueos] = useState(true);
  const [errorBloqueos, setErrorBloqueos] = useState<string | null>(null);

  const espacio =
    espaciosFalsos.find((e) => e.id === espacioId) ?? espaciosFalsos[0];

  const cargarBloqueos = useCallback(async () => {
    setCargandoBloqueos(true);
    setErrorBloqueos(null);

    try {
      const datos = await listarBloqueos({ espacioId });
      setBloqueos(datos);
    } catch (e) {
      setErrorBloqueos(
        e instanceof Error
          ? e.message
          : "No se pudieron cargar los bloqueos.",
      );
    } finally {
      setCargandoBloqueos(false);
    }
  }, [espacioId]);

  useEffect(() => {
    void cargarBloqueos();
  }, [cargarBloqueos]);

  const guardarBloqueo = async (datos: DatosFormularioBloqueo) => {
    const horario = datos.horario;

    const creados = await crearBloqueo({
      espacioIds: [datos.espacioId],
      fecha: datos.fecha,
      ...(horario
        ? {
            inicio: horario,
            fin: sumarUnaHora(horario),
          }
        : {}),
      motivo: datos.motivo,
    });

    setBloqueos((actuales) => [...actuales, ...creados]);
    setErrorBloqueos(null);
  };

  const confirmarEliminar = (id: string) => {
    Alert.alert(
      "Eliminar bloqueo",
      "¿Seguro que querés eliminar este bloqueo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await eliminarBloqueo(id);
                setBloqueos((actuales) =>
                  actuales.filter((b) => b.id !== id),
                );
                setErrorBloqueos(null);
              } catch (e) {
                Alert.alert(
                  "No se pudo eliminar",
                  e instanceof Error
                    ? e.message
                    : "Probá de nuevo más tarde.",
                );
              }
            })();
          },
        },
      ],
    );
  };

  const bloqueosDelEspacio = bloqueos.filter(
    (b) => b.espacioId === espacio.id,
  );

  return (
    <ScrollView
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <FiltroChips
        opciones={OPCIONES_ESPACIO}
        seleccionado={espacio.id}
        alSeleccionar={(id) => id && setEspacioId(id)}
      />

      <Seccion titulo="Bloquear turno o día">
        <FormularioBloqueo
          espacioId={espacio.id}
          alBloquear={guardarBloqueo}
        />

        <Text style={[estilos.subtitulo, { color: colores.texto }]}>
          Bloqueos registrados
        </Text>

        {cargandoBloqueos ? (
          <ActivityIndicator color={colores.primario} />
        ) : errorBloqueos ? (
          <View style={estilos.mensaje}>
            <Text style={{ color: colores.error }}>{errorBloqueos}</Text>
            <Pressable onPress={() => void cargarBloqueos()}>
              <Text style={{ color: colores.primario, fontWeight: "700" }}>
                Reintentar
              </Text>
            </Pressable>
          </View>
        ) : bloqueosDelEspacio.length === 0 ? (
          <Text style={{ color: colores.textoSecundario }}>
            No hay bloqueos registrados para este espacio.
          </Text>
        ) : (
          bloqueosDelEspacio.map((b) => (
            <View
              key={b.id}
              style={[
                estilos.filaBloqueo,
                { borderColor: colores.borde },
              ]}
            >
              <View style={estilos.detalleBloqueo}>
                <Text style={{ color: colores.texto, fontWeight: "600" }}>
                  {b.fecha} ·{" "}
                  {b.inicio && b.fin
                    ? `${b.inicio} a ${b.fin}`
                    : "Día completo"}
                </Text>
                <Text style={{ color: colores.textoSecundario }}>
                  {b.motivo}
                </Text>
              </View>

              <Pressable
                onPress={() => confirmarEliminar(b.id)}
                accessibilityRole="button"
                accessibilityLabel="Eliminar bloqueo"
              >
                <Text style={{ color: colores.error, fontWeight: "700" }}>
                  Eliminar
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </Seccion>

      <Seccion titulo="Precio por hora">
        <EditorPrecio
          key={espacio.id}
          precioActual={
            precios[espacio.id] ?? espacio.precioPorHora
          }
          alGuardar={(precio) =>
            setPrecios((previos) => ({
              ...previos,
              [espacio.id]: precio,
            }))
          }
        />
      </Seccion>

      <Seccion titulo="Reservas fijas">
        <ListaReservasFijas
          reservas={reservasFijasFalsas.filter(
            (r) => r.espacioId === espacio.id,
          )}
        />
      </Seccion>
    </ScrollView>
  );
}

function AccesoRestringido() {
  const colores = useColoresProvisorios();

  return (
    <View style={[estilos.centrado, { backgroundColor: colores.fondo }]}>
      <Text
        style={{
          color: colores.textoSecundario,
          fontSize: 16,
          textAlign: "center",
        }}
      >
        Esta sección es solo para encargados y administradores.
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, gap: 14 },
  centrado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  subtitulo: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
  },
  mensaje: {
    gap: 8,
  },
  filaBloqueo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  detalleBloqueo: {
    flex: 1,
    gap: 4,
  },
});
