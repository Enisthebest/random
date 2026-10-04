import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await p.goto('http://127.0.0.1:8125/nova-banner/behind-thumb.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
await p.screenshot({ path: 'nova-behind-thumbnail.png' }); await b.close();
