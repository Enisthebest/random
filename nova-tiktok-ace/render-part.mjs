// Renders frames [a, b) of the film to one mp4 chunk (run several in parallel, then concat).
import { chromium } from 'playwright';
import { spawn } from 'child_process';
const FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const [a, b, out] = [+process.argv[2], +process.argv[3], process.argv[4]];
const ff = spawn(FF, ['-y', '-f', 'image2pipe', '-framerate', '60', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'ignore', 'ignore'] });
const br = await chromium.launch();
const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto('http://127.0.0.1:8125/nova-tiktok-ace/index.html');
await p.evaluate(() => { document.body.classList.add('render'); return NOVA.ready; });
for (let f = a; f < b; f++) {
  const url = await p.evaluate(f => { NOVA.renderFrame(f, 60, NOVA.isFast(f / 60) ? 12 : 4); return document.getElementById('c').toDataURL('image/png'); }, f);
  if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
  if ((f - a) % 600 === 0) console.log(out, f);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await br.close();
console.log('done', out);
