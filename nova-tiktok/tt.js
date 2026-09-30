// NOVA OS — 20s vertical TikTok teaser, 1080x1920. Pure function of time: seek(t) draws frame t.
(() => {
const W = 1080, H = 1920, DUR = 20;
const G = 0.8;
const T = {
  h1: 0.2, h1Out: 2.2, h2: 2.4, h2Out: 3.6,
  drop: 3.8, name: 4.1, nameOut: 5.9,
  b1: 6.2, b2: 7.9, b3: 9.6, b4: 11.3, b5: 13.0, b6: 14.7, bEnd: 16.4,
  end: 16.6, soon: 17.1, site: 17.7,
};
const BEATS = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'];

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


// ======================= TikTok =======================
const NOVA_O = [245, 142, 30];
function aura(g, cx, cy, w, a, t) {
  if (a <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  const blob = (x, y, r, c, al) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, rgba(c, al)); gr.addColorStop(0.5, rgba(c, al * 0.45)); gr.addColorStop(1, rgba(c, 0));
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  };
  blob(cx - w * 0.25 + 40 * Math.sin(t * 0.8), cy + 30 * Math.cos(t * 0.6), w * 0.6, NOVA_O, 0.32 * a);
  blob(cx + w * 0.25 + 40 * Math.cos(t * 0.7), cy - 30 + 20 * Math.sin(t * 0.5), w * 0.6, [40, 120, 255], 0.36 * a);
  blob(cx, cy, w * 0.3, [255, 240, 225], 0.1 * a);
  g.restore();
}
function backdrop(g, t, a) {
  g.save(); g.globalAlpha = a;
  // the blurred wallpaper, cropped to portrait, drifting slowly
  const k = 1.08 + 0.03 * Math.sin(t * 0.3), sw = 1080 / 1920 * 1080;
  const sx = 800 + 960 - sw / 2 + 180 * Math.sin(t * 0.12), sy = 800;
  g.translate(W / 2, H / 2); g.scale(k, k); g.translate(-W / 2, -H / 2);
  g.drawImage(BLUR_WALL, sx, sy, sw, 1080, 0, 0, W, H);
  g.restore();
  g.fillStyle = `rgba(0,0,0,${0.45 * a})`; g.fillRect(0, 0, W, H);
}
// beat helpers: appear on the glide, leave quickly when the next beat starts
const beatIn = (t, k) => gl(t, T[k] + 0.1, 0.6);
function beatOut(t, k) { const i = BEATS.indexOf(k), next = i + 1 < BEATS.length ? T[BEATS[i + 1]] : T.bEnd; return 1 - gl(t, next - 0.05, 0.35); }
function visual(t, k, fn) {
  const e = beatIn(t, k), o = beatOut(t, k), a = e * o;
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, 60 * (1 - e) - 40 * (1 - o)); fn(e); ctx.restore();
}
function glassCard(R, r = 36) {
  rrR(ctx, R, r); ctx.fillStyle = 'rgba(12,12,16,.82)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.stroke();
}
function bigToggle(x, y, on) {
  ctx.save(); ctx.translate(x, y); ctx.scale(2, 2); toggle(ctx, [0, 0, 46, 28], on, GREEN); ctx.restore();
}
const PROT = ['Hide your device ID', 'Private DNS', 'VPN kill switch', 'Camera off switch', 'Lock on USB unplug'];

