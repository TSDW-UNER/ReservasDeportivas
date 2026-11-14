# 🏟️ Reservas Deportivas — Villaguay

Aplicación móvil para reservar turnos en los **11 espacios deportivos de la Municipalidad de Villaguay** (Entre Ríos). Los vecinos ven qué hay libre, reservan solos, reciben un recordatorio y el día del turno entran mostrando un **código QR** que el encargado verifica en la puerta. La Dirección de Deportes gestiona bloqueos, reservas fijas, agenda y precios desde la misma app.

Trabajo Integrador — **Desarrollo para Móviles** (UNER · Facultad de Ciencias de la Administración · Tecnicatura Universitaria en Desarrollo Web · 2026, 2.º cuatrimestre).
Cliente del PRD: Nahuel Ojeda, Dirección de Deportes de Villaguay.

**Stack:** React Native + Expo (SDK 58) · Expo Router · TypeScript · StyleSheet · EAS Build.

---

## 👥 Equipo

| Integrante | Bloque | Qué desarrolló |
| :--- | :--- | :--- |
| **Dylan** | Datos, API y offline | `tipos/`, `mocks/`, capa `servicios/` (cliente HTTP, interruptor mock/API), SQLite (`db/`), estado de red |
| **Federico** | Catálogo, mapa, multimedia y gestión | Listado y filtros, ficha, galería, video, mapa y "cómo llegar", favoritos. Panel de gestión: bloqueos, reservas fijas, agenda, precio |
| **Joaquín** | Disponibilidad, reservas y avisos | `dominio/` (grilla, reglas, cancelación), pantalla de disponibilidad, reservar, mis reservas, QR, notificaciones locales |
| **Juan Ignacio** | Identidad, acceso e ingreso | Registro/ingreso, token seguro, biometría, roles, perfil, escáner QR del encargado, ausentes, ícono/splash, `app.json`, `eas.json` y builds |

---

## ✅ Requisitos mínimos del TFI → dónde están

| # | Requisito | Dónde se resuelve |
| :-: | :--- | :--- |
| 1 | Pantallas y navegación (Expo Router) | `src/app/` |
| 2 | Autenticación, token en `expo-secure-store`, reingreso con `expo-local-authentication` (con clave como alternativa) | `src/app/(auth)/`, `src/app/bloqueo.tsx`, `src/servicios/auth.ts`, `biometria.ts`, `src/almacenamiento/tokenSeguro.ts`, `src/contextos/SesionContext.tsx` |
| 3 | Consumo de la API detrás de servicios propios, con estados de carga, vacío y error | `src/servicios/`, `src/hooks/useCarga.ts`, `src/componentes/EstadosComunes.tsx` |
| 4 | `expo-camera` (lectura de QR) y `expo-file-system` con la API nueva (`File`, `Directory`, `Paths`) | `src/app/(gestion)/escanear.tsx`, `src/servicios/media.ts` |
| 5 | `expo-location` + `react-native-maps` (usable si se niega el permiso) | `src/hooks/useUbicacion.ts`, `src/componentes/mapa/` |
| 6 | Notificaciones locales disparadas por hechos reales | `src/servicios/notificaciones.ts` |
| 7 | `expo-sqlite`, `expo-sqlite/kv-store` y `expo-network` | `src/db/baseDatos.ts`, `src/almacenamiento/preferencias.ts`, `src/contextos/RedContext.tsx`, `src/componentes/BannerSinConexion.tsx` |
| 8 | Háptica con sentido | Vibración distinta al validar un ingreso (válido / advertencia / error) y al confirmar una reserva |
| 9 | Video con controles a la vista | `src/componentes/espacios/ReproductorEspacio.tsx` (`expo-video`, con descarga para verlo sin datos) |
| 10 | Ícono 1024×1024 sin transparencia, splash y nombre | `assets/`, `app.json` |

### Notificaciones (requisito 6)

1. **Recordatorio 2 horas antes** del turno: se programa al reservar, se cancela al cancelar y se sincroniza al abrir *Mis reservas*.
2. **Aviso de suspensión**: al abrir *Mis reservas*, si el turno de una reserva quedó bloqueado (lluvia o mantenimiento), la tarjeta se marca como suspendida y se avisa **una sola vez**.

