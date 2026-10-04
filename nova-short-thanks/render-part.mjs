// Renders frames [a, b) of the film to one mp4 chunk (run several in parallel, then concat).
import { chromium } from 'playwright';
import { spawn } from 'child_process';
const FF = process.env.FFMPEG || 'ffmpeg';
const URL = process.env.URL || `http://127.0.0.1:${process.env.PORT || 8125}/index.html`;
const [a, b, out] = [+process.argv[2], +process.argv[3], process.argv[4]];
const br = await chromium.launch();
const p = await br.newPage();
await p.goto(URL);
const { W, H } = await p.evaluate(async () => { document.body.classList.add('render'); await NOVA.ready; return { W: NOVA.W, H: NOVA.H }; });
await p.setViewportSize({ width: W, height: H });
const ff = spawn(FF, ['-y', '-f', 'image2pipe', '-framerate', '60', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'ignore', 'ignore'] });
for (let f = a; f < b; f++) {
  const url = await p.evaluate(f => { NOVA.renderFrame(f, 60, NOVA.isFast(f / 60) ? 12 : 6); return document.getElementById('c').toDataURL('image/png'); }, f);
  if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await br.close();
console.log('done', out);
