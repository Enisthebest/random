// NOVA — "a day on NOVA". 22s loop, 1920x1080. Pure function of time: seek(t) draws frame t.
// World units are desktop pixels (zoom 1 = the desktop 1:1).
(() => {
const W = 1920, H = 1080, DUR = 22;
const BPM = 40 * 60 / DUR, B = 60 / BPM;   // 40 beats per loop; the song loops with the picture
const G = 0.8;                              // every glide

const T = {
  swipe: 1 * B,           // press + swipe up on the lock screen
  unlock: 0.75,           // big clock -> top-bar clock, blur clears
  barOut: 1.55,           // top-bar pills grow out of the clock
  doMore: 1.60,
  dock: 1.70,
  cards: 1.80,            // Control widgets grow in
  curFiles: 2.30,
  filesClick: 6 * B,      // click the folder in the dock
  files: 6 * B + 0.05,    // Files window grows out of it
  curShots: 4.20,
  shotsClick: 9 * B,      // open Screenshots
  openShots: 9 * B + 0.05,
  toShort: 6.60,
  curCam: 7.00,
  drop: 15 * B,           // camera shortcut on the drop
  select: 15 * B + 0.05,  // selection box grows onto the Files window
  capture: 9.25,          // capture flies into Screenshots as a thumbnail
  curGear: 10.10,
  gearClick: 20 * B,
  settings: 20 * B + 0.05,
  curSwatch: 11.95,
  accent: 23.5 * B,       // pick orange: accent floods out from the swatch
  toast: 13.50,
  toDnd: 13.80,
  curDnd: 14.30,
  dnd: 27.5 * B,          // Do Not Disturb on: toast folds into the moon
  toUsb: 16.10,
  curEject: 16.30,
  eject: 31.5 * B,        // eject ARCH_202609
  usbClose: 18.20,
  toFull: 18.90,
  curLock: 19.00,
  lockClick: 36.5 * B,
  lock: 36.5 * B + 0.03,  // back to the lock screen: last frame = first frame
  curHome: 21.40,
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
const back = (t, a, d = G) => clamp((t - a - d / 2) / (d / 2)); // incoming content: back half of the glide
const out = (t, a, d = G) => 1 - clamp((t - a) / (d * 0.4));     // outgoing content leaves early
const bump = (t, a, d) => { const u = (t - a) / d; return u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0; };
const lerpRect = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));

// ---------- colour ----------
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mix = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));
const PILL = [16, 16, 19];
const CARD_T = [19, 19, 23], CARD_B = [9, 9, 13];
const WIN = [13, 13, 17], WIN_SIDE = [18, 18, 23];
const BTN = [37, 37, 40], TRACK = [34, 34, 36], SEL = [54, 54, 57];
const LABEL = 'rgb(176,176,181)', SUB = 'rgb(140,140,146)', TXT = 'rgb(228,228,231)';
const ORANGE_NIGHT = [255, 159, 10];
const ACCENTS = {
  blue: { a: [16, 116, 228], b: [38, 140, 255] },
  orange: { a: [236, 112, 16], b: [255, 158, 44] },
};
const SWATCHES = [[38, 140, 255], [255, 146, 30], [48, 209, 88], [255, 64, 140], [160, 96, 255], [142, 142, 152]];
let ACC = ACCENTS.blue;

// ---------- canvas ----------
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const IMG = {};
const ICON_BOX = { folder: [85, 117, 1313, 1074], settings: [116, 114, 1138, 1148], shield: [115, 61, 1138, 1194], star: [186, 41, 1187, 1100] };
const load = (k, src) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.src = src; });
const PATHS = {};
for (const k in window.ICONS) PATHS[k] = new Path2D(window.ICONS[k]);
let BLUR_WALL = null;

// ---------- camera ----------
const CAM_FULL = { x: 960, y: 540, z: 1 };
const CAM_SHORT = { x: 1470, y: 560, z: 2.0 };
const CAM_SET = { x: 880, y: 540, z: 1.3 };
const CAM_DND = { x: 1600, y: 300, z: 1.8 };
const CAM_USB = { x: 1770, y: 426, z: 2.4 };
const toScreen = (c, p) => [(p[0] - c.x) * c.z + W / 2, (p[1] - c.y) * c.z + H / 2];
function anchorCam(a, s, z) { return { x: a[0] - (s[0] - W / 2) / z, y: a[1] - (s[1] - H / 2) / z, z }; }
function camGlide(c0, c1, a, e) {
  const s0 = toScreen(c0, a), s1 = toScreen(c1, a);
  return anchorCam(a, [lerp(s0[0], s1[0], e), lerp(s0[1], s1[1], e)], lerpLog(c0.z, c1.z, e));
}
function applyCam(g, c) { g.setTransform(c.z, 0, 0, c.z, W / 2 - c.x * c.z, H / 2 - c.y * c.z); }
let CAM = CAM_FULL;

