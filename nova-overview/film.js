// NOVA OS — "The Tour": every screen in the design kit, 1920x1080. Pure function of time: seek(t) draws frame t.
// Everything sits on a 120 BPM grid: one bar = 2 s = one screen. Slides are centred on the downbeat.
(() => {
const W = 1920, H = 1080, G = 0.8, BAR = 2.0;

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

// ---------- canvas ----------
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const IMG = {};
const load = (k, src) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.onerror = () => r(); i.src = src; });

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
function headline(g, s, cx, cy, size, tin, tout, t, o = {}) {
  if (t < tin || t > tout + 0.5) return;
  const w = o.w || 800, track = o.track == null ? -0.035 : o.track, gap = size * 0.24;
  const words = s.split(' '), ws = words.map(x => measure(x, size, w, track, true));
  const total = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  const outE = gl(t, tout, 0.5);
  let x = cx - total / 2;
  words.forEach((word, i) => {
    const e = ease((t - tin - i * 0.07) / 0.7);
    text(g, word, x, cy + 26 * (1 - e) - 14 * outE, { size, w, track, color: o.color || '#fff', a: e * (1 - outE) * (o.a == null ? 1 : o.a), base: 'middle', v: true });
    x += ws[i] + gap;
  });
}
function starImg(cx, cy, size, a = 1) {
  if (a <= 0 || !IMG.star) return;
  const b = [96, 21, 1218, 1107], bw = b[2] - b[0], bh = b[3] - b[1], k = size / Math.max(bw, bh);
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(IMG.star, b[0], b[1], bw, bh, cx - bw * k / 2, cy - bh * k / 2, bw * k, bh * k); ctx.restore();
}
function glow(cx, cy, r, a, col) {
  if (a <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r); ctx.restore();
}

// ---------- the script ----------
// item: [image, caption, [focus x, focus y, zoom at the end of its bar]] — focus in 1440x900 screen pixels
const F = (x = 720, y = 450, z = 1.06) => [x, y, z];
const CHAPTERS = [
  { title: 'First boot.', sub: 'A setup that asks, and never collects.', items: [
    ['setup-welcome', 'Welcome', F(720, 420, 1.12)], ['setup-region', 'Language & region', F(760, 450, 1.1)], ['setup-account', 'Your account', F(860, 460, 1.18)],
    ['setup-privacy', 'Privacy, all off by default', F(860, 440, 1.18)], ['setup-protection', 'Pick your protection', F(860, 440, 1.14)],
    ['setup-look', 'Pick a wallpaper', F(800, 420, 1.16)], ['setup-finish', "You're all set", F(860, 430, 1.14)]] },
  { title: 'Your desktop.', sub: 'Quiet, fast, out of your way.', items: [
    ['shell-lock', 'Lock screen', F(720, 400, 1.08)], ['shell-lock-password', 'Unlock', F(720, 470, 1.18)], ['shell-desktop', 'Desktop', F(720, 450, 1.04)],
    ['shell-control', 'Control panel', F(1150, 330, 1.55)], ['shell-wifi', 'Wi-Fi', F(1240, 230, 1.7)], ['shell-notifications', 'Notifications', F(1230, 160, 1.7)],
    ['shell-power', 'Power menu', F(720, 450, 1.35)], ['shell-osd', 'Volume', F(720, 760, 1.7)]] },
  { title: 'Find anything.', sub: 'Super + Space. Apps, files, settings, maths.', items: [
    ['launcher-open', 'Launcher', F(720, 380, 1.22)], ['launcher-search', 'Search everything', F(720, 380, 1.22)], ['launcher-calc', 'Quick answers', F(720, 330, 1.3)]] },
  { title: 'Apps that respect you.', sub: 'Every app built from one design.', items: [
    ['shield', 'Shield', F()], ['guard', 'Guard', F()], ['files', 'Files', F()], ['monitor', 'Monitor', F()],
    ['ledger', 'Ledger', F()], ['images', 'Images', F()], ['fix', 'Fix', F()], ['settings', 'Settings', F()]] },
  { title: 'Built for power users.', sub: 'Terminal, Text Editor and NOVA Browser.', items: [
    ['terminal', 'Terminal', F()], ['editor', 'Text Editor', F()], ['browser-newtab', 'NOVA Browser', F()], ['browser-site', 'Private browsing', F()], ['browser-shield', 'Browser Shield', F()]] },
  { title: 'Game on.', sub: 'Super + G. Everything else steps aside.', items: [
    ['gaming-on', 'Gaming mode', F(720, 450, 1.35)], ['gaming-locked', 'Focus lock', F(960, 160, 1.6)], ['gaming-settings', 'Gaming settings', F(720, 400, 1.08)], ['gaming-off', 'Welcome back', F(1230, 160, 1.7)]] },
  { title: 'Make it yours.', sub: 'Six wallpapers. The accent follows.', walls: true, items: [
    ['original', 'NOVA', [59, 139, 255]], ['aurora', 'Aurora', [25, 201, 149]], ['ember', 'Ember', [255, 79, 139]],
    ['lilac', 'Lilac', [162, 107, 255]], ['ocean', 'Ocean', [18, 184, 240]], ['citrus', 'Citrus', [168, 230, 50]]] },
  { title: '2,164 icons.', sub: 'One style, everywhere. A Linux icon theme too.', icons: 3 },
  { title: 'Meet ACE.', sub: 'Your ace up the sleeve. Only in NOVA Pro.', pro: true, items: [
    ['ace-expressions', 'Buddy, the face of ACE', F(720, 450, 1)], ['ace-new', 'New chat', F(720, 420, 1.12)], ['ace', 'Ask anything', F()],
    ['ace-command', 'Shows it before it runs', F(760, 450, 1.12)], ['ace-permissions', 'Always asks first', F(760, 450, 1.12)], ['launcher-ace', 'ACE in the launcher', F(720, 380, 1.22)]] },
];

