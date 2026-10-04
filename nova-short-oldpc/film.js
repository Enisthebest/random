// NOVA OS — "My PC is old. Will NOVA fix it?" Short with a voice-over, 1080x1920. Pure function of time: seek(t) draws frame t.
// An old laptop + a memory bar: junk fills it, NOVA drops the junk, boots with almost nothing, compresses memory,
// lets unused apps sleep, and the power goes back to you. Illustrative, no benchmark numbers.
(() => {
const W = 1080, H = 1920, G = 0.8;
const T = {
  vo: [0.5, 3.5, 5.7, 7.0, 10.6, 12.7, 14.8, 16.7, 19.0, 21.0, 23.2],
  junk: [7.0, 7.95, 8.55, 9.0, 9.7],     // when each junk word is said
  drop: 10.6, fall: 11.15, boot: 12.75, squeeze: 15.2, sleep: 16.9, wake: 17.8, power: 19.0, hero: 21.0, end: 23.0,
};
const DUR = 26.6;

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

// ---------- 1. the comment ----------
function comment(t) {
  const a = gl(t, 0.15, 0.5) * (1 - gl(t, 3.2, 0.4)); if (a <= 0) return;
  const y = 760 + 30 * (1 - gl(t, 0.15, 0.5)) - 40 * gl(t, 3.2, 0.4), x = 90, w = 900, h = 300;
  ctx.save(); ctx.globalAlpha = a;
  rr(ctx, x, y, w, h, 40); ctx.fillStyle = '#f4f4f6'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 90, y + h - 2); ctx.lineTo(x + 70, y + h + 40); ctx.lineTo(x + 140, y + h - 2); ctx.fill();   // speech tail
  ctx.beginPath(); ctx.arc(x + 80, y + 82, 40, 0, Math.PI * 2); ctx.fillStyle = '#d4d4da'; ctx.fill();
  ctx.drawImage(iconImg('user', '#8a8a94'), x + 58, y + 60, 44, 44);
  text(ctx, 'Replying to a comment', x + 140, y + 92, { size: 34, w: 600, color: '#6e6e77' });
  text(ctx, 'my pc is old is nova', x + 50, y + 186, { size: 58, w: 700, color: '#111114', v: true });
  text(ctx, 'gonna fix it?', x + 50, y + 254, { size: 58, w: 700, color: '#111114', v: true });
  ctx.restore();
}

// ---------- 2. the old laptop ----------
const LP = { x: 160, y: 560, w: 760, h: 475 };   // the screen
function laptop(t, a) {
  if (a <= 0) return;
  const { x, y, w, h } = LP, b = 22;
  ctx.save(); ctx.globalAlpha = a;
  rr(ctx, x - b, y - b, w + 2 * b, h + 2 * b + 10, 30); ctx.fillStyle = '#1d1d22'; ctx.fill();               // lid
  ctx.beginPath(); ctx.moveTo(x - b - 70, y + h + 34); ctx.lineTo(x + w + b + 70, y + h + 34); ctx.lineTo(x + w + b + 40, y + h + 84); ctx.lineTo(x - b - 40, y + h + 84); ctx.closePath();
  ctx.fillStyle = '#2a2a31'; ctx.fill();                                                                       // base
  rr(ctx, x + w / 2 - 90, y + h + 40, 180, 10, 5); ctx.fillStyle = '#3a3a42'; ctx.fill();                      // notch
  // a couple of scuffs and a sticker: it's an old one
  ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(x + w - 40, y - 14, 60, 3); ctx.fillRect(x - 10, y + h + 18, 40, 3);
  // the screen
  ctx.save(); rr(ctx, x, y, w, h, 8); ctx.clip();
  const novaOn = gl(t, T.boot + 0.9, 0.5), boot = t > T.boot && t < T.boot + 1.4;
  if (t < T.drop + 0.6) oldScreen(t);
  if (t >= T.drop + 0.4) {
    // first NOVA's desktop (after the drop), then a real reboot into it
    const fresh = t < T.boot ? gl(t, T.drop + 0.4, 0.5) : novaOn;
    ctx.fillStyle = '#000'; ctx.fillRect(x, y, w, h);
    if (boot) starImg(x + w / 2, y + h / 2, 70, gl(t, T.boot + 0.25, 0.3) * (1 - gl(t, T.boot + 0.9, 0.3)));
    if (fresh > 0 && IMG.desk) { ctx.globalAlpha = a * fresh; ctx.drawImage(IMG.desk, x, y, w, h); ctx.globalAlpha = a; }
  }
  ctx.restore();
  ctx.restore();
}
function oldScreen(t) {   // a tired, cluttered desktop with a busy spinner
  const { x, y, w, h } = LP;
  const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#3d5a80'); g.addColorStop(1, '#22344d'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  for (let i = 0; i < 28; i++) { const ix = x + 18 + (i % 4) * 54, iy = y + 16 + Math.floor(i / 4) * 64; ctx.fillStyle = `hsl(${hash(i) * 360},40%,62%)`; rr(ctx, ix, iy, 34, 34, 6); ctx.fill(); }
  const n = T.junk.filter(j => t > j).length - 1;
  for (let i = 0; i <= n; i++) {   // popups piling up in the corner
    rr(ctx, x + w - 290, y + h - 90 - i * 70, 270, 60, 8); ctx.fillStyle = '#f0f0f0'; ctx.fill();
    ctx.fillStyle = '#c8c8cc'; ctx.fillRect(x + w - 274, y + h - 76 - i * 70, 150, 10); ctx.fillRect(x + w - 274, y + h - 58 - i * 70, 200, 8);
  }
  rr(ctx, x, y + h - 34, w, 34, 0); ctx.fillStyle = '#1b2433'; ctx.fill();
  // spinner
  const cx = x + w / 2 + 60, cy = y + h / 2 - 20;
  for (let k = 0; k < 10; k++) { const ang = k / 10 * Math.PI * 2 + t * 5; ctx.fillStyle = `rgba(255,255,255,${0.15 + 0.85 * ((k + Math.floor(t * 8)) % 10) / 10})`; ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * 30, cy + Math.sin(ang) * 30, 6, 0, Math.PI * 2); ctx.fill(); }
  if (t > 4.2) text(ctx, 'Not responding…', cx, cy + 70, { size: 26, w: 600, align: 'center', color: 'rgba(255,255,255,.85)', a: gl(t, 4.2, 0.4) });
}

