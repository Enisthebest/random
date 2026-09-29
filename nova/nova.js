// NOVA — 22s square loop. Everything is a pure function of time: seek(t) draws frame t.
(() => {
const W = 1440, H = 1440, DUR = 22;
const BPM = 110, B = 60 / BPM;          // provisional grid until the real song is measured
const DROP = 15 * B;                     // the press lands on the drop

// ---------- timeline (seconds) ----------
const T = {
  click: 1 * B,            // cursor clicks Generate
  spin: 0.60,              // pill -> spinner
  check: 3 * B,            // spinner -> check
  split: 4 * B,            // check -> three dots (goo)
  qfly: 2.95,              // left dot -> question bubble
  qtype: 7 * B,
  rfly: 4.10,             // right dot -> reply bubble
  rtype: 4.90,
  contract: 10.5 * B,      // bubbles -> dots, pour into middle
  tri: 12 * B,             // middle dot -> play triangle
  curTri: 7.20,
  drop: DROP,
  flood: DROP + 0.04,
  pull: DROP + 0.17,       // camera pulls back to the now-playing screen
  pause: DROP + 0.12,
  heart: 17 * B,
  curCover: 9.20,
  swipe: 18.5 * B,         // drag cover sideways
  retint: 18.5 * B + 0.42,
  toVol: 11.00,            // camera glides to volume
  grab: 22 * B,
  dragEnd: 25 * B,         // knob stops far out on the canvas
  camOut: 12.45,
  bend: 25.5 * B,          // line bends up into the chart
  curPoint: 14.75,
  dive: 29 * B,            // click the last point, dive into it
  ask: 29 * B + 0.83,      // "Ask NOVA" grows out of the light
  thin: 17.80,
  fan: 18.65,
  fold: 37 * B,
  thicken: 21.05,
  curHome: 21.60,
};
const G = 0.8; // every glide

// ---------- easing ----------
function bezier(x1, y1, x2, y2) {
  const bx = s => 3 * (1 - s) * (1 - s) * s * x1 + 3 * (1 - s) * s * s * x2 + s * s * s;
  const by = s => 3 * (1 - s) * (1 - s) * s * y1 + 3 * (1 - s) * s * s * y2 + s * s * s;
  return x => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let lo = 0, hi = 1, s = x;
    for (let i = 0; i < 28; i++) { if (bx(s) < x) lo = s; else hi = s; s = (lo + hi) / 2; }
    return by(s);
  };
}
const ease = bezier(.45, 0, .15, 1);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const lin = (t, a, d) => clamp((t - a) / d);
const gl = (t, a, d = G) => ease((t - a) / d);
const lerpLog = (a, b, u) => Math.exp(lerp(Math.log(a), Math.log(b), u));
const back = (t, a, d = G) => clamp((t - a - d / 2) / (d / 2)); // content fades in on the back half
const out = (t, a, d = G) => 1 - clamp((t - a) / (d * 0.4));     // outgoing content leaves early
const bump = (t, a, d) => { const u = (t - a) / d; return u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0; };

// ---------- colour ----------
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const INK = hex('#0e0e0e'), WHITE = [255, 255, 255], APP = hex('#121212'), CANVAS = hex('#0a0a0a');
const GREEN = hex('#1ed760'), NOVA_ORANGE = hex('#f58e1e');
const STAGE_IN = hex('#f3f3f0'), STAGE_OUT = hex('#e3e3de');

// ---------- canvas ----------
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const gooA = mk(), gooB = mk();
const gA = gooA.getContext('2d'), gB = gooB.getContext('2d');
const gooBlur = document.getElementById('gooBlur');

// ---------- camera ----------
// world -> screen: s = (w - cam) * z + W/2. Zoom is interpolated in log space.
const CAM_STAGE = { x: 0, y: 0, z: 2.4 };
const CAM_APP = { x: 0, y: -365, z: 1.1 };
const CAM_VOL = { x: 0, y: 100, z: 1.6 };
const CAM_CHART = { x: 1050, y: -100, z: 1.25 };
const toScreen = (c, p) => [(p[0] - c.x) * c.z + W / 2, (p[1] - c.y) * c.z + H / 2];
// Glide that keeps an anchor point on a screen path while zooming: no swing-outs.
function anchorCam(anchor, s, z) { return { x: anchor[0] - (s[0] - W / 2) / z, y: anchor[1] - (s[1] - H / 2) / z, z }; }
function applyCam(g, c) { g.setTransform(c.z, 0, 0, c.z, W / 2 - c.x * c.z, H / 2 - c.y * c.z); }

// ---------- layout (world units) ----------
const PANEL = { x0: -450, x1: 450, y0: -990, y1: 260, r: 48 };
const COVER = { cx: 0, cy: -565, s: 660, r: 30 };
const TR0 = -330, TR1 = 300, VOL_Y = 130, V0 = 0.62;
const KNOB0 = TR0 + (TR1 - TR0) * V0;
const KNOB_FAR = 1500;
const CHART_X = [600, 750, 900, 1050, 1200, 1350, 1500];
const CHART_H = [30, 95, 70, 175, 140, 290, 500];
const BASE_Y = VOL_Y;
const KNOB_TOP = [KNOB_FAR, BASE_Y - CHART_H[6]];
const Q_C = [-40, -80], R_C = [30, 80];
const REST = [150, 150];
const CLICK_PT = [18, 8];
const QTXT = 'is this all code?', RTXT = 'yes. every frame.';
const TRACKS = [
  { title: 'Low Orbit', artist: 'Nova Sessions', len: 192, at: 48 },
  { title: 'Afterglow', artist: 'Halcyon Drive', len: 214, at: 0 },
];

// ---------- procedural covers (all code) ----------
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function makeCover(kind) {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  const blob = (x, y, r, col, a) => { const gr = g.createRadialGradient(x * S, y * S, 0, x * S, y * S, r * S); gr.addColorStop(0, rgba(hex(col), a)); gr.addColorStop(1, rgba(hex(col), 0)); g.fillStyle = gr; g.fillRect(0, 0, S, S); };
  if (kind === 0) {
    g.fillStyle = '#040816'; g.fillRect(0, 0, S, S);
    blob(.30, .62, .75, '#1238b8', .95);
    blob(.62, .40, .45, '#2fb7e0', .75);
    blob(1.0, .02, .55, '#f58e1e', .95);
    blob(.88, .18, .30, '#ffe0b0', .55);
    blob(.10, 1.0, .55, '#000000', .8);
    // a planet horizon
    g.save(); g.beginPath(); g.arc(S * .5, S * 1.62, S * .95, 0, Math.PI * 2); g.clip();
    g.fillStyle = 'rgba(2,4,14,.92)'; g.fillRect(0, 0, S, S);
    const rim = g.createLinearGradient(0, S * .66, 0, S * .78); rim.addColorStop(0, 'rgba(120,200,255,.35)'); rim.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rim; g.fillRect(0, 0, S, S); g.restore();
  } else {
    g.fillStyle = '#16040d'; g.fillRect(0, 0, S, S);
    blob(.25, .25, .85, '#b0164f', .95);
    blob(.70, .72, .55, '#ff6a1a', .95);
    blob(.62, .60, .16, '#ffd79a', .9);
    blob(.95, .15, .45, '#5a1a8c', .7);
    blob(.5, 1.05, .45, '#0a0206', .7);
    g.fillStyle = 'rgba(255,210,160,.10)';
    for (let i = 0; i < 6; i++) g.fillRect(0, S * (.52 + i * .035), S, 2 + i);
  }
  const img = g.getImageData(0, 0, S, S), d = img.data, r = rng(kind + 7);
  for (let i = 0; i < d.length; i += 4) { const n = (r() - .5) * 26; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(img, 0, 0);
  const one = document.createElement('canvas'); one.width = one.height = 1;
  const o = one.getContext('2d'); o.drawImage(c, 0, 0, 1, 1);
  const avg = Array.from(o.getImageData(0, 0, 1, 1).data.slice(0, 3));
  // push the average toward its dominant hue so the tint reads
  const m = Math.max(...avg), tint = avg.map(v => clamp(v / Math.max(m, 1)) * 255);
  return { img: c, tint };
}
let COVERS = [];

// ---------- drawing helpers ----------
function rr(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.roundRect(x, y, w, h, r); }
function rrc(g, cx, cy, w, h, r) { rr(g, cx - w / 2, cy - h / 2, w, h, r); }
let CAM = CAM_STAGE;
// Soft layered shadow that grows with elevation (world units). Shadow-only pass via off-canvas offset.
function shadow(g, pathFn, elev) {
  if (elev <= 0.01) return;
  const e = elev * CAM.z, m = g.getTransform(), OFF = 20000;
  const layers = [[0.10, 0.6, 0.25], [0.08, 2.2, 0.9], [0.05, 5, 2]];
  g.save();
  g.setTransform(m.a, m.b, m.c, m.d, m.e - OFF, m.f);
  for (const [a, b, oy] of layers) {
    g.shadowColor = `rgba(0,0,0,${a})`; g.shadowBlur = e * b; g.shadowOffsetX = OFF; g.shadowOffsetY = e * oy;
    pathFn(); g.fillStyle = '#000'; g.fill();
  }
  g.restore();
}
function text(g, s, x, y, o) {
  g.save();
  g.font = `${o.w || 500} ${o.size}px Geist`;
  g.fillStyle = o.color || '#fff'; g.globalAlpha *= o.a == null ? 1 : o.a;
  g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic';
  g.letterSpacing = (o.track || 0) * o.size + 'px';
  g.fillText(s, x, y); g.restore();
}
function measure(s, size, w = 500, track = 0) { ctx.save(); ctx.font = `${w} ${size}px Geist`; ctx.letterSpacing = track * size + 'px'; const m = ctx.measureText(s).width; ctx.restore(); return m; }
function stageGradient(g, c) {
  // screen-space radial gradient, expressed in the current world so any shape can wear it
  const cx = (W / 2 - W / 2) / c.z + c.x, cy = (H * 0.44 - H / 2) / c.z + c.y;
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, 1150 / c.z);
  gr.addColorStop(0, rgba(STAGE_IN)); gr.addColorStop(1, rgba(STAGE_OUT));
  return gr;
}
function farthest(c, p) { const s = toScreen(c, p); return Math.max(Math.hypot(s[0], s[1]), Math.hypot(W - s[0], s[1]), Math.hypot(s[0], H - s[1]), Math.hypot(W - s[0], H - s[1])) / c.z; }

// ---------- macOS pointer ----------
const ARROW = [[0, 0], [0, 16.2], [3.9, 12.6], [6.5, 18.7], [9.1, 17.6], [6.6, 11.7], [11.6, 11.6]];
function drawCursor(g, s, press) {
  const k = 2.7 * (1 - 0.1 * press);
  g.save(); g.setTransform(k, 0, 0, k, s[0], s[1]);
  const path = () => { g.beginPath(); ARROW.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
  g.shadowColor = 'rgba(0,0,0,.28)'; g.shadowBlur = 5; g.shadowOffsetY = 2;
  path(); g.lineJoin = 'round'; g.lineWidth = 2.1; g.strokeStyle = '#fff'; g.stroke();
  g.shadowColor = 'transparent';
  path(); g.fillStyle = '#fff'; g.fill();
  path(); g.fillStyle = '#000'; g.fill();
  g.restore();
}

// ---------- play icon geometry ----------
const TRI = [[-11, -19], [-11, 19], [21, 0]];
function triRadial(th) { // ray from origin at angle th hits the triangle
  const d = [Math.cos(th), Math.sin(th)];
  let best = 1e9;
  for (let i = 0; i < 3; i++) {
    const a = TRI[i], b = TRI[(i + 1) % 3], e = [b[0] - a[0], b[1] - a[1]];
    const den = d[0] * e[1] - d[1] * e[0]; if (Math.abs(den) < 1e-9) continue;
    const tt = (a[0] * e[1] - a[1] * e[0]) / den, u = (a[0] * d[1] - a[1] * d[0]) / den;
    if (tt > 0 && u >= -1e-9 && u <= 1 + 1e-9) best = Math.min(best, tt);
  }
  return [d[0] * best, d[1] * best];
}
const TRI_ANG = (() => { const a = []; const N = 93; for (let i = 0; i < N; i++) a.push(-Math.PI + (i / N) * Math.PI * 2); TRI.forEach(p => a.push(Math.atan2(p[1], p[0]))); return a.sort((x, y) => x - y); })();
// triangle -> pause, as one path (two pieces) so there is no seam
function playIconPath(g, u) {
  const yA = -19 + (3 + 11) / 32 * 19;
  const L0 = [[-11, -19], [3, yA], [3, -yA], [-11, 19]], L1 = [[-14, -17], [-4, -17], [-4, 17], [-14, 17]];
  const R0 = [[3, yA], [21, 0], [21, 0], [3, -yA]], R1 = [[4, -17], [14, -17], [14, 17], [4, 17]];
  g.beginPath();
  for (const [A, Bq] of [[L0, L1], [R0, R1]]) {
    A.forEach((p, i) => { const x = lerp(p[0], Bq[i][0], u), y = lerp(p[1], Bq[i][1], u); i ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.closePath();
  }
}
function drawPlayButton(g, t) {
  const r = 44 * gl(t, T.drop, 0.3);
  if (r > 0.1) {
    const p = () => { g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); };
    shadow(g, p, 6 * r / 44);
    p(); g.fillStyle = '#fff'; g.fill();
  }
  playIconPath(g, gl(t, T.pause));
  g.fillStyle = rgba(INK); g.fill();
  g.lineJoin = 'round'; g.lineWidth = 5; g.strokeStyle = rgba(INK); g.stroke();
}

// ---------- STAGE: generate / chat / play ----------
function blobShape(g, b) { rrc(g, b.x, b.y, b.w, b.h, b.h / 2); }
function drawStageScene(g, t, tq) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = stageGradientScreen(g); g.fillRect(0, 0, W, H);
  applyCam(g, CAM);
  if (t >= T.ask - 0.001) return drawEnding(g, t);
  if (t < T.split) return drawGenerate(g, t);
  if (t < T.tri) return drawChat(g, t, tq);
  drawTriangle(g, t);
}
function stageGradientScreen(g) { const gr = g.createRadialGradient(W / 2, H * .44, 0, W / 2, H * .44, 1150); gr.addColorStop(0, rgba(STAGE_IN)); gr.addColorStop(1, rgba(STAGE_OUT)); return gr; }

function drawGenerate(g, t) {
  // loop: the pill we start on is the pill the ending thickens into
  const e = gl(t, T.spin);
  const s = 1 - 0.035 * bump(t, T.click - 0.03, 0.2);
  const w = lerp(160, 52, e) * s, h = lerp(48, 52, e) * s;
  const p = () => rrc(g, 0, 0, w, h, h / 2);
  shadow(g, p, lerp(7, 9, e));
  p(); g.fillStyle = rgba(INK); g.fill();
  text(g, 'Generate', 0, 1, { size: 19 * s, w: 500, align: 'center', base: 'middle', a: out(t, T.spin) });
  drawSpinnerCheck(g, t, 1);
}
function drawSpinnerCheck(g, t, a) {
  const ar = back(t, T.spin) * (1 - lin(t, T.check, 0.25)) * a;
  if (ar > 0) {
    const rot = t * 7.5, len = Math.PI * (0.75 + 0.35 * Math.sin(t * 5));
    g.save(); g.globalAlpha = ar; g.beginPath(); g.arc(0, 0, 12.5, rot, rot + len);
    g.lineCap = 'round'; g.lineWidth = 3.4; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  }
  const cp = gl(t, T.check, 0.45);
  if (cp > 0 && a > 0) {
    const pts = [[-9, 0.5], [-3, 6.5], [9.5, -6.5]];
    const l1 = Math.hypot(6, 6), l2 = Math.hypot(12.5, 13), L = (l1 + l2) * cp;
    g.save(); g.globalAlpha = a; g.beginPath(); g.moveTo(...pts[0]);
    if (L <= l1) g.lineTo(lerp(pts[0][0], pts[1][0], L / l1), lerp(pts[0][1], pts[1][1], L / l1));
    else { g.lineTo(...pts[1]); const u = (L - l1) / l2; g.lineTo(lerp(pts[1][0], pts[2][0], u), lerp(pts[1][1], pts[2][1], u)); }
    g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 3.6; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  }
}

function chatBlobs(t) {
  const es = gl(t, T.split), ec = gl(t, T.contract);
  const mid = { x: 0, y: 0, w: 0, h: 0, col: INK };
  const midR = lerp(lerp(26, 9, es), 13, ec); mid.w = mid.h = midR * 2;
  const side = sgn => ({ x: sgn * 30 * es, y: 0, w: lerp(34, 18, es), h: lerp(34, 18, es) });
  const Qw = measure(QTXT, 21, 500) + 44, Rw = measure(RTXT, 21, 500) + 44;
  const bub = (base, C, bw, tf) => {
    const ef = gl(t, tf);
    let x = lerp(base.x, C[0], ef), y = lerp(base.y, C[1], ef), w = lerp(base.w, bw, ef), h = lerp(base.h, 56, ef);
    x = lerp(x, 0, ec); y = lerp(y, 0, ec); w = lerp(w, 18, ec); h = lerp(h, 18, ec);
    return { x, y, w, h, ef };
  };
  const q = bub(side(-1), Q_C, Qw, T.qfly); q.col = INK;
  const r = bub(side(1), R_C, Rw, T.rfly);
  r.col = mix(mix(INK, WHITE, back(t, T.rfly)), INK, clamp((t - T.contract) / 0.4));
  return { mid, q, r, Qw, Rw };
}
function gooSigma(t) {
  // blur on for the split / take-off and for the merge; off while bubbles hold text
  const on1 = lin(t, T.split, 0.12) * (1 - lin(t, T.qfly + 0.45, 0.2));
  const on2 = lin(t, T.contract + 0.12, 0.2) * (1 - lin(t, T.contract + G - 0.05, 0.2));
  return 11 * Math.max(on1, on2);
}
function drawGoo(g, blobs, sigma, elev) {
  gA.setTransform(1, 0, 0, 1, 0, 0); gA.clearRect(0, 0, W, H); applyCam(gA, CAM);
  for (const b of blobs) { blobShape(gA, b); gA.fillStyle = rgba(b.col); gA.fill(); }
  let src = gooA;
  if (sigma > 0.4) {
    gooBlur.setAttribute('stdDeviation', sigma.toFixed(2));
    gB.setTransform(1, 0, 0, 1, 0, 0); gB.clearRect(0, 0, W, H);
    gB.filter = 'url(#goo)'; gB.drawImage(gooA, 0, 0); gB.filter = 'none';
    src = gooB;
  }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const e = elev * CAM.z, OFF = 20000;
  for (const [a, b, oy] of [[0.10, 0.6, 0.25], [0.08, 2.2, 0.9], [0.05, 5, 2]]) {
    g.shadowColor = `rgba(0,0,0,${a})`; g.shadowBlur = e * b; g.shadowOffsetX = OFF; g.shadowOffsetY = e * oy;
    g.drawImage(src, -OFF, 0);
  }
  g.shadowColor = 'transparent'; g.drawImage(src, 0, 0); g.restore();
}
function drawChat(g, t, tq) {
  const { mid, q, r } = chatBlobs(t);
  const elev = lerp(9, 6, gl(t, T.split)) + 3 * Math.max(q.ef, r.ef) * (1 - gl(t, T.contract));
  drawGoo(g, [mid, q, r], gooSigma(t), elev);
  drawSpinnerCheck(g, t, 1 - lin(t, T.split, 0.2));
  const fadeOut = 1 - lin(t, T.contract, 0.25);
  const typed = (s, t0) => s.slice(0, Math.floor(s.length * clamp((tq - t0) / 0.42) + 1e-6));
  if (t > T.qtype) text(g, typed(QTXT, T.qtype), q.x - q.w / 2 + 22, q.y + 1, { size: 21, base: 'middle', a: fadeOut });
  if (t > T.rtype) text(g, typed(RTXT, T.rtype), r.x - r.w / 2 + 22, r.y + 1, { size: 21, base: 'middle', color: rgba(INK), a: fadeOut });
}
function drawTriangle(g, t) {
  if (t < T.tri + G) {
    const N = TRI_ANG.length;
    g.beginPath();
    let ptsP = 0;
    TRI_ANG.forEach((th, i) => {
      const p = ease((t - T.tri - 0.25 * (i / N)) / (G - 0.25)); ptsP += p;
      const c = [13 * Math.cos(th), 13 * Math.sin(th)], q = triRadial(th);
      const x = lerp(c[0], q[0], p), y = lerp(c[1], q[1], p);
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    });
    g.closePath();
    const pAvg = ptsP / N;
    const path = new Path2D(); // reuse for shadow
    g.save(); g.fillStyle = rgba(INK); g.fill();
    if (pAvg > 0) { g.lineJoin = 'round'; g.lineWidth = 5 * pAvg; g.strokeStyle = rgba(INK); g.stroke(); }
    g.restore();
    return;
  }
  drawPlayButton(g, t);
}

// ---------- APP: now playing, swipe, volume, chart ----------
function knobPos(t) {
  const x = lerp(KNOB0, KNOB_FAR, gl(t, T.grab + 0.01, T.dragEnd - T.grab));
  const p6 = bendP(t, 6);
  return [x, lerp(BASE_Y, KNOB_TOP[1], p6)];
}
function bendP(t, i) { return ease((t - T.bend - 0.25 * (6 - i) / 6) / (G - 0.25)); }
function trackState(t) { return gl(t, T.retint, 0.4); } // 0 = track A tint, 1 = track B
function drawDots(g, c) {
  const x0 = c.x - W / 2 / c.z, x1 = c.x + W / 2 / c.z, y0 = c.y - H / 2 / c.z, y1 = c.y + H / 2 / c.z;
  const sp = 36; g.fillStyle = 'rgba(255,255,255,0.075)';
  g.beginPath();
  for (let x = Math.floor(x0 / sp) * sp; x <= x1; x += sp)
    for (let y = Math.floor(y0 / sp) * sp; y <= y1; y += sp) { g.moveTo(x + 1.7, y); g.arc(x, y, 1.7, 0, Math.PI * 2); }
  g.fill();
}
function panelPath(g) { rr(g, PANEL.x0, PANEL.y0, PANEL.x1 - PANEL.x0, PANEL.y1 - PANEL.y0, PANEL.r); }
function paintPanel(g, tint) {
  const gr = g.createLinearGradient(0, PANEL.y0, 0, PANEL.y1);
  gr.addColorStop(0, rgba(mix(APP, tint, 0.42))); gr.addColorStop(0.55, rgba(mix(APP, tint, 0.12))); gr.addColorStop(1, rgba(mix(APP, tint, 0.06)));
  g.fillStyle = gr; g.fillRect(PANEL.x0, PANEL.y0, PANEL.x1 - PANEL.x0, PANEL.y1 - PANEL.y0);
}
function heartPath(g, cx, cy, s) {
  g.beginPath(); g.moveTo(cx, cy + s * 0.36);
  g.bezierCurveTo(cx - s * 0.62, cy - s * 0.05, cx - s * 0.46, cy - s * 0.58, cx, cy - s * 0.26);
  g.bezierCurveTo(cx + s * 0.46, cy - s * 0.58, cx + s * 0.62, cy - s * 0.05, cx, cy + s * 0.36); g.closePath();
}
function skipIcon(g, cx, dir) {
  g.beginPath(); g.moveTo(cx - 9 * dir, -12); g.lineTo(cx + 8 * dir, 0); g.lineTo(cx - 9 * dir, 12); g.closePath();
  g.fillStyle = '#fff'; g.fill(); g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke();
  rrc(g, cx + 11 * dir, 0, 4, 24, 2); g.fill();
}
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function drawApp(g, t, tq) {
  const c = CAM;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = rgba(CANVAS); g.fillRect(0, 0, W, H);
  applyCam(g, c);
  drawDots(g, c);
  const ca = back(t, T.pull);            // app content arrives in the back half of the pull
  const ts = trackState(t);
  // panel + retint flood from the new cover
  g.save(); panelPath(g); g.clip();
  paintPanel(g, COVERS[0].tint);
  if (ts > 0) {
    const R = Math.hypot(450, 825) * ts;
    g.save(); g.beginPath(); g.arc(COVER.cx, COVER.cy, R, 0, Math.PI * 2); g.clip(); paintPanel(g, COVERS[1].tint); g.restore();
  }
  g.restore();
  panelPath(g); g.lineWidth = 1.5 / c.z * 1.5; g.strokeStyle = 'rgba(255,255,255,0.07)'; g.stroke();

  g.save(); g.globalAlpha = ca;
  text(g, 'NOW PLAYING', PANEL.x0 + 60, PANEL.y0 + 62, { size: 19, w: 600, track: 0.12, color: 'rgba(255,255,255,.55)' });
  text(g, 'NOVA', PANEL.x1 - 60, PANEL.y0 + 62, { size: 19, w: 600, track: 0.12, color: 'rgba(255,255,255,.55)', align: 'right' });
  // covers: drag, release, next slides in
  const off = -740 * gl(t, T.swipe);
  g.save(); panelPath(g); g.clip();
  for (let i = 0; i < 2; i++) {
    const x = COVER.cx + off + i * 740;
    if (x < -1200 || x > 1200) continue;
    g.save(); rrc(g, x, COVER.cy, COVER.s, COVER.s, COVER.r); g.clip();
    g.drawImage(COVERS[i].img, x - COVER.s / 2, COVER.cy - COVER.s / 2, COVER.s, COVER.s); g.restore();
  }
  g.restore();
  // title / artist swap
  const tA = 1 - clamp((t - T.swipe) / 0.3), tB = back(t, T.swipe);
  for (const [i, a] of [[0, tA], [1, tB]]) {
    if (a <= 0) continue;
    text(g, TRACKS[i].title, -330, -170, { size: 44, w: 600, a });
    text(g, TRACKS[i].artist, -330, -128, { size: 26, w: 400, color: 'rgba(255,255,255,.6)', a });
  }
  // heart: liked, fills green from its centre
  const hp = gl(t, T.heart, 0.4);
  heartPath(g, 305, -160, 46); g.lineWidth = 3.2; g.lineJoin = 'round'; g.strokeStyle = rgba(mix(WHITE, GREEN, hp), 0.9); g.stroke();
  if (hp > 0) { g.save(); heartPath(g, 305, -160, 46); g.clip(); g.beginPath(); g.arc(305, -165, 30 * hp, 0, Math.PI * 2); g.fillStyle = rgba(GREEN); g.fill(); g.restore(); }
  // progress
  const tr = TRACKS[ts > 0.5 ? 1 : 0], since = ts > 0.5 ? tq - (T.retint + 0.2) : tq - T.drop;
  const el = tr.at + Math.max(0, since), pf = el / tr.len;
  rrc(g, 0, -80, 660, 8, 4); g.fillStyle = 'rgba(255,255,255,.14)'; g.fill();
  rr(g, -330, -84, 660 * pf, 8, 4); g.fillStyle = '#fff'; g.fill();
  g.beginPath(); g.arc(-330 + 660 * pf, -80, 9, 0, Math.PI * 2); g.fill();
  text(g, fmt(el), -330, -44, { size: 18, color: 'rgba(255,255,255,.5)' });
  text(g, '-' + fmt(tr.len - el), 330, -44, { size: 18, color: 'rgba(255,255,255,.5)', align: 'right' });
  // controls
  skipIcon(g, -150, -1); skipIcon(g, 150, 1);
  g.save(); g.globalAlpha *= 0.55; g.strokeStyle = '#fff'; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-300, -10); g.bezierCurveTo(-285, -10, -285, 10, -270, 10); g.moveTo(-300, 10); g.bezierCurveTo(-285, 10, -285, -10, -270, -10); g.stroke();
  rrc(g, 285, 0, 30, 20, 8); g.stroke();
  g.restore();
  // volume row (NOVA sound widget)
  g.beginPath(); g.arc(-385, VOL_Y, 30, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.08)'; g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-398, VOL_Y - 6); g.lineTo(-392, VOL_Y - 6); g.lineTo(-383, VOL_Y - 13); g.lineTo(-383, VOL_Y + 13); g.lineTo(-392, VOL_Y + 6); g.lineTo(-398, VOL_Y + 6); g.closePath(); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 2.6; g.lineCap = 'round'; g.beginPath(); g.arc(-381, VOL_Y, 8, -0.8, 0.8); g.stroke(); g.beginPath(); g.arc(-381, VOL_Y, 14, -0.8, 0.8); g.stroke();
  rr(g, TR0, VOL_Y - 6, TR1 - TR0, 12, 6); g.fillStyle = 'rgba(255,255,255,.14)'; g.fill();
  g.restore();

  const k = knobPos(t), kq = knobPos(tq);
  g.save(); g.globalAlpha = ca;
  rr(g, TR0, VOL_Y - 6, Math.min(k[0], TR1) - TR0, 12, 6); g.fillStyle = '#fff'; g.fill();
  const pct = Math.round(clamp((Math.min(kq[0], TR1) - TR0) / (TR1 - TR0)) * 100);
  text(g, pct + '%', 390, VOL_Y + 7, { size: 20, w: 500, align: 'right', color: 'rgba(255,255,255,.8)', a: 1 - clamp((k[0] - TR1) / 60) });
  g.restore();

  drawChartLine(g, t, tq, k);
  // play button sits on top of everything in the panel
  drawPlayButton(g, t);
  // knob / last point. Its face is the light stage, so diving into it lands on the stage.
  const ring = back(t, T.bend);
  const kr = 18;
  const kp = () => { g.beginPath(); g.arc(k[0], k[1], kr, 0, Math.PI * 2); };
  if (ca > 0) {
    g.save(); g.globalAlpha = ca;
    shadow(g, kp, 4);
    kp(); g.fillStyle = rgba(mix(WHITE, GREEN, ring)); g.fill();
    g.beginPath(); g.arc(k[0], k[1], lerp(kr, 14.5, ring), 0, Math.PI * 2); g.fillStyle = stageGradient(g, c); g.fill();
    g.restore();
  }
}
function catmull(pts, seg = 10) {
  const outp = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < seg; s++) {
      const u = s / seg, u2 = u * u, u3 = u2 * u;
      outp.push([0, 1].map(j => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3)));
    }
  }
  outp.push(pts[pts.length - 1]); return outp;
}
function drawChartLine(g, t, tq, k) {
  if (k[0] <= TR1 + 0.5) return;
  const eb = gl(t, T.bend);
  const pts = CHART_X.map((cx, i) => [lerp(TR1 + (k[0] - TR1) * i / 6, cx, eb), BASE_Y - CHART_H[i] * bendP(t, i)]);
  pts[6] = k.slice();
  const curve = catmull(pts);
  const stretch = clamp((k[0] - TR1) / 700);
  const th = lerp(12, 6, stretch);
  const col = mix(WHITE, GREEN, clamp((k[0] - 450) / 400));
  // area under the chart, arrives with the bend
  const fa = back(t, T.bend);
  if (fa > 0) {
    g.beginPath(); g.moveTo(curve[0][0], BASE_Y); curve.forEach(p => g.lineTo(p[0], p[1])); g.lineTo(k[0], BASE_Y); g.closePath();
    const gr = g.createLinearGradient(0, KNOB_TOP[1], 0, BASE_Y); gr.addColorStop(0, rgba(GREEN, 0.22 * fa)); gr.addColorStop(1, rgba(GREEN, 0));
    g.fillStyle = gr; g.fill();
    g.save(); g.globalAlpha = fa;
    g.beginPath(); g.moveTo(600, BASE_Y); g.lineTo(1500, BASE_Y); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.14)'; g.stroke();
    ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].forEach((d, i) => text(g, d, CHART_X[i], BASE_Y + 52, { size: 17, w: 500, align: 'center', track: 0.1, color: 'rgba(255,255,255,.45)' }));
    const n = Math.round(212 * ease((tq - T.bend) / 1.0));
    text(g, 'DONE THIS WEEK', 600, -470, { size: 20, w: 600, track: 0.12, color: 'rgba(255,255,255,.55)' });
    text(g, '+' + n + '%', 596, -345, { size: 118, w: 600, track: -0.03 });
    g.restore();
  }
  g.beginPath(); curve.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]));
  g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = th; g.strokeStyle = rgba(col); g.stroke();
}

