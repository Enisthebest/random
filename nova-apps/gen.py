# Generates the NOVA OS app design artboards (.dc.html) + canvas index from one shared design system.
import json, re, os, datetime
ROOT = os.path.dirname(os.path.abspath(__file__))
LUCIDE = '/home/user/random/nova-os/node_modules/lucide-static/icons/'
A = {
 'wall': '/_blob/7d31e4e8d17b4505882c1cd7aa30b595', 'star': '/_blob/7648c8f5b886accd3eaf466089cdf7e4',
 'shield': '/_blob/13f573a93c0b6cd51fc2774545d5e2ec', 'folder': '/_blob/c455cb22b07e6c9a796fb4cac3710390',
 'settings': '/_blob/a662e4032fa52bbb496ca34c0de1077a', 'monitor': '/_blob/a026c59a86a658da97d38f270699cb31',
 'ledger': '/_blob/c7fc646dda7d88134cc171d0c8865bdc', 'images': '/_blob/d50f3718fdad6fe5e6b541c41940ebe2',
 'fix': '/_blob/3e13560d2fcf399778de665911adabba',
}
def ic(name, size=18, color='currentColor', sw=2):
    svg = open(LUCIDE + name + '.svg').read()
    inner = svg[svg.index('>', svg.index('<svg')) + 1: svg.rindex('</svg>')].strip()
    inner = re.sub(r'\s+', ' ', inner).replace(' />', '/>').replace('/>', '></' + 'x>')
    # close each element explicitly (format requires closed non-void elements)
    inner = re.sub(r'<(path|circle|rect|line|polyline|polygon|ellipse)([^>]*)></x>', r'<\1\2></\1>', inner)
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0">{inner}</svg>')

CSS = '''
body{margin:0;font-family:"Geist",system-ui,sans-serif;color:#f2f2f4;-webkit-font-smoothing:antialiased}
a{color:#6aa8ff}a:hover{color:#9cc4ff}
button{font:inherit;color:inherit}
.frame{position:relative;width:1440px;height:900px;overflow:hidden;background:#050507}
.wall{position:absolute;left:-80px;top:-80px;width:1600px;height:1060px;object-fit:cover;filter:blur(46px) brightness(.5) saturate(1.2)}
.bar{position:absolute;left:0;right:0;top:12px;height:36px;display:flex;justify-content:space-between;padding:0 16px;box-sizing:border-box}
.pill{height:36px;border-radius:12px;background:rgba(16,16,20,.9);border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:10px;padding:0 14px;box-sizing:border-box;font-size:13px;font-weight:600}
.win{position:absolute;left:80px;top:76px;width:1280px;height:776px;border-radius:24px;background:rgba(12,12,16,.9);border:1px solid rgba(255,255,255,.09);box-shadow:0 40px 90px rgba(0,0,0,.55),0 8px 24px rgba(0,0,0,.35);display:flex;overflow:hidden;backdrop-filter:blur(30px)}
.side{width:248px;flex-shrink:0;background:rgba(255,255,255,.025);border-right:1px solid rgba(255,255,255,.06);padding:22px 14px;box-sizing:border-box;display:flex;flex-direction:column;gap:4px}
.app{display:flex;align-items:center;gap:12px;padding:4px 10px 18px}
.app b{font-size:17px;font-weight:700;letter-spacing:-.01em}
.sec{font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#8d8d96;padding:16px 12px 6px}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:11px;font-size:14px;font-weight:500;color:#d6d6db;text-decoration:none;border:0;background:none;text-align:left;width:100%;box-sizing:border-box}
.nav.on{background:rgba(59,139,255,.18);color:#fff}
.nav.on svg{color:#6aa8ff}
.main{flex-grow:1;display:flex;flex-direction:column;min-width:0}
.head{height:76px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:0 32px;border-bottom:1px solid rgba(255,255,255,.06)}
.h1{font-size:26px;font-weight:700;letter-spacing:-.02em;margin:0}
.sub{font-size:14px;color:#a1a1aa;margin:2px 0 0}
.body{flex-grow:1;padding:28px 32px;display:flex;flex-direction:column;gap:20px;overflow:hidden}
.card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:20px;box-sizing:border-box}
.label{font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#8d8d96;margin:0 0 12px}
.row{display:flex;align-items:center;gap:14px;min-height:56px;border-top:1px solid rgba(255,255,255,.05)}
.row:first-of-type{border-top:0}
.rt{flex-grow:1;min-width:0}
.rt b{display:block;font-size:15px;font-weight:600}
.rt span{display:block;font-size:13px;color:#a1a1aa;margin-top:2px}
.ico{width:36px;height:36px;border-radius:11px;background:rgba(59,139,255,.14);color:#6aa8ff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.tog{width:46px;height:28px;border-radius:14px;border:0;background:#3a3a40;position:relative;flex-shrink:0;padding:0}
.tog span{position:absolute;left:3px;top:3px;width:22px;height:22px;border-radius:11px;background:#f4f4f6;box-shadow:0 1px 3px rgba(0,0,0,.4)}
.tog.on{background:#2f9e5a}
.tog.on span{left:21px}
.btn{height:40px;padding:0 18px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);font-size:14px;font-weight:600;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.btn.pri{background:#f2f2f4;color:#0b0b0e;border-color:#f2f2f4}
.chip{height:28px;padding:0 12px;border-radius:14px;display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;white-space:nowrap}
.ok{background:rgba(52,199,89,.16);color:#5fdc86}
.warn{background:rgba(245,146,30,.16);color:#ffae5a}
.blue{background:rgba(59,139,255,.16);color:#8cbcff}
.mono{font-family:"Geist Mono",ui-monospace,monospace}
.search{height:40px;width:240px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:10px;padding:0 12px;box-sizing:border-box;color:#a1a1aa;font-size:14px}
.grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
.grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.grid4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.big{font-size:34px;font-weight:700;letter-spacing:-.03em}
table{border-collapse:collapse;width:100%;font-size:14px}
th{font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#8d8d96;text-align:left;padding:0 0 10px}
td{padding:11px 0;border-top:1px solid rgba(255,255,255,.05);color:#e4e4e7}
td.m{color:#a1a1aa}
'''

