import { useState, useRef, useEffect } from 'react';
import SplashMap from '../SplashMap/SplashMap';
import './Login.css';

export default function Login({ onLogin, markers = [] }) {
  const [pantalla, setPantalla] = useState('splash');
  const [menuActivo, setMenuActivo] = useState(null);
  const menuRef = useRef(null);
  const [form, setForm] = useState({
    cedula: '',
    telefono: '',
    nombre: '',
    correo: '',
    password: '',
  });
  const [showDonaciones, setShowDonaciones] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuActivo(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitOrganizacion = (e) => {
    e.preventDefault();
    onLogin(form, 'sistema');
  };

  const handleSubmitDonante = (e) => {
    e.preventDefault();
    onLogin(form, 'donante');
  };

  const toggleMenu = (menu) => {
    setMenuActivo(prev => prev === menu ? null : menu);
  };

  const selectOpcion = (tipo, pantallaDestino) => {
    setMenuActivo(null);
    setPantalla(pantallaDestino);
  };

  if (pantalla === 'splash') {
    return (
      <div className="splash-wrapper">
        <header className="splash-header">
          <div className="splash-header-left">
            <div className="splash-header-logo">🌎<span className="flag-badge">🇻🇪</span></div>
            <span className="splash-header-brand">PROMIFAD</span>
          </div>
          <div className="splash-header-right" ref={menuRef}>
            <div className="splash-dropdown-wrap">
              <button className="splash-header-link" onClick={() => toggleMenu('registro')}>
                Registrarse ▾
              </button>
              {menuActivo === 'registro' && (
                <div className="splash-dropdown">
                  <button className="splash-dropdown-item" onClick={() => selectOpcion('donante', 'donante-registro')}>
                    <span className="splash-dd-icon">🤝</span>
                    <span className="splash-dd-text">
                      <strong>Donante</strong>
                      <small>Crear cuenta para donar</small>
                    </span>
                  </button>
                  <button className="splash-dropdown-item" onClick={() => selectOpcion('organizacion', 'organizacion')}>
                    <span className="splash-dd-icon">🛡️</span>
                    <span className="splash-dd-text">
                      <strong>Organización</strong>
                      <small>Crear cuenta humanitaria</small>
                    </span>
                  </button>
                </div>
              )}
            </div>
            <div className="splash-dropdown-wrap">
              <button className="splash-header-btn" onClick={() => toggleMenu('login')}>
                Iniciar sesión ▾
              </button>
              {menuActivo === 'login' && (
                <div className="splash-dropdown splash-dropdown-right">
                  <button className="splash-dropdown-item" onClick={() => selectOpcion('donante', 'donante')}>
                    <span className="splash-dd-icon">🤝</span>
                    <span className="splash-dd-text">
                      <strong>Donante</strong>
                      <small>Acceder a mi cuenta</small>
                    </span>
                  </button>
                  <button className="splash-dropdown-item" onClick={() => selectOpcion('organizacion', 'organizacion')}>
                    <span className="splash-dd-icon">🛡️</span>
                    <span className="splash-dd-text">
                      <strong>Organización</strong>
                      <small>Acceder al sistema</small>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="splash-body">
          <div className="splash-content">
            <h1 className="splash-main-title">
              <span className="splash-highlight">PROMIFAD</span>
            </h1>
            <h2 className="splash-sub-title">Plataforma de Resiliencia y Financiación Humanitaria</h2>
            <div className="splash-separator" />
            <p className="splash-main-desc">
              PROMIFAD es un sistema integral de respuesta ante desastres naturales y emergencias
              humanitarias diseñado para coordinar de forma rápida, eficiente y transparente todos
              los esfuerzos de ayuda en Venezuela. Conecta en tiempo real a organizaciones humanitarias,
              donantes, equipos de rescate y las comunidades afectadas para garantizar que los recursos
              lleguen donde más se necesitan.
            </p>
            <p className="splash-main-desc">
              A través de nuestro mapa interactivo puedes visualizar las zonas afectadas, los hospitales
              disponibles, las áreas en recuperación y la ubicación de los equipos de rescate desplegados
              en todo el territorio nacional.
            </p>
          </div>
          <div className="splash-map-side">
            <div className="splash-map-label">Mapa en tiempo real — Zonas Afectadas</div>
            <SplashMap markers={markers} />
          </div>
        </div>

        <div className="splash-cta">
          <button className="splash-cta-toggle" onClick={() => setShowDonaciones(prev => !prev)}>
            <h2 className="splash-cta-title">¿Quieres ayudar?</h2>
            <span className={`splash-cta-arrow ${showDonaciones ? 'open' : ''}`}>▾</span>
          </button>
          <p className="splash-cta-desc">
            Puedes hacerlo de esta manera: reuniendo donativos o donando directamente para los damnificados.
          </p>

          <div className={`splash-cta-expandable ${showDonaciones ? 'expanded' : ''}`}>
            <div className="splash-cta-options">
              <button className="splash-cta-card" onClick={() => selectOpcion('donante', 'donante-registro')}>
                <span className="splash-cta-icon">💰</span>
                <strong>Reunir Donativos</strong>
                <small>Crea una campaña o contribuye directamente con fondos</small>
              </button>
              <button className="splash-cta-card" onClick={() => selectOpcion('donante', 'donante-registro')}>
                <span className="splash-cta-icon">❤️</span>
                <strong>Donar a los Damnificados</strong>
                <small>Envía alimentos, ropa y ayuda humanitaria directa</small>
              </button>
            </div>

            <div className="splash-donation-types">
              <h3 className="splash-donation-types-title">Tipos de donaciones más necesitadas</h3>
              <div className="splash-donation-grid">
                <div className="splash-donation-item">
                  <span className="splash-donation-icon">🥫</span>
                  <strong>Comida no caducable</strong>
                  <small>Arroz, pasta, legumbres, enlatados, cereales, aceite comestible</small>
                </div>
                <div className="splash-donation-item">
                  <span className="splash-donation-icon">💧</span>
                  <strong>Agua potable</strong>
                  <small>Bolsas de agua, garrafones, pastillas potabilizadoras</small>
                </div>
                <div className="splash-donation-item">
                  <span className="splash-donation-icon">🩹</span>
                  <strong>Insumos médicos</strong>
                  <small>Curitas, vendajes, desinfectantes, guantes, analgésicos, medicinas básicas</small>
                </div>
                <div className="splash-donation-item">
                  <span className="splash-donation-icon">👕</span>
                  <strong>Ropa</strong>
                  <small>Camisetas, pantalones, ropa interior, calcetines, zapatos (en buen estado)</small>
                </div>
                <div className="splash-donation-item">
                  <span className="splash-donation-icon">⛺</span>
                  <strong>Carpas / Tiendas de acampar</strong>
                  <small>Refugios temporales para familias afectadas sin vivienda</small>
                </div>
                <div className="splash-donation-item">
                  <span className="splash-donation-icon">🔦</span>
                  <strong>Artículos de emergencia</strong>
                  <small>Linternas, pilas, mantas térmicas, colchonetas, frazadas</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="splash-info">
          <h2 className="splash-info-title">Más Información</h2>
          <p className="splash-info-sub">
            Consulta con los centros de acopio, hospitales y equipos de rescate para conocer qué se necesita.
          </p>

          <div className="splash-info-grid">
            <div className="splash-info-card">
              <div className="splash-info-card-header hosp">
                <span>🏥</span>
                <h3>Hospitales</h3>
              </div>
              <div className="splash-info-card-body">
                <p className="splash-info-card-desc">Consulte qué insumos médicos, medicinas y equipos faltan en los centros hospitalarios de su zona.</p>
                <div className="splash-info-contacts">
                  <div className="splash-contact-item">
                    <span className="splash-contact-label">Hospital Central de Caracas</span>
                    <span className="splash-contact-wa">📞 (0212) 508-3111</span>
                  </div>
                  <div className="splash-contact-item">
                    <span className="splash-contact-label">Hospital Universitario Maracaibo</span>
                    <span className="splash-contact-wa">📞 (0261) 747-2222</span>
                  </div>
                  <div className="splash-contact-item">
                    <span className="splash-contact-label">Hospital General Valencia</span>
                    <span className="splash-contact-wa">📞 (0241) 857-0111</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="splash-info-card">
              <div className="splash-info-card-header rescue">
                <span>🚁</span>
                <h3>Equipos de Rescate</h3>
              </div>
              <div className="splash-info-card-body">
                <p className="splash-info-card-desc">Conozca qué herramientas y equipos faltan en las operaciones de búsqueda de personas desaparecidas.</p>
                <div className="splash-info-contacts">
                  <div className="splash-contact-item">
                    <span className="splash-contact-label">CVE (Cuerpo Voluntario de Emergencia)</span>
                    <span className="splash-contact-wa">📱 WhatsApp: +58 412-555-1234</span>
                  </div>
                  <div className="splash-contact-item">
                    <span className="splash-contact-label">Cuerpo de Bomberos Caracas</span>
                    <span className="splash-contact-wa">📱 WhatsApp: +58 414-333-5678</span>
                  </div>
                  <div className="splash-contact-item">
                    <span className="splash-contact-label">Protección Civil Valencia</span>
                    <span className="splash-contact-wa">📱 WhatsApp: +58 424-222-9012</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="splash-info-card">
              <div className="splash-info-card-header acopio">
                <span>📦</span>
                <h3>Centros de Acopio</h3>
              </div>
              <div className="splash-info-card-body">
                <p className="splash-info-card-desc">Infórmese sobre los centros de acopio activos, qué alimentos, ropa y artículos de primera necesidad se requieren.</p>
                <div className="splash-info-contacts">
                  <div className="splash-contact-item">
                    <span className="splash-contact-label">Centro de Acopio Caracas</span>
                    <span className="splash-contact-wa">📱 WhatsApp: +58 416-111-4567</span>
                  </div>
                  <div className="splash-contact-item">
                    <span className="splash-contact-label">Centro de Acopio Maracaibo</span>
                    <span className="splash-contact-wa">📱 WhatsApp: +58 412-888-3456</span>
                  </div>
                  <div className="splash-contact-item">
                    <span className="splash-contact-label">Centro de Acopio Barquisimeto</span>
                    <span className="splash-contact-wa">📱 WhatsApp: +58 424-777-2345</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="splash-footer">
          <span>PROMIFAD © 2026 — Plataforma de Resiliencia y Financiación Humanitaria</span>
        </footer>
      </div>
    );
  }

  if (pantalla === 'organizacion') {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <button className="login-back" onClick={() => setPantalla('splash')}>← Volver</button>
          <div className="login-logo-area">
            <div className="login-logo"><span>🌎<span className="flag-badge-lg">🇻🇪</span></span></div>
          </div>
          <h2 className="login-heading">Acceder como Organización</h2>
          <p className="login-sub">Operadores humanitarios y administradores</p>
          <div className="login-separator" />
          <form className="login-form" onSubmit={handleSubmitOrganizacion}>
            <label className="login-field">
              <span>Cédula</span>
              <input name="cedula" type="text" value={form.cedula} onChange={handleChange} placeholder="V-12345678" required />
            </label>
            <label className="login-field">
              <span>Teléfono</span>
              <input name="telefono" type="tel" value={form.telefono} onChange={handleChange} placeholder="0412-1234567" required />
            </label>
            <label className="login-field">
              <span>Nombre completo</span>
              <input name="nombre" type="text" value={form.nombre} onChange={handleChange} placeholder="Nombre y Apellido" required />
            </label>
            <label className="login-field">
              <span>Correo electrónico</span>
              <input name="correo" type="email" value={form.correo} onChange={handleChange} placeholder="correo@ejemplo.com" required />
            </label>
            <label className="login-field">
              <span>Contraseña</span>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </label>
            <button type="submit" className="login-submit login-submit-org">Ingresar al sistema</button>
          </form>
        </div>
      </div>
    );
  }

  if (pantalla === 'donante') {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <button className="login-back" onClick={() => setPantalla('splash')}>← Volver</button>
          <div className="login-logo-area">
            <div className="login-logo"><span>🌎<span className="flag-badge-lg">🇻🇪</span></span></div>
          </div>
          <h2 className="login-heading">Acceder como Donante</h2>
          <p className="login-sub">Colabora con ayuda humanitaria</p>
          <div className="login-separator" />
          <form className="login-form" onSubmit={handleSubmitDonante}>
            <label className="login-field">
              <span>Cédula</span>
              <input name="cedula" type="text" value={form.cedula} onChange={handleChange} placeholder="V-12345678" required />
            </label>
            <label className="login-field">
              <span>Nombre completo</span>
              <input name="nombre" type="text" value={form.nombre} onChange={handleChange} placeholder="Nombre y Apellido" required />
            </label>
            <label className="login-field">
              <span>Correo electrónico</span>
              <input name="correo" type="email" value={form.correo} onChange={handleChange} placeholder="correo@ejemplo.com" required />
            </label>
            <label className="login-field">
              <span>Contraseña</span>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </label>
            <button type="submit" className="login-submit login-submit-don">Ingresar como donante</button>
          </form>
          <div className="login-switch-area">
            <span>¿No tienes cuenta?</span>
            <button type="button" onClick={() => setPantalla('donante-registro')}>Registrarse aquí</button>
          </div>
        </div>
      </div>
    );
  }

  if (pantalla === 'donante-registro') {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <button className="login-back" onClick={() => setPantalla('splash')}>← Volver</button>
          <div className="login-logo-area">
            <div className="login-logo"><span>🌎<span className="flag-badge-lg">🇻🇪</span></span></div>
          </div>
          <h2 className="login-heading">Crear cuenta de Donante</h2>
          <p className="login-sub">Regístrate para comenzar a donar</p>
          <div className="login-separator" />
          <form className="login-form" onSubmit={handleSubmitDonante}>
            <label className="login-field">
              <span>Cédula</span>
              <input name="cedula" type="text" value={form.cedula} onChange={handleChange} placeholder="V-12345678" required />
            </label>
            <label className="login-field">
              <span>Teléfono</span>
              <input name="telefono" type="tel" value={form.telefono} onChange={handleChange} placeholder="0412-1234567" required />
            </label>
            <label className="login-field">
              <span>Nombre completo</span>
              <input name="nombre" type="text" value={form.nombre} onChange={handleChange} placeholder="Nombre y Apellido" required />
            </label>
            <label className="login-field">
              <span>Correo electrónico</span>
              <input name="correo" type="email" value={form.correo} onChange={handleChange} placeholder="correo@ejemplo.com" required />
            </label>
            <label className="login-field">
              <span>Contraseña</span>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </label>
            <button type="submit" className="login-submit login-submit-don">Registrarse como donante</button>
          </form>
          <div className="login-switch-area">
            <span>¿Ya tienes cuenta?</span>
            <button type="button" onClick={() => setPantalla('donante')}>Iniciar sesión</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
