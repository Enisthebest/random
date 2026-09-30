import { chromium } from 'playwright';
import fs from 'fs';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto('http://127.0.0.1:8125/nova-tiktok-walls/index.html'); await p.evaluate(() => NOVA.ready);
fs.writeFileSync('out/timeline.json', JSON.stringify(await p.evaluate(() => ({ T: NOVA.T, LINES: NOVA.LINES, CUTS: NOVA.CUTS, STEPS: NOVA.STEPS, DUR: NOVA.DUR }))));
await b.close();
