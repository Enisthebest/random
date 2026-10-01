import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2560, height: 1440 } });
await p.goto('http://127.0.0.1:8125/nova-banner/banner.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
await p.screenshot({ path: 'nova-youtube-banner.png' });
// preview with the safe area and the phone/desktop crops marked
await p.addStyleTag({ content: '.b::after{content:"";position:absolute;left:507px;top:508px;width:1546px;height:423px;outline:4px dashed #f0f}.b::before{content:"";position:absolute;left:0;top:508px;width:2560px;height:423px;outline:3px dashed #0ff;z-index:2}' });
await p.screenshot({ path: 'preview-safe-area.png' });
await b.close();
