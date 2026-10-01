"""Builds the NOVA icon set: Lucide (ISC) + NOVA's own icons, tags, a freedesktop symbolic theme and a gallery."""
import json, os, re, shutil, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
LUC = '/home/user/random/nova-os/node_modules/lucide-static/'
SVG = os.path.join(HERE, 'svg')
HEAD = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'

def inner(name):
    s = open(f'{SVG}/{name}.svg').read()
    return re.sub(r'\s+', ' ', s[s.index('>', s.index('<svg')) + 1: s.rindex('</svg>')].strip())

# 1. Lucide, cleaned (no class attribute, one line)
shutil.rmtree(SVG, ignore_errors=True); os.makedirs(SVG)
for f in sorted(os.listdir(LUC + 'icons')):
    s = open(LUC + 'icons/' + f).read()
    s = re.sub(r'<!--.*?-->', '', s, flags=re.S)
    body = re.sub(r'\s+', ' ', s[s.index('>', s.index('<svg')) + 1: s.rindex('</svg>')].strip())
    open(f'{SVG}/{f}', 'w').write(HEAD + body + '</svg>\n')
tags = json.load(open(LUC + 'tags.json'))

# 2. NOVA icons. The star is drawn by hand; the rest follow Lucide's own badge rule:
#    base icon, a round cut-out at the bottom right, and a small badge glyph in it (same 2px line).
STAR = 'M12 2.5c.7 5.6 3.4 8.3 9 9-5.6.7-8.3 3.4-9 9-.7-5.6-3.4-8.3-9-9 5.6-.7 8.3-3.4 9-9z'
def star_glyph(): return f'<path d="{STAR}"/>'
nova = {}
nova['nova-star'] = (HEAD + star_glyph() + '</svg>', ['nova', 'logo', 'brand', 'star', 'sparkle'])
nova['nova-star-fill'] = (HEAD.replace('fill="none"', 'fill="currentColor"') + star_glyph() + '</svg>', ['nova', 'logo', 'brand', 'filled'])
# ACE: the star inside a chat bubble
nova['nova-ace'] = (HEAD + '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/><path d="M12 7.5c.35 2.6 1.6 3.85 4.2 4.2-2.6.35-3.85 1.6-4.2 4.2-.35-2.6-1.6-3.85-4.2-4.2 2.6-.35 3.85-1.6 4.2-4.2z"/></svg>',
                    ['ace', 'ai', 'assistant', 'chat', 'pro'])
nova['nova-shield'] = (HEAD + '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>'
                       '<path d="M12 7.5c.35 2.6 1.6 3.85 4.2 4.2-2.6.35-3.85 1.6-4.2 4.2-.35-2.6-1.6-3.85-4.2-4.2 2.6-.35 3.85-1.6 4.2-4.2z"/></svg>', ['shield', 'privacy', 'nova'])

def badge(name, base, glyph, tg):
    g = star_glyph() if glyph == 'star' else inner(glyph)
    m = f'm-{name}'
    s = (HEAD + f'<mask id="{m}"><rect width="24" height="24" fill="#fff" stroke="none"/><circle cx="18" cy="18" r="7.2" fill="#000" stroke="none"/></mask>'
         f'<g mask="url(#{m})">{inner(base)}</g>'
         f'<g transform="translate(12.6 12.6) scale(0.45)" stroke-width="4.44">{g}</g></svg>')
    nova[name] = (s, tg)

