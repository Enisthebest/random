"""Builds nova-site/index.html: one file with inline CSS + JS (assets next to it in frames/, img/, fonts/).
Hero = the NOVA intro film, scrubbed by scroll from small WebP frames on a canvas (smooth on every device).
Layout of the final hero state follows the 1487x1058 comp (height-locked units). Run: python3 build.py"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
ICONS = os.path.join(HERE, '..', 'nova-icons', 'svg')
CONFIG = {'tiktok': 'https://www.tiktok.com/@novaos.star', 'x': 'https://x.com/Novaos_star', 'youtube': 'https://www.youtube.com/@NovaOS-star'}
ND, NM = len(os.listdir(os.path.join(HERE, 'frames', 'd'))), len(os.listdir(os.path.join(HERE, 'frames', 'm')))

def ic(name, size=20, sw=2):
    s = open(os.path.join(ICONS, name + '.svg')).read()
    inner = s[s.index('>', s.index('<svg')) + 1: s.rindex('</svg>')]
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{inner}</svg>'

def pic(name, alt):
    return (f'<img src="img/{name}-1440.webp" srcset="img/{name}-720.webp 720w, img/{name}-1440.webp 1440w" sizes="(max-width: 760px) 100vw, 1200px" '
            f'width="1440" height="900" alt="{alt}" loading="lazy" decoding="async">')

STAR = '''<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="sg" x1="8" y1="2" x2="40" y2="46" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#f4f4f4"/><stop offset=".38" stop-color="#bdbdbd"/><stop offset=".5" stop-color="#5a5a5a"/><stop offset=".62" stop-color="#9a9a9a"/><stop offset="1" stop-color="#e8e8e8"/></linearGradient></defs>
<path d="M24 0C25.2 14.5 29.5 22.6 48 24 29.5 25.4 25.2 33.5 24 48 22.8 33.5 18.5 25.4 0 24 18.5 22.6 22.8 14.5 24 0Z" fill="url(#sg)"/></svg>'''

BEATS_DATA = [   # (from, to, position, small tag, lines)
    (.16, .31, 'tl', '01', ['Your computer', 'was never yours.']),
    (.33, .47, 'r', '02', ['Trackers.', 'Ads.', 'Telemetry.']),
    (.49, .62, 'bl', '03', ['So I tore it', 'all down.']),
    (.64, .77, 'c', '04', ['And built', 'something better.']),
]
def beat_html(a, b, pos, tag, lines):
    ls = ''.join('<span class="ln">' + '<span class="gap"></span>'.join(f'<span class="w">{w}</span>' for w in line.split(' ')) + '</span>' for line in lines)
    return f'<div class="beat pos-{pos}" data-a="{a}" data-b="{b}"><span class="tag">{tag} / 04</span><p>{ls}</p></div>'
BEATS = ''.join(beat_html(*x) for x in BEATS_DATA)

STACK = [('layers', 'Arch Linux'), ('app-window', 'Hyprland'), ('panels-top-left', 'Quickshell'), ('monitor', 'Wayland')]
FEATURES = [
    ('gaming-on', 'Gaming mode', 'Press Super G. Background apps freeze, notifications wait, the game gets everything.'),
    ('shell-control', 'Control', 'Sound, Wi-Fi, Bluetooth, Night Mode and drives. One click from the top bar.'),
    ('launcher-search', 'Launcher', 'Super + Space. Apps, files, settings and quick answers, as you type.'),
    ('shield', 'Shield', 'Firewall, encrypted DNS, private Wi-Fi addresses. Fourteen protections, one tap each.'),
    ('browser-newtab', 'NOVA Browser', 'Trackers blocked by default. Counted on your device, sent nowhere.'),
    ('install-disk', 'Installer', 'Next to Windows or on its own. Encrypted by default. Nothing changes until you say so.'),
]
FAQ = [
    ('Is NOVA real?', "Yes. It's in active development by one developer. The pictures and videos so far show the designs, and real footage is coming as soon as the desktop is ready."),
    ('Is it made with AI?', "AI is one of the tools, like a code editor or a terminal. I design, test and decide everything myself."),
    ('Will it make my old PC faster?', "It can feel a lot faster. No background junk, no trackers, no ads, almost nothing running at start, and compressed memory (zram). It can't make old hardware new, but it stops wasting what you have."),
    ('Is it a hacking distro like Kali?', "No, it's an everyday OS for people who care about privacy, with security built in to protect you. It's Arch-based, so tools like nmap, Wireshark or Metasploit are a download away, or add BlackArch."),
    ('Does NOVA collect my data?', "No. No account, no telemetry, no analytics, no ads. The privacy policy fits on one screen."),
    ('When can I try it?', "No date yet. Building an OS alone takes time. Follow along on YouTube, TikTok or X to know first."),
]

CSS = r'''
@font-face{font-family:Manrope;src:url(fonts/manrope.woff2) format("woff2");font-weight:200 800;font-display:swap}
:root{--ink:#fafafa;--muted:#a7a6a6;--nav:#b6b5b5;--strip:#8b8a8a;--pill:#fff;--pill-ink:#050505;--bg:#050505;
 --u:calc(100vh/1058);--uw:calc(100vw/1487);--h:clamp(var(--u),calc(var(--u)*.65 + var(--uw)*.35),calc(var(--u)*1.16));--ease:cubic-bezier(.22,1,.36,1)}
@supports (height:100dvh){:root{--u:calc(100dvh/1058)}}
*{box-sizing:border-box}
html{background:var(--bg);-webkit-text-size-adjust:100%;overflow-x:clip}
body{margin:0;background:var(--bg);color:var(--ink);font-family:Manrope,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
a{color:inherit;text-decoration:none}
img{max-width:100%;height:auto;display:block}
:focus-visible{outline:2px solid #fff;outline-offset:3px;border-radius:6px}

/* ---------- the scroll film ---------- */
.scrub{position:relative;height:560vh}
.stage{position:sticky;top:0;height:100vh;height:100dvh;overflow:hidden;background:var(--bg)}
.plate{position:absolute;inset:0}
.plate canvas,.plate .still{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.plate .still{transition:opacity .4s}
.plate::after{content:"";position:absolute;inset:0;pointer-events:none;
 background:linear-gradient(to bottom,rgba(5,5,5,0) 78.8%,rgba(5,5,5,.23) 79.6%,rgba(5,5,5,.45) 81.4%,rgba(5,5,5,.75) 83.3%,rgba(5,5,5,.84) 85.2%,rgba(5,5,5,.888) 88%,rgba(5,5,5,.905) 91%,rgba(5,5,5,.96) 95%,#050505 100%),
 linear-gradient(to right,rgba(5,5,5,.78) 0%,rgba(5,5,5,.45) 34%,rgba(5,5,5,0) 58%);opacity:var(--shade,0);transition:opacity .6s}

/* text on the film: editorial, heavy, composed per scene; words slide up out of a mask as you scroll */
.beats{position:absolute;inset:0;pointer-events:none;z-index:3}
.dim{position:absolute;inset:0;background:#050505;opacity:0;z-index:2;pointer-events:none}
.beat{position:absolute;opacity:0}
.beat p{margin:0;font-weight:800;font-size:calc(124*var(--h));line-height:.9;letter-spacing:-.045em;color:#fff}
.beat .ln{display:block;overflow:hidden;padding:.06em 0 .16em;margin-bottom:-.12em}
.beat .w{display:inline-block;will-change:transform}
.beat .gap{display:inline-block;width:.24em}
.pos-tl{left:calc(75*var(--u));top:calc(170*var(--u))}
.pos-r{right:calc(75*var(--u));top:calc(210*var(--u));text-align:right}
.pos-bl{left:calc(75*var(--u));bottom:calc(150*var(--u))}
.pos-c{left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;white-space:nowrap}
.beat .tag{display:block;margin-bottom:calc(22*var(--u));font-size:calc(14*var(--u));font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:#cfcfcf}
@media (max-aspect-ratio:11/10){
 .beat p{font-size:46px}.beat .tag{font-size:11px;margin-bottom:14px}
 .pos-c{white-space:normal;width:calc(100% - 48px)}
 .pos-tl{left:24px;top:120px}.pos-r{right:24px;top:150px}.pos-bl{left:24px;bottom:150px}
}

/* header (desktop measurements in --u) */
.brand{position:absolute;left:calc(75*var(--u));top:calc(27*var(--u));width:calc(48.5*var(--u));height:calc(48.5*var(--u));z-index:5}
.brand svg{width:100%;height:100%}
.links{position:absolute;left:50%;top:calc(51*var(--u));transform:translate(-50%,-50%);display:flex;gap:calc(24.5*var(--u));font-size:calc(19*var(--u));color:var(--nav);z-index:5}
.links a:hover{color:var(--ink)}
.pill{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:var(--pill);color:var(--pill-ink);font-weight:500;white-space:nowrap;transition:transform .3s var(--ease)}
.pill:hover{transform:translateY(-1px)}
.pill span{transform:translateY(calc(1*var(--u)))}
.pill-nav{position:absolute;right:calc(75.4*var(--u));top:calc(27*var(--u));width:calc(175*var(--u));height:calc(49*var(--u));font-size:calc(20.6*var(--u));z-index:5}
.burger{display:none}

/* hero copy: appears when the film settles */
.hero .headline{position:absolute;left:calc(75.5*var(--u));top:calc(222*var(--u));margin:0;font-size:calc(84*var(--h));line-height:calc(84*var(--h));font-weight:800;letter-spacing:-.04em;white-space:nowrap}
.hero .headline span{display:block}
.hero .sub{position:absolute;left:calc(75.5*var(--u));top:calc(230.5*var(--u) + 196*var(--h));margin:0;font-size:calc(20.7*var(--h));line-height:calc(23.5*var(--h));word-spacing:calc(1.8*var(--h));color:var(--muted)}
.hero .sub span{display:block;white-space:nowrap}
.pill-cta{position:absolute;left:calc(74.9*var(--u));top:calc(230.5*var(--u) + 264.5*var(--h));width:calc(175.6*var(--h));height:calc(50*var(--h));font-size:calc(20.6*var(--h))}
.ghost{position:absolute;left:calc(74.9*var(--u) + 220.6*var(--h));top:calc(230.5*var(--u) + 279.5*var(--h));font-size:calc(20.6*var(--h));font-weight:500;letter-spacing:calc(.12*var(--h));color:#fff}
.ghost:hover{color:var(--muted)}
.logos{position:absolute;left:50%;top:calc(994*var(--u));transform:translateX(-50%);display:flex;align-items:center;gap:calc(64*var(--u));color:var(--strip);white-space:nowrap}
.logos small{font-size:calc(14*var(--u));letter-spacing:.14em;text-transform:uppercase;font-weight:600;opacity:.8}
.lg{display:flex;align-items:center;gap:calc(10*var(--u));font-size:calc(18*var(--u));font-weight:700;letter-spacing:-.01em}
.lg svg{width:calc(26*var(--u));height:calc(26*var(--u))}
.stage .rv{opacity:0;transform:translateY(calc(14*var(--u)));transition:opacity .9s var(--ease),transform .9s var(--ease)}
.stage .logos.rv{transform:translate(-50%,calc(14*var(--u)))}
.stage.done .rv{opacity:1;transform:none}.stage.done .logos.rv{transform:translateX(-50%)}
.stage.done .d1{transition-delay:.06s}.stage.done .d2{transition-delay:.14s}.stage.done .d3{transition-delay:.22s}.stage.done .d4{transition-delay:.34s}
header{text-shadow:0 1px 12px rgba(0,0,0,.6)}
.stage::before{content:"";position:absolute;left:0;right:0;top:0;height:calc(150*var(--u));background:linear-gradient(rgba(5,5,5,.55),rgba(5,5,5,0));z-index:4;pointer-events:none}
.hint{position:absolute;left:50%;bottom:calc(46*var(--u));transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:10px;font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--nav);transition:opacity .5s}
.hint i{width:1px;height:42px;background:linear-gradient(#b6b5b5,transparent);animation:drip 2s var(--ease) infinite}
@keyframes drip{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}51%{transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
.stage.moving .hint,.stage.done .hint{opacity:0}
@media (prefers-reduced-motion:no-preference){
 .brand,.pill-nav{animation:rise .8s var(--ease) both}.links{animation:riseNav .8s var(--ease) both}
}
@keyframes rise{from{opacity:0;transform:translateY(calc(14*var(--u)))}}
@keyframes riseNav{from{opacity:0;transform:translate(-50%,calc(-50% + 14*var(--u)))}to{opacity:1;transform:translate(-50%,-50%)}}

/* ---------- portrait / phones ---------- */
.acts{display:contents}
@media (max-aspect-ratio:11/10){
 :root{--m:min(100vw/430,1.34px);--u:var(--m);--h:var(--m)}
 .links,.pill-nav{display:none}
 .brand{left:22px;top:calc(18px + env(safe-area-inset-top));width:40px;height:40px}
 .burger{display:flex;position:absolute;right:20px;top:calc(18px + env(safe-area-inset-top));width:48px;height:40px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);z-index:9;align-items:center;justify-content:center;flex-direction:column;gap:6px;cursor:pointer;padding:0}
 .burger i{display:block;width:18px;height:1.6px;background:#fff;border-radius:1px;transition:transform .42s var(--ease)}
 body.is-open .burger i:first-child{transform:translateY(3.8px) rotate(45deg)}body.is-open .burger i:last-child{transform:translateY(-3.8px) rotate(-45deg)}
 .plate::after{background:linear-gradient(to bottom,rgba(5,5,5,.25) 0%,rgba(5,5,5,.1) 30%,rgba(5,5,5,.55) 58%,rgba(5,5,5,.92) 78%,#050505 100%)}
 .hero{position:absolute;left:0;right:0;bottom:calc(120px + env(safe-area-inset-bottom));padding:0 24px}
 .hero .headline,.hero .sub,.pill-cta,.ghost{position:static}
 .hero .headline{font-size:calc(52*var(--m));line-height:.95;letter-spacing:-.045em;white-space:normal}
 .hero .sub{margin-top:16px;font-size:calc(17*var(--m));line-height:1.45;word-spacing:0}
 .hero .sub span{display:inline;white-space:normal}
 .hero .acts{display:flex;align-items:center;gap:22px;margin-top:26px}
 .pill-cta{width:auto;height:50px;padding:0 26px;font-size:17px}
 .ghost{font-size:17px}
 .logos{top:auto;left:24px;bottom:calc(28px + env(safe-area-inset-bottom));width:calc(100% - 48px);display:grid;grid-template-columns:auto auto;gap:12px 24px;justify-content:center}
 .logos small{grid-column:1/-1;text-align:center;font-size:11px}
 .stage .logos.rv{transform:translateY(14px)}.stage.done .logos.rv{transform:none}
 .lg{font-size:15px;gap:8px}.lg svg{width:18px;height:18px}
 .hint{bottom:90px}
}
@media (min-width:600px) and (max-aspect-ratio:11/10){ .logos{grid-template-columns:repeat(4,auto)} }

/* mobile menu */
.menu{position:fixed;inset:0;z-index:8;background:linear-gradient(180deg,rgba(5,5,5,.92),rgba(5,5,5,.98));backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);opacity:0;visibility:hidden;transition:opacity .42s var(--ease),visibility .42s}
body.is-open .menu{opacity:1;visibility:visible}
.menu-inner{padding:110px 28px 40px;display:flex;flex-direction:column;height:100%}
.menu-eyebrow{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--strip);margin:0 0 18px}
.menu ul{list-style:none;margin:0;padding:0}
.menu li a{display:flex;align-items:center;justify-content:space-between;font-size:max(25px,calc(31*var(--m)));padding:12px 0;border-bottom:1px solid rgba(255,255,255,.08)}
.menu li a::after{content:"›";color:var(--strip)}
.menu-foot{margin-top:auto;display:flex;gap:20px;align-items:center}
.menu-foot .pill{height:50px;padding:0 26px;font-size:17px}
.menu .rvm{opacity:0;transform:translateY(12px);transition:opacity .5s var(--ease),transform .5s var(--ease)}
body.is-open .menu .rvm{opacity:1;transform:none}
body.is-open .menu .rvm:nth-child(1){transition-delay:.06s}body.is-open .menu li:nth-child(1){transition-delay:.10s}body.is-open .menu li:nth-child(2){transition-delay:.16s}body.is-open .menu li:nth-child(3){transition-delay:.22s}body.is-open .menu li:nth-child(4){transition-delay:.28s}body.is-open .menu-foot{transition-delay:.34s}

/* ---------- the page after the film: restrained, no cards ---------- */
.wrap{width:min(1200px,100% - 48px);margin-inline:auto}
section{padding:140px 0}
.eyebrow{font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--strip);font-weight:600}
h2{font-size:clamp(38px,5.6vw,76px);line-height:.98;font-weight:800;letter-spacing:-.04em;margin:16px 0 0}
.lead{font-size:clamp(18px,1.6vw,22px);line-height:1.55;color:var(--muted);max-width:680px;margin:24px 0 0}
.statement h2{max-width:980px}
.statement h2 em{font-style:normal;color:var(--muted)}
.feature{display:grid;grid-template-columns:1fr 1.6fr;gap:64px;align-items:center;padding:70px 0;border-top:1px solid rgba(255,255,255,.07)}
.feature:nth-child(even){grid-template-columns:1.6fr 1fr}.feature:nth-child(even) .ft{order:2}
.feature h3{font-size:clamp(30px,3.2vw,46px);font-weight:800;margin:10px 0 0;letter-spacing:-.035em;line-height:1}
.feature p{color:var(--muted);font-size:18px;line-height:1.55;margin:14px 0 0}
.feature .shot{border-radius:18px;overflow:hidden;background:#0b0b0b;aspect-ratio:1440/900}
.num{font-size:13px;letter-spacing:.2em;color:var(--strip);font-weight:600}
@media (max-width:860px){.feature,.feature:nth-child(even){grid-template-columns:1fr;gap:26px}.feature:nth-child(even) .ft{order:0}section{padding:96px 0}}
.walls{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-top:48px}
.walls img{border-radius:12px;aspect-ratio:16/9;object-fit:cover;width:100%}
@media (max-width:760px){.walls{grid-template-columns:repeat(3,1fr)}}
.status{margin-top:48px;max-width:820px}
.st{display:flex;align-items:baseline;gap:20px;padding:22px 0;border-top:1px solid rgba(255,255,255,.08);font-size:clamp(20px,2vw,26px)}
.st:last-child{border-bottom:1px solid rgba(255,255,255,.08)}
.st span{margin-left:auto;font-size:16px;color:var(--strip)}
.st.on span{color:var(--ink)}
.st .now{display:inline-block;width:8px;height:8px;border-radius:4px;background:#fff;margin-right:10px;vertical-align:middle;animation:pulse 2s var(--ease) infinite}
@keyframes pulse{50%{opacity:.25}}
.faq{margin-top:40px;max-width:900px}
.faq details{border-top:1px solid rgba(255,255,255,.08)}
.faq details:last-child{border-bottom:1px solid rgba(255,255,255,.08)}
.faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:20px;padding:26px 0;font-size:clamp(19px,1.8vw,24px)}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";color:var(--strip);font-size:26px;line-height:1;transition:transform .4s var(--ease)}
.faq details[open] summary::after{transform:rotate(45deg)}
.faq p{margin:0 0 26px;color:var(--muted);font-size:17px;line-height:1.6;max-width:760px}
.follow{text-align:center}
.follow h2{margin-inline:auto}
.follow .row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:40px}
.follow .row a{height:52px;padding:0 28px;font-size:17px}
.follow .row .line{display:inline-flex;align-items:center;border:1px solid rgba(255,255,255,.18);border-radius:999px;color:#fff;font-weight:500}
footer{border-top:1px solid rgba(255,255,255,.07);padding:36px 0 48px;color:var(--strip);font-size:14px}
footer .wrap{display:flex;gap:18px;flex-wrap:wrap;align-items:center}
footer nav{margin-left:auto;display:flex;gap:18px}
footer a:hover{color:var(--ink)}
.in-view{opacity:0;transform:translateY(20px);transition:opacity .9s var(--ease),transform .9s var(--ease)}
.in-view.seen{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition-duration:.001s!important}.in-view{opacity:1;transform:none}}
'''

JS = r'''
(() => {
  const stage = document.querySelector('.stage'), scrub = document.querySelector('.scrub'), cv = document.getElementById('film'), still = document.querySelector('.still');
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saver = navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || ''));
  const portrait = matchMedia('(max-aspect-ratio: 11/10)').matches;
  const SET = portrait ? { dir: 'm', n: __NM__ } : { dir: 'd', n: __ND__ };
  const frames = new Array(SET.n); let want = 0, shown = -1;
  const beats = [...document.querySelectorAll('.beat')], dim = document.querySelector('.dim');

  // no film: calm end frame with the copy, no tall scroll area
  if (reduce || saver) { document.querySelector('.beats').remove(); document.querySelector('.dim').remove(); scrub.style.height = '100vh'; still.src = portrait ? 'media/hero-end-960.webp' : 'media/hero-end.webp'; stage.classList.add('done'); stage.style.setProperty('--shade', 1); return; }

  function size() { const r = devicePixelRatio > 1 ? 1.5 : 1; cv.width = cv.clientWidth * r; cv.height = cv.clientHeight * r; shown = -1; draw(); }
  function draw() {
    let i = want; while (i > 0 && !frames[i]) i--;           // nearest frame already loaded
    const im = frames[i]; if (!im || i === shown) return; shown = i;
    const s = Math.max(cv.width / im.naturalWidth, cv.height / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.drawImage(im, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
    still.style.opacity = 0;
  }
  function onScroll() {
    const r = scrub.getBoundingClientRect(), span = scrub.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / span));
    const v = Math.min(1, p / 0.8);                            // the film ends at 80%, the copy holds the rest
    want = Math.round(v * (SET.n - 1));
    stage.classList.toggle('moving', p > 0.02);
    stage.classList.toggle('done', p > 0.78);
    stage.style.setProperty('--shade', Math.min(1, Math.max(0, (p - 0.7) / 0.1)));
    let dimmed = 0;
    for (const b of beats) {   // words rise out of their line mask one after another, then the scene lifts away
      const a = +b.dataset.a, z = +b.dataset.b, u = (p - a) / (z - a);
      const words = b._w || (b._w = [...b.querySelectorAll('.w')]);
      if (u <= 0 || u >= 1) { b.style.opacity = 0; continue; }
      const out = Math.min(1, Math.max(0, (u - 0.8) / 0.2));
      b.style.opacity = 1 - out; dimmed = Math.max(dimmed, 1 - out);
      words.forEach((w, k) => { const r = Math.min(1, Math.max(0, (u - k * 0.045) / 0.16)), e = 1 - Math.pow(1 - r, 3); w.style.transform = `translateY(${(1 - e) * 110}%)`; });
      const lift = `translateY(${-out * 40}px)`;
      b.style.transform = b.classList.contains('pos-c') ? `translate(-50%, -50%) ${lift}` : lift;
    }
    dim.style.opacity = dimmed * 0.38;
    requestAnimationFrame(draw);
  }
  // load frame 0 first, then stream the rest in order (6 at a time)
  let next = 0;
  function pump() {
    if (next >= SET.n) return;
    const i = next++, im = new Image(); im.decoding = 'async';
    im.onload = () => { frames[i] = im; if (i <= want) requestAnimationFrame(draw); pump(); };
    im.onerror = pump;
    im.src = `frames/${SET.dir}/${String(i).padStart(3, '0')}.webp`;
  }
  for (let k = 0; k < 6; k++) pump();
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', size);
  size(); onScroll();
})();
// menu
(() => {
  const b = document.getElementById('burger'), m = document.getElementById('menu');
  const set = open => { document.body.classList.toggle('is-open', open); b.setAttribute('aria-expanded', open); m.setAttribute('aria-hidden', !open); b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); };
  b.addEventListener('click', () => set(!document.body.classList.contains('is-open')));
  addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  m.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('resize', () => { if (innerWidth / innerHeight > 1.1) set(false); });
})();
// sections fade in
(() => {
  if (!('IntersectionObserver' in window)) { document.querySelectorAll('.in-view').forEach(e => e.classList.add('seen')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.in-view').forEach(e => io.observe(e));
})();
'''.replace('__ND__', str(ND)).replace('__NM__', str(NM))

feats = ''.join(f'''<div class="feature in-view"><div class="ft"><span class="num">{i + 1:02d}</span><h3>{t}</h3><p>{d}</p></div><div class="shot">{pic(k, t)}</div></div>''' for i, (k, t, d) in enumerate(FEATURES))
faq = ''.join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q, a in FAQ)
walls = ''.join(f'<img src="img/wall-{w}.webp" width="640" height="360" alt="{w.title()} wallpaper" loading="lazy" decoding="async">' for w in ['original', 'aurora', 'ember', 'lilac', 'ocean', 'citrus'])
logos = '<small>Built on</small>' + ''.join(f'<span class="lg">{ic(i, 26, 2)}{n}</span>' for i, n in STACK)

HTML = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>NOVA OS: your computer, finally yours</title>
<meta name="description" content="NOVA OS is a privacy-first Linux desktop. Beautiful by default, light on old PCs, and it never watches you. Coming soon.">
<meta name="theme-color" content="#050505">
<meta property="og:title" content="NOVA OS"><meta property="og:description" content="Your computer. Finally yours."><meta property="og:image" content="https://byeno.org/media/hero-start.webp">
<link rel="icon" href="favicon.png">
<link rel="preload" href="fonts/manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="frames/d/000.webp" as="image" media="(min-aspect-ratio: 11/10)">
<link rel="preload" href="frames/m/000.webp" as="image" media="(max-aspect-ratio: 11/10)">
<style>{CSS}</style>
</head>
<body>
<div class="scrub">
 <div class="stage">
  <div class="plate"><picture><source media="(max-aspect-ratio: 11/10)" srcset="frames/m/000.webp"><img class="still" src="frames/d/000.webp" alt="" aria-hidden="true"></picture><canvas id="film" aria-hidden="true"></canvas></div>
  <div class="dim"></div>
  <div class="beats">{BEATS}</div>
  <header>
   <a class="brand" href="./" aria-label="Home">{STAR}</a>
   <nav class="links" aria-label="Primary"><a href="#about">About</a><a href="#features">Features</a><a href="#faq">FAQ</a><a href="#follow">Follow</a></nav>
   <a class="pill pill-nav" href="#follow"><span>Get notified</span></a>
   <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><i></i><i></i></button>
  </header>
  <main class="hero">
   <h1 class="headline rv d1"><span>Your computer.</span> <span>Finally yours.</span></h1>
   <p class="sub rv d2"><span>A privacy-first Linux desktop. Beautiful by default,</span> <span>light on old PCs, and it never watches you.</span></p>
   <div class="acts rv d3"><a class="pill pill-cta rv d3" href="#follow"><span>Get notified</span></a><a class="ghost rv d3" href="{CONFIG['youtube']}" rel="noopener">Watch the videos</a></div>
  </main>
  <div class="logos rv d4" aria-label="Built on">{logos}</div>
  <div class="hint" aria-hidden="true">Scroll<i></i></div>
 </div>
</div>
<nav class="menu" id="menu" aria-hidden="true"><div class="menu-inner">
 <p class="menu-eyebrow rvm">Menu</p>
 <ul><li class="rvm"><a href="#about">About</a></li><li class="rvm"><a href="#features">Features</a></li><li class="rvm"><a href="#faq">FAQ</a></li><li class="rvm"><a href="#follow">Follow</a></li></ul>
 <div class="menu-foot rvm"><a class="pill" href="#follow"><span>Get notified</span></a><a class="ghost" style="position:static;font-size:17px" href="{CONFIG['youtube']}" rel="noopener">Watch the videos</a></div>
</div></nav>

<section id="about" class="statement"><div class="wrap in-view">
 <p class="eyebrow">About</p>
 <h2>An operating system that works for you. <em>No account. No ads. No tracking. Nothing watching.</em></h2>
 <p class="lead">NOVA OS is built by one developer, for myself first, and shared with everyone who loves privacy. Arch Linux underneath, a fast glass desktop on top.</p>
</div></section>

<section id="features" style="padding-top:40px"><div class="wrap">
 <p class="eyebrow in-view">Features</p>
 {feats}
 <div class="feature in-view" style="grid-template-columns:1fr"><div class="ft"><span class="num">07</span><h3>Six wallpapers. Your colour follows.</h3><p>Pick a wallpaper and toggles, highlights and links all match it.</p><div class="walls">{walls}</div></div></div>
</div></section>

<section id="status" style="padding-top:40px"><div class="wrap in-view">
 <p class="eyebrow">Honest status</p>
 <h2>Where NOVA is right now.</h2>
 <div class="status">
  <div class="st on">Design <span>Done · 100+ screens</span></div>
  <div class="st on"><b style="font-weight:400"><i class="now"></i>Desktop</b> <span>Being built now</span></div>
  <div class="st">Installer <span>Next</span></div>
  <div class="st">Beta <span>After that</span></div>
 </div>
 <p class="lead">The pictures and videos so far show the designs. Real footage is coming as soon as the desktop is ready.</p>
</div></section>

<section id="faq" style="padding-top:40px"><div class="wrap in-view">
 <p class="eyebrow">FAQ</p><h2>Questions people ask.</h2>
 <div class="faq">{faq}</div>
</div></section>

<section id="follow" class="follow"><div class="wrap in-view">
 <div style="width:56px;height:56px;margin:0 auto 28px">{STAR.replace('id="sg"', 'id="sg2"').replace('url(#sg)', 'url(#sg2)')}</div>
 <h2>Be there on day one.</h2>
 <p class="lead" style="margin-inline:auto">Building an OS alone isn't fast, but I'm doing it properly. Follow along and you'll know the moment NOVA is ready.</p>
 <div class="row"><a class="pill" href="{CONFIG['youtube']}" rel="noopener"><span>YouTube</span></a><a class="line" href="{CONFIG['tiktok']}" rel="noopener" style="padding:0 28px;height:52px;font-size:17px">TikTok</a><a class="line" href="{CONFIG['x']}" rel="noopener" style="padding:0 28px;height:52px;font-size:17px">X</a></div>
</div></section>

<footer><div class="wrap"><span>© NOVA OS · Built by one developer</span><nav><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></nav></div></footer>
<script>{JS}</script>
</body>
</html>'''
open(os.path.join(HERE, 'index.html'), 'w').write(HTML)
import markdown
LCSS = CSS + ".legal{max-width:760px;padding:120px 0 120px}.legal h1{font-size:clamp(40px,6vw,64px);font-weight:400;margin:0}.legal h2{font-size:26px;margin-top:44px}.legal p,.legal li{color:var(--muted);line-height:1.65;font-size:17px}.legal strong{color:var(--ink)}.legal code{font-size:15px;background:rgba(255,255,255,.07);padding:2px 6px;border-radius:6px}.back{position:fixed;left:24px;top:22px;display:flex;align-items:center;gap:10px;font-size:15px;color:var(--nav);z-index:3}.back span{width:28px;height:28px;display:block}"
SITE_PRIVACY = "<h2>This website</h2><p>byeno.org uses <strong>no cookies, no analytics and no trackers</strong>, and loads no third-party scripts or fonts. Like any web server, the server that hosts this site may keep short-lived access logs (IP address, time, page requested) to keep it running.</p>"
for md_file, title, out, extra in [('PRIVACY.md', 'Privacy Policy', 'privacy.html', SITE_PRIVACY), ('TERMS.md', 'Terms', 'terms.html', '')]:
    body = markdown.markdown(open(os.path.join(HERE, '..', 'nova-legal', md_file)).read())
    page = f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{title}: NOVA OS</title><link rel="icon" href="favicon.png"><style>{LCSS}</style></head><body><a class="back" href="./"><span>{STAR}</span>NOVA OS</a><div class="wrap legal">{body}{extra}</div><footer><div class="wrap"><span>© NOVA OS</span><nav><a href="./">Home</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></nav></div></footer></body></html>'
    open(os.path.join(HERE, out), 'w').write(page)
print('built privacy.html, terms.html')
print('built index.html', len(HTML) // 1024, 'KB', ND, 'desktop frames', NM, 'phone frames')