// ---------- layout (desktop pixels) ----------
const CLOCK = [931, 9, 988, 45], CLOCK_C = [959.5, 27];
const BIG_C = [960, 400];
const BAR = { left: [15, 9, 180, 45], tray: [1737, 9, 1812, 45], us: [1827, 9, 1866, 45], ctl: [1880, 9, 1905, 45] };
const BR = [1747, 1010, 1900, 1063];
const DOCK_Y = 1036;
const DOCK = ['star', 'folder', 'settings', 'shield', 'terminal'];
const dockX = i => 960 - (5 * 60 - 12) / 2 + 24 + i * 60;
const CARD = {
  sound: [1356, 129, 1620, 405], dnd: [1356, 441, 1620, 499], short: [1356, 536, 1620, 635],
  net: [1660, 129, 1880, 187], night: [1660, 224, 1880, 340], usb: [1660, 377, 1880, 476],
};
const CARD_OFF = { sound: 0, net: 0.05, dnd: 0.1, night: 0.15, short: 0.2, usb: 0.25 };
const SC_X = [1407, 1461, 1515, 1569], SC_Y = 601;
const CAM_BTN = [SC_X[0], SC_Y], LOCK_BTN = [SC_X[3], SC_Y];
const FILES = [300, 160, 1200, 740];
const MAIN = [520, 232, 1180, 722];
const TILES = ['Documents', 'Pictures', 'Music', 'Projects', 'Screenshots', 'Downloads'];
const tileC = i => [620 + (i % 3) * 200, 345 + Math.floor(i / 3) * 175];
const SHOT_TILE = 4;
const THUMB = [540, 282, 780, 437];
const SET = [470, 250, 1290, 810];
const SW_Y = 440, swX = i => 716 + i * 52;
const TOAST = [1504, 54, 1886, 120];
const MOON = [1381, 470];
const EJECT = [1842, 442];
const PRESS = [960, 905], SWIPE_TO = [960, 640];

// ---------- helpers ----------
function rr(g, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.roundRect(x, y, w, h, r); }
const rrR = (g, R, r) => rr(g, R[0], R[1], R[2] - R[0], R[3] - R[1], r);
function shadow(g, pathFn, elev) {
  if (elev <= 0.01 || g.globalAlpha <= 0) return;
  const e = elev * CAM.z, m = g.getTransform(), OFF = 30000;
  g.save(); g.setTransform(m.a, m.b, m.c, m.d, m.e - OFF, m.f);
  for (const [a, b, oy] of [[0.12, 0.6, 0.25], [0.10, 2.2, 0.9], [0.06, 5, 2]]) {
    g.shadowColor = `rgba(0,0,0,${a * g.globalAlpha})`; g.shadowBlur = e * b; g.shadowOffsetX = OFF; g.shadowOffsetY = e * oy;
    pathFn(); g.fillStyle = '#000'; g.fill();
  }
  g.restore();
}
function text(g, s, x, y, o) {
  const a = o.a == null ? 1 : o.a; if (a <= 0) return;
  g.save();
  g.font = `${o.w || 500} ${o.size}px ${o.mono ? 'GeistMono' : 'Geist'}`;
  g.fillStyle = o.color || TXT; g.globalAlpha *= a;
  g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic';
  g.letterSpacing = (o.track || 0) * o.size + 'px';
  g.fillText(s, x, y); g.restore();
}
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
function farthest(c, p) { const s = toScreen(c, p); return Math.max(Math.hypot(s[0], s[1]), Math.hypot(W - s[0], s[1]), Math.hypot(s[0], H - s[1]), Math.hypot(W - s[0], H - s[1])) / c.z; }
function pillShape(g, R, r = 12, fill = PILL, elev = 3) {
  const p = () => rrR(g, R, r);
  shadow(g, p, elev);
  p(); g.fillStyle = rgba(fill); g.fill();
  p(); g.lineWidth = 1 / CAM.z; g.strokeStyle = 'rgba(255,255,255,.07)'; g.stroke();
}
function windowShape(g, R, r, elev) {
  const p = () => rrR(g, R, r);
  shadow(g, p, elev);
  p(); g.fillStyle = rgba(WIN); g.fill();
  p(); g.lineWidth = 1 / CAM.z; g.strokeStyle = 'rgba(255,255,255,.09)'; g.stroke();
  return p;
}
const accentGrad = (g, x0, x1) => { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, rgba(ACC.a)); gr.addColorStop(1, rgba(ACC.b)); return gr; };
function toggle(g, R, on, col) {
  const knobX = lerp(R[0] + 13, R[2] - 13, on);
  rrR(g, R, 12); g.fillStyle = rgba(mix([53, 53, 56], col, on)); g.fill();
  g.beginPath(); g.arc(knobX, (R[1] + R[3]) / 2, 11, 0, Math.PI * 2); g.fillStyle = 'rgb(242,242,244)'; g.fill();
}
function circleBtn(g, cx, cy, r = 21, press = 0) {
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fillStyle = rgba(mix(BTN, [70, 70, 76], press)); g.fill();
  g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.09)'; g.stroke();
}
const label = (g, s, x, y, a) => text(g, s, x, y, { size: 11, w: 700, track: 0.08, color: LABEL, a });
function drawCheck(g, cx, cy, s = 1, col = '#fff') {
  g.save(); g.strokeStyle = col; g.lineWidth = 1.8 * s; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(cx - 5 * s, cy); g.lineTo(cx - 1.5 * s, cy + 3.5 * s); g.lineTo(cx + 5.5 * s, cy - 4 * s); g.stroke(); g.restore();
}

