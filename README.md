# ReservasDeportivas - TFI React Native & Expo Router

Aplicación móvil multiplataforma desarrollada en **React Native con Expo Router y TypeScript** para la reserva y gestión de turnos en complejos deportivos.

---

## 📐 Arquitectura de Carpetas y Organización (`src/`)

El proyecto sigue una arquitectura desacoplada basada en servicios y tipado estricto. La interfaz de usuario no consume datos directamente de los mocks ni de la API futura, sino a través de la capa de servicios.

```text
ReservasDeportivas/
├── src/
│   ├── app/                # Rutas y Pantallas (Expo Router)
│   ├── tipos/              # Definiciones TypeScript (Espacio, Turno, Reserva, etc.)
│   ├── servicios/          # Capa de lógica y comunicación (Mocks / API Futura)
│   └── mocks/              # Datos simulados con casos feos (lluvia, fallas, etc.)
├── assets/                 # Recursos estáticos (imágenes, fuentes, iconos)
├── app.json                # Configuración global de Expo
├── eas.json                # Configuración de builds con EAS CLI
└── package.json            # Dependencias del proyecto
```

---

## 🗂️ Módulos Principales

| Carpeta | Descripción | Reglas y Contenido |
| :--- | :--- | :--- |
| `src/tipos/` | Entidades del Dominio | Tipado centralizado de `Espacio`, `Deporte`, `Turno`, `Reserva`, `ReservaFija` y `Usuario`. |
| `src/servicios/` | Capa de Abstracción | Contiene funciones asíncronas (`async/await`) que consumen mocks localmente. Permite cambiar a la API real modificando únicamente esta capa. |
| `src/mocks/` | Datos de Prueba | Incluye escenarios del PRD: días bloqueados por lluvia, grillas completas, ausencias, espacios sin video y simulaciones de fallas de red. |
| `src/app/` | Navegación por Archivos | Estructura de pantallas con **Expo Router**: Exploración/Filtros, Grilla de disponibilidad, Proceso de reserva, Confirmación/QR y Mis Reservas. |

---

## 🛠️ Entidades Clave de TypeScript (`src/tipos/`)

- **`Espacio`**: Información del terreno de juego (deporte, complejo, iluminación, techado, fotos, reglas, video demo).
- **`Deporte`**: Nombre, icono identificatorio y color distintivo.
- **`Turno`**: Franja horaria con estado (`"libre" | "reservado" | "fijo" | "mantenimiento"`), precio y motivo de bloqueo.
- **`Reserva`**: Detalle del turno reservado, código QR único, estados de acreditación y cancelación.
- **`ReservaFija`**: Turnos recurrentes que bloquean automáticamente días y horarios semanales.
- **`Usuario`**: Perfil del usuario, penalizaciones (cancelaciones tardías/ausencias) y lista de favoritos.

---

## 💻 Comandos Principales de Desarrollo

```bash
# Iniciar el servidor de desarrollo Expo
npx expo start

# Ejecutar previsualización en el navegador Web
npm run web

# Instalar dependencias nativas en Expo (SIEMPRE usar este comando)
npx expo install <nombre-del-paquete>
```

---

## ⚠️ Reglas Importantes de Desarrollo

1. **Instalación de paquetes:** Nunca utilizar `npm install` directo para librerías que requieran módulos nativos (usar siempre `npx expo install`).
2. **Independencia de UI:** Ningún componente o pantalla debe hacer importaciones directas desde `src/mocks/`. Toda la información se solicita a `src/servicios/`.
3. **Control de Versiones y Builds:** Los comandos de compilación y APKs se gestionan a través de `eas-cli`.