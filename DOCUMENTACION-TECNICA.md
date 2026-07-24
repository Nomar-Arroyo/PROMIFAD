# PROMIFAD — Documentación Técnica Completa del Proyecto

## Plataforma de Resiliencia y Financiación Humanitaria

---

## 1. ¿Qué es PROMIFAD?

PROMIFAD (Plataforma de Resiliencia y Financiación Humanitaria) es una aplicación web integral diseñada para gestionar emergencias humanitarias de manera coordinada, eficiente y transparente. El sistema nace como respuesta a la necesidad de tener una plataforma centralizada que conecte en tiempo real a todos los actores involucrados en una catástrofe natural o crisis humanitaria: organizaciones humanitarias, donantes, equipos de rescate, hospitales, centros de acopio y las comunidades afectadas.

La plataforma permite:

- Coordinar equipos de búsqueda y rescate en terreno
- Registrar y rastrear personas desaparecidas y rescatadas
- Administrar donaciones de dinero y objetos (alimentos, ropa, insumos médicos, carpas)
- Gestionar indemnizaciones económicas a víctimas
- Visualizar en un mapa interactivo las zonas afectadas, hospitales, centros de recuperación y unidades militares
- Ofrecer un portal independiente para donantes donde pueden donar dinero, objetos, elegir destino de sus fondos y ver su impacto
- Mantener una bitácora (log) completa de todas las operaciones realizadas

---

## 2. ¿Por qué se eligieron estas tecnologías?

### 2.1 Vite + React (Frontend)

**¿Por qué Vite?**

Vite fue elegido como bundler y servidor de desarrollo por las siguientes razones:

- **Velocidad de desarrollo**: Vite utiliza ES Modules nativos del navegador en desarrollo, lo que significa que no necesita empaquetar (bundle) todo el código antes de servirlo. Los cambios en el código se reflejan instantáneamente en el navegador (Hot Module Replacement instantáneo), sin esperar a que se recompile todo el proyecto.
- **Configuración mínima**: A diferencia de Webpack, Vite funciona "out of the box" con muy poca configuración. Un archivo `vite.config.js` de 10 líneas es suficiente para un proyecto completo.
- **Build rápido para producción**: Usa Rollup internamente para generar bundles optimizados, con tree-shaking eficiente y división de código automática.
- **Compatibilidad nativa con React**: El plugin `@vitejs/plugin-react` proporciona soporte completo para JSX, Fast Refresh y transformaciones de React sin configuración adicional.

**¿Por qué React?**

React fue seleccionado como framework de interfaz por estas razones:

- **Componentes reutilizables**: La arquitectura por componentes permite dividir la UI en piezas independientes y reutilizables (NavBar, Login, ZonasAfectadas, etc.), facilitando el mantenimiento y la escalabilidad.
- **Estado global centralizado**: Con `useState` y `useEffect` en el componente raíz (`App.jsx`), se gestiona el estado global de toda la aplicación (donantes, rescatados, desaparecidos, equipos, marcadores del mapa, logs) sin necesidad de librerías externas de estado.
- **Ecosistema maduro**: React cuenta con librerías de alta calidad para cada necesidad: `react-leaflet` para mapas, `xlsx` (SheetJS) para importación de archivos Excel, `leaflet` para visualización geoespacial.
- **Renderizado declarativo**: El enfoque declarativo de React hace que la interfaz se actualice automáticamente cuando cambian los datos, sin manipular el DOM manualmente.
- **Curva de aprendizaje razonable**: Para un proyecto académico/demostrativo, React ofrece el equilibrio ideal entre capacidad y complejidad.

### 2.2 Express + node-postgres (Backend)

**¿Por qué Express?**

- **Simplicidad**: Express es minimalista por diseño. Un servidor REST completo se escribe en un solo archivo (`server.js`) con rutas claras y directas.
- **Middleware robusto**: `cors` para habilitar CORS entre el frontend (puerto 3000) y el backend (puerto 5000), `express.json()` para parsear automáticamente el body de las peticiones JSON.
- **Express v5**: Se utiliza la versión 5 que incluye soporte nativo para `async/await` en los handlers de rutas, eliminando la necesidad de wrappers como `express-async-errors`.
- **Comunidad extensa**: Cualquier problema o necesidad tiene documentación, tutoriales y soluciones disponibles.

**¿Por qué node-postgres (pg)?**

- **Conexión directa**: `pg` es el driver oficial de PostgreSQL para Node.js. No agrega abstracciones innecesarias sobre la base de datos.
- **Pool de conexiones**: El uso de `Pool` permite manejar múltiples conexiones simultáneas de forma eficiente, sin abrir ni cerrar conexiones manualmente en cada petición.
- **Consultas parametrizadas**: Todas las consultas usan parámetros ($1, $2, etc.) para prevenir inyección SQL, manteniendo la seguridad de la base de datos.

### 2.3 PostgreSQL (Base de Datos Relacional)

**¿Por qué PostgreSQL y no otra base de datos?**

PostgreSQL fue elegido por ser la base de datos relacional que mejor se adapta a las necesidades del proyecto:

- **Integridad referencial**: Las relaciones entre tablas (donantes → donaciones, equipos → rescatados, desaparecidos → rescatados) garantizan que los datos sean consistentes. No puede existir una donación sin un donante válido, ni un rescatado sin un equipo asignado.
- **Tipos de datos丰富**: PostgreSQL soporta tipos como `SERIAL` para auto-incremento, `TEXT` para textos largos, `TIMESTAMP` para fechas, `NUMERIC` para montos exactos (evitando errores de punto flotante), y `BYTEA` o `TEXT` para almacenar fotos en base64.
- **Transacciones ACID**: La operación de transición "desaparecido → rescatado" (`/api/transiciones/rescatar`) es una transacción que debe ser atómica: o se ejecutan todos los pasos (insertar en rescatados + eliminar de desaparecidos + registrar log) o no se ejecuta ninguno. PostgreSQL garantiza esta atomicidad.
- **Escalabilidad futura**: Si el sistema crece de cientos a millones de registros, PostgreSQL escala verticalmente y horizontalmente sin cambiar ni una línea de código en la aplicación.
- **Licencia abierta**: PostgreSQL es de código abierto, sin costos de licenciamiento, ideal para un proyecto humanitario.
- **JSON nativo**: PostgreSQL permite almacenar y consultar datos JSONB, útil si en el futuro se necesitan campos dinámicos sin alterar el esquema.

