"""byeno.org as a tiny NOVA OS in the browser. One index.html (inline CSS + JS): boot splash → desktop (top bar, dock,
glass windows that grow out of the dock), apps = sections, a working Terminal, and a Shield window that measures this page
live (connections, cookies, storage, trackers). Phones get a NOVA home screen with full-screen apps.
No trackers, no cookies, no third-party anything. Run: python3 build.py"""
import os, json
HERE = os.path.dirname(os.path.abspath(__file__))
ICONS = os.path.join(HERE, '..', 'nova-icons', 'svg')
CONFIG = {'tiktok': 'https://www.tiktok.com/@novaos.star', 'x': 'https://x.com/Novaos_star', 'youtube': 'https://www.youtube.com/@NovaOS-star', 'email': 'novaos.star@gmail.com'}

def ic(name, size=18, sw=2):
    s = open(os.path.join(ICONS, name + '.svg')).read()
    inner = s[s.index('>', s.index('<svg')) + 1: s.rindex('</svg>')]
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{inner}</svg>'

def shot(n, alt, eager=False):
    return f'<img src="img/shots/{n}-1200.webp" srcset="img/shots/{n}-640.webp 640w, img/shots/{n}-1200.webp 1200w" sizes="(max-width: 820px) 100vw, 640px" width="1200" height="750" alt="{alt}" loading="{"eager" if eager else "lazy"}" decoding="async">'

STAR = '<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="sg" x1="8" y1="2" x2="40" y2="46" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f4f4f4"/><stop offset=".38" stop-color="#bdbdbd"/><stop offset=".5" stop-color="#5a5a5a"/><stop offset=".62" stop-color="#9a9a9a"/><stop offset="1" stop-color="#e8e8e8"/></linearGradient></defs><path d="M24 0C25.2 14.5 29.5 22.6 48 24 29.5 25.4 25.2 33.5 24 48 22.8 33.5 18.5 25.4 0 24 18.5 22.6 22.8 14.5 24 0Z" fill="url(#sg)"/></svg>'

WALLS = [('original', 'NOVA', '#3B8BFF', '#6AA8FF'), ('aurora', 'Aurora', '#19C995', '#4FE3B5'), ('ember', 'Ember', '#FF4F8B', '#FF7FAA'),
         ('lilac', 'Lilac', '#A26BFF', '#C4A0FF'), ('ocean', 'Ocean', '#12B8F0', '#5AD4FF'), ('citrus', 'Citrus', '#A8E632', '#C6F56B')]

# ---------------- apps ----------------
# id, dock label, icon (img name or ('svg', lucide, tint)), window size (w, h), default position (x%, y%)
APPS = [
    ('welcome', 'Welcome', ('star',), (620, 470), (.05, .12)),
    ('files', 'About', ('img', 'files'), (860, 560), (.30, .14)),
    ('settings', 'Features', ('img', 'settings'), (980, 620), (.18, .10)),
    ('shield', 'Privacy', ('img', 'shield'), (820, 600), (.35, .12)),
    ('images', 'Gallery', ('img', 'images'), (980, 640), (.14, .09)),
    ('terminal', 'Terminal', ('svg', 'terminal', '#f2f2f4'), (760, 470), (.40, .22)),
    ('follow', 'Follow', ('svg', 'bell', '#ffae5a'), (560, 440), (.55, .20)),
]
TITLES = {'welcome': 'Welcome', 'files': 'Files: About NOVA', 'settings': 'Settings: Features', 'shield': 'Shield: Privacy X-ray', 'images': 'Images: Gallery', 'terminal': 'Terminal', 'follow': 'Follow NOVA'}

def app_icon(a, size):
    kind = a[2]
    if kind[0] == 'star': return f'<span class="ai ai-star" style="width:{size}px;height:{size}px">{STAR}</span>'
    if kind[0] == 'img': return f'<img class="ai" src="img/app/{kind[1]}.webp" width="{size}" height="{size}" alt="">'
    return f'<span class="ai ai-tile" style="width:{size}px;height:{size}px;color:{kind[2]}">{ic(kind[1], int(size * .5))}</span>'

FEATURES = [
    ('gaming', 'gamepad-2', 'Gaming mode', 'gaming-on', 'Press Super + G. Background apps freeze, notifications wait, focus locks to your game, and nothing goes to sleep. Shield stays on. Always.'),
    ('control', 'sliders-horizontal', 'Control', 'shell-control', 'Sound, Wi-Fi, Bluetooth, Night Mode and drives, one click from the top bar.'),
    ('launcher', 'search', 'Launcher', 'launcher-search', 'Super + Space. Apps, files, settings and quick answers as you type. Nothing you type ever leaves your PC.'),
    ('shield', 'shield-check', 'Shield', 'shield', 'Firewall, encrypted DNS, private Wi-Fi addresses, camera and mic kill switches. Fourteen protections, one tap each.'),
    ('browser', 'globe', 'NOVA Browser', 'browser-newtab', 'Trackers blocked by default. Counted on your device, sent nowhere.'),
    ('installer', 'monitor', 'Installer', 'install-disk', 'Next to Windows or on its own. Encrypted by default. Nothing changes until you press Install.'),
    ('walls', 'image', 'Wallpapers', None, 'Six wallpapers, and your accent colour follows the one you pick. Try it: this changes the desktop behind this window.'),
]
FAQ = [
    ('Is NOVA real?', "Yes. It's in active development by one developer. The pictures and videos so far show the designs, and real footage is coming as soon as the desktop is ready."),
    ('Is it made with AI?', "AI is one of the tools, like a code editor or a terminal. I design, test and decide everything myself."),
    ('Will it make my old PC faster?', "It can feel a lot faster: no background junk, no trackers, no ads, almost nothing running at start, and compressed memory (zram). It can't make old hardware new, but it stops wasting what you have."),
    ('Is it a hacking distro like Kali?', "No, it's an everyday OS for people who care about privacy, with security built in to protect you. It's Arch-based, so nmap, Wireshark or Metasploit are a download away, or add BlackArch."),
    ("Isn't it just Hyprland dotfiles?", "Arch and Hyprland are underneath, on purpose. On top: its own apps (Shield, Guard, Files, Fix…), its own installer and first-boot setup, gaming mode and privacy defaults."),
    ('Does NOVA collect my data?', "No. No account, no telemetry, no analytics, no ads. This website doesn't either: open Shield and see for yourself."),
    ('When can I try it?', "No date yet. Building an OS alone takes time. Follow along on YouTube, TikTok or X to know first."),
]
SHOTS = [('shell-lock', 'Lock screen'), ('launcher-search', 'Launcher'), ('shell-control', 'Control panel'), ('shell-notifications', 'Notifications'),
         ('shield', 'Shield'), ('files', 'Files'), ('settings', 'Settings'), ('terminal', 'Terminal'), ('editor', 'Text Editor'),
         ('browser-newtab', 'NOVA Browser'), ('gaming-on', 'Gaming mode'), ('setup-welcome', 'First-boot setup'), ('setup-look', 'Pick a wallpaper'), ('install-disk', 'Installer')]

