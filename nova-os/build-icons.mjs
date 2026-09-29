// Converts the Lucide SVGs we use into plain path strings for Path2D.
import fs from 'fs';
const names = ['volume-2','audio-lines','monitor','headphones','moon','camera','search','folder','lock','network','moon-star','sun','hard-drive','eject','pencil','power','square-terminal','sparkle'];
const attr = (s, k) => { const m = s.match(new RegExp(`\\b${k}="([^"]*)"`)); return m ? +m[1] || m[1] : 0; };
const out = {};
for (const n of names) {
  const svg = fs.readFileSync(`node_modules/lucide-static/icons/${n}.svg`, 'utf8');
  const ds = [];
  for (const [el, tag] of svg.matchAll(/<(path|circle|rect|line|polyline|polygon|ellipse)\b[^>]*>/g).map(m => [m[0], m[1]])) {
    if (tag === 'path') ds.push(attr(el, 'd'));
    if (tag === 'circle') { const cx = attr(el, 'cx'), cy = attr(el, 'cy'), r = attr(el, 'r'); ds.push(`M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`); }
    if (tag === 'ellipse') { const cx = attr(el, 'cx'), cy = attr(el, 'cy'), rx = attr(el, 'rx'), ry = attr(el, 'ry'); ds.push(`M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0`); }
    if (tag === 'line') ds.push(`M${attr(el, 'x1')} ${attr(el, 'y1')}L${attr(el, 'x2')} ${attr(el, 'y2')}`);
    if (tag === 'polyline' || tag === 'polygon') ds.push('M' + attr(el, 'points').trim().split(/\s+/).join('L') + (tag === 'polygon' ? 'Z' : ''));
    if (tag === 'rect') {
      const x = attr(el, 'x'), y = attr(el, 'y'), w = attr(el, 'width'), h = attr(el, 'height'), r = attr(el, 'rx') || 0;
      ds.push(r ? `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z` : `M${x} ${y}h${w}v${h}h${-w}Z`);
    }
  }
  out[n] = ds.join(' ');
}
fs.writeFileSync('icons.js', '// Lucide icons (ISC licence), 24x24 stroke paths.\nwindow.ICONS = ' + JSON.stringify(out, null, 1) + ';\n');
console.log(Object.keys(out).length, 'icons');
