import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1500, height: 500 } });
await p.goto('http://127.0.0.1:8125/nova-banner/xheader.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
await p.screenshot({ path: 'nova-x-header.png' }); await b.close();
