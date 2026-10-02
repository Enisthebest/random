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
    ['No account.', 'No tracking.', 'No telemetry.', 'No ads.'].forEach((s, i) => {
      const t0 = T.list + i * 0.45, e = gl(t, t0, 0.6), o = gl(t, T.listOut, 0.4);
      const y = 700 + i * 160 + 30 * (1 - e) - 14 * o;
      check(150, y, 84, e * (1 - o));
      text(ctx, s, 225, y, { size: s.length > 14 ? 64 : 84, w: 800, track: -0.03, base: 'middle', color: '#fff', a: e * (1 - o), v: true });
    });
  }

  // 4. the disclaimer, said plainly
  headline(ctx, 'A friendly note:', 540, 700, 60, T.more, T.moreOut, t, { color: 'rgba(255,255,255,.7)' });
  headline(ctx, 'We suggest', 540, 860, 116, T.backup, T.moreOut, t);
  headline(ctx, 'backing up first.', 540, 990, 116, T.backup + 0.25, T.moreOut, t);
  headline(ctx, 'NOVA is still in beta, so please', 540, 1150, 46, T.beta, T.moreOut, t, { color: 'rgba(255,255,255,.75)', w: 600 });
  headline(ctx, 'install at your own risk.', 540, 1212, 46, T.beta + 0.15, T.moreOut, t, { color: 'rgba(255,255,255,.75)', w: 600 });

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

