"""Generates Terminal, Text Editor and NOVA Browser screens (screens/terminal.html, editor.html, browser-*.html) in the kit's app style."""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.join(HERE, '..')
ICONS = os.path.join(KIT, '..', 'nova-icons', 'svg') + '/'
A = '../assets/'
s = open(os.path.join(KIT, 'screens', 'settings.html')).read()
BASE = s[s.index('<style>') + 7: s.index('</style>')]

def ic(name, size=18, sw=2):
    t = open(ICONS + name + '.svg').read()
    inner = t[t.index('>', t.index('<svg')) + 1: t.rindex('</svg>')]
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0">{inner}</svg>')

CSS = BASE + '''
.win.col{flex-direction:column}
.mono,.term,.code{font-family:"Geist Mono",ui-monospace,monospace}
/* tabs row (terminal, editor, browser) */
.tabs{height:52px;flex-shrink:0;display:flex;align-items:center;gap:6px;padding:0 14px;border-bottom:1px solid rgba(255,255,255,.06)}
.tab{height:34px;display:flex;align-items:center;gap:9px;padding:0 12px;border-radius:10px;font-size:13px;font-weight:500;color:#a1a1aa;max-width:220px;white-space:nowrap}
.tab.on{background:rgba(255,255,255,.07);color:#f2f2f4}
.tab .x{color:#6e6e77;margin-left:4px;display:flex}
.tab.add{color:#8d8d96;padding:0 9px}
.ib{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#c9c9cf;flex-shrink:0}
.ib.dim{color:#5e5e66}
.tile{width:28px;height:28px;border-radius:9px;background:rgba(59,139,255,.16);color:#6aa8ff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
/* terminal */
.term{flex:1;padding:18px 22px;font-size:14px;line-height:1.62;color:#d6d6db;overflow:hidden;white-space:pre}
.p-user{color:#5fdc86}.p-dir{color:#6aa8ff}.p-arrow{color:#ffae5a}.p-git{color:#b48cff}.dimt{color:#6e6e77}.ok{color:#5fdc86}.wa{color:#ffae5a}.er{color:#ff7b7b}.cy{color:#5ad4ff}
.cur{display:inline-block;width:9px;height:19px;background:#f2f2f4;vertical-align:-4px;border-radius:2px}
.sbar{height:30px;flex-shrink:0;display:flex;align-items:center;gap:18px;padding:0 16px;border-top:1px solid rgba(255,255,255,.06);font-size:12px;color:#8d8d96}
.sbar b{font-weight:600;color:#c9c9cf}
/* editor */
.tree{width:232px;flex-shrink:0;background:rgba(255,255,255,.025);border-right:1px solid rgba(255,255,255,.06);padding:16px 10px;box-sizing:border-box;font-size:13px}
.tr{display:flex;align-items:center;gap:8px;height:30px;padding:0 8px;border-radius:8px;color:#c9c9cf}
.tr.on{background:rgba(59,139,255,.18);color:#fff}
.tr .chev{color:#6e6e77;display:flex}
.code{flex:1;display:flex;font-size:14px;line-height:1.7;padding-top:14px;overflow:hidden}
.ln{width:56px;text-align:right;padding-right:18px;color:#4e4e56;flex-shrink:0;white-space:pre}
.src{white-space:pre;color:#d6d6db;flex:1;position:relative}
.cl{background:rgba(255,255,255,.04);display:block;margin-left:-8px;padding-left:8px}
.k1{color:#b48cff}.k2{color:#6aa8ff}.k3{color:#5fdc86}.k4{color:#ffae5a}.k5{color:#8d8d96}.k6{color:#5ad4ff}
.find{position:absolute;right:18px;top:62px;height:40px;border-radius:12px;background:#1a1a1f;border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;gap:8px;padding:0 6px 0 12px;font-size:13px;z-index:2}
.find .fi{width:180px;color:#f2f2f4}
.mark{background:rgba(255,174,90,.28);border-radius:3px;outline:1px solid rgba(255,174,90,.6)}
/* browser */
.tool{height:56px;flex-shrink:0;display:flex;align-items:center;gap:6px;padding:0 12px;border-bottom:1px solid rgba(255,255,255,.06)}
.url{flex:1;height:38px;border-radius:12px;background:rgba(255,255,255,.06);display:flex;align-items:center;gap:10px;padding:0 6px 0 14px;font-size:14px;color:#c9c9cf;min-width:0}
.url b{color:#f2f2f4;font-weight:500}
.shieldbtn{height:30px;display:flex;align-items:center;gap:6px;padding:0 10px;border-radius:9px;background:rgba(52,199,89,.16);color:#5fdc86;font-size:12px;font-weight:600;margin-left:auto;flex-shrink:0}
.page{flex:1;position:relative;overflow:hidden}
.nt{display:flex;flex-direction:column;align-items:center;padding-top:70px}
.bigsearch{width:620px;height:56px;border-radius:28px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.09);display:flex;align-items:center;gap:14px;padding:0 22px;font-size:17px;color:#8d8d96;box-sizing:border-box;margin-top:28px}
.sc{display:grid;grid-template-columns:repeat(6,96px);gap:14px;margin-top:30px}
.sc div{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:12px;color:#c9c9cf}
.sc i{width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-style:normal;font-size:20px;font-weight:700}
.stats{display:flex;gap:14px;margin-top:34px}
.stat{width:196px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);padding:16px 18px;box-sizing:border-box}
.stat .n{font-size:30px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.stat .d{font-size:12px;color:#a1a1aa;margin-top:2px}
.site{position:absolute;inset:0;background:#f4f4f6;color:#16161a;font-family:Georgia,"Times New Roman",serif}
.pop{position:absolute;right:14px;top:62px;width:340px;border-radius:20px;background:rgba(18,18,22,.97);border:1px solid rgba(255,255,255,.1);padding:18px;box-sizing:border-box;z-index:3;color:#f2f2f4;font-family:"Geist",system-ui,sans-serif}
.prow{display:flex;align-items:center;gap:12px;min-height:46px;border-top:1px solid rgba(255,255,255,.06);font-size:14px;font-weight:500}
.prow:first-of-type{border-top:0}
.prow small{display:block;font-size:12px;color:#a1a1aa;font-weight:400;margin-top:1px}
.tog.s{width:40px;height:24px;border-radius:12px}.tog.s span{width:18px;height:18px;border-radius:9px}.tog.s.on span{left:19px}
'''

