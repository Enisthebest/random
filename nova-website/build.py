"""Builds the NOVA website (index.html, privacy.html, terms.html) from this file + ../nova-legal/*.md.
Static, no frameworks, no trackers. Edit the CONFIG below, then run: python3 build.py"""
import os, markdown
HERE = os.path.dirname(os.path.abspath(__file__))
ICONS = os.path.join(HERE, '..', 'nova-icons', 'svg')

CONFIG = {
    'waitlist_action': '',   # e.g. a form endpoint you control. Empty = the form is hidden and people are pointed to your socials.
    'tiktok': 'https://www.tiktok.com/@novaos.star',
    'x': 'https://x.com/Novaos_star',
    'youtube': 'https://www.youtube.com/@NovaOS-star',
}

def ic(name, size=24, sw=2):
    s = open(os.path.join(ICONS, name + '.svg')).read()
    inner = s[s.index('>', s.index('<svg')) + 1: s.rindex('</svg>')]
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{inner}</svg>'

def pic(name, alt, eager=False):
    load = 'eager" fetchpriority="high' if eager else 'lazy'
    return (f'<img src="img/{name}-1440.webp" srcset="img/{name}-720.webp 720w, img/{name}-1440.webp 1440w" '
            f'sizes="(max-width: 760px) 100vw, 1040px" width="1440" height="900" alt="{alt}" loading="{load}" decoding="async">')

def page(title, desc, body, path=''):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#050507">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="https://byeno.org/img/og.jpg">
<meta property="og:url" content="https://byeno.org/{path}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.png">
<link rel="preload" href="fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="nav"><div class="wrap">
 <a class="brand" href="./"><img src="img/star.webp" alt="" width="26" height="26">NOVA OS</a>
 <ul><li><a href="./#features">Features</a></li><li><a href="./#look">Look</a></li><li><a href="./#status">Status</a></li><li><a href="./#faq">FAQ</a></li></ul>
 <a class="btn sm pri" href="./#join">Get notified</a>
</div></header>
<main id="main">
{body}
</main>
<footer><div class="wrap">
 <span>© NOVA OS · Built by one developer</span>
 <nav><a href="{CONFIG['youtube']}" rel="noopener">YouTube</a><a href="{CONFIG['tiktok']}" rel="noopener">TikTok</a><a href="{CONFIG['x']}" rel="noopener">X</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></nav>
</div></footer>
<script src="main.js" defer></script>
</body>
</html>'''

def card(icon, tone, title, text):
    return f'<div class="card rv"><div class="ic {tone}">{ic(icon)}</div><h3>{title}</h3><p>{text}</p></div>'

WALLS = [('original', 'NOVA', '#3B8BFF'), ('aurora', 'Aurora', '#19C995'), ('ember', 'Ember', '#FF4F8B'), ('lilac', 'Lilac', '#A26BFF'), ('ocean', 'Ocean', '#12B8F0'), ('citrus', 'Citrus', '#A8E632')]
GALLERY = [('shell-lock', 'Lock screen'), ('launcher-search', 'Launcher: find anything with Super + Space'), ('shield', 'Shield: 14 protections, one tap each'),
           ('files', 'Files'), ('browser-newtab', 'NOVA Browser: trackers blocked by default'), ('terminal', 'Terminal'),
           ('setup-welcome', 'First boot: a friendly setup'), ('install-disk', 'Installer: next to Windows or on its own')]
FAQ = [
    ('Is NOVA real?', "Yes. NOVA is in active development by one developer. The pictures and videos so far show the designs, and real footage is coming as soon as the desktop is ready."),
    ('Is it made with AI?', "AI is one of the tools, like a code editor or a terminal. I design, test and decide everything myself."),
    ('Will it make my old PC faster?', "It can feel a lot faster. NOVA doesn't run background junk, trackers or ads, starts with almost nothing running, and compresses memory (zram). It can't turn old hardware into new hardware, but it stops wasting what you have."),
    ('Is it a hacking distro like Kali?', "No, it's an everyday OS for people who care about privacy, with security built in to protect you. It's Arch-based, so you can still install tools like nmap, Wireshark or Metasploit, or add the BlackArch repository."),
    ('Does NOVA collect my data?', "No. No account, no telemetry, no analytics, no ads. The full privacy policy fits on one screen."),
    ('When can I try it?', "There's no date yet. Building an OS alone takes time. Get notified below or follow along on YouTube, TikTok or X."),
    ('What is it built on?', "Arch Linux at the base, Hyprland for windows and glass, Quickshell for the desktop, and NOVA's own design on top."),
]

def index():
    walls = ''.join(f'<div class="wall rv"><img src="img/wall-{k}.webp" width="640" height="360" alt="{n} wallpaper" loading="lazy" decoding="async"><span><i style="background:{c}"></i>{n}</span></div>' for k, n, c in WALLS)
    gal = ''.join(f'<figure><div class="frame">{pic(k, c)}</div><figcaption>{c}</figcaption></figure>' for k, c in GALLERY)
    faq = ''.join(f'<details class="rv"><summary>{q}</summary><p>{a}</p></details>' for q, a in FAQ)
    form = (f'<form action="{CONFIG["waitlist_action"]}" method="post"><label class="skip" for="email">Email</label><input id="email" name="email" type="email" required placeholder="you@example.com" autocomplete="email"><button class="btn pri" type="submit">Notify me</button></form>'
            f'<p class="small">One email when NOVA is ready. Nothing else, never shared.</p>') if CONFIG['waitlist_action'] else ''
    body = f'''
