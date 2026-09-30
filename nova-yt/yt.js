// "Meet NOVA OS" — first YouTube video, 3:00, 1920x1080. Pure function of time: seek(t) draws frame t.
// World units are desktop pixels; the camera moves through the desktop.
(() => {
const W = 1920, H = 1080, DUR = 180;
const G = 0.8;

const T = {
  // cold open
  wallIn: 0.5, star: 2.5, meet: 4.0, tag: 6.0, introOut: 10.5, lockIn: 11.5,
  // unlock
  swipe: 14.0, unlock: 14.6, bar: 15.5, dock: 15.7, cards: 15.9,
  lineA: 19.5, lineOut: 25.5, blurA: 19.0, blurAOut: 26.0,
  // 01 design
  ch1: 28.0, ch1Out: 30.6, camBar: 31.2, clean: 32.0, cleanOut: 35.0,
  camDock: 35.4, sweep: 36.2, calm: 36.2, calmOut: 39.2,
  camPanel: 39.6, curNight: 40.2, night: 41.2, eyes: 41.6, eyesOut: 45.0,
  camFull: 45.4, curGear: 45.6, gear: 46.5, setWin: 46.55, camSet: 47.0, curSw: 47.6, accent: 48.6, yours: 49.2, yoursOut: 53.0,
  camBack: 53.2, setClose: 54.0,
  // 02 privacy
  blurB: 57.0, ch2: 57.4, ch2Out: 60.4, p1: 61.0, p1Out: 64.6, p2: 65.0, p2Out: 67.6, p3: 68.0, p3Out: 73.8,
  // 03 security
  ch3: 75.0, ch3Out: 78.0, locked: 78.4, lockedOut: 82.0, secCards: 82.4, secOut: 87.8,
  sandbox: 88.4, probe: 89.6, sandCap: 89.0, sandCapOut: 94.0, blurBOut: 88.0,
  firewall: 94.8, fwCap: 95.4, fwCapOut: 101.2,
  // 04 shield
  blurC: 101.8, ch4: 102.2, ch4Out: 105.2, blurCOut: 105.6, shieldWin: 105.8, wave: 107.2,
  sh1: 106.6, sh1Out: 110.5, sh2: 110.8, sh2Out: 114.5,
  spot1: 114.8, spot1Cap: 115.3, spot2: 117.6, spot2Cap: 118.1, spot3: 120.4, spot3Cap: 120.9, spotOut: 123.0,
  // 05 guard
  blurD: 123.6, ch5: 124.0, ch5Out: 127.0, blurDOut: 127.4, guard: 127.4, scan: 128.6, scanDone: 132.0, gCap: 129.0, gCapOut: 135.2,
  // 06 built in
  blurE: 135.6, ch6: 136.0, ch6Out: 139.0, built: 139.4, builtOut: 142.8, apps: 143.0, fly: 146.8, blurEOut: 146.6,
  // 07 lean
  blurF: 150.0, ch7: 150.4, ch7Out: 153.4, stats: 153.8, light: 154.0, lightOut: 157.6, boots: 158.0, bootsOut: 161.6,
  // ending
  blurFOut: 162.0, pullOut: 163.0, fold: 165.6, name: 166.6, soon: 167.6, site: 168.4,
  // unused by this film (shared window code expects them)
  camClick: 999,
};

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
  let x = o.left ? cx : cx - total / 2;
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
// ---------- app windows ----------
const APPWIN = [540, 150, 1300, 900];
function winFrom(t, t0, iconIdx) {
  const e = gl(t, t0), d = dockX(iconIdx);
  return { R: lerpRect([d - 22, DOCK_Y - 22, d + 22, DOCK_Y + 22], APPWIN, e), e, a: back(t, t0) };
}
function titleBar(g, name) {
  g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(APPWIN[0], APPWIN[1] + 52, APPWIN[2] - APPWIN[0], 1);
  text(g, name, 920, APPWIN[1] + 32, { size: 14, w: 600, align: 'center', color: 'rgb(160,160,166)' });
}
const PROTECTIONS = [
  ['Hide your device ID', 1], ['Private DNS', 1], ['VPN kill switch', 1], ['Tor per app', 0],
  ['Camera off switch', 0], ['Boot tamper check', 1], ['Lock on USB unplug', 1], ['Guest mode', 0],
  ['Decoy login', 0], ['Sandbox status', 1], ['Network watch', 1], ['Secure delete', 1],
  ['Clipboard auto-clear', 1], ['Metadata wipe', 1],
];
const CAM_IDX = 4;
const pillR = i => { const c = i % 2, r = Math.floor(i / 2), x = 580 + c * 348, y = 330 + r * 72; return [x, y - 26, x + 332, y + 26]; };
const CAM_TOGGLE = (() => { const R = pillR(CAM_IDX); return [R[2] - 36, (R[1] + R[3]) / 2]; })();
function shieldWindow(g, t, tq) {
  const w = winFrom(t, T.shieldWin, 3);
  const p = windowShape(g, w.R, lerp(11, 18, w.e), lerp(3, 22, w.e));
  if (w.a <= 0) return;
  g.save(); p(); g.clip(); g.globalAlpha *= w.a;
  titleBar(g, 'NOVA Shield');
  drawImg(g, 'shield', 612, 250, 60);
  text(g, 'All your privacy.', 660, 244, { size: 26, w: 800, color: '#fff', v: true });
  text(g, '14 protections. One tap each.', 660, 272, { size: 15, color: SUB });
  const on = gl(t, T.camClick + 0.03);
  PROTECTIONS.forEach(([name, st], i) => {
    const R = pillR(i), y = (R[1] + R[3]) / 2;
    const v = i === CAM_IDX ? on : st;
    rrR(g, R, 26); g.fillStyle = rgba(mix([255, 255, 255], GREEN, v), lerp(0.05, 0.13, v)); g.fill();
    g.lineWidth = 1.2; g.strokeStyle = rgba(mix([255, 255, 255], GREEN, v), lerp(0.14, 0.5, v)); g.stroke();
    text(g, name, R[0] + 22, y + 6, { size: 17, w: 600, color: '#fff' });
    toggle(g, [R[2] - 60, y - 12, R[2] - 14, y + 12], v, GREEN);
  });
  g.restore();
}
const FW_ROWS = [
  ['Incoming · port scan', '203.0.113.24 → port 22', 0], ['Incoming', '198.51.100.7 → port 3389', 0],
  ['Your phone', 'allowed by you', 1], ['Incoming', '203.0.113.91 → port 445', 0],
  ['Unknown device', '198.51.100.44 → port 8080', 0], ['Incoming', '203.0.113.150 → port 5900', 0],
];
const fwRowY = i => 352 + i * 70;
function firewallWindow(g, t, tq) {
  const p = windowShape(g, APPWIN, 18, 22);
  g.save(); p(); g.clip();
  titleBar(g, 'NOVA Shield — Firewall');
  g.beginPath(); g.arc(612, 262, 30, 0, Math.PI * 2); g.fillStyle = rgba(BLUE, 0.16); g.fill();
  icon(g, 'brick-wall', 612, 262, 28, rgba(BLUE));
  text(g, 'Firewall on', 660, 258, { size: 26, w: 800, color: '#fff', v: true });
  text(g, 'Nothing gets in unless you allow it.', 660, 284, { size: 15, color: SUB });
  // live count of the rows shown so far: whole values only
  let blocked = 0;
  FW_ROWS.forEach(([, , ok], i) => { if (!ok && tq >= T.firewall + 0.4 + i * 0.5) blocked++; });
  text(g, String(blocked), 1262, 262, { size: 34, w: 800, align: 'right', color: '#fff', v: true });
  text(g, 'blocked', 1262, 284, { size: 13, align: 'right', color: SUB });
  FW_ROWS.forEach(([who, dst, ok], i) => {
    const t0 = T.firewall + 0.4 + i * 0.5, e = gl(t, t0, 0.6);
    if (e <= 0) return;
    const y = fwRowY(i) + 16 * (1 - e);
    g.save(); g.globalAlpha *= e;
    rrR(g, [572, y - 28, 1268, y + 28], 12); g.fillStyle = 'rgba(255,255,255,.035)'; g.fill();
    icon(g, ok ? 'circle-check' : 'ban', 610, y, 20, rgba(ok ? GREEN : RED));
    text(g, who, 644, y - 3, { size: 16, w: 600, color: '#fff' });
    text(g, dst, 644, y + 17, { size: 13, color: SUB });
    const col = ok ? GREEN : RED;
    rrR(g, [1150, y - 15, 1248, y + 15], 15); g.fillStyle = rgba(col, 0.15); g.fill();
    text(g, ok ? 'Allowed' : 'Blocked', 1199, y + 5, { size: 13, w: 600, align: 'center', color: rgba(col) });
    g.restore();
  });
  g.restore();
}
function guardWindow(g, t, tq) {
  const p = windowShape(g, APPWIN, 18, 22);
  g.save(); p(); g.clip();
  titleBar(g, 'NOVA Guard');
  const cx = 920, cy = 440, r = 130;
  const sweep = clamp((t - T.scan) / (T.scanDone - T.scan));
  const done = gl(t, T.scanDone, 0.6);
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.lineWidth = 10; g.strokeStyle = 'rgba(255,255,255,.07)'; g.stroke();
  g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ease(sweep)); g.lineCap = 'round';
  g.strokeStyle = rgba(mix(BLUE, GREEN, done)); g.stroke();
  drawImg(g, 'star', cx, cy, 120 * (1 - 0.25 * done), 1 - done);
  // the star gives way to a check when the scan lands
  if (done > 0) {
    g.save(); g.globalAlpha *= done; g.strokeStyle = rgba(GREEN); g.lineWidth = 12; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(cx - 44, cy + 2); g.lineTo(cx - 12, cy + 34); g.lineTo(cx + 50, cy - 30); g.stroke(); g.restore();
  }
  const files = 128420 * ease(clamp((tq - T.scan) / (T.scanDone - T.scan)));
  text(g, 'Scanning…', 920, 640, { size: 28, w: 700, align: 'center', color: '#fff', a: 1 - done });
  text(g, fmtN(files) + ' files checked', 920, 674, { size: 16, align: 'center', color: SUB, a: 1 - done });
  text(g, '0 threats found', 920, 640 - 10 * (1 - done), { size: 28, w: 800, v: true, align: 'center', color: '#fff', a: done });
  text(g, '128,420 files checked · just now', 920, 674, { size: 16, align: 'center', color: SUB, a: done });
  [['shield-check', 'Real-time protection', 'On'], ['scan-search', 'Last scan', 'Just now'], ['circle-check', 'Threats', 'None']].forEach(([ic, n, v], i) => {
    const x = 590 + i * 240;
    rrR(g, [x, 730, x + 220, 850], 14); g.fillStyle = 'rgba(255,255,255,.04)'; g.fill();
    icon(g, ic, x + 30, 764, 20, rgba(BLUE));
    text(g, n, x + 20, 806, { size: 14, color: SUB });
    text(g, v, x + 20, 832, { size: 17, w: 600, color: '#fff' });
  });
  g.restore();
}

// ---------- sandbox diagram ----------
const BOXES = [['folder', 'Files'], ['settings', 'Settings'], ['terminal', 'Terminal'], ['shield', 'Shield']];
const boxX = i => 920 + (i - 1.5) * 270;
function sandbox(g, t) {
  g.fillStyle = '#060608'; g.fillRect(-800, -800, 3520, 2680);
  BOXES.forEach(([k, n], i) => {
    const e = gl(t, T.sandbox + 0.1 + i * 0.1);
    if (e <= 0) return;
    const x = boxX(i), y = 500, s = lerp(0.9, 1, e) * 0.95;
    g.save(); g.globalAlpha *= e; g.translate(x, y); g.scale(s, s);
    rrR(g, [-120, -120, 120, 120], 36); g.fillStyle = 'rgb(15,15,19)'; g.fill();
    g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.14)'; g.stroke();
    drawImg(g, k, 0, -8, 108);
    text(g, n, 0, 164, { size: 20, w: 600, align: 'center', color: 'rgba(255,255,255,.75)' });
    g.restore();
  });
  // a probe reaches from Files toward Settings and stops at the wall
  const pe = gl(t, T.probe);
  if (pe > 0) {
    const x0 = boxX(0) + 114, x1 = boxX(1) - 114, x = lerp(x0, x1 - 6, pe);
    g.save(); g.setLineDash([10, 10]); g.lineDashOffset = -t * 40; g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.55)';
    g.beginPath(); g.moveTo(x0 + 6, 500); g.lineTo(x, 500); g.stroke(); g.restore();
    const hit = back(t, T.probe);
    if (hit > 0) {
      g.save(); g.globalAlpha *= hit;
      rrR(g, [x1 - 3, 440, x1 + 3, 560], 3); g.fillStyle = rgba(RED); g.fill();
      g.beginPath(); g.arc((x0 + x1) / 2, 452, 18, 0, Math.PI * 2); g.fillStyle = rgba(RED, 0.18); g.fill();
      icon(g, 'ban', (x0 + x1) / 2, 452, 22, rgba(RED));
      g.restore();
    }
  }
}


