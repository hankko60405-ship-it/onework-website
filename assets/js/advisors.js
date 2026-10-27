// ONEWORK — Advisors & Awards. Mist tone; motion follows MOTION.md (expo.out, title within 1s).
import { gsap, ScrollTrigger, motion, STATIC, isSmall, setupReveals, onMotionChange, fontsReady } from './site.js';
import { initCube } from './awards-cube.js';
import { initAaHero } from './aa-hero.js';

const animated = () => !STATIC && !motion.calm;

/* ---------- Banner: words come in on either side as the 3D logo gathers between them ---------- */
const hero3d = initAaHero();
const heroWash = [];
function intro() {
  hero3d?.intro();
  if (!animated()) return;
  const tl = gsap.timeline();
  tl.from('.aa-wash', { opacity: 0, scale: 1.06, duration: 1.6, ease: 'expo.out' }, 0);
  tl.from('.aa-left', { opacity: 0, xPercent: -18, filter: 'blur(8px)', duration: 1, ease: 'expo.out' }, 0.2);
  tl.from('.aa-right', { opacity: 0, xPercent: 18, filter: 'blur(8px)', duration: 1, ease: 'expo.out' }, 0.3);
  tl.from('.site-header', { opacity: 0, y: -12, duration: 0.8, ease: 'power3.out' }, 0.4);
  tl.from('.aa-wordmark span', { opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.04 }, 1.0);
  tl.from('.aa-wordmark', { gap: '0.05em', duration: 0.8, ease: 'expo.out' }, 1.4);
  // the blue wash drifts slowly, like the Career watercolour
  gsap.utils.toArray('.aa-wash i').forEach((b, k) => heroWash.push(gsap.to(b, { xPercent: k % 2 ? -10 : 12, yPercent: k % 2 ? 8 : -8, scale: 1.1, duration: 14 + k * 3, ease: 'sine.inOut', yoyo: true, repeat: -1 })));
}
if (!STATIC) {
  gsap.to('.aa-title', { yPercent: -14, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.aa-hero', start: '20% top', end: '80% top', scrub: true } });
  gsap.to('.aa-wordmark', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '.aa-hero', start: '10% top', end: '50% top', scrub: true } });
}

/* ---------- Advisors: two cards, the one under the pointer is open ---------- */
const cards = [...document.querySelectorAll('.adv')];
let open = 0;
function setOpen(i) {
  open = (i + cards.length) % cards.length;
  cards.forEach((c, k) => {
    c.classList.toggle('is-on', k === open);
    c.querySelector('.adv-hit').setAttribute('aria-expanded', String(k === open));
  });
  const panel = cards[open].querySelector('.adv-panel');
  if (animated()) gsap.fromTo(panel.children, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06, delay: 0.35, overwrite: true });
  if (isSmall) document.getElementById('advTrack').scrollTo({ left: cards[open].offsetLeft - cards[0].offsetLeft, behavior: motion.calm ? 'auto' : 'smooth' });
}
cards.forEach((c, i) => {
  // a mouse opens a card just by moving over it; touch and keyboard open it with a tap or Enter
  c.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && open !== i) setOpen(i); });
  c.querySelector('.adv-hit').addEventListener('click', () => { if (open !== i) setOpen(i); });
  c.querySelector('.adv-hit').addEventListener('focus', () => { if (open !== i) setOpen(i); });
});