**¿Por qué no MongoDB (NoSQL)?**

Una base de datos relacional es más adecuada porque los datos de PROMIFAD tienen relaciones claras y necesitan integridad referencial. En una emergencia humanitaria, no se puede permitir que existan registros huérfanos (un rescatado sin equipo, una donación sin destino) ni que se pierdan transacciones. MongoDB es ideal para datos de estructura variable y jerárquica, pero este caso de uso encaja perfectamente en el modelo relacional.

---

## 3. Arquitectura General del Sistema

```
┌──────────────────────────────────────────────────────┐
│                    NAVEGADOR                          │
│  ┌────────────────────────────────────────────────┐  │
│  │           React (Vite, Puerto 3000)             │  │
│  │                                                 │  │
│  │  App.jsx ─── Login.jsx (Splash + Forms)         │  │
│  │    │                                            │  │
│  │    ├── NavBar.jsx (8 pestañas)                  │  │
│  │    │   ├── Inicio (FaseEmergencia + FaseRecup)  │  │
│  │    │   ├── DonantesPage                         │  │
│  │    │   ├── EquiposRescatePage                   │  │
│  │    │   ├── RescatadosPage                       │  │
│  │    │   ├── DesaparecidosPage                    │  │
│  │    │   ├── Indemnizacion                        │  │
│  │    │   ├── ZonasAfectadas (Leaflet Map)         │  │
│  │    │   └── ContactoEmergencia                   │  │
│  │    │                                            │  │
│  │    ├── DonanteNavBar.jsx (5 pestañas)           │  │
│  │    │   └── DonantePanel (5 sub-vistas)          │  │
│  │    │                                            │  │
│  │    └── SolicitudesRescate                       │  │
│  │                                                 │  │
│  │  Fetch → http://localhost:5000/api/*             │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────┘
                           │ HTTP/JSON
┌──────────────────────────┴───────────────────────────┐
│            Express (Puerto 5000)                       │
│  ┌────────────────────────────────────────────────┐  │
│  │  server.js                                      │  │
│  │                                                 │  │
│  │  GET/POST /api/donantes                         │  │
│  │  GET/POST /api/desaparecidos                    │  │
│  │  GET/POST /api/rescatados                       │  │
│  │  GET/POST/PUT/DELETE /api/equipos               │  │
│  │  GET/POST /api/indemnizaciones                  │  │
│  │  GET /api/proyectos                             │  │
│  │  GET/POST /api/logs                             │  │
│  │  GET/POST/DELETE /api/donaciones                │  │
│  │  POST /api/transiciones/rescatar (transacción)  │  │
│  └──────────────────────┬─────────────────────────┘  │
│                          │ pg (node-postgres)          │
└──────────────────────────┬───────────────────────────┘
                           │ SQL parametrizado
┌──────────────────────────┴───────────────────────────┐
│          PostgreSQL (Puerto 5432, DB: promifad_db)     │
│                                                       │
│  Tablas:                                              │
│  ├── personas_donantes (id, nombre, vulnerabilidad,   │
│  │                       saldo)                       │
│  ├── donaciones (id, donante_id, tipo_objeto,         │
│  │               cantidad, destino, fecha)            │
│  ├── desaparecidos (id, nombre, zona, fecha, foto,    │
│  │                  cedula)                           │
│  ├── rescatados (id, nombre, equipo, estado_salud,    │
│  │               fecha, foto, cedula)                 │
│  ├── equipos_rescate (id, nombre, miembros,           │
│  │                    ubicacion, estado, nacionalidad, │
│  │                    tiempo_llegada, contacto)       │
│  ├── indemnizaciones (id, persona, monto, motivo,     │
│  │                    estado, fecha)                  │
│  ├── proyectos_recuperacion (id, nombre, monto_meta,  │
│  │                          monto_recaudado, estado)  │
│  └── logs (id, accion, detalle, timestamp)            │
└───────────────────────────────────────────────────────┘
```

---

## 4. Estructura del Proyecto (Archivos y Carpetas)

```
PROMIFAD/
├── index.html                  ← Punto de entrada HTML (SPA shell)
├── package.json                ← Dependencias del frontend (React, Leaflet, xlsx)
├── vite.config.js              ← Configuración de Vite (puerto 3000, auto-open)
│
├── backend/
│   ├── .env                    ← Variables de entorno (credenciales PostgreSQL)
│   ├── package.json            ← Dependencias del backend (Express, pg, cors, dotenv)
│   └── server.js               ← API REST completa (13 endpoints)
│
└── src/
    ├── main.jsx                ← Monta <App /> en #root con StrictMode
    ├── index.css               ← Variables CSS globales, 5 temas, resets, scrollbar
    ├── App.jsx                 ← Componente raíz: estado global, login, routing
    ├── App.css                 ← Layout principal (grid 2 columnas)
    │
    ├── components/
    │   ├── Login/              ← Splash landing + formularios de login/registro
    │   ├── SplashMap/          ← Mapa Leaflet read-only (solo vista) para el splash
    │   ├── NavBar/             ← Barra de navegación organización (8 pestañas)
    │   ├── DonanteNavBar/      ← Barra de navegación donante (5 pestañas)
    │   ├── Dashboard/          ← Auditoría de saldos + bitácora de transacciones
    │   ├── FaseEmergencia/     ← Fase de despliegue de emergencia
    │   ├── FaseRecuperacion/   ← Microcréditos de reactivación económica
    │   ├── Indemnizacion/      ← Gestión de indemnizaciones a víctimas
    │   ├── ContactoEmergencia/ ← Directorio de hospitales y centros de acopio
    │   ├── ZonasAfectadas/     ← Mapa interactivo con 5 tipos de marcadores
    │   ├── SolicitudesRescate/ ← Solicitudes de rescate de víctimas (aceptar/rechazar)
    │   ├── DonantePanel/       ← Portal del donante (5 sub-vistas)
    │   ├── AdminPanel/         ← Panel de administración (7 sub-vistas)
    │   ├── AdminNavBar/        ← Barra de navegación administrador
    │   └── FileUploadImport/   ← Componente reutilizable de carga masiva (xlsx/csv/txt)
    │
    └── pages/
        ├── DonantesPage/       ← CRUD completo de donantes
        ├── EquiposRescatePage/ ← CRUD de equipos de rescate
        ├── RescatadosPage/     ← Personas rescatadas + importación masiva
        └── DesaparecidosPage/  ← Personas desaparecidas + detección de coincidencias
```