def tpl_welcome():
    return f'''<div class="welcome">
 <span class="kicker"><i></i>In development · Coming soon</span>
 <h1>Your computer.<br><span class="acc">Finally yours.</span></h1>
 <p class="lead">NOVA OS is a privacy-first Linux desktop. Beautiful by default, light on old PCs, and it never watches you.</p>
 <div class="row"><button class="pill" data-open="follow">Get notified</button><a class="ghost" href="{CONFIG['youtube']}" rel="noopener">Watch the videos {ic('arrow-right', 16)}</a></div>
 <p class="tip">{ic('info', 15)} This is a tiny NOVA desktop. Open the apps in the dock below.</p>
</div>'''

def tpl_files():
    built = ''.join(f'<div class="li"><span class="tile">{ic(i, 18)}</span><div><b>{n}</b><small>{d}</small></div></div>' for i, n, d in [
        ('layers', 'Arch Linux', 'The base. Fast, light, and yours.'), ('app-window', 'Hyprland', 'Windows, glass and animations.'),
        ('panels-top-left', 'Quickshell', 'Draws the whole desktop.'), ('monitor', 'Wayland', 'Modern, secure display.')])
    status = ''.join(f'<div class="li"><span class="dot" style="background:{c}"></span><div><b>{n}</b><small>{d}</small></div>{bar}</div>' for n, d, c, bar in [
        ('Design', 'Done · 100+ screens', 'var(--green)', ''), ('Desktop', 'Being built now', 'var(--acc)', '<span class="busy"><i></i></span>'),
        ('Installer', 'Next', '#55555e', ''), ('Beta', 'After that', '#55555e', '')])
    return f'''<div class="split">
 <nav class="side" data-tabs>
  <button class="on" data-tab="readme">{ic('info', 16)}About NOVA</button><button data-tab="built">{ic('layers', 16)}Built on</button><button data-tab="status">{ic('check', 16)}Status</button>
 </nav>
 <div class="pane">
  <section data-panel="readme" class="on"><p class="eyebrow">readme.txt</p><h2>An OS that works for you.</h2>
   <p>No account. No ads. No tracking. Nothing watching.</p>
   <p>NOVA OS is built by one developer, for myself first, and shared with everyone who loves privacy. Arch Linux underneath, a fast glass desktop on top, and its own apps for everything you need.</p>
   <p class="muted">Building an OS alone isn't fast. But I'm doing it properly.</p></section>
  <section data-panel="built"><p class="eyebrow">built-on/</p><h2>The stack.</h2><div class="list">{built}</div></section>
  <section data-panel="status"><p class="eyebrow">status.log</p><h2>Honest status.</h2><div class="list">{status}</div><p class="muted">The pictures and videos so far show the designs. Real footage is coming.</p></section>
 </div>
</div>'''

def tpl_settings():
    nav = ''.join(f'<button{" class=on" if i == 0 else ""} data-tab="{k}">{ic(icn, 16)}{t}</button>' for i, (k, icn, t, _, _) in enumerate(FEATURES))
    def panel(i, k, icn, t, s, d):
        media = f'<div class="shot">{shot(s, t)}</div>' if s else '<div class="wallgrid">' + ''.join(
            f'<button class="wall" data-wall="{w}" data-acc="{a2}" aria-label="{n} wallpaper"><img src="img/hero/{w}-1280.webp" alt="" loading="lazy" width="1280" height="720"><span><i style="background:{c}"></i>{n}</span></button>' for w, n, c, a2 in WALLS) + '</div>'
        return f'<section data-panel="{k}"{" class=on" if i == 0 else ""}><h2>{t}</h2><p>{d}</p>{media}</section>'
    panels = ''.join(panel(i, *f) for i, f in enumerate(FEATURES))
    return f'<div class="split"><nav class="side" data-tabs>{nav}</nav><div class="pane">{panels}</div></div>'

def tpl_shield():
    return f'''<div class="xray">
 <div class="hero-card"><span class="tile g">{ic('shield-check', 22)}</span><div><b>You're protected. Here's proof.</b><small>Measured right now, in your browser, on this page.</small></div><button class="btn sm" data-remeasure>{ic('refresh-cw', 14)}Measure again</button></div>
 <div class="stats">
  <div class="stat"><small>Trackers</small><b data-x="trackers">0</b></div>
  <div class="stat"><small>Cookies</small><b data-x="cookies">0</b></div>
  <div class="stat"><small>Stored data</small><b data-x="storage">0</b></div>
  <div class="stat"><small>Connections</small><b data-x="requests">0</b></div>
 </div>
 <p class="eyebrow">Sites this page talked to</p>
 <div class="hosts" data-x="hosts"></div>
 <p class="eyebrow">For comparison</p>
 <div class="cmp"><div><span>byeno.org</span><i class="b ok" data-x="bar"></i><em data-x="barlabel">0 trackers</em></div><div><span>A typical news site</span><i class="b bad"></i><em>dozens of trackers</em></div></div>
 <p class="muted">Don't trust us: open your browser's developer tools (Network tab) and check. Privacy browsers like Brave also show 0 blocked here.</p>
</div>'''

