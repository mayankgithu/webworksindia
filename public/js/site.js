/* Web Works India — site interactions */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* header + menu */
  const head = $('.head'), onS = () => head && head.classList.toggle('solid', scrollY > 30 || !$('.hero'));
  addEventListener('scroll', onS, { passive: true }); onS();
  const burger = $('.burger');
  burger && burger.addEventListener('click', () => { const o = document.body.classList.toggle('menu-open'); burger.setAttribute('aria-expanded', o); });
  $$('.nav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));
  $$('[data-year]').forEach(n => n.textContent = new Date().getFullYear());

  /* hero copy */
  const go = () => document.body.classList.add('ready');
  if (document.readyState === 'complete') setTimeout(go, 150); else addEventListener('load', () => setTimeout(go, 150));
  setTimeout(go, 1800);

  /* reveal on scroll */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('[data-rv]').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + 'ms'; io.observe(el); });

  /* service index */
  const items = $$('.svc-list > li'), panel = $('.svc-panel');
  function pick(li) {
    items.forEach(x => { x.classList.toggle('on', x === li); x.querySelector('button').setAttribute('aria-expanded', x === li); });
    if (!panel) return;
    const p = k => panel.querySelector(`[data-p="${k}"]`);
    p('name').textContent = li.querySelector('b').textContent;
    p('intro').textContent = li.querySelector('.svc-detail p').textContent;
    p('list').innerHTML = li.querySelector('.svc-detail ul').innerHTML;
    p('who').textContent = li.dataset.who; p('time').textContent = li.dataset.time;
    p('link').href = '/services#' + li.dataset.id;
    panel.animate([{ opacity: .4, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.7,.1,1)' });
  }
  items.forEach(li => { const b = li.querySelector('button'); b.addEventListener('click', () => pick(li)); if (fine) b.addEventListener('mouseenter', () => !li.classList.contains('on') && pick(li)); });
  if (items.length) { items[0].classList.add('on'); items[0].querySelector('button').setAttribute('aria-expanded', true); }

  /* enquiry forms → CRM */
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
      const btn = f.querySelector('button[type=submit]'), label = btn.textContent; btn.disabled = true; btn.textContent = 'Sending…';
      try {
        const r = await fetch('/api/enquiry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || 'Could not send. Please try again or call us.');
        f.reset(); f.hidden = true; done.hidden = false;
      } catch (ex) { err(ex.message.includes('fetch') ? 'No internet connection. Please try again.' : ex.message); }
      finally { btn.disabled = false; btn.textContent = label; }
    });
    done && done.querySelector('[data-again]').addEventListener('click', () => { done.hidden = true; f.hidden = false; });
  });
})();