---

## 5. Explicación Detallada de Cada Componente

### 5.1 Login (`Login.jsx` — 368 líneas)

**¿Qué hace?** Es la primera pantalla que ve el usuario. Funciona como landing page informativa y punto de acceso al sistema.

**¿Por qué existe?** Toda plataforma humanitaria necesita un punto de entrada que explique su propósito antes de pedir credenciales. Esta pantalla sirve doble función: informar sobre PROMIFAD y permitir el acceso.

**Sub-pantallas:**

1. **Splash (landing)**: Muestra el header con logo "P", marca "PROMIFAD", botones de "Registrarse" e "Iniciar sesión" con dropdowns desplegables. El cuerpo tiene dos columnas: texto descriptivo a la izquierda y un mapa de Leaflet (SplashMap) a la derecha mostrando los 29 hospitales de Venezuela. Debajo hay una sección "¿Quieres ayudar?" con 3 tarjetas de acción (Reunir Donativos, Apoyar el Rescate, Donar a los Damnificados) y una grilla de 6 tipos de donaciones necesarias (comida no caducable, agua potable, insumos médicos, ropa, carpas, artículos de emergencia). Finalmente, una sección "Más Información" con tarjetas de contacto de hospitales, equipos de rescate y centros de acopio con números de teléfono y WhatsApp.

2. **Login Organización**: Formulario con cédula, teléfono, nombre, correo y contraseña. El botón de envío es rojo (`#CE1126`) y al enviar ejecuta `onLogin(form, 'sistema')`.

3. **Login Donante**: Formulario similar con cédula, nombre, correo y contraseña. Botón verde (`#00C853`). Incluye enlace "¿No tienes cuenta? Registrarse aquí".

4. **Registro Donante**: Mismo formulario que login donante pero con campo de teléfono adicional. Al enviar crea la cuenta.

**Detalles técnicos:**
- Los dropdowns se cierran automáticamente al hacer clic fuera (`useEffect` + `useRef` + `mousedown` listener)
- El mapa del splash recibe los `markers` del estado global para mostrar marcadores colocados en ZonasAfectadas
- No hay modo administrador — fue eliminado deliberadamente

### 5.2 SplashMap (`SplashMap.jsx` — 133 líneas)

**¿Qué hace?** Un mapa de solo vista (read-only) basado en Leaflet que se incrusta en la pantalla de login.

**¿Por qué existe?** Mostrar un mapa interactivo en la landing page permite al usuario visualizar la situación actual de hospitales y zonas afectadas sin necesidad de iniciar sesión, generando confianza y transparencia en la plataforma.

**Detalles técnicos:**
- Centrado en Venezuela `[6.4238, -66.5897]` con zoom 6 (vista nacional)
- `scrollWheelZoom={false}` para evitar que el usuario se pierda del mapa al hacer scroll
- `dragging={true}` permite mover el mapa
- 29 hospitales hardcoded con coordenadas reales de ciudades venezolanas (Caracas, Maracaibo, Valencia, Barquisimeto, Barcelona, Ciudad Bolívar, Mérida, Barinas, San Cristóbal, Punto Fijo, Cumaná, San Fernando de Apure)
- Cada hospital tiene un ícono emoji 🏥 personalizado mediante `L.divIcon`
- Los marcadores dinámicos (zonas afectadas, equipos de rescate, etc.) se pasan como prop desde App.jsx
- El mapa usa OpenStreetMap tiles, sin API key, sin costo

### 5.3 NavBar (`NavBar.jsx` — 37 líneas)

**¿Qué hace?** Barra de navegación fija en la parte superior con 8 pestañas y botón de cerrar sesión.

**¿Por qué existe?** Proporciona navegación rápida entre las secciones principales del sistema para el usuario de tipo organización.

**Pestañas:**
| Pestaña | Ícono | Sección |
|---------|-------|---------|
| Inicio | 🏠 | Dashboard + Fases |
| Donantes | 💰 | DonantesPage |
| Equipos | 🚒 | EquiposRescatePage |
| Rescatados | 🚁 | RescatadosPage |
| Desaparecidos | ❓ | DesaparecidosPage |
| Indemnización | 💲 | Indemnizacion |
| Zonas Afectadas | 🗺️ | ZonasAfectadas |
| Contacto Emergencia | 📞 | ContactoEmergencia |

**Detalles técnicos:**
- La pestaña activa se resalta con `--orange-accent` y un indicador de borde inferior
- El botón "Cerrar sesión" es rojo y resetea todo el estado de la aplicación
- Responsive: en pantallas pequeñas, las etiquetas de texto se ocultan quedando solo los íconos

