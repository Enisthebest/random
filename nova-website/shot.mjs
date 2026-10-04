import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [name, vp, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['phone', { width: 390, height: 844 }, true]]) {
  const p = await b.newPage({ viewport: vp, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce' });
  let bytes = 0; p.on('response', async r => { try { bytes += (await r.body()).length; } catch {} });
  await p.goto('http://127.0.0.1:8125/nova-website/index.html', { waitUntil: 'networkidle' });
  console.log(name, 'first load KB', Math.round(bytes / 1024));
  await p.evaluate(async () => { document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager'); await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
  await p.waitForTimeout(500);
  await p.screenshot({ path: `preview-${name}.png`, fullPage: true });
  await p.close();
}
await b.close();
