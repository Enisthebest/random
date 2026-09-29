// NOVA OS — 22s desktop showcase loop, 1920x1080. Pure function of time: seek(t) draws frame t.
// World units are desktop pixels, so at zoom 1 the camera shows the desktop 1:1.
(() => {
const W = 1920, H = 1080, DUR = 22;
const BPM = 40 * 60 / DUR, B = 60 / BPM; // 40 beats = one 22s loop (~109 BPM), so the song loops seamlessly
const G = 0.8;                  // every glide

const T = {
  tick: 1 * B,          // 12:21 -> 12:22
  wake: 0.75,           // wallpaper floods out of the clock
  wakePull: 0.90,       // camera pulls back to the desktop
  barOut: 1.10,         // top-bar pills grow out of the clock
  doMore: 1.50,
  dock: 1.80,
  curCtl: 2.45,
  ctlClick: 6 * B,      // click the control pill
  panel: 6 * B + 0.03,  // pill -> Sound card
  cards: 6 * B + 0.83,  // the other cards grow in
  title: 4.30,
  toSound: 5.20,
  curKnob: 5.40,
  grab: 6.30,           // drag volume 45 -> 100
  curHp: 7.30,
  drop: 15 * B,         // click Headphones on the drop
  toNight: 9.00,
  curNight: 9.20,
  night: 18.5 * B,      // Night Mode on: warm flood
  toShort: 11.00,
  curSearch: 11.10,
  search: 22 * B,       // search button -> launcher
  type: 12.90,
  results: 13.30,
  curRow: 13.40,
  pick: 26 * B,         // pick Terminal: it flies to the dock
  term: 15.10,          // terminal window grows out of its dock icon
  termType: 15.95,
  collapse: 17.20,      // everything folds back into the clock
  unflood: 17.60,
  thin: 18.10,
  fan: 18.90,
  fold: 20.30,
  thicken: 21.20,
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
const WHITE = [255, 255, 255];
const PILL = [16, 16, 19];
const CARD_T = [19, 19, 23], CARD_B = [9, 9, 13];
const BTN = [37, 37, 40], TRACK = [34, 34, 36], SEL = [54, 54, 57];
const LABEL = 'rgb(176,176,181)', SUB = 'rgb(140,140,146)', TXT = 'rgb(228,228,231)';
const BLUE_A = [16, 116, 228], BLUE_B = [38, 140, 255];
const ORANGE = [255, 159, 10];
const WARM = [255, 208, 150];
const STAR = [228, 231, 238];

// ---------- canvas ----------
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

// ---------- assets ----------
const IMG = {};
const ICON_BOX = { folder: [85, 117, 1313, 1074], settings: [116, 114, 1138, 1148], shield: [115, 61, 1138, 1194], star: [186, 41, 1187, 1100] };
const load = (k, src) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.src = src; });
const PATHS = {};
for (const k in window.ICONS) PATHS[k] = new Path2D(window.ICONS[k]);

// ---------- camera ----------
const CAM_CLOCK = { x: 959.5, y: 27, z: 4 };
const CAM_FULL = { x: 960, y: 540, z: 1 };
const CAM_PANEL = { x: 1300, y: 360, z: 1.55 };
const CAM_SOUND = { x: 1488, y: 267, z: 2.8 };
const CAM_NIGHT = { x: 1770, y: 300, z: 2.8 };
const CAM_SHORT = { x: 1488, y: 585, z: 2.8 };
const CAM_TERM = { x: 960, y: 500, z: 1.1 };
const toScreen = (c, p) => [(p[0] - c.x) * c.z + W / 2, (p[1] - c.y) * c.z + H / 2];
function anchorCam(a, s, z) { return { x: a[0] - (s[0] - W / 2) / z, y: a[1] - (s[1] - H / 2) / z, z }; }
// glide between two cameras while an anchor point travels a straight screen path: no swing-outs
function camGlide(c0, c1, a, e) {
  const s0 = toScreen(c0, a), s1 = toScreen(c1, a);
  return anchorCam(a, [lerp(s0[0], s1[0], e), lerp(s0[1], s1[1], e)], lerpLog(c0.z, c1.z, e));
}
function applyCam(g, c) { g.setTransform(c.z, 0, 0, c.z, W / 2 - c.x * c.z, H / 2 - c.y * c.z); }
let CAM = CAM_FULL;

// ---------- layout (desktop pixels, measured from the screenshots) ----------
const CLOCK = [931, 9, 988, 45];
const CLOCK_C = [959.5, 27];
const BAR = { left: [15, 9, 180, 45], tray: [1737, 9, 1812, 45], us: [1827, 9, 1866, 45], ctl: [1880, 9, 1905, 45] };
const BR = [1747, 1010, 1900, 1063];
const CARD = {
  sound: [1356, 129, 1620, 405], dnd: [1356, 441, 1620, 499], short: [1356, 536, 1620, 635],
  net: [1660, 129, 1880, 187], night: [1660, 224, 1880, 340], usb: [1660, 377, 1880, 476],
};
const CARD_START = { dnd: 0, net: 0, short: 0.1, night: 0.1, usb: 0.2 };
const SLIDER = { x0: 1438, x1: 1546, y: 198 };
const V0 = 0.45;
const ROW_Y = { echo: 281, lg: 326, hp: 371 };
const SEARCH_BTN = [1461, 601];
const LAUNCH = [580, 292, 1340, 368];
const RESULTS = [580, 380, 1340, 466];
const ROW_ICON = [626, 423];
const TERM = [560, 210, 1360, 730];
const TERM_C = [960, 470];
const DOCK_Y = 1036;
const NOVA_TXT = 'nova --do-more';

// ---------- helpers ----------
function rr(g, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.roundRect(x, y, w, h, r); }
const rrR = (g, R, r) => rr(g, R[0], R[1], R[2] - R[0], R[3] - R[1], r);
function shadow(g, pathFn, elev) {
  if (elev <= 0.01) return;
  const e = elev * CAM.z, m = g.getTransform(), OFF = 30000;
  g.save(); g.setTransform(m.a, m.b, m.c, m.d, m.e - OFF, m.f);
  for (const [a, b, oy] of [[0.12, 0.6, 0.25], [0.10, 2.2, 0.9], [0.06, 5, 2]]) {
    g.shadowColor = `rgba(0,0,0,${a * g.globalAlpha})`; g.shadowBlur = e * b; g.shadowOffsetX = OFF; g.shadowOffsetY = e * oy;
    pathFn(); g.fillStyle = '#000'; g.fill();
  }
  g.restore();
}
function text(g, s, x, y, o) {
  g.save();
  g.font = `${o.w || 500} ${o.size}px ${o.mono ? 'GeistMono' : 'Geist'}`;
  g.fillStyle = o.color || TXT; g.globalAlpha *= o.a == null ? 1 : o.a;
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
  const b = ICON_BOX[key], bw = b[2] - b[0], bh = b[3] - b[1], k = size / Math.max(bw, bh);
  g.save(); g.globalAlpha *= a;
  g.drawImage(IMG[key], b[0], b[1], bw, bh, cx - bw * k / 2, cy - bh * k / 2, bw * k, bh * k); g.restore();
}
function farthest(c, p) { const s = toScreen(c, p); return Math.max(Math.hypot(s[0], s[1]), Math.hypot(W - s[0], s[1]), Math.hypot(s[0], H - s[1]), Math.hypot(W - s[0], H - s[1])) / c.z; }
// clay terminal icon, drawn in the same style as the supplied 3D icons
function terminalIcon(g, cx, cy, s, a = 1) {
  g.save(); g.globalAlpha *= a;
  const r = s * 0.27, x = cx - s / 2, y = cy - s / 2;
  const p = () => rr(g, x, y, s, s, r);
  const gr = g.createLinearGradient(0, y, 0, y + s); gr.addColorStop(0, '#f3f4f7'); gr.addColorStop(1, '#b9bdc6');
  p(); g.fillStyle = gr; g.fill();
  rr(g, x + s * 0.06, y + s * 0.05, s * 0.88, s * 0.84, r * 0.85);
  const gi = g.createLinearGradient(0, y, 0, y + s); gi.addColorStop(0, '#e6e8ed'); gi.addColorStop(1, '#cdd0d7'); g.fillStyle = gi; g.fill();
  g.strokeStyle = '#555a66'; g.lineWidth = s * 0.075; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x + s * 0.28, y + s * 0.34); g.lineTo(x + s * 0.44, y + s * 0.49); g.lineTo(x + s * 0.28, y + s * 0.64); g.stroke();
  g.beginPath(); g.moveTo(x + s * 0.52, y + s * 0.66); g.lineTo(x + s * 0.72, y + s * 0.66); g.stroke();
  g.restore();
}
// four-point star: two concave diamonds. w is the waist, `rot` turns the second copy.
function starPath(g, cx, cy, Lh, Lv, w, rot) {
  g.beginPath();
  const diamond = (L, a) => {
    const c = Math.cos(a), s = Math.sin(a), P = (x, y) => [cx + x * c - y * s, cy + x * s + y * c];
    const pts = [[L, 0], [0, -w], [-L, 0], [0, w]];
    g.moveTo(...P(L, 0));
    for (let i = 0; i < 4; i++) {
      const p0 = pts[i], p1 = pts[(i + 1) % 4];
      const ctrl = p0[1] === 0 ? [p0[0] * 0.5, 0] : [p1[0] * 0.5, 0];
      g.quadraticCurveTo(...P(ctrl[0], ctrl[1]), ...P(p1[0], p1[1]));
    }
    g.closePath();
  };
  diamond(Lh, 0); diamond(Lv, rot);
}

