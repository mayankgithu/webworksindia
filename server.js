// Web Works India — website + CRM server
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { q, init, STAGES } = require('./db');
const { sendMail } = require('./mail');

const PORT = process.env.PORT || 3000;
const PROD = process.env.NODE_ENV === 'production' || !!process.env.RENDER;
const JWT_SECRET = process.env.JWT_SECRET || (PROD ? null : 'dev-secret-change-me');
if (!JWT_SECRET) { console.error('JWT_SECRET is not set. Add a long random value in Render → Environment.'); process.exit(1); }
const NOTIFY = (process.env.NOTIFY_EMAIL || '').trim();
const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());
app.use((req, res, next) => { res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN' }); next(); });

/* ---------- helpers ---------- */
const clean = (v, max = 500) => (v === undefined || v === null ? '' : String(v)).trim().slice(0, max);
const emailOk = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const digits = p => String(p || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, '');
const phoneOk = p => /^[6-9]\d{9}$/.test(digits(p));
const num = v => { if (v === '' || v === null || v === undefined) return null; const n = Number(String(v).replace(/[,₹\s]/g, '')); return Number.isFinite(n) && n >= 0 ? n : null; };
const date = v => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : null);
const id = v => parseInt(v, 10) || 0;
const bad = (res, msg, code = 400) => res.status(code).json({ error: msg });
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const limiter = (max, mins = 15) => rateLimit({ windowMs: mins * 60e3, max, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many attempts. Please wait a few minutes and try again.' } });
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const SOURCES = ['website', 'audit', 'manual', 'referral', 'justdial', 'instagram', 'google', 'whatsapp', 'other'];
const PROJECT_STATUS = ['planning', 'in_progress', 'review', 'live', 'on_hold', 'cancelled'];
const KINDS = ['note', 'call', 'whatsapp', 'meeting', 'email'];

function setSession(res, u) {
  res.cookie('wwi_token', jwt.sign({ id: u.id }, JWT_SECRET, { expiresIn: '14d' }), { httpOnly: true, sameSite: 'lax', secure: PROD, maxAge: 14 * 864e5, path: '/' });
}
async function currentUser(req) {
  const t = req.cookies.wwi_token; if (!t) return null;
  try {
    const { id: uid } = jwt.verify(t, JWT_SECRET);
    const { rows } = await q('SELECT id, role, name, email, phone, active FROM users WHERE id=$1', [uid]);
    return rows[0] && rows[0].active ? rows[0] : null;
  } catch { return null; }
}
const auth = (role) => wrap(async (req, res, next) => {
  const u = await currentUser(req);
  if (!u) return bad(res, 'Your session has ended. Log in again.', 401);
  if (role && u.role !== role) return bad(res, 'Only an admin can do this.', 403);
  req.user = u; next();
});
const log = (o) => q('INSERT INTO activities(lead_id, client_id, user_id, kind, body) VALUES ($1,$2,$3,$4,$5)', [o.lead || null, o.client || null, o.user || null, o.kind || 'system', o.body]);

/* ================= PUBLIC ================= */
app.post('/api/enquiry', limiter(10), wrap(async (req, res) => {
  const b = req.body || {};
  if (clean(b.company_site)) return res.json({ ok: true }); // honeypot
  const name = clean(b.name, 100), phone = clean(b.phone, 20), email = clean(b.email, 120).toLowerCase();
  if (!name) return bad(res, 'Enter your name.');
  if (!phoneOk(phone)) return bad(res, 'Enter a valid 10-digit mobile number.');
  if (email && !emailOk(email)) return bad(res, 'Enter a valid email address, or leave it empty.');
  const source = b.kind === 'audit' ? 'audit' : 'website';
  const r = await q(`INSERT INTO leads(name, phone, email, company, website, service, budget, message, source)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [name, digits(phone), email || null, clean(b.company, 150), clean(b.website, 200), clean(b.service, 120), clean(b.budget, 60), clean(b.message, 2000), source]);
  await log({ lead: r.rows[0].id, body: source === 'audit' ? 'Requested a free website audit from the website.' : 'Sent a project enquiry from the website.' });
  if (NOTIFY) sendMail({
    to: NOTIFY, subject: `New ${source === 'audit' ? 'audit request' : 'enquiry'}: ${name}`,
    html: `<h2 style="font-family:Arial">New ${source === 'audit' ? 'audit request' : 'enquiry'}</h2><table style="font-family:Arial;font-size:14px" cellpadding="6">${[['Name', name], ['Phone', digits(phone)], ['Email', email], ['Company', b.company], ['Website', b.website], ['Service', b.service], ['Budget', b.budget], ['Message', b.message]].filter(r => clean(r[1])).map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(clean(v, 2000))}</td></tr>`).join('')}</table>${SITE_URL ? `<p><a href="${SITE_URL}/crm/">Open CRM</a></p>` : ''}`,
    text: `${name} ${digits(phone)} ${email} ${clean(b.service)} ${clean(b.message)}`,
  });
  res.json({ ok: true });
}));

/* ================= AUTH ================= */
app.post('/api/auth/login', limiter(20), wrap(async (req, res) => {
  const email = clean(req.body?.email, 120).toLowerCase(), password = String(req.body?.password || '');
  const { rows } = await q('SELECT id, role, password_hash, active FROM users WHERE email=$1', [email]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(password, u.password_hash))) return bad(res, 'Email or password is incorrect.', 401);
  if (!u.active) return bad(res, 'This account is paused. Ask the admin to reactivate it.', 403);
  setSession(res, u); res.json({ ok: true });
}));
app.post('/api/auth/logout', (req, res) => { res.clearCookie('wwi_token', { path: '/' }); res.json({ ok: true }); });
app.get('/api/auth/me', wrap(async (req, res) => res.json({ user: await currentUser(req) })));
app.post('/api/auth/forgot', limiter(6), wrap(async (req, res) => {
  const email = clean(req.body?.email, 120).toLowerCase();
  const generic = { ok: true, message: 'If this email has a CRM account, a reset link is on its way. Check spam too.' };
  if (!emailOk(email)) return bad(res, 'Enter a valid email address.');
  const { rows } = await q('SELECT id, name FROM users WHERE email=$1 AND active', [email]);
  if (!rows[0]) return res.json(generic);
  const token = crypto.randomBytes(32).toString('hex');
  await q(`UPDATE users SET reset_hash=$1, reset_expires=now() + interval '30 minutes' WHERE id=$2`, [crypto.createHash('sha256').update(token).digest('hex'), rows[0].id]);
  const link = `${SITE_URL || `${req.protocol}://${req.get('host')}`}/crm/reset.html?token=${token}`;
  const sent = await sendMail({ to: email, subject: 'Reset your Web Works India CRM password', text: `Reset link (30 minutes): ${link}`,
    html: `<p style="font-family:Arial">Hi ${esc(rows[0].name)},</p><p style="font-family:Arial">Use this link within 30 minutes to set a new CRM password:</p><p><a style="font-family:Arial;background:#F38028;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none" href="${link}">Set a new password</a></p>` });
  if (!sent) console.log('[reset link — email not configured]', email, link);
  res.json(generic);
}));
app.post('/api/auth/reset', limiter(10), wrap(async (req, res) => {
  const password = String(req.body?.password || '');
  if (password.length < 8) return bad(res, 'Password must be at least 8 characters.');
  const hash = crypto.createHash('sha256').update(clean(req.body?.token, 100)).digest('hex');
  const { rows } = await q('SELECT id FROM users WHERE reset_hash=$1 AND reset_expires > now()', [hash]);
  if (!rows[0]) return bad(res, 'This link has expired or was already used. Request a new one.');
  await q('UPDATE users SET password_hash=$1, reset_hash=NULL, reset_expires=NULL WHERE id=$2', [await bcrypt.hash(password, 10), rows[0].id]);
  setSession(res, rows[0]); res.json({ ok: true });
}));
app.put('/api/me/password', auth(), wrap(async (req, res) => {
  const { current, next } = req.body || {};
  if (String(next || '').length < 8) return bad(res, 'New password must be at least 8 characters.');
  const { rows } = await q('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
  if (!(await bcrypt.compare(String(current || ''), rows[0].password_hash))) return bad(res, 'Current password is incorrect.');
  await q('UPDATE users SET password_hash=$1 WHERE id=$2', [await bcrypt.hash(String(next), 10), req.user.id]);
  res.json({ ok: true });
}));

/* ================= CRM ================= */
const crm = express.Router(); crm.use(auth());

crm.get('/meta', wrap(async (req, res) => {
  const { rows } = await q(`SELECT id, name, role FROM users WHERE active ORDER BY name`);
  res.json({ me: req.user, users: rows, stages: STAGES, sources: SOURCES, projectStatus: PROJECT_STATUS });
}));

crm.get('/stats', wrap(async (req, res) => {
  const { rows } = await q(`SELECT
    (SELECT COUNT(*)::int FROM leads WHERE stage='new') AS new_leads,
    (SELECT COUNT(*)::int FROM leads WHERE created_at >= date_trunc('month', now())) AS leads_month,
    (SELECT COUNT(*)::int FROM leads WHERE stage='won' AND updated_at >= date_trunc('month', now())) AS won_month,
    (SELECT COALESCE(SUM(value),0)::float FROM leads WHERE stage IN ('contacted','proposal','negotiation')) AS pipeline_value,
    (SELECT COUNT(*)::int FROM leads WHERE stage NOT IN ('won','lost') AND next_followup <= CURRENT_DATE) AS due_followups,
    (SELECT COALESCE(SUM(amount),0)::float FROM payments WHERE paid_on >= date_trunc('month', CURRENT_DATE)) AS received_month,
    (SELECT COALESCE(SUM(p.value),0)::float - COALESCE((SELECT SUM(amount) FROM payments x JOIN projects y ON y.id=x.project_id WHERE y.status <> 'cancelled'),0)::float FROM projects p WHERE p.status <> 'cancelled') AS outstanding,
    (SELECT COUNT(*)::int FROM projects WHERE status IN ('planning','in_progress','review')) AS active_projects,
    (SELECT COUNT(*)::int FROM leads WHERE stage='won') AS won_all,
    (SELECT COUNT(*)::int FROM leads WHERE stage IN ('won','lost')) AS closed_all`);
  const funnel = await q(`SELECT stage, COUNT(*)::int AS n, COALESCE(SUM(value),0)::float AS v FROM leads GROUP BY stage`);
  const months = await q(`SELECT to_char(m, 'Mon') AS label,
      (SELECT COUNT(*)::int FROM leads WHERE date_trunc('month', created_at) = m) AS leads,
      (SELECT COALESCE(SUM(amount),0)::float FROM payments WHERE date_trunc('month', paid_on) = m) AS received
    FROM generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') m`);
  const sources = await q(`SELECT source, COUNT(*)::int AS n FROM leads WHERE created_at >= now() - interval '90 days' GROUP BY source ORDER BY n DESC`);
  const renewals = await q(`SELECT p.id, p.title, p.domain, p.renewal_date, c.name AS client, c.id AS client_id FROM projects p JOIN clients c ON c.id=p.client_id
    WHERE p.renewal_date IS NOT NULL AND p.renewal_date <= CURRENT_DATE + 30 AND p.status <> 'cancelled' ORDER BY p.renewal_date LIMIT 10`);
  res.json({ ...rows[0], funnel: funnel.rows, months: months.rows, sources: sources.rows, renewals: renewals.rows });
}));

/* ---- leads ---- */
const LEAD_SELECT = `SELECT l.*, l.value::float AS value, u.name AS owner FROM leads l LEFT JOIN users u ON u.id=l.owner_id`;
crm.get('/leads', wrap(async (req, res) => {
  const w = [], p = [];
  if (STAGES.includes(req.query.stage)) { p.push(req.query.stage); w.push(`l.stage=$${p.length}`); }
  if (req.query.open === '1') w.push(`l.stage NOT IN ('won','lost')`);
  if (SOURCES.includes(req.query.source)) { p.push(req.query.source); w.push(`l.source=$${p.length}`); }
  if (req.query.owner === 'me') { p.push(req.user.id); w.push(`l.owner_id=$${p.length}`); }
  else if (id(req.query.owner)) { p.push(id(req.query.owner)); w.push(`l.owner_id=$${p.length}`); }
  if (req.query.due === '1') w.push(`l.next_followup <= CURRENT_DATE AND l.stage NOT IN ('won','lost')`);
  const s = clean(req.query.q, 80);
  if (s) { p.push(`%${s}%`); w.push(`(l.name ILIKE $${p.length} OR l.phone ILIKE $${p.length} OR l.email ILIKE $${p.length} OR l.company ILIKE $${p.length} OR l.service ILIKE $${p.length})`); }
  const order = req.query.due === '1' ? 'l.next_followup ASC' : 'l.updated_at DESC';
  const { rows } = await q(`${LEAD_SELECT} ${w.length ? 'WHERE ' + w.join(' AND ') : ''} ORDER BY ${order} LIMIT 1000`, p);
  res.json(rows);
}));
function leadInput(b) {
  const l = {
    name: clean(b.name, 100), phone: digits(clean(b.phone, 20)), email: clean(b.email, 120).toLowerCase(), company: clean(b.company, 150),
    website: clean(b.website, 200), service: clean(b.service, 120), budget: clean(b.budget, 60), message: clean(b.message, 2000),
    source: SOURCES.includes(b.source) ? b.source : 'manual', value: num(b.value), owner_id: id(b.owner_id) || null,
    next_followup: date(b.next_followup),
  };
  if (!l.name) return { err: 'Enter the lead\'s name.' };
  if (l.phone && !phoneOk(l.phone)) return { err: 'Phone must be a valid 10-digit mobile number.' };
  if (l.email && !emailOk(l.email)) return { err: 'Email looks wrong.' };
  return { l };
}
crm.post('/leads', wrap(async (req, res) => {
  const { l, err } = leadInput(req.body || {}); if (err) return bad(res, err);
  const r = await q(`INSERT INTO leads(name,phone,email,company,website,service,budget,message,source,value,owner_id,next_followup)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
    [l.name, l.phone || null, l.email || null, l.company, l.website, l.service, l.budget, l.message, l.source, l.value, l.owner_id || req.user.id, l.next_followup]);
  await log({ lead: r.rows[0].id, user: req.user.id, body: `Lead added by ${req.user.name}.` });
  res.json({ ok: true, id: r.rows[0].id });
}));
crm.get('/leads/:id', wrap(async (req, res) => {
  const { rows } = await q(`${LEAD_SELECT} WHERE l.id=$1`, [id(req.params.id)]);
  if (!rows[0]) return bad(res, 'Lead not found.', 404);
  const a = await q(`SELECT a.*, u.name AS user_name FROM activities a LEFT JOIN users u ON u.id=a.user_id WHERE a.lead_id=$1 ORDER BY a.created_at DESC`, [rows[0].id]);
  res.json({ ...rows[0], activities: a.rows });
}));
crm.put('/leads/:id', wrap(async (req, res) => {
  const { l, err } = leadInput(req.body || {}); if (err) return bad(res, err);
  const r = await q(`UPDATE leads SET name=$1,phone=$2,email=$3,company=$4,website=$5,service=$6,budget=$7,message=$8,source=$9,value=$10,owner_id=$11,next_followup=$12,updated_at=now() WHERE id=$13 RETURNING id`,
    [l.name, l.phone || null, l.email || null, l.company, l.website, l.service, l.budget, l.message, l.source, l.value, l.owner_id, l.next_followup, id(req.params.id)]);
  if (!r.rows.length) return bad(res, 'Lead not found.', 404);
  res.json({ ok: true });
}));
crm.patch('/leads/:id', wrap(async (req, res) => {
  const b = req.body || {}, lid = id(req.params.id);
  const cur = await q('SELECT stage, owner_id FROM leads WHERE id=$1', [lid]);
  if (!cur.rows[0]) return bad(res, 'Lead not found.', 404);
  if (b.stage !== undefined) {
    if (!STAGES.includes(b.stage)) return bad(res, 'Unknown stage.');
    if (b.stage !== cur.rows[0].stage) {
      await q(`UPDATE leads SET stage=$1, lost_reason=$2, updated_at=now() WHERE id=$3`, [b.stage, b.stage === 'lost' ? clean(b.lost_reason, 300) || null : null, lid]);
      await log({ lead: lid, user: req.user.id, body: `Moved from ${cur.rows[0].stage} to ${b.stage}${b.stage === 'lost' && clean(b.lost_reason) ? ` (${clean(b.lost_reason, 300)})` : ''}.` });
    }
  }
  if (b.next_followup !== undefined) { await q('UPDATE leads SET next_followup=$1, updated_at=now() WHERE id=$2', [date(b.next_followup), lid]); }
  if (b.owner_id !== undefined) {
    const oid = id(b.owner_id) || null;
    await q('UPDATE leads SET owner_id=$1, updated_at=now() WHERE id=$2', [oid, lid]);
    if (oid !== cur.rows[0].owner_id) { const n = oid ? (await q('SELECT name FROM users WHERE id=$1', [oid])).rows[0]?.name : 'nobody'; await log({ lead: lid, user: req.user.id, body: `Assigned to ${n}.` }); }
  }
  if (b.value !== undefined) await q('UPDATE leads SET value=$1, updated_at=now() WHERE id=$2', [num(b.value), lid]);
  res.json({ ok: true });
}));
crm.delete('/leads/:id', auth('admin'), wrap(async (req, res) => { await q('DELETE FROM leads WHERE id=$1', [id(req.params.id)]); res.json({ ok: true }); }));
crm.post('/leads/:id/activities', wrap(async (req, res) => {
  const body = clean(req.body?.body, 3000); if (!body) return bad(res, 'Write something first.');
  const kind = KINDS.includes(req.body?.kind) ? req.body.kind : 'note', lid = id(req.params.id);
  await log({ lead: lid, user: req.user.id, kind, body });
  const nf = date(req.body?.next_followup);
  await q(`UPDATE leads SET updated_at=now() ${nf ? ', next_followup=$2' : ''} ${req.body?.mark_contacted ? ", stage=CASE WHEN stage='new' THEN 'contacted' ELSE stage END" : ''} WHERE id=$1`, nf ? [lid, nf] : [lid]);
  res.json({ ok: true });
}));
crm.post('/leads/:id/convert', wrap(async (req, res) => {
  const lid = id(req.params.id), b = req.body || {};
  const { rows } = await q('SELECT * FROM leads WHERE id=$1', [lid]);
  const l = rows[0]; if (!l) return bad(res, 'Lead not found.', 404);
  let clientId = l.client_id;
  if (!clientId) {
    const c = await q(`INSERT INTO clients(name, company, phone, email) VALUES ($1,$2,$3,$4) RETURNING id`, [l.name, l.company, l.phone, l.email]);
    clientId = c.rows[0].id;
  }
  const title = clean(b.title, 150) || l.service || 'New project';
  const value = num(b.value) ?? (l.value ? Number(l.value) : 0);
  const p = await q(`INSERT INTO projects(client_id, title, service, value, status, start_date, due_date, owner_id) VALUES ($1,$2,$3,$4,'planning',$5,$6,$7) RETURNING id`,
    [clientId, title, l.service, value, date(b.start_date) || new Date().toISOString().slice(0, 10), date(b.due_date), l.owner_id || req.user.id]);
  await q(`UPDATE leads SET stage='won', client_id=$1, value=COALESCE(value,$2), updated_at=now() WHERE id=$3`, [clientId, value, lid]);
  await log({ lead: lid, user: req.user.id, body: `Won. Converted to client with project "${title}".` });
  await log({ client: clientId, user: req.user.id, body: `Client created from lead. Project "${title}" started.` });
  const adv = num(b.advance);
  if (adv) await q(`INSERT INTO payments(project_id, amount, method, note, created_by) VALUES ($1,$2,$3,'Advance',$4)`, [p.rows[0].id, adv, clean(b.method, 40) || null, req.user.id]);
  res.json({ ok: true, client_id: clientId, project_id: p.rows[0].id });
}));

/* ---- clients ---- */
crm.get('/clients', wrap(async (req, res) => {
  const s = clean(req.query.q, 80);
  const { rows } = await q(`SELECT c.*,
      (SELECT COUNT(*)::int FROM projects p WHERE p.client_id=c.id) AS projects,
      (SELECT COALESCE(SUM(p.value),0)::float FROM projects p WHERE p.client_id=c.id AND p.status <> 'cancelled') AS billed,
      (SELECT COALESCE(SUM(x.amount),0)::float FROM payments x JOIN projects p ON p.id=x.project_id WHERE p.client_id=c.id) AS paid
    FROM clients c ${s ? `WHERE c.name ILIKE $1 OR c.company ILIKE $1 OR c.phone ILIKE $1 OR c.email ILIKE $1` : ''} ORDER BY c.created_at DESC LIMIT 1000`, s ? [`%${s}%`] : []);
  res.json(rows);
}));
function clientInput(b) {
  const c = { name: clean(b.name, 100), company: clean(b.company, 150), phone: digits(clean(b.phone, 20)), email: clean(b.email, 120).toLowerCase(), gstin: clean(b.gstin, 20).toUpperCase(), address: clean(b.address, 400), notes: clean(b.notes, 2000) };
  if (!c.name) return { err: 'Enter the client\'s name.' };
  if (c.phone && !phoneOk(c.phone)) return { err: 'Phone must be a valid 10-digit mobile number.' };
  if (c.email && !emailOk(c.email)) return { err: 'Email looks wrong.' };
  return { c };
}
crm.post('/clients', wrap(async (req, res) => {
  const { c, err } = clientInput(req.body || {}); if (err) return bad(res, err);
  const r = await q(`INSERT INTO clients(name,company,phone,email,gstin,address,notes) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`, [c.name, c.company, c.phone || null, c.email || null, c.gstin, c.address, c.notes]);
  await log({ client: r.rows[0].id, user: req.user.id, body: `Client added by ${req.user.name}.` });
  res.json({ ok: true, id: r.rows[0].id });
}));
crm.get('/clients/:id', wrap(async (req, res) => {
  const cid = id(req.params.id);
  const c = await q('SELECT * FROM clients WHERE id=$1', [cid]); if (!c.rows[0]) return bad(res, 'Client not found.', 404);
  const p = await q(`SELECT p.*, p.value::float AS value, u.name AS owner,
      (SELECT COALESCE(SUM(amount),0)::float FROM payments x WHERE x.project_id=p.id) AS paid
    FROM projects p LEFT JOIN users u ON u.id=p.owner_id WHERE p.client_id=$1 ORDER BY p.created_at DESC`, [cid]);
  const pay = await q(`SELECT x.*, x.amount::float AS amount, p.title AS project FROM payments x JOIN projects p ON p.id=x.project_id WHERE p.client_id=$1 ORDER BY x.paid_on DESC, x.id DESC`, [cid]);
  const a = await q(`SELECT a.*, u.name AS user_name FROM activities a LEFT JOIN users u ON u.id=a.user_id WHERE a.client_id=$1 ORDER BY a.created_at DESC LIMIT 200`, [cid]);
  res.json({ ...c.rows[0], projects: p.rows, payments: pay.rows, activities: a.rows });
}));
crm.put('/clients/:id', wrap(async (req, res) => {
  const { c, err } = clientInput(req.body || {}); if (err) return bad(res, err);
  await q(`UPDATE clients SET name=$1,company=$2,phone=$3,email=$4,gstin=$5,address=$6,notes=$7 WHERE id=$8`, [c.name, c.company, c.phone || null, c.email || null, c.gstin, c.address, c.notes, id(req.params.id)]);
  res.json({ ok: true });
}));
crm.delete('/clients/:id', auth('admin'), wrap(async (req, res) => { await q('UPDATE leads SET client_id=NULL WHERE client_id=$1', [id(req.params.id)]); await q('DELETE FROM clients WHERE id=$1', [id(req.params.id)]); res.json({ ok: true }); }));
crm.post('/clients/:id/activities', wrap(async (req, res) => {
  const body = clean(req.body?.body, 3000); if (!body) return bad(res, 'Write something first.');
  await log({ client: id(req.params.id), user: req.user.id, kind: KINDS.includes(req.body?.kind) ? req.body.kind : 'note', body });
  res.json({ ok: true });
}));

/* ---- projects & payments ---- */
crm.get('/projects', wrap(async (req, res) => {
  const st = PROJECT_STATUS.includes(req.query.status) ? req.query.status : null;
  const { rows } = await q(`SELECT p.*, p.value::float AS value, c.name AS client, u.name AS owner,
      (SELECT COALESCE(SUM(amount),0)::float FROM payments x WHERE x.project_id=p.id) AS paid
    FROM projects p JOIN clients c ON c.id=p.client_id LEFT JOIN users u ON u.id=p.owner_id
    ${st ? 'WHERE p.status=$1' : req.query.active === '1' ? `WHERE p.status IN ('planning','in_progress','review')` : ''}
    ORDER BY CASE WHEN p.status IN ('planning','in_progress','review') THEN 0 ELSE 1 END, p.due_date NULLS LAST, p.created_at DESC LIMIT 1000`, st ? [st] : []);
  res.json(rows);
}));
function projectInput(b) {
  const p = { title: clean(b.title, 150), service: clean(b.service, 120), value: num(b.value) ?? 0, status: PROJECT_STATUS.includes(b.status) ? b.status : 'planning',
    start_date: date(b.start_date), due_date: date(b.due_date), domain: clean(b.domain, 150), renewal_date: date(b.renewal_date), owner_id: id(b.owner_id) || null, notes: clean(b.notes, 2000) };
  if (!p.title) return { err: 'Enter a project title.' };
  return { p };
}
crm.post('/clients/:id/projects', wrap(async (req, res) => {
  const { p, err } = projectInput(req.body || {}); if (err) return bad(res, err);
  const cid = id(req.params.id);
  const r = await q(`INSERT INTO projects(client_id,title,service,value,status,start_date,due_date,domain,renewal_date,owner_id,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    [cid, p.title, p.service, p.value, p.status, p.start_date, p.due_date, p.domain, p.renewal_date, p.owner_id, p.notes]);
  await log({ client: cid, user: req.user.id, body: `Project "${p.title}" added.` });
  res.json({ ok: true, id: r.rows[0].id });
}));
crm.put('/projects/:id', wrap(async (req, res) => {
  const { p, err } = projectInput(req.body || {}); if (err) return bad(res, err);
  const pid = id(req.params.id);
  const old = await q('SELECT client_id, status FROM projects WHERE id=$1', [pid]); if (!old.rows[0]) return bad(res, 'Project not found.', 404);
  await q(`UPDATE projects SET title=$1,service=$2,value=$3,status=$4,start_date=$5,due_date=$6,domain=$7,renewal_date=$8,owner_id=$9,notes=$10 WHERE id=$11`,
    [p.title, p.service, p.value, p.status, p.start_date, p.due_date, p.domain, p.renewal_date, p.owner_id, p.notes, pid]);
  if (old.rows[0].status !== p.status) await log({ client: old.rows[0].client_id, user: req.user.id, body: `"${p.title}" moved to ${p.status.replace('_', ' ')}.` });
  res.json({ ok: true });
}));
crm.delete('/projects/:id', auth('admin'), wrap(async (req, res) => { await q('DELETE FROM projects WHERE id=$1', [id(req.params.id)]); res.json({ ok: true }); }));
crm.post('/projects/:id/payments', wrap(async (req, res) => {
  const pid = id(req.params.id), amount = num(req.body?.amount);
  if (!amount) return bad(res, 'Enter the amount received.');
  const pr = await q('SELECT client_id, title FROM projects WHERE id=$1', [pid]); if (!pr.rows[0]) return bad(res, 'Project not found.', 404);
  await q(`INSERT INTO payments(project_id, amount, paid_on, method, note, created_by) VALUES ($1,$2,COALESCE($3::date, CURRENT_DATE),$4,$5,$6)`, [pid, amount, date(req.body?.paid_on), clean(req.body?.method, 40) || null, clean(req.body?.note, 300) || null, req.user.id]);
  await log({ client: pr.rows[0].client_id, user: req.user.id, body: `Payment of ₹${amount.toLocaleString('en-IN')} recorded for "${pr.rows[0].title}".` });
  res.json({ ok: true });
}));
crm.delete('/payments/:id', auth('admin'), wrap(async (req, res) => { await q('DELETE FROM payments WHERE id=$1', [id(req.params.id)]); res.json({ ok: true }); }));
crm.get('/payments', wrap(async (req, res) => {
  const { rows } = await q(`SELECT x.*, x.amount::float AS amount, p.title AS project, c.name AS client, c.id AS client_id, u.name AS by_name FROM payments x JOIN projects p ON p.id=x.project_id JOIN clients c ON c.id=p.client_id LEFT JOIN users u ON u.id=x.created_by ORDER BY x.paid_on DESC, x.id DESC LIMIT 500`);
  res.json(rows);
}));

/* ---- team (admin) ---- */
crm.get('/users', auth('admin'), wrap(async (req, res) => {
  const { rows } = await q(`SELECT u.id, u.name, u.email, u.phone, u.role, u.active, u.created_at,
    (SELECT COUNT(*)::int FROM leads l WHERE l.owner_id=u.id AND l.stage NOT IN ('won','lost')) AS open_leads FROM users u ORDER BY u.created_at`);
  res.json(rows);
}));
crm.post('/users', auth('admin'), wrap(async (req, res) => {
  const name = clean(req.body?.name, 100), email = clean(req.body?.email, 120).toLowerCase();
  if (!name) return bad(res, 'Enter a name.'); if (!emailOk(email)) return bad(res, 'Enter a valid email.');
  const temp = 'WWI-' + crypto.randomBytes(4).toString('hex');
  try { await q(`INSERT INTO users(role,name,email,phone,password_hash) VALUES ($1,$2,$3,$4,$5)`, [req.body?.role === 'admin' ? 'admin' : 'staff', name, email, digits(req.body?.phone) || null, await bcrypt.hash(temp, 10)]); }
  catch (e) { if (e.code === '23505') return bad(res, 'Someone with this email already has an account.'); throw e; }
  res.json({ ok: true, password: temp });
}));
crm.patch('/users/:id', auth('admin'), wrap(async (req, res) => {
  const uid = id(req.params.id);
  if (uid === req.user.id) return bad(res, 'You can\'t change your own role or pause yourself.');
  if (req.body?.active !== undefined) await q('UPDATE users SET active=$1 WHERE id=$2', [!!req.body.active, uid]);
  if (['admin', 'staff'].includes(req.body?.role)) await q('UPDATE users SET role=$1 WHERE id=$2', [req.body.role, uid]);
  res.json({ ok: true });
}));
crm.post('/users/:id/reset', auth('admin'), wrap(async (req, res) => {
  const temp = 'WWI-' + crypto.randomBytes(4).toString('hex');
  await q('UPDATE users SET password_hash=$1 WHERE id=$2', [await bcrypt.hash(temp, 10), id(req.params.id)]);
  res.json({ ok: true, password: temp });
}));

/* ---- CSV export (admin) ---- */
crm.get('/export/:what', auth('admin'), wrap(async (req, res) => {
  const sql = {
    leads: `SELECT l.id, l.created_at::date AS date, l.name, l.phone, l.email, l.company, l.service, l.budget, l.source, l.stage, l.value, u.name AS owner, l.next_followup, l.message FROM leads l LEFT JOIN users u ON u.id=l.owner_id ORDER BY l.id`,
    clients: `SELECT c.id, c.created_at::date AS date, c.name, c.company, c.phone, c.email, c.gstin, c.address FROM clients c ORDER BY c.id`,
    payments: `SELECT x.paid_on, c.name AS client, p.title AS project, x.amount, x.method, x.note FROM payments x JOIN projects p ON p.id=x.project_id JOIN clients c ON c.id=p.client_id ORDER BY x.paid_on`,
  }[req.params.what];
  if (!sql) return bad(res, 'Unknown export.', 404);
  const { rows, fields } = await q(sql);
  const cell = v => { if (v === null || v === undefined) return ''; const s = v instanceof Date ? v.toISOString().slice(0, 10) : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = [fields.map(f => f.name).join(','), ...rows.map(r => fields.map(f => cell(r[f.name])).join(','))].join('\n');
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="wwi-${req.params.what}-${new Date().toISOString().slice(0, 10)}.csv"` }).send('﻿' + csv);
}));

app.use('/api/crm', crm);

/* ---------- pages ---------- */
app.get('/healthz', (req, res) => res.type('text').send('ok'));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: PROD ? '1h' : 0, setHeaders: (res, p) => { if (p.includes(`${path.sep}crm${path.sep}`)) res.set('X-Robots-Tag', 'noindex'); } }));
app.use('/api', (req, res) => bad(res, 'Not found.', 404));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));
app.use((err, req, res, next) => { console.error(err); if (req.path.startsWith('/api')) return bad(res, 'Something went wrong on the server. Try again.', 500); res.status(500).send('Server error'); });

init().then(() => app.listen(PORT, () => console.log(`Web Works India running on :${PORT}`)))
  .catch(e => { console.error('Database setup failed:', e.message); process.exit(1); });