<section class="hero"><div class="wrap">
 <img class="star" src="img/star.webp" alt="" width="76" height="76">
 <span class="kicker"><i></i>In development · Coming soon</span>
 <h1>Your computer.<br><em>Finally yours.</em></h1>
 <p class="lead">NOVA OS is a privacy-first Linux desktop. Beautiful by default, light on old PCs, and it never watches you.</p>
 <div class="cta"><a class="btn pri" href="#join">Get notified</a><a class="btn" href="{CONFIG['youtube']}" rel="noopener">{ic('play', 18)}Watch the videos</a></div>
 <div class="shot">{pic('shell-desktop', 'The NOVA desktop', eager=True)}</div>
 <p class="note">Designs shown. NOVA is still being built.</p>
</div></section>

<section id="features"><div class="wrap center">
 <p class="eyebrow">Why NOVA</p>
 <h2>Everything you need.<br>Nothing watching you.</h2>
 <p class="sub">No account, no ads, no tracking. Just a fast, beautiful desktop that works for you.</p>
 <div class="grid" style="text-align:left">
  {card('eye-off', 'g', 'Collects nothing', 'No telemetry, no analytics, no account. What you do on your PC stays on your PC.')}
  {card('nova-shield', 'g', 'Shield built in', 'Firewall, encrypted DNS, private Wi-Fi addresses and more. 14 protections, one tap each.')}
  {card('zap', 'o', 'Light on old PCs', 'Starts with almost nothing running and only wakes up what you use.')}
  {card('gamepad-2', '', 'Gaming mode', 'Super + G freezes background apps, holds notifications and locks focus to your game.')}
  {card('palette', '', 'Make it yours', 'Six wallpapers, and the accent colour follows the one you pick.')}
  {card('key-round', 'g', 'Encrypted by default', 'Your disk is locked with your password, with a recovery key you keep.')}
 </div>
</div></section>

<section><div class="wrap split">
 <div class="txt rv"><p class="eyebrow">Gaming mode</p><h2>Press Super G.<br>Everything else steps aside.</h2>
  <ul class="list"><li>Background apps frozen, not closed</li><li>Notifications held until you're done</li><li>No sleep, no dimming, no idle effects</li><li>Shield stays on. Always.</li></ul>
  <div class="keys"><kbd>super</kbd><kbd>G</kbd></div></div>
 <div class="frame rv">{pic('gaming-on', 'Gaming mode on')}</div>
</div></section>