// ---------- ENDING: Ask NOVA -> line -> logo -> line -> Generate ----------
function sparkRays(g, cx, cy, len, lens, th, rot, col, a) {
  g.save(); g.globalAlpha = a; g.strokeStyle = rgba(col); g.lineCap = 'round'; g.lineWidth = th;
  for (let i = 0; i < 6; i++) {
    const r = rot[i], L = lens[i] / 2;
    g.beginPath(); g.moveTo(cx - Math.cos(r) * L, cy - Math.sin(r) * L); g.lineTo(cx + Math.cos(r) * L, cy + Math.sin(r) * L); g.stroke();
  }
  g.restore();
}
function drawEnding(g, t) {
  const eg = gl(t, T.ask), et = gl(t, T.thin), ef = gl(t, T.fan), eo = gl(t, T.fold), eh = gl(t, T.thicken);
  const askW = measure('Ask NOVA', 19, 500) + 34 + 44;
  if (t < T.fan) {
    // pill: grows out of the light, then thins into a line
    let w = lerp(0, askW, eg), h = lerp(0, 48, eg);
    w = lerp(w, 250, et); h = lerp(h, 5, et);
    const p = () => rrc(g, 0, 0, w, h, h / 2);
    shadow(g, p, 8 * eg * (1 - et));
    p(); g.fillStyle = rgba(INK); g.fill();
    const la = back(t, T.ask) * out(t, T.thin);
    if (la > 0) {
      const x0 = -askW / 2 + 22;
      sparkRays(g, x0 + 9, 0, 0, [18, 13, 18, 13, 18, 13], 2.6, [0, 1, 2, 3, 4, 5].map(i => i * Math.PI / 6), WHITE, la);
      text(g, 'Ask NOVA', x0 + 26, 1, { size: 19, w: 500, base: 'middle', a: la });
    }
    return;
  }
  if (t < T.thicken) {
    // six copies of the line rotate into twelve rays, then fold back
    const e = ef * (1 - eo);
    const lens = [0, 1, 2, 3, 4, 5].map(i => lerp(250, i % 2 ? 190 : 270, e));
    const rot = [0, 1, 2, 3, 4, 5].map(i => i * Math.PI / 6 * e);
    sparkRays(g, 0, 0, 0, lens, lerp(5, 15, e), rot, mix(INK, NOVA_ORANGE, e), 1);
    const wa = back(t, T.fan) * out(t, T.fold);
    if (wa > 0) text(g, 'NOVA', 0, 205, { size: 34, w: 600, track: 0.32, align: 'center', color: rgba(INK), a: wa });
    return;
  }
  // line thickens into Generate: last frame = first frame
  const w = lerp(250, 160, eh), h = lerp(5, 48, eh);
  const p = () => rrc(g, 0, 0, w, h, h / 2);
  shadow(g, p, 7 * eh);
  p(); g.fillStyle = rgba(INK); g.fill();
  text(g, 'Generate', 0, 1, { size: 19, w: 500, align: 'center', base: 'middle', a: back(t, T.thicken) });
}

