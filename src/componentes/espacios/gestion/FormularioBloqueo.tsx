
import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { BotonPrimario } from "../BotonPrimario";
import { CampoTexto } from "../CampoTexto";
import { FiltroChips, type OpcionFiltro } from "../FiltroChips";
import { HORARIOS_TURNO, proximosDias } from "../formato";
import { useColoresProvisorios } from "../temaProvisorio";

export interface DatosFormularioBloqueo {
  espacioId: string;
  fecha: string;
  horario: string | null;
  motivo: string;
}

interface Props {
  espacioId: string;
  alBloquear: (bloqueo: DatosFormularioBloqueo) => Promise<void>;
}

const DIA_COMPLETO = "dia";

const OPCIONES_HORARIO: OpcionFiltro[] = [
  { id: DIA_COMPLETO, etiqueta: "Día completo" },
  ...HORARIOS_TURNO.map((hora) => ({ id: hora, etiqueta: hora })),
];

export function FormularioBloqueo({ espacioId, alBloquear }: Props) {
  const colores = useColoresProvisorios();

  const dias = useMemo(() => proximosDias(7), []);
  const opcionesFecha = useMemo(
    () => dias.map(({ iso, etiqueta }) => ({ id: iso, etiqueta })),
    [dias],
  );

  const [fecha, setFecha] = useState(dias[0].iso);
  const [horario, setHorario] = useState(DIA_COMPLETO);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const bloquear = async () => {
    if (!motivo.trim()) {
      setError("Escribí el motivo del bloqueo.");
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      await alBloquear({
        espacioId,
        fecha,
        horario: horario === DIA_COMPLETO ? null : horario,
        motivo: motivo.trim(),
      });

      setMotivo("");
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo crear el bloqueo. Probá de nuevo.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <FiltroChips
        opciones={opcionesFecha}
        seleccionado={fecha}
        alSeleccionar={(id) => id && setFecha(id)}
      />

      <FiltroChips
        opciones={OPCIONES_HORARIO}
        seleccionado={horario}
        alSeleccionar={(id) => id && setHorario(id)}
      />

      <CampoTexto
        value={motivo}
        onChangeText={setMotivo}
        placeholder="Motivo (Lluvia, mantenimiento...)"
      />

      {error && (
        <Text style={[estilos.error, { color: colores.error }]}>
          {error}
        </Text>
      )}

      {enviando ? (
        <View style={estilos.cargando}>
          <ActivityIndicator color={colores.primario} />
          <Text style={{ color: colores.textoSecundario }}>
            Creando bloqueo...
          </Text>
        </View>
      ) : (
        <BotonPrimario texto="Bloquear" alPresionar={bloquear} />
      )}
    </>
  );
}

const estilos = StyleSheet.create({
  error: { fontSize: 14 },
  cargando: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 12,
  },
});
