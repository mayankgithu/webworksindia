/* Web Works India — service holograms.
   One shared WebGL renderer draws every [data-holo] slot that is on screen, then copies the
   pixels into that slot's own 2D canvas. Slots stay in normal page flow (no scroll lag) and
   the page never needs more than one WebGL context. */
import * as THREE from '/vendor/three.module.min.js';

const OR = 0xF38028, HI = 0xFFB061, ICE = 0x9FE7FF, GREEN = 0x2BD46F;
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = matchMedia('(max-width: 760px)').matches || matchMedia('(pointer: coarse)').matches;
const ADD = THREE.AdditiveBlending;

/* ---------- material + geometry helpers ---------- */
const lineMat = (c = OR, o = 0.9) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o, blending: ADD, depthWrite: false });
const faceMat = (c = OR, o = 0.07) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: ADD, depthWrite: false, side: THREE.DoubleSide });
const edges = (geo, c, o) => new THREE.LineSegments(new THREE.EdgesGeometry(geo, 1), lineMat(c, o));
function holo(geo, c = OR, fo = 0.06, lo = 0.85) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, faceMat(c, fo)), edges(geo, c, lo));
  return g;
}
function rrShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
const panel = (w, h, r, c = OR, fo = 0.06, lo = 0.85) => holo(new THREE.ShapeGeometry(rrShape(w, h, r), 6), c, fo, lo);
function circleLine(r, c = OR, o = 0.5, seg = 96) {
  const pts = new THREE.EllipseCurve(0, 0, r, r).getPoints(seg).map(p => new THREE.Vector3(p.x, p.y, 0));
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), lineMat(c, o));
}
function segs(pairs, c = OR, o = 0.6) { // [[x1,y1,x2,y2],...] at z=0
  const a = []; pairs.forEach(([x1, y1, x2, y2]) => a.push(x1, y1, 0, x2, y2, 0));
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3));
  return new THREE.LineSegments(g, lineMat(c, o));
}
let dotTex;
function dotTexture() {
  if (dotTex) return dotTex;
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return (dotTex = new THREE.CanvasTexture(c));
}
function dust(n, r, c = HI, size = 0.06) {
  const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(r * (0.5 + Math.random() * 0.5)); v.toArray(p, i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color: c, size, map: dotTexture(), transparent: true, opacity: 0.8, blending: ADD, depthWrite: false }));
}
const glow = (c = OR, s = 1, o = 0.5) => {
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(), color: c, transparent: true, opacity: o, blending: ADD, depthWrite: false }));
  m.scale.setScalar(s); return m;
};
function floorGrid(size = 4, div = 10, o = 0.12) {
  const g = new THREE.GridHelper(size, div, OR, OR);
  g.material.transparent = true; g.material.opacity = o; g.material.blending = ADD; g.material.depthWrite = false;
  return g;
}

