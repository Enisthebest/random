import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [name, vp, mobile] of [['desk', { width: 1487, height: 1058 }, false], ['phone', { width: 390, height: 844 }, true]]) {
  const p = await b.newPage({ viewport: vp, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  await p.goto('http://127.0.0.1:8125/nova-site/index.html', { waitUntil: 'networkidle' });
  for (const f of [0.24, 0.40, 0.555, 0.70]) {
    await p.evaluate(f => { const s = document.querySelector('.scrub'); scrollTo(0, (s.offsetHeight - innerHeight) * f); }, f);
    await p.waitForTimeout(900); await p.screenshot({ path: `beat-${name}-${f}.png` });
  }
  await p.close();
}
await b.close();
