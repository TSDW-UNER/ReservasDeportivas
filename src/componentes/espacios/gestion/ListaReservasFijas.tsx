
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ReservaFija } from "../../../tipos";
import { NOMBRES_DIA } from "../formato";
import { useColoresProvisorios } from "../temaProvisorio";

interface Props {
  reservas: ReservaFija[];
  puedeGestionar?: boolean;
  alEditar?: (reserva: ReservaFija) => void;
  alEliminar?: (id: string) => void;
}

/**
 * Lista las reservas fijas activas de un espacio.
 *
 * Si puedeGestionar es true, permite editar y dar de baja reservas.
 */
export function ListaReservasFijas({
  reservas,
  puedeGestionar = false,
  alEditar,
  alEliminar,
}: Props) {
  const colores = useColoresProvisorios();
  const activas = reservas.filter((r) => r.activa);

  if (activas.length === 0) {
    return (
      <Text style={{ color: colores.textoSecundario }}>
        Este espacio no tiene reservas fijas activas.
      </Text>
    );
  }

  return (
    <View style={estilos.lista}>
      {activas.map((r) => (
        <View
          key={r.id}
          style={[
            estilos.fila,
            { borderBottomColor: colores.borde },
          ]}
        >
          <View style={estilos.detalle}>
            <Text style={{ color: colores.texto, fontSize: 15 }}>
              {NOMBRES_DIA[r.dia]} {r.inicio}–{r.fin}
            </Text>

            <Text style={{ color: colores.textoSecundario }}>
              {r.titular}
            </Text>

            <Text style={{ color: colores.textoSecundario, fontSize: 12 }}>
              Desde: {r.desde}
              {r.hasta ? ` · Hasta: ${r.hasta}` : " · Sin fecha de fin"}
            </Text>
          </View>

          {puedeGestionar && (
            <View style={estilos.acciones}>
              {alEditar && (
                <Pressable
                  onPress={() => alEditar(r)}
                  accessibilityRole="button"
                  accessibilityLabel={`Editar reserva fija de ${r.titular}`}
                >
                  <Text style={{ color: colores.primario, fontWeight: "700" }}>
                    Editar
                  </Text>
                </Pressable>
              )}

              {alEliminar && (
                <Pressable
                  onPress={() => alEliminar(r.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Dar de baja reserva fija de ${r.titular}`}
                >
                  <Text style={{ color: colores.error, fontWeight: "700" }}>
                    Dar de baja
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  lista: {
    gap: 8,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  detalle: {
    flex: 1,
    gap: 4,
  },
  acciones: {
    alignItems: "flex-end",
    gap: 12,
  },
});
