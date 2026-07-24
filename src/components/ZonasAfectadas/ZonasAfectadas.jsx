import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ZonasAfectadas.css';

const hospitalIcon = L.divIcon({
  className: 'custom-icon hospital-icon',
  html: '<span>🏥</span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const zonaIcon = L.divIcon({
  className: 'custom-icon zona-icon',
  html: '<span>🔴</span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const equipoIcon = L.divIcon({
  className: 'custom-icon equipo-icon',
  html: '<span>🔵</span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const recuperacionIcon = L.divIcon({
  className: 'custom-icon recuperacion-icon',
  html: '<span>🟢</span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const militarIcon = L.divIcon({
  className: 'custom-icon militar-icon',
  html: '<span>🪖</span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const revisionIcon = L.divIcon({
  className: 'custom-icon revision-icon',
  html: '<span>🔍</span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const ICON_MAP = {
  zona: zonaIcon,
  equipo: equipoIcon,
  recuperacion: recuperacionIcon,
  militar: militarIcon,
  revision: revisionIcon,
};

const LABEL_MAP = {
  zona: '🔴 Zona Afectada',
  equipo: '🔵 Equipo de Rescate',
  recuperacion: '🟢 Zona en Recuperación',
  militar: '🪖 Zona Militarizada',
  revision: '🔍 Revisión de Autoridades',
};

const DOT_CLASS = {
  zona: 'red',
  equipo: 'blue',
  recuperacion: 'green',
  militar: 'olive',
  revision: 'orange',
};

const hospitales = [
  { nombre: 'Hospital Central Universitario', ciudad: 'Caracas', coords: [10.5018, -66.8936] },
  { nombre: 'Hospital Dr. Miguel Pérez Carreño', ciudad: 'Caracas', coords: [10.4789, -66.9225] },
  { nombre: 'Centro Médico Docente La Trinidad', ciudad: 'Caracas', coords: [10.4633, -66.8681] },
  { nombre: 'Clínica El Ávila', ciudad: 'Caracas', coords: [10.4906, -66.8486] },
  { nombre: 'Hospital Dr. Domingo Luciani', ciudad: 'Caracas', coords: [10.4519, -66.8314] },
  { nombre: 'Hospital Universitario de Maracaibo', ciudad: 'Maracaibo', coords: [10.6545, -71.6245] },
  { nombre: 'Clínica Popular Los Magallanes', ciudad: 'Maracaibo', coords: [10.6400, -71.6380] },
  { nombre: 'Hospital Universitario de Valencia', ciudad: 'Valencia', coords: [10.1808, -68.0053] },
  { nombre: 'Clínica Popular San Diego', ciudad: 'Valencia', coords: [10.1595, -67.9953] },
  { nombre: 'Clínica Popular Los Jardines', ciudad: 'Barquisimeto', coords: [10.0678, -69.3389] },
  { nombre: 'Hospital Central de Valencia', ciudad: 'Valencia', coords: [10.1712, -68.0078] },
  { nombre: 'Hospital General del Sur', ciudad: 'Barcelona', coords: [10.1342, -64.6870] },
  { nombre: "Centro Médico Dr. Angel D'Armas", ciudad: 'Barcelona', coords: [10.1118, -64.6908] },
  { nombre: 'Hospital Ruiz y Páez', ciudad: 'Ciudad Bolívar', coords: [8.1298, -63.5409] },
  { nombre: 'Hospital Dr. Raúl Leoni', ciudad: 'Ciudad Guayana', coords: [8.2912, -62.7530] },
  { nombre: 'Hospital Universitario de Mérida', ciudad: 'Mérida', coords: [8.5897, -71.1561] },
  { nombre: 'Centro Clínico de Mérida', ciudad: 'Mérida', coords: [8.5732, -71.1450] },
  { nombre: 'Hospital Central Dr. Antonio María Pineda', ciudad: 'Barinas', coords: [8.6232, -70.2075] },
  { nombre: 'Hospital Universitario Jesús María Rodríguez', ciudad: 'Barinas', coords: [8.6100, -70.2130] },
  { nombre: 'Hospital General Dr. Carlos Arvelo', ciudad: 'Puerto Ordaz', coords: [8.2867, -62.7130] },
  { nombre: 'Hospital Dr. Luis Razetti', ciudad: 'Punto Fijo', coords: [11.6920, -70.2130] },
  { nombre: 'Centro Médico Falcón', ciudad: 'Punto Fijo', coords: [11.7015, -70.1980] },
  { nombre: 'Hospital Universitario Dr. Antonio Patricio Alcalá', ciudad: 'Cumaná', coords: [10.4530, -64.1820] },
  { nombre: 'Hospital General del Táchira', ciudad: 'San Cristóbal', coords: [7.7669, -72.2250] },
  { nombre: 'Centro Médico San Cristóbal', ciudad: 'San Cristóbal', coords: [7.7720, -72.2310] },
  { nombre: 'Hospital Central de Zulia', ciudad: 'Maracaibo', coords: [10.6420, -71.6100] },
  { nombre: 'Hospital Pediatrico Dr. Agustín Zubillaga', ciudad: 'Barquisimeto', coords: [10.0450, -69.3560] },
  { nombre: 'Hospital Universitario de Caracas', ciudad: 'Caracas', coords: [10.4880, -66.8830] },
  { nombre: 'Clínica Santa Sofía', ciudad: 'Caracas', coords: [10.5000, -66.9200] },
  { nombre: 'Hospital Dr. Pablo Acosta Sánchez', ciudad: 'San Fernando de Apure', coords: [7.8820, -67.4750] },
];

function ClickHandler({ mode, onAddMarker }) {
  useMapEvents({
    click(e) {
      if (mode) {
        onAddMarker({ lat: e.latlng.lat, lng: e.latlng.lng, type: mode });
      }
    },
  });
  return null;
}

export default function ZonasAfectadas({ markers, setMarkers }) {
  const [mode, setMode] = useState(null);

  const handleAddMarker = useCallback((m) => {
    setMarkers(prev => [...prev, { ...m, id: Date.now() + Math.random() }]);
  }, []);

  const removeMarker = (id) => {
    setMarkers(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Zonas Afectadas</h2>
        <span>{markers.length} marcadores</span>
      </div>
      <div className="mapa-wrapper">
        <aside className="mapa-sidebar">
          <h3>Marcadores</h3>
          <div className="mapa-tools">
            <button
              className={`mapa-btn zona ${mode === 'zona' ? 'activo' : ''}`}
              onClick={() => setMode(mode === 'zona' ? null : 'zona')}
            >
              🔴 Zona Afectada
            </button>
            <button
              className={`mapa-btn equipo ${mode === 'equipo' ? 'activo' : ''}`}
              onClick={() => setMode(mode === 'equipo' ? null : 'equipo')}
            >
              🔵 Equipo Rescate
            </button>
            <button
              className={`mapa-btn recuperacion ${mode === 'recuperacion' ? 'activo' : ''}`}
              onClick={() => setMode(mode === 'recuperacion' ? null : 'recuperacion')}
            >
              🟢 Zona Recuperación
            </button>
            <button
              className={`mapa-btn militar ${mode === 'militar' ? 'activo' : ''}`}
              onClick={() => setMode(mode === 'militar' ? null : 'militar')}
            >
              🪖 Zona Militarizada
            </button>
            <button
              className={`mapa-btn revision ${mode === 'revision' ? 'activo' : ''}`}
              onClick={() => setMode(mode === 'revision' ? null : 'revision')}
            >
              🔍 Revisión Autoridades
            </button>
            {mode && <p className="mapa-hint">Haz clic en el mapa para colocar el marcador</p>}
          </div>
          <div className="mapa-legend">
            <h4>Leyenda</h4>
            <span><span className="dot red" /> Zona Afectada</span>
            <span><span className="dot blue" /> Equipo Rescate</span>
            <span><span className="dot green" /> Zona en Recuperación</span>
            <span><span className="dot olive" /> Zona Militarizada</span>
            <span><span className="dot orange" /> Revisión de Autoridades</span>
            <span><span className="dot hosp" /> 🏥 Hospital/Clínica</span>
          </div>
          {markers.length > 0 && (
            <div className="mapa-list">
              <h4>Marcadores colocados</h4>
              {markers.map(m => (
                <div key={m.id} className="mapa-list-item">
                  <span>{LABEL_MAP[m.type] || m.type} {m.lat.toFixed(4)}, {m.lng.toFixed(4)}</span>
                  <button onClick={() => removeMarker(m.id)} title="Eliminar">✕</button>
                </div>
              ))}
            </div>
          )}
        </aside>
        <div className="mapa-container">
          <MapContainer center={[6.4238, -66.5897]} zoom={6} className="mapa-leaflet" scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler mode={mode} onAddMarker={handleAddMarker} />
            {hospitales.map((h, i) => (
              <Marker key={i} position={h.coords} icon={hospitalIcon}>
                <Popup>
                  <strong>{h.nombre}</strong><br />{h.ciudad}
                </Popup>
              </Marker>
            ))}
            {markers.map(m => (
              <Marker key={m.id} position={[m.lat, m.lng]} icon={ICON_MAP[m.type] || zonaIcon}>
                <Popup>
                  {LABEL_MAP[m.type] || m.type}<br />
                  {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
