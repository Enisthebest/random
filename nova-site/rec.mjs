import { chromium } from 'playwright';
const OUT = '/tmp/claude-0/-home-user-random/fe459b40-0173-5409-94f4-5397ed59bef2/scratchpad/rec/';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await p.goto('http://127.0.0.1:8125/nova-site/index.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const span = await p.evaluate(() => document.querySelector('.scrub').offsetHeight - innerHeight);
const total = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
const keys = [[0, 0], [0.8, 0], [13, span], [15, span], [20, total * 0.72]];   // [seconds, scrollY]
const FPS = 30, DUR = 20; let f = 0;
for (let t = 0; t < DUR; t += 1 / FPS) {
  let y = 0;
  for (let k = 0; k < keys.length - 1; k++) { const [t0, y0] = keys[k], [t1, y1] = keys[k + 1]; if (t >= t0 && t <= t1) { y = y0 + (y1 - y0) * ease((t - t0) / (t1 - t0)); break; } if (t > t1) y = y1; }
  await p.evaluate(y => scrollTo(0, y), y);
  await p.waitForTimeout(18);
  await p.screenshot({ path: `${OUT}${String(f++).padStart(4, '0')}.png` });
}
await b.close(); console.log('frames', f);
