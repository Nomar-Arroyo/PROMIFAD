const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Verificación de conexión inicial (Te ayudará a debuggear el error 500)
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error crítico al conectar a PostgreSQL:', err.message);
  } else {
    console.log('✅ Conexión a PostgreSQL establecida con éxito.');
  }
});

// 1. ENDPOINT: Obtener todos los donantes (DonantesPage / Dashboard)
app.get('/api/donantes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM personas_donantes ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("Error en GET /api/donantes:", err.message);
    res.status(500).json({ error: "Error en la base de datos. Verifica si la tabla 'personas_donantes' existe." });
  }
});

// 2. ENDPOINT: Obtener desaparecidos
app.get('/api/desaparecidos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM desaparecidos ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ENDPOINT CORREGIDO: Insertar un nuevo desaparecido autogenerando el ID
app.post('/api/desaparecidos', async (req, res) => {
  const { nombre, zona } = req.body; 
  try {
    // 1. Calculamos el nuevo ID correlativo dinámicamente basándonos en el conteo total
    const countDes = await pool.query('SELECT COUNT(*) FROM desaparecidos');
    const nuevoId = `DES-${String(parseInt(countDes.rows[0].count) + 1).padStart(2, '0')}`;
    
    // 2. Insertamos la fila incluyendo la fecha actual para que no falle al renderizar el Date() en el frontend
    const result = await pool.query(
      'INSERT INTO desaparecidos (id, nombre, zona, ultima_vista) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [nuevoId, nombre, zona]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error en POST /api/desaparecidos:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. ENDPOINT: Obtener rescatados
app.get('/api/rescatados', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rescatados ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. ENDPOINT: Obtener equipos de rescate
app.get('/api/equipos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipos_rescate ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. ENDPOINT: Obtener indemnizaciones
app.get('/api/indemnizaciones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM indemnizaciones ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. ENDPOINT: Obtener proyectos de financiación
app.get('/api/proyectos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proyectos_recuperacion ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. ENDPOINT: Obtener logs de la bitácora
app.get('/api/logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM logs ORDER BY id DESC'); // Del más nuevo al más viejo
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. ENDPOINT: Insertar nuevo log
app.post('/api/logs', async (req, res) => {
  const { entrada } = req.body;
  try {
    const result = await pool.query('INSERT INTO logs (entrada) VALUES ($1) RETURNING *', [entrada]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. ENDPOINT: Acción Cruzada (Desaparecidos -> Rescatados)
app.post('/api/transiciones/rescatar', async (req, res) => {
  const { id, nombre, zona } = req.body;
  
  try {
    await pool.query('BEGIN');
    await pool.query('DELETE FROM desaparecidos WHERE id = $1', [id]);
    
    const countRes = await pool.query('SELECT COUNT(*) FROM rescatados');
    const nuevoId = `RES-${String(parseInt(countRes.rows[0].count) + 1).padStart(2, '0')}`;
    
    await pool.query(
      'INSERT INTO rescatados (id, nombre, equipo_asociado, estado_salud) VALUES ($1, $2, $3, $4)',
      [nuevoId, nombre, 'No asignado', 'Estable']
    );
    
    await pool.query('INSERT INTO logs (entrada) VALUES ($1)', [`Localizado: ${nombre} en la zona ${zona}. Transferido a censo de rescatados.`]);

    await pool.query('COMMIT');
    res.json({ success: true, nuevoId });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor PROMIFAD corriendo en el puerto ${PORT}`));