// ---------- macOS-style pointer ----------
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

// ---------- top bar ----------
function pillShape(g, R, r = 12, fill = PILL, elev = 3) {
  const p = () => rrR(g, R, r);
  shadow(g, p, elev);
  p(); g.fillStyle = rgba(fill); g.fill();
  p(); g.lineWidth = 1 / CAM.z; g.strokeStyle = 'rgba(255,255,255,.07)'; g.stroke();
}
function clockLabel(g, t, cx, cy, a) {
  if (a <= 0) return;
  // the minute ticks over: the last digit rolls, whole values only
  const u = gl(t, T.tick, 0.3), late = t > 10;
  g.save(); g.beginPath(); g.rect(cx - 30, cy - 9, 60, 18); g.clip();
  if (late) text(g, '12:22', cx, cy + 0.5, { size: 13, w: 600, align: 'center', base: 'middle', a, color: '#fff' });
  else {
    text(g, '12:2', cx - 4.2, cy + 0.5, { size: 13, w: 600, align: 'center', base: 'middle', a, color: '#fff' });
    text(g, '1', cx + 12.4, cy + 0.5 - 14 * u, { size: 13, w: 600, align: 'center', base: 'middle', a: a * (1 - u), color: '#fff' });
    text(g, '2', cx + 12.4, cy + 0.5 + 14 * (1 - u), { size: 13, w: 600, align: 'center', base: 'middle', a: a * u, color: '#fff' });
  }
  g.restore();
}
function drawTopBar(g, t) {
  const e = gl(t, T.barOut), ca = back(t, T.barOut);
  if (e <= 0) return;
  for (const k of ['left', 'tray', 'us']) {
    pillShape(g, lerpRect(CLOCK, BAR[k], e));
  }
  // the control pill leaves to become the Sound card, then settles back in the bar
  const ctlBack = t < T.panel ? 1 : back(t, T.cards, G);
  pillShape(g, lerpRect(CLOCK, BAR.ctl, e), 12, PILL, 3 * ctlBack);
  g.save(); g.globalAlpha = ca;
  rr(g, 28, 15, 27, 24, 8); g.fillStyle = 'rgb(201,201,207)'; g.fill();
  drawImg(g, 'star', 1757, 27, 16); drawImg(g, 'shield', 1788, 27, 16);
  text(g, 'us', 1846.5, 27.5, { size: 12, w: 600, align: 'center', base: 'middle', color: '#fff' });
  g.restore();
}
function drawClock(g, t) {
  // loop anchor: this pill is the first and last frame
  if (t >= T.thin && t < T.thicken + G) return drawClockMorph(g, t);
  pillShape(g, CLOCK, 12, PILL, 3);
  clockLabel(g, t, CLOCK_C[0], CLOCK_C[1], 1);
}

