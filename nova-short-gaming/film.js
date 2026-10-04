// NOVA OS — "Gaming mode" Short with a voice-over, 1080x1920. Pure function of time: seek(t) draws frame t.
// Story: a game drowning in popups and lag → Super + G → everything freezes and is swept away → frozen / held / still on
// → "Every frame is yours." → Gaming mode. Only in NOVA. Voice-over lines (assets/vo*.wav) are placed at T.vo.
(() => {
const W = 1080, H = 1920, G = 0.8;
const T = {
  vo: [0.4, 1.9, 3.9, 7.4, 9.6, 11.6, 13.4, 15.2, 17.0, 18.8, 21.2],   // voice-over line starts
  chaos: 3.9, keys: 7.9, superK: 8.32, gK: 8.5, freeze: 8.6, drop: 9.4,
  card: 9.45, cardOut: 11.3, rows: 11.5, rowsOut: 16.7, fps: 16.9, end: 18.6, soon: 21.2,
};
const DUR = 24.4;

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
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

// ---------- canvas ----------
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const IMG = {};
const load = (k, src) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.onerror = () => r(); i.src = src; });
function rr(g, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.roundRect(x, y, w, h, r); }
function text(g, s, x, y, o) {
  const a = o.a == null ? 1 : o.a; if (a <= 0) return;
  g.save();
  g.font = `${o.w || 500} ${o.size}px ${o.mono ? 'GeistMono' : o.v ? 'GeistV' : 'Geist'}`;
  g.fillStyle = o.color || '#fff'; g.globalAlpha *= a;
  g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic';
  g.letterSpacing = (o.track || 0) * o.size + 'px';
  g.fillText(s, x, y); g.restore();
}
function measure(s, size, w, track = 0) { ctx.save(); ctx.font = `${w} ${size}px GeistV`; ctx.letterSpacing = track * size + 'px'; const m = ctx.measureText(s).width; ctx.restore(); return m; }
function headline(g, s, cx, cy, size, tin, tout, t, o = {}) {
  if (t < tin || t > tout + 0.5) return;
  const w = o.w || 800, track = o.track == null ? -0.035 : o.track, gap = size * 0.24;
  const words = s.split(' '), ws = words.map(x => measure(x, size, w, track));
  const total = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  const outE = gl(t, tout, 0.4);
  let x = cx - total / 2;
  words.forEach((word, i) => {
    const e = ease((t - tin - i * (o.step || 0.07)) / 0.5);
    text(g, word, x, cy + 22 * (1 - e) - 12 * outE, { size, w, track, color: o.color || '#fff', a: e * (1 - outE), base: 'middle', v: true });
    x += ws[i] + gap;
  });
}
const icon = {};   // white icons by name, plus coloured copies made on demand
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

