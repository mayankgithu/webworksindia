/* Web Works India — CRM app */
(async () => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = n => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');
  const short = n => { n = Number(n) || 0; return n >= 1e7 ? `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, '')}Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1).replace(/\.0$/, '')}L` : n >= 1e3 ? `₹${(n / 1e3).toFixed(1).replace(/\.0$/, '')}k` : inr(n); };
  const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const fmtDate = d => d ? new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: d.slice(0, 4) === String(new Date().getFullYear()) ? undefined : 'numeric' }) : '';
  const ago = d => { const s = (Date.now() - new Date(d)) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago'; if (s < 86400) return Math.floor(s / 3600) + ' hr ago'; const n = Math.floor(s / 86400); return n === 1 ? 'yesterday' : n < 30 ? n + ' days ago' : fmtDate(new Date(d).toISOString().slice(0, 10)); };
  const dueTag = d => { if (!d) return ''; const t = today(); return d < t ? `<span class="due">Overdue · ${fmtDate(d)}</span>` : d === t ? `<span class="today">Today</span>` : `<span>${fmtDate(d)}</span>`; };
  const wa = (phone, text = '') => `https://wa.me/91${phone}${text ? '?text=' + encodeURIComponent(text) : ''}`;
  const first = n => String(n || '').split(' ')[0];

  async function api(path, opts = {}) {
    const o = { method: opts.method || (opts.body ? 'POST' : 'GET'), headers: {} };
    if (opts.body) { o.headers['content-type'] = 'application/json'; o.body = JSON.stringify(opts.body); }
    let r; try { r = await fetch('/api' + path, o); } catch { throw new Error('No connection to the server. Check your internet.'); }
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) { location.href = '/crm/' + location.hash; throw new Error('Session ended.'); }
    if (!r.ok) throw new Error(j.error || 'Something went wrong.');
    return j;
  }
  function toast(m, bad) { let b = $('.toasts'); if (!b) { b = document.createElement('div'); b.className = 'toasts'; b.setAttribute('role', 'status'); document.body.append(b); } const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = m; b.append(t); setTimeout(() => t.remove(), 3500); }
  const formData = f => Object.fromEntries(new FormData(f));
  function formErr(f, m) { f.querySelector('.err')?.remove(); if (!m) return; const p = document.createElement('p'); p.className = 'err'; p.setAttribute('role', 'alert'); p.textContent = m; f.prepend(p); p.scrollIntoView({ block: 'nearest' }); }
  async function submit(f, fn) { const b = f.querySelector('button[type=submit]'); b && (b.disabled = true); try { formErr(f); await fn(); } catch (e) { formErr(f, e.message); } finally { b && (b.disabled = false); } }

  /* ---------- boot ---------- */
  let META;
  try { META = await api('/crm/meta'); } catch { return; }
  const ME = META.me, ADMIN = ME.role === 'admin';
  const STAGE_LABEL = { new: 'New', contacted: 'Contacted', proposal: 'Proposal sent', negotiation: 'Negotiation', won: 'Won', lost: 'Lost' };
  const SRC_LABEL = { website: 'Website', audit: 'Audit request', manual: 'Added manually', referral: 'Referral', justdial: 'Justdial', instagram: 'Instagram', google: 'Google', whatsapp: 'WhatsApp', other: 'Other' };
  const PST_LABEL = { planning: 'Planning', in_progress: 'In progress', review: 'Client review', live: 'Live', on_hold: 'On hold', cancelled: 'Cancelled' };
  const SERVICES = ['Business websites', 'E-commerce stores', 'Custom web apps and SaaS', 'ERP and CRM software', 'SEO and local search', 'WhatsApp and business automation', 'UI/UX design', 'Hosting, maintenance and security'];
  const badge = (k, map) => `<span class="badge b-${k}">${esc(map[k] || k)}</span>`;
  const userOpts = (sel, none = 'Unassigned') => `<option value="">${none}</option>` + META.users.map(u => `<option value="${u.id}"${String(u.id) === String(sel) ? ' selected' : ''}>${esc(u.name)}</option>`).join('');
  const opts = (map, sel) => Object.entries(map).map(([k, v]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${esc(v)}</option>`).join('');

  const IC = {
    dash: '<path d="M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z"/>', leads: '<path d="M4 4h4v16H4zM10 4h4v11h-4zM16 4h4v7h-4z"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
    clients: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6M22 20a6 6 0 0 0-5-6"/>', proj: '<path d="M3 7h18v13H3zM8 7V4h8v3"/>', pay: '<path d="M3 6h18v12H3zM3 10h18M7 15h3"/>',
    team: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', set: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z"/>',
    phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  };
  const svg = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;
  const NAV = [['dashboard', 'Dashboard', 'dash'], ['leads', 'Leads', 'leads'], ['followups', 'Follow-ups', 'bell'], ['clients', 'Clients', 'clients'], ['projects', 'Projects', 'proj'], ['payments', 'Payments', 'pay']]
    .concat(ADMIN ? [['team', 'Team', 'team']] : []).concat([['settings', 'Settings', 'set']]);
  $('#nav').innerHTML = NAV.map(([k, t, i]) => `<a href="#/${k}" data-k="${k}">${svg(i)}${t}${k === 'followups' ? '<span class="count" id="dueCount" hidden></span>' : ''}</a>`).join('');
  $('#me').innerHTML = `<b>${esc(ME.name)}</b>${ADMIN ? 'Admin' : 'Team member'} · <a href="#" id="logout">Log out</a>`;
  $('#logout').onclick = async e => { e.preventDefault(); await fetch('/api/auth/logout', { method: 'POST' }); location.href = '/crm/'; };
  $('#menuBtn').onclick = () => document.body.classList.toggle('nav-open');
  async function refreshDue() { try { const s = await api('/crm/stats'); const c = $('#dueCount'); c.hidden = !s.due_followups; c.textContent = s.due_followups; return s; } catch { } }

  /* ---------- drawer ---------- */
  const drawer = $('#drawer');
  function openDrawer(title, sub, html) { $('#dTitle').textContent = title; $('#dSub').innerHTML = sub || ''; $('#dBody').innerHTML = html; drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; $('#dBody').scrollTop = 0; return $('#dBody'); }
  function closeDrawer() { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  $('.close', drawer).onclick = closeDrawer;
  drawer.addEventListener('click', e => { if (e.target === drawer) closeDrawer(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer(); });

  /* ---------- router ---------- */
  const view = $('#view');
  const routes = { dashboard, leads, followups, clients, projects, payments, team, settings };
  async function route() {
    const [, name = 'dashboard', arg] = location.hash.split('/');
    const fn = routes[name] && (name !== 'team' || ADMIN) ? routes[name] : dashboard;
    $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.k === name));
    document.body.classList.remove('nav-open');
    view.innerHTML = '<p class="note">Loading…</p>';
    try { await fn(arg); } catch (e) { view.innerHTML = `<div class="card empty"><b>Couldn't load this page.</b>${esc(e.message)}</div>`; }
    refreshDue();
  }
  addEventListener('hashchange', route);
  const reload = () => route();

  /* ---------- tooltip for charts ---------- */
  const tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; document.body.append(tip);
  document.addEventListener('pointerover', e => { const t = e.target.closest('[data-tip]'); if (!t) return; tip.textContent = t.dataset.tip; tip.hidden = false; const r = t.getBoundingClientRect(); tip.style.left = r.left + r.width / 2 + 'px'; tip.style.top = r.top + 'px'; });
  document.addEventListener('pointerout', e => { if (e.target.closest('[data-tip]')) tip.hidden = true; });
  ['pointerdown', 'scroll', 'hashchange'].forEach(ev => addEventListener(ev, () => tip.hidden = true, { passive: true, capture: true }));

  /* ================= DASHBOARD ================= */
  async function dashboard() {
    const [s, due] = await Promise.all([api('/crm/stats'), api('/crm/leads?due=1')]);
    const conv = s.closed_all ? Math.round(s.won_all / s.closed_all * 100) : null;
    const maxL = Math.max(1, ...s.months.map(m => m.leads)), maxR = Math.max(1, ...s.months.map(m => m.received));
    const fun = META.stages.map(k => s.funnel.find(f => f.stage === k) || { stage: k, n: 0, v: 0 });
    const maxF = Math.max(1, ...fun.map(f => f.n));
    const hour = new Date().getHours();
    view.innerHTML = `
      <div class="top"><div><h1>Good ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, ${esc(first(ME.name))}</h1><div class="sub">${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div></div>
        <div class="tools"><button class="btn" id="addLead">${svg('plus')}Add lead</button></div></div>
      <div class="stats">
        <a class="stat${s.due_followups ? ' stat--hot' : ''}" href="#/followups"><span>Follow-ups due</span><b>${s.due_followups}</b><small>today and overdue</small></a>
        <a class="stat${s.new_leads ? ' stat--hot' : ''}" href="#/leads"><span>New leads</span><b>${s.new_leads}</b><small>not contacted yet</small></a>
        <div class="stat"><span>Leads this month</span><b>${s.leads_month}</b><small>${s.won_month} won this month</small></div>
        <div class="stat"><span>Open pipeline</span><b>${short(s.pipeline_value)}</b><small>contacted to negotiation</small></div>
        <div class="stat"><span>Received this month</span><b>${short(s.received_month)}</b><small>${short(s.outstanding)} still due from clients</small></div>
        <div class="stat"><span>Win rate</span><b>${conv === null ? '—' : conv + '%'}</b><small>of closed leads</small></div>
      </div>
      <div class="dash">
        <div class="stack">
          <div class="card"><h3>Follow-ups due</h3>${due.length ? `<div class="list">${due.slice(0, 8).map(l => `<div class="item" data-lead="${l.id}"><div class="grow"><b>${esc(l.name)}</b><small>${esc(l.service || SRC_LABEL[l.source])}${l.owner ? ' · ' + esc(l.owner) : ''}</small></div><small>${dueTag(l.next_followup)}</small>${l.phone ? `<a class="btn btn--ghost btn--sm" href="tel:+91${l.phone}" onclick="event.stopPropagation()">Call</a>` : ''}</div>`).join('')}</div>` : '<div class="empty"><b>All caught up.</b>No follow-ups due today.</div>'}</div>
          <div class="card"><h3>New leads per month</h3>
            <div class="bars">${s.months.map(m => `<div class="bar" data-tip="${m.label}: ${m.leads} lead${m.leads === 1 ? '' : 's'}"><em>${m.leads || ''}</em><i style="height:${m.leads / maxL * 100}%"></i></div>`).join('')}</div>
            <div class="bar-labels">${s.months.map(m => `<span>${m.label}</span>`).join('')}</div></div>
          <div class="card"><h3>Payments received per month</h3>
            <div class="bars">${s.months.map(m => `<div class="bar" data-tip="${m.label}: ${inr(m.received)}"><em>${m.received ? short(m.received) : ''}</em><i style="height:${m.received / maxR * 100}%"></i></div>`).join('')}</div>
            <div class="bar-labels">${s.months.map(m => `<span>${m.label}</span>`).join('')}</div></div>
        </div>
        <div class="stack">
          <div class="card"><h3>Pipeline by stage</h3><div class="funnel">${fun.map(f => `<div data-tip="${STAGE_LABEL[f.stage]}: ${f.n} lead${f.n === 1 ? '' : 's'}, ${inr(f.v)}"><span>${STAGE_LABEL[f.stage]}</span><span class="track"><i style="width:${f.n / maxF * 100}%"></i></span><b>${f.n} · ${short(f.v)}</b></div>`).join('')}</div></div>
          <div class="card"><h3>Where leads came from</h3><p class="note" style="margin:-6px 0 12px">Last 90 days</p>${s.sources.length ? `<div class="funnel">${s.sources.map(x => `<div><span>${SRC_LABEL[x.source] || x.source}</span><span class="track"><i style="width:${x.n / s.sources[0].n * 100}%"></i></span><b>${x.n}</b></div>`).join('')}</div>` : '<p class="note">No leads yet.</p>'}</div>
          <div class="card"><h3>Renewals in the next 30 days</h3>${s.renewals.length ? `<div class="list">${s.renewals.map(r => `<a class="item" href="#/clients/${r.client_id}"><div class="grow"><b>${esc(r.domain || r.title)}</b><small>${esc(r.client)}</small></div><small>${dueTag(r.renewal_date)}</small></a>`).join('')}</div>` : '<p class="note">No domain or hosting renewals due. Add renewal dates to projects to see them here.</p>'}</div>
        </div>
      </div>`;
    $('#addLead').onclick = () => leadForm();
    $$('[data-lead]', view).forEach(el => el.onclick = () => openLead(el.dataset.lead));
  }

  /* ================= LEADS ================= */
  let leadMode = localStorage.getItem('wwi-lead-mode') || 'board';
  async function leads() {
    const f = JSON.parse(sessionStorage.getItem('wwi-lf') || '{}');
    view.innerHTML = `
      <div class="top"><div><h1>Leads</h1><div class="sub">Drag a card to change its stage. Click to open it.</div></div>
        <div class="tools">
          <input class="input" id="lq" type="search" placeholder="Search name, phone, service" value="${esc(f.q || '')}">
          <select class="input" id="lo"><option value="">Everyone</option><option value="me"${f.owner === 'me' ? ' selected' : ''}>My leads</option>${META.users.map(u => `<option value="${u.id}"${String(u.id) === f.owner ? ' selected' : ''}>${esc(u.name)}</option>`).join('')}</select>
          <select class="input" id="ls"><option value="">All sources</option>${opts(SRC_LABEL, f.source)}</select>
          <span class="seg"><button type="button" data-m="board" aria-pressed="${leadMode === 'board'}">Board</button><button type="button" data-m="list" aria-pressed="${leadMode === 'list'}">List</button></span>
          <button class="btn" id="addLead">${svg('plus')}Add lead</button>
        </div></div>
      <div id="lv"></div>`;
    const load = async () => {
      const q = { q: $('#lq').value.trim(), owner: $('#lo').value, source: $('#ls').value };
      sessionStorage.setItem('wwi-lf', JSON.stringify(q));
      const p = new URLSearchParams(Object.entries(q).filter(([, v]) => v));
      const list = await api('/crm/leads?' + p);
      leadMode === 'board' ? board(list) : leadTable(list);
    };
    let t; $('#lq').oninput = () => { clearTimeout(t); t = setTimeout(load, 250); };
    $('#lo').onchange = load; $('#ls').onchange = load;
    $$('.seg button', view).forEach(b => b.onclick = () => { leadMode = b.dataset.m; localStorage.setItem('wwi-lead-mode', leadMode); $$('.seg button', view).forEach(x => x.setAttribute('aria-pressed', x === b)); load(); });
    $('#addLead').onclick = () => leadForm();
    await load();
  }
  function board(list) {
    const lv = $('#lv');
    lv.innerHTML = `<div class="board">${META.stages.map(st => { const items = list.filter(l => l.stage === st); const v = items.reduce((a, l) => a + (l.value || 0), 0);
      return `<div class="col" data-stage="${st}"><div class="col-head"><b>${STAGE_LABEL[st]} · ${items.length}</b><span>${v ? short(v) : ''}</span></div>
        ${items.map(l => `<div class="lead" draggable="true" data-id="${l.id}" tabindex="0"><b>${esc(l.name)}</b><small>${esc(l.service || l.company || SRC_LABEL[l.source])}</small>
          <div class="row"><span>${l.value ? short(l.value) : ''}</span><span>${l.stage === 'won' || l.stage === 'lost' ? esc(first(l.owner)) : dueTag(l.next_followup) || esc(first(l.owner))}</span></div></div>`).join('')}</div>`; }).join('')}</div>`;
    let dragId = null;
    $$('.lead', lv).forEach(c => {
      c.onclick = () => openLead(c.dataset.id);
      c.onkeydown = e => { if (e.key === 'Enter') openLead(c.dataset.id); };
      c.ondragstart = e => { dragId = c.dataset.id; c.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; };
      c.ondragend = () => c.classList.remove('dragging');
    });
    $$('.col', lv).forEach(col => {
      col.ondragover = e => { e.preventDefault(); col.classList.add('over'); };
      col.ondragleave = () => col.classList.remove('over');
      col.ondrop = async e => {
        e.preventDefault(); col.classList.remove('over'); if (!dragId) return;
        const st = col.dataset.stage, l = list.find(x => String(x.id) === dragId); if (!l || l.stage === st) return;
        if (st === 'won' && !l.client_id) { openLead(dragId, true); return; }
        const body = { stage: st };
        if (st === 'lost') { const r = prompt(`Why was "${l.name}" lost? (optional)`, ''); if (r === null) return; body.lost_reason = r; }
        try { await api(`/crm/leads/${dragId}`, { method: 'PATCH', body }); toast(`Moved to ${STAGE_LABEL[st]}.`); reload(); } catch (x) { toast(x.message, 1); }
      };
    });
  }
  function leadTable(list) {
    $('#lv').innerHTML = list.length ? `<div class="table-wrap"><table><thead><tr><th>Lead</th><th>Service</th><th>Stage</th><th>Follow-up</th><th>Owner</th><th class="num">Value</th><th>Added</th></tr></thead><tbody>
      ${list.map(l => `<tr class="click" data-id="${l.id}"><td><b>${esc(l.name)}</b><small>${esc(l.phone || '')}${l.company ? ' · ' + esc(l.company) : ''}</small></td><td>${esc(l.service || '—')}<small>${SRC_LABEL[l.source]}</small></td><td>${badge(l.stage, STAGE_LABEL)}</td><td>${l.stage === 'won' || l.stage === 'lost' ? '' : dueTag(l.next_followup) || '<span class="note">Not set</span>'}</td><td>${esc(l.owner || '—')}</td><td class="num">${l.value ? inr(l.value) : ''}</td><td>${ago(l.created_at)}</td></tr>`).join('')}</tbody></table></div>`
      : '<div class="card empty"><b>No leads match.</b>Website enquiries appear here automatically, or add one yourself.</div>';
    $$('tr.click').forEach(r => r.onclick = () => openLead(r.dataset.id));
  }

  function leadForm(l = {}) {
    const edit = !!l.id;
    const b = openDrawer(edit ? `Edit ${l.name}` : 'Add a lead', edit ? '' : 'For enquiries from calls, Justdial, referrals or walk-ins.', `
      <form class="sect" id="lfm" novalidate>
        <div class="grid2"><div class="field"><label>Name</label><input name="name" required value="${esc(l.name || '')}"></div><div class="field"><label>Mobile</label><input name="phone" type="tel" inputmode="tel" value="${esc(l.phone || '')}"></div></div>
        <div class="grid2"><div class="field"><label>Business name</label><input name="company" value="${esc(l.company || '')}"></div><div class="field"><label>Email</label><input name="email" type="email" value="${esc(l.email || '')}"></div></div>
        <div class="grid2"><div class="field"><label>Service</label><input name="service" list="svcList" value="${esc(l.service || '')}"><datalist id="svcList">${SERVICES.map(s => `<option value="${s}">`).join('')}</datalist></div><div class="field"><label>Source</label><select name="source">${opts(SRC_LABEL, l.source || 'manual')}</select></div></div>
        <div class="grid3"><div class="field"><label>Deal value (₹)</label><input name="value" inputmode="numeric" value="${l.value ?? ''}"></div><div class="field"><label>Owner</label><select name="owner_id">${userOpts(edit ? l.owner_id : ME.id)}</select></div><div class="field"><label>Follow up on</label><input name="next_followup" type="date" value="${l.next_followup || (edit ? '' : addDays(1))}"></div></div>
        <div class="grid2"><div class="field"><label>Website</label><input name="website" value="${esc(l.website || '')}"></div><div class="field"><label>Budget</label><input name="budget" value="${esc(l.budget || '')}"></div></div>
        <div class="field"><label>Requirement</label><textarea name="message">${esc(l.message || '')}</textarea></div>
        <div class="actions"><button class="btn" type="submit">${edit ? 'Save changes' : 'Add lead'}</button>${edit ? `<button class="btn btn--ghost" type="button" id="back">Cancel</button>` : ''}</div>
      </form>`);
    const f = $('#lfm', b);
    edit && ($('#back', b).onclick = () => openLead(l.id));
    f.onsubmit = e => { e.preventDefault(); submit(f, async () => {
      if (edit) { await api(`/crm/leads/${l.id}`, { method: 'PUT', body: formData(f) }); toast('Lead saved.'); openLead(l.id); }
      else { const r = await api('/crm/leads', { body: formData(f) }); toast('Lead added.'); openLead(r.id); }
      if (location.hash.startsWith('#/leads') || location.hash.startsWith('#/dashboard') || !location.hash) reload();
    }); };
  }

  async function openLead(id, convert = false) {
    const l = await api(`/crm/leads/${id}`);
    const closed = l.stage === 'won' || l.stage === 'lost';
    const b = openDrawer(l.name, `${badge(l.stage, STAGE_LABEL)} &nbsp;${SRC_LABEL[l.source]} · added ${ago(l.created_at)}`, `
      <div class="sect"><div class="actions">
        ${l.phone ? `<a class="btn btn--dark" href="tel:+91${l.phone}">${svg('phone')}Call ${esc(l.phone)}</a><a class="btn btn--wa" target="_blank" rel="noopener" href="${wa(l.phone, `Hello ${first(l.name)}, this is ${first(ME.name)} from Web Works India.`)}">WhatsApp</a>` : ''}
        ${l.email ? `<a class="btn btn--ghost" href="mailto:${esc(l.email)}">Email</a>` : ''}
        <button class="btn btn--ghost" id="edit">Edit details</button>
        ${l.client_id ? `<a class="btn btn--ghost" href="#/clients/${l.client_id}">Open client</a>` : ''}
      </div></div>
      <div class="sect"><h3>Stage</h3><div class="stages">${META.stages.map(s => `<button type="button" data-st="${s}" class="${s === l.stage ? 'on' : ''}">${STAGE_LABEL[s]}</button>`).join('')}</div>
        ${l.stage === 'lost' && l.lost_reason ? `<p class="note" style="margin:10px 0 0">Reason: ${esc(l.lost_reason)}</p>` : ''}
        <div class="grid3" style="margin-top:14px">
          <div class="field"><label>Follow up on</label><input type="date" id="nf" value="${l.next_followup || ''}"${closed ? ' disabled' : ''}></div>
          <div class="field"><label>Owner</label><select id="ow">${userOpts(l.owner_id)}</select></div>
          <div class="field"><label>Deal value (₹)</label><input id="val" inputmode="numeric" value="${l.value ?? ''}"></div></div>
        ${closed ? '' : `<div class="actions"><button class="btn btn--ghost btn--sm" data-q="1">Tomorrow</button><button class="btn btn--ghost btn--sm" data-q="3">In 3 days</button><button class="btn btn--ghost btn--sm" data-q="7">Next week</button></div>`}
      </div>
      <div class="sect" id="convBox" ${l.client_id ? 'hidden' : ''}><h3>Won the deal?</h3>
        <form id="conv" ${convert ? '' : 'hidden'} novalidate>
          <div class="grid2"><div class="field"><label>Project title</label><input name="title" value="${esc(l.service || '')}" placeholder="e.g. Clinic website"></div><div class="field"><label>Project value (₹)</label><input name="value" inputmode="numeric" value="${l.value ?? ''}"></div></div>
          <div class="grid3"><div class="field"><label>Advance received (₹)</label><input name="advance" inputmode="numeric"></div><div class="field"><label>Paid by</label><select name="method"><option>UPI</option><option>Bank transfer</option><option>Cash</option><option>Cheque</option><option>Card</option></select></div><div class="field"><label>Due date</label><input name="due_date" type="date"></div></div>
          <button class="btn" type="submit">Mark won and create client</button>
        </form>
        <button class="btn" id="showConv" ${convert ? 'hidden' : ''}>Convert to client</button>
      </div>
      <div class="sect"><h3>Log an update</h3>
        <form id="act" novalidate>
          <div class="stages" style="margin-bottom:10px">${[['call', 'Call'], ['whatsapp', 'WhatsApp'], ['meeting', 'Meeting'], ['email', 'Email'], ['note', 'Note']].map(([k, t], i) => `<button type="button" data-k="${k}" class="${i === 0 ? 'on' : ''}">${t}</button>`).join('')}</div>
          <div class="field"><textarea name="body" placeholder="What happened? e.g. Spoke to him, wants a quote for 8 pages by Friday."></textarea></div>
          <div class="grid2"><div class="field"><label>Next follow-up <span class="note">(optional)</span></label><input name="next_followup" type="date"></div><div class="field" style="display:flex;align-items:flex-end"><button class="btn btn--block" type="submit">Save update</button></div></div>
        </form>
      </div>
      <div class="sect"><h3>Details</h3><div class="kv">
        ${[['Phone', l.phone], ['Email', l.email], ['Business', l.company], ['Website', l.website], ['Service', l.service], ['Budget', l.budget], ['Requirement', l.message]].filter(r => r[1]).map(([k, v]) => `<span>${k}</span><div style="white-space:pre-wrap">${esc(v)}</div>`).join('') || '<span>No details</span><div></div>'}
      </div></div>
      <div class="sect"><h3>History</h3><ul class="timeline">${l.activities.map(a => `<li class="k-${a.kind}"><p>${esc(a.body)}</p><small>${a.kind !== 'system' ? a.kind[0].toUpperCase() + a.kind.slice(1) + ' · ' : ''}${esc(a.user_name || 'System')} · ${ago(a.created_at)}</small></li>`).join('')}</ul></div>
      ${ADMIN ? `<button class="btn btn--danger" id="del">Delete lead</button>` : ''}`);
    const patch = async (body, msg) => { try { await api(`/crm/leads/${id}`, { method: 'PATCH', body }); msg && toast(msg); openLead(id); if (location.hash.match(/leads|followups|dashboard/) || !location.hash) reload(); } catch (x) { toast(x.message, 1); } };
    $$('[data-st]', b).forEach(btn => btn.onclick = () => {
      const st = btn.dataset.st; if (st === l.stage) return;
      if (st === 'won' && !l.client_id) { $('#conv', b).hidden = false; $('#showConv', b).hidden = true; $('#conv', b).scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      const body = { stage: st }; if (st === 'lost') { const r = prompt('Why was this lead lost? (optional)', ''); if (r === null) return; body.lost_reason = r; }
      patch(body, `Moved to ${STAGE_LABEL[st]}.`);
    });
    $('#nf', b).onchange = e => patch({ next_followup: e.target.value }, 'Follow-up date saved.');
    $$('[data-q]', b).forEach(x => x.onclick = () => patch({ next_followup: addDays(+x.dataset.q) }, 'Follow-up date saved.'));
    $('#ow', b).onchange = e => patch({ owner_id: e.target.value }, 'Owner changed.');
    $('#val', b).onchange = e => patch({ value: e.target.value }, 'Value saved.');
    $('#edit', b).onclick = () => leadForm(l);
    const sc = $('#showConv', b); sc && (sc.onclick = () => { $('#conv', b).hidden = false; sc.hidden = true; });
    const conv = $('#conv', b);
    conv && (conv.onsubmit = e => { e.preventDefault(); submit(conv, async () => { const r = await api(`/crm/leads/${id}/convert`, { body: formData(conv) }); toast('Deal won. Client and project created.'); closeDrawer(); location.hash = `#/clients/${r.client_id}`; }); });
    let kind = 'call';
    $$('#act [data-k]', b).forEach(x => x.onclick = () => { kind = x.dataset.k; $$('#act [data-k]', b).forEach(y => y.classList.toggle('on', y === x)); });
    const act = $('#act', b);
    act.onsubmit = e => { e.preventDefault(); submit(act, async () => { const d = formData(act); await api(`/crm/leads/${id}/activities`, { body: { ...d, kind, mark_contacted: kind !== 'note' } }); toast('Update saved.'); openLead(id); if (location.hash.match(/leads|followups|dashboard/) || !location.hash) reload(); }); };
    const del = $('#del', b); del && (del.onclick = async () => { if (!confirm(`Delete ${l.name} and its history? This can't be undone.`)) return; await api(`/crm/leads/${id}`, { method: 'DELETE' }); toast('Lead deleted.'); closeDrawer(); reload(); });
  }

  /* ================= FOLLOW-UPS ================= */
  async function followups() {
    const [due, open] = await Promise.all([api('/crm/leads?due=1'), api('/crm/leads?open=1')]);
    const upcoming = open.filter(l => l.next_followup && l.next_followup > today()).sort((a, b) => a.next_followup.localeCompare(b.next_followup));
    const none = open.filter(l => !l.next_followup);
    const sect = (title, list, empty) => `<div class="card" style="margin-bottom:16px"><h3>${title} · ${list.length}</h3>${list.length ? `<div class="list">${list.map(l => `<div class="item" data-lead="${l.id}"><div class="grow"><b>${esc(l.name)}</b><small>${esc(l.service || SRC_LABEL[l.source])} · ${STAGE_LABEL[l.stage]}${l.owner ? ' · ' + esc(l.owner) : ''}</small></div><small>${dueTag(l.next_followup)}</small>${l.phone ? `<a class="btn btn--ghost btn--sm" href="tel:+91${l.phone}" onclick="event.stopPropagation()">Call</a><a class="btn btn--wa btn--sm" target="_blank" rel="noopener" href="${wa(l.phone)}" onclick="event.stopPropagation()">WhatsApp</a>` : ''}</div>`).join('')}</div>` : `<p class="note">${empty}</p>`}</div>`;
    view.innerHTML = `<div class="top"><div><h1>Follow-ups</h1><div class="sub">Call these people today. Log the call and set the next date.</div></div></div>
      ${sect('Due today and overdue', due, 'Nothing due. Good work.')}${sect('Coming up', upcoming.slice(0, 40), 'No upcoming follow-ups.')}${sect('Open leads with no follow-up date', none, 'Every open lead has a follow-up date.')}`;
    $$('[data-lead]', view).forEach(el => el.onclick = () => openLead(el.dataset.lead));
  }

  /* ================= CLIENTS ================= */
  async function clients(id) {
    if (id) return clientPage(id);
    view.innerHTML = `<div class="top"><div><h1>Clients</h1><div class="sub">Everyone who has paid you, with what they owe.</div></div>
      <div class="tools"><input class="input" id="cq" type="search" placeholder="Search clients"><button class="btn" id="addC">${svg('plus')}Add client</button></div></div><div id="cv"></div>`;
    const load = async () => {
      const list = await api('/crm/clients?q=' + encodeURIComponent($('#cq').value.trim()));
      $('#cv').innerHTML = list.length ? `<div class="table-wrap"><table><thead><tr><th>Client</th><th>Contact</th><th class="num">Projects</th><th class="num">Billed</th><th class="num">Received</th><th class="num">Due</th></tr></thead><tbody>
        ${list.map(c => `<tr class="click" data-id="${c.id}"><td><b>${esc(c.name)}</b><small>${esc(c.company || '')}</small></td><td>${esc(c.phone || '')}<small>${esc(c.email || '')}</small></td><td class="num">${c.projects}</td><td class="num">${inr(c.billed)}</td><td class="num">${inr(c.paid)}</td><td class="num">${c.billed - c.paid > 0 ? `<b style="color:var(--warn)">${inr(c.billed - c.paid)}</b>` : '<span class="badge b-won">Paid</span>'}</td></tr>`).join('')}</tbody></table></div>`
        : '<div class="card empty"><b>No clients yet.</b>Convert a won lead, or add a client directly.</div>';
      $$('tr.click', view).forEach(r => r.onclick = () => location.hash = `#/clients/${r.dataset.id}`);
    };
    let t; $('#cq').oninput = () => { clearTimeout(t); t = setTimeout(load, 250); };
    $('#addC').onclick = () => clientForm();
    await load();
  }
  function clientForm(c = {}) {
    const edit = !!c.id;
    const b = openDrawer(edit ? `Edit ${c.name}` : 'Add a client', '', `<form class="sect" id="cf" novalidate>
      <div class="grid2"><div class="field"><label>Name</label><input name="name" required value="${esc(c.name || '')}"></div><div class="field"><label>Business name</label><input name="company" value="${esc(c.company || '')}"></div></div>
      <div class="grid2"><div class="field"><label>Mobile</label><input name="phone" type="tel" value="${esc(c.phone || '')}"></div><div class="field"><label>Email</label><input name="email" type="email" value="${esc(c.email || '')}"></div></div>
      <div class="grid2"><div class="field"><label>GSTIN</label><input name="gstin" value="${esc(c.gstin || '')}"></div><div class="field"><label>Address</label><input name="address" value="${esc(c.address || '')}"></div></div>
      <div class="field"><label>Notes</label><textarea name="notes">${esc(c.notes || '')}</textarea></div>
      <button class="btn" type="submit">${edit ? 'Save changes' : 'Add client'}</button></form>`);
    const f = $('#cf', b);
    f.onsubmit = e => { e.preventDefault(); submit(f, async () => {
      if (edit) { await api(`/crm/clients/${c.id}`, { method: 'PUT', body: formData(f) }); toast('Client saved.'); closeDrawer(); reload(); }
      else { const r = await api('/crm/clients', { body: formData(f) }); toast('Client added.'); closeDrawer(); location.hash = `#/clients/${r.id}`; }
    }); };
  }
  async function clientPage(id) {
    const c = await api(`/crm/clients/${id}`);
    const billed = c.projects.filter(p => p.status !== 'cancelled').reduce((a, p) => a + p.value, 0), paid = c.payments.reduce((a, p) => a + p.amount, 0);
    view.innerHTML = `
      <div class="top"><div><div class="sub"><a href="#/clients">Clients</a> /</div><h1>${esc(c.name)}</h1><div class="sub">${esc([c.company, c.phone, c.email].filter(Boolean).join(' · '))}</div></div>
        <div class="tools">${c.phone ? `<a class="btn btn--dark" href="tel:+91${c.phone}">${svg('phone')}Call</a><a class="btn btn--wa" target="_blank" rel="noopener" href="${wa(c.phone, `Hello ${first(c.name)}, this is ${first(ME.name)} from Web Works India.`)}">WhatsApp</a>` : ''}<button class="btn btn--ghost" id="editC">Edit</button><button class="btn" id="addP">${svg('plus')}Add project</button></div></div>
      <div class="stats"><div class="stat"><span>Total billed</span><b>${inr(billed)}</b></div><div class="stat"><span>Received</span><b>${inr(paid)}</b></div><div class="stat${billed - paid > 0 ? ' stat--hot' : ''}"><span>Still due</span><b>${inr(Math.max(0, billed - paid))}</b></div><div class="stat"><span>Projects</span><b>${c.projects.length}</b></div></div>
      <div class="dash">
        <div class="stack">
          <div class="card"><h3>Projects</h3>${c.projects.length ? `<div class="list">${c.projects.map(p => `<div class="item" data-p="${p.id}"><div class="grow"><b>${esc(p.title)}</b><small>${esc(p.service || '')}${p.due_date ? ' · due ' + fmtDate(p.due_date) : ''}${p.domain ? ' · ' + esc(p.domain) : ''}</small><div class="progress" data-tip="${inr(p.paid)} of ${inr(p.value)} received"><i style="width:${p.value ? Math.min(100, p.paid / p.value * 100) : 0}%"></i></div></div><div style="text-align:right">${badge(p.status, PST_LABEL)}<small style="display:block;margin-top:4px">${inr(p.paid)} / ${inr(p.value)}</small></div></div>`).join('')}</div>` : '<p class="note">No projects yet.</p>'}</div>
          <div class="card"><h3>Payments</h3>${c.payments.length ? `<div class="table-wrap" style="border:0"><table><thead><tr><th>Date</th><th>Project</th><th>Method</th><th class="num">Amount</th>${ADMIN ? '<th></th>' : ''}</tr></thead><tbody>${c.payments.map(p => `<tr><td>${fmtDate(p.paid_on)}</td><td>${esc(p.project)}<small>${esc(p.note || '')}</small></td><td>${esc(p.method || '')}</td><td class="num"><b>${inr(p.amount)}</b></td>${ADMIN ? `<td><button class="icon-btn" data-delpay="${p.id}">Delete</button></td>` : ''}</tr>`).join('')}</tbody></table></div>` : '<p class="note">No payments recorded yet. Open a project to add one.</p>'}</div>
        </div>
        <div class="stack">
          <div class="card"><h3>Add a note</h3><form id="cn" novalidate><div class="field"><textarea name="body" placeholder="e.g. Sent final invoice. Will pay the balance on the 10th."></textarea></div><button class="btn" type="submit">Save note</button></form></div>
          <div class="card"><h3>History</h3><ul class="timeline">${c.activities.map(a => `<li class="k-${a.kind}"><p>${esc(a.body)}</p><small>${esc(a.user_name || 'System')} · ${ago(a.created_at)}</small></li>`).join('')}</ul></div>
          ${c.gstin || c.address || c.notes ? `<div class="card"><h3>Details</h3><div class="kv">${[['GSTIN', c.gstin], ['Address', c.address], ['Notes', c.notes]].filter(r => r[1]).map(([k, v]) => `<span>${k}</span><div style="white-space:pre-wrap">${esc(v)}</div>`).join('')}</div></div>` : ''}
          ${ADMIN ? `<button class="btn btn--danger" id="delC" style="justify-self:start">Delete client</button>` : ''}
        </div>
      </div>`;
    $('#editC').onclick = () => clientForm(c);
    $('#addP').onclick = () => projectForm({ client_id: c.id });
    $$('[data-p]', view).forEach(el => el.onclick = () => projectPanel(c.projects.find(p => String(p.id) === el.dataset.p), c));
    $$('[data-delpay]', view).forEach(x => x.onclick = async () => { if (!confirm('Delete this payment?')) return; await api(`/crm/payments/${x.dataset.delpay}`, { method: 'DELETE' }); toast('Payment deleted.'); reload(); });
    const cn = $('#cn'); cn.onsubmit = e => { e.preventDefault(); submit(cn, async () => { await api(`/crm/clients/${id}/activities`, { body: formData(cn) }); toast('Note saved.'); reload(); }); };
    const dc = $('#delC'); dc && (dc.onclick = async () => { if (!confirm(`Delete ${c.name} with all projects and payments? This can't be undone.`)) return; await api(`/crm/clients/${id}`, { method: 'DELETE' }); toast('Client deleted.'); location.hash = '#/clients'; });
  }
  function projectForm(p) {
    const edit = !!p.id;
    const b = openDrawer(edit ? `Edit ${p.title}` : 'Add a project', '', `<form class="sect" id="pf" novalidate>
      <div class="grid2"><div class="field"><label>Title</label><input name="title" required value="${esc(p.title || '')}" placeholder="e.g. E-commerce store"></div><div class="field"><label>Service</label><input name="service" list="svcList2" value="${esc(p.service || '')}"><datalist id="svcList2">${SERVICES.map(s => `<option value="${s}">`).join('')}</datalist></div></div>
      <div class="grid3"><div class="field"><label>Value (₹)</label><input name="value" inputmode="numeric" value="${p.value ?? ''}"></div><div class="field"><label>Status</label><select name="status">${opts(PST_LABEL, p.status || 'planning')}</select></div><div class="field"><label>Owner</label><select name="owner_id">${userOpts(p.owner_id ?? ME.id)}</select></div></div>
      <div class="grid2"><div class="field"><label>Start date</label><input name="start_date" type="date" value="${p.start_date || today()}"></div><div class="field"><label>Due date</label><input name="due_date" type="date" value="${p.due_date || ''}"></div></div>
      <div class="grid2"><div class="field"><label>Domain</label><input name="domain" value="${esc(p.domain || '')}" placeholder="example.in"></div><div class="field"><label>Domain / hosting renewal</label><input name="renewal_date" type="date" value="${p.renewal_date || ''}"></div></div>
      <div class="field"><label>Notes</label><textarea name="notes">${esc(p.notes || '')}</textarea></div>
      <div class="actions"><button class="btn" type="submit">${edit ? 'Save project' : 'Add project'}</button>${edit && ADMIN ? '<button class="btn btn--danger" type="button" id="delP">Delete project</button>' : ''}</div></form>`);
    const f = $('#pf', b);
    f.onsubmit = e => { e.preventDefault(); submit(f, async () => {
      if (edit) await api(`/crm/projects/${p.id}`, { method: 'PUT', body: formData(f) }); else await api(`/crm/clients/${p.client_id}/projects`, { body: formData(f) });
      toast(edit ? 'Project saved.' : 'Project added.'); closeDrawer(); reload();
    }); };
    const d = $('#delP', b); d && (d.onclick = async () => { if (!confirm(`Delete "${p.title}" and its payments?`)) return; await api(`/crm/projects/${p.id}`, { method: 'DELETE' }); toast('Project deleted.'); closeDrawer(); reload(); });
  }
  function projectPanel(p, c) {
    const due = Math.max(0, p.value - p.paid);
    const b = openDrawer(p.title, `${badge(p.status, PST_LABEL)} &nbsp;${esc(c ? c.name : p.client)}`, `
      <div class="money"><div><span>Value</span><b>${inr(p.value)}</b></div><div><span>Received</span><b>${inr(p.paid)}</b></div><div><span>Due</span><b style="color:${due ? 'var(--warn)' : 'var(--ok)'}">${inr(due)}</b></div></div>
      <div class="sect"><h3>Record a payment</h3><form id="payf" novalidate>
        <div class="grid3"><div class="field"><label>Amount (₹)</label><input name="amount" inputmode="numeric" value="${due || ''}" required></div><div class="field"><label>Date</label><input name="paid_on" type="date" value="${today()}"></div><div class="field"><label>Method</label><select name="method"><option>UPI</option><option>Bank transfer</option><option>Cash</option><option>Cheque</option><option>Card</option></select></div></div>
        <div class="field"><label>Note <span class="note">(optional)</span></label><input name="note" placeholder="e.g. Second milestone"></div>
        <button class="btn" type="submit">Save payment</button></form></div>
      <div class="sect"><h3>Details</h3><div class="kv">${[['Service', p.service], ['Owner', p.owner], ['Start', fmtDate(p.start_date)], ['Due', fmtDate(p.due_date)], ['Domain', p.domain], ['Renewal', fmtDate(p.renewal_date)], ['Notes', p.notes]].filter(r => r[1]).map(([k, v]) => `<span>${k}</span><div style="white-space:pre-wrap">${esc(v)}</div>`).join('')}</div>
        <div class="actions" style="margin-top:14px"><button class="btn btn--ghost" id="editP">Edit project</button>${p.client_id && !c ? `<a class="btn btn--ghost" href="#/clients/${p.client_id}">Open client</a>` : ''}
        ${c && c.phone && due ? `<a class="btn btn--wa" target="_blank" rel="noopener" href="${wa(c.phone, `Hello ${first(c.name)}, a gentle reminder from Web Works India: ${inr(due)} is pending for "${p.title}". Please let us know once it's done. Thank you!`)}">Send payment reminder</a>` : ''}</div></div>`);
    $('#editP', b).onclick = () => projectForm(p);
    const f = $('#payf', b);
    f.onsubmit = e => { e.preventDefault(); submit(f, async () => { await api(`/crm/projects/${p.id}/payments`, { body: formData(f) }); toast('Payment recorded.'); closeDrawer(); reload(); }); };
  }

  /* ================= PROJECTS ================= */
  async function projects() {
    const st = sessionStorage.getItem('wwi-pst') ?? 'active';
    view.innerHTML = `<div class="top"><div><h1>Projects</h1><div class="sub">Every job in progress, and what's still to be collected.</div></div>
      <div class="tools"><select class="input" id="pst"><option value="active"${st === 'active' ? ' selected' : ''}>Active projects</option><option value=""${!st ? ' selected' : ''}>All projects</option>${opts(PST_LABEL, st)}</select></div></div><div id="pv"></div>`;
    $('#pst').onchange = e => { sessionStorage.setItem('wwi-pst', e.target.value); reload(); };
    const list = await api('/crm/projects?' + (st === 'active' ? 'active=1' : st ? 'status=' + st : ''));
    $('#pv').innerHTML = list.length ? `<div class="table-wrap"><table><thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Due</th><th>Owner</th><th class="num">Value</th><th class="num">Pending</th></tr></thead><tbody>
      ${list.map(p => `<tr class="click" data-id="${p.id}"><td><b>${esc(p.title)}</b><small>${esc(p.service || '')}</small></td><td>${esc(p.client)}</td><td>${badge(p.status, PST_LABEL)}</td><td>${p.due_date ? (p.due_date < today() && ['planning', 'in_progress', 'review'].includes(p.status) ? `<span class="due">${fmtDate(p.due_date)}</span>` : fmtDate(p.due_date)) : ''}</td><td>${esc(p.owner || '')}</td><td class="num">${inr(p.value)}</td><td class="num">${p.value - p.paid > 0 ? inr(p.value - p.paid) : '<span class="badge b-won">Paid</span>'}</td></tr>`).join('')}</tbody></table></div>`
      : '<div class="card empty"><b>No projects here.</b>Projects are created when you convert a won lead, or from a client page.</div>';
    $$('tr.click', view).forEach(r => r.onclick = () => projectPanel(list.find(p => String(p.id) === r.dataset.id)));
  }

  /* ================= PAYMENTS ================= */
  async function payments() {
    const list = await api('/crm/payments');
    const month = list.filter(p => p.paid_on.slice(0, 7) === today().slice(0, 7)).reduce((a, p) => a + p.amount, 0);
    view.innerHTML = `<div class="top"><div><h1>Payments</h1><div class="sub">${inr(month)} received this month.</div></div>${ADMIN ? '<div class="tools"><a class="btn btn--ghost" href="/api/crm/export/payments">Download CSV</a></div>' : ''}</div>
      ${list.length ? `<div class="table-wrap"><table><thead><tr><th>Date</th><th>Client</th><th>Project</th><th>Method</th><th>Recorded by</th><th class="num">Amount</th></tr></thead><tbody>
      ${list.map(p => `<tr class="click" data-c="${p.client_id}"><td>${fmtDate(p.paid_on)}</td><td><b>${esc(p.client)}</b></td><td>${esc(p.project)}<small>${esc(p.note || '')}</small></td><td>${esc(p.method || '')}</td><td>${esc(p.by_name || '')}</td><td class="num"><b>${inr(p.amount)}</b></td></tr>`).join('')}</tbody></table></div>` : '<div class="card empty"><b>No payments yet.</b>Record payments from a project.</div>'}`;
    $$('tr.click', view).forEach(r => r.onclick = () => location.hash = `#/clients/${r.dataset.c}`);
  }

  /* ================= TEAM ================= */
  async function team() {
    const list = await api('/crm/users');
    view.innerHTML = `<div class="top"><div><h1>Team</h1><div class="sub">Give each person their own login. Admins can delete records and see this page.</div></div><div class="tools"><button class="btn" id="addU">${svg('plus')}Add team member</button></div></div>
      <div class="table-wrap"><table><thead><tr><th>Name</th><th>Role</th><th class="num">Open leads</th><th>Status</th><th></th></tr></thead><tbody>
      ${list.map(u => `<tr data-id="${u.id}"><td><b>${esc(u.name)}</b><small>${esc(u.email)}${u.phone ? ' · ' + esc(u.phone) : ''}</small></td><td>${u.role === 'admin' ? 'Admin' : 'Team member'}</td><td class="num">${u.open_leads}</td><td>${u.active ? '<span class="badge b-won">Active</span>' : '<span class="badge">Paused</span>'}</td>
        <td style="text-align:right">${u.id === ME.id ? '<span class="note">You</span>' : `<button class="icon-btn" data-a="reset">Reset password</button><button class="icon-btn" data-a="role">${u.role === 'admin' ? 'Make team member' : 'Make admin'}</button><button class="icon-btn" data-a="active">${u.active ? 'Pause' : 'Reactivate'}</button>`}</td></tr>`).join('')}</tbody></table></div>`;
    const showPass = (title, name, email, pass) => openDrawer(title, '', `<div class="sect"><p>Share these login details with ${esc(name)}. The password is shown only once.</p><div class="kv"><span>Login page</span><div>${location.origin}/crm/</div><span>Email</span><div>${esc(email)}</div></div><div class="temp">${esc(pass)}</div><p class="note">They can change it from Settings after logging in.</p></div>`);
    $('#addU').onclick = () => {
      const b = openDrawer('Add team member', '', `<form class="sect" id="uf" novalidate><div class="grid2"><div class="field"><label>Name</label><input name="name" required></div><div class="field"><label>Email</label><input name="email" type="email" required></div></div>
        <div class="grid2"><div class="field"><label>Mobile <span class="note">(optional)</span></label><input name="phone" type="tel"></div><div class="field"><label>Role</label><select name="role"><option value="staff">Team member</option><option value="admin">Admin</option></select></div></div>
        <button class="btn" type="submit">Create login</button></form>`);
      const f = $('#uf', b); f.onsubmit = e => { e.preventDefault(); submit(f, async () => { const d = formData(f); const r = await api('/crm/users', { body: d }); META = await api('/crm/meta'); showPass('Login created', d.name, d.email, r.password); reload(); }); };
    };
    $$('tr[data-id]', view).forEach(r => r.addEventListener('click', async e => {
      const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
      const u = list.find(x => String(x.id) === r.dataset.id);
      try {
        if (a === 'reset') { if (!confirm(`Create a new password for ${u.name}? Their old one stops working.`)) return; const x = await api(`/crm/users/${u.id}/reset`, { method: 'POST' }); showPass('New password', u.name, u.email, x.password); }
        if (a === 'role') { await api(`/crm/users/${u.id}`, { method: 'PATCH', body: { role: u.role === 'admin' ? 'staff' : 'admin' } }); toast('Role changed.'); reload(); }
        if (a === 'active') { if (u.active && !confirm(`Pause ${u.name}? They won't be able to log in.`)) return; await api(`/crm/users/${u.id}`, { method: 'PATCH', body: { active: !u.active } }); toast(u.active ? 'Account paused.' : 'Account reactivated.'); META = await api('/crm/meta'); reload(); }
      } catch (x) { toast(x.message, 1); }
    }));
  }

  /* ================= SETTINGS ================= */
  async function settings() {
    view.innerHTML = `<div class="top"><div><h1>Settings</h1><div class="sub">${esc(ME.name)} · ${esc(ME.email)}</div></div></div>
      <div class="dash"><div class="card"><h3>Change password</h3><form id="pw" novalidate style="max-width:420px">
        <div class="field"><label>Current password</label><input name="current" type="password" autocomplete="current-password"></div>
        <div class="field"><label>New password</label><input name="next" type="password" autocomplete="new-password" minlength="8"></div>
        <button class="btn" type="submit">Change password</button></form></div>
      ${ADMIN ? `<div class="card"><h3>Download your data</h3><p class="note" style="margin-top:-6px">CSV files open in Excel or Google Sheets.</p><div class="actions"><a class="btn btn--ghost" href="/api/crm/export/leads">Leads</a><a class="btn btn--ghost" href="/api/crm/export/clients">Clients</a><a class="btn btn--ghost" href="/api/crm/export/payments">Payments</a></div></div>` : ''}</div>`;
    const f = $('#pw'); f.onsubmit = e => { e.preventDefault(); submit(f, async () => { await api('/me/password', { method: 'PUT', body: formData(f) }); f.reset(); toast('Password changed.'); }); };
  }

  route();
})();