// ---------- pointer ----------
const ARROW = [[0, 0], [0, 16.2], [3.9, 12.6], [6.5, 18.7], [9.1, 17.6], [6.6, 11.7], [11.6, 11.6]];
function drawCursor(g, s, press) {
  const k = 1.9 * (1 - 0.1 * press);
  g.save(); g.setTransform(k, 0, 0, k, s[0], s[1]);
  const path = () => { g.beginPath(); ARROW.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 5; g.shadowOffsetY = 2;
  path(); g.lineJoin = 'round'; g.lineWidth = 2.2; g.strokeStyle = '#fff'; g.stroke();
  g.shadowColor = 'transparent';
  path(); g.fillStyle = '#fff'; g.fill(); path(); g.fillStyle = '#000'; g.fill();
  g.restore();
}

// ---------- lock state ----------
// 1 = locked. The loop starts and ends locked.
function lockAmt(t) {
  if (t >= T.lock) return gl(t, T.lock);
  return 1 - gl(t, T.unlock);
}
// desktop UI fades out early when locking again
const uiAlpha = t => t >= T.lock ? 1 - clamp((t - T.lock) / (G * 0.4)) : 1;

function drawWallpaper(g, t) {
  const L = lockAmt(t);
  g.drawImage(IMG.wall, -800, -800);
  if (L > 0) {
    g.save(); g.globalAlpha = L; g.drawImage(BLUR_WALL, -800, -800);
    g.fillStyle = 'rgba(0,0,0,.32)'; g.fillRect(-800, -800, 3520, 2680); g.restore();
  }
}
function drawLockText(g, t) {
  // date and hint: leave with the swipe, return in the back half of the lock glide
  const a = t >= T.lock ? back(t, T.lock) : out(t, T.swipe);
  if (a <= 0) return;
  const lift = t >= T.lock ? 0 : -110 * gl(t, T.swipe);
  g.save(); g.translate(0, lift);
  text(g, 'Wednesday, 30 September', 960, 535, { size: 30, w: 500, align: 'center', color: 'rgba(255,255,255,.88)', a });
  icon(g, 'chevron-up', 960, 962, 22, '#fff', a * 0.75);
  text(g, 'Swipe up to unlock', 960, 1002, { size: 17, w: 500, align: 'center', color: 'rgba(255,255,255,.7)', a });
  g.restore();
}
function drawClock(g, t) {
  // the big lock-screen clock and the top-bar clock are one object
  const L = lockAmt(t);
  const bg = 1 - clamp(L / 0.5);            // pill arrives in the back half of unlocking, leaves early when locking
  if (bg > 0) { g.save(); g.globalAlpha = bg; pillShape(g, CLOCK, 12, PILL, 3); g.restore(); }
  const x = lerp(CLOCK_C[0], BIG_C[0], L), y = lerp(CLOCK_C[1] + 0.5, BIG_C[1], L);
  text(g, '12:22', x, y, { size: lerpLog(13, 200, L), w: lerp(600, 600, L), align: 'center', base: 'middle', color: '#fff', track: lerp(0, -0.02, L) });
}

// ---------- top bar, DO MORE, dock ----------
function drawTopBar(g, t) {
  const e = gl(t, T.barOut); if (e <= 0) return;
  for (const k of ['left', 'tray', 'us', 'ctl']) pillShape(g, lerpRect(CLOCK, BAR[k], e));
  g.save(); g.globalAlpha *= back(t, T.barOut);
  rr(g, 28, 15, 27, 24, 8); g.fillStyle = 'rgb(201,201,207)'; g.fill();
  drawImg(g, 'star', 1757, 27, 16); drawImg(g, 'shield', 1788, 27, 16);
  text(g, 'us', 1846.5, 27.5, { size: 12, w: 600, align: 'center', base: 'middle', color: '#fff' });
  g.restore();
}
function drawDoMore(g, t) {
  const e = gl(t, T.doMore); if (e <= 0) return;
  g.save(); g.globalAlpha *= back(t, T.doMore, G * 0.9); g.translate(0, 36 * (1 - e));
  const gr = g.createLinearGradient(0, 460, 0, 610); gr.addColorStop(0, 'rgb(254,226,138)'); gr.addColorStop(1, 'rgb(254,251,236)');
  for (const [s, y] of [['DO', 527], ['MORE.', 607]]) text(g, s, 817, y, { size: 90, w: 900, track: -0.02, color: gr });
  g.restore();
}
function drawDock(g, t) {
  const e = gl(t, T.dock); if (e <= 0) return;
  g.save(); g.translate(0, 110 * (1 - e));
  const dw = 5 * 60 + 8;
  pillShape(g, [960 - dw / 2, DOCK_Y - 32, 960 + dw / 2, DOCK_Y + 32], 16, [13, 13, 16], 5);
  pillShape(g, BR, 12, [12, 12, 15], 4);
  icon(g, 'power', 1774, 1036.5, 20, '#fff'); icon(g, 'volume-2', 1826, 1036.5, 20, '#fff');
  text(g, 'US', 1872, 1037, { size: 13, w: 700, base: 'middle', color: '#fff' });
  DOCK.forEach((k, i) => {
    // an app's icon dips when clicked; a dot marks it running
    const press = k === 'folder' ? bump(t, T.filesClick - 0.05, 0.25) : k === 'settings' ? bump(t, T.gearClick - 0.05, 0.25) : 0;
    drawImg(g, k, dockX(i), DOCK_Y - 1, 44 * (1 - 0.1 * press));
    const run = k === 'folder' ? back(t, T.files) : k === 'settings' ? back(t, T.settings) : 0;
    if (run > 0) { g.beginPath(); g.arc(dockX(i), DOCK_Y + 27, 2.5, 0, Math.PI * 2); g.fillStyle = rgba(ACC.b, run); g.fill(); }
  });
  g.restore();
}

// ---------- Control widgets ----------
function cardRect(t, k) {
  const R = CARD[k];
  if (k === 'usb' && t >= T.usbClose) return [R[0], R[1], R[2], lerp(R[3], R[1] + 1, gl(t, T.usbClose))];
  const e = gl(t, T.cards + CARD_OFF[k]);
  return [R[0], R[1], R[2], lerp(R[1] + 2, R[3], e)];
}
function drawCard(g, R, elev) {
  const p = () => rrR(g, R, 10);
  shadow(g, p, elev);
  const gr = g.createLinearGradient(0, R[1], 0, R[3]); gr.addColorStop(0, rgba(CARD_T)); gr.addColorStop(1, rgba(CARD_B));
  p(); g.fillStyle = gr; g.fill();
  p(); g.lineWidth = 1 / CAM.z; g.strokeStyle = 'rgba(255,255,255,.06)'; g.stroke();
}
function drawControl(g, t) {
  if (t < T.cards) return;
  const ta = back(t, T.cards + 0.3);
  text(g, 'Control', 1344, 91, { size: 16, w: 600, color: 'rgba(255,255,255,.9)', a: ta });
  if (ta > 0) {
    g.save(); g.globalAlpha *= ta;
    rrR(g, [1819, 69, 1892, 101], 16); g.fillStyle = 'rgba(70,32,14,.45)'; g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.28)'; g.stroke();
    icon(g, 'pencil', 1840, 85, 14, '#fff'); text(g, 'Edit', 1853, 90, { size: 12.5, w: 600, color: '#fff' });
    g.restore();
  }
  for (const k of Object.keys(CARD)) {
    if (t < T.cards + CARD_OFF[k]) continue;
    const R = cardRect(t, k);
    if (R[3] - R[1] < 1.5) continue;
    drawCard(g, R, lerp(7, 4, gl(t, T.cards + CARD_OFF[k])));
    const a = back(t, T.cards + CARD_OFF[k]);
    if (a <= 0) continue;
    g.save(); rrR(g, R, 10); g.clip(); g.globalAlpha *= a;
    CARD_CONTENT[k](g, t);
    g.restore();
  }
}
const CARD_CONTENT = {
  sound(g) {
    label(g, 'SOUND', 1372, 154);
    rrR(g, [1372, 173, 1414, 222], 21); g.fillStyle = 'rgb(41,41,44)'; g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.07)'; g.stroke();
    icon(g, 'volume-2', 1393, 198, 18, '#fff');
    const kx = 1438 + 12 + 84 * 0.88 + 6;
    rr(g, 1438, 186, 108, 24, 12); g.fillStyle = rgba(TRACK); g.fill();
    rr(g, 1438, 186, kx + 12 - 1438, 24, 12); g.fillStyle = accentGrad(g, 1438, kx); g.fill();
    g.beginPath(); g.arc(kx, 198, 11, 0, Math.PI * 2); g.fillStyle = 'rgb(242,242,244)'; g.fill();
    text(g, '88%', 1600, 202.5, { size: 12, w: 600, align: 'right', color: 'rgb(205,205,210)' });
    label(g, 'OUTPUT', 1372, 242);
    rrR(g, [1372, 305, 1604, 347], 10); g.fillStyle = rgba(SEL); g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.08)'; g.stroke();
    drawCheck(g, 1586, 326);
    icon(g, 'audio-lines', 1389, 281, 17); text(g, 'Echo-Cancel Sink', 1408, 285.5, { size: 13 });
    icon(g, 'monitor', 1390, 326, 17); text(g, 'LG Ultragear', 1409, 330.5, { size: 13 });
    icon(g, 'headphones', 1390, 371, 17); text(g, 'Headphones & speakers', 1408, 375.5, { size: 13 });
  },
  dnd(g, t) {
    const on = gl(t, T.dnd + 0.02);
    // the moon takes the accent once the notification has folded into it
    const moonCol = rgba(mix([228, 228, 231], ACC.b, back(t, T.dnd + 0.1)));
    icon(g, 'moon', MOON[0], MOON[1], 18, moonCol);
    text(g, 'Do Not Disturb', 1404, 468, { size: 13, w: 600 });
    text(g, 'Off', 1404, 482, { size: 11, color: SUB, a: out(t, T.dnd) });
    text(g, 'On · until tomorrow', 1404, 482, { size: 11, color: SUB, a: back(t, T.dnd) });
    toggle(g, [1558, 458, 1604, 482], on, ACC.b);
  },
  short(g, t) {
    label(g, 'SHORTCUTS', 1372, 559);
    ['camera', 'search', 'folder', 'lock'].forEach((n, i) => {
      const press = i === 0 ? bump(t, T.drop - 0.04, 0.3) : i === 3 ? bump(t, T.lockClick - 0.04, 0.3) : 0;
      circleBtn(g, SC_X[i], SC_Y, 21, press); icon(g, n, SC_X[i], SC_Y, 17);
    });
  },
  net(g) {
    icon(g, 'network', 1685, 158, 18); text(g, 'Network', 1708, 154, { size: 13, w: 600 });
    text(g, 'Wired connection 1', 1708, 170, { size: 11, color: SUB });
  },
  night(g) {
    icon(g, 'moon-star', 1686, 253, 18); text(g, 'Night Mode', 1708, 249, { size: 13, w: 600 });
    text(g, 'On · 3992K', 1708, 265, { size: 11, color: SUB });
    toggle(g, [1820, 240, 1866, 264], 1, ORANGE_NIGHT);
    icon(g, 'sun', 1684, 302, 14);
    rrR(g, [1714, 290, 1826, 314], 12); g.fillStyle = rgba(BTN); g.fill();
    const gr = g.createLinearGradient(1714, 0, 1798, 0); gr.addColorStop(0, 'rgb(150,112,58)'); gr.addColorStop(1, 'rgb(214,164,76)');
    rrR(g, [1714, 290, 1798, 314], 12); g.fillStyle = gr; g.fill();
    g.beginPath(); g.arc(1786, 302, 11, 0, Math.PI * 2); g.fillStyle = 'rgb(242,242,244)'; g.fill();
    icon(g, 'moon', 1856, 302, 14);
  },
  usb(g, t) {
    label(g, 'USB & DRIVES', 1676, 400);
    // eject: the drive slides out of the card, the button becomes a check
    const e = gl(t, T.eject + 0.02);
    icon(g, 'hard-drive', 1686 - 70 * e, 442, 19, TXT, 1 - clamp(e * 1.6));
    const tx = lerp(1706, 1682, e);
    text(g, 'ARCH_202609', tx, 437, { size: 13, w: 600, a: out(t, T.eject) });
    text(g, 'not mounted', tx, 452, { size: 11, color: SUB, a: out(t, T.eject) });
    text(g, 'Safe to remove', tx, 437, { size: 13, w: 600, a: back(t, T.eject) });
    text(g, 'ARCH_202609', tx, 452, { size: 11, color: SUB, a: back(t, T.eject) });
    circleBtn(g, EJECT[0], EJECT[1], 21, bump(t, T.eject - 0.04, 0.3));
    icon(g, 'eject', EJECT[0], EJECT[1], 16, TXT, out(t, T.eject));
    drawCheck(g, EJECT[0], EJECT[1], 1.3, rgba(ACC.b, back(t, T.eject)));
  },
};

