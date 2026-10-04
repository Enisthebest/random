// ---------- "NOVA OS in 20 seconds": a screen-recording style tour ----------
// The phone shows a window onto the 1440x900 screens; a camera (cx, cy, w in screen px) glides between shots.
const VP = [0, 300, 1080, 1500];            // viewport on the 1080x1920 canvas
const VA = (VP[2] - VP[0]) / (VP[3] - VP[1]); // viewport aspect (0.9)
const SHOTS = [
  { t: 0.0, img: 'shell-lock', cam: [720, 430, 760], cap: 'Wake it up.' },
  { t: 2.0, img: 'shell-lock-password', cam: [720, 470, 700], cap: 'Just your password.' },
  { t: 3.6, img: 'shell-desktop', cam: [1060, 330, 760], cap: 'A clean desktop.' },
  { t: 5.0, img: 'shell-control', cam: [1150, 330, 620], cap: 'Everything in one place.' },
  { t: 8.0, img: 'shell-wifi', cam: [1250, 300, 560], cap: 'Pick a network.' },
  { t: 10.6, img: 'launcher-open', cam: [720, 400, 760], cap: 'Super + Space.' },
  { t: 12.4, img: 'launcher-search', cam: [720, 380, 720], cap: 'Find anything.' },
  { t: 14.4, img: 'monitor', cam: [700, 450, 810], cap: 'Opens instantly.' },
  { t: 16.8, img: 'shield', cam: [640, 450, 810], cap: 'Privacy. One tap each.' },
  { t: 19.4, img: 'browser-newtab', cam: [720, 450, 810], cap: 'Private by default.' },
];
const ENDT = 22.2;
// cursor keyframes in screen px; clicks; keycaps
const CURSOR = [[3.7, 640, 520], [4.6, 1405, 27], [5.6, 1405, 27], [7.3, 1305, 128], [8.6, 1305, 128], [9.6, 1180, 420]];
const CLICKS = [4.75, 7.45];
const KEYS = [{ t: 9.9, keys: ['super', 'space'] }, { t: 11.7, keys: ['m', 'o'] }, { t: 13.9, keys: ['↵'] }, { t: 1.6, keys: ['any key'] }];

const shotIdx = t => { let i = 0; SHOTS.forEach((s, k) => { if (t >= s.t) i = k; }); return i; };
function camAt(t) {
  const i = shotIdx(t), s = SHOTS[i];
  const keep = c => { const w = Math.min(c[2], 900 * VA), h = w / VA; return [clamp(c[0], w / 2, 1440 - w / 2), clamp(c[1], h / 2, 900 - h / 2), w]; };
  if (i === 0) return keep(s.cam);
  const e = gl(t, s.t - 0.15, 0.8), a = keep(SHOTS[i - 1].cam), b = keep(s.cam);
  return a.map((v, k) => k === 2 ? Math.exp(lerp(Math.log(v), Math.log(b[2]), e)) : lerp(v, b[k], e));
}
// screen px -> canvas px through the camera
function toCanvas(cam, x, y) {
  const w = cam[2], h = w / VA, k = (VP[2] - VP[0]) / w;
  return [VP[0] + (x - (cam[0] - w / 2)) * k, VP[1] + (y - (cam[1] - h / 2)) * k];
}
function drawShot(key, cam, a) {
  if (a <= 0) return;
  const w = cam[2], h = w / VA, im = IMG[key];
  ctx.save(); ctx.globalAlpha *= a;
  ctx.drawImage(im, cam[0] - w / 2, cam[1] - h / 2, w, h, VP[0], VP[1], VP[2] - VP[0], VP[3] - VP[1]);
  ctx.restore();
}
function cursorAt(t) {
  if (t < CURSOR[0][0] || t > CURSOR[CURSOR.length - 1][0] + 0.4) return null;
  for (let i = 0; i < CURSOR.length - 1; i++) {
    const [t0, x0, y0] = CURSOR[i], [t1, x1, y1] = CURSOR[i + 1];
    if (t <= t1) { const e = ease((t - t0) / (t1 - t0)); return [lerp(x0, x1, e), lerp(y0, y1, e)]; }
  }
  const l = CURSOR[CURSOR.length - 1]; return [l[1], l[2]];
}
const ARROW = [[0, 0], [0, 16.2], [3.9, 12.6], [6.5, 18.7], [9.1, 17.6], [6.6, 11.7], [11.6, 11.6]];
function drawCursor(x, y, press, a) {
  const k = 3.0 * (1 - 0.12 * press);
  ctx.save(); ctx.globalAlpha = a; ctx.setTransform(k, 0, 0, k, x, y);
  const path = () => { ctx.beginPath(); ARROW.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); };
  path(); ctx.lineJoin = 'round'; ctx.lineWidth = 2.2; ctx.strokeStyle = '#fff'; ctx.stroke();
  path(); ctx.fillStyle = '#000'; ctx.fill();
  ctx.restore();
}
function keycap(label, x, y, a, press) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = '700 44px GeistV'; const w = Math.max(96, ctx.measureText(label).width + 56);
  const dy = 6 * press;
  rr(ctx, x - w / 2, y - 48 + 10, w, 96, 22); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill();
  rr(ctx, x - w / 2, y - 48 + dy, w, 96, 22); ctx.fillStyle = '#f2f2f4'; ctx.fill();
  ctx.fillStyle = '#16161a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x, y + dy + 2);
  ctx.restore();
}
function pill(text, x, y, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = '700 46px GeistV'; ctx.letterSpacing = '-1px';
  const w = ctx.measureText(text).width + 64;
  rr(ctx, x - w / 2, y - 44, w, 88, 44); ctx.fillStyle = 'rgba(18,18,22,.92)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 2);
  ctx.restore();
}
function starImg(cx, cy, size, a = 1) {
  if (a <= 0) return;
  const b = [186, 41, 1187, 1100], bw = b[2] - b[0], bh = b[3] - b[1], k = size / Math.max(bw, bh);
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(IMG.star, b[0], b[1], bw, bh, cx - bw * k / 2, cy - bh * k / 2, bw * k, bh * k); ctx.restore();
}