// ---------- 3. the memory bar ----------
const BAR = { x: 70, y: 1260, w: 940, h: 120 };
const JUNK = [
  { name: 'Background apps', w: 236, col: [162, 107, 255] }, { name: 'Trackers', w: 150, col: [255, 92, 92] },
  { name: 'Ads', w: 118, col: [245, 146, 30] }, { name: 'Updaters', w: 160, col: [120, 140, 170] }, { name: 'Sync', w: 120, col: [18, 184, 240] },
];
const OS0 = 50, YOU0 = 66;   // the system's own share and "your stuff" before (tiny)
function memBar(t, a) {
  if (a <= 0) return;
  const { x, y, w, h } = BAR;
  ctx.save(); ctx.globalAlpha = a;
  text(ctx, 'Memory', x, y - 34, { size: 36, w: 700, color: '#f2f2f4', v: true });
  rr(ctx, x, y, w, h, 24); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.stroke();
  ctx.save(); rr(ctx, x, y, w, h, 24); ctx.clip();
  // NOVA (or the old system) + your stuff: compressed later (zram)
  const sq = gl(t, T.squeeze, 0.9), nova = t > T.drop;
  const osW = nova ? lerp(lerp(OS0, 120, 0), 120 * 0.62, sq) : OS0, youW = nova ? lerp(160, 160 * 0.62, sq) : YOU0;
  const youGrow = nova ? gl(t, T.fall + 0.6, 0.8) : 0;
  let cx = x;
  block(cx, y, osW, h, nova ? [59, 139, 255] : [90, 90, 98], nova ? 'NOVA' : 'System', 1, sq); cx += osW + 4;
  const yW = lerp(YOU0, youW, youGrow);
  block(cx, y, yW, h, [242, 242, 244], 'You', 1, sq, true); cx += yW + 4;
  // junk: each block slides in as it's named, and drops off the bar on "NOVA doesn't run any of that"
  JUNK.forEach((j, i) => {
    const e = gl(t, T.junk[i] - 0.05, 0.45), f = clamp((t - T.fall - i * 0.09) / 0.6);
    if (e > 0 && f < 1) {
      ctx.save(); ctx.globalAlpha = a * e * (1 - f);
      block(cx, y + 600 * f * f, j.w * e, h, j.col, j.name, e, 0);
      ctx.restore();
    }
    cx += j.w * (1 - ease(clamp((t - T.fall - i * 0.09) / 0.7))) + 4 * (1 - f);
  });
  ctx.restore();
  // free space
  const freeX = x + osW + yW + 8, freeA = gl(t, T.fall + 0.5, 0.6);
  if (freeA > 0) {
    ctx.save(); ctx.globalAlpha = a * freeA;
    const pw = gl(t, T.power, 0.8);
    rr(ctx, freeX, y, x + w - freeX, h, 18); ctx.fillStyle = `rgba(52,199,89,${0.10 + 0.12 * pw})`; ctx.fill();
    ctx.setLineDash([10, 8]); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(95,220,134,.7)'; ctx.stroke(); ctx.setLineDash([]);
    text(ctx, 'Free for you', (freeX + x + w) / 2, y + h / 2 + 2, { size: 44 + 6 * pw, w: 700, align: 'center', base: 'middle', color: '#5fdc86', v: true });
    ctx.restore();
  }
  // status on the right of the label
  const full = t < T.fall ? clamp((t - T.junk[0]) / 3) : 0;
  if (full > 0) text(ctx, 'Almost full', x + w, y - 34, { size: 32, w: 700, align: 'right', color: '#ff5c5c', a: full * (1 - gl(t, T.fall, 0.3)), v: true });
  if (t > T.fall + 0.3) text(ctx, 'Room to breathe', x + w, y - 34, { size: 32, w: 700, align: 'right', color: '#5fdc86', a: gl(t, T.fall + 0.3, 0.5), v: true });
  if (sq > 0) text(ctx, 'Compressed in memory (zram)', x + 12, y + h + 50, { size: 28, w: 500, color: 'rgba(255,255,255,.6)', a: sq * (1 - gl(t, T.sleep, 0.4)), v: true });
  ctx.restore();
}
function block(x, y, w, h, col, name, a, sq, dark) {
  if (w < 2) return;
  rr(ctx, x, y, w, h, 18); ctx.fillStyle = rgba(col, 0.9); ctx.fill();
  if (sq > 0) { for (let k = 1; k < 4; k++) { ctx.fillStyle = `rgba(0,0,0,${0.12 * sq})`; ctx.fillRect(x + w * k / 4 - 1, y + 14, 2, h - 28); } }   // squeeze marks
  ctx.save(); ctx.beginPath(); ctx.rect(x + 4, y, w - 8, h); ctx.clip();
  let size = w > 200 ? 30 : w > 110 ? 26 : 22;
  const room = (w < 90 ? h : w) - 24; while (size > 16 && measure(name, size, 700) > room) size -= 1;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); if (w < 90) ctx.rotate(-Math.PI / 2);
  text(ctx, name, 0, 2, { size, w: 700, align: 'center', base: 'middle', color: dark ? '#111114' : '#fff', v: true });
  ctx.restore(); ctx.restore();
}