// ---------- DO MORE / dock ----------
function drawDoMore(g, t) {
  const e = gl(t, T.doMore); if (e <= 0) return;
  g.save(); g.globalAlpha = back(t, T.doMore, G * 0.9) ; g.translate(0, 36 * (1 - e));
  const gr = g.createLinearGradient(0, 460, 0, 610); gr.addColorStop(0, 'rgb(254,226,138)'); gr.addColorStop(1, 'rgb(254,251,236)');
  for (const [s, y] of [['DO', 527], ['MORE.', 607]]) text(g, s, 817, y, { size: 90, w: 900, track: -0.02, color: gr });
  g.restore();
}
function dockSlots(n) { const w = n * 60 - 12; return [...Array(n)].map((_, i) => 960 - w / 2 + 24 + i * 60); }
function drawDock(g, t) {
  const e = gl(t, T.dock); if (e <= 0) return;
  const ins = gl(t, T.pick);
  const s4 = dockSlots(4), s5 = dockSlots(5);
  const xs = s4.map((x, i) => lerp(x, s5[i], ins));
  const dw = lerp(4 * 60 + 8, 5 * 60 + 8, ins);
  const dy = 110 * (1 - e);
  g.save(); g.translate(0, dy);
  pillShape(g, [960 - dw / 2, DOCK_Y - 32, 960 + dw / 2, DOCK_Y + 32], 16, [13, 13, 16], 5);
  pillShape(g, BR, 12, [12, 12, 15], 4);
  icon(g, 'power', 1774, 1036.5, 20, '#fff'); icon(g, 'volume-2', 1826, 1036.5, 20, '#fff');
  text(g, 'US', 1872, 1037, { size: 13, w: 700, base: 'middle', color: '#fff' });
  // dock icons swell in a wave as the flying icon passes over them
  const fly = flyer(t);
  const near = fly ? clamp((fly.y - 820) / 160) : 0;
  const keys = ['star', 'folder', 'settings', 'shield'];
  keys.forEach((k, i) => {
    const sw = fly ? 1 + 0.32 * near * Math.exp(-(((xs[i] - fly.x) / 70) ** 2)) : 1;
    const sz = 44 * sw;
    drawImg(g, k, xs[i], DOCK_Y - (sz - 44) * 0.5, sz);
  });
  if (ins >= 1) terminalIcon(g, s5[4], DOCK_Y, 42);
  g.restore();
}
function flyer(t) {
  if (t < T.pick || t >= T.pick + G) return null;
  const e = gl(t, T.pick), end = [dockSlots(5)[4], DOCK_Y];
  const x = lerp(ROW_ICON[0], end[0], e), y = lerp(ROW_ICON[1], end[1], e) - 120 * Math.sin(Math.PI * e) * 0.6;
  return { x, y, s: lerp(40, 42, e) };
}

