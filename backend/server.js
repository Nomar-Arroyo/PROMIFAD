const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ══════════════════════════════════════════════════════
//  MIGRACIONES: Crear tablas si no existen
// ══════════════════════════════════════════════════════
async function crearTablas() {
  const tablas = [
    `CREATE TABLE IF NOT EXISTS personas_donantes (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(200) NOT NULL,
      vulnerabilidad VARCHAR(100) DEFAULT 'Ninguna',
      saldo NUMERIC(12,2) DEFAULT 0
    )`,

    `CREATE TABLE IF NOT EXISTS desaparecidos (
      id VARCHAR(20) PRIMARY KEY,
      nombre VARCHAR(200) NOT NULL,
      zona VARCHAR(200),
      ultima_vista TIMESTAMP DEFAULT NOW(),
      foto TEXT,
      cedula VARCHAR(30)
    )`,

    `CREATE TABLE IF NOT EXISTS rescatados (
      id VARCHAR(20) PRIMARY KEY,
      nombre VARCHAR(200) NOT NULL,
      equipo_asociado VARCHAR(200) DEFAULT 'No asignado',
      estado_salud VARCHAR(50) DEFAULT 'Estable',
      fecha_rescate TIMESTAMP DEFAULT NOW(),
      foto TEXT,
      cedula VARCHAR(30)
    )`,

    `CREATE TABLE IF NOT EXISTS equipos_rescate (
      id VARCHAR(20) PRIMARY KEY,
      nombre VARCHAR(200) NOT NULL,
      miembros INTEGER DEFAULT 0,
      ubicacion VARCHAR(300) DEFAULT 'Sin ubicación',
      estado VARCHAR(50) DEFAULT 'Disponible',
      nacionalidad VARCHAR(100) DEFAULT 'No especificada',
      tiempo_llegada VARCHAR(100),
      contacto VARCHAR(200) DEFAULT 'Sin contacto'
    )`,

    `CREATE TABLE IF NOT EXISTS indemnizaciones (
      id SERIAL PRIMARY KEY,
      persona VARCHAR(200),
      monto NUMERIC(12,2) DEFAULT 0,
      motivo TEXT,
      estado VARCHAR(50) DEFAULT 'Pendiente',
      fecha TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS proyectos_recuperacion (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(200),
      monto_meta NUMERIC(12,2) DEFAULT 0,
      monto_recaudado NUMERIC(12,2) DEFAULT 0,
      estado VARCHAR(50) DEFAULT 'Activo'
    )`,

    `CREATE TABLE IF NOT EXISTS logs (
      id SERIAL PRIMARY KEY,
      entrada TEXT,
      fecha TIMESTAMP DEFAULT NOW()
    )`,
  ];

  for (const sql of tablas) {
    await pool.query(sql);
  }

  // ── Verificar tipo de id en personas_donantes ──
  const colInfo = await pool.query(`
    SELECT data_type FROM information_schema.columns
    WHERE table_name = 'personas_donantes' AND column_name = 'id'
  `);
  const tipoId = colInfo.rows[0]?.data_type || 'integer';
  console.log(`ℹ️ Tipo de id en personas_donantes: ${tipoId}`);

  // ── Adaptar personas_donantes si el id no es SERIAL/INTEGER ──
  if (tipoId !== 'integer' && tipoId !== 'smallint' && tipoId !== 'bigint') {
    // La tabla tiene id VARCHAR/TEXT, la reconstruimos con id INTEGER
    console.log('⚠️ personas_donantes tiene id no-numérico. Recreando tabla...');
    await pool.query(`DROP TABLE IF EXISTS donaciones CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS personas_donantes CASCADE`);
    await pool.query(`CREATE TABLE personas_donantes (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(200) NOT NULL,
      vulnerabilidad VARCHAR(100) DEFAULT 'Ninguna',
      saldo NUMERIC(12,2) DEFAULT 0
    )`);
    console.log('✅ personas_donantes recreada con id SERIAL.');
  }

  // ── donaciones: crear si no existe ──
  await pool.query(`CREATE TABLE IF NOT EXISTS donaciones (
    id SERIAL PRIMARY KEY,
    donante_id INTEGER NOT NULL,
    objeto VARCHAR(200) NOT NULL,
    cantidad INTEGER DEFAULT 1,
    tipo VARCHAR(20) DEFAULT 'insumo',
    monto NUMERIC(12,2) DEFAULT 0,
    moneda VARCHAR(10) DEFAULT '$',
    motivo TEXT,
    fecha TIMESTAMP DEFAULT NOW()
  )`);

  // Agregar columnas que puedan faltar
  const colsDonacion = [
    `ALTER TABLE donaciones ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'insumo'`,
    `ALTER TABLE donaciones ADD COLUMN IF NOT EXISTS monto NUMERIC(12,2) DEFAULT 0`,
    `ALTER TABLE donaciones ADD COLUMN IF NOT EXISTS moneda VARCHAR(10) DEFAULT '$'`,
    `ALTER TABLE donaciones ADD COLUMN IF NOT EXISTS motivo TEXT`,
    `ALTER TABLE donaciones ADD COLUMN IF NOT EXISTS fecha TIMESTAMP DEFAULT NOW()`,
  ];
  for (const sql of colsDonacion) {
    await pool.query(sql);
  }

  // ── Crear FK donaciones → personas_donantes ──
  await pool.query(`ALTER TABLE donaciones DROP CONSTRAINT IF EXISTS donaciones_donante_id_fkey`);
  await pool.query(`ALTER TABLE donaciones ADD CONSTRAINT donaciones_donante_id_fkey
    FOREIGN KEY (donante_id) REFERENCES personas_donantes(id) ON DELETE CASCADE`);
  console.log('✅ FK donaciones → personas_donantes creada correctamente.');

  // Migraciones adicionales para otras tablas
  const extras = [
    `ALTER TABLE desaparecidos ADD COLUMN IF NOT EXISTS foto TEXT`,
    `ALTER TABLE desaparecidos ADD COLUMN IF NOT EXISTS cedula VARCHAR(30)`,
    `ALTER TABLE rescatados ADD COLUMN IF NOT EXISTS foto TEXT`,
    `ALTER TABLE rescatados ADD COLUMN IF NOT EXISTS cedula VARCHAR(30)`,
    `ALTER TABLE equipos_rescate ADD COLUMN IF NOT EXISTS nacionalidad VARCHAR(100) DEFAULT 'No especificada'`,
    `ALTER TABLE equipos_rescate ADD COLUMN IF NOT EXISTS tiempo_llegada VARCHAR(100)`,
    `ALTER TABLE equipos_rescate ADD COLUMN IF NOT EXISTS contacto VARCHAR(200) DEFAULT 'Sin contacto'`,
  ];

  for (const sql of extras) {
    await pool.query(sql);
  }

  console.log('✅ Todas las tablas verificadas/creadas exitosamente.');
}