function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  // soft wallpaper glow behind everything
  ctx.save(); ctx.globalAlpha = 0.5; ctx.filter = 'blur(60px)'; ctx.drawImage(IMG.wall, 0, 0, 1920, 1080, -500, 400, 2600, 1460); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, W, H);

  const endE = gl(t, ENDT, 0.8);
  // header: stories-style progress and the title
  const segs = SHOTS.length, gap = 8, sw = (W - 120 - gap * (segs - 1)) / segs;
  for (let i = 0; i < segs; i++) {
    const s0 = SHOTS[i].t, s1 = i + 1 < segs ? SHOTS[i + 1].t : ENDT, f = clamp((t - s0) / (s1 - s0));
    const x = 60 + i * (sw + gap);
    rr(ctx, x, 100, sw, 8, 4); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill();
    if (f > 0) { rr(ctx, x, 100, sw * f, 8, 4); ctx.fillStyle = '#fff'; ctx.fill(); }
  }
  text(ctx, 'NOVA OS in 20 seconds', 540, 200, { size: 58, w: 800, track: -0.03, align: 'center', base: 'middle', color: '#fff', a: 1 - endE, v: true });

  // the screen
  if (t < ENDT + 0.9) {
    const cam = camAt(t), i = shotIdx(t);
    ctx.save(); ctx.globalAlpha = 1 - endE;
    rr(ctx, VP[0] + 24, VP[1], VP[2] - VP[0] - 48, VP[3] - VP[1], 40); ctx.clip();
    const cut = (s => (s ? gl(t, s.t - 0.15, 0.35) : 1))(SHOTS[i]);
    if (i > 0 && cut < 1) drawShot('ui-' + SHOTS[i - 1].img, cam, 1);
    drawShot('ui-' + SHOTS[i].img, cam, i === 0 ? 1 : cut);
    // cursor + click ripple
    const c = cursorAt(t);
    if (c) {
      const [cx, cy] = toCanvas(cam, c[0], c[1]);
      for (const ct of CLICKS) {
        const u = (t - ct) / 0.5;
        if (u > 0 && u < 1) { ctx.beginPath(); ctx.arc(cx, cy, 20 + 70 * ease(u), 0, Math.PI * 2); ctx.lineWidth = 5; ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - u)})`; ctx.stroke(); }
      }
      const press = CLICKS.reduce((m, ct) => Math.max(m, Math.exp(-Math.abs(t - ct) / 0.06) * (Math.abs(t - ct) < 0.15 ? 1 : 0)), 0);
      drawCursor(cx, cy, press, clamp((t - CURSOR[0][0]) / 0.3) * (1 - clamp((t - CURSOR[CURSOR.length - 1][0]) / 0.4)));
    }
    ctx.restore();
    rr(ctx, VP[0] + 24, VP[1], VP[2] - VP[0] - 48, VP[3] - VP[1], 40); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,255,255,${0.12 * (1 - endE)})`; ctx.stroke();

    // keycaps pop up over the bottom of the screen
    for (const k of KEYS) {
      const u = t - k.t; if (u < -0.05 || u > 1.1) continue;
      const a = clamp(u / 0.12) * (1 - clamp((u - 0.8) / 0.3));
      const total = k.keys.length, spacing = 230;
      k.keys.forEach((label, j) => {
        const pt = u - j * 0.12, press = pt > 0 && pt < 0.2 ? Math.sin(Math.PI * pt / 0.2) : 0;
        keycap(label, 540 + (j - (total - 1) / 2) * spacing, VP[3] - 130, a, press);
      });
    }
    // caption under the screen
    for (let k = 0; k < SHOTS.length; k++) {
      const s0 = SHOTS[k].t + 0.15, s1 = k + 1 < SHOTS.length ? SHOTS[k + 1].t - 0.1 : ENDT - 0.1;
      if (t < s0 || t > s1 + 0.4) continue;
      const e = gl(t, s0, 0.5), o = gl(t, s1, 0.3);
      pill(SHOTS[k].cap, 540, 1590 + 20 * (1 - e), e * (1 - o) * (1 - endE));
    }
  }

  // end card
  if (endE > 0) {
    starImg(540, 820, lerp(140, 200, endE), endE);
    if (t >= ENDT + 0.2) { const f = gl(t, ENDT + 0.2); text(ctx, 'NOVA OS', 556, 1000 + 30 * (1 - f), { size: 92, w: 600, track: 0.36, align: 'center', base: 'middle', color: '#fff', a: f, v: true }); }
    headline(ctx, 'Coming soon.', 540, 1130, 84, ENDT + 0.9, 999, t, { color: 'rgb(255,174,90)' });
    if (t >= ENDT + 1.4) text(ctx, 'byeno.org', 540, 1240, { size: 46, w: 600, align: 'center', base: 'middle', color: 'rgba(255,255,255,.75)', a: gl(t, ENDT + 1.4) });
  }
}

