# 🏟️ ReservasDeportivas — TFI Desarrollo para Móviles (UNER 2026)

Aplicación móvil para que los vecinos de Villaguay (Entre Ríos) vean la disponibilidad de los 11 espacios deportivos municipales, reserven su turno, reciban recordatorios y entren el día del turno mostrando un código QR. El encargado y el administrador gestionan bloqueos, reservas fijas y asistencia desde la misma app.

Construida con **React Native + Expo (Expo Router) + TypeScript**. Cliente: Dirección de Deportes de la Municipalidad de Villaguay (PRD "Reservas Deportivas").

> ⚠️ Este README es una guía de arranque. Se actualiza al finalizar el proyecto.

---

## 👥 Equipo y responsabilidades

Cada integrante es **dueño** de un bloque (carpetas, pantallas y requisitos del TFI) y tiene que poder explicar cada línea en la defensa oral.

| Integrante | Bloque | Responsable de |
| :--- | :--- | :--- |
| **1 — [nombre]** | Datos, API y offline | `tipos/`, `mocks/`, `servicios/` (cliente HTTP y toggle mock/API), `db/` (SQLite), `expo-network`, caché, sincronización |
| **2 — [nombre]** | Catálogo, mapa, multimedia y gestión | Listado y filtros, ficha del espacio, mapa y "cómo llegar", video, fotos, favoritos. Panel de gestión: bloqueos, reservas fijas, agenda del día, precio |
| **3 — [nombre]** | Disponibilidad, reservas y avisos | `dominio/` (cruce de turnos + fijas + bloqueos), grilla, reservar, mis reservas, cancelar, límite de 3, QR en pantalla, notificaciones locales |
| **4 — [nombre]** | Identidad, acceso e ingreso | Registro/login, `expo-secure-store`, biometría, roles, perfil, escáner QR del encargado, marcar ausentes, háptica, ícono/splash/`app.json`/`eas.json`/builds |

### Requisitos mínimos del TFI → responsable principal

| # | Requisito | Responsable |
| :-: | :--- | :--- |
| 1 | Pantallas y navegación (Expo Router) | Todos (cada uno las de su bloque) |
| 2 | Autenticación + secure-store + local-authentication | 4 |
| 3 | Consumo de API tras capa de servicios, con estados carga/vacío/error | 1 (todos consumen) |
| 4 | Cámara (QR) / image-picker + `expo-file-system` (File, Directory, Paths) | 4 (cámara QR) · 2 (fotos y archivos) |
| 5 | `expo-location` + `react-native-maps` (usable sin permiso) | 2 |
| 6 | Notificaciones locales disparadas por hechos reales | 3 |
| 7 | `expo-sqlite` + `kv-store` + `expo-network` (abrir sin conexión) | 1 |
| 8 | Háptica / sensores con sentido | 4 |
| 9 | Video con `expo-video` y controles visibles | 2 |
| 10 | Ícono 1024×1024 sin transparencias, splash y nombre | 4 |

---

## 📐 Arquitectura de carpetas

```text
ReservasDeportivas/
├── src/
│   ├── app/                  # Rutas y pantallas (Expo Router)
│   │   ├── _layout.tsx
│   │   ├── (auth)/           # login, registro
│   │   ├── (tabs)/           # espacios, reservas, perfil
│   │   ├── (gestion)/        # encargado / administrador
│   │   ├── espacio/[id].tsx
│   │   ├── disponibilidad/[espacioId].tsx
│   │   └── reserva/[id].tsx
│   ├── tipos/                # Interfaces TypeScript (se escriben UNA vez)
│   ├── mocks/                # Datos falsos tipados, con casos feos
│   ├── servicios/            # Única puerta de entrada a los datos (async)
│   ├── dominio/              # Lógica pura (grilla, cancelación, reglas). Sin React ni Expo
│   ├── db/                   # SQLite: esquema, migraciones, repositorios
│   ├── almacenamiento/       # secure-store (token) y kv-store (preferencias)
│   ├── componentes/          # Componentes reutilizables
│   ├── hooks/                # useRed, useSesion, useDisponibilidad...
│   ├── contextos/            # Sesión, red
│   ├── tema/                 # Colores claro/oscuro, espaciados, tipografía
│   └── utils/                # Fechas, formato de precios
├── assets/                   # icon.png (1024x1024), splash, imágenes, fuentes
├── app.json
├── eas.json
└── package.json
```

### Reglas de cada carpeta

- **`tipos/`**: se definen una sola vez según el PRD (`Espacio`, `Deporte`, `Turno`, `Reserva`, `ReservaFija`, `Usuario`, más los tipos de la respuesta de la API). No se modifican cuando llegue la API. Cualquier cambio se acuerda entre los 4.
- **`mocks/`**: tipados con `tipos/`. Deben incluir: día entero bloqueado por lluvia, grilla sin turnos libres, espacio sin video, reserva cancelada, reserva fija que ocupa todos los martes y un error de red.
- **`servicios/`**: todo es `async` desde el día uno. Hoy devuelven mocks; cuando llegue la API cambia **solo** esta carpeta. Un único flag (`USAR_MOCK`) decide el origen.
- **`dominio/`**: funciones puras y testeables. Acá vive el cruce de turnos reservados + reservas fijas vigentes + bloqueos de mantenimiento, que es la parte crítica del proyecto.
- **`db/` y `almacenamiento/`**: el token de sesión va en `expo-secure-store`, **nunca** en `kv-store`. Reservas, QR y catálogo se guardan en SQLite para verse sin señal.