function seek(t, tq = t) {
  t = clamp(t, 0, DUR - 1e-6); tq = clamp(tq, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  Z = 1;
  // before the drop: near black with a faint wall; after: full backdrop
  backdrop(ctx, t, lerp(0.35, 1, gl(t, T.drop - 0.2, 0.6)));
  // hook
  headline(ctx, 'Your computer', 540, 860, 116, T.h1, T.h1Out, t);
  headline(ctx, 'is watching you.', 540, 1000, 116, T.h1 + 0.3, T.h1Out, t);
  headline(ctx, 'Not this one.', 540, 930, 124, T.h2, T.h2Out, t, { color: 'rgb(255,174,90)' });
  // reveal
  const se = gl(t, T.drop, 1.0), so = gl(t, T.nameOut, 0.45);
  aura(ctx, 540, 860, 1300, se * (1 - so), t);
  if (se > 0 && so < 1) drawImg(ctx, 'star', 540, 760 - 20 * so, lerp(160, 260, se), se * (1 - so));
  if (t >= T.name && so < 1) { const e = gl(t, T.name); text(ctx, 'NOVA OS', 540 + 18, 1060 + 30 * (1 - e) - 20 * so, { size: 104, w: 600, track: 0.36, align: 'center', base: 'middle', color: '#fff', a: e * (1 - so), v: true }); }
  // feature beats: title up top, a visual below
  const titles = { b1: 'Zero tracking.', b2: '14 privacy tools.', b3: 'Firewall on.', b4: 'Local AI.', b5: 'Boots in 5 seconds.', b6: 'Light. Fast. Clean.' };
  for (const k of BEATS) {
    const i = BEATS.indexOf(k), next = i + 1 < BEATS.length ? T[BEATS[i + 1]] : T.bEnd;
    headline(ctx, titles[k], 540, 560, 100, T[k], next - 0.3, t);
  }
  visual(t, 'b1', () => {
    aura(ctx, 540, 1130, 900, 0.6 * beatIn(t, 'b1') * beatOut(t, 'b1'), t);
    drawImg(ctx, 'shield', 540, 1120, 400);
    text(ctx, 'Nothing phones home. Ever.', 540, 1440, { size: 46, w: 600, align: 'center', color: 'rgba(255,255,255,.75)' });
  });
  visual(t, 'b2', () => {
    PROT.forEach((n, i) => {
      const y = 820 + i * 136, on = gl(t, T.b2 + 0.35 + i * 0.12, 0.45);
      rrR(ctx, [110, y, 970, y + 110], 55); ctx.fillStyle = rgba(mix([255, 255, 255], GREEN, on), lerp(0.06, 0.14, on)); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = rgba(mix([255, 255, 255], GREEN, on), lerp(0.14, 0.5, on)); ctx.stroke();
      text(ctx, n, 160, y + 68, { size: 40, w: 600, color: '#fff' });
      bigToggle(830, y + 27, on);
    });
  });
  visual(t, 'b3', () => {
    [['Incoming · port scan', 0], ['Unknown device', 0], ['Your phone', 1], ['Incoming', 0]].forEach(([n, ok], i) => {
      const e = gl(t, T.b3 + 0.3 + i * 0.15, 0.5); if (e <= 0) return;
      const y = 820 + i * 150 + 20 * (1 - e), col = ok ? GREEN : RED;
      ctx.save(); ctx.globalAlpha *= e;
      glassCard([110, y, 970, y + 124], 30);
      icon(ctx, ok ? 'circle-check' : 'ban', 180, y + 62, 44, rgba(col), 1, 2.4);
      text(ctx, n, 230, y + 76, { size: 38, w: 600, color: '#fff' });
      rrR(ctx, [760, y + 36, 930, y + 88], 26); ctx.fillStyle = rgba(col, 0.16); ctx.fill();
      text(ctx, ok ? 'Allowed' : 'Blocked', 845, y + 72, { size: 28, w: 700, align: 'center', color: rgba(col) });
      ctx.restore();
    });
  });
  visual(t, 'b4', () => {
    const q = gl(t, T.b4 + 0.25, 0.5), r = gl(t, T.b4 + 0.6, 0.5), p = gl(t, T.b4 + 0.95, 0.5);
    ctx.save(); ctx.globalAlpha *= q; rrR(ctx, [390, 840, 970, 950], 55); ctx.fillStyle = '#2f7cf6'; ctx.fill();
    text(ctx, 'How hot is my PC?', 940, 910, { size: 42, w: 600, align: 'right', color: '#fff' }); ctx.restore();
    ctx.save(); ctx.globalAlpha *= r; rrR(ctx, [110, 990, 800, 1100], 55); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fill();
    drawImg(ctx, 'star', 170, 1045, 44); text(ctx, '48°C. All good.', 210, 1060, { size: 42, w: 600, color: '#fff' }); ctx.restore();
    ctx.save(); ctx.globalAlpha *= p; rrR(ctx, [110, 1180, 970, 1300], 60); ctx.fillStyle = '#ececef'; ctx.fill();
    icon(ctx, 'lock', 180, 1240, 40, '#111', 1, 2.4); text(ctx, 'Runs on your device.', 230, 1254, { size: 42, w: 700, color: '#111' }); ctx.restore();
  });
  visual(t, 'b5', () => {
    const u = ease(clamp((t - T.b5 - 0.2) / 1.1));
    ctx.beginPath(); ctx.arc(540, 1130, 240, 0, Math.PI * 2); ctx.lineWidth = 26; ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(540, 1130, 240, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * u); ctx.lineCap = 'round'; ctx.strokeStyle = rgba(mix([59, 139, 255], GREEN, u)); ctx.stroke();
    text(ctx, '5s', 540, 1130, { size: 200, w: 800, align: 'center', base: 'middle', color: '#fff', v: true, track: -0.04 });
  });
  visual(t, 'b6', () => {
    [[205, 63, 0, 'apps'], [1305, 1062, 0, 'packages'], [9.1, 7.4, 1, 'GB']].forEach(([from, to, dec, n], i) => {
      const y = 880 + i * 230, v = lerp(from, to, ease((tq - T.b6 - 0.3 - i * 0.12) / 0.9));
      glassCard([110, y, 970, y + 190], 36);
      text(ctx, dec ? v.toFixed(1) : fmtN(v), 170, y + 128, { size: 100, w: 800, color: '#fff', v: true, track: -0.03 });
      text(ctx, n, 910, y + 124, { size: 44, w: 600, align: 'right', color: 'rgba(255,255,255,.65)' });
    });
  });
  // ending
  const ee = gl(t, T.end, 0.9);
  aura(ctx, 540, 900, 1400, ee * 0.9, t);
  if (ee > 0) drawImg(ctx, 'star', 540, 720, lerp(160, 230, ee), ee);
  if (t >= T.end + 0.2) { const e = gl(t, T.end + 0.2); text(ctx, 'NOVA OS', 540 + 16, 960 + 30 * (1 - e), { size: 92, w: 600, track: 0.36, align: 'center', base: 'middle', color: '#fff', a: e, v: true }); }
  headline(ctx, 'Coming soon.', 540, 1110, 96, T.soon, 999, t, { color: 'rgb(255,174,90)' });
  if (t >= T.site) text(ctx, 'byeno.org', 540, 1260, { size: 48, w: 600, align: 'center', color: 'rgba(255,255,255,.75)', a: gl(t, T.site) });
}

const LINES = [['Your computer', T.h1], ['is watching you.', T.h1 + 0.3], ['Not this one.', T.h2], ['Zero tracking.', T.b1], ['14 privacy tools.', T.b2], ['Firewall on.', T.b3],
  ['Local AI.', T.b4], ['Boots in 5 seconds.', T.b5], ['Light. Fast. Clean.', T.b6], ['Coming soon.', T.soon]];
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
const isFast = () => false;
const ready = (async () => {
  await Promise.all(['400', '500', '600', '700', '900'].map(w => document.fonts.load(`${w} 20px Geist`)));
  await Promise.all(['500', '600', '700', '800'].map(w => document.fonts.load(`${w} 20px GeistV`)));
  const A = '../nova-os/assets/';
  await Promise.all([load('wall', A + 'wallpaper-padded.jpg'), load('shield', A + 'shield.webp'), load('star', A + 'nova-star.png'), load('folder', A + 'folder.webp'), load('settings', A + 'settings.webp')]);
  BLUR_WALL = document.createElement('canvas'); BLUR_WALL.width = IMG.wall.width; BLUR_WALL.height = IMG.wall.height;
  const b = BLUR_WALL.getContext('2d'); b.filter = 'blur(36px)'; b.drawImage(IMG.wall, 0, 0);
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, LINES, W, H };
})();
