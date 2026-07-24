import { useState } from 'react';
import FileUploadImport from '../../components/FileUploadImport/FileUploadImport';
import './DesaparecidosPage.css';

const columns = [
  { key: 'nombre', label: 'Nombre', required: true },
  { key: 'zona', label: 'Zona', required: false },
];

function tiempoSinVer(fecha) {
  if (!fecha) return 'Desconocido';
  const ahora = new Date();
  const vista = new Date(fecha);
  const diffMs = ahora - vista;
  const mins = Math.floor(diffMs / 60000);
  const horas = Math.floor(mins / 60);
  const dias = Math.floor(horas / 24);
  const semanas = Math.floor(dias / 7);
  const meses = Math.floor(dias / 30);

  if (mins < 1) return 'Ahora mismo';
  if (mins < 60) return `${mins} min`;
  if (horas < 24) return `${horas}h ${mins % 60}m`;
  if (dias < 7) return `${dias} día${dias !== 1 ? 's' : ''}`;
  if (semanas < 4) return `${semanas} sem${semanas !== 1 ? 's' : ''}`;
  return `${meses} mes${meses !== 1 ? 'es' : ''}`;
}

function tiempoColor(fecha) {
  if (!fecha) return '';
  const dias = Math.floor((Date.now() - new Date(fecha)) / 86400000);
  if (dias <= 1) return 'tiempo-corto';
  if (dias <= 7) return 'tiempo-medio';
  return 'tiempo-largo';
}

