// NOVA OS — "Big bang" vertical Short, 1080x1920. Pure function of time: seek(t) draws frame t.
(() => {
const W = 1080, H = 1920, DUR = 20;
const G = 0.8;
const T = {
  dot: 0.8, bang: 3.6, gather: 6.6, solid: 10.2,
  line1: 11.2, line2: 12.4, end: 15.4, soon: 16.4,
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

// ---------- "Big bang": a dot of light explodes, swirls into a galaxy, and the particles assemble into NOVA ----------
const C = [540, 900];                                  // where it all happens
const FR = [40, 588, 1040, 1213];                      // the desktop, 1000 x 625 (the 1440x900 shape)
const NP = 7000, NSTAR = 900;                          // particles, and how many of them become the star
let P = null, BG = null;                               // per-particle data, background stars

let seed = 12345; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
function setup() {
  // sample the desktop's colours to give each particle a home
  const im = IMG['ui-desktop'], c = document.createElement('canvas'); c.width = 1440; c.height = 900;
  const g = c.getContext('2d'); g.drawImage(im, 0, 0); const px = g.getImageData(0, 0, 1440, 900).data;
  const PAL = [[120, 170, 255], [255, 180, 110], [255, 255, 255], [170, 140, 255], [110, 220, 255]];
  P = [];
  for (let i = 0; i < NP; i++) {
    const star = i < NSTAR;
    let tx, ty, col;
    if (star) {
      // the NOVA star: four sharp points with curved sides, filled a bit towards the middle
      const a = rnd() * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), e = 4.2, s = 120 * Math.sqrt(0.15 + 0.85 * rnd());
      tx = C[0] + s * Math.sign(ca) * Math.pow(Math.abs(ca), e); ty = C[1] + s * Math.sign(sa) * Math.pow(Math.abs(sa), e);
      col = [255, 250, 240];
    } else {
      const u = rnd(), v = rnd(), sx = Math.floor(u * 1439), sy = Math.floor(v * 899), k = (sy * 1440 + sx) * 4;
      tx = FR[0] + u * (FR[2] - FR[0]); ty = FR[1] + v * (FR[3] - FR[1]);
      col = [px[k], px[k + 1], px[k + 2]];
    }
    P.push({
      tx, ty, col, star,
      ...(() => {                                       // galaxy: 3 spiral arms, a bright core, a faint halo
        const R = 30 + 880 * Math.pow(rnd(), 1.35), halo = rnd() < 0.18;
        const arm = Math.floor(rnd() * 3), spread = (rnd() - 0.5) * (halo ? 6.28 : 0.55 + 0.4 * R / 900);
        return { a0: arm * 2.094 + spread, R };
      })(),
      spin: (0.35 + 0.5 * rnd()) * (rnd() < 0.85 ? 1 : -1),
      bang: PAL[Math.floor(rnd() * PAL.length)],
      size: star ? 2.6 + 1.6 * rnd() : 1.8 + 2.2 * rnd(),
      delay: rnd() * 1.6 + (star ? 1.2 : 0),            // the star gathers last
      tw: rnd() * 6.28,
    });
  }
  BG = []; for (let i = 0; i < 260; i++) BG.push([rnd() * W, rnd() * H, 0.3 + rnd() * 1.4, rnd() * 6.28]);
}

function posAt(p, t) {
  // phase A: blast out and swirl (galaxy arms come from radius-dependent spin)
  const u = Math.max(0, t - T.bang);
  const r = p.R * (1 - Math.exp(-u * 1.9));
  const th = p.a0 + r / 210 + 0.22 * u + 0.08 * p.spin * u;               // r/210 winds the arms into a spiral; the whole galaxy turns slowly
  let x = C[0] + r * Math.cos(th), y = C[1] + r * Math.sin(th) * 0.92;
  // phase B: fly home
  const v = ease(clamp((t - T.gather - p.delay) / 1.7));
  if (v > 0) { x = lerp(x, p.tx, v); y = lerp(y, p.ty, v); }
  return [x, y, v];
}
function glow(cx, cy, r, a, col) {
  if (a <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(0.35, rgba(col, a * 0.3)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r); ctx.restore();
}
function starImg(cx, cy, size, a = 1) {
  if (a <= 0) return;
  const b = [186, 41, 1187, 1100], bw = b[2] - b[0], bh = b[3] - b[1], k = size / Math.max(bw, bh);
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(IMG.star, b[0], b[1], bw, bh, cx - bw * k / 2, cy - bh * k / 2, bw * k, bh * k); ctx.restore();
}

function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  if (!P) setup();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);

  // distant stars appear after the bang and twinkle
  const bgA = gl(t, T.bang + 0.6, 2.0) * (1 - gl(t, T.end, 0.8) * 0.6);
  if (bgA > 0) for (const [x, y, s, ph] of BG) { ctx.fillStyle = `rgba(220,230,255,${bgA * (0.35 + 0.35 * Math.sin(t * 2 + ph))})`; ctx.fillRect(x, y, s, s); }

  // 1. the dot: appears, pulses, swells
  if (t >= T.dot && t < T.bang + 0.05) {
    const u = clamp((t - T.dot) / (T.bang - T.dot)), pulse = 1 + 0.25 * Math.sin(t * (6 + 14 * u));
    glow(C[0], C[1], (30 + 220 * u * u) * pulse, 0.5 + 0.5 * u, [200, 220, 255]);
    glow(C[0], C[1], (10 + 40 * u) * pulse, 1, [255, 255, 255]);
    ctx.beginPath(); ctx.arc(C[0], C[1], 3 + 6 * u, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  }

  // the galaxy's glowing core
  const core = gl(t, T.bang + 0.4, 1.2) * (1 - gl(t, T.gather + 0.6, 1.5));
  if (core > 0) { glow(C[0], C[1], 260, 0.5 * core, [255, 200, 150]); glow(C[0], C[1], 90, 0.8 * core, [255, 245, 230]); }

  // 3b. the real desktop fades in under the particles once they have landed
  const imgA = gl(t, T.solid, 1.4);
  if (imgA > 0) {
    ctx.save(); ctx.globalAlpha = imgA; rr(ctx, FR[0], FR[1], FR[2] - FR[0], FR[3] - FR[1], 24); ctx.clip();
    ctx.drawImage(IMG['ui-desktop'], FR[0], FR[1], FR[2] - FR[0], FR[3] - FR[1]); ctx.restore();
    rr(ctx, FR[0], FR[1], FR[2] - FR[0], FR[3] - FR[1], 24); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,255,255,${0.14 * imgA})`; ctx.stroke();
  }

  // 2 + 3. particles: blast, swirl, gather
  if (t >= T.bang) {
    const fadeOut = 1 - gl(t, T.solid + 0.6, 1.2);
    if (fadeOut > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const hot = Math.exp(-(t - T.bang) * 1.6);                         // white-hot right after the bang
      for (const p of P) {
        const [x, y, v] = posAt(p, t);
        const c = v > 0 ? p.bang.map((b, k) => lerp(b, p.col[k], v)) : p.bang.map(b => lerp(b, 255, hot));
        const tw = 0.75 + 0.25 * Math.sin(t * 5 + p.tw);
        const a = (p.star ? 1 : (v > 0.98 ? 0.75 : 0.9)) * tw * fadeOut * clamp((t - T.bang) / 0.08);
        const s = p.size * (1 + 1.5 * hot) * (p.star && v > 0.9 ? 1.2 : 1);
        ctx.fillStyle = rgba(c, a); ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
      ctx.restore();
    }
    // flash + shockwave
    const f = (t - T.bang) / 0.9;
    if (f < 1) {
      glow(C[0], C[1], 200 + 1600 * ease(f), 0.9 * (1 - f), [255, 240, 220]);
      ctx.beginPath(); ctx.arc(C[0], C[1], 30 + 1500 * ease(f), 0, Math.PI * 2); ctx.lineWidth = 50 * (1 - f); ctx.strokeStyle = `rgba(200,220,255,${0.7 * (1 - f)})`; ctx.stroke();
      if (f < 0.25) { ctx.fillStyle = `rgba(255,255,255,${(1 - f / 0.25) ** 2})`; ctx.fillRect(0, 0, W, H); }
    }
  }

  // the star lands: the real NOVA star takes over from the star particles, with a glow
  const sl = gl(t, T.solid + 0.3, 1.0);
  if (sl > 0) {
    glow(C[0], C[1], 330, 0.45 * sl * (1 - gl(t, T.end, 0.8)), [255, 190, 110]);
    glow(C[0], C[1], 260, 0.35 * sl * (1 - gl(t, T.end, 0.8)), [90, 150, 255]);
    starImg(C[0], C[1], 230 * (1 + 0.03 * Math.sin(t * 2.5)), sl * (1 - gl(t, T.end, 0.6)));
  }

  // 4. the words
  headline(ctx, 'Every OS starts somewhere.', 540, 430, 66, T.line1, T.end - 0.2, t);
  headline(ctx, 'Ours started with a star.', 540, 1370, 74, T.line2, T.end - 0.2, t, { color: 'rgb(255,174,90)' });

  // 5. end card
  if (t >= T.end) {
    const e = gl(t, T.end, 0.9);
    ctx.fillStyle = `rgba(0,0,0,${0.9 * e})`; ctx.fillRect(0, 0, W, H);
    glow(540, 820, 650, 0.35 * e, [245, 142, 30]); glow(540, 860, 650, 0.35 * e, [40, 120, 255]);
    starImg(540, 760, lerp(130, 190, e), e);
    if (t >= T.end + 0.25) { const g = gl(t, T.end + 0.25); text(ctx, 'NOVA OS', 556, 940 + 30 * (1 - g), { size: 92, w: 600, track: 0.36, align: 'center', base: 'middle', color: '#fff', a: g, v: true }); }
    headline(ctx, 'Coming soon.', 540, 1080, 84, T.soon, 999, t, { color: 'rgb(255,174,90)' });
    if (t >= T.soon + 0.5) text(ctx, 'byeno.org', 540, 1190, { size: 46, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.75)', a: gl(t, T.soon + 0.5) });
  }
}

const LINES = [['Every OS starts somewhere.', T.line1], ['Ours started with a star.', T.line2], ['Coming soon.', T.soon]];
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
const isFast = t => t >= T.bang - 0.05 && t < T.bang + 1.2;
const ready = (async () => {
  await Promise.all(['400', '500', '600', '700', '900'].map(w => document.fonts.load(`${w} 20px Geist`)));
  await Promise.all(['500', '600', '700', '800'].map(w => document.fonts.load(`${w} 20px GeistV`)));
  await Promise.all([load('star', 'assets/nova-star.png'), load('ui-desktop', 'assets/ui-desktop.png')]);
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, LINES, W, H, CUTS: [], STEPS: [] };
})();