El permiso de notificaciones se pide al hacer la primera reserva, no al abrir la app.

---

## 🧠 Cómo está pensada

```text
ReservasDeportivas/
├── src/
│   ├── app/              # Rutas (Expo Router)
│   │   ├── (auth)/       # ingresar, registrar
│   │   ├── (tabs)/       # espacios, reservas, gestión, perfil
│   │   ├── (gestion)/    # panel del encargado/administrador: escanear, ausentes, agenda
│   │   ├── espacio/[id].tsx                 # ficha del espacio
│   │   ├── disponibilidad/[espacioId].tsx   # grilla y reservar
│   │   ├── reserva/[id].tsx                 # reserva con QR (funciona sin conexión)
│   │   └── bloqueo.tsx   # pantalla de desbloqueo con huella/clave
│   ├── tipos/            # Tipos del PRD (se escriben una sola vez)
│   ├── mocks/            # Datos y "servidor" falso, con los casos feos del PRD
│   ├── servicios/        # ÚNICA puerta de entrada a los datos (mock o API)
│   ├── dominio/          # Reglas de negocio puras (sin React ni Expo)
│   ├── db/               # SQLite: catálogo y reservas con su QR
│   ├── almacenamiento/   # secure-store (token) y kv-store (preferencias)
│   ├── componentes/      # UI reutilizable
│   ├── hooks/            # useCarga, useMisReservas, useSesion, useUbicacion
│   ├── contextos/        # Sesión y red
│   ├── tema/             # Colores claro/oscuro
│   └── utils/
├── scripts/              # Verificaciones de la lógica (npm run verificar)
├── assets/               # Ícono, splash
└── app.json · eas.json · package.json
```

**Reglas del proyecto**

- Las pantallas no leen datos falsos directamente: todo pasa por `src/servicios/`. Un solo interruptor, `EXPO_PUBLIC_USAR_MOCK`, decide si esa capa devuelve datos falsos o le pide a la API.
- Los tipos de `src/tipos/` siguen al PRD y no cambian cuando se pasa de mock a API.
- El token vive en `expo-secure-store`, **nunca** en `kv-store`.
- Todo servicio es asíncrono y falla con `ErrorApi { codigo, mensaje }`, la misma forma que la API.

### La grilla de disponibilidad (`src/dominio/grilla.ts`)

Es la parte crítica del PRD: una reserva fija **no es un turno**, es una regla semanal. La grilla de un día se arma cruzando:

1. los turnos que informa el servicio (reservados / mantenimiento),
2. las reservas fijas vigentes (día de la semana, `desde`, `hasta`, `activa`),
3. la hora actual (un turno que ya empezó no se puede reservar).

Prioridad cuando se superponen: **mantenimiento > fijo > reservado > libre**. Es una función pura, verificada con `npm run verificar`. Todo se calcula en horario de Argentina (UTC-3), sin importar la zona del teléfono.

### Reglas de reserva (`src/dominio/reglas.ts` y `cancelacion.ts`)

- Máximo **3 reservas activas** por persona.
- No se supera la **capacidad** del espacio.
- Se cancela desde la app **hasta 4 horas antes**; después hay que avisar a la Dirección de Deportes.
- Un turno pasado, bloqueado u ocupado no se puede reservar.

---

## 🔌 API

La app consume la API de la cátedra. Las respuestas tienen la forma `{ "datos": ..., "meta": ... }` o `{ "error": { "codigo", "mensaje" } }`.

| Área | Rutas que usa la app |
| :--- | :--- |
| Sesión | `POST /auth/ingreso` · `POST /auth/registro` · `GET /yo` |
| Catálogo | `GET /espacios` · `GET /deportes` · `PATCH /espacios/:id` (precio) |
| Disponibilidad | `GET /espacios/:id/turnos?fecha=AAAA-MM-DD` · `GET /agenda?fecha=` |
| Reservas | `POST /reservas` · `GET /yo/reservas?cuando=proximas` o `pasadas` · `POST /reservas/:id/cancelacion` |
| Ingreso | `POST /ingresos` · `POST /reservas/:id/ausente` · `GET /reservas?fecha=&espacioId=&estado=` · `GET /usuarios/:id` |
| Gestión | `GET/POST/PATCH/DELETE /fijas` · `GET/POST/DELETE /bloqueos` |

