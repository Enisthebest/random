// NOVA OS — 82s hype trailer, 1920x1080. Pure function of time: seek(t) draws frame t.
(() => {
const W = 1920, H = 1080, DUR = 82;
const BPM = 128, BEAT = 60 / BPM, BAR = 4 * BEAT;          // 0.46875s, 1.875s
const T = {
  l1: 2.6, l1Out: 6.4, l2: 6.9, l2Out: 10.4,               // hook lines
  glow: 10.0, flick: 13.1, ready: 16.9,                     // build
  drop1: 10 * BAR,                                          // 18.75
  brk: 26 * BAR,                                            // 48.75
  pro: 26 * BAR + 0.3, ace: 27.5 * BAR, draft: 29 * BAR, ready2: 31 * BAR,
  drop2: 32 * BAR,                                          // 60
  star: 39 * BAR,                                           // 73.125
  end: 40 * BAR,                                            // 75
  soon: 40 * BAR + 1.4, site: 40 * BAR + 2.1,
};
const G = 0.8;
const ORANGE = 'rgb(255,174,90)';

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
const easeOut = bezier(.2, .8, .2, 1);                       // for punch-ins on the beat
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const gl = (t, a, d = G) => ease((t - a) / d);
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

// Apple-style line: words rise one after another, line lifts away together.
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
// Hype type: lands on the beat — scales down from 1.18 and snaps in within 0.22s.
function punch(g, s, x, y, size, t0, t, o = {}) {
  const u = t - t0; if (u < 0) return;
  const e = easeOut(u / 0.22), k = lerp(1.18, 1, e) * (1 + 0.025 * u);
  g.save(); g.translate(x, y); g.scale(k, k);
  text(g, s, 0, 0, { size, w: o.w || 800, track: o.track == null ? -0.04 : o.track, align: o.align || 'center', base: 'middle', color: o.color || '#fff', a: clamp(u / 0.06), v: true });
  g.restore();
}
function aura(g, cx, cy, w, a, t, c1 = [245, 142, 30], c2 = [40, 120, 255]) {
  if (a <= 0) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  const blob = (x, y, r, c, al) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, rgba(c, al)); gr.addColorStop(0.5, rgba(c, al * 0.45)); gr.addColorStop(1, rgba(c, 0));
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  };
  blob(cx - w * 0.25 + 40 * Math.sin(t * 0.8), cy + 30 * Math.cos(t * 0.6), w * 0.6, c1, 0.32 * a);
  blob(cx + w * 0.25 + 40 * Math.cos(t * 0.7), cy - 30 + 20 * Math.sin(t * 0.5), w * 0.6, c2, 0.36 * a);
  blob(cx, cy, w * 0.3, [255, 240, 225], 0.1 * a);
  g.restore();
}
function star(g, cx, cy, size, a = 1) {
  if (a <= 0) return;
  const im = IMG.star, b = [186, 41, 1187, 1100], bw = b[2] - b[0], bh = b[3] - b[1], k = size / Math.max(bw, bh);
  g.save(); g.globalAlpha *= a; g.drawImage(im, b[0], b[1], bw, bh, cx - bw * k / 2, cy - bh * k / 2, bw * k, bh * k); g.restore();
}
function icon(g, name, cx, cy, size, color, a = 1) {
  const im = IMG['i-' + name]; if (!im || a <= 0) return;
  g.save(); g.globalAlpha *= a; g.drawImage(im, cx - size / 2, cy - size / 2, size, size); g.restore();
}
// full-bleed image (cover), with zoom about the centre
function cover(g, key, zoom = 1, a = 1, dx = 0, dy = 0) {
  const im = IMG[key]; if (!im || a <= 0) return;
  const k = Math.max(W / im.width, H / im.height) * zoom, w = im.width * k, h = im.height * k;
  g.save(); g.globalAlpha *= a; g.drawImage(im, (W - w) / 2 + dx, (H - h) / 2 + dy, w, h); g.restore();
}
const isDesk = k => k.startsWith('app-launcher');
// the window inside each 1440x900 app screenshot sits at (80,76) 1280x776
function appWindow(g, key, cx, cy, w, a = 1) {
  const im = IMG[key]; if (!im || a <= 0) return;
  const h = w * 776 / 1280, x = cx - w / 2, y = cy - h / 2;
  g.save(); g.globalAlpha *= a; rr(g, x, y, w, h, w * 24 / 1280); g.clip();
  g.drawImage(im, 80, 76, 1280, 776, x, y, w, h); g.restore();
  rr(g, x, y, w, h, w * 24 / 1280); g.lineWidth = 2; g.strokeStyle = `rgba(255,255,255,${0.12 * a})`; g.stroke();
}
// an app on a wallpaper: launcher shots show the whole desktop, others float the window
function appShot(g, key, wall, u, dur, cx, cy, w) {
  const e = easeOut(u / 0.28), k = lerp(1.1, 1, e) + 0.03 * u / dur;
  if (isDesk(key)) { cover(g, key, k + 0.02); return; }
  cover(g, 'wall-' + wall, 1.08 + 0.04 * u / dur);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, W, H);
  g.save(); g.translate(cx, cy); g.scale(k, k); g.translate(-cx, -cy);
  appWindow(g, key, cx, cy, w); g.restore();
}
function vignette(g, a) {
  const gr = g.createLinearGradient(0, H * 0.4, 0, H);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${a})`);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
function flash(g, t, t0, d = 0.35, peak = 0.85) {
  const u = (t - t0) / d; if (u < 0 || u > 1) return;
  g.fillStyle = `rgba(255,255,255,${peak * (1 - u) ** 2})`; g.fillRect(0, 0, W, H);
}

// ---------- shots ----------
const WALLS = ['original', 'aurora', 'ember', 'lilac', 'ocean', 'citrus'];
const ACC = { original: [59, 139, 255], aurora: [25, 201, 149], ember: [255, 79, 139], lilac: [162, 107, 255], ocean: [18, 184, 240], citrus: [168, 230, 50] };
const S = [];          // { t0, t1, kind, ... }
const add = (t0, d, o) => S.push(Object.assign({ t0, t1: t0 + d }, o));
const HALF = BAR / 2;
(() => {
  // drop 1: half-bar slots
  let t = T.drop1;
  const slot = o => { add(t, HALF, o); t += HALF; };
  slot({ kind: 'title' }); slot({ kind: 'title' });
  slot({ kind: 'word', s: 'Private.' }); slot({ kind: 'word', s: 'Fast.' }); slot({ kind: 'word', s: 'Yours.', color: ORANGE });
  slot({ kind: 'word', s: 'Built on Arch.', size: 150 });
  [['shield', 'Shield.'], ['guard', 'Guard.'], ['files', 'Files.'], ['monitor', 'Monitor.'], ['ledger', 'Ledger.'],
   ['images', 'Images.'], ['fix', 'Fix.'], ['settings', 'Settings.'], ['launcher-search', 'Launcher.'], ['launcher-calc', 'Instant answers.']]
    .forEach(([k, s], n) => slot({ kind: 'app', key: 'app-' + k, s, wall: WALLS[n % 6] }));
  [['shield-check', 'VPN kill switch.'], ['camera-off', 'Camera off.'], ['shuffle', 'MAC randomizer.'], ['brick-wall', 'Firewall on.'],
   ['usb', 'USB lock.'], ['trash-2', 'Secure delete.'], ['user-x', 'No account.'], ['eye-off', 'No tracking.'],
   ['layout-grid', 'Hyprland.'], ['zap', 'Boots in 5s.'], ['phone-off', 'Nothing phones home.']]
    .forEach(([i, s], n) => slot({ kind: 'feat', icon: i, s, c: Object.values(ACC)[n % 6] }));
  // the last 5 half-bars: wallpapers flood every beat under "Your colours."
  add(t, T.brk - t, { kind: 'walls' });
  // drop 2: a cut on every beat; a big word on each bar
  const reel = ['app-shield', 'wall-aurora', 'app-guard', 'app-files', 'wall-ember', 'app-monitor', 'app-images', 'wall-lilac',
    'app-ledger', 'app-fix', 'wall-ocean', 'app-settings', 'app-launcher-search', 'wall-citrus', 'app-images', 'app-launcher-calc',
    'app-shield', 'wall-original', 'app-files', 'app-monitor', 'wall-aurora', 'app-images', 'app-guard', 'wall-ember',
    'app-settings', 'app-ledger', 'wall-ocean', 'app-fix'];
  const words = ['No tracking.', 'No account.', 'No limits.', 'Private.', 'Fast.', 'Light.', 'Yours.'];
  for (let i = 0; i < 28; i++) add(T.drop2 + i * BEAT, BEAT, { kind: 'reel', key: reel[i], word: i % 4 === 0 ? words[i / 4] : null, bar: i % 4 === 0 });
})();
const shotAt = t => { for (let i = S.length - 1; i >= 0; i--) if (t >= S[i].t0 && t < S[i].t1) return S[i]; return null; };
const cuts = () => S.map(s => s.t0);

function drawShot(s, t) {
  const u = t - s.t0;
  if (s.kind === 'title') {
    // NOVA OS slam on the drop (two half-bars: slam, then hold with light)
    const first = s.t0 === T.drop1, base = T.drop1;
    aura(ctx, W / 2, H / 2, 1900, 0.9 + 0.1 * Math.sin(t * 3), t);
    star(ctx, W / 2, H / 2 - 150, 170 * (1 + 0.05 * clamp((t - base) / 2)));
    punch(ctx, 'NOVA OS', W / 2 + 20, H / 2 + 70, 210, base, t, { w: 700, track: 0.22 });
    if (first) flash(ctx, t, base, 0.5, 1);
    return;
  }
  if (s.kind === 'word') {
    aura(ctx, W / 2, H / 2, 1500, 0.35, t);
    punch(ctx, s.s, W / 2, H / 2, s.size || 230, s.t0, t, { color: s.color });
    return;
  }
  if (s.kind === 'app') {
    appShot(ctx, s.key, s.wall, u, HALF, 1290, 540, 1100);
    // a soft dark band on the left so the name reads on any wallpaper
    const gr = ctx.createLinearGradient(0, 0, 900, 0); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, 900, H);
    if (isDesk(s.key)) { vignette(ctx, 0.7); punch(ctx, s.s, 110, H - 140, 130, s.t0 + 0.03, t, { align: 'left' }); }
    else punch(ctx, s.s, 100, H / 2, s.s.length > 10 ? 96 : 130, s.t0 + 0.03, t, { align: 'left' });
    return;
  }
  if (s.kind === 'feat') {
    aura(ctx, W / 2, H / 2, 1400, 0.7, t, s.c, s.c.map(v => v * 0.5));
    const e = easeOut(u / 0.25);
    icon(ctx, s.icon, W / 2, H / 2 - 120 + 30 * (1 - e), 150, '#fff', clamp(u / 0.08));
    punch(ctx, s.s, W / 2, H / 2 + 110, 130, s.t0 + 0.04, t);
    return;
  }
  if (s.kind === 'walls') {
    // a new wallpaper floods out from the centre on every beat
    const n = Math.floor(u / BEAT), cur = WALLS[n % 6], prev = WALLS[(n + 5) % 6];
    cover(ctx, 'wall-' + prev, 1.06);
    const f = easeOut((u - n * BEAT) / 0.35);
    ctx.save(); ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.hypot(W, H) / 2 * f, 0, Math.PI * 2); ctx.clip();
    cover(ctx, 'wall-' + cur, lerp(1.12, 1.06, f)); ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, 0, W, H);
    punch(ctx, 'Your colours.', W / 2, H / 2, 200, s.t0, t);
    return;
  }
  if (s.kind === 'reel') {
    if (s.key.startsWith('wall-')) cover(ctx, s.key, lerp(1.16, 1.05, easeOut(u / 0.25)) + 0.04 * u / BEAT);
    else appShot(ctx, s.key, WALLS[Math.floor((s.t0 - T.drop2) / BEAT) % 6], u, BEAT, W / 2, H / 2, 1500);
    // the bar's word stays for the whole bar
    const barStart = s.bar ? s.t0 : null;
    ctx.fillStyle = 'rgba(0,0,0,.38)'; ctx.fillRect(0, 0, W, H);
    if (s.bar) flash(ctx, t, s.t0, 0.18, 0.35);
    return;
  }
}

function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);

  // ---- 1. build-up ----
  if (t < T.drop1) {
    // a faint pulse of light on every beat, getting stronger
    const pulse = Math.exp(-((t % BEAT) / 0.25)) * clamp(t / T.drop1);
    aura(ctx, W / 2, H / 2, 1700, 0.15 + 0.3 * pulse + 0.5 * gl(t, T.glow, 6), t);
    headline(ctx, "We didn't build another OS.", W / 2, H / 2, 100, T.l1, T.l1Out, t);
    headline(ctx, 'We built yours.', W / 2, H / 2, 128, T.l2, T.l2Out, t, { color: ORANGE });
    // app screens flicker in, faster and faster
    if (t >= T.flick && t < T.ready - 0.1) {
      const keys = ['app-shield', 'wall-aurora', 'app-files', 'app-monitor', 'wall-ember', 'app-guard', 'app-launcher-search', 'wall-lilac', 'app-images', 'app-settings', 'wall-ocean', 'app-fix'];
      const step = t < T.flick + 2 * BEAT * 2 ? BEAT : BEAT / 2;
      const n = Math.floor((t - T.flick) / step), u = (t - T.flick) - n * step;
      const a = Math.exp(-u / (step * 0.45)) * 0.75;
      cover(ctx, keys[n % keys.length], 1.08 + 0.04 * (u / step), a);
    }
    star(ctx, W / 2, H / 2, lerp(0, 120, gl(t, T.glow, 6)), gl(t, T.glow, 4) * (t > T.ready - 0.2 ? 0 : 1));
    headline(ctx, 'Ready?', W / 2, H / 2, 150, T.ready, T.drop1 - 0.6, t);
    // half a beat of black before the drop
    if (t > T.drop1 - BEAT) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
    return;
  }

  // ---- 2. drop 1 + drop 2 shots ----
  const s = shotAt(t);
  if (s && t < T.brk) { drawShot(s, t); return; }

  // ---- 3. breakdown: half-time and calm (Shield, then the launcher) ----
  if (t >= T.brk && t < T.drop2) {
    aura(ctx, W / 2, H / 2, 1700, 0.5, t);
    headline(ctx, 'Built different.', W / 2, H / 2, 120, T.pro, T.ace - 0.6, t, { color: ORANGE });
    if (t >= T.ace - 0.3 && t < T.ready2) {
      const e = gl(t, T.ace - 0.3, 0.9), o = gl(t, T.ready2 - 0.7, 0.6);
      const k = lerp(0.86, 0.9, clamp((t - T.ace) / 6));
      const key = t < T.draft ? 'app-shield' : 'app-launcher-search';
      const w = W * k, h = w * 900 / 1440, x = (W - w) / 2, y = (H - h) / 2 - 30;
      ctx.save(); ctx.globalAlpha = e * (1 - o);
      rr(ctx, x, y, w, h, 28); ctx.clip(); ctx.drawImage(IMG[key], x, y, w, h); ctx.restore();
      // cross-fade Shield -> launcher
      if (t >= T.draft && t < T.draft + 0.6) {
        ctx.save(); ctx.globalAlpha = (1 - gl(t, T.draft, 0.6)) * e; rr(ctx, x, y, w, h, 28); ctx.clip(); ctx.drawImage(IMG['app-shield'], x, y, w, h); ctx.restore();
      }
      ctx.fillStyle = `rgba(0,0,0,${0.3 * e * (1 - o)})`; ctx.fillRect(0, 0, W, H); vignette(ctx, 0.85 * e * (1 - o));
      headline(ctx, '14 protections. One tap each.', W / 2, H - 120, 92, T.ace + 0.2, T.draft - 0.4, t);
      headline(ctx, 'Everything. One search.', W / 2, H - 120, 92, T.draft + 0.2, T.ready2 - 0.6, t);
    }
    headline(ctx, 'Ready?', W / 2, H / 2, 170, T.ready2 + 0.1, T.drop2 - 0.7, t);
    if (t > T.drop2 - BEAT) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
    return;
  }

  // ---- 4. drop 2: a cut every beat, a word every bar ----
  if (t >= T.drop2 && t < T.star) {
    const r = shotAt(t); if (r) drawShot(r, t);
    const bi = Math.floor((t - T.drop2) / BAR);
    const words = ['No tracking.', 'No account.', 'No limits.', 'Private.', 'Fast.', 'Light.', 'Yours.'];
    punch(ctx, words[bi], W / 2, H / 2, bi === 6 ? 260 : 220, T.drop2 + bi * BAR, t, { color: bi === 6 ? ORANGE : '#fff' });
    flash(ctx, t, T.drop2, 0.5, 1);
    return;
  }

  // ---- 5. the star builds, then the final hit ----
  if (t >= T.star && t < T.end) {
    const u = (t - T.star) / BAR;
    aura(ctx, W / 2, H / 2, lerp(900, 2200, u), lerp(0.4, 1.3, u), t);
    star(ctx, W / 2, H / 2, lerp(60, 320, ease(u)));
    // white strobes on 16ths in the last half bar
    const st = t - (T.end - HALF);
    if (st > 0) { const k = (st % (BEAT / 4)) / (BEAT / 4); ctx.fillStyle = `rgba(255,255,255,${0.25 * (1 - k)})`; ctx.fillRect(0, 0, W, H); }
    return;
  }

  // ---- 6. end card ----
  aura(ctx, W / 2, H / 2 - 40, 1900, 1.0, t);
  star(ctx, W / 2, H / 2 - 170, lerp(240, 150, easeOut((t - T.end) / 1.2)));
  punch(ctx, 'NOVA OS', W / 2 + 20, H / 2 + 40, 170, T.end, t, { w: 700, track: 0.24 });
  headline(ctx, 'Coming soon.', W / 2, H / 2 + 190, 84, T.soon, 999, t, { color: ORANGE });
  if (t >= T.site) text(ctx, 'byeno.org', W / 2, H / 2 + 290, { size: 44, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.75)', a: gl(t, T.site) });
  flash(ctx, t, T.end, 0.7, 1);
  // fade to black at the very end
  ctx.fillStyle = `rgba(0,0,0,${gl(t, DUR - 1.2, 1.1)})`; ctx.fillRect(0, 0, W, H);
}

const LINES = [["We didn't build another OS.", T.l1], ['We built yours.', T.l2], ['Ready?', T.ready], ['Built different.', T.pro],
  ['14 protections. One tap each.', T.ace + 0.2], ['Everything. One search.', T.draft + 0.2], ['Ready?', T.ready2 + 0.1], ['Coming soon.', T.soon]];
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
  const jobs = [load('star', 'assets/nova-star.png')];
  WALLS.forEach(k => jobs.push(load('wall-' + k, `assets/nova-${k}-1080p.png`)));
  ['shield', 'guard', 'files', 'monitor', 'ledger', 'images', 'fix', 'settings', 'launcher-search', 'launcher-calc', 'launcher-open']
    .forEach(k => jobs.push(load('app-' + k, `assets/app-${k}.png`)));
  for (const k in window.ICONS) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${window.ICONS[k]}</svg>`;
    jobs.push(load('i-' + k, 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)));
  }
  await Promise.all(jobs);
})();
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T, LINES, W, H, BPM, CUTS: cuts(), STEPS: [] };
})();