// ══════════════════════════════════════════════════════
//  INICIO DEL SERVIDOR
// ══════════════════════════════════════════════════════
async function iniciarServidor() {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL establecida con éxito.');
  } catch (err) {
    console.error('❌ Error crítico al conectar a PostgreSQL:', err.message);
    process.exit(1);
  }

  try {
    await crearTablas();
  } catch (err) {
    console.error('❌ Error en migraciones:', err.message);
    process.exit(1);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Servidor PROMIFAD corriendo en el puerto ${PORT}`));
}

// ══════════════════════════════════════════════════════
//  ENDPOINTS
// ══════════════════════════════════════════════════════

// ── DONANTES ──

app.get('/api/donantes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM personas_donantes ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("Error en GET /api/donantes:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/donantes', async (req, res) => {
  const { nombre, vulnerabilidad, saldo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO personas_donantes (nombre, vulnerabilidad, saldo) VALUES ($1, $2, $3) RETURNING *',
      [nombre, vulnerabilidad || 'Ninguna', saldo || 0]
    );
    await pool.query('INSERT INTO logs (entrada) VALUES ($1)', [`Nuevo donante registrado: ${nombre}`]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error en POST /api/donantes:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/donantes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM donaciones WHERE donante_id = $1', [id]);
    const result = await pool.query('DELETE FROM personas_donantes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length > 0) {
      await pool.query('INSERT INTO logs (entrada) VALUES ($1)', [`Donante eliminado: ${result.rows[0].nombre} (ID: ${id})`]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error en DELETE /api/donantes:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── DONACIONES (INSUMOS + MONETARIAS) ──

app.get('/api/donaciones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM donaciones ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("Error en GET /api/donaciones:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/donaciones', async (req, res) => {
  const { donante_id, objeto, cantidad, tipo, monto, moneda, motivo } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO donaciones (donante_id, objeto, cantidad, tipo, monto, moneda, motivo)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [donante_id, objeto, cantidad || 1, tipo || 'insumo', monto || 0, moneda || '$', motivo || null]
    );
    const etiqueta = tipo === 'monetaria'
      ? `Donación monetaria: ${moneda} ${monto} por donante ${donante_id}`
      : `Donación de insumos: ${cantidad || 1}x ${objeto} por donante ${donante_id}`;
    await pool.query('INSERT INTO logs (entrada) VALUES ($1)', [etiqueta]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error en POST /api/donaciones:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/donaciones/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM donaciones WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DESAPARECIDOS ──

app.get('/api/desaparecidos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM desaparecidos ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/desaparecidos', async (req, res) => {
  const { nombre, zona } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO desaparecidos (nombre, zona, ultima_vista) VALUES ($1, $2, NOW()) RETURNING *',
      [nombre, zona]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error en POST /api/desaparecidos:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── RESCATADOS ──

app.get('/api/rescatados', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rescatados ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rescatados', async (req, res) => {
  const { nombre, equipoAsociado, estadoSalud } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO rescatados (nombre, equipo_asociado, estado_salud, fecha_rescate) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [nombre, equipoAsociado || 'No asignado', estadoSalud || 'Estable']
    );
    await pool.query('INSERT INTO logs (entrada) VALUES ($1)', [`Persona rescatada registrada: ${nombre}`]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rescatados/:id/salud', async (req, res) => {
  const { id } = req.params;
  const { estadoSalud } = req.body;
  try {
    const result = await pool.query(
      'UPDATE rescatados SET estado_salud = $1 WHERE id = $2 RETURNING *',
      [estadoSalud, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Rescatado no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── EQUIPOS DE RESCATE ──

app.get('/api/equipos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipos_rescate ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/equipos', async (req, res) => {
  const { nombre, miembros, ubicacion, nacionalidad, tiempo_llegada, contacto } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO equipos_rescate (nombre, miembros, ubicacion, estado, nacionalidad, tiempo_llegada, contacto)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nombre, miembros, ubicacion || 'Sin ubicación', 'Disponible',
       nacionalidad || 'No especificada', tiempo_llegada || null, contacto || 'Sin contacto']
    );
    await pool.query('INSERT INTO logs (entrada) VALUES ($1)', [`Nuevo equipo registrado: ${nombre} (${nacionalidad || 'N/A'})`]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error en POST /api/equipos:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/equipos/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const result = await pool.query(
      'UPDATE equipos_rescate SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Equipo no encontrado' });
    await pool.query('INSERT INTO logs (entrada) VALUES ($1)', [`Equipo ${id} cambió a estado: ${estado}`]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/equipos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const eq = await pool.query('SELECT nombre FROM equipos_rescate WHERE id = $1', [id]);
    await pool.query('DELETE FROM equipos_rescate WHERE id = $1', [id]);
    if (eq.rows.length > 0) {
      await pool.query('INSERT INTO logs (entrada) VALUES ($1)', [`Equipo retirado: ${eq.rows[0].nombre} (${id})`]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── INDEMNIZACIONES ──

app.get('/api/indemnizaciones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM indemnizaciones ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PROYECTOS ──

app.get('/api/proyectos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proyectos_recuperacion ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── LOGS ──

app.get('/api/logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM logs ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logs', async (req, res) => {
  const { entrada } = req.body;
  try {
    const result = await pool.query('INSERT INTO logs (entrada) VALUES ($1) RETURNING *', [entrada]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── TRANSICIÓN: DESAPARECIDO → RESCATADO ──

app.post('/api/transiciones/rescatar', async (req, res) => {
  const { id, nombre, zona } = req.body;
  try {
    await pool.query('BEGIN');
    await pool.query('DELETE FROM desaparecidos WHERE id = $1', [id]);
    const result = await pool.query(
      'INSERT INTO rescatados (nombre, equipo_asociado, estado_salud) VALUES ($1, $2, $3) RETURNING *',
      [nombre, 'No asignado', 'Estable']
    );
    await pool.query('INSERT INTO logs (entrada) VALUES ($1)',
      [`Localizado: ${nombre} en la zona ${zona}. Transferido a censo de rescatados.`]);
    await pool.query('COMMIT');
    res.json({ success: true, nuevoId: result.rows[0].id });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// ── Iniciar servidor ──
iniciarServidor();
