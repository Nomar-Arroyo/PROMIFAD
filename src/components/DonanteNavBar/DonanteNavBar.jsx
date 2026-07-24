import './DonanteNavBar.css';

const tabs = [
  { id: 'donar-dinero', label: 'Donar Dinero', icon: '💰' },
  { id: 'donar-objetos', label: 'Donar Objetos', icon: '📦' },
  { id: 'mis-donaciones', label: 'Mis Donaciones', icon: '📋' },
  { id: 'elegir-destino', label: 'Elegir Destino', icon: '🎯' },
  { id: 'impacto', label: 'Mi Impacto', icon: '📊' },
];

export default function DonanteNavBar({ tabActiva, setTabActiva, onLogout }) {
  return (
    <nav className="donante-navbar">
      <div className="donante-nav-brand">
        <span className="donante-nav-logo">🤝</span>
        <span>PROMIFAD <small>Donantes</small></span>
      </div>
      <div className="donante-nav-links">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`donante-nav-btn ${tabActiva === tab.id ? 'activa' : ''}`}
            onClick={() => setTabActiva(tab.id)}
          >
            <span className="donante-nav-icon">{tab.icon}</span>
            <span className="donante-nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <button className="donante-logout-btn" onClick={onLogout} title="Cerrar sesión">
        ✕
      </button>
    </nav>
  );
}
