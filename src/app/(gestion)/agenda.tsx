
import { Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColoresProvisorios } from "../../componentes/espacios/temaProvisorio";
import { listarAgenda } from "../../servicios/agenda";
import { listarEspacios } from "../../servicios/espacios";
import type { Espacio, Turno } from "../../tipos";

function fechaLocal(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function cambiarFecha(fecha: string, dias: number): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const nueva = new Date(anio, mes - 1, dia + dias);

  return fechaLocal(nueva);
}

function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const fechaDate = new Date(anio, mes - 1, dia);

  return fechaDate.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function nombreEstado(estado: Turno["estado"]): string {
  switch (estado) {
    case "libre":
      return "Libre";
    case "reservado":
      return "Reservado";
    case "fijo":
      return "Reserva fija";
    case "mantenimiento":
      return "Mantenimiento";
  }
}

export default function AgendaScreen() {
  const colores = useColoresProvisorios();

  const [fecha, setFecha] = useState(() => fechaLocal(new Date()));
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarAgenda = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const [resultadoEspacios, resultadoAgenda] = await Promise.all([
        listarEspacios(),
        listarAgenda(fecha),
      ]);

      setEspacios(
        resultadoEspacios.datos.filter((espacio) => espacio.activo),
      );
      setTurnos(resultadoAgenda);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo cargar la agenda.",
      );
    } finally {
      setCargando(false);
    }
  }, [fecha]);

  useEffect(() => {
    void cargarAgenda();
  }, [cargarAgenda]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Agenda diaria",
          headerShown: true,
          headerBackButtonDisplayMode: "minimal",
          headerStyle: { backgroundColor: colores.tarjeta },
          headerTintColor: colores.texto,
          headerTitleStyle: { color: colores.texto },
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={{ backgroundColor: colores.fondo }}
        contentContainerStyle={estilos.contenido}
      >
        <View style={estilos.selectorFecha}>
          <Pressable
            onPress={() => setFecha((actual) => cambiarFecha(actual, -1))}
            style={[estilos.botonFecha, { borderColor: colores.borde }]}
          >
            <Text style={{ color: colores.texto, fontSize: 18 }}>
              {"<"}
            </Text>
          </Pressable>

          <View style={estilos.fechaCentral}>
            <Text
              style={[
                estilos.fechaTexto,
                { color: colores.texto },
              ]}
            >
              {formatearFecha(fecha)}
            </Text>

            <Pressable onPress={() => setFecha(fechaLocal(new Date()))}>
              <Text style={{ color: colores.primario, fontWeight: "700" }}>
                Ir a hoy
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => setFecha((actual) => cambiarFecha(actual, 1))}
            style={[estilos.botonFecha, { borderColor: colores.borde }]}
          >
            <Text style={{ color: colores.texto, fontSize: 18 }}>
              {">"}
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => void cargarAgenda()}
          style={[estilos.botonActualizar, { borderColor: colores.borde }]}
        >
          <Text style={{ color: colores.primario, fontWeight: "700" }}>
            Actualizar agenda
          </Text>
        </Pressable>

        {cargando ? (
          <View style={estilos.centrado}>
            <ActivityIndicator color={colores.primario} size="large" />
            <Text style={{ color: colores.textoSecundario }}>
              Cargando agenda...
            </Text>
          </View>
        ) : error ? (
          <View style={estilos.centrado}>
            <Text style={{ color: colores.error, textAlign: "center" }}>
              {error}
            </Text>

            <Pressable onPress={() => void cargarAgenda()}>
              <Text style={{ color: colores.primario, fontWeight: "700" }}>
                Reintentar
              </Text>
            </Pressable>
          </View>
        ) : espacios.length === 0 ? (
          <Text style={{ color: colores.textoSecundario }}>
            No hay espacios activos para mostrar.
          </Text>
        ) : (
          <>
            <Text style={{ color: colores.textoSecundario }}>
              {espacios.length} espacios · {turnos.length} turnos
            </Text>

            {espacios.map((espacio) => {
              const turnosDelEspacio = turnos
                .filter((turno) => turno.espacioId === espacio.id)
                .sort((a, b) => a.inicio.localeCompare(b.inicio));

              return (
                <View
                  key={espacio.id}
                  style={[
                    estilos.tarjetaEspacio,
                    {
                      backgroundColor: colores.tarjeta,
                      borderColor: colores.borde,
                    },
                  ]}
                >
                  <Text style={[estilos.nombreEspacio, { color: colores.texto }]}>
                    {espacio.nombre}
                  </Text>

                  {turnosDelEspacio.length === 0 ? (
                    <Text style={{ color: colores.textoSecundario }}>
                      No hay turnos registrados para este espacio.
                    </Text>
                  ) : (
                    <View style={estilos.grilla}>
                      {turnosDelEspacio.map((turno) => (
                        <View
                          key={turno.id}
                          style={[
                            estilos.casillero,
                            { borderColor: colores.borde },
                          ]}
                        >
                          <Text
                            style={[
                              estilos.horario,
                              { color: colores.texto },
                            ]}
                          >
                            {turno.inicio} - {turno.fin}
                          </Text>

                          <Text
                            style={{
                              color:
                                turno.estado === "mantenimiento"
                                  ? colores.error
                                  : turno.estado === "libre"
                                    ? colores.primario
                                    : colores.textoSecundario,
                              fontWeight: "700",
                              fontSize: 12,
                            }}
                          >
                            {nombreEstado(turno.estado)}
                          </Text>

                          {turno.motivoBloqueo && (
                            <Text
                              style={{
                                color: colores.textoSecundario,
                                fontSize: 11,
                              }}
                            >
                              {turno.motivoBloqueo}
                            </Text>
                          )}

                          <Text
                            style={{
                              color: colores.textoSecundario,
                              fontSize: 11,
                            }}
                          >
                            ${turno.precio.toLocaleString("es-AR")}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    padding: 16,
    gap: 14,
  },
  selectorFecha: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  botonFecha: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  fechaCentral: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  fechaTexto: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "capitalize",
  },
  botonActualizar: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  centrado: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  tarjetaEspacio: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  nombreEspacio: {
    fontSize: 17,
    fontWeight: "700",
  },
  grilla: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  casillero: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 8,
    padding: 9,
    gap: 5,
  },
  horario: {
    fontSize: 13,
    fontWeight: "700",
  },
});