// ---------- the game ("Starfall", made up) ----------
const MON = [40, 640, 1040, 1265];   // the monitor on the canvas (1000 x 625, the 1440x900 shape)
function gameTime(t) {   // the game stutters while the PC is busy, and runs smoothly in Gaming mode
  if (t < T.chaos || t >= T.drop) return t;
  const lag = clamp((t - T.chaos) / 2.5);
  const step = lerp(1 / 60, 1 / 9, lag);
  let g = Math.floor(t / step) * step;
  if (t > T.freeze) g = T.freeze;                                  // frozen while Super G is pressed
  else if (hash(Math.floor(t * 3)) < 0.35 * lag) g = Math.floor(t * 3) / 3;   // hitches
  return g;
}
function drawGame(t, a) {
  const g = gameTime(t), [x0, y0, x1, y1] = MON, w = x1 - x0, h = y1 - y0;
  ctx.save(); ctx.globalAlpha = a; rr(ctx, x0, y0, w, h, 28); ctx.clip();
  const z = 1.04 + 0.05 * Math.sin(g * 0.15), im = IMG.game;
  const sw = 1440 / z, sh = 900 / z, sx = (1440 - sw) / 2 + 30 * Math.sin(g * 0.2), sy = (900 - sh) / 2;
  ctx.drawImage(im, sx, sy, sw, sh, x0, y0, w, h);
  // twinkling stars
  for (let i = 0; i < 40; i++) {
    const sx2 = x0 + hash(i) * w, sy2 = y0 + hash(i + 50) * h * 0.45, tw = 0.4 + 0.6 * Math.abs(Math.sin(g * (1 + hash(i + 9) * 3) + i));
    ctx.fillStyle = `rgba(230,230,255,${0.8 * tw})`; ctx.fillRect(sx2, sy2, 3, 3);
  }
  // the player's ship weaving over the mountains, firing at the planet
  const px = x0 + w * (0.32 + 0.12 * Math.sin(g * 1.3)), py = y0 + h * (0.72 + 0.04 * Math.sin(g * 2.1));
  for (let k = 0; k < 6; k++) {                                     // lasers
    const lt = (g * 2.2 + k / 6) % 1, lx = lerp(px, x0 + w * 0.73, lt), ly = lerp(py - 20, y0 + h * 0.32, lt);
    ctx.strokeStyle = `rgba(120,230,255,${0.9 * (1 - lt)})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 26, ly - 16); ctx.stroke();
  }
  ctx.save(); ctx.translate(px, py); ctx.rotate(-0.55 + 0.1 * Math.sin(g * 1.3));
  ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(-22, -18); ctx.lineTo(-12, 0); ctx.lineTo(-22, 18); ctx.closePath();
  ctx.fillStyle = '#f2f2f4'; ctx.fill();
  ctx.fillStyle = `rgba(120,230,255,${0.7 + 0.3 * Math.sin(g * 40)})`; ctx.beginPath(); ctx.moveTo(-14, -6); ctx.lineTo(-34 - 8 * Math.sin(g * 30), 0); ctx.lineTo(-14, 6); ctx.fill();
  ctx.restore();
  ctx.restore();
  rr(ctx, x0 + 1, y0 + 1, w - 2, h - 2, 28); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,255,255,${0.14 * a})`; ctx.stroke();
}

// ---------- the clutter ----------
const POPS = [
  { t: 4.0, x: 70, y: 690, ic: 'refresh-cw', col: [59, 139, 255], title: 'Update ready', line: 'Restart now to install 14 updates' },
  { t: 4.6, x: 380, y: 800, ic: 'message-circle', col: [52, 199, 89], title: 'Sam', line: 'you on??' },
  { t: 4.78, x: 330, y: 905, ic: 'message-circle', col: [52, 199, 89], title: 'Sam', line: 'hello???' },
  { t: 4.96, x: 120, y: 1010, ic: 'message-circle', col: [52, 199, 89], title: 'Group chat', line: '12 new messages' },
  { t: 5.4, x: 300, y: 745, ic: 'cloud-upload', col: [162, 107, 255], title: 'Backup running', line: 'Uploading 2,140 files · 34%' },
  { t: 6.0, x: 50, y: 860, ic: 'search', col: [245, 146, 30], title: 'Indexing files', line: '48,210 files left' },
  { t: 6.25, x: 410, y: 975, ic: 'download', col: [59, 139, 255], title: 'Launcher updater', line: 'Downloading 3.2 GB…' },
  { t: 6.5, x: 180, y: 1100, ic: 'monitor', col: [255, 92, 92], title: 'Screen dims soon', line: 'No activity for 5 minutes' },
];
const PW = 620, PH = 112;
function toast(p, x, y, a, frost) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  rr(ctx, x, y, PW, PH, 28); ctx.fillStyle = 'rgba(16,16,20,.95)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.stroke();
  const col = frost > 0 ? p.col.map(c => lerp(c, 170, frost)) : p.col;
  ctx.beginPath(); ctx.arc(x + 56, y + PH / 2, 32, 0, Math.PI * 2); ctx.fillStyle = rgba(col, 0.18); ctx.fill();
  const im = iconImg(p.ic, rgba(p.col.map(c => lerp(c, 255, 0.35)))); ctx.globalAlpha = a * (1 - 0.45 * frost); ctx.drawImage(im, x + 56 - 18, y + PH / 2 - 18, 36, 36); ctx.globalAlpha = a;
  text(ctx, p.title, x + 108, y + 46, { size: 30, w: 600, color: '#f2f2f4' });
  text(ctx, p.line, x + 108, y + 84, { size: 24, w: 400, color: '#a1a1aa' });
  text(ctx, 'now', x + PW - 26, y + 40, { size: 20, w: 500, align: 'right', color: '#8d8d96' });
  if (frost > 0) {   // frozen: an icy wash over the toast
    rr(ctx, x, y, PW, PH, 28); ctx.fillStyle = `rgba(170,210,255,${0.22 * frost})`; ctx.fill();
  }
  ctx.restore();
}
function drawClutter(t) {
  if (t < T.chaos || t > T.drop + 1.2) return;
  const frost = clamp((t - T.freeze) / 0.35);
  POPS.forEach((p, i) => {
    const e = gl(t, p.t, 0.35);
    const go = clamp((t - T.drop - i * 0.05) / 0.5), ge = go * go;   // swept down and away on the drop
    const x = p.x + 10 * (1 - e) + (i % 2 ? 120 : -120) * ge, y = p.y + 20 * (1 - e) + 900 * ge;
    toast(p, x, y, e * (1 - go), frost);
  });
  // the "restart required" dialog right in the middle of the game
  const d = gl(t, 6.85, 0.35), go = clamp((t - T.drop - 0.25) / 0.5);
  if (d > 0 && go < 1) {
    ctx.save(); ctx.globalAlpha = d * (1 - go);
    const x = 190, y = 880 + 20 * (1 - d) + 900 * go * go, w = 700, h = 250;
    rr(ctx, x, y, w, h, 30); ctx.fillStyle = 'rgba(22,22,27,.97)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.stroke();
    text(ctx, 'Restart required', x + 40, y + 70, { size: 36, w: 700, color: '#f2f2f4' });
    text(ctx, 'Your PC will restart in 4:59 to finish updating.', x + 40, y + 116, { size: 24, w: 400, color: '#a1a1aa' });
    rr(ctx, x + 40, y + 160, 240, 56, 16); ctx.fillStyle = '#f2f2f4'; ctx.fill(); text(ctx, 'Restart now', x + 160, y + 189, { size: 24, w: 600, align: 'center', base: 'middle', color: '#0b0b0e' });
    rr(ctx, x + 296, y + 160, 200, 56, 16); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill(); text(ctx, 'Later', x + 396, y + 189, { size: 24, w: 600, align: 'center', base: 'middle', color: '#f2f2f4' });
    if (frost > 0) { rr(ctx, x, y, w, h, 30); ctx.fillStyle = `rgba(170,210,255,${0.2 * frost})`; ctx.fill(); }
    ctx.restore();
  }
}

