// ---------- "install nova-os": a retro CRT terminal installs NOVA, the star pops, the desktop appears ----------
const GREEN = [70, 255, 120];
const CRT = [50, 480, 1030, 1420];                       // the monitor on the 1080x1920 canvas
const CMD = 'install nova-os', PROMPT = 'nova@arch:~$ ';
const KEYT = []; for (let i = 0; i < CMD.length; i++) KEYT.push(T.type + i * 0.085 + (i > 7 ? 0.05 : 0));
const ENTER = KEYT[KEYT.length - 1] + 0.35;
const LOG = [
  [ENTER + 0.25, 'Resolving dependencies...', 0.7],
  [ENTER + 0.65, 'Fetching shell, shield, guard ...', 0.7],
  [ENTER + 1.05, 'Fetching wallpapers (6) ...', 0.7],
  [ENTER + 1.45, 'Downloading NOVA OS', 1.0],
];
// wallpaper cuts behind the terminal: slow at first, faster and faster
const WALLS = ['original', 'aurora', 'ember', 'lilac', 'ocean', 'citrus'];
const CUTS = (() => { const c = []; let t = T.bar, d = 0.42; while (t < T.done - 0.05) { c.push(t); t += d; d = Math.max(0.07, d * 0.86); } return c; })();
const progressAt = t => clamp(ease(clamp((t - T.bar) / (T.done - T.bar))) * 1.0);

