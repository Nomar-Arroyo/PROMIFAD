# PROMIFAD — Sistema de Resiliencia y Financiación Humanitaria

Sistema web interactivo para la gestión integral de emergencias humanitarias, desarrollado con **React + Vite** (frontend) y **Express + PostgreSQL** (backend). Permite coordinar donantes, equipos de rescate, personas afectadas, indemnizaciones, centros de acopio y un mapa colaborativo de zonas afectadas, todo en un solo panel con inicio de sesión.

---

## Funcionalidades

### 🚪 Pantalla de Inicio de Sesión (Landing Page)
- Header con logo 🌎🇻🇪 (globo terráqueo + bandera de Venezuela) y marca "PROMIFAD"
- Menús desplegables para **Registrarse** e **Iniciar sesión** (Donante u Organización)
- Cuerpo de dos columnas: descripción de PROMIFAD + **mapa interactivo de Leaflet** con 29 hospitales reales de Venezuela
- Sección **"¿Quieres ayudar?"** interactiva (viñeta expandible/colapsable con animación):
  - 💰 Reunir Donativos
  - ❤️ Donar a los Damnificados
  - 6 tipos de donaciones necesarias: comida no caducable, agua potable, insumos médicos, ropa, carpas/tiendas de acampar, artículos de emergencia
- Sección **"Más Información"**: contactos de hospitales, equipos de rescate y centros de acopio con teléfonos/WhatsApp
- Formularios de login/registro para Organización (rojo) y Donante (verde)

### 🏠 Panel Principal (Inicio)
- **Fase de Despliegue de Emergencia** — Simula la recaudación de fondos entre donantes para cubrir costos logísticos de respuesta inmediata.
- **Fase de Reactivación Económica** — Otorga microcréditos a emprendedores damnificados. Permite elegir el monto exacto que cada inversor aporta.
- **Dashboard / Auditoría** — Muestra saldos de cada persona y un registro de transacciones en tiempo real.

### 💰 Gestión de Donantes (Organización)
CRUD completo para administrar donantes con dos tipos de donación:
- **Registrar donante** con nombre, tipo de vulnerabilidad y saldo inicial
- **📦 Insumos y Artículos**: 16 tipos predefinidos (insumos médicos, ropa, sábanas, cobijas, carpas, colchonetas, pañales, kit de higiene, agua, alimentos, medicinas, generadores, herramientas, materiales de construcción, combustible, otro)
- **💵 Donaciones Monetarias**: selector de moneda ($, €, Bs, USD, EUR, COP), monto y motivo
- Panel expandible por donante con resumen: `[3 insumos] [2 monetarias]`
- Eliminar donantes y donaciones individuales

### 🎯 Portal del Donante
Panel independiente con 5 secciones:
- **💰 Donar Dinero** — Formulario con monto, moneda (USD, EUR, Bs, COP, BRL) y zona de destino
- **📦 Donar Objetos** — 16 tipos de insumos con cantidad y destino
- **📋 Mis Donaciones** — Historial real de las donaciones registradas en la BD
- **🎯 Elegir Destino** — Selección múltiple de 8 zonas de Venezuela con prioridad
- **📊 Mi Impacto** — Estadísticas en tiempo real: total monetario, objetos donados, total donaciones

### 🚒 Equipos de Búsqueda y Rescate
Administración de brigadas de rescate:
- Registrar equipos con nombre, miembros, ubicación, nacionalidad (30+ países), tiempo de llegada y contacto
- Cambiar estado entre: `Disponible` → `Desplegado` → `En descanso`
- Eliminar equipos con confirmación

### 🚁 Personas Rescatadas
Registro de personas rescatadas durante la emergencia:
- Registrar rescates asignando el equipo rescatista y estado de salud.
- **Importación masiva** mediante archivos Excel (.xlsx, .xls), CSV o TXT.
- Filtrar por nombre.
- Actualizar estado de salud (`Estable`, `Crítico`, `Leve`, `Recuperado`).

### ❓ Personas Desaparecidas
Seguimiento de personas reportadas como desaparecidas:
- Reportar desapariciones con cédula, zona de última ubicación y **foto** (upload con preview).
- Badge de tiempo con colores: verde (<24h), amarillo (24-72h), naranja (3-7 días), rojo (>7 días).
- **Importación masiva** mediante archivos Excel, CSV o TXT.
- **Detección automática de coincidencias** entre desaparecidos y rescatados.
- **Marcar como rescatado** — transacción atómica que mueve el registro entre tablas.

