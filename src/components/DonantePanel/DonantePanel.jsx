import { useState, useEffect } from 'react';
import './DonantePanel.css';

const MONEDAS = [
  { codigo: 'USD', simbolo: '$', nombre: 'Dólar' },
  { codigo: 'EUR', simbolo: '€', nombre: 'Euro' },
  { codigo: 'VES', simbolo: 'Bs.', nombre: 'Bolívar' },
  { codigo: 'COP', simbolo: '$', nombre: 'Peso COP' },
  { codigo: 'BRL', simbolo: 'R$', nombre: 'Real' },
];

const OBJETOS = [
  'Agua potable', 'Alimentos no perecederos', 'Medicinas', 'Insumos médicos',
  'Ropa', 'Sábanas', 'Cobijas / Mantas', 'Carpas', 'Colchonetas',
  'Generadores', 'Herramientas', 'Pañales', 'Kit de higiene',
  'Materiales de construcción', 'Combustible', 'Equipos médicos',
];

const ZONAS_DESTINO = [
  { id: 'z1', nombre: 'Caracas - Zona Sur', prioridad: 'Alta', afectados: 1240 },
  { id: 'z2', nombre: 'Maracaibo - Barrio Obrero', prioridad: 'Alta', afectados: 890 },
  { id: 'z3', nombre: 'Valencia - Zona Industrial', prioridad: 'Media', afectados: 560 },
  { id: 'z4', nombre: 'Barquisimeto - Centro', prioridad: 'Media', afectados: 340 },
  { id: 'z5', nombre: 'Ciudad Guayana - San Félix', prioridad: 'Alta', afectados: 720 },
  { id: 'z6', nombre: 'Mérida - Zona Andina', prioridad: 'Baja', afectados: 180 },
  { id: 'z7', nombre: 'Barcelona - Puerto La Cruz', prioridad: 'Media', afectados: 410 },
  { id: 'z8', nombre: 'San Cristóbal - Frontera', prioridad: 'Alta', afectados: 650 },
];

const API = 'http://localhost:5000';

