import { useState } from 'react';
import './FaseRecuperacion.css';

export default function FaseRecuperacion({ personas, proyecto, addLog, onRefresh }) {
  const inversores = personas.filter(p => p.id !== "PER-01");
  const aporteSugerido = (proyecto.monto_requerido || proyecto.montoRequerido || 0) / (inversores.length || 1);
  const [aportePorInversor, setAportePorInversor] = useState(aporteSugerido);

  const totalRecolectable = aportePorInversor * inversores.length;
  const montoReq = proyecto.monto_requerido || proyecto.montoRequerido || 0;
  const estadoProy = proyecto.estado;

  const ejecutarFinanciacion = async () => {
    if (estadoProy === "FINANCIADO") return;

    await addLog(">>> [INICIANDO FASE 2: REACTIVACIÓN ECONÓMICA]");
    await addLog(`Proyecto: ${proyecto.descripcion} necesita $${parseFloat(montoReq).toFixed(2)}`);

    try {
      const res = await fetch('http://localhost:5000/api/fases/recuperacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aportePorInversor, proyectoId: proyecto.id })
      });

      if (res.ok) {
        const data = await res.json();
        for (const msg of data.logs) {
          await addLog(msg);
        }
        onRefresh();
      }
    } catch (error) {
      console.error("Error al ejecutar microcrédito:", error);
    }
  };

  return (
    <section className="fase-panel">
      <h2>II. Reactivación Económica</h2>
      <p>Proyecto: <em>{proyecto.descripcion}</em></p>
      <p>Monto requerido: <strong>${parseFloat(montoReq).toFixed(2)}</strong></p>
      <p>Estado: <strong>{estadoProy}</strong></p>

      {estadoProy !== "FINANCIADO" && (
        <div className="microcredito-control">
          <div className="form-grupo">
            <label>Aporte por inversor ($)</label>
            <input
              type="number"
              step="1"
              min="1"
              value={aportePorInversor}
              onChange={e => setAportePorInversor(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="microcredito-info">
            <span>{inversores.length} inversores × ${aportePorInversor.toFixed(2)} = </span>
            <strong className={totalRecolectable >= montoReq ? 'suficiente' : 'insuficiente'}>
              ${totalRecolectable.toFixed(2)}
            </strong>
            <span> de ${parseFloat(montoReq).toFixed(2)} requeridos</span>
          </div>
          <button
            onClick={ejecutarFinanciacion}
            disabled={totalRecolectable <= 0}
          >
            Otorgar Microcrédito
          </button>
        </div>
      )}
    </section>
  );
}