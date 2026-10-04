"""Buddy sticker pack: 16 stickers as SVG -> PNG (512, transparent) -> WebP (WhatsApp, <100 KB) + tray icon."""
import os, math
HERE = os.path.dirname(os.path.abspath(__file__))
OR, BL, FG, PINK, TEAR = '#ffb066', '#3d6dff', '#f2f2f4', '#ff5c8a', '#6ab8ff'
pill = lambda x, y, w, h, c=FG: f'<rect x="{x - w / 2}" y="{y - h / 2}" width="{w}" height="{h}" rx="{min(w, h) / 2}" fill="{c}"/>'
st = lambda d, w=12, c=FG: f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
def star4(cx, cy, s, c=OR):
    return (f'<path d="M{cx} {cy - s}C{cx + s * .11} {cy - s * .37} {cx + s * .37} {cy - s * .11} {cx + s} {cy}'
            f'C{cx + s * .37} {cy + s * .11} {cx + s * .11} {cy + s * .37} {cx} {cy + s}C{cx - s * .11} {cy + s * .37} {cx - s * .37} {cy + s * .11} {cx - s} {cy}'
            f'C{cx - s * .37} {cy - s * .11} {cx - s * .11} {cy - s * .37} {cx} {cy - s}z" fill="{c}"/>')
def heart(cx, cy, s, c=PINK):
    return (f'<path d="M{cx} {cy + s * .9}C{cx - s * 1.4} {cy - s * .1} {cx - s * .9} {cy - s * 1.2} {cx} {cy - s * .45}'
            f'C{cx + s * .9} {cy - s * 1.2} {cx + s * 1.4} {cy - s * .1} {cx} {cy + s * .9}z" fill="{c}"/>')
L, R, Y = 117, 183, 150
EYES = {
  'hi':       ('hi!',        pill(L, Y, 26, 62) + pill(R, Y, 26, 62), None),
  'yay':      ('yay',        st('M98 156 Q117 128 136 156') + st('M164 156 Q183 128 202 156'), None),
  'listening':("i'm listening", pill(L, 147, 30, 78) + pill(R, 147, 30, 78), None),
  'hmm':      ('hmm...',     pill(128, 128, 24, 48) + pill(192, 128, 24, 48) + ''.join(f'<circle cx="{126 + i * 24}" cy="206" r="7" fill="{FG}" opacity="{0.4 + 0.3 * i}"/>' for i in range(3)), None),
  'onit':     ('on it',      pill(L, 151, 30, 22) + pill(R, 151, 30, 22), None),
  'canI':     ('can i?',     pill(L, 151, 26, 58) + pill(R, 148, 26, 64) + st('M164 96 Q183 84 202 94', 9), '#ffae5a'),
  'oops':     ('oops',       st('M100 128 L128 150 L100 172') + st('M200 128 L172 150 L200 172'), '#ff9a6a'),
  'brb':      ('brb',        st('M98 150 Q117 166 136 150', 10) + st('M164 150 Q183 166 202 150', 10) + '<text x="222" y="98" font-family="GeistV" font-weight="800" font-size="34" fill="#8d8d96">z</text><text x="240" y="70" font-family="GeistV" font-weight="800" font-size="24" fill="#8d8d96">z</text>', 'rgba(255,255,255,.35)'),
  'love':     ('love it',    heart(L, 150, 26) + heart(R, 150, 26), PINK),
  'wow':      ('wow',        star4(L, 150, 30, OR) + star4(R, 150, 30, OR), None),
  'nooo':     ('nooo',       st('M98 146 Q117 160 136 152', 10) + st('M164 152 Q183 160 202 146', 10) + st('M102 132 L132 140', 8) + st('M198 132 L168 140', 8) + f'<path d="M121 172 q-9 16 0 22 q9 -6 0 -22z" fill="{TEAR}"/>', '#6ab8ff'),
  'wink':     ('gotcha',     pill(L, Y, 26, 62) + st('M164 156 Q183 128 202 156'), None),
  'what':     ('WHAT',       f'<circle cx="{L}" cy="146" r="22" fill="none" stroke="{FG}" stroke-width="10"/><circle cx="{R}" cy="146" r="22" fill="none" stroke="{FG}" stroke-width="10"/><circle cx="{L}" cy="146" r="7" fill="{FG}"/><circle cx="{R}" cy="146" r="7" fill="{FG}"/><ellipse cx="150" cy="210" rx="12" ry="15" fill="none" stroke="{FG}" stroke-width="8"/>', None),
  'sus':      ('sus...',     pill(132, 152, 28, 20) + pill(196, 152, 28, 20) + st('M102 128 L140 132', 8) + st('M168 132 L206 128', 8), None),
  'lmao':     ('LMAO',       st('M98 150 Q117 126 136 150') + st('M164 150 Q183 126 202 150') + f'<path d="M124 186 Q150 222 176 186 Z" fill="{FG}"/>' + f'<path d="M92 160 q-8 14 0 19 q8 -5 0 -19z" fill="{TEAR}"/><path d="M208 160 q-8 14 0 19 q8 -5 0 -19z" fill="{TEAR}"/>', None),
  'grr':      ('grr',        pill(L, 156, 26, 44) + pill(R, 156, 26, 44) + st('M98 120 L136 134', 9) + st('M202 120 L164 134', 9), '#ff7b5c'),
}
TILT = {k: v for k, v in zip(EYES, [-4, 5, -3, 4, -5, 3, -6, 4, -3, 6, -4, 5, -5, 3, -4, 6])}

def sticker(key):
    cap, eyes, rim = EYES[key]
    rim_s = f'url(#g{key})' if rim is None else rim
    star = '' if key in ('brb', 'wow') else star4(214, 83, 19, OR)
    face = (f'<rect x="34" y="40" width="232" height="220" rx="78" fill="#121218" stroke="{rim_s}" stroke-width="8"/>' + eyes + star)
    outline = '<rect x="34" y="40" width="232" height="220" rx="78" fill="#fff" stroke="#fff" stroke-width="44" stroke-linejoin="round"/>'
    big = len(cap) <= 5
    fs = 92 if big else (68 if len(cap) <= 8 else 54)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<defs><linearGradient id="g{key}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{OR}"/><stop offset="1" stop-color="{BL}"/></linearGradient></defs>
<g transform="rotate({TILT[key]} 256 230) translate(76 28) scale(1.2)">{outline}{face}</g>
<text x="256" y="468" text-anchor="middle" font-family="GeistV" font-weight="900" font-size="{fs}" letter-spacing="-2"
 stroke="#fff" stroke-width="22" stroke-linejoin="round" paint-order="stroke" fill="#121218" transform="rotate({-TILT[key] / 2} 256 440)">{cap}</text>
</svg>'''

page = ['<!doctype html><html><head><meta charset="utf-8"><style>@font-face{font-family:GeistV;src:url(../../nova-os/fonts/Geist-Variable.woff2) format("woff2");font-weight:100 900}html,body{margin:0;background:transparent}.s{width:512px;height:512px;display:inline-block}</style></head><body>']
for k in EYES:
    svg = sticker(k)
    open(os.path.join(HERE, f'{k}.svg'), 'w').write(svg)
    page.append(f'<div class="s" id="s-{k}">{svg}</div>')
page.append('</body></html>')
open(os.path.join(HERE, 'stickers.html'), 'w').write('\n'.join(page))
print(len(EYES), 'stickers')
