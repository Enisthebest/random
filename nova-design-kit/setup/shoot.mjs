import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.route(/fonts\.googleapis\.com/, r => r.fulfill({ contentType: 'text/css', body: '' }));
for (const n of process.argv.slice(2)) {
  await p.goto(`http://127.0.0.1:8125/nova-design-kit/screens/${n}.html`);
  await p.addStyleTag({ content: `@font-face{font-family:Geist;src:url(/nova-os/fonts/Geist-Variable.woff2) format("woff2");font-weight:100 900}@font-face{font-family:"Geist Mono";src:url(/nova-os/fonts/GeistMono-Regular.woff2) format("woff2")}` });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: `../png/${n}.png` });
}
await b.close();
