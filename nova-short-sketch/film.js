// NOVA OS — "From paper to NOVA" vertical Short, 1080x1920. Pure function of time: seek(t) draws frame t.
(() => {
const W = 1080, H = 1920, DUR = 20;
const G = 0.8;
const T = { zoom: 7.4, pop: 10.6, end: 13.9, soon: 16.3 };

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
const gl = (t, a, d = G) => ease((t - a) / d);
const lerpRect = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// ---------- canvas ----------
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const IMG = {};
const load = (k, src) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.src = src; });

function rr(g, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.roundRect(x, y, w, h, r); }
function text(g, s, x, y, o) {
  const a = o.a == null ? 1 : o.a; if (a <= 0) return;
  g.save();
  g.font = `${o.w || 500} ${o.size}px ${o.v ? 'GeistV' : 'Geist'}`;
  g.fillStyle = o.color || '#fff'; g.globalAlpha *= a;
  g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic';
  g.letterSpacing = (o.track || 0) * o.size + 'px';
  g.fillText(s, x, y); g.restore();
}
function measure(s, size, w, track = 0, v = false) { ctx.save(); ctx.font = `${w} ${size}px ${v ? 'GeistV' : 'Geist'}`; ctx.letterSpacing = track * size + 'px'; const m = ctx.measureText(s).width; ctx.restore(); return m; }

// Apple-style type: words rise and fade in one after another; the line lifts away together.
function headline(g, s, cx, cy, size, tin, tout, t, o = {}) {
  if (t < tin || t > tout + 0.5) return;
  const w = o.w || 800, track = o.track == null ? -0.035 : o.track, gap = size * 0.24;
  const words = s.split(' '), ws = words.map(x => measure(x, size, w, track, true));
  const total = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  const outE = gl(t, tout, 0.5);
  let x = cx - total / 2;
  words.forEach((word, i) => {
    const e = ease((t - tin - i * 0.07) / 0.7);
    text(g, word, x, cy + 26 * (1 - e) - 14 * outE, { size, w, track, color: o.color || '#fff', a: e * (1 - outE), base: 'middle', v: true });
    x += ws[i] + gap;
  });
}

// ---------- paper sketch of NOVA: a pencil draws it, the camera dives into the star, POP, the sketch becomes the real OS ----------
const PAPER = '#f3efe6', LEAD = 'rgba(52,52,60,.88)', RED = 'rgba(214,72,52,.92)';
const FR = [90, 610, 990, 1172];                 // the screen outline on the paper (900 x 562, the 1440x900 shape)
const SK = (FR[2] - FR[0]) / 1440;               // desktop px -> paper px
const STAR_C = [540, 891];                       // centre of the screen = where the star is drawn (paper coords)
const LIFT = 130;                                 // the whole page sits 130px higher on screen, leaving room for the ending
const STAR_S = [540, 891 - LIFT];                 // the star on screen
const dx = x => FR[0] + x * SK, dy = y => FR[1] + y * SK;