// ---------- FPS meter ----------
function fpsAt(t) {
  if (t < T.chaos) return 144 - (hash(Math.floor(t * 8)) < 0.5 ? 1 : 0);
  if (t < T.drop) { const lag = clamp((t - T.chaos) / 2.5); return Math.round(lerp(144, 31, lag) + (hash(Math.floor(t * 8) + 3) - 0.5) * 18 * lag); }
  return Math.round(lerp(31, 144, gl(t, T.drop + 0.1, 1.2)));
}
const fpsCol = f => f > 110 ? [95, 220, 134] : f > 60 ? [255, 174, 90] : [255, 92, 92];
function drawFps(t, cx, cy, size, a) {
  if (a <= 0) return;
  const f = fpsAt(t), col = fpsCol(f);
  const label = String(f), wn = measure(label, size, 700) * 0.92;
  text(ctx, label, cx - 20, cy, { size, w: 600, mono: true, align: 'right', base: 'middle', color: rgba(col), a });
  text(ctx, 'FPS', cx, cy + size * 0.18, { size: size * 0.38, w: 700, base: 'middle', color: rgba(col, 0.85), a, v: true, track: 0.05 });
}
function hud(t, a) {   // the small overlay pill inside the monitor once Gaming mode is on
  if (a <= 0) return;
  const f = fpsAt(t), x = MON[2] - 24, y = MON[1] + 24;
  ctx.save(); ctx.globalAlpha = a;
  rr(ctx, x - 230, y, 230, 52, 26); ctx.fillStyle = 'rgba(10,10,14,.78)'; ctx.fill();
  ctx.drawImage(iconImg('gamepad-2', '#6aa8ff'), x - 212, y + 14, 24, 24);
  text(ctx, String(f), x - 120, y + 27, { size: 26, w: 600, mono: true, align: 'right', base: 'middle', color: '#f2f2f4' });
  text(ctx, 'FPS', x - 110, y + 27, { size: 20, w: 700, base: 'middle', color: '#a1a1aa', v: true });
  ctx.restore();
}