/* ---------- the eight objects ---------- */
const BUILD = {
  /* browser window that separates into its layers */
  websites(root) {
    const frame = panel(3.2, 2.1, 0.14, OR, 0.05, 0.9); root.add(frame);
    frame.add(segs([[-1.6, 0.72, 1.6, 0.72]], OR, 0.5));
    [-1.42, -1.28, -1.14].forEach((x, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.035, 16), faceMat([0xff5f57, 0xfebc2e, 0x28c840][i], 0.9)); d.position.set(x, 0.88, 0.01); frame.add(d); });
    const url = panel(1.3, 0.14, 0.07, OR, 0.04, 0.4); url.position.set(0.1, 0.88, 0.01); frame.add(url);
    const layers = [];
    const hero = panel(2.7, 0.62, 0.06, HI, 0.08, 0.8); hero.position.y = 0.25;
    hero.add(segs([[-1.2, 0.14, 0.2, 0.14], [-1.2, 0.02, -0.1, 0.02], [-1.2, -0.14, -0.7, -0.14]], ICE, 0.7));
    const btn = panel(0.42, 0.13, 0.06, OR, 0.5, 1); btn.position.set(0.95, -0.12, 0.01); hero.add(btn);
    layers.push([hero, 0.35]);
    [-0.92, 0, 0.92].forEach((x, i) => {
      const c = panel(0.8, 0.62, 0.06, i === 1 ? HI : OR, 0.07, 0.75); c.position.set(x, -0.52, 0);
      c.add(segs([[-0.3, 0.12, 0.25, 0.12], [-0.3, 0, 0.1, 0]], ICE, 0.55));
      layers.push([c, 0.7 + i * 0.12]);
    });
    layers.forEach(([l]) => frame.add(l));
    const scan = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 0.02), faceMat(ICE, 0.6)); frame.add(scan);
    root.add(dust(40, 2.6, HI, 0.05));
    root.rotation.set(0.25, -0.45, 0);
    return (t, s) => {
      const ex = 0.25 + 0.2 * Math.sin(t * 0.9) + s.hover * 0.45;
      layers.forEach(([l, k]) => { l.position.z = ex * k; });
      scan.position.set(0, 1 - ((t * 0.35) % 1) * 2, 0.02 + ex * 0.4);
      root.rotation.y = -0.45 + s.px * 0.35 + Math.sin(t * 0.3) * 0.08;
      root.rotation.x = 0.22 + s.py * 0.2;
      root.position.y = Math.sin(t * 0.8) * 0.05;
    };
  },

  /* shopping bag with coins in orbit */
  ecommerce(root) {
    const bagGeo = new THREE.CylinderGeometry(0.95, 0.78, 1.6, 4, 1); bagGeo.rotateY(Math.PI / 4);
    const bag = holo(bagGeo, OR, 0.07, 0.95); root.add(bag);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.035, 8, 40, Math.PI), faceMat(HI, 0.9)); handle.position.y = 0.8; bag.add(handle);
    const tag = panel(0.5, 0.3, 0.05, HI, 0.15, 1); tag.position.set(0, 0.05, 0.68); tag.rotation.x = -0.1; bag.add(tag);
    tag.add(segs([[-0.15, 0.04, 0.15, 0.04], [-0.15, -0.06, 0.05, -0.06]], ICE, 0.9));
    const orbit = new THREE.Group(); orbit.rotation.x = 1.25; root.add(orbit);
    orbit.add(circleLine(1.75, ICE, 0.25));
    const coins = [];
    for (let i = 0; i < 6; i++) {
      const c = holo(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 28), i % 2 ? HI : OR, 0.25, 1);
      coins.push(c); orbit.add(c);
    }
    root.add(glow(OR, 3.2, 0.25));
    root.add(dust(50, 2.6));
    return (t, s) => {
      coins.forEach((c, i) => {
        const a = t * 0.6 + (i / coins.length) * Math.PI * 2;
        c.position.set(Math.cos(a) * 1.75, Math.sin(a) * 1.75, 0);
        c.rotation.set(t * 2 + i, 0, t + i);
      });
      bag.rotation.y = t * 0.35 + s.px * 0.6;
      bag.position.y = Math.sin(t * 1.1) * 0.08 - s.hover * 0.1;
      handle.rotation.z = Math.sin(t * 2) * 0.05;
      root.rotation.x = 0.1 + s.py * 0.25;
      orbit.rotation.z = s.hover * 0.6;
    };
  },

  /* modules that click together into a system */
  'web-apps'(root) {
    const g = new THREE.BoxGeometry(0.42, 0.42, 0.42);
    const cubes = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      const lit = Math.random() < 0.22;
      const c = holo(g, lit ? HI : OR, lit ? 0.22 : 0.05, lit ? 1 : 0.7);
      c.userData = { base: new THREE.Vector3(x, y, z).multiplyScalar(0.5), ph: Math.random() * 6, lit };
      cubes.push(c); root.add(c);
    }
    const core = glow(HI, 1.6, 0.6); root.add(core);
    root.add(dust(40, 2.6, ICE, 0.05));
    return (t, s) => {
      const e = Math.pow(0.5 + 0.5 * Math.sin(t * 0.8), 3) * 0.75 + s.hover * 0.6;
      cubes.forEach(c => {
        const u = c.userData;
        c.position.copy(u.base).multiplyScalar(1 + e);
        c.rotation.set(e * Math.sin(u.ph) * 1.2, e * Math.cos(u.ph) * 1.2, 0);
        if (u.lit) c.children[0].material.opacity = 0.12 + 0.18 * (0.5 + 0.5 * Math.sin(t * 3 + u.ph));
      });
      core.material.opacity = 0.25 + (1 - Math.min(e, 1)) * 0.5;
      root.rotation.y = t * 0.3 + s.px * 0.5;
      root.rotation.x = 0.5 + s.py * 0.3;
    };
  },

  /* live bar chart with a trend line */
  'erp-crm'(root) {
    const base = new THREE.Group(); root.add(base);
    base.add(floorGrid(3.2, 8, 0.18));
    const bars = [], box = new THREE.BoxGeometry(1, 1, 1);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
      const b = holo(box, j === 1 ? HI : OR, j === 1 ? 0.14 : 0.06, 0.85);
      b.userData = { x: -1.2 + i * 0.6, z: -0.6 + j * 0.6, ph: i * 0.7 + j * 1.3, h: 0.4 + i * 0.28 + j * 0.1 };
      bars.push(b); base.add(b);
    }
    const N = 7, pts = [];
    for (let i = 0; i < N; i++) pts.push(new THREE.Vector3(-1.5 + i * 0.5, 1.2 + i * 0.16 + (i % 2 ? -0.12 : 0.1), 0.9));
    const curve = new THREE.CatmullRomCurve3(pts);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(120));
    const trend = new THREE.Line(lineGeo, lineMat(ICE, 1)); base.add(trend);
    const nodes = pts.map(p => { const n = glow(ICE, 0.25, 0.9); n.position.copy(p); base.add(n); return n; });
    root.add(dust(30, 2.6));
    return (t, s) => {
      bars.forEach(b => {
        const u = b.userData, h = 0.15 + u.h * (0.75 + 0.25 * Math.sin(t * 1.4 + u.ph)) * (0.6 + s.hover * 0.5);
        b.scale.set(0.34, h, 0.34); b.position.set(u.x, h / 2, u.z);
      });
      const k = (t * 0.25) % 1.3;
      trend.geometry.setDrawRange(0, Math.floor(Math.min(k, 1) * 121));
      nodes.forEach((n, i) => n.material.opacity = k * N > i ? 0.9 : 0);
      base.rotation.y = -0.6 + s.px * 0.5 + Math.sin(t * 0.25) * 0.15;
      root.rotation.x = 0.35 + s.py * 0.2;
      root.position.y = -0.6;
    };
  },

  /* radar sweep + magnifier */
  seo(root) {
    const radar = new THREE.Group(); radar.rotation.x = -1.15; radar.position.y = -0.45; root.add(radar);
    [0.5, 1, 1.5].forEach((r, i) => radar.add(circleLine(r, OR, 0.55 - i * 0.12)));
    radar.add(segs([[-1.6, 0, 1.6, 0], [0, -1.6, 0, 1.6]], OR, 0.25));
    const sweep = new THREE.Mesh(new THREE.CircleGeometry(1.5, 48, 0, 0.9), faceMat(OR, 0.28)); radar.add(sweep);
    const beam = segs([[0, 0, 1.5, 0]], HI, 1); radar.add(beam);
    const blips = [];
    for (let i = 0; i < 7; i++) {
      const a = Math.random() * Math.PI * 2, r = 0.35 + Math.random() * 1.1;
      const b = glow(i === 0 ? ICE : HI, i === 0 ? 0.42 : 0.28, 0); b.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.02);
      b.userData = { a, life: 0 }; blips.push(b); radar.add(b);
    }
    const lens = new THREE.Group(); lens.position.set(0.25, 0.75, 0.3); root.add(lens);
    lens.add(holo(new THREE.TorusGeometry(0.42, 0.06, 10, 48), HI, 0.25, 0.9));
    lens.add(new THREE.Mesh(new THREE.CircleGeometry(0.4, 40), faceMat(ICE, 0.08)));
    const h = holo(new THREE.CylinderGeometry(0.06, 0.07, 0.6, 10), HI, 0.25, 0.9); h.position.set(0.48, -0.48, 0); h.rotation.z = Math.PI / 4; lens.add(h);
    root.add(dust(40, 2.4, HI, 0.05));
    return (t, s) => {
      const a = (t * 1.3) % (Math.PI * 2);
      sweep.rotation.z = a - 0.9; beam.rotation.z = a;
      blips.forEach(b => {
        let d = (a - b.userData.a) % (Math.PI * 2); if (d < 0) d += Math.PI * 2;
        b.material.opacity = Math.max(0, 1 - d / 2.4);
      });
      lens.position.y = 0.75 + Math.sin(t * 1.2) * 0.1;
      lens.rotation.set(s.py * 0.4, -0.3 + s.px * 0.6 + Math.sin(t * 0.7) * 0.25, 0);
      root.rotation.y = s.px * 0.25; radar.rotation.z = s.hover * 0.5;
    };
  },

  /* AI core with chat bubbles in orbit */
  automation(root) {
    const core = holo(new THREE.IcosahedronGeometry(0.62, 1), OR, 0.06, 0.9); root.add(core);
    const inner = holo(new THREE.IcosahedronGeometry(0.32, 0), HI, 0.3, 1); root.add(inner);
    root.add(glow(OR, 2.6, 0.35));
    const rings = [], bubbles = [];
    [[1.3, 0.4, 0], [1.6, -0.6, 0.5], [1.9, 1.2, -0.4]].forEach(([r, rx, rz], i) => {
      const g = new THREE.Group(); g.rotation.set(rx, 0, rz); g.add(circleLine(r, i === 1 ? GREEN : ICE, 0.3)); root.add(g); rings.push([g, r]);
      for (let k = 0; k < 2; k++) {
        const green = (i + k) % 2 === 0;
        const b = panel(0.5, 0.3, 0.12, green ? GREEN : HI, 0.18, 1);
        b.add(segs([[-0.16, 0.04, 0.16, 0.04], [-0.16, -0.05, 0.06, -0.05]], 0xffffff, 0.7));
        b.userData = { ring: g, r, off: k * Math.PI + i, sp: 0.35 + i * 0.1 };
        bubbles.push(b); root.add(b);
      }
    });
    const packets = dust(60, 2.2, ICE, 0.06); root.add(packets);
    const v = new THREE.Vector3();
    return (t, s) => {
      const p = 1 + Math.sin(t * 2.2) * 0.05 + s.hover * 0.15;
      core.scale.setScalar(p); core.rotation.set(t * 0.2, t * 0.3, 0); inner.rotation.set(-t * 0.6, -t * 0.4, 0);
      bubbles.forEach(b => {
        const u = b.userData, a = t * u.sp + u.off;
        v.set(Math.cos(a) * u.r, Math.sin(a) * u.r, 0).applyEuler(u.ring.rotation);
        b.position.copy(v); b.quaternion.copy(root.quaternion).invert();
      });
      packets.rotation.y = t * 0.15;
      root.rotation.y = s.px * 0.5; root.rotation.x = s.py * 0.3;
    };
  },

  /* design: screens fanning out with a pen curve */
  design(root) {
    const stack = new THREE.Group(); root.add(stack);
    const panels = [];
    for (let i = 0; i < 4; i++) {
      const p = panel(1.9, 1.25, 0.1, i === 3 ? HI : OR, i === 3 ? 0.1 : 0.05, 0.85);
      if (i === 3) {
        p.add(segs([[-0.75, 0.38, 0.2, 0.38], [-0.75, 0.25, -0.1, 0.25]], ICE, 0.8));
        const a = panel(0.5, 0.36, 0.05, OR, 0.2, 0.9); a.position.set(-0.45, -0.18, 0.01); p.add(a);
        const b = panel(0.5, 0.36, 0.05, OR, 0.08, 0.7); b.position.set(0.15, -0.18, 0.01); p.add(b);
        const c = new THREE.Mesh(new THREE.CircleGeometry(0.17, 32), faceMat(HI, 0.4)); c.position.set(0.65, -0.18, 0.01); p.add(c);
      } else p.add(segs([[-0.8, 0.45, 0.8, 0.45], [0.2, -0.55, 0.2, 0.45]], OR, 0.25));
      panels.push(p); stack.add(p);
    }
    const curve = new THREE.CubicBezierCurve3(new THREE.Vector3(-1.5, -1, 0.9), new THREE.Vector3(-0.6, 1.4, 0.9), new THREE.Vector3(0.6, -1.4, 0.9), new THREE.Vector3(1.5, 0.9, 0.9));
    const pen = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(120)), lineMat(ICE, 1)); root.add(pen);
    [0, 1 / 3, 2 / 3, 1].forEach(k => {
      const q = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.09), faceMat(ICE, 0.9)); q.position.copy(curve.getPoint(k)); root.add(q);
    });
    root.add(dust(30, 2.6, ICE, 0.05));
    return (t, s) => {
      const f = 0.45 + 0.35 * Math.sin(t * 0.8) + s.hover * 0.5;
      panels.forEach((p, i) => {
        const k = i - 1.5;
        p.position.set(k * 0.25 * f, -k * 0.08 * f, i * 0.28 * (0.5 + f));
        p.rotation.y = -k * 0.12 * f;
      });
      pen.geometry.setDrawRange(0, Math.floor(((t * 0.3) % 1.2) / 1.2 * 121));
      stack.rotation.y = -0.4 + s.px * 0.45; stack.rotation.x = 0.15 + s.py * 0.2;
      pen.rotation.copy(stack.rotation);
    };
  },

  /* shield with orbiting rings and a pulse */
  care(root) {
    const sh = new THREE.Shape();
    sh.moveTo(0, 1.05); sh.quadraticCurveTo(0.5, 0.9, 0.85, 0.8); sh.lineTo(0.85, 0.05);
    sh.quadraticCurveTo(0.8, -0.65, 0, -1.1); sh.quadraticCurveTo(-0.8, -0.65, -0.85, 0.05); sh.lineTo(-0.85, 0.8); sh.quadraticCurveTo(-0.5, 0.9, 0, 1.05);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.18, bevelEnabled: false, curveSegments: 18 }); geo.center();
    const shield = holo(geo, OR, 0.1, 0.95); root.add(shield);
    const tick = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.32, 0, 0.11), new THREE.Vector3(-0.08, -0.25, 0.11), new THREE.Vector3(0.36, 0.25, 0.11)]), lineMat(HI, 1));
    shield.add(tick);
    shield.add(glow(OR, 2.4, 0.3));
    const rings = [[1.35, 1.2, 0.2], [1.55, 0.3, 1.1], [1.75, -0.8, -0.5]].map(([r, x, z], i) => {
      const g = new THREE.Group(); g.rotation.set(x, 0, z);
      const c = circleLine(r, i === 1 ? ICE : OR, 0.45); g.add(c);
      const bead = glow(i === 1 ? ICE : HI, 0.3, 1); bead.position.x = r; g.add(bead);
      root.add(g); return g;
    });
    const pulse = circleLine(1, HI, 0.8); root.add(pulse);
    root.add(dust(50, 2.5));
    return (t, s) => {
      shield.rotation.y = Math.sin(t * 0.6) * 0.45 + s.px * 0.5;
      shield.rotation.x = s.py * 0.3;
      shield.position.y = Math.sin(t * 1.1) * 0.06;
      rings.forEach((g, i) => { g.rotation.y = t * (0.4 + i * 0.15) * (i % 2 ? -1 : 1); });
      const p = (t * 0.5) % 1; pulse.scale.setScalar(0.9 + p * 1.4); pulse.material.opacity = (1 - p) * 0.6 * (0.6 + s.hover);
    };
  },
};
BUILD.default = BUILD.websites;