export default function DesaparecidosPage({
  personasDesaparecidas,
  personasRescatadas,
  onRefresh
}) {
  const [nombre, setNombre] = useState('');
  const [zona, setZona] = useState('');
  const [cedula, setCedula] = useState('');
  const [foto, setFoto] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [fotoModal, setFotoModal] = useState(null);

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const agregarDesaparecido = async (e) => {
    e.preventDefault();
    if (!nombre) return;

    try {
      const res = await fetch('http://localhost:5000/api/desaparecidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          zona: zona || 'Desconocida',
          cedula: cedula || null,
          foto: foto || null
        })
      });
      if (res.ok) {
        setNombre('');
        setZona('');
        setCedula('');
        setFoto(null);
        onRefresh();
      }
    } catch (error) {
      console.error("Error al reportar desaparecido:", error);
    }
  };

  const marcarRescatado = async (desaparecido) => {
    try {
      const res = await fetch('http://localhost:5000/api/transiciones/rescatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: desaparecido.id,
          nombre: desaparecido.nombre,
          zona: desaparecido.zona,
          cedula: desaparecido.cedula,
          foto: desaparecido.foto
        })
      });
      if (res.ok) onRefresh();
    } catch (error) {
      console.error("Error al procesar el rescate del desaparecido:", error);
    }
  };

  const importarDesaparecidos = async (registros) => {
    for (const r of registros) {
      if (!r.nombre) continue;
      await fetch('http://localhost:5000/api/desaparecidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: r.nombre, zona: r.zona || 'Desconocida', cedula: r.cedula || null, foto: null })
      });
    }
    onRefresh();
  };

  const filtrados = personasDesaparecidas.filter(d =>
    d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (d.cedula && d.cedula.includes(busqueda))
  );

  const candidatosMatch = personasRescatadas.filter(r => {
    if (r._confirmado) return false;
    return personasDesaparecidas.some(d =>
      d.nombre.toLowerCase() === (r.nombre || '').toLowerCase() ||
      (d.cedula && r.cedula && d.cedula === r.cedula)
    );
  });

  return (
    <div className="page">
      <div className="page-header">
        <h2>Personas Desaparecidas</h2>
        <span>{personasDesaparecidas.length} reportes</span>
      </div>

      {candidatosMatch.length > 0 && (
        <div className="match-banner">
          <div className="match-banner-header">
            <span className="match-icon">⚡</span>
            <span>{candidatosMatch.length} persona{s(candidatosMatch.length)} rescatada{s(candidatosMatch.length)} coincide{n} con la lista de desaparecidos</span>
          </div>
          <div className="match-lista">
            {candidatosMatch.map(r => {
              const matchDes = personasDesaparecidas.find(d =>
                d.nombre.toLowerCase() === (r.nombre || '').toLowerCase() ||
                (d.cedula && r.cedula && d.cedula === r.cedula)
              );
              if (!matchDes) return null;
              return (
                <div key={r.id} className="match-candidato">
                  <div className="match-fotos">
                    <div className="match-foto-box">
                      <span className="match-foto-label">Desaparecido</span>
                      {matchDes.foto ? (
                        <img src={matchDes.foto} alt={matchDes.nombre} className="match-foto" onClick={() => setFotoModal(matchDes.foto)} />
                      ) : (
                        <div className="match-foto-placeholder">?</div>
                      )}
                    </div>
                    <span className="match-arrow">→</span>
                    <div className="match-foto-box">
                      <span className="match-foto-label">Rescatado</span>
                      {r.foto ? (
                        <img src={r.foto} alt={r.nombre} className="match-foto" onClick={() => setFotoModal(r.foto)} />
                      ) : (
                        <div className="match-foto-placeholder">?</div>
                      )}
                    </div>
                  </div>
                  <div className="match-info">
                    <strong>{r.nombre}</strong>
                    {matchDes.cedula && r.cedula && (
                      <span className="match-cedula">CI: {matchDes.cedula} {matchDes.cedula === r.cedula ? '✓' : ''}</span>
                    )}
                  </div>
                  <button
                    className="btn-confirmar-match"
                    onClick={async () => {
                      await marcarRescatado(matchDes);
                    }}
                  >✓ Confirmar identidad</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="page-grid">
        <div className="page-card">
          <h3>Reportar Desaparición</h3>
          <form className="form-grid" onSubmit={agregarDesaparecido}>
            <div className="form-grupo full">
              <label>Nombre completo</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre de la persona" />
            </div>
            <div className="form-grupo">
              <label>Cédula de identidad</label>
              <input value={cedula} onChange={e => setCedula(e.target.value)} placeholder="Ej: V-12345678" />
            </div>
            <div className="form-grupo">
              <label>Zona</label>
              <input value={zona} onChange={e => setZona(e.target.value)} placeholder="Zona donde se vio por última vez" />
            </div>
            <div className="form-grupo full">
              <label>Foto de la persona</label>
              <div className="foto-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  id="foto-desaparecido"
                  onChange={handleFoto}
                  style={{ display: 'none' }}
                />
                <label htmlFor="foto-desaparecido" className="foto-upload-btn">
                  {foto ? 'Cambiar foto' : 'Subir foto'}
                </label>
                {foto && (
                  <div className="foto-preview">
                    <img src={foto} alt="Preview" />
                    <button type="button" className="foto-remove" onClick={() => setFoto(null)}>✕</button>
                  </div>
                )}
              </div>
            </div>
            <button type="submit" disabled={!nombre}>Reportar Desaparición</button>
          </form>
          <FileUploadImport columns={columns} onImport={importarDesaparecidos} label="desaparecidos" />
        </div>

        <div className="page-card">
          <h3>Personas Desaparecidas</h3>
          <input
            style={{ marginBottom: '0.8rem', width: '100%' }}
            placeholder="Buscar por nombre o cédula..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {filtrados.length === 0 ? (
            <div className="empty-msg">No hay reportes de desaparición</div>
          ) : (
            <div className="tabla-contenedor">
              <table className="tabla">
                <thead>
                  <tr>
                    <th></th>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Cédula</th>
                    <th>Sin ver</th>
                    <th>Zona</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(d => (
                    <tr key={d.id}>
                      <td>
                        {d.foto ? (
                          <img
                            src={d.foto}
                            alt={d.nombre}
                            className="tabla-foto"
                            onClick={() => setFotoModal(d.foto)}
                          />
                        ) : (
                          <div className="tabla-foto-placeholder">👤</div>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{d.id}</td>
                      <td>{d.nombre}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.cedula || '—'}</td>
                      <td>
                        <span className={`tiempo-badge ${tiempoColor(d.ultima_vista)}`}>
                          {tiempoSinVer(d.ultima_vista)}
                        </span>
                      </td>
                      <td>{d.zona}</td>
                      <td>
                        <button className="acciones-btn btn-rescatado" onClick={() => marcarRescatado(d)} title="Marcar como rescatado">
                          ✓ Rescatado
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {fotoModal && (
        <div className="foto-modal-overlay" onClick={() => setFotoModal(null)}>
          <div className="foto-modal" onClick={e => e.stopPropagation()}>
            <button className="foto-modal-close" onClick={() => setFotoModal(null)}>✕</button>
            <img src={fotoModal} alt="Foto ampliada" />
          </div>
        </div>
      )}
    </div>
  );
}

function s(n) { return n !== 1 ? 's' : ''; }
function n(n) { return n !== 1 ? '' : ''; }