def page(title, app_icon, app_name, nav, main_html, extra_head=''):
    navs = []
    for item in nav:
        if item[0] == '§':
            navs.append(f'<div class="sec">{item[1:]}</div>'); continue
        name, icon, on = item
        cur = ' aria-current="page"' if on else ''
        cls = 'nav on' if on else 'nav'
        navs.append(f'<button class="{cls}"{cur}>{ic(icon, 18)}{name}</button>')
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&amp;family=Geist+Mono:wght@400;500&amp;display=swap" rel="stylesheet">
<style>{CSS}</style>
</helmet>
<div class="frame" style="width: 1440px; height: 900px">
<img class="wall" src="{A["wall"]}" alt="">
<div class="bar">
<div class="pill" style="width: 165px"><span style="width: 27px; height: 22px; border-radius: 7px; background: #c9c9cf; display: block"></span></div>
<div class="pill">12:22</div>
<div style="display: flex; gap: 10px"><div class="pill"><img src="{A["star"]}" alt="" style="width: 16px; height: 16px; object-fit: contain"><img src="{A["shield"]}" alt="" style="width: 16px; height: 16px; object-fit: contain"></div><div class="pill">us</div></div>
</div>
<div class="win">
<aside class="side">
<div class="app"><img src="{A[app_icon]}" alt="" style="width: 36px; height: 36px; object-fit: contain"><b>{app_name}</b></div>
{"".join(navs)}
</aside>
<main class="main">
{main_html}
</main>
</div>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":1440,"height":900}}}}'>
class Component extends DCLogic {{
renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''

def tog(on, label):
    return f'<button class="tog{" on" if on else ""}" aria-pressed="{"true" if on else "false"}" aria-label="{label}"><span></span></button>'

def row(icon, title, sub, right):
    return f'<div class="row"><div class="ico">{ic(icon, 18)}</div><div class="rt"><b>{title}</b><span>{sub}</span></div>{right}</div>'

def head(title, sub, right=''):
    return f'<div class="head"><div><h1 class="h1">{title}</h1><p class="sub">{sub}</p></div><div style="display: flex; gap: 12px; align-items: center">{right}</div></div>'

B = {}

# ---------- Shield ----------
groups = [
 ('Network', [('globe', 'Private DNS', 'Encrypted lookups', 1), ('lock', 'VPN kill switch', 'No VPN, no traffic', 1), ('layers', 'Tor per app', 'Route chosen apps over Tor', 0), ('network', 'Network watch', 'See every connection', 1)]),
 ('Identity', [('fingerprint', 'Hide your device ID', 'A new identity on every network', 1), ('user', 'Guest mode', 'A clean space for anyone else', 0), ('eye-off', 'Decoy login', 'A second password opens a decoy', 0)]),
 ('Device', [('camera-off', 'Camera off switch', 'Camera and mic blocked', 1), ('usb', 'Lock on USB unplug', 'Pull the key, screen locks', 1), ('shield-check', 'Boot tamper check', 'Verified on every start', 1), ('box', 'Sandbox status', 'Every app in its own space', 1)]),
 ('Data', [('trash-2', 'Secure delete', 'Files gone for good', 1), ('clipboard', 'Clipboard auto-clear', 'Cleared after 60 seconds', 1), ('image-off', 'Metadata wipe', 'Photos shared without location', 1)]),
]
cards = ''.join(f'<div class="card"><p class="label">{g}</p>' + ''.join(row(i, n, s, tog(o, n)) for i, n, s, o in items) + '</div>' for g, items in groups)
B['Main.dc.html'] = ('NOVA Shield', page('NOVA Shield', 'shield', 'Shield',
 [('Overview', 'layout-grid', 1), ('Network', 'globe', 0), ('Identity', 'fingerprint', 0), ('Device', 'laptop', 0), ('Data', 'hard-drive', 0), '§Insight', ('Activity', 'activity', 0)],
 head('Privacy', '14 protections. One tap each.', '<span class="chip ok">' + ic('shield-check', 15) + 'Protected</span>') +
 '<div class="body" style="gap: 20px">'
 '<div class="card" style="display: flex; align-items: center; gap: 22px; padding: 22px 26px; background: linear-gradient(90deg, rgba(52,199,89,.10), rgba(255,255,255,.03))">'
 f'<img src="{A["shield"]}" alt="" style="width: 72px; height: 72px; object-fit: contain">'
 '<div style="flex-grow: 1"><div style="font-size: 22px; font-weight: 700; letter-spacing: -.02em">You’re protected</div><div class="sub">11 of 14 protections on · nothing phones home</div></div>'
 '<button class="btn">' + ic('sliders-horizontal', 16) + 'Turn all on</button></div>'
 f'<div class="grid2" style="grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start">{cards}</div></div>'))

# ---------- NOVA Guard ----------
B['Guard.dc.html'] = ('NOVA Guard', page('NOVA Guard', 'shield', 'NOVA Guard',
 [('Overview', 'layout-grid', 1), ('Scans', 'scan-search', 0), ('Quarantine', 'archive', 0), ('Real-time', 'activity', 0), ('History', 'history', 0)],
 head('Protection', 'Your device is being watched over.', '<button class="btn">' + ic('settings-2', 16) + 'Scan settings</button>') +
 '<div class="body">'
 '<div class="card" style="display: flex; align-items: center; gap: 40px; padding: 32px 40px">'
 '<div style="position: relative; width: 190px; height: 190px; flex-shrink: 0">'
 '<svg width="190" height="190" viewBox="0 0 190 190" aria-hidden="true"><circle cx="95" cy="95" r="84" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="12"></circle><circle cx="95" cy="95" r="84" fill="none" stroke="#34c759" stroke-width="12" stroke-linecap="round" stroke-dasharray="527.8" stroke-dashoffset="0" transform="rotate(-90 95 95)"></circle></svg>'
 '<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #5fdc86">' + ic('check', 64, '#5fdc86', 2.4) + '</div></div>'
 '<div style="flex-grow: 1"><div class="big">No threats found</div><div class="sub" style="font-size: 16px; margin-top: 6px">Last scan: today at [TIME] · [N] files checked</div>'
 '<div style="display: flex; gap: 12px; margin-top: 24px"><button class="btn pri">' + ic('scan-search', 16) + 'Quick scan</button><button class="btn">' + ic('hard-drive', 16) + 'Full scan</button><button class="btn">' + ic('folder', 16) + 'Scan a folder</button></div></div></div>'
 '<div class="grid3">'
 + ''.join(f'<div class="card"><div style="display: flex; justify-content: space-between; align-items: center"><div class="ico">{ic(i, 18)}</div>{r}</div><div style="font-size: 16px; font-weight: 600; margin-top: 16px">{t}</div><div class="sub">{s}</div></div>'
   for i, t, s, r in [('activity', 'Real-time protection', 'Checks files as they open', tog(1, 'Real-time protection')),
                      ('archive', 'Quarantine', 'Nothing held right now', '<span class="chip blue">0 items</span>'),
                      ('refresh-cw', 'Threat definitions', 'Updated [DATE]', '<span class="chip ok">Up to date</span>')]) +
 '</div>'
 '<div class="card" style="padding-bottom: 8px"><p class="label">Recent scans</p><table><thead><tr><th>Scan</th><th>When</th><th>Files</th><th>Result</th></tr></thead><tbody>'
 + ''.join(f'<tr><td>{a}</td><td class="m">{b}</td><td class="m mono">{c}</td><td><span class="chip ok" style="height: 24px">Clean</span></td></tr>' for a, b, c in [('Quick scan', '[TODAY]', '[N]'), ('Full scan', '[DATE]', '[N]'), ('USB · ARCH_202609', '[DATE]', '[N]')]) +
 '</tbody></table></div></div>'))

# ---------- Files ----------
folders = ['Documents', 'Pictures', 'Music', 'Projects', 'Screenshots', 'Downloads']
B['Files.dc.html'] = ('Files', page('Files', 'folder', 'Files',
 ['§Favorites', ('Home', 'house', 1), ('Documents', 'file-text', 0), ('Pictures', 'image', 0), ('Downloads', 'download', 0), ('Screenshots', 'camera', 0), '§Devices', ('ARCH_202609', 'hard-drive', 0), '§More', ('Trash', 'trash-2', 0)],
 '<div class="head"><div style="display: flex; align-items: center; gap: 14px"><button class="btn" aria-label="Back" style="padding: 0 10px">' + ic('chevron-left', 18) + '</button><button class="btn" aria-label="Forward" style="padding: 0 10px; color: #6e6e77">' + ic('chevron-right', 18) + '</button>'
 '<div style="font-size: 22px; font-weight: 700; letter-spacing: -.02em">Home</div></div>'
 '<div style="display: flex; gap: 12px; align-items: center"><div class="search">' + ic('search', 16) + 'Search Home</div><button class="btn" aria-label="Grid view" style="padding: 0 10px">' + ic('layout-grid', 18) + '</button><button class="btn" aria-label="List view" style="padding: 0 10px; color: #8d8d96">' + ic('list', 18) + '</button></div></div>'
 '<div class="body" style="gap: 26px"><div><p class="label">Folders</p><div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px">'
 + ''.join(f'<button style="border: 0; background: {"rgba(59,139,255,.14)" if i == 3 else "none"}; border-radius: 16px; padding: 14px 8px; display: flex; flex-direction: column; align-items: center; gap: 10px"><img src="{A["folder"]}" alt="" style="width: 92px; height: 78px; object-fit: contain"><span style="font-size: 14px; font-weight: 500">{f}</span></button>' for i, f in enumerate(folders)) +
 '</div></div><div class="card" style="padding-bottom: 6px"><p class="label">Recent</p><table><thead><tr><th>Name</th><th>Kind</th><th>Size</th><th>Modified</th></tr></thead><tbody>'
 + ''.join(f'<tr><td><span style="display: inline-flex; align-items: center; gap: 12px"><span class="ico" style="width: 30px; height: 30px; border-radius: 9px">{ic(i, 15)}</span>{n}</span></td><td class="m">{k}</td><td class="m mono">{s}</td><td class="m">{m}</td></tr>'
   for i, n, k, s, m in [('image', 'Screenshot 12-22.png', 'PNG image', '[SIZE]', 'Today'), ('file-text', 'Launch notes.md', 'Markdown', '[SIZE]', 'Today'), ('folder', 'nova-wallpapers', 'Folder', '[N] items', 'Yesterday'), ('file-archive', 'backup.tar.zst', 'Archive', '[SIZE]', '[DATE]')]) +
 '</tbody></table></div></div>'))

# ---------- Monitor ----------
def bars(vals, color):
    w = 8; g = 5
    rects = ''.join(f'<rect x="{i*(w+g)}" y="{48-v*0.48:.1f}" width="{w}" height="{v*0.48:.1f}" rx="3" fill="{color}" opacity="{0.45+0.55*(i/len(vals)):.2f}"></rect>' for i, v in enumerate(vals))
    return f'<svg width="{len(vals)*(w+g)}" height="48" viewBox="0 0 {len(vals)*(w+g)} 48" aria-hidden="true">{rects}</svg>'
stats = [('cpu', 'CPU', '[18]%', [20, 35, 18, 42, 30, 22, 55, 28, 18, 24, 30, 18], '#6aa8ff'),
         ('memory-stick', 'Memory', '[5.2] GB', [40, 42, 41, 44, 46, 45, 47, 46, 48, 47, 46, 45], '#b48cff'),
         ('gpu', 'GPU', '[9]%', [8, 12, 30, 14, 9, 7, 10, 22, 12, 9, 8, 9], '#5fdc86'),
         ('hard-drive', 'Disk', '[41]%', [41] * 12, '#ffae5a')]
procs = [('Hyprland', '[3.1]%', '[210] MB'), ('Browser', '[7.4]%', '[1.2] GB'), ('Files', '[0.8]%', '[96] MB'), ('NOVA Guard', '[0.4]%', '[64] MB'), ('Terminal', '[0.2]%', '[38] MB'), ('Images', '[0.1]%', '[120] MB')]
B['Monitor.dc.html'] = ('Monitor', page('Monitor', 'monitor', 'Monitor',
 [('Overview', 'layout-grid', 1), ('Processes', 'list', 0), ('Temperatures', 'thermometer', 0), ('Network', 'network', 0), ('Startup', 'power', 0)],
 head('What’s running', 'Live, on this device only.', '<div class="search">' + ic('search', 16) + 'Find a process</div>') +
 '<div class="body"><div class="grid4">'
 + ''.join(f'<div class="card"><div style="display: flex; align-items: center; gap: 10px; color: #a1a1aa; font-size: 14px; font-weight: 600">{ic(i, 17, c)}{n}</div><div class="big" style="margin: 10px 0 14px">{v}</div>{bars(vals, c)}</div>' for i, n, v, vals, c in stats) +
 '</div><div style="display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 20px; flex-grow: 1">'
 '<div class="card" style="padding-bottom: 6px"><p class="label">Processes</p><table><thead><tr><th>Name</th><th>CPU</th><th>Memory</th><th></th></tr></thead><tbody>'
 + ''.join(f'<tr><td>{n}</td><td class="m mono">{c}</td><td class="m mono">{m}</td><td style="text-align: right"><button class="btn" style="height: 30px; padding: 0 12px; font-size: 13px">End</button></td></tr>' for n, c, m in procs) +
 '</tbody></table></div><div class="card" style="display: flex; flex-direction: column; gap: 18px"><p class="label" style="margin: 0">Temperatures</p>'
 + ''.join(f'<div><div style="display: flex; justify-content: space-between; font-size: 14px"><span style="font-weight: 600">{n}</span><span class="mono" style="color: #a1a1aa">{v}</span></div><div style="height: 8px; border-radius: 4px; background: rgba(255,255,255,.08); margin-top: 8px"><div style="width: {p}%; height: 8px; border-radius: 4px; background: {c}"></div></div></div>'
   for n, v, p, c in [('CPU', '[48]°C', 48, '#5fdc86'), ('GPU', '[52]°C', 52, '#5fdc86'), ('SSD', '[39]°C', 39, '#5fdc86')]) +
 '<div class="chip ok" style="align-self: flex-start">' + ic('check', 14) + 'All good. Fans quiet.</div></div></div></div>'))

# ---------- Ledger ----------
def vcard(title, kind, last, grad, x=0, y=0, z=1, rot=0):
    return (f'<div style="width: 360px; height: 226px; border-radius: 22px; background: {grad}; padding: 24px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 20px 40px rgba(0,0,0,.45); border: 1px solid rgba(255,255,255,.18); flex-shrink: 0">'
            f'<div style="display: flex; justify-content: space-between; align-items: center"><span style="font-weight: 700; font-size: 16px">{title}</span><img src="{A["star"]}" alt="" style="width: 26px; height: 26px; object-fit: contain"></div>'
            f'<div><div class="mono" style="font-size: 20px; letter-spacing: .12em">•••• •••• •••• {last}</div><div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 13px; color: rgba(255,255,255,.8)"><span>[CARDHOLDER]</span><span>{kind}</span></div></div></div>')
B['Ledger.dc.html'] = ('Ledger', page('Ledger', 'ledger', 'Ledger',
 [('Cards', 'credit-card', 1), ('Passes', 'ticket', 0), ('Receipts', 'receipt', 0), '§Privacy', ('Locked cards', 'lock', 0), ('Activity', 'activity', 0)],
 head('Card vault', 'Encrypted and stored only on this device.', '<button class="btn pri">' + ic('plus', 16) + 'Add card</button>') +
 '<div class="body" style="flex-direction: row; gap: 24px">'
 '<div style="flex-grow: 1; display: flex; flex-direction: column; gap: 22px; min-width: 0"><div style="display: flex; gap: 20px">'
 + vcard('Personal', 'Debit', '[4821]', 'linear-gradient(135deg, #1a3fb8, #2fb7e0 60%, #f58e1e)')
 + vcard('Travel', 'Credit', '[0934]', 'linear-gradient(135deg, #3a1060, #b0164f 55%, #ff7a1a)') +
 '</div><div class="card" style="padding-bottom: 6px"><p class="label">Recent use · Personal</p><table><thead><tr><th>Where</th><th>When</th><th>Amount</th></tr></thead><tbody>'
 + ''.join(f'<tr><td>{a}</td><td class="m">{b}</td><td class="mono">{c}</td></tr>' for a, b, c in [('[MERCHANT]', 'Today', '[AMOUNT]'), ('[MERCHANT]', 'Yesterday', '[AMOUNT]'), ('[MERCHANT]', '[DATE]', '[AMOUNT]')]) +
 '</tbody></table></div></div>'
 '<div class="card" style="width: 340px; flex-shrink: 0; display: flex; flex-direction: column; gap: 4px"><p class="label">Personal · •••• [4821]</p>'
 + row('lock', 'Lock card', 'Block all use instantly', tog(0, 'Lock card'))
 + row('fingerprint', 'Ask before paying', 'Approve every payment', tog(1, 'Ask before paying'))
 + row('eye-off', 'Hide number', 'Show digits only on request', tog(1, 'Hide number'))
 + row('globe', 'Online payments', 'Allowed', tog(1, 'Online payments')) +
 '<div style="flex-grow: 1"></div><button class="btn" style="justify-content: center">' + ic('copy', 16) + 'Copy card number</button></div></div>'))

# ---------- Images ----------
tiles = []
spots = ['20% 30%', '70% 20%', '50% 70%', '85% 60%', '35% 55%', '60% 40%', '10% 80%', '90% 10%', '45% 20%', '75% 80%', '25% 10%', '55% 90%']
hues = [0, 20, -15, 35, 0, -30, 10, 45, -10, 25, 0, -20]
for i, (sp, h) in enumerate(zip(spots, hues)):
    tiles.append(f'<div style="aspect-ratio: 1 / 1; border-radius: 14px; overflow: hidden; position: relative; border: 1px solid rgba(255,255,255,.08){"; outline: 3px solid #3b8bff; outline-offset: 2px" if i == 4 else ""}"><img src="{A["wall"]}" alt="Photo {i+1}" style="width: 100%; height: 100%; object-fit: cover; object-position: {sp}; filter: hue-rotate({h}deg) saturate(1.1)"></div>')
B['Images.dc.html'] = ('Images', page('Images', 'images', 'Images',
 [('Library', 'images', 1), ('Favorites', 'heart', 0), ('Screenshots', 'camera', 0), '§Albums', ('Wallpapers', 'image', 0), ('Travel', 'map-pin', 0), '§Private', ('Hidden', 'eye-off', 0)],
 head('Library', '[N] photos · [N] videos', '<span class="chip ok">' + ic('image-off', 15) + 'Metadata wipe on</span><div class="search" style="width: 200px">' + ic('search', 16) + 'Search photos</div>') +
 '<div class="body" style="gap: 16px"><div style="display: flex; justify-content: space-between; align-items: center"><div style="font-size: 18px; font-weight: 700">Today</div>'
 '<div style="display: flex; gap: 8px"><button class="btn" style="height: 34px">Years</button><button class="btn" style="height: 34px">Months</button><button class="btn pri" style="height: 34px">All photos</button></div></div>'
 f'<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px">{"".join(tiles)}</div>'
 '<div class="card" style="display: flex; align-items: center; gap: 14px; padding: 14px 18px"><div class="ico">' + ic('shield-check', 18) + '</div><div class="rt"><b>Shared photos leave without location</b><span>Metadata wipe removes place, device and time before anything is shared.</span></div><button class="btn">Manage</button></div></div>'))

# ---------- Fix ----------
checks = [('hard-drive', 'Disk health', 'No errors on the system drive', '<span class="chip ok">' + ic('check', 14) + 'Healthy</span>'),
          ('package', 'Packages', '[3] updates ready to install', '<button class="btn" style="height: 34px">Update</button>'),
          ('power', 'Boot', 'Verified start, no tamper detected', '<span class="chip ok">' + ic('check', 14) + 'Healthy</span>'),
          ('wifi', 'Network', 'Connected · DNS private', '<span class="chip ok">' + ic('check', 14) + 'Healthy</span>'),
          ('volume-2', 'Audio', 'Output switched to Headphones', '<span class="chip ok">' + ic('check', 14) + 'Healthy</span>'),
          ('monitor', 'Display', 'Refresh rate below panel maximum', '<button class="btn" style="height: 34px">Repair</button>')]
B['Fix.dc.html'] = ('Fix', page('Fix', 'fix', 'Fix',
 [('Checkup', 'stethoscope', 1), ('Disk', 'hard-drive', 0), ('Packages', 'package', 0), ('Boot', 'power', 0), ('Network', 'wifi', 0), ('Audio', 'volume-2', 0), '§Advanced', ('Logs', 'scroll-text', 0)],
 head('Checkup', 'Find and fix problems in one tap.', '') +
 '<div class="body"><div class="card" style="display: flex; align-items: center; gap: 26px; padding: 26px 30px; background: linear-gradient(90deg, rgba(59,139,255,.12), rgba(255,255,255,.03))">'
 f'<img src="{A["fix"]}" alt="" style="width: 76px; height: 76px; object-fit: contain">'
 '<div style="flex-grow: 1"><div style="font-size: 24px; font-weight: 700; letter-spacing: -.02em">2 things need a look</div><div class="sub">Everything else is healthy. Last checkup: [TIME]</div></div>'
 '<button class="btn pri" style="height: 46px; padding: 0 22px">' + ic('wand-sparkles', 17) + 'Fix all</button></div>'
 '<div style="display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: 20px; flex-grow: 1">'
 '<div class="card" style="padding-top: 12px; padding-bottom: 6px">' + ''.join(row(i, t, s, r) for i, t, s, r in checks) + '</div>'
 '<div class="card" style="display: flex; flex-direction: column"><p class="label">Log</p><div class="mono" style="font-size: 12.5px; line-height: 1.8; color: #b4b4bc; white-space: pre-line">'
 '[12:14] disk  ✓ smart ok\n[12:14] boot  ✓ signature verified\n[12:14] net   ✓ dns private\n[12:15] pkg   ! 3 updates available\n[12:15] disp  ! 60 Hz, panel supports more\n[12:15] audio ✓ headphones active</div>'
 '<div style="flex-grow: 1"></div><button class="btn" style="justify-content: center">' + ic('download', 16) + 'Export report</button></div></div></div>'))

# ---------- Settings ----------
sw = ['#268cff', '#ff921e', '#30d158', '#ff408c', '#a060ff', '#8e8e98']
B['Settings.dc.html'] = ('Settings', page('Settings', 'settings', 'Settings',
 [('Appearance', 'palette', 1), ('Display', 'monitor', 0), ('Sound', 'volume-2', 0), ('Network', 'wifi', 0), ('Privacy', 'shield-check', 0), ('Keyboard', 'keyboard', 0), '§System', ('About NOVA', 'info', 0)],
 head('Appearance', 'Make it yours.', '') +
 '<div class="body" style="gap: 20px"><div class="card"><p class="label">Theme</p><div style="display: flex; gap: 16px">'
 + ''.join(f'<button style="border: 0; background: none; padding: 0; display: flex; flex-direction: column; gap: 10px; align-items: flex-start"><div style="width: 200px; height: 120px; border-radius: 14px; background: {bg}; border: {"2px solid #3b8bff" if on else "1px solid rgba(255,255,255,.12)"}; box-sizing: border-box; position: relative; overflow: hidden"><div style="position: absolute; left: 14px; top: 14px; width: 110px; height: 70px; border-radius: 9px; background: {fg}"></div></div><span style="font-size: 14px; font-weight: 600">{n}</span></button>'
   for n, bg, fg, on in [('Dark', '#0c0c10', '#1c1c22', 1), ('Light', '#e9e9ee', '#ffffff', 0), ('Auto', 'linear-gradient(90deg, #0c0c10 50%, #e9e9ee 50%)', 'rgba(128,128,136,.5)', 0)]) +
 '</div></div><div class="grid2"><div class="card"><p class="label">Accent colour</p><div style="display: flex; gap: 14px">'
 + ''.join(f'<button aria-label="Accent {c}" style="width: 40px; height: 40px; border-radius: 20px; background: {c}; border: 0; {"outline: 2.5px solid #fff; outline-offset: 3px" if i == 0 else ""}"></button>' for i, c in enumerate(sw)) +
 '</div></div><div class="card"><p class="label">Text size</p><div style="display: flex; align-items: center; gap: 14px"><span style="font-size: 13px">A</span><div style="flex-grow: 1; height: 6px; border-radius: 3px; background: rgba(255,255,255,.1); position: relative"><div style="width: 45%; height: 6px; border-radius: 3px; background: #3b8bff"></div><div style="position: absolute; left: 45%; top: -8px; width: 22px; height: 22px; border-radius: 11px; background: #f4f4f6; margin-left: -11px"></div></div><span style="font-size: 20px; font-weight: 600">A</span></div></div></div>'
 '<div class="card"><p class="label">Wallpaper</p><div style="display: flex; gap: 16px">'
 + ''.join(f'<div style="width: 220px; height: 124px; border-radius: 14px; overflow: hidden; border: {"2px solid #3b8bff" if i == 0 else "1px solid rgba(255,255,255,.1)"}"><img src="{A["wall"]}" alt="Wallpaper option {i+1}" style="width: 100%; height: 100%; object-fit: cover; object-position: {p}; filter: hue-rotate({h}deg)"></div>' for i, (p, h) in enumerate([('50% 50%', 0), ('80% 30%', 40), ('30% 70%', -40), ('60% 60%', 180)])) +
 '</div></div><div class="card" style="padding-top: 10px; padding-bottom: 10px">'
 + row('layers', 'Transparency', 'Blur behind windows and panels', tog(1, 'Transparency'))
 + row('moon-star', 'Night Mode on a schedule', 'Warmer after sunset', tog(1, 'Night Mode schedule')) +
 '</div></div>'))

# ---------- ACE ----------
def bubble(text, me):
    if me:
        return f'<div style="align-self: flex-end; max-width: 60%; background: #2f7cf6; color: #fff; padding: 12px 18px; border-radius: 20px 20px 6px 20px; font-size: 15px">{text}</div>'
    return f'<div style="align-self: flex-start; max-width: 70%; display: flex; gap: 12px"><img src="{A["star"]}" alt="" style="width: 26px; height: 26px; object-fit: contain; margin-top: 6px"><div style="background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.07); padding: 12px 18px; border-radius: 20px 20px 20px 6px; font-size: 15px; line-height: 1.5">{text}</div></div>'
B['ACE.dc.html'] = ('ACE', page('ACE', 'star', 'ACE',
 [('New chat', 'square-pen', 0), '§Today', ('PC temperatures', 'message-circle', 1), ('Clean up inbox', 'message-circle', 0), ('Weekend weather', 'message-circle', 0), '§Settings', ('Permissions', 'lock', 0)],
 head('PC temperatures', 'ACE runs on your device. It only sees what you allow.', '<span class="chip warn">' + ic('sparkles', 14) + 'Pro</span>') +
 '<div style="flex-grow: 1; display: flex; min-height: 0">'
 '<div style="flex-grow: 1; display: flex; flex-direction: column; padding: 28px 32px; gap: 16px; min-width: 0">'
 + bubble('How hot is my PC running?', 1)
 + bubble('CPU is at [48]°C and GPU at [52]°C. All good, fans are quiet. I’ll tell you if that changes.', 0)
 + bubble('Clean up my inbox too.', 1)
 + bubble('Done. I sorted [N] emails into Newsletters, Receipts and Important. Inbox zero.', 0) +
 '<div style="flex-grow: 1"></div><div style="display: flex; gap: 10px"><button class="btn" style="height: 34px">Open Files and Settings</button><button class="btn" style="height: 34px">What’s the weather tomorrow?</button><button class="btn" style="height: 34px">Message Sam</button></div>'
 '<label style="display: flex; align-items: center; gap: 12px; height: 54px; border-radius: 27px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); padding: 0 8px 0 22px"><span class="sr" style="position: absolute; width: 1px; height: 1px; overflow: hidden">Message ACE</span><input placeholder="Ask ACE anything" style="flex-grow: 1; background: none; border: 0; color: #f2f2f4; font: inherit; font-size: 15px; outline: none"><button aria-label="Send" style="width: 40px; height: 40px; border-radius: 20px; border: 0; background: #f2f2f4; color: #0b0b0e; display: flex; align-items: center; justify-content: center">' + ic('arrow-up', 18, '#0b0b0e') + '</button></label></div>'
 '<div style="width: 300px; flex-shrink: 0; border-left: 1px solid rgba(255,255,255,.06); padding: 28px 22px; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px"><p class="label">What ACE can do</p>'
 + ''.join(f'<div style="display: flex; align-items: center; gap: 12px; font-size: 14px; color: #d6d6db">{ic(i, 17, "#8cbcff")}{t}</div>' for i, t in [('app-window', 'Opens your apps'), ('globe', 'Searches the web'), ('message-circle', 'Messages your friends'), ('mail', 'Cleans your inbox'), ('thermometer', 'Watches your PC temps'), ('layers', 'Handles many tasks at once')]) +
 '<div style="flex-grow: 1"></div>'
 + ''.join(f'<div style="background: #ececef; color: #111114; border-radius: 16px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600">{ic(i, 18, "#111114")}<span style="flex-grow: 1">{t}</span>{ic("lock", 16, "#111114")}</div>' for i, t in [('eye', 'Sees your screen, only when you ask'), ('square-terminal', 'Runs commands, only with your permission')]) +
 '</div></div>'))

# ---------- write files + canvas ----------
order = ['Main.dc.html', 'Guard.dc.html', 'Files.dc.html', 'Monitor.dc.html', 'Ledger.dc.html', 'Images.dc.html', 'Fix.dc.html', 'Settings.dc.html', 'ACE.dc.html']
boards = {}
for i, name in enumerate(order):
    col, r = i % 3, i // 3
    boards[name] = {'x': col * (1440 + 80), 'y': r * (900 + 240), 'w': 1440, 'h': 900, 'title': B[name][0]}
    open(os.path.join(ROOT, 'project', name), 'w').write(B[name][1])
canvas = {'v': 3, 'createdOnFiles': {'v': 1, 'at': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')},
          'title': 'NOVA OS App Designs', 'launch': {'view': 'canvas'}, 'pages': [], 'boards': boards, 'order': order,
          'notes': {'title': {'x': 0, 'y': -320, 'text': 'NOVA OS — every app, one system', 'kind': 'title1', 'maxW': 4480}}, 'designSystems': []}
json.dump(canvas, open(os.path.join(ROOT, 'project', 'canvas.json'), 'w'), indent=1)
print('wrote', len(order), 'artboards')
