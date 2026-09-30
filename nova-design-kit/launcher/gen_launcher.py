"""Generates the NOVA launcher screens (screens/launcher-*.html) in the kit's design language."""
import re, os
HERE = os.path.dirname(os.path.abspath(__file__))
LUCIDE = '/home/user/random/nova-os/node_modules/lucide-static/icons/'
A = '../assets/'

def ic(name, size=18, color='currentColor', sw=2):
    svg = open(LUCIDE + name + '.svg').read()
    inner = re.sub(r'\s+', ' ', svg[svg.index('>', svg.index('<svg')) + 1: svg.rindex('</svg>')].strip())
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0">{inner}</svg>')

CSS = '''
body{margin:0;font-family:"Geist",system-ui,sans-serif;color:#f2f2f4;-webkit-font-smoothing:antialiased}
.frame{position:relative;width:1440px;height:900px;overflow:hidden;background:#050507}
.wall{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.dim{position:absolute;inset:0;background:rgba(0,0,0,.28)}
.bar{position:absolute;left:0;right:0;top:9px;height:36px;display:flex;justify-content:space-between;padding:0 15px;box-sizing:border-box}
.pill{height:36px;border-radius:12px;background:#101013;border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:10px;padding:0 14px;box-sizing:border-box;font-size:13px;font-weight:600}
.ws{width:8px;height:8px;border-radius:4px;background:rgba(255,255,255,.3)}.ws.on{width:22px;background:#f2f2f4}
.dock{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);height:64px;border-radius:16px;background:rgba(16,16,19,.9);border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:16px;padding:0 12px;box-sizing:border-box}
.dock img{width:44px;height:44px;object-fit:contain}
/* launcher */
.ln{position:absolute;left:50%;top:150px;transform:translateX(-50%);width:720px;border-radius:24px;background:rgba(14,14,18,.86);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(40px) saturate(1.3);overflow:hidden}
.q{height:68px;display:flex;align-items:center;gap:14px;padding:0 22px;border-bottom:1px solid rgba(255,255,255,.06);color:#a1a1aa}
.q .txt{flex-grow:1;font-size:22px;font-weight:500;letter-spacing:-.01em;color:#f2f2f4;display:flex;align-items:center}
.q .ph{color:#6e6e77}
.caret{display:inline-block;width:2px;height:26px;background:var(--acc);margin-left:2px;border-radius:1px}
.kbd{font-style:normal;height:24px;min-width:24px;padding:0 7px;box-sizing:border-box;border-radius:7px;background:rgba(255,255,255,.08);color:#a1a1aa;font-size:12px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:4px}
.list{padding:10px 10px 12px}
.sec{font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#8d8d96;padding:12px 12px 8px}
.apps{display:grid;grid-template-columns:repeat(8,1fr);gap:4px;padding:0 4px 4px}
.tile{display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 0 10px;border-radius:16px;font-size:12px;font-weight:500;color:#d6d6db}
.tile img{width:52px;height:52px;object-fit:contain}
.tile.on{background:var(--sel);color:#fff}
.row{display:flex;align-items:center;gap:14px;height:52px;padding:0 12px;border-radius:14px}
.row.on{background:var(--sel)}
.row .ico{width:34px;height:34px;border-radius:10px;background:rgba(255,255,255,.06);color:#d6d6db;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.row .ico.acc{background:var(--tint);color:var(--acc2)}
.row img.ai{width:34px;height:34px;object-fit:contain;flex-shrink:0}
.rt{flex-grow:1;min-width:0;display:flex;align-items:baseline;gap:10px}
.rt b{font-size:15px;font-weight:500;color:#c9c9cf;white-space:nowrap}
.rt b em{font-style:normal;font-weight:700;color:#fff}
.rt span{font-size:13px;color:#8d8d96;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kind{font-size:12px;color:#6e6e77;font-weight:500}
.row.on .kind{display:none}
.hint{display:none;align-items:center;gap:6px;font-size:12px;color:#d6d6db;font-weight:500}
.row.on .hint{display:flex}
.top{display:flex;align-items:center;gap:18px;margin:4px 4px 6px;padding:16px 18px;border-radius:18px;background:var(--sel)}
.top img{width:64px;height:64px;object-fit:contain}
.top .tt{flex-grow:1}
.top .tt b{display:block;font-size:22px;font-weight:700;letter-spacing:-.02em}
.top .tt span{display:block;font-size:13px;color:#c9c9cf;margin-top:3px}
.btn{height:36px;padding:0 14px;border-radius:11px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:8px;color:#f2f2f4}
.btn.pri{background:#f2f2f4;color:#0b0b0e;border-color:transparent}
.foot{height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-top:1px solid rgba(255,255,255,.06);font-size:12px;color:#8d8d96}
.foot .k{display:flex;align-items:center;gap:14px}
.foot .k span{display:flex;align-items:center;gap:6px}
.calc{display:flex;align-items:center;justify-content:space-between;margin:4px 4px 6px;padding:22px 24px;border-radius:18px;background:var(--sel)}
.calc .eq{font-size:15px;color:#c9c9cf;font-family:"Geist Mono",monospace}
.calc .res{font-size:44px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.chip{height:24px;padding:0 10px;border-radius:999px;font-size:12px;font-weight:600;display:inline-flex;align-items:center;gap:6px}
.chip.pro{background:rgba(245,146,30,.16);color:#ffae5a}
.ace{margin:4px 4px 6px;padding:18px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)}
.ace .h{display:flex;align-items:center;gap:12px}
.ace .h img{width:30px;height:30px;object-fit:contain}
.ace .h b{font-size:15px;font-weight:600;flex-grow:1}
.step{display:flex;align-items:center;gap:12px;height:44px;padding:0 12px;margin-top:6px;border-radius:12px;background:rgba(255,255,255,.04);font-size:14px;font-weight:500}
.step .n{width:22px;height:22px;border-radius:11px;background:var(--tint);color:var(--acc2);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center}
.step .ico{color:#a1a1aa;margin-left:auto}
.acts{display:flex;justify-content:flex-end;gap:10px;margin-top:14px;align-items:center}
.acts .note{flex-grow:1;font-size:12px;color:#8d8d96;display:flex;align-items:center;gap:6px}
'''
ACC = {'--acc': '#3B8BFF', '--acc2': '#6AA8FF', '--sel': 'rgba(59,139,255,.18)', '--tint': 'rgba(59,139,255,.16)'}