// ---------- control cards ----------
function cardRect(t, k) {
  if (k === 'sound') return lerpRect(BAR.ctl, CARD.sound, gl(t, T.panel));
  const R = CARD[k], e = gl(t, T.cards + CARD_START[k]);
  return [R[0], R[1], R[2], lerp(R[1] + 2, R[3], e)];
}
function cardVisible(t, k) { return k === 'sound' ? t >= T.panel : t >= T.cards + CARD_START[k]; }
function drawCard(g, R, elev) {
  const p = () => rrR(g, R, 10);
  shadow(g, p, elev);
  const gr = g.createLinearGradient(0, R[1], 0, R[3]); gr.addColorStop(0, rgba(CARD_T)); gr.addColorStop(1, rgba(CARD_B));
  p(); g.fillStyle = gr; g.fill();
  p(); g.lineWidth = 1 / CAM.z; g.strokeStyle = 'rgba(255,255,255,.06)'; g.stroke();
}
const label = (g, s, x, y, a) => text(g, s, x, y, { size: 11, w: 700, track: 0.08, color: LABEL, a });
function circleBtn(g, cx, cy, r = 21) {
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fillStyle = rgba(BTN); g.fill();
  g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.09)'; g.stroke();
}
function toggle(g, R, on) {
  const knobX = lerp(R[0] + 13, R[2] - 13, on);
  rrR(g, R, 12); g.fillStyle = rgba(mix([53, 53, 56], ORANGE, on)); g.fill();
  g.beginPath(); g.arc(knobX, (R[1] + R[3]) / 2, 11, 0, Math.PI * 2); g.fillStyle = 'rgb(242,242,244)'; g.fill();
}
function volume(t) { return lerp(V0, 1, gl(t, T.grab + 0.05)); }
function knobX(v) { return SLIDER.x0 + 12 + (SLIDER.x1 - SLIDER.x0 - 24) * v; }