// ---------- Files ----------
function filesRect(t) {
  const e = gl(t, T.files), d = dockX(1);
  return lerpRect([d - 22, DOCK_Y - 22, d + 22, DOCK_Y + 22], FILES, e);
}
function drawFiles(g, t, opts = {}) {
  if (t < T.files) return;
  const e = gl(t, T.files);
  const R = opts.frozen ? FILES : filesRect(t);
  const p = windowShape(g, R, lerp(11, 16, e), opts.frozen ? 0 : lerp(3, 18, e));
  const a = opts.frozen ? 1 : back(t, T.files);
  if (a <= 0) return;
  g.save(); p(); g.clip(); g.globalAlpha *= a;
  // sidebar
  g.fillStyle = rgba(WIN_SIDE); g.fillRect(300, 160, 200, 580);
  g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(500, 160, 1, 580); g.fillRect(300, 212, 900, 1);
  icon(g, 'chevron-left', 528, 186, 18, SUB); icon(g, 'chevron-right', 556, 186, 18, 'rgb(90,90,96)');
  text(g, 'Files', 850, 191, { size: 14, w: 600, align: 'center', color: 'rgb(160,160,166)' });
  icon(g, 'search', 1168, 186, 17, SUB);
  const opened = gl(t, T.openShots);
  const selRow = opened > 0.5 ? 4 : 0;
  const rows = [['house', 'Home'], ['file-text', 'Documents'], ['image', 'Pictures'], ['download', 'Downloads'], ['camera', 'Screenshots']];
  const selY = lerp(250, 250 + 4 * 42, opened);
  rrR(g, [312, selY - 17, 488, selY + 17], 9); g.fillStyle = rgba(ACC.b, 0.22); g.fill();
  rows.forEach(([ic, name], i) => {
    const y = 250 + i * 42, sel = i === selRow;
    icon(g, ic, 334, y, 17, sel ? rgba(ACC.b) : TXT);
    text(g, name, 354, y + 5, { size: 14, w: sel ? 600 : 500, color: sel ? '#fff' : TXT });
  });
  // the USB drive disappears from the sidebar when ejected
  const ej = opts.frozen ? 0 : gl(t, T.eject + 0.02);
  if (ej < 1) {
    g.save(); g.globalAlpha *= 1 - clamp(ej * 1.6);
    label(g, 'DEVICES', 318, 492);
    icon(g, 'hard-drive', 334, 524 - 10 * ej, 17); text(g, 'ARCH_202609', 354, 529 - 10 * ej, { size: 14 });
    g.restore();
  }
  // main: Home grid -> Screenshots
  const homeA = 1 - clamp(opened / 0.4);
  text(g, 'Home', 530, 264, { size: 22, w: 600, color: '#fff', a: homeA });
  text(g, 'Screenshots', 530, 264, { size: 22, w: 600, color: '#fff', a: back(t, T.openShots) });
  TILES.forEach((name, i) => {
    const c = tileC(i);
    if (i === SHOT_TILE) return;
    if (homeA <= 0) return;
    drawImg(g, 'folder', c[0], c[1] - 16, 92, homeA);
    text(g, name, c[0], c[1] + 52, { size: 14, align: 'center', a: homeA });
  });
  // hover, then the Screenshots tile opens into the whole view
  const sc = tileC(SHOT_TILE);
  const hover = opts.frozen ? 0 : clamp((t - (T.curShots + 0.6)) / 0.2) * (1 - opened);
  const tileR = [sc[0] - 85, sc[1] - 80, sc[0] + 85, sc[1] + 72];
  if (hover > 0 || (opened > 0 && opened < 1)) {
    rrR(g, lerpRect(tileR, MAIN, opened), lerp(12, 14, opened)); g.fillStyle = `rgba(255,255,255,${0.06 * Math.max(hover, 1 - opened)})`; g.fill();
  }
  const fc = [lerp(sc[0], 850, opened), lerp(sc[1] - 16, 440, opened)];
  const captured = opts.frozen ? 0 : clamp((t - T.capture) / (G * 0.4));
  const emptyA = (1 - captured);
  drawImg(g, 'folder', fc[0], fc[1], lerp(92, 120, opened), lerp(1, 0.28, opened) * emptyA);
  text(g, 'Screenshots', sc[0], sc[1] + 52, { size: 14, align: 'center', a: 1 - clamp(opened / 0.4) });
  text(g, 'No screenshots yet', 850, 530, { size: 16, color: SUB, a: back(t, T.openShots) * emptyA });
  // the capture lands here
  if (!opts.frozen && t >= T.capture + G) {
    drawThumb(g, THUMB, 1);
  }
  if (!opts.frozen) text(g, 'Screenshot 12-22.png', 540, 462, { size: 13, a: back(t, T.capture) });
  g.restore();
}
function drawThumb(g, R, elevK) {
  // a live miniature of the Files window as captured
  const k = (R[2] - R[0]) / (FILES[2] - FILES[0]);
  const p = () => rrR(g, R, 16 * k + 4);
  shadow(g, p, 8 * elevK);
  g.save(); p(); g.clip();
  g.translate(R[0], R[1]); g.scale(k, k); g.translate(-FILES[0], -FILES[1]);
  drawFiles(g, T.capture - 0.01, { frozen: true });
  g.restore();
  p(); g.lineWidth = 1.5 / CAM.z; g.strokeStyle = 'rgba(255,255,255,.22)'; g.stroke();
}

