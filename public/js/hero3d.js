/* Web Works India — hero: a live website that separates into the five layers behind it */
import * as THREE from '/vendor/three.module.min.js';

const canvas = document.getElementById('hero3d');
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = matchMedia('(max-width: 760px)').matches || matchMedia('(pointer: coarse)').matches;
const ok = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (canvas && ok) (document.fonts ? document.fonts.ready : Promise.resolve()).then(init); else document.documentElement.classList.add('no-3d');

const OR = '#F38028', ORH = '#FFA45C', INK = '#10131A', LINE = 'rgba(236,238,242,.12)', TXT = '#ECEEF2', MUTED = '#8E95A5', BLUE = '#6E9BFF';
const SANS = '"Geist", "Segoe UI", system-ui, sans-serif', MONO = '"Geist Mono", ui-monospace, Consolas, monospace', HEAD = '"Bricolage Grotesque", "Geist", system-ui, sans-serif';
const W = 1280, H = 800;

function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function panel(draw, { bg = 'rgba(16,19,26,.94)', border = 'rgba(243,128,40,.55)' } = {}) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  rr(g, 4, 4, W - 8, H - 8, 34); if (bg) { g.fillStyle = bg; g.fill(); }
  g.save(); rr(g, 4, 4, W - 8, H - 8, 34); g.clip(); draw(g); g.restore();
  rr(g, 4, 4, W - 8, H - 8, 34); g.lineWidth = 4; g.strokeStyle = border; g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; return t;
}

/* ---------- 1. the live site ---------- */
const siteTex = () => panel(g => {
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#141925'); bg.addColorStop(1, '#0E1118'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // browser bar
  g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, 0, W, 64);
  ['#FF5F57', '#FEBC2E', '#28C840'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(40 + i * 26, 32, 8, 0, 7); g.fill(); });
  rr(g, 160, 16, 520, 32, 16); g.fillStyle = 'rgba(255,255,255,.07)'; g.fill();
  g.fillStyle = MUTED; g.font = `500 17px ${SANS}`; g.fillText('🔒  yourbusiness.in', 182, 38);
  // nav
  g.fillStyle = OR; rr(g, 60, 100, 36, 36, 10); g.fill();
  g.fillStyle = TXT; g.font = `700 24px ${HEAD}`; g.fillText('Lumina Dental', 110, 127);
  g.font = `500 19px ${SANS}`; g.fillStyle = MUTED; ['Treatments', 'Doctors', 'Reviews', 'Contact'].forEach((t, i) => g.fillText(t, 600 + i * 132, 126));
  // hero
  g.fillStyle = TXT; g.font = `700 64px ${HEAD}`; g.fillText('A brighter smile,', 60, 250); g.fillText('booked in 30 seconds.', 60, 322);
  g.fillStyle = MUTED; g.font = `400 23px ${SANS}`; g.fillText('Same-day appointments in Gomti Nagar. Pay online, get reminders on WhatsApp.', 60, 374);
  rr(g, 60, 410, 230, 62, 12); g.fillStyle = OR; g.fill(); g.fillStyle = '#fff'; g.font = `600 22px ${SANS}`; g.fillText('Book a visit', 102, 449);
  rr(g, 308, 410, 230, 62, 12); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; g.stroke(); g.fillStyle = TXT; g.fillText('Call the clinic', 338, 449);
  // cards
  [['4.9 ★', 'from 1,240 Google reviews'], ['12 min', 'average wait time'], ['₹0', 'consultation on first visit']].forEach(([a, b], i) => {
    const x = 60 + i * 392; rr(g, x, 540, 368, 190, 18); g.fillStyle = 'rgba(255,255,255,.045)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.08)'; g.stroke();
    g.fillStyle = i === 0 ? ORH : TXT; g.font = `700 54px ${HEAD}`; g.fillText(a, x + 28, 625); g.fillStyle = MUTED; g.font = `400 21px ${SANS}`; g.fillText(b, x + 28, 672);
  });
  // floating chat bubble
  rr(g, 960, 200, 260, 120, 20); g.fillStyle = '#1FA855'; g.fill(); g.fillStyle = '#fff'; g.font = `600 19px ${SANS}`; g.fillText('WhatsApp', 984, 236); g.font = `400 18px ${SANS}`; g.fillText('Your slot is confirmed', 984, 268); g.fillText('for 5:30 PM today ✓', 984, 296);
});

