import { useState } from 'react';
import './pages.css';

export default function DesaparecidosPage({
  personasDesaparecidas,
  setPersonasDesaparecidas,
  personasRescatadas,
  setPersonasRescatadas
}) {
  const [nombre, setNombre] = useState('');
  const [zona, setZona] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const agregarDesaparecido = (e) => {
    e.preventDefault();
    if (!nombre) return;
    const nuevoId = `DES-${String(personasDesaparecidas.length + 1).padStart(2, '0')}`;
    const hoy = new Date().toLocaleDateString('es-ES');
    setPersonasDesaparecidas(prev => [...prev, {
      id: nuevoId,
      nombre,
      ultimaVista: hoy,
      zona: zona || 'Desconocida'
    }]);
    setNombre('');
    setZona('');
  };

  const marcarRescatado = (desaparecido) => {
    setPersonasDesaparecidas(prev => prev.filter(d => d.id !== desaparecido.id));
    const nuevoId = `RES-${String(personasRescatadas.length + 1).padStart(2, '0')}`;
    setPersonasRescatadas(prev => [...prev, {
      id: nuevoId,
      nombre: desaparecido.nombre,
      fechaRescate: new Date().toLocaleDateString('es-ES'),
      equipo: 'No asignado',
      estado: 'Estable'
    }]);
  };

  const filtrados = personasDesaparecidas.filter(d =>
    d.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h2>Personas Desaparecidas</h2>
        <span>{personasDesaparecidas.length} reportes</span>
      </div>

      <div className="page-grid">
        <div className="page-card">
          <h3>Reportar Desaparición</h3>
          <form className="form-grid" onSubmit={agregarDesaparecido}>
            <div className="form-grupo full">
              <label>Nombre completo</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre de la persona" />
            </div>
            <div className="form-grupo">
              <label>Zona</label>
              <input value={zona} onChange={e => setZona(e.target.value)} placeholder="Zona donde se vio por última vez" />
            </div>
            <button type="submit" disabled={!nombre}>Reportar Desaparición</button>
          </form>
        </div>

        <div className="page-card">
          <h3>Personas Desaparecidas</h3>
          <input
            style={{ marginBottom: '0.8rem', width: '100%' }}
            placeholder="Buscar..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {filtrados.length === 0 ? (
            <div className="empty-msg">No hay reportes de desaparición</div>
          ) : (
            <div className="tabla-contenedor">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Última vez</th>
                    <th>Zona</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(d => (
                    <tr key={d.id}>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{d.id}</td>
                      <td>{d.nombre}</td>
                      <td>{d.ultimaVista}</td>
                      <td>{d.zona}</td>
                      <td>
                        <button className="acciones-btn" onClick={() => marcarRescatado(d)} title="Marcar como rescatado">
                          ✓ Rescatado
                        </button>
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
