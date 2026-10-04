"""Generates the Gaming mode screens (screens/gaming-*.html): turning it on, in game (focus lock + HUD),
Settings → Gaming mode, and turning it off. "Starfall" is a made-up game; assets/game-starfall.jpg is placeholder art."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))

def head(path):
    """Run a generator's setup code (helpers + CSS), stopping before it builds and writes its screens."""
    src = open(os.path.join(HERE, '..', path)).read()
    ns = {'__file__': os.path.join(HERE, '..', path)}
    exec(src[:src.index('\nS = {}')], ns)
    return ns

SU = head('setup/gen_setup.py')        # window, rows, toggles, chips, kbd
SH = head('shell/gen_shell.py')        # top bar, dock, toasts
ic, A = SU['ic'], SU['A']

CSS = SU['CSS'] + '''
.game{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.glass{position:absolute;border-radius:24px;background:rgba(14,14,18,.88);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(40px) saturate(1.3);z-index:4}
.hud{position:absolute;top:16px;right:16px;height:34px;border-radius:17px;background:rgba(10,10,14,.72);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(20px);display:flex;align-items:center;gap:14px;padding:0 14px;font-size:13px;font-weight:600;z-index:4}
.hud b{font-family:"Geist Mono",monospace;font-weight:500}.hud span{display:flex;align-items:center;gap:6px;color:#a1a1aa}
.hud .sep{width:1px;height:14px;background:rgba(255,255,255,.12)}
.on-row{display:flex;align-items:center;gap:12px;height:44px;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px}
.on-row:last-child{border-bottom:0}
.on-row .v{margin-left:auto;color:#a1a1aa;font-size:13px}
.ok{width:22px;height:22px;border-radius:11px;background:rgba(52,199,89,.16);color:#5fdc86;display:flex;align-items:center;justify-content:center;flex-shrink:0}
/* Settings window (same skeleton as png/settings.png) */
.swin{position:absolute;left:80px;top:62px;width:1280px;height:790px;border-radius:24px;background:rgba(12,12,16,.90);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(30px);display:flex;overflow:hidden;z-index:2}
.snav{width:248px;background:rgba(255,255,255,.025);border-right:1px solid rgba(255,255,255,.06);padding:24px 14px;box-sizing:border-box}
.snav .it{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:11px;font-size:14px;font-weight:500;color:#d4d4d8}
.snav .it.on{background:var(--sel);color:#fff}.snav .it.on svg{color:var(--acc-text)}
.snav .sl{font-size:11px;font-weight:700;letter-spacing:.08em;color:#8d8d96;margin:16px 12px 6px}
.shead{padding:24px 32px 18px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:14px}
.shead h2{margin:0;font-size:28px;font-weight:700}.shead p{margin:4px 0 0;font-size:14px;color:#a1a1aa}
'''

def page(title, inner, bg):
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&amp;family=Geist+Mono&amp;display=swap" rel="stylesheet">
<style>{CSS}{SH['CSS'].split('/* shell cards')[0].replace('body{', 'x{')}</style></head><body>
<div class="frame" style="--acc:#3B8BFF;--acc-text:#6AA8FF;--on:#fff;--sel:rgba(59,139,255,.18);--tint:rgba(59,139,255,.14)">
{bg}
{inner}
</div></body></html>'''

GAME = f'<img class="game" src="{A}game-starfall.jpg" alt="">'
S = {}

# 1. Turning it on: a glass card over the game for 2.5 s, then it fades away
did = [('Animations, blur and transparency', 'Off'), ('Background apps', '14 paused · 2.1 GB freed'),
       ('Updates, scans and file indexing', 'Paused'), ('Sleep, screen dimming and idle effects', 'Off'),
       ('Notifications', 'Held until you exit'), ('Processor', 'Performance mode')]
rows = ''.join(f'<div class="on-row"><span class="ok">{ic("check", 13, 3)}</span>{t}<span class="v">{v}</span></div>' for t, v in did)
S['gaming-on'] = ('Gaming mode: on', f'''<div class="dim" style="background:rgba(0,0,0,.35)"></div>
<div class="glass" style="left:50%;top:50%;transform:translate(-50%,-50%);width:560px;padding:28px 30px 22px;box-sizing:border-box">
 <div style="display:flex;align-items:center;gap:16px">
  <div style="width:56px;height:56px;border-radius:16px;background:var(--acc);display:flex;align-items:center;justify-content:center">{ic("gamepad-2", 28)}</div>
  <div><div style="font-size:24px;font-weight:700">Gaming mode on</div><div style="font-size:14px;color:#a1a1aa;margin-top:3px">Starfall has the whole PC now.</div></div></div>
 <div style="margin-top:18px">{rows}</div>
 <div style="margin-top:14px;display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.05)">
  <span style="color:#6aa8ff;display:flex">{ic("lock", 17)}</span><span style="font-size:14px"><b>Locked to Starfall.</b> <span style="color:#a1a1aa">Other apps and workspaces wait.</span></span>
  <span style="margin-left:auto;display:flex;gap:5px"><span class="kbd">super</span><span class="kbd">G</span></span></div>
 <div style="margin-top:14px;display:flex;align-items:center;gap:8px;font-size:13px;color:#5fdc86">{ic("nova-shield", 15)}Shield stays on. Your protection never pauses.</div>