// ---------- screenshot overlay ----------
function selRect(t) {
  const e = gl(t, T.select), b = [CAM_BTN[0] - 21, CAM_BTN[1] - 21, CAM_BTN[0] + 21, CAM_BTN[1] + 21];
  return lerpRect(b, FILES, e);
}
function drawScreenshot(g, t) {
  if (t < T.select || t >= T.capture + G) return;
  const dim = t < T.capture ? clamp((t - T.select) / 0.25) : 1 - clamp((t - T.capture) / (G * 0.4));
  if (t < T.capture + 0.01) {
    const R = selRect(t);
    // dim everything outside the selection
    g.save(); g.beginPath(); g.rect(-900, -900, 3700, 2900); g.roundRect(R[0], R[1], R[2] - R[0], R[3] - R[1], 16); g.fillStyle = `rgba(0,0,0,${0.5 * dim})`; g.fill('evenodd'); g.restore();
    g.save(); g.strokeStyle = '#fff'; g.lineWidth = 2 / CAM.z; g.setLineDash([8 / CAM.z, 6 / CAM.z]);
    rrR(g, R, 16); g.stroke(); g.restore();
    // corner handles
    g.fillStyle = '#fff';
    for (const [x, y] of [[R[0], R[1]], [R[2], R[1]], [R[0], R[3]], [R[2], R[3]]]) { g.beginPath(); g.arc(x, y, 5 / CAM.z * 1.4, 0, Math.PI * 2); g.fill(); }
    const la = back(t, T.select);
    if (la > 0) {
      const w = Math.round(R[2] - R[0]), h = Math.round(R[3] - R[1]);
      rrR(g, [R[0] + 12, R[3] + 12, R[0] + 132, R[3] + 44], 10); g.fillStyle = `rgba(12,12,16,${0.9 * la})`; g.fill();
      text(g, `${w} × ${h}`, R[0] + 72, R[3] + 33, { size: 15, w: 600, align: 'center', color: '#fff', a: la });
    }
    return;
  }
  g.save(); g.beginPath(); g.rect(-900, -900, 3700, 2900); g.fillStyle = `rgba(0,0,0,${0.5 * dim})`; g.fill(); g.restore();
  // the capture flies into the Screenshots view, shrinking as it goes
  const e = gl(t, T.capture);
  drawThumb(g, lerpRect(FILES, THUMB, e), lerp(20, 8, e) / 8);
}

