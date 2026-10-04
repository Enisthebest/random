import { chromium } from 'playwright';
import fs from 'fs';
fs.mkdirSync('png', { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 512, height: 512 } });
await p.goto('http://127.0.0.1:8125/ace-identity/stickers/stickers.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
for (const el of await p.$$('.s')) { const id = (await el.getAttribute('id')).slice(2); await el.screenshot({ path: `png/buddy-${id}.png`, omitBackground: true }); }
await b.close();
