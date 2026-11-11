export type Rol = "jugador" | "encargado" | "administrador";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: Rol;
  espaciosFavoritos: string[];
  cancelacionesTardias: number;
  ausencias: number;
}

// Lo que envía el formulario de registro. El rol NO viaja: siempre se crea un jugador.
export interface DatosRegistro {
  nombre: string;
  email: string;
  telefono: string;
  clave: string;
}