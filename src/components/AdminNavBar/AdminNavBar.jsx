import './AdminNavBar.css';

const tabs = [
  { id: 'admin-general', label: 'General', icon: '📊' },
  { id: 'admin-usuarios', label: 'Usuarios', icon: '👥' },
  { id: 'admin-equipos', label: 'Equipos', icon: '🚒' },
  { id: 'admin-donantes', label: 'Donantes', icon: '🤝' },
  { id: 'admin-donaciones', label: 'Donaciones', icon: '📦' },
  { id: 'admin-logs', label: 'Bitácora', icon: '📋' },
  { id: 'admin-config', label: 'Config', icon: '⚙️' },
];

export default function AdminNavBar({ tabActiva, setTabActiva, onLogout }) {
  return (
    <nav className="admin-navbar">
      <div className="admin-nav-brand">
        <span className="admin-nav-logo">👑</span>
        <span>PROMIFAD <small>Admin</small></span>
      </div>
      <div className="admin-nav-links">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`admin-nav-btn ${tabActiva === tab.id ? 'activa' : ''}`}
            onClick={() => setTabActiva(tab.id)}
          >
            <span className="admin-nav-icon">{tab.icon}</span>
            <span className="admin-nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <button className="admin-logout-btn" onClick={onLogout} title="Cerrar sesión">
        ✕
      </button>
    </nav>
  );
}