### 💲 Indemnización a Afectados
Compensación económica para personas damnificadas:
- Registrar indemnizaciones seleccionando persona, monto y motivo.
- Resumen visual de montos pendientes y aprobados.
- Historial completo con opción de aprobar cada indemnización.

### 📞 Solicitudes de Rescate
Gestión de solicitudes de rescate de víctimas:
- Filtros por estado (pendiente, aceptada, rechazada, enviado)
- Tarjetas expandibles con detalles y formulario de pago
- Moneda (8 opciones), monto, notas
- Flujo: `pendiente → aceptada → enviado` o `rechazada`

### 🏥 Contactos de Emergencia
Directorio de hospitales, clínicas y centros de acopio:
- 10 centros médicos hardcoded + registro dinámico
- Los centros agregados se identifican con borde verde y sello "ENTRADA GRATUITA"

### 🗺️ Zonas Afectadas (Mapa Interactivo)
Mapa colaborativo de Venezuela con **Leaflet + OpenStreetMap**:
- **🔴 Zonas Afectadas** — Coloca marcadores rojos haciendo clic
- **🔵 Equipos de Rescate** — Coloca marcadores azules haciendo clic
- **🟢 Zonas en Recuperación** — Marcadores verdes
- **🪖 Zonas Militarizadas** — Marcadores oliva
- **🔍 Revisión de Autoridades** — Marcadores naranjas
- **🏥 Hospitales** — 29 hospitales reales de Venezuela pre-cargados
- Marcadores compartidos entre ZonasAfectadas y SplashMap
- Barra lateral con herramientas, leyenda y lista de marcadores (con opción de eliminar)

---

## Diseño