def bar():
    return ('<div class="bar"><div class="pill" style="width:165px"><span style="width:27px;height:22px;border-radius:7px;background:#c9c9cf;display:block"></span></div>'
            '<div class="pill">12:22</div><div style="display:flex;gap:10px"><div class="pill">'
            f'<img src="{A}nova-star.png" alt="" style="width:16px;height:16px;object-fit:contain"><img src="{A}shield.webp" alt="" style="width:16px;height:16px;object-fit:contain"></div><div class="pill">us</div></div></div>')

def page(title, win, cls='win col'):
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&amp;family=Geist+Mono:wght@400;500&amp;display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
<div class="frame" style="width:1440px;height:900px">
<img class="wall" src="{A}wallpaper.png" alt="">
{bar()}
<div class="{cls}">{win}</div>
</div></body></html>'''

def tab(icon, name, on=False, close=True):
    return f'<div class="tab{" on" if on else ""}">{ic(icon, 15)}{name}{"<span class=x>" + ic("x", 13) + "</span>" if close else ""}</div>'

P = lambda d, git='': (f'<span class="p-user">alex</span><span class="dimt">@</span><span class="p-user">nova</span> <span class="p-dir">{d}</span>'
                       + (f' <span class="p-git">{git}</span>' if git else '') + ' <span class="p-arrow">❯</span> ')
S = {}

# ---- Terminal ----
term = (f'<div class="tabs"><div class="tile">{ic("square-terminal", 16)}</div>' + tab('square-terminal', '~/nova', True) + tab('square-terminal', 'htop') + tab('square-terminal', 'ssh server')
        + f'<div class="tab add">{ic("plus", 16)}</div><div style="margin-left:auto;display:flex"><div class="ib">{ic("columns-2", 17)}</div><div class="ib">{ic("search", 17)}</div><div class="ib">{ic("ellipsis", 17)}</div></div></div>'
        '<div class="term">'
        + P('~/nova', 'main') + 'sudo pacman -Syu\n'
        '<span class="cy">::</span> Synchronizing package databases...\n'
        ' core          <span class="dimt">128.4 KiB</span>  <span class="ok">████████████████████</span> 100%\n'
        ' extra           <span class="dimt">8.2 MiB</span>  <span class="ok">████████████████████</span> 100%\n'
        '<span class="cy">::</span> Starting full system upgrade...\n'
        'Packages (3)  <b>hyprland-0.52.1-1</b>  <b>linux-6.18.4-1</b>  <b>mesa-26.0.2-1</b>\n'
        '<span class="ok">✓</span> Signatures verified · <span class="ok">✓</span> 3 packages upgraded in 14s\n\n'
        + P('~/nova', 'main') + 'ls\n'
        '<span class="p-dir">assets</span>  <span class="p-dir">shell</span>  <span class="p-dir">apps</span>  build.sh  <span class="wa">README.md</span>  nova.conf\n\n'
        + P('~/nova', 'main') + 'git status --short\n'
        ' <span class="wa">M</span> shell/control.qml\n <span class="ok">A</span> shell/launcher.qml\n <span class="er">D</span> old/panel.qml\n\n'
        + P('~/nova', 'main') + '<span class="cur"></span>'
        '</div>'
        '<div class="sbar"><span><b>zsh</b></span><span>~/nova</span><span style="margin-left:auto">120×32</span><span>UTF-8</span></div>')
S['terminal'] = ('Terminal', term)

# ---- Text Editor ----
tree = ''.join(f'<div class="tr{" on" if on else ""}" style="padding-left:{8 + 16 * lvl}px"><span class="chev">{ic(ch, 14) if ch else ""}</span>{ic(i, 15)}{n}</div>'
               for lvl, ch, i, n, on in [(0, 'chevron-down', 'folder-open', 'nova', 0), (1, 'chevron-right', 'folder', 'assets', 0), (1, 'chevron-down', 'folder-open', 'shell', 0),
                                          (2, '', 'file-code', 'control.qml', 0), (2, '', 'file-code', 'launcher.qml', 0), (1, '', 'file-text', 'README.md', 1), (1, '', 'file-cog', 'nova.conf', 0), (1, '', 'file-terminal', 'build.sh', 0)])
code_lines = [
 '<span class="k1"># NOVA OS</span>',
 '',
 'A private, fast desktop built on <span class="k2">**Arch Linux**</span> and <span class="k2">**Hyprland**</span>.',
 '',
 '<span class="k1">## Build</span>',
 '',
 '<span class="k5">```sh</span>',
 '<span class="k6">./build.sh</span> --edition <span class="k4">pro</span> --wallpaper <span class="k4">aurora</span>',
 '<span class="k5">```</span>',
 '',
 '<span class="k1">## Privacy</span>',
 '',
 '<span class="k3">-</span> No account, no tracking: nothing <span class="mark">phones</span> home.',
 '<span class="k3">-</span> Shield: 14 protections, one tap each.',
 '<span class="k3">-</span> ACE runs on this device <span class="k5">(Pro)</span>.',
 '',
 '<span class="k5">&lt;!-- TODO: screenshots --&gt;</span>',
]
src = ''.join((f'<span class="cl">{l or " "}</span>' if i == 12 else (l or ' ') + '\n') for i, l in enumerate(code_lines))
editor_main = (f'<div class="tabs">' + tab('file-text', 'README.md', True) + tab('file-code', 'launcher.qml') + tab('file-cog', 'nova.conf')
               + f'<div style="margin-left:auto;display:flex"><div class="ib">{ic("search", 17)}</div><div class="ib">{ic("columns-2", 17)}</div><div class="ib">{ic("ellipsis", 17)}</div></div></div>'
               f'<div class="find">{ic("search", 15)}<span class="fi">phones</span><span style="color:#8d8d96;font-size:12px">1 of 1</span><div class="ib" style="width:28px;height:28px">{ic("chevron-up", 15)}</div><div class="ib" style="width:28px;height:28px">{ic("chevron-down", 15)}</div><div class="ib" style="width:28px;height:28px">{ic("x", 15)}</div></div>'
               f'<div class="code"><div class="ln">{chr(10).join(str(i + 1) for i in range(len(code_lines)))}</div><div class="src">{src}</div></div>'
               '<div class="sbar"><span><b>Markdown</b></span><span>Ln 13, Col 41</span><span style="margin-left:auto">Spaces: 2</span><span>UTF-8</span><span style="color:#5fdc86">Saved</span></div>')
editor = (f'<aside class="tree"><div style="display:flex;align-items:center;gap:10px;padding:2px 6px 14px"><div class="tile">{ic("file-pen", 16)}</div><b style="font-size:16px;font-weight:700">Text Editor</b></div>'
          f'<div class="sec" style="padding:4px 8px 6px">Project</div>{tree}</aside><div class="main" style="position:relative">{editor_main}</div>')
S['editor'] = ('Text Editor', editor, 'win')

# ---- NOVA Browser ----
def btabs(active):
    tabs = [('nova-star', 'New Tab'), ('globe', 'Northwind News'), ('globe', 'Arch Wiki')]
    return (f'<div class="tabs" style="height:46px;border-bottom:0;padding-top:6px">'
            + ''.join(tab(i, n, k == active) for k, (i, n) in enumerate(tabs))
            + f'<div class="tab add">{ic("plus", 16)}</div></div>')
def tool(url_html, shield):
    return (f'<div class="tool"><div class="ib">{ic("arrow-left", 18)}</div><div class="ib dim">{ic("arrow-right", 18)}</div><div class="ib">{ic("rotate-cw", 17)}</div>'
            f'<div class="url">{url_html}{shield}</div>'
            f'<div class="ib">{ic("download", 17)}</div><div class="ib">{ic("menu", 18)}</div></div>')
shield_chip = lambda n, on=False: f'<span class="shieldbtn"{" style=" + chr(34) + "outline:2px solid rgba(95,220,134,.6)" + chr(34) if on else ""}>{ic("nova-shield", 14)}{n} blocked</span>'

sc = ''.join(f'<div><i style="color:{c}">{l}</i>{n}</div>' for l, n, c in [('W', 'Wikipedia', '#f2f2f4'), ('G', 'GitHub', '#f2f2f4'), ('A', 'Arch Wiki', '#6aa8ff'), ('Y', 'YouTube', '#ff7b7b'), ('R', 'Reddit', '#ffae5a'), ('+', 'Add', '#8d8d96')])
stats = ''.join(f'<div class="stat"><div class="n" style="color:{c}">{n}</div><div class="d">{d}</div></div>' for n, d, c in
                [('1,284', 'Trackers blocked this week', '#5fdc86'), ('312', 'Ads blocked', '#f2f2f4'), ('0', 'Fingerprints taken', '#6aa8ff')])
newtab = (btabs(0) + tool(f'{ic("search", 16)}<span style="color:#8d8d96">Search privately or enter address</span>', '')
          + '<div class="page"><div class="nt">'
          f'<img src="{A}nova-star.png" alt="" style="width:64px;height:64px;object-fit:contain">'
          '<div style="font-size:30px;font-weight:700;letter-spacing:-.02em;margin-top:14px">NOVA Browser</div>'
          '<div style="font-size:14px;color:#a1a1aa;margin-top:6px">Private by default. Nothing you do here leaves this device.</div>'
          f'<div class="bigsearch">{ic("search", 20)}Search privately</div>'
          f'<div class="sc">{sc}</div><div class="stats">{stats}</div>'
          '</div></div>')
S['browser-newtab'] = ('NOVA Browser: new tab', newtab)

article = ('<div class="site"><div style="height:58px;border-bottom:1px solid #e2e2e6;display:flex;align-items:center;padding:0 60px;font-family:Geist,sans-serif;font-weight:800;font-size:22px;letter-spacing:-.03em">Northwind News'
           '<span style="margin-left:auto;font-size:13px;font-weight:500;color:#6b6b73;letter-spacing:0">Tech · Science · Entertainment</span></div>'
           '<div style="padding:44px 60px;max-width:760px"><div style="font-family:Geist,sans-serif;font-size:13px;font-weight:600;color:#e2104f;letter-spacing:.06em">LINUX</div>'
           '<div style="font-size:44px;line-height:1.1;font-weight:700;margin-top:12px">A new Arch-based desktop wants your computer to stop watching you</div>'
           '<div style="font-family:Geist,sans-serif;font-size:14px;color:#6b6b73;margin-top:16px">By Sam Okafor · 6 min read</div>'
           '<div style="height:210px;border-radius:14px;margin-top:24px;background:linear-gradient(120deg,#0b1f6e,#1e8fd6 45%,#e9d8b4 70%,#e0872f)"></div></div></div>')
popup = (f'<div class="pop"><div style="display:flex;align-items:center;gap:12px;margin-bottom:6px"><div class="tile" style="width:36px;height:36px;border-radius:11px;background:rgba(52,199,89,.16);color:#5fdc86">{ic("nova-shield", 19)}</div>'
         '<div><div style="font-size:15px;font-weight:600">You\'re protected on northwind.news</div><div style="font-size:12px;color:#a1a1aa;margin-top:2px">23 trackers and 6 ads blocked on this page</div></div></div>'
         + ''.join(f'<div class="prow">{ic(i, 17)}<div style="flex:1">{t}<small>{d}</small></div><span class="tog s{" on" if on else ""}"><span></span></span></div>' for i, t, d, on in [
             ('eye-off', 'Block trackers', '23 blocked', True), ('cookie', 'Block third-party cookies', '9 blocked', True),
             ('fingerprint', 'Fingerprint protection', 'Your browser looks like everyone else\'s', True), ('lock', 'HTTPS only', 'Secure connection', True),
             ('nova-tor-per-app', 'Open through Tor', 'Slower, hides your IP from this site', False)])
         + '<div style="display:flex;gap:10px;margin-top:14px"><span class="btn" style="flex:1;justify-content:center">Site settings</span><span class="btn" style="flex:1;justify-content:center">Clear site data</span></div></div>')
site = (btabs(1) + tool(f'{ic("lock", 15)}<span><b>northwind.news</b>/2026/10/1/nova-os-linux-privacy</span>', shield_chip(29, True)) + f'<div class="page">{article}{popup}</div>')
S['browser-shield'] = ('NOVA Browser: privacy panel', site)
site2 = (btabs(1) + tool(f'{ic("lock", 15)}<span><b>northwind.news</b>/2026/10/1/nova-os-linux-privacy</span>', shield_chip(29)) + f'<div class="page">{article}</div>')
S['browser-site'] = ('NOVA Browser', site2)

for name, v in S.items():
    title, win = v[0], v[1]; cls = v[2] if len(v) > 2 else 'win col'
    open(os.path.join(KIT, 'screens', name + '.html'), 'w').write(page(title, win, cls))
print(len(S), 'screens')
