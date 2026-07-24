import { useState } from 'react';
import './SolicitudesRescate.css';

const MONEDAS = [
  { codigo: 'USD', simbolo: '$', nombre: 'Dólar estadounidense' },
  { codigo: 'EUR', simbolo: '€', nombre: 'Euro' },
  { codigo: 'VES', simbolo: 'Bs.', nombre: 'Bolívar venezolano' },
  { codigo: 'BRL', simbolo: 'R$', nombre: 'Real brasileño' },
  { codigo: 'COP', simbolo: '$', nombre: 'Peso colombiano' },
  { codigo: 'PEN', simbolo: 'S/', nombre: 'Sol peruano' },
  { codigo: 'ARS', simbolo: '$', nombre: 'Peso argentino' },
  { codigo: 'MXN', simbolo: '$', nombre: 'Peso mexicano' },
];

const METODOS_PAGO = [
  { id: 'transferencia', label: 'Transferencia bancaria', icon: '🏦' },
  { id: 'paypal', label: 'PayPal', icon: '💳' },
  { id: 'zinli', label: 'Zinli', icon: '📱' },
  { id: 'efectivo', label: 'Efectivo', icon: '💵' },
  { id: 'crypto', label: 'Criptomonedas', icon: '₿' },
  { id: 'billetera', label: 'Billetera móvil', icon: '📲' },
];