/* ---------- 2. design / wireframe ---------- */
const designTex = () => panel(g => {
  g.fillStyle = 'rgba(16,19,26,.55)'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(243,128,40,.07)'; g.fillRect(60 + i * 98, 0, 78, H); }
  g.strokeStyle = BLUE; g.lineWidth = 2.5; g.setLineDash([]);
  [[60, 96, 1160, 44], [60, 200, 760, 130], [60, 400, 480, 70], [60, 530, 368, 200], [452, 530, 368, 200], [844, 530, 376, 200], [960, 190, 260, 140]].forEach(([x, y, w, h]) => { g.strokeRect(x, y, w, h); g.fillStyle = BLUE; [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([a, b]) => g.fillRect(a - 5, b - 5, 10, 10)); });
  g.fillStyle = BLUE; g.font = `600 18px ${MONO}`;
  g.fillText('Nav / 1160 × 44', 66, 88); g.fillText('H1 / Display 64', 66, 192); g.fillText('Button / Primary', 66, 392); g.fillText('Card / Stat', 66, 522); g.fillText('Toast / WhatsApp', 966, 182);
  g.strokeStyle = ORH; g.lineWidth = 2; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(60, 760); g.lineTo(1220, 760); g.stroke(); g.setLineDash([]);
  g.fillStyle = ORH; g.font = `700 20px ${MONO}`; g.fillText('1440', 616, 750); g.fillText('24', 434, 640); g.fillText('64', 20, 365);
  // cursor
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(700, 430); g.lineTo(700, 470); g.lineTo(710, 460); g.lineTo(718, 478); g.lineTo(724, 475); g.lineTo(716, 457); g.lineTo(730, 457); g.closePath(); g.fill();
  rr(g, 735, 470, 92, 30, 8); g.fillStyle = OR; g.fill(); g.fillStyle = '#fff'; g.font = `600 16px ${SANS}`; g.fillText('Designer', 745, 491);
}, { bg: null, border: 'rgba(110,155,255,.6)' });

/* ---------- 3. code ---------- */
const codeTex = () => panel(g => {
  g.fillStyle = '#0D1016'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(0, 0, W, 58); g.fillStyle = TXT; g.font = `500 18px ${SANS}`; g.fillText('BookingForm.jsx', 40, 36); g.fillStyle = MUTED; g.fillText('api/appointments.js', 250, 36);
  const C = { k: '#FF8A5B', f: '#7CC4FF', s: '#A6E3A1', p: TXT, c: '#6B7385', n: '#F9C66B' };
  const lines = [
    [['c', '// Book a slot and confirm on WhatsApp']],
    [['k', 'export async function '], ['f', 'bookSlot'], ['p', '(patient, slot) {']],
    [['p', '  '], ['k', 'const '], ['p', 'booking = '], ['k', 'await '], ['p', 'db.'], ['f', 'insert'], ['p', '('], ['s', "'appointments'"], ['p', ', {']],
    [['p', '    patient: patient.id, time: slot.start,']],
    [['p', '    status: '], ['s', "'confirmed'"], ['p', ', paid: '], ['n', 'false']],
    [['p', '  });']],
    [['p', '  '], ['k', 'await '], ['p', 'whatsapp.'], ['f', 'send'], ['p', '(patient.phone, {']],
    [['p', '    template: '], ['s', "'slot_confirmed'"], ['p', ', vars: [slot.label]']],
    [['p', '  });']],
    [['p', '  '], ['k', 'await '], ['p', 'crm.'], ['f', 'log'], ['p', '(booking.id, '], ['s', "'Booked online'"], ['p', ');']],
    [['p', '  '], ['k', 'return '], ['p', 'booking;']],
    [['p', '}']],
    [['p', '']],
    [['k', 'test'], ['p', '('], ['s', "'books within 300ms'"], ['p', ', '], ['k', 'async '], ['p', '() => {']],
    [['p', '  '], ['f', 'expect'], ['p', '(timing).'], ['f', 'toBeLessThan'], ['p', '('], ['n', '300'], ['p', ');  '], ['s', '✓ passed']],
  ];
  g.font = `500 25px ${MONO}`;
  lines.forEach((ln, i) => {
    const y = 112 + i * 44; g.fillStyle = '#3C4354'; g.fillText(String(i + 1).padStart(2, ' '), 34, y);
    let x = 92; ln.forEach(([k, t]) => { g.fillStyle = C[k]; g.fillText(t, x, y); x += g.measureText(t).width; });
  });
  g.fillStyle = 'rgba(243,128,40,.14)'; g.fillRect(0, 112 + 6 * 44 - 31, W, 44);
}, { border: 'rgba(124,196,255,.5)' });

