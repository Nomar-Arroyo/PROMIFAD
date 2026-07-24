import { useState, useEffect } from 'react';
import './DonantesPage.css';

const INSUMOS_PREDEFINIDOS = [
  'Insumos médicos', 'Ropa', 'Sábanas', 'Cobijas / Mantas', 'Carpas',
  'Colchonetas', 'Pañales', 'Kit de higiene', 'Agua potable',
  'Alimentos no perecederos', 'Medicinas', 'Generadores',
  'Herramientas', 'Materiales de construcción', 'Combustible', 'Otro'
];

const MONEDAS = ['$', '€', 'Bs', 'USD', 'EUR', 'COP'];

export default function DonantesPage({ personas, setPersonas, onRefresh }) {
  const [nombre, setNombre] = useState('');
  const [vulnerabilidad, setVulnerabilidad] = useState('Ninguna');
  const [saldo, setSaldo] = useState('');
  const [donacionesObj, setDonacionesObj] = useState({});
  const [donacionesMon, setDonacionesMon] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  const [nuevoInsumo, setNuevoInsumo] = useState('');
  const [nuevaCantInsumo, setNuevaCantInsumo] = useState('');
  const [insumoCustom, setInsumoCustom] = useState('');

  const [montoDonacion, setMontoDonacion] = useState('');
  const [monedaDonacion, setMonedaDonacion] = useState('$');
  const [motivoDonacion, setMotivoDonacion] = useState('');

  useEffect(() => {
    cargarDonaciones();
  }, []);

  const cargarDonaciones = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/donaciones');
      if (res.ok) {
        const data = await res.json();
        const objs = {};
        const mons = {};
        data.forEach(d => {
          if (d.tipo === 'monetaria') {
            if (!mons[d.donante_id]) mons[d.donante_id] = [];
            mons[d.donante_id].push(d);
          } else {
            if (!objs[d.donante_id]) objs[d.donante_id] = [];
            objs[d.donante_id].push(d);
          }
        });
        setDonacionesObj(objs);
        setDonacionesMon(mons);
      }
    } catch (error) {
      console.error("Error cargando donaciones:", error);
    }
  };

  const agregarDonante = async (e) => {
    e.preventDefault();
    if (!nombre || !saldo) return;

    try {
      const res = await fetch('http://localhost:5000/api/donantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, vulnerabilidad, saldo: parseFloat(saldo) })
      });
      if (res.ok) {
        setNombre('');
        setVulnerabilidad('Ninguna');
        setSaldo('');
        onRefresh();
      }
    } catch (error) {
      console.error("Error agregando donante:", error);
    }
  };

  const eliminarDonante = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/donantes/${id}`, { method: 'DELETE' });
      if (res.ok) onRefresh();
    } catch (error) {
      console.error("Error eliminando donante:", error);
    }
  };

  const agregarInsumo = async (donanteId) => {
    const objeto = nuevoInsumo === 'Otro' ? insumoCustom : nuevoInsumo;
    if (!objeto || !nuevaCantInsumo) return;

    try {
      const res = await fetch('http://localhost:5000/api/donaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donante_id: donanteId,
          objeto,
          cantidad: parseInt(nuevaCantInsumo),
          tipo: 'insumo'
        })
      });
      if (res.ok) {
        setNuevoInsumo('');
        setNuevaCantInsumo('');
        setInsumoCustom('');
        cargarDonaciones();
      }
    } catch (error) {
      console.error("Error agregando insumo:", error);
    }
  };

  const agregarDonacionMonetaria = async (donanteId) => {
    if (!montoDonacion) return;

    try {
      const res = await fetch('http://localhost:5000/api/donaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donante_id: donanteId,
          objeto: `${monedaDonacion} ${parseFloat(montoDonacion).toFixed(2)}`,
          cantidad: 1,
          tipo: 'monetaria',
          monto: parseFloat(montoDonacion),
          moneda: monedaDonacion,
          motivo: motivoDonacion
        })
      });
      if (res.ok) {
        setMontoDonacion('');
        setMonedaDonacion('$');
        setMotivoDonacion('');
        cargarDonaciones();
      }
    } catch (error) {
      console.error("Error agregando donación monetaria:", error);
    }
  };

  const eliminarDonacion = async (donacionId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/donaciones/${donacionId}`, { method: 'DELETE' });
      if (res.ok) cargarDonaciones();
    } catch (error) {
      console.error("Error eliminando donación:", error);
    }
  };

  const totalFondos = personas.reduce((sum, p) => sum + parseFloat(p.saldo || 0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Gestión de Donantes</h2>
        <span>{personas.length} registros · Total: ${totalFondos.toFixed(2)}</span>
      </div>

      <div className="page-grid">
        <div className="page-card">
          <h3>Registrar Donante</h3>
          <form className="form-grid" onSubmit={agregarDonante}>
            <div className="form-grupo full">
              <label>Nombre completo</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del donante" />
            </div>
            <div className="form-grupo">
              <label>Vulnerabilidad</label>
              <select value={vulnerabilidad} onChange={e => setVulnerabilidad(e.target.value)}>
                <option value="Ninguna">Ninguna</option>
                <option value="Zonificación de Riesgo">Zonificación de Riesgo</option>
                <option value="Desplazamiento Forzado">Desplazamiento Forzado</option>
                <option value="Pérdida Total">Pérdida Total</option>
              </select>
            </div>
            <div className="form-grupo">
              <label>Saldo inicial ($)</label>
              <input type="number" step="0.01" min="0" value={saldo} onChange={e => setSaldo(e.target.value)} placeholder="0.00" />
            </div>
            <button type="submit" disabled={!nombre || !saldo}>Agregar Donante</button>
          </form>
        </div>

        <div className="page-card">
          <h3>Lista de Donantes</h3>
          {personas.length === 0 ? (
            <div className="empty-msg">No hay donantes registrados</div>
          ) : (
            <div className="tabla-contenedor">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Vulnerabilidad</th>
                    <th>Saldo</th>
                    <th>Detalles</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {personas.map(p => {
                    const itemsObj = donacionesObj[p.id] || [];
                    const itemsMon = donacionesMon[p.id] || [];
                    const totalInsumos = itemsObj.reduce((s, d) => s + d.cantidad, 0);
                    const totalMon = itemsMon.length;
                    const expandido = expandedId === p.id;
                    const totalItems = totalInsumos + totalMon;

                    return (
                      <tr key={p.id} className={expandido ? 'fila-expandida' : ''}>
                        <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.id}</td>
                        <td>{p.nombre}</td>
                        <td>{p.vulnerabilidad}</td>
                        <td style={{ color: 'var(--orange-accent)', fontWeight: 600 }}>${parseFloat(p.saldo).toFixed(2)}</td>
                        <td>
                          <button
                            className="donaciones-toggle"
                            onClick={() => setExpandedId(expandido ? null : p.id)}
                          >
                            {totalItems > 0 ? `${totalItems} donac.` : '—'}
                            <span className="toggle-icon">{expandido ? '▲' : '▼'}</span>
                          </button>
                        </td>
                        <td>
                          <button className="acciones-btn" onClick={() => eliminarDonante(p.id)} title="Eliminar">✕</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {personas.map(p => {
                if (expandedId !== p.id) return null;
                const itemsObj = donacionesObj[p.id] || [];
                const itemsMon = donacionesMon[p.id] || [];

                return (
                  <div key={`detail-${p.id}`} className="donaciones-panel">
                    <div className="donaciones-panel-header">
                      <span>Donaciones de {p.nombre}</span>
                      <div className="donaciones-summary">
                        {itemsObj.length > 0 && (
                          <span className="summary-badge insumo">{itemsObj.reduce((s, d) => s + d.cantidad, 0)} insumos</span>
                        )}
                        {itemsMon.length > 0 && (
                          <span className="summary-badge monetaria">{itemsMon.length} monetarias</span>
                        )}
                      </div>
                    </div>

                    <div className="donaciones-split">
                      {/* ── Columna: Insumos ── */}
                      <div className="donaciones-col">
                        <div className="donaciones-col-title">
                          <span className="col-icon">📦</span> Insumos y Artículos
                        </div>

                        {itemsObj.length > 0 ? (
                          <div className="donaciones-lista">
                            {itemsObj.map(d => (
                              <div key={d.id} className="donacion-item insumo">
                                <span className="donacion-objeto">{d.objeto}</span>
                                <span className="donacion-cantidad">x{d.cantidad}</span>
                                <button
                                  className="acciones-btn btn-eliminar-donacion"
                                  onClick={() => eliminarDonacion(d.id)}
                                  title="Eliminar"
                                >✕</button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="donaciones-vacio">Sin insumos registrados</div>
                        )}

                        <div className="donaciones-form">
                          <select
                            value={nuevoInsumo}
                            onChange={e => setNuevoInsumo(e.target.value)}
                          >
                            <option value="">Seleccionar insumo...</option>
                            {INSUMOS_PREDEFINIDOS.map(o => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                          {nuevoInsumo === 'Otro' && (
                            <input
                              value={insumoCustom}
                              onChange={e => setInsumoCustom(e.target.value)}
                              placeholder="Nombre del insumo"
                            />
                          )}
                          <input
                            type="number"
                            min="1"
                            value={nuevaCantInsumo}
                            onChange={e => setNuevaCantInsumo(e.target.value)}
                            placeholder="Cant."
                            className="donaciones-cant-input"
                          />
                          <button
                            className="btn-agregar-objeto"
                            onClick={() => agregarInsumo(p.id)}
                            disabled={!nuevoInsumo || !nuevaCantInsumo || (nuevoInsumo === 'Otro' && !insumoCustom)}
                          >+</button>
                        </div>
                      </div>

                      {/* ── Columna: Monetario ── */}
                      <div className="donaciones-col">
                        <div className="donaciones-col-title">
                          <span className="col-icon">💵</span> Donaciones Monetarias
                        </div>

                        {itemsMon.length > 0 ? (
                          <div className="donaciones-lista">
                            {itemsMon.map(d => (
                              <div key={d.id} className="donacion-item monetaria">
                                <span className="donacion-objeto">{d.moneda} {parseFloat(d.monto).toFixed(2)}</span>
                                {d.motivo && <span className="donacion-motivo">{d.motivo}</span>}
                                <button
                                  className="acciones-btn btn-eliminar-donacion"
                                  onClick={() => eliminarDonacion(d.id)}
                                  title="Eliminar"
                                >✕</button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="donaciones-vacio">Sin donaciones monetarias</div>
                        )}

                        <div className="donaciones-form monetaria-form">
                          <select
                            value={monedaDonacion}
                            onChange={e => setMonedaDonacion(e.target.value)}
                            className="moneda-select"
                          >
                            {MONEDAS.map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={montoDonacion}
                            onChange={e => setMontoDonacion(e.target.value)}
                            placeholder="Monto"
                            className="monto-input"
                          />
                          <input
                            value={motivoDonacion}
                            onChange={e => setMotivoDonacion(e.target.value)}
                            placeholder="Motivo (opcional)"
                            className="motivo-input"
                          />
                          <button
                            className="btn-agregar-objeto btn-monetary"
                            onClick={() => agregarDonacionMonetaria(p.id)}
                            disabled={!montoDonacion}
                          >+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
