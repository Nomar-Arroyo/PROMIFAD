import { useState } from 'react';
import NavBar from './components/NavBar/NavBar';
import FaseEmergencia from './components/FaseEmergencia/FaseEmergencia';
import FaseRecuperacion from './components/FaseRecuperacion/FaseRecuperacion';
import Dashboard from './components/Dashboard/Dashboard';
import Indemnizacion from './components/Indemnizacion/Indemnizacion';
import DonantesPage from './pages/DonantesPage';
import EquiposRescatePage from './pages/EquiposRescatePage';
import RescatadosPage from './pages/RescatadosPage';
import DesaparecidosPage from './pages/DesaparecidosPage';
import './App.css';

function App() {
  const [tabActiva, setTabActiva] = useState('inicio');

  const [personas, setPersonas] = useState([
    { id: "PER-01", nombre: "Juan Pérez", vulnerabilidad: "Ninguna", saldo: 100.0 },
    { id: "PER-02", nombre: "María López", vulnerabilidad: "Zonificación de Riesgo", saldo: 250.0 },
    { id: "PER-03", nombre: "Carlos Mendoza", vulnerabilidad: "Ninguna", saldo: 40.0 }
  ]);

  const [proyecto, setProyecto] = useState({
    id: "PROY-01",
    descripcion: "Reconstrucción Barbería El Estilo",
    montoRequerido: 300.0,
    montoActual: 0.0,
    estado: "PENDIENTE"
  });

  const [log, setLog] = useState([]);

  const [equiposRescate, setEquiposRescate] = useState([
    { id: "EQ-01", nombre: "Brigada Alfa", miembros: 5, ubicacion: "Zona Norte", estado: "Disponible" },
    { id: "EQ-02", nombre: "Rescate Vertical", miembros: 3, ubicacion: "Zona Centro", estado: "Desplegado" },
    { id: "EQ-03", nombre: "Búsqueda Avanzada", miembros: 4, ubicacion: "Zona Sur", estado: "Disponible" }
  ]);

  const [personasRescatadas, setPersonasRescatadas] = useState([
    { id: "RES-01", nombre: "Ana Torres", fechaRescate: "15/06/2024", equipo: "Brigada Alfa", estado: "Estable" },
    { id: "RES-02", nombre: "Pedro Sánchez", fechaRescate: "16/06/2024", equipo: "Rescate Vertical", estado: "Crítico" }
  ]);

  const [personasDesaparecidas, setPersonasDesaparecidas] = useState([
    { id: "DES-01", nombre: "Lucía Fernández", ultimaVista: "14/06/2024", zona: "Zona Norte" },
    { id: "DES-02", nombre: "Roberto Gómez", ultimaVista: "15/06/2024", zona: "Zona Centro" },
    { id: "DES-03", nombre: "Elena Vargas", ultimaVista: "13/06/2024", zona: "Zona Sur" }
  ]);

  const [indemnizaciones, setIndemnizaciones] = useState([
    { id: "IND-01", persona: "Juan Pérez", monto: 500.0, motivo: "Pérdida de vivienda", fecha: "20/06/2024", estado: "Aprobado" },
    { id: "IND-02", persona: "María López", monto: 300.0, motivo: "Daños materiales", fecha: "21/06/2024", estado: "Pendiente" }
  ]);

  const addLog = (message) => setLog(prev => [...prev, message]);

  const renderTab = () => {
    switch (tabActiva) {
      case 'inicio':
        return (
          <main className="inicio-grid">
            <div className="inicio-col">
              <FaseEmergencia personas={personas} setPersonas={setPersonas} addLog={addLog} />
              <FaseRecuperacion personas={personas} setPersonas={setPersonas} proyecto={proyecto} setProyecto={setProyecto} addLog={addLog} />
            </div>
            <div className="inicio-col">
              <Dashboard personas={personas} proyecto={proyecto} log={log} />
            </div>
          </main>
        );
      case 'donantes':
        return <DonantesPage personas={personas} setPersonas={setPersonas} />;
      case 'equipos':
        return <EquiposRescatePage equiposRescate={equiposRescate} setEquiposRescate={setEquiposRescate} />;
      case 'rescatados':
        return <RescatadosPage personasRescatadas={personasRescatadas} setPersonasRescatadas={setPersonasRescatadas} equiposRescate={equiposRescate} />;
      case 'desaparecidos':
        return (
          <DesaparecidosPage
            personasDesaparecidas={personasDesaparecidas}
            setPersonasDesaparecidas={setPersonasDesaparecidas}
            personasRescatadas={personasRescatadas}
            setPersonasRescatadas={setPersonasRescatadas}
          />
        );
      case 'indemnizacion':
        return (
          <Indemnizacion
            personas={personas}
            indemnizaciones={indemnizaciones}
            setIndemnizaciones={setIndemnizaciones}
            addLog={addLog}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <NavBar tabActiva={tabActiva} setTabActiva={setTabActiva} />
      <div className="app-content">
        <header className="app-header">
          <h1>Sistema de Resiliencia y Financiación Humanitaria</h1>
          <div className="header-line" />
        </header>
        {renderTab()}
      </div>
    </div>
  );
}

export default App;
