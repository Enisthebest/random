// NOVA OS — "Privacy policy" 18s vertical TikTok, 1080x1920. Pure function of time: seek(t) draws frame t.
(() => {
const W = 1080, H = 1920, DUR = 18;
const G = 0.8;
const T = {
  label: 0.3, wall: 0.2, count: 1.2, wallOut: 3.55,   // "Most privacy policies:" over a wall of legal text
  drop: 3.8, nova: 3.85, collect: 4.6, collectOut: 7.3,
  list: 7.6, listOut: 10.9,
  more: 11.2, backup: 11.6, beta: 12.3, moreOut: 14.2,
  end: 14.5, soon: 15.4, site: 15.9,
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

// ---------- scene pieces ----------
// a generic wall of legal text (not any real company's policy)
const LEGAL = ('By accessing or using the Services you agree that we and our partners may collect, store, process, share and transfer information about you, ' +
  'including device identifiers, location data, browsing activity, contacts, usage statistics, diagnostic data and inferences drawn from them, for purposes including ' +
  'personalisation, advertising, analytics, product improvement, research and any other purpose permitted by applicable law. We may retain such information for as long as ' +
  'necessary and may update this policy at any time without notice. Third parties may also collect information when you use the Services. ').repeat(14);
let LEGAL_LINES = null;
function wrap(str, size, maxW) {
  ctx.save(); ctx.font = `400 ${size}px Geist`;
  const out = []; let line = '';
  for (const w of str.split(' ')) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW) { out.push(line); line = w; } else line = t; }
  ctx.restore(); return out;
}
function legalWall(t, a) {
  if (a <= 0) return;
  if (!LEGAL_LINES) LEGAL_LINES = wrap(LEGAL, 30, W - 140);
  // the scroll speeds up: distance grows with t^2
  const u = Math.max(0, t - T.wall), y0 = 380 - (90 * u + 260 * u * u);
  ctx.save(); ctx.globalAlpha = a;
  LEGAL_LINES.forEach((l, i) => { const y = y0 + i * 44; if (y > -50 && y < H + 50) text(ctx, l, 70, y, { size: 30, w: 400, color: 'rgba(255,255,255,.28)' }); });
  ctx.restore();
}
function star(cx, cy, size, a = 1) {
  if (a <= 0) return;
  const b = [186, 41, 1187, 1100], bw = b[2] - b[0], bh = b[3] - b[1], k = size / Math.max(bw, bh);
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(IMG.star, b[0], b[1], bw, bh, cx - bw * k / 2, cy - bh * k / 2, bw * k, bh * k); ctx.restore();
}
function aura(cx, cy, w, a, t) {
  if (a <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const blob = (x, y, r, c, al) => { const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba(c, al)); gr.addColorStop(0.5, rgba(c, al * 0.45)); gr.addColorStop(1, rgba(c, 0)); ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); };
  blob(cx - w * 0.25 + 40 * Math.sin(t * 0.8), cy + 30 * Math.cos(t * 0.6), w * 0.6, [245, 142, 30], 0.32 * a);
  blob(cx + w * 0.25 + 40 * Math.cos(t * 0.7), cy - 30, w * 0.6, [40, 120, 255], 0.36 * a);
  ctx.restore();
}
function check(cx, cy, s, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  ctx.beginPath(); ctx.arc(cx, cy, s / 2, 0, Math.PI * 2); ctx.fillStyle = 'rgba(52,199,89,.18)'; ctx.fill();
  ctx.strokeStyle = '#5fdc86'; ctx.lineWidth = s * 0.09; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(cx - s * 0.2, cy + s * 0.01); ctx.lineTo(cx - s * 0.05, cy + s * 0.15); ctx.lineTo(cx + s * 0.22, cy - s * 0.14); ctx.stroke();
  ctx.restore();
}
const fmt = n => Math.round(n).toLocaleString('en-US');