def tpl_images():
    grid = ''.join(f'<button class="g" data-full="img/shots/{n}-1200.webp" data-cap="{c}"><img src="img/shots/{n}-640.webp" alt="{c}" loading="lazy" width="640" height="400"><span>{c}</span></button>' for n, c in SHOTS)
    return f'<div class="gallery">{grid}</div><div class="lightbox" hidden><img alt=""><p></p><button class="btn sm" data-closebox>{ic("x", 14)}Close</button></div><p class="muted pad">Designs shown. NOVA is still being built.</p>'

def tpl_terminal():
    return '<div class="term" data-term><div class="out" aria-live="polite"></div><label class="prompt"><span>you@nova</span>:<b>~</b>$ <input aria-label="Terminal command" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send"></label></div>'

def tpl_follow():
    return f'''<div class="follow"><span class="ai ai-star big">{STAR}</span><h2>Be there on day one.</h2>
 <p>Follow along while I build it. You'll know the moment NOVA is ready.</p>
 <div class="row c"><a class="pill" href="{CONFIG['youtube']}" rel="noopener">YouTube</a><a class="btn" href="{CONFIG['tiktok']}" rel="noopener">TikTok</a><a class="btn" href="{CONFIG['x']}" rel="noopener">X</a></div>
 <p class="muted">Questions? <!--email_off--><a href="mailto:{CONFIG['email']}">{CONFIG['email']}</a><!--/email_off--></p></div>'''

TPL = {'welcome': tpl_welcome(), 'files': tpl_files(), 'settings': tpl_settings(), 'shield': tpl_shield(), 'images': tpl_images(), 'terminal': tpl_terminal(), 'follow': tpl_follow()}