### 5.4 DonanteNavBar (`DonanteNavBar.jsx` — 35 líneas)

**¿Qué hace?** Barra de navegación específica para el usuario donante, con esquema de color verde.

**¿Por qué existe?** Los donantes tienen un conjunto diferente de funcionalidades que las organizaciones. Esta barra separa visualmente las dos experiencias de usuario.

**Pestañas:**
| Pestaña | Ícono | Descripción |
|---------|-------|-------------|
| Donar dinero | 💵 | Formulario de donación monetaria |
| Donar objetos | 📦 | Donación de artículos físicos |
| Mis donaciones | 📋 | Historial de donaciones realizadas |
| Elegir destino | 🗺️ | Seleccionar zonas donde llegarán los fondos |
| Mi impacto | 📊 | Estadísticas de donaciones y progreso |

### 5.5 Dashboard (`Dashboard.jsx` — 30 líneas)

**¿Qué hace?** Muestra un resumen ejecutivo de la auditoría de saldos y un registro de transacciones recientes.

**¿Por qué existe?** Ofrece una vista rápida del estado financiero del sistema y un historial de operaciones en formato de terminal (fondo oscuro, texto verde), útil para auditoría y monitoreo.

**Detalles técnicos:**
- Recibe `personas` y `log` como props desde App.jsx
- Muestra una lista de saldos por persona
- El log se muestra en un contenedor con estilo "terminal" con scroll interno

### 5.6 FaseEmergencia (`FaseEmergencia.jsx` — 28 líneas)

**¿Qué hace?** Simula la fase de despliegue de emergencia, donde se recaudan fondos entre donantes para cubrir costos logísticos de respuesta inmediata.

**¿Por qué existe?** En una emergencia real, lo primero es recaudar fondos rápidamente para cubrir gastos urgentes (combible, transporte, suministros). Esta sección representa esa fase crítica.

### 5.7 FaseRecuperacion (`FaseRecuperacion.jsx` — 74 líneas)

**¿Qué hace?** Gestiona microcréditos para la reactivación económica de emprendedores damnificados. Permite definir el monto que cada inversor aporta y muestra el progreso de recaudación vs. la meta.

**¿Por qué existe?** Después de la fase aguda de la emergencia, las comunidades necesitan recursos financieros para reconstruir sus negocios. Los microcréditos son una herramienta comprobada de recuperación económica.

**Detalles técnicos:**
- Muestra el monto meta vs. el monto recaudado con una barra de progreso
- El usuario puede ajustar el monto individual de cada inversor con inputs incrementales
- Colores verde (recaudado) y rojo (faltante) para feedback visual rápido

### 5.8 Indemnizacion (`Indemnizacion.jsx` — 138 líneas)

**¿Qué hace?** Administra compensaciones económicas para víctimas de la emergencia.

**¿Por qué existe?** Las indemnizaciones son un componente legal y ético de la respuesta humanitaria. Las víctimas tienen derecho a recibir compensación por los daños sufridos.

**Funcionalidades:**
- Estadísticas: pendientes, aprobadas y total de indemnizaciones
- Formulario: persona, monto (con prefijo de moneda), motivo
- Historial: lista cronológica con botón de aprobar cada una
- Las indemnizaciones aprobadas se marcan visualmente en verde

### 5.9 ContactoEmergencia (`ContactoEmergencia.jsx` — 105 líneas)

**¿Qué hace?** Directorio de hospitales, clínicas, centros de acopio y refugios.

**¿Por qué existe?** En una emergencia, saber dónde hay atención médica gratuita, alimento o refugio es vital. Esta sección centraliza esa información.

**Funcionalidades:**
- 10 centros médicos hardcoded con información real de Venezuela
- Formulario para agregar centros dinámicamente
- Tipos de centro: Centro de acopio, Médico gratuito, Refugio, Comedor
- Los centros agregados por el usuario se identifican con borde verde y un sello "ENTRADA GRATUITA"

### 5.10 ZonasAfectadas (`ZonasAfectadas.jsx` — 218 líneas)

**¿Qué hace?** Mapa interactivo de Venezuela donde se pueden colocar y eliminar marcadores de diferentes tipos.

**¿Por qué existe?** La visualización geoespacial es fundamental para coordinar operaciones de rescate. Saber dónde están las zonas afectadas, los equipos desplegados y los hospitales permite tomar decisiones informadas.

**Funcionalidades:**
- **5 tipos de marcadores**: Zonas Afectadas (🔴), Equipos de Rescate (🔵), Zonas en Recuperación (🟢), Zonas Militarizadas (🪖), Revisión de Autoridades (🔍)
- **29 hospitales** pre-cargados con coordenadas reales
- **Herramientas**: Botones en la barra lateral para seleccionar qué tipo de marcador colocar
- **Clic en el mapa**: Coloca un marcador del tipo seleccionado en las coordenadas clickeadas
- **Leyenda**: Indicadores de color por tipo de marcador
- **Lista de marcadores**: Panel con todos los marcadores colocados, con opción de eliminar cada uno
- **Popups**: Al hacer clic en un marcador, muestra su tipo y coordenadas

**Detalles técnicos:**
- Usa `useMapEvents` de react-leaflet para detectar clics en el mapa
- Los marcadores se almacenan en el estado global (`markers`) y se comparten con SplashMap
- Los marcadores se persisten en la sesión (no en la base de datos)
- El mapa se inicializa centrado en Venezuela con zoom nacional

### 5.11 SolicitudesRescate (`SolicitudesRescate.jsx` — 241 líneas)

**¿Qué hace?** Gestiona las solicitudes de rescate de víctimas, permitiendo aceptar, rechazar o confirmar cada solicitud.

**¿Por qué existe?** Cuando una víctima es rescatada, se genera una solicitud que necesita ser procesada: verificar la identidad, asignar un método de pago para la indemnización, y confirmar el estado de salud.

