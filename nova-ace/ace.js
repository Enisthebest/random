// NOVA OS Pro — "Meet ACE". 45s. Bold white type on black, ACE at work in a floating screen. Pure function of time.
(() => {
const W = 1920, H = 1080, DUR = 45;
const G = 0.8;

const T = {
  l1: 0.30, l1out: 3.60,          // You ask your computer / for a lot.
  l2: 4.00, l2out: 7.10,          // What if it could / actually help?
  star: 7.50, name: 7.80, sub: 8.40, nameOut: 11.00,
  card: 11.30,                     // the screen grows out of the black
  // each job: [typing starts, sent, visual]
  s1: 11.90, cap1: 12.20, cap1Out: 15.20,
  s2: 15.50, cap2: 15.80, cap2Out: 19.20,
  s3: 19.50, cap3: 19.80, cap3Out: 23.20,
  s4: 23.50, cap4: 23.80, cap4Out: 27.20,
  s5: 27.50, cap5: 27.80, cap5Out: 30.80,
  s6: 31.00, cap6: 31.30, cap6Out: 34.80,
  priv: 35.00, capPriv: 35.20, allow: 36.20, pills: 36.60, capPrivOut: 39.50,
  cardOut: 39.80,                  // the screen folds into the star
  endStar: 40.20, endName: 40.60, pro: 41.60, small: 42.60,
};
const JOBS = [
  { t: 's1', q: 'Open Files and Settings.', a: 'Done. Files and Settings are open.' },
  { t: 's2', q: 'What’s the weather tomorrow?', a: 'Sunny tomorrow. High of 21°.' },
  { t: 's3', q: 'Tell Sam I’m running late.', a: 'Sent to Sam.' },
  { t: 's4', q: 'Clean up my inbox.', a: 'Sorted 128 emails. Inbox zero.' },
  { t: 's5', q: 'How hot is my PC?', a: 'CPU 48°C, GPU 52°C. All good.' },
  { t: 's6', q: 'Do all of that. At once.', a: 'All five, done.' },
  { t: 'priv', q: 'Look at my screen.', a: 'I need your OK first.' },
];
const TYPE = 0.5, SEND = 0.62; // typing time; the bubble sends right after

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
const back = (t, a, d = G) => clamp((t - a - d / 2) / (d / 2));
const bump = (t, a, d) => { const u = (t - a) / d; return u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0; };
const lerpRect = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));
const fmtN = n => Math.round(n).toLocaleString('en-US');

// ---------- colour ----------
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mix = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));
const PILL = [16, 16, 19], WIN = [13, 13, 17], WIN_SIDE = [18, 18, 23];
const CARD_T = [19, 19, 23], CARD_B = [9, 9, 13];
const BTN = [37, 37, 40], SEL = [54, 54, 57];
const LABEL = 'rgb(176,176,181)', SUB = 'rgb(140,140,146)', TXT = 'rgb(228,228,231)';
const BLUE = [38, 140, 255], BLUE_A = [16, 116, 228], GREEN = [48, 209, 88], RED = [255, 92, 92], ORANGE = [255, 159, 10];

// ---------- canvas ----------
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const IMG = {};
const ICON_BOX = { folder: [85, 117, 1313, 1074], settings: [116, 114, 1138, 1148], shield: [115, 61, 1138, 1194], star: [186, 41, 1187, 1100] };
const load = (k, src) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.src = src; });
const PATHS = {};
for (const k in window.ICONS) PATHS[k] = new Path2D(window.ICONS[k]);
let BLUR_WALL = null;
let Z = 1; // current pixels-per-world-unit, for hairlines and shadows