> La API gratuita de Render puede tardar hasta **un minuto** en responder la primera vez porque "se duerme". Antes de una demo o de la defensa, abrí la app una vez y esperá a que cargue el listado.

---

## 🚀 Puesta en marcha

Requisitos: Node.js LTS y la app **Expo Go** en el teléfono (o un emulador Android).

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno (en PowerShell: Copy-Item .env.example .env)
cp .env.example .env

# 3. Verificar que todo está bien
npm run typecheck
npm run verificar

# 4. Levantar la app y escanear el QR con Expo Go
npx expo start -c
```

### Variables de entorno (`.env`, no se sube al repo)

| Variable | Valor | Para qué |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_USAR_MOCK` | `true` / `false` | `true`: datos falsos, no necesita internet ni API. `false`: API real. |
| `EXPO_PUBLIC_API_URL` | URL de la API | Si la API corre en tu PC y probás con un teléfono real: `http://IP-DE-TU-PC:3000`. El APK usa la URL `https` definida en `eas.json`. |

### Probar sin API (modo mock)

Con `EXPO_PUBLIC_USAR_MOCK=true` podés ingresar con cualquier correo y clave:

- `admin@…` → administrador · `encargado@…` → encargado · cualquier otro → jugador.

Los casos feos del PRD están armados **relativos a hoy**: mañana la Cancha 1 está completa, pasado mañana llueve en todos los espacios y en tres días la Cancha 2 tiene el turno de las 20:00 en mantenimiento (con una reserva de demostración encima, para ver el aviso de suspensión). Para simular un corte de red: `opcionesMock.errorDeRed = true` en `src/mocks/servidorFalso.ts`.

> Las pantallas del encargado (escanear QR, ausentes) hablan siempre con la API real: no tienen modo mock.

---

## 📦 Build instalable (APK)

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

El perfil `preview` (en `eas.json`) genera un **APK de release** con la URL `https` de la API y `EXPO_PUBLIC_USAR_MOCK=false`. Se instala y se usa **sin Metro y sin ninguna computadora**.

**Google Maps en Android:** el APK necesita una API key de Google (`android.config.googleMaps.apiKey` en `app.json`) para dibujar el mapa. En Expo Go el mapa funciona sin ella. La key **no se sube al repo**.

---

## 🧪 Verificaciones

```bash
npm run typecheck   # TypeScript estricto
npm run verificar   # ~80 verificaciones de dominio, mocks y reservas
```

Cubren: grilla con reservas fijas y bloqueos, turnos pasados, zona horaria, cancelación en plazo y fuera de plazo, límite de 3 reservas, capacidad, día bloqueado por lluvia, grilla completa, error de red y sesión falsa por rol.

---

## ⚠️ Limitaciones conocidas y decisiones

- **Aviso de turno liberado en un favorito:** el PRD lo pide, pero con notificaciones locales no hay forma de enterarse de una cancelación ajena. Requiere un servidor que envíe notificaciones push o una tarea en segundo plano.
- **Aviso de suspensión:** se detecta **al abrir *Mis reservas***, no en segundo plano.
- **Cancelación tardía:** desde la app solo se cancela dentro del plazo, como pide el PRD ("después hay que avisarnos"). El contador `cancelacionesTardias` del perfil lo lleva el servidor.
- **Deporte al reservar:** el PRD pide indicarlo, pero la entidad `Reserva` no tiene ese campo, así que se muestra pero no se envía.
- **Ubicación:** se pide permiso al abrir un mapa y, si se niega, la app sigue funcionando con la ubicación del Polideportivo. Todavía no calcula "el complejo más cercano".
- **Reservas fijas en el modo API:** se asume que el servidor ya devuelve esos turnos con estado `"fijo"`.
- **Fotos de las canchas:** `expo-image-picker` está implementado en `src/servicios/media.ts` pero no hay una pantalla que las suba, porque el PRD no define quién las sube ni a qué endpoint.

---

## 🧑‍🏫 Notas para la defensa

- Cada integrante explica el bloque de la tabla de arriba.
- Se puede demostrar con Expo Go o con el APK entregado.
- Antes de la defensa: abrir la app para despertar la API de Render y probar el flujo completo (listado → disponibilidad → reservar → QR → escanear con la cuenta de encargado).
