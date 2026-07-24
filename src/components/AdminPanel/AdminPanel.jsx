import { useState } from 'react';
import './AdminPanel.css';

function AdminGeneral({ personas, personasRescatadas, personasDesaparecidas, equiposRescate, log }) {
  const totalDonado = personas.reduce((s, p) => s + parseFloat(p.saldo || 0), 0);
  const stats = [
    { label: 'Donantes', value: personas.length, icon: '🤝', color: '#00C853' },
    { label: 'Rescatados', value: personasRescatadas.length, icon: '🚁', color: '#42A5F5' },
    { label: 'Desaparecidos', value: personasDesaparecidas.length, icon: '❓', color: '#FF9800' },
    { label: 'Equipos', value: equiposRescate.length, icon: '🚒', color: '#CE1126' },
    { label: 'Fondos totales', value: `$${totalDonado.toFixed(2)}`, icon: '💰', color: '#00C853' },
  ];

  return (
    <div className="admin-section">
      <h3>Panel de Control General</h3>
      <div className="admin-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="admin-stat-card" style={{ borderLeftColor: s.color }}>
            <span className="admin-stat-icon">{s.icon}</span>
            <div className="admin-stat-info">
              <span className="admin-stat-num" style={{ color: s.color }}>{s.value}</span>
              <span className="admin-stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-card">
        <h4>Actividad reciente</h4>
        <div className="admin-logs">
          {log.slice(0, 10).map((l, i) => (
            <div key={i} className="admin-log-item">{l}</div>
          ))}
          {log.length === 0 && <div className="admin-empty">Sin actividad registrada</div>}
        </div>
      </div>
    </div>
  );
}

