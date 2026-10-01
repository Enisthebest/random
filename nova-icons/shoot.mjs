import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });
await p.goto('http://127.0.0.1:8125/nova-icons/gallery.html'); await p.waitForTimeout(500);
await p.locator('#nova').screenshot({ path: 'preview-nova.png' });
await p.fill('#q', 'wifi'); await p.waitForTimeout(100); await p.screenshot({ path: 'preview-search.png' });
await b.close();