function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);

  // 1. "Most privacy policies:" over a fast-scrolling wall of legal text, counting up to 11,482 words
  if (t < T.drop) {
    const wa = gl(t, T.wall, 0.6) * (1 - gl(t, T.wallOut, 0.25));
    legalWall(t, wa);
    if (wa > 0) { ctx.fillStyle = `rgba(0,0,0,${0.82 * wa})`; rr(ctx, 60, 330, W - 120, 480, 40); ctx.fill(); }
    headline(ctx, 'Most privacy policies:', 540, 430, 72, T.label, T.wallOut - 0.3, t);
    if (t >= T.count) {
      const n = 11482 * ease(clamp((t - T.count) / 1.6));
      const e = gl(t, T.count, 0.5), o = gl(t, T.wallOut - 0.3, 0.4);
      text(ctx, fmt(n), 540, 610 + 20 * (1 - e), { size: 190, w: 800, track: -0.04, align: 'center', base: 'middle', color: '#fff', a: e * (1 - o), v: true });
      text(ctx, 'words', 540, 740, { size: 52, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.7)', a: e * (1 - o) });
    }
  }

  // 2. NOVA's: we collect nothing
  aura(540, 960, 1500, 0.8 * gl(t, T.drop, 0.8) * (1 - gl(t, T.end, 0.6)), t);
  headline(ctx, "NOVA's privacy policy:", 540, 720, 64, T.nova, T.collectOut, t, { color: 'rgb(255,174,90)' });
  headline(ctx, 'We collect', 540, 900, 150, T.collect, T.collectOut, t);
  headline(ctx, 'nothing.', 540, 1060, 150, T.collect + 0.3, T.collectOut, t);

  // 3. the list, one check at a time
  if (t >= T.list - 0.1 && t < T.listOut + 0.6) {
    ['No account.', 'No tracking.', 'No telemetry.', 'AI runs on your device.'].forEach((s, i) => {
      const t0 = T.list + i * 0.45, e = gl(t, t0, 0.6), o = gl(t, T.listOut, 0.4);
      const y = 700 + i * 160 + 30 * (1 - e) - 14 * o;
      check(150, y, 84, e * (1 - o));
      text(ctx, s, 225, y, { size: s.length > 14 ? 64 : 84, w: 800, track: -0.03, base: 'middle', color: '#fff', a: e * (1 - o), v: true });
    });
  }

  // 4. the disclaimer, said plainly
  headline(ctx, 'One more thing:', 540, 700, 60, T.more, T.moreOut, t, { color: 'rgba(255,255,255,.7)' });
  headline(ctx, 'Back up before', 540, 860, 116, T.backup, T.moreOut, t);
  headline(ctx, 'you install.', 540, 990, 116, T.backup + 0.25, T.moreOut, t);
  headline(ctx, "NOVA is in beta. Use it at your own risk.", 540, 1150, 44, T.beta, T.moreOut, t, { color: 'rgba(255,255,255,.75)', w: 600 });

  // 5. end card
  if (t >= T.end - 0.2) {
    const e = gl(t, T.end, 0.9);
    aura(540, 880, 1400, e * 0.9, t);
    star(540, 760, lerp(160, 210, e), e);
    if (t >= T.end + 0.2) { const f = gl(t, T.end + 0.2); text(ctx, 'NOVA OS', 556, 960 + 30 * (1 - f), { size: 92, w: 600, track: 0.36, align: 'center', base: 'middle', color: '#fff', a: f, v: true }); }
    headline(ctx, 'Coming soon.', 540, 1100, 90, T.soon, 999, t, { color: 'rgb(255,174,90)' });
    if (t >= T.site) text(ctx, 'byeno.org', 540, 1220, { size: 46, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.75)', a: gl(t, T.site) });
  }
}

const LINES = [['Most privacy policies:', T.label], ["NOVA's privacy policy:", T.nova], ['We collect', T.collect], ['nothing.', T.collect + 0.3], ['One more thing:', T.more], ['Back up before', T.backup], ['you install.', T.backup + 0.25], ['Coming soon.', T.soon]];
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
  await load('star', 'assets/nova-star.png');
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, LINES, W, H, CUTS: [], STEPS: [T.list, T.more] };
})();
