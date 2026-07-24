import { useState } from 'react';
import './ContactoEmergencia.css';

const centrosIniciales = [
  { nombre: 'Hospital Central Universitario', tipo: 'Hospital Tipo IV', direccion: 'Av. Universidad, Caracas', telefono: '0212-6050000', emergencia: '0212-6050111' },
  { nombre: 'Clínica Popular Los Magallanes', tipo: 'Clínica General', direccion: 'Calle 72, Maracaibo', telefono: '0261-7925000', emergencia: '0261-7925111' },
  { nombre: 'Hospital Dr. Miguel Pérez Carreño', tipo: 'Hospital Tipo III', direccion: 'Av. San Martín, Caracas', telefono: '0212-4780000', emergencia: '0212-4780222' },
  { nombre: 'Centro Médico Docente La Trinidad', tipo: 'Clínica Privada', direccion: 'Urb. La Trinidad, Caracas', telefono: '0212-9451333', emergencia: '0212-9451444' },
  { nombre: 'Hospital Universitario de Maracaibo', tipo: 'Hospital Tipo IV', direccion: 'Av. Goajira, Maracaibo', telefono: '0261-7598000', emergencia: '0261-7598222' },
  { nombre: 'Clínica El Ávila', tipo: 'Clínica Privada', direccion: 'Av. San Felipe, Caracas', telefono: '0212-7312222', emergencia: '0212-7312333' },
  { nombre: 'Hospital Dr. Domingo Luciani', tipo: 'Hospital Tipo III', direccion: 'Carretera El Llanito, Caracas', telefono: '0212-3968000', emergencia: '0212-3968111' },
  { nombre: 'Clínica Popular San Diego', tipo: 'Clínica General', direccion: 'Av. Principal, Valencia', telefono: '0241-8711234', emergencia: '0241-8715678' },
  { nombre: 'Hospital Universitario de Valencia', tipo: 'Hospital Tipo IV', direccion: 'Urb. La Viña, Valencia', telefono: '0241-8582000', emergencia: '0241-8582111' },
  { nombre: 'Clínica Popular Los Jardines', tipo: 'Clínica General', direccion: 'Av. Paseo Los Ilustres, Barquisimeto', telefono: '0251-2511234', emergencia: '0251-2515678' },
];

export default function ContactoEmergencia() {
  const [centros, setCentros] = useState(centrosIniciales);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', tipo: 'Centro de Acopio', direccion: '', telefono: '', emergencia: '' });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.direccion || !form.telefono) return;
    setCentros(prev => [form, ...prev]);
    setForm({ nombre: '', tipo: 'Centro de Acopio', direccion: '', telefono: '', emergencia: '' });
    setShowForm(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Contactos de Emergencia — Hospitales y Clínicas</h2>
        <div className="page-header-right">
          <span>{centros.length} centros registrados</span>
          <button className="btn-agregar-centro" onClick={() => setShowForm(!showForm)}>
            + Añadir Centro Médico o de Acopio
          </button>
        </div>
      </div>

      {showForm && (
        <div className="contacto-form-wrap">
          <form className="contacto-form" onSubmit={handleSubmit}>
            <h3>Registrar nuevo centro</h3>
            <div className="contacto-form-grid">
              <div className="form-grupo full">
                <label>Nombre del centro</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre del centro médico o de acopio" required />
              </div>
              <div className="form-grupo">
                <label>Tipo</label>
                <select name="tipo" value={form.tipo} onChange={handleChange}>
                  <option value="Centro de Acopio">Centro de Acopio</option>
                  <option value="Centro Médico Gratuito">Centro Médico Gratuito</option>
                  <option value="Refugio Temporal">Refugio Temporal</option>
                  <option value="Comedor Popular">Comedor Popular</option>
                </select>
              </div>
              <div className="form-grupo">
                <label>Teléfono</label>
                <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="0212-0000000" required />
              </div>
              <div className="form-grupo full">
                <label>Dirección</label>
                <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección completa" required />
              </div>
              <div className="form-grupo full">
                <label>Emergencia (opcional)</label>
                <input name="emergencia" value={form.emergencia} onChange={handleChange} placeholder="Teléfono de emergencia" />
              </div>
            </div>
            <div className="contacto-form-actions">
              <button type="button" className="btn-cancelar" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit">Guardar Centro</button>
            </div>
          </form>
        </div>
      )}

      <div className="contacto-grid">
        {centros.map((c, i) => (
          <div key={i} className={`contacto-card ${c.tipo === 'Centro de Acopio' || c.tipo === 'Refugio Temporal' || c.tipo === 'Comedor Popular' || c.tipo === 'Centro Médico Gratuito' ? 'nuevo' : ''}`}>
            <div className="contacto-header">
              <h3>{c.nombre}</h3>
              <span className="contacto-badge">{c.tipo}</span>
            </div>
            <p className="contacto-dir">{c.direccion}</p>
            <div className="contacto-tels">
              <span>📞 {c.telefono}</span>
              {c.emergencia && <span className="contacto-emerg">🆘 {c.emergencia}</span>}
            </div>
            {(c.tipo === 'Centro de Acopio' || c.tipo === 'Centro Médico Gratuito' || c.tipo === 'Refugio Temporal' || c.tipo === 'Comedor Popular') && (
              <div className="contacto-gratis">ENTRADA GRATUITA — Afectados y pacientes bienvenidos</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
