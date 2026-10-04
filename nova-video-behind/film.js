// NOVA OS — "What's behind NOVA", YouTube version (1920x1080) with a voice-over (voice 4). Pure function of time: seek(t) draws frame t.
(() => {
const W = 1920, H = 1080, G = 0.8;
const T = {
  // [13] = the end line; [14–17] = the honest part. Timed to the calm voice (assets/vo-durations.json).
  vo: [0.5, 3.81, 5.94, 8.01, 11.77, 16.56, 20.87, 24.56, 27.96, 31.91, 34.9, 36.79, 41.4, 70.02, 47.1, 52.45, 58.87, 63.29],
  stack: 11.77, layers: [12.98, 17.31, 21.21, 25.01],
  st: { design: 37.13, desk: 38.72, inst: 39.74, beta: 40.31 },
  honest: 46.7, end: 69.92,
};
const VOD = [2.56, 1.38, 1.32, 2.86, 4.04, 3.56, 2.94, 2.4, 3.2, 1.99, 1.14, 3.86, 4.4, 2.99, 4.35, 5.32, 3.52, 5.33];
const DUR = 75.21;

// ---------- easing + drawing helpers ----------
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
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const IMG = {};
const load = (k, src) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.onerror = () => r(); i.src = src; });
function rr(g, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.roundRect(x, y, w, h, r); }
function text(g, s, x, y, o) {
  const a = o.a == null ? 1 : o.a; if (a <= 0) return;
  g.save(); g.font = `${o.w || 500} ${o.size}px ${o.v ? 'GeistV' : 'Geist'}`;
  g.fillStyle = o.color || '#fff'; g.globalAlpha *= a; g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic';
  g.letterSpacing = (o.track || 0) * o.size + 'px'; g.fillText(s, x, y); g.restore();
}
function measure(s, size, w, track = 0) { ctx.save(); ctx.font = `${w} ${size}px GeistV`; ctx.letterSpacing = track * size + 'px'; const m = ctx.measureText(s).width; ctx.restore(); return m; }
function headline(g, s, cx, cy, size, tin, tout, t, o = {}) {
  if (t < tin || t > tout + 0.5) return;
  const w = o.w || 800, track = -0.035, gap = size * 0.24;
  const words = s.split(' '), ws = words.map(x => measure(x, size, w, track));
  const total = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  const outE = gl(t, tout, 0.4);
  let x = cx - total / 2;
  words.forEach((word, i) => {
    const e = ease((t - tin - i * 0.07) / 0.5);
    text(g, word, x, cy + 22 * (1 - e) - 12 * outE, { size, w, track, color: o.color || '#fff', a: e * (1 - outE), base: 'middle', v: true });
    x += ws[i] + gap;
  });
}
const icon = {};
function iconImg(name, col) {
  const k = name + col; if (icon[k]) return icon[k];
  const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`);
  icon[k] = im; return im;
}
function starImg(cx, cy, size, a = 1) {
  if (a <= 0 || !IMG.star) return;
  const b = [96, 21, 1218, 1107], bw = b[2] - b[0], bh = b[3] - b[1], k = size / Math.max(bw, bh);
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(IMG.star, b[0], b[1], bw, bh, cx - bw * k / 2, cy - bh * k / 2, bw * k, bh * k); ctx.restore();
}

// ---------- "What's behind NOVA" — YouTube version, 1920x1080. Is it real? → one solo developer → the stack
// (Arch → Hyprland → Quickshell → NOVA) → why → honest status → the honest part → not spying, built for myself → follow along.
const CX = W / 2;

// floating doubt chips at the start
const DOUBT = [['is this real?', 360, 250], ['looks AI', 1500, 300], ['fake?', 300, 820], ['no way this runs on Linux', 1340, 860], ['vibe coded…', 1620, 600], ['just a concept?', 640, 330]];
function doubts(t) {
  const out = gl(t, T.vo[1] - 0.1, 0.5);
  DOUBT.forEach(([s, x, y], i) => {
    const e = gl(t, 0.25 + i * 0.2, 0.5), a = e * (1 - out); if (a <= 0) return;
    const dx = 10 * Math.sin(t * 0.9 + i), dy = 12 * Math.cos(t * 0.7 + i * 2) - 30 * out;
    ctx.save(); ctx.globalAlpha = a; ctx.font = '600 34px GeistV';
    const w = ctx.measureText(s).width + 86, px = clamp(x + dx - w / 2, 40, W - 40 - w), py = y + dy + 20 * (1 - e);
    rr(ctx, px, py, w, 70, 35); ctx.fillStyle = 'rgba(30,30,36,.92)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.stroke();
    ctx.drawImage(iconImg('message-circle', '#8d8d96'), px + 22, py + 19, 32, 32);
    text(ctx, s, px + 62, py + 37, { size: 32, w: 600, base: 'middle', color: '#e4e4e7', v: true });
    ctx.restore();
  });
  headline(ctx, 'Is NOVA real?', CX, 520, 140, T.vo[0] + 1.0, T.vo[1] - 0.3, t);
}

// "here's what's behind it": the desktop, flat
function deskFlat(t) {
  const a = gl(t, T.vo[1], 0.5) * (1 - gl(t, T.vo[2] - 0.35, 0.4)); if (a <= 0 || !IMG.desk) return;
  const w = 1120, h = 700, x = CX - w / 2, y = 290 + 20 * (1 - a);
  ctx.save(); ctx.globalAlpha = a; rr(ctx, x, y, w, h, 28); ctx.clip(); ctx.drawImage(IMG.desk, x, y, w, h); ctx.restore();
}

// one solo developer (+ modern tools)
function person(cx, cy, a, beat = 1) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.beginPath(); ctx.arc(cx, cy, 150 * beat, 0, Math.PI * 2); ctx.fillStyle = 'rgba(59,139,255,.16)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(106,168,255,.5)'; ctx.stroke();
  ctx.drawImage(iconImg('user', '#6aa8ff'), cx - 80, cy - 80, 160, 160);
  ctx.restore();
}
function solo(t) {
  const a = gl(t, T.vo[2] - 0.1, 0.5) * (1 - gl(t, T.stack - 0.4, 0.4)); if (a <= 0) return;
  person(CX, 620, a);
  const tools = [['code', 'Code', -1, -1], ['terminal', 'Terminal', 1, -1], ['palette', 'Design', -1, 1], ['sparkles', 'AI', 1, 1]];
  tools.forEach(([ic, name, sx, sy], i) => {
    const e = gl(t, T.vo[3] + 0.2 + i * 0.25, 0.5) * a; if (e <= 0) return;
    const x = CX + sx * 400, y = 620 + sy * 110, w = 240, h = 84;
    ctx.save(); ctx.globalAlpha = e;
    rr(ctx, x - w / 2, y - h / 2 + 16 * (1 - e), w, h, 42); ctx.fillStyle = 'rgba(30,30,36,.95)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.stroke();
    ctx.drawImage(iconImg(ic, '#cdcdd2'), x - w / 2 + 26, y - 18 + 16 * (1 - e), 36, 36);
    text(ctx, name, x - w / 2 + 78, y + 2 + 16 * (1 - e), { size: 34, w: 600, base: 'middle', color: '#f2f2f4', v: true });
    ctx.restore();
  });
}

// the stack: isometric slabs on the right, the words on the left
const LAYERS = [
  { name: 'Arch Linux', sub: 'the base', col: [23, 147, 209] },
  { name: 'Hyprland', sub: 'windows + glass', col: [40, 200, 220] },
  { name: 'Quickshell', sub: 'draws the desktop', col: [162, 107, 255] },
  { name: 'NOVA design', sub: '', col: [59, 139, 255], desk: true },
];
const SW = 520, SD = 325, TH = 40, GAP = 104, SX = 1400, BASE = 800;
const U = [SW * 0.866, SW * 0.5], V = [-SD * 0.866, SD * 0.5];
function slab(L, cx, cy, a, glow) {
  if (a <= 0) return;
  const o = [cx - U[0] / 2 - V[0] / 2, cy - U[1] / 2 - V[1] / 2];
  const p = (u, v, dz = 0) => [o[0] + U[0] * u + V[0] * v, o[1] + U[1] * u + V[1] * v + dz];
  ctx.save(); ctx.globalAlpha *= a;
  const quad = (pts, fill) => { ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
  quad([p(1, 0), p(1, 1), p(1, 1, TH), p(1, 0, TH)], rgba(L.col.map(c => c * 0.45)));
  quad([p(0, 1), p(1, 1), p(1, 1, TH), p(0, 1, TH)], rgba(L.col.map(c => c * 0.6)));
  ctx.save(); ctx.transform(U[0] / SW, U[1] / SW, V[0] / SD, V[1] / SD, o[0], o[1]);
  rr(ctx, 0, 0, SW, SD, 24); ctx.clip();
  if (L.desk && IMG.desk) ctx.drawImage(IMG.desk, 0, 0, SW, SD);
  else {
    const g = ctx.createLinearGradient(0, 0, SW, SD); g.addColorStop(0, rgba(L.col.map(c => lerp(c, 255, 0.15)))); g.addColorStop(1, rgba(L.col.map(c => c * 0.8)));
    ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SD);
    text(ctx, L.name, SW / 2, SD / 2 - 12, { size: 58, w: 800, align: 'center', base: 'middle', color: '#fff', v: true, track: -0.02 });
    text(ctx, L.sub, SW / 2, SD / 2 + 46, { size: 28, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.85)', v: true });
  }
  if (glow > 0) { ctx.fillStyle = `rgba(255,255,255,${0.35 * glow})`; ctx.fillRect(0, 0, SW, SD); }
  ctx.restore();
  ctx.restore();
}
function stack(t) {
  const out = gl(t, T.vo[9] - 0.4, 0.5); if (t < T.stack - 0.2 || out >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - out;
  LAYERS.forEach((L, i) => {
    const t0 = T.layers[i]; if (t < t0 - 0.05) return;
    const e = gl(t, t0, 0.55), land = Math.exp(-Math.max(0, t - t0 - 0.5) * 6) * (t > t0 + 0.5 ? 1 : 0);
    slab(L, SX, BASE - i * GAP - 380 * (1 - e), e, land * 0.6);
  });
  ctx.restore();
}

// why
function why(t) {
  const a = gl(t, T.vo[9], 0.5) * (1 - gl(t, T.vo[10] - 0.3, 0.4)); if (a <= 0) return;
  [['ban', 'No ads'], ['eye-off', 'No tracking']].forEach(([ic, s], i) => {
    const e = gl(t, T.vo[9] + i * 0.55, 0.5) * a; if (e <= 0) return;
    const w = 640, h = 160, x = CX - w - 30 + i * (w + 60), y = 560 + 20 * (1 - e), col = [255, 92, 92];
    ctx.save(); ctx.globalAlpha = e;
    rr(ctx, x, y, w, h, 40); ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.stroke();
    rr(ctx, x + 30, y + 30, 100, 100, 28); ctx.fillStyle = rgba(col, 0.16); ctx.fill();
    ctx.drawImage(iconImg(ic, rgba(col)), x + 52, y + 52, 56, 56);
    text(ctx, s, x + 170, y + h / 2, { size: 64, w: 800, base: 'middle', color: '#f2f2f4', v: true });
    ctx.restore();
  });
}

// honest status
const STATUS = [
  { ic: 'check', title: 'Design', val: 'Done · 100+ screens', col: [95, 220, 134], t: 'design' },
  { ic: 'hammer', title: 'Desktop', val: 'Being built now', col: [106, 168, 255], t: 'desk', bar: true },
  { ic: 'clock', title: 'Installer', val: 'Next', col: [141, 141, 150], t: 'inst' },
  { ic: 'clock', title: 'Beta', val: 'After that', col: [141, 141, 150], t: 'beta' },
];
function status(t) {
  const a = gl(t, T.vo[10], 0.4) * (1 - gl(t, T.honest - 0.2, 0.5)); if (a <= 0) return;
  STATUS.forEach((r, i) => {
    const e = gl(t, T.st[r.t], 0.5) * a; if (e <= 0) return;
    const w = 1040, h = 112, x = CX - w / 2, y = 330 + i * 130 + 20 * (1 - e);
    ctx.save(); ctx.globalAlpha = e;
    rr(ctx, x, y, w, h, 30); ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.stroke();
    rr(ctx, x + 22, y + 22, 68, 68, 20); ctx.fillStyle = rgba(r.col, 0.16); ctx.fill();
    ctx.drawImage(iconImg(r.ic, rgba(r.col)), x + 38, y + 38, 36, 36);
    text(ctx, r.title, x + 116, y + h / 2 - (r.bar ? 12 : 0), { size: 40, w: 700, base: 'middle', color: '#f2f2f4', v: true });
    text(ctx, r.val, x + w - 30, y + h / 2 - (r.bar ? 12 : 0), { size: 32, w: 600, align: 'right', base: 'middle', color: rgba(r.col), v: true });
    if (r.bar) {
      const bx = x + 116, by = y + h / 2 + 20, bw = w - 146;
      rr(ctx, bx, by, bw, 10, 5); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill();
      ctx.save(); rr(ctx, bx, by, bw, 10, 5); ctx.clip();
      const seg = 300, px = bx - seg + ((t * 420) % (bw + seg));
      const g = ctx.createLinearGradient(px, 0, px + seg, 0); g.addColorStop(0, 'rgba(106,168,255,0)'); g.addColorStop(0.5, 'rgba(106,168,255,1)'); g.addColorStop(1, 'rgba(106,168,255,0)');
      ctx.fillStyle = g; ctx.fillRect(px, by, seg, 10); ctx.restore();
    }
    ctx.restore();
  });
  const tg = gl(t, T.vo[12] + 0.2, 0.5) * a, rc = gl(t, T.vo[12] + 2.6, 0.5) * a, y = 880;
  if (tg > 0) {
    ctx.save(); ctx.globalAlpha = tg;
    rr(ctx, CX - 470, y, 440, 74, 37); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill();
    ctx.drawImage(iconImg('palette', '#cdcdd2'), CX - 440, y + 19, 36, 36);
    text(ctx, 'Videos so far: designs', CX - 392, y + 38, { size: 30, w: 600, base: 'middle', color: '#e4e4e7', v: true });
    ctx.restore();
  }
  if (rc > 0) {
    ctx.save(); ctx.globalAlpha = rc;
    rr(ctx, CX + 30, y, 440, 74, 37); ctx.fillStyle = 'rgba(255,92,92,.14)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,92,92,.4)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(CX + 72, y + 37, 12, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,92,92,${0.5 + 0.5 * Math.round((Math.sin(t * 6) + 1) / 2)})`; ctx.fill();
    text(ctx, 'Real footage: coming', CX + 100, y + 38, { size: 30, w: 700, base: 'middle', color: '#ff8a8a', v: true });
    ctx.restore();
  }
}

