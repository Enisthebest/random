// ---------- "What's behind NOVA": is it real? → one solo developer → the stack (Arch → Hyprland → Quickshell → NOVA)
// → why → honest status → follow along. Voice 4 at T.vo; captions match the voice.
const CX = W / 2;

// floating doubt chips at the start
const DOUBT = [['is this real?', 150, 560], ['looks AI', 760, 640], ['fake?', 210, 1180], ['no way this runs on Linux', 560, 1270], ['vibe coded…', 840, 1080]];
function doubts(t) {
  const out = gl(t, T.vo[1] - 0.1, 0.5);
  DOUBT.forEach(([s, x, y], i) => {
    const e = gl(t, 0.25 + i * 0.22, 0.5), a = e * (1 - out); if (a <= 0) return;
    const dx = 10 * Math.sin(t * 0.9 + i), dy = 12 * Math.cos(t * 0.7 + i * 2) - 30 * out;
    ctx.save(); ctx.globalAlpha = a; ctx.font = '600 38px GeistV';
    const w = ctx.measureText(s).width + 90, px = clamp(x + dx - w / 2, 30, W - 30 - w), py = y + dy + 20 * (1 - e);
    rr(ctx, px, py, w, 76, 38); ctx.fillStyle = 'rgba(30,30,36,.92)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.stroke();
    ctx.drawImage(iconImg('message-circle', '#8d8d96'), px + 22, py + 22, 32, 32);
    text(ctx, s, px + 64, py + 40, { size: 34, w: 600, base: 'middle', color: '#e4e4e7', v: true });
    ctx.restore();
  });
  headline(ctx, 'Is NOVA real?', CX, 900, 120, T.vo[0] + 1.0, T.vo[1] - 0.3, t);
}

// "here's what's behind it": the desktop, flat
function deskFlat(t) {
  const a = gl(t, T.vo[1], 0.5) * (1 - gl(t, T.vo[2] - 0.35, 0.4)); if (a <= 0 || !IMG.desk) return;
  const w = 900, h = 562, x = CX - w / 2, y = 700 + 20 * (1 - a);
  ctx.save(); ctx.globalAlpha = a; rr(ctx, x, y, w, h, 26); ctx.clip(); ctx.drawImage(IMG.desk, x, y, w, h); ctx.restore();
}