// ======================= Meet NOVA OS =======================
Object.assign(ICON_BOX, { monitor: [0, 0, 256, 256], ledger: [0, 0, 256, 256], images: [0, 0, 256, 256], fix: [0, 0, 256, 256] });
let ACC = { a: BLUE_A, b: BLUE };
const ACC_ORANGE = { a: [236, 112, 16], b: [255, 158, 44] };
const WARM = [255, 208, 150];
const NOVA_O = [245, 142, 30];

// ---------- aura: soft colour behind the intro type ----------
function aura(g, cx, cy, w, a, t) {
  if (a <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  const blob = (x, y, r, c, al) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, rgba(c, al)); gr.addColorStop(0.5, rgba(c, al * 0.45)); gr.addColorStop(1, rgba(c, 0));
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  };
  blob(cx - w * 0.3 + 50 * Math.sin(t * 0.5), cy + 30 * Math.cos(t * 0.4), w * 0.6, NOVA_O, 0.30 * a);
  blob(cx + w * 0.3 + 50 * Math.cos(t * 0.45), cy - 20 + 20 * Math.sin(t * 0.35), w * 0.6, [40, 120, 255], 0.34 * a);
  blob(cx, cy, w * 0.32, [255, 240, 225], 0.09 * a);
  g.restore();
}

