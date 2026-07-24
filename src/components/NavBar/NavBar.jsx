import './NavBar.css';

const tabs = [
  { id: 'inicio', label: 'Inicio', icon: '◈', rightIcon: '🏠' },
  { id: 'donantes', label: 'Donantes', icon: '●', rightIcon: '🤝' },
  { id: 'equipos', label: 'Equipos Rescate', icon: '◆', rightIcon: '🚒' },
  { id: 'rescatados', label: 'Rescatados', icon: '▲', rightIcon: '🚁' },
  { id: 'desaparecidos', label: 'Desaparecidos', icon: '▼', rightIcon: '❓' },
  { id: 'indemnizacion', label: 'Indemnización', icon: '■', rightIcon: '💲' },
  { id: 'zonas-afectadas', label: 'Zonas Afectadas', icon: '🗺', rightIcon: '📍' },
  { id: 'contacto-emergencia', label: 'Contacto Emergencia', icon: '✚', rightIcon: '🏥' },
];

export default function NavBar({ tabActiva, setTabActiva, onLogout }) {
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
            <span className="nav-icono-right">{tab.rightIcon}</span>
            {tabActiva === tab.id && <span className="nav-indicador" />}
          </button>
        ))}
      </div>
      <button className="logout-btn" onClick={onLogout} title="Cerrar sesión">
        ✕
      </button>
    </nav>
  );
}
