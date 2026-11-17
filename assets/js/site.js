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
export const motion = { calm: prefersReduced };   // follows the visitor's system setting only
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
/* ---------- Important notice: fixed bottom-right, opens on click ---------- */
(() => {
  const box = document.createElement('div');
  box.className = 'notice';
  box.innerHTML = `
    <div class="notice-panel" id="noticePanel" role="dialog" aria-labelledby="noticeTitle" hidden>
      <p class="notice-title" id="noticeTitle" data-en="Important Notice" data-zh="【重要聲明】">Important Notice</p>
      <p data-en="Recently there have been rumours, in the market and online, that the company is raising funds. The company hereby solemnly declares:" data-zh="近日坊間&網路傳聞本公司有進行資金募集之情事，本公司特此嚴正聲明：">Recently there have been rumours, in the market and online, that the company is raising funds. The company hereby solemnly declares:</p>
      <p class="notice-strong" data-en="The company currently has no plans to raise funds." data-zh="本公司目前並無任何募資之計劃。">The company currently has no plans to raise funds.</p>
      <p data-en="Do not trust investment offers from unknown sources, or you may be deceived. This statement is issued to set the record straight." data-zh="切勿輕信不明管道之投資邀約，以免受騙上當。特此聲明，以正視聽。">Do not trust investment offers from unknown sources, or you may be deceived. This statement is issued to set the record straight.</p>
      <p class="notice-sign" data-en="工一科技股份有限公司" data-zh="工一科技股份有限公司 敬啟">工一科技股份有限公司</p>
      <button class="notice-close" type="button" id="noticeClose" data-en="Close" data-zh="關閉">Close</button>
    </div>
    <button class="notice-btn" type="button" id="noticeBtn" aria-expanded="false" aria-controls="noticePanel" data-en="IMPORTANT NOTICE" data-zh="重要聲明">IMPORTANT NOTICE</button>`;
  document.body.append(box);
  const btn = box.querySelector('#noticeBtn'), panel = box.querySelector('#noticePanel');
  const set = (open) => { panel.hidden = !open; btn.setAttribute('aria-expanded', String(open)); if (open) panel.querySelector('#noticeClose').focus({ preventScroll: true }); };
  btn.addEventListener('click', () => set(panel.hidden));
  box.querySelector('#noticeClose').addEventListener('click', () => { set(false); btn.focus({ preventScroll: true }); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { set(false); btn.focus({ preventScroll: true }); } });
})();

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

/* ---------- Motion setting ---------- */
const motionListeners = [];
export const onMotionChange = (fn) => motionListeners.push(fn);
// The Tweaks panel is gone: headlines are always Archivo, and motion follows prefers-reduced-motion.

export const fontsReady = document.fonts.ready.then(() => ScrollTrigger.refresh());