<section><div class="wrap split rev">
 <div class="txt rv"><p class="eyebrow">Control</p><h2>Everything in one place.</h2>
  <p class="sub">Sound, Wi-Fi, Bluetooth, Night Mode and drives, one click from the top bar.</p></div>
 <div class="frame rv">{pic('shell-control', 'The Control panel')}</div>
</div></section>

<section id="look"><div class="wrap center">
 <p class="eyebrow">Make it yours</p>
 <h2>Six wallpapers.<br>Your colour follows.</h2>
 <p class="sub">Pick a wallpaper and toggles, highlights and links all match it.</p>
 <div class="walls">{walls}</div>
</div></section>

<section><div class="wrap center"><p class="eyebrow">A closer look</p><h2>Designed down to the details.</h2></div>
 <div class="gallery" tabindex="0" aria-label="Screens from NOVA">{gal}</div>
 <p class="note center">Swipe or scroll sideways. Designs shown.</p>
</section>

<section id="status"><div class="wrap">
 <p class="eyebrow">Honest status</p>
 <h2>Where NOVA is right now.</h2>
 <p class="sub">One developer, building it properly. Here's the real progress.</p>
 <div class="status">
  <div class="row rv"><i class="dot" style="background:var(--green)"></i><b>Design</b><span style="color:var(--green)">Done · 100+ screens</span></div>
  <div class="row rv" style="flex-wrap:wrap"><i class="dot" style="background:var(--accent-text)"></i><b>Desktop</b><span style="color:var(--accent-text)">Being built now</span><div class="bar" style="flex-basis:100%"><i></i></div></div>
  <div class="row rv"><i class="dot" style="background:#55555e"></i><b>Installer</b><span style="color:var(--text-3)">Next</span></div>
  <div class="row rv"><i class="dot" style="background:#55555e"></i><b>Beta</b><span style="color:var(--text-3)">After that</span></div>
 </div>
</div></section>

<section id="faq"><div class="wrap">
 <p class="eyebrow">FAQ</p><h2>Questions people ask.</h2>
 <div class="faq">{faq}</div>
</div></section>

<section id="join"><div class="wrap"><div class="join rv">
 <img src="img/star.webp" alt="" width="56" height="56" style="margin:0 auto 18px">
 <h2>Be there on day one.</h2>
 <p class="sub" style="margin-inline:auto">NOVA is built for myself and shared with everyone who loves privacy. Follow along while I build it.</p>
 {form}
 <div class="socials"><a class="btn" href="{CONFIG['youtube']}" rel="noopener">YouTube</a><a class="btn" href="{CONFIG['tiktok']}" rel="noopener">TikTok</a><a class="btn" href="{CONFIG['x']}" rel="noopener">X</a></div>
</div></div></section>
'''
    return page('NOVA OS: your computer, finally yours', 'NOVA OS is a privacy-first Linux desktop. Beautiful by default, light on old PCs, and it never watches you. Coming soon.', body)

def legal(md_file, title, path, extra=''):
    md = open(os.path.join(HERE, '..', 'nova-legal', md_file)).read()
    html = markdown.markdown(md)
    return page(f'{title}: NOVA OS', f'{title} for NOVA OS.', f'<div class="wrap legal">{html}{extra}</div>', path)

SITE_PRIVACY = '''<h2>This website</h2>
<p>byeno.org uses <strong>no cookies, no analytics and no trackers</strong>, and loads no third-party scripts or fonts. Like any web server, the server that hosts this site may keep short-lived access logs (IP address, time, page requested) to keep it running.</p>
<p>If you join the waitlist, your email address is used for one thing only: telling you when NOVA is ready. It is never sold or shared, and you can ask for it to be deleted at any time.</p>'''

out = {'index.html': index(), 'privacy.html': legal('PRIVACY.md', 'Privacy Policy', 'privacy', SITE_PRIVACY), 'terms.html': legal('TERMS.md', 'Terms', 'terms')}
for name, html in out.items():
    open(os.path.join(HERE, name), 'w').write(html)
print('built', ', '.join(out))
