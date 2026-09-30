// NOVA OS — "Accent follows your wallpaper" 15s vertical TikTok, 1080x1920. Pure function of time: seek(t) draws frame t.
(() => {
const W = 1080, H = 1920, DUR = 15;
const G = 0.8;
const T = {
  q1: 0.35, q2: 1.5, qOut: 3.2,      // "Change the wallpaper." / "NOVA changes with it."
  drop: 3.8, s0: 3.8, step: 1.3,      // one wallpaper per step, accent follows
  end: 11.6, head: 11.9, soon: 12.9, site: 13.4,
};
const WALLS = [
  { key: 'original', name: 'NOVA', cx: 1060, acc: [59, 139, 255] },
  { key: 'aurora', name: 'Aurora', cx: 1180, acc: [25, 201, 149] },
  { key: 'ember', name: 'Ember', cx: 1250, acc: [255, 79, 139] },
  { key: 'lilac', name: 'Lilac', cx: 1150, acc: [162, 107, 255] },
  { key: 'ocean', name: 'Ocean', cx: 1250, acc: [18, 184, 240] },
  { key: 'citrus', name: 'Citrus', cx: 1200, acc: [168, 230, 50] },
];
const sT = i => T.s0 + i * T.step;

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

// ---------- wallpapers ----------
function portraitSrc(w, t) {
  const sw = 1080 * W / H;
  const cx = clamp(w.cx + 70 * Math.sin(t * 0.35 + w.cx), sw / 2, 1920 - sw / 2);
  return [cx - sw / 2, 0, cx + sw / 2, 1080];
}
function drawWall(g, i, src, dst, r = 0, a = 1) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a;
  if (r > 0) { rr(g, dst[0], dst[1], dst[2] - dst[0], dst[3] - dst[1], r); g.clip(); }
  g.drawImage(IMG[WALLS[i].key], src[0], src[1], src[2] - src[0], src[3] - src[1], dst[0], dst[1], dst[2] - dst[0], dst[3] - dst[1]);
  g.restore();
}
function fullWall(g, i, t, zoom = 1) {
  g.save(); g.translate(W / 2, H / 2); g.scale(zoom, zoom); g.translate(-W / 2, -H / 2);
  drawWall(g, i, portraitSrc(WALLS[i], t), [0, 0, W, H]); g.restore();
}
const mixc = (a, b, u) => a.map((v, k) => lerp(v, b[k], u));
// which wallpaper is current, and how far the accent has flooded to it
function stepAt(t) { let i = 0; for (let k = 0; k < WALLS.length; k++) if (t >= sT(k)) i = k; return i; }
function accentAt(t) {
  const i = stepAt(t); if (i === 0) return WALLS[0].acc;
  return mixc(WALLS[i - 1].acc, WALLS[i].acc, gl(t, sT(i), 0.45));
}

// ---------- the Settings card ----------
const CARD = [80, 560, 1000, 1330];
const THUMB = i => { const w = 132, gap = (CARD[2] - CARD[0] - 80 - 6 * w) / 5, x = CARD[0] + 40 + i * (w + gap); return [x, 700, x + w, 700 + 74]; };
function card(t, a) {
  if (a <= 0) return;
  const acc = accentAt(t), i = stepAt(t);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, 60 * (1 - a));
  rr(ctx, CARD[0], CARD[1], CARD[2] - CARD[0], CARD[3] - CARD[1], 44); ctx.fillStyle = 'rgba(12,12,16,.88)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.09)'; ctx.stroke();
  const L = CARD[0] + 40;
  text(ctx, 'Appearance', L, 626, { size: 46, w: 700, track: -0.02, color: '#f2f2f4' });
  text(ctx, 'WALLPAPER', L, 680, { size: 22, w: 600, track: 0.08, color: '#8d8d96' });
  // thumbnails; the ring glides to the chosen one
  for (let k = 0; k < WALLS.length; k++) drawWall(ctx, k, [0, 0, 1920, 1080], THUMB(k), 16);
  const prev = THUMB(Math.max(0, i - 1)), cur = THUMB(i), m = i === 0 ? 1 : gl(t, sT(i) - 0.25, 0.6);
  const R = lerpRect(prev, cur, m);
  rr(ctx, R[0] - 7, R[1] - 7, R[2] - R[0] + 14, R[3] - R[1] + 14, 22); ctx.lineWidth = 5; ctx.strokeStyle = rgba(acc); ctx.stroke();
  // rows
  const row = (y, title, sub) => {
    text(ctx, title, L, y, { size: 32, w: 600, color: '#f2f2f4' });
    if (sub) text(ctx, sub, L, y + 40, { size: 25, w: 400, color: '#a1a1aa' });
  };
  ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(L, 830, CARD[2] - CARD[0] - 80, 2);
  row(890, 'Match accent to wallpaper', 'Colours follow what you pick');
  rr(ctx, CARD[2] - 40 - 92, 862, 92, 56, 28); ctx.fillStyle = rgba(acc); ctx.fill();
  ctx.beginPath(); ctx.arc(CARD[2] - 40 - 28, 890, 22, 0, Math.PI * 2); ctx.fillStyle = '#f4f4f6'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(L, 970, CARD[2] - CARD[0] - 80, 2);
  row(1030, 'Text size');
  const sx0 = L, sx1 = CARD[2] - 40, sy = 1080, v = 0.62;
  rr(ctx, sx0, sy - 6, sx1 - sx0, 12, 6); ctx.fillStyle = '#2a2a2e'; ctx.fill();
  rr(ctx, sx0, sy - 6, (sx1 - sx0) * v, 12, 6); ctx.fillStyle = rgba(acc); ctx.fill();
  ctx.beginPath(); ctx.arc(sx0 + (sx1 - sx0) * v, sy, 18, 0, Math.PI * 2); ctx.fillStyle = '#f4f4f6'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(L, 1130, CARD[2] - CARD[0] - 80, 2);
  // a selected nav item and a chip, tinted with the accent
  rr(ctx, L, 1160, 400, 76, 22); ctx.fillStyle = rgba(acc, 0.2); ctx.fill();
  ctx.beginPath(); ctx.arc(L + 40, 1198, 12, 0, Math.PI * 2); ctx.fillStyle = rgba(mixc(acc, [255, 255, 255], 0.3)); ctx.fill();
  text(ctx, 'Selected', L + 70, 1209, { size: 30, w: 600, color: '#fff' });
  rr(ctx, L + 430, 1170, 210, 56, 28); ctx.fillStyle = rgba(acc, 0.18); ctx.fill();
  text(ctx, 'Accent', L + 535, 1208, { size: 28, w: 600, align: 'center', color: rgba(mixc(acc, [255, 255, 255], 0.35)) });
  ctx.restore();
}

