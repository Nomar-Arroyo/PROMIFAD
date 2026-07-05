import { useState } from 'react';
import './pages.css';

export default function DonantesPage({ personas, setPersonas }) {
  const [nombre, setNombre] = useState('');
  const [vulnerabilidad, setVulnerabilidad] = useState('Ninguna');
  const [saldo, setSaldo] = useState('');

  const agregarDonante = (e) => {
    e.preventDefault();
    if (!nombre || !saldo) return;
    const nuevoId = `PER-${String(personas.length + 1).padStart(2, '0')}`;
    setPersonas(prev => [...prev, {
      id: nuevoId,
      nombre,
      vulnerabilidad,
      saldo: parseFloat(saldo)
    }]);
    setNombre('');
    setVulnerabilidad('Ninguna');
    setSaldo('');
  };

  const eliminarDonante = (id) => {
    setPersonas(prev => prev.filter(p => p.id !== id));
  };

  const totalFondos = personas.reduce((sum, p) => sum + p.saldo, 0);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Gestión de Donantes</h2>
        <span>{personas.length} registros · Total: ${totalFondos.toFixed(2)}</span>
      </div>

      <div className="page-grid">
        <div className="page-card">
          <h3>Registrar Donante</h3>
          <form className="form-grid" onSubmit={agregarDonante}>
            <div className="form-grupo full">
              <label>Nombre completo</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del donante" />
            </div>
            <div className="form-grupo">
              <label>Vulnerabilidad</label>
              <select value={vulnerabilidad} onChange={e => setVulnerabilidad(e.target.value)}>
                <option value="Ninguna">Ninguna</option>
                <option value="Zonificación de Riesgo">Zonificación de Riesgo</option>
                <option value="Desplazamiento Forzado">Desplazamiento Forzado</option>
                <option value="Pérdida Total">Pérdida Total</option>
              </select>
            </div>
            <div className="form-grupo">
              <label>Saldo inicial ($)</label>
              <input type="number" step="0.01" min="0" value={saldo} onChange={e => setSaldo(e.target.value)} placeholder="0.00" />
            </div>
            <button type="submit" disabled={!nombre || !saldo}>Agregar Donante</button>
          </form>
        </div>

        <div className="page-card">
          <h3>Lista de Donantes</h3>
          {personas.length === 0 ? (
            <div className="empty-msg">No hay donantes registrados</div>
          ) : (
            <div className="tabla-contenedor">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Vulnerabilidad</th>
                    <th>Saldo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {personas.map(p => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.id}</td>
                      <td>{p.nombre}</td>
                      <td>{p.vulnerabilidad}</td>
                      <td style={{ color: 'var(--orange-accent)', fontWeight: 600 }}>${p.saldo.toFixed(2)}</td>
                      <td>
                        <button className="acciones-btn" onClick={() => eliminarDonante(p.id)} title="Eliminar">✕</button>
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
