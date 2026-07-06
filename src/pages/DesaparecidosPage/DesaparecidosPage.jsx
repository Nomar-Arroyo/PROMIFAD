import { useState } from 'react';
import './DesaparecidosPage.css';

export default function DesaparecidosPage({
  personasDesaparecidas,
  personasRescatadas,
  onRefresh
}) {
  const [nombre, setNombre] = useState('');
  const [zona, setZona] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const agregarDesaparecido = async (e) => {
    e.preventDefault();
    if (!nombre) return;

    try {
      const res = await fetch('http://localhost:5000/api/desaparecidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, zona: zona || 'Desconocida' })
      });
      if (res.ok) {
        setNombre('');
        setZona('');
        onRefresh();
      }
    } catch (error) {
      console.error("Error al reportar desaparecido:", error);
    }
  };

  const marcarRescatado = async (desaparecido) => {
    try {
      const res = await fetch('http://localhost:5000/api/transiciones/rescatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: desaparecido.id,
          nombre: desaparecido.nombre,
          zona: desaparecido.zona
        })
      });
      if (res.ok) onRefresh();
    } catch (error) {
      console.error("Error al procesar el rescate del desaparecido:", error);
    }
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
                      <td>{new Date(d.ultima_vista || d.ultimaVista || Date.now()).toLocaleDateString('es-ES')}</td>
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