function drawControl(g, t, tq) {
  if (t < T.panel) return;
  const ta = back(t, T.title);
  text(g, 'Control', 1344, 91, { size: 16, w: 600, color: 'rgba(255,255,255,.9)', a: ta });
  if (ta > 0) {
    g.save(); g.globalAlpha = ta;
    rrR(g, [1819, 69, 1892, 101], 16); g.fillStyle = 'rgba(70,32,14,.45)'; g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.28)'; g.stroke();
    icon(g, 'pencil', 1840, 85, 14, '#fff'); text(g, 'Edit', 1853, 90, { size: 12.5, w: 600, color: '#fff' });
    g.restore();
  }
  for (const k of Object.keys(CARD)) {
    if (!cardVisible(t, k)) continue;
    const R = cardRect(t, k);
    const land = k === 'sound' ? gl(t, T.panel) : gl(t, T.cards + CARD_START[k]);
    drawCard(g, R, lerp(8, 4, land));
    const a = k === 'sound' ? back(t, T.panel) : back(t, T.cards + CARD_START[k]);
    if (a <= 0) continue;
    g.save(); rrR(g, R, 10); g.clip(); g.globalAlpha = a;
    CARD_CONTENT[k](g, t, tq);
    g.restore();
  }
}
const CARD_CONTENT = {
  sound(g, t, tq) {
    label(g, 'SOUND', 1372, 154);
    rrR(g, [1372, 173, 1414, 222], 21); g.fillStyle = 'rgb(41,41,44)'; g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.07)'; g.stroke();
    icon(g, 'volume-2', 1393, 198, 18, '#fff');
    const v = volume(t), kx = knobX(v);
    rr(g, SLIDER.x0, 186, SLIDER.x1 - SLIDER.x0, 24, 12); g.fillStyle = rgba(TRACK); g.fill();
    const gr = g.createLinearGradient(SLIDER.x0, 0, kx, 0); gr.addColorStop(0, rgba(BLUE_A)); gr.addColorStop(1, rgba(BLUE_B));
    rr(g, SLIDER.x0, 186, kx + 12 - SLIDER.x0, 24, 12); g.fillStyle = gr; g.fill();
    g.beginPath(); g.arc(kx, 198, 11, 0, Math.PI * 2); g.fillStyle = 'rgb(242,242,244)'; g.fill();
    text(g, Math.round(volume(tq) * 100) + '%', 1600, 202.5, { size: 12, w: 600, align: 'right', color: 'rgb(205,205,210)' });
    label(g, 'OUTPUT', 1372, 242);
    // selection glides from LG Ultragear to Headphones on the drop
    const e = gl(t, T.drop + 0.02), y = lerp(ROW_Y.lg, ROW_Y.hp, e);
    rrR(g, [1372, y - 21, 1604, y + 21], 10); g.fillStyle = rgba(SEL); g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.08)'; g.stroke();
    drawCheck(g, 1586, y);
    icon(g, 'audio-lines', 1389, ROW_Y.echo, 17); text(g, 'Echo-Cancel Sink', 1408, ROW_Y.echo + 4.5, { size: 13 });
    icon(g, 'monitor', 1390, ROW_Y.lg, 17); text(g, 'LG Ultragear', 1409, ROW_Y.lg + 4.5, { size: 13 });
    icon(g, 'headphones', 1390, ROW_Y.hp, 17); text(g, 'Headphones & speakers', 1408, ROW_Y.hp + 4.5, { size: 13 });
  },
  dnd(g) {
    icon(g, 'moon', 1381, 470, 18); text(g, 'Do Not Disturb', 1404, 468, { size: 13, w: 600 });
    text(g, 'Off', 1404, 482, { size: 11, color: SUB }); toggle(g, [1558, 458, 1604, 482], 0);
  },
  short(g, t) {
    label(g, 'SHORTCUTS', 1372, 559);
    const icons = ['camera', 'search', 'folder', 'lock'];
    [1407, 1461, 1515, 1569].forEach((x, i) => {
      if (i === 1 && t >= T.search) { const a = back(t, T.results); if (a <= 0) return; g.save(); g.globalAlpha *= a; circleBtn(g, x, 601); icon(g, icons[i], x, 601, 17); g.restore(); return; }
      circleBtn(g, x, 601); icon(g, icons[i], x, 601, 17);
    });
  },
  net(g) {
    icon(g, 'network', 1685, 158, 18); text(g, 'Network', 1708, 154, { size: 13, w: 600 });
    text(g, 'Wired connection 1', 1708, 170, { size: 11, color: SUB });
  },
  night(g, t) {
    const on = gl(t, T.night);
    icon(g, 'moon-star', 1686, 253, 18); text(g, 'Night Mode', 1708, 249, { size: 13, w: 600 });
    text(g, 'Off', 1708, 265, { size: 11, color: SUB, a: out(t, T.night) });
    text(g, 'On · 3992K', 1708, 265, { size: 11, color: SUB, a: back(t, T.night) });
    toggle(g, [1820, 240, 1866, 264], on);
    icon(g, 'sun', 1684, 302, 14);
    rrR(g, [1714, 290, 1826, 314], 12); g.fillStyle = rgba(BTN); g.fill();
    const gr = g.createLinearGradient(1714, 0, 1798, 0); gr.addColorStop(0, 'rgb(150,112,58)'); gr.addColorStop(1, 'rgb(214,164,76)');
    rrR(g, [1714, 290, 1798, 314], 12); g.fillStyle = gr; g.globalAlpha *= lerp(0.35, 1, on); g.fill(); g.globalAlpha /= lerp(0.35, 1, on);
    g.beginPath(); g.arc(1786, 302, 11, 0, Math.PI * 2); g.fillStyle = 'rgb(242,242,244)'; g.fill();
    icon(g, 'moon', 1856, 302, 14);
  },
  usb(g) {
    label(g, 'USB & DRIVES', 1676, 400);
    icon(g, 'hard-drive', 1686, 442, 19); text(g, 'ARCH_202609', 1706, 437, { size: 13, w: 600 });
    text(g, 'not mounted', 1706, 452, { size: 11, color: SUB });
    circleBtn(g, 1842, 442); icon(g, 'eject', 1842, 442, 16);
  },
};
function drawCheck(g, cx, cy) {
  g.save(); g.strokeStyle = '#fff'; g.lineWidth = 1.8; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(cx - 5, cy); g.lineTo(cx - 1.5, cy + 3.5); g.lineTo(cx + 5.5, cy - 4); g.stroke(); g.restore();
}

