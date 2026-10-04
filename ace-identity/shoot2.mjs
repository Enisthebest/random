import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2000, height: 1000 } });
for (const [page, out] of [['expressions.html', 'ace-expressions.png'], ['logo.html', 'ace-logo-final.png']]) {
  await p.goto('http://127.0.0.1:8125/ace-identity/' + page); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  await p.locator('.b').screenshot({ path: out });
}
await p.setViewportSize({ width: 1024, height: 1024 }); await p.goto('http://127.0.0.1:8125/ace-identity/svg/ace-app-icon.svg'); await p.screenshot({ path: 'ace-app-icon-1024.png', omitBackground: true });
await b.close();
