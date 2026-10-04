"""Generates the NOVA Store screens (screens/store-*.html). NOVA ships small: the core apps are built in, everything
else comes from the Store. NOVA apps come from NOVA's own signed package repo; other apps come from Flathub."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))

def head(path):
    """Run a generator's setup code (helpers + CSS), stopping before it builds and writes its screens."""
    src = open(os.path.join(HERE, '..', path)).read()
    ns = {'__file__': os.path.join(HERE, '..', path)}
    exec(src[:src.index('\nS = {}')], ns)
    return ns

SU = head('setup/gen_setup.py')
SH = head('shell/gen_shell.py')
ic, A = SU['ic'], SU['A']

CSS = SU['CSS'] + '''
.glass{position:absolute;border-radius:24px;background:rgba(12,12,16,.92);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(40px) saturate(1.3);z-index:4}
.swin{position:absolute;left:60px;top:62px;width:1320px;height:748px;border-radius:24px;background:rgba(12,12,16,.92);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(30px);display:flex;overflow:hidden;z-index:2}
.snav{width:232px;background:rgba(255,255,255,.025);border-right:1px solid rgba(255,255,255,.06);padding:22px 14px;box-sizing:border-box;display:flex;flex-direction:column}
.snav .it{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:11px;font-size:14px;font-weight:500;color:#d4d4d8}
.snav .it.on{background:var(--sel);color:#fff}.snav .it.on svg{color:var(--acc-text)}
.snav .it .n{margin-left:auto;height:20px;min-width:20px;padding:0 6px;box-sizing:border-box;border-radius:10px;background:var(--acc);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center}
.snav .sl{font-size:11px;font-weight:700;letter-spacing:.08em;color:#8d8d96;margin:16px 12px 6px}
.search{height:40px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:10px;padding:0 14px;font-size:14px;color:#8d8d96;box-sizing:border-box}
.ai{width:var(--s);height:var(--s);flex-shrink:0;display:block}
.ai-tile{border-radius:calc(var(--s) * .23);display:flex;align-items:center;justify-content:center;background:radial-gradient(120% 120% at 30% 15%,var(--c1),#0a0a0e 70%);border:1px solid rgba(255,255,255,.08);box-sizing:border-box;color:var(--c2)}
.acard{display:flex;align-items:center;gap:14px;padding:14px;border-radius:18px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06)}
.acard .t1{font-size:15px;font-weight:600}.acard .t2{font-size:12.5px;color:#a1a1aa;margin-top:3px;line-height:1.35}
.get{margin-left:auto;height:32px;padding:0 16px;border-radius:16px;background:rgba(59,139,255,.16);color:#7db5ff;font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;flex-shrink:0}
.get.open{background:rgba(255,255,255,.08);color:#f2f2f4}
.get.big{height:42px;padding:0 26px;border-radius:21px;font-size:15px;background:var(--acc);color:#fff}
.tag{height:22px;padding:0 8px;border-radius:11px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:5px}
.tag.nova{background:rgba(59,139,255,.14);color:#7db5ff}.tag.fh{background:rgba(255,255,255,.07);color:#c4c4cc}.tag.core{background:rgba(255,255,255,.07);color:#a1a1aa}
.h3{font-size:18px;font-weight:700;margin:0 0 12px;display:flex;align-items:center}
.h3 a{margin-left:auto;font-size:13px;font-weight:600;color:#7db5ff}
.facts{display:flex;border-radius:16px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06)}
.facts div{flex:1;padding:14px 18px;border-right:1px solid rgba(255,255,255,.06)}.facts div:last-child{border:0}
.facts b{display:block;font-size:15px;font-weight:700}.facts span{font-size:12px;color:#8d8d96}
.bar2{height:6px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden}.bar2 i{display:block;height:100%;background:var(--acc)}
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

# every app: key -> (name, one line, icon, size)  icon = an asset file, or (lucide, glow colour, glyph colour)
APPS = {
    'breather': ('Breather', 'Locks the screen for a short break so you get up and move.', 'breather-icon.svg', '2.1 MB'),
    'guard':    ('NOVA Guard', 'Scans files and downloads for viruses, on your PC.', ('shield-check', '#1d4d2e', '#5fdc86'), '180 MB'),
    'monitor':  ('Monitor', 'See what is using your processor, memory and disk.', 'monitor.png', '3.4 MB'),
    'fix':      ('Fix', 'Finds what slows your PC down and fixes it in one click.', 'fix.png', '4.0 MB'),
    'ledger':   ('Ledger', 'Keep your cards safe in an encrypted vault.', 'ledger.png', '5.2 MB'),
    'images':   ('Images', 'A fast photo viewer with simple edits.', 'images.png', '6.8 MB'),
    'editor':   ('Text Editor', 'A clean editor for notes and code.', ('file-text', '#2a2f45', '#b9c6ff'), '3.1 MB'),
    'clean':    ('Clean Share', 'Removes hidden location and camera data from photos.', ('image-off', '#4a2a1a', '#ffae5a'), '1.4 MB'),
    'vault':    ('Vault', 'A locked folder for private files.', ('vault', '#3a2350', '#c9a2ff'), '2.6 MB'),
    'notes':    ('Notes', 'Quick notes that stay on your PC.', ('notebook-pen', '#4a4214', '#ffd84d'), '1.9 MB'),
    # core: built in, cannot be removed
    'files':    ('Files', 'Your files and folders.', 'folder.webp', ''),
    'settings': ('Settings', 'Everything about your PC.', 'settings.webp', ''),
    'shield':   ('Shield', 'Firewall, VPN and privacy.', 'shield.webp', ''),
    'browser':  ('NOVA Browser', 'Blocks trackers by default.', ('globe', '#13304f', '#6aa8ff'), ''),
    'terminal': ('Terminal', 'For when you want to type.', ('square-terminal', '#26262c', '#e4e4e7'), ''),
    'store':    ('NOVA Store', 'Get more apps.', 'store-icon.svg', ''),
}

def icon(k, s):
    src = APPS[k][2]
    if isinstance(src, str): return f'<img class="ai" style="--s:{s}px;object-fit:contain" src="{A}{src}" alt="">'
    g, c1, c2 = src
    return f'<div class="ai ai-tile" style="--s:{s}px;--c1:{c1};--c2:{c2}">{ic(g, int(s * .5), 2)}</div>'

def card(k, state='get'):
    n, d = APPS[k][0], APPS[k][1]
    btn = {'get': '<span class="get">Get</span>', 'open': '<span class="get open">Open</span>'}[state]
    return f'<div class="acard">{icon(k, 56)}<div style="min-width:0"><div class="t1">{n}</div><div class="t2">{d}</div></div>{btn}</div>'

def nav(on, updates=2):
    items = [('compass', 'Discover'), ('sparkles', 'NOVA apps'), ('gamepad-2', 'Games'), ('package', 'Other apps')]
    h = ''.join(f'<div class="it{" on" if n == on else ""}">{ic(i, 18)}{n}</div>' for i, n in items)
    h += '<div class="sl">YOURS</div>'
    h += f'<div class="it{" on" if on == "Installed" else ""}">{ic("hard-drive", 18)}Installed</div>'
    h += f'<div class="it{" on" if on == "Updates" else ""}">{ic("refresh-cw", 18)}Updates<span class="n">{updates}</span></div>'
    return (f'<div class="snav"><div style="display:flex;align-items:center;gap:12px;margin:0 10px 20px"><img src="{A}store-icon.svg" alt="" style="width:34px;height:34px">'
            f'<span style="font-size:18px;font-weight:700">Store</span></div>{h}'
            f'<div style="margin-top:auto;display:flex;gap:10px;padding:12px;border-radius:14px;background:rgba(52,199,89,.08);border:1px solid rgba(52,199,89,.18)">'
            f'<span style="color:#5fdc86;display:flex">{ic("nova-shield", 17)}</span><span style="font-size:12px;color:#c4c4cc;line-height:1.4">No account. No tracking. Downloads are signed and checked.</span></div></div>')

WALL = f'<img class="wall" src="{A}wallpaper.png" alt="" style="filter:none;transform:none">'
S = {}

# 1. Discover
mint = 'linear-gradient(120deg,#0e2a24 0%,#0b1414 55%,#0a1820 100%)'
hero = f'''<div style="position:relative;height:220px;border-radius:22px;overflow:hidden;background:{mint};border:1px solid rgba(63,220,170,.18);display:flex;align-items:center;padding:0 34px;gap:28px">
 <div style="position:absolute;right:-60px;top:-80px;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(63,220,170,.28),rgba(63,220,170,0) 70%)"></div>
 {icon("breather", 120)}
 <div style="position:relative;flex:1"><span class="tag" style="background:rgba(63,220,170,.16);color:#6ff0c4">{ic("sparkles", 12)}NEW FROM NOVA</span>
  <div style="font-size:34px;font-weight:800;letter-spacing:-.03em;margin-top:10px">Breather</div>
  <div style="font-size:15px;color:#c4c4cc;margin-top:6px;max-width:440px">Your screen locks for 5 minutes so you get up and move. Turn it off any time.</div></div>
 <span class="get big" style="position:relative;background:#3fdcaa;color:#04130e">Get</span></div>'''
grid = lambda ks, st={}: '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">' + ''.join(card(k, st.get(k, 'get')) for k in ks) + '</div>'
fh = f'''<div style="display:flex;align-items:center;gap:18px;padding:18px 22px;border-radius:18px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06)">
 <div style="width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;color:#c4c4cc">{ic("package", 26)}</div>
 <div style="flex:1"><div style="font-size:15px;font-weight:600">Thousands more open-source apps</div><div style="font-size:12.5px;color:#a1a1aa;margin-top:3px">Browsers, chat, music, creative tools and games from Flathub. Every app shows where it comes from.</div></div>
 <span class="get open">Browse</span></div>'''
disc = f'''<div class="swin">{nav("Discover")}
<div style="flex:1;min-width:0;display:flex;flex-direction:column">
 <div style="display:flex;align-items:center;gap:14px;padding:18px 28px;border-bottom:1px solid rgba(255,255,255,.06)">
  <div class="search" style="width:420px">{ic("search", 16)}Search apps</div>
  <span style="margin-left:auto;font-size:13px;color:#8d8d96;display:flex;align-items:center;gap:8px">Open with<span class="kbd">super</span><span class="kbd">A</span></span></div>
 <div style="padding:22px 28px;display:flex;flex-direction:column;gap:22px;overflow:hidden">
  {hero}
  <div><div class="h3">Made by NOVA<a>See all</a></div>{grid(["guard", "fix", "monitor", "clean", "ledger", "images"], {"images": "open"})}</div>
  {fh}
 </div></div></div>'''
S['store-discover'] = ('Store: Discover', SH['bar']() + disc, WALL)

# 2. An app page
shots = ''.join(f'<img src="../png/{p}.png" alt="" style="width:330px;height:206px;object-fit:cover;border-radius:14px;border:1px solid rgba(255,255,255,.08)">' for p in ['breather-app', 'breather-lock', 'breather-warning'])
perm = lambda i, t, s, c='#a1a1aa': f'<div style="display:flex;gap:12px;align-items:flex-start;padding:10px 0"><span style="color:{c};display:flex;margin-top:1px">{ic(i, 17)}</span><div><div style="font-size:14px;font-weight:600">{t}</div><div style="font-size:12.5px;color:#8d8d96;margin-top:2px">{s}</div></div></div>'
detail = f'''<div class="swin">{nav("NOVA apps")}
<div style="flex:1;min-width:0;padding:22px 30px;display:flex;flex-direction:column;gap:20px;overflow:hidden">
 <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#8d8d96">{ic("chevron-left", 16)}NOVA apps</div>
 <div style="display:flex;align-items:center;gap:24px">{icon("breather", 112)}
  <div style="flex:1"><div style="font-size:34px;font-weight:800;letter-spacing:-.03em">Breather</div>
   <div style="font-size:15px;color:#a1a1aa;margin-top:4px">Get up and move. Your work waits for you.</div>
   <div style="display:flex;gap:8px;margin-top:10px"><span class="tag nova">{ic("badge-check", 12)}Made by NOVA</span><span class="tag fh">{ic("wifi-off", 12)}Works offline</span></div></div>
  <span class="get big">{ic("download", 17)}Get</span></div>
 <div class="facts"><div><b>2.1 MB</b><span>Download</span></div><div><b>1.0</b><span>Version</span></div><div><b>Free</b><span>Always</span></div><div><b>GPL-3.0</b><span>Open source</span></div></div>
 <div style="display:flex;gap:14px">{shots}</div>
 <div style="display:flex;gap:18px">
  <div style="flex:1"><div class="h3">About</div><div style="font-size:14px;color:#c4c4cc;line-height:1.55">Every 50 minutes, Breather covers your screen for a 5-minute break: stand up, stretch, get water. It waits until your game or call is over, gives you a 1-minute warning, and holding Esc for 3 seconds always gets you out.</div></div>
  <div style="width:400px;padding:6px 20px;border-radius:18px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06)">
   {perm("nova-shield", "Collects nothing", "No data leaves your PC. Not even to NOVA.", "#5fdc86")}
   {perm("monitor", "Covers the screen during breaks", "Only for the break you set. Esc for 3 s ends it.")}
   {perm("clock", "Reads whether you're active", "Just active or idle, never what you do.")}</div></div>