// ---------- keycaps ----------
function keycap(label, x, y, a, press, w = 200) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const dy = 10 * press;
  rr(ctx, x - w / 2, y - 70 + 16, w, 140, 30); ctx.fillStyle = 'rgba(120,120,130,.5)'; ctx.fill();
  rr(ctx, x - w / 2, y - 70 + dy, w, 140, 30); ctx.fillStyle = '#f2f2f4'; ctx.fill();
  text(ctx, label, x, y + dy + 2, { size: label.length > 1 ? 52 : 72, w: 700, align: 'center', base: 'middle', color: '#16161a', v: true });
  ctx.restore();
}

// ---------- captions (the same words the voice says) ----------
const CAP = [
  [T.vo[0], 1.35, ['You just want to play.']],
  [T.vo[1], 1.75, ['But your PC', 'has other plans.']],
  [T.vo[2], 0.6, ['Updates.']], [T.vo[2] + 0.68, 0.62, ['Messages.']], [T.vo[2] + 1.36, 0.6, ['Backups.']], [T.vo[2] + 2.0, 1.3, ['Apps you', 'forgot about.']],
  [T.vo[3], 1.2, ['Press Super G.']],
  [T.vo[4], 1.75, ['Now everything else', 'steps aside.']],
  [T.vo[5], 1.7, ['Background apps?', 'Frozen.'], [140, 200, 255]],
  [T.vo[6], 1.7, ['Notifications?', 'Held.'], [140, 200, 255]],
  [T.vo[7], 1.45, ['Shield?', 'Still on.'], [95, 220, 134]],
  [T.vo[8], 1.5, ['Every frame', 'is yours.'], [255, 174, 90]],
];
function captions(t) {
  for (const [t0, d, lines, col] of CAP) {
    if (t < t0 - 0.05 || t > t0 + d + 0.5) continue;
    lines.forEach((s, i) => headline(ctx, s, W / 2, (lines.length > 1 ? 330 : 380) + i * 110, 92, t0 + i * 0.25, t0 + d, t,
      { color: i === 1 && col ? rgba(col) : '#fff' }));
  }
}