// ---------- helpers ----------
function rr(g, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.roundRect(x, y, w, h, r); }
const rrR = (g, R, r) => rr(g, R[0], R[1], R[2] - R[0], R[3] - R[1], r);
function shadow(g, pathFn, elev) {
  if (elev <= 0.01 || g.globalAlpha <= 0) return;
  const e = elev * Z, m = g.getTransform(), OFF = 30000;
  g.save(); g.setTransform(m.a, m.b, m.c, m.d, m.e - OFF, m.f);
  for (const [a, b, oy] of [[0.14, 0.6, 0.25], [0.12, 2.2, 0.9], [0.08, 5, 2]]) {
    g.shadowColor = `rgba(0,0,0,${a * g.globalAlpha})`; g.shadowBlur = e * b; g.shadowOffsetX = OFF; g.shadowOffsetY = e * oy;
    pathFn(); g.fillStyle = '#000'; g.fill();
  }
  g.restore();
}
function text(g, s, x, y, o) {
  const a = o.a == null ? 1 : o.a; if (a <= 0) return;
  g.save();
  g.font = `${o.w || 500} ${o.size}px ${o.v ? 'GeistV' : 'Geist'}`;
  g.fillStyle = o.color || TXT; g.globalAlpha *= a;
  g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic';
  g.letterSpacing = (o.track || 0) * o.size + 'px';
  g.fillText(s, x, y); g.restore();
}
function measure(s, size, w, track = 0, v = false) { ctx.save(); ctx.font = `${w} ${size}px ${v ? 'GeistV' : 'Geist'}`; ctx.letterSpacing = track * size + 'px'; const m = ctx.measureText(s).width; ctx.restore(); return m; }
function icon(g, name, cx, cy, size, color = TXT, a = 1, lw = 2) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(cx - size / 2, cy - size / 2); g.scale(size / 24, size / 24);
  g.strokeStyle = color; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(PATHS[name]); g.restore();
}
function drawImg(g, key, cx, cy, size, a = 1) {
  if (key === 'terminal') return terminalIcon(g, cx, cy, size * 0.95, a);
  const b = ICON_BOX[key], bw = b[2] - b[0], bh = b[3] - b[1], k = size / Math.max(bw, bh);
  g.save(); g.globalAlpha *= a;
  g.drawImage(IMG[key], b[0], b[1], bw, bh, cx - bw * k / 2, cy - bh * k / 2, bw * k, bh * k); g.restore();
}
function terminalIcon(g, cx, cy, s, a = 1) {
  g.save(); g.globalAlpha *= a;
  const r = s * 0.27, x = cx - s / 2, y = cy - s / 2;
  const gr = g.createLinearGradient(0, y, 0, y + s); gr.addColorStop(0, '#f3f4f7'); gr.addColorStop(1, '#b9bdc6');
  rr(g, x, y, s, s, r); g.fillStyle = gr; g.fill();
  rr(g, x + s * 0.06, y + s * 0.05, s * 0.88, s * 0.84, r * 0.85);
  const gi = g.createLinearGradient(0, y, 0, y + s); gi.addColorStop(0, '#e6e8ed'); gi.addColorStop(1, '#cdd0d7'); g.fillStyle = gi; g.fill();
  g.strokeStyle = '#555a66'; g.lineWidth = s * 0.075; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x + s * 0.28, y + s * 0.34); g.lineTo(x + s * 0.44, y + s * 0.49); g.lineTo(x + s * 0.28, y + s * 0.64); g.stroke();
  g.beginPath(); g.moveTo(x + s * 0.52, y + s * 0.66); g.lineTo(x + s * 0.72, y + s * 0.66); g.stroke();
  g.restore();
}
function pillShape(g, R, r = 12, fill = PILL, elev = 3) {
  const p = () => rrR(g, R, r);
  shadow(g, p, elev);
  p(); g.fillStyle = rgba(fill); g.fill();
  p(); g.lineWidth = 1 / Z; g.strokeStyle = 'rgba(255,255,255,.07)'; g.stroke();
}
function windowShape(g, R, r, elev) {
  const p = () => rrR(g, R, r);
  shadow(g, p, elev);
  p(); g.fillStyle = rgba(WIN); g.fill();
  p(); g.lineWidth = 1 / Z; g.strokeStyle = 'rgba(255,255,255,.09)'; g.stroke();
  return p;
}
function toggle(g, R, on, col) {
  const knobX = lerp(R[0] + 13, R[2] - 13, on);
  rrR(g, R, 12); g.fillStyle = rgba(mix([53, 53, 56], col, on)); g.fill();
  g.beginPath(); g.arc(knobX, (R[1] + R[3]) / 2, 11, 0, Math.PI * 2); g.fillStyle = 'rgb(242,242,244)'; g.fill();
}
const label = (g, s, x, y, a) => text(g, s, x, y, { size: 11, w: 700, track: 0.08, color: LABEL, a });

// ---------- Apple-style type ----------
// words rise and fade in one after another; the whole line lifts away together.
function headline(g, s, cx, cy, size, tin, tout, t, o = {}) {
  if (t < tin || t > tout + 0.5) return;
  const w = o.w || 800, track = o.track == null ? -0.035 : o.track, gap = size * 0.24;
  const words = s.split(' '), ws = words.map(x => measure(x, size, w, track, true));
  const total = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  const outE = gl(t, tout, 0.5);
  let x = cx - total / 2;
  words.forEach((word, i) => {
    const e = ease((t - tin - i * 0.07) / 0.7);
    const a = e * (1 - outE);
    text(g, word, x, cy + 26 * (1 - e) - 14 * outE, { size, w, track, color: o.color || '#fff', a, base: 'middle', v: true });
    x += ws[i] + gap;
  });
}