/* ---------- 4. server / API ---------- */
const serverTex = () => panel(g => {
  g.fillStyle = 'rgba(13,16,22,.9)'; g.fillRect(0, 0, W, H);
  const node = (x, y, w, t, sub, hot) => { rr(g, x, y, w, 84, 14); g.fillStyle = hot ? 'rgba(243,128,40,.18)' : 'rgba(255,255,255,.05)'; g.fill(); g.strokeStyle = hot ? OR : 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.stroke(); g.fillStyle = TXT; g.font = `600 24px ${SANS}`; g.fillText(t, x + 22, y + 38); g.fillStyle = MUTED; g.font = `400 18px ${MONO}`; g.fillText(sub, x + 22, y + 66); };
  const link = (x1, y1, x2, y2) => { g.strokeStyle = 'rgba(243,128,40,.6)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x1, y1); g.bezierCurveTo((x1 + x2) / 2, y1, (x1 + x2) / 2, y2, x2, y2); g.stroke(); g.fillStyle = OR; g.beginPath(); g.arc(x2, y2, 5, 0, 7); g.fill(); };
  node(60, 330, 250, 'Load balancer', 'HTTPS · edge', true);
  node(470, 120, 290, 'Booking API', 'node · 3 replicas'); node(470, 330, 290, 'Auth', 'JWT · OTP'); node(470, 540, 290, 'Payments', 'Razorpay · UPI');
  node(920, 120, 300, 'WhatsApp API', 'templates · webhooks'); node(920, 330, 300, 'CRM sync', 'leads → pipeline'); node(920, 540, 300, 'Email + SMS', 'queue · retries');
  [[310, 372, 470, 162], [310, 372, 470, 372], [310, 372, 470, 582], [760, 162, 920, 162], [760, 372, 920, 372], [760, 582, 920, 582]].forEach(a => link(...a));
  g.fillStyle = MUTED; g.font = `500 19px ${MONO}`;
  ['200  POST /api/bookings     41ms', '200  POST /wa/webhook        18ms', '201  POST /api/leads        33ms'].forEach((l, i) => { g.fillStyle = i === 2 ? ORH : MUTED; g.fillText(l, 60, 700 + i * 30); });
  g.fillStyle = '#28C840'; g.beginPath(); g.arc(1180, 720, 9, 0, 7); g.fill(); g.fillStyle = TXT; g.font = `500 19px ${SANS}`; g.fillText('All systems normal', 990, 727);
}, { border: 'rgba(40,200,64,.45)' });

/* ---------- 5. database ---------- */
const dbTex = () => panel(g => {
  g.fillStyle = 'rgba(13,16,22,.92)'; g.fillRect(0, 0, W, H);
  g.fillStyle = TXT; g.font = `700 30px ${HEAD}`; g.fillText('leads', 60, 84); g.fillStyle = MUTED; g.font = `400 20px ${MONO}`; g.fillText('postgres · 14,208 rows · encrypted backups nightly', 160, 84);
  const cols = [['id', 60], ['name', 160], ['service', 420], ['source', 720], ['stage', 900], ['value ₹', 1070]];
  g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(40, 116, W - 80, 52);
  g.font = `600 19px ${MONO}`; g.fillStyle = ORH; cols.forEach(([c, x]) => g.fillText(c, x, 150));
  const rows = [['1042', 'Rohit Agarwal', 'E-commerce store', 'website', 'proposal', '1,20,000'], ['1043', 'Sana Khan', 'Clinic website', 'google', 'won', '45,000'], ['1044', 'Vikas Traders', 'GST billing ERP', 'referral', 'negotiation', '3,50,000'], ['1045', 'Ishita Rao', 'Local SEO', 'website', 'contacted', '18,000'], ['1046', 'Mehra Coaching', 'Student portal', 'whatsapp', 'new', '—'], ['1047', 'Aarav Foods', 'Online ordering', 'instagram', 'won', '85,000'], ['1048', 'Nidhi Jain', 'WhatsApp bot', 'website', 'proposal', '30,000']];
  g.font = `400 20px ${MONO}`;
  rows.forEach((r, i) => {
    const y = 214 + i * 74; g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(40, y + 22, W - 80, 1);
    r.forEach((v, k) => { const st = k === 4; g.fillStyle = st ? (v === 'won' ? '#5FD38A' : v === 'new' ? ORH : TXT) : k === 0 ? MUTED : TXT; g.fillText(v, cols[k][1], y); });
  });
}, { border: 'rgba(243,128,40,.45)' });

function labelSprite(text, sub) {
  const c = document.createElement('canvas'); c.width = 640; c.height = 140; const g = c.getContext('2d');
  g.fillStyle = OR; g.fillRect(0, 34, 6, 72);
  g.fillStyle = TXT; g.font = `700 46px ${HEAD}`; g.fillText(text, 26, 74);
  g.fillStyle = MUTED; g.font = `400 28px ${SANS}`; g.fillText(sub, 26, 114);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false }));
  s.scale.set(3.2, .7, 1); s.center.set(0, .5); return s;
}