async function ensureDonante(user) {
  try {
    const res = await fetch(`${API}/api/donantes`);
    if (res.ok) {
      const donantes = await res.json();
      const existente = donantes.find(d => d.nombre === user.nombre);
      if (existente) return existente.id;
    }
  } catch (e) { /* continue */ }

  try {
    const res = await fetch(`${API}/api/donantes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: user.nombre, vulnerabilidad: 'Donante', saldo: 0 })
    });
    if (res.ok) {
      const nuevo = await res.json();
      return nuevo.id;
    }
  } catch (e) { /* continue */ }
  return null;
}

function DonarDinero({ user }) {
  const [monto, setMonto] = useState('');
  const [moneda, setMoneda] = useState('USD');
  const [destino, setDestino] = useState('');
  const [notas, setNotas] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleDonar = async (e) => {
    e.preventDefault();
    if (!monto || !destino) return;
    setError('');

    const donanteId = await ensureDonante(user);
    if (!donanteId) { setError('Error al registrar donante'); return; }

    try {
      const res = await fetch(`${API}/api/donaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donante_id: donanteId,
          objeto: `${MONEDAS.find(m => m.codigo === moneda)?.simbolo}${monto} ${moneda}`,
          cantidad: 1,
          tipo: 'monetaria',
          monto: parseFloat(monto),
          moneda: moneda,
          motivo: `${notas ? notas + ' — ' : ''}Destino: ${ZONAS_DESTINO.find(z => z.id === destino)?.nombre || destino}`
        })
      });
      if (res.ok) {
        setEnviado(true);
        setTimeout(() => setEnviado(false), 3000);
        setMonto('');
        setDestino('');
        setNotas('');
      } else {
        setError('Error al registrar donación');
      }
    } catch (e) {
      setError('Error de conexión');
    }
  };

  return (
    <div className="dp-card">
      <h3>💰 Donar Dinero</h3>
      {enviado && <div className="dp-exito">✓ Donación monetaria registrada exitosamente</div>}
      {error && <div className="dp-error">{error}</div>}
      <form className="dp-form" onSubmit={handleDonar}>
        <div className="dp-form-row">
          <div className="dp-campo">
            <label>Monto</label>
            <div className="dp-monto-input">
              <span className="dp-monto-simb">{MONEDAS.find(m => m.codigo === moneda)?.simbolo}</span>
              <input type="number" min="1" step="0.01" value={monto} onChange={e => setMonto(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <div className="dp-campo">
            <label>Moneda</label>
            <select value={moneda} onChange={e => setMoneda(e.target.value)}>
              {MONEDAS.map(m => <option key={m.codigo} value={m.codigo}>{m.codigo} - {m.nombre}</option>)}
            </select>
          </div>
        </div>
        <div className="dp-campo">
          <label>Enviar fondos a zona</label>
          <select value={destino} onChange={e => setDestino(e.target.value)}>
            <option value="">Seleccionar zona...</option>
            {ZONAS_DESTINO.map(z => (
              <option key={z.id} value={z.id}>{z.nombre} (Prioridad: {z.prioridad})</option>
            ))}
          </select>
        </div>
        <div className="dp-campo">
          <label>Nota opcional</label>
          <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Mensaje para los afectados..." rows="2" />
        </div>
        <button type="submit" disabled={!monto || !destino} className="dp-btn-donar">
          Donar {monto ? `${MONEDAS.find(m => m.codigo === moneda)?.simbolo}${monto} ${moneda}` : ''}
        </button>
      </form>
    </div>
  );
}

function DonarObjetos({ user }) {
  const [objeto, setObjeto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [destino, setDestino] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleDonar = async (e) => {
    e.preventDefault();
    if (!objeto || !cantidad) return;
    setError('');

    const donanteId = await ensureDonante(user);
    if (!donanteId) { setError('Error al registrar donante'); return; }

    try {
      const res = await fetch(`${API}/api/donaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donante_id: donanteId,
          objeto,
          cantidad: parseInt(cantidad),
          tipo: 'insumo',
          motivo: destino ? `Destino: ${ZONAS_DESTINO.find(z => z.id === destino)?.nombre || destino}` : null
        })
      });
      if (res.ok) {
        setEnviado(true);
        setTimeout(() => setEnviado(false), 3000);
        setObjeto('');
        setCantidad('');
        setDestino('');
      } else {
        setError('Error al registrar donación');
      }
    } catch (e) {
      setError('Error de conexión');
    }
  };

  return (
    <div className="dp-card">
      <h3>📦 Donar Objetos</h3>
      {enviado && <div className="dp-exito">✓ Objeto registrado para recolección</div>}
      {error && <div className="dp-error">{error}</div>}
      <form className="dp-form" onSubmit={handleDonar}>
        <div className="dp-form-row">
          <div className="dp-campo">
            <label>Objeto</label>
            <select value={objeto} onChange={e => setObjeto(e.target.value)}>
              <option value="">Seleccionar...</option>
              {OBJETOS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="dp-campo">
            <label>Cantidad</label>
            <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="dp-campo">
          <label>Punto de recolección / zona destino</label>
          <select value={destino} onChange={e => setDestino(e.target.value)}>
            <option value="">Seleccionar zona...</option>
            {ZONAS_DESTINO.map(z => (
              <option key={z.id} value={z.id}>{z.nombre}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={!objeto || !cantidad} className="dp-btn-donar">
          Registrar donación de objeto
        </button>
      </form>
    </div>
  );
}

function MisDonaciones({ user }) {
  const [donaciones, setDonaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarMisDonaciones();
  }, []);

  const cargarMisDonaciones = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/api/donaciones`);
      if (res.ok) {
        const data = await res.json();
        const mias = data.filter(d => {
          return d.donante_id && String(d.donante_id) === String(user?.id);
        });
        setDonaciones(mias);
      }
    } catch (e) {
      console.error("Error cargando donaciones:", e);
    }
    setCargando(false);
  };

  return (
    <div className="dp-card">
      <h3>📋 Mis Donaciones</h3>
      {cargando ? (
        <div className="dp-vacio">Cargando...</div>
      ) : donaciones.length === 0 ? (
        <div className="dp-vacio">Aún no has registrado donaciones</div>
      ) : (
        <div className="dp-donaciones-lista">
          {donaciones.map(d => (
            <div key={d.id} className={`dp-donacion-item ${d.tipo}`}>
              <div className="dp-donacion-left">
                <span className="dp-donacion-tipo">{d.tipo === 'monetaria' ? '💰' : '📦'}</span>
                <div className="dp-donacion-info">
                  <strong>
                    {d.tipo === 'monetaria'
                      ? `${d.moneda} ${parseFloat(d.monto).toFixed(2)}`
                      : `${d.objeto} x${d.cantidad}`}
                  </strong>
                  <small>{d.motivo || 'Sin motivo'}</small>
                </div>
              </div>
              <div className="dp-donacion-right">
                <span className={`dp-donacion-estado ${d.tipo === 'monetaria' ? 'verde' : 'naranja'}`}>
                  {d.tipo === 'monetaria' ? 'Monetaria' : 'Insumo'}
                </span>
                <span className="dp-donacion-fecha">
                  {d.fecha ? new Date(d.fecha).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ElegirDestino() {
  const [seleccion, setSeleccion] = useState([]);

  const toggleZona = (id) => {
    setSeleccion(prev =>
      prev.includes(id) ? prev.filter(z => z !== id) : [...prev, id]
    );
  };

  const prioridadColor = { Alta: '#FF1744', Media: '#FF9800', Baja: '#00C853' };

  return (
    <div className="dp-card">
      <h3>🎯 Elegir Destino de Ayuda</h3>
      <p className="dp-desc">Selecciona las zonas donde deseas que tu donación llegue. Puedes elegir varias.</p>
      <div className="dp-destinos-grid">
        {ZONAS_DESTINO.map(z => (
          <div
            key={z.id}
            className={`dp-destino-item ${seleccion.includes(z.id) ? 'seleccionado' : ''}`}
            onClick={() => toggleZona(z.id)}
          >
            <div className="dp-destino-check">{seleccion.includes(z.id) ? '✓' : ''}</div>
            <div className="dp-destino-info">
              <strong>{z.nombre}</strong>
              <div className="dp-destino-meta">
                <span style={{ color: prioridadColor[z.prioridad] }}>● {z.prioridad}</span>
                <span>{z.afectados} afectados</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {seleccion.length > 0 && (
        <div className="dp-destinos-resumen">
          {seleccion.length} zona{seleccion.length !== 1 ? 's' : ''} seleccionada{seleccion.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

function MiImpacto({ user }) {
  const [stats, setStats] = useState({ totalMonetario: 0, totalInsumos: 0, numDonaciones: 0 });

  useEffect(() => {
    cargarStats();
  }, []);

  const cargarStats = async () => {
    try {
      const res = await fetch(`${API}/api/donaciones`);
      if (res.ok) {
        const data = await res.json();
        const mias = data.filter(d => String(d.donante_id) === String(user?.id));
        const totalMonetario = mias
          .filter(d => d.tipo === 'monetaria')
          .reduce((sum, d) => sum + parseFloat(d.monto || 0), 0);
        const totalInsumos = mias
          .filter(d => d.tipo === 'insumo')
          .reduce((sum, d) => sum + parseInt(d.cantidad || 0), 0);
        setStats({
          totalMonetario,
          totalInsumos,
          numDonaciones: mias.length,
        });
      }
    } catch (e) { /* continue */ }
  };

  return (
    <div className="dp-card">
      <h3>📊 Mi Impacto</h3>
      <div className="dp-impacto-grid">
        <div className="dp-impacto-stat">
          <span className="dp-impacto-num">${stats.totalMonetario.toFixed(2)}</span>
          <span className="dp-impacto-label">Total monetario donado</span>
        </div>
        <div className="dp-impacto-stat">
          <span className="dp-impacto-num">{stats.totalInsumos}</span>
          <span className="dp-impacto-label">Objetos donados</span>
        </div>
        <div className="dp-impacto-stat">
          <span className="dp-impacto-num">{stats.numDonaciones}</span>
          <span className="dp-impacto-label">Donaciones totales</span>
        </div>
      </div>
      <div className="dp-impacto-mensaje">
        Tu ayuda marca la diferencia. ¡Gracias por contribuir a la resiliencia humanitaria!
      </div>
    </div>
  );
}

export default function DonantePanel({ user, tabActiva }) {
  const [resolvedUser, setResolvedUser] = useState(user);

  useEffect(() => {
    async function resolveId() {
      const id = await ensureDonante(user);
      if (id) {
        setResolvedUser(prev => ({ ...prev, id }));
      }
    }
    resolveId();
  }, [user]);

  const renderContent = () => {
    switch (tabActiva) {
      case 'donar-dinero': return <DonarDinero user={resolvedUser} />;
      case 'donar-objetos': return <DonarObjetos user={resolvedUser} />;
      case 'mis-donaciones': return <MisDonaciones user={resolvedUser} />;
      case 'elegir-destino': return <ElegirDestino />;
      case 'impacto': return <MiImpacto user={resolvedUser} />;
      default: return <DonarDinero user={resolvedUser} />;
    }
  };

  return (
    <div className="donante-panel">
      <div className="donante-panel-header">
        <h1>Bienvenido, {user?.nombre || 'Donante'}</h1>
        <div className="donante-header-line" />
      </div>
      {renderContent()}
    </div>
  );
}