// ---------- pointer ----------
const ARROW = [[0, 0], [0, 16.2], [3.9, 12.6], [6.5, 18.7], [9.1, 17.6], [6.6, 11.7], [11.6, 11.6]];
function drawCursor(g, s, press, k0 = 1.6) {
  const k = k0 * (1 - 0.1 * press);
  g.save(); g.setTransform(k, 0, 0, k, s[0], s[1]);
  const path = () => { g.beginPath(); ARROW.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 5; g.shadowOffsetY = 2;
  path(); g.lineJoin = 'round'; g.lineWidth = 2.2; g.strokeStyle = '#fff'; g.stroke();
  g.shadowColor = 'transparent';
  path(); g.fillStyle = '#fff'; g.fill(); path(); g.fillStyle = '#000'; g.fill();
  g.restore();
}

// ---------- desktop pieces (static, world = desktop pixels) ----------
const CLOCK = [931, 9, 988, 45];
const BAR = { left: [15, 9, 180, 45], tray: [1737, 9, 1812, 45], us: [1827, 9, 1866, 45], ctl: [1880, 9, 1905, 45] };
const DOCK_Y = 1036;
const DOCK = ['star', 'folder', 'settings', 'shield', 'terminal'];
const dockX = i => 960 - (5 * 60 - 12) / 2 + 24 + i * 60;
function wallpaper(g, blur = 0) {
  g.drawImage(IMG.wall, -800, -800);
  if (blur > 0) { g.save(); g.globalAlpha *= blur; g.drawImage(BLUR_WALL, -800, -800); g.fillStyle = 'rgba(0,0,0,.32)'; g.fillRect(-800, -800, 3520, 2680); g.restore(); }
}
function topBar(g, e = 1, clock = true) {
  if (e <= 0) return;
  for (const k of ['left', 'tray', 'us', 'ctl']) pillShape(g, lerpRect(CLOCK, BAR[k], e));
  g.save(); g.globalAlpha *= clamp(e * 2 - 1);
  rr(g, 28, 15, 27, 24, 8); g.fillStyle = 'rgb(201,201,207)'; g.fill();
  drawImg(g, 'star', 1757, 27, 16); drawImg(g, 'shield', 1788, 27, 16);
  text(g, 'us', 1846.5, 27.5, { size: 12, w: 600, align: 'center', base: 'middle', color: '#fff' });
  g.restore();
  if (clock) { pillShape(g, CLOCK); text(g, '12:22', 959.5, 27.5, { size: 13, w: 600, align: 'center', base: 'middle', color: '#fff' }); }
}
function dock(g, e = 1, running = []) {
  if (e <= 0) return;
  g.save(); g.translate(0, 110 * (1 - e));
  const dw = 5 * 60 + 8;
  pillShape(g, [960 - dw / 2, DOCK_Y - 32, 960 + dw / 2, DOCK_Y + 32], 16, [13, 13, 16], 5);
  DOCK.forEach((k, i) => {
    drawImg(g, k, dockX(i), DOCK_Y - 1, 44);
    if (running.includes(k)) { g.beginPath(); g.arc(dockX(i), DOCK_Y + 27, 2.5, 0, Math.PI * 2); g.fillStyle = rgba(BLUE); g.fill(); }
  });
  g.restore();
}
function card(g, R) {
  rrR(g, R, 10);
  const gr = g.createLinearGradient(0, R[1], 0, R[3]); gr.addColorStop(0, rgba(CARD_T)); gr.addColorStop(1, rgba(CARD_B));
  g.fillStyle = gr; g.fill(); g.lineWidth = 1 / Z; g.strokeStyle = 'rgba(255,255,255,.06)'; g.stroke();
}
function controlPanel(g, a = 1) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a;
  text(g, 'Control', 1344, 91, { size: 16, w: 600, color: 'rgba(255,255,255,.9)' });
  card(g, [1356, 129, 1620, 405]); card(g, [1356, 441, 1620, 499]); card(g, [1356, 536, 1620, 635]);
  card(g, [1660, 129, 1880, 187]); card(g, [1660, 224, 1880, 340]); card(g, [1660, 377, 1880, 476]);
  label(g, 'SOUND', 1372, 154);
  rrR(g, [1372, 173, 1414, 222], 21); g.fillStyle = 'rgb(41,41,44)'; g.fill();
  icon(g, 'volume-2', 1393, 198, 18, '#fff');
  rr(g, 1438, 186, 108, 24, 12); g.fillStyle = 'rgb(34,34,36)'; g.fill();
  const gr = g.createLinearGradient(1438, 0, 1530, 0); gr.addColorStop(0, rgba(BLUE_A)); gr.addColorStop(1, rgba(BLUE));
  rr(g, 1438, 186, 104, 24, 12); g.fillStyle = gr; g.fill();
  g.beginPath(); g.arc(1530, 198, 11, 0, Math.PI * 2); g.fillStyle = 'rgb(242,242,244)'; g.fill();
  text(g, '88%', 1600, 202.5, { size: 12, w: 600, align: 'right', color: 'rgb(205,205,210)' });
  label(g, 'OUTPUT', 1372, 242);
  rrR(g, [1372, 305, 1604, 347], 10); g.fillStyle = rgba(SEL); g.fill();
  icon(g, 'audio-lines', 1389, 281, 17); text(g, 'Echo-Cancel Sink', 1408, 285.5, { size: 13 });
  icon(g, 'monitor', 1390, 326, 17); text(g, 'LG Ultragear', 1409, 330.5, { size: 13 });
  icon(g, 'headphones', 1390, 371, 17); text(g, 'Headphones & speakers', 1408, 375.5, { size: 13 });
  icon(g, 'moon', 1381, 470, 18); text(g, 'Do Not Disturb', 1404, 468, { size: 13, w: 600 }); text(g, 'Off', 1404, 482, { size: 11, color: SUB });
  toggle(g, [1558, 458, 1604, 482], 0, BLUE);
  label(g, 'SHORTCUTS', 1372, 559);
  ['camera', 'search', 'folder', 'lock'].forEach((n, i) => { const x = 1407 + i * 54; g.beginPath(); g.arc(x, 601, 21, 0, Math.PI * 2); g.fillStyle = rgba(BTN); g.fill(); icon(g, n, x, 601, 17); });
  icon(g, 'network', 1685, 158, 18); text(g, 'Network', 1708, 154, { size: 13, w: 600 }); text(g, 'Wired connection 1', 1708, 170, { size: 11, color: SUB });
  icon(g, 'moon-star', 1686, 253, 18); text(g, 'Night Mode', 1708, 249, { size: 13, w: 600 }); text(g, 'On · 3992K', 1708, 265, { size: 11, color: SUB });
  toggle(g, [1820, 240, 1866, 264], 1, ORANGE);
  icon(g, 'sun', 1684, 302, 14); rrR(g, [1714, 290, 1826, 314], 12); g.fillStyle = rgba(BTN); g.fill();
  const g2 = g.createLinearGradient(1714, 0, 1798, 0); g2.addColorStop(0, 'rgb(150,112,58)'); g2.addColorStop(1, 'rgb(214,164,76)');
  rrR(g, [1714, 290, 1798, 314], 12); g.fillStyle = g2; g.fill();
  g.beginPath(); g.arc(1786, 302, 11, 0, Math.PI * 2); g.fillStyle = 'rgb(242,242,244)'; g.fill(); icon(g, 'moon', 1856, 302, 14);
  label(g, 'USB & DRIVES', 1676, 400); icon(g, 'hard-drive', 1686, 442, 19); text(g, 'ARCH_202609', 1706, 437, { size: 13, w: 600 }); text(g, 'not mounted', 1706, 452, { size: 11, color: SUB });
  g.beginPath(); g.arc(1842, 442, 21, 0, Math.PI * 2); g.fillStyle = rgba(BTN); g.fill(); icon(g, 'eject', 1842, 442, 16);
  g.restore();
}