/* ---------- shared renderer ---------- */
const slots = [...document.querySelectorAll('[data-holo]')];
const webgl = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();

if (slots.length && webgl) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.setScissorTest(true);
  renderer.setClearColor(0x000000, 0);
  let rw = 0, rh = 0;
  const DPR = Math.min(devicePixelRatio || 1, MOBILE ? 1.5 : 2);

  const views = slots.map(el => {
    const cv = document.createElement('canvas'); cv.className = 'holo-c'; cv.setAttribute('aria-hidden', 'true');
    el.appendChild(cv); el.classList.add('live');
    return { el, cv, ctx: cv.getContext('2d'), key: el.dataset.holo, visible: false, built: null, hover: 0, px: 0, py: 0, hov: false };
  });
  const io = new IntersectionObserver(es => es.forEach(e => { const v = views.find(v => v.el === e.target); v.visible = e.isIntersecting; }), { rootMargin: '120px 0px' });
  views.forEach(v => {
    io.observe(v.el);
    const host = v.el.closest('[data-holo-host]') || v.el;
    host.addEventListener('pointerenter', () => v.hov = true);
    host.addEventListener('pointerleave', () => v.hov = false);
  });

  let mx = innerWidth / 2, my = innerHeight / 2;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function build(v) {
    const scene = new THREE.Scene(), root = new THREE.Group(); scene.add(root);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100); camera.position.set(0, 0, 7.2);
    const update = (BUILD[v.key] || BUILD.default)(root);
    v.built = { scene, camera, update, t0: performance.now() / 1000 + Math.random() * 10 };
  }

  const loop = now => {
    requestAnimationFrame(loop);
    if (document.hidden) return;
    const t = now / 1000;
    for (const v of views) {
      if (!v.visible) continue;
      const r = v.el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const w = Math.round(r.width * DPR), h = Math.round(r.height * DPR);
      if (w > rw || h > rh) { rw = Math.max(rw, w); rh = Math.max(rh, h); renderer.setSize(rw, rh, false); }
      if (v.cv.width !== w || v.cv.height !== h) { v.cv.width = w; v.cv.height = h; }
      if (!v.built) build(v);
      const b = v.built;
      b.camera.aspect = w / h;
      // keep the object inside narrow slots
      b.camera.position.z = 7.2 * Math.max(1, 1.15 / b.camera.aspect);
      b.camera.updateProjectionMatrix();
      const tx = Math.max(-1, Math.min(1, (mx - (r.left + r.width / 2)) / (innerWidth / 2)));
      const ty = Math.max(-1, Math.min(1, (my - (r.top + r.height / 2)) / (innerHeight / 2)));
      v.px += (tx - v.px) * 0.06; v.py += (ty - v.py) * 0.06;
      v.hover += ((v.hov ? 1 : 0) - v.hover) * 0.08;
      b.update(REDUCE ? 2 : t - b.t0 + 10, { px: v.px, py: v.py, hover: v.hover });
      renderer.setViewport(0, 0, w, h); renderer.setScissor(0, 0, w, h);
      renderer.clear();
      renderer.render(b.scene, b.camera);
      v.ctx.clearRect(0, 0, w, h);
      v.ctx.drawImage(renderer.domElement, 0, rh - h, w, h, 0, 0, w, h);
    }
  };
  requestAnimationFrame(loop);
}
