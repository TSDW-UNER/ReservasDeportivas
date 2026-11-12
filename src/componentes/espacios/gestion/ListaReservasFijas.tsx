import { Text } from "react-native";
import type { ReservaFija } from "../datosFalsos";
import { NOMBRES_DIA } from "../formato";
import { useColoresProvisorios } from "../temaProvisorio";

interface Props {
  reservas: ReservaFija[];
}

/** "Martes 21:00–22:00 · Grupo de los martes" */
export function ListaReservasFijas({ reservas }: Props) {
  const colores = useColoresProvisorios();
  const activas = reservas.filter((r) => r.activa);

  if (activas.length === 0) {
    return <Text style={{ color: colores.textoSecundario }}>Este espacio no tiene reservas fijas.</Text>;
  }

  return (
    <>
      {activas.map((r) => (
        <Text key={r.id} style={{ color: colores.texto, fontSize: 15 }}>
          {NOMBRES_DIA[r.dia]} {r.inicio}–{r.fin} · {r.titular}
        </Text>
      ))}
    </>
  );
}
