// ONEWORK — Service page: building lifecycle in exploded 3D layers.
// Four scenes: a building half-built → a finished building → a campus → a city.
// Mono tone (MOTION.md §1): white lines and translucent planes, Logo teal only for sensors and data.
// The model turns slowly on its own and can be dragged; scrolling changes the stage.
import * as THREE from 'three';
import { gsap, ScrollTrigger, motion, STATIC, isSmall } from './site.js';

const section = document.getElementById('t3');
if (section && !STATIC) init();

function init() {
  const animated = () => !motion.calm;
  const WHITE = 0xffffff, TEAL300 = 0x8badb1, TEAL100 = 0x9eb9bd, TEAL500 = 0x759fa4;
  const S = 5;            // plate size
  const H = S / 2;
  const GAP = 0.95;       // space between exploded layers
  const rand = (() => { let s = 11; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; })();

  /* ---------- renderer ---------- */
  const canvas = document.getElementById('t3Gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isSmall ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);
  const world = new THREE.Group();
  scene.add(world);

  /* ---------- helpers ---------- */
  function kit() {
    const mats = [];
    const mk = (m) => { m.transparent = true; m.depthWrite = false; m.userData.base = m.opacity; mats.push(m); return m; };
    return {
      mats,
      line: (op = 0.55, color = WHITE) => mk(new THREE.LineBasicMaterial({ color, opacity: op })),
      dash: (op = 0.35, color = WHITE) => mk(new THREE.LineDashedMaterial({ color, opacity: op, dashSize: 0.1, gapSize: 0.08 })),
      face: (op = 0.06, color = WHITE) => mk(new THREE.MeshBasicMaterial({ color, opacity: op, side: THREE.DoubleSide })),
      pts: (size, color, op = 1) => mk(new THREE.PointsMaterial({ color, size, opacity: op, sizeAttenuation: true })),
    };
  }
  const segs = (arr, mat, dashed) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    const l = new THREE.LineSegments(g, mat);
    if (dashed) l.computeLineDistances();
    return l;
  };
  const rect = (out, cx, cz, w, d, y = 0) => {
    const a = [cx - w / 2, y, cz - d / 2], b = [cx + w / 2, y, cz - d / 2], c = [cx + w / 2, y, cz + d / 2], e = [cx - w / 2, y, cz + d / 2];
    out.push(...a, ...b, ...b, ...c, ...c, ...e, ...e, ...a);
  };
  const box = (out, cx, cz, w, d, y0, h) => {
    rect(out, cx, cz, w, d, y0); rect(out, cx, cz, w, d, y0 + h);
    for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) out.push(cx + x * w / 2, y0, cz + z * d / 2, cx + x * w / 2, y0 + h, cz + z * d / 2);
  };
  const planeMesh = (w, d, mat, y = 0, cx = 0, cz = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    m.rotation.x = -Math.PI / 2; m.position.set(cx, y, cz);
    return m;
  };
  const points = (arr, mat) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    return new THREE.Points(g, mat);
  };
  // the base plate every scene stands on: outline, a faint grid, and long guide lines running off into space
  function plate(K, grid = 10, faceOp = 0.05) {
    const g = new THREE.Group();
    g.add(planeMesh(S, S, K.face(faceOp)));
    const o = []; rect(o, 0, 0, S, S); g.add(segs(o, K.line(0.6)));
    if (grid) {
      const gl = [];
      for (let i = 1; i < grid; i++) { const t = -H + (S * i) / grid; gl.push(t, 0, -H, t, 0, H, -H, 0, t, H, 0, t); }
      g.add(segs(gl, K.line(0.1)));
    }
    const guide = [];
    for (const z of [-H, H]) guide.push(-H - 6, 0, z, -H, 0, z, H, 0, z, H + 6, 0, z);
    for (const x of [-H, H]) guide.push(x, 0, -H - 6, x, 0, -H, x, 0, H, x, 0, H + 6);
    g.add(segs(guide, K.line(0.12)));
    return g;
  }
  // a "layer" is a group plus the height of what it holds, so exploded layers never collide
  const layer = (obj, h = 0) => { obj.userData.h = h; return obj; };

  /* ---------- 1. a building half-built ---------- */
  function sceneBuild() {
    const K = kit(); const L = [];
    // site
    const site = plate(K, 10);
    const sd = []; rect(sd, 0, 0, 3.4, 3.4); site.add(segs(sd, K.dash(0.5), true));
    L.push(layer(site));
    // foundation and column grid
    const fnd = new THREE.Group();
    fnd.add(planeMesh(2.4, 2.4, K.face(0.12)));
    const fo = []; rect(fo, 0, 0, 2.4, 2.4); fnd.add(segs(fo, K.line(0.75)));
    const cols = [];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const x = -1.1 + i * 0.733, z = -1.1 + j * 0.733; cols.push(x, 0, z, x, 0.32, z); }
    fnd.add(segs(cols, K.line(0.7)));
    L.push(layer(fnd, 0.32));
    // the tower: five floors built, the rest drawn as planned outlines, and a crane
    const tw = new THREE.Group();
    const built = [], plan = [], columns = [];
    for (let f = 0; f < 11; f++) {
      const y = f * 0.26;
      if (f <= 5) {
        rect(built, 0, 0, 2.4, 2.4, y);
        if (f < 5) tw.add(planeMesh(2.4, 2.4, K.face(0.1), y));
        if (f < 5) for (const [x, z] of [[-1.2, -1.2], [1.2, -1.2], [1.2, 1.2], [-1.2, 1.2], [0, -1.2], [0, 1.2], [-1.2, 0], [1.2, 0]]) columns.push(x, y, z, x, y + 0.26, z);
      } else rect(plan, 0, 0, 2.4, 2.4, y);
    }
    tw.add(segs(built, K.line(0.8)), segs(columns, K.line(0.45)), segs(plan, K.dash(0.3), true));
    const crane = [1.75, 0, -1.75, 1.75, 3.3, -1.75, -0.9, 3.3, -1.75, 3.0, 3.3, -1.75, 0.1, 3.3, -1.75, 0.1, 1.55, -1.75, 1.75, 3.3, -1.75, 2.3, 3.0, -1.75];
    tw.add(segs(crane, K.line(0.85, TEAL300)));
    L.push(layer(tw, 3.3));
    return { K, L };
  }

  /* ---------- 2. a finished building ---------- */
  function sceneNew() {
    const K = kit(); const L = [];
    L.push(layer(plate(K, 10)));
    // MEP and equipment
    const mep = new THREE.Group();
    const fr = []; rect(fr, 0, 0, 2.4, 2.4); mep.add(segs(fr, K.dash(0.45), true));
    const pipes = [-1, 0, -0.9, -1, 0, 0.9, -1, 0, 0.9, 0.9, 0, 0.9, -1, 0, 0, 0.6, 0, 0, 0.6, 0, 0, 0.6, 0, -0.9, 0.2, 0, -0.9, 1.0, 0, -0.9];
    mep.add(segs(pipes, K.line(0.75, TEAL300)));
    const eq = []; for (let i = 0; i < 18; i++) eq.push(-1.05 + rand() * 2.1, 0.02, -1.05 + rand() * 2.1);
    mep.add(points(eq, K.pts(0.11, TEAL100)));
    L.push(layer(mep, 0.05));
    // the building
    const bld = new THREE.Group();
    const fl = [];
    for (let f = 0; f <= 11; f++) rect(fl, 0, 0, 2.4, 2.4, f * 0.24);
    const shell = []; box(shell, 0, 0, 2.4, 2.4, 0, 2.64);
    bld.add(segs(fl, K.line(0.35)), segs(shell, K.line(0.85)));
    const glass = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.64, 2.4), K.face(0.06));
    glass.position.y = 1.32; bld.add(glass);
    L.push(layer(bld, 2.64));
    // sensors and data
    const data = new THREE.Group();
    const dr = []; rect(dr, 0, 0, 2.4, 2.4); data.add(segs(dr, K.dash(0.4), true));
    const sp = [], links = [];
    for (let i = 0; i < 14; i++) { const x = -1.05 + rand() * 2.1, z = -1.05 + rand() * 2.1; sp.push(x, 0, z); links.push(x, 0, z, 0, 0.5, 0); }
    data.add(points(sp, K.pts(0.13, TEAL100)), segs(links, K.line(0.35, TEAL300)), points([0, 0.5, 0], K.pts(0.22, WHITE)));
    L.push(layer(data, 0.5));
    return { K, L };
  }

  /* ---------- 3. a campus of buildings ---------- */
  function sceneCampus() {
    const K = kit(); const L = [];
    const base = plate(K, 10);
    const roads = []; rect(roads, 0, 0.2, S, 0.4); rect(roads, -0.4, 0, 0.4, S);
    base.add(segs(roads, K.line(0.45)));
    L.push(layer(base));
    const blds = new THREE.Group();
    const spots = [[-1.5, -1.4, 1.1, 0.9, 1.9], [1.2, -1.5, 1.5, 0.9, 1.2], [1.4, 1.4, 1.2, 1.2, 2.4], [-1.6, 1.3, 1.0, 1.4, 1.5], [0.6, -0.6, 0.6, 0.6, 0.8], [-1.5, -0.2, 0.9, 0.5, 0.7], [0.5, 1.4, 0.6, 1.2, 1.0]];
    const e = [];
    spots.forEach(([x, z, w, d, h]) => {
      box(e, x, z, w, d, 0, h);
      for (let f = 0.24; f < h; f += 0.24) rect(e, x, z, w, d, f);
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), K.face(0.06));
      m.position.set(x, h / 2, z); blds.add(m);
    });
    blds.add(segs(e, K.line(0.55)));
    L.push(layer(blds, 2.4));
    // one network across the campus
    const net = new THREE.Group();
    const p = [], l = [];
    spots.forEach(([x, z], i) => { p.push(x, 0, z); const [nx, , nz] = [spots[(i + 1) % spots.length][0], 0, spots[(i + 1) % spots.length][1]]; l.push(x, 0, z, nx, 0, nz); l.push(x, 0, z, 0, 0.45, 0); });
    net.add(points(p, K.pts(0.16, TEAL100)), segs(l, K.line(0.4, TEAL300)), points([0, 0.45, 0], K.pts(0.24, WHITE)));
    const nr = []; rect(nr, 0, 0, S * 0.8, S * 0.8); net.add(segs(nr, K.dash(0.35), true));
    L.push(layer(net, 0.45));
    return { K, L };
  }

  /* ---------- 4. a city ---------- */
  function sceneCity() {
    const K = kit(); const L = [];
    // terrain contours (GIS)
    const terr = plate(K, 0, 0.04);
    const ct = [];
    for (let k = 1; k <= 6; k++) {
      const r0 = 0.32 * k; let prev = null;
      for (let a = 0; a <= 64; a++) {
        const t = (a / 64) * Math.PI * 2;
        const r = r0 * (1 + 0.12 * Math.sin(t * 3 + k) + 0.06 * Math.sin(t * 5 - k));
        const pt = [0.3 + Math.cos(t) * r, 0, -0.2 + Math.sin(t) * r * 0.85];
        if (Math.abs(pt[0]) < H && Math.abs(pt[2]) < H && prev && Math.abs(prev[0]) < H && Math.abs(prev[2]) < H) ct.push(...prev, ...pt);
        prev = pt;
      }
    }
    terr.add(segs(ct, K.line(0.45, TEAL500)));
    L.push(layer(terr));
    // streets and blocks
    const st = new THREE.Group();
    const so = []; rect(so, 0, 0, S, S); st.add(segs(so, K.line(0.5)));
    const sl = [];
    for (let i = 1; i < 8; i++) { const t = -H + (S * i) / 8; sl.push(t, 0, -H, t, 0, H, -H, 0, t, H, 0, t); }
    st.add(segs(sl, K.line(0.3)));
    L.push(layer(st));
    // buildings
    const n = isSmall ? 6 : 8, cell = S / n;
    const e = [];
    const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
    const inst = new THREE.InstancedMesh(geo, K.face(0.07), n * n * 2);
    const m4 = new THREE.Matrix4(); let c = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const cx = -H + cell * (i + 0.5), cz = -H + cell * (j + 0.5);
      const dist = Math.hypot(cx, cz) / (H * 1.4);
      const count = rand() > 0.5 ? 2 : 1;
      for (let k = 0; k < count; k++) {
        const w = cell * (count === 2 ? 0.34 : 0.6), d = cell * (0.4 + rand() * 0.3);
        const x = cx + (count === 2 ? (k ? 0.2 : -0.2) * cell : 0), z = cz;
        const h = 0.15 + (1 - dist) * (0.4 + rand() * 1.6);
        box(e, x, z, w, d, 0, h);
        m4.makeScale(w, h, d).setPosition(x, 0, z); inst.setMatrixAt(c++, m4);
      }
    }
    inst.count = c;
    const bl = new THREE.Group(); bl.add(inst, segs(e, K.line(0.42)));
    L.push(layer(bl, 1.9));
    // data network over the city
    const net = new THREE.Group();
    const arcs = [], dots = [];
    for (let i = 0; i < 16; i++) {
      const a = [-H + rand() * S, 0, -H + rand() * S], b = [-H + rand() * S, 0, -H + rand() * S];
      dots.push(...a, ...b);
      const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(...a), new THREE.Vector3((a[0] + b[0]) / 2, 0.7 + rand() * 0.6, (a[2] + b[2]) / 2), new THREE.Vector3(...b));
      const ps = curve.getPoints(20);
      for (let k = 0; k < ps.length - 1; k++) arcs.push(ps[k].x, ps[k].y, ps[k].z, ps[k + 1].x, ps[k + 1].y, ps[k + 1].z);
    }
    net.add(segs(arcs, K.line(0.45, TEAL300)), points(dots, K.pts(0.12, TEAL100)));
    L.push(layer(net, 1.2));
    return { K, L };
  }

  /* ---------- assemble the four stages ---------- */
  const stages = [sceneBuild(), sceneNew(), sceneCampus(), sceneCity()].map(({ K, L }) => {
    const g = new THREE.Group();
    L.forEach((l) => g.add(l));
    // dashed guides at the plate corners, tying the exploded layers together
    const gd = []; for (const [x, z] of [[-H, -H], [H, -H], [H, H], [-H, H]]) gd.push(x, 0, z, x, 1, z);
    const guides = segs(gd, K.dash(0.3), true);
    g.add(guides);
    g.visible = false;
    world.add(g);
    return { g, L, K, guides, fade: 0, ex: 2.2 };
  });

  function applyStage(s) {
    // stack the layers with GAP × explode between them, then centre the whole stack
    let y = 0;
    s.L.forEach((l, i) => { l.position.y = y; y += l.userData.h + GAP * s.ex; if (i === s.L.length - 1) y -= GAP * s.ex; });
    const top = s.L[s.L.length - 1].position.y + s.L[s.L.length - 1].userData.h;
    s.guides.scale.y = Math.max(top, 0.001);
    s.g.position.y = -top / 2;
    s.K.mats.forEach((m) => { m.opacity = m.userData.base * s.fade; });
    s.g.visible = s.fade > 0.01;
  }

  /* ---------- camera, layout ---------- */
  const view = { yaw: -0.6, pitch: 0.5, yawVel: 0, dist: 21 };
  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // desktop: model sits right of centre, clear of the copy; phone: model sits above the copy
    if (innerWidth > 900) camera.setViewOffset(w, h, -w * 0.15, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.17, w, h);
    view.dist = innerWidth > 900 ? 23 : 31;
    camera.updateProjectionMatrix();
  }
  layout();
  addEventListener('resize', layout);

  /* ---------- drag to turn ---------- */
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false };
    canvas.classList.add('is-dragging');
  });
  addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dy) > Math.abs(dx) * 1.5 && e.pointerType === 'touch') { drag = null; canvas.classList.remove('is-dragging'); return; }   // vertical swipe: let the page scroll
    drag.moved = true;
    view.yaw += dx * 0.006; view.yawVel = dx * 0.006;
    view.pitch = Math.min(1.05, Math.max(0.2, view.pitch + dy * 0.003));
    drag.x = e.clientX; drag.y = e.clientY;
  });
  const endDrag = () => { drag = null; canvas.classList.remove('is-dragging'); };
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);

  /* ---------- stages follow scroll ---------- */
  const steps = [...section.querySelectorAll('.t3-step')];
  const navBtns = [...section.querySelectorAll('.t3-nav button')];
  let active = -1;
  let local = 0;
  function setStage(i) {
    if (i === active) return;
    const prev = active;
    active = i;
    steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
    navBtns.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.setAttribute('aria-current', k === i ? 'step' : 'false'); });
    const step = steps[i];
    if (animated()) {
      gsap.fromTo(step.querySelectorAll('.t3-title, .t3-desc'), { opacity: 0, y: 18, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out', stagger: 0.08 });
      gsap.fromTo(step.querySelectorAll('.t3-cards li'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07, delay: 0.15 });
    }
    // the old scene flies apart and fades; the new one comes together from an exploded state
    if (prev >= 0) gsap.to(stages[prev], { fade: 0, ex: 2.6, duration: animated() ? 0.7 : 0, ease: 'power3.in', overwrite: true });
    gsap.fromTo(stages[i], { fade: 0, ex: 2.4 }, { fade: 1, ex: 1, duration: animated() ? 1.3 : 0, ease: 'expo.out', overwrite: true });
  }
  const st = ScrollTrigger.create({
    trigger: section, start: 'top top', end: 'bottom bottom', pin: '.t3-stage', pinSpacing: false,
    onUpdate: (self) => {
      const p = self.progress * stages.length;
      const i = Math.min(stages.length - 1, Math.floor(p));
      local = p - i;
      setStage(i);
    },
  });
  setStage(0);
  navBtns.forEach((b, i) => b.addEventListener('click', () => {
    window.scrollTo({ top: st.start + (st.end - st.start) * ((i + 0.35) / stages.length), behavior: motion.calm ? 'auto' : 'smooth' });
  }));

  /* ---------- render only while on screen ---------- */
  let onScreen = false;
  new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; }, { rootMargin: '10% 0px' }).observe(section);
  let last = performance.now();
  gsap.ticker.add(() => {
    if (!onScreen) return;
    const now = performance.now(); const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!drag) {
      view.yawVel *= 0.94;
      view.yaw += view.yawVel + (animated() ? 0.14 * dt : 0);   // slow turn, plus whatever spin the drag left behind
    }
    world.rotation.y = view.yaw;
    camera.position.set(0, Math.sin(view.pitch) * view.dist, Math.cos(view.pitch) * view.dist);
    camera.lookAt(0, 0, 0);
    stages.forEach((s, i) => {
      // inside a stage, scrolling opens the layers a little further
      if (i === active && !gsap.isTweening(s)) s.ex = 1 + local * 0.35;
      applyStage(s);
    });
    renderer.render(scene, camera);
  });
}