function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);

  // hook on black
  headline(ctx, 'Change the', 540, 820, 140, T.q1, T.qOut, t);
  headline(ctx, 'wallpaper.', 540, 970, 140, T.q1 + 0.25, T.qOut, t);
  headline(ctx, 'NOVA changes with it.', 540, 1160, 64, T.q2, T.qOut, t, { color: 'rgb(255,174,90)' });

  if (t >= T.drop - 0.4) {
    // wallpaper: NOVA fades in on the drop, each next one floods out of its thumbnail
    const zoom = 1.02 + 0.03 * clamp((t - T.drop) / 10);
    ctx.save(); ctx.globalAlpha = gl(t, T.drop - 0.4, 0.6); fullWall(ctx, 0, t, zoom); ctx.restore();
    for (let i = 1; i < WALLS.length; i++) {
      const f = gl(t, sT(i) - 0.1, 0.55); if (f <= 0) continue;
      const c = THUMB(i), cx = (c[0] + c[2]) / 2, cy = (c[1] + c[3]) / 2;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, Math.hypot(W, H) * f, 0, Math.PI * 2); ctx.clip();
      fullWall(ctx, i, t, zoom); ctx.restore();
    }
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(0, 0, W, H);
    const ca = gl(t, T.drop - 0.1, 0.8) * (1 - gl(t, T.end, 0.6));
    card(t, ca);
    // the name under the card
    for (let i = 0; i < WALLS.length; i++) {
      const tin = sT(i) + 0.1, tout = i < WALLS.length - 1 ? sT(i + 1) - 0.2 : T.end - 0.3;
      if (t < tin || t > tout + 0.5) continue;
      headline(ctx, WALLS[i].name, 540, 1470, 120, tin, tout, t);
    }
  }
  // end card
  if (t >= T.end) {
    const e = gl(t, T.end, 0.8);
    ctx.fillStyle = `rgba(0,0,0,${0.75 * e})`; ctx.fillRect(0, 0, W, H);
    headline(ctx, 'Your OS.', 540, 760, 130, T.head, 999, t);
    headline(ctx, 'Your colours.', 540, 910, 130, T.head + 0.3, 999, t);
    const s = gl(t, T.soon - 0.3, 0.9);
    text(ctx, 'NOVA OS', 552, 1150 + 24 * (1 - s), { size: 64, w: 600, track: 0.3, align: 'center', base: 'middle', color: '#fff', a: s, v: true });
    headline(ctx, 'Coming soon.', 540, 1250, 72, T.soon, 999, t, { color: 'rgb(255,174,90)' });
    if (t >= T.site) text(ctx, 'byeno.org', 540, 1345, { size: 40, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.7)', a: gl(t, T.site) });
  }
}

const LINES = [['Change the', T.q1], ['wallpaper.', T.q1 + 0.25], ['NOVA changes with it.', T.q2], ['Your OS.', T.head], ['Your colours.', T.head + 0.3], ['Coming soon.', T.soon]];
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
const isFast = () => false;
const ready = (async () => {
  await Promise.all(['400', '500', '600', '700', '900'].map(w => document.fonts.load(`${w} 20px Geist`)));
  await Promise.all(['500', '600', '700', '800'].map(w => document.fonts.load(`${w} 20px GeistV`)));
  await Promise.all(WALLS.map(w => load(w.key, `assets/nova-${w.key}-1080p.png`)));
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, LINES, W, H, CUTS: [], STEPS: WALLS.map((_, i) => sT(i)) };
})();
