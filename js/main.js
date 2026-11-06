import { SITE, whatsappUrl, mapsEmbedUrl } from './config.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = window.gsap;

/* ---------- se o GSAP não carregar, o conteúdo continua visível ---------- */
if (!gsap) root.classList.remove('js');
else if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

/* ---------- topo: promoção com data, altura, estado sólido ---------- */
const top = $('#site-top');
const promo = $('#promo');
if (promo) {
  const until = Date.parse(promo.dataset.until);
  if (Number.isFinite(until) && Date.now() > until) promo.remove();
}
const syncTopHeight = () => root.style.setProperty('--top-h', `${top.offsetHeight}px`);
syncTopHeight();
new ResizeObserver(syncTopHeight).observe(top);
const fabEl = document.getElementById('wa-fab');
const onScroll = () => {
  top.classList.toggle('is-solid', window.scrollY > 40);
  fabEl.classList.toggle('is-early', window.scrollY < innerHeight * 0.55);
};
onScroll();
addEventListener('scroll', onScroll, { passive: true });

/* ---------- menu mobile ---------- */
const burger = $('#burger');
const menu = $('#menu');
const setMenu = (open) => {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  menu.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
};
burger.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

/* ---------- links de loja (WhatsApp, rota, mapa) ---------- */
$$('[data-wa]').forEach((a) => { a.href = whatsappUrl(a.dataset.wa, a.dataset.waText); });
$$('[data-route]').forEach((a) => {
  const store = SITE.stores[a.dataset.route];
  a.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`Ótica Real Santa Rita ${store.address}`)}`;
});

/* ---------- seletor de atendimento (WhatsApp) ---------- */
const dlg = $('#chat');
const fab = $('#wa-fab');
const topicsBox = $('#chat-topics');
let topicList = [];

const refreshChatLinks = () => {
  const checked = $('input[name="topic"]:checked', topicsBox);
  const text = topicList.find((t) => t.id === checked?.value)?.text ?? SITE.topics[0].text;
  $$('[data-chat-store]', dlg).forEach((a) => { a.href = whatsappUrl(a.dataset.chatStore, text); });
};
const openChat = (message) => {
  topicList = message
    ? [{ id: 'custom', label: 'Sobre o modelo que escolhi', text: message }, ...SITE.topics]
    : SITE.topics;
  $$('.chat__opt', topicsBox).forEach((n) => n.remove());
  topicList.forEach((t, i) => {
    const label = document.createElement('label');
    label.className = 'chat__opt';
    label.innerHTML = '<input type="radio" name="topic"><span></span>';
    const input = $('input', label);
    input.value = t.id;
    input.checked = i === 0;
    $('span', label).textContent = t.label;
    topicsBox.append(label);
  });
  refreshChatLinks();
  if (typeof dlg.showModal === 'function') dlg.showModal();
  else dlg.setAttribute('open', '');
  fab.classList.add('is-hidden');
};
topicsBox.addEventListener('change', refreshChatLinks);
dlg.addEventListener('close', () => fab.classList.remove('is-hidden'));
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
$$('[data-chat-store]', dlg).forEach((a) => a.addEventListener('click', () => setTimeout(() => dlg.close(), 150)));
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-chat]');
  if (!trigger) return;
  const message = trigger.closest('[data-chat-message]')?.dataset.chatMessage;
  setMenu(false);
  openChat(message);
});

/* ---------- vitrine do hero ---------- */
const slides = $$('.slide');
const idxButtons = $$('.idx');
const capBrand = $('#cap-brand');
const capName = $('#cap-name');
const pauseBtn = $('#pause');
const stage = $('#stage');
const HOLD = SITE.hero.hold;
let current = 0;
let progressTween = null;
let userPaused = false;
let hoverPaused = false;
let started = false;

const shouldPause = () => userPaused || hoverPaused || document.hidden;
const syncPlayback = () => { if (progressTween) progressTween.paused(shouldPause()); };

const setCaption = (i) => {
  const { brand, name } = slides[i].dataset;
  idxButtons.forEach((b, n) => {
    b.classList.toggle('is-active', n === i);
    b.toggleAttribute('aria-current', n === i);
  });
  if (!gsap || reduceMotion) { capBrand.textContent = brand; capName.textContent = name; return; }
  gsap.to([capBrand, capName], {
    opacity: 0, y: 6, duration: 0.35, ease: 'power1.in', overwrite: true,
    onComplete: () => {
      capBrand.textContent = brand; capName.textContent = name;
      gsap.to([capBrand, capName], { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.06 });
    },
  });
};

const startProgress = () => {
  if (!gsap || reduceMotion || slides.length < 2) return;
  progressTween?.kill();
  idxButtons.forEach((b, n) => gsap.set($('i', b), { scaleX: n === current ? 0 : 0 }));
  progressTween = gsap.fromTo($('i', idxButtons[current]), { scaleX: 0 }, {
    scaleX: 1, duration: HOLD, ease: 'none',
    onComplete: () => goTo((current + 1) % slides.length),
  });
  syncPlayback();
};

const goTo = (next) => {
  if (next === current || !gsap) return;
  const out = slides[current];
  const inn = slides[next];
  slides.forEach((s, n) => {
    if (n !== current && n !== next) { gsap.killTweensOf(s); s.classList.remove('is-active'); gsap.set(s, { opacity: 0 }); }
  });
  gsap.killTweensOf([out, inn]);
  current = next;
  setCaption(next);
  inn.classList.add('is-active');

  if (reduceMotion) {
    gsap.set(out, { opacity: 0 }); out.classList.remove('is-active');
    gsap.set(inn, { opacity: 1, x: 0, y: 0, scale: 1 });
    return;
  }
  gsap.to(out, {
    opacity: 0, y: -12, scale: 0.97, duration: 1.1, ease: 'power2.inOut',
    onComplete: () => out.classList.remove('is-active'),
  });
  gsap.fromTo(inn,
    { opacity: 0, y: 28, x: next > 0 ? 20 : -20, scale: 1.06 },
    { opacity: 1, y: 0, x: 0, scale: 1, duration: 1.6, ease: 'power3.out', delay: 0.15 });
  if (started) startProgress();
};

idxButtons.forEach((btn) => btn.addEventListener('click', () => {
  goTo(Number(btn.dataset.idx));
  if (progressTween) startProgress();
}));

pauseBtn.addEventListener('click', () => {
  userPaused = !userPaused;
  pauseBtn.setAttribute('aria-pressed', String(userPaused));
  pauseBtn.setAttribute('aria-label', userPaused ? 'Retomar a vitrine' : 'Pausar a vitrine');
  syncPlayback();
});
stage.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hoverPaused = true; syncPlayback(); } });
stage.addEventListener('pointerleave', () => { hoverPaused = false; syncPlayback(); });
document.addEventListener('visibilitychange', syncPlayback);

/* parallax sutil do ponteiro na vitrine (apenas mouse) */
if (gsap && !reduceMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const pointer = $('#stage-pointer');
  const xTo = gsap.quickTo(pointer, 'x', { duration: 1.2, ease: 'power3' });
  const yTo = gsap.quickTo(pointer, 'y', { duration: 1.2, ease: 'power3' });
  $('.hero').addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    xTo(((e.clientX - r.left) / r.width - 0.5) * 22);
    yTo(((e.clientY - r.top) / r.height - 0.5) * 14);
  });
  $('.hero').addEventListener('pointerleave', () => { xTo(0); yTo(0); });
}

/* introdução cinematográfica */
const runIntro = () => {
  const brand = $('#stage-brand');
  const intro = $$('[data-intro]');
  const lines = $$('[data-intro-line]');
  const first = slides[0];

  if (!gsap || reduceMotion) {
    if (gsap) {
      gsap.set([...intro, ...lines, first], { clearProps: 'transform' });
      gsap.set([...intro, first], { opacity: 1 });
      gsap.set($('i', idxButtons[0]), { scaleX: 1 });
    }
    setCaption(0);
    return;
  }

  gsap.set(first, { opacity: 0 });
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to($('[data-intro]'), { opacity: 1, duration: 0.8 }, 0.15)
    .to(lines, { y: 0, duration: 1.2, ease: 'power4.out', stagger: 0.14 }, 0.3)
    .to(intro.filter((n) => !n.matches('.eyebrow, .showcase-bar, .hero__facts')), { opacity: 1, duration: 1, stagger: 0.12 }, 0.95)
    .fromTo(brand, { opacity: 0, y: 14, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1.1 }, 0.25)
    .to(brand, { opacity: 0, y: -10, duration: 0.8, ease: 'power2.inOut' }, 1.55)
    .fromTo(first, { opacity: 0, y: 34, scale: 1.07 }, { opacity: 1, y: 0, scale: 1, duration: 1.9 }, 1.5)
    .to($('.showcase-bar'), { opacity: 1, duration: 1 }, 2.2)
    .to($('.hero__facts'), { opacity: 1, duration: 1 }, 2.4)
    .call(() => { started = true; startProgress(); }, null, 2.6);
};

/* ---------- filtro da vitrine ---------- */
const grid = $('#grid');
const tiles = $$('.tile', grid);
$$('.filter').forEach((btn) => btn.addEventListener('click', () => {
  const f = btn.dataset.filter;
  $$('.filter').forEach((b) => { const on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
  grid.dataset.filter = f;
  let n = 0;
  tiles.forEach((t) => {
    const show = f === 'all' || t.dataset.cat.split(' ').includes(f);
    t.classList.toggle('is-out', !show);
    t.classList.remove('is-in-filter');
    if (show) { t.style.animationDelay = `${n++ * 70}ms`; void t.offsetWidth; t.classList.add('is-in-filter'); }
  });
}));

/* ---------- revelação ao rolar ---------- */
const rvEls = $$('.rv');
rvEls.forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('rv'));
  el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 5) * 0.09}s`);
});
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  rvEls.forEach((el) => io.observe(el));
} else rvEls.forEach((el) => el.classList.add('is-in'));