// ---------- Settings ----------
function drawSettings(g, t) {
  if (t < T.settings) return;
  const e = gl(t, T.settings), d = dockX(2);
  const R = lerpRect([d - 22, DOCK_Y - 22, d + 22, DOCK_Y + 22], SET, e);
  const p = windowShape(g, R, lerp(11, 16, e), lerp(3, 20, e));
  const a = back(t, T.settings); if (a <= 0) return;
  g.save(); p(); g.clip(); g.globalAlpha *= a;
  g.fillStyle = rgba(WIN_SIDE); g.fillRect(470, 250, 210, 560);
  g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(680, 250, 1, 560); g.fillRect(470, 302, 820, 1);
  text(g, 'Settings', 880, 281, { size: 14, w: 600, align: 'center', color: 'rgb(160,160,166)' });
  const items = [['palette', 'Appearance'], ['monitor', 'Display'], ['volume-2', 'Sound'], ['network', 'Network'], ['shield', 'Privacy'], ['info', 'About']];
  rrR(g, [482, 322, 668, 356], 9); g.fillStyle = rgba(ACC.b, 0.22); g.fill();
  items.forEach(([ic, n], i) => {
    const y = 339 + i * 42;
    icon(g, ic, 504, y, 17, i === 0 ? rgba(ACC.b) : TXT);
    text(g, n, 524, y + 5, { size: 14, w: i === 0 ? 600 : 500, color: i === 0 ? '#fff' : TXT });
  });
  text(g, 'Appearance', 710, 352, { size: 24, w: 600, color: '#fff' });
  text(g, 'Accent colour', 710, 404, { size: 13, w: 600, color: LABEL });
  SWATCHES.forEach((c, i) => { g.beginPath(); g.arc(swX(i), SW_Y, 17, 0, Math.PI * 2); g.fillStyle = rgba(c); g.fill(); });
  // the selection ring glides to the new swatch
  const rx = lerp(swX(0), swX(1), gl(t, T.accent + 0.02));
  g.beginPath(); g.arc(rx, SW_Y, 23, 0, Math.PI * 2); g.lineWidth = 2.5; g.strokeStyle = '#fff'; g.stroke();
  text(g, 'Wallpaper', 710, 500, { size: 13, w: 600, color: LABEL });
  g.save(); rrR(g, [710, 516, 950, 651], 10); g.clip(); g.drawImage(IMG.wall, 800, 800, 1920, 1080, 710, 516, 240, 135); g.restore();
  rrR(g, [710, 516, 950, 651], 10); g.lineWidth = 2; g.strokeStyle = rgba(ACC.b); g.stroke();
  rrR(g, [966, 516, 1206, 651], 10); g.fillStyle = 'rgba(255,255,255,.05)'; g.fill();
  text(g, 'Choose…', 1086, 589, { size: 14, align: 'center', color: SUB });
  text(g, 'Dark mode', 710, 710, { size: 15 }); toggle(g, [1214, 694, 1260, 718], 1, ACC.b);
  text(g, 'Transparency', 710, 760, { size: 15 }); toggle(g, [1214, 744, 1260, 768], 1, ACC.b);
  g.restore();
}

