import * as LocalAuthentication from "expo-local-authentication";

// hasHardwareAsync dice si el teléfono TIENE sensor.
// isEnrolledAsync dice si el usuario REGISTRÓ una huella o rostro.
// Con sensor pero sin huella registrada, authenticateAsync no sirve: por eso se piden las dos.
export async function biometriaDisponible(): Promise<boolean> {
  try {
    const hardware = await LocalAuthentication.hasHardwareAsync();
    if (!hardware) return false;
    return await LocalAuthentication.isEnrolledAsync();
  } catch {
    return false;
  }
}

export async function pedirBiometria(motivo: string): Promise<boolean> {
  try {
    const r = await LocalAuthentication.authenticateAsync({
      promptMessage: motivo,
      cancelLabel: "Cancelar",
      disableDeviceFallback: false,
    });
    return r.success;
  } catch {
    return false;
  }
}