// ---------- camera over time ----------
function camAt(t) {
  if (t < T.pull || t >= T.ask) return CAM_STAGE;
  if (t < T.toVol) {
    return anchorCam([0, 0], [W / 2, lerp(H / 2, toScreen(CAM_APP, [0, 0])[1], gl(t, T.pull))], lerpLog(CAM_STAGE.z, CAM_APP.z, gl(t, T.pull)));
  }
  if (t < T.camOut) {
    const e = gl(t, T.toVol), a = [0, VOL_Y];
    return anchorCam(a, [W / 2, lerp(toScreen(CAM_APP, a)[1], toScreen(CAM_VOL, a)[1], e)], lerpLog(CAM_APP.z, CAM_VOL.z, e));
  }
  if (t < T.dive) {
    const e = gl(t, T.camOut, T.dragEnd - T.camOut + 0.02), k = [knobPos(t)[0], VOL_Y];
    const s0 = toScreen(CAM_VOL, k), s1 = toScreen(CAM_CHART, [KNOB_FAR, VOL_Y]);
    s0[0] = s0[0] < 980 ? s0[0] : 980 + 260 * Math.tanh((s0[0] - 980) / 260); // camera catches the knob before it leaves frame
    return anchorCam(k, [lerp(s0[0], s1[0], e), lerp(s0[1], s1[1], e)], lerpLog(CAM_VOL.z, CAM_CHART.z, e));
  }
  const e = gl(t, T.dive), s0 = toScreen(CAM_CHART, KNOB_TOP);
  return anchorCam(KNOB_TOP, [lerp(s0[0], W / 2, e), lerp(s0[1], H / 2, e)], lerpLog(CAM_CHART.z, DIVE_Z, e));
}
const DIVE_Z = 90;