// ---------- ACE panel (inner world = desktop pixels) ----------
const AP = [1170, 150, 1650, 900];
const INPUT = [1190, 830, 1630, 880];
const jobStart = j => T[JOBS[j].t];
const jobEnd = j => j + 1 < JOBS.length ? jobStart(j + 1) : T.cardOut + 2;
function bubble(g, s, x, y, right, a, col) {
  if (a <= 0) return;
  const w = Math.min(430, measure(s, 20, 500) + 40), R = right ? [x - w, y, x, y + 52] : [x, y, x + w + 26, y + 52];
  g.save(); g.globalAlpha *= a;
  rrR(g, R, 26); g.fillStyle = col; g.fill();
  if (!right) drawImg(g, 'star', R[0] + 22, y + 26, 18);
  text(g, s, R[0] + (right ? 20 : 42), y + 33, { size: 20, w: 500, color: '#fff' });
  g.restore();
}
function acePanel(g, t, tq) {
  const p = windowShape(g, AP, 26, 20);
  g.save(); p(); g.clip();
  drawImg(g, 'star', 1212, 196, 34);
  text(g, 'ACE', 1240, 206, { size: 24, w: 800, color: '#fff', v: true, track: 0.04 });
  text(g, 'Your AI. Built right in.', 1624, 204, { size: 13, color: SUB, align: 'right' });
  g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(1170, 236, 480, 1);
  // the current exchange; the last one lifts away as the next is typed
  let typing = '';
  JOBS.forEach((J, j) => {
    const t0 = jobStart(j), t1 = jobEnd(j);
    if (t < t0 || t > t1 + 0.5) return;
    const leave = gl(t, t1, 0.5), lift = -70 * leave, la = 1 - leave;
    const n = Math.floor(J.q.length * clamp((tq - t0 - 0.1) / TYPE) + 1e-6);
    if (tq < t0 + SEND) typing = J.q.slice(0, n);
    const se = gl(t, t0 + SEND, 0.5);
    if (se > 0) {
      const y = lerp(INPUT[1], 270, se) + lift;
      bubble(g, J.q, 1630, y, true, la * se, rgba(BLUE));
    }
    const re = gl(t, t0 + SEND + 0.45, 0.6);
    if (re > 0) bubble(g, J.a, 1190, 342 + 12 * (1 - re) + lift, false, la * re, 'rgba(255,255,255,.08)');
  });
  rrR(g, INPUT, 25); g.fillStyle = 'rgba(255,255,255,.06)'; g.fill();
  text(g, typing || 'Ask ACE anything', 1214, 862, { size: 19, color: typing ? '#fff' : SUB });
  g.beginPath(); g.arc(1604, 855, 17, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.9)'; g.fill();
  icon(g, 'arrow-up', 1604, 855, 17, '#111');
  g.restore();
}

