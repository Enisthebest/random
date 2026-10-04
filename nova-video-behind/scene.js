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
  const tg = gl(t, T.vo[12] + 0.2, 0.5) * a, rc = gl(t, T.vo[12] + 2.2, 0.5) * a, y = 880;
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
  const h = gl(t, T.vo[15] + 1.9, 0.6) * (1 - gl(t, T.vo[16] - 0.2, 0.4));
  if (h > 0) { ctx.save(); ctx.globalAlpha = a * h; const s = 76 * beat; ctx.drawImage(iconImg('heart', '#ffae5a'), CX + 92 - s / 2, cy + 92 - s / 2, s, s); ctx.restore(); }
  const lk = gl(t, T.vo[16] + 0.3, 0.5) * (1 - gl(t, T.vo[17] + 0.2, 0.4));
  if (lk > 0) {   // "not spying": a lock badge
    ctx.save(); ctx.globalAlpha = a * lk;
    ctx.beginPath(); ctx.arc(CX + 110, cy + 100, 52, 0, Math.PI * 2); ctx.fillStyle = 'rgba(52,199,89,.2)'; ctx.fill();
    ctx.drawImage(iconImg('lock', '#5fdc86'), CX + 84, cy + 74, 52, 52); ctx.restore();
  }
  // "sharing it with everyone who loves privacy": people appear around, linked to the developer
  for (let i = 0; i < 10; i++) {
    const e = gl(t, T.vo[17] + 1.2 + i * 0.12, 0.6) * a; if (e <= 0) continue;
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
  [T.vo[1], 1.25, ["Here's what's behind it."]],
  [T.vo[2], 1.25, ['One solo developer.']],
  [T.vo[3], 2.45, ['Built with modern tools, including AI.']],
  [T.vo[4], 3.5, ['At the bottom:', 'Arch Linux.'], [23, 147, 209], 'left'],
  [T.vo[5], 3.05, ['On top:', 'Hyprland.'], [40, 200, 220], 'left'],
  [T.vo[6], 2.55, ['Then Quickshell', 'draws the desktop.'], [162, 107, 255], 'left'],
  [T.vo[7], 2.15, ["And NOVA's design", 'on top of it all.'], [106, 168, 255], 'left'],
  [T.vo[8], 2.8, ['Your computer should', 'work for you.'], [255, 174, 90], 'left'],
  [T.vo[10], 0.95 + 3.6, ['So where is it now?']],
  [T.vo[12], 3.7, ['Real footage is coming.'], [255, 138, 138]],
  [T.vo[14], 3.2, ['Some comments make it sound worse than it is.']],
  [T.vo[15], 3.75, ["Building an OS alone isn't fast.", "But I'm trying my best."], [255, 174, 90]],
  [T.vo[16], 2.9, ["And no, I'm not building this", 'to spy on anyone.'], [95, 220, 134]],
  [T.vo[17], 4.2, ["I'm building it for myself,", 'and for everyone who loves privacy.'], [106, 168, 255]],
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
  const g = ctx.createRadialGradient(CX, 600, 0, CX, 600, 1100); g.addColorStop(0, `rgba(40,110,255,${0.16 * (1 - endE)})`); g.addColorStop(1, 'rgba(40,110,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  doubts(t); deskFlat(t); solo(t); stack(t); why(t); status(t); honest(t); captions(t);
  if (endE > 0) {
    starImg(CX, 330, lerp(110, 160, endE), endE);
    if (t >= T.end + 0.2) { const g2 = gl(t, T.end + 0.2); text(ctx, 'NOVA OS', CX + 16, 500 + 30 * (1 - g2), { size: 96, w: 600, track: 0.36, align: 'center', base: 'middle', color: '#fff', a: g2, v: true }); }
    headline(ctx, 'Follow along.', CX, 640, 80, T.vo[13], 999, t);
    headline(ctx, 'Coming soon.', CX, 745, 80, T.vo[13] + 1.4, 999, t, { color: 'rgb(255,174,90)' });
    if (t > T.vo[13] + 2.0) text(ctx, 'byeno.org', CX, 850, { size: 44, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.75)', a: gl(t, T.vo[13] + 2.0), v: true });
  }
  const fo = clamp((t - (DUR - 0.6)) / 0.6); if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
}