CSS = r'''
@font-face{font-family:Geist;src:url(fonts/Geist-Variable.woff2) format("woff2");font-weight:100 900;font-display:swap}
@font-face{font-family:GeistMono;src:url(fonts/GeistMono-Regular.woff2) format("woff2");font-display:swap}
:root{--acc:#3B8BFF;--acc-t:#6AA8FF;--green:#5fdc86;--text:#f2f2f4;--t2:#a1a1aa;--t3:#8d8d96;--glass:rgba(14,14,18,.86);--line:rgba(255,255,255,.09);--ease:cubic-bezier(.45,0,.15,1)}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:#050507;color:var(--text);font:400 15px/1.55 Geist,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden}
button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
a{color:inherit}
img{display:block;max-width:100%;height:auto}
:focus-visible{outline:2px solid var(--acc-t);outline-offset:2px;border-radius:8px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}

/* boot */
#boot{position:fixed;inset:0;z-index:3000;background:#000;display:grid;place-items:center;transition:opacity .5s var(--ease)}
#boot .s{width:84px;height:84px;animation:breathe 1.6s var(--ease) infinite}
#boot .bar{position:absolute;left:50%;top:calc(50% + 78px);width:150px;height:3px;margin-left:-75px;border-radius:2px;background:rgba(255,255,255,.12);overflow:hidden}
#boot .bar i{display:block;height:100%;width:0;background:#f2f2f4;border-radius:2px;animation:load .9s var(--ease) forwards}
@keyframes load{to{width:100%}}@keyframes breathe{50%{opacity:.7;transform:scale(.96)}}
#boot.gone{opacity:0;pointer-events:none}

/* desktop */
.desk{position:fixed;inset:0;overflow:hidden}
.wall-bg{position:absolute;inset:0}
.wall-bg img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .9s var(--ease)}
.night{position:absolute;inset:0;background:rgba(255,140,40,.16);mix-blend-mode:multiply;opacity:0;transition:opacity .6s var(--ease);pointer-events:none;z-index:2000}
body.is-night .night{opacity:1}
.bar{position:absolute;left:0;right:0;top:9px;height:36px;display:flex;justify-content:space-between;padding:0 15px;z-index:1000}
.pillb{height:36px;border-radius:12px;background:#101013;border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:12px;padding:0 14px;font-size:13px;font-weight:600;color:#e4e4e7}
.ws{width:8px;height:8px;border-radius:4px;background:rgba(255,255,255,.28)}.ws.on{width:22px;background:#f2f2f4}
.right{display:flex;gap:10px}
.ctl[aria-expanded=true]{background:#1b1b1f}
.dock{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);height:68px;border-radius:18px;background:rgba(16,16,19,.88);border:1px solid rgba(255,255,255,.07);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);display:flex;align-items:center;gap:14px;padding:0 12px;z-index:1000}
.dock button{position:relative;width:48px;height:48px;display:grid;place-items:center;transition:transform .3s var(--ease)}
.dock button:hover{transform:translateY(-4px) scale(1.08)}
.dock button .lbl{position:absolute;bottom:62px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:12px;font-weight:600;padding:4px 10px;border-radius:8px;background:#101013;border:1px solid var(--line);opacity:0;pointer-events:none;transition:opacity .2s}
.dock button:hover .lbl,.dock button:focus-visible .lbl{opacity:1}
.dock button.run::after{content:"";position:absolute;bottom:-7px;left:50%;width:5px;height:5px;margin-left:-2.5px;border-radius:3px;background:var(--acc)}
.dock .sep{width:1px;height:34px;background:rgba(255,255,255,.08)}
.ai{width:44px;height:44px;object-fit:contain}
.ai-star{display:grid;place-items:center}.ai-star svg{width:72%;height:72%}
.ai-tile{display:grid;place-items:center;border-radius:12px;background:linear-gradient(#2a2a30,#17171b);border:1px solid rgba(255,255,255,.1)}

/* windows */
.win{position:absolute;display:flex;flex-direction:column;border-radius:22px;background:var(--glass);border:1px solid var(--line);backdrop-filter:blur(30px) saturate(1.2);-webkit-backdrop-filter:blur(30px) saturate(1.2);overflow:hidden;z-index:20;transform-origin:0 0}
.win.anim{transition:transform .5s var(--ease),opacity .4s var(--ease)}
.tb{height:46px;flex:0 0 46px;display:flex;align-items:center;gap:10px;padding:0 10px 0 14px;border-bottom:1px solid rgba(255,255,255,.06);cursor:grab;user-select:none;touch-action:none}
.tb .ai{width:22px;height:22px}.tb .ai-tile{border-radius:7px}
.tb b{font-size:13px;font-weight:600;color:#d4d4d8}
.tb .x{margin-left:auto;width:28px;height:28px;border-radius:14px;display:grid;place-items:center;color:var(--t2)}
.tb .x:hover{background:rgba(255,255,255,.08);color:#fff}
.body{flex:1;overflow:auto;min-height:0}
.split{display:flex;height:100%}
.side{width:200px;flex:0 0 200px;padding:14px 10px;background:rgba(255,255,255,.025);border-right:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;gap:2px}
.side button{display:flex;align-items:center;gap:10px;height:38px;padding:0 12px;border-radius:10px;font-size:14px;font-weight:500;color:#d4d4d8;text-align:left}
.side button:hover{background:rgba(255,255,255,.05)}
.side button.on{background:color-mix(in srgb,var(--acc) 20%,transparent);color:#fff}.side button.on svg{color:var(--acc-t)}
.pane{flex:1;overflow:auto;padding:26px 30px}
.pane section{display:none}.pane section.on{display:block;animation:fadein .4s var(--ease)}
@keyframes fadein{from{opacity:0;transform:translateY(6px)}}
h1,h2{margin:0;letter-spacing:-.035em;font-weight:800}
h2{font-size:30px;line-height:1.05}
.pane p{color:var(--t2);font-size:15.5px;max-width:560px}
.eyebrow{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--t3);margin:0 0 8px}
.muted{color:var(--t3)!important;font-size:13.5px!important}
.pad{padding:0 22px 18px}
.shot{margin-top:18px;border-radius:14px;overflow:hidden;border:1px solid var(--line);background:#0b0b0e}
.list{margin-top:16px;display:grid;gap:8px;max-width:560px}
.li{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)}
.li b{display:block;font-size:15px}.li small{color:var(--t2);font-size:13px}
.tile{width:36px;height:36px;flex:0 0 36px;border-radius:11px;display:grid;place-items:center;background:color-mix(in srgb,var(--acc) 16%,transparent);color:var(--acc-t)}
.tile.g{background:rgba(52,199,89,.15);color:var(--green)}
.dot{width:10px;height:10px;border-radius:5px;flex:0 0 10px}
.busy{margin-left:auto;width:120px;height:6px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden}
.busy i{display:block;width:40%;height:100%;background:linear-gradient(90deg,transparent,var(--acc-t),transparent);animation:slide 1.6s linear infinite}
@keyframes slide{from{transform:translateX(-100%)}to{transform:translateX(260%)}}
.pill{display:inline-flex;align-items:center;justify-content:center;height:44px;padding:0 22px;border-radius:22px;background:#f2f2f4;color:#0b0b0e;font-weight:600;font-size:15px;text-decoration:none}
.btn{display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 16px;border-radius:12px;background:rgba(255,255,255,.07);border:1px solid var(--line);font-weight:600;font-size:14px;text-decoration:none}
.btn.sm{height:32px;padding:0 12px;font-size:13px;border-radius:10px}
.ghost{display:inline-flex;align-items:center;gap:6px;font-weight:600;text-decoration:none}
.row{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:24px}.row.c{justify-content:center;gap:10px}

/* welcome */
.welcome{padding:34px 36px}
.kicker{display:inline-flex;align-items:center;gap:8px;height:28px;padding:0 12px;border-radius:14px;background:rgba(255,255,255,.06);font-size:12.5px;color:var(--t2)}
.kicker i{width:7px;height:7px;border-radius:4px;background:#ffae5a}
.welcome h1{font-size:54px;line-height:.98;margin-top:18px}
.acc{color:var(--acc-t);transition:color .9s var(--ease)}
.lead{color:var(--t2);font-size:17px;margin:16px 0 0;max-width:470px}
.tip{display:flex;align-items:center;gap:8px;margin:26px 0 0;font-size:13px;color:var(--t3)}

/* wallpapers */
.wallgrid{margin-top:18px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:620px}
.wall{position:relative;border-radius:12px;overflow:hidden;outline:2px solid transparent;outline-offset:3px;transition:outline-color .3s}
.wall img{aspect-ratio:16/9;object-fit:cover;width:100%}
.wall span{position:absolute;left:8px;bottom:6px;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;text-shadow:0 1px 6px #000}
.wall span i{width:9px;height:9px;border-radius:5px}
.wall[aria-pressed=true]{outline-color:#fff}

/* x-ray */
.xray{padding:22px 26px}
.hero-card{display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:16px;background:rgba(52,199,89,.09);border:1px solid rgba(52,199,89,.22)}
.hero-card b{display:block;font-size:17px}.hero-card small{color:var(--t2)}
.hero-card .btn{margin-left:auto}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0 20px}
.stat{padding:14px 16px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)}
.stat small{display:block;color:var(--t3);font-size:12px;font-weight:600;letter-spacing:.04em}
.stat b{display:block;font-size:34px;font-weight:800;letter-spacing:-.03em;margin-top:2px}
.stat:nth-child(-n+3) b{color:var(--green)}
.hosts{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px}
.hosts span{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:15px;background:rgba(52,199,89,.12);color:var(--green);font:500 13px GeistMono,monospace}
.cmp{display:grid;gap:10px;margin-bottom:14px}
.cmp div{display:grid;grid-template-columns:150px 1fr auto;align-items:center;gap:12px;font-size:13.5px}
.cmp .b{height:12px;border-radius:6px}
.cmp .ok{background:var(--green);width:2%;transition:width .8s var(--ease)}
.cmp .bad{background:linear-gradient(90deg,#ff5c5c,#ff9b5c);width:100%}
.cmp em{font-style:normal;color:var(--t2);font-size:13px}

/* gallery */
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;padding:18px 22px}
.g{text-align:left}.g img{border-radius:12px;border:1px solid var(--line);aspect-ratio:16/10;object-fit:cover;width:100%}
.g span{display:block;margin-top:6px;font-size:13px;color:var(--t2)}
.lightbox{position:absolute;inset:46px 0 0;background:rgba(8,8,10,.96);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:18px;z-index:2}
.lightbox[hidden]{display:none}
.lightbox img{max-height:80%;border-radius:12px;border:1px solid var(--line)}
.lightbox p{margin:0;color:var(--t2)}

/* terminal */
.term{height:100%;display:flex;flex-direction:column;background:rgba(6,6,8,.65);font:13.5px/1.55 GeistMono,ui-monospace,monospace;padding:14px 16px;cursor:text}
.out{flex:1;overflow:auto;white-space:pre-wrap;word-break:break-word}
.out .c{color:var(--acc-t)}.out .g{color:var(--green)}.out .d{color:var(--t3)}.out .w{color:#ffae5a}
.prompt{display:flex;align-items:center;gap:0;color:var(--green)}
.prompt b{color:var(--acc-t);font-weight:400}
.prompt input{flex:1;min-width:0;margin-left:8px;background:none;border:0;outline:0;color:var(--text);font:inherit;caret-color:var(--acc-t)}

/* follow */
.follow{padding:34px 30px;text-align:center}
.follow .big{width:64px;height:64px;margin:0 auto 18px}
.follow h2{font-size:34px}.follow p{color:var(--t2)}

/* control panel */
.cp{position:absolute;right:15px;top:55px;width:340px;padding:16px;border-radius:18px;background:linear-gradient(#131317,#09090d);border:1px solid rgba(255,255,255,.07);opacity:0;transform:translateY(-8px) scale(.98);transform-origin:top right;pointer-events:none;z-index:1001;transition:opacity .3s var(--ease),transform .3s var(--ease)}
.cp.on{opacity:1;transform:none;pointer-events:auto}
.cp .lbl2{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#b0b0b5;margin:4px 0 10px}
.sw{display:flex;gap:10px;margin-bottom:16px}
.sw button{width:30px;height:30px;border-radius:15px;background:var(--c);outline:2px solid transparent;outline-offset:3px}
.sw button[aria-pressed=true]{outline-color:#fff}
.cprow{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid rgba(255,255,255,.06)}
.cprow b{font-size:14px;font-weight:600}.cprow small{display:block;color:#8c8c92;font-size:12px}
.tog{margin-left:auto;width:46px;height:26px;border-radius:13px;background:#353538;position:relative;flex:0 0 46px;transition:background .3s}
.tog::after{content:"";position:absolute;left:2px;top:2px;width:22px;height:22px;border-radius:11px;background:#f2f2f4;transition:left .3s var(--ease)}
.tog[aria-pressed=true]{background:#ff9f0a}.tog[aria-pressed=true]::after{left:22px}
.cplinks{display:flex;gap:14px;flex-wrap:wrap;padding-top:12px;border-top:1px solid rgba(255,255,255,.06);font-size:13px;color:var(--t2)}
.cplinks a{text-decoration:none}.cplinks a:hover{color:#fff}

/* ---------- phones: NOVA home screen, apps open full screen ---------- */
.home{display:none}
.tb .x .xl{display:none}
@media (max-width:820px),(max-aspect-ratio:11/10){
 html,body{overflow:hidden}
 .bar .left,.bar .mid,.right .tray,.dock .lbl{display:none}
 .bar{top:calc(8px + env(safe-area-inset-top))}
 .bar .right{margin-left:auto}
 .home{display:flex;flex-direction:column;position:absolute;inset:0;padding:calc(64px + env(safe-area-inset-top)) 22px calc(100px + env(safe-area-inset-bottom));z-index:10;overflow:auto}
 .home .hl{font-size:40px;line-height:.98;letter-spacing:-.04em;font-weight:800;margin:6px 0 0;text-shadow:0 2px 24px rgba(0,0,0,.45)}
 .home .hl .acc{filter:drop-shadow(0 2px 14px rgba(0,0,0,.55))}
 .home .sub{color:#e4e4e7;font-size:15.5px;margin:12px 0 0;text-shadow:0 1px 12px rgba(0,0,0,.6)}
 .home .row{margin-top:18px}
 .home .ghost{text-shadow:0 1px 10px rgba(0,0,0,.6)}
 .grid{margin-top:auto;padding-top:30px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px 10px}
 .grid button{display:flex;flex-direction:column;align-items:center;gap:7px;font-size:12px;font-weight:600;text-shadow:0 1px 8px rgba(0,0,0,.7)}
 .grid .ai{width:58px;height:58px}.grid .ai-tile{border-radius:16px}
 .dock{bottom:calc(10px + env(safe-area-inset-bottom));gap:12px;height:72px;border-radius:24px}
 .dock .sep,.dock [data-app=welcome]{display:none}
 .win{inset:0!important;width:auto!important;height:auto!important;border-radius:0;border:0;padding-top:env(safe-area-inset-top);z-index:1500!important;background:#0b0b0e;backdrop-filter:none;-webkit-backdrop-filter:none}
 .win.anim{transition:transform .45s var(--ease),opacity .3s}
 .tb{height:54px;flex-basis:54px;cursor:default}
 .tb .x{width:auto;padding:0 10px;gap:4px;margin-left:0;order:-1;font-size:15px;color:var(--acc-t);display:flex;align-items:center}
 .tb .x .xl{display:inline}
 .split{flex-direction:column}
 .side{width:auto;flex:0 0 auto;flex-direction:row;overflow-x:auto;border-right:0;border-bottom:1px solid rgba(255,255,255,.06);padding:10px}
 .side button{flex:0 0 auto;height:36px}
 .pane{padding:20px}
 h2{font-size:26px}
 .welcome h1{font-size:40px}.welcome{padding:24px 22px}
 .stats{grid-template-columns:1fr 1fr}
 .cmp div{grid-template-columns:110px 1fr;}.cmp em{grid-column:2}
 .wallgrid{grid-template-columns:1fr 1fr}
 .gallery{grid-template-columns:1fr 1fr;padding:14px}
 .cp{left:12px;right:12px;width:auto;top:calc(54px + env(safe-area-inset-top))}
}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
'''