def desktop(inner, title):
    style = ';'.join(f'{k}:{v}' for k, v in ACC.items())
    dock = ''.join(f'<img src="{A}{f}" alt="">' for f in ['folder.webp', 'shield.webp', 'monitor.png', 'images.png', 'ledger.png', 'fix.png', 'settings.webp', 'nova-star.png'])
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&amp;family=Geist+Mono:wght@400;500&amp;display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
<div class="frame" style="{style}">
<img class="wall" src="{A}wallpaper.png" alt=""><div class="dim"></div>
<div class="bar"><div class="pill" style="gap:6px"><i class="ws on"></i><i class="ws"></i><i class="ws"></i></div>
<div class="pill">12:22</div>
<div style="display:flex;gap:12px"><div class="pill">{ic('wifi', 16)}{ic('volume-2', 16)}</div><div class="pill">us</div><div class="pill" style="padding:0 7px">{ic('sliders-horizontal', 16)}</div></div></div>
<div class="dock">{dock}</div>
<div class="ln" role="dialog" aria-label="Launcher">
{inner}
</div></div></body></html>'''

def query(text, placeholder=False):
    t = f'<span class="ph">{text}</span>' if placeholder else f'{text}<i class="caret"></i>'
    if placeholder: t = '<i class="caret" style="margin:0 4px 0 0"></i>' + t
    return f'<div class="q">{ic("search", 22)}<div class="txt">{t}</div><span class="kbd">esc</span></div>'

def foot(extra=''):
    return (f'<div class="foot"><div class="k"><span><i class="kbd">↑</i><i class="kbd">↓</i> move</span><span><i class="kbd">↵</i> open</span>'
            f'<span><i class="kbd">tab</i> actions</span>{extra}</div><div class="k"><span><i class="kbd">super</i><i class="kbd">space</i> open launcher</span></div></div>')

def row(icon, title, sub, kind, on=False, hint='Open'):
    return (f'<div class="row{" on" if on else ""}">{icon}<div class="rt"><b>{title}</b><span>{sub}</span></div>'
            f'<span class="kind">{kind}</span><span class="hint">{hint} <i class="kbd">↵</i></span></div>')

def ico(name, acc=False): return f'<div class="ico{" acc" if acc else ""}">{ic(name, 18)}</div>'
def aimg(f): return f'<img class="ai" src="{A}{f}" alt="">'

# 1. just opened: pinned apps + recent
apps = [('shield.webp', 'Shield'), ('folder.webp', 'Files'), ('monitor.png', 'Monitor'), ('images.png', 'Images'),
        ('ledger.png', 'Ledger'), ('fix.png', 'Fix'), ('settings.webp', 'Settings'), ('nova-star.png', 'ACE')]
grid = ''.join(f'<div class="tile{" on" if i == 0 else ""}"><img src="{A}{f}" alt="">{n}</div>' for i, (f, n) in enumerate(apps))
open_ = query('Search apps, files and settings', True) + f'''<div class="list">
<div class="sec">Apps</div><div class="apps">{grid}</div>
<div class="sec">Recent</div>
{row(ico('file-text'), 'Budget 2026.pdf', 'Documents', 'File')}
{row(ico('image'), 'Screenshot 12-22.png', 'Pictures › Screenshots', 'File')}
{row(ico('moon', True), 'Night Mode', 'Settings › Display', 'Setting')}
{row(ico('square-terminal'), 'Terminal', 'App', 'App')}
</div>''' + foot()

# 2. typing "mo": top hit + grouped results, matched letters bold
search = query('mo') + f'''<div class="list">
<div class="top"><img src="{A}monitor.png" alt=""><div class="tt"><b><em style="font-style:normal">Mo</em>nitor</b><span>App · What's running, live on this device</span></div>
<span class="btn pri">Open <i class="kbd" style="background:rgba(0,0,0,.08);color:#0b0b0e">↵</i></span></div>
<div class="sec">Settings</div>
{row(ico('monitor', True), '<em>Mo</em>nitors &amp; resolution', 'Settings › Display', 'Setting')}
{row(ico('moon', True), 'Night <em>Mo</em>de', 'Settings › Display · Off', 'Setting', hint='Turn on')}
<div class="sec">Files</div>
{row(ico('file-text'), '<em>Mo</em>nthly report.pdf', 'Documents › Work', 'File')}
{row(ico('folder'), '<em>Mo</em>vies', 'Home', 'Folder')}
<div class="sec">Actions</div>
{row(ico('lock'), 'Lock screen', 'Super + L', 'Action')}
</div>''' + foot()

# 3. quick answers: calculator / units without opening an app
calc = query('128 × 12 + 64') + f'''<div class="list">
<div class="calc"><div><div class="eq">128 × 12 + 64</div><div class="res">1,600</div></div>
<span class="btn">{ic('copy', 16)} Copy <i class="kbd">↵</i></span></div>
<div class="sec">Also</div>
{row(ico('calculator'), 'Open in Calculator', '128 × 12 + 64', 'App', hint='Open')}
{row(ico('arrow-left-right'), '1,600 USD in EUR', 'Offline rates · updated today', 'Convert', hint='Show')}
</div>''' + foot()

# 4. Pro: a sentence goes to ACE, shown as a draft the user confirms
ace = query('turn off wifi and lock my screen') + f'''<div class="list">
<div class="ace"><div class="h"><img src="{A}nova-star.png" alt=""><b>ACE will do this</b><span class="chip pro">{ic('sparkles', 13)} Pro</span></div>
<div class="step"><span class="n">1</span>Turn off Wi-Fi<span class="ico">{ic('wifi-off', 17)}</span></div>
<div class="step"><span class="n">2</span>Lock the screen<span class="ico">{ic('lock', 17)}</span></div>
<div class="acts"><span class="note">{ic('shield-check', 14)} Runs on this device. Nothing happens until you press Run.</span>
<span class="btn">Edit</span><span class="btn pri">Run <i class="kbd" style="background:rgba(0,0,0,.08);color:#0b0b0e">↵</i></span></div></div>
<div class="sec">Also</div>
{row(ico('wifi', True), 'Wi-Fi', 'Settings › Network · On', 'Setting', hint='Open')}
{row(ico('lock'), 'Lock screen', 'Super + L', 'Action', hint='Run')}
</div>''' + foot()

out = os.path.join(HERE, '..', 'screens')
for name, body, title in [('launcher-open', open_, 'Launcher'), ('launcher-search', search, 'Launcher: search'),
                          ('launcher-calc', calc, 'Launcher: quick answer'), ('launcher-ace', ace, 'Launcher: ACE (Pro)')]:
    open(os.path.join(out, name + '.html'), 'w').write(desktop(body, title))
print('launcher screens written')
