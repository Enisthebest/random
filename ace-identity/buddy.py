"""Generates ACE's Buddy logo and expressions as SVG (svg/), plus HTML boards for screenshots."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
OR, BL, FG = '#ffb066', '#3d6dff', '#f2f2f4'

def face(eyes, rim=('url(#rim)', 7), star=True, extra='', bg='#121218', uid='a'):
    rim_c, rim_w = rim
    defs = (f'<defs><linearGradient id="rim{uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{OR}"/><stop offset="1" stop-color="{BL}"/></linearGradient></defs>')
    rim_c = rim_c.replace('url(#rim)', f'url(#rim{uid})')
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">{defs}'
         f'<rect x="34" y="40" width="232" height="220" rx="78" fill="{bg}" stroke="{rim_c}" stroke-width="{rim_w}"/>'
         f'{eyes}')
    if star: s += f'<path d="M214 64c2 12 7 17 19 19-12 2-17 7-19 19-2-12-7-17-19-19 12-2 17-7 19-19z" fill="{OR}"/>'
    return s + extra + '</svg>'

pill = lambda x, y, w, h, c=FG: f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{min(w, h) / 2}" fill="{c}"/>'
arc = lambda d, w=12, c=FG: f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'

E = {
  'idle':       ('Idle', 'Calm, ready. Blinks every few seconds.', pill(104, 118, 26, 62) + pill(170, 118, 26, 62)),
  'blink':      ('Blink', '120 ms, now and then, so it feels alive.', pill(104, 145, 26, 9) + pill(170, 145, 26, 9)),
  'listening':  ('Listening', 'Eyes open wider while you type or talk.', pill(102, 108, 30, 78) + pill(168, 108, 30, 78)),
  'thinking':   ('Thinking', 'Looks up and to the side; dots pulse.', pill(116, 104, 24, 48) + pill(180, 104, 24, 48) + ''.join(f'<circle cx="{126 + i * 24}" cy="206" r="7" fill="{FG}" opacity="{0.4 + 0.3 * i}"/>' for i in range(3))),
  'working':    ('Working', 'Focused squint while it runs something you approved.', pill(102, 140, 30, 22) + pill(168, 140, 30, 22)),
  'happy':      ('Happy / Done', 'Smiling eyes when a task is finished.', arc('M98 156 Q117 128 136 156') + arc('M164 156 Q183 128 202 156')),
  'asking':     ('Asking', 'One eyebrow up: "Can I…?" Rim turns orange.', pill(104, 122, 26, 58) + pill(170, 116, 26, 64) + arc('M164 96 Q183 84 202 94', 9)),
  'oops':       ('Oops', 'Something went wrong. Never red-alarm, just honest.', arc('M100 128 L128 150 L100 172') + arc('M200 128 L172 150 L200 172')),
  'sleeping':   ('Sleeping', 'Off or idle for a while. No listening, ever.', arc('M98 150 Q117 166 136 150', 10) + arc('M164 150 Q183 166 202 150', 10)),
}
RIM = {'asking': ('#ffae5a', 8), 'sleeping': ('rgba(255,255,255,.18)', 6), 'oops': ('#ff9a6a', 7)}
for k, (name, desc, eyes) in E.items():
    open(os.path.join(HERE, 'svg', f'ace-{k}.svg'), 'w').write(face(eyes, RIM.get(k, ('url(#rim)', 7)), star=(k != 'sleeping'), uid=k,
        extra=('<text x="214" y="96" font-family="Geist,sans-serif" font-weight="800" font-size="30" fill="#8d8d96">z</text>' if k == 'sleeping' else '')))
# logo variants
open(os.path.join(HERE, 'svg', 'ace-logo.svg'), 'w').write(face(E['idle'][2], uid='logo'))
open(os.path.join(HERE, 'svg', 'ace-logo-mono.svg'), 'w').write(face(E['idle'][2], ('#f2f2f4', 7), extra='', uid='mono').replace(f'fill="{OR}"/></svg>', 'fill="#f2f2f4"/></svg>'))
# app icon: Buddy on a rounded dark tile with a soft NOVA glow
icon = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><defs>'
        f'<radialGradient id="bg" cx="30%" cy="20%" r="95%"><stop offset="0" stop-color="#2a2340"/><stop offset=".55" stop-color="#101018"/><stop offset="1" stop-color="#07070b"/></radialGradient>'
        f'<radialGradient id="gl" cx="50%" cy="55%" r="50%"><stop offset="0" stop-color="{BL}" stop-opacity=".35"/><stop offset="1" stop-color="{BL}" stop-opacity="0"/></radialGradient></defs>'
        f'<rect width="1024" height="1024" rx="230" fill="url(#bg)"/><rect width="1024" height="1024" rx="230" fill="url(#gl)"/>'
        f'<g transform="translate(112 112) scale(2.6667)">' + face(E['idle'][2], uid='icon').split('>', 1)[1].rsplit('</svg>', 1)[0] + '</g></svg>')
open(os.path.join(HERE, 'svg', 'ace-app-icon.svg'), 'w').write(icon)

# boards
tiles = ''.join(f'<div class="t"><img src="svg/ace-{k}.svg"><b>{n}</b><span>{d}</span></div>' for k, (n, d, _) in E.items())
expr = f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:GeistV;src:url(../nova-os/fonts/Geist-Variable.woff2) format("woff2");font-weight:100 900}}
html,body{{margin:0;background:#07070a;font-family:GeistV,sans-serif;color:#f2f2f4}}
.b{{width:2000px;padding:70px 80px;box-sizing:border-box}} h1{{font-size:64px;font-weight:800;letter-spacing:-.03em;margin:0}}
.sub{{font-size:26px;color:#a1a1aa;margin:10px 0 44px}}
.g{{display:grid;grid-template-columns:repeat(5,1fr);gap:24px}}
.t{{background:#0f0f14;border:1px solid rgba(255,255,255,.07);border-radius:30px;padding:26px 20px;display:flex;flex-direction:column;align-items:center;text-align:center}}
.t img{{width:220px;height:220px}} .t b{{font-size:30px;margin-top:10px;letter-spacing:-.02em}} .t span{{font-size:18px;color:#a1a1aa;margin-top:8px;line-height:1.35}}
</style></head><body><div class="b"><h1>Buddy — ACE's moods</h1><div class="sub">Eyes glide between moods on the NOVA curve (400 ms). Blinks are instant (120 ms).</div><div class="g">{tiles}</div></div></body></html>'''
open(os.path.join(HERE, 'expressions.html'), 'w').write(expr)
logo = f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:GeistV;src:url(../nova-os/fonts/Geist-Variable.woff2) format("woff2");font-weight:100 900}}
html,body{{margin:0;background:#07070a;font-family:GeistV,sans-serif;color:#f2f2f4}}
.b{{width:2000px;padding:70px 80px;box-sizing:border-box}} h1{{font-size:64px;font-weight:800;letter-spacing:-.03em;margin:0 0 44px}}
.row{{display:flex;gap:28px;align-items:stretch}}
.c{{background:#0f0f14;border:1px solid rgba(255,255,255,.07);border-radius:30px;padding:34px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}}
.c span{{font-size:20px;color:#a1a1aa}}
.lock{{display:flex;align-items:center;gap:26px;font-size:120px;font-weight:800;letter-spacing:.14em}} .lock img{{width:170px}}
.lock small{{display:block;font-size:30px;letter-spacing:0;color:#a1a1aa;font-weight:600;margin-top:6px}}
.sizes{{display:flex;align-items:flex-end;gap:30px}}
.light{{background:#f2f2f4}} .light span{{color:#55555e}}
</style></head><body><div class="b"><h1>ACE — final logo</h1>
<div class="row">
<div class="c"><img src="svg/ace-app-icon.svg" style="width:360px"><span>App icon</span></div>
<div class="c" style="flex:1"><div class="lock"><img src="svg/ace-logo.svg"><div>ACE<small>your ace up the sleeve · NOVA Pro</small></div></div><span>Wordmark lockup</span></div>
</div>
<div class="row" style="margin-top:28px">
<div class="c" style="flex:1"><div class="sizes"><img src="svg/ace-logo.svg" style="width:160px"><img src="svg/ace-logo.svg" style="width:96px"><img src="svg/ace-logo.svg" style="width:48px"><img src="svg/ace-logo.svg" style="width:28px"></div><span>Sizes: 160 · 96 · 48 · 28 px</span></div>
<div class="c"><img src="svg/ace-logo-mono.svg" style="width:180px"><span>One colour</span></div>
<div class="c light"><img src="svg/ace-logo.svg" style="width:180px"><span>On light</span></div>
</div></div></body></html>'''
open(os.path.join(HERE, 'logo.html'), 'w').write(logo)
print('ok', len(E), 'moods')