**Flujo de estados:**
```
pendiente → aceptada → enviado
         ↘ rechazada
```

**Funcionalidades:**
- Filtros por estado (pendiente, aceptada, rechazada, enviado)
- Tarjetas expandibles con detalles de cada solicitud
- Formulario de pago: método de pago, moneda (8 opciones: USD, EUR, COP, BTC, etc.), monto, notas
- Al confirmar envío, el estado de salud se actualiza automáticamente a "Recuperado"
- Indicadores de color por estado (amarillo = pendiente, verde = aceptada, rojo = rechazada, azul = enviado)

### 5.12 DonantePanel (`DonantePanel.jsx` — 286 líneas)

**¿Qué hace?** Portal completo e independiente para el usuario donante, con 5 sub-vistas.

**¿Por qué existe?** Los donantes necesitan una experiencia simplificada y enfocada, sin ver las herramientas de administración. Este panel les ofrece todo lo que necesitan para donar y ver su impacto.

**Sub-vistas:**

1. **Donar Dinero**: Formulario con monto, moneda (USD, EUR, COP, Bs, BTC, ETH, USDT, Gold), y selección de zona de destino (8 zonas de Venezuela). Publica a `/api/donantes`.

2. **Donar Objetos**: Selección de tipo de objeto (13 opciones: alimentos no perecederos, agua potable, ropa, medicinas, carpas, colchonetas, mantas, pilas, linternas, combustible, herramientas, materiales de construcción, otros) con cantidad y destino.

3. **Mis Donaciones**: Historial de todas las donaciones realizadas por el usuario, mostrando tipo, cantidad, destino y fecha.

4. **Elegir Destino**: Selección múltiple de zonas de Venezuela donde el donante quiere que lleguen sus fondos. Cada zona tiene prioridad (alta, media, baja).

5. **Mi Impacto**: Estadísticas del donante: total donado, número de donaciones, zonas impactadas, y una barra de progreso visual.

### 5.13 AdminPanel (`AdminPanel.jsx` — 280 líneas)

**¿Qué hace?** Panel de administración con 7 sub-vistas para gestionar todo el sistema.

**Sub-vistas:**
1. **Admin General**: Tarjetas de estadísticas (donantes, equipos, personas rescatadas, donaciones) y actividad reciente
2. **Admin Usuarios**: Tabla de todos los donantes registrados
3. **Admin Equipos**: Tabla de todos los equipos de rescate
4. **Admin Donantes**: Gestión detallada de donantes
5. **Admin Donaciones**: Registro de donaciones con datos de ejemplo
6. **Admin Logs**: Bitácora completa del sistema
7. **Admin Config**: Formulario de configuración del sistema

**Nota**: Actualmente el AdminPanel no está conectado al flujo de login — el modo administrador fue eliminado de la interfaz.

### 5.14 DonantesPage (`DonantesPage.jsx` — 255 líneas)

**¿Qué hace?** CRUD (Crear, Leer, Actualizar, Eliminar) completo para la gestión de donantes.

**¿Por qué existe?** Las organizaciones humanitarias necesitan llevar un registro detallado de quiénes donan, qué tipo de vulnerabilidad tienen (si son víctimas también), y cuánto han donado.

**Funcionalidades:**
- Formulario de registro: nombre, tipo de vulnerabilidad (desplazado, herido, huérfano, adulto mayor, otro), saldo inicial
- Tabla con todos los donantes
- Panel expandible por donante que muestra sus donaciones de objetos
- Agregar objetos individuales: selección de tipo (13 opciones + personalizado) + cantidad
- Eliminar donaciones individuales con botón rojo
- El saldo se actualiza automáticamente al agregar/eliminar donaciones

### 5.15 EquiposRescatePage (`EquiposRescatePage.jsx` — 187 líneas)

**¿Qué hace?** CRUD para la administración de equipos de búsqueda y rescate.

**¿Por qué existe?** Los equipos de rescate son el recurso más crítico en una emergencia. Saber quiénes están disponibles, desplegados o descansando es esencial para la coordinación operativa.

**Funcionalidades:**
- Formulario: nombre del equipo, cantidad de miembros, ubicación, nacionalidad (30+ países dropdown), tiempo estimado de llegada, contacto
- Tabla con ciclos de estado: `Disponible → Desplegado → En descanso → Disponible`
- Badge de nacionalidad con bandera
- Eliminación con confirmación (botón rojo)

### 5.16 RescatadosPage (`RescatadosPage.jsx` — 168 líneas)

**¿Qué hace?** Registro y seguimiento de personas rescatadas durante la emergencia.

**¿Por qué existe?** Cada persona rescatada necesita ser registrada con su estado de salud, el equipo que la rescató, y mantenimiento de su historial.

**Funcionalidades:**
- Formulario: nombre, equipo rescatista (dropdown), estado de salud (Estable, Crítico, Leve, Recuperado)
- **Importación masiva**: componente FileUploadImport para cargar archivos Excel, CSV o TXT
- Búsqueda por nombre en tiempo real
- Cambio inline de estado de salud desde la tabla
- Badges de color por estado de salud

### 5.17 DesaparecidosPage (`DesaparecidosPage.jsx` — 305 líneas)

**¿Qué hace?** Reporte y seguimiento de personas desaparecidas, con detección automática de coincidencias con personas rescatadas.

**¿Por qué existe?** En una emergencia, una de las funciones más importantes es localizar a personas desaparecidas y verificar si ya han sido encontradas.