// timeline
const T = { intro: 0.3, chapters: [] };
let tt = 2 * BAR;
CHAPTERS.forEach((c, i) => {
  c.n = i + 1; c.t0 = tt; c.s0 = tt + BAR;
  const bars = c.icons ? c.icons : c.items.length;
  c.t1 = c.s0 + bars * BAR; tt = c.t1;
  T.chapters.push(c.t0);
});
T.wall = tt; T.wallLine = tt + 2 * BAR; T.end = tt + 4 * BAR; T.soon = T.end + 1.2; T.site = T.end + 1.8;
const DUR = T.end + 3 * BAR + 0.5;

// ---------- frame + carousel ----------
const FW = 1376, FH = 860, FX = W / 2, FY = 76 + FH / 2, SP = FW + 80;   // the screen frame (1440x900 at 0.956)
function chapterP(c, t) {   // continuous carousel index: enters from the right, steps on each downbeat, leaves left
  let p = -1.5 * (1 - gl(t, c.s0 - 0.4));
  for (let k = 1; k < c.items.length; k++) p += gl(t, c.s0 + k * BAR - 0.4);
  return p + 1.5 * gl(t, c.t1 - 0.4);
}
function drawScreen(key, cx, cy, s, a, focus, zoom) {
  const wall = !IMG['ui-' + key], w = FW * s, h = FH * s, im = IMG['ui-' + key] || IMG['wall-' + key];
  if (!im || a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  rr(ctx, cx - w / 2, cy - h / 2, w, h, 26 * s); ctx.save(); ctx.clip();
  ctx.fillStyle = '#0b0b0e'; ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
  const iw = im.naturalWidth, ih = im.naturalHeight;
  if (wall) {   // wallpapers: cover the frame, slow zoom from the centre
    const k = Math.max(w / iw, h / ih) * zoom;
    ctx.drawImage(im, cx - iw * k / 2, cy - ih * k / 2, iw * k, ih * k);
  } else if (Math.abs(iw / ih - 1.6) > 0.05) {   // other aspect (Buddy board): contain on the dark card
    const k = Math.min(w / iw, h / ih) * 0.94;
    ctx.drawImage(im, cx - iw * k / 2, cy - ih * k / 2, iw * k, ih * k);
  } else {
    const kx = iw / 1440, sw = 1440 / zoom, sh = 900 / zoom;
    const sx = clamp(focus[0] - sw / 2, 0, 1440 - sw), sy = clamp(focus[1] - sh / 2, 0, 900 - sh);
    ctx.drawImage(im, sx * kx, sy * kx, sw * kx, sh * kx, cx - w / 2, cy - h / 2, w, h);
  }
  ctx.restore();
  rr(ctx, cx - w / 2 + 0.5, cy - h / 2 + 0.5, w - 1, h - 1, 26 * s); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.stroke();
  ctx.restore();
}
function pill(label, cx, cy, a, dot) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = '600 30px GeistV'; ctx.letterSpacing = '-0.3px';
  const tw = ctx.measureText(label).width, w = tw + 60 + (dot ? 30 : 0);
  rr(ctx, cx - w / 2, cy - 30, w, 60, 30); ctx.fillStyle = 'rgba(16,16,20,.9)'; ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.stroke();
  let x = cx - w / 2 + 30;
  if (dot) { ctx.beginPath(); ctx.arc(x + 9, cy, 9, 0, Math.PI * 2); ctx.fillStyle = rgba(dot); ctx.fill(); x += 30; }
  ctx.fillStyle = '#f2f2f4'; ctx.textBaseline = 'middle'; ctx.fillText(label, x, cy + 1);
  ctx.restore();
}

