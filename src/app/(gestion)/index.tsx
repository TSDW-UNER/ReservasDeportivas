
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

import { FiltroChips } from "../../componentes/espacios/FiltroChips";
import { EditorPrecio } from "../../componentes/espacios/gestion/EditorPrecio";
import {
  FormularioBloqueo,
  type DatosFormularioBloqueo,
} from "../../componentes/espacios/gestion/FormularioBloqueo";
import {
  FormularioReservaFija,
  type DatosFormularioReservaFija,
} from "../../componentes/espacios/gestion/FormularioReservaFija";
import { ListaReservasFijas } from "../../componentes/espacios/gestion/ListaReservasFijas";
import { Seccion } from "../../componentes/espacios/gestion/Seccion";
import { useColoresProvisorios } from "../../componentes/espacios/temaProvisorio";
import { useSesion } from "../../hooks/useSesion";
import type { Bloqueo, Espacio, ReservaFija, Rol } from "../../tipos";
import {
  actualizarPrecioEspacio,
  listarEspacios,
} from "../../servicios/espacios";
import {
  crearBloqueo,
  eliminarBloqueo,
  listarBloqueos,
} from "../../servicios/bloqueos";
import {
  actualizarReservaFija,
  crearReservaFija,
  eliminarReservaFija,
  listarReservasFijas,
} from "../../servicios/reservasFijas";

