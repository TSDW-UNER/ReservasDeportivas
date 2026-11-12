import { useMemo, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { BotonPrimario } from "../BotonPrimario";
import { CampoTexto } from "../CampoTexto";
import { FiltroChips, type OpcionFiltro } from "../FiltroChips";
import { HORARIOS_TURNO, proximosDias } from "../formato";
import { useColoresProvisorios } from "../temaProvisorio";

export interface Bloqueo {
  espacioId: string;
  fecha: string; // "AAAA-MM-DD"
  horario: string | null; // "HH:MM"; null = día completo
  motivo: string;
}

interface Props {
  espacioId: string;
  alBloquear: (bloqueo: Bloqueo) => void;
}

const DIA_COMPLETO = "dia";
const OPCIONES_HORARIO: OpcionFiltro[] = [
  { id: DIA_COMPLETO, etiqueta: "Día completo" },
  ...HORARIOS_TURNO.map((hora) => ({ id: hora, etiqueta: hora })),
];

export function FormularioBloqueo({ espacioId, alBloquear }: Props) {
  const colores = useColoresProvisorios();
  const dias = useMemo(() => proximosDias(7), []);
  const opcionesFecha = useMemo(() => dias.map(({ iso, etiqueta }) => ({ id: iso, etiqueta })), [dias]);

  const [fecha, setFecha] = useState(dias[0].iso);
  const [horario, setHorario] = useState(DIA_COMPLETO);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const bloquear = () => {
    if (!motivo.trim()) return setError("Escribí el motivo del bloqueo.");
    alBloquear({
      espacioId,
      fecha,
      horario: horario === DIA_COMPLETO ? null : horario,
      motivo: motivo.trim(),
    });
    setMotivo("");
    setError(null);
  };

  return (
    <>
      <FiltroChips opciones={opcionesFecha} seleccionado={fecha} alSeleccionar={(id) => id && setFecha(id)} />
      <FiltroChips opciones={OPCIONES_HORARIO} seleccionado={horario} alSeleccionar={(id) => id && setHorario(id)} />
      <CampoTexto value={motivo} onChangeText={setMotivo} placeholder="Motivo (Lluvia, Mantenimiento...)" />
      {error && <Text style={[estilos.error, { color: colores.error }]}>{error}</Text>}
      <BotonPrimario texto="Bloquear" alPresionar={bloquear} />
    </>
  );
}

const estilos = StyleSheet.create({
  error: { fontSize: 14 },
});