// ---------- launcher / terminal ----------
function drawLauncher(g, t, tq) {
  if (t < T.search) return;
  const e = gl(t, T.search);
  const gone = gl(t, T.pick, 0.4), a0 = 1 - gone;
  if (a0 <= 0) return;
  g.save(); g.globalAlpha = a0;
  const btn = [SEARCH_BTN[0] - 21, SEARCH_BTN[1] - 21, SEARCH_BTN[0] + 21, SEARCH_BTN[1] + 21];
  const R = lerpRect(btn, LAUNCH, e);
  const p = () => rrR(g, R, lerp(21, 22, e));
  shadow(g, p, lerp(4, 16, e));
  p(); g.fillStyle = rgba(mix(BTN, [14, 14, 18], e)); g.fill();
  p(); g.lineWidth = 1 / CAM.z; g.strokeStyle = 'rgba(255,255,255,.1)'; g.stroke();
  // the button's own glyph rides along, then the bar's content arrives
  icon(g, 'search', lerp(SEARCH_BTN[0], 616, e), lerp(SEARCH_BTN[1], 330, e), lerp(17, 24, e), TXT);
  const ca = back(t, T.search);
  const n = Math.floor(8 * clamp((tq - T.type) / 0.42) + 1e-6);
  if (t < T.type) text(g, 'Search apps, files, settings', 644, 338.5, { size: 24, w: 400, color: 'rgba(255,255,255,.35)', a: ca });
  else text(g, 'terminal'.slice(0, n), 644, 338.5, { size: 24, w: 500, color: '#fff' });
  // results card grows from the bar once the bar has landed
  if (t >= T.results) {
    const er = gl(t, T.results);
    const RR = [RESULTS[0], RESULTS[1], RESULTS[2], lerp(RESULTS[1] + 2, RESULTS[3], er)];
    const q = () => rrR(g, RR, 18);
    shadow(g, q, 12 * er);
    q(); g.fillStyle = 'rgb(14,14,18)'; g.fill(); q(); g.lineWidth = 1 / CAM.z; g.strokeStyle = 'rgba(255,255,255,.1)'; g.stroke();
    const ra = back(t, T.results);
    if (ra > 0) {
      g.save(); q(); g.clip(); g.globalAlpha *= ra;
      rrR(g, [590, 388, 1330, 458], 13); g.fillStyle = rgba(SEL, 0.75); g.fill();
      if (t < T.pick) terminalIcon(g, ROW_ICON[0], ROW_ICON[1], 40);
      text(g, 'Terminal', 660, 418, { size: 19, w: 600, color: '#fff' });
      text(g, 'System · App', 660, 440, { size: 14, color: SUB });
      text(g, 'Open', 1310, 428, { size: 14, w: 500, color: SUB, align: 'right' });
      g.restore();
    }
  }
  g.restore();
}
function drawTerminal(g, t, tq) {
  if (t < T.term) return;
  const e = gl(t, T.term), slot = [dockSlots(5)[4], DOCK_Y];
  const R = lerpRect([slot[0] - 21, slot[1] - 21, slot[0] + 21, slot[1] + 21], TERM, e);
  const p = () => rrR(g, R, lerp(11, 16, e));
  shadow(g, p, lerp(3, 22, e));
  p(); g.fillStyle = 'rgb(11,11,15)'; g.fill(); p(); g.lineWidth = 1 / CAM.z; g.strokeStyle = 'rgba(255,255,255,.1)'; g.stroke();
  const a = back(t, T.term); if (a <= 0) return;
  g.save(); p(); g.clip(); g.globalAlpha = a;
  text(g, 'Terminal', 960, 243, { size: 14, w: 600, align: 'center', color: 'rgb(150,150,156)' });
  g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(560, 264, 800, 1);
  const n = Math.floor(NOVA_TXT.length * clamp((tq - T.termType) / 0.5) + 1e-6);
  text(g, '›', 600, 320, { size: 24, w: 500, mono: true, color: rgba(BLUE_B) });
  text(g, NOVA_TXT.slice(0, n), 626, 320, { size: 22, w: 500, mono: true, color: '#fff' });
  const caretOn = Math.floor(tq * 2.2) % 2 === 0 || (tq > T.termType && tq < T.termType + 0.55);
  if (tq > T.termType + 0.6) {
    g.fillStyle = rgba(STAR); starPath(g, 612, 366, 10, 10.5, 3.2, Math.PI / 2); g.fill();
    text(g, 'nova is ready.', 632, 374, { size: 22, mono: true, color: 'rgb(200,200,206)' });
  }
  if (tq > T.termType + 0.8) text(g, 'do more.', 632, 414, { size: 22, mono: true, color: 'rgb(254,232,160)' });
  const line = tq > T.termType + 0.8 ? 2 : tq > T.termType + 0.6 ? 1 : 0;
  if (caretOn) { g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(line ? 632 + (line === 2 ? 8 : 14) * 13.2 + 4 : 626 + n * 13.2 + 3, 302 + line * 47 - (line ? 0 : 0), 11, 22); }
  g.restore();
}

