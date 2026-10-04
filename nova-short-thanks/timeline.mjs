// Exports the film's timings to out/timeline.json so the music lands on the picture.
import { chromium } from 'playwright';
import fs from 'fs';
const URL = process.env.URL || `http://127.0.0.1:${process.env.PORT || 8125}/index.html`;
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(URL); await p.evaluate(() => NOVA.ready);
fs.writeFileSync('out/timeline.json', JSON.stringify(await p.evaluate(() => ({ T: NOVA.T, NAMES: NOVA.NAMES, END: NOVA.END, DUR: NOVA.DUR }))));
await b.close();