function glowText(s, x, y, size, a, col = GREEN, w = 500) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = `${w} ${size}px GeistMono`; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = rgba(col, 0.9); ctx.shadowBlur = 18; ctx.fillStyle = rgba(col, 1); ctx.fillText(s, x, y);
  ctx.shadowBlur = 0; ctx.fillStyle = rgba(col.map(v => v * 0.5 + 127), 1); ctx.fillText(s, x, y);
  ctx.restore();
}
function cover(key, zoom = 1, a = 1) {
  const im = IMG[key]; if (!im || a <= 0) return;
  const k = Math.max(W / im.width, H / im.height) * zoom, w = im.width * k, h = im.height * k;
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h); ctx.restore();
}
function starImg(cx, cy, size, a = 1) {
  if (a <= 0) return;
  const b = [186, 41, 1187, 1100], bw = b[2] - b[0], bh = b[3] - b[1], k = size / Math.max(bw, bh);
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(IMG.star, b[0], b[1], bw, bh, cx - bw * k / 2, cy - bh * k / 2, bw * k, bh * k); ctx.restore();
}
function glow(cx, cy, r, a, col) {
  if (a <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(0.4, rgba(col, a * 0.35)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r); ctx.restore();
}

function terminal(t) {
  // CRT power on (a line that opens up) and power off (it collapses back to a line, then a dot)
  const on = clamp((t - T.on) / 0.35), off = clamp((t - T.off) / 0.35);
  if (on <= 0 || off >= 1) return;
  const cy = (CRT[1] + CRT[3]) / 2, fullH = CRT[3] - CRT[1];
  let h = on < 0.4 ? 6 : lerp(6, fullH, ease((on - 0.4) / 0.6));
  let w = CRT[2] - CRT[0];
  if (off > 0) { h = off < 0.5 ? lerp(fullH, 6, ease(off / 0.5)) : 6; w = off < 0.5 ? w : lerp(w, 6, ease((off - 0.5) / 0.5)); }
  const x0 = 540 - w / 2, y0 = cy - h / 2;
  ctx.save();
  rr(ctx, x0, y0, w, h, Math.min(34, h / 2)); ctx.fillStyle = 'rgba(2,12,5,.9)'; ctx.fill();
  rr(ctx, x0, y0, w, h, Math.min(34, h / 2)); ctx.lineWidth = 3; ctx.strokeStyle = rgba(GREEN, 0.35); ctx.stroke();
  ctx.clip();
  if (h > 60 && off === 0) {
    const L = CRT[0] + 48; let y = CRT[1] + 90;
    // header
    glowText('NOVA INSTALLER v1.0', L, y, 38, 0.55); y += 92;
    // the command, typed key by key
    const typed = KEYT.filter(k => t >= k).length;
    const cursorOn = Math.floor(t * 2.2) % 2 === 0 || (t > T.type - 0.1 && t < ENTER);
    glowText(PROMPT + CMD.slice(0, typed) + (t < ENTER + 0.2 && cursorOn ? '█' : ''), L, y, 48, 1); y += 86;
    // log lines
    for (const [t0, s, br] of LOG) { if (t < t0) break; glowText('> ' + s, L, y, 40, br * clamp((t - t0) / 0.08)); y += 72; }
    // ASCII progress bar
    if (t >= T.bar) {
      const p = progressAt(t), n = 18, f = Math.round(p * n);
      glowText('[' + '#'.repeat(f) + '-'.repeat(n - f) + '] ' + String(Math.round(p * 100)).padStart(3, ' ') + '%', L, y, 46, 1); y += 96;
    }
    if (t >= T.done) { glowText('✓ Download complete', L, y, 48, clamp((t - T.done) / 0.08), [140, 255, 170], 500); y += 80; }
    if (t >= T.done + 0.55) glowText('Rebooting into NOVA ✦', L, y, 48, clamp((t - T.done - 0.55) / 0.08), [255, 200, 120], 500);
    if (t >= T.done + 0.55 && Math.floor(t * 2.2) % 2 === 0) { ctx.font = '500 38px GeistMono'; }
  }
  // scanlines + flicker + a phosphor bloom
  ctx.fillStyle = 'rgba(0,0,0,.28)'; for (let sy = Math.floor(y0); sy < y0 + h; sy += 4) ctx.fillRect(x0, sy, w, 2);
  const fl = 0.04 * (Math.sin(t * 61) * 0.5 + Math.sin(t * 23) * 0.5);
  ctx.fillStyle = rgba(GREEN, 0.03 + fl * 0.5); ctx.fillRect(x0, y0, w, h);
  if (on < 1 && on > 0) { ctx.fillStyle = `rgba(200,255,210,${0.8 * (1 - on)})`; ctx.fillRect(x0, y0, w, h); }
  ctx.restore();
  if (off > 0 && off < 1) glow(540, cy, 120 * (1 - off) + 30, 0.8 * (1 - off * 0.5), [190, 255, 210]);
}

function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);

  // 1. wallpapers flashing behind the terminal while it downloads
  if (t >= T.bar && t < T.off + 0.2) {
    let i = -1; CUTS.forEach((c, k) => { if (t >= c) i = k; });
    if (i >= 0) {
      const u = t - CUTS[i], z = 1.08 - 0.06 * ease(u / 0.25);
      const a = gl(t, T.bar, 0.4) * (1 - clamp((t - T.off) / 0.2));
      cover('wall-' + WALLS[i % 6], z, a);
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, W, H);
    }
  }
  terminal(t);

  // 2. the star rises in the dark, squeezes, and POPs
  if (t >= T.rise && t < T.pop + 0.5) {
    const u = clamp((t - T.rise) / (T.pop - T.rise));
    const y = lerp(1750, 940, ease(clamp(u / 0.8)));
    let size = lerp(90, 360, ease(u));
    if (u > 0.85) size *= 1 - 0.12 * Math.sin(Math.PI * (u - 0.85) / 0.15);   // anticipation squeeze
    const wob = 1 + 0.03 * Math.sin(t * 9) * u;
    glow(540, y, size * 1.8, 0.25 + 0.55 * u, [255, 190, 110]);
    glow(540, y, size * 1.3, 0.2 + 0.4 * u, [90, 150, 255]);
    if (t < T.pop) starImg(540, y, size * wob);
    else { const p = (t - T.pop) / 0.5; starImg(540, y, size * (1 + 3 * ease(p)), 1 - p); }
  }

  // 3. POP: the desktop appears and the camera glides to the Control panel
  if (t >= T.pop) {
    const u = clamp((t - T.pop) / (T.logo - T.pop));
    const im = IMG['ui-desktop'], sw = 900 * W / H;                 // a portrait slice of the 1440x900 screen
    const cx = lerp(560, 1440 - sw / 2, ease(clamp((u - 0.15) / 0.75)));
    const z = lerp(1.25, 1.0, ease(clamp(u / 0.35)));
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    ctx.drawImage(im, cx - sw / 2, 0, sw, 900, 0, 0, W, H); ctx.restore();
    // flash + shockwave ring
    const f = (t - T.pop) / 0.6;
    if (f < 1) {
      ctx.fillStyle = `rgba(255,255,255,${(1 - f) ** 2})`; ctx.fillRect(0, 0, W, H);
      ctx.beginPath(); ctx.arc(540, 940, 60 + 1400 * ease(f), 0, Math.PI * 2); ctx.lineWidth = 40 * (1 - f); ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - f)})`; ctx.stroke();
    }
  }

  // 4. logo, the line, coming soon
  if (t >= T.logo) {
    const e = gl(t, T.logo, 0.8);
    ctx.fillStyle = `rgba(0,0,0,${0.86 * e})`; ctx.fillRect(0, 0, W, H);
    glow(540, 760, 700, 0.35 * e, [245, 142, 30]); glow(540, 820, 700, 0.35 * e, [40, 120, 255]);
    starImg(540, 640, lerp(120, 170, e), e);
    if (t >= T.logo + 0.2) { const g = gl(t, T.logo + 0.2); text(ctx, 'NOVA OS', 556, 800 + 30 * (1 - g), { size: 88, w: 600, track: 0.36, align: 'center', base: 'middle', color: '#fff', a: g, v: true }); }
    headline(ctx, 'Take the risk.', 540, 1000, 104, T.risk, 999, t);
    headline(ctx, "It's worth it.", 540, 1120, 104, T.risk + 0.45, 999, t, { color: 'rgb(255,174,90)' });
    headline(ctx, 'Coming soon.', 540, 1290, 60, T.soon, 999, t, { color: 'rgba(255,255,255,.85)', w: 700 });
    if (t >= T.soon + 0.5) text(ctx, 'byeno.org', 540, 1380, { size: 42, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.65)', a: gl(t, T.soon + 0.5) });
  }
}

