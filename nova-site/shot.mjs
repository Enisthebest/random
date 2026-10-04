import { chromium } from 'playwright';
const b = await chromium.launch();
const runs = [['desk', { width: 1487, height: 1058 }, false], ['phone', { width: 390, height: 844 }, true]];
for (const [name, vp, mobile] of runs) {
  const p = await b.newPage({ viewport: vp, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:8125/nova-site/index.html', { waitUntil: 'networkidle' });
  for (const f of [0, 0.25, 0.5, 0.95]) {
    await p.evaluate(f => { const s = document.querySelector('.scrub'); scrollTo(0, (s.offsetHeight - innerHeight) * f); }, f);
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `out-${name}-${f}.png` });
  }
  await p.close();
}
await b.close();
