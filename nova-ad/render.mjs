import { chromium } from 'playwright';
import { spawn } from 'child_process';
const FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const out = process.argv[2] || 'out/nova-ad-preview.mp4';
const FPS = 60, N = Math.round(30 * FPS);
const ff = spawn(FF, ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'inherit'] });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('http://127.0.0.1:8125/nova-ad/index.html');
await p.evaluate(() => { document.body.classList.add('render'); return NOVA.ready; });
for (let f = 0; f < N; f++) {
  const url = await p.evaluate(f => {
    const t = f / 60, T = NOVA.T;
    const fast = NOVA.isFast(t);
    NOVA.renderFrame(f, 60, fast ? 12 : 4);
    return document.getElementById('c').toDataURL('image/png');
  }, f);
  if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 120 === 0) console.log('frame', f);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
