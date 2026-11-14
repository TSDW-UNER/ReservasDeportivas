import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { BotonPrimario } from "../BotonPrimario";
import { CampoTexto } from "../CampoTexto";
import { FiltroChips, type OpcionFiltro } from "../FiltroChips";
import { HORARIOS_TURNO, NOMBRES_DIA, proximosDias } from "../formato";
import { useColoresProvisorios } from "../temaProvisorio";
import type { ReservaFija } from "../../../tipos";

export interface DatosFormularioReservaFija {
  espacioId: string;
  titular: string;
  dia: ReservaFija["dia"];
  inicio: string;
  fin: string;
  desde: string;
  hasta: string | null;
}

interface Props {
  espacioId: string;
  reserva?: ReservaFija | null;
  alGuardar: (datos: DatosFormularioReservaFija) => Promise<void>;
}

const OPCIONES_DIA: OpcionFiltro[] = NOMBRES_DIA.map((nombre, indice) => ({
  id: String(indice),
  etiqueta: nombre,
}));

const OPCIONES_INICIO: OpcionFiltro[] = HORARIOS_TURNO.map((hora) => ({
  id: hora,
  etiqueta: hora,
}));

function sumarUnaHora(hora: string): string {
  const horaFinal = Number(hora.slice(0, 2)) + 1;
  return `${String(horaFinal).padStart(2, "0")}:00`;
}

const OPCIONES_FIN: OpcionFiltro[] = [
  ...HORARIOS_TURNO.map((hora) => sumarUnaHora(hora)),
].map((hora) => ({
  id: hora,
  etiqueta: hora,
}));

function esFechaValida(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return false;
  }

  const [anio, mes, dia] = fecha.split("-").map(Number);
  const fechaDate = new Date(anio, mes - 1, dia);

  return (
    fechaDate.getFullYear() === anio &&
    fechaDate.getMonth() === mes - 1 &&
    fechaDate.getDate() === dia
  );
}

export function FormularioReservaFija({
  espacioId,
  reserva,
  alGuardar,
}: Props) {
  const colores = useColoresProvisorios();

  const fechaHoy = useMemo(() => proximosDias(1)[0].iso, []);

  const [titular, setTitular] = useState(reserva?.titular ?? "");
  const [dia, setDia] = useState<ReservaFija["dia"]>(
    reserva?.dia ?? (new Date().getDay() as ReservaFija["dia"]),
  );
  const [inicio, setInicio] = useState(reserva?.inicio ?? "18:00");
  const [fin, setFin] = useState(reserva?.fin ?? "19:00");
  const [desde, setDesde] = useState(reserva?.desde ?? fechaHoy);
  const [hasta, setHasta] = useState(reserva?.hasta ?? "");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const opcionesFin = useMemo(
    () =>
      OPCIONES_FIN.filter((opcion) => opcion.id !== null && opcion.id > inicio),
    [inicio],
  );

  const guardar = async () => {
    if (!titular.trim()) {
      setError("Escribí el nombre del titular o grupo.");
      return;
    }

    if (!esFechaValida(desde)) {
      setError("La fecha de inicio debe tener el formato AAAA-MM-DD.");
      return;
    }

    if (hasta.trim() && !esFechaValida(hasta.trim())) {
      setError("La fecha de finalización no es válida.");
      return;
    }

    if (hasta.trim() && hasta.trim() < desde) {
      setError("La fecha de finalización no puede ser anterior al inicio.");
      return;
    }

    if (fin <= inicio) {
      setError("El horario de fin debe ser posterior al de inicio.");
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      await alGuardar({
        espacioId,
        titular: titular.trim(),
        dia,
        inicio,
        fin,
        desde,
        hasta: hasta.trim() || null,
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo guardar la reserva fija. Probá de nuevo.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Text style={{ color: colores.textoSecundario }}>
        Titular o nombre del grupo
      </Text>

      <CampoTexto
        value={titular}
        onChangeText={setTitular}
        placeholder="Ej. Grupo de los martes"
      />

      <Text style={[estilos.etiqueta, { color: colores.texto }]}>
        Día de la semana
      </Text>

      <FiltroChips
        opciones={OPCIONES_DIA}
        seleccionado={String(dia)}
        alSeleccionar={(id) => {
          if (id !== null) {
            setDia(Number(id) as ReservaFija["dia"]);
          }
        }}
      />

      <Text style={[estilos.etiqueta, { color: colores.texto }]}>
        Horario de inicio
      </Text>

      <FiltroChips
        opciones={OPCIONES_INICIO}
        seleccionado={inicio}
        alSeleccionar={(id) => {
          if (id) {
            setInicio(id);

            if (fin <= id) {
              const siguiente = OPCIONES_FIN.find(
                (opcion) => opcion.id !== null && opcion.id > id,
              );

              if (siguiente?.id) {
                setFin(siguiente.id);
              }
            }
          }
        }}
      />

      <Text style={[estilos.etiqueta, { color: colores.texto }]}>
        Horario de fin
      </Text>

      <FiltroChips
        opciones={opcionesFin}
        seleccionado={fin}
        alSeleccionar={(id) => id && setFin(id)}
      />

      <Text style={[estilos.etiqueta, { color: colores.texto }]}>
        Vigencia desde (AAAA-MM-DD)
      </Text>

      <CampoTexto
        value={desde}
        onChangeText={setDesde}
        placeholder="2026-11-13"
      />

      <Text style={[estilos.etiqueta, { color: colores.texto }]}>
        Vigencia hasta (opcional)
      </Text>

      <CampoTexto
        value={hasta}
        onChangeText={setHasta}
        placeholder="Dejar vacío si no tiene fecha de fin"
      />

      {error && (
        <Text style={[estilos.error, { color: colores.error }]}>{error}</Text>
      )}

      {enviando ? (
        <View style={estilos.cargando}>
          <ActivityIndicator color={colores.primario} />
          <Text style={{ color: colores.textoSecundario }}>
            Guardando reserva fija...
          </Text>
        </View>
      ) : (
        <BotonPrimario
          texto={reserva ? "Guardar cambios" : "Crear reserva fija"}
          alPresionar={guardar}
        />
      )}
    </>
  );
}

const estilos = StyleSheet.create({
  etiqueta: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  error: {
    fontSize: 14,
  },
  cargando: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 12,
  },
});