// backgrounds: blurred wallpapers, made once
const BG = {};
function makeBG(key) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.filter = 'blur(60px) saturate(1.2)'; g.drawImage(IMG['wall-' + key], -120, -70, W + 240, H + 140); g.filter = 'none';
  g.fillStyle = 'rgba(0,0,0,.62)'; g.fillRect(0, 0, W, H); BG[key] = c;
}

// icons: white and accent copies of each one
const ICO = [], ICO_A = [];
const iconURL = (inner, col) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`);
const COLS = 17, ROWS = 9, CELL = 104;
function drawIcons(c, t) {
  const tin = c.s0 - 0.5, tout = c.t1 - 0.5;
  const out = gl(t, tout, 0.6), drift = (t - tin) * 14;
  const x0 = W / 2 - (COLS - 1) * CELL / 2, y0 = 120 - drift + 30;
  const fl = (t - (c.s0 + 2.3)) / 1.0;   // accent flood from the centre
  const R = fl > 0 ? ease(clamp(fl)) * 1300 : -1;
  for (let r = 0; r < ROWS + 1; r++) for (let q = 0; q < COLS; q++) {
    const i = (r * COLS + q) % ICO.length, x = x0 + q * CELL, y = y0 + r * CELL;
    const d = Math.hypot(x - W / 2, y - H / 2);
    const a = gl(t, tin + d / 1600, 0.6) * (1 - out) * clamp((y - 70) / 60) * clamp((940 - y) / 90);
    if (a <= 0) continue;
    const nova = ICONS[i][0].startsWith('nova-');
    const s = 48 * (0.85 + 0.15 * gl(t, tin + d / 1600, 0.6));
    const img = (d < R || nova && fl < 0) ? ICO_A[i] : ICO[i];
    ctx.globalAlpha = a * (nova || d < R ? 1 : 0.78);
    ctx.drawImage(img, x - s / 2, y - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
  pill('Lucide icons + 46 made for NOVA', W / 2, 1012, gl(t, c.s0 + 0.3, 0.5) * (1 - out));
}

// the finale wall: every screen as a thumbnail
let SCREENS = [];
const WC = 8, WR = 6, TW = 480, TH = 300, WG = 26;
function drawWall(t) {
  const a = gl(t, T.wall - 0.3, 0.6) * (1 - gl(t, T.end, 0.8));
  if (a <= 0) return;
  const ww = WC * (TW + WG) - WG, wh = WR * (TH + WG) - WG;
  const z0 = 1920 / (TW * 1.12), z1 = 1920 / (ww + 200);           // from one screen to the whole wall
  const e = gl(t, T.wall + 0.2, 3.2);
  const z = Math.exp(lerp(Math.log(z0), Math.log(z1), e)) * (1 + 0.03 * clamp((t - T.wall - 3.4) / 4));
  const focus = [lerp(3 * (TW + WG) + TW / 2, ww / 2, e), lerp(2 * (TH + WG) + TH / 2, wh / 2, e)];
  ctx.save(); ctx.globalAlpha = a;
  ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-focus[0], -focus[1]);
  for (let r = 0; r < WR; r++) for (let q = 0; q < WC; q++) {
    const k = SCREENS[(r * WC + q) % SCREENS.length], im = IMG['th-' + k];
    const x = q * (TW + WG) + (r % 2 ? 0 : 0), y = r * (TH + WG);
    ctx.save(); rr(ctx, x, y, TW, TH, 14); ctx.clip(); if (im) ctx.drawImage(im, x, y, TW, TH); ctx.restore();
  }
  ctx.restore();
  const dim = gl(t, T.wallLine - 0.4, 0.8);
  ctx.fillStyle = `rgba(0,0,0,${0.62 * dim * a})`; ctx.fillRect(0, 0, W, H);
  headline(ctx, 'Every screen.', W / 2, 470, 132, T.wallLine, T.end - 0.4, t);
  headline(ctx, 'Designed.', W / 2, 630, 132, T.wallLine + 1.0, T.end - 0.4, t, { color: 'rgb(255,174,90)' });
}

// ---------- the frame ----------
function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);

  // background: the NOVA wallpaper, blurred and dark; in the wallpaper chapter it follows the current one
  const bgA = gl(t, 3.4, 1.0) * (1 - gl(t, T.wall - 0.4, 0.6));
  if (bgA > 0) {
    ctx.globalAlpha = bgA; ctx.drawImage(BG.original, 0, 0);
    const wc = CHAPTERS.find(c => c.walls);
    if (t > wc.s0 - 1 && t < wc.t1 + 0.6) {
      const p = chapterP(wc, t);
      wc.items.forEach(([k], i) => { const a = 1 - Math.abs(i - p); if (a > 0) { ctx.globalAlpha = bgA * ease(a); ctx.drawImage(BG[k], 0, 0); } });
    }
    ctx.globalAlpha = 1;
  }

  // intro
  if (t < 4.6) {
    const a = 1 - gl(t, 3.3, 0.7);
    glow(W / 2, 380, 520, 0.3 * gl(t, 0.2, 1.5) * a, [245, 142, 30]); glow(W / 2, 420, 520, 0.3 * gl(t, 0.2, 1.5) * a, [40, 120, 255]);
    starImg(W / 2, 360 - 20 * gl(t, 3.3, 0.7), lerp(120, 190, gl(t, 0.2, 1.4)), gl(t, 0.2, 0.9) * a);
    headline(ctx, 'This is NOVA OS.', W / 2, 640, 112, 0.9, 3.2, t);
    if (t > 1.8) text(ctx, 'The whole design, in one tour.', W / 2, 760, { size: 40, w: 500, align: 'center', base: 'middle', color: 'rgba(255,255,255,.7)', a: gl(t, 1.8, 0.6) * (1 - gl(t, 3.2, 0.5)), v: true });
  }

  for (const c of CHAPTERS) {
    if (t < c.t0 - 0.5 || t >= c.t1 + 0.6) continue;
    // chapter title (the carousel of the last chapter is still leaving on the left)
    const ti = c.t0 + 0.15, to = c.s0 - 0.45;
    headline(ctx, c.title, W / 2, 480, 124, ti, to, t, { color: c.pro ? 'rgb(255,174,90)' : '#fff' });
    if (t > ti + 0.3) text(ctx, c.sub, W / 2, 610, { size: 42, w: 500, align: 'center', base: 'middle', color: 'rgba(255,255,255,.72)', a: gl(t, ti + 0.3, 0.6) * (1 - gl(t, to, 0.5)), v: true });
    if (t > ti - 0.1) text(ctx, String(c.n).padStart(2, '0'), W / 2, 340, { size: 34, w: 700, align: 'center', base: 'middle', color: 'rgba(255,255,255,.45)', a: gl(t, ti, 0.5) * (1 - gl(t, to, 0.5)), v: true, track: 0.2 });

    // chapter tag, top left, while its screens show
    const tagA = gl(t, c.s0 - 0.2, 0.5) * (1 - gl(t, c.t1 - 0.5, 0.4));
    text(ctx, `${String(c.n).padStart(2, '0')}  ${c.title.replace('.', '')}${c.pro ? '  ·  NOVA Pro' : ''}`, 64, 40, { size: 24, w: 600, base: 'middle', color: 'rgba(255,255,255,.62)', a: tagA, v: true, track: 0.02 });

    if (c.icons) drawIcons(c, t);
    else if (t > c.s0 - 0.5) {
      const p = chapterP(c, t);
      c.items.forEach((it, i) => {
        const d = i - p; if (Math.abs(d) > 1.6) return;
        const ad = Math.min(1, Math.abs(d)), s = 1 - 0.07 * ad, a = 1 - 0.6 * ad;
        const st = c.s0 + i * BAR, zoom = c.walls ? 1.0 + 0.04 * gl(t, st - 0.2, BAR + 0.6) : lerp(1, it[2][2], gl(t, st + 0.25, BAR + 0.1));
        drawScreen(it[0], FX + d * SP * (1 - 0.04 * ad), FY, s, a, c.walls ? [720, 450] : it[2], zoom);
        const pa = clamp(1 - Math.abs(d) * 3);
        pill(it[1], FX, 1012, pa * (1 - gl(t, c.t1 - 0.5, 0.3)), c.walls ? it[2] : null);
      });
    }
  }

  drawWall(t);

  // end card
  if (t >= T.end) {
    const e = gl(t, T.end, 0.9);
    glow(W / 2, 360, 620, 0.3 * e, [245, 142, 30]); glow(W / 2, 400, 620, 0.3 * e, [40, 120, 255]);
    starImg(W / 2, 330, lerp(120, 170, e), e);
    if (t >= T.end + 0.3) { const g = gl(t, T.end + 0.3); text(ctx, 'NOVA OS', W / 2 + 16, 540 + 30 * (1 - g), { size: 96, w: 600, track: 0.36, align: 'center', base: 'middle', color: '#fff', a: g, v: true }); }
    headline(ctx, 'Coming soon.', W / 2, 690, 84, T.soon, 999, t, { color: 'rgb(255,174,90)' });
    if (t >= T.site) text(ctx, 'byeno.org', W / 2, 800, { size: 44, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.75)', a: gl(t, T.site), v: true });
  }
  // fade out at the very end
  const fo = clamp((t - (DUR - 0.8)) / 0.8); if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
}

// exports for the music: chapter titles, every slide (on the downbeats), the wall and the end
const LINES = [['This is NOVA OS.', 0.9], ...CHAPTERS.map(c => [c.title, c.t0 + 0.15]), ['Every screen.', T.wallLine], ['Designed.', T.wallLine + 1.0], ['Coming soon.', T.soon]];
const SLIDES = []; CHAPTERS.forEach(c => { if (!c.icons) for (let k = 0; k < c.items.length; k++) SLIDES.push(c.s0 + k * BAR); SLIDES.push(c.t1); });
T.sections = CHAPTERS.map(c => ({ title: c.title, t0: c.t0, s0: c.s0, t1: c.t1, pro: !!c.pro, icons: !!c.icons, walls: !!c.walls }));
T.BAR = BAR;

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
const isFast = t => SLIDES.some(s => Math.abs(t - s) < 0.4) || (t > T.wall && t < T.wall + 3.6);
const ready = (async () => {
  await Promise.all(['400', '500', '600', '700', '900'].map(w => document.fonts.load(`${w} 20px Geist`)));
  await Promise.all(['500', '600', '700', '800'].map(w => document.fonts.load(`${w} 20px GeistV`)));
  SCREENS = await (await fetch('assets/screens.json')).json();
  const keys = new Set(); CHAPTERS.forEach(c => (c.items || []).forEach(it => { if (!c.walls) keys.add(it[0]); }));
  await Promise.all([load('star', 'assets/nova-star.png'),
    ...['original', 'aurora', 'ember', 'lilac', 'ocean', 'citrus'].map(k => load('wall-' + k, `assets/wall-${k}.jpg`)),
    ...[...keys].map(k => load('ui-' + k, `assets/ui-${k}.jpg`)),
    ...SCREENS.map(k => load('th-' + k, `assets/th-${k}.jpg`)),
    ...ICONS.map(([n, inner], i) => Promise.all([
      new Promise(r => { const im = new Image(); im.onload = r; im.src = iconURL(inner, '#f2f2f4'); ICO[i] = im; }),
      new Promise(r => { const im = new Image(); im.onload = r; im.src = iconURL(inner, '#6aa8ff'); ICO_A[i] = im; })]))]);
  ['original', 'aurora', 'ember', 'lilac', 'ocean', 'citrus'].forEach(makeBG);
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, LINES, W, H, CUTS: SLIDES, STEPS: CHAPTERS.map(c => c.t0) };
})();
