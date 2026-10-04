// node stills.mjs 0.5 3.9 14.5  -> out/stills/t0.50.png ...  (check key moments before rendering)
import { chromium } from 'playwright';
import fs from 'fs';
const URL = process.env.URL || `http://127.0.0.1:${process.env.PORT || 8125}/index.html`;
fs.mkdirSync('out/stills', { recursive: true });
const b = await chromium.launch(); const p = await b.newPage();
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto(URL);
const { W, H } = await p.evaluate(async () => { document.body.classList.add('render'); await NOVA.ready; return { W: NOVA.W, H: NOVA.H }; });
await p.setViewportSize({ width: W, height: H });
for (const t of process.argv.slice(2).map(Number)) {
  const url = await p.evaluate(t => { NOVA.seek(t); return document.getElementById('c').toDataURL('image/png'); }, t);
  fs.writeFileSync(`out/stills/t${t.toFixed(2)}.png`, Buffer.from(url.split(',')[1], 'base64'));
}
await b.close();
