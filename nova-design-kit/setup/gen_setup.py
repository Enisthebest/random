"""Generates the first-boot setup wizard screens (screens/setup-*.html): welcome, language & region, internet, account,
privacy, protection, look, ACE (Pro only) and finish."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
LUCIDE = os.path.join(HERE, '..', '..', 'nova-icons', 'svg') + '/'
A = '../assets/'

def ic(name, size=18, sw=2):
    s = open(LUCIDE + name + '.svg').read()
    inner = s[s.index('>', s.index('<svg')) + 1: s.rindex('</svg>')]
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0">{inner}</svg>')

CSS = '''
body{margin:0;font-family:"Geist",system-ui,sans-serif;color:#f2f2f4;-webkit-font-smoothing:antialiased}
.frame{position:relative;width:1440px;height:900px;overflow:hidden;background:#050507}
.wall{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:blur(48px) saturate(1.15);transform:scale(1.12)}
.dim{position:absolute;inset:0;background:rgba(0,0,0,.42)}
.mono{font-family:"Geist Mono",ui-monospace,monospace}
/* the wizard window */
.win{position:absolute;left:180px;top:110px;width:1080px;height:680px;border-radius:24px;background:rgba(12,12,16,.90);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(30px);display:flex;overflow:hidden;z-index:2}
.side{width:268px;background:rgba(255,255,255,.025);border-right:1px solid rgba(255,255,255,.06);padding:26px 18px;box-sizing:border-box;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:12px;margin:0 6px 30px}
.brand img{width:34px;height:34px;object-fit:contain}
.brand b{display:block;font-size:15px;font-weight:700}.brand span{display:block;font-size:12px;color:#8d8d96;margin-top:1px}
.step{display:flex;align-items:center;gap:12px;height:42px;padding:0 10px;border-radius:11px;font-size:14px;font-weight:500;color:#6e6e77}
.step .n{width:24px;height:24px;border-radius:12px;border:1.5px solid rgba(255,255,255,.16);box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0}
.step.done{color:#a1a1aa}.step.done .n{background:var(--acc);border:0;color:var(--on)}
.step.now{background:var(--sel);color:#f2f2f4}.step.now .n{background:#f2f2f4;border:0;color:#0b0b0e}
.pro{margin-left:auto;height:20px;padding:0 8px;border-radius:10px;background:rgba(245,146,30,.16);color:#ffae5a;font-size:11px;font-weight:700;display:flex;align-items:center}
.side .foot{margin-top:auto;display:flex;align-items:center;gap:8px;padding:0 8px;font-size:12px;color:#8d8d96}
.main{flex:1;display:flex;flex-direction:column;padding:34px 44px 26px;box-sizing:border-box;min-width:0}
.kick{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8d8d96}
h1{margin:10px 0 0;font-size:30px;font-weight:700;letter-spacing:-.01em}
.sub{margin:8px 0 0;font-size:15px;line-height:1.5;color:#a1a1aa;max-width:620px}
.body{margin-top:26px;flex:1;min-height:0}
.nav{display:flex;align-items:center;gap:10px;padding-top:18px;border-top:1px solid rgba(255,255,255,.06)}
.btn{height:40px;padding:0 18px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.07);display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:#f2f2f4;box-sizing:border-box}
.btn.pri{background:#f2f2f4;color:#0b0b0e;border:0}
.link{font-size:14px;font-weight:600;color:var(--acc-text)}
/* building blocks */
.card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:6px 20px;box-sizing:border-box}
.lbl{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8d8d96;margin:0 0 10px}
.row{display:flex;align-items:center;gap:14px;min-height:58px;border-bottom:1px solid rgba(255,255,255,.06)}
.row:last-child{border-bottom:0}
.tile{width:36px;height:36px;border-radius:11px;background:var(--tint);color:var(--acc-text);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.tile.g{background:rgba(52,199,89,.14);color:#5fdc86}.tile.o{background:rgba(245,146,30,.14);color:#ffae5a}
.t1{font-size:15px;font-weight:600}.t2{font-size:13px;color:#a1a1aa;margin-top:3px;line-height:1.4}
.tog{width:46px;height:28px;border-radius:14px;background:#3a3a40;position:relative;flex-shrink:0;margin-left:auto}
.tog::after{content:"";position:absolute;left:3px;top:3px;width:22px;height:22px;border-radius:11px;background:#f2f2f4}
.tog.on{background:var(--acc)}.tog.on::after{left:21px}.tog.g{background:#2f9e5a}
.field{height:46px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:10px;padding:0 14px;box-sizing:border-box;font-size:15px}
.field.focus{border:2px solid var(--acc);padding:0 13px}
.field .ph{color:#6e6e77}
.flabel{font-size:13px;font-weight:600;color:#a1a1aa;margin:0 0 8px}
.chip{white-space:nowrap;height:26px;padding:0 10px;border-radius:13px;display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600}
.chip.g{background:rgba(52,199,89,.16);color:#5fdc86}.chip.a{background:var(--tint);color:var(--acc-text)}
.check{width:22px;height:22px;border-radius:11px;background:var(--acc);color:var(--on);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-left:auto}
.promise{background:#ececef;color:#111114;border-radius:16px;display:flex;align-items:center;gap:12px;padding:0 16px;height:56px;font-size:14px;font-weight:600}
.kbd{height:26px;min-width:26px;padding:0 8px;box-sizing:border-box;border-radius:7px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.08);color:#e4e4e7;font-size:12px;font-weight:600;display:inline-flex;align-items:center;justify-content:center}
'''

# accent colours from nova-wallpapers/README.md
ACC = {'nova': ('#3B8BFF', '#6AA8FF', '#FFFFFF', '59,139,255'), 'aurora': ('#19C995', '#4FE3B5', '#0B0B0E', '25,201,149')}
STEPS = [('Language & region', 'languages'), ('Internet', 'wifi'), ('Account', 'user'), ('Privacy', 'eye-off'),
         ('Protection', 'shield-check'), ('Look', 'palette'), ('ACE', 'sparkles'), ('Finish', 'flag')]

def page(title, inner, acc='nova', wall='wallpaper.png'):
    a, at, on, rgb = ACC[acc]
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&amp;family=Geist+Mono&amp;display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
<div class="frame" style="--acc:{a};--acc-text:{at};--on:{on};--sel:rgba({rgb},.18);--tint:rgba({rgb},.14)">
<img class="wall" src="{A}{wall}" alt=""><div class="dim"></div>
{inner}
</div></body></html>'''

def side(now):
    h = ''
    for i, (name, _) in enumerate(STEPS):
        cls = 'done' if i < now else 'now' if i == now else ''
        n = ic('check', 14, 3) if i < now else str(i + 1)
        pro = '<span class="pro">PRO</span>' if name == 'ACE' else ''
        cur = ' aria-current="step"' if i == now else ''
        h += f'<div class="step {cls}"{cur}><span class="n">{n}</span>{name}{pro}</div>'
    return (f'<div class="side"><div class="brand"><img src="{A}nova-star.png" alt=""><div><b>Set up NOVA</b><span>About 3 minutes</span></div></div>'
            f'{h}<div class="foot">{ic("accessibility", 15)}Accessibility <span class="kbd" style="margin-left:auto">super</span><span class="kbd">U</span></div></div>')

def win(now, title, sub, body, cont='Continue', back=True, extra=''):
    nav = (f'<div class="nav">{"<span class=btn>" + ic("arrow-left", 16) + "Back</span>" if back else ""}'
           f'<span style="margin-left:auto"></span>{extra}<span class="btn pri">{cont}{ic("arrow-right", 16)}</span></div>')
    return (f'<div class="win" role="dialog" aria-label="Set up NOVA">{side(now)}<div class="main">'
            f'<div class="kick">Step {now + 1} of {len(STEPS)}</div><h1>{title}</h1><p class="sub">{sub}</p>'
            f'<div class="body">{body}</div>{nav}</div></div>')

S = {}

# 0. Welcome: full screen, no window
hellos = ['Hello', 'Hola', 'Bonjour', 'Merhaba', 'Hallo', 'Ciao', 'Olá', 'こんにちは']
hl = ''.join(f'<span style="color:{"#f2f2f4" if i == 0 else "rgba(255,255,255,.32)"}">{h}</span>' for i, h in enumerate(hellos))
S['setup-welcome'] = ('Setup: welcome', f'''
<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;z-index:2">
 <img src="{A}nova-star.png" alt="" style="margin-top:150px;width:150px;height:126px;object-fit:contain">
 <div style="margin-top:34px;font-size:72px;font-weight:700;letter-spacing:-.02em;line-height:1">Welcome to NOVA</div>
 <div style="margin-top:18px;font-size:20px;color:rgba(255,255,255,.72)">Let's get your computer ready. It only takes a few minutes.</div>
 <div style="margin-top:34px;display:flex;gap:22px;font-size:17px;font-weight:600">{hl}</div>
 <div style="margin-top:46px;display:flex;align-items:center;gap:12px">
  <span class="btn" style="height:52px;border-radius:26px;padding:0 20px;background:rgba(255,255,255,.1)">{ic("globe", 18)}English (US){ic("chevron-down", 16)}</span>
  <span class="btn pri" style="height:52px;border-radius:26px;padding:0 26px;font-size:16px">Get started{ic("arrow-right", 18)}</span>
 </div>
 <div style="margin-top:auto;margin-bottom:34px;display:flex;gap:26px;font-size:14px;font-weight:500;color:rgba(255,255,255,.7)">
  <span style="display:flex;align-items:center;gap:8px">{ic("accessibility", 17)}Accessibility</span>
  <span style="display:flex;align-items:center;gap:8px">{ic("keyboard", 17)}English (US)</span>
  <span style="display:flex;align-items:center;gap:8px">{ic("power", 17)}Shut down</span></div>
</div>''')

# 1. Language & region
langs = [('English (US)', 'English', True), ('English (UK)', 'English', False), ('Türkçe', 'Turkish', False), ('Deutsch', 'German', False), ('Español', 'Spanish', False), ('Français', 'French', False)]
lrows = ''.join(f'<div class="row" style="min-height:48px"><div><div class="t1" style="font-size:14px">{n}</div></div><span class="t2" style="margin:0 0 0 auto">{e}</span>{"<span class=check style=margin-left:12px>" + ic("check", 13, 3) + "</span>" if on else "<span style=width:22px;margin-left:12px></span>"}</div>' for n, e, on in langs)
S['setup-region'] = ('Setup: language & region', win(0, 'Language & region', 'Pick how NOVA talks to you and how your keyboard types. You can change all of this later in Settings.', f'''
<div style="display:flex;gap:22px;height:100%">
 <div style="flex:1;display:flex;flex-direction:column;gap:12px">
  <div class="field">{ic("search", 17)}<span class="ph">Search languages</span></div>
  <div class="card" style="padding:0 18px">{lrows}</div></div>
 <div style="width:330px;display:flex;flex-direction:column;gap:18px">
  <div><p class="flabel">Keyboard layout</p><div class="field">{ic("keyboard", 17)}English (US)<span style="margin-left:auto;color:#8d8d96;display:flex">{ic("chevron-down", 16)}</span></div></div>
  <div><p class="flabel">Try it</p><div class="field focus">Hello NOVA<span style="width:2px;height:20px;background:var(--acc);margin-left:-8px"></span></div></div>
  <div><p class="flabel">Time zone</p><div class="field">{ic("clock", 17)}Europe/Istanbul<span style="margin-left:auto;color:#8d8d96;font-size:13px" class="mono">14:22</span></div>
   <p class="t2" style="margin:10px 2px 0;display:flex;gap:8px">{ic("map-pin", 15)}<span>Guessed from your language and keyboard, not your location.</span></p></div>
 </div></div>''', back=False))

# 2. Internet
nets = [('wifi', 'Home 5G', 'Strong signal', True), ('wifi-high', 'Home 2.4G', '', False), ('wifi-low', 'Cafe Guest', 'Open network: anyone nearby can see your traffic', False), ('wifi-low', 'NETGEAR-42', '', False)]
SELROW = ' style="background:var(--sel);margin:0 -14px;padding:0 14px;border-radius:12px;border:0"'
nrows = ''.join(f'<div class="row"{SELROW if sel else ""}><div class="tile">{ic(i, 18)}</div><div><div class="t1">{n}</div>{f"<div class=t2>{s}</div>" if s else ""}</div><span style="margin-left:auto;color:#8d8d96;display:flex">{ic("lock" if "Open" not in s else "shield-alert", 16)}</span></div>' for i, n, s, sel in nets)
S['setup-wifi'] = ('Setup: internet', win(1, 'Connect to the internet', "You'll need it for updates and the app store. NOVA doesn't check in with anyone when you connect: no tracking, no sign-in.", f'''
<div style="display:flex;gap:22px">
 <div style="flex:1"><div class="card" style="padding:4px 20px">{nrows}</div>
  <div style="margin-top:14px;display:flex;align-items:center;gap:10px;color:#a1a1aa;font-size:14px">{ic("plus", 16)}Join another network</div></div>
 <div style="width:330px"><div class="card" style="padding:18px 20px">
  <p class="flabel">Password for Home 5G</p><div class="field focus"><span style="letter-spacing:.3em">••••••••••</span><span style="margin-left:auto;color:#8d8d96;display:flex">{ic("eye", 17)}</span></div>
  <div class="row" style="border:0;min-height:52px;margin-top:6px"><div><div class="t1" style="font-size:14px">Private Wi-Fi address</div><div class="t2">A random address for each network</div></div><div class="tog on"></div></div>
  <span class="btn pri" style="width:100%;justify-content:center;margin-top:6px">Connect</span></div></div>
</div>''', extra='<span class="link" style="margin-right:14px">Set up offline</span>'))

# 3. Account
sw = ''.join(f'<span style="width:26px;height:26px;border-radius:13px;background:{c};{"outline:2px solid #f2f2f4;outline-offset:3px" if i == 0 else ""}"></span>' for i, c in enumerate(['linear-gradient(135deg,#3b8bff,#f5921e)', 'linear-gradient(135deg,#19c995,#12b8f0)', 'linear-gradient(135deg,#ff4f8b,#a26bff)', 'linear-gradient(135deg,#a8e632,#19c995)', '#3a3a40']))
bars = ''.join(f'<i style="flex:1;height:5px;border-radius:3px;background:{"#34c759" if k < 3 else "#3a3a40"}"></i>' for k in range(4))
S['setup-account'] = ('Setup: account', win(2, 'Make your account', 'This is you on this computer. No email, no online account: your name and password stay on this PC.', f'''
<div style="display:flex;gap:34px">
 <div style="width:190px;display:flex;flex-direction:column;align-items:center;gap:16px;padding-top:6px">
  <div style="width:128px;height:128px;border-radius:64px;background:linear-gradient(135deg,#3b8bff,#f5921e);display:flex;align-items:center;justify-content:center;font-size:52px;font-weight:700">A</div>
  <div style="display:flex;gap:10px">{sw}</div>
  <span class="btn" style="height:34px;font-size:13px">{ic("image", 15)}Choose a photo</span></div>
 <div style="flex:1;display:flex;flex-direction:column;gap:16px">
  <div style="display:flex;gap:14px">
   <div style="flex:1"><p class="flabel">Your name</p><div class="field">Alex Rivera</div></div>
   <div style="width:220px"><p class="flabel">Username</p><div class="field mono" style="font-size:14px">alex<span style="margin-left:auto;color:#5fdc86;display:flex">{ic("check", 16)}</span></div></div></div>
  <div><p class="flabel">Password</p><div class="field focus"><span style="letter-spacing:.3em">••••••••••••</span><span style="margin-left:auto;color:#8d8d96;display:flex">{ic("eye", 17)}</span></div>
   <div style="display:flex;align-items:center;gap:12px;margin-top:10px"><div style="display:flex;gap:5px;width:180px">{bars}</div><span style="font-size:13px;font-weight:600;color:#5fdc86">Strong</span><span class="t2" style="margin:0">· A few words in a row work great</span></div></div>
  <div><p class="flabel">Type it again</p><div class="field"><span style="letter-spacing:.3em">••••••••••••</span><span style="margin-left:auto;color:#5fdc86;display:flex">{ic("check", 16)}</span></div></div>
  <div class="card" style="padding:2px 18px"><div class="row" style="min-height:54px"><div class="tile g">{ic("hard-drive", 18)}</div><div><div class="t1" style="font-size:14px">Encrypt my home folder</div><div class="t2">Your files are unreadable without your password</div></div><div class="tog on g"></div></div></div>
 </div></div>'''))

# 4. Privacy
prow = [('bug', '', 'Send crash reports', 'Off unless you turn it on. You see each report before it goes.', False),
        ('map-pin', '', 'Location for weather and clock', 'Used on this PC only. Never shared.', False),
        ('bell', '', 'Show message previews on the lock screen', 'Off keeps your notifications private when you are away.', False)]
prows = ''.join(f'<div class="row" style="min-height:70px"><div class="tile">{ic(i, 18)}</div><div><div class="t1">{t}</div><div class="t2">{s}</div></div><div class="tog{" on" if on else ""}"></div></div>' for i, _, t, s, on in prow)
S['setup-privacy'] = ('Setup: privacy', win(3, 'Your privacy', "Everything below starts off. Turn on only what you want. NOVA works fully either way.", f'''
<div style="display:flex;flex-direction:column;gap:16px">
 <div style="display:flex;align-items:center;gap:18px;padding:20px 22px;border-radius:18px;background:rgba(52,199,89,.10);border:1px solid rgba(52,199,89,.22)">
  <div class="tile g" style="width:48px;height:48px;border-radius:14px">{ic("shield-check", 24)}</div>
  <div><div style="font-size:18px;font-weight:700">NOVA collects nothing about you.</div><div class="t2" style="font-size:14px">No account, no ads, no tracking, no usage data. There's nothing hidden to turn off.</div></div>
  <span class="chip g" style="margin-left:auto">{ic("check", 13, 3)}Built in</span></div>
 <div class="card">{prows}</div>
 <p class="t2" style="margin:2px 4px;display:flex;gap:8px;align-items:center">{ic("file-text", 15)}<span>Read the short <span class="link" style="font-size:13px">privacy policy</span>: it fits on one screen.</span></p>
</div>'''))

# 5. Protection: Shield level + updates
REC = '<span class="chip a" style="margin-left:auto;height:22px;font-size:11px">Recommended</span>'
def level(name, sub, points, sel=False, rec=False):
    pts = ''.join(f'<div style="display:flex;gap:9px;align-items:flex-start;font-size:13px;color:#cdcdd2;line-height:1.35"><span style="color:{"#5fdc86" if sel else "#8d8d96"};display:flex;margin-top:1px">{ic("check", 14, 2.5)}</span>{p}</div>' for p in points)
    border = 'border:2px solid var(--acc);padding:17px 17px' if sel else 'border:1px solid rgba(255,255,255,.07);padding:18px'
    return (f'<div style="flex:1;border-radius:18px;background:{"var(--sel)" if sel else "rgba(255,255,255,.04)"};{border};display:flex;flex-direction:column;gap:10px;box-sizing:border-box">'
            f'<div style="display:flex;align-items:center;gap:8px"><span style="font-size:17px;font-weight:700">{name}</span>{REC if rec else ""}</div>'
            f'<div class="t2" style="margin:0 0 4px">{sub}</div>{pts}</div>')
seg = ''.join(f'<span style="flex:1;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;{"background:#f2f2f4;color:#0b0b0e" if i == 0 else "color:#a1a1aa"}">{s}</span>' for i, s in enumerate(['Ask me first', 'Install automatically', 'Only when I check']))
S['setup-protection'] = ('Setup: protection', win(4, 'Protection', 'Shield guards your network and Guard checks your files. Pick a level: you can fine-tune all 14 protections later.', f'''
<div style="display:flex;gap:14px">
 {level("Relaxed", "Fewer prompts, for home use.", ["Firewall on", "Blocks known trackers", "Private Wi-Fi address"])}
 {level("Balanced", "Strong protection, no hassle.", ["Everything in Relaxed", "Encrypted DNS", "Blocks unknown incoming connections", "Guard scans new downloads"], sel=True, rec=True)}
 {level("Strict", "For public Wi-Fi and travel.", ["Everything in Balanced", "Blocks all incoming", "USB devices ask first", "Kill switch if VPN drops"])}
</div>
<div class="card" style="margin-top:16px;padding:16px 20px">
 <div style="display:flex;align-items:center;gap:14px"><div class="tile">{ic("refresh-cw", 18)}</div><div><div class="t1">Updates</div><div class="t2">Signed by NOVA and checked before they install. Nothing restarts without asking.</div></div></div>
 <div style="display:flex;gap:4px;margin-top:14px;padding:4px;border-radius:13px;background:rgba(255,255,255,.05)">{seg}</div></div>'''))

# 6. Look: wallpaper picks the accent (shown with Aurora picked, so the whole screen is green-accented)
walls = [('original', 'NOVA', '#3B8BFF'), ('aurora', 'Aurora', '#19C995'), ('ember', 'Ember', '#FF4F8B'), ('lilac', 'Lilac', '#A26BFF'), ('ocean', 'Ocean', '#12B8F0'), ('citrus', 'Citrus', '#A8E632')]
wg = ''.join(f'''<div style="display:flex;flex-direction:column;gap:8px"><div style="position:relative;width:132px;height:74px;border-radius:12px;{'outline:3px solid var(--acc);outline-offset:3px' if k == 'aurora' else ''}">
 <img src="{A}wall-{k}.jpg" alt="" style="width:132px;height:74px;border-radius:12px;object-fit:cover;display:block">
 {'<span class="check" style="position:absolute;right:7px;top:7px">' + ic("check", 13, 3) + '</span>' if k == 'aurora' else ''}</div>
 <div style="display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:{'#f2f2f4' if k == 'aurora' else '#a1a1aa'}"><i style="width:10px;height:10px;border-radius:5px;background:{c}"></i>{n}</div></div>''' for k, n, c in walls)
mini = f'''<div style="position:relative;width:266px;height:150px;border-radius:14px;overflow:hidden">
 <img src="{A}wall-aurora.jpg" alt="" style="width:100%;height:100%;object-fit:cover;display:block">
 <div style="position:absolute;left:6px;right:6px;top:5px;display:flex;justify-content:space-between"><i style="width:34px;height:9px;border-radius:3px;background:#101013"></i><i style="width:30px;height:9px;border-radius:3px;background:#101013"></i><i style="width:46px;height:9px;border-radius:3px;background:#101013"></i></div>
 <div style="position:absolute;left:50px;top:24px;width:166px;height:96px;border-radius:8px;background:rgba(12,12,16,.92);display:flex">
  <div style="width:44px;background:rgba(255,255,255,.03);padding:8px 5px;box-sizing:border-box;display:flex;flex-direction:column;gap:4px"><i style="height:8px;border-radius:3px;background:var(--sel)"></i><i style="height:8px;border-radius:3px;background:rgba(255,255,255,.06)"></i><i style="height:8px;border-radius:3px;background:rgba(255,255,255,.06)"></i></div>
  <div style="flex:1;padding:10px;display:flex;flex-direction:column;gap:7px"><i style="width:60px;height:7px;border-radius:3px;background:#f2f2f4"></i>
   <div style="display:flex;align-items:center;gap:6px"><i style="flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.1)"></i><i style="width:20px;height:12px;border-radius:6px;background:var(--acc)"></i></div>
   <div style="display:flex;align-items:center;gap:6px"><i style="flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.1)"></i><i style="width:20px;height:12px;border-radius:6px;background:#3a3a40"></i></div>
   <i style="height:6px;border-radius:3px;background:linear-gradient(90deg,var(--acc) 64%,rgba(255,255,255,.1) 64%)"></i></div></div>
 <div style="position:absolute;left:50%;bottom:6px;transform:translateX(-50%);width:104px;height:16px;border-radius:5px;background:rgba(16,16,19,.9);display:flex;align-items:center;justify-content:center;gap:5px">{''.join('<i style="width:9px;height:9px;border-radius:3px;background:rgba(255,255,255,.35)"></i>' for _ in range(6))}</div></div>'''
S['setup-look'] = ('Setup: look', win(5, 'Make it yours', 'Pick a wallpaper. Its colour becomes your accent, so toggles and highlights match it.', f'''
<div style="display:flex;gap:26px">
 <div style="display:grid;grid-template-columns:repeat(3,132px);gap:20px 18px;align-content:start">{wg}</div>
 <div style="flex:1;display:flex;flex-direction:column;gap:14px">
  <p class="flabel" style="margin:0">Preview</p>{mini}
  <div class="card" style="padding:2px 18px"><div class="row" style="min-height:54px"><div><div class="t1" style="font-size:14px">Match accent to wallpaper</div><div class="t2">Accent: Aurora <span class="mono">#19C995</span></div></div><div class="tog on"></div></div></div>
 </div></div>'''))

# 7. ACE (NOVA Pro only)
S['setup-ace'] = ('Setup: ACE', win(6, 'Meet ACE', "Your ace up the sleeve. ACE is NOVA Pro's assistant, and it lives entirely on this computer.", f'''
<div style="display:flex;gap:34px;align-items:center;height:100%">
 <div style="width:250px;display:flex;flex-direction:column;align-items:center;gap:14px">
  <img src="{A}ace-happy.svg" alt="Buddy, ACE's face" style="width:210px;height:210px">
  <div style="font-size:15px;color:#cdcdd2;text-align:center;line-height:1.45;padding:12px 16px;border-radius:16px 16px 16px 6px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08)">Hey, I'm ACE ✦<br>I only see what you show me.</div></div>
 <div style="flex:1;display:flex;flex-direction:column;gap:12px">
  <div class="promise">{ic("hard-drive", 19)}Runs on this PC. Nothing goes to the cloud.<span style="margin-left:auto;display:flex">{ic("lock", 16)}</span></div>
  <div class="promise">{ic("eye", 19)}Asks before it looks at your screen or files.<span style="margin-left:auto;display:flex">{ic("lock", 16)}</span></div>
  <div class="promise">{ic("play", 19)}Nothing happens until you press Run.<span style="margin-left:auto;display:flex">{ic("lock", 16)}</span></div>
  <div class="promise">{ic("moon", 19)}Asleep means off: not listening, not running.<span style="margin-left:auto;display:flex">{ic("lock", 16)}</span></div>
  <p class="t2" style="margin:6px 4px 0">ACE uses about 4 GB of disk space. Open it any time with <span class="kbd">super</span> <span class="kbd">A</span>.</p>
 </div></div>''', cont='Turn on ACE', extra='<span class="link" style="margin-right:14px">Maybe later</span>'))

# 8. Finish
keys = [('search', 'Launcher', ['super', 'space']), ('folder', 'Files', ['super', 'E']),
        ('terminal', 'Terminal', ['super', '↵']), ('nova-shield', 'Shield', ['super', 'S']),
        ('sliders-horizontal', 'Control panel', ['super', 'C']), ('image', 'Wallpapers', ['super', 'W']),
        ('gamepad-2', 'Gaming mode', ['super', 'G']), ('camera', 'Screenshot', ['super', 'shift', 'S']),
        ('lock', 'Lock your PC', ['super', 'L']), ('power', 'Power menu', ['super', 'X']),
        ('x', 'Close a window', ['super', 'Q']), ('accessibility', 'Accessibility', ['super', 'U'])]
kg = ''.join(f'<div style="display:flex;align-items:center;gap:10px;height:40px;padding:0 10px 0 14px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)"><span style="color:var(--acc-text);display:flex">{ic(i, 16)}</span><span style="font-size:14px;font-weight:500">{t}</span><span style="margin-left:auto;display:flex;gap:5px">{"".join(f"<span class=kbd>{k}</span>" for k in ks)}</span></div>' for i, t, ks in keys)
NEXT = [('package', 'Get apps', 'From the NOVA store'), ('usb', 'Bring your files', 'From a USB drive'), ('book-open', 'Take the tour', 'Two minutes, offline')]
nxt = ''.join(f'<div class="card" style="flex:1;padding:8px 14px;display:flex;align-items:center;gap:12px"><div class="tile">{ic(i, 18)}</div><div><div class="t1" style="font-size:14px">{t}</div><div class="t2" style="font-size:12px;margin-top:2px">{d}</div></div></div>' for i, t, d in NEXT)
S['setup-finish'] = ('Setup: finish', win(7, "You're all set, Alex ✦", 'NOVA is ready. Shortcuts worth knowing (all of them are in Settings → Keyboard):', f'''
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px">{kg}</div>
<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
 <span class="chip g">{ic("shield-check", 14)}Shield: Balanced</span><span class="chip g">{ic("hard-drive", 14)}Home folder encrypted</span>
 <span class="chip a">{ic("palette", 14)}Aurora</span><span class="chip a">{ic("refresh-cw", 14)}Updates: ask me first</span></div>
<p class="lbl" style="margin:16px 0 8px">What's next</p>
<div style="display:flex;gap:12px">{nxt}</div>''', cont='Start using NOVA'))

out = os.path.join(HERE, '..', 'screens')
for name, (title, inner, *rest) in S.items():
    # from the Look step on, the accent is the one the user picked (Aurora in these mockups)
    html = page(title, inner, 'aurora', 'wall-aurora.jpg') if name in ('setup-look', 'setup-ace', 'setup-finish') else page(title, inner)
    open(os.path.join(out, name + '.html'), 'w').write(html)
print(len(S), 'setup screens')
