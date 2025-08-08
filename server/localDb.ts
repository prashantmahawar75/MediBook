import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

// For local development, use SQLite if DATABASE_URL is not set
let db: any;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
  // Use PostgreSQL if DATABASE_URL is provided
  const { Pool, neonConfig } = await import('@neondatabase/serverless');
  const ws = await import('ws');
  
  neonConfig.webSocketConstructor = ws.default;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // Use SQLite for local development
  const sqlite = new Database('local.db');
  db = drizzle(sqlite, { schema });
  
  // Create tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expire DATETIME NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      first_name TEXT,
      last_name TEXT,
      profile_image_url TEXT,
      role TEXT NOT NULL DEFAULT 'patient',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS slots (
      id TEXT PRIMARY KEY,
      start_at DATETIME NOT NULL,
      end_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      slot_id TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (slot_id) REFERENCES slots (id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_session_expire ON sessions (expire);
  `);
}

export { db }; 