// ---------- cameras ----------
const toScreen = (c, p) => [(p[0] - c.x) * c.z + W / 2, (p[1] - c.y) * c.z + H / 2];
function anchorCam(a, s, z) { return { x: a[0] - (s[0] - W / 2) / z, y: a[1] - (s[1] - H / 2) / z, z }; }
function camGlide(c0, c1, e) {
  const a = [c1.x, c1.y], s0 = toScreen(c0, a);
  return anchorCam(a, [lerp(s0[0], W / 2, e), lerp(s0[1], H / 2, e)], lerpLog(c0.z, c1.z, e));
}
const C_FULL = { x: 960, y: 540, z: 1 };
const C_BAR = { x: 1560, y: 250, z: 1.8 };
const C_DOCK = { x: 960, y: 960, z: 2.4 };
const C_PANEL = { x: 1590, y: 360, z: 1.55 };
const C_SET = { x: 880, y: 540, z: 1.3 };
const C_WIN = { x: 920, y: 525, z: 1.3 };
const C_SAND = { x: 920, y: 520, z: 1.15 };
const pillC = i => { const R = pillR(i); return { x: (R[0] + R[2]) / 2, y: (R[1] + R[3]) / 2 + 120, z: 2.4 }; };
const KEYS = [
  [T.camBar, C_BAR], [T.camDock, C_DOCK], [T.camPanel, C_PANEL], [T.camFull, C_FULL], [T.camSet, C_SET], [T.camBack, C_FULL],
  [T.blurB + 1, C_SAND], [T.firewall - 0.3, C_WIN],
  [T.spot1, pillC(8)], [T.spot2, pillC(6)], [T.spot3, pillC(3)], [T.spotOut, C_WIN],
  [T.blurE + 0.2, C_FULL],
];
function camAt(t) {
  let cam = C_FULL;
  for (const [t0, c1] of KEYS) {
    if (t < t0) break;
    cam = camGlide(cam, c1, gl(t, t0));
  }
  return cam;
}