function init() {
  const dpr = Math.min(devicePixelRatio || 1, MOBILE ? 1.5 : 2);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr); renderer.setClearColor(0, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);

  const stack = new THREE.Group(); scene.add(stack);
  const tilt = new THREE.Group(); stack.add(tilt);
  const PW = 6.4, PH = PW * H / W;
  const defs = [
    [siteTex, 'Interface', 'What your customers see'],
    [designTex, 'Design system', 'Grids, components, spacing'],
    [codeTex, 'Code', 'Tested, versioned, reviewed'],
    [serverTex, 'Servers & APIs', 'Payments, WhatsApp, CRM'],
    [dbTex, 'Data', 'Your leads and records, backed up'],
  ];
  const layers = defs.map(([tex, name, sub], i) => {
    const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: tex(), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    m.renderOrder = 10 - i; g.add(m);
    const lab = labelSprite(name, sub); lab.position.set(PW / 2 + .3, 0, 0); lab.material.opacity = 0; lab.renderOrder = 100; g.add(lab);
    tilt.add(g); return { g, m, lab, i };
  });

  // light rails at the corners joining the layers
  const railMat = new THREE.LineBasicMaterial({ color: 0xF38028, transparent: true, opacity: 0 });
  const railGeo = new THREE.BufferGeometry(); railGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Array(4 * 2 * 3).fill(0), 3));
  const rails = new THREE.LineSegments(railGeo, railMat); tilt.add(rails);
  // data pulses travelling down the rails
  const pulseTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,200,150,1)'); r.addColorStop(.3, 'rgba(243,128,40,.8)'); r.addColorStop(1, 'rgba(243,128,40,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; })();
  const pulses = Array.from({ length: 8 }, (_, k) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: pulseTex, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(.32); s.userData = { corner: k % 4, off: k / 8 }; tilt.add(s); return s; });

  // dust
  const N = MOBILE ? 160 : 380, dp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) dp.set([(Math.random() - .5) * 26, (Math.random() - .5) * 16, (Math.random() - .5) * 14 - 4], i * 3);
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: .045, color: 0xF3A066, transparent: true, opacity: .5, depthWrite: false })); scene.add(dust);

  /* layout */
  let w = 1, h = 1, wide = true;
  const resize = () => {
    const r = canvas.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false); camera.aspect = w / h; wide = w / h > 1.05;
    if (wide) camera.setViewOffset(w, h, -w * (w / h > 1.5 ? .27 : .22), -h * .02, w, h); else camera.setViewOffset(w, h, 0, h * (w / h < .7 ? .25 : .3), w, h);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas); resize();

  const mouse = new THREE.Vector2(), sm = new THREE.Vector2();
  addEventListener('pointermove', e => mouse.set(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1), { passive: true });
  let scrollK = 0; addEventListener('scroll', () => { scrollK = Math.min(1, scrollY / (innerHeight * .9)); }, { passive: true });
  let visible = true; new IntersectionObserver(es => visible = es[0].isIntersecting).observe(canvas);

  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const clamp = v => Math.min(1, Math.max(0, v));
  const t0 = performance.now(); let explode = 0;
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  document.documentElement.classList.add('has-3d');

  const frame = now => {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const el = REDUCE ? 9 : (now - t0) / 1000, t = REDUCE ? 0 : el;
    // intro: the site faces you, then turns and separates into its layers
    const turn = ease(clamp((el - .6) / 1.6)), sep = ease(clamp((el - 1.4) / 1.8));
    const target = sep * (1 - scrollK * .75) * (1 + sm.y * -.06);
    explode += (target - explode) * .12;
    sm.lerp(mouse, .05);
    tilt.rotation.set(-.05 - turn * .9 + sm.y * .05, 0, 0);
    stack.rotation.set(0, -turn * .62 + sm.x * .14 + Math.sin(t * .25) * .04, 0);
    stack.rotation.order = 'YXZ';
    const gap = 1.05 * explode;
    layers.forEach((L, i) => {
      L.g.position.z = (2 - i) * gap - i * .02;
      L.g.position.y = Math.sin(t * .8 + i) * .04 * explode;
      L.m.material.opacity = i === 0 ? 1 : clamp(explode * 1.6 - i * .12);
      L.lab.material.opacity = wide ? clamp((explode - .55) * 3 - i * .15) : 0;
    });
    // rails
    const pa = railGeo.attributes.position.array, top = 2 * gap, back = -2 * gap;
    corners.forEach(([sx, sy], k) => { pa.set([sx * PW / 2, sy * PH / 2, top, sx * PW / 2, sy * PH / 2, back], k * 6); });
    railGeo.attributes.position.needsUpdate = true; railMat.opacity = .55 * explode;
    pulses.forEach(p => { const [sx, sy] = corners[p.userData.corner]; const f = (t * .35 + p.userData.off) % 1; p.position.set(sx * PW / 2, sy * PH / 2, top + (back - top) * f); p.material.opacity = explode * Math.sin(f * Math.PI); });
    const a = w / h; stack.position.set(wide ? (a > 1.6 ? -1.1 : -.2) : 0, wide ? -.2 : 0, 0); stack.scale.setScalar(wide ? (a > 1.6 ? .8 : .66) : Math.min(.62, a * .95));
    camera.position.set(sm.x * .4, -sm.y * .25 + .2, wide ? 18 : 19);
    camera.lookAt(0, 0, 0);
    dust.rotation.y = t * .02;
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
}