const ROLES_CON_ACCESO: Rol[] = ["encargado", "administrador"];

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
  const { rol } = useSesion();
  const esAdministrador = rol === "administrador";

  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [reservasFijas, setReservasFijas] = useState<ReservaFija[]>([]);
  const [espacioId, setEspacioId] = useState("");

  const [reservaEnEdicion, setReservaEnEdicion] =
    useState<ReservaFija | null>(null);

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [errorDatos, setErrorDatos] = useState<string | null>(null);

  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);
  const [cargandoBloqueos, setCargandoBloqueos] = useState(false);
  const [errorBloqueos, setErrorBloqueos] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    setCargandoDatos(true);
    setErrorDatos(null);

    try {
      const [resultadoEspacios, resultadoFijas] = await Promise.all([
        listarEspacios(),
        listarReservasFijas(),
      ]);

      const espaciosActivos = resultadoEspacios.datos.filter(
        (espacio) => espacio.activo,
      );

      setEspacios(espaciosActivos);
      setReservasFijas(resultadoFijas);

      setEspacioId((actual) => {
        if (espaciosActivos.some((e) => e.id === actual)) {
          return actual;
        }

        return espaciosActivos[0]?.id ?? "";
      });
    } catch (e) {
      setErrorDatos(
        e instanceof Error
          ? e.message
          : "No se pudieron cargar los datos de gestión.",
      );
    } finally {
      setCargandoDatos(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const cargarBloqueos = useCallback(async () => {
    if (!espacioId) return;

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

  const guardarPrecio = async (precio: number) => {
    if (!espacioId) return;

    await actualizarPrecioEspacio(espacioId, precio);

    setEspacios((actuales) =>
      actuales.map((espacio) =>
        espacio.id === espacioId
          ? { ...espacio, precioPorHora: precio }
          : espacio,
      ),
    );
  };

  const guardarReservaFija = async (
    datos: DatosFormularioReservaFija,
  ) => {
    if (reservaEnEdicion) {
      const actualizada = await actualizarReservaFija(
        reservaEnEdicion.id,
        datos,
      );

      setReservasFijas((actuales) =>
        actuales.map((reserva) =>
          reserva.id === actualizada.id ? actualizada : reserva,
        ),
      );

      setReservaEnEdicion(null);
      return;
    }

    const nueva = await crearReservaFija(datos);

    setReservasFijas((actuales) => [...actuales, nueva]);
  };

  const confirmarEliminarReservaFija = (id: string) => {
    Alert.alert(
      "Dar de baja reserva fija",
      "¿Seguro que querés dar de baja esta reserva fija? Ya no ocupará ese horario en las semanas siguientes.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Dar de baja",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await eliminarReservaFija(id);

                setReservasFijas((actuales) =>
                  actuales.map((reserva) =>
                    reserva.id === id
                      ? { ...reserva, activa: false }
                      : reserva,
                  ),
                );

                if (reservaEnEdicion?.id === id) {
                  setReservaEnEdicion(null);
                }
              } catch (e) {
                Alert.alert(
                  "No se pudo dar de baja",
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

  const opcionesEspacio = espacios.map(({ id, nombre }) => ({
    id,
    etiqueta: nombre,
  }));

  const espacio = espacios.find((e) => e.id === espacioId);

  const bloqueosDelEspacio = bloqueos.filter(
    (b) => b.espacioId === espacioId,
  );

  const fijasDelEspacio = reservasFijas.filter(
    (r) => r.espacioId === espacioId,
  );

  if (cargandoDatos) {
    return (
      <View style={[estilos.centrado, { backgroundColor: colores.fondo }]}>
        <ActivityIndicator color={colores.primario} size="large" />
        <Text style={{ color: colores.textoSecundario }}>
          Cargando datos de gestión...
        </Text>
      </View>
    );
  }

  if (errorDatos) {
    return (
      <View style={[estilos.centrado, { backgroundColor: colores.fondo }]}>
        <Text style={{ color: colores.error, textAlign: "center" }}>
          {errorDatos}
        </Text>

        <Pressable onPress={() => void cargarDatos()}>
          <Text style={{ color: colores.primario, fontWeight: "700" }}>
            Reintentar
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!espacio) {
    return (
      <View style={[estilos.centrado, { backgroundColor: colores.fondo }]}>
        <Text style={{ color: colores.textoSecundario }}>
          No hay espacios disponibles para gestionar.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <FiltroChips
        opciones={opcionesEspacio}
        seleccionado={espacioId}
        alSeleccionar={(id) => {
          if (id) {
            setEspacioId(id);
            setReservaEnEdicion(null);
          }
        }}
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
          precioActual={espacio.precioPorHora}
          alGuardar={guardarPrecio}
        />
      </Seccion>

      <Seccion titulo="Reservas fijas">
        {esAdministrador ? (
          <>
            <Text style={[estilos.subtitulo, { color: colores.texto }]}>
              {reservaEnEdicion
                ? "Editar reserva fija"
                : "Nueva reserva fija"}
            </Text>

            <FormularioReservaFija
              key={reservaEnEdicion?.id ?? `nueva-${espacio.id}`}
              espacioId={espacio.id}
              reserva={reservaEnEdicion}
              alGuardar={guardarReservaFija}
            />

            {reservaEnEdicion && (
              <Pressable
                onPress={() => setReservaEnEdicion(null)}
                style={estilos.cancelarEdicion}
              >
                <Text style={{ color: colores.textoSecundario }}>
                  Cancelar edición
                </Text>
              </Pressable>
            )}
          </>
        ) : (
          <Text style={{ color: colores.textoSecundario }}>
            Podés consultar las reservas fijas. La API actualmente permite
            crearlas, editarlas y darlas de baja únicamente con una cuenta
            administradora.
          </Text>
        )}

        <Text style={[estilos.subtitulo, { color: colores.texto }]}>
          Reservas registradas
        </Text>

        <ListaReservasFijas
          reservas={fijasDelEspacio}
          puedeGestionar={esAdministrador}
          alEditar={esAdministrador ? setReservaEnEdicion : undefined}
          alEliminar={
            esAdministrador ? confirmarEliminarReservaFija : undefined
          }
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
  contenido: {
    padding: 16,
    gap: 14,
  },
  centrado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
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
  cancelarEdicion: {
    alignItems: "center",
    paddingVertical: 10,
  },
});