// ---------- what ACE does, on the left ----------
const titleBar = (g, R, name) => {
  g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(R[0], R[1] + 46, R[2] - R[0], 1);
  text(g, name, (R[0] + R[2]) / 2, R[1] + 29, { size: 14, w: 600, align: 'center', color: 'rgb(160,160,166)' });
};
function grownWindow(g, t, t0, dockIdx, R, name, content) {
  const e = gl(t, t0), d = dockX(dockIdx);
  if (e <= 0) return;
  const r = lerpRect([d - 22, DOCK_Y - 22, d + 22, DOCK_Y + 22], R, e);
  const p = windowShape(g, r, lerp(11, 16, e), lerp(3, 18, e));
  const a = back(t, t0); if (a <= 0) return;
  g.save(); p(); g.clip(); g.globalAlpha *= a; titleBar(g, R, name); content(); g.restore();
}
function vApps(g, t) {
  const t0 = jobStart(0) + SEND + 0.2;
  const F = [320, 200, 880, 600];
  grownWindow(g, t, t0, 1, F, 'Files', () => {
    g.fillStyle = rgba(WIN_SIDE); g.fillRect(F[0], F[1] + 47, 150, F[3] - F[1] - 47);
    [['house', 'Home'], ['file-text', 'Documents'], ['image', 'Pictures'], ['download', 'Downloads']].forEach(([ic, n], i) => {
      const y = 290 + i * 40; if (i === 0) { rrR(g, [330, y - 16, 460, y + 16], 8); g.fillStyle = rgba(BLUE, 0.22); g.fill(); }
      icon(g, ic, 350, y, 16, i === 0 ? rgba(BLUE) : TXT); text(g, n, 368, y + 5, { size: 13 });
    });
    ['Documents', 'Pictures', 'Music', 'Projects', 'Screens', 'Downloads'].forEach((n, i) => {
      const x = 550 + (i % 3) * 115, y = 330 + Math.floor(i / 3) * 130;
      drawImg(g, 'folder', x, y, 64); text(g, n, x, y + 50, { size: 12, align: 'center' });
    });
  });
  const S = [560, 390, 1110, 850];
  grownWindow(g, t, t0 + 0.18, 2, S, 'Settings', () => {
    g.fillStyle = rgba(WIN_SIDE); g.fillRect(S[0], S[1] + 47, 150, S[3] - S[1] - 47);
    [['palette', 'Appearance'], ['monitor', 'Display'], ['volume-2', 'Sound'], ['network', 'Network']].forEach(([ic, n], i) => {
      const y = 480 + i * 40; if (i === 0) { rrR(g, [570, y - 16, 700, y + 16], 8); g.fillStyle = rgba(BLUE, 0.22); g.fill(); }
      icon(g, ic, 590, y, 16, i === 0 ? rgba(BLUE) : TXT); text(g, n, 608, y + 5, { size: 13 });
    });
    text(g, 'Appearance', 735, 490, { size: 20, w: 700, color: '#fff' });
    text(g, 'Accent colour', 735, 525, { size: 12, w: 600, color: LABEL });
    [[38, 140, 255], [255, 146, 30], [48, 209, 88], [255, 64, 140], [160, 96, 255]].forEach((c, i) => { g.beginPath(); g.arc(750 + i * 40, 552, 13, 0, Math.PI * 2); g.fillStyle = rgba(c); g.fill(); });
    g.beginPath(); g.arc(750, 552, 18, 0, Math.PI * 2); g.lineWidth = 2; g.strokeStyle = '#fff'; g.stroke();
    text(g, 'Wallpaper', 735, 600, { size: 12, w: 600, color: LABEL });
    g.save(); rrR(g, [735, 612, 935, 725], 8); g.clip(); g.drawImage(IMG.wall, 800, 800, 1920, 1080, 735, 612, 200, 113); g.restore();
  });
}
function panelCard(g, R, a, e) {
  const r = [R[0], R[1] + 24 * (1 - e), R[2], R[3] + 24 * (1 - e)];
  g.save(); g.globalAlpha *= a * e;
  const p = windowShape(g, r, 22, 18);
  p(); g.clip(); g.translate(0, 24 * (1 - e));
  return () => g.restore();
}
function vWeather(g, t, tq, a) {
  const e = gl(t, jobStart(1) + SEND + 0.2); if (e <= 0) return;
  const done = panelCard(g, [380, 300, 1060, 720], a, e);
  icon(g, 'globe', 414, 342, 18, SUB); text(g, 'Web · 3 sources', 434, 348, { size: 14, color: SUB });
  text(g, 'Tomorrow', 414, 400, { size: 16, w: 600, color: LABEL });
  icon(g, 'cloud-sun', 470, 470, 84, 'rgb(255,196,80)', 1, 1.6);
  text(g, '21°', 540, 500, { size: 96, w: 800, color: '#fff', v: true, track: -0.03 });
  text(g, 'Sunny · low 12°', 700, 470, { size: 20, w: 600, color: '#fff' });
  text(g, 'Light breeze, no rain', 700, 498, { size: 16, color: SUB });
  [['9', 14], ['12', 19], ['15', 21], ['18', 18], ['21', 15], ['24', 12]].forEach(([h, v], i) => {
    const x = 440 + i * 100, bh = (v - 8) * 7;
    rrR(g, [x - 14, 640 - bh, x + 14, 640], 8); g.fillStyle = rgba(mix([80, 150, 255], [255, 190, 80], (v - 12) / 9), 0.85); g.fill();
    text(g, v + '°', x, 628 - bh, { size: 14, w: 600, align: 'center' });
    text(g, h + ':00', x, 668, { size: 12, align: 'center', color: SUB });
  });
  done();
}
function vMessage(g, t, tq, a) {
  const t0 = jobStart(2) + SEND + 0.2, e = gl(t, t0); if (e <= 0) return;
  const done = panelCard(g, [400, 300, 1060, 700], a, e);
  g.beginPath(); g.arc(446, 350, 22, 0, Math.PI * 2); g.fillStyle = 'rgb(120,90,220)'; g.fill();
  text(g, 'S', 446, 357, { size: 20, w: 700, align: 'center', color: '#fff' });
  text(g, 'Sam', 480, 346, { size: 18, w: 700, color: '#fff' }); text(g, 'Messages', 480, 366, { size: 13, color: SUB });
  g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(400, 392, 660, 1);
  bubble(g, 'Still on for 7?', 430, 420, false, 1, 'rgba(255,255,255,.08)');
  const se = gl(t, t0 + 0.35, 0.6);
  bubble(g, 'Running a bit late, be there in 10!', 1030, 500 + 20 * (1 - se), true, se, rgba(BLUE));
  const de = gl(t, t0 + 0.9, 0.5);
  if (de > 0) { icon(g, 'check-check', 952, 574, 16, rgba(BLUE), de); text(g, 'Delivered', 1030, 580, { size: 13, align: 'right', color: SUB, a: de }); }
  done();
}
const MAILS = [['Weekly deals', 'Up to 40% off this weekend'], ['Your receipt', 'Order #4821 confirmed'], ['Team update', 'Notes from Monday'], ['Newsletter', 'This week in design'], ['Security code', 'Your sign-in code'], ['Invitation', 'Dinner on Friday?'], ['Promo', 'Last chance!']];
function vInbox(g, t, tq, a) {
  const t0 = jobStart(3) + SEND + 0.2, e = gl(t, t0); if (e <= 0) return;
  const done = panelCard(g, [380, 210, 1080, 850], a, e);
  icon(g, 'inbox', 418, 256, 22, TXT); text(g, 'Inbox', 444, 264, { size: 22, w: 700, color: '#fff' });
  const ce = clamp((tq - t0 - 0.5) / 1.3);
  const unread = Math.round(128 * (1 - ease(ce)));
  text(g, unread ? unread + ' unread' : 'Inbox zero', 1046, 264, { size: 16, w: 600, align: 'right', color: unread ? SUB : rgba(GREEN) });
  g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(380, 290, 700, 1);
  MAILS.forEach(([s1, s2], i) => {
    const le = gl(t, t0 + 0.5 + i * 0.12, 0.6); if (le >= 1) return;
    const y = 330 + i * 60;
    g.save(); g.globalAlpha *= 1 - le; g.translate(260 * le, 0);
    g.beginPath(); g.arc(414, y + 6, 5, 0, Math.PI * 2); g.fillStyle = rgba(BLUE); g.fill();
    text(g, s1, 436, y, { size: 16, w: 600, color: '#fff' }); text(g, s2, 436, y + 20, { size: 13, color: SUB });
    g.restore();
  });
  const ze = gl(t, t0 + 1.4, 0.6);
  if (ze > 0) {
    g.save(); g.globalAlpha *= ze;
    g.beginPath(); g.arc(730, 470, 40, 0, Math.PI * 2); g.fillStyle = rgba(GREEN, 0.15); g.fill(); icon(g, 'check', 730, 470, 36, rgba(GREEN), 1, 2.5);
    text(g, 'Inbox zero', 730, 548, { size: 26, w: 800, align: 'center', color: '#fff', v: true });
    [['Newsletters', 84], ['Receipts', 31], ['Important', 13]].forEach(([n, c], i) => {
      const x = 440 + i * 200;
      rrR(g, [x, 700, x + 180, 760], 16); g.fillStyle = 'rgba(255,255,255,.05)'; g.fill();
      text(g, n, x + 18, 727, { size: 14, w: 600, color: '#fff' }); text(g, String(c), x + 18, 747, { size: 12, color: SUB });
    });
    g.restore();
  }
  done();
}
function gauge(g, cx, cy, v, label, tq, t0) {
  const r = 90, a0 = Math.PI * 0.75, span = Math.PI * 1.5;
  const u = ease(clamp((tq - t0) / 1.0)), shown = Math.round(lerp(30, v, u));
  g.beginPath(); g.arc(cx, cy, r, a0, a0 + span); g.lineWidth = 14; g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,.08)'; g.stroke();
  g.beginPath(); g.arc(cx, cy, r, a0, a0 + span * (lerp(30, v, u) / 100)); g.strokeStyle = rgba(mix(GREEN, ORANGE, (shown - 30) / 40)); g.stroke();
  text(g, shown + '°C', cx, cy + 10, { size: 40, w: 800, align: 'center', color: '#fff', v: true });
  text(g, label, cx, cy + 40, { size: 14, w: 600, align: 'center', color: SUB });
}
function vTemps(g, t, tq, a) {
  const t0 = jobStart(4) + SEND + 0.2, e = gl(t, t0); if (e <= 0) return;
  const done = panelCard(g, [400, 290, 1060, 720], a, e);
  icon(g, 'thermometer', 432, 330, 20, TXT); text(g, 'Temperatures', 454, 337, { size: 18, w: 700, color: '#fff' });
  gauge(g, 570, 490, 48, 'CPU', tq, t0 + 0.3); gauge(g, 890, 490, 52, 'GPU', tq, t0 + 0.4);
  const ok = gl(t, t0 + 1.3, 0.6);
  text(g, 'All good. Fans quiet.', 730, 660, { size: 18, w: 600, align: 'center', color: rgba(GREEN), a: ok });
  done();
}
const TASKS = [['app-window', 'Open Files & Settings'], ['cloud-sun', 'Weather tomorrow'], ['message-circle', 'Message Sam'], ['mail', 'Clean inbox'], ['thermometer', 'Check temps']];
function vTasks(g, t, tq, a) {
  const t0 = jobStart(5) + SEND + 0.1;
  TASKS.forEach(([ic, n], i) => {
    const e = gl(t, t0 + i * 0.08, 0.7); if (e <= 0) return;
    const x = i < 3 ? 400 : 580 + (i - 3) * 0, col = i < 3 ? 0 : 1;
    const R = col === 0 ? [380, 250 + i * 110, 720, 340 + i * 110] : [750, 305 + (i - 3) * 110, 1090, 395 + (i - 3) * 110];
    g.save(); g.globalAlpha *= a * e; g.translate(0, 20 * (1 - e));
    const p = windowShape(g, R, 20, 10);
    const y = (R[1] + R[3]) / 2;
    icon(g, ic, R[0] + 36, y, 22, TXT);
    text(g, n, R[0] + 64, y + 6, { size: 16, w: 600, color: '#fff' });
    const pr = clamp((t - t0 - 0.5 - i * 0.28) / 0.8), dn = gl(t, t0 + 1.3 + i * 0.28, 0.4);
    const cx = R[2] - 36;
    g.beginPath(); g.arc(cx, y, 14, 0, Math.PI * 2); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.12)'; g.stroke();
    g.beginPath(); g.arc(cx, y, 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ease(pr)); g.strokeStyle = rgba(mix(BLUE, GREEN, dn)); g.lineCap = 'round'; g.stroke();
    if (dn > 0) icon(g, 'check', cx, y, 14, rgba(GREEN), dn, 2.6);
    g.restore();
  });
}
const PM = [520, 320, 1080, 620];
const ALLOW = [820, 548, 1052, 596];
function vPrivacy(g, t, tq, a) {
  const t0 = T.priv + SEND + 0.15, e = gl(t, t0, 0.6), gone = gl(t, T.allow + 0.05, 0.4);
  if (e > 0 && gone < 1) {
    g.save(); g.globalAlpha *= a * e * (1 - gone);
    const R = [PM[0], PM[1] + 16 * (1 - e), PM[2], PM[3] + 16 * (1 - e)];
    const p = windowShape(g, R, 24, 26);
    g.translate(0, 16 * (1 - e));
    g.beginPath(); g.arc(570, 380, 26, 0, Math.PI * 2); g.fillStyle = rgba(BLUE, 0.18); g.fill(); icon(g, 'eye', 570, 380, 24, rgba(BLUE));
    text(g, 'Allow ACE to see your screen?', 612, 388, { size: 22, w: 800, color: '#fff', v: true });
    text(g, 'Just this once. You can stop it anytime.', 548, 450, { size: 16, color: SUB });
    text(g, 'ACE only looks when you ask.', 548, 476, { size: 16, color: SUB });
    rrR(g, [548, 548, 780, 596], 24); g.fillStyle = 'rgba(255,255,255,.08)'; g.fill();
    text(g, 'Don’t allow', 664, 578, { size: 16, w: 600, align: 'center' });
    const press = bump(t, T.allow - 0.04, 0.3);
    rrR(g, ALLOW, 24); g.fillStyle = rgba(mix([240, 240, 242], [200, 200, 205], press)); g.fill();
    text(g, 'Allow once', 936, 578, { size: 16, w: 700, align: 'center', color: '#111' });
    g.restore();
  }
  [['eye', 'Sees your screen, only when you ask'], ['square-terminal', 'Runs commands, only with your permission']].forEach(([ic, s2], i) => {
    const le = gl(t, T.pills + i * 0.2, 0.7); if (le <= 0) return;
    const y = 430 + i * 90;
    g.save(); g.globalAlpha *= a * le; g.translate(0, 16 * (1 - le));
    rrR(g, [400, y - 34, 1080, y + 34], 34); g.fillStyle = 'rgb(236,236,238)'; g.fill();
    icon(g, ic, 444, y, 24, '#111');
    text(g, s2, 480, y + 7, { size: 20, w: 700, color: '#111' });
    icon(g, 'lock', 1040, y, 22, '#111');
    g.restore();
  });
}
const VISUALS = [vApps, vWeather, vMessage, vInbox, vTemps, vTasks, vPrivacy];
function innerScene(g, t, tq) {
  wallpaper(g); topBar(g); dock(g);
  VISUALS.forEach((fn, j) => {
    const t0 = jobStart(j), t1 = jobEnd(j);
    if (t < t0 || t > t1 + 0.5) return;
    const a = 1 - gl(t, t1, 0.5);
    if (j === 0) { g.save(); g.globalAlpha *= a; fn(g, t, tq); g.restore(); } else fn(g, t, tq, a);
  });
  acePanel(g, t, tq);
}