// one solo developer (+ modern tools)
function solo(t) {
  const a = gl(t, T.vo[2] - 0.1, 0.5) * (1 - gl(t, T.stack - 0.4, 0.4)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const cy = 900, r = 150;
  ctx.beginPath(); ctx.arc(CX, cy, r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(59,139,255,.16)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(106,168,255,.5)'; ctx.stroke();
  ctx.drawImage(iconImg('user', '#6aa8ff'), CX - 80, cy - 80, 160, 160);
  ctx.restore();
  const tools = [['code', 'Code'], ['terminal', 'Terminal'], ['palette', 'Design'], ['sparkles', 'AI']];
  tools.forEach(([ic, name], i) => {
    const e = gl(t, T.vo[3] + 0.2 + i * 0.25, 0.5) * a; if (e <= 0) return;
    const ang = -Math.PI / 2 + (i - 1.5) * 0.62 + Math.PI, R = 330, x = CX + Math.cos(ang) * R * 1.15, y = cy + Math.sin(ang) * R * -1;
    const w = 230, h = 82;
    ctx.save(); ctx.globalAlpha = e;
    rr(ctx, x - w / 2, y - h / 2 + 16 * (1 - e), w, h, 41); ctx.fillStyle = 'rgba(30,30,36,.95)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.stroke();
    ctx.drawImage(iconImg(ic, '#cdcdd2'), x - w / 2 + 24, y - 18 + 16 * (1 - e), 36, 36);
    text(ctx, name, x - w / 2 + 74, y + 2 + 16 * (1 - e), { size: 34, w: 600, base: 'middle', color: '#f2f2f4', v: true });
    ctx.restore();
  });
}

// the stack: isometric slabs dropping in, bottom to top
const LAYERS = [
  { name: 'Arch Linux', sub: 'the base', col: [23, 147, 209] },
  { name: 'Hyprland', sub: 'windows + glass', col: [40, 200, 220] },
  { name: 'Quickshell', sub: 'draws the desktop', col: [162, 107, 255] },
  { name: 'NOVA design', sub: '', col: [59, 139, 255], desk: true },
];
const SW = 600, SD = 375, TH = 46, GAP = 128, BASE = 1300;
const U = [SW * 0.866, SW * 0.5], V = [-SD * 0.866, SD * 0.5];
function slab(L, cx, cy, a, glow) {
  if (a <= 0) return;
  const o = [cx - U[0] / 2 - V[0] / 2, cy - U[1] / 2 - V[1] / 2];   // top-face origin (back corner)
  const p = (u, v, dz = 0) => [o[0] + U[0] * u + V[0] * v, o[1] + U[1] * u + V[1] * v + dz];
  ctx.save(); ctx.globalAlpha *= a;
  // sides (thickness)
  const quad = (pts, fill) => { ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
  quad([p(1, 0), p(1, 1), p(1, 1, TH), p(1, 0, TH)], rgba(L.col.map(c => c * 0.45)));
  quad([p(0, 1), p(1, 1), p(1, 1, TH), p(0, 1, TH)], rgba(L.col.map(c => c * 0.6)));
  // top face, drawn in face coordinates
  ctx.save(); ctx.transform(U[0] / SW, U[1] / SW, V[0] / SD, V[1] / SD, o[0], o[1]);
  rr(ctx, 0, 0, SW, SD, 26); ctx.clip();
  if (L.desk && IMG.desk) ctx.drawImage(IMG.desk, 0, 0, SW, SD);
  else {
    const g = ctx.createLinearGradient(0, 0, SW, SD); g.addColorStop(0, rgba(L.col.map(c => lerp(c, 255, 0.15)))); g.addColorStop(1, rgba(L.col.map(c => c * 0.8)));
    ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SD);
    text(ctx, L.name, SW / 2, SD / 2 - 14, { size: 66, w: 800, align: 'center', base: 'middle', color: '#fff', v: true, track: -0.02 });
    text(ctx, L.sub, SW / 2, SD / 2 + 52, { size: 32, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.85)', v: true });
  }
  if (glow > 0) { ctx.fillStyle = `rgba(255,255,255,${0.35 * glow})`; ctx.fillRect(0, 0, SW, SD); }
  ctx.restore();
  ctx.restore();
}
function stack(t) {
  const out = gl(t, T.vo[9] - 0.4, 0.5); if (t < T.stack - 0.2 || out >= 1) return;
  // the camera eases up as the stack grows so the newest layer stays in view
  const n = T.layers.filter(x => t > x - 0.3).length;
  const lift = 0;
  ctx.save(); ctx.translate(0, lift); ctx.globalAlpha = 1 - out;
  LAYERS.forEach((L, i) => {
    const t0 = T.layers[i]; if (t < t0 - 0.05) return;
    const e = gl(t, t0, 0.55), land = Math.exp(-Math.max(0, t - t0 - 0.5) * 6) * (t > t0 + 0.5 ? 1 : 0);
    slab(L, CX, BASE - i * GAP - 420 * (1 - e), e, land * 0.6);
  });
  ctx.restore();
  // the NOVA layer's label sits beside it (its face shows the real desktop)
  const nl = gl(t, T.layers[3] + 0.4, 0.5) * (1 - out);
  if (nl > 0) { text(ctx, 'NOVA', CX, 560 + lift * 0.0, { size: 64, w: 800, align: 'center', base: 'middle', color: '#fff', a: nl, v: true }); }
}

// why
function why(t) {
  const a = gl(t, T.vo[9], 0.5) * (1 - gl(t, T.vo[10] - 0.3, 0.4)); if (a <= 0) return;
  [['ban', 'No ads', [255, 92, 92]], ['eye-off', 'No tracking', [255, 92, 92]]].forEach(([ic, s, col], i) => {
    const e = gl(t, T.vo[9] + i * 0.55, 0.5) * a; if (e <= 0) return;
    const y = 880 + i * 190, w = 760, h = 150;
    ctx.save(); ctx.globalAlpha = e;
    rr(ctx, CX - w / 2, y + 20 * (1 - e), w, h, 40); ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.stroke();
    rr(ctx, CX - w / 2 + 28, y + 28 + 20 * (1 - e), 94, 94, 28); ctx.fillStyle = rgba(col, 0.16); ctx.fill();
    ctx.drawImage(iconImg(ic, rgba(col)), CX - w / 2 + 49, y + 49 + 20 * (1 - e), 52, 52);
    text(ctx, s, CX - w / 2 + 160, y + h / 2 + 20 * (1 - e), { size: 60, w: 800, base: 'middle', color: '#f2f2f4', v: true });
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
  const a = gl(t, T.vo[10], 0.4) * (1 - gl(t, T.end - 0.2, 0.5)); if (a <= 0) return;
  STATUS.forEach((r, i) => {
    const e = gl(t, T.st[r.t], 0.5) * a; if (e <= 0) return;
    const x = 70, y = 640 + i * 150 + 20 * (1 - e), w = 940, h = 126;
    ctx.save(); ctx.globalAlpha = e;
    rr(ctx, x, y, w, h, 32); ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.stroke();
    rr(ctx, x + 26, y + 26, 74, 74, 22); ctx.fillStyle = rgba(r.col, 0.16); ctx.fill();
    ctx.drawImage(iconImg(r.ic, rgba(r.col)), x + 43, y + 43, 40, 40);
    text(ctx, r.title, x + 128, y + h / 2 - (r.bar ? 14 : 0), { size: 44, w: 700, base: 'middle', color: '#f2f2f4', v: true });
    text(ctx, r.val, x + w - 32, y + h / 2 - (r.bar ? 14 : 0), { size: 34, w: 600, align: 'right', base: 'middle', color: rgba(r.col), v: true });
    if (r.bar) {   // an indeterminate "in progress" bar: honest, no fake percentage
      const bx = x + 128, by = y + h / 2 + 22, bw = w - 160;
      rr(ctx, bx, by, bw, 12, 6); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill();
      ctx.save(); rr(ctx, bx, by, bw, 12, 6); ctx.clip();
      const seg = 260, px = bx - seg + ((t * 380) % (bw + seg));
      const g = ctx.createLinearGradient(px, 0, px + seg, 0); g.addColorStop(0, 'rgba(106,168,255,0)'); g.addColorStop(0.5, 'rgba(106,168,255,1)'); g.addColorStop(1, 'rgba(106,168,255,0)');
      ctx.fillStyle = g; ctx.fillRect(px, by, seg, 12); ctx.restore();
    }
    ctx.restore();
  });
  // design preview tag, then "real footage" coming
  const tg = gl(t, T.vo[12] + 0.2, 0.5) * a;
  if (tg > 0) {
    ctx.save(); ctx.globalAlpha = tg; const y = 1270;
    rr(ctx, CX - 230, y, 460, 76, 38); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill();
    ctx.drawImage(iconImg('palette', '#cdcdd2'), CX - 200, y + 20, 36, 36);
    text(ctx, 'Videos so far: designs', CX - 150, y + 40, { size: 32, w: 600, base: 'middle', color: '#e4e4e7', v: true });
    ctx.restore();
  }
  const rc = gl(t, T.vo[12] + 2.2, 0.5) * a;
  if (rc > 0) {
    ctx.save(); ctx.globalAlpha = rc; const y = 1370;
    rr(ctx, CX - 230, y, 460, 76, 38); ctx.fillStyle = 'rgba(255,92,92,.14)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,92,92,.4)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(CX - 190, y + 38, 12, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,92,92,${0.5 + 0.5 * Math.round((Math.sin(t * 6) + 1) / 2)})`; ctx.fill();
    text(ctx, 'Real footage: coming', CX - 160, y + 40, { size: 32, w: 700, base: 'middle', color: '#ff8a8a', v: true });
    ctx.restore();
  }
}

// captions (match the voice)
const CAP = [
  [T.vo[1], 1.25, ["Here's what's behind it."]],
  [T.vo[2], 1.25, ['One solo developer.']],
  [T.vo[3], 2.45, ['Built with modern tools,', 'including AI.']],
  [T.vo[4], 3.5, ['At the bottom:', 'Arch Linux.'], [23, 147, 209]],
  [T.vo[5], 3.05, ['On top:', 'Hyprland.'], [40, 200, 220]],
  [T.vo[6], 2.55, ['Then Quickshell draws', 'the whole desktop.'], [162, 107, 255]],
  [T.vo[7], 2.15, ["And NOVA's own design", 'on top of it all.'], [106, 168, 255]],
  [T.vo[8], 2.8, ['Your computer should', 'work for you.'], [255, 174, 90]],
  [T.vo[10], 0.95 + 3.6, ['So where is it now?']],
  [T.vo[12], 3.7, ['Real footage', 'is coming.'], [255, 138, 138]],
];
function captions(t) {
  for (const [t0, d, lines, col] of CAP) {
    if (t < t0 - 0.05 || t > t0 + d + 0.5) continue;
    lines.forEach((s, i) => headline(ctx, s, CX, (lines.length > 1 ? 300 : 350) + i * 104, 84, t0 + i * 0.22, t0 + d, t, { color: i === 1 && col ? rgba(col) : '#fff' }));
  }
}

function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const endE = gl(t, T.end, 0.8);
  const g = ctx.createRadialGradient(CX, 1000, 0, CX, 1000, 1000); g.addColorStop(0, `rgba(40,110,255,${0.16 * (1 - endE)})`); g.addColorStop(1, 'rgba(40,110,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  doubts(t); deskFlat(t); solo(t); stack(t); why(t); status(t); captions(t);
  if (endE > 0) {
    starImg(CX, 700, lerp(120, 170, endE), endE);
    if (t >= T.end + 0.2) { const g2 = gl(t, T.end + 0.2); text(ctx, 'NOVA OS', CX + 14, 880 + 30 * (1 - g2), { size: 92, w: 600, track: 0.36, align: 'center', base: 'middle', color: '#fff', a: g2, v: true }); }
    headline(ctx, 'Follow along.', CX, 1020, 84, T.vo[13], 999, t);
    headline(ctx, 'Coming soon.', CX, 1130, 84, T.vo[13] + 1.4, 999, t, { color: 'rgb(255,174,90)' });
    if (t > T.vo[13] + 2.0) text(ctx, 'byeno.org', CX, 1240, { size: 46, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.75)', a: gl(t, T.vo[13] + 2.0), v: true });
  }
  const fo = clamp((t - (DUR - 0.6)) / 0.6); if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
}
