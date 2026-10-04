// Re-renders every screens/*.html to png/ with the real Geist fonts. Google Fonts is blocked here, so without this the
// browser silently falls back to DejaVu Sans. Usage (from the repo root's server on :8125): node nova-design-kit/shoot-all.mjs [names…]
import { chromium } from 'playwright';
import fs from 'fs';
const DIR = new URL('.', import.meta.url).pathname;
const names = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(DIR + 'screens').filter(f => f.endsWith('.html')).map(f => f.slice(0, -5));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ contentType: 'text/css', body: '' }));
const FONTS = `@font-face{font-family:Geist;src:url(/nova-os/fonts/Geist-Variable.woff2) format("woff2");font-weight:100 900}
@font-face{font-family:"Geist Mono";src:url(/nova-os/fonts/GeistMono-Regular.woff2) format("woff2");font-weight:100 900}`;
for (const n of names) {
  await p.goto(`http://127.0.0.1:8125/nova-design-kit/screens/${n}.html`);
  await p.addStyleTag({ content: FONTS });
  await p.evaluate(async () => { await Promise.all(['400', '500', '600', '700', '800'].map(w => document.fonts.load(`${w} 16px Geist`))); await document.fonts.load('16px "Geist Mono"'); await document.fonts.ready; });
  const ok = await p.evaluate(() => document.fonts.check('600 16px Geist'));
  await p.waitForTimeout(250);
  await p.screenshot({ path: `${DIR}png/${n}.png` });
  if (!ok) console.log('font NOT loaded:', n);
}
await b.close(); console.log('shot', names.length);