</div></div>'''
S['store-app'] = ('Store: Breather', SH['bar']() + detail, WALL)

# 3. Installed + updates
def irow(k, right, tag=''):
    n, d, _, sz = APPS[k]
    return (f'<div class="row" style="min-height:66px">{icon(k, 40)}<div style="flex:1"><div class="t1" style="display:flex;gap:8px;align-items:center">{n}{tag}</div><div class="t2">{d}</div></div>'
            f'<span style="font-size:12px;color:#8d8d96;width:70px;text-align:right">{sz}</span>{right}</div>')
rm = f'<span class="get open" style="color:#ff8a7a;background:rgba(255,92,70,.10)">{ic("trash-2", 14)}Remove</span>'
upd = '<span class="get">Update</span>'
core = '<span class="tag core">Part of NOVA</span>'
inst = f'''<div class="swin">{nav("Installed")}
<div style="flex:1;min-width:0;padding:22px 30px;display:flex;flex-direction:column;gap:18px;overflow:hidden">
 <div style="display:flex;align-items:center"><div><div style="font-size:28px;font-weight:700">Installed</div><div style="font-size:14px;color:#a1a1aa;margin-top:4px">Only what you chose. Remove anything you don't use.</div></div>
  <span class="get" style="margin-left:auto;height:38px;border-radius:19px;padding:0 18px">{ic("refresh-cw", 15)}Update all (2)</span></div>
 <div class="card" style="padding:0 20px">
  <div class="row" style="min-height:44px"><span class="lbl" style="margin:0">Updates · 2</span></div>
  {irow("guard", upd, '<span class="tag nova">1.2 → 1.3</span>')}
  {irow("images", upd, '<span class="tag nova">2.0 → 2.1</span>')}</div>
 <div class="card" style="padding:0 20px">
  <div class="row" style="min-height:44px"><span class="lbl" style="margin:0">Your apps · 3</span></div>
  {irow("breather", rm)}{irow("fix", rm)}{irow("monitor", rm)}</div>
 <div class="card" style="padding:4px 20px 12px"><div class="row" style="min-height:44px;border:0"><span class="lbl" style="margin:0">Built in</span><span style="margin-left:auto;font-size:12px;color:#8d8d96">These keep NOVA working, so they can't be removed.</span></div>
  <div style="display:flex;gap:26px">{"".join(f'<div style="display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600">{icon(k, 30)}{APPS[k][0]}</div>' for k in ["files", "settings", "shield", "browser", "terminal", "store"])}</div></div>
