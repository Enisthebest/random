// NOVA OS — "Replying to the comments" Short with a voice-over (voice 4), 1080x1920. Pure function of time: seek(t) draws frame t.
(() => {
const W = 1080, H = 1920, G = 0.8;
const T = { vo: [0.4, 3.3, 5.55, 12.35, 13.7, 18.51, 19.59, 20.69, 24.5, 25.4, 30.12, 31.52, 33.22] };
const VOD = [2.55, 1.87, 6.38, 1.02, 4.26, 0.58, 0.76, 3.39, 0.54, 4.22, 1.12, 1.08, 1.78];
const DUR = 37.0;

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

// ---------- "Replying to the comments": confident, a little savage, never toxic. No usernames on screen.
const CX = W / 2;
const COMMENTS = [
  { t: T.vo[1] - 0.1, slash: T.vo[2] - 0.05, text: ['just another hyprland', 'dotfile?'] },
  { t: T.vo[3] - 0.1, slash: T.vo[4] - 0.05, text: ["it's made by AI"] },
  { t: T.vo[6] - 0.1, slash: T.vo[7] - 0.05, text: ['looks fake'] },
  { t: T.vo[8] - 0.1, slash: T.vo[9] - 0.05, text: ['bloat?'] },
];
function commentCard(c, t) {
  if (t < c.t || t > c.slash + 1.2) return;
  const inE = clamp((t - c.t) / 0.22), pop = 1 + 0.12 * (1 - ease(inE));          // slams in
  const s = clamp((t - c.slash) / 0.25), fall = clamp((t - c.slash - 0.3) / 0.7);   // slash, then it drops away
  const w = 900, h = 120 + c.text.length * 64, x = CX - w / 2, y = 760 + 900 * fall * fall;
  ctx.save(); ctx.globalAlpha = inE * (1 - fall);
  ctx.translate(CX, y + h / 2); ctx.rotate(0.08 * fall); ctx.scale(pop, pop); ctx.translate(-CX, -(y + h / 2));
  rr(ctx, x, y, w, h, 36); ctx.fillStyle = '#17171b'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.stroke();
  ctx.beginPath(); ctx.arc(x + 70, y + 64, 32, 0, Math.PI * 2); ctx.fillStyle = '#2c2c32'; ctx.fill();
  ctx.drawImage(iconImg('user', '#77777f'), x + 50, y + 44, 40, 40);
  rr(ctx, x + 124, y + 48, 190, 30, 15); ctx.fillStyle = '#2c2c32'; ctx.fill();          // username hidden on purpose
  text(ctx, '· 2 min ago', x + 330, y + 70, { size: 28, w: 500, color: '#6e6e77' });
  c.text.forEach((ln, i) => text(ctx, ln, x + 50, y + 150 + i * 64, { size: 52, w: 600, color: '#f2f2f4', v: true }));
  // the slash
  if (s > 0) {
    ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = 'rgb(255,92,70)'; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(x - 30, y + h + 20); ctx.lineTo(lerp(x - 30, x + w + 30, ease(s)), lerp(y + h + 20, y - 20, ease(s))); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}

// rapid cuts of the real designs while "firewall, virus scanner, file manager, installer, gaming mode" is said
const CUTS = [['shield', 'Firewall', 7.7], ['guard', 'Virus scanner', 8.35], ['files', 'File manager', 9.3], ['install-disk', 'Installer', 10.18], ['gaming-on', 'Gaming mode', 11.13]];
function montage(t) {
  if (t < CUTS[0][2] - 0.1 || t > T.vo[3] - 0.2) return;
  let k = 0; CUTS.forEach((c, i) => { if (t >= c[2]) k = i; });
  const [key, label, t0] = CUTS[k], e = clamp((t - t0) / 0.18), out = 1 - gl(t, T.vo[3] - 0.6, 0.35);
  const w = 980 * (1.06 - 0.06 * ease(e)), h = w * 900 / 1440, x = CX - w / 2, y = 980 - h / 2;
  ctx.save(); ctx.globalAlpha = out;
  rr(ctx, x, y, w, h, 28); ctx.save(); ctx.clip(); ctx.drawImage(IMG['ui-' + key], x, y, w, h); ctx.restore();
  rr(ctx, x, y, w, h, 28); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.stroke();
  // the label chip
  ctx.font = '800 54px GeistV'; ctx.letterSpacing = '-1.5px'; const lw = ctx.measureText(label).width + 70;
  rr(ctx, CX - lw / 2, y + h + 40, lw, 96, 48); ctx.fillStyle = '#fff'; ctx.fill();
  text(ctx, label, CX, y + h + 90, { size: 54, w: 800, align: 'center', base: 'middle', color: '#0b0b0e', v: true, track: -0.03 });
  // a tick for every one so far
  for (let i = 0; i <= k; i++) { ctx.beginPath(); ctx.arc(CX - 2 * 44 + i * 44, y - 50, 12, 0, Math.PI * 2); ctx.fillStyle = i === k ? 'rgb(255,174,90)' : 'rgba(255,255,255,.5)'; ctx.fill(); }
  ctx.restore();
}

// "Mine." huge
function mine(t) {
  const a = gl(t, T.vo[5] - 0.05, 0.25) * (1 - gl(t, T.vo[6] - 0.45, 0.3)); if (a <= 0) return;
  const s = 1 + 0.25 * (1 - ease(clamp((t - T.vo[5] + 0.05) / 0.3)));
  ctx.save(); ctx.globalAlpha = a; ctx.translate(CX, 960); ctx.scale(s, s);
  text(ctx, 'Mine.', 0, 0, { size: 300, w: 800, align: 'center', base: 'middle', color: 'rgb(255,174,90)', v: true, track: -0.05 });
  ctx.restore();
  const f = 1 - clamp((t - T.vo[5] + 0.05) / 0.25); if (f > 0) { ctx.fillStyle = `rgba(255,255,255,${0.35 * f})`; ctx.fillRect(0, 0, W, H); }
}

// "Real footage is coming" stamp
function stamp(t) {
  const a = gl(t, T.vo[7] + 1.9, 0.3) * (1 - gl(t, T.vo[8] - 0.4, 0.3)); if (a <= 0) return;
  const s = 1 + 0.4 * (1 - ease(clamp((t - T.vo[7] - 1.9) / 0.25)));
  ctx.save(); ctx.globalAlpha = a; ctx.translate(CX, 1020); ctx.rotate(-0.06); ctx.scale(s, s);
  rr(ctx, -330, -80, 660, 160, 22); ctx.lineWidth = 10; ctx.strokeStyle = 'rgb(255,92,70)'; ctx.stroke();
  text(ctx, 'IN DEVELOPMENT', 0, 4, { size: 66, w: 800, align: 'center', base: 'middle', color: 'rgb(255,92,70)', v: true, track: 0.04 });
  ctx.restore();
}

// zero counters
const ZERO = [['ban', '0 ads', 25.4], ['eye-off', '0 trackers', 26.05], ['trash-2', '0 junk', 27.0]];
function zeros(t) {
  const out = gl(t, T.vo[10] - 0.4, 0.4);
  ZERO.forEach(([ic, s, t0], i) => {
    const e = gl(t, t0, 0.3) * (1 - out); if (e <= 0) return;
    const y = 820 + i * 170, pop = 1 + 0.15 * (1 - ease(clamp((t - t0) / 0.25)));
    ctx.save(); ctx.globalAlpha = e; ctx.translate(CX, y); ctx.scale(pop, pop);
    ctx.drawImage(iconImg(ic, '#ff8a6e'), -330, -40, 80, 80);
    text(ctx, s, -220, 4, { size: 110, w: 800, base: 'middle', color: '#fff', v: true, track: -0.04 });
    ctx.restore();
  });
}

// captions (match the voice; the answers are big and bold)
const CAP = [
  [T.vo[0], VOD[0], ['You keep saying', 'the same things.']],
  [T.vo[2], VOD[2] - 4.5, ["Dotfiles don't come", 'with their own…']],
  [T.vo[4], VOD[4], ['AI is a tool.', 'The ideas? The design?', 'The decisions?']],
  [T.vo[7], 1.9, ["It's not finished.", "That's the difference."]],
  [T.vo[9] + 2.0, VOD[9] - 2.0, ["Nothing running you", "didn't ask for."]],
];
function captions(t) {
  for (const [t0, d, lines] of CAP) {
    if (t < t0 - 0.05 || t > t0 + d + 0.5) continue;
    const size = Math.min(88, ...lines.map(x => 88 * 960 / measure(x, 88, 800, -0.035)));
    lines.forEach((s, i) => headline(ctx, s, CX, 300 + i * 100, size, t0 + i * 0.2, t0 + d, t, { color: i === lines.length - 1 && lines.length > 1 ? 'rgb(255,174,90)' : '#fff' }));
  }
}

function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(CX, 1000, 0, CX, 1000, 1000); g.addColorStop(0, 'rgba(255,90,60,.10)'); g.addColorStop(1, 'rgba(255,90,60,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // intro: the hook over a pile of blurred comment shapes
  if (t < T.vo[1]) {
    const a = 1 - gl(t, T.vo[1] - 0.5, 0.4);
    for (let i = 0; i < 7; i++) {
      const y = 620 + i * 170 + 10 * Math.sin(t * 1.5 + i), x = 90 + (i % 2) * 120, w = 780 - (i % 3) * 90;
      ctx.save(); ctx.globalAlpha = a * gl(t, 0.1 + i * 0.12, 0.3) * 0.5; rr(ctx, x, y, w, 120, 30); ctx.fillStyle = '#17171b'; ctx.fill();
      rr(ctx, x + 40, y + 40, w * 0.6, 18, 9); ctx.fillStyle = '#2c2c32'; ctx.fill(); rr(ctx, x + 40, y + 72, w * 0.4, 18, 9); ctx.fill(); ctx.restore();
    }
  }
  COMMENTS.forEach(c => commentCard(c, t));
  montage(t); mine(t); stamp(t); zeros(t); captions(t);
  // ending
  const e1 = gl(t, T.vo[10], 0.4), e2 = gl(t, T.vo[11], 0.4), end = gl(t, T.vo[12] - 0.1, 0.6);
  headline(ctx, 'So keep commenting.', CX, 820, 96, T.vo[10], T.vo[12] - 0.4, t);
  headline(ctx, "I'll keep building.", CX, 940, 96, T.vo[11], T.vo[12] - 0.4, t, { color: 'rgb(255,174,90)' });
  if (end > 0) {
    starImg(CX, 820, lerp(110, 160, end), end);
    text(ctx, 'NOVA OS', CX + 14, 1000 + 30 * (1 - end), { size: 92, w: 600, track: 0.36, align: 'center', base: 'middle', color: '#fff', a: end, v: true });
    headline(ctx, 'Coming soon.', CX, 1130, 80, T.vo[12] + 0.7, 999, t, { color: 'rgb(255,174,90)' });
    if (t > T.vo[12] + 1.3) text(ctx, 'byeno.org', CX, 1235, { size: 44, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.75)', a: gl(t, T.vo[12] + 1.3), v: true });
  }
  const fo = clamp((t - (DUR - 0.5)) / 0.5); if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
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
const isFast = t => [T.vo[2], T.vo[4], T.vo[7], T.vo[9]].some(x => t > x - 0.1 && t < x + 1.2);
const ready = (async () => {
  await Promise.all(['400', '500', '600', '700', '900'].map(w => document.fonts.load(`${w} 20px Geist`)));
  await Promise.all(['500', '600', '700', '800'].map(w => document.fonts.load(`${w} 20px GeistV`)));
  await Promise.all([load('star', 'assets/nova-star.png'), ...['shield', 'guard', 'files', 'install-disk', 'gaming-on'].map(k => load('ui-' + k, `assets/ui-${k}.png`))]);
  for (let x = 0; x < DUR; x += 0.2) seek(x);                       // ask for every icon once…
  await Promise.all(Object.values(icon).map(im => im.decode().catch(() => {})));   // …and wait until all are ready
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, LINES, W, H, CUTS: COMMENTS.map(c => c.t), SLASH: COMMENTS.map(c => c.slash), STEPS: CUTS.map(c => c[2]), MINE: T.vo[5], ZEROS: ZERO.map(z => z[2]) };
})();