**Funcionalidades:**
- Formulario: nombre, cédula, zona de última ubicación, foto (upload con preview), tiempo desde la última vez visto
- **Foto**: Upload de imagen con preview inline y modal para ver a pantalla completa. Se almacena como base64 en la base de datos
- **Importación masiva**: FileUploadImport para carga de listas desde Excel/CSV/TXT
- **Detección de coincidencias**: Compara automáticamente los nombres y cédulas de los desaparecidos contra los rescatados. Si hay coincidencia, muestra un banner naranja con la información del hallazgo
- **Marcar como rescatado**: Botón que ejecuta la transacción `/api/transiciones/rescatar`, moviendo el registro de la tabla de desaparecidos a la de rescatados
- Badges de tiempo con colores: verde (<24h), amarillo (24-72h), naranja (3-7 días), rojo (>7 días)

### 5.18 FileUploadImport (`FileUploadImport.jsx` — 133 líneas)

**¿Qué hace?** Componente reutilizable para importar datos desde archivos Excel, CSV o TXT.

**¿Por qué existe?** En emergencias masivas, puede haber cientos o miles de personas desaparecidas o rescatadas. Introducir cada una manualmente sería imposible. Este componente permite cargar listas completas desde hojas de cálculo.

**Formatos soportados:**
- **Excel** (.xlsx, .xls): Usa la librería SheetJS (xlsx) para parsear
- **CSV** (.csv): Separado por comas
- **TXT** (.txt): Separado por tabulación o coma

**Funcionalidades:**
- Zona de drag-and-drop para arrastrar archivos
- Botón de seleccionar archivo
- Vista previa en tabla de los primeros 5 registros antes de importar
- Validación de columnas requeridas (muestra errores en rojo si faltan columnas)
- Botón de importar que pasa los datos al componente padre

### 5.19 Indemnizacion (`Indemnizacion.jsx` — 138 líneas)

Ya explicado en la sección 5.8.

---

## 6. Backend — API REST Completa

### 6.1 Configuración del Servidor

El backend se encuentra en `backend/server.js` y utiliza:

- **Express v5**: Framework HTTP con soporte nativo para async/await
- **cors**: Middleware para habilitar peticiones cross-origin (frontend puerto 3000 → backend puerto 5000)
- **express.json()**: Middleware para parsear automáticamente bodies JSON
- **dotenv**: Carga las variables de entorno desde `backend/.env`
- **pg (Pool)**: Conexión al pool de PostgreSQL

### 6.2 Endpoints

| Método | Ruta | Descripción | Tabla DB |
|--------|------|-------------|----------|
| GET | `/api/donantes` | Listar todos los donantes | personas_donantes |
| GET | `/api/desaparecidos` | Listar todas las personas desaparecidas | desaparecidos |
| POST | `/api/desaparecidos` | Registrar una persona desaparecida | desaparecidos |
| GET | `/api/rescatados` | Listar todas las personas rescatadas | rescatados |
| POST | `/api/rescatados` | Registrar una persona rescatada | rescatados |
| PUT | `/api/rescatados/:id/salud` | Actualizar estado de salud | rescatados |
| GET | `/api/equipos` | Listar todos los equipos de rescate | equipos_rescate |
| POST | `/api/equipos` | Crear un nuevo equipo | equipos_rescate |
| PUT | `/api/equipos/:id/estado` | Actualizar estado del equipo | equipos_rescate |
| DELETE | `/api/equipos/:id` | Eliminar un equipo | equipos_rescate |
| GET | `/api/indemnizaciones` | Listar indemnizaciones | indemnizaciones |
| GET | `/api/proyectos` | Listar proyectos de recuperación | proyectos_recuperacion |
| GET | `/api/logs` | Obtener bitácora del sistema | logs |
| POST | `/api/logs` | Registrar una entrada en bitácora | logs |
| POST | `/api/transiciones/rescatar` | Transacción: desaparecido → rescatado | desaparecidos + rescatados + logs |
| GET | `/api/donaciones` | Listar todas las donaciones de objetos | donaciones |
| POST | `/api/donaciones` | Registrar una donación de objeto | donaciones |
| DELETE | `/api/donaciones/:id` | Eliminar una donación | donaciones |

### 6.3 Transacción Cruzada: Desaparecido → Rescatado

El endpoint `POST /api/transiciones/rescatar` es la operación más compleja del backend. Ejecuta una transacción SQL que:

1. Verifica que la persona exista en la tabla `desaparecidos`
2. La inserta en la tabla `rescatados` con los datos proporcionados
3. La elimina de la tabla `desaparecidos`
4. Registra la operación en la tabla `logs`
5. Si cualquier paso falla, la transacción completa se revierte (rollback)

Esta atomicidad es crítica: no puede quedar una persona duplicada en ambas tablas ni perderse el registro de la operación.

---

## 7. Base de Datos — Esquema Relacional

### 7.1 Diagrama de Tablas

```
personas_donantes          donaciones
┌─────────────────┐       ┌──────────────────┐
│ id (PK)         │◄──┐   │ id (PK)          │
│ nombre          │   └───│ donante_id (FK)  │
│ vulnerabilidad  │       │ tipo_objeto      │
│ saldo           │       │ cantidad         │
└─────────────────┘       │ destino          │
                          │ fecha            │
                          └──────────────────┘

desaparecidos              rescatados
┌─────────────────┐       ┌─────────────────┐
│ id (PK)         │       │ id (PK)         │
│ nombre          │       │ nombre          │
│ cedula          │       │ cedula          │
│ zona            │       │ equipo          │
│ fecha           │       │ estado_salud    │
│ foto (base64)   │       │ foto (base64)   │
└─────────────────┘       │ fecha           │
                          └─────────────────┘

equipos_rescate
┌─────────────────┐
│ id (PK)         │
│ nombre          │
│ miembros        │
│ ubicacion       │
│ estado          │
│ nacionalidad    │
│ tiempo_llegada  │
│ contacto        │
└─────────────────┘

indemnizaciones
┌─────────────────┐
│ id (PK)         │
│ persona         │
│ monto           │
│ motivo          │
│ estado          │
│ fecha           │
└─────────────────┘

logs
┌─────────────────┐
│ id (PK)         │
│ accion          │
│ detalle         │
│ timestamp       │
└─────────────────┘

proyectos_recuperacion
┌─────────────────┐
│ id (PK)         │
│ nombre          │
│ monto_meta      │
│ monto_recaudado │
│ estado          │
└─────────────────┘
```