JS = r'''
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const mobile = matchMedia('(max-width: 820px), (max-aspect-ratio: 11/10)');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const APPS = __APPS__;
const desk = $('.desk');

// ---------- boot ----------
const boot = $('#boot');
const endBoot = () => { boot.classList.add('gone'); setTimeout(() => boot.remove(), 600); if (!mobile.matches) openApp('welcome'); };
let seen = false; try { seen = sessionStorage.getItem('booted') === '1'; sessionStorage.setItem('booted', '1'); } catch (e) {}
if (reduce || seen) endBoot(); else setTimeout(endBoot, 1100);

// ---------- clock ----------
const clock = $('[data-clock]');
const tick = () => { const d = new Date(); clock.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
tick(); setInterval(tick, 15000);

// ---------- windows ----------
let z = 30, cascade = 0; const open = {};
function openApp(id, from) {
  if (open[id]) { focus(open[id]); return; }
  const a = APPS[id], w = document.createElement('section');
  w.className = 'win'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', a.title); w.dataset.app = id;
  w.innerHTML = `<header class="tb"><span class="ic"></span><b>${a.title}</b><button class="x" aria-label="Close ${a.title}"><span class="xl">‹ Home</span>__XICON__</button></header><div class="body"></div>`;
  w.querySelector('.ic').innerHTML = $(`#icon-${id}`).innerHTML;
  w.querySelector('.body').append($(`#tpl-${id}`).content.cloneNode(true));
  if (!mobile.matches) {
    const W = innerWidth, H = innerHeight, ww = Math.min(a.w, W - 40), hh = Math.min(a.h, H - 150);
    const x = Math.min(Math.max(20, a.x * W + cascade * 26), W - ww - 20), y = Math.min(Math.max(56, a.y * H + cascade * 22), H - hh - 92);
    Object.assign(w.style, { left: x + 'px', top: y + 'px', width: ww + 'px', height: hh + 'px' }); cascade = (cascade + 1) % 6;
  }
  desk.append(w); open[id] = w; focus(w); wire(w, id);
  // grow out of the dock icon (or slide up on phones)
  const src = from || $(`.dock [data-app="${id}"]`) || $(`.grid [data-app="${id}"]`);
  if (!reduce) {
    const r = w.getBoundingClientRect();
    if (mobile.matches) w.style.transform = 'translateY(100%)';
    else if (src) { const s = src.getBoundingClientRect(); w.style.transform = `translate(${s.left - r.left}px, ${s.top - r.top}px) scale(${s.width / r.width}, ${s.height / r.height})`; w.style.opacity = 0; }
    requestAnimationFrame(() => requestAnimationFrame(() => { w.classList.add('anim'); w.style.transform = ''; w.style.opacity = ''; }));
  }
  $$(`[data-app="${id}"]`).forEach(b => b.classList.add('run'));
  if (id === 'shield') measure(w);
  if (id === 'terminal') setTimeout(() => w.querySelector('input').focus({ preventScroll: true }), 300);
}
function closeApp(id) {
  const w = open[id]; if (!w) return; delete open[id];
  $$(`[data-app="${id}"]`).forEach(b => b.classList.remove('run'));
  const src = $(`.dock [data-app="${id}"]`);
  if (reduce) { w.remove(); return; }
  w.classList.add('anim');
  if (mobile.matches) w.style.transform = 'translateY(100%)';
  else if (src) { const r = w.getBoundingClientRect(), s = src.getBoundingClientRect(); w.style.transform = `translate(${s.left - r.left}px, ${s.top - r.top}px) scale(${s.width / r.width}, ${s.height / r.height})`; w.style.opacity = 0; }
  setTimeout(() => w.remove(), 480);
}
function focus(w) { w.style.zIndex = ++z; }
function wire(w, id) {
  w.addEventListener('pointerdown', () => focus(w));
  w.querySelector('.x').addEventListener('click', () => closeApp(id));
  // drag by the title bar (desktop)
  const tb = w.querySelector('.tb');
  tb.addEventListener('pointerdown', e => {
    if (mobile.matches || e.target.closest('.x')) return;
    const sx = e.clientX, sy = e.clientY, ox = w.offsetLeft, oy = w.offsetTop; tb.setPointerCapture(e.pointerId); w.classList.remove('anim');
    const mv = ev => { w.style.left = Math.min(innerWidth - 80, Math.max(-w.offsetWidth + 120, ox + ev.clientX - sx)) + 'px'; w.style.top = Math.min(innerHeight - 100, Math.max(46, oy + ev.clientY - sy)) + 'px'; };
    const up = () => { tb.removeEventListener('pointermove', mv); tb.removeEventListener('pointerup', up); };
    tb.addEventListener('pointermove', mv); tb.addEventListener('pointerup', up);
  });
  // tabs (Files, Settings)
  $$('[data-tabs] button', w).forEach(b => b.addEventListener('click', () => {
    $$('[data-tabs] button', w).forEach(x => x.classList.toggle('on', x === b));
    $$('[data-panel]', w).forEach(p => p.classList.toggle('on', p.dataset.panel === b.dataset.tab));
  }));
  $$('[data-open]', w).forEach(b => b.addEventListener('click', () => openApp(b.dataset.open, b)));
  $$('.wall', w).forEach(b => { b.setAttribute('aria-pressed', b.dataset.wall === cur); b.addEventListener('click', () => setWall(b.dataset.wall, b.dataset.acc)); });
  const box = $('.lightbox', w);
  if (box) {
    $$('.g', w).forEach(g => g.addEventListener('click', () => { $('img', box).src = g.dataset.full; $('img', box).alt = g.dataset.cap; $('p', box).textContent = g.dataset.cap; box.hidden = false; }));
    $('[data-closebox]', box).addEventListener('click', () => { box.hidden = true; });
  }
  const re = $('[data-remeasure]', w); if (re) re.addEventListener('click', () => measure(w));
  if (id === 'terminal') term(w);
}
$$('[data-app]').forEach(b => b.addEventListener('click', () => openApp(b.dataset.app, b)));
$$('.home [data-open]').forEach(b => b.addEventListener('click', () => openApp(b.dataset.open, b)));
addEventListener('keydown', e => { if (e.key === 'Escape') { const top = Object.values(open).sort((a, b) => b.style.zIndex - a.style.zIndex)[0]; if (top) closeApp(top.dataset.app); else cp(false); } });

// ---------- wallpaper + accent ----------
let cur = 'original';
const wallUrl = k => mobile.matches ? `img/hero/${k}-p.webp` : (innerWidth * devicePixelRatio > 1400 ? `img/hero/${k}-1920.webp` : `img/hero/${k}-1280.webp`);
function setWall(k, acc) {
  if (k === cur) return; cur = k;
  const bg = $('.wall-bg'), im = new Image(); im.alt = ''; im.style.opacity = 0;
  im.onload = () => { bg.append(im); requestAnimationFrame(() => requestAnimationFrame(() => { im.style.opacity = 1; const old = [...bg.children].slice(0, -1); setTimeout(() => old.forEach(o => o.remove()), 950); })); };
  im.src = wallUrl(k);
  const w = WALLS[k]; document.documentElement.style.setProperty('--acc', w[0]); document.documentElement.style.setProperty('--acc-t', w[1]);
  $$('[data-wall], .sw button').forEach(b => b.setAttribute('aria-pressed', (b.dataset.wall || b.dataset.k) === k));
}
const WALLS = __WALLS__;
$$('.sw button').forEach(b => b.addEventListener('click', () => setWall(b.dataset.k)));

// ---------- control panel ----------
const cpEl = $('.cp'), cpBtn = $('.ctl');
const cp = on => { cpEl.classList.toggle('on', on); cpBtn.setAttribute('aria-expanded', on); };
cpBtn.addEventListener('click', e => { e.stopPropagation(); cp(!cpEl.classList.contains('on')); });
document.addEventListener('click', e => { if (!e.target.closest('.cp')) cp(false); });
$('[data-night]').addEventListener('click', e => { const on = document.body.classList.toggle('is-night'); e.currentTarget.setAttribute('aria-pressed', on); });

// ---------- Shield: measure this page, live ----------
function measure(w) {
  const me = location.host;
  const res = performance.getEntriesByType('resource').map(r => new URL(r.name, location.href).host);
  const hosts = {}; [me, ...res].forEach(h => { if (h) hosts[h] = (hosts[h] || 0) + 1; });
  const third = Object.keys(hosts).filter(h => h !== me);
  let cookies = 0, storage = 0;
  try { cookies = document.cookie ? document.cookie.split(';').length : 0; } catch (e) {}
  try { storage = localStorage.length; } catch (e) {}
  const set = (k, v) => { const el = $(`[data-x="${k}"]`, w); if (el) el.textContent = v; };
  set('trackers', third.length); set('cookies', cookies); set('storage', storage); set('requests', res.length + 1);
  $('[data-x="hosts"]', w).innerHTML = Object.entries(hosts).map(([h, n]) => `<span>✓ ${h} · ${n}</span>`).join('');
  set('barlabel', third.length ? `${third.length} other sites` : '0 trackers');
}

// ---------- Terminal ----------
function term(w) {
  const out = $('.out', w), input = $('input', w), hist = []; let hi = 0;
  $('.term', w).addEventListener('click', () => input.focus());
  const say = (html, cls) => { const d = document.createElement('div'); if (cls) d.className = cls; d.innerHTML = html; out.append(d); out.scrollTop = out.scrollHeight; };
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  const FAQ = __FAQ__;
  const C = {
    help: () => say(`<span class="c">commands</span>\n  about      what NOVA is\n  features   what's inside\n  status     where it is right now\n  faq        questions people ask\n  neofetch   system info\n  whoami     who are you?\n  open APP   open an app (files, settings, shield, images, follow)\n  socials    where to follow\n  clear      clear the screen\n<span class="d">try: sudo rm -rf trackers</span>`),
    about: () => say('NOVA OS is a privacy-first Linux desktop.\nBeautiful by default, light on old PCs, and it never watches you.\nBuilt by one developer, for myself first, shared with everyone who loves privacy.'),
    features: () => say(__FEATS__.map(f => `<span class="c">●</span> ${f[0]}: ${f[1]}`).join('\n')),
    status: () => say('<span class="g">✓ design</span>     done · 100+ screens\n<span class="c">◐ desktop</span>    being built now\n<span class="d">○ installer</span>  next\n<span class="d">○ beta</span>       after that'),
    faq: () => say(FAQ.map(([q, a]) => `<span class="w">? ${esc(q)}</span>\n  ${esc(a)}`).join('\n\n')),
    neofetch: () => say(`<span class="c">      ✦</span>        <span class="c">you</span>@<span class="c">nova</span>\n<span class="c">     ✦✦✦</span>       ---------\n<span class="c">  ✦✦✦✦✦✦✦✦✦</span>    <span class="c">OS</span>: NOVA OS (in development)\n<span class="c">     ✦✦✦</span>       <span class="c">Base</span>: Arch Linux\n<span class="c">      ✦</span>        <span class="c">WM</span>: Hyprland\n               <span class="c">Shell</span>: Quickshell\n               <span class="c">Trackers</span>: <span class="g">0</span>\n               <span class="c">Cookies</span>: <span class="g">0</span>\n               <span class="c">Wallpaper</span>: ${cur}`),
    whoami: () => say('a visitor. that\'s all we know, and all we want to know.'),
    socials: () => say(`YouTube  <a href="${'__YT__'}" rel="noopener">youtube.com/@NovaOS-star</a>\nTikTok   <a href="${'__TT__'}" rel="noopener">@novaos.star</a>\nX        <a href="${'__XURL__'}" rel="noopener">@Novaos_star</a>`),
    clear: () => { out.innerHTML = ''; },
    ls: () => say('readme.txt  built-on/  status.log  wallpapers/  <span class="d">trackers/ (empty)</span>'),
    date: () => say(new Date().toString()),
    exit: () => closeApp('terminal'),
  };
  const run = raw => {
    const cmd = raw.trim(); say(`<span class="g">you@nova</span>:<span class="c">~</span>$ ${esc(cmd)}`);
    if (!cmd) return; hist.push(cmd); hi = hist.length;
    const [c, ...args] = cmd.split(/\s+/), low = c.toLowerCase();
    if (/^sudo$/.test(low) && /rm/.test(args.join(' ')) && /tracker/.test(args.join(' '))) return say("rm: cannot remove 'trackers': No such file or directory\n<span class=\"g\">(there are none. there never were.)</span>");
    if (low === 'sudo') return say('nice try. you\'re already in charge here.');
    if (low === 'open' && args[0]) { const k = args[0].toLowerCase(); if (APPS[k]) { openApp(k); return say(`opening ${k}…`); } return say(`no app called ${esc(args[0])}`); }
    if (low === 'echo') return say(esc(args.join(' ')));
    (C[low] || (() => say(`command not found: ${esc(c)}. try <span class="c">help</span>`)))();
  };
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { run(input.value); input.value = ''; }
    else if (e.key === 'ArrowUp') { hi = Math.max(0, hi - 1); input.value = hist[hi] || ''; e.preventDefault(); }
    else if (e.key === 'ArrowDown') { hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; e.preventDefault(); }
  });
  say('NOVA terminal. type <span class="c">help</span> to get started.', 'd');
}
})();
'''

