import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
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

const schema = z.object({
  email: z.email({ message: "El email ingresado no es válido" }),
  pass: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

type FormData = z.infer<typeof schema>;

export default function Ingresar() {
  const { colores } = useTema();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", pass: "" },
    mode: "onChange",
  });

  // async: cuando exista SesionContext, acá se hace await ingresar(...)
  // y isSubmitting activa solo el spinner del botón.
  const login = async (data: FormData) => {
    console.log("Datos válidos:", data);
    router.replace("/(tabs)/perfil");
  };

  return (
    <SafeAreaView style={[estilos.flex, { backgroundColor: colores.fondo }]}>
      <KeyboardAvoidingView
        style={estilos.flex}
        behavior="padding"
        >
        <ScrollView
          contentContainerStyle={estilos.contenido}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
              >
          <Text style={[estilos.titulo, { color: colores.texto }]}>
            Iniciar sesión
          </Text>

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
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="pass"
            render={({ field: { value, onChange, onBlur } }) => (
              <CampoTexto
                etiqueta="Contraseña"
                placeholder="Ingrese su contraseña"
                esPassword
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.pass?.message}
              />
            )}
          />

          <Boton
            titulo="Iniciar sesión"
            disabled={!isValid}
            cargando={isSubmitting}
            onPress={() => handleSubmit(login)()}
          />

          <Pressable
            onPress={() => router.push("/(auth)/registrar")}
            style={estilos.enlace}
          >
            <Text style={{ color: colores.acento }}>
              ¿No tenés cuenta? Registrate
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace("/(tabs)/perfil")}
            style={estilos.enlace}
          >
            <Text style={{ color: colores.textoSecundario }}>
              Seguir sin cuenta
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
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  enlace: { alignItems: "center", paddingVertical: 12 },
});