// NOVA OS — "ok we need to talk" Short, 1080x1920. Text only, no voice: honest about using AI, a diagram of how NOVA is
// made, and a call for beta testers. Written lowercase, the way the dev types. Pure function of time: seek(t) draws frame t.
(() => {
const W = 1080, H = 1920, DUR = 41.0;
const LAND = new URLSearchParams(location.search).has('land');   // 1920x1080 version: the same layout, scaled into the middle
const OW = LAND ? 1920 : W, OH = LAND ? 1080 : H, LS = 0.78;
const CX = W / 2;
const EMOJI = '"Noto Color Emoji"';

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
const back = u => { u = clamp(u); const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const lerp = (a, b, u) => a + (b - a) * u;
const gl = (t, a, d = 0.5) => ease((t - a) / d);
const win = (t, a, b, fi = 0.35, fo = 0.35) => gl(t, a, fi) * (1 - gl(t, b, fo));   // visible between a and b
const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
cv.width = OW; cv.height = OH;
const IMG = {};
const load = (k, src) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.onerror = () => r(); i.src = src; });
function rr(g, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.roundRect(x, y, w, h, r); }
function text(s, x, y, o) {
  const a = o.a == null ? 1 : o.a; if (a <= 0) return;
  ctx.save(); ctx.font = `${o.w || 700} ${o.size}px GeistV, ${EMOJI}`;
  ctx.fillStyle = o.color || '#fff'; ctx.globalAlpha *= a; ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
  ctx.letterSpacing = (o.track == null ? -0.03 : o.track) * o.size + 'px'; ctx.fillText(s, x, y); ctx.restore();
}
function measure(s, size, w = 700, track = -0.03) { ctx.save(); ctx.font = `${w} ${size}px GeistV, ${EMOJI}`; ctx.letterSpacing = track * size + 'px'; const m = ctx.measureText(s).width; ctx.restore(); return m; }
// words rise in one by one
function say(s, y, size, tin, tout, t, o = {}) {
  if (t < tin || t > tout + 0.5) return;
  const w = o.w || 800, gap = size * 0.26, words = s.split(' '), ws = words.map(x => measure(x, size, w));
  const total = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1), outE = gl(t, tout, 0.35);
  let x = CX - total / 2;
  words.forEach((word, i) => {
    const e = ease((t - tin - i * (o.step || 0.06)) / 0.45);
    text(word, x + ws[i] / 2, y + 26 * (1 - e) - 14 * outE, { size, w, color: o.color || '#fff', a: e * (1 - outE) });
    x += ws[i] + gap;
  });
}
// typewriter with a blinking cursor
function type(s, y, size, tin, tout, t, cps = 16, o = {}) {
  if (t < tin || t > tout + 0.4) return;
  const n = Math.min(s.length, Math.floor((t - tin) * cps)), out = gl(t, tout, 0.3), shown = s.slice(0, n);
  const full = measure(s, size, o.w || 800), x0 = CX - full / 2;
  text(shown, x0, y, { size, w: o.w || 800, align: 'left', color: o.color || '#fff', a: 1 - out });
  const blink = (n < s.length || Math.floor(t * 2.2) % 2 === 0) ? 1 : 0;
  if (blink && out < 1) { ctx.fillStyle = `rgba(106,168,255,${1 - out})`; ctx.fillRect(x0 + measure(shown, size, o.w || 800) + 6, y - size * 0.42, size * 0.09, size * 0.84); }
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
function glow(x, y, r, a, col) {
  if (a <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
// a sticker: white die-cut border, slaps on with a bounce and a little tilt
function sticker(s, x, y, rot, size, tin, tout, t, bg = '#ffd84d', fg = '#111') {
  if (t < tin || t > tout + 0.4) return;
  const e = clamp((t - tin) / 0.35), p = back(e), out = gl(t, tout, 0.3);
  const w = measure(s, size, 800, -0.02) + size * 1.1, h = size * 1.7;
  ctx.save(); ctx.globalAlpha = clamp(e * 3) * (1 - out); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(lerp(1.6, 1, p), lerp(1.6, 1, p));
  rr(ctx, -w / 2 - 9, -h / 2 - 9, w + 18, h + 18, h / 2 + 9); ctx.fillStyle = '#fff'; ctx.fill();
  rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.fill();
  text(s, 0, 2, { size, w: 800, color: fg, track: -0.02 });
  ctx.restore();
}

// ---------- timings ----------
const E = {
  ok: 0.6, talk: 1.6,
  call: 4.2, truth: 8.4, yes: 9.8, stamp: 10.6,
  how: 13.2, nodes: [14.0, 15.1, 16.2, 17.3], loopEnd: 21.0,
  mind1: 21.5, mind2: 22.7, dream: 24.2,
  trust: 27.0, fair: 28.1,
  beta: 29.4, bugs: 30.6, tell: 31.8,
  want: 34.0, discord: 34.8,
  end: 37.2,
};

// 1. the comments, floating in (no usernames, on purpose)
const BUBBLES = [['ai slop', -1, 700, 4.5], ['vibecoded 😭', 1, 860, 4.9], ['claude generated', -1, 1020, 5.3], ['average ai slop', 1, 1180, 5.7], ['ai coded lmao', -1, 1340, 6.1]];
function bubbles(t) {
  const out = gl(t, E.truth - 0.5, 0.4);
  BUBBLES.forEach(([s, side, y, t0], i) => {
    const e = clamp((t - t0) / 0.5); if (e <= 0 || out >= 1) return;
    const w = measure(s, 46, 600, -0.01) + 170, x = CX - w / 2 + side * 120 + side * 500 * (1 - ease(e)) + 10 * Math.sin(t * 1.4 + i);
    ctx.save(); ctx.globalAlpha = ease(e) * (1 - out);
    ctx.translate(x + w / 2, y); ctx.rotate(side * 0.025); ctx.translate(-(x + w / 2), -y);
    rr(ctx, x, y - 50, w, 100, 50); ctx.fillStyle = '#18181d'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 52, y, 28, 0, Math.PI * 2); ctx.fillStyle = '#2c2c32'; ctx.fill();
    ctx.drawImage(iconImg('user', '#77777f'), x + 34, y - 18, 36, 36);
    text(s, x + 100, y + 2, { size: 46, w: 600, align: 'left', color: '#e4e4e7', track: -0.01 });
    ctx.restore();
  });
}

// 2. the diagram: how NOVA actually gets made
const NODES = [
  { em: '💡', label: 'my idea', who: 'me', ang: -Math.PI / 2 },
  { em: '🤖', label: 'ai helps build it', who: 'ai', ang: 0 },
  { em: '🧪', label: 'i test it', who: 'me', ang: Math.PI / 2 },
  { em: '🔁', label: 'not good? redo', who: 'me', ang: Math.PI },
];
const DC = { x: CX, y: 1010, r: 290 };
function diagram(t) {
  const a = win(t, E.how - 0.1, E.loopEnd, 0.4, 0.45); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  // the ring of arrows, drawn as each step appears
  const prog = clamp((t - E.nodes[0]) / (E.nodes[3] + 1.0 - E.nodes[0]));
  ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(255,255,255,.18)';
  ctx.beginPath(); ctx.arc(DC.x, DC.y, DC.r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ease(prog)); ctx.stroke();
  for (let i = 0; i < 4; i++) {                       // arrow heads between the nodes
    const ang = NODES[i].ang + Math.PI / 4, k = clamp((t - E.nodes[i] - 0.4) / 0.3); if (k <= 0) continue;
    const x = DC.x + DC.r * Math.cos(ang), y = DC.y + DC.r * Math.sin(ang);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang + Math.PI / 2); ctx.globalAlpha *= k; ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-12, -13); ctx.lineTo(-12, 13); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  // a dot running around the loop once it's complete
  if (t > E.nodes[3] + 1.0) {
    const u = ((t - E.nodes[3] - 1.0) / 1.6) % 1, ang = -Math.PI / 2 + Math.PI * 2 * u;
    glow(DC.x + DC.r * Math.cos(ang), DC.y + DC.r * Math.sin(ang), 60, 0.6, '106,168,255');
    ctx.beginPath(); ctx.arc(DC.x + DC.r * Math.cos(ang), DC.y + DC.r * Math.sin(ang), 11, 0, Math.PI * 2); ctx.fillStyle = '#9cc4ff'; ctx.fill();
  }
  NODES.forEach((n, i) => {
    const t0 = E.nodes[i], e = clamp((t - t0) / 0.4); if (e <= 0) return;
    const p = back(e), x = DC.x + DC.r * Math.cos(n.ang), y = DC.y + DC.r * Math.sin(n.ang), me = n.who === 'me';
    ctx.save(); ctx.globalAlpha *= clamp(e * 3); ctx.translate(x, y); ctx.scale(p, p);
    ctx.beginPath(); ctx.arc(0, 0, 86, 0, Math.PI * 2); ctx.fillStyle = me ? '#132238' : '#241a33'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = me ? 'rgba(106,168,255,.7)' : 'rgba(190,150,255,.7)'; ctx.stroke();
    text(n.em, 0, 4, { size: 76, w: 400, track: 0 });
    ctx.restore();
    // label + who chip, placed outside the ring
    const lx = x + Math.cos(n.ang) * (i % 2 ? 0 : 0), ly = y + (i === 0 ? -150 : i === 2 ? 150 : 140);
    const la = clamp((t - t0 - 0.15) / 0.4);
    text(n.label, lx, ly, { size: 40, w: 700, color: '#fff', a: la * ctx.globalAlpha });
    const cw = measure(n.who, 26, 800, 0.08) + 34;
    ctx.save(); ctx.globalAlpha *= la; rr(ctx, lx - cw / 2, ly + 30, cw, 40, 20); ctx.fillStyle = me ? 'rgba(106,168,255,.22)' : 'rgba(190,150,255,.22)'; ctx.fill(); ctx.restore();
    text(n.who.toUpperCase(), lx, ly + 51, { size: 24, w: 800, color: me ? '#9cc4ff' : '#d4bfff', track: 0.1, a: la * ctx.globalAlpha });
  });
  ctx.restore();
  // the takeaway in the middle
  const m = win(t, E.nodes[3] + 1.2, E.loopEnd, 0.4, 0.4);
  text('3 of 4', DC.x, DC.y - 26, { size: 76, w: 800, a: m });
  text('are me', DC.x, DC.y + 40, { size: 44, w: 600, color: '#9cc4ff', a: m });
}

// 3. bugs crawling around the beta tester part
function bugs(t) {
  const a = win(t, E.bugs - 0.1, E.want - 0.3, 0.3, 0.4); if (a <= 0) return;
  for (let i = 0; i < 9; i++) {
    const sp = 0.10 + hash(i) * 0.08, u = (hash(i + 20) + (t - E.bugs) * sp) % 1;
    const side = i % 2 ? 1 : 0, x = (side ? 930 : 60) + hash(i + 40) * 90 + 30 * Math.sin(t * 2 + i), y = 1980 - u * 2100;
    const ang = Math.atan2(-2100 * sp, 60 * Math.cos(t * 2 + i)) + Math.PI / 2;
    ctx.save(); ctx.globalAlpha = a * 0.9; ctx.translate(x, y); ctx.rotate(ang + 0.3 * Math.sin(t * 9 + i));
    text('🐛', 0, 0, { size: 64 + hash(i + 5) * 30, w: 400, track: 0 }); ctx.restore();
  }
}

function seek(t) {
  t = clamp(t, 0, DUR - 1e-6);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#060608'; ctx.fillRect(0, 0, OW, OH);
  if (LAND) ctx.setTransform(LS, 0, 0, LS, OW / 2 - CX * LS, OH / 2 - 960 * LS);
  glow(CX, 1000, 1000, 0.07 + 0.05 * win(t, E.yes, E.trust), '60,110,255');
  glow(CX, 1000, 700, 0.10 * win(t, E.mind1, E.trust), '255,170,90');

  // "ok." … "we need to talk."
  type('ok.', 860, 200, E.ok, E.call - 0.3, t, 9);
  type('we need to talk.', 1060, 82, E.talk, E.call - 0.3, t, 15);

  // the comments
  say('you keep calling nova', 420, 66, E.call, E.truth - 0.5, t);
  say('"ai slop"', 520, 96, E.call + 0.5, E.truth - 0.5, t, { color: '#ff8a7a' });
  bubbles(t);

  // the truth
  say("so here's the truth.", 780, 70, E.truth, E.how - 0.4, t, { color: '#a1a1aa', w: 700 });
  say('yes. i use ai.', 960, 128, E.yes, E.how - 0.4, t);
  sticker('✅ true', 760, 1140, -0.12, 58, E.stamp, E.how - 0.4, t, '#5fdc86', '#062a14');
  sticker('no secrets here', 360, 1250, 0.08, 40, E.stamp + 0.5, E.how - 0.4, t, '#ffffff', '#111');

  // the diagram
  say("here's how nova actually gets made", 380, 56, E.how, E.loopEnd, t, { w: 700 });
  diagram(t);

  // the mind
  say("the magic isn't the ai.", 760, 78, E.mind1, E.trust - 0.4, t, { color: '#a1a1aa', w: 700 });
  say("it's the mind using it.", 900, 96, E.mind2, E.trust - 0.4, t);
  sticker('🧠 the mind', 330, 1080, -0.1, 50, E.mind2 + 0.6, E.trust - 0.4, t, '#ffd84d', '#2a1f00');
  say('if you can dream it', 1250, 64, E.dream, E.trust - 0.4, t, { color: '#ffc56b' });
  say('you can build it.', 1340, 64, E.dream + 0.7, E.trust - 0.4, t, { color: '#ffc56b' });

  // trust
  say("still don't trust it?", 860, 92, E.trust, E.beta - 0.4, t);
  say('fair.', 1000, 92, E.fair, E.beta - 0.4, t, { color: '#9cc4ff' });

  // beta testers
  bugs(t);
  say("i'm picking", 640, 80, E.beta, E.want - 0.4, t, { color: '#a1a1aa', w: 700 });
  say('beta testers.', 760, 120, E.beta + 0.3, E.want - 0.4, t);
  say('break it.', 960, 72, E.bugs, E.want - 0.4, t);
  say('find the bugs.', 1050, 72, E.bugs + 0.45, E.want - 0.4, t);
  say('tell me everything.', 1140, 72, E.tell, E.want - 0.4, t, { color: '#9cc4ff' });
  sticker('🐛 bug hunters wanted', CX, 1330, 0.05, 44, E.tell + 0.6, E.want - 0.4, t, '#ff8a7a', '#2a0700');

  // join
  say('want in?', 820, 120, E.want, E.end - 0.4, t);
  say('join the discord', 980, 80, E.discord, E.end - 0.4, t, { color: '#9cc4ff' });
  sticker('link in description 👇', CX, 1150, -0.06, 46, E.discord + 0.7, E.end - 0.4, t, '#ffffff', '#111');

  // end
  const end = gl(t, E.end, 0.6);
  if (end > 0) {
    starImg(CX, 820, lerp(110, 160, end), end);
    text('NOVA OS', CX + 14, 1000 + 30 * (1 - end), { size: 92, w: 600, track: 0.36, a: end });
    say('still building.', 1120, 64, E.end + 0.7, 999, t, { w: 700, color: '#a1a1aa' });
    if (t > E.end + 1.4) text('byeno.org', CX, 1210, { size: 44, w: 600, color: 'rgba(255,255,255,.75)', a: gl(t, E.end + 1.4) });
  }
  const fo = clamp((t - (DUR - 0.6)) / 0.6); if (fo > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, OW, OH); }
}

