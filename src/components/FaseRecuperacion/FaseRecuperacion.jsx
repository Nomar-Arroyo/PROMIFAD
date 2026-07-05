import { useState } from 'react';
import './FaseRecuperacion.css';

export default function FaseRecuperacion({ personas, setPersonas, proyecto, setProyecto, addLog }) {
  const inversores = personas.filter(p => p.id !== "PER-01");
  const aporteSugerido = proyecto.montoRequerido / inversores.length;
  const [aportePorInversor, setAportePorInversor] = useState(aporteSugerido);

  const totalRecolectable = aportePorInversor * inversores.length;

  const ejecutarFinanciacion = () => {
    if (proyecto.estado === "FINANCIADO") return;

    addLog(">>> [INICIANDO FASE 2: REACTIVACIÓN ECONÓMICA]");
    addLog(`Proyecto: ${proyecto.descripcion} necesita $${proyecto.montoRequerido}`);
    addLog(`Aporte por inversor: $${aportePorInversor.toFixed(2)}`);

    let montoRecolectado = 0;

    const nuevasPersonas = personas.map(persona => {
      if (persona.id !== "PER-01" && persona.saldo >= aportePorInversor) {
        montoRecolectado += aportePorInversor;
        addLog(`Inversor ${persona.nombre} aporta: $${aportePorInversor.toFixed(2)}`);
        return { ...persona, saldo: persona.saldo - aportePorInversor };
      }
      return persona;
    });

    if (montoRecolectado >= proyecto.montoRequerido) {
      const personasFinales = nuevasPersonas.map(p =>
        p.id === "PER-01" ? { ...p, saldo: p.saldo + montoRecolectado } : p
      );

      setPersonas(personasFinales);
      setProyecto({ ...proyecto, montoActual: montoRecolectado, estado: "FINANCIADO" });
      addLog(`🔔 [Notificación] ¡Felicidades Juan! Tu barbería ha sido financiada.`);
      addLog("¡Éxito! El emprendimiento está plenamente FINANCIADO.");
    } else {
      setPersonas(nuevasPersonas);
      addLog(`Fondos insuficientes. Se recolectaron $${montoRecolectado.toFixed(2)} de $${proyecto.montoRequerido}.`);
    }
  };

  return (
    <section className="fase-panel">
      <h2>II. Reactivación Económica</h2>
      <p>Proyecto: <em>{proyecto.descripcion}</em></p>
      <p>Monto requerido: <strong>${proyecto.montoRequerido.toFixed(2)}</strong></p>
      <p>Estado: <strong>{proyecto.estado}</strong></p>

      {proyecto.estado !== "FINANCIADO" && (
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
            <strong className={totalRecolectable >= proyecto.montoRequerido ? 'suficiente' : 'insuficiente'}>
              ${totalRecolectable.toFixed(2)}
            </strong>
            <span> de ${proyecto.montoRequerido.toFixed(2)} requeridos</span>
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