// ---------- notification ----------
function drawToast(g, t) {
  if (t < T.toast) return;
  const ei = gl(t, T.toast), ef = gl(t, T.dnd + 0.08);
  if (ef >= 1) return;
  let R = TOAST.map((v, i) => i % 2 === 0 ? v + 430 * (1 - ei) : v);
  const m = [MOON[0] - 9, MOON[1] - 9, MOON[0] + 9, MOON[1] + 9];
  R = lerpRect(R, m, ef);
  const p = () => rrR(g, R, lerp(16, 9, ef));
  g.save(); g.globalAlpha *= 1 - clamp((ef - 0.75) / 0.25);
  shadow(g, p, lerp(12, 2, ef));
  p(); g.fillStyle = rgba(mix([16, 16, 20], ACC.b, clamp((ef - 0.4) / 0.4))); g.fill();
  p(); g.lineWidth = 1 / CAM.z; g.strokeStyle = 'rgba(255,255,255,.1)'; g.stroke();
  const ca = back(t, T.toast) * out(t, T.dnd + 0.08);
  if (ca > 0) {
    g.save(); p(); g.clip(); g.globalAlpha *= ca;
    const x = R[0];
    g.beginPath(); g.arc(x + 36, 87, 18, 0, Math.PI * 2); g.fillStyle = rgba(ACC.b, 0.2); g.fill();
    icon(g, 'camera', x + 36, 87, 17, rgba(ACC.b));
    text(g, 'Screenshot saved', x + 66, 82, { size: 14, w: 600, color: '#fff' });
    text(g, 'Screenshots · Screenshot 12-22.png', x + 66, 101, { size: 12, color: SUB });
    text(g, 'now', x + 366, 80, { size: 11, align: 'right', color: SUB });
    g.restore();
  }
  g.restore();
}

// ---------- camera over time ----------
function camAt(t) {
  if (t < T.toShort) return CAM_FULL;
  if (t < T.select) return camGlide(CAM_FULL, CAM_SHORT, CAM_BTN, gl(t, T.toShort));
  if (t < T.settings) return camGlide(CAM_SHORT, CAM_FULL, CAM_BTN, gl(t, T.select));
  if (t < T.toDnd) return camGlide(CAM_FULL, CAM_SET, [880, 530], gl(t, T.settings));
  if (t < T.toUsb) return camGlide(CAM_SET, CAM_DND, [1581, 470], gl(t, T.toDnd));
  if (t < T.toFull) return camGlide(CAM_DND, CAM_USB, EJECT, gl(t, T.toUsb));
  return camGlide(CAM_USB, CAM_FULL, LOCK_BTN, gl(t, T.toFull));
}