function AdminUsuarios({ personas }) {
  return (
    <div className="admin-section">
      <h3>Gestión de Usuarios</h3>
      <div className="admin-card">
        <h4>Donantes registrados ({personas.length})</h4>
        <div className="admin-tabla-wrap">
          <table className="admin-tabla">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Vulnerabilidad</th><th>Saldo</th></tr>
            </thead>
            <tbody>
              {personas.map(p => (
                <tr key={p.id}>
                  <td className="mono">{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.vulnerabilidad}</td>
                  <td className="saldo">${parseFloat(p.saldo || 0).toFixed(2)}</td>
                </tr>
              ))}
              {personas.length === 0 && <tr><td colSpan="4" className="empty">Sin registros</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminEquipos({ equiposRescate }) {
  return (
    <div className="admin-section">
      <h3>Gestión de Equipos de Rescate</h3>
      <div className="admin-card">
        <h4>Equipos ({equiposRescate.length})</h4>
        <div className="admin-tabla-wrap">
          <table className="admin-tabla">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Nacionalidad</th><th>Miembros</th><th>Ubicación</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {equiposRescate.map(eq => (
                <tr key={eq.id}>
                  <td className="mono">{eq.id}</td>
                  <td>{eq.nombre}</td>
                  <td>{eq.nacionalidad || '—'}</td>
                  <td>{eq.miembros}</td>
                  <td>{eq.ubicacion}</td>
                  <td><span className={`admin-badge ${eq.estado.toLowerCase().replace(' ', '-')}`}>{eq.estado}</span></td>
                </tr>
              ))}
              {equiposRescate.length === 0 && <tr><td colSpan="6" className="empty">Sin equipos</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminDonantes({ personas }) {
  return (
    <div className="admin-section">
      <h3>Administración de Donantes</h3>
      <div className="admin-card">
        <h4>Total: {personas.length} donantes</h4>
        <div className="admin-tabla-wrap">
          <table className="admin-tabla">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Saldo</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {personas.map(p => (
                <tr key={p.id}>
                  <td className="mono">{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.correo || '—'}</td>
                  <td className="saldo">${parseFloat(p.saldo || 0).toFixed(2)}</td>
                  <td><button className="admin-action-btn">Ver</button></td>
                </tr>
              ))}
              {personas.length === 0 && <tr><td colSpan="5" className="empty">Sin registros</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminDonaciones() {
  const [donaciones] = useState([
    { id: 'DON-001', donante: 'María López', objeto: 'Agua potable', cantidad: 20, fecha: '2026-07-10' },
    { id: 'DON-002', donante: 'Carlos Pérez', objeto: 'Medicinas', cantidad: 5, fecha: '2026-07-12' },
    { id: 'DON-003', donante: 'Ana García', objeto: 'Ropa', cantidad: 30, fecha: '2026-07-13' },
  ]);

  return (
    <div className="admin-section">
      <h3>Registro de Donaciones</h3>
      <div className="admin-card">
        <h4>Donaciones de objetos ({donaciones.length})</h4>
        <div className="admin-tabla-wrap">
          <table className="admin-tabla">
            <thead>
              <tr><th>ID</th><th>Donante</th><th>Objeto</th><th>Cantidad</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {donaciones.map(d => (
                <tr key={d.id}>
                  <td className="mono">{d.id}</td>
                  <td>{d.donante}</td>
                  <td>{d.objeto}</td>
                  <td>{d.cantidad}</td>
                  <td>{d.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminLogs({ log }) {
  return (
    <div className="admin-section">
      <h3>Bitácora del Sistema</h3>
      <div className="admin-card">
        <h4>Últimos registros ({log.length})</h4>
        <div className="admin-logs-full">
          {log.map((l, i) => (
            <div key={i} className="admin-log-full-item">
              <span className="admin-log-num">#{log.length - i}</span>
              <span>{l}</span>
            </div>
          ))}
          {log.length === 0 && <div className="admin-empty">Sin registros en bitácora</div>}
        </div>
      </div>
    </div>
  );
}

function AdminConfig() {
  const [guardado, setGuardado] = useState(false);

  const handleGuardar = () => {
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  return (
    <div className="admin-section">
      <h3>Configuración del Sistema</h3>
      {guardado && <div className="admin-exito">✓ Configuración guardada</div>}
      <div className="admin-config-grid">
        <div className="admin-card">
          <h4>General</h4>
          <div className="admin-config-item">
            <label>Nombre del sistema</label>
            <input defaultValue="PROMIFAD" />
          </div>
          <div className="admin-config-item">
            <label>Puerto del servidor</label>
            <input defaultValue="5000" />
          </div>
          <div className="admin-config-item">
            <label>Modo de mantenimiento</label>
            <select defaultValue="normal">
              <option value="normal">Normal</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>
        </div>
        <div className="admin-card">
          <h4>Base de datos</h4>
          <div className="admin-config-item">
            <label>Host</label>
            <input defaultValue="localhost" />
          </div>
          <div className="admin-config-item">
            <label>Puerto DB</label>
            <input defaultValue="5432" />
          </div>
          <div className="admin-config-item">
            <label>Estado</label>
            <span className="admin-badge disponible">Conectado</span>
          </div>
        </div>
        <div className="admin-card">
          <h4>Seguridad</h4>
          <div className="admin-config-item">
            <label>Código de administrador</label>
            <input type="password" defaultValue="•••••" />
          </div>
          <div className="admin-config-item">
            <label>Sesiones máximas</label>
            <input defaultValue="10" type="number" />
          </div>
        </div>
      </div>
      <button className="admin-btn-guardar" onClick={handleGuardar}>Guardar configuración</button>
    </div>
  );
}

export default function AdminPanel({ user, tabActiva, personas, personasRescatadas, personasDesaparecidas, equiposRescate, log }) {
  const renderContent = () => {
    switch (tabActiva) {
      case 'admin-general':
        return <AdminGeneral personas={personas} personasRescatadas={personasRescatadas} personasDesaparecidas={personasDesaparecidas} equiposRescate={equiposRescate} log={log} />;
      case 'admin-usuarios':
        return <AdminUsuarios personas={personas} />;
      case 'admin-equipos':
        return <AdminEquipos equiposRescate={equiposRescate} />;
      case 'admin-donantes':
        return <AdminDonantes personas={personas} />;
      case 'admin-donaciones':
        return <AdminDonaciones />;
      case 'admin-logs':
        return <AdminLogs log={log} />;
      case 'admin-config':
        return <AdminConfig />;
      default:
        return <AdminGeneral personas={personas} personasRescatadas={personasRescatadas} personasDesaparecidas={personasDesaparecidas} equiposRescate={equiposRescate} log={log} />;
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h1>Panel de Administración</h1>
        <div className="admin-header-line" />
      </div>
      {renderContent()}
    </div>
  );
}
