import db from "./db";

db.exec(`
CREATE TABLE IF NOT EXISTS trabajadores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dni TEXT UNIQUE,
  nombre TEXT,
  apellido TEXT,
  cargo TEXT,
  area TEXT,
  email TEXT,
  telefono TEXT,
  fecha_ingreso TEXT,
  activo INTEGER DEFAULT 1,
  foto_url TEXT,
  password TEXT
);

CREATE TABLE IF NOT EXISTS gerentes (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  nombre TEXT,
  password TEXT,
  activo INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asistencias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trabajador_id INTEGER,
  fecha TEXT,
  hora_ingreso TEXT,
  hora_salida TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id)
);

CREATE TABLE IF NOT EXISTS eventos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trabajador_id INTEGER,
  tipo TEXT,
  fecha_inicio TEXT,
  fecha_fin TEXT,
  hora_inicio TEXT,
  hora_fin TEXT,
  todo_el_dia INTEGER DEFAULT 1,
  descripcion TEXT,
  creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TEXT DEFAULT CURRENT_TIMESTAMP,
  creado_por TEXT,
  color TEXT,
  FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id)
);
`);