// ---------- rows: what Gaming mode did ----------
const ROWS = [
  { t: T.vo[5] + 0.85, ic: 'snowflake', col: [140, 200, 255], title: 'Background apps', val: '14 frozen' },
  { t: T.vo[6] + 0.8, ic: 'bell-off', col: [140, 200, 255], title: 'Notifications', val: 'Held for later' },
  { t: T.vo[7] + 0.7, ic: 'nova-shield', col: [95, 220, 134], title: 'Shield', val: 'Still on' },
];
function drawRows(t) {
  const out = gl(t, T.rowsOut, 0.4);
  ROWS.forEach((r, i) => {
    const e = gl(t, r.t, 0.5); if (e <= 0 || out >= 1) return;
    const x = 60, y = 1350 + i * 130 + 24 * (1 - e), w = 960, h = 110;
    ctx.save(); ctx.globalAlpha = e * (1 - out);
    rr(ctx, x, y, w, h, 28); ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.stroke();
    rr(ctx, x + 22, y + 22, 66, 66, 20); ctx.fillStyle = rgba(r.col, 0.16); ctx.fill();
    ctx.drawImage(iconImg(r.ic, rgba(r.col)), x + 37, y + 37, 36, 36);
    text(ctx, r.title, x + 112, y + h / 2, { size: 36, w: 600, base: 'middle', color: '#f2f2f4' });
    text(ctx, r.val, x + w - 100, y + h / 2, { size: 32, w: 600, align: 'right', base: 'middle', color: rgba(r.col) });
    ctx.beginPath(); ctx.arc(x + w - 52, y + h / 2, 22, 0, Math.PI * 2); ctx.fillStyle = 'rgba(52,199,89,.2)'; ctx.fill();
    ctx.drawImage(iconImg('check', '#5fdc86'), x + w - 66, y + h / 2 - 14, 28, 28);
    ctx.restore();
  });
}

// ---------- the frame ----------
function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);

  // a soft colour wash behind the monitor: dirty red while it lags, NOVA blue once Gaming mode is on
  const lag = clamp((t - T.chaos) / 2.5) * (1 - gl(t, T.drop, 0.6)), calm = gl(t, T.drop, 0.8);
  const bg = (col, a) => { if (a <= 0) return; const g = ctx.createRadialGradient(W / 2, 950, 0, W / 2, 950, 900); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
  const endE = gl(t, T.end, 0.8);
  bg([150, 60, 200], 0.18 * (1 - endE)); bg([255, 60, 60], 0.16 * lag); bg([40, 110, 255], 0.2 * calm * (1 - endE));

  // the game, the clutter, the meter
  const gameA = gl(t, 0.05, 0.5) * (1 - endE);
  if (gameA > 0) {
    drawGame(t, gameA);
    // frozen moment: the whole picture goes cold for a beat
    const fz = clamp((t - T.freeze) / 0.3) * (1 - clamp((t - T.drop) / 0.25));
    if (fz > 0) { rr(ctx, MON[0], MON[1], MON[2] - MON[0], MON[3] - MON[1], 28); ctx.fillStyle = `rgba(150,190,255,${0.18 * fz})`; ctx.fill(); }
    if (t < T.end) {
      drawClutter(t);
      hud(t, gl(t, T.drop + 0.2, 0.4) * (1 - endE));
    }
  }
  // FPS under the monitor: shows the lag, hides for the keys, comes back big at the end
  const fpsA = gl(t, 0.6, 0.5) * (1 - gl(t, T.keys - 0.3, 0.3));
  drawFps(t, W / 2 + 70, 1460, 150, fpsA);
  const fpsB = gl(t, T.fps, 0.5) * (1 - endE);
  if (fpsB > 0) drawFps(t + 0, W / 2 + 70, 1520, 230, fpsB);

  // Super + G
  if (t > T.keys - 0.2 && t < T.drop + 0.9) {
    const a = gl(t, T.keys, 0.35) * (1 - gl(t, T.drop + 0.2, 0.4));
    const pS = t > T.superK ? 1 : 0, pG = Math.max(0, Math.sin(Math.PI * clamp((t - T.gK) / 0.5)));
    keycap('super', W / 2 - 175, 1500, a, pS * (t < T.drop ? 1 : 0), 280);
    keycap('G', W / 2 + 140, 1500, a, pG * 0 + (t > T.gK && t < T.drop ? 1 : 0), 180);
    text(ctx, '+', W / 2 + 2, 1500, { size: 64, w: 700, align: 'center', base: 'middle', color: 'rgba(255,255,255,.6)', a, v: true });
  }
  // the shockwave from the G key on the drop
  const sw = (t - T.drop) / 0.9;
  if (sw > 0 && sw < 1) {
    ctx.beginPath(); ctx.arc(W / 2 + 140, 1500, 60 + 1700 * ease(sw), 0, Math.PI * 2);
    ctx.lineWidth = 40 * (1 - sw); ctx.strokeStyle = `rgba(106,168,255,${0.55 * (1 - sw)})`; ctx.stroke();
  }

  // the real "Gaming mode on" card from the design kit appears at once (animations are off now, that's the point)
  if (t >= T.card && t < T.cardOut + 0.4 && IMG.card) {
    const a = 1 - clamp((t - T.cardOut) / 0.3);
    const b = [443, 208, 997, 692], bw = b[2] - b[0], bh = b[3] - b[1], k = 1.42;
    ctx.save(); ctx.globalAlpha = a;
    rr(ctx, W / 2 - bw * k / 2, 952 - bh * k / 2, bw * k, bh * k, 31); ctx.clip();
    ctx.drawImage(IMG.card, b[0], b[1], bw, bh, W / 2 - bw * k / 2, 952 - bh * k / 2, bw * k, bh * k);
    ctx.restore();
  }

  drawRows(t);
  captions(t);

  // end card
  if (endE > 0) {
    const tileY = 640 - 30 * (1 - endE);
    ctx.save(); ctx.globalAlpha = endE;
    rr(ctx, W / 2 - 100, tileY - 100, 200, 200, 56); ctx.fillStyle = '#3b8bff'; ctx.fill();
    ctx.drawImage(iconImg('gamepad-2', '#ffffff'), W / 2 - 60, tileY - 60, 120, 120);
    ctx.restore();
    headline(ctx, 'Gaming mode.', W / 2, 880, 108, T.vo[9], 999, t);
    headline(ctx, 'Only in NOVA.', W / 2, 1000, 108, T.vo[9] + 0.8, 999, t);
    if (t > T.soon - 0.2) {
      const s = gl(t, T.soon - 0.2, 0.7);
      starImg(W / 2, 1210, 90, s);
      text(ctx, 'NOVA OS', W / 2 + 12, 1320, { size: 52, w: 600, track: 0.36, align: 'center', base: 'middle', color: '#fff', a: s, v: true });
    }
    headline(ctx, 'Coming soon.', W / 2, 1430, 76, T.soon + 0.2, 999, t, { color: 'rgb(255,174,90)' });
    if (t > T.soon + 0.9) text(ctx, 'byeno.org', W / 2, 1530, { size: 44, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.75)', a: gl(t, T.soon + 0.9), v: true });
  }
  const fo = clamp((t - (DUR - 0.6)) / 0.6); if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
}

const LINES = CAP.map(c => [c[2].join(' '), c[0]]);
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
// lag frames must stay crisp (no motion blur hiding the stutter); the sweep on the drop gets extra blur
const isFast = t => t > T.drop && t < T.drop + 1.2;
const ready = (async () => {
  await Promise.all(['400', '500', '600', '700', '900'].map(w => document.fonts.load(`${w} 20px Geist`)));
  await Promise.all(['500', '600', '700', '800'].map(w => document.fonts.load(`${w} 20px GeistV`)));
  await Promise.all(['400', '500'].map(w => document.fonts.load(`${w} 20px GeistMono`)));
  await Promise.all([load('star', 'assets/nova-star.png'), load('game', 'assets/game-starfall.jpg'), load('card', 'assets/ui-gaming-on.png')]);
  const all = []; for (const n of Object.keys(ICONS)) for (const c of ['#ffffff', '#6aa8ff', '#5fdc86']) { const im = iconImg(n, c); all.push(im.decode().catch(() => {})); }
  POPS.forEach(p => all.push(iconImg(p.ic, rgba(p.col.map(c => lerp(c, 255, 0.35)))).decode().catch(() => {})));
  ROWS.forEach(rw => all.push(iconImg(rw.ic, rgba(rw.col)).decode().catch(() => {})));
  await Promise.all(all);
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, LINES, W, H, CUTS: POPS.map(p => p.t), STEPS: [T.drop] };
})();
