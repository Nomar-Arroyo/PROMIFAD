import { useState } from 'react';
import './pages.css';

export default function EquiposRescatePage({ equiposRescate, setEquiposRescate }) {
  const [nombre, setNombre] = useState('');
  const [miembros, setMiembros] = useState('');
  const [ubicacion, setUbicacion] = useState('');

  const agregarEquipo = (e) => {
    e.preventDefault();
    if (!nombre || !miembros) return;
    const nuevoId = `EQ-${String(equiposRescate.length + 1).padStart(2, '0')}`;
    setEquiposRescate(prev => [...prev, {
      id: nuevoId,
      nombre,
      miembros: parseInt(miembros),
      ubicacion: ubicacion || 'No asignada',
      estado: 'Disponible'
    }]);
    setNombre('');
    setMiembros('');
    setUbicacion('');
  };

  const toggleEstado = (id) => {
    setEquiposRescate(prev => prev.map(eq => {
      if (eq.id !== id) return eq;
      const next = eq.estado === 'Disponible' ? 'Desplegado' :
                   eq.estado === 'Desplegado' ? 'En descanso' : 'Disponible';
      return { ...eq, estado: next };
    }));
  };

  const eliminarEquipo = (id) => {
    setEquiposRescate(prev => prev.filter(eq => eq.id !== id));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Equipos de Búsqueda y Rescate</h2>
        <span>{equiposRescate.length} equipos</span>
      </div>

      <div className="page-grid">
        <div className="page-card">
          <h3>Registrar Equipo</h3>
          <form className="form-grid" onSubmit={agregarEquipo}>
            <div className="form-grupo full">
              <label>Nombre del equipo</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Brigada Alfa" />
            </div>
            <div className="form-grupo">
              <label>Miembros</label>
              <input type="number" min="1" value={miembros} onChange={e => setMiembros(e.target.value)} placeholder="5" />
            </div>
            <div className="form-grupo">
              <label>Ubicación</label>
              <input value={ubicacion} onChange={e => setUbicacion(e.target.value)} placeholder="Zona de operación" />
            </div>
            <button type="submit" disabled={!nombre || !miembros}>Registrar Equipo</button>
          </form>
        </div>

        <div className="page-card">
          <h3>Equipos Registrados</h3>
          {equiposRescate.length === 0 ? (
            <div className="empty-msg">No hay equipos registrados</div>
          ) : (
            <div className="tabla-contenedor">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Miembros</th>
                    <th>Ubicación</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {equiposRescate.map(eq => (
                    <tr key={eq.id}>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{eq.id}</td>
                      <td>{eq.nombre}</td>
                      <td>{eq.miembros}</td>
                      <td>{eq.ubicacion}</td>
                      <td>
                        <span className={`estado-badge ${eq.estado.toLowerCase()}`}>
                          {eq.estado}
                        </span>
                      </td>
                      <td>
                        <button className="acciones-btn" onClick={() => toggleEstado(eq.id)} title="Cambiar estado">↻</button>
                        <button className="acciones-btn" onClick={() => eliminarEquipo(eq.id)} title="Eliminar">✕</button>
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