// ---------- blur backdrop (screen space) ----------
const BLURS = [[T.blurA, T.blurAOut], [T.ch1 - 0.4, T.ch1Out + 0.4], [T.blurB, T.blurBOut], [T.blurC, T.blurCOut], [T.blurD, T.blurDOut], [T.blurE, T.blurEOut], [T.blurF, T.blurFOut]];
const blurAmt = t => Math.max(...BLURS.map(([a, b]) => gl(t, a) * (1 - gl(t, b))));
function blurBackdrop(g, a, t, drift = 0) {
  if (a <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a;
  const k = 1 + 0.07 * drift, ox = drift * 40 * Math.sin(t * 0.18), oy = drift * 25 * Math.cos(t * 0.15);
  g.translate(W / 2 + ox, H / 2 + oy); g.scale(k, k); g.translate(-W / 2, -H / 2);
  g.drawImage(BLUR_WALL, 800, 800, 1920, 1080, 0, 0, W, H);
  g.fillStyle = 'rgba(0,0,0,.42)'; g.fillRect(0, 0, W, H);
  g.restore();
}

// ---------- lock ----------
const lockAmt = t => 1 - gl(t, T.unlock);
function drawClock(g, t) {
  const L = lockAmt(t), a = gl(t, T.lockIn, 1.0);
  if (a <= 0) return;
  const bg = 1 - clamp(L / 0.5);
  if (bg > 0) { g.save(); g.globalAlpha *= bg; pillShape(g, CLOCK); g.restore(); }
  text(g, '12:22', lerp(959.5, 960, L), lerp(27.5, 400, L), { size: lerpLog(13, 200, L), w: 600, align: 'center', base: 'middle', color: '#fff', a });
  const da = a * (1 - gl(t, T.swipe, 0.5));
  text(g, 'Wednesday, 30 September', 960, 535 - 90 * gl(t, T.swipe), { size: 30, w: 500, align: 'center', color: 'rgba(255,255,255,.88)', a: da });
}

// ---------- dock: grows from 5 to 9 apps when the app cards land ----------
const OLD_DOCK = ['star', 'folder', 'settings', 'shield', 'terminal'];
const NEW_DOCK = ['star', 'folder', 'shield', 'monitor', 'ledger', 'images', 'fix', 'settings', 'terminal'];
const slotX = (i, n) => 960 - (n * 60 - 12) / 2 + 24 + i * 60;
const APPS = [['shield', 'Shield', 'Privacy controls'], ['folder', 'Files', 'Your files'], ['monitor', 'Monitor', 'What’s running'],
  ['ledger', 'Ledger', 'Card vault'], ['images', 'Images', 'Your photos'], ['fix', 'Fix', 'Repair tools']];
const cardLand = (t, i) => gl(t, T.fly + i * 0.1);
function dockLayout(t) {
  const e = gl(t, T.fly);
  return NEW_DOCK.map((k, i) => {
    const oi = OLD_DOCK.indexOf(k), xn = slotX(i, 9), x = oi >= 0 ? lerp(slotX(oi, 5), xn, e) : xn;
    const ai = APPS.findIndex(a => a[0] === k);
    const visible = oi >= 0 || (ai >= 0 && cardLand(t, ai) >= 1);
    return { k, x, visible };
  });
}
function dock2(g, t, sweepX = null) {
  const e = gl(t, T.dock); if (e <= 0) return;
  g.save(); g.translate(0, 110 * (1 - e));
  const n = lerp(5, 9, gl(t, T.fly)), dw = n * 60 + 8;
  pillShape(g, [960 - dw / 2, DOCK_Y - 32, 960 + dw / 2, DOCK_Y + 32], 16, [13, 13, 16], 5);
  for (const d of dockLayout(t)) {
    if (!d.visible) continue;
    const sw = sweepX == null ? 1 : 1 + 0.34 * Math.exp(-(((d.x - sweepX) / 70) ** 2));
    const press = d.k === 'settings' ? bump(t, T.gear - 0.05, 0.25) : 0;
    const sz = 44 * sw * (1 - 0.1 * press);
    drawImg(g, d.k, d.x, DOCK_Y - 1 - (sz - 44) * 0.5, sz);
  }
  g.restore();
}

// ---------- Control panel: night + accent aware ----------
function panel2(g, t) {
  if (t < T.cards) return;
  const on = gl(t, T.night + 0.02);
  const cards = [[1356, 129, 1620, 405], [1660, 129, 1880, 187], [1356, 441, 1620, 499], [1660, 224, 1880, 340], [1356, 536, 1620, 635], [1660, 377, 1880, 476]];
  cards.forEach((R, i) => {
    const e = gl(t, T.cards + i * 0.08);
    card(g, [R[0], R[1], R[2], lerp(R[1] + 2, R[3], e)]);
  });
  const a = back(t, T.cards + 0.3); if (a <= 0) return;
  g.save(); g.globalAlpha *= a;
  text(g, 'Control', 1344, 91, { size: 16, w: 600, color: 'rgba(255,255,255,.9)' });
  label(g, 'SOUND', 1372, 154);
  rrR(g, [1372, 173, 1414, 222], 21); g.fillStyle = 'rgb(41,41,44)'; g.fill(); icon(g, 'volume-2', 1393, 198, 18, '#fff');
  rr(g, 1438, 186, 108, 24, 12); g.fillStyle = 'rgb(34,34,36)'; g.fill();
  const gr = g.createLinearGradient(1438, 0, 1530, 0); gr.addColorStop(0, rgba(ACC.a)); gr.addColorStop(1, rgba(ACC.b));
  rr(g, 1438, 186, 104, 24, 12); g.fillStyle = gr; g.fill();
  g.beginPath(); g.arc(1530, 198, 11, 0, Math.PI * 2); g.fillStyle = 'rgb(242,242,244)'; g.fill();
  text(g, '88%', 1600, 202.5, { size: 12, w: 600, align: 'right', color: 'rgb(205,205,210)' });
  label(g, 'OUTPUT', 1372, 242);
  rrR(g, [1372, 305, 1604, 347], 10); g.fillStyle = rgba(SEL); g.fill();
  icon(g, 'audio-lines', 1389, 281, 17); text(g, 'Echo-Cancel Sink', 1408, 285.5, { size: 13 });
  icon(g, 'monitor', 1390, 326, 17); text(g, 'LG Ultragear', 1409, 330.5, { size: 13 });
  icon(g, 'headphones', 1390, 371, 17); text(g, 'Headphones & speakers', 1408, 375.5, { size: 13 });
  icon(g, 'moon', 1381, 470, 18); text(g, 'Do Not Disturb', 1404, 468, { size: 13, w: 600 }); text(g, 'Off', 1404, 482, { size: 11, color: SUB });
  toggle(g, [1558, 458, 1604, 482], 0, ACC.b);
  label(g, 'SHORTCUTS', 1372, 559);
  ['camera', 'search', 'folder', 'lock'].forEach((nm, i) => { const x = 1407 + i * 54; g.beginPath(); g.arc(x, 601, 21, 0, Math.PI * 2); g.fillStyle = rgba(BTN); g.fill(); icon(g, nm, x, 601, 17); });
  icon(g, 'network', 1685, 158, 18); text(g, 'Network', 1708, 154, { size: 13, w: 600 }); text(g, 'Wired connection 1', 1708, 170, { size: 11, color: SUB });
  icon(g, 'moon-star', 1686, 253, 18); text(g, 'Night Mode', 1708, 249, { size: 13, w: 600 });
  text(g, 'Off', 1708, 265, { size: 11, color: SUB, a: 1 - clamp(on * 2) }); text(g, 'On · 3992K', 1708, 265, { size: 11, color: SUB, a: clamp(on * 2 - 1) });
  toggle(g, [1820, 240, 1866, 264], on, ORANGE);
  icon(g, 'sun', 1684, 302, 14); rrR(g, [1714, 290, 1826, 314], 12); g.fillStyle = rgba(BTN); g.fill();
  const g2 = g.createLinearGradient(1714, 0, 1798, 0); g2.addColorStop(0, 'rgb(150,112,58)'); g2.addColorStop(1, 'rgb(214,164,76)');
  g.save(); g.globalAlpha *= lerp(0.35, 1, on); rrR(g, [1714, 290, 1798, 314], 12); g.fillStyle = g2; g.fill(); g.restore();
  g.beginPath(); g.arc(1786, 302, 11, 0, Math.PI * 2); g.fillStyle = 'rgb(242,242,244)'; g.fill(); icon(g, 'moon', 1856, 302, 14);
  label(g, 'USB & DRIVES', 1676, 400); icon(g, 'hard-drive', 1686, 442, 19); text(g, 'ARCH_202609', 1706, 437, { size: 13, w: 600 }); text(g, 'not mounted', 1706, 452, { size: 11, color: SUB });
  g.beginPath(); g.arc(1842, 442, 21, 0, Math.PI * 2); g.fillStyle = rgba(BTN); g.fill(); icon(g, 'eject', 1842, 442, 16);
  g.restore();
}

// ---------- Settings: opens from the dock, picks orange, closes back into it ----------
const SETR = [470, 250, 1290, 810];
const swX = i => 716 + i * 52, SW_Y = 440;
function settingsWin(g, t) {
  if (t < T.setWin || t > T.setClose + G) return;
  const gx = slotX(2, 5), from = [gx - 22, DOCK_Y - 22, gx + 22, DOCK_Y + 22];
  const e = gl(t, T.setWin) * (1 - gl(t, T.setClose));
  const R = lerpRect(from, SETR, e);
  const p = windowShape(g, R, lerp(11, 16, e), lerp(3, 20, e));
  const a = t < T.setClose ? back(t, T.setWin) : 1 - clamp((t - T.setClose) / (G * 0.4));
  if (a <= 0) return;
  g.save(); p(); g.clip(); g.globalAlpha *= a;
  g.fillStyle = rgba(WIN_SIDE); g.fillRect(470, 250, 210, 560);
  g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(680, 250, 1, 560); g.fillRect(470, 302, 820, 1);
  text(g, 'Settings', 880, 281, { size: 14, w: 600, align: 'center', color: 'rgb(160,160,166)' });
  rrR(g, [482, 322, 668, 356], 9); g.fillStyle = rgba(ACC.b, 0.22); g.fill();
  [['monitor', 'Appearance'], ['monitor', 'Display'], ['volume-2', 'Sound'], ['network', 'Network'], ['shield-check', 'Privacy']].forEach(([ic, n], i) => {
    const y = 339 + i * 42; icon(g, ic, 504, y, 17, i === 0 ? rgba(ACC.b) : TXT); text(g, n, 524, y + 5, { size: 14, w: i === 0 ? 600 : 500, color: i === 0 ? '#fff' : TXT });
  });
  text(g, 'Appearance', 710, 352, { size: 24, w: 700, color: '#fff' });
  text(g, 'Accent colour', 710, 404, { size: 13, w: 600, color: LABEL });
  [[38, 140, 255], [255, 146, 30], [48, 209, 88], [255, 64, 140], [160, 96, 255], [142, 142, 152]].forEach((c, i) => { g.beginPath(); g.arc(swX(i), SW_Y, 17, 0, Math.PI * 2); g.fillStyle = rgba(c); g.fill(); });
  const rx = lerp(swX(0), swX(1), gl(t, T.accent + 0.02));
  g.beginPath(); g.arc(rx, SW_Y, 23, 0, Math.PI * 2); g.lineWidth = 2.5; g.strokeStyle = '#fff'; g.stroke();
  text(g, 'Wallpaper', 710, 500, { size: 13, w: 600, color: LABEL });
  g.save(); rrR(g, [710, 516, 950, 651], 10); g.clip(); g.drawImage(IMG.wall, 800, 800, 1920, 1080, 710, 516, 240, 135); g.restore();
  rrR(g, [710, 516, 950, 651], 10); g.lineWidth = 2; g.strokeStyle = rgba(ACC.b); g.stroke();
  text(g, 'Dark mode', 710, 710, { size: 15 }); toggle(g, [1214, 694, 1260, 718], 1, ACC.b);
  text(g, 'Transparency', 710, 760, { size: 15 }); toggle(g, [1214, 744, 1260, 768], 1, ACC.b);
  g.restore();
}

// ---------- NOVA Shield: the 14 protections switch on in a wave ----------
function shieldWin2(g, t) {
  if (t < T.shieldWin || t > T.blurD + 1.2) return;
  const sx = slotX(3, 5), e = gl(t, T.shieldWin);
  const R = lerpRect([sx - 22, DOCK_Y - 22, sx + 22, DOCK_Y + 22], APPWIN, e);
  const p = windowShape(g, R, lerp(11, 18, e), lerp(3, 22, e));
  const a = back(t, T.shieldWin); if (a <= 0) return;
  g.save(); p(); g.clip(); g.globalAlpha *= a;
  titleBar(g, 'NOVA Shield');
  drawImg(g, 'shield', 612, 250, 60);
  text(g, 'All your privacy.', 660, 244, { size: 26, w: 800, color: '#fff', v: true });
  text(g, '14 protections. One tap each.', 660, 272, { size: 15, color: SUB });
  PROTECTIONS.forEach(([name], i) => {
    const R2 = pillR(i), y = (R2[1] + R2[3]) / 2;
    const v = gl(t, T.wave + i * 0.12, 0.5);
    rrR(g, R2, 26); g.fillStyle = rgba(mix([255, 255, 255], GREEN, v), lerp(0.05, 0.13, v)); g.fill();
    g.lineWidth = 1.2; g.strokeStyle = rgba(mix([255, 255, 255], GREEN, v), lerp(0.14, 0.5, v)); g.stroke();
    text(g, name, R2[0] + 22, y + 6, { size: 17, w: 600, color: '#fff' });
    toggle(g, [R2[2] - 60, y - 12, R2[2] - 14, y + 12], v, GREEN);
  });
  g.restore();
}

// ---------- screen-space sections over the blur ----------
function chapter(g, num, title, tin, tout, t) {
  if (t < tin || t > tout + 0.6) return;
  const e = gl(t, tin), o = gl(t, tout, 0.5);
  text(g, num, 960 + 40 * (1 - e), 420 - 10 * o, { size: 34, w: 500, v: true, track: 0.5, align: 'center', base: 'middle', color: rgba(NOVA_O), a: e * (1 - o) });
  headline(g, title, 960, 540, 128, tin + 0.15, tout, t);
}
const SEC = [['Hardened core', 'A Linux kernel built to resist attacks.'], ['Sandboxed apps', 'Apps can’t touch what they shouldn’t.'],
  ['Firewall on', 'Nothing gets in unless you allow it.'], ['Zero tracking', 'Nothing phones home. Ever.']];
function securityCards(g, t) {
  if (t < T.secCards || t > T.secOut + 0.6) return;
  const o = gl(t, T.secOut, 0.5);
  SEC.forEach(([h, d], i) => {
    const e = gl(t, T.secCards + i * 0.15); if (e <= 0) return;
    const cx = i % 2 ? 1290 : 630, cy = i < 2 ? 420 : 680, R = [cx - 310, cy - 110, cx + 310, cy + 110];
    g.save(); g.globalAlpha = e * (1 - o); g.translate(0, 24 * (1 - e) - 12 * o);
    rrR(g, R, 34); g.fillStyle = 'rgba(8,8,12,.72)'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,.14)'; g.stroke();
    icon(g, 'lock', R[0] + 52, R[1] + 52, 30, '#fff', 1, 2.2);
    text(g, h, R[0] + 40, R[1] + 128, { size: 40, w: 800, color: '#fff', v: true });
    text(g, d, R[0] + 40, R[1] + 172, { size: 24, color: 'rgba(255,255,255,.62)' });
    g.restore();
  });
}
function appCardR(i) { const cx = 560 + (i % 3) * 400, cy = Math.floor(i / 3) ? 770 : 420; return [cx - 170, cy - 150, cx + 170, cy + 150]; }
function appsGrid(g, t) {
  if (t < T.apps) return;
  APPS.forEach(([k, n, d], i) => {
    const e = gl(t, T.apps + i * 0.1); if (e <= 0) return;
    const f = cardLand(t, i);
    if (f >= 1) return;
    const dl = dockLayout(t).find(x => x.k === k);
    const slot = [dl.x - 22, DOCK_Y - 23, dl.x + 22, DOCK_Y + 21];
    const R0 = appCardR(i), R = lerpRect(R0, slot, f);
    const bgA = 1 - clamp(f / 0.4);
    g.save(); g.globalAlpha = e; g.translate(0, 24 * (1 - e));
    if (bgA > 0) { rrR(g, R, lerp(34, 12, f)); g.fillStyle = `rgba(8,8,12,${0.72 * bgA})`; g.fill(); g.lineWidth = 1.5; g.strokeStyle = `rgba(255,255,255,${0.14 * bgA})`; g.stroke(); }
    const cx = (R[0] + R[2]) / 2, k2 = (R[2] - R[0]) / 340;
    drawImg(g, k, cx, lerp(R0[1] + 110, (slot[1] + slot[3]) / 2, f), lerp(130, 44, f));
    if (bgA > 0) {
      text(g, n, cx, R[1] + 230 * k2, { size: 34, w: 800, align: 'center', color: '#fff', v: true, a: bgA });
      text(g, d, cx, R[1] + 268 * k2, { size: 22, align: 'center', color: 'rgba(255,255,255,.6)', a: bgA });
    }
    g.restore();
  });
}
const STATS2 = [[205, 63, 0, 'Apps', 'was 205'], [1305, 1062, 0, 'Packages', 'was 1,305'], [9.1, 7.4, 1, 'System size', 'was 9.1 GB']];
function leanStats(g, t, tq) {
  if (t < T.stats || t > T.blurFOut + 0.6) return;
  const o = gl(t, T.blurFOut - 0.3, 0.5);
  STATS2.forEach(([from, to, dec, n, was], i) => {
    const e = gl(t, T.stats + i * 0.12); if (e <= 0) return;
    const cx = 560 + i * 400, cy = 640;
    g.save(); g.globalAlpha = e * (1 - o); g.translate(0, 24 * (1 - e));
    rrR(g, [cx - 170, cy - 170, cx + 170, cy + 170], 34); g.fillStyle = 'rgba(8,8,12,.72)'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,.14)'; g.stroke();
    const v = lerp(from, to, ease((tq - T.stats - 0.4 - i * 0.12) / 1.2));
    const str = dec ? v.toFixed(1) : fmtN(v);
    const sw = measure(str, 96, 800, -0.03, true);
    text(g, str, cx - (dec ? 24 : 0), cy - 10, { size: 96, w: 800, align: 'center', color: '#fff', v: true, track: -0.03 });
    if (dec) text(g, 'GB', cx + sw / 2 - 16, cy - 10, { size: 40, w: 700, color: 'rgba(255,255,255,.7)', v: true });
    text(g, n, cx, cy + 66, { size: 30, w: 700, align: 'center', color: '#fff' });
    text(g, was, cx, cy + 104, { size: 22, align: 'center', color: 'rgba(255,255,255,.55)' });
    g.restore();
  });
}
// captions over the desktop, bottom-left, with a soft scrim
const CAPS = [['Clean.', T.clean, T.cleanOut], ['Calm.', T.calm, T.calmOut], ['Easy on your eyes.', T.eyes, T.eyesOut], ['Yours.', T.yours, T.yoursOut],
  ['Decoy login.', T.spot1Cap, T.spot2 - 0.2], ['Lock on USB unplug.', T.spot2Cap, T.spot3 - 0.2], ['Tor per app.', T.spot3Cap, T.spotOut],
  ['Apps can’t touch what they shouldn’t.', T.sandCap, T.sandCapOut], ['Nothing gets in unless you allow it.', T.fwCap, T.fwCapOut],
  ['All your privacy. One app.', T.sh1, T.sh1Out], ['14 protections. One tap each.', T.sh2, T.sh2Out], ['Protection, built in.', T.gCap, T.gCapOut]];
