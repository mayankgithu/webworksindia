// PostgreSQL (free Neon.tech database works well with Render)
const { Pool, types } = require('pg');
types.setTypeParser(1082, v => v); // DATE stays 'YYYY-MM-DD' (no timezone shift)
const bcrypt = require('bcryptjs');

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL is not set. Add it in Render → Environment.'); process.exit(1); }
const pool = new Pool({
  connectionString: url,
  ssl: /localhost|127\.0\.0\.1|host=\/tmp/.test(url) || process.env.PGSSL === 'off' ? false : { rejectUnauthorized: false },
  max: 5,
});
pool.on('connect', c => c.query("SET TIME ZONE 'Asia/Kolkata'"));
const q = (text, params) => pool.query(text, params);

const STAGES = ['new', 'contacted', 'proposal', 'negotiation', 'won', 'lost'];

async function init() {
  await q(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      role TEXT NOT NULL DEFAULT 'staff',            -- admin | staff
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      password_hash TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      reset_hash TEXT, reset_expires TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      company TEXT,
      website TEXT,
      service TEXT,
      budget TEXT,
      message TEXT,
      source TEXT NOT NULL DEFAULT 'website',       -- website | audit | manual | referral | justdial | instagram | other
      stage TEXT NOT NULL DEFAULT 'new',
      value NUMERIC(12,2),
      owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      next_followup DATE,
      lost_reason TEXT,
      client_id INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      email TEXT,
      gstin TEXT,
      address TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      service TEXT,
      value NUMERIC(12,2) NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'planning',      -- planning | in_progress | review | live | on_hold | cancelled
      start_date DATE,
      due_date DATE,
      domain TEXT,
      renewal_date DATE,
      owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      amount NUMERIC(12,2) NOT NULL,
      paid_on DATE NOT NULL DEFAULT CURRENT_DATE,
      method TEXT,
      note TEXT,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
      client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      kind TEXT NOT NULL DEFAULT 'note',            -- note | call | whatsapp | meeting | email | system
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_leads_follow ON leads(next_followup);
    CREATE INDEX IF NOT EXISTS idx_act_lead ON activities(lead_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_act_client ON activities(client_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_proj_client ON projects(client_id);
    CREATE INDEX IF NOT EXISTS idx_pay_proj ON payments(project_id);
  `);

  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const pass = process.env.ADMIN_PASSWORD || '';
  if (email && pass) {
    const ex = await q('SELECT id FROM users WHERE email=$1', [email]);
    if (!ex.rows.length) {
      await q(`INSERT INTO users(role,name,email,password_hash) VALUES ('admin',$1,$2,$3)`, [process.env.ADMIN_NAME || 'Admin', email, await bcrypt.hash(pass, 10)]);
      console.log('Admin account created for', email);
    } else if (process.env.ADMIN_RESET === '1') {
      await q(`UPDATE users SET password_hash=$2, role='admin', active=TRUE WHERE email=$1`, [email, await bcrypt.hash(pass, 10)]);
      console.log('Admin password reset from ADMIN_PASSWORD');
    }
  } else console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set — no admin account yet.');
}

module.exports = { pool, q, init, STAGES };