B = [  # name, base, badge, tags
 ('nova-launcher', 'search', 'star', ['launcher', 'search', 'spotlight']),
 ('nova-ace-command', 'square-terminal', 'star', ['ace', 'command', 'run']),
 ('nova-ace-screen', 'monitor', 'star', ['ace', 'screen', 'see']),
 ('nova-guard', 'bug', 'shield', ['antivirus', 'guard', 'malware']),
 ('nova-realtime-protection', 'activity', 'shield', ['real-time', 'antivirus']),
 ('nova-threat-definitions', 'database', 'refresh-cw', ['definitions', 'update', 'antivirus']),
 ('nova-quarantine', 'archive', 'lock', ['quarantine', 'threat']),
 ('nova-vpn-kill-switch', 'globe', 'power', ['vpn', 'kill switch']),
 ('nova-ip-randomizer', 'globe', 'shuffle', ['ip', 'random']),
 ('nova-mac-randomizer', 'network', 'shuffle', ['mac', 'address', 'random']),
 ('nova-tor-per-app', 'app-window', 'eye-off', ['tor', 'onion', 'app']),
 ('nova-private-dns', 'server', 'lock', ['dns', 'private']),
 ('nova-network-watch', 'network', 'eye', ['network', 'watch', 'monitor']),
 ('nova-camera-kill', 'camera', 'power', ['camera', 'kill switch', 'webcam']),
 ('nova-mic-kill', 'mic', 'power', ['microphone', 'kill switch']),
 ('nova-usb-detect', 'usb', 'bell', ['usb', 'detect', 'alert']),
 ('nova-usb-lock', 'usb', 'lock', ['usb', 'unplug', 'lock']),
 ('nova-disk-cleaner', 'hard-drive', 'sparkle', ['disk', 'clean']),
 ('nova-secure-delete', 'file', 'x', ['shred', 'delete']),
 ('nova-clipboard-autoclear', 'clipboard', 'timer', ['clipboard', 'clear']),
 ('nova-metadata-wipe', 'image', 'eraser', ['metadata', 'exif', 'wipe']),
 ('nova-decoy-login', 'user', 'eye-off', ['decoy', 'login']),
 ('nova-guest-mode', 'user', 'door-open', ['guest']),
 ('nova-boot-tamper', 'power', 'shield', ['boot', 'secure boot', 'tamper']),
 ('nova-sandbox', 'box', 'shield', ['sandbox', 'isolation']),
 ('nova-no-tracking', 'radar', 'x', ['tracking', 'telemetry']),
 ('nova-night-schedule', 'moon', 'clock', ['night mode', 'schedule']),
 ('nova-accent-match', 'palette', 'image', ['accent', 'wallpaper', 'colour']),
 ('nova-ledger-lock', 'credit-card', 'lock', ['card', 'lock', 'ledger']),
 ('nova-ledger-ask', 'credit-card', 'bell', ['card', 'ask', 'approve']),
 ('nova-ledger-hide', 'credit-card', 'eye-off', ['card', 'hide number']),
 ('nova-checkup', 'stethoscope', 'check', ['fix', 'checkup', 'health']),
 ('nova-package-update', 'package', 'arrow-up', ['update', 'pacman']),
 ('nova-boot-repair', 'power', 'wrench', ['boot', 'repair']),
 ('nova-audio-repair', 'volume-2', 'wrench', ['audio', 'repair']),
 ('nova-display-repair', 'monitor', 'wrench', ['display', 'repair']),
 ('nova-network-repair', 'wifi', 'wrench', ['network', 'repair']),
 ('nova-process-end', 'cpu', 'x', ['process', 'kill', 'end']),
 ('nova-temp-ok', 'thermometer', 'check', ['temperature', 'ok']),
 ('nova-fan-quiet', 'fan', 'check', ['fan', 'quiet']),
 ('nova-drive-eject', 'hard-drive', 'arrow-up', ['eject', 'drive']),
 ('nova-workspace-new', 'layout-grid', 'plus', ['workspace', 'new']),
]
for n, b, g, tg in B: badge(n, b, g, tg)
for n, (s, tg) in nova.items():
    open(f'{SVG}/{n}.svg', 'w').write(s + '\n'); tags[n] = tg
json.dump(tags, open(os.path.join(HERE, 'tags.json'), 'w'), indent=1)

# 3. freedesktop symbolic theme (fills only, so GTK/Qt can recolour them)
MAP = json.load(open(os.path.join(HERE, 'freedesktop-map.json')))
TH = os.path.join(HERE, 'NOVA-icons'); shutil.rmtree(TH, ignore_errors=True)
os.makedirs(f'{TH}/symbolic/apps'); os.makedirs(f'{TH}/symbolic/status')
open(f'{TH}/index.theme', 'w').write('[Icon Theme]\nName=NOVA\nComment=NOVA OS icons (Lucide + NOVA)\nInherits=Adwaita,hicolor\nDirectories=symbolic/apps,symbolic/status\n\n'
    '[symbolic/apps]\nContext=Applications\nSize=16\nMinSize=8\nMaxSize=512\nType=Scalable\n\n[symbolic/status]\nContext=Status\nSize=16\nMinSize=8\nMaxSize=512\nType=Scalable\n')
tmp = os.path.join(HERE, '.tmp.svg')
for fd, ours in MAP.items():
    src = open(f'{SVG}/{ours}.svg').read().replace('currentColor', '#2e3436')
    if '<mask' in src:  # picosvg can't do masks: use the base icon for the symbolic version
        src = src[:src.index('<mask')] + inner(next(b for n, b, g, t in B if n == ours)).replace('currentColor', '#2e3436') + '</svg>'
        src = src.replace('stroke="currentColor"', 'stroke="#2e3436"')
    open(tmp, 'w').write(src)
    out = subprocess.run(['picosvg', tmp], capture_output=True, text=True).stdout
    ctx = 'status' if any(k in fd for k in ('network', 'battery', 'audio-volume', 'bluetooth', 'microphone', 'camera', 'weather', 'night', 'notifications', 'airplane', 'display-brightness', 'security', 'system-')) else 'apps'
    open(f'{TH}/symbolic/{ctx}/{fd}-symbolic.svg', 'w').write(out)
os.remove(tmp)
print(len(os.listdir(SVG)), 'icons;', len(MAP), 'theme icons')
