import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [name, vp, mobile] of [['desk', { width: 1487, height: 1058 }, false], ['phone', { width: 390, height: 844 }, true]]) {
  const p = await b.newPage({ viewport: vp, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  p.on('pageerror', e => console.log('ERR', e.message));
  let bytes = 0; p.on('response', async r => { try { bytes += (await r.body()).length; } catch {} });
  await p.goto('http://127.0.0.1:8125/nova-site/index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); console.log(name, 'first load KB', Math.round(bytes / 1024));
  await p.screenshot({ path: `w-${name}-1.png` });
  await p.click('.swatches button[data-k="aurora"]'); await p.waitForTimeout(1600);
  await p.screenshot({ path: `w-${name}-2.png` });
  await p.close();
}
await b.close();
