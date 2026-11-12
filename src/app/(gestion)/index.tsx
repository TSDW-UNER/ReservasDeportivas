import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { espaciosFalsos, reservasFijasFalsas } from "../../componentes/espacios/datosFalsos";
import { FiltroChips } from "../../componentes/espacios/FiltroChips";
import { EditorPrecio } from "../../componentes/espacios/gestion/EditorPrecio";
import { FormularioBloqueo, type Bloqueo } from "../../componentes/espacios/gestion/FormularioBloqueo";
import { ListaReservasFijas } from "../../componentes/espacios/gestion/ListaReservasFijas";
import { Seccion } from "../../componentes/espacios/gestion/Seccion";
import { useColoresProvisorios } from "../../componentes/espacios/temaProvisorio";

type Rol = "jugador" | "encargado" | "administrador";

const ROL_ACTUAL: Rol = "administrador";
const ROLES_CON_ACCESO: Rol[] = ["encargado", "administrador"];

const OPCIONES_ESPACIO = espaciosFalsos.map(({ id, nombre }) => ({ id, etiqueta: nombre }));

export default function GestionScreen() {
  return ROLES_CON_ACCESO.includes(ROL_ACTUAL) ? <PanelGestion /> : <AccesoRestringido />;
}

function PanelGestion() {
  const colores = useColoresProvisorios();
  const [espacioId, setEspacioId] = useState(espaciosFalsos[0].id);
  const [precios, setPrecios] = useState<Record<string, number>>({});
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);

  const espacio = espaciosFalsos.find((e) => e.id === espacioId) ?? espaciosFalsos[0];
  const bloqueosDelEspacio = bloqueos.filter((b) => b.espacioId === espacio.id);

  return (
    <ScrollView
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <FiltroChips opciones={OPCIONES_ESPACIO} seleccionado={espacio.id} alSeleccionar={(id) => id && setEspacioId(id)} />

      <Seccion titulo="Bloquear turno o día">
        <FormularioBloqueo espacioId={espacio.id} alBloquear={(b) => setBloqueos((previos) => [...previos, b])} />
        {bloqueosDelEspacio.map((b) => (
          <Text key={`${b.fecha}-${b.horario}-${b.motivo}`} style={{ color: colores.textoSecundario }}>
            {b.fecha} · {b.horario ?? "Día completo"} — {b.motivo}
          </Text>
        ))}
      </Seccion>

      <Seccion titulo="Precio por hora">
        <EditorPrecio
          key={espacio.id}
          precioActual={precios[espacio.id] ?? espacio.precioPorHora}
          alGuardar={(precio) => setPrecios((previos) => ({ ...previos, [espacio.id]: precio }))}
        />
      </Seccion>

      <Seccion titulo="Reservas fijas">
        <ListaReservasFijas reservas={reservasFijasFalsas.filter((r) => r.espacioId === espacio.id)} />
      </Seccion>
    </ScrollView>
  );
}

function AccesoRestringido() {
  const colores = useColoresProvisorios();

  return (
    <View style={[estilos.centrado, { backgroundColor: colores.fondo }]}>
      <Text style={{ color: colores.textoSecundario, fontSize: 16, textAlign: "center" }}>
        Esta sección es solo para encargados y administradores.
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, gap: 14 },
  centrado: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
});