### 7.2 ¿Por qué Base de Datos Relacional y no NoSQL?

La decisión de usar PostgreSQL (relacional) en lugar de MongoDB (NoSQL) se basa en:

1. **Relaciones claras**: Los datos de PROMIFAD tienen relaciones definidas (donante → donaciones, equipo → rescatados). Las foreign keys garantizan integridad referencial.

2. **Transacciones**: La operación desaparecido → rescatado requiere atomicidad. Las bases de datos relacionales manejan transacciones ACID nativamente.

3. **Consistencia**: En una emergencia humanitaria, un dato inconsistente (un rescatado sin equipo asignado, una donación sin destino) puede tener consecuencias reales. Las constraints de PostgreSQL previenen estos errores.

4. **Consultas complejas**: Buscar coincidencias entre desaparecidos y rescatados, calcular estadísticas de donaciones por zona, o generar reportes de auditoría son operaciones que SQL maneja de forma eficiente y declarativa.

5. **Escalabilidad**: Si el sistema crece, PostgreSQL soporta réplicas, particionamiento de tablas y índices avanzados sin cambiar la arquitectura.

---

## 8. Diseño Visual y Temas

### 8.1 Paleta de Colores

- **Fondo principal**: `#0a0a0a` (negro casi puro)
- **Paneles**: `#111111` (negro ligeramente más claro)
- **Acento primario (Organización)**: `#FF6B00` (naranja)
- **Acento donante**: `#00C853` (verde)
- **Acento organización (formularios)**: `#CE1126` (rojo venezolano)
- **Bordes sutiles**: `rgba(255, 255, 255, 0.06)`
- **Texto principal**: `#ffffff`
- **Texto secundario**: `#999999`

### 8.2 Fondo Decorativo

El fondo de la aplicación tiene un degradado difuminado de los colores de la bandera de Venezuela (amarillo, azul, rojo) aplicado con `filter: blur(80px)` en capas pseudo-elemento. Esto crea un ambiente visual que refuerza la identidad nacional del proyecto sin ser distraído.

### 8.3 Sistema de Temas

La aplicación soporta 5 temas a través de variables CSS:
1. **Default (Naranja)**: Acento naranja sobre fondo oscuro
2. **Morado y Rosa**: Tono púrpura/magenta
3. **Morado y Azul**: Tono índigo
4. **Blanco y Negro**: Monocromático

El tema se controla mediante la variable `--orange-accent` que se reasigna según el tema seleccionado.

### 8.4 Tipografía

Se utiliza **Inter** (Google Fonts), una tipografía sans-serif moderna diseñada paraInterfaces de usuario, con excelente legibilidad en tamaños pequeños y un aspecto profesional.

---

## 9. Flujo de la Aplicación

### 9.1 Flujo de Usuario Organización

```
Pantalla Splash (landing con mapa)
  │
  ├── [Registrarse ▾] → Dropdown
  │     ├── Donante → Formulario registro donante
  │     └── Organización → Formulario login organización
  │
  └── [Iniciar sesión ▾] → Dropdown
        ├── Donante → Formulario login donante
        └── Organización → Formulario login organización
              │
              ▼
      NavBar (8 pestañas)
        │
        ├── Inicio → Dashboard + FaseEmergencia + FaseRecuperacion
        ├── Donantes → DonantesPage (CRUD)
        ├── Equipos → EquiposRescatePage (CRUD)
        ├── Rescatados → RescatadosPage (+ importación masiva)
        ├── Desaparecidos → DesaparecidosPage (+ detección de coincidencias)
        ├── Indemnización → Indemnizacion (registro + aprobación)
        ├── Zonas Afectadas → ZonasAfectadas (mapa interactivo)
        └── Contacto Emergencia → ContactoEmergencia (directorio)
```

### 9.2 Flujo de Usuario Donante

```
Pantalla Splash (landing con mapa)
  │
  └── [Registrarse/Iniciar sesión ▾] → Donante
        │
        ▼
      DonanteNavBar (5 pestañas)
        │
        ├── Donar Dinero → Formulario (monto, moneda, zona destino)
        ├── Donar Objetos → Formulario (tipo, cantidad, destino)
        ├── Mis Donaciones → Historial de donaciones
        ├── Elegir Destino → Selección de zonas con prioridad
        └── Mi Impacto → Estadísticas y barra de progreso
```

### 9.3 Carga de Datos Inicial

Al montar la aplicación (`App.jsx`), se ejecutan en paralelo todas las llamadas GET al backend:

```javascript
useEffect(() => {
  fetch('http://localhost:5000/api/donantes').then(...)
  fetch('http://localhost:5000/api/desaparecidos').then(...)
  fetch('http://localhost:5000/api/rescatados').then(...)
  fetch('http://localhost:5000/api/equipos').then(...)
  fetch('http://localhost:5000/api/indemnizaciones').then(...)
  fetch('http://localhost:5000/api/logs').then(...)
  fetch('http://localhost:5000/api/donaciones').then(...)
  fetch('http://localhost:5000/api/proyectos').then(...)
}, []);
```

Los datos se almacenan en el estado del componente raíz y se distribuyen a los hijos mediante props.

---

## 10. Funcionalidades Clave Implementadas

### 10.1 Gestión de Donantes y Donaciones

Los donantes pueden registrar su perfil y realizar dos tipos de donaciones:
- **Dinero**: Con selección de moneda (USD, EUR, COP, Bolívares, BTC, ETH, USDT, Oro) y zona de destino en Venezuela
- **Objetos**: 13 tipos predefinidos (alimentos, agua, ropa, medicinas, carpas, colchonetas, mantas, pilas, linternas, combustible, herramientas, materiales de construcción, otros) más opción personalizada

