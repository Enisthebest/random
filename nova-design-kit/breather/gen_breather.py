"""Generates the Breather screens (screens/breather-*.html) and its logo sheet. Breather locks the screen for a short
break every so often so you get up and move. It can be turned on and off any time. Accent: mint."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))

def head(path):
    """Run a generator's setup code (helpers + CSS), stopping before it builds and writes its screens."""
    src = open(os.path.join(HERE, '..', path)).read()
    ns = {'__file__': os.path.join(HERE, '..', path)}
    exec(src[:src.index('\nS = {}')], ns)
    return ns

SU = head('setup/gen_setup.py')        # rows, toggles, chips, buttons, kbd
SH = head('shell/gen_shell.py')        # top bar, dock
ic, A = SU['ic'], SU['A']
LOGO = f'{A}breather-icon.svg'

CSS = SU['CSS'] + '''
.glass{position:absolute;border-radius:24px;background:rgba(12,14,15,.90);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(40px) saturate(1.3);z-index:4}
.ring{position:relative;display:flex;align-items:center;justify-content:center}
.ring>svg{position:absolute;inset:0;transform:rotate(-90deg)}
.ring .num{font-weight:600;letter-spacing:-.04em;font-variant-numeric:tabular-nums}
.seg{display:flex;gap:4px;padding:4px;border-radius:12px;background:rgba(255,255,255,.05)}
.seg span{height:30px;padding:0 12px;border-radius:9px;display:flex;align-items:center;font-size:13px;font-weight:600;color:#a1a1aa}
.seg span.on{background:var(--acc);color:#04130e}
.stat b{display:block;font-size:26px;font-weight:700;letter-spacing:-.02em}.stat span{font-size:12px;color:#8d8d96}
.tip{display:flex;align-items:center;gap:14px;padding:16px 20px;border-radius:18px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08)}
.tip .tile{width:42px;height:42px;border-radius:13px}
'''

def page(title, inner, bg):
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&amp;family=Geist+Mono&amp;display=swap" rel="stylesheet">
<style>{CSS}{SH['CSS'].split('/* shell cards')[0].replace('body{', 'x{')}</style></head><body>
<div class="frame" style="--acc:#3fdcaa;--acc-text:#6ff0c4;--on:#04130e;--sel:rgba(63,220,170,.16);--tint:rgba(63,220,170,.14)">
{bg}
{inner}
</div></body></html>'''

def ring(size, stroke, frac, inner, track='rgba(255,255,255,.08)'):
    r = (size - stroke) / 2; c = 2 * 3.14159265 * r
    return (f'<div class="ring" style="width:{size}px;height:{size}px"><svg width="{size}" height="{size}" viewBox="0 0 {size} {size}">'
            f'<defs><linearGradient id="rg{size}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8ff5d2"/><stop offset="1" stop-color="#22b8cf"/></linearGradient></defs>'
            f'<circle cx="{size/2}" cy="{size/2}" r="{r}" fill="none" stroke="{track}" stroke-width="{stroke}"/>'
            f'<circle cx="{size/2}" cy="{size/2}" r="{r}" fill="none" stroke="url(#rg{size})" stroke-width="{stroke}" stroke-linecap="round" stroke-dasharray="{c * frac:.1f} {c:.1f}"/></svg>'
            f'<div style="position:relative;text-align:center">{inner}</div></div>')

WALL = f'<img class="wall" src="{A}wall-ocean.jpg" alt="" style="filter:none;transform:none">'
S = {}

# 1. The app: one window. Big on/off at the top, the countdown, the few settings that matter, and today.
def trow(icon, t, s, right):
    return f'<div class="row" style="min-height:60px"><div class="tile">{ic(icon, 18)}</div><div style="flex:1"><div class="t1">{t}</div><div class="t2">{s}</div></div>{right}</div>'
seg = lambda opts, on: '<div class="seg">' + ''.join(f'<span class="{"on" if o == on else ""}">{o}</span>' for o in opts) + '</div>'
waits = ''.join(f'<span class="chip a" style="margin:0 6px 6px 0">{ic(i, 12)}{n}</span>' for i, n in [('gamepad-2', 'Gaming mode'), ('video', 'Video calls'), ('monitor', 'Full-screen video')])
app = f'''<div class="glass" style="left:50%;top:110px;transform:translateX(-50%);width:900px;height:610px;display:flex;flex-direction:column;overflow:hidden;z-index:2">
 <div style="display:flex;align-items:center;gap:14px;padding:22px 26px;border-bottom:1px solid rgba(255,255,255,.06)">
  <img src="{LOGO}" alt="" style="width:44px;height:44px"><div><div style="font-size:20px;font-weight:700">Breather</div><div style="font-size:13px;color:#a1a1aa">Get up and move. Your work waits for you.</div></div>
  <div style="margin-left:auto;display:flex;align-items:center;gap:12px;font-size:14px;font-weight:600">On<div class="tog on" style="width:56px;height:32px;border-radius:16px"></div></div></div>
 <div style="flex:1;display:flex;gap:22px;padding:24px 26px;min-height:0">
  <div style="width:300px;display:flex;flex-direction:column;align-items:center;gap:18px">
   <div class="card" style="width:100%;padding:26px 0 22px;display:flex;flex-direction:column;align-items:center;gap:18px">
    {ring(220, 14, 0.54, '<div style="font-size:13px;color:#a1a1aa;font-weight:500">Next break in</div><div class="num" style="font-size:52px;margin-top:2px">23:14</div><div style="font-size:13px;color:#6ff0c4;margin-top:2px">at 14:30</div>')}
    <div style="display:flex;gap:8px"><span class="btn" style="height:36px;font-size:13px">{ic("play", 15)}Break now</span><span class="btn" style="height:36px;font-size:13px">{ic("pause", 15)}Pause 1 h</span></div></div>
   <div class="card" style="width:100%;padding:16px 20px"><p class="lbl" style="margin-bottom:12px">Today</p>
    <div style="display:flex;justify-content:space-between"><div class="stat"><b>3</b><span>breaks</span></div><div class="stat"><b>15 min</b><span>moving</span></div><div class="stat"><b>1</b><span>skipped</span></div></div></div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;gap:14px;min-width:0">
   <div class="card">
    {trow("timer", "Work for", "Time between breaks", seg(["25 min", "50 min", "90 min"], "50 min"))}
    {trow("footprints", "Break length", "How long the screen stays locked", seg(["2 min", "5 min", "10 min"], "5 min"))}
    {trow("bell-ring", "Warn me first", "A heads-up 1 minute before, so you can save", '<div class="tog on"></div>')}
    {trow("skip-forward", "Let me skip", "Up to 2 skips a day. Turn off to be strict.", '<div class="tog on"></div>')}
    <div class="row" style="border:0;align-items:flex-start;padding:14px 0 8px"><div class="tile">{ic("hourglass", 18)}</div><div style="flex:1"><div class="t1">Wait until I'm done with</div><div class="t2" style="margin-bottom:10px">The break starts right after, never in the middle</div>{waits}<span class="chip" style="background:rgba(255,255,255,.06);color:#a1a1aa">{ic("plus", 12)}Add</span></div></div>
   </div>
   <div style="display:flex;gap:12px;align-items:center;padding:14px 18px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);font-size:13px;color:#a1a1aa">
    <span style="color:#6ff0c4;display:flex">{ic("nova-shield", 18)}</span>Breather runs on your PC only. It doesn't track what you do, just the time.</div>
  </div></div></div>'''
S['breather-app'] = ('Breather', SH['bar']() + SH['dock']() + app, WALL)

# 2. One minute before: a heads-up in the corner
warn = f'''<div class="glass" style="right:15px;top:57px;width:392px;padding:18px 18px 16px;box-sizing:border-box;border-radius:20px">
 <div style="display:flex;align-items:center;gap:12px"><img src="{LOGO}" alt="" style="width:40px;height:40px">
  <div style="flex:1"><div style="font-size:16px;font-weight:700">Break in 1 minute</div><div style="font-size:13px;color:#a1a1aa;margin-top:2px">Save what you're doing. Your screen locks at 14:30.</div></div></div>
 <div style="height:4px;border-radius:2px;background:rgba(255,255,255,.08);margin:14px 0"><div style="width:62%;height:100%;border-radius:2px;background:linear-gradient(90deg,#8ff5d2,#22b8cf)"></div></div>
 <div style="display:flex;gap:8px"><span class="btn pri" style="flex:1;justify-content:center;height:38px">Start now</span><span class="btn" style="flex:1;justify-content:center;height:38px">5 more minutes</span></div></div>'''
S['breather-warning'] = ('Breather: heads-up', SH['bar']() + SH['dock']() + warn, WALL)

# 3. The break: the whole screen, nothing else can be opened. A calm countdown and one simple idea of what to do.
lock = f'''<div style="position:absolute;inset:0;background:radial-gradient(60% 55% at 50% 45%,rgba(63,220,170,.16),rgba(0,0,0,0) 70%),rgba(3,8,8,.55);z-index:1"></div>
<div style="position:absolute;top:26px;left:0;right:0;display:flex;justify-content:center;gap:10px;align-items:center;font-size:14px;font-weight:600;color:#d4d4d8;z-index:2"><img src="{LOGO}" alt="" style="width:22px;height:22px">Breather</div>
<div style="position:absolute;left:0;right:0;top:100px;display:flex;flex-direction:column;align-items:center;z-index:2">
 {ring(300, 16, 0.9, '<div class="num" style="font-size:80px">4:32</div><div style="font-size:14px;color:#a1a1aa;margin-top:2px">left</div>', 'rgba(255,255,255,.10)')}
 <h1 style="margin:36px 0 0;font-size:64px;font-weight:800;letter-spacing:-.04em">Go move.</h1>
 <p style="margin:10px 0 0;font-size:19px;color:#d4d4d8">Stand up, stretch, get some water. Everything stays right where you left it.</p>
 <div class="tip" style="margin-top:34px;width:520px;box-sizing:border-box"><div class="tile">{ic("eye", 20)}</div><div><div class="t1">Rest your eyes</div><div class="t2">Look at something far away for 20 seconds.</div></div>
  <div style="margin-left:auto;display:flex;gap:6px"><i style="width:7px;height:7px;border-radius:4px;background:#6ff0c4"></i><i style="width:7px;height:7px;border-radius:4px;background:rgba(255,255,255,.25)"></i><i style="width:7px;height:7px;border-radius:4px;background:rgba(255,255,255,.25)"></i></div></div>
</div>
<div style="position:absolute;bottom:34px;left:0;right:0;display:flex;justify-content:center;gap:28px;font-size:13px;color:#8d8d96;z-index:2">
 <span style="display:flex;align-items:center;gap:8px">{ic("skip-forward", 14)}Skip this one<span style="color:#6e6e77">· 2 left today</span></span>
 <span style="display:flex;align-items:center;gap:8px">Emergency? Hold <span class="kbd">esc</span> for 3 seconds</span></div>'''
S['breather-lock'] = ('Breather: break', lock, f'<img class="wall" src="{A}wall-ocean.jpg" alt="">')

# 4. Back: the lock lifts with a short welcome
back = f'''<div class="dim" style="background:rgba(0,0,0,.35);z-index:1"></div>
<div class="glass" style="left:50%;top:50%;transform:translate(-50%,-50%);width:440px;padding:34px 30px 26px;box-sizing:border-box;text-align:center;display:flex;flex-direction:column;align-items:center">
 {ring(120, 10, 1, f'<span style="color:#6ff0c4;display:flex">{ic("check", 44, 2.5)}</span>')}
 <div style="font-size:28px;font-weight:800;letter-spacing:-.03em;margin-top:20px">Welcome back.</div>
 <div style="font-size:15px;color:#a1a1aa;margin-top:6px">That's 4 breaks today. Next one in 50 minutes.</div>
 <span class="btn pri" style="margin-top:22px;width:100%;justify-content:center;height:44px;font-size:15px">Back to work</span></div>'''
S['breather-back'] = ('Breather: welcome back', SH['bar']() + SH['dock']() + back, WALL)

# 5. Logo sheet
logo = f'''<div style="position:absolute;inset:0;background:#08090a"></div>
<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:90px">
 <div style="display:flex;flex-direction:column;align-items:center;gap:26px"><img src="{LOGO}" alt="" style="width:360px;height:360px;">
  <div style="font-size:44px;font-weight:800;letter-spacing:-.03em">Breather</div><div style="font-size:16px;color:#8d8d96;margin-top:-16px">Get up and move. Your work waits for you.</div></div>
 <div style="display:flex;flex-direction:column;gap:30px">
  <div style="display:flex;align-items:flex-end;gap:26px">{"".join(f'<img src="{LOGO}" alt="" style="width:{s}px;height:{s}px">' for s in (128, 64, 44, 32, 22))}</div>
  <div style="display:flex;gap:18px">
   <div style="width:150px;height:150px;border-radius:30px;background:#f2f2f4;color:#0b0b0e;display:flex;align-items:center;justify-content:center"><img src="{A}breather-mono.svg" alt="" style="width:96px;height:96px;filter:invert(0)"></div>
   <div style="width:150px;height:150px;border-radius:30px;background:#16181a;border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center"><img src="{A}breather-mono.svg" alt="" style="width:96px;height:96px;filter:invert(1)"></div>
   <div style="width:150px;height:150px;border-radius:30px;background:linear-gradient(135deg,#8ff5d2,#22b8cf);display:flex;align-items:center;justify-content:center"><img src="{A}breather-mono.svg" alt="" style="width:96px;height:96px;filter:invert(4%) sepia(30%) saturate(900%) hue-rotate(120deg)"></div></div>
  <div style="display:flex;gap:10px">{"".join(f'<div style="width:72px"><div style="height:44px;border-radius:12px;background:{c}"></div><div class="mono" style="font-size:11px;color:#8d8d96;margin-top:6px">{c}</div></div>' for c in ("#8ff5d2", "#3fdcaa", "#22b8cf", "#0b1414"))}</div>
 </div></div>'''
S['breather-logo'] = ('Breather: logo', logo, '')

out = os.path.join(HERE, '..', 'screens')
for name, (title, inner, bg) in S.items():
    open(os.path.join(out, name + '.html'), 'w').write(page(title, inner, bg))
print(len(S), 'breather screens')