const acc = document.createElement('canvas'); acc.width = OW; acc.height = OH; const aC = acc.getContext('2d');
function renderFrame(f, fps = 60, n = 4) {
  const t0 = f / fps;
  if (n <= 1) { seek(t0); return; }
  aC.setTransform(1, 0, 0, 1, 0, 0); aC.clearRect(0, 0, OW, OH);
  for (let i = 0; i < n; i++) { seek(t0 + ((i + 0.5) / n - 0.5) / fps * 0.9); aC.globalAlpha = 1 / (i + 1); aC.drawImage(cv, 0, 0); }
  aC.globalAlpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(acc, 0, 0);
}
const STICK = [E.stamp, E.stamp + 0.5, E.mind2 + 0.6, E.tell + 0.6, E.discord + 0.7];
const isFast = t => STICK.some(x => t > x - 0.05 && t < x + 0.4) || BUBBLES.some(b => t > b[3] && t < b[3] + 0.5);
const ready = (async () => {
  await Promise.all(['400', '600', '700', '800'].map(w => document.fonts.load(`${w} 20px GeistV`)));
  await document.fonts.load('40px "Noto Color Emoji"', '💡🤖🧪🔁🧠🐛✅👇😭');
  await load('star', 'assets/nova-star.png');
  for (let x = 0; x < DUR; x += 0.25) seek(x);
  await Promise.all(Object.values(icon).map(im => im.decode().catch(() => {})));
})();
// events for the music: types, pops, stamps
const EV = { E, bubbles: BUBBLES.map(b => b[3]), stickers: STICK, nodes: E.nodes };
window.NOVA = { seek, renderFrame, isFast, ready, DUR, T: {}, LINES: [], W: OW, H: OH, EV, END: E.end };
})();
