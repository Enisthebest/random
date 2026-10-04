// NOVA OS — "Day ones" thank-you Short, 1080x1920, voice 4. The supporters' @names pop in one by one. Pure function of time.
(() => {
const W = 1080, H = 1920, G = 0.8;
const VOD = [3.07, 0.7, 3.14];
const T = { vo: [0.3, 9.6, 11.2] };
const NAMES = ['hxpedz', 'Panvi10', 'drzvaep', 'UniqueAgasti', 'janojako2354', 'TahsinArian-r8r', 'farichYouTube', 'lithium255', 'chill_cameraguy35', 'Amar_from_tetova'];
const N0 = 3.9, NS = 0.5;                        // first name, gap between names
const NT = NAMES.map((_, i) => N0 + i * NS);
const DUR = 17.6;

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
const back = u => { u = clamp(u); const c = 1.6; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const gl = (t, a, d = G) => ease((t - a) / d);
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
function starImg(cx, cy, size, a = 1) {
  if (a <= 0 || !IMG.star) return;
  const b = [96, 21, 1218, 1107], bw = b[2] - b[0], bh = b[3] - b[1], k = size / Math.max(bw, bh);
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(IMG.star, b[0], b[1], bw, bh, cx - bw * k / 2, cy - bh * k / 2, bw * k, bh * k); ctx.restore();
}
function glow(x, y, r, a, col) {
  if (a <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}

// ---------- the film ----------
const CX = W / 2, GOLD = 'rgb(255,197,107)';
const DUST = Array.from({ length: 90 }, (_, i) => ({ x: hash(i + 1) * W, y: hash(i + 50) * H, s: 1 + hash(i + 99) * 2.4, sp: 10 + hash(i + 7) * 30, tw: hash(i + 3) * 6 }));
const CARD_H = 90, CARD_GAP = 16, LIST_Y = 520;
const cardY = i => LIST_Y + i * (CARD_H + CARD_GAP);

function nameCard(i, t) {
  const t0 = NT[i]; if (t < t0) return;
  const outT = T.vo[1] - 0.35, out = gl(t, outT + i * 0.03, 0.45);    // all lift away together on "Thank you"
  const e = clamp((t - t0) / 0.42), p = back(e), side = i % 2 ? 1 : -1;
  const label = '@' + NAMES[i], tw = measure(label, 48, 700, -0.02), w = tw + 170, h = CARD_H;
  const x = CX - w / 2 + side * 260 * (1 - ease(e)), y = cardY(i) - 120 * out;
  const flash = 1 - clamp((t - t0) / 0.5);
  ctx.save(); ctx.globalAlpha = clamp(e * 2.2) * (1 - out);
  ctx.translate(x + w / 2, y + h / 2); ctx.scale(0.86 + 0.14 * p, 0.86 + 0.14 * p); ctx.translate(-(x + w / 2), -(y + h / 2));
  rr(ctx, x, y, w, h, h / 2); ctx.fillStyle = '#121218'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,197,107,${0.18 + 0.6 * flash})`; ctx.stroke();
  ctx.beginPath(); ctx.arc(x + h / 2, y + h / 2, 31, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,197,107,.14)'; ctx.fill();
  starImg(x + h / 2, y + h / 2, 44 * (1 + 0.5 * flash));
  text(ctx, label, x + h + 12, y + h / 2 + 2, { size: 48, w: 700, base: 'middle', color: '#f4f4f6', v: true, track: -0.02 });
  ctx.restore();
  if (flash > 0) glow(x + h / 2, y + h / 2, 160, 0.35 * flash * (1 - out), '255,197,107');
}

function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#04040a'; ctx.fillRect(0, 0, W, H);
  // a warm sky that grows with every name
  const warm = clamp((t - N0) / (NT[NT.length - 1] - N0 + 0.5)) * (1 - gl(t, T.vo[2] + 3.4, 1));
  glow(CX, 1050, 1100, 0.10 + 0.10 * warm, '60,110,255');
  glow(CX, 900, 700, 0.04 + 0.12 * warm, '255,170,90');
  for (const d of DUST) {
    const y = ((d.y - t * d.sp) % H + H) % H, a = (0.25 + 0.35 * Math.sin(t * 1.3 + d.tw) ** 2) * (0.6 + 0.4 * warm);
    ctx.fillStyle = `rgba(230,236,255,${a})`; ctx.beginPath(); ctx.arc(d.x, y, d.s, 0, Math.PI * 2); ctx.fill();
  }
  // the hook
  headline(ctx, 'These people believed in NOVA', CX, 300, 66, T.vo[0], T.vo[1] - 0.4, t);
  headline(ctx, 'before anyone else.', CX, 386, 66, T.vo[0] + 1.5, T.vo[1] - 0.4, t, { color: GOLD });
  // the names, and a little counter
  NAMES.forEach((_, i) => nameCard(i, t));
  const shown = NT.filter(x => t >= x).length, ca = gl(t, N0, 0.4) * (1 - gl(t, T.vo[1] - 0.35, 0.4));
  if (ca > 0) text(ctx, `DAY ONES · ${shown}`, CX, cardY(NAMES.length) + 36, { size: 30, w: 700, align: 'center', base: 'middle', color: 'rgba(255,255,255,.55)', a: ca, v: true, track: 0.2 });
  // "Thank you."
  const ty = gl(t, T.vo[1] - 0.05, 0.4) * (1 - gl(t, T.vo[2] - 0.35, 0.4));
  if (ty > 0) {
    const s = 1 + 0.12 * (1 - ease(clamp((t - T.vo[1] + 0.05) / 0.5)));
    ctx.save(); ctx.globalAlpha = ty; ctx.translate(CX, 960); ctx.scale(s, s);
    text(ctx, 'Thank you.', 0, 0, { size: 170, w: 800, align: 'center', base: 'middle', color: '#fff', v: true, track: -0.045 });
    ctx.restore(); glow(CX, 960, 600, 0.12 * ty, '255,197,107');
  }
  // "Day ones. NOVA is coming. And you were here first."
  const endT = T.vo[2] + VOD[2] + 0.3;
  headline(ctx, 'Day ones.', CX, 820, 150, T.vo[2], endT - 0.4, t, { color: GOLD });
  headline(ctx, 'NOVA is coming.', CX, 980, 80, T.vo[2] + 0.85, endT - 0.4, t);
  headline(ctx, 'And you were here first.', CX, 1080, 80, T.vo[2] + 1.9, endT - 0.4, t);
  // logo
  const end = gl(t, endT, 0.6);
  if (end > 0) {
    starImg(CX, 820, lerp(110, 160, end), end);
    text(ctx, 'NOVA OS', CX + 14, 1000 + 30 * (1 - end), { size: 92, w: 600, track: 0.36, align: 'center', base: 'middle', color: '#fff', a: end, v: true });
    if (t > endT + 0.6) text(ctx, 'byeno.org', CX, 1110, { size: 44, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.75)', a: gl(t, endT + 0.6), v: true });
  }
  const fo = clamp((t - (DUR - 0.6)) / 0.6); if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
}

const LINES = [];
const acc = document.createElement('canvas'); acc.width = W; acc.height = H; const aC = acc.getContext('2d');
function renderFrame(f, fps = 60, n = 4) {
  const t0 = f / fps;
  if (n <= 1) { seek(t0); return; }
  aC.setTransform(1, 0, 0, 1, 0, 0); aC.clearRect(0, 0, W, H);
  for (let i = 0; i < n; i++) { seek(t0 + ((i + 0.5) / n - 0.5) / fps * 0.9); aC.globalAlpha = 1 / (i + 1); aC.drawImage(cv, 0, 0); }
  aC.globalAlpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(acc, 0, 0);
}
const isFast = t => NT.some(x => t > x - 0.05 && t < x + 0.45);
const ready = (async () => {
  await Promise.all(['500', '600', '700', '800'].map(w => document.fonts.load(`${w} 20px GeistV`)));
  await load('star', 'assets/nova-star.png');
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, LINES, W, H, NAMES: NT, END: T.vo[2] + VOD[2] + 0.3 };
})();