</div></div>'''
S['store-installed'] = ('Store: Installed', SH['bar']() + inst, WALL)

# 4. First boot: pick your apps (a step in the setup wizard)
pick = lambda k, on: (f'<div class="acard" style="padding:12px 14px;{"border-color:rgba(59,139,255,.45);background:rgba(59,139,255,.08)" if on else ""}">{icon(k, 44)}'
                      f'<div style="min-width:0"><div class="t1" style="font-size:14px">{APPS[k][0]}</div><div class="t2" style="font-size:12px">{APPS[k][1]}</div></div>'
                      f'<span style="margin-left:auto;width:24px;height:24px;border-radius:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;{"background:var(--acc);color:#fff" if on else "border:1.5px solid rgba(255,255,255,.2)"}">{ic("check", 14, 3) if on else ""}</span></div>')
chosen = {'guard': True, 'breather': True, 'fix': True, 'images': True}
fb = f'''<div class="glass" style="left:50%;top:50%;transform:translate(-50%,-50%);width:960px;padding:34px 36px 28px;box-sizing:border-box;z-index:2">
 <div style="display:flex;align-items:center;gap:16px">{icon("store", 52)}<div><div style="font-size:28px;font-weight:800;letter-spacing:-.03em">Pick your apps</div>
  <div style="font-size:14px;color:#a1a1aa;margin-top:4px">NOVA starts light. Choose what you want now, or get more from the Store later.</div></div></div>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:24px">{"".join(pick(k, chosen.get(k, False)) for k in ["guard", "breather", "fix", "monitor", "images", "ledger", "editor", "clean"])}</div>
 <div style="display:flex;align-items:center;gap:12px;margin-top:22px;font-size:13px;color:#a1a1aa">{ic("hard-drive", 16)}4 apps · 193 MB
  <span style="margin-left:auto" class="btn">Skip for now</span><span class="btn pri">Install 4 apps</span></div></div>'''
S['store-firstboot'] = ('Setup: pick your apps', fb, f'<img class="wall" src="{A}wallpaper.png" alt=""><div class="dim"></div>')

out = os.path.join(HERE, '..', 'screens')
for name, (title, inner, bg) in S.items():
    open(os.path.join(out, name + '.html'), 'w').write(page(title, inner, bg))
print(len(S), 'store screens')