- **Logo:** Globo terráqueo 🌎 con bandera 🇻🇪 sobre fondo azul gradiente
- **Paleta:** Fondo oscuro (#0a0a0a) con acentos naranja (#FF6B00), verde (#00C853) para donantes, rojo (#CE1126) para organizaciones
- **Fondo:** Degradado de la bandera de Venezuela (amarillo, azul, rojo) difuminado con `filter: blur(80px)`
- **Personalización:** 5 temas configurables mediante variables CSS
- **Tipografía:** Inter (sans-serif moderna)
- **Navegación:** Barra superior fija con pestañas e íconos representativos
- **Responsive:** Grid de dos columnas en escritorio, colapsa a una en móvil

---

## Tecnologías

| Frontend | Backend | Base de Datos |
|----------|---------|---------------|
| React 18 | Express 5 | PostgreSQL |
| Vite 5 | node-postgres (pg) | |
| Leaflet + react-leaflet 4 | dotenv | |
| SheetJS (xlsx) | cors | |
| CSS plano con variables | | |

---

## Estructura del proyecto

```
PROMIFAD/
├── index.html                 # Shell HTML de la SPA
├── package.json               # Dependencias y scripts del frontend
├── vite.config.js             # Configuración de Vite (puerto 3000)
│
├── backend/
│   ├── .env                   # Variables de entorno (credenciales PostgreSQL)
│   ├── package.json           # Dependencias del backend
│   └── server.js              # API REST + migraciones automáticas (Express, puerto 5000)
│
└── src/
    ├── main.jsx               # Punto de entrada React
    ├── index.css              # Variables CSS globales, temas y estilos base
    ├── App.jsx                # Componente raíz: login, pestañas, estado global, markers
    ├── App.css                # Estilos del layout principal
    │
    ├── components/
    │   ├── Login/             # Landing page + formularios de login/registro
    │   ├── SplashMap/         # Mapa Leaflet read-only para la landing
    │   ├── NavBar/            # Barra de navegación organización (8 pestañas)
    │   ├── DonanteNavBar/     # Barra de navegación donante (5 pestañas)
    │   ├── DonantePanel/      # Portal del donante (5 sub-vistas)
    │   ├── Dashboard/         # Auditoría de saldos y bitácora
    │   ├── FaseEmergencia/    # Fase de despliegue de emergencia
    │   ├── FaseRecuperacion/  # Microcréditos (reactivación económica)
    │   ├── Indemnizacion/     # Gestión de indemnizaciones
    │   ├── ContactoEmergencia/ # Directorio de hospitales y centros de acopio
    │   ├── ZonasAfectadas/    # Mapa interactivo con 5 tipos de marcadores
    │   ├── SolicitudesRescate/ # Solicitudes de rescate con flujo de estados
    │   ├── AdminPanel/        # Panel de administración (7 sub-vistas)
    │   ├── AdminNavBar/       # Barra de navegación administrador
    │   └── FileUploadImport/  # Componente reutilizable de carga masiva
    │
    └── pages/
        ├── DonantesPage/      # CRUD donantes + insumos + monetarias
        ├── EquiposRescatePage/ # CRUD de equipos de rescate
        ├── RescatadosPage/    # Registro de rescatados + importación
        └── DesaparecidosPage/ # Desaparecidos + foto + detección de coincidencias
```

---

## Instalación y uso

### Requisitos

- **Node.js** 18+
- **PostgreSQL** 14+ (las tablas se crean automáticamente al iniciar el backend)

### Backend

```bash
cd backend
npm install

# Configurar variables de entorno (.env)
# DB_USER=postgres
# DB_HOST=localhost
# DB_NAME=promifad_db
# DB_PASSWORD=tu_contraseña
# DB_PORT=5432

node server.js
```

El servidor Express se inicia en `http://localhost:5000`. Las tablas se crean automáticamente con `CREATE TABLE IF NOT EXISTS`.

### Frontend

```bash
# Desde la raíz del proyecto
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de la build
npm run preview
```

El servidor de desarrollo se inicia en `http://localhost:3000`.

### Formato para carga masiva de archivos

El componente `FileUploadImport` acepta archivos **Excel (.xlsx, .xls)**, **CSV (.csv)** o **TXT** (delimitado por coma o tabulación).

**Ejemplo — Personas Desaparecidas:**

| nombre | zona |
|--------|------|
| Juan Pérez | Caracas |
| María López | Maracaibo |

**Ejemplo — Personas Rescatadas:**

| nombre | equipo | estado |
|--------|--------|--------|
| Ana García | Brigada Alfa | Estable |
| Luis Mendoza | Brigada Beta | Crítico |

---

## API Endpoints (Backend)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/donantes` | Listar donantes |
| POST | `/api/donantes` | Crear donante |
| DELETE | `/api/donantes/:id` | Eliminar donante + sus donaciones |
| GET | `/api/donaciones` | Listar donaciones (insumos + monetarias) |
| POST | `/api/donaciones` | Registrar donación (tipo, monto, moneda, motivo) |
| DELETE | `/api/donaciones/:id` | Eliminar donación individual |
| GET | `/api/desaparecidos` | Listar desaparecidos |
| POST | `/api/desaparecidos` | Insertar desaparecido |
| GET | `/api/rescatados` | Listar rescatados |
| POST | `/api/rescatados` | Insertar rescatado |
| PUT | `/api/rescatados/:id/salud` | Actualizar estado de salud |
| GET | `/api/equipos` | Listar equipos de rescate |
| POST | `/api/equipos` | Crear equipo |
| PUT | `/api/equipos/:id/estado` | Actualizar estado de equipo |
| DELETE | `/api/equipos/:id` | Eliminar equipo |
| GET | `/api/indemnizaciones` | Listar indemnizaciones |
| GET | `/api/proyectos` | Listar proyectos de recuperación |
| GET | `/api/logs` | Obtener bitácora |
| POST | `/api/logs` | Insertar entrada en bitácora |
| POST | `/api/transiciones/rescatar` | Transacción: desaparecido → rescatado |

---

## Base de Datos

Tablas creadas automáticamente al iniciar el backend:

| Tabla | Descripción |
|-------|-------------|
| `personas_donantes` | Donantes (id SERIAL, nombre, vulnerabilidad, saldo) |
| `donaciones` | Donaciones de insumos y monetarias (tipo, monto, moneda, motivo) |
| `desaparecidos` | Personas desaparecidas (foto, cédula, zona) |
| `rescatados` | Personas rescatadas (equipo, estado de salud) |
| `equipos_rescate` | Equipos de rescate (nacionalidad, contacto, tiempo llegada) |
| `indemnizaciones` | Compensaciones económicas |
| `proyectos_recuperacion` | Microcréditos |
| `logs` | Bitácora de operaciones |

---

## Licencia

Proyecto académico / demostrativo — PROMIFAD.
