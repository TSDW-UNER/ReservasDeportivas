import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as z from "zod";
import { Boton } from "../../componentes/Boton";
import { CampoTexto } from "../../componentes/CampoTexto";
import { useTema } from "../../tema/useTema";

// Teléfono flexible: acepta "3455-401122", "+54 3455 401122", "(3455) 401122".
// Solo se exige que tenga entre 8 y 13 dígitos.
const soloDigitos = (s: string) => s.replace(/\D/g, "");

const schema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(3, { message: "Ingresá tu nombre completo" }),
    email: z.email({ message: "El email ingresado no es válido" }),
    telefono: z
      .string()
      .refine(
        (v) => {
          const n = soloDigitos(v).length;
          return n >= 8 && n <= 13;
        },
        { message: "Ingresá un teléfono válido" },
      ),
    pass: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
    confirmar: z.string(),
  })
  .refine((d) => d.pass === d.confirmar, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar"],
  });

type FormData = z.infer<typeof schema>;

export default function Registrar() {
  const { colores } = useTema();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      pass: "",
      confirmar: "",
    },
    mode: "onChange",
  });

  // Provisorio: cuando exista auth.ts, acá va await registrar({...}).
  // El registro público SIEMPRE crea un jugador: no se envía ni se elige rol.
  const registrar = async (data: FormData) => {
    setErrorGeneral(null);
    try {
      console.log("Registro válido:", data);
      router.replace("/(tabs)/perfil");
    } catch {
      setErrorGeneral("No pudimos crear la cuenta. Probá de nuevo.");
    }
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[estilos.flex, { backgroundColor: colores.fondo }]}
    >
      <KeyboardAvoidingView
        style={estilos.flex}
        behavior="padding"
      >
        <ScrollView
          contentContainerStyle={estilos.contenido}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Controller
            control={control}
            name="nombre"
            render={({ field: { value, onChange, onBlur } }) => (
              <CampoTexto
                etiqueta="Nombre y apellido"
                placeholder="Ej: Juan Peretto"
                autoCapitalize="words"
                autoComplete="name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.nombre?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <CampoTexto
                etiqueta="Email"
                placeholder="Ingrese su email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="telefono"
            render={({ field: { value, onChange, onBlur } }) => (
              <CampoTexto
                etiqueta="Teléfono"
                placeholder="Ej: 3492-309994"
                keyboardType="phone-pad"
                autoComplete="tel"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.telefono?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="pass"
            render={({ field: { value, onChange, onBlur } }) => (
              <CampoTexto
                etiqueta="Contraseña"
                placeholder="Mínimo 6 caracteres"
                esPassword
                value={value}
                onChangeText={(texto) => {
                  onChange(texto);
                  // si ya escribió la confirmación, revalidarla contra la nueva contraseña
                  if (getValues("confirmar")) trigger("confirmar");
                }}
                onBlur={onBlur}
                error={errors.pass?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmar"
            render={({ field: { value, onChange, onBlur } }) => (
              <CampoTexto
                etiqueta="Repetir contraseña"
                placeholder="Repita su contraseña"
                esPassword
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmar?.message}
              />
            )}
          />

          {errorGeneral && (
            <Text style={[estilos.errorGeneral, { color: colores.error }]}>
              {errorGeneral}
            </Text>
          )}

          <Boton
            titulo="Crear cuenta"
            disabled={!isValid}
            cargando={isSubmitting}
            onPress={() => handleSubmit(registrar)()}
          />

          <Pressable
            onPress={() => router.replace("/(auth)/ingresar")}
            style={estilos.enlace}
          >
            <Text style={{ color: colores.acento }}>
              ¿Ya tenés cuenta? Ingresá
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  contenido: { padding: 16, paddingBottom: 48, flexGrow: 1 },
  errorGeneral: { marginBottom: 12, fontSize: 14 },
  enlace: { alignItems: "center", paddingVertical: 12 },
});