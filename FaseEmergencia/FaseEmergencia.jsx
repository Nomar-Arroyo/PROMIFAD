import './FaseEmergencia.css';

export default function FaseEmergencia({ personas, setPersonas, addLog }) {
  const costoEnvio = 120.0;

  const ejecutarFaseEmergencia = () => {
    addLog(">>> [INICIANDO FASE 1: DESPLIEGUE DE EMERGENCIA]");
    let recaudado = 0;
    
    const nuevasPersonas = personas.map(donante => {
      // Simulación del rol DonanteActivo retirando $40
      if (recaudado < costoEnvio && donante.saldo >= 40.0) {
        recaudado += 40.0;
        addLog(`El donante ${donante.nombre} aporta $40 para los Kits de Auxilio.`);
        return { ...donante, saldo: donante.saldo - 40.0 };
      }
      return donante;
    });

    setPersonas(nuevasPersonas);

    if (recaudado >= costoEnvio) {
      addLog(`¡Meta alcanzada! Fondos suficientes ($${recaudado}) para enviar la Ruta de Despliegue.`);
    } else {
      addLog(`Fondos insuficientes. Solo se recaudaron $${recaudado}.`);
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