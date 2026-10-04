// NOVA OS — Buddy (ACE) character short, 1080x1920. Pure function of time: seek(t) draws frame t.
(() => {
const W = 1080, H = 1920, DUR = 22.5;
const G = 0.8;
const T = { end: 18.4 };

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

// ---------- Buddy: a little character animation for ACE ----------
// Face geometry is in Buddy's own 300x300 units (same as the SVGs), scaled up on screen.
const FC = [540, 860], FS = 3.0;                    // face centre on canvas, scale
const OR = [255, 176, 102], BL = [61, 109, 255], FG = '#f2f2f4';

// moods: each eye is a pill (cx, cy, w, h) in face units, or a stroke shape
const PILL = (lx, ly, rx, ry, w, h, w2, h2) => ({ type: 'pill', L: [lx, ly, w, h], R: [rx, ry, w2 || w, h2 || h] });
const MOODS = {
  idle: PILL(117, 149, 183, 149, 26, 62),
  listening: PILL(117, 147, 183, 147, 30, 78),
  thinking: PILL(128, 128, 192, 128, 24, 48),
  working: PILL(117, 151, 183, 151, 30, 22),
  asking: PILL(117, 151, 183, 148, 26, 58, 26, 64),
  happy: { type: 'arc', up: true },
  sleeping: { type: 'arc', up: false },
  oops: { type: 'chev' },
};
// the script: [time, mood, gaze x, gaze y]
const ACT = [
  [0.0, 'sleeping', 0, 0], [2.1, 'idle', 0, 0], [3.2, 'idle', -16, 2], [3.8, 'idle', 16, 2], [4.4, 'idle', 0, 0],
  [4.8, 'happy', 0, 0], [6.1, 'idle', 0, 0], [7.8, 'listening', 0, -2], [9.2, 'thinking', 0, 0], [10.6, 'working', 0, 4],
  [11.7, 'oops', 0, 0], [12.5, 'working', 0, 4], [13.2, 'happy', 0, 0], [14.5, 'asking', 6, 0], [16.0, 'idle', 0, 0],
  [17.1, 'happy', 0, 0],
];
const BLINKS = [2.85, 6.9, 15.5, 16.6];
const SAY = [
  ['Hey, I\'m ACE ✦', 5.0, 6.0], ['I live on your computer.', 6.3, 7.6], ['Tell me what you need…', 8.0, 9.1],
  ['Hmm…', 9.4, 10.4], ['On it.', 10.8, 11.6], ['Oops.', 11.8, 12.4], ['Fixed it ✦', 13.3, 14.3],
  ['Can I take a look?', 14.6, 15.8], ['I only see what you show me.', 16.0, 17.6],
];
const SWITCH = 0.16;   // eyes close for a quick moment between different shapes

function stateAt(t) {
  let i = 0; for (let k = 0; k < ACT.length; k++) if (t >= ACT[k][0]) i = k;
  const cur = ACT[i], prev = ACT[Math.max(0, i - 1)], u = t - cur[0];
  return { cur, prev, u };
}
const lerp4 = (a, b, e) => a.map((v, k) => lerp(v, b[k], e));

function drawEyes(t) {
  const { cur, prev, u } = stateAt(t);
  const A = MOODS[prev[1]], B = MOODS[cur[1]];
  const gx = lerp(prev[2], cur[2], ease(u / 0.4)), gy = lerp(prev[3], cur[3], ease(u / 0.4));
  // blink factor: random blinks plus a closing-opening between different shape types
  let close = 0;
  for (const b of BLINKS) { const d = Math.abs(t - b); if (d < 0.08) close = Math.max(close, 1 - d / 0.08); }
  const shapeChange = A.type !== B.type || (A.type !== 'pill' && prev[1] !== cur[1]);
  let mood = B, e = ease(u / 0.4);
  if (shapeChange && u < SWITCH) { close = Math.max(close, 1 - Math.abs(u - SWITCH / 2) / (SWITCH / 2)); mood = u < SWITCH / 2 ? A : B; e = 1; }
  if (mood.type === 'pill') {
    const from = A.type === 'pill' && !shapeChange ? A : mood;
    for (const side of ['L', 'R']) {
      let [x, y, w, h] = lerp4(from[side], mood[side], e);
      // idle: a slow breath of the eyes; thinking: they drift
      if (cur[1] === 'thinking') { x += 3 * Math.sin(t * 2.2); y += 2 * Math.cos(t * 1.7); }
      h = Math.max(9, h * (1 - close * 0.85));
      rr(ctx, x + gx - w / 2, y + gy - h / 2, w, h, Math.min(w, h) / 2); ctx.fillStyle = FG; ctx.fill();
    }
    if (cur[1] === 'asking') {   // the raised eyebrow
      const a = ease(u / 0.3); ctx.beginPath(); ctx.moveTo(164 + gx, 96 - 6 * a); ctx.quadraticCurveTo(183 + gx, 84 - 10 * a, 202 + gx, 94 - 6 * a);
      ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.strokeStyle = FG; ctx.globalAlpha *= a; ctx.stroke(); ctx.globalAlpha = 1;
    }
    if (cur[1] === 'thinking') { for (let k = 0; k < 3; k++) { const ph = (t * 2.4 - k * 0.35) % 1; ctx.beginPath(); ctx.arc(126 + k * 24, 206, 6 + 2 * Math.max(0, Math.sin(ph * Math.PI)), 0, Math.PI * 2); ctx.fillStyle = `rgba(242,242,244,${0.35 + 0.6 * Math.max(0, Math.sin(ph * Math.PI))})`; ctx.fill(); } }
  } else {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = FG;
    const sq = 1 - close * 0.8;
    if (mood.type === 'arc') {
      const up = mood.up, depth = (up ? -28 : 16) * sq;
      for (const cx of [117, 183]) { ctx.beginPath(); ctx.moveTo(cx - 19 + gx, 154 + gy); ctx.quadraticCurveTo(cx + gx, 154 + depth + gy, cx + 19 + gx, 154 + gy); ctx.lineWidth = up ? 12 : 10; ctx.stroke(); }
    } else {   // oops: > <
      const s = sq;
      ctx.lineWidth = 12;
      ctx.beginPath(); ctx.moveTo(100, 150 - 22 * s); ctx.lineTo(128, 150); ctx.lineTo(100, 150 + 22 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(200, 150 - 22 * s); ctx.lineTo(172, 150); ctx.lineTo(200, 150 + 22 * s); ctx.stroke();
    }
  }
}

function drawBuddy(t, scale = FS, cx = FC[0], cy = FC[1], alpha = 1) {
  const { cur, u } = stateAt(t);
  const mood = cur[1];
  // a gentle float + breathing, a little hop when happy, a shake-free wince on oops
  const breathe = 1 + 0.012 * Math.sin(t * 2.0);
  const hop = mood === 'happy' ? -14 * Math.sin(Math.PI * clamp(u / 0.45)) : 0;
  const tilt = mood === 'asking' ? 0.06 * ease(u / 0.4) : mood === 'thinking' ? -0.04 * ease(u / 0.4) : mood === 'oops' ? -0.05 * Math.exp(-u * 3) : 0;
  const sleepy = mood === 'sleeping' ? 1 - gl(t, 0, 0.1) * 0 : 0;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.translate(cx, cy + 8 * Math.sin(t * 1.3) + hop * scale / 3); ctx.rotate(tilt); ctx.scale(scale * breathe, scale * breathe); ctx.translate(-150, -150);
  // rim: NOVA gradient, orange when asking, warm on oops, dim when asleep; a shimmer while working
  let rim;
  if (mood === 'asking') rim = `rgba(255,174,90,1)`;
  else if (mood === 'oops') rim = `rgba(255,154,106,1)`;
  else if (mood === 'sleeping') rim = `rgba(255,255,255,.2)`;
  else { const g = ctx.createLinearGradient(34, 40, 266, 260); g.addColorStop(0, rgba(OR)); g.addColorStop(1, rgba(BL)); rim = g; }
  rr(ctx, 34, 40, 232, 220, 78); ctx.fillStyle = '#121218'; ctx.fill();
  ctx.lineWidth = 7; ctx.strokeStyle = rim; ctx.stroke();
  if (mood === 'working') {   // a bright spark running around the rim
    const per = 2 * (232 + 220) - 4 * 78 * (4 - Math.PI) / 2, d = ((t * 420) % per);
    ctx.save(); ctx.setLineDash([60, per]); ctx.lineDashOffset = -d; rr(ctx, 34, 40, 232, 220, 78);
    ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 12; ctx.stroke(); ctx.restore();
  }
  drawEyes(t);
  // the star: twinkles when happy, rests when asleep
  if (mood !== 'sleeping') {
    const tw = mood === 'happy' ? 1 + 0.6 * Math.sin(Math.PI * clamp(u / 0.5)) : 1;
    ctx.save(); ctx.translate(214, 83); ctx.scale(tw, tw); ctx.rotate(mood === 'happy' ? 0.6 * clamp(u / 0.5) : 0);
    ctx.beginPath(); ctx.moveTo(0, -19); ctx.bezierCurveTo(2, -7, 7, -2, 19, 0); ctx.bezierCurveTo(7, 2, 2, 7, 0, 19); ctx.bezierCurveTo(-2, 7, -7, 2, -19, 0); ctx.bezierCurveTo(-7, -2, -2, -7, 0, -19);
    ctx.fillStyle = rgba(OR); ctx.fill(); ctx.restore();
  }
  ctx.restore();
  // z z z while sleeping
  if (mood === 'sleeping') for (let k = 0; k < 3; k++) {
    const ph = ((t * 0.55 + k / 3) % 1);
    text(ctx, 'z', cx + 210 + 70 * ph, cy - 230 - 170 * ph, { size: 46 + 30 * ph, w: 800, align: 'center', base: 'middle', color: '#8d8d96', a: Math.sin(Math.PI * ph) * alpha, v: true });
  }
}
function glow(cx, cy, r, a, col) {
  if (a <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(0.5, rgba(col, a * 0.35)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r); ctx.restore();
}

function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#060609'; ctx.fillRect(0, 0, W, H);
  const { cur } = stateAt(t), awake = cur[1] !== 'sleeping';
  const endE = gl(t, T.end, 1.0);
  // stage light: dim while asleep, warmer when he wakes; orange when asking
  const ga = lerp(0.18, 0.5, gl(t, 2.0, 1.2));
  glow(FC[0] - 160 + 30 * Math.sin(t * 0.6), FC[1] + 40, 900, ga * (cur[1] === 'asking' ? 1.4 : 1), [245, 142, 30]);
  glow(FC[0] + 160 + 30 * Math.cos(t * 0.5), FC[1] - 40, 900, ga * 1.1, [40, 110, 255]);
  // a soft floor shadow-light under him (light, not a drop shadow)
  ctx.save(); ctx.globalAlpha = 0.25 * (1 - endE * 0.4); const fl = ctx.createRadialGradient(FC[0], FC[1] + 420, 0, FC[0], FC[1] + 420, 360);
  fl.addColorStop(0, 'rgba(120,150,255,.5)'); fl.addColorStop(1, 'rgba(120,150,255,0)'); ctx.fillStyle = fl; ctx.fillRect(FC[0] - 400, FC[1] + 340, 800, 160); ctx.restore();

  // Buddy: fades in asleep; at the end he moves up and gets smaller for the title card
  const inA = gl(t, 0.2, 1.2);
  const sc = lerp(FS, 2.0, endE), cy = lerp(FC[1], 640, endE);
  drawBuddy(t, sc, FC[0], cy, inA);

  // his lines, under him
  for (const [s, a, b] of SAY) headline(ctx, s, 540, 1420, s.length > 20 ? 66 : 84, a, b, t, { color: s.startsWith('Oops') ? 'rgb(255,174,90)' : '#fff' });

  // end card
  if (t >= T.end + 0.3) {
    const e = gl(t, T.end + 0.3, 0.8);
    text(ctx, 'ACE', 540 + 24, 1090 + 30 * (1 - e), { size: 150, w: 800, track: 0.16, align: 'center', base: 'middle', color: '#fff', a: e, v: true });
    headline(ctx, 'Your ace up the sleeve.', 540, 1230, 58, T.end + 0.8, 999, t, { color: 'rgba(255,255,255,.8)', w: 700 });
    headline(ctx, 'Only in NOVA Pro.', 540, 1350, 76, T.end + 1.5, 999, t, { color: 'rgb(255,174,90)' });
    headline(ctx, 'Coming soon.', 540, 1470, 54, T.end + 2.3, 999, t, { color: 'rgba(255,255,255,.7)', w: 700 });
  }
}

const LINES = SAY.map(([s, a]) => [s, a]);
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
  
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, LINES, W, H, CUTS: [], STEPS: [], ACT: ACT.map(a => [a[0], a[1]]), BLINKS };
})();
