/* Web Works India — site interactions */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const IO = 'cubic-bezier(.77,0,.18,1)';
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/\\[]{}';

  const ready = () => { if (root.classList.contains('ready')) return; root.classList.add('ready'); dispatchEvent(new Event('wwi:ready')); };

  /* ================= smooth scroll ================= */
  let lenis = null;
  // smooth wheel scrolling on desktop only: phones already scroll natively and smoothly, and Lenis'
  // touch listeners would make every swipe wait for the main thread
  if (window.Lenis && !REDUCE && fine) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const lock = on => { root.classList.toggle('scroll-lock', on); if (lenis) on ? lenis.stop() : lenis.start(); };
  const scrollToEl = el => lenis ? lenis.scrollTo(el, { offset: -70, duration: 1.4 }) : el.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });

  /* ================= scramble text ================= */
  function scramble(el, dur = 900) {
    const final = el.dataset.text || (el.dataset.text = el.textContent);
    if (REDUCE) { el.textContent = final; return; }
    el.setAttribute('aria-label', final);
    const t0 = performance.now();
    const step = now => {
      const p = clamp((now - t0) / dur);
      const fixed = Math.floor(p * final.length);
      let out = '';
      for (let i = 0; i < final.length; i++) out += i < fixed || final[i] === ' ' ? final[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ================= intro ================= */
  const intro = $('#intro');
  const runIntro = intro && !root.classList.contains('no-intro');

  if (!runIntro) {
    root.classList.add('intro-done');
    intro && intro.remove();
    requestAnimationFrame(() => requestAnimationFrame(ready));
  } else {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    scrollTo(0, 0);
    lock(true);
    playIntro();
  }

  async function playIntro() {
    const brand = $('#brand');
    const log = $('#intro-log');
    const lines = ['wwi.core v2 :: boot', 'link node lucknow-226021 ........ ok', 'load design system .............. ok', 'compile interface ............... ok', 'sync globe · 7,359 nodes ........ ok', 'all systems nominal'];
    lines.forEach((l, i) => setTimeout(() => {
      if (!log) return;
      const p = document.createElement('p'); p.textContent = '> ' + l; if (i === lines.length - 1) p.className = 'ok';
      log.appendChild(p); scramble(p, 380);
    }, 120 + i * 330));

    // measure only once the fonts are in, so the clone lines up with the header logo exactly
    await Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), sleep(1500)]);
    const r = brand.getBoundingClientRect();
    const vw = innerWidth, vh = innerHeight;

    const fly = document.createElement('div');
    fly.className = 'brand fly';
    fly.setAttribute('aria-hidden', 'true');
    fly.innerHTML = brand.innerHTML;
    // <use> content can't be styled per-part, so inline the symbol for the draw-on animation
    const sym = $('#mark'), svg = $('.brand-mark', fly);
    svg.setAttribute('viewBox', sym.getAttribute('viewBox'));
    svg.innerHTML = sym.innerHTML;
    let n = 0;
    $$('.brand-word b, .brand-word small', fly).forEach(el => {
      el.innerHTML = [...el.textContent].map(ch => `<i style="animation-delay:${(0.95 + n++ * 0.035).toFixed(3)}s">${ch === ' ' ? '&nbsp;' : ch}</i>`).join('');
    });
    const k = Math.min((vw < 760 ? vw * 0.8 : Math.min(vw * 0.5, 600)) / r.width, 5);
    const tx = vw / 2 - (r.width * k) / 2 - r.left;
    const ty = vh / 2 - (r.height * k) / 2 - r.top - vh * 0.04;
    const from = `translate(${tx}px,${ty}px) scale(${k})`;
    Object.assign(fly.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', transform: from });
    intro.style.setProperty('--tag-y', (r.height * k) / 2 - vh * 0.04 + 26 + 'px');
    document.body.appendChild(fly);

    const num = $('#intro-num'), bar = $('#intro-bar');
    const DUR = 2500, t0 = performance.now();
    let done = false, raf;
    const ease = t => 1 - Math.pow(1 - t, 3);
    const tick = now => {
      const p = Math.min((now - t0) / DUR, 1), v = ease(p);
      num.textContent = String(Math.round(v * 100)).padStart(3, '0');
      bar.style.transform = `scaleX(${v})`;
      if (p < 1) raf = requestAnimationFrame(tick); else finish();
    };
    raf = requestAnimationFrame(tick);
    $('#intro-skip').addEventListener('click', finish);

    function finish() {
      if (done) return; done = true;
      cancelAnimationFrame(raf);
      num.textContent = '100'; bar.style.transform = 'scaleX(1)';
      fly.getAnimations({ subtree: true }).forEach(a => { try { a.finish(); } catch (e) {} });
      setTimeout(() => {
        intro.classList.add('out');
        const a = fly.animate([{ transform: from }, { transform: 'translate(0,0) scale(1)' }], { duration: 1100, easing: IO, fill: 'forwards' });
        setTimeout(ready, 520);
        a.onfinish = () => {
          root.classList.add('intro-done');
          lock(false);
          fly.remove(); intro.remove();
          try { sessionStorage.setItem('wwi-intro', '1'); } catch (e) {}
        };
      }, 220);
    }
  }

  /* ================= page transitions ================= */
  const pt = $('#pt');
  if (pt) {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith('/crm') || url.pathname.startsWith('/api')) return;
      if (url.pathname === location.pathname) {
        if (url.hash) { const t = document.getElementById(url.hash.slice(1)); if (t) { e.preventDefault(); scrollToEl(t); history.replaceState(null, '', url.hash); } }
        return;
      }
      e.preventDefault();
      $('.pt-label', pt).textContent = (a.dataset.label || a.textContent || url.pathname).trim().slice(0, 40);
      pt.classList.add('leave');
      try { sessionStorage.setItem('wwi-pt', '1'); } catch (e) {}
      setTimeout(() => { location.href = url.href; }, REDUCE ? 0 : 620);
    });
    addEventListener('pageshow', e => { if (e.persisted) pt.classList.remove('leave'); });
  }

  /* ================= header ================= */
  const head = $('#head'), prog = $('#progress');
  // page height is cached: reading scrollHeight on every scroll forces a full layout each time
  let lastY = scrollY, maxY = 1, ticking = false;
  const measure = () => { maxY = Math.max(1, document.documentElement.scrollHeight - innerHeight); };
  new ResizeObserver(measure).observe(document.body); measure();
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    head.classList.toggle('solid', y > 20);
    if (!root.classList.contains('menu-open')) head.classList.toggle('away', y > 480 && y > lastY + 2);
    if (y < lastY - 2) head.classList.remove('away');
    lastY = y;
    if (prog) prog.style.transform = `scaleX(${clamp(y / maxY).toFixed(4)})`;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true }); onScroll();

  /* ================= mobile menu ================= */
  const burger = $('#burger'), menu = $('#menu');
  let closeT;
  const setMenu = open => {
    clearTimeout(closeT);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      menu.hidden = false;
      $$('.menu-links a', menu).forEach((a, i) => a.style.transitionDelay = 220 + i * 60 + 'ms');
      requestAnimationFrame(() => requestAnimationFrame(() => { menu.classList.add('open'); root.classList.add('menu-open'); lock(true); }));
    } else {
      $$('.menu-links a', menu).forEach(a => a.style.transitionDelay = '0ms');
      menu.classList.remove('open'); root.classList.remove('menu-open'); lock(false);
      closeT = setTimeout(() => menu.hidden = true, 700);
    }
  };
  burger && burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu && $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu && menu.classList.contains('open')) { setMenu(false); burger.focus(); } });
  matchMedia('(min-width:1081px)').addEventListener('change', e => { if (e.matches && menu.classList.contains('open')) setMenu(false); });

  /* ================= reveals ================= */
  // split headings into words that rise one after another
  $$('.split').forEach(el => {
    const walk = node => [...node.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(w => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
          const o = document.createElement('span'); o.className = 'w'; const i = document.createElement('span'); i.textContent = w; o.appendChild(i); frag.appendChild(o);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
    });
    walk(el);
    $$('.w>span', el).forEach((s, i) => s.style.transitionDelay = i * 45 + 'ms');
  });

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add('in');
    if (el.matches('[data-scramble]')) scramble(el);
    if (el.matches('[data-count]')) countUp(el);
    io.unobserve(el);
  }), { rootMargin: '0px 0px -10% 0px' });
  $$('[data-rv], .split, [data-scramble], [data-count]').forEach(el => io.observe(el));
  $$('[data-stagger]').forEach(p => [...p.children].forEach((c, i) => { c.setAttribute('data-rv', ''); c.style.transitionDelay = i * 70 + 'ms'; io.observe(c); }));

  function countUp(el) {
    const to = +el.dataset.count, dur = 1400, t0 = performance.now(), suf = el.dataset.suffix || '';
    const step = now => { const p = clamp((now - t0) / dur), v = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * v) + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ================= pinned horizontal services ================= */
  const hs = $('[data-hscroll]');
  let hsDist = 0;
  const hsSetup = () => {
    if (!hs) return;
    const track = $('.hs-track', hs), sticky = $('.hs-sticky', hs);
    if (innerWidth > 1080) {
      hsDist = Math.max(0, track.scrollWidth - sticky.clientWidth);
      hs.style.height = innerHeight + hsDist + 'px';
      hs.classList.add('pinned');
    } else { hsDist = 0; hs.style.height = ''; track.style.transform = ''; hs.classList.remove('pinned'); }
  };
  let hsOn = false, hsP = -1, hsIdx = -1;
  const hsTrack = hs && $('.hs-track', hs), hsBar = hs && $('.hs-bar i', hs), hsNum = hs && $('.hs-count b', hs);
  const hsCards = hs ? $$('.svc-card:not(.svc-card--end)', hs) : [];
  const hsUpdate = () => {
    if (!hs || !hsDist || !hsOn) return;
    const p = clamp(-hs.getBoundingClientRect().top / hsDist);
    if (Math.abs(p - hsP) < 0.0005) return;
    hsP = p;
    hsTrack.style.transform = `translate3d(${-p * hsDist}px,0,0)`;
    if (hsBar) hsBar.style.transform = `scaleX(${p})`;
    const idx = Math.min(hsCards.length - 1, Math.round(p * (hsCards.length - 1)));
    if (idx !== hsIdx && hsNum) { hsIdx = idx; hsNum.textContent = String(idx + 1).padStart(2, '0'); }
  };
  if (hs) { hsSetup(); addEventListener('resize', () => { hsSetup(); hsUpdate(); }); addEventListener('load', () => { hsSetup(); hsUpdate(); }); }

  /* ================= process line ================= */
  const steps = $('.steps');
  const stepLis = steps ? $$('li', steps) : [];
  let stepsOn = false, stepsP = -1;
  const stepsUpdate = () => {
    if (!steps || !stepsOn) return;
    const r = steps.getBoundingClientRect();
    const p = clamp((innerHeight * 0.6 - r.top) / r.height);
    if (Math.abs(p - stepsP) < 0.001) return;
    stepsP = p;
    steps.style.setProperty('--p', p.toFixed(4));
    stepLis.forEach((li, i) => li.classList.toggle('on', p >= (i + 0.2) / stepLis.length));
  };
  // only do per-frame work while these sections are near the screen
  const near = new IntersectionObserver(es => es.forEach(e => {
    if (e.target === hs) hsOn = e.isIntersecting;
    if (e.target === steps) stepsOn = e.isIntersecting;
  }), { rootMargin: '200px 0px' });
  hs && near.observe(hs); steps && near.observe(steps);

  const frame = () => { hsUpdate(); stepsUpdate(); requestAnimationFrame(frame); };
  requestAnimationFrame(frame);

  /* ================= cursor, magnetic, spotlight, tilt ================= */
  if (fine) {
    const c = $('#cursor');
    if (c) {
      let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
      addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; c.classList.add('on'); }, { passive: true });
      document.addEventListener('pointerleave', () => c.classList.remove('on'));
      const loop = () => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); };
      loop();
      document.addEventListener('pointerover', e => {
        const t = e.target.closest('a,button,summary,[data-cursor]');
        c.classList.toggle('big', !!t);
        const lab = t && t.dataset.cursor; c.classList.toggle('label', !!lab); $('span', c).textContent = lab || '';
      });
    }
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const b = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * 0.22}px,${(e.clientY - b.top - b.height / 2) * 0.32}px)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const b = el.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
        el.style.transform = `perspective(1100px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
  }
  document.addEventListener('pointermove', e => {
    const s = e.target.closest && e.target.closest('.spot');
    if (!s) return;
    const b = s.getBoundingClientRect();
    s.style.setProperty('--mx', e.clientX - b.left + 'px'); s.style.setProperty('--my', e.clientY - b.top + 'px');
  }, { passive: true });

  /* ================= enquiry forms → CRM ================= */
  $$('form[data-enquiry]').forEach(f => {
    const done = f.nextElementSibling;
    f.addEventListener('submit', async e => {
      e.preventDefault();
      f.querySelector('.form-err')?.remove();
      const data = Object.fromEntries(new FormData(f)); data.kind = f.dataset.enquiry;
      const err = m => { const p = document.createElement('p'); p.className = 'form-err'; p.setAttribute('role', 'alert'); p.textContent = m; f.prepend(p); };
      const ph = String(data.phone || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
      if (!String(data.name || '').trim()) return err('Enter your name.');
      if (!/^[6-9]\d{9}$/.test(ph)) return err('Enter a valid 10-digit mobile number.');
      if (data.kind === 'audit' && !String(data.website || '').trim()) return err('Enter your website address.');
      const btn = f.querySelector('button[type=submit]'), label = btn.innerHTML; btn.disabled = true; btn.textContent = 'Sending…';
      try {
        const r = await fetch('/api/enquiry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || 'Could not send. Please try again or message us on WhatsApp.');
        f.reset(); f.hidden = true; done.hidden = false;
      } catch (ex) { err(ex.message.includes('fetch') ? 'No internet connection. Please try again.' : ex.message); }
      finally { btn.disabled = false; btn.innerHTML = label; }
    });
    done && done.querySelector('[data-again]').addEventListener('click', () => { done.hidden = true; f.hidden = false; });
  });

  $$('[data-year]').forEach(n => n.textContent = new Date().getFullYear());
})();