export default function SolicitudesRescate({ personasRescatadas, addLog, onRefresh }) {
  const [solicitudes, setSolicitudes] = useState(() => {
    return personasRescatadas.map(p => ({
      ...p,
      estadoSolicitud: 'pendiente',
      metodoPago: '',
      moneda: 'USD',
      montoEnvio: '',
      pruebaEnviada: false,
      notas: '',
    }));
  });

  const [filtro, setFiltro] = useState('todas');
  const [expandedId, setExpandedId] = useState(null);

  const actualizarSolicitud = (id, campo, valor) => {
    setSolicitudes(prev =>
      prev.map(s => s.id === id ? { ...s, [campo]: valor } : s)
    );
  };

  const aceptarSolicitud = (id) => {
    const sol = solicitudes.find(s => s.id === id);
    if (!sol) return;
    actualizarSolicitud(id, 'estadoSolicitud', 'aceptada');
    actualizarSolicitud(id, 'pruebaEnviada', true);
    addLog(`Solicitud ACEPTADA: Envío autorizado para ${sol.nombre} vía ${sol.metodoPago || 'no especificado'} (${sol.moneda}).`);
  };

  const rechazarSolicitud = (id) => {
    const sol = solicitudes.find(s => s.id === id);
    if (!sol) return;
    actualizarSolicitud(id, 'estadoSolicitud', 'rechazada');
    addLog(`Solicitud RECHAZADA: No se enviará ayuda a ${sol.nombre}. Motivo: ${sol.notas || 'Sin justificación'}.`);
  };

  const marcarEnviado = async (id) => {
    const sol = solicitudes.find(s => s.id === id);
    if (!sol) return;
    actualizarSolicitud(id, 'estadoSolicitud', 'enviado');
    addLog(`Envío CONFIRMADO: ${sol.montoEnvio || '0'} ${sol.moneda} enviado a ${sol.nombre} via ${sol.metodoPago}.`);

    try {
      await fetch(`http://localhost:5000/api/rescatados/${id}/salud`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estadoSalud: 'Recuperado' })
      });
    } catch (e) {
      console.error('Error actualizando estado:', e);
    }
  };

  const solicitudesFiltradas = solicitudes.filter(s => {
    if (filtro === 'todas') return true;
    return s.estadoSolicitud === filtro;
  });

  const conteo = {
    todas: solicitudes.length,
    pendiente: solicitudes.filter(s => s.estadoSolicitud === 'pendiente').length,
    aceptada: solicitudes.filter(s => s.estadoSolicitud === 'aceptada').length,
    rechazada: solicitudes.filter(s => s.estadoSolicitud === 'rechazada').length,
    enviado: solicitudes.filter(s => s.estadoSolicitud === 'enviado').length,
  };

  return (
    <div className="solicitudes-card">
      <div className="solicitudes-header">
        <h3>Solicitudes de Envío</h3>
        <span className="solicitudes-count">{conteo.pendiente} pendientes</span>
      </div>

      <div className="solicitudes-filtros">
        {['todas', 'pendiente', 'aceptada', 'rechazada', 'enviado'].map(f => (
          <button
            key={f}
            className={`filtro-btn ${filtro === f ? 'activo' : ''}`}
            onClick={() => setFiltro(f)}
          >
            {f === 'todas' ? 'Todas' : f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="filtro-count">{conteo[f]}</span>
          </button>
        ))}
      </div>

      {solicitudesFiltradas.length === 0 ? (
        <div className="empty-msg">No hay solicitudes {filtro !== 'todas' ? `con estado "${filtro}"` : ''}</div>
      ) : (
        <div className="solicitudes-lista">
          {solicitudesFiltradas.map(sol => {
            const expandido = expandedId === sol.id;
            const estado = sol.estadoSolicitud;
            const esPendiente = estado === 'pendiente';
            const esAceptada = estado === 'aceptada';

            return (
              <div key={sol.id} className={`solicitud-item ${estado}`}>
                <div className="solicitud-main">
                  <div className="solicitud-info">
                    <div className="solicitud-nombre">{sol.nombre}</div>
                    <div className="solicitud-meta">
                      <span className={`estado-solicitud-badge ${estado}`}>{estado}</span>
                      <span className="solicitud-id">{sol.id}</span>
                      <span className="solicitud-salud">{sol.estado_salud || sol.estado || 'Estable'}</span>
                    </div>
                  </div>

                  <div className="solicitud-acciones">
                    {esPendiente && (
                      <>
                        <button className="btn-aceptar" onClick={() => aceptarSolicitud(sol.id)} title="Aceptar solicitud">
                          ✓ Enviar
                        </button>
                        <button className="btn-rechazar" onClick={() => rechazarSolicitud(sol.id)} title="Rechazar solicitud">
                          ✕ Rechazar
                        </button>
                      </>
                    )}
                    {esAceptada && (
                      <button className="btn-confirmar" onClick={() => marcarEnviado(sol.id)} title="Confirmar envío">
                        ● Confirmar envío
                      </button>
                    )}
                    {estado === 'enviado' && (
                      <span className="enviado-label">✓ Enviado</span>
                    )}
                    {estado === 'rechazada' && (
                      <span className="rechazado-label">✕ Rechazado</span>
                    )}
                    <button
                      className="btn-detalles"
                      onClick={() => setExpandedId(expandido ? null : sol.id)}
                    >
                      {expandido ? '▲' : '▼'} Detalles
                    </button>
                  </div>
                </div>

                {expandido && (
                  <div className="solicitud-detalles">
                    <div className="detalles-grid">
                      <div className="detalle-grupo">
                        <label>Equipo asociado</label>
                        <span>{sol.equipo_asociado || 'No asignado'}</span>
                      </div>
                      <div className="detalle-grupo">
                        <label>Fecha de rescate</label>
                        <span>{sol.fecha_rescate ? new Date(sol.fecha_rescate).toLocaleDateString('es-ES') : '—'}</span>
                      </div>
                      <div className="detalle-grupo">
                        <label>Situación / Estado de salud</label>
                        <span className={`situacion-tag ${(sol.estado_salud || '').toLowerCase()}`}>
                          {sol.estado_salud || sol.estado || 'Estable'}
                        </span>
                      </div>
                    </div>

                    {esPendiente || esAceptada ? (
                      <div className="detalles-form">
                        <div className="detalles-form-row">
                          <div className="detalle-grupo">
                            <label>Método de pago</label>
                            <select
                              value={sol.metodoPago}
                              onChange={e => actualizarSolicitud(sol.id, 'metodoPago', e.target.value)}
                            >
                              <option value="">Seleccionar...</option>
                              {METODOS_PAGO.map(m => (
                                <option key={m.id} value={m.id}>{m.icon} {m.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="detalle-grupo">
                            <label>Moneda</label>
                            <select
                              value={sol.moneda}
                              onChange={e => actualizarSolicitud(sol.id, 'moneda', e.target.value)}
                            >
                              {MONEDAS.map(m => (
                                <option key={m.codigo} value={m.codigo}>{m.simbolo} {m.codigo} - {m.nombre}</option>
                              ))}
                            </select>
                          </div>
                          <div className="detalle-grupo">
                            <label>Monto a enviar</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={sol.montoEnvio}
                              onChange={e => actualizarSolicitud(sol.id, 'montoEnvio', e.target.value)}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className="detalle-grupo full">
                          <label>Notas / Justificación</label>
                          <textarea
                            value={sol.notas}
                            onChange={e => actualizarSolicitud(sol.id, 'notas', e.target.value)}
                            placeholder="Motivo de la decisión, observaciones del caso..."
                            rows="2"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