// ---------- ending: pill -> line -> NOVA star -> line -> pill ----------
function drawClockMorph(g, t) {
  const et = gl(t, T.thin), ef = gl(t, T.fan), eo = gl(t, T.fold), eh = gl(t, T.thicken);
  const Lh = 46, Lv = 49;
  if (t < T.fan || t >= T.thicken) {
    const thin = t < T.fan ? et : 1 - eh;
    const w = lerp(57, Lh * 2, thin), h = lerp(36, 3, thin), r = lerp(12, 1.5, thin);
    const R = [CLOCK_C[0] - w / 2, CLOCK_C[1] - h / 2, CLOCK_C[0] + w / 2, CLOCK_C[1] + h / 2];
    pillShape(g, R, r, mix(PILL, STAR, clamp(thin * 1.25 - 0.25)), 3 * (1 - thin));
    const la = t < T.fan ? out(t, T.thin) : back(t, T.thicken);
    clockLabel(g, t < T.fan ? t : 0, CLOCK_C[0], CLOCK_C[1], la);
    return;
  }
  const e = ef * (1 - eo);
  g.fillStyle = rgba(STAR);
  starPath(g, CLOCK_C[0], CLOCK_C[1], Lh, lerp(Lh, Lv, e), lerp(1.5, 9.5, e), e * Math.PI / 2);
  g.fill();
  // the supplied 3D star dissolves in over the silhouette
  const ia = back(t, T.fan) * out(t, T.fold);
  if (ia > 0) drawImg(g, 'star', CLOCK_C[0] + 0.5, CLOCK_C[1] + 0.3, Lv * 2 * 1.02, ia);
  const wa = back(t, T.fan) * out(t, T.fold);
  if (wa > 0) text(g, 'NOVA', CLOCK_C[0] + 1.5, CLOCK_C[1] + Lv + 17, { size: 9, w: 600, track: 0.4, align: 'center', color: '#fff', a: wa });
}

// ---------- camera over time ----------
function camAt(t) {
  if (t < T.wakePull) return CAM_CLOCK;
  if (t < T.wakePull + G) return camGlide(CAM_CLOCK, CAM_FULL, CLOCK_C, gl(t, T.wakePull));
  if (t < T.panel) return CAM_FULL;
  if (t < T.toSound) return camGlide(CAM_FULL, CAM_PANEL, [1488, 267], gl(t, T.panel));
  if (t < T.toNight) return camGlide(CAM_PANEL, CAM_SOUND, [1488, 267], gl(t, T.toSound));
  if (t < T.toShort) return camGlide(CAM_SOUND, CAM_NIGHT, [1843, 252], gl(t, T.toNight));
  if (t < T.search) return camGlide(CAM_NIGHT, CAM_SHORT, SEARCH_BTN, gl(t, T.toShort));
  if (t < T.term) return camGlide(CAM_SHORT, CAM_FULL, SEARCH_BTN, gl(t, T.search));
  if (t < T.collapse) return camGlide(CAM_FULL, CAM_TERM, TERM_C, gl(t, T.term));
  return camGlide(CAM_TERM, CAM_CLOCK, CLOCK_C, gl(t, T.collapse));
}