// ---------- the floating screen ----------
const CARD_R = [240, 70, 1680, 880];
const IN = { x: 975, y: 525, z: 1.3 };
function cardRect(t) {
  if (t < T.cardOut) return lerpRect([940, 455, 980, 495], CARD_R, gl(t, T.card));
  return lerpRect(CARD_R, [960 - 60, 400 - 60, 960 + 60, 400 + 60], gl(t, T.cardOut));
}
function drawCard(g, t, tq) {
  if (t < T.card || t > T.cardOut + G) return;
  const R = cardRect(t), k = (R[2] - R[0]) / W;
  const fade = t >= T.cardOut ? 1 - clamp((t - T.cardOut - 0.3) / 0.5) : 1;
  const p = () => rrR(g, R, lerp(10, 28, clamp(k * 1.4)));
  g.save(); g.globalAlpha = fade; g.setTransform(1, 0, 0, 1, 0, 0);
  Z = 1; shadow(g, p, 18);
  p(); g.clip();
  Z = k * IN.z;
  g.setTransform(Z, 0, 0, Z, R[0] + (W / 2 - IN.x * IN.z) * k, R[1] + (H / 2 - IN.y * IN.z) * k);
  innerScene(g, t, tq);
  // pointer: only for the permission prompt
  if (t >= T.priv + 0.3 && t < T.cardOut) {
    const from = [900, 800], to = [(ALLOW[0] + ALLOW[2]) / 2 + 20, (ALLOW[1] + ALLOW[3]) / 2 + 4];
    const e = gl(t, T.allow - 0.95);
    const w = [lerp(from[0], to[0], e), lerp(from[1], to[1], e)];
    const s = [R[0] + ((w[0] - IN.x) * IN.z + W / 2) * k, R[1] + ((w[1] - IN.y) * IN.z + H / 2) * k];
    g.globalAlpha = fade * clamp((t - T.priv - 0.3) / 0.3) * (1 - clamp((t - T.pills - 0.6) / 0.4));
    drawCursor(g, s, bump(t, T.allow - 0.07, 0.22), 1.6 * k * 1.3);
  }
  g.restore();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); p(); g.lineWidth = 1; g.strokeStyle = `rgba(255,255,255,${0.12 * fade})`; g.stroke(); g.restore();
}

