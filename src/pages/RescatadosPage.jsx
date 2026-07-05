import { useState } from 'react';
import './pages.css';

export default function RescatadosPage({ personasRescatadas, setPersonasRescatadas, equiposRescate }) {
  const [nombre, setNombre] = useState('');
  const [equipo, setEquipo] = useState('');
  const [estado, setEstado] = useState('Estable');
  const [busqueda, setBusqueda] = useState('');

  const agregarRescatado = (e) => {
    e.preventDefault();
    if (!nombre) return;
    const nuevoId = `RES-${String(personasRescatadas.length + 1).padStart(2, '0')}`;
    const hoy = new Date().toLocaleDateString('es-ES');
    setPersonasRescatadas(prev => [...prev, {
      id: nuevoId,
      nombre,
      fechaRescate: hoy,
      equipo: equipo || 'No asignado',
      estado
    }]);
    setNombre('');
    setEquipo('');
    setEstado('Estable');
  };

  const cambiarEstado = (id, nuevoEstado) => {
    setPersonasRescatadas(prev => prev.map(r =>
      r.id === id ? { ...r, estado: nuevoEstado } : r
    ));
  };

  const filtrados = personasRescatadas.filter(r =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h2>Personas Rescatadas</h2>
        <span>{personasRescatadas.length} registros</span>
      </div>

      <div className="page-grid">
        <div className="page-card">
          <h3>Registrar Rescate</h3>
          <form className="form-grid" onSubmit={agregarRescatado}>
            <div className="form-grupo full">
              <label>Nombre de la persona</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre completo" />
            </div>
            <div className="form-grupo">
              <label>Equipo rescatista</label>
              <select value={equipo} onChange={e => setEquipo(e.target.value)}>
                <option value="">Seleccionar...</option>
                {equiposRescate.map(eq => (
                  <option key={eq.id} value={eq.nombre}>{eq.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-grupo">
              <label>Estado de salud</label>
              <select value={estado} onChange={e => setEstado(e.target.value)}>
                <option value="Estable">Estable</option>
                <option value="Crítico">Crítico</option>
                <option value="Leve">Leve</option>
                <option value="Recuperado">Recuperado</option>
              </select>
            </div>
            <button type="submit" disabled={!nombre}>Registrar Rescate</button>
          </form>
        </div>

        <div className="page-card">
          <h3>Rescatados</h3>
          <input
            style={{ marginBottom: '0.8rem', width: '100%' }}
            placeholder="Buscar..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {filtrados.length === 0 ? (
            <div className="empty-msg">No hay registros</div>
          ) : (
            <div className="tabla-contenedor">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Fecha</th>
                    <th>Equipo</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(r => (
                    <tr key={r.id}>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{r.id}</td>
                      <td>{r.nombre}</td>
                      <td>{r.fechaRescate}</td>
                      <td>{r.equipo}</td>
                      <td>
                        <span className={`estado-badge ${r.estado.toLowerCase()}`}>
                          {r.estado}
                        </span>
                      </td>
                      <td>
                        <select
                          value={r.estado}
                          onChange={e => cambiarEstado(r.id, e.target.value)}
                          style={{ fontSize: '0.7rem', padding: '0.2rem', width: '80px' }}
                        >
                          <option value="Estable">Estable</option>
                          <option value="Crítico">Crítico</option>
                          <option value="Leve">Leve</option>
                          <option value="Recuperado">Recuperado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