function captions(g, t) {
  if (window.NOVA_NOCAPS) return; // clean frames for the thumbnail
  let vis = 0;
  for (const [, a, b] of CAPS) vis = Math.max(vis, gl(t, a - 0.2) * (1 - gl(t, b + 0.1, 0.6)));
  if (vis > 0) {
    const gr = g.createLinearGradient(0, H - 420, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${0.7 * vis})`);
    g.fillStyle = gr; g.fillRect(0, H - 420, W, 420);
  }
  for (const [s2, a, b] of CAPS) headline(g, s2, 110, 920, 96, a, b, t, { left: true });
}

// ---------- the desktop world ----------
function desktop(g, t, tq) {
  g.drawImage(IMG.wall, -800, -800);
  topBar(g, gl(t, T.bar), false);
  drawClock(g, t);
  const sw = t >= T.sweep && t < T.sweep + 1.6 ? lerp(slotX(0, 5) - 40, slotX(4, 5) + 40, gl(t, T.sweep, 1.4)) : null;
  dock2(g, t, sw);
  panel2(g, t);
  settingsWin(g, t);
  if (t >= T.firewall - 0.3 && t < T.blurC + 1) { g.save(); g.globalAlpha *= gl(t, T.firewall - 0.3); firewallWindow(g, t, tq); g.restore(); }
  shieldWin2(g, t);
  if (t >= T.guard && t < T.blurE + 1) { g.save(); g.globalAlpha *= gl(t, T.guard); guardWindow(g, t, tq); g.restore(); }
}
function world(g, t, tq, cam, k = 1, ox = 0, oy = 0) {
  g.setTransform(k * cam.z, 0, 0, k * cam.z, ox + k * (W / 2 - cam.x * cam.z), oy + k * (H / 2 - cam.y * cam.z));
  Z = k * cam.z;
  // accent: orange floods out of the swatch; the switch happens under the circle
  const fe = gl(t, T.accent + 0.03, 0.4);
  ACC = fe >= 1 && t >= T.accent ? ACC_ORANGE : { a: BLUE_A, b: BLUE };
  const sandA = gl(t, T.sandbox - 0.4) * (1 - gl(t, T.firewall - 0.3, 0.6));
  if (sandA < 1) desktop(g, t, tq);
  if (fe > 0 && fe < 1) {
    ACC = ACC_ORANGE;
    g.save(); g.beginPath(); g.arc(swX(1), SW_Y, 2400 * fe, 0, Math.PI * 2); g.clip(); desktop(g, t, tq); g.restore();
  }
  if (sandA > 0) { g.save(); g.globalAlpha *= sandA; sandbox(g, t); g.restore(); }
  // Night Mode: warm flood from the toggle, gone again under the next blur
  const nR = 2600 * gl(t, T.night + 0.03, 0.4), nA = 1 - gl(t, T.blurB + 0.3, 0.6);
  if (nR > 0 && nA > 0 && sandA < 1) {
    g.save(); g.beginPath(); g.arc(1843, 252, nR, 0, Math.PI * 2); g.clip();
    g.globalCompositeOperation = 'multiply'; g.globalAlpha = nA; g.fillStyle = rgba(WARM); g.fillRect(-800, -800, 3520, 2680); g.restore();
  }
}

// ---------- cursor ----------
const P = { rest: [1150, 930], press: [960, 905], up: [960, 640], night: [1850, 254], gear: [slotX(2, 5) + 3, DOCK_Y + 4], sw: [swX(1) + 3, SW_Y + 3] };
const glideP = (t, a, p0, p1, d = G) => { const e = gl(t, a, d); return [lerp(p0[0], p1[0], e), lerp(p0[1], p1[1], e)]; };
function cursorAt(t) {
  const fadeIn = gl(t, T.lockIn + 0.5, 0.8), fadeOut = 1 - gl(t, T.blurB - 0.4, 0.6);
  const a = fadeIn * fadeOut;
  if (a <= 0) return null;
  let w, press = 0;
  if (t < T.swipe) w = glideP(t, 13.0, P.rest, P.press);
  else if (t < T.camDock) { w = glideP(t, T.swipe, P.press, P.up); press = t < T.swipe + G ? 0.6 : 0; }
  else if (t < T.curNight) {
    const d0 = [slotX(0, 5) - 40, DOCK_Y + 4], d1 = [slotX(4, 5) + 40, DOCK_Y + 4];
    w = t < T.sweep ? glideP(t, T.camDock, P.up, d0) : glideP(t, T.sweep, d0, d1, 1.4);
  }
  else if (t < T.curGear) { w = glideP(t, T.curNight, [slotX(4, 5) + 40, DOCK_Y + 4], P.night); press = bump(t, T.night - 0.07, 0.22); }
  else if (t < T.curSw) { w = glideP(t, T.curGear, P.night, P.gear); press = bump(t, T.gear - 0.07, 0.22); }
  else { w = glideP(t, T.curSw, P.gear, P.sw); press = bump(t, T.accent - 0.07, 0.22); }
  return { w, press, a };
}

// ---------- frame ----------
const END_SMALL = [960 - 288, 540 - 162, 960 + 288, 540 + 162];
function seek(t, tq = t) {
  t = clamp(t, 0, DUR - 1e-6); tq = clamp(tq, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const cam = camAt(t);
  const endE = gl(t, T.pullOut, 2.4), foldE = gl(t, T.fold);
  if (t >= T.lockIn - 1 && t < T.fold + G) {
    if (t < T.pullOut) {
      world(ctx, t, tq, cam);
    } else {
      // the desktop pulls back into a small screen, then folds into the star
      let R = lerpRect([0, 0, W, H], END_SMALL, endE);
      R = lerpRect(R, [960 - 50, 400 - 50, 960 + 50, 400 + 50], foldE);
      const k = (R[2] - R[0]) / W, fa = 1 - clamp((t - T.fold - 0.3) / 0.5);
      aura(ctx, 960, 540, 1500 * lerp(0.6, 1, endE), endE * fa * 0.8, t);
      ctx.save(); ctx.globalAlpha = fa;
      ctx.beginPath(); ctx.roundRect(R[0], R[1], R[2] - R[0], R[3] - R[1], lerp(0, 22, endE)); ctx.clip();
      world(ctx, t, tq, C_FULL, k, R[0], R[1]);
      ctx.restore();
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0); Z = 1;
  // intro wall + lock blur + every chapter's blur share one backdrop
  const introA = gl(t, T.wallIn, 2.0);
  const lockBlur = t < T.unlock + G ? lockAmt(t) : 0;
  const drift = 1 - gl(t, T.introOut, 1.2);
  blurBackdrop(ctx, Math.max(t < T.unlock + G ? introA * lockBlur : 0, blurAmt(t)), t, t < T.lockIn + 1.5 ? drift : 0);
  // redraw the lock clock above the lock blur
  if (t < T.unlock + G) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); Z = 1; drawClock(ctx, t); ctx.restore(); }
  // cold open
  const introOut = gl(t, T.introOut, 0.6);
  const se = gl(t, T.star, 1.4);
  aura(ctx, 960, 470, 1400, clamp(se * 1.2) * (1 - introOut), t);
  if (se > 0 && introOut < 1) drawImg(ctx, 'star', 960, 330 - 12 * introOut, lerp(80, 130, se), se * (1 - introOut));
  headline(ctx, 'Meet NOVA OS.', 960, 540, 132, T.meet, T.introOut, t);
  headline(ctx, 'Beautiful. Private. Yours.', 960, 670, 56, T.tag, T.introOut, t, { w: 600, color: 'rgba(255,255,255,.72)' });
  // after unlock: the promise, with its own aura
  const lineA = gl(t, T.lineA) * (1 - gl(t, T.lineOut, 0.5));
  aura(ctx, 960, 540, 1500, lineA * 0.9, t);
  headline(ctx, 'An OS that’s beautiful,', 960, 475, 104, T.lineA, T.lineOut, t);
  headline(ctx, 'fast, and yours.', 960, 605, 104, T.lineA + 0.3, T.lineOut, t);
  // chapters
  chapter(ctx, '01', 'Design', T.ch1, T.ch1Out, t);
  chapter(ctx, '02', 'Privacy', T.ch2, T.ch2Out, t);
  headline(ctx, 'Your computer knows', 960, 475, 104, T.p1, T.p1Out, t);
  headline(ctx, 'everything about you.', 960, 605, 104, T.p1 + 0.3, T.p1Out, t);
  headline(ctx, 'Who else does?', 960, 540, 116, T.p2, T.p2Out, t);
  headline(ctx, 'Zero tracking.', 960, 400, 104, T.p3, T.p3Out, t);
  headline(ctx, 'No account.', 960, 540, 104, T.p3 + 0.6, T.p3Out, t);
  headline(ctx, 'Nothing phones home. Ever.', 960, 680, 104, T.p3 + 1.2, T.p3Out, t);
  chapter(ctx, '03', 'Security', T.ch3, T.ch3Out, t);
  headline(ctx, 'Locked down.', 960, 475, 116, T.locked, T.lockedOut, t);
  headline(ctx, 'Out of the box.', 960, 610, 116, T.locked + 0.3, T.lockedOut, t, { color: 'rgba(255,255,255,.62)' });
  securityCards(ctx, t);
  chapter(ctx, '04', 'NOVA Shield', T.ch4, T.ch4Out, t);
  chapter(ctx, '05', 'NOVA Guard', T.ch5, T.ch5Out, t);
  chapter(ctx, '06', 'Built in', T.ch6, T.ch6Out, t);
  headline(ctx, 'Built in.', 960, 475, 116, T.built, T.builtOut, t);
  headline(ctx, 'Not bolted on.', 960, 610, 116, T.built + 0.3, T.builtOut, t, { color: 'rgba(255,255,255,.62)' });
  appsGrid(ctx, t);
  chapter(ctx, '07', 'Lean', T.ch7, T.ch7Out, t);
  headline(ctx, 'Light. Fast. Clean.', 960, 300, 104, T.light, T.lightOut, t);
  headline(ctx, 'Boots in 5 seconds.', 960, 300, 104, T.boots, T.bootsOut, t);
  leanStats(ctx, t, tq);
  captions(ctx, t);
  // ending
  const ee = gl(t, T.fold + 0.2, 1.0);
  aura(ctx, 960, 520, 1500, ee * 0.85, t);
  if (ee > 0) drawImg(ctx, 'star', 960, 400, lerp(120, 170, ee), ee);
  if (t >= T.name) { const e = gl(t, T.name); text(ctx, 'NOVA OS', 960 + 14, 590 + 20 * (1 - e), { size: 64, w: 500, track: 0.42, align: 'center', base: 'middle', color: '#fff', a: e, v: true }); }
  headline(ctx, 'Coming soon.', 960, 700, 56, T.soon, 999, t, { color: 'rgba(255,255,255,.85)' });
  if (t >= T.site) text(ctx, 'byeno.org', 960, 790, { size: 28, w: 600, align: 'center', color: 'rgba(255,255,255,.7)', a: gl(t, T.site) });
  // pointer
  const c = cursorAt(t);
  if (c && t < T.blurB) { ctx.save(); ctx.globalAlpha = c.a * (1 - blurAmt(t)); drawCursor(ctx, toScreen(cam, c.w), c.press, 1.9); ctx.restore(); }
}

const LINES = [
  ['Meet NOVA OS.', T.meet], ['Beautiful. Private. Yours.', T.tag], ['An OS that’s beautiful,', T.lineA], ['fast, and yours.', T.lineA + 0.3],
  ['Design', T.ch1 + 0.15], ['Privacy', T.ch2 + 0.15], ['Your computer knows', T.p1], ['everything about you.', T.p1 + 0.3], ['Who else does?', T.p2],
  ['Zero tracking.', T.p3], ['No account.', T.p3 + 0.6], ['Nothing phones home. Ever.', T.p3 + 1.2],
  ['Security', T.ch3 + 0.15], ['Locked down.', T.locked], ['Out of the box.', T.locked + 0.3],
  ['NOVA Shield', T.ch4 + 0.15], ['NOVA Guard', T.ch5 + 0.15], ['Built in', T.ch6 + 0.15], ['Built in.', T.built], ['Not bolted on.', T.built + 0.3],
  ['Lean', T.ch7 + 0.15], ['Light. Fast. Clean.', T.light], ['Boots in 5 seconds.', T.boots], ['Coming soon.', T.soon],
  ...CAPS.map(([s2, a]) => [s2, a]),
];

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
const isFast = t => KEYS.some(([t0]) => t > t0 - 0.05 && t < t0 + G + 0.05) || (t > T.unlock && t < T.unlock + G) || (t > T.fly && t < T.fly + 1.4) || (t > T.fold && t < T.fold + G);

const ready = (async () => {
  await Promise.all(['400', '500', '600', '700', '900'].map(w => document.fonts.load(`${w} 20px Geist`)));
  await Promise.all(['500', '600', '700', '800'].map(w => document.fonts.load(`${w} 20px GeistV`)));
  const A = '../nova-os/assets/';
  await Promise.all([load('wall', A + 'wallpaper-padded.jpg'), load('folder', A + 'folder.webp'), load('settings', A + 'settings.webp'), load('shield', A + 'shield.webp'), load('star', A + 'nova-star.png'),
    load('monitor', 'assets/monitor.png'), load('ledger', 'assets/ledger.png'), load('images', 'assets/images.png'), load('fix', 'assets/fix.png')]);
  BLUR_WALL = document.createElement('canvas'); BLUR_WALL.width = IMG.wall.width; BLUR_WALL.height = IMG.wall.height;
  const b = BLUR_WALL.getContext('2d'); b.filter = 'blur(36px)'; b.drawImage(IMG.wall, 0, 0);
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, LINES, W, H };
})();
