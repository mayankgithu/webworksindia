/* Web Works India — v2 site: intro, header, menu, cursor */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const IO = 'cubic-bezier(.77,0,.18,1)';

  const ready = () => { if (root.classList.contains('ready')) return; root.classList.add('ready'); dispatchEvent(new Event('wwi:ready')); };

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
    root.classList.add('intro-lock');
    playIntro();
  }

  async function playIntro() {
    const brand = $('#brand');
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
    // split the wordmark into letters for a staggered rise
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

    // counter
    const num = $('#intro-num'), bar = $('#intro-bar');
    const DUR = 2300, t0 = performance.now();
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
      // complete any half-drawn logo parts before it flies
      fly.getAnimations({ subtree: true }).forEach(a => { try { a.finish(); } catch (e) {} });
      setTimeout(() => {
        intro.classList.add('out');
        const a = fly.animate([{ transform: from }, { transform: 'translate(0,0) scale(1)' }], { duration: 1100, easing: IO, fill: 'forwards' });
        setTimeout(ready, 520);
        a.onfinish = () => {
          root.classList.add('intro-done');
          root.classList.remove('intro-lock');
          fly.remove(); intro.remove();
          try { sessionStorage.setItem('wwi-intro', '1'); } catch (e) {}
        };
      }, 180);
    }
  }

  /* ================= header ================= */
  const head = $('#head');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    head.classList.toggle('solid', y > 20);
    if (!root.classList.contains('menu-open')) head.classList.toggle('away', y > 480 && y > lastY + 2);
    if (y < lastY - 2) head.classList.remove('away');
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

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
      requestAnimationFrame(() => requestAnimationFrame(() => { menu.classList.add('open'); root.classList.add('menu-open', 'intro-lock'); }));
    } else {
      $$('.menu-links a', menu).forEach(a => a.style.transitionDelay = '0ms');
      menu.classList.remove('open'); root.classList.remove('menu-open', 'intro-lock');
      closeT = setTimeout(() => menu.hidden = true, 700);
    }
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); } });
  matchMedia('(min-width:1081px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ================= cursor + magnetic buttons ================= */
  if (fine) {
    const c = $('#cursor');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; c.classList.add('on'); }, { passive: true });
    document.addEventListener('pointerleave', () => c.classList.remove('on'));
    const loop = () => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener('pointerover', e => c.classList.toggle('big', !!e.target.closest('a,button')));

    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const b = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * 0.22}px,${(e.clientY - b.top - b.height / 2) * 0.32}px)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
  }
})();