/* ---------- Awards: 3D die / grid / list ---------- */
const awardsEl = document.getElementById('awards');
const cube = STATIC ? null : initCube();
const shelf = [];   // parallax on the middle column; only in grid view
const grid = document.getElementById('awGrid');
const viewBtns = [...document.querySelectorAll('.aw-view button')];
function setView(v) {
  if (grid.dataset.view === v) return;
  const swap = () => {
    grid.dataset.view = v;
    awardsEl.classList.toggle('is-cube', v === 'cube');
    if (v === 'cube') cube?.resume(); else cube?.pause();
    shelf.forEach((t) => { t.scrollTrigger[v === 'grid' ? 'enable' : 'disable'](); if (v !== 'grid') gsap.set(t.targets(), { y: 0 }); });
    viewBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
    ScrollTrigger.refresh();
  };
  if (!animated()) { swap(); return; }
  const target = v === 'cube' || grid.dataset.view === 'cube' ? awardsEl.querySelector(grid.dataset.view === 'cube' ? '.aw-cube' : '.aw-grid') : grid;
  gsap.to(target, {
    opacity: 0, y: 12, duration: 0.3, ease: 'power3.in',
    onComplete: () => {
      swap();
      gsap.set(target, { opacity: 1, y: 0 });
      const shown = v === 'cube' ? awardsEl.querySelector('.aw-cube') : grid;
      gsap.fromTo(shown, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' });
      if (v !== 'cube') gsap.from(grid.children, { opacity: 0, y: 24, duration: 0.7, ease: 'expo.out', stagger: 0.04 });
    },
  });
}
viewBtns.forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
// reduced motion: no 3D, the awards read as a list
if (STATIC) { grid.dataset.view = 'list'; awardsEl.classList.remove('is-cube'); viewBtns.forEach((b) => { b.setAttribute('aria-pressed', String(b.dataset.view === 'list')); if (b.dataset.view === 'cube') b.hidden = true; }); }

// list view: the tile follows the pointer as a small preview
const peek = document.createElement('div');
peek.className = 'aw-peek';
peek.setAttribute('aria-hidden', 'true');
document.body.append(peek);
const px = gsap.quickTo(peek, 'x', { duration: 0.5, ease: 'power3.out' });
const py = gsap.quickTo(peek, 'y', { duration: 0.5, ease: 'power3.out' });
grid.querySelectorAll('.aw').forEach((item) => {
  item.addEventListener('pointerenter', () => {
    if (grid.dataset.view !== 'list' || isSmall) return;
    peek.replaceChildren(item.querySelector('.aw-art').cloneNode(true));
    gsap.to(peek, { opacity: 1, scale: 1, duration: 0.4, ease: 'expo.out', overwrite: 'auto' });
  });
  item.addEventListener('pointerleave', () => gsap.to(peek, { opacity: 0, scale: 0.9, duration: 0.3, overwrite: 'auto' }));
});
addEventListener('pointermove', (e) => { px(e.clientX + 120); py(e.clientY); });

/* ---------- Scroll reveals ---------- */
if (!STATIC) {
  gsap.from('.adv', { opacity: 0, y: 40, duration: 1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '#advTrack', start: 'top 82%', once: true } });
  // the lab block: photo opens like a shutter, text follows
  gsap.fromTo('.lab-media', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.lab', start: 'top 80%', once: true } });
  gsap.from('.lab-media img', { scale: 1.15, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.lab', start: 'top 80%', once: true } });
  gsap.from('.lab-text > *', { opacity: 0, y: 20, duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: 0.2, scrollTrigger: { trigger: '.lab', start: 'top 80%', once: true } });
  gsap.to('.lab-media img', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.lab', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.utils.toArray('.aw').forEach((item, i) => {
    const art = item.querySelector('.aw-art');
    gsap.fromTo(art, { clipPath: 'inset(100% 0 0 0)' }, {
      clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'expo.out', delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: item, start: 'top 88%', once: true },
    });
    gsap.from(item.querySelector('.aw-text'), { opacity: 0, y: 18, duration: 0.9, ease: 'expo.out', delay: 0.2 + (i % 3) * 0.08, scrollTrigger: { trigger: item, start: 'top 88%', once: true } });
    // the middle column drifts a little slower than the sides, like a parallax shelf
    if (!isSmall && i % 3 === 1) shelf.push(gsap.to(item, { y: -40, ease: 'none', scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true } }));
  });
}

/* ---------- the advisors / awards switch follows the page ---------- */
const swLinks = [...document.querySelectorAll('.aa-switch a')];
const swOn = (hash) => swLinks.forEach((a) => a.classList.toggle('is-on', a.hash === hash));
ScrollTrigger.create({ trigger: '#awards', start: 'top 50%', onEnter: () => swOn('#awards'), onLeaveBack: () => swOn('#advisors') });
swLinks.forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  const el = document.querySelector(a.hash);
  window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 60, behavior: motion.calm ? 'auto' : 'smooth' });
  history.replaceState(null, '', a.hash);
}));
if (animated()) gsap.from('.aa-switch', { opacity: 0, y: 20, duration: 0.8, ease: 'expo.out', delay: 1.2 });

onMotionChange((calm) => { if (calm) { hero3d?.stop(); heroWash.forEach((t) => t.pause()); } else { hero3d?.start(); heroWash.forEach((t) => t.resume()); } });
setupReveals();
fontsReady.then(intro);