// ---------- 4. the dock: unused apps sleep, the one you open wakes up ----------
const DOCK = ['folder', 'shield', 'monitor', 'images', 'ledger', 'settings'];
function dock(t, a) {
  if (a <= 0) return;
  const n = DOCK.length, s = 104, gap = 34, w = n * s + (n - 1) * gap + 48, x0 = W / 2 - w / 2, y = 1500;
  ctx.save(); ctx.globalAlpha = a;
  rr(ctx, x0, y, w, s + 40, 34); ctx.fillStyle = 'rgba(16,16,19,.92)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.stroke();
  DOCK.forEach((k, i) => {
    const used = i === 2, sl = gl(t, T.sleep + i * 0.08, 0.5) * (used ? 0 : 1), wk = used ? gl(t, T.wake, 0.5) : 0;
    const ix = x0 + 24 + i * (s + gap), iy = y + 20 - 14 * wk;
    ctx.globalAlpha = a * (1 - 0.6 * sl);
    if (IMG[k]) ctx.drawImage(IMG[k], ix, iy, s, s);
    ctx.globalAlpha = a;
    if (sl > 0) text(ctx, 'z', ix + s - 6, iy + 14 - 10 * Math.sin((t - T.sleep) * 2 + i), { size: 40, w: 800, align: 'center', color: 'rgba(170,190,255,.9)', a: sl, v: true });
    if (wk > 0) { ctx.beginPath(); ctx.arc(ix + s / 2, y + s + 30, 6, 0, Math.PI * 2); ctx.fillStyle = `rgba(59,139,255,${wk})`; ctx.fill(); }
  });
  ctx.restore();
}

