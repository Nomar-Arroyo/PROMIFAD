# PROMIFAD — Sistema de Resiliencia y Financiación Humanitaria

Sistema web interactivo para la gestión de emergencias humanitarias, desarrollado con React + Vite. Permite coordinar donantes, equipos de rescate, personas afectadas e indemnizaciones en un solo panel.

---

## Funcionalidades

### Panel Principal (Inicio)
- **Fase de Despliegue de Emergencia** — Simula la recaudación de fondos entre donantes para cubrir costos logísticos de respuesta inmediata.
- **Fase de Reactivación Económica** — Otorga microcréditos a emprendedores damnificados. Permite elegir el monto exacto que cada inversor aporta.
- **Dashboard / Auditoría** — Muestra saldos de cada persona y un registro de transacciones en tiempo real.

### Gestión de Donantes
CRUD completo para administrar donantes:
- Registrar nuevos donantes con nombre, tipo de vulnerabilidad y saldo inicial.
- Visualizar listado con saldos actualizados.
- Eliminar donantes.

### Equipos de Búsqueda y Rescate
Administración de brigadas de rescate:
- Registrar equipos con nombre, cantidad de miembros y ubicación.
- Cambiar estado entre: `Disponible` → `Desplegado` → `En descanso`.
- Eliminar equipos.

### Personas Rescatadas
Registro de personas rescatadas durante la emergencia:
- Registrar rescates asignando el equipo rescatista y estado de salud.
- Filtrar por nombre.
- Actualizar estado de salud (`Estable`, `Crítico`, `Leve`, `Recuperado`).

### Personas Desaparecidas
Seguimiento de personas reportadas como desaparecidas:
- Reportar desapariciones con zona de última ubicación.
- Buscar por nombre.
- Marcar como rescatado (mueve automáticamente el registro a la lista de rescatados).

### Indemnización a Afectados
Compensación económica para personas damnificadas:
- Registrar indemnizaciones seleccionando persona, monto y motivo.
- Resumen visual de montos pendientes y aprobados.
- Historial completo con opción de aprobar cada indemnización.

---

## Diseño

- **Paleta:** Negro (#0a0a0a) con acentos naranja (#FF6B00), bordes sutiles y sombras.
- **Fondo:** Bandera de Venezuela tricolor (amarillo, azul, rojo) como fondo difuminado con `filter: blur(80px)`.
- **Tipografía:** Inter (sans-serif moderna) en lugar de serif clásico.
- **Navegación:** Barra superior fija con pestañas para acceder a cada módulo.
- **Distribución:** Diseño responsivo con grid de dos columnas en escritorio, colapsa a una en móvil.

---

## Tecnologías

- **React 18** con hooks (useState)
- **Vite 5** como bundler
- **CSS plano** con variables personalizadas
- **ESLint** para linting

---

## Estructura del proyecto

```
src/
├── App.jsx                 # Componente principal con sistema de pestañas
├── App.css                 # Estilos del layout principal
├── index.css               # Variables CSS, fondo, estilos globales
├── main.jsx                # Punto de entrada
├── components/
│   ├── NavBar/             # Barra de navegación superior
│   ├── Dashboard/          # Panel de auditoría de saldos y logs
│   ├── FaseEmergencia/     # Fase de despliegue de emergencia
│   ├── FaseRecuperacion/   # Fase de reactivación económica (microcréditos)
│   └── Indemnizacion/      # Gestión de indemnizaciones
└── pages/
    ├── DonantesPage.jsx     # CRUD de donantes
    ├── EquiposRescatePage.jsx  # CRUD de equipos de rescate
    ├── RescatadosPage.jsx   # Registro de personas rescatadas
    ├── DesaparecidosPage.jsx   # Reporte de personas desaparecidas
    └── pages.css            # Estilos compartidos entre páginas
```

---

## Instalación y uso

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de la build
npm run preview
```

---

## Licencia

Proyecto académico / demostrativo — PROMIFAD.