// ---------- cursor over time ----------
const REST = [1380, 760];            // screen position on the loop seam
const P_CTL = [1893, 29];
const P_HP = [1484, 373];
const P_TOG = [1850, 254];
const P_SEARCH = [1463, 603];
const P_ROW = [900, 425];
const P_REST2 = [1480, 830];
const glideP = (t, a, p0, p1, d = G) => { const e = gl(t, a, d); return [lerp(p0[0], p1[0], e), lerp(p0[1], p1[1], e)]; };
const knobP = t => [knobX(volume(t)) + 3, 201];
function cursorAt(t, cam) {
  const S = p => toScreen(cam, p);
  if (t < T.curCtl) return { s: REST, press: 0 };
  if (t < T.panel) { const e = gl(t, T.curCtl); const p = S(P_CTL); return { s: [lerp(REST[0], p[0], e), lerp(REST[1], p[1], e)], press: bump(t, T.ctlClick - 0.07, 0.22) }; }
  if (t < T.curKnob) return { s: S(P_CTL), press: 0 };
  if (t < T.grab) return { s: S(glideP(t, T.curKnob, P_CTL, knobP(T.grab))), press: 0 };
  if (t < T.curHp) return { s: S(knobP(t)), press: t < T.grab + 0.9 ? 0.5 : 0 };
  if (t < T.curNight) return { s: S(glideP(t, T.curHp, knobP(T.curHp), P_HP)), press: bump(t, T.drop - 0.07, 0.22) };
  if (t < T.curSearch) return { s: S(glideP(t, T.curNight, P_HP, P_TOG)), press: bump(t, T.night - 0.07, 0.22) };
  if (t < T.curRow) return { s: S(glideP(t, T.curSearch, P_TOG, P_SEARCH)), press: bump(t, T.search - 0.07, 0.22) };
  if (t < T.pick + 0.12) return { s: S(glideP(t, T.curRow, P_SEARCH, P_ROW)), press: bump(t, T.pick - 0.07, 0.22) };
  if (t < T.collapse) return { s: S(glideP(t, T.pick + 0.12, P_ROW, P_REST2)), press: 0 };
  const e = gl(t, T.collapse), p = S(P_REST2);
  return { s: [lerp(p[0], REST[0], e), lerp(p[1], REST[1], e)], press: 0 };
}

// ---------- frame ----------
function drawDesktop(g, t, tq) {
  g.drawImage(IMG.wall, -800, -800);
  // everything but the clock folds back into the clock at the end
  const ec = gl(t, T.collapse);
  g.save();
  if (ec > 0) { g.translate(CLOCK_C[0], CLOCK_C[1]); g.scale(1 - ec, 1 - ec); g.translate(-CLOCK_C[0], -CLOCK_C[1]); g.globalAlpha = 1 - clamp(ec * 1.4 - 0.4); }
  drawDoMore(g, t);
  drawTopBar(g, t);
  drawDock(g, t);
  drawControl(g, t, tq);
  drawLauncher(g, t, tq);
  const f = flyer(t); if (f) terminalIcon(g, f.x, f.y, f.s);
  drawTerminal(g, t, tq);
  g.restore();
}
function seek(t, tq = t) {
  t = ((t % DUR) + DUR) % DUR; tq = ((tq % DUR) + DUR) % DUR;
  CAM = camAt(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  applyCam(ctx, CAM);
  // the desktop floods out of the clock and pours back into it
  const far = farthest(CAM, CLOCK_C);
  let R = 0;
  if (t >= T.wake && t < T.unflood + 0.4) R = t < T.unflood ? far * gl(t, T.wake, 0.4) : far * (1 - gl(t, T.unflood, 0.4));
  if (R > 0) {
    ctx.save(); ctx.beginPath(); ctx.arc(CLOCK_C[0], CLOCK_C[1], R, 0, Math.PI * 2); ctx.clip();
    drawDesktop(ctx, t, tq);
    // Night Mode: a warm flood from the toggle across the whole screen
    const nR = farthest(CAM, [1843, 252]) * gl(t, T.night + 0.03, 0.4);
    if (nR > 0) {
      ctx.save(); ctx.beginPath(); ctx.arc(1843, 252, nR, 0, Math.PI * 2); ctx.clip();
      ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba(WARM);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    ctx.restore();
  }
  applyCam(ctx, CAM);
  drawClock(ctx, t);
  const c = cursorAt(t, CAM);
  ctx.setTransform(1, 0, 0, 1, 0, 0); drawCursor(ctx, c.s, c.press);
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
const FAST = [[T.wakePull, T.wakePull + G], [T.search, T.search + G], [T.pick, T.pick + G], [T.collapse, T.collapse + G]];
const isFast = t => FAST.some(([a, b]) => t > a - 0.05 && t < b + 0.05);

const ready = (async () => {
  await Promise.all(['400', '500', '600', '700', '900'].map(w => document.fonts.load(`${w} 20px Geist`)));
  await document.fonts.load('500 20px GeistMono'); await document.fonts.load('400 20px GeistMono');
  await Promise.all([load('wall', 'assets/wallpaper-padded.jpg'), load('folder', 'assets/folder.webp'), load('settings', 'assets/settings.webp'), load('shield', 'assets/shield.webp'), load('star', 'assets/nova-star.png')]);
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, B, W, H };
})();