// ---------- captions (the same words as the voice) ----------
const CAP = [
  [T.vo[1], 1.9, ['Honestly?', "Your PC isn't slow."]],
  [T.vo[2], 1.1, ["It's carrying junk."], null, true],
  [T.vo[4], 1.75, ["NOVA doesn't run", 'any of that.'], [95, 220, 134]],
  [T.vo[5], 1.85, ['It starts with almost', 'nothing running.']],
  [T.vo[6], 1.7, ['Squeezes more out', 'of your memory.']],
  [T.vo[7], 2.05, ['Only wakes up what', 'you actually use.']],
  [T.vo[8], 1.75, ['All that power', 'goes back to you.'], [95, 220, 134]],
  [T.vo[9], 1.8, ['Give your old PC', 'a second life.'], [255, 174, 90]],
];
function captions(t) {
  for (const [t0, d, lines, col] of CAP) {
    if (t < t0 - 0.05 || t > t0 + d + 0.5) continue;
    lines.forEach((s, i) => headline(ctx, s, W / 2, (lines.length > 1 ? 300 : 350) + i * 104, 86, t0 + i * 0.22, t0 + d, t, { color: i === 1 && col ? rgba(col) : '#fff' }));
  }
  // the junk words, one by one
  const words = ['Background apps.', 'Trackers.', 'Ads.', 'Updaters.', 'Sync.'];
  words.forEach((wd, i) => { const t0 = T.junk[i], t1 = i < 4 ? T.junk[i + 1] - 0.05 : T.vo[3] + 3.3; headline(ctx, wd, W / 2, 350, 96, t0, t1 - 0.15, t, { color: rgba(JUNK[i].col.map(c => lerp(c, 255, 0.25))) }); });
}

// ---------- the frame ----------
function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const endE = gl(t, T.end, 0.8);
  // background light: dusty warm before, NOVA blue after
  const bg = (col, a, cy = 900) => { if (a <= 0) return; const g = ctx.createRadialGradient(W / 2, cy, 0, W / 2, cy, 950); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
  const after = gl(t, T.drop, 0.8);
  bg([120, 90, 60], 0.18 * (1 - after)); bg([40, 110, 255], 0.2 * after * (1 - endE)); bg([245, 142, 30], 0.12 * gl(t, T.power, 1) * (1 - endE), 1300);
  // dust specks drifting before NOVA
  if (after < 1) for (let i = 0; i < 50; i++) { const px = (hash(i) * W + t * 12 * (hash(i + 3) - 0.5)) % W, py = (hash(i + 7) * H + t * 20) % H; ctx.fillStyle = `rgba(255,240,220,${0.15 * (1 - after)})`; ctx.fillRect(px, py, 3, 3); }

  comment(t);
  const lapA = gl(t, 3.3, 0.6) * (1 - endE);
  laptop(t, lapA);
  memBar(t, gl(t, 6.4, 0.6) * (1 - gl(t, T.hero - 0.2, 0.5)));
  dock(t, gl(t, T.sleep - 0.4, 0.5) * (1 - gl(t, T.hero - 0.2, 0.5)));
  // second life: a glow and a little sparkle around the laptop
  const hero = gl(t, T.hero, 0.8) * (1 - endE);
  if (hero > 0) { starImg(LP.x + LP.w + 10, LP.y - 20, 70 * hero, hero); starImg(LP.x - 10, LP.y + LP.h + 40, 44 * hero, hero * 0.8); }
  captions(t);

  if (endE > 0) {
    starImg(W / 2, 760, lerp(120, 170, endE), endE);
    if (t >= T.end + 0.2) { const g2 = gl(t, T.end + 0.2); text(ctx, 'NOVA OS', W / 2 + 14, 940 + 30 * (1 - g2), { size: 92, w: 600, track: 0.36, align: 'center', base: 'middle', color: '#fff', a: g2, v: true }); }
    headline(ctx, 'Coming soon.', W / 2, 1080, 84, T.vo[10] + 0.75, 999, t, { color: 'rgb(255,174,90)' });
    if (t > T.vo[10] + 1.3) text(ctx, 'byeno.org', W / 2, 1190, { size: 46, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.75)', a: gl(t, T.vo[10] + 1.3), v: true });
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
const isFast = t => t > T.fall && t < T.fall + 1.2;
const ready = (async () => {
  await Promise.all(['400', '500', '600', '700', '900'].map(w => document.fonts.load(`${w} 20px Geist`)));
  await Promise.all(['500', '600', '700', '800'].map(w => document.fonts.load(`${w} 20px GeistV`)));
  await Promise.all([load('star', 'assets/nova-star.png'), load('desk', 'assets/ui-desktop.png'),
    load('folder', 'assets/folder.webp'), load('shield', 'assets/shield.webp'), load('monitor', 'assets/monitor.png'),
    load('images', 'assets/images.png'), load('ledger', 'assets/ledger.png'), load('settings', 'assets/settings.webp')]);
  await Promise.all([iconImg('user', '#8a8a94')].map(im => im.decode().catch(() => {})));
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, LINES, W, H, CUTS: T.junk, STEPS: [T.drop, T.boot] };
})();
