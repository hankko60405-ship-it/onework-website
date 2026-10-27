// ONEWORK — Advisors & Awards banner: the logo's eight ribbons in white 3D.
// They gather into the mark, turn slowly, now and then drift apart a little and lock back together,
// and spread out as the banner scrolls away. Pointer tilt max 6° (MOTION.md §4).
import * as THREE from 'three';
import { gsap, ScrollTrigger, motion, STATIC, isSmall } from './site.js';

export function initAaHero() {
  const canvas = document.getElementById('aaGl');
  if (!canvas) return null;
  const animated = () => !STATIC && !motion.calm;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isSmall ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x33465f, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 2.1); key.position.set(-3, 4, 8); scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfe6ee, 0.5); fill.position.set(5, -2, 3); scene.add(fill);

  /* the eight ribbon pieces, from the clip paths in the logo file (logo units) */
  function rectPts(x, y, w, h, tx, ty, deg) {
    const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(([px, py]) => [px * c - py * s + tx, px * s + py * c + ty]);
  }
  const PIECES = [
    [[27.43, 19.86], [15.61, 32.28], [22.79, 39.12], [39.96, 21.08], [32.78, 14.24]],
    rectPts(33.28, 38.81, 24.9, 9.91, -17.5, 46.71, -46.41),
    rectPts(19.83, 40.39, 9.88, 14.87, -26.94, 32.79, -46.41),
    [[39.96, 21.08], [50.73, 31.33], [57.56, 24.16], [48.61, 15.64], [46.79, 13.91]],
    [[15.61, 32.28], [15.98, 46.27], [22.79, 39.12]],
    [[26.75, 56.52], [40.74, 56.21], [33.56, 49.37]],
    [[32.78, 14.24], [39.96, 21.08], [46.79, 13.91]],
    [[50.73, 31.33], [57.91, 38.17], [57.56, 24.16]],
  ];
  const C = [36.76, 35.22];
  const logo = new THREE.Group();
  scene.add(logo);
  const mat = new THREE.MeshStandardMaterial({ color: 0xf4f6f8, emissive: 0x15181c, roughness: 0.5, metalness: 0.0, flatShading: true });   // white faces, grey sides
  const pieces = PIECES.map((pts, i) => {
    const v = pts.map(([x, y]) => new THREE.Vector2(x - C[0], -(y - C[1])));
    const cx = v.reduce((a, b) => a + b.x, 0) / v.length, cy = v.reduce((a, b) => a + b.y, 0) / v.length;
    const shape = new THREE.Shape(v.map((q) => new THREE.Vector2(q.x - cx, q.y - cy)));
    const depth = 7;   // logo units: a thick ribbon, like the banner
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.2, bevelSegments: 1 });
    geo.translate(0, 0, -depth / 2);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(cx, cy, (i % 3) * 0.6 - 0.6);
    const len = Math.hypot(cx, cy) || 1;
    m.userData = { home: m.position.clone(), dir: new THREE.Vector3(cx / len, cy / len, 0), spin: i % 2 ? 1 : -1 };
    logo.add(m);
    return m;
  });

  /* place the logo where the banner has it: centred, about a quarter of the height */
  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const visH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
    const visW = visH * camera.aspect;
    // a quarter of the height, but never wider than the gap between the two words (about 14% of the width)
    const size = isSmall ? Math.min(visH * 0.2, visW * 0.5) : Math.min(visH * 0.25, visW * 0.14);
    logo.scale.setScalar(size / 44);
  }
  layout();
  addEventListener('resize', layout);

  /* motion state: how far apart the pieces are, and how they are turned */
  const state = { apart: animated() ? 1 : 0, scatter: 1, scroll: 0 };
  const scatterFrom = pieces.map(() => ({
    x: (Math.random() - 0.5) * 60, y: (Math.random() - 0.5) * 40, z: 10 + Math.random() * 30,
    rx: (Math.random() - 0.5) * 6, ry: (Math.random() - 0.5) * 6, rz: (Math.random() - 0.5) * 6,
  }));
  function intro() {
    if (!animated()) { state.scatter = 0; state.apart = 0; return; }
    gsap.to(state, { scatter: 0, duration: 1.8, ease: 'expo.out', delay: 0.3, onComplete: breathe });
    state.apart = 0;
  }
  // every few seconds the ribbons drift a little apart and lock back together
  let breath = null;
  function breathe() {
    if (!animated() || breath) return;
    breath = gsap.timeline({ repeat: -1, repeatDelay: 4.5, delay: 2.5 })
      .to(state, { apart: 1, duration: 1.4, ease: 'power3.inOut' })
      .to(state, { apart: 0, duration: 1.2, ease: 'expo.out' }, '+=0.4');
  }
  if (!STATIC) {
    ScrollTrigger.create({ trigger: '.aa-hero', start: 'top top', end: 'bottom top', onUpdate: (s) => { state.scroll = s.progress; } });
  }

  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => {
    if (!animated()) return;
    tilt.tx = ((e.clientY / innerHeight) - 0.5) * 0.2;
    tilt.ty = ((e.clientX / innerWidth) - 0.5) * 0.2;
  });

  let onScreen = true;
  new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; }).observe(canvas);
  const clock = new THREE.Clock();
  const ease = (t) => t * t * (3 - 2 * t);
  gsap.ticker.add(() => {
    if (!onScreen) return;
    const t = clock.getElapsedTime();
    const calm = !animated();
    tilt.x += ((calm ? 0 : tilt.tx) - tilt.x) * 0.08;
    tilt.y += ((calm ? 0 : tilt.ty) - tilt.y) * 0.08;
    // a slow turn to show the depth, like the banner's three-quarter view
    logo.rotation.y = -0.62 + (calm ? 0 : Math.sin(t * 0.35) * 0.3) + tilt.y;
    logo.rotation.x = 0.32 + tilt.x;
    // breathing: a small loosening (a few logo units); scrolling away: a real spread
    const breathe = state.apart * 2.2, away = ease(state.scroll) * 24;
    const spread = breathe + away;
    pieces.forEach((m, i) => {
      const u = m.userData, f = scatterFrom[i], s = state.scatter;
      m.position.set(
        u.home.x + u.dir.x * spread + f.x * s,
        u.home.y + u.dir.y * spread + f.y * s,
        u.home.z + (i % 2 ? 1 : -1) * (breathe * 1.4 + away * 0.6) + f.z * s,
      );
      m.rotation.set(f.rx * s + u.spin * (state.apart * 0.12 + state.scroll * 0.8), f.ry * s, f.rz * s + u.spin * state.apart * 0.06);
    });
    renderer.render(scene, camera);
  });

  return {
    intro,
    pause() { breath?.pause(); },
    resume() { breath?.resume(); },
    stop() { breath?.kill(); breath = null; state.apart = 0; },
    start: breathe,
  };
}
