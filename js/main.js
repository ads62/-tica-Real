(() => {
  'use strict';
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mobileMQ = matchMedia('(max-width: 819px)');

  /* ---------- tema (claro / escuro) com transição de lente ---------- */
  const themeBtn = $('.theme');
  const themeTxt = $('.theme__txt');
  const meta = $('meta[name="theme-color"]');
  const paintThemeUI = () => {
    const dark = root.dataset.theme === 'dark';
    themeBtn.setAttribute('aria-pressed', String(dark));
    themeTxt.textContent = dark ? 'Modo claro' : 'Modo escuro';
    if (meta) meta.content = dark ? '#0f1210' : '#eceee9';
  };
  const setTheme = (next, x, y) => {
    const apply = () => {
      root.dataset.theme = next;
      try { localStorage.setItem('otica-theme', next); } catch (e) {}
      paintThemeUI();
    };
    if (!document.startViewTransition || reduced) return apply();
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(apply);
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 950, easing: 'cubic-bezier(.65,0,.3,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
  };
  paintThemeUI();
  themeBtn.addEventListener('click', () => {
    const b = themeBtn.getBoundingClientRect();
    setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', b.left + b.width / 2, b.top + b.height / 2);
  });

  /* ---------- header e menu mobile ---------- */
  const header = $('.header');
  const burger = $('.burger');
  const setMenu = open => {
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  $$('.nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  mobileMQ.addEventListener('change', () => setMenu(false));
  header.classList.toggle('menu-open', false);
  // o estado do menu fica no <html>; o header precisa herdar para o CSS
  new MutationObserver(() => header.classList.toggle('open', root.classList.contains('menu-open')))
    .observe(root, { attributes: true, attributeFilter: ['class'] });

  /* ---------- link ativo no menu ---------- */
  const links = $$('.nav a');
  const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => spy.observe(s));

  /* ---------- entrada do hero ---------- */
  const start = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]).then(start);
  else start();

  /* ---------- revelar ao rolar ---------- */
  const revealer = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealer.unobserve(e.target); } });
  }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach(el => revealer.observe(el));

  /* ---------- paralaxe sutil de scroll + mouse (só transform) ---------- */
  const figs = $$('figure:has(img[data-depth])').map(f => ({ f, d: +$('img[data-depth]', f).dataset.depth, vis: false }));
  const visObs = new IntersectionObserver(es => es.forEach(e => {
    const it = figs.find(x => x.f === e.target); if (it) it.vis = e.isIntersecting;
  }), { rootMargin: '10% 0px' });
  figs.forEach(x => visObs.observe(x.f));

  let mx = innerWidth / 2, my = innerHeight / 3, lx = mx, ly = my, moved = false, ticking = false, scrollDirty = true;
  const light = $('.light');
  const canFx = fine && !reduced;

  const frame = () => {
    ticking = false;
    // luz: segue o mouse com atraso suave
    if (canFx) {
      lx += (mx - lx) * .085; ly += (my - ly) * .085;
      light.style.setProperty('--mx', lx.toFixed(1) + 'px');
      light.style.setProperty('--my', ly.toFixed(1) + 'px');
    }
    // paralaxe
    if (!reduced) {
      const nx = (mx / innerWidth - .5) * 2, ny = (my / innerHeight - .5) * 2;
      figs.forEach(({ f, d, vis }) => {
        if (!vis) return;
        const r = f.getBoundingClientRect();
        const prog = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -1..1
        f.style.setProperty('--sy', (-prog * d * 1.2).toFixed(1) + 'px');
        if (canFx) {
          f.style.setProperty('--px', (-nx * d * .5).toFixed(1) + 'px');
          f.style.setProperty('--py', (-ny * d * .5).toFixed(1) + 'px');
        }
      });
    }
    scrollDirty = false;
    if (canFx && (Math.abs(mx - lx) > .3 || Math.abs(my - ly) > .3)) request();
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', () => {
    header.classList.toggle('scrolled', scrollY > 24);
    scrollDirty = true; request();
  }, { passive: true });
  header.classList.toggle('scrolled', scrollY > 24);
  addEventListener('resize', request, { passive: true });
  request();

  /* ---------- cursor de precisão + fundo reativo (apenas mouse) ---------- */
  if (canFx) {
    root.classList.add('has-cursor');
    const cur = $('.cursor');
    const classes = ['is-link', 'is-button', 'is-image'];
    const setState = t => {
      const el = t && t.closest ? t.closest('[data-cursor],a,button,.map') : null;
      let s = '', hide = false;
      if (el) {
        const k = el.dataset.cursor;
        if (k === 'native' || el.classList.contains('map')) hide = true;
        else if (k === 'image') s = 'is-image';
        else if (k === 'button' || el.classList.contains('btn') || el.tagName === 'BUTTON') s = 'is-button';
        else if (el.tagName === 'A') s = 'is-link';
      }
      classes.forEach(c => cur.classList.toggle(c, c === s));
      cur.classList.toggle('hide', hide);
    };
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cur.style.transform = `translate3d(${mx}px,${my}px,0)`;
      if (!moved) { moved = true; cur.classList.add('on'); light.classList.add('on'); lx = mx; ly = my; }
      setState(e.target);
      request();
    }, { passive: true });
    document.addEventListener('mouseleave', () => { cur.classList.remove('on'); light.classList.remove('on'); moved = false; });
    addEventListener('blur', () => { cur.classList.remove('on'); });
  }
})();