// seeded random so every frame draws the same wobble
let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
// a pencil stroke: points with a little wobble and an overshoot
function wobble(pts, amp = 1.3) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.ceil(L / 14));
    for (let k = 0; k < n; k++) { const u = k / n; out.push([lerp(x0, x1, u) + (rnd() - 0.5) * amp, lerp(y0, y1, u) + (rnd() - 0.5) * amp]); }
  }
  out.push(pts[pts.length - 1]); return out;
}
function rrect(x0, y0, x1, y1, r) {
  const p = [], arc = (cx, cy, a0) => { for (let k = 0; k <= 4; k++) { const a = a0 + k * Math.PI / 8; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  arc(x1 - r, y0 + r, -Math.PI / 2); arc(x1 - r, y1 - r, 0); arc(x0 + r, y1 - r, Math.PI / 2); arc(x0 + r, y0 + r, Math.PI); p.push([x1 - r + 3, y0]);
  return p;
}
const STROKES = [];   // { pts, t0, d, w, col }
function add(pts, t0, d, w = 3, col = LEAD, amp) { STROKES.push({ pts: wobble(pts, amp), t0, d, w, col }); }
const R = (x0, y0, x1, y1, r, t0, d, w) => add(rrect(dx(x0), dy(y0), dx(x1), dy(y1), r), t0, d, w);
const Lr = (x0, y0, x1, y1, t0, d, w = 2.2) => add([[dx(x0), dy(y0)], [dx(x1), dy(y1)]], t0, d, w);

// the screen
add(rrect(FR[0], FR[1], FR[2], FR[3], 22), 0.35, 0.9, 4.2);
// top bar pills
R(15, 9, 180, 45, 6, 1.2, 0.25); R(650, 9, 790, 45, 6, 1.35, 0.2); R(1180, 9, 1330, 45, 6, 1.45, 0.2); R(1340, 9, 1380, 45, 6, 1.55, 0.15); R(1390, 9, 1425, 45, 6, 1.62, 0.15);
// an app window on the left: sidebar, title, cards and rows
R(70, 120, 590, 640, 14, 1.8, 0.5, 3.2); Lr(230, 120, 230, 640, 2.25, 0.2);
Lr(100, 170, 200, 170, 2.4, 0.12); for (let i = 0; i < 4; i++) Lr(100, 215 + i * 40, 190, 215 + i * 40, 2.45 + i * 0.05, 0.1, 1.8);
Lr(265, 175, 470, 175, 2.65, 0.15, 3); Lr(265, 205, 420, 205, 2.75, 0.12, 1.6);
R(260, 240, 560, 340, 10, 2.85, 0.3, 2.4);
for (let i = 0; i < 4; i++) { R(260, 370 + i * 62, 555, 420 + i * 62, 8, 3.1 + i * 0.08, 0.18, 1.8); R(500, 385 + i * 62, 540, 405 + i * 62, 9, 3.15 + i * 0.08, 0.1, 1.6); }
// the Control panel on the right
R(880, 70, 1150, 340, 10, 3.5, 0.3, 2.6); Lr(905, 115, 1110, 115, 3.75, 0.12, 4);
for (let i = 0; i < 3; i++) Lr(905, 165 + i * 45, 1080, 165 + i * 45, 3.85 + i * 0.05, 0.1, 1.8);
R(880, 360, 1150, 420, 10, 3.95, 0.15, 2.2); R(880, 440, 1150, 520, 10, 4.05, 0.15, 2.2);
R(1170, 70, 1425, 130, 10, 4.1, 0.15, 2.2); R(1170, 150, 1425, 210, 10, 4.15, 0.15, 2.2); R(1170, 230, 1425, 340, 10, 4.2, 0.18, 2.2); R(1170, 360, 1425, 440, 10, 4.3, 0.15, 2.2);
// the dock with little icon doodles
R(480, 812, 960, 884, 14, 4.4, 0.3, 3);
for (let i = 0; i < 7; i++) { const cx = 520 + i * 62; add(rrect(dx(cx - 20), dy(828), dx(cx + 20), dy(868), 6), 4.6 + i * 0.05, 0.1, 1.8); }
// the star, big, in the middle of the screen
// the NOVA star: four sharp points with curved sides (an astroid)
const STAR_PTS = (() => { const p = [], c = STAR_C, s = 74, e = 4.2; for (let k = 0; k <= 96; k++) { const a = k / 96 * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a); p.push([c[0] + s * Math.sign(ca) * Math.pow(Math.abs(ca), e), c[1] + s * Math.sign(sa) * Math.pow(Math.abs(sa), e)]); } return p; })();
add(STAR_PTS, 5.0, 0.7, 4, LEAD, 0.6);
add(STAR_PTS.map(([x, y]) => [x + 1.5, y + 1]), 5.4, 0.5, 2, LEAD, 0.8);
// hatching inside the star
for (let i = 0; i < 14; i++) {
  const y = STAR_C[1] - 30 + i * 4.6, w = 16 - Math.abs(i - 7) * 2.0;
  add([[STAR_C[0] - w, y + 6], [STAR_C[0] + w, y - 6]], 6.0 + i * 0.04, 0.06, 1.4, LEAD, 0.4);
}
// red-pen notes and arrows
add([[620, 1240], [600, 1190], [585, 1162]], 6.4, 0.3, 3, RED); add([[575, 1172], [585, 1160], [597, 1170]], 6.65, 0.1, 3, RED);
add([[250, 600], [290, 640], [320, 680]], 6.6, 0.3, 3, RED); add([[308, 676], [320, 681], [323, 668]], 6.85, 0.1, 3, RED);
add([[900, 596], [890, 660]], 6.8, 0.25, 3, RED); add([[882, 650], [890, 662], [899, 652]], 7.0, 0.1, 3, RED);
add([[700, 930], [612, 905]], 6.9, 0.25, 3, RED); add([[622, 898], [610, 905], [621, 913]], 7.1, 0.1, 3, RED);
const NOTES = [  // text, x, y, size, color, t0, duration, rotation
  ['NOVA OS ✦', 540, 470, 110, LEAD, 0.9, 0.9, -0.02],
  ['v0.1 — sketch', 560, 545, 42, 'rgba(52,52,60,.6)', 1.5, 0.5, -0.01],
  ['glass, no shadows!', 230, 585, 46, RED, 6.4, 0.6, -0.04],
  ['control panel', 900, 580, 46, RED, 6.6, 0.5, 0.03],
  ['our star', 800, 950, 54, RED, 6.8, 0.4, -0.04],
  ['dock', 640, 1290, 54, RED, 6.3, 0.35, 0.02],
];

function drawStroke(s, t) {
  const u = clamp((t - s.t0) / s.d); if (u <= 0) return;
  const n = Math.max(2, Math.ceil(s.pts.length * u));
  ctx.beginPath(); s.pts.slice(0, n).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.strokeStyle = s.col; ctx.lineWidth = s.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}
function hand(s, x, y, size, col, t, t0, d, rot = 0, w = 700) {
  const u = clamp((t - t0) / d); if (u <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.font = `${w} ${size}px Caveat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(s).width;
  ctx.beginPath(); ctx.rect(-tw / 2 - 10, -size, (tw + 20) * u, size * 2); ctx.clip();   // "written" left to right
  ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore();
}
// paper: warm off-white, a faint dot grid, grain baked once
let PAPER_TEX = null;
function paperTex() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(90,110,160,.16)'; for (let y = 40; y < H; y += 40) for (let x = 40; x < W; x += 40) { g.beginPath(); g.arc(x, y, 1.6, 0, Math.PI * 2); g.fill(); }
  const id = g.getImageData(0, 0, W, H), d = id.data; let s = 99;
  for (let i = 0; i < d.length; i += 4) { s = (s * 16807) % 2147483647; const n = (s / 2147483647 - 0.5) * 16; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(id, 0, 0);
  const vg = g.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 1200); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(70,50,20,.18)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return c;
}
function starImg(cx, cy, size, a = 1) {
  if (a <= 0) return;
  const b = [186, 41, 1187, 1100], bw = b[2] - b[0], bh = b[3] - b[1], k = size / Math.max(bw, bh);
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(IMG.star, b[0], b[1], bw, bh, cx - bw * k / 2, cy - bh * k / 2, bw * k, bh * k); ctx.restore();
}

function zoomAt(t) {
  if (t < T.zoom) return 1;
  if (t < T.pop) return Math.exp(lerp(0, Math.log(6.5), ease((t - T.zoom) / (T.pop - T.zoom))));
  return Math.exp(lerp(Math.log(6.5), 0, ease(clamp((t - T.pop - 0.15) / 2.6))));
}

function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  if (!PAPER_TEX) PAPER_TEX = paperTex();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  const z = zoomAt(t);
  ctx.save(); ctx.translate(STAR_S[0], STAR_S[1]); ctx.scale(z, z); ctx.translate(-STAR_S[0], -STAR_S[1]); ctx.translate(0, -LIFT);
  // a tiny hand-held drift
  ctx.translate(3 * Math.sin(t * 0.7), 2 * Math.cos(t * 0.5));
  ctx.drawImage(PAPER_TEX, -W, -H, W * 3, H * 3);   // generous so the zoomed-out edges stay paper
  ctx.drawImage(PAPER_TEX, 0, LIFT - H, W, H); ctx.drawImage(PAPER_TEX, 0, LIFT); ctx.drawImage(PAPER_TEX, 0, LIFT + H, W, H);

  const popped = t >= T.pop;
  if (popped) {
    // the real NOVA desktop sits where the sketch was
    ctx.save(); rr(ctx, FR[0], FR[1], FR[2] - FR[0], FR[3] - FR[1], 22); ctx.clip();
    ctx.drawImage(IMG['ui-desktop'], FR[0], FR[1], FR[2] - FR[0], FR[3] - FR[1]); ctx.restore();
    rr(ctx, FR[0], FR[1], FR[2] - FR[0], FR[3] - FR[1], 22); ctx.lineWidth = 4; ctx.strokeStyle = LEAD; ctx.stroke();
  }
  // the pencil drawing (inside the screen it is replaced by the real thing after the pop)
  for (const s of STROKES) {
    const inside = s.pts.every(([x, y]) => x > FR[0] + 5 && x < FR[2] - 5 && y > FR[1] + 5 && y < FR[3] - 5);
    if (popped && inside) continue;
    if (popped && s.w >= 4.2 && s.t0 < 0.5) continue;   // the outline was redrawn crisp above
    if (popped && (s.t0 === 6.9 || s.t0 === 7.1)) continue; // the arrow to the star
    drawStroke(s, t);
  }
  // the star gets a soft colour wash as we dive in
  if (!popped && t > T.zoom + 1.0) {
    const a = clamp((t - T.zoom - 1.0) / 2.0);
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    const g = ctx.createRadialGradient(STAR_C[0], STAR_C[1], 0, STAR_C[0], STAR_C[1], 80);
    g.addColorStop(0, `rgba(255,190,120,${0.7 * a})`); g.addColorStop(0.6, `rgba(120,160,255,${0.45 * a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(STAR_C[0] - 90, STAR_C[1] - 90, 180, 180); ctx.restore();
  }
  for (const [s, x, y, size, col, t0, d, rot] of NOTES) {
    if (popped && s === 'our star') continue;   // the star became the real OS
    hand(s, x, y, size, col, t, t0, d, rot);
  }
  ctx.restore();

  // anticipation: the star breathes in right before the pop; then flash + ring
  if (t >= T.pop - 0.35 && t < T.pop) {
    const u = (t - T.pop + 0.35) / 0.35;
    ctx.fillStyle = `rgba(255,255,255,${0.25 * u * u})`; ctx.fillRect(0, 0, W, H);
  }
  if (popped) {
    const f = (t - T.pop) / 0.6;
    if (f < 1) {
      ctx.fillStyle = `rgba(255,255,255,${(1 - f) ** 2})`; ctx.fillRect(0, 0, W, H);
      ctx.beginPath(); ctx.arc(STAR_S[0], STAR_S[1], 40 + 1300 * ease(f), 0, Math.PI * 2); ctx.lineWidth = 36 * (1 - f); ctx.strokeStyle = `rgba(255,190,110,${0.8 * (1 - f)})`; ctx.stroke();
    }
  }

  // the end: handwritten line on the paper, then coming soon
  if (t >= T.end) {
    const e = gl(t, T.end, 0.6);
    hand('Make your dreams', 540, 1250, 104, 'rgba(40,40,48,.95)', t, T.end, 0.9, -0.02);
    hand('come true with NOVA ✦', 540, 1360, 104, 'rgba(40,40,48,.95)', t, T.end + 0.8, 1.0, -0.02);
    // an underline drawn by pen
    if (t > T.end + 1.8) { const u = clamp((t - T.end - 1.8) / 0.4); ctx.beginPath(); ctx.moveTo(220, 1430); ctx.quadraticCurveTo(540, 1415, 220 + 640 * u, 1428 - 6 * u); ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgb(232,130,40)'; ctx.stroke(); }
    headline(ctx, 'Coming soon.', 540, 1535, 62, T.soon, 999, t, { color: 'rgb(214,110,30)', w: 800 });
    if (t >= T.soon + 0.5) text(ctx, 'byeno.org', 540, 1610, { size: 40, w: 600, align: 'center', base: 'middle', color: 'rgba(40,40,48,.6)', a: gl(t, T.soon + 0.5) });
  }
}

const LINES = [['Coming soon.', T.soon]];
const acc = document.createElement('canvas'); acc.width = W; acc.height = H; const aC = acc.getContext('2d');
function renderFrame(f, fps = 60, n = 4) {
  const t0 = f / fps;
  if (n <= 1) { seek(t0); return; }
  aC.setTransform(1, 0, 0, 1, 0, 0); aC.clearRect(0, 0, W, H);
  for (let i = 0; i < n; i++) {
    seek(t0 + ((i + 0.5) / n - 0.5) / fps * 0.9);
    aC.globalAlpha = 1 / (i + 1); aC.drawImage(cv, 0, 0);
  }
  aC.globalAlpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(acc, 0, 0);
}
const isFast = t => t >= T.pop - 0.1 && t < T.pop + 0.7;
const ready = (async () => {
  await Promise.all(['400', '500', '600', '700', '900'].map(w => document.fonts.load(`${w} 20px Geist`)));
  await Promise.all(['500', '600', '700', '800'].map(w => document.fonts.load(`${w} 20px GeistV`)));
  await Promise.all(['600', '700'].map(w => document.fonts.load(`${w} 40px Caveat`)));
  await Promise.all([load('star', 'assets/nova-star.png'), load('ui-desktop', 'assets/ui-desktop.png')]);
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, LINES, W, H, CUTS: [], STEPS: [], STROKES: STROKES.map(s => [s.t0, s.d, s.w]) };
})();