// ---------- cursor over time (world points; the ending lives in stage space) ----------
function glideP(t, a, p0, p1, d = G) { const e = gl(t, a, d); return [lerp(p0[0], p1[0], e), lerp(p0[1], p1[1], e)]; }
const coverGrab = [90, -540];
function cursorAt(t) {
  // returns { w: world point, press }
  const home = tt => glideP(tt, T.curHome, REST, CLICK_PT);
  if (t < T.click + 0.4) return { w: t < 0.8 ? home(t + DUR) : CLICK_PT, press: bump(t, T.click - 0.06, 0.2) };
  if (t < T.curTri) return { w: glideP(t, 0.95, CLICK_PT, REST), press: 0 };
  if (t < T.curCover) return { w: glideP(t, T.curTri, REST, [4, 4]), press: bump(t, T.drop - 0.07, 0.22) };
  if (t < T.swipe) return { w: glideP(t, T.curCover, [4, 4], coverGrab), press: 0 };
  if (t < T.toVol) {
    // drag the cover with it, release, cover coasts on
    const off = u => -740 * gl(u, T.swipe);
    const rel = T.swipe + 0.36, v = (off(rel + 0.005) - off(rel - 0.005)) / 0.01, tau = 0.09;
    const x = t < rel ? off(t) : off(rel) + v * tau * (1 - Math.exp(-(t - rel) / tau));
    return { w: [coverGrab[0] + x, coverGrab[1]], press: t < rel ? 0.5 : 0 };
  }
  if (t < T.grab) {
    const rel = T.swipe + 0.36, off = -740 * gl(rel, T.swipe), v = (-740 * gl(rel + 0.005, T.swipe) + 740 * gl(rel - 0.005, T.swipe)) / 0.01;
    const from = [coverGrab[0] + off + v * 0.09, coverGrab[1]];
    return { w: glideP(t, T.toVol, from, [KNOB0 + 4, VOL_Y + 4]), press: 0 };
  }
  if (t < T.bend + 0.2) { const k = knobPos(Math.min(t, T.dragEnd)); return { w: [k[0] + 4, VOL_Y + 4], press: t < T.dragEnd ? 0.5 : 0 }; }
  if (t < T.dive) {
    const k = knobPos(t), e = gl(t, T.curPoint);
    return { w: [lerp(KNOB_FAR + 4, k[0] + 4, e), lerp(VOL_Y + 4, k[1] + 4, e)], press: bump(t, T.dive - 0.08, 0.22) };
  }
  if (t < T.ask) return { w: [KNOB_TOP[0] + 4, KNOB_TOP[1] + 4], press: 0 };
  return { w: t < T.curHome ? REST : home(t), press: 0, stage: true };
}