// the honest part: the developer, a quiet heartbeat; then a lock (not spying) and the people it's shared with
function honest(t) {
  const a = gl(t, T.honest + 0.1, 0.6) * (1 - gl(t, T.end - 0.3, 0.5)); if (a <= 0) return;
  const cy = 600, beat = 1 + 0.04 * Math.max(0, Math.sin(t * 5.2)) ** 8;
  person(CX, cy, a, beat);
  const h = gl(t, T.vo[15] + 3.4, 0.6) * (1 - gl(t, T.vo[16] - 0.2, 0.4));
  if (h > 0) { ctx.save(); ctx.globalAlpha = a * h; const s = 76 * beat; ctx.drawImage(iconImg('heart', '#ffae5a'), CX + 92 - s / 2, cy + 92 - s / 2, s, s); ctx.restore(); }
  const lk = gl(t, T.vo[16] + 0.3, 0.5) * (1 - gl(t, T.vo[17] + 0.2, 0.4));
  if (lk > 0) {   // "not spying": a lock badge
    ctx.save(); ctx.globalAlpha = a * lk;
    ctx.beginPath(); ctx.arc(CX + 110, cy + 100, 52, 0, Math.PI * 2); ctx.fillStyle = 'rgba(52,199,89,.2)'; ctx.fill();
    ctx.drawImage(iconImg('lock', '#5fdc86'), CX + 84, cy + 74, 52, 52); ctx.restore();
  }
  // "sharing it with everyone who loves privacy": people appear around, linked to the developer
  for (let i = 0; i < 10; i++) {
    const e = gl(t, T.vo[17] + 2.2 + i * 0.12, 0.6) * a; if (e <= 0) continue;
    const ang = -Math.PI + (i + 0.5) / 10 * Math.PI * 2, R = 330 + 40 * (i % 2);
    const x = CX + Math.cos(ang) * R * 1.55, y = cy + Math.sin(ang) * R * 0.75;
    ctx.save(); ctx.globalAlpha = e * 0.5; ctx.strokeStyle = 'rgba(106,168,255,.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lerp(CX, x, 0.35), lerp(cy, y, 0.35)); ctx.lineTo(lerp(CX, x, 0.35 + 0.5 * e), lerp(cy, y, 0.35 + 0.5 * e)); ctx.stroke();
    ctx.globalAlpha = e;
    ctx.beginPath(); ctx.arc(x, y, 46, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fill();
    ctx.drawImage(iconImg('user', '#cdcdd2'), x - 26, y - 26, 52, 52);
    ctx.restore();
  }
}

// captions: top-centre by default; during the stack they sit on the left, beside the layers
const CAP = [
  [T.vo[1], VOD[1], ["Here's what's behind it."]],
  [T.vo[2], VOD[2], ['One solo developer.']],
  [T.vo[3], VOD[3], ['Built with modern tools, including AI.']],
  [T.vo[4], VOD[4], ['At the bottom:', 'Arch Linux.'], [23, 147, 209], 'left'],
  [T.vo[5], VOD[5], ['On top:', 'Hyprland.'], [40, 200, 220], 'left'],
  [T.vo[6], VOD[6], ['Then Quickshell', 'draws the desktop.'], [162, 107, 255], 'left'],
  [T.vo[7], VOD[7], ["And NOVA's design", 'on top of it all.'], [106, 168, 255], 'left'],
  [T.vo[8], VOD[8], ['Your computer should', 'work for you.'], [255, 174, 90], 'left'],
  [T.vo[10], T.vo[11] - T.vo[10] + VOD[11], ['So where is it now?']],
  [T.vo[12], VOD[12], ['Real footage is coming.'], [255, 138, 138]],
  [T.vo[14], VOD[14], ['Some comments make it sound worse than it is.']],
  [T.vo[15], VOD[15], ["Building an OS alone isn't fast.", "But I'm trying my best."], [255, 174, 90]],
  [T.vo[16], VOD[16], ["And no, I'm not building this", 'to spy on anyone.'], [95, 220, 134]],
  [T.vo[17], VOD[17], ["I'm building it for myself,", 'and for everyone who loves privacy.'], [106, 168, 255]],
];
function captions(t) {
  for (const [t0, d, lines, col, side] of CAP) {
    if (t < t0 - 0.05 || t > t0 + d + 0.5) continue;
    const left = side === 'left', maxW = left ? 820 : 1600, cx = left ? 520 : CX, base = 76;
    const size = Math.min(base, ...lines.map(x => base * maxW / measure(x, base, 800, -0.035)));
    const y0 = left ? 500 - (lines.length - 1) * 48 : (lines.length > 1 ? 130 : 160);
    lines.forEach((s, i) => headline(ctx, s, cx, y0 + i * 96, size, t0 + i * 0.22, t0 + d, t, { color: i === 1 && col ? rgba(col) : (lines.length === 1 && col ? rgba(col) : '#fff') }));
  }
}

function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const endE = gl(t, T.end, 0.8);
  const emo = gl(t, T.honest, 1.6) * (1 - gl(t, T.end - 0.6, 1.0));   // the honest part: blue fades to a dim, warm light
  const g = ctx.createRadialGradient(CX, 600, 0, CX, 600, 1100); g.addColorStop(0, `rgba(40,110,255,${0.16 * (1 - endE) * (1 - emo)})`); g.addColorStop(1, 'rgba(40,110,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (emo > 0) { const w = ctx.createRadialGradient(CX, 640, 0, CX, 640, 900); w.addColorStop(0, `rgba(255,150,70,${0.14 * emo})`); w.addColorStop(1, 'rgba(255,150,70,0)'); ctx.fillStyle = w; ctx.fillRect(0, 0, W, H); }
  doubts(t); deskFlat(t); solo(t); stack(t); why(t); status(t);
  // slow push-in on the developer while they speak honestly
  const push = 1 + 0.08 * clamp((t - T.honest) / (T.end - T.honest));
  ctx.save(); ctx.translate(CX, 600); ctx.scale(push, push); ctx.translate(-CX, -600); honest(t); ctx.restore();
  if (emo > 0) { const v = ctx.createRadialGradient(CX, H / 2, H * 0.35, CX, H / 2, W * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${0.55 * emo})`); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
  captions(t);
  if (endE > 0) {
    starImg(CX, 330, lerp(110, 160, endE), endE);
    if (t >= T.end + 0.2) { const g2 = gl(t, T.end + 0.2); text(ctx, 'NOVA OS', CX + 16, 500 + 30 * (1 - g2), { size: 96, w: 600, track: 0.36, align: 'center', base: 'middle', color: '#fff', a: g2, v: true }); }
    headline(ctx, 'Follow along.', CX, 640, 80, T.vo[13], 999, t);
    headline(ctx, 'Coming soon.', CX, 745, 80, T.vo[13] + 1.9, 999, t, { color: 'rgb(255,174,90)' });
    if (t > T.vo[13] + 2.6) text(ctx, 'byeno.org', CX, 850, { size: 44, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.75)', a: gl(t, T.vo[13] + 2.6), v: true });
  }
  const fo = clamp((t - (DUR - 0.6)) / 0.6); if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
}

const LINES = CAP.map(c => [c[2].join(' '), c[0]]);
const acc = document.createElement('canvas'); acc.width = W; acc.height = H; const aC = acc.getContext('2d');
function renderFrame(f, fps = 60, n = 4) {
  const t0 = f / fps;
  if (n <= 1) { seek(t0); return; }
  aC.setTransform(1, 0, 0, 1, 0, 0); aC.clearRect(0, 0, W, H);
  for (let i = 0; i < n; i++) { seek(t0 + ((i + 0.5) / n - 0.5) / fps * 0.9); aC.globalAlpha = 1 / (i + 1); aC.drawImage(cv, 0, 0); }
  aC.globalAlpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(acc, 0, 0);
}
const isFast = t => T.layers.some(x => t > x && t < x + 0.6);
const ready = (async () => {
  await Promise.all(['400', '500', '600', '700', '900'].map(w => document.fonts.load(`${w} 20px Geist`)));
  await Promise.all(['500', '600', '700', '800'].map(w => document.fonts.load(`${w} 20px GeistV`)));
  await Promise.all([load('star', 'assets/nova-star.png'), load('desk', 'assets/ui-desktop.png')]);
  for (let x = 0; x < DUR; x += 0.2) seek(x);                       // ask for every icon once…
  await Promise.all(Object.values(icon).map(im => im.decode().catch(() => {})));   // …and wait until all are ready
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, LINES, W, H, CUTS: T.layers, STEPS: [T.stack, T.vo[8], T.vo[10]] };
})();