</div>''', GAME)

# 2. In game: the tiny HUD (optional) and what happens if you try to leave
hud = (f'<div class="hud"><span style="color:#6aa8ff">{ic("gamepad-2", 15)}</span><span><b style="color:#f2f2f4">144</b>FPS</span><i class="sep"></i>'
       f'<span>CPU <b style="color:#f2f2f4">58°</b></span><span>GPU <b style="color:#f2f2f4">64°</b></span><i class="sep"></i><span>RAM <b style="color:#f2f2f4">6.1 GB</b></span></div>')
lockt = (f'<div class="glass" style="left:50%;top:40px;transform:translateX(-50%);height:56px;border-radius:28px;display:flex;align-items:center;gap:12px;padding:0 10px 0 18px">'
         f'<span style="color:#6aa8ff;display:flex">{ic("lock", 18)}</span><span style="font-size:14px;font-weight:600">Focus lock is on</span>'
         f'<span style="font-size:14px;color:#a1a1aa">Press</span><span style="display:flex;gap:5px"><span class="kbd">super</span><span class="kbd">G</span></span><span style="font-size:14px;color:#a1a1aa;margin-right:8px">to leave Starfall</span></div>')
S['gaming-locked'] = ('Gaming mode: in game', hud + lockt, GAME)

# 3. Settings → Gaming mode
def trow(icon, t, s, on=True, extra=''):
    return (f'<div class="row" style="min-height:62px"><div class="tile">{ic(icon, 18)}</div><div style="flex:1"><div class="t1">{t}</div><div class="t2">{s}</div>{extra}</div>'
            f'<div class="tog{" on" if on else ""}"></div></div>')
keep = ''.join(f'<span class="chip a" style="margin-right:6px">{n}{ic("x", 12)}</span>' for n in ['Voice chat', 'Music'])
nav = [('palette', 'Appearance'), ('monitor', 'Display'), ('volume-2', 'Sound'), ('wifi', 'Network'), ('shield-check', 'Privacy'), ('keyboard', 'Keyboard'), ('gamepad-2', 'Gaming mode')]
navh = ''.join(f'<div class="it{" on" if n == "Gaming mode" else ""}"{" aria-current=page" if n == "Gaming mode" else ""}>{ic(i, 18)}{n}</div>' for i, n in nav)
settings = f'''<div class="swin">
<div class="snav"><div style="display:flex;align-items:center;gap:12px;margin:0 12px 22px"><img src="{A}settings.webp" alt="" style="width:34px;height:34px"><span style="font-size:18px;font-weight:700">Settings</span></div>
 {navh}<div class="sl">SYSTEM</div><div class="it">{ic("info", 18)}About NOVA</div></div>