---

## 📦 Formato de la API (contrato fijo)

```jsonc
// éxito
{ "datos": [ ... ], "meta": { "total": 11, "pagina": 1, "porPagina": 20 } }
// error
{ "error": { "codigo": "TURNO_OCUPADO", "mensaje": "Ese turno ya fue reservado." } }
```

Convenciones sin excepción:

- Los `id` son **strings**.
- Fechas y horas en ISO 8601 con zona; un día suelto es `"AAAA-MM-DD"`.
- Claves en `camelCase`.
- Un campo sin valor viene como `null` (no ausente, no `""`).
- Precios: número en pesos por hora.
- Sesión: cabecera `Authorization: Bearer <token>`.

---

## 💻 Comandos

```bash
# Instalar dependencias del proyecto
npm install

# Iniciar el servidor de desarrollo
npx expo start

# Instalar paquetes (SIEMPRE con este comando)
npx expo install <paquete>

# Build instalable (APK de release, perfil preview)
eas build --platform android --profile preview
```

### Paquetes previstos

```bash
npx expo install expo-camera expo-image-picker expo-location react-native-maps \
  expo-notifications expo-sqlite expo-network expo-secure-store \
  expo-local-authentication expo-haptics expo-sensors expo-file-system \
  expo-video react-native-svg @react-native-vector-icons/ionicons
# Para dibujar el QR (a confirmar en equipo): react-native-qrcode-svg
```

---

## ⚠️ Reglas de desarrollo

1. **Paquetes nativos:** siempre `npx expo install`, nunca `npm install` directo.
2. **Independencia de la UI:** ninguna pantalla ni componente importa desde `src/mocks/`. Todo pasa por `src/servicios/`.
3. **Estados visibles:** toda pantalla que lee datos muestra carga, vacío y error.
4. **Paquetes viejos que NO se usan:**
   - `expo-av` no existe más → audio con `expo-audio`, video con `expo-video`.
   - La API vieja de `expo-file-system` falla en ejecución → usar `File`, `Directory` y `Paths`.
   - Íconos: `@react-native-vector-icons/ionicons`, no `@expo/vector-icons`.
5. **Sin cuenta para mirar:** la disponibilidad se ve sin login; la cuenta se pide recién al reservar.
6. **Sin ubicación también funciona:** si se niega el permiso, la app sigue siendo usable.
7. **Sin conexión:** la reserva y su QR deben verse sin señal.
8. **Modo oscuro** y buena legibilidad con poca luz (la app se usa de noche).
9. **Estilos:** `StyleSheet` (Unistyles o NativeWind son opcionales; si se usa uno, que sea para todos).

---

## 🔀 Flujo de trabajo con Git

- `main` siempre debe compilar. No se trabaja directo sobre `main`.
- Una rama por funcionalidad: `feature/<bloque>-<descripcion>` (ej: `feature/grilla-turnos`).
- Pull Request revisado por al menos otro integrante antes de mergear.
- Cada uno toca principalmente las carpetas de su bloque. Si hace falta tocar algo ajeno (sobre todo `tipos/` o `servicios/`), se avisa al grupo.
- Commits chicos y con mensaje claro.

---

## 🗓️ Orden sugerido

1. **Fase 0 (primeros días):** Integrante 1 deja listos `tipos/`, `mocks/` y los servicios con firmas definidas. Integrante 4 deja un login/sesión funcionando con mock. Mientras tanto el resto arma pantallas con datos de prueba.
2. **Fase 1:** cada bloque construye sus pantallas.
3. **Fase 2:** integración, estados de error/vacío, offline, modo oscuro, cambio a la API real cuando esté disponible.
4. **Primer build `preview` lo antes posible** (al menos una semana antes de la entrega). El primer build siempre falla por algo: permisos, assets, identificadores. Los mapas en Android requieren API key de Google configurada en `app.json`.
5. **Última semana:** pruebas en teléfono real, ensayo de la defensa.

---

## ✅ Checklist de entrega

- [ ] APK generado con `eas build --platform android --profile preview`, instalable sin Metro
- [ ] Repositorio con `eas.json` y `app.json`, sin `node_modules`
- [ ] Los 10 requisitos mínimos verificados sobre el APK
- [ ] Ícono 1024×1024 PNG sin transparencia, splash y nombre del producto
- [ ] Todos los integrantes pueden explicar su código (en la defensa no se usa IA)

---

## ❓ Dudas abiertas para el cliente (completar a medida que se resuelvan)

- [ ] ¿Qué pasa con una reserva ya hecha si se bloquea ese turno por lluvia o mantenimiento?
- [ ] Si pasadas las 4 horas no se puede cancelar desde la app, ¿cómo queda registrada una "cancelación tardía"?
- [ ] ¿Las reservas fijas cuentan para el máximo de 3 reservas activas?
- [ ] ¿Quién genera los turnos: la API los entrega ya cruzados con fijas y bloqueos, o la app hace el cruce?
- [ ] ¿Los `id` de turno son únicos entre espacios? (el ejemplo `tur-0219-19` no incluye el espacio)
- [ ] ¿Quién puede subir fotos del estado de una cancha, y existe un endpoint para eso?
- [ ] ¿Cómo llegan los avisos de suspensión y de turno liberado, si las notificaciones son locales?
- [ ] ¿Cómo se crean las cuentas de encargado y administrador?

## 📝 Supuestos tomados

_(Registrar acá todo lo que se decida sin respuesta del cliente, para poder justificarlo en la defensa.)_