// ---------- cursor over time ----------
const P_FOLDER = [dockX(1) + 3, DOCK_Y + 4], P_GEAR = [dockX(2) + 3, DOCK_Y + 4];
const P_SHOTS = [tileC(SHOT_TILE)[0] + 10, tileC(SHOT_TILE)[1] - 6];
const P_CAM = [CAM_BTN[0] + 3, CAM_BTN[1] + 3], P_SW = [swX(1) + 3, SW_Y + 3];
const P_DND = [1584, 473], P_EJ = [EJECT[0] + 3, EJECT[1] + 3], P_LOCK = [LOCK_BTN[0] + 3, LOCK_BTN[1] + 3];
const glideP = (t, a, p0, p1, d = G) => { const e = gl(t, a, d); return [lerp(p0[0], p1[0], e), lerp(p0[1], p1[1], e)]; };
function cursorAt(t) {
  // world points; all glides are between static targets
  const home = tt => glideP(tt, T.curHome, P_LOCK, PRESS);
  if (t < T.swipe) return { w: home(t + DUR), press: 0 };
  if (t < T.curFiles) return { w: glideP(t, T.swipe, PRESS, SWIPE_TO), press: t < T.swipe + G ? 0.6 : 0 };
  if (t < T.curShots) return { w: glideP(t, T.curFiles, SWIPE_TO, P_FOLDER), press: bump(t, T.filesClick - 0.07, 0.22) };
  if (t < T.curCam) return { w: glideP(t, T.curShots, P_FOLDER, P_SHOTS), press: bump(t, T.shotsClick - 0.07, 0.22) + bump(t, T.shotsClick + 0.12, 0.18) };
  if (t < T.curGear) return { w: glideP(t, T.curCam, P_SHOTS, P_CAM), press: bump(t, T.drop - 0.07, 0.22) };
  if (t < T.curSwatch) return { w: glideP(t, T.curGear, P_CAM, P_GEAR), press: bump(t, T.gearClick - 0.07, 0.22) };
  if (t < T.curDnd) return { w: glideP(t, T.curSwatch, P_GEAR, P_SW), press: bump(t, T.accent - 0.07, 0.22) };
  if (t < T.curEject) return { w: glideP(t, T.curDnd, P_SW, P_DND), press: bump(t, T.dnd - 0.07, 0.22) };
  if (t < T.curLock) return { w: glideP(t, T.curEject, P_DND, P_EJ), press: bump(t, T.eject - 0.07, 0.22) };
  if (t < T.curHome) return { w: glideP(t, T.curLock, P_EJ, P_LOCK), press: bump(t, T.lockClick - 0.07, 0.22) };
  return { w: home(t), press: 0 };
}

// ---------- frame ----------
function drawDesktop(g, t, tq) {
  drawWallpaper(g, t);
  g.save(); g.globalAlpha = uiAlpha(t);
  if (g.globalAlpha > 0) {
    drawDoMore(g, t);
    drawTopBar(g, t);
    drawDock(g, t);
    drawControl(g, t);
    drawFiles(g, t);
    drawSettings(g, t);
    drawToast(g, t);
    drawScreenshot(g, t);
  }
  g.restore();
  drawLockText(g, t);
  drawClock(g, t);
}
function seek(t, tq = t) {
  t = ((t % DUR) + DUR) % DUR; tq = ((tq % DUR) + DUR) % DUR;
  CAM = camAt(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  applyCam(ctx, CAM);
  // accent change: the new colour floods out of the swatch; the switch happens under the circle
  const fe = gl(t, T.accent + 0.03, 0.4);
  ACC = fe >= 1 && t >= T.accent ? ACCENTS.orange : ACCENTS.blue;
  drawDesktop(ctx, t, tq);
  if (fe > 0 && fe < 1) {
    ACC = ACCENTS.orange;
    const c = [swX(1), SW_Y];
    ctx.save(); ctx.beginPath(); ctx.arc(c[0], c[1], farthest(CAM, c) * fe, 0, Math.PI * 2); ctx.clip();
    drawDesktop(ctx, t, tq); ctx.restore();
  }
  const cur = cursorAt(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); drawCursor(ctx, toScreen(CAM, cur.w), cur.press);
}

// motion blur: average n subframes across the shutter of one frame
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
const FAST = [[T.unlock, T.unlock + G], [T.select, T.select + G], [T.capture, T.capture + G], [T.lock, T.lock + G]];
const isFast = t => FAST.some(([a, b]) => t > a - 0.05 && t < b + 0.05);

const ready = (async () => {
  await Promise.all(['400', '500', '600', '700', '900'].map(w => document.fonts.load(`${w} 20px Geist`)));
  const A = '../nova-os/assets/';
  await Promise.all([load('wall', A + 'wallpaper-padded.jpg'), load('folder', A + 'folder.webp'), load('settings', A + 'settings.webp'), load('shield', A + 'shield.webp'), load('star', A + 'nova-star.png')]);
  BLUR_WALL = document.createElement('canvas'); BLUR_WALL.width = IMG.wall.width; BLUR_WALL.height = IMG.wall.height;
  const b = BLUR_WALL.getContext('2d'); b.filter = 'blur(36px)'; b.drawImage(IMG.wall, 0, 0);
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, B, W, H };
})();
