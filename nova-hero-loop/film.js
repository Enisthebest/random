// NOVA website hero loop, 1600x900, 8 s, seamless. A black misty void: the NOVA star glows above a pillar of light,
// fog drifts along the ground, dust rises, and a lone figure stands facing the light. Everything is periodic in LOOP.
(() => {
const W = 1600, H = 900, LOOP = 8, DUR = LOOP;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const TAU = Math.PI * 2, P = t => TAU * t / LOOP;              // phase for anything that must loop
const SX = 1060, SY = 300, GY = 640;                            // star position, ground (horizon) line
let star = null, fogA = null, fogB = null;
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();

function noiseTex(w, h, cells, blur, seed) {   // soft value-noise texture that tiles horizontally
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const s = document.createElement('canvas'); s.width = cells; s.height = Math.max(2, Math.round(cells * h / w)); const sg = s.getContext('2d');
  const id = sg.createImageData(s.width, s.height);
  for (let i = 0; i < id.data.length; i += 4) { const v = Math.pow(rnd(), 1.6) * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  sg.putImageData(id, 0, 0);
  g.imageSmoothingQuality = 'high'; g.filter = `blur(${blur}px)`;
  for (const dx of [-w, 0, w]) g.drawImage(s, dx, 0, w, h);    // wrap so the edges match
  g.filter = 'none'; g.globalCompositeOperation = 'destination-in';   // soft top and bottom so the bands never show an edge
  const m = g.createLinearGradient(0, 0, 0, h); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(0.5, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = m; g.fillRect(0, 0, w, h);
  return c;
}
function glow(x, y, r, a, col) {
  if (a <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(0.4, `rgba(${col},${a * 0.3})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
const DUST = Array.from({ length: 140 }, () => ({ x: rnd(), y: rnd(), s: 0.6 + rnd() * 1.8, ph: rnd(), sp: 1 + Math.floor(rnd() * 2), tw: rnd() * TAU }));

function seek(t) {
  t = ((t % LOOP) + LOOP) % LOOP;
  const ph = P(t), breathe = 1 + 0.06 * Math.sin(ph) + 0.025 * Math.sin(2 * ph + 1);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, W, H);

  ctx.globalCompositeOperation = 'lighter';
  // the sky around the light: very low, cold
  glow(SX, SY + 60, 900, 0.10 * breathe, '90,120,170');
  glow(SX, SY + 200, 520, 0.08 * breathe, '255,170,110');
  // the pillar of light from the ground up to the star
  const pw = 34 * breathe;
  const pg = ctx.createLinearGradient(0, SY, 0, GY + 10); pg.addColorStop(0, 'rgba(255,255,255,0)'); pg.addColorStop(0.25, 'rgba(235,242,255,.5)'); pg.addColorStop(1, 'rgba(255,255,255,.95)');
  ctx.fillStyle = pg; ctx.fillRect(SX - pw / 2, SY, pw, GY - SY + 10);
  for (const [w, a] of [[130, 0.22], [280, 0.10]]) {   // soft halo around the pillar (a squashed radial glow: no hard edges)
    ctx.save(); ctx.translate(SX, (SY + GY) / 2 + 30); ctx.scale(w / 300, 1); glow(0, 0, 300, a * breathe, '200,220,255'); ctx.restore();
  }
  // where the pillar meets the ground: a bright pool, and its reflection on the wet floor
  glow(SX, GY + 4, 320, 0.55 * breathe, '235,240,255');
  glow(SX, GY + 4, 90, 0.9 * breathe, '255,255,255');
  ctx.save(); ctx.translate(SX, GY + 8); ctx.scale(1, 0.12); glow(0, 0, 900, 0.35 * breathe, '220,230,255'); ctx.restore();
  const rg = ctx.createLinearGradient(0, GY, 0, H); rg.addColorStop(0, 'rgba(230,238,255,.16)'); rg.addColorStop(1, 'rgba(230,238,255,0)');
  ctx.save(); ctx.translate(SX, GY + 70); ctx.scale(0.12, 1); glow(0, 0, 160, 0.35 * breathe, '230,238,255'); ctx.restore();   // reflection on the wet ground

  // the star
  glow(SX, SY, 260, 0.45 * breathe, '200,220,255');
  glow(SX, SY, 140, 0.35 * breathe, '255,190,120');
  ctx.globalCompositeOperation = 'source-over';
  const b = [96, 21, 1218, 1107], bw = b[2] - b[0], bh = b[3] - b[1], k = 130 * breathe / Math.max(bw, bh);
  ctx.drawImage(star, b[0], b[1], bw, bh, SX - bw * k / 2, SY - bh * k / 2, bw * k, bh * k);

  // fog: two layers drifting in opposite directions, thicker near the ground
  ctx.globalCompositeOperation = 'lighter';
  const fog = (tex, y, h, a, dx) => {
    const off = ((dx % W) + W) % W;
    ctx.save(); ctx.globalAlpha = a;
    for (const x of [-off, W - off]) ctx.drawImage(tex, x, y, W, h);
    ctx.restore();
  };
  fog(fogA, GY - 120, 260, 0.30, 60 * Math.sin(ph) + t * 0);           // slow sway
  fog(fogB, GY - 40, 320, 0.38, -W * t / LOOP);                        // one full drift per loop: seamless
  fog(fogA, GY + 60, 260, 0.22, W * t / LOOP);
  // fog lit by the pillar
  ctx.save(); ctx.translate(SX, GY + 10); ctx.scale(2.6, 0.5); glow(0, 0, 220, 0.22 * breathe, '235,240,255'); ctx.restore();

  // dust rising through the light (each speck loops 1 or 2 times per LOOP)
  for (const d of DUST) {
    const u = (d.ph + d.sp * t / LOOP) % 1, x = SX + (d.x - 0.5) * 900 + 18 * Math.sin(TAU * u + d.tw), y = GY + 40 - u * 560;
    const near = Math.max(0, 1 - Math.abs(x - SX) / 460), a = Math.sin(Math.PI * u) * (0.25 + 0.75 * near) * 0.55;
    ctx.fillStyle = `rgba(230,236,255,${a})`; ctx.beginPath(); ctx.arc(x, y, d.s, 0, TAU); ctx.fill();
  }

  // the figure, standing in the mist, facing the light
  ctx.globalCompositeOperation = 'source-over';
  const fx = 820, fy = GY + 34, sc = 0.9, sway = 1.2 * Math.sin(ph);
  ctx.save(); ctx.translate(fx + sway * 0.3, fy); ctx.scale(sc, sc); ctx.fillStyle = '#060607';
  ctx.beginPath(); ctx.ellipse(0, -132, 9.5, 11.5, 0, 0, TAU); ctx.fill();                             // head
  ctx.beginPath(); ctx.moveTo(-17, -112); ctx.quadraticCurveTo(0, -120, 17, -112); ctx.lineTo(21, -60);   // shoulders + coat
  ctx.lineTo(16, -14); ctx.lineTo(5, -14); ctx.lineTo(3, 0); ctx.lineTo(-4, 0); ctx.lineTo(-5, -14); ctx.lineTo(-16, -14); ctx.lineTo(-21, -60); ctx.closePath(); ctx.fill();
  // rim light on the side that faces the star (same transform as the body)
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(220,230,255,${0.3 * breathe})`; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(17, -112); ctx.lineTo(21, -60); ctx.lineTo(16, -14); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -132, 9.5, 11.5, 0, -1.2, 1.0); ctx.stroke();
  ctx.restore();
  // ground mist in front of the figure's feet
  ctx.globalCompositeOperation = 'lighter';
  fog(fogB, fy - 70, 160, 0.20, W * t / LOOP + 300);

  // vignette and fade to page black at the edges
  ctx.globalCompositeOperation = 'source-over';
  const v = ctx.createRadialGradient(SX - 100, SY + 200, 200, SX - 100, SY + 200, 1100); v.addColorStop(0, 'rgba(5,5,5,0)'); v.addColorStop(1, 'rgba(5,5,5,.85)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

const acc = document.createElement('canvas'); acc.width = W; acc.height = H; const aC = acc.getContext('2d');
function renderFrame(f, fps = 60, n = 1) { seek(f / fps); }
const ready = (async () => {
  star = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'assets/nova-star.png'; });
  fogA = noiseTex(W, 260, 18, 26, 1); fogB = noiseTex(W, 320, 26, 22, 2);
})();
window.NOVA = { seek, renderFrame, isFast: () => false, ready, DUR, T: {}, LINES: [], W, H };
})();