// ---------- frame ----------
function seek(t, tq = t) {
  t = clamp(t, 0, DUR - 1e-6); tq = clamp(tq, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  Z = 1;
  headline(ctx, 'You ask your computer', 960, 475, 104, T.l1, T.l1out, t);
  headline(ctx, 'for a lot.', 960, 605, 104, T.l1 + 0.3, T.l1out, t);
  headline(ctx, 'What if it could', 960, 475, 104, T.l2, T.l2out, t);
  headline(ctx, 'actually help?', 960, 605, 104, T.l2 + 0.3, T.l2out, t);
  const se = gl(t, T.star), so = gl(t, T.nameOut, 0.5);
  if (se > 0 && so < 1) drawImg(ctx, 'star', 960, 360 - 10 * so, 120 * lerp(0.7, 1, se), se * (1 - so));
  headline(ctx, 'Meet ACE.', 960, 540, 124, T.name, T.nameOut, t);
  headline(ctx, 'Your AI. Built right in.', 960, 670, 72, T.sub, T.nameOut, t, { color: 'rgba(255,255,255,.62)' });
  drawCard(ctx, t, tq);
  ctx.setTransform(1, 0, 0, 1, 0, 0); Z = 1;
  const cap = (s, a, b) => headline(ctx, s, 960, 978, 60, a, b, t);
  cap('It opens your apps.', T.cap1, T.cap1Out);
  cap('It searches the web.', T.cap2, T.cap2Out);
  cap('It messages your friends.', T.cap3, T.cap3Out);
  cap('It cleans your inbox.', T.cap4, T.cap4Out);
  cap('It watches your temps.', T.cap5, T.cap5Out);
  cap('It handles many tasks at once.', T.cap6, T.cap6Out);
  cap('And it knows its place.', T.capPriv, T.capPrivOut);
  // end: ACE. / Only in Pro.
  const ee = gl(t, T.endStar);
  if (ee > 0) drawImg(ctx, 'star', 960, 330, lerp(120, 160, ee), ee);
  headline(ctx, 'ACE.', 960, 520, 124, T.endName, 99, t);
  headline(ctx, 'Only in Pro.', 960, 660, 124, T.pro, 99, t, { color: 'rgba(255,255,255,.62)' });
  if (t >= T.small) text(ctx, 'NOVA OS Pro  ·  Coming soon  ·  byeno.org', 960, 800, { size: 26, w: 600, align: 'center', color: 'rgba(255,255,255,.6)', a: gl(t, T.small) });
}

const acc = document.createElement('canvas'); acc.width = W; acc.height = H; const aC = acc.getContext('2d');
function renderFrame(f, fps = 60, n = 4) {
  const t0 = f / fps;
  if (n <= 1) { seek(t0); return; }
  aC.setTransform(1, 0, 0, 1, 0, 0); aC.clearRect(0, 0, W, H);
  for (let i = 0; i < n; i++) {
    seek(t0 + ((i + 0.5) / n - 0.5) / fps * 0.9, t0);
    aC.globalAlpha = 1 / (i + 1); aC.drawImage(cv, 0, 0);
  }
  aC.globalAlpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(acc, 0, 0);
}
const isFast = t => (t > T.card - 0.05 && t < T.card + G + 0.05) || (t > T.cardOut - 0.05 && t < T.cardOut + G + 0.05);

const ready = (async () => {
  await Promise.all(['400', '500', '600', '700', '900'].map(w => document.fonts.load(`${w} 20px Geist`)));
  await Promise.all(['500', '700', '800'].map(w => document.fonts.load(`${w} 20px GeistV`)));
  const A = '../nova-os/assets/';
  await Promise.all([load('wall', A + 'wallpaper-padded.jpg'), load('folder', A + 'folder.webp'), load('settings', A + 'settings.webp'), load('shield', A + 'shield.webp'), load('star', A + 'nova-star.png')]);
  BLUR_WALL = document.createElement('canvas'); BLUR_WALL.width = IMG.wall.width; BLUR_WALL.height = IMG.wall.height;
  const b = BLUR_WALL.getContext('2d'); b.filter = 'blur(36px)'; b.drawImage(IMG.wall, 0, 0);
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, JOBS, TYPE, SEND, W, H };
})();
