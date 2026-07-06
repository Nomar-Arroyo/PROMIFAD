import './NavBar.css';

const tabs = [
  { id: 'inicio', label: 'Inicio', icon: '◈' },
  { id: 'donantes', label: 'Donantes', icon: '●' },
  { id: 'equipos', label: 'Equipos Rescate', icon: '◆' },
  { id: 'rescatados', label: 'Rescatados', icon: '▲' },
  { id: 'desaparecidos', label: 'Desaparecidos', icon: '▼' },
  { id: 'indemnizacion', label: 'Indemnización', icon: '■' },
];

export default function NavBar({ tabActiva, setTabActiva }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">PROMIFAD</div>
      <div className="navbar-links">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-btn ${tabActiva === tab.id ? 'activa' : ''}`}
            onClick={() => setTabActiva(tab.id)}
          >
            <span className="nav-icono">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
            {tabActiva === tab.id && <span className="nav-indicador" />}
          </button>
        ))}
      </div>
    </nav>
  );
}
