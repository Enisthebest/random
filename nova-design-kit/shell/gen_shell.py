"""Generates the NOVA shell screens (screens/shell-*.html): desktop, Control panel, lock screen, notifications, power menu, OSD, Wi-Fi and Bluetooth pickers."""
import re, os
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
.wall{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.wall.blur{filter:blur(36px);transform:scale(1.1)}
.dim{position:absolute;inset:0;background:rgba(0,0,0,.32)}
/* top bar */
.bar{position:absolute;left:0;right:0;top:9px;height:36px;display:flex;justify-content:space-between;padding:0 15px;box-sizing:border-box;z-index:3}
.pill{height:36px;border-radius:12px;background:#101013;border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:12px;padding:0 14px;box-sizing:border-box;font-size:13px;font-weight:600;color:#e4e4e7}
.pill.on{background:#1b1b1f}
.ws{width:8px;height:8px;border-radius:4px;background:rgba(255,255,255,.28);display:inline-block}.ws.on{width:22px;background:#f2f2f4}
.right{display:flex;gap:10px}
/* dock */
.dock{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);height:64px;border-radius:16px;background:rgba(16,16,19,.9);border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:16px;padding:0 12px;box-sizing:border-box;z-index:3}
.dock .app{position:relative;width:44px;height:44px}
.dock img{width:44px;height:44px;object-fit:contain;display:block}
.dock .run::after{content:"";position:absolute;left:50%;bottom:-8px;width:5px;height:5px;margin-left:-2.5px;border-radius:3px;background:var(--acc)}
.sep{width:1px;height:32px;background:rgba(255,255,255,.08)}
/* shell cards (Control panel) */
.cp{position:absolute;right:15px;top:57px;width:546px;display:flex;gap:14px;z-index:4}
.cp-head{position:absolute;right:15px;top:57px;width:546px;display:flex;justify-content:space-between;align-items:center;z-index:4}
.col{display:flex;flex-direction:column;gap:12px}
.sc{border-radius:12px;background:linear-gradient(#131317,#09090d);border:1px solid rgba(255,255,255,.06);padding:14px 16px;box-sizing:border-box}
.lbl{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#b0b0b5;margin:0 0 12px}
.rowc{display:flex;align-items:center;gap:12px}
.rb{width:40px;height:40px;border-radius:20px;background:#252528;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#f2f2f4}
.rb.on{background:var(--acc);color:#fff}
.sl{position:relative;flex:1;height:24px;border-radius:12px;background:#222224}
.sl i{position:absolute;left:0;top:0;bottom:0;border-radius:12px;background:linear-gradient(90deg,#1074e4,#268cff)}
.sl b{position:absolute;top:1px;width:22px;height:22px;border-radius:11px;background:#f2f2f4;margin-left:-22px}
.pct{font-size:12px;font-weight:600;color:#cdcdd2;width:34px;text-align:right}
.out{display:flex;align-items:center;gap:10px;height:40px;padding:0 10px;border-radius:10px;font-size:13px;color:#e4e4e7}
.out.on{background:#363639}
.t1{font-size:13px;font-weight:600}.t2{font-size:11px;color:#8c8c92;margin-top:2px}
.tog{width:46px;height:26px;border-radius:13px;background:#353538;position:relative;flex-shrink:0;margin-left:auto}
.tog::after{content:"";position:absolute;left:2px;top:2px;width:22px;height:22px;border-radius:11px;background:#f2f2f4}
.tog.on{background:var(--acc)}.tog.on::after{left:22px}
.tog.night{background:#ff9f0a}
.edit{height:28px;padding:0 12px;border-radius:9px;background:#252528;font-size:12px;font-weight:600;display:flex;align-items:center}
/* glass panel (power menu, pickers) */
.glass{position:absolute;border-radius:24px;background:rgba(14,14,18,.86);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(40px) saturate(1.3);z-index:4}
.kbd{height:24px;min-width:24px;padding:0 7px;box-sizing:border-box;border-radius:7px;background:rgba(255,255,255,.08);color:#a1a1aa;font-size:12px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;font-style:normal}
/* notifications */
.toasts{position:absolute;right:15px;top:57px;width:382px;display:flex;flex-direction:column;gap:10px;z-index:4}
.toast{height:66px;border-radius:16px;background:rgba(16,16,20,.92);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(30px);display:flex;align-items:center;gap:12px;padding:0 14px;box-sizing:border-box}
.toast .ti{width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.toast .tt{flex:1;min-width:0}.toast b{display:block;font-size:14px;font-weight:600}.toast span{display:block;font-size:12px;color:#a1a1aa;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.toast em{font-style:normal;font-size:11px;color:#8d8d96;align-self:flex-start;margin-top:13px}
'''
ACC = '#268cff'

def bar(clock='12:22', ctl_on=False, extra_right=''):
    return (f'<div class="bar"><div class="pill" style="gap:7px"><i class="ws on"></i><i class="ws"></i><i class="ws"></i><i class="ws"></i></div>'
            f'<div class="pill">{clock}</div>'
            f'<div class="right">{extra_right}<div class="pill">{ic("wifi", 16)}{ic("bluetooth", 16)}{ic("volume-2", 16)}<span style="display:flex;align-items:center;gap:5px">{ic("battery-full", 18)}86%</span></div>'
            f'<div class="pill">us</div><div class="pill{" on" if ctl_on else ""}" style="padding:0 9px" aria-label="Control">{ic("sliders-horizontal", 16)}</div></div></div>')

def dock(running=(0, 1)):
    apps = ['folder.webp', 'shield.webp', 'monitor.png', 'images.png', 'ledger.png', 'fix.png', 'settings.webp']
    h = ''.join(f'<div class="app{" run" if i in running else ""}"><img src="{A}{f}" alt=""></div>' for i, f in enumerate(apps))
    return f'<div class="dock">{h}<div class="sep"></div><div class="app"><img src="{A}nova-star.png" alt=""></div></div>'

def page(title, inner, wall='wall', dim=False):
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
<div class="frame" style="--acc:{ACC}">
<img class="{wall}" src="{A}wallpaper.png" alt="">{'<div class="dim"></div>' if dim else ''}
{inner}
</div></body></html>'''

S = {}
# 1. desktop
S['shell-desktop'] = ('Desktop', bar() + dock())

# 2. Control panel (from the live NOVA desktop)
cp = f'''<div class="cp" style="top:100px">
<div class="col" style="width:300px">
 <div class="sc"><p class="lbl">Sound</p>
  <div class="rowc"><div class="rb">{ic("volume-2", 18)}</div><div class="sl"><i style="width:88%"></i><b style="left:88%"></b></div><span class="pct">88%</span></div>
  <p class="lbl" style="margin:16px 0 8px">Output</p>
  <div class="out">{ic("audio-lines", 17)}Echo-Cancel Sink</div>
  <div class="out on">{ic("monitor", 17)}LG Ultragear</div>
  <div class="out">{ic("headphones", 17)}Headphones &amp; speakers</div></div>
 <div class="sc"><div class="rowc">{ic("moon", 18)}<div><div class="t1">Do Not Disturb</div><div class="t2">Off</div></div><div class="tog"></div></div></div>
 <div class="sc"><p class="lbl">Shortcuts</p><div class="rowc" style="gap:14px">
  <div class="rb" aria-label="Screenshot">{ic("camera", 17)}</div><div class="rb" aria-label="Search">{ic("search", 17)}</div><div class="rb" aria-label="Files">{ic("folder", 17)}</div><div class="rb" aria-label="Lock">{ic("lock", 17)}</div><div class="rb" aria-label="Power">{ic("power", 17)}</div></div></div>
</div>
<div class="col" style="width:232px">
 <div class="sc"><div class="rowc">{ic("wifi", 18)}<div><div class="t1">Wi-Fi</div><div class="t2">Home 5G</div></div><span style="margin-left:auto;color:#8c8c92;display:flex">{ic("chevron-right", 16)}</span></div></div>
 <div class="sc"><div class="rowc">{ic("bluetooth", 18)}<div><div class="t1">Bluetooth</div><div class="t2">AirPods Pro</div></div><span style="margin-left:auto;color:#8c8c92;display:flex">{ic("chevron-right", 16)}</span></div></div>
 <div class="sc"><div class="rowc">{ic("moon-star", 18)}<div><div class="t1">Night Mode</div><div class="t2">On · 3992K</div></div><div class="tog on night"></div></div>
  <div class="rowc" style="margin-top:14px;gap:10px">{ic("sun", 14)}<div class="sl" style="background:#252528"><i style="width:62%;background:linear-gradient(90deg,#96703a,#d6a44c)"></i><b style="left:62%"></b></div>{ic("moon", 14)}</div></div>
 <div class="sc"><p class="lbl">USB &amp; Drives</p><div class="rowc">{ic("hard-drive", 19)}<div><div class="t1">ARCH_202609</div><div class="t2">Not mounted</div></div><div class="rb" style="margin-left:auto" aria-label="Eject">{ic("eject", 16)}</div></div></div>
</div></div>
<div class="cp-head" style="top:62px"><span style="font-size:16px;font-weight:600">Control</span><span class="edit">Edit</span></div>'''
S['shell-control'] = ('Control panel', bar(ctl_on=True) + dock() + cp)

# 3. lock screen
lock = f'''<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;z-index:3">
<div style="margin-top:170px;font-size:200px;font-weight:600;letter-spacing:-.02em;line-height:1">12:22</div>
<div style="margin-top:18px;font-size:30px;font-weight:500;color:rgba(255,255,255,.85)">Thursday, 1 October</div>
<div style="margin-top:auto;margin-bottom:46px;display:flex;flex-direction:column;align-items:center;gap:14px;color:rgba(255,255,255,.7);font-size:15px;font-weight:500">
{ic("chevron-up", 20)}Swipe up to unlock</div></div>
<div style="position:absolute;top:22px;right:26px;display:flex;gap:14px;color:rgba(255,255,255,.8);z-index:3">{ic("wifi", 18)}{ic("battery-full", 20)}</div>'''
S['shell-lock'] = ('Lock screen', lock, 'wall blur', True)

# 3b. lock screen, password
pw = f'''<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;z-index:3">
<div style="margin-top:96px;font-size:96px;font-weight:600;letter-spacing:-.02em;line-height:1">12:22</div>
<div style="margin-top:10px;font-size:20px;font-weight:500;color:rgba(255,255,255,.8)">Thursday, 1 October</div>
<div style="margin-top:150px;width:88px;height:88px;border-radius:44px;background:linear-gradient(135deg,#3b8bff,#f5921e);display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:700">A</div>
<div style="margin-top:14px;font-size:18px;font-weight:600">Alex</div>
<div style="margin-top:18px;width:300px;height:48px;border-radius:24px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.14);display:flex;align-items:center;padding:0 6px 0 20px;box-sizing:border-box;gap:8px">
<span style="flex:1;letter-spacing:.3em;font-size:18px">••••••</span><span style="width:36px;height:36px;border-radius:18px;background:#f2f2f4;color:#0b0b0e;display:flex;align-items:center;justify-content:center">{ic("arrow-right", 18)}</span></div>
<div style="margin-top:14px;font-size:13px;color:rgba(255,255,255,.65)">Enter your password</div></div>'''
S['shell-lock-password'] = ('Lock screen: password', pw, 'wall blur', True)

# 4. notifications
def toast(icon, bg, fg, title, line):
    return f'<div class="toast"><div class="ti" style="background:{bg};color:{fg}">{ic(icon, 18)}</div><div class="tt"><b>{title}</b><span>{line}</span></div><em>now</em></div>'
notes = ('<div class="toasts">' + toast('nova-shield', 'rgba(52,199,89,.16)', '#5fdc86', 'Shield blocked a port scan', '203.0.113.24 tried port 22. Nothing got in.')
         + toast('usb', 'rgba(38,140,255,.16)', '#6aa8ff', 'ARCH_202609 connected', 'USB drive · 32 GB · Open in Files')
         + toast('nova-guard', 'rgba(52,199,89,.16)', '#5fdc86', 'Scan complete', 'No threats found in 48,210 files')
         + '</div>')
S['shell-notifications'] = ('Notifications', bar() + dock() + notes)

# 5. power menu
def pbtn(icon, label, key, danger=False):
    c = '#ff5c5c' if danger else '#f2f2f4'
    return (f'<div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:104px">'
            f'<div style="width:72px;height:72px;border-radius:36px;background:{"rgba(255,92,92,.16)" if danger else "rgba(255,255,255,.08)"};color:{c};display:flex;align-items:center;justify-content:center">{ic(icon, 26)}</div>'
            f'<span style="font-size:14px;font-weight:600">{label}</span><span class="kbd">{key}</span></div>')
pm = (f'<div class="glass" style="left:50%;top:50%;transform:translate(-50%,-50%);padding:30px 28px 26px;display:flex;flex-direction:column;align-items:center;gap:22px">'
      f'<div style="font-size:15px;color:#a1a1aa;font-weight:500">Signed in as <b style="color:#f2f2f4">Alex</b></div>'
      f'<div style="display:flex;gap:8px">{pbtn("lock", "Lock", "L")}{pbtn("moon-star", "Sleep", "S")}{pbtn("log-out", "Log out", "O")}{pbtn("rotate-ccw", "Restart", "R")}{pbtn("power", "Shut down", "P", True)}</div>'
      f'<div style="font-size:12px;color:#8d8d96;display:flex;gap:8px;align-items:center"><span class="kbd">esc</span> cancel</div></div>')
S['shell-power'] = ('Power menu', bar() + dock() + '<div class="dim" style="background:rgba(0,0,0,.4);z-index:3"></div>' + pm)

# 6. OSD: volume / brightness, above the dock
osd = (f'<div class="glass" style="left:50%;bottom:96px;transform:translateX(-50%);height:56px;width:340px;border-radius:28px;display:flex;align-items:center;gap:14px;padding:0 20px;box-sizing:border-box">'
       f'{ic("volume-2", 20)}<div class="sl" style="height:8px;border-radius:4px"><i style="width:64%;border-radius:4px;background:#f2f2f4"></i></div><span class="pct" style="width:30px">64</span></div>')
S['shell-osd'] = ('Volume / brightness OSD', bar() + dock() + osd)

# 7. Wi-Fi and Bluetooth pickers: open from the Control panel cards, same position as the panel
def picker(title, icon, rows, foot):
    r = ''.join(f'<div class="out{" on" if on else ""}" style="height:48px">{ic(i, 18)}<div style="flex:1"><div class="t1">{n}</div>{f"<div class=t2>{s}</div>" if s else ""}</div>{ic(t, 16) if t else ""}</div>' for i, n, s, t, on in rows)
    return (f'<div class="sc" style="position:absolute;right:15px;top:57px;width:360px;padding:16px;z-index:4">'
            f'<div class="rowc" style="margin-bottom:12px">{ic("chevron-left", 18)}<span style="font-size:16px;font-weight:600">{title}</span><div class="tog on"></div></div>'
            f'{r}<div style="height:1px;background:rgba(255,255,255,.06);margin:10px 0"></div><div class="out" style="color:#a1a1aa">{ic(foot[0], 17)}{foot[1]}</div></div>')
wifi = picker('Wi-Fi', 'wifi', [('wifi', 'Home 5G', 'Connected · Private address on', 'lock', True), ('wifi-high', 'Home 2.4G', '', 'lock', False),
                                ('wifi-low', 'Cafe Guest', 'Open network', 'shield-alert', False), ('wifi-low', 'NETGEAR-42', '', 'lock', False)], ('settings', 'Network settings'))
bt = picker('Bluetooth', 'bluetooth', [('headphones', 'AirPods Pro', 'Connected · 82%', 'battery-full', True), ('keyboard', 'MX Keys', 'Paired', '', False),
                                        ('mouse', 'MX Master 3S', 'Paired', '', False), ('smartphone', 'Pixel 9', 'Nearby', '', False)], ('search', 'Searching for devices…'))
S['shell-wifi'] = ('Wi-Fi picker', bar(ctl_on=True) + dock() + wifi)
S['shell-bluetooth'] = ('Bluetooth picker', bar(ctl_on=True) + dock() + bt)

out = os.path.join(HERE, '..', 'screens')
for name, v in S.items():
    title, inner = v[0], v[1]; wall = v[2] if len(v) > 2 else 'wall'; dim = v[3] if len(v) > 3 else False
    open(os.path.join(out, name + '.html'), 'w').write(page(title, inner, wall, dim))
print(len(S), 'shell screens')