APPS_JS = json.dumps({a[0]: {'title': TITLES[a[0]], 'w': a[3][0], 'h': a[3][1], 'x': a[4][0], 'y': a[4][1]} for a in APPS})
WALLS_JS = json.dumps({k: [c, a] for k, n, c, a in WALLS})
JS = (JS.replace('__APPS__', APPS_JS).replace('__WALLS__', WALLS_JS).replace('__FAQ__', json.dumps(FAQ))
        .replace('__FEATS__', json.dumps([[t, d.split('.')[0]] for _, _, t, _, d in FEATURES]))
        .replace('__YT__', CONFIG['youtube']).replace('__TT__', CONFIG['tiktok']).replace('__XURL__', CONFIG['x'])
        .replace('__XICON__', ic('x', 16).replace('`', '')))

dock = ''.join(f'<button data-app="{a[0]}" aria-label="Open {a[1]}">{app_icon(a, 44)}<span class="lbl">{a[1]}</span></button>' + ('<span class="sep"></span>' if a[0] == 'welcome' else '') for a in APPS)
grid = ''.join(f'<button data-app="{a[0]}">{app_icon(a, 58)}<span>{a[1]}</span></button>' for a in APPS if a[0] != 'welcome')
icons = ''.join(f'<template id="icon-{a[0]}">{app_icon(a, 22)}</template>' for a in APPS)
tpls = ''.join(f'<template id="tpl-{k}">{v}</template>' for k, v in TPL.items())
sw = ''.join(f'<button style="--c:{c}" data-k="{k}" aria-label="{n} wallpaper" aria-pressed="{str(k == "original").lower()}"></button>' for k, n, c, a in WALLS)

