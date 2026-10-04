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
