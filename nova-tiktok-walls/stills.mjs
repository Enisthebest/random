import { chromium } from 'playwright';
import fs from 'fs';
const times = process.argv.slice(2).map(Number);
const outDir = process.env.OUT || 'out/stills';
fs.mkdirSync(outDir, { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('console', m => console.log('page:', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('http://127.0.0.1:8125/nova-tiktok-walls/index.html');
await p.evaluate(() => document.body.classList.add('render'));
await p.evaluate(() => NOVA.ready);
for (const t of times) {
  const url = await p.evaluate(t => { NOVA.seek(t); return document.getElementById('c').toDataURL('image/png'); }, t);
  fs.writeFileSync(`${outDir}/t${t.toFixed(2)}.png`, Buffer.from(url.split(',')[1], 'base64'));
}
await b.close();
