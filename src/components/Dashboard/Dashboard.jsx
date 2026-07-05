import './Dashboard.css';

export default function Dashboard({ personas, proyecto, log }) {
  return (
    <div className="dashboard-panel">
      <h3>Auditoría de Saldos</h3>
      <ul className="saldos-list">
        {personas.map(p => (
          <li key={p.id}>
            <span className="nombre">{p.nombre}</span>
            <span className="saldo">${p.saldo.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      
      <div className="registro-actividad">
        <h3>Registro de Transacciones</h3>
        <div className="log-container">
          {log.length === 0 ? (
            <p className="empty-log">Esperando ejecución de fases...</p>
          ) : (
            log.map((entry, index) => (
              <div key={index} className="log-entry">{'>'} {entry}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}