// NOVA — 30s ad. Bold white type on black, OS clips in a floating screen. Pure function of time.
(() => {
const W = 1920, H = 1080, DUR = 60;
const G = 0.8;

const T = {
  l1: 0.30, l1out: 2.10,          // Your computer knows everything about you.
  l2: 2.45, l2out: 3.95,          // Who else does?
  star: 4.25, brand: 4.55, brand2: 5.05, brandOut: 6.45,
  s1: 6.75, s2: 7.25, s3: 7.75, stackOut: 8.85,
  card: 9.15,                      // the screen grows out of the black
  shieldWin: 9.55, capShield: 9.90, capShieldOut: 11.20, capShield2: 11.35, capShield2Out: 12.55,
  curCam: 10.35, camClick: 11.40,
  sandbox: 12.75, capSand: 12.95, probe: 13.30, capSandOut: 14.75,
  firewall: 14.95, capFw: 15.15, capFwOut: 16.95,
  guard: 17.15, capGuard: 17.35, scan: 17.60, scanDone: 18.90, capGuardOut: 19.35,
  ace: 19.55, capAce: 19.75, aceType: 20.05, aceReply: 20.85, aceLocks: 21.20, capAceOut: 21.35, capAce2: 21.50, capAce2Out: 22.55,
  lean: 22.75, capLean: 22.95, capLeanOut: 24.00, capBoot: 24.15, capBootOut: 25.15,
  cardOut: 25.35,                  // the screen folds into the star
  endStar: 25.75, endName: 26.25, soon: 26.95, built: 27.40,
};

// the 30s cut, given twice the time so every line can be read
for (const k in T) T[k] *= 2;

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

// ---------- ACE: the built-in AI ----------
const ACE_WIN = [600, 210, 1320, 850];
const ACE_Q = 'How hot is my PC running?';
function aceScene(g, t, tq) {
  wallpaper(g); topBar(g); dock(g);
  const e = gl(t, T.ace), R = lerpRect([900, 500, 1020, 560], ACE_WIN, e);
  const p = windowShape(g, R, lerp(20, 26, e), lerp(4, 24, e));
  const a = back(t, T.ace); if (a <= 0) return;
  g.save(); p(); g.clip(); g.globalAlpha *= a;
  drawImg(g, 'star', 652, 262, 34);
  text(g, 'ACE', 680, 272, { size: 24, w: 800, color: '#fff', v: true, track: 0.04 });
  text(g, 'Your AI. Built right in.', 1280, 270, { size: 14, color: SUB, align: 'right' });
  g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(600, 300, 720, 1);
  // question: typed in the field, then sent as a bubble
  const n = Math.floor(ACE_Q.length * clamp((tq - T.aceType) / 0.55) + 1e-6);
  const sent = gl(t, T.aceType + 0.62, 0.5);
  const qw = measure(ACE_Q, 18, 500) + 40;
  const bub = [lerp(632, 1288 - qw, sent), lerp(778, 330, sent), lerp(1288, 1288, sent), lerp(830, 380, sent)];
  if (sent > 0) { rrR(g, bub, 22); g.fillStyle = rgba(BLUE, sent); g.fill(); text(g, ACE_Q, bub[0] + 20, bub[1] + 32, { size: 18, color: '#fff', a: sent }); }
  // input field
  rrR(g, [632, 778, 1288, 830], 26); g.fillStyle = 'rgba(255,255,255,.06)'; g.fill();
  text(g, sent > 0.5 ? 'Ask ACE anything' : (n ? ACE_Q.slice(0, n) : 'Ask ACE anything'), 658, 810, { size: 18, color: n && sent <= 0.5 ? '#fff' : SUB });
  g.beginPath(); g.arc(1262, 804, 18, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.9)'; g.fill(); icon(g, 'arrow-up', 1262, 804, 18, '#111');
  // reply
  const re = gl(t, T.aceReply, 0.6);
  if (re > 0) {
    g.save(); g.globalAlpha *= re; g.translate(0, 12 * (1 - re));
    rrR(g, [632, 400, 1150, 490], 22); g.fillStyle = 'rgba(255,255,255,.07)'; g.fill();
    icon(g, 'thermometer', 664, 445, 22, rgba(ORANGE));
    text(g, 'CPU 48°C · GPU 52°C', 692, 438, { size: 18, w: 700, color: '#fff' });
    text(g, 'All good. I’ll tell you if that changes.', 692, 464, { size: 15, color: SUB });
    g.restore();
  }
  // the two promises, in the site's white pills
  [['eye', 'Sees your screen, only when you ask'], ['square-terminal', 'Runs commands, only with your permission']].forEach(([ic, s2], i) => {
    const le = gl(t, T.aceLocks + i * 0.15, 0.6); if (le <= 0) return;
    const y = 560 + i * 74;
    g.save(); g.globalAlpha *= le; g.translate(0, 12 * (1 - le));
    rrR(g, [632, y - 28, 1288, y + 28], 28); g.fillStyle = 'rgb(236,236,238)'; g.fill();
    icon(g, ic, 668, y, 22, '#111');
    text(g, s2, 700, y + 6, { size: 18, w: 700, color: '#111' });
    icon(g, 'lock', 1250, y, 20, '#111');
    g.restore();
  });
  g.restore();
}
// ---------- lean: the site's numbers, counting down to what's left ----------
const STATS = [['63', 205, 63, 0, 'Apps', 'was 205'], ['1,062', 1305, 1062, 0, 'Packages', 'was 1,305'], ['7.4', 9.1, 7.4, 1, 'System size', 'was 9.1 GB']];
function leanScene(g, t, tq) {
  g.fillStyle = '#060608'; g.fillRect(-800, -800, 3520, 2680);
  STATS.forEach(([, from, to, dec, name, was], i) => {
    const e = gl(t, T.lean + 0.1 + i * 0.12); if (e <= 0) return;
    const x = 920 + (i - 1) * 330, y = 510;
    g.save(); g.globalAlpha *= e; g.translate(0, 20 * (1 - e));
    rrR(g, [x - 150, y - 150, x + 150, y + 150], 34); g.fillStyle = 'rgb(13,13,17)'; g.fill();
    g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,.12)'; g.stroke();
    const v = lerp(from, to, ease((tq - T.lean - 0.3 - i * 0.12) / 1.0));
    const str = dec ? v.toFixed(1) : fmtN(v);
    text(g, str, x - (dec ? 22 : 0), y - 10, { size: 78, w: 800, align: 'center', color: '#fff', v: true, track: -0.03 });
    if (dec) text(g, 'GB', x + measure(str, 78, 800, -0.03, true) / 2 - 12, y - 10, { size: 34, w: 700, color: 'rgba(255,255,255,.7)', v: true });
    text(g, name, x, y + 56, { size: 24, w: 700, align: 'center', color: '#fff' });
    text(g, was, x, y + 88, { size: 18, align: 'center', color: SUB });
    g.restore();
  });
}

// ---------- the floating screen ----------
const CARD_R = [240, 70, 1680, 880];
function cardRect(t) {
  const c = [960, 475, 960, 475];
  if (t < T.cardOut) return lerpRect([940, 455, 980, 495], CARD_R, gl(t, T.card));
  return lerpRect(CARD_R, [960 - 60, 450 - 60, 960 + 60, 450 + 60], gl(t, T.cardOut));
}
// inner camera per scene (world = desktop pixels)
const IN_FULL = { x: 960, y: 540, z: 1 };
const IN_SHIELD = { x: 920, y: 525, z: 1.3 };
const IN_PANEL = { x: 1600, y: 360, z: 1.9 };
function innerCam(t) {
  if (t < T.ace - 0.1) return IN_SHIELD;
  const e = gl(t, T.ace - 0.1);
  return { x: lerp(IN_SHIELD.x, 960, e), y: lerp(IN_SHIELD.y, 530, e), z: lerpLog(IN_SHIELD.z, 1.25, e) };
}
const SCENES = [
  [T.card, (g, t, tq) => { wallpaper(g); topBar(g); controlPanel(g); dock(g, 1, ['shield']); shieldWindow(g, t, tq); }],
  [T.sandbox, (g, t) => sandbox(g, t)],
  [T.firewall, (g, t, tq) => { wallpaper(g); topBar(g); controlPanel(g); dock(g, 1, ['shield']); firewallWindow(g, t, tq); }],
  [T.guard, (g, t, tq) => { wallpaper(g); topBar(g); controlPanel(g); dock(g, 1, ['shield']); guardWindow(g, t, tq); }],
  [T.ace, (g, t, tq) => aceScene(g, t, tq)],
  [T.lean, (g, t, tq) => leanScene(g, t, tq)],
];
function drawCard(g, t, tq) {
  if (t < T.card || t > T.cardOut + G) return;
  const R = cardRect(t), k = (R[2] - R[0]) / W;
  const fade = t >= T.cardOut ? 1 - clamp((t - T.cardOut - 0.3) / 0.5) : 1;
  const p = () => rrR(g, R, lerp(10, 28, clamp(k * 1.4)));
  g.save(); g.globalAlpha = fade; g.setTransform(1, 0, 0, 1, 0, 0);
  Z = 1; shadow(g, p, 18);
  p(); g.clip();
  const c = innerCam(t);
  Z = k * c.z;
  const setCam = () => g.setTransform(Z, 0, 0, Z, R[0] + (W / 2 - c.x * c.z) * k, R[1] + (H / 2 - c.y * c.z) * k);
  // scenes cross-dissolve: the next one comes in over the last
  for (let i = 0; i < SCENES.length; i++) {
    const [t0, fn] = SCENES[i];
    const next = SCENES[i + 1];
    if (t < t0 || (next && t >= next[0] + 0.5)) continue;
    const a = i === 0 ? 1 : ease((t - t0) / 0.5);
    g.save(); g.globalAlpha *= a; setCam(); fn(g, t, tq); g.restore();
  }
  // cursor inside the screen (Shield scene)
  if (t >= T.shieldWin && t < T.sandbox) {
    const from = [1080, 820], to = [CAM_TOGGLE[0] + 3, CAM_TOGGLE[1] + 3];
    const e = gl(t, T.curCam);
    const w = [lerp(from[0], to[0], e), lerp(from[1], to[1], e)];
    const s = [R[0] + ((w[0] - c.x) * c.z + W / 2) * k, R[1] + ((w[1] - c.y) * c.z + H / 2) * k];
    g.globalAlpha = fade * (1 - clamp((t - T.sandbox + 0.3) / 0.3));
    drawCursor(g, s, bump(t, T.camClick - 0.07, 0.22), 1.6 * k * 1.3);
  }
  g.restore();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); p(); g.lineWidth = 1; g.strokeStyle = `rgba(255,255,255,${0.12 * fade})`; g.stroke(); g.restore();
}

// ---------- frame ----------
function seek(t, tq = t) {
  t = clamp(t, 0, DUR - 1e-6); tq = clamp(tq, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  Z = 1;
  headline(ctx, 'Your computer knows', 960, 475, 104, T.l1, T.l1out, t);
  headline(ctx, 'everything about you.', 960, 605, 104, T.l1 + 0.3, T.l1out, t);
  headline(ctx, 'Who else does?', 960, 540, 104, T.l2, T.l2out, t);
  // brand beat: the star, then the name, then the promise
  const se = gl(t, T.star), so = gl(t, T.brandOut, 0.5);
  if (se > 0 && so < 1) drawImg(ctx, 'star', 960, 360 - 10 * so, 120 * lerp(0.7, 1, se), se * (1 - so));
  headline(ctx, 'NOVA OS Pro.', 960, 540, 112, T.brand, T.brandOut, t);
  headline(ctx, 'Private by design.', 960, 670, 112, T.brand2, T.brandOut, t, { color: 'rgba(255,255,255,.62)' });
  headline(ctx, 'Zero tracking.', 960, 400, 104, T.s1, T.stackOut, t);
  headline(ctx, 'No account.', 960, 540, 104, T.s2, T.stackOut, t);
  headline(ctx, 'Nothing phones home. Ever.', 960, 680, 104, T.s3, T.stackOut, t);
  drawCard(ctx, t, tq);
  ctx.setTransform(1, 0, 0, 1, 0, 0); Z = 1;
  // captions under the screen
  const cap = (s2, a2, b2, o) => headline(ctx, s2, 960, 978, 60, a2, b2, t, o);
  cap('All your privacy. One app.', T.capShield, T.capShieldOut);
  cap('14 protections. One tap each.', T.capShield2, T.capShield2Out);
  cap('Apps can’t touch what they shouldn’t.', T.capSand, T.capSandOut);
  cap('Nothing gets in unless you allow it.', T.capFw, T.capFwOut);
  cap('NOVA Guard. Protection, built in.', T.capGuard, T.capGuardOut);
  cap('Meet ACE. Your AI, built right in.', T.capAce, T.capAceOut);
  cap('Only when you ask.', T.capAce2, T.capAce2Out);
  cap('Light. Fast. Clean.', T.capLean, T.capLeanOut);
  cap('Boots in 5 seconds.', T.capBoot, T.capBootOut);
  // end card: the screen folds into the star
  const ee = gl(t, T.endStar);
  if (ee > 0) drawImg(ctx, 'star', 960, 400, lerp(130, 180, ee), ee);
  if (t >= T.endName) {
    const e = gl(t, T.endName);
    text(ctx, 'NOVA OS PRO', 960 + 14, 590 + 20 * (1 - e), { size: 60, w: 500, track: 0.42, align: 'center', base: 'middle', color: '#fff', a: e, v: true });
  }
  headline(ctx, 'Coming soon.', 960, 700, 52, T.soon, 99, t, { color: 'rgba(255,255,255,.85)' });
  if (t >= T.built) {
    const e = gl(t, T.built);
    text(ctx, 'byeno.org', 960, 790, { size: 26, w: 600, align: 'center', color: 'rgba(255,255,255,.7)', a: e });
    text(ctx, 'Built on Arch Linux & Hyprland', 960, 1010, { size: 22, w: 500, align: 'center', color: 'rgba(255,255,255,.4)', a: e });
  }
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
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, W, H };
})();