HTML = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>NOVA OS: your computer, finally yours</title>
<meta name="description" content="NOVA OS is a privacy-first Linux desktop. Try a tiny NOVA right in your browser: no trackers, no cookies, nothing watching.">
<meta name="theme-color" content="#050507">
<meta property="og:title" content="NOVA OS"><meta property="og:description" content="Your computer. Finally yours. Try a tiny NOVA desktop in your browser."><meta property="og:image" content="https://byeno.org/img/hero/original-1920.webp">
<link rel="icon" href="favicon.png">
<link rel="preload" href="fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="img/hero/original-1280.webp" as="image" media="(min-aspect-ratio: 11/10) and (min-width: 821px)">
<link rel="preload" href="img/hero/original-p.webp" as="image" media="(max-aspect-ratio: 11/10), (max-width: 820px)">
<style>{CSS}</style>
</head>
<body>
<div id="boot" aria-hidden="true"><span class="s">{STAR}</span><span class="bar"><i></i></span></div>
<noscript><style>#boot{{display:none}}</style><p style="position:fixed;top:60px;left:20px;right:20px;z-index:99;padding:16px;border-radius:14px;background:#101013">This site is a tiny NOVA desktop and needs JavaScript. <a href="simple/">Open the simple version</a>.</p></noscript>
<main class="desk">
 <div class="wall-bg"><picture><source media="(max-aspect-ratio: 11/10), (max-width: 820px)" srcset="img/hero/original-p.webp"><img src="img/hero/original-1280.webp" srcset="img/hero/original-1280.webp 1280w, img/hero/original-1920.webp 1920w" sizes="100vw" alt="" fetchpriority="high"></picture></div>
 <div class="night"></div>
 <header class="bar">
  <div class="pillb left" style="gap:7px" aria-hidden="true"><i class="ws on"></i><i class="ws"></i><i class="ws"></i><i class="ws"></i></div>
  <div class="pillb mid" data-clock aria-label="Time"></div>
  <div class="right"><div class="pillb tray" aria-hidden="true">{ic('wifi', 16)}{ic('bluetooth', 16)}{ic('volume-2', 16)}{ic('battery-full', 18)}</div>
   <button class="pillb ctl" aria-label="Control panel" aria-expanded="false" style="padding:0 10px">{ic('sliders-horizontal', 16)}</button></div>
 </header>
 <div class="cp" role="dialog" aria-label="Control panel">
  <p class="lbl2">Wallpaper</p><div class="sw">{sw}</div>
  <div class="cprow">{ic('moon', 18)}<div><b>Night Mode</b><small>Warmer colours</small></div><button class="tog" data-night aria-pressed="false" aria-label="Night Mode"></button></div>
  <div class="cplinks"><a href="simple/">Simple view</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="{CONFIG['youtube']}" rel="noopener">YouTube</a></div>
 </div>
 <section class="home" aria-label="NOVA OS">
  <h1 class="hl">Your computer.<br><span class="acc">Finally yours.</span></h1>
  <p class="sub">A privacy-first Linux desktop. Beautiful by default, light on old PCs, and it never watches you.</p>
  <div class="row"><button class="pill" data-open="follow">Get notified</button><a class="ghost" href="{CONFIG['youtube']}" rel="noopener">Watch the videos {ic('arrow-right', 16)}</a></div>
  <div class="grid">{grid}</div>
 </section>
 <nav class="dock" aria-label="Apps">{dock}</nav>
</main>
<h1 class="sr">NOVA OS: a privacy-first Linux desktop</h1>
{icons}{tpls}
<script>{JS}</script>
</body>
</html>'''
open(os.path.join(HERE, 'index.html'), 'w').write(HTML)
print('built index.html', len(HTML) // 1024, 'KB')
