import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './SplashMap.css';

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

export default function SplashMap({ markers = [] }) {
  return (
    <div className="splash-map-container">
      <div className="splash-map-wrap">
        <MapContainer center={[6.4238, -66.5897]} zoom={6} className="splash-map-leaflet" scrollWheelZoom={false} dragging={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
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
      <div className="splash-map-legend">
        <span><span className="dot hosp" /> 🏥 Hospitales</span>
        <span><span className="dot red" /> Zonas Afectadas</span>
        <span><span className="dot blue" /> Equipos de Rescate</span>
        <span><span className="dot green" /> Recuperación</span>
        <span><span className="dot olive" /> Militar</span>
        <span><span className="dot orange" /> Revisión</span>
      </div>
    </div>
  );
}