/* ---------- navegação: seção atual ---------- */
const navLinks = $$('.nav a');
if ('IntersectionObserver' in window) {
  const secIO = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${en.target.id}`));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => secIO.observe(s));
}

/* ---------- parallax por rolagem (desktop) ---------- */
if (gsap && window.ScrollTrigger && !reduceMotion) {
  gsap.matchMedia().add('(min-width: 961px)', () => {
    $$('[data-parallax]').forEach((img) => {
      gsap.fromTo(img, { yPercent: -5 }, {
        yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    });
    const inset = $('.about__inset');
    if (inset) gsap.fromTo(inset, { y: 36 }, {
      y: -36, ease: 'none',
      scrollTrigger: { trigger: '.about__media', start: 'top bottom', end: 'bottom top', scrub: 0.8 },
    });
  });
}

/* ---------- lojas: mapa sob demanda ---------- */
const frame = $('#map-frame');
const storeEls = $$('.store');
const showMap = (id) => {
  frame.src = mapsEmbedUrl(id);
  storeEls.forEach((s) => s.classList.toggle('is-active', s.dataset.store === id));
};
$$('[data-show]').forEach((b) => b.addEventListener('click', () => showMap(b.dataset.show)));
const mapIO = new IntersectionObserver((entries) => {
  if (entries.some((e) => e.isIntersecting)) { showMap('loja1'); mapIO.disconnect(); }
}, { rootMargin: '500px 0px' });
mapIO.observe($('#lojas'));

/* ---------- reel do Instagram ---------- */
const reel = $('#reel');
if (reel && !reduceMotion && 'IntersectionObserver' in window) {
  new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { reel.preload = 'auto'; reel.play().catch(() => {}); }
    else reel.pause();
  }), { threshold: 0.35 }).observe(reel);
}

runIntro();