// ---------- frame ----------
function seek(t, tq = t) {
  t = ((t % DUR) + DUR) % DUR; tq = ((tq % DUR) + DUR) % DUR;
  CAM = camAt(t);
  ctx.save();
  if (t < T.flood) drawStageScene(ctx, t, tq);
  else if (t < T.flood + 0.4) {
    // flood: the dark app grows out of the button; the switch happens under the circle
    drawStageScene(ctx, t, tq);
    const R = lerp(0, farthest(CAM, [0, 0]), gl(t, T.flood, 0.4));
    ctx.save(); applyCam(ctx, CAM); ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.clip();
    drawApp(ctx, t, tq); ctx.restore();
  } else if (t < T.ask) drawApp(ctx, t, tq);
  else drawStageScene(ctx, t, tq);
  ctx.restore();
  const cur = cursorAt(t);
  let s;
  if (cur.stage) s = toScreen(CAM_STAGE, cur.w);
  else s = toScreen(CAM, cur.w);
  if (t >= T.ask && !cur.stage) s = toScreen(CAM_STAGE, cur.w);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); drawCursor(ctx, s, cur.press); ctx.restore();
}

// motion blur: average n subframes spread across the shutter of one 60fps frame
const acc = mk(), aC = acc.getContext('2d');
function renderFrame(f, fps = 60, n = 4) {
  const t0 = f / fps, tq = t0;
  if (n <= 1) { seek(t0, tq); return; }
  aC.setTransform(1, 0, 0, 1, 0, 0); aC.clearRect(0, 0, W, H);
  for (let i = 0; i < n; i++) {
    const t = t0 + ((i + 0.5) / n - 0.5) / fps * 0.9;
    seek(t, tq);
    aC.globalAlpha = 1 / (i + 1); aC.drawImage(cv, 0, 0);
  }
  aC.globalAlpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(acc, 0, 0);
}

const ready = (async () => {
  await document.fonts.load('500 20px Geist'); await document.fonts.load('600 20px Geist'); await document.fonts.load('400 20px Geist');
  COVERS = [makeCover(0), makeCover(1)];
})();
window.NOVA = { seek, renderFrame, ready, DUR, T, B, DROP, W, H };
})();
