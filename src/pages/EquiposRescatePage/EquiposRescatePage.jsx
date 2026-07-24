import { useState } from 'react';
import './EquiposRescatePage.css';

const NACIONALIDADES = [
  'Venezolana', 'Colombiana', 'Brasileña', 'Peruana', 'Ecuatoriana',
  'Argentina', 'Chilena', 'Boliviana', 'Paraguaya', 'Uruguaya',
  'Panameña', 'Costarricense', 'Hondureña', 'Guatemalteca', 'Salvadoreña',
  'Dominicana', 'Cubana', 'Haitiana', 'Nicaragüense', 'Española',
  'Estadounidense', 'Canadiense', 'Británica', 'Francesa', 'Alemana',
  'China', 'Japonesa', 'Coreana', 'India', 'Rusa',
  'Otra'
];

export default function EquiposRescatePage({ equiposRescate, onRefresh }) {
  const [nombre, setNombre] = useState('');
  const [miembros, setMiembros] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [nacionalidad, setNacionalidad] = useState('');
  const [tiempoLlegada, setTiempoLlegada] = useState('');
  const [contacto, setContacto] = useState('');

  const agregarEquipo = async (e) => {
    e.preventDefault();
    if (!nombre || !miembros) return;

    try {
      const res = await fetch('http://localhost:5000/api/equipos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          miembros: parseInt(miembros),
          ubicacion,
          nacionalidad: nacionalidad || 'No especificada',
          tiempo_llegada: tiempoLlegada || null,
          contacto: contacto || 'Sin contacto'
        })
      });
      if (res.ok) {
        setNombre('');
        setMiembros('');
        setUbicacion('');
        setNacionalidad('');
        setTiempoLlegada('');
        setContacto('');
        onRefresh();
      }
    } catch (error) {
      console.error("Error agregando brigada:", error);
    }
  };

  const toggleEstado = async (eq) => {
    const siguienteEstado = eq.estado === 'Disponible' ? 'Desplegado' :
                            eq.estado === 'Desplegado' ? 'En descanso' : 'Disponible';
    try {
      const res = await fetch(`http://localhost:5000/api/equipos/${eq.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: siguienteEstado })
      });
      if (res.ok) onRefresh();
    } catch (error) {
      console.error("Error actualizando estado de brigada:", error);
    }
  };

  const eliminarEquipo = async (id, nombre) => {
    if (!window.confirm(`¿Retirar al equipo "${nombre}"? Esta acción eliminará el registro.`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/equipos/${id}`, { method: 'DELETE' });
      if (res.ok) onRefresh();
    } catch (error) {
      console.error("Error eliminando brigada:", error);
    }
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
            <div className="form-grupo">
              <label>Nacionalidad</label>
              <select value={nacionalidad} onChange={e => setNacionalidad(e.target.value)}>
                <option value="">Seleccionar...</option>
                {NACIONALIDADES.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="form-grupo">
              <label>Tiempo de llegada</label>
              <input
                type="datetime-local"
                value={tiempoLlegada}
                onChange={e => setTiempoLlegada(e.target.value)}
              />
            </div>
            <div className="form-grupo full">
              <label>Contacto del equipo</label>
              <input value={contacto} onChange={e => setContacto(e.target.value)} placeholder="Teléfono, email o radio" />
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
                    <th>Nacionalidad</th>
                    <th>Miembros</th>
                    <th>Ubicación</th>
                    <th>Llegada</th>
                    <th>Contacto</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {equiposRescate.map(eq => (
                    <tr key={eq.id}>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{eq.id}</td>
                      <td>{eq.nombre}</td>
                      <td>
                        <span className="nacionalidad-badge">
                          {eq.nacionalidad || 'No especificada'}
                        </span>
                      </td>
                      <td>{eq.miembros}</td>
                      <td>{eq.ubicacion}</td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {eq.tiempo_llegada
                          ? new Date(eq.tiempo_llegada).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                      <td style={{ fontSize: '0.75rem' }}>{eq.contacto || '—'}</td>
                      <td>
                        <span className={`estado-badge ${eq.estado.toLowerCase().replace(' ', '-')}`}>
                          {eq.estado}
                        </span>
                      </td>
                      <td>
                        <button className="acciones-btn" onClick={() => toggleEstado(eq)} title="Cambiar estado">↻</button>
                        <button
                          className="acciones-btn btn-retirar"
                          onClick={() => eliminarEquipo(eq.id, eq.nombre)}
                          title="Retirar equipo"
                        >✕</button>
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
