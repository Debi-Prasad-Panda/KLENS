import pg from 'pg';
import { createClient } from 'redis';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on('error', (err) => console.error('Redis error:', err));

export async function initDatabase() {
  await redis.connect();
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      department VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_type VARCHAR(50) NOT NULL,
      file_size INTEGER NOT NULL,
      uploaded_by INTEGER REFERENCES users(id),
      status VARCHAR(50) DEFAULT 'processing',
      ocr_text TEXT,
      ai_summary TEXT,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS document_versions (
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id),
      version INTEGER NOT NULL,
      content TEXT,
      changed_by INTEGER REFERENCES users(id),
      commit_message TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      action VARCHAR(50) NOT NULL,
      resource_type VARCHAR(50) NOT NULL,
      resource_id INTEGER,
      details JSONB,
      ip_address VARCHAR(45),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS approvals (
      id SERIAL PRIMARY KEY,
      action_type VARCHAR(100) NOT NULL,
      resource_id INTEGER,
      required_approvals INTEGER DEFAULT 2,
      approvers JSONB,
      status VARCHAR(50) DEFAULT 'pending',
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      completed_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS iot_sensors (
      id SERIAL PRIMARY KEY,
      sensor_id VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      sensor_type VARCHAR(50) NOT NULL,
      thresholds JSONB,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS iot_readings (
      id SERIAL PRIMARY KEY,
      sensor_id VARCHAR(100) REFERENCES iot_sensors(sensor_id),
      reading_type VARCHAR(50) NOT NULL,
      value NUMERIC NOT NULL,
      unit VARCHAR(20),
      timestamp TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_iot_readings_sensor ON iot_readings(sensor_id, timestamp);
  `);
}
