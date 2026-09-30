// NOVA OS — "New wallpapers?" 18s vertical TikTok, 1080x1920. Pure function of time: seek(t) draws frame t.
(() => {
const W = 1080, H = 1920, DUR = 18;
const G = 0.8;
const T = {
  q1: 0.35, q2: 0.6, qOut: 3.2,       // "New / wallpapers?"
  drop: 3.8,                          // the shuffle lands here, on the beat
  s0: 3.8, step: 1.7,                 // one wallpaper per step
  end: 14.0, head: 14.5, soon: 15.9, site: 16.4,
};
const WALLS = [
  { key: 'original', name: 'NOVA', cx: 1060 },
  { key: 'aurora', name: 'Aurora', cx: 1180 },
  { key: 'ember', name: 'Ember', cx: 1250 },
  { key: 'lilac', name: 'Lilac', cx: 1150 },
  { key: 'ocean', name: 'Ocean', cx: 1250 },
  { key: 'citrus', name: 'Citrus', cx: 1200 },
];
const sT = i => T.s0 + i * T.step;

// the shuffle: fast cuts that slow down like a slot machine, landing on NOVA at the drop
const CUTS = (() => {
  const c = [T.drop]; let d = 0.46;
  while (c[0] > 0.15) { c.unshift(c[0] - d); d = Math.max(0.1, d * 0.8); }
  return c.slice(0, -1).map((t, i, a) => ({ t, idx: ((i - a.length) % 6 + 6) % 6 }));
})();

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
// portrait crop of a 1920x1080 wallpaper around cx, drifting slowly
function portraitSrc(w, t, drift = 1) {
  const sw = 1080 * W / H;
  const cx = clamp(w.cx + 70 * Math.sin(t * 0.35 + w.cx) * drift, sw / 2, 1920 - sw / 2);
  return [cx - sw / 2, 0, cx + sw / 2, 1080];
}
function drawWall(g, i, src, dst, r = 0, a = 1) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a;
  if (r > 0) { rr(g, dst[0], dst[1], dst[2] - dst[0], dst[3] - dst[1], r); g.clip(); }
  g.drawImage(IMG[WALLS[i].key], src[0], src[1], src[2] - src[0], src[3] - src[1], dst[0], dst[1], dst[2] - dst[0], dst[3] - dst[1]);
  g.restore();
}
function fullWall(g, i, t, zoom = 1, a = 1) {
  g.save(); g.translate(W / 2, H / 2); g.scale(zoom, zoom); g.translate(-W / 2, -H / 2);
  drawWall(g, i, portraitSrc(WALLS[i], t), [0, 0, W, H], 0, a);
  g.restore();
}
// soft dark scrim at the bottom so white names read on the bright wallpapers
function scrim(g, a) {
  if (a <= 0) return;
  const gr = g.createLinearGradient(0, H * 0.45, 0, H);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${0.5 * a})`);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}

// end grid: 2 x 3 landscape tiles, each showing the whole wallpaper
const TW = 440, TH = 248, GX = 40, PITCH = TH + 96, GY0 = 430;
const tileRect = i => { const c = i % 2, r = (i / 2) | 0, x = (W - 2 * TW - GX) / 2 + c * (TW + GX), y = GY0 + r * PITCH; return [x, y, x + TW, y + TH]; };

function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);

  // ---- 1. the shuffle under "New wallpapers?" ----
  if (t < T.drop + 0.01) {
    let cur = null;
    for (const c of CUTS) if (t >= c.t) cur = c;
    const inA = clamp(t / 0.25);
    if (cur) {
      // each cut punches in slightly and settles
      const z = 1.06 - 0.06 * ease((t - cur.t) / 0.35);
      fullWall(ctx, cur.idx, t, z, inA);
    }
    // darker while the question is on screen, clearing as the shuffle slows
    ctx.fillStyle = `rgba(0,0,0,${0.5 * (1 - gl(t, T.qOut, 0.6))})`; ctx.fillRect(0, 0, W, H);
  }
  headline(ctx, 'New', 540, 860, 170, T.q1, T.qOut, t);
  headline(ctx, 'wallpapers?', 540, 1040, 170, T.q2, T.qOut, t);

  // ---- 2. landing + one wallpaper per step, revealed by a circle flood ----
  if (t >= T.drop) {
    const R = Math.hypot(W, H) * 0.62;
    for (let i = 0; i < WALLS.length; i++) {
      const st = sT(i), next = sT(i + 1);
      if (t < st || (i < WALLS.length - 1 && t > next + 0.6)) continue;
      const land = i === 0 ? 1 - 0.05 * (1 - gl(t, st, 0.9)) : 1;   // the landing settles from a slight punch
      const zoom = (1 + 0.04 * clamp((t - st) / 3)) / land * (i === 0 ? 1 : 1);
      if (i === 0) { fullWall(ctx, 0, t, zoom); continue; }
      const f = gl(t, st - 0.25, 0.6);
      if (f <= 0) continue;
      ctx.save(); ctx.beginPath(); ctx.arc(540, 1330, R * f, 0, Math.PI * 2); ctx.clip();
      fullWall(ctx, i, t, zoom); ctx.restore();
    }
  }

  // names: label + big name in the lower third
  const nameVis = t >= T.drop && t < T.end + 0.6;
  if (nameVis) {
    scrim(ctx, gl(t, T.drop, 0.6) * (1 - gl(t, T.end, 0.6)));
    for (let i = 0; i < WALLS.length; i++) {
      const tin = sT(i) + (i === 0 ? 0.2 : 0.0), tout = i < WALLS.length - 1 ? sT(i + 1) - 0.3 : T.end - 0.2;
      if (t < tin || t > tout + 0.6) continue;
      const e = gl(t, tin, 0.7), o = gl(t, tout, 0.4);
      text(ctx, `WALLPAPER ${i + 1} OF 6`, 540, 1255 + 20 * (1 - e) - 10 * o, { size: 32, w: 700, track: 0.16, align: 'center', base: 'middle', color: 'rgba(255,255,255,.8)', a: e * (1 - o) });
      headline(ctx, WALLS[i].name, 540, 1370, 190, tin + 0.08, tout, t);
    }
  }

  // ---- 3. end: the last wallpaper shrinks into its tile, the others join it ----
  if (t >= T.end) {
    const e = gl(t, T.end, 1.0);
    ctx.fillStyle = `rgba(0,0,0,${e})`; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < WALLS.length; i++) {
      const tr = tileRect(i), full = [0, 0, 1920, 1080];
      if (i === WALLS.length - 1) {
        const dst = lerpRect([0, 0, W, H], tr, e), src = lerpRect(portraitSrc(WALLS[i], t), full, e);
        drawWall(ctx, i, src, dst, lerp(0, 28, e));
      } else {
        const ei = gl(t, T.end + 0.35 + i * 0.1, 0.8);
        if (ei <= 0) continue;
        const dy = 50 * (1 - ei);
        drawWall(ctx, i, full, [tr[0], tr[1] + dy, tr[2], tr[3] + dy], 28, ei);
      }
      const ln = gl(t, T.end + 0.9 + i * 0.08, 0.6);
      text(ctx, WALLS[i].name, (tr[0] + tr[2]) / 2, tr[3] + 48 + 16 * (1 - ln), { size: 34, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.85)', a: ln });
    }
    headline(ctx, '6 new wallpapers.', 540, 300, 96, T.head, 999, t);
    const s = gl(t, T.soon - 0.4, 0.9);
    text(ctx, 'NOVA OS', 540 + 12, 1450 + 24 * (1 - s), { size: 64, w: 600, track: 0.3, align: 'center', base: 'middle', color: '#fff', a: s, v: true });
    headline(ctx, 'Coming soon.', 540, 1550, 72, T.soon, 999, t, { color: 'rgb(255,174,90)' });
    if (t >= T.site) text(ctx, 'byeno.org', 540, 1640, { size: 40, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.7)', a: gl(t, T.site) });
  }
}

const LINES = [['New', T.q1], ['wallpapers?', T.q2], ['6 new wallpapers.', T.head], ['Coming soon.', T.soon]];
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
const isFast = t => t >= T.end && t < T.end + 1.1;
const ready = (async () => {
  await Promise.all(['400', '500', '600', '700', '900'].map(w => document.fonts.load(`${w} 20px Geist`)));
  await Promise.all(['500', '600', '700', '800'].map(w => document.fonts.load(`${w} 20px GeistV`)));
  await Promise.all(WALLS.map(w => load(w.key, `../nova-wallpapers/out/nova-${w.key}-1080p.png`)));
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, LINES, W, H, CUTS: CUTS.map(c => c.t), STEPS: WALLS.map((_, i) => sT(i)) };
})();
