import type { Usuario } from "../tipos/usuario";

interface CuentaMock {
  usuario: Usuario;
  clave: string; // solo existe en el mock; la API real nunca devuelve la clave
}

// Una cuenta de cada rol, para probar el acceso por rol. Clave de todas: 123456
export const CUENTAS_MOCK: CuentaMock[] = [
  {
    clave: "123456",
    usuario: {
      id: "usr-207",
      nombre: "Emiliano Ruiz",
      email: "jugador@mail.com",
      telefono: "3455-401122",
      rol: "jugador",
      espaciosFavoritos: ["esp-02"],
      cancelacionesTardias: 2,
      ausencias: 1,
    },
  },
  {
    clave: "123456",
    usuario: {
      id: "usr-010",
      nombre: "Marcelo Gómez",
      email: "encargado@mail.com",
      telefono: "3455-112233",
      rol: "encargado",
      espaciosFavoritos: [],
      cancelacionesTardias: 0,
      ausencias: 0,
    },
  },
  {
    clave: "123456",
    usuario: {
      id: "usr-001",
      nombre: "Nahuel Ojeda",
      email: "admin@mail.com",
      telefono: "3455-445566",
      rol: "administrador",
      espaciosFavoritos: [],
      cancelacionesTardias: 0,
      ausencias: 0,
    },
  },
];