/* Web Works India — hero globe: land dots, arcs out of Lucknow, drag to spin */
import * as THREE from '/vendor/three.module.min.js';
import LAND from '/js/land.js';

const canvas = document.getElementById('globe');
const wrap = document.getElementById('globe-wrap');
const label = document.getElementById('globe-label');
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = matchMedia('(max-width: 760px)').matches || matchMedia('(pointer: coarse)').matches;
const webgl = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
const HQ = [26.85, 80.95]; // Lucknow
const CITIES = [[28.61, 77.21], [19.08, 72.88], [12.97, 77.59], [25.2, 55.27], [51.51, -0.13], [40.71, -74.0], [1.35, 103.82], [-33.87, 151.21], [52.52, 13.4], [37.77, -122.42], [22.57, 88.36], [35.68, 139.69]];

function vec(lat, lon, r = 1) {
  const phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}

function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !MOBILE, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.5 : 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 5.3);

  const globe = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.add(globe); scene.add(tilt);

  /* ---- solid core (hides the far side) ---- */
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(0.985, 64, 64), new THREE.MeshBasicMaterial({ color: 0x0d1016 })));

  /* ---- land dots ---- */
  const bin = atob(LAND), dv = new DataView(new Uint8Array([...bin].map(c => c.charCodeAt(0))).buffer);
  const count = dv.byteLength / 4, pos = new Float32Array(count * 3), near = new Float32Array(count);
  const scatter = new Float32Array(count * 3), rnd = new Float32Array(count);
  const hq = vec(HQ[0], HQ[1]), tmpV = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const v = vec(dv.getInt16(i * 4, true) / 100, dv.getInt16(i * 4 + 2, true) / 100, 1.0);
    v.toArray(pos, i * 3);
    near[i] = Math.max(0, 1 - v.distanceTo(hq) / 0.55); // glow around India
    // each dot starts somewhere out in space and flies home
    tmpV.copy(v).multiplyScalar(1.6 + Math.random() * 3.2).add(new THREE.Vector3().randomDirection().multiplyScalar(0.9)).toArray(scatter, i * 3);
    rnd[i] = Math.random();
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dotGeo.setAttribute('near', new THREE.BufferAttribute(near, 1));
  dotGeo.setAttribute('scatter', new THREE.BufferAttribute(scatter, 3));
  dotGeo.setAttribute('rnd', new THREE.BufferAttribute(rnd, 1));
  const dotMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uSize: { value: 0 }, uTime: { value: 0 }, uReveal: { value: 0 } },
    vertexShader: `
      attribute float near, rnd; attribute vec3 scatter; uniform float uSize, uTime, uReveal; varying float vNear, vFace, vShow;
      void main(){
        float k = clamp(uReveal * 1.45 - rnd * .45, 0., 1.);
        k = 1. - pow(1. - k, 4.);
        vec3 p = mix(scatter, position, k);
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        vec3 n = normalize(normalMatrix * position);
        vFace = mix(1., n.z, k); vNear = mix(1., near, k);
        vShow = smoothstep(0., .25, uReveal + rnd * .1) * (.55 + .45 * k);
        float tw = .85 + .15 * sin(uTime * 2. + position.x * 40. + position.z * 30.);
        gl_PointSize = uSize * (.55 + .45 * max(n.z, 0.)) * (1. + near * .6) * tw * (1. + (1. - k) * .8) / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying float vNear, vFace, vShow;
      void main(){
        vec2 c = gl_PointCoord - .5; float d = length(c); if (d > .5) discard;
        vec3 base = mix(vec3(.62,.66,.74), vec3(1.,.55,.18), vNear);
        float a = smoothstep(.5, .2, d) * (.25 + .75 * smoothstep(-.1, .6, vFace)) * vShow;
        gl_FragColor = vec4(base, a);
      }`
  });
  globe.add(new THREE.Points(dotGeo, dotMat));

  /* ---- atmosphere ---- */
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.0, 64, 64), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    uniforms: { uOp: { value: 0 } },
    vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 1.16, 1.); }`,
    fragmentShader: `varying vec3 vN; uniform float uOp; void main(){ float i = pow(clamp(.62 - vN.z, 0., 1.), 3.); gl_FragColor = vec4(.95, .42, .12, 1.) * i * .75 * uOp; }`
  }));
  scene.add(atmo);
  const rim = new THREE.Mesh(new THREE.SphereGeometry(1.0, 64, 64), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uOp: { value: 0 } },
    vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 1.002, 1.); }`,
    fragmentShader: `varying vec3 vN; uniform float uOp; void main(){ float i = pow(1. - abs(vN.z), 4.); gl_FragColor = vec4(1., .55, .25, 1.) * i * .35 * uOp; }`
  }));
  scene.add(rim);

  /* ---- arcs from Lucknow ---- */
  const arcMats = [];
  const SEG = 64;
  CITIES.forEach((c, idx) => {
    const a = hq.clone(), b = vec(c[0], c[1]);
    const ang = a.angleTo(b), lift = Math.min(0.06 + ang * 0.13, 0.32);
    const pts = new Float32Array((SEG + 1) * 3), ts = new Float32Array(SEG + 1);
    for (let i = 0; i <= SEG; i++) {
      const t = i / SEG;
      const p = new THREE.Vector3().copy(a).lerp(b, t).normalize().multiplyScalar(1 + Math.sin(t * Math.PI) * lift);
      // slerp-ish: lerp+normalize is fine for arcs under ~150°
      p.toArray(pts, i * 3); ts[i] = t;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    g.setAttribute('t', new THREE.BufferAttribute(ts, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uOff: { value: idx * 0.37 }, uSpeed: { value: 0.16 + (idx % 4) * 0.03 }, uOp: { value: 0 } },
      vertexShader: `attribute float t; varying float vT; void main(){ vT = t; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `
        varying float vT; uniform float uTime, uOff, uSpeed, uOp;
        void main(){
          float head = fract(uTime * uSpeed + uOff) * 1.6 - .3;
          float d = head - vT;
          float trail = smoothstep(.35, 0., d) * step(0., d);
          float a = .1 + trail * .95;
          vec3 col = mix(vec3(1.,.45,.12), vec3(1.,.82,.55), trail);
          gl_FragColor = vec4(col, a * uOp);
        }`
    });
    arcMats.push(m);
    globe.add(new THREE.Line(g, m));
  });

  /* ---- Lucknow marker ---- */
  const marker = new THREE.Group();
  marker.position.copy(vec(HQ[0], HQ[1], 1.004));
  marker.lookAt(vec(HQ[0], HQ[1], 2));
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.018, 24), new THREE.MeshBasicMaterial({ color: 0xffb061 }));
  const rings = [0, 1].map(() => {
    const r = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.036, 48), new THREE.MeshBasicMaterial({ color: 0xf38028, transparent: true, depthWrite: false }));
    marker.add(r); return r;
  });
  marker.add(dot); globe.add(marker);

  /* ---- face India at start ---- */
  const base = Math.atan2(-hq.x, hq.z);
  const SPIN = 2.4; // extra turn the globe unwinds while it appears
  let drift = -0.25, user = 0; // start slightly east so the drift carries India into the middle
  globe.rotation.y = base + SPIN + drift;
  tilt.rotation.x = 0.42; tilt.rotation.z = -0.12;

  /* ---- interaction ---- */
  let dragging = false, lastX = 0, vel = 0, px = 0, py = 0, tx = 0, ty = 0;
  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; vel = dx * 0.005; user += vel; });
  const end = () => { dragging = false; };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  if (!MOBILE) addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - 0.5); ty = (e.clientY / innerHeight - 0.5); }, { passive: true });

  /* ---- size ---- */
  const resize = () => {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    dotMat.uniforms.uSize.value = h * 0.0135 * renderer.getPixelRatio();
  };
  new ResizeObserver(resize).observe(wrap); resize();

  /* ---- run only when visible ---- */
  let visible = true, running = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(wrap);
  document.addEventListener('visibilitychange', kick);

  let started = null;
  const start = () => { if (started === null) started = performance.now(); kick(); };
  if (document.documentElement.classList.contains('ready')) start(); else addEventListener('wwi:ready', start, { once: true });

  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  function kick() { if (!running && visible && !document.hidden && started !== null) { running = true; clock.getDelta(); requestAnimationFrame(frame); } }

  function frame() {
    if (!visible || document.hidden) { running = false; return; }
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    const life = (performance.now() - started) / 1000;
    const k = REDUCE ? 1 : Math.min(life / 2.2, 1), ek = 1 - Math.pow(1 - k, 3);

    dotMat.uniforms.uTime.value = t;
    dotMat.uniforms.uReveal.value = REDUCE ? 1 : Math.min(life / 2.8, 1);
    atmo.material.uniforms.uOp.value = ek; rim.material.uniforms.uOp.value = ek;
    const arcOp = Math.min(1, Math.max(0, (life - 1.2) / 1.2));
    arcMats.forEach(m => { m.uniforms.uTime.value = t; m.uniforms.uOp.value = arcOp; });

    // intro spin settles onto India, then a slow drift plus whatever the user adds by dragging
    if (!dragging) { vel *= 0.94; user += vel; }
    if (!REDUCE) drift += dt * 0.05;
    globe.rotation.y = base + SPIN * (1 - ek) + drift + user;
    const s = 0.86 + 0.14 * ek; tilt.scale.setScalar(s);
    px += (tx - px) * 0.04; py += (ty - py) * 0.04;
    tilt.rotation.x = 0.42 + py * 0.18; tilt.rotation.z = -0.12 - px * 0.05;
    tilt.position.x = px * 0.06;

    rings.forEach((r, i) => { const p = (t * 0.6 + i * 0.5) % 1; r.scale.setScalar(1 + p * 2.6); r.material.opacity = (1 - p) * 0.9 * ek; });

    // floating label over Lucknow when it faces us
    marker.getWorldPosition(tmp);
    const facing = tmp.clone().normalize().z;
    tmp.project(camera);
    if (label) {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      label.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w + 14}px,${(-tmp.y * 0.5 + 0.5) * h - 34}px)`;
      label.classList.toggle('on', facing > 0.25 && k >= 1);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
}

if (canvas && webgl) init(); else wrap && wrap.remove();