Cada donante tiene un panel donde puede ver su historial, elegir dónde llegarán sus fondos, y ver estadísticas de impacto.

### 10.2 Coordinación de Rescate

- Registro de equipos de rescate con nacionalidad, tiempo de llegada y contacto
- Ciclo de estados: Disponible → Desplegado → En descanso
- Mapa interactivo para ubicar equipos geográficamente
- Solicitudes de rescate con flujo de aceptación/rechazo y proceso de pago

### 10.3 Registro de Personas

- **Desaparecidos**: Con foto (base64), cédula, zona, tiempo desde última vista
- **Rescatados**: Con equipo asignado, estado de salud, foto
- **Detección automática**: Cruza listas de desaparecidos y rescatados por nombre y cédula
- **Transacción**: Mover desaparecido → rescatado de forma atómica

### 10.4 Mapa Interactivo

- 29 hospitales reales de Venezuela pre-cargados
- 5 tipos de marcadores (zona, equipo, recuperación, militar, revisión)
- Marcadores compartidos entre ZonasAfectadas y SplashMap
- Sidebar con herramientas, leyenda y lista de marcadores

### 10.5 Importación Masiva de Datos

- Soporte para Excel (.xlsx, .xls), CSV y TXT
- Drag-and-drop con vista previa
- Validación de columnas requeridas
- Usado en RescatadosPage y DesaparecidosPage

---

## 11. Instalación y Ejecución

### Requisitos
- Node.js 18+
- PostgreSQL 14+ (con base de datos `promifad_db` creada)

### Backend
```bash
cd backend
npm install
# Configurar .env con credenciales de PostgreSQL
node server.js
# → Servidor corriendo en http://localhost:5000
```

### Frontend
```bash
npm install
npm run dev
# → Aplicación corriendo en http://localhost:3000
```

### Build de Producción
```bash
npm run build
# Genera carpeta dist/ con archivos optimizados
npm run preview
# Vista previa de la build en localhost:4173
```

---

## 12. Notas Técnicas Importantes

### Almacenamiento de Fotos
Las fotos de personas desaparecidas y rescatadas se almacenan como strings **base64** directamente en la base de datos PostgreSQL. Aunque esto no es óptimo para archivos grandes, simplifica enormemente la arquitectura al eliminar la necesidad de un servidor de archivos, rutas de almacenamiento y gestión de permisos. Para el volumen esperado de este sistema (fotos de personas, no galerías), es una solución práctica.

### Puerto de Desarrollo
- Frontend: `http://localhost:3000` (configurado en `vite.config.js`)
- Backend: `http://localhost:5000` (configurado en `backend/.env` o default en server.js)
- PostgreSQL: `localhost:5432` (default)

### CORS
El backend habilita CORS sin restricciones (`app.use(cors())`) para permitir que el frontend en el puerto 3000 haga peticiones al backend en el puerto 5000. En producción, se debería restringir a un dominio específico.

### Variables de Entorno
El archivo `backend/.env` contiene las credenciales de PostgreSQL. Está incluido en `.gitignore` para no subirlo al repositorio. La contraseña contiene el carácter `$` y debe ir entre comillas dobles en el archivo .env.

---

## 13. Estado Actual y Funcionalidades Pendientes

### Completado
- ✅ Sistema de login con 2 modos (organización, donante)
- ✅ Landing page interactiva con mapa y sección de donaciones
- ✅ CRUD de donantes con donaciones de objetos
- ✅ CRUD de equipos de rescate con nacionalidad y contacto
- ✅ Gestión de personas rescatadas con importación masiva
- ✅ Gestión de personas desaparecidas con foto y detección de coincidencias
- ✅ Transacción atómica desaparecido → rescatado
- ✅ Sistema de indemnizaciones con aprobación
- ✅ Mapa interactivo con 5 tipos de marcadores y 29 hospitales
- ✅ Directorio de contactos de emergencia
- ✅ Portal del donante (donar dinero, objetos, elegir destino, ver impacto)
- ✅ Importación masiva desde Excel/CSV/TXT
- ✅ Solicitudes de rescate con flujo de estados
- ✅ Bitácora de operaciones
- ✅ Diseño dark theme con 5 temas configurables

### Pendiente / Mejoras Futuras
- ⬜ Migración de columnas en DB: agregar `nacionalidad`, `tiempo_llegada`, `contacto` a `equipos_rescate`; `foto` y `cedula` a `desaparecidos` y `rescatados`
- ⬜ Autenticación real con JWT o sesiones
- ⬜ Almacenamiento de fotos en disco/S3 en lugar de base64
- ⬜ Persistencia de marcadores del mapa en la base de datos
- ⬜ Notificaciones en tiempo real (WebSocket)
- ⬜ Panel de administración conectado al flujo de login
- ⬜ Filtros avanzados y paginación
- ⬜ Tests unitarios y de integración
- ⬜ Deployment en producción (Docker, Nginx, SSL)

---

## 14. Resumen

PROMIFAD es una plataforma humanitaria completa que integra todas las facetas de la respuesta ante emergencias: desde la gestión de donantes y donaciones, hasta la coordinación de equipos de rescate, el registro de personas afectadas, la visualización geoespacial de zonas impactadas, y la compensación económica a víctimas.

La elección de **Vite + React** para el frontend garantiza desarrollo rápido y una interfaz moderna y responsiva. **Express** proporciona un backend simple pero robusto. **PostgreSQL** asegura integridad de datos, transacciones atómicas y escalabilidad — todo crítico cuando se manejan vidas humanas y recursos financieros en una emergencia.

El sistema está diseñado para ser desplegado en Venezuela pero es lo suficientemente genérico para adaptarse a cualquier contexto de emergencia humanitaria en Latinoamérica.
