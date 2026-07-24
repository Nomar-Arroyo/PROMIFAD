import './FaseEmergencia.css';

export default function FaseEmergencia({ addLog, onRefresh }) {
  const costoEnvio = 120.0;

  const ejecutarFaseEmergencia = async () => {
    await addLog(">>> [INICIANDO FASE 1: DESPLIEGUE DE EMERGENCIA]");
    
    try {
      const res = await fetch('http://localhost:5000/api/fases/emergencia', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        data.operaciones.forEach(async msg => await addLog(msg));
        onRefresh();
      }
    } catch (error) {
      console.error("Error al procesar fase de emergencia:", error);
    }
  };

  return (
    <section className="fase-panel">
      <h2>I. Despliegue de Emergencia</h2>
      <p>Costo logístico requerido: <strong>${costoEnvio}</strong></p>
      <button onClick={ejecutarFaseEmergencia}>Ejecutar Despliegue</button>
    </section>
  );
}