<div style="flex:1;display:flex;flex-direction:column;min-width:0">
 <div class="shead"><div><h2>Gaming mode</h2><p>Everything else steps aside while you play.</p></div>
  <span style="margin-left:auto;display:flex;align-items:center;gap:10px;font-size:13px;color:#a1a1aa">Turn on or off<span class="kbd">super</span><span class="kbd">G</span></span></div>
 <div style="padding:22px 32px;display:flex;gap:18px">
  <div style="flex:1;display:flex;flex-direction:column;gap:14px">
   <div class="card">
    {trow("sparkles", "Turn off animations and blur", "Every animation, blur and see-through effect")}
    {trow("pause", "Pause background apps", "Frozen, not closed: they pick up where they were", extra=f'<div style="margin-top:8px;display:flex;align-items:center;gap:4px;font-size:12px;color:#8d8d96">Keep running:&nbsp;{keep}<span class="chip" style="background:rgba(255,255,255,.06);color:#a1a1aa">{ic("plus", 12)}Add</span></div>')}
    {trow("refresh-cw", "Pause updates, scans and indexing", "Guard scans, file search and update downloads wait")}
    {trow("lock", "Lock to the game", "Workspaces, the launcher and other windows stay away")}
    {trow("moon", "Stop idle things", "No sleep, screen dimming, screensaver or wallpaper effects")}
    {trow("bell-off", "Hold notifications", "You see them all when you exit. Shield alerts still show.")}
    {trow("cpu", "Performance mode", "Full processor speed while playing. Uses more power.")}
   </div></div>
  <div style="width:330px;display:flex;flex-direction:column;gap:14px">
   <div class="card" style="padding:18px 20px"><p class="lbl">Start automatically</p>
    <div class="row" style="border:0;min-height:44px"><div><div class="t1" style="font-size:14px">When a game goes full screen</div><div class="t2">Games from your game launchers</div></div><div class="tog on"></div></div></div>
   <div class="card" style="padding:18px 20px"><p class="lbl">Overlay</p>
    <div class="row" style="border:0;min-height:44px"><div><div class="t1" style="font-size:14px">Show FPS and temperatures</div><div class="t2">A small pill in the top-right corner</div></div><div class="tog"></div></div></div>
   <div style="display:flex;gap:12px;align-items:flex-start;padding:16px 18px;border-radius:18px;background:rgba(52,199,89,.10);border:1px solid rgba(52,199,89,.22)">
    <span style="color:#5fdc86;display:flex">{ic("nova-shield", 20)}</span><div><div class="t1" style="font-size:14px">Shield never pauses</div><div class="t2">Your firewall and protection stay on in Gaming mode.</div></div></div>
  </div></div></div></div>'''
S['gaming-settings'] = ('Settings: Gaming mode', settings, f'<img class="wall" src="{A}wallpaper.png" alt="" style="filter:none;transform:none"><div class="dim" style="background:rgba(0,0,0,.15)"></div>')

# 4. Turning it off: back on the desktop with a short summary
back = [('play', '14 apps resumed', ''), ('refresh-cw', '2 updates ready', 'Install'), ('bell', '3 notifications', 'Show')]
brows = ''.join(f'<div class="on-row"><span class="ok" style="background:var(--tint);color:#6aa8ff">{ic(i, 13, 2.5)}</span>{t}{f"<span class=v style=color:#6aa8ff;font-weight:600>{a}</span>" if a else ""}</div>' for i, t, a in back)
off = f'''<div class="glass" style="right:15px;top:57px;width:382px;padding:20px 20px 12px;box-sizing:border-box;border-radius:20px">
 <div style="display:flex;align-items:center;gap:12px"><div style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center">{ic("gamepad-2", 20)}</div>
  <div><div style="font-size:16px;font-weight:700">Gaming mode off</div><div style="font-size:13px;color:#a1a1aa;margin-top:2px">You played Starfall for 2 h 14 min</div></div></div>
 <div style="margin-top:10px">{brows}</div></div>'''
S['gaming-off'] = ('Gaming mode: off', SH['bar']() + SH['dock']() + off, f'<img class="wall" src="{A}wallpaper.png" alt="" style="filter:none;transform:none">')

out = os.path.join(HERE, '..', 'screens')
for name, (title, inner, bg) in S.items():
    open(os.path.join(out, name + '.html'), 'w').write(page(title, inner, bg))
print(len(S), 'gaming screens')
