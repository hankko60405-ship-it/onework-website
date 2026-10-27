// ONEWORK — shared behaviour for every page (language, smooth scroll, header, reveals, Tweaks)
// Motion values follow MOTION.md.
const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

export const root = document.documentElement;
export const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};
export const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isSmall = matchMedia('(max-width: 900px)').matches;
export const motion = { calm: prefersReduced || store.get('ow-motion') === 'calm' };
/** Reduced motion: nothing pinned, no intros, everything readable at once (MOTION.md §6.5). */
export const STATIC = prefersReduced;
if (STATIC) root.classList.add('is-static');
root.classList.toggle('is-calm', motion.calm);

/* ---------- Language (EN / 中) ---------- */
const langListeners = [];
export const onLangChange = (fn) => langListeners.push(fn);
function setLang(next) {
  root.lang = next === 'zh' ? 'zh-Hant' : 'en';
  document.querySelectorAll('[data-en]').forEach((el) => {
    const v = el.getAttribute(next === 'zh' ? 'data-zh' : 'data-en');
    if (v !== null) el.textContent = v;
  });
  store.set('ow-lang', next);
  langListeners.forEach((fn) => fn(next));
  ScrollTrigger.refresh();
}
const browserZh = (navigator.language || '').toLowerCase().startsWith('zh');
let lang = store.get('ow-lang') || (browserZh ? 'zh' : 'en');
setLang(lang);
document.getElementById('langToggle')?.addEventListener('click', () => {
  lang = lang === 'en' ? 'zh' : 'en';
  setLang(lang);
});

/* ---------- Smooth scroll ---------- */
let lenis = null;
export function startLenis() {
  if (lenis || motion.calm || !Lenis) return;
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
}
export function stopLenis() { if (lenis) { lenis.destroy(); lenis = null; } }
gsap.ticker.add((t) => { if (lenis) lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
startLenis();

/* ---------- Header ---------- */
const header = document.querySelector('.site-header');
const onScrollHeader = () => header?.classList.toggle('is-scrolled', scrollY > 40);
addEventListener('scroll', onScrollHeader, { passive: true });
onScrollHeader();

/* ---------- Scroll reveals: section heads + anything marked [data-reveal] ---------- */
export function setupReveals() {
  if (STATIC) return;
  gsap.utils.toArray('.section-head').forEach((el) => {
    gsap.from(el.children, {
      opacity: 0, y: 24, duration: 0.9, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 80%', once: true },
    });
  });
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 32, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}

/* ---------- Tweaks (design review only) ---------- */
const motionListeners = [];
export const onMotionChange = (fn) => motionListeners.push(fn);
const tBtn = document.getElementById('tweaksToggle');
const tPanel = document.getElementById('tweaks');
tBtn?.addEventListener('click', () => {
  const open = tPanel.hidden;
  tPanel.hidden = !open;
  tBtn.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('[name="tw-motion"]').forEach((r) => {
  r.checked = r.value === (motion.calm ? 'calm' : 'full');
  r.addEventListener('change', () => {
    motion.calm = r.value === 'calm' || prefersReduced;
    store.set('ow-motion', r.value);
    if (motion.calm) stopLenis(); else startLenis();
    root.classList.toggle('is-calm', motion.calm);
    motionListeners.forEach((fn) => fn(motion.calm));
  });
});
const savedFont = store.get('ow-font');
document.querySelectorAll('[name="tw-font"]').forEach((r) => {
  r.checked = r.value === (savedFont || 'archivo');
  r.addEventListener('change', () => { root.classList.toggle('font-jost', r.value === 'jost'); store.set('ow-font', r.value); });
});
root.classList.toggle('font-jost', savedFont === 'jost');

export const fontsReady = document.fonts.ready.then(() => ScrollTrigger.refresh());
