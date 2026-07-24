import { useState } from 'react';
import './Indemnizacion.css';

export default function Indemnizacion({ personas, indemnizaciones, addLog, onRefresh }) {
  const [personaSel, setPersonaSel] = useState('');
  const [monto, setMonto] = useState('');
  const [motivo, setMotivo] = useState('');

  const registrarIndemnizacion = async (e) => {
    e.preventDefault();
    if (!personaSel || !monto || !motivo) return;
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) return;

    try {
      const res = await fetch('http://localhost:5000/api/indemnizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaNombre: personaSel, monto: montoNum, motivo })
      });
      if (res.ok) {
        await addLog(`💰 Indemnización registrada: ${personaSel} — $${montoNum.toFixed(2)} por "${motivo}"`);
        setPersonaSel('');
        setMonto('');
        setMotivo('');
        onRefresh();
      }
    } catch (error) {
      console.error("Error registrando indemnización:", error);
    }
  };

  const aprobarIndemnizacion = async (id, nombrePersona) => {
    try {
      const res = await fetch(`http://localhost:5000/api/indemnizaciones/${id}/aprobar`, { method: 'PUT' });
      if (res.ok) {
        await addLog(`✅ Indemnización ${id} aprobada para ${nombrePersona}`);
        onRefresh();
      }
    } catch (error) {
      console.error("Error al aprobar indemnización:", error);
    }
  };

  const totalPendiente = indemnizaciones
    .filter(i => i.estado === 'Pendiente')
    .reduce((sum, i) => sum + parseFloat(i.monto), 0);

  const totalAprobado = indemnizaciones
    .filter(i => i.estado === 'Aprobado')
    .reduce((sum, i) => sum + parseFloat(i.monto), 0);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Indemnización a Afectados</h2>
        <span>{indemnizaciones.length} registros</span>
      </div>

      <div className="indemn-stats">
        <div className="indemn-stat">
          <span className="indemn-stat-label">Pendiente</span>
          <span className="indemn-stat-val pendiente">${totalPendiente.toFixed(2)}</span>
        </div>
        <div className="indemn-stat">
          <span className="indemn-stat-label">Aprobado</span>
          <span className="indemn-stat-val aprobado">${totalAprobado.toFixed(2)}</span>
        </div>
        <div className="indemn-stat">
          <span className="indemn-stat-label">Total</span>
          <span className="indemn-stat-val total">${(totalPendiente + totalAprobado).toFixed(2)}</span>
        </div>
      </div>

      <div className="page-grid">
        <div className="page-card">
          <h3>Registrar Indemnización</h3>
          <form className="form-grid" onSubmit={registrarIndemnizacion}>
            <div className="form-grupo full">
              <label>Persona Afectada</label>
              <select value={personaSel} onChange={e => setPersonaSel(e.target.value)}>
                <option value="">Seleccionar...</option>
                {personas.map(p => (
                  <option key={p.id} value={p.nombre}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-grupo">
              <label>Monto ($)</label>
              <input type="number" step="0.01" min="0" value={monto} onChange={e => setMonto(e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-grupo">
              <label>Motivo</label>
              <select value={motivo} onChange={e => setMotivo(e.target.value)}>
                <option value="">Seleccionar...</option>
                <option value="Pérdida de vivienda">Pérdida de vivienda</option>
                <option value="Daños materiales">Daños materiales</option>
                <option value="Atención médica">Atención médica</option>
                <option value="Pérdida de ingresos">Pérdida de ingresos</option>
                <option value="Reubicación">Reubicación</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <button type="submit" disabled={!personaSel || !monto || !motivo}>
              Registrar Indemnización
            </button>
          </form>
        </div>

        <div className="page-card indemn-historial">
          <h3>Historial de Indemnizaciones</h3>
          {indemnizaciones.length === 0 ? (
            <div className="empty-msg">No hay indemnizaciones registradas</div>
          ) : (
            <div className="indemn-list">
              {indemnizaciones.map(ind => (
                <div key={ind.id} className="indemn-item">
                  <div className="indemn-item-top">
                    <span className="indemn-persona">{ind.persona_nombre || ind.persona}</span>
                    <span className={`estado-badge ${ind.estado.toLowerCase()}`}>{ind.estado}</span>
                  </div>
                  <div className="indemn-item-info">
                    {ind.motivo} · <strong style={{ color: 'var(--orange-accent)' }}>${parseFloat(ind.monto).toFixed(2)}</strong> · {new Date(ind.fecha).toLocaleDateString('es-ES')}
                  </div>
                  {ind.estado === 'Pendiente' && (
                    <button className="indemn-aprobar" onClick={() => aprobarIndemnizacion(ind.id, ind.persona_nombre || ind.persona)}>
                      Aprobar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}