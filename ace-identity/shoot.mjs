import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2000, height: 900 } });
await p.goto('http://127.0.0.1:8125/ace-identity/logos.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
await p.locator('.board').screenshot({ path: 'ace-logo-concepts.png' }); await b.close();
