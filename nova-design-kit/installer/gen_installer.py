"""Generates the install experience (screens/boot-*.html, screens/install-*.html): boot splash, Try or Install,
checks, disk, encryption, confirm, progress, done, error, and the disk-password screen on every boot after.
Uses the setup wizard's window, rail and controls so install → first boot → setup feel like one flow."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))

src = open(os.path.join(HERE, '..', 'setup', 'gen_setup.py')).read()
SU = {'__file__': os.path.join(HERE, '..', 'setup', 'gen_setup.py')}
exec(src[:src.index('\nS = {}')], SU)
ic, A, page = SU['ic'], SU['A'], SU['page']
SU['CSS'] += '.btn{white-space:nowrap}'

STEPS = [('Before you start', 'list-checks'), ('Where to install', 'hard-drive'), ('Encryption', 'key-round'), ('Confirm', 'circle-check'), ('Install', 'download')]

def rail(now):
    h = ''
    for i, (name, _) in enumerate(STEPS):
        cls = 'done' if i < now else 'now' if i == now else ''
        n = ic('check', 14, 3) if i < now else str(i + 1)
        h += f'<div class="step {cls}"{" aria-current=step" if i == now else ""}><span class="n">{n}</span>{name}</div>'
    return (f'<div class="side"><div class="brand"><img src="{A}nova-star.png" alt=""><div><b>Install NOVA</b><span>NOVA OS 1.0 beta</span></div></div>'
            f'{h}<div class="foot">{ic("life-buoy", 15)}Help<span style="margin-left:auto">{ic("accessibility", 15)}</span></div></div>')

def live_bar():   # the live session's top bar: you're running from the USB
    return (f'<div style="position:absolute;left:15px;right:15px;top:9px;display:flex;justify-content:space-between;z-index:3">'
            f'<div style="height:36px;border-radius:12px;background:#101013;border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:8px;padding:0 14px;font-size:13px;font-weight:600;color:#e4e4e7">{ic("usb", 15)}Running from USB · nothing is saved</div>'
            f'<div style="height:36px;border-radius:12px;background:#101013;border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:12px;padding:0 14px;font-size:13px;font-weight:600;color:#e4e4e7">{ic("wifi", 16)}{ic("volume-2", 16)}<span style="display:flex;align-items:center;gap:5px">{ic("battery-charging", 18)}64%</span>14:22</div></div>')

def win(now, title, sub, body, cont='Continue', back=True, extra='', pri_style=''):
    nav = (f'<div class="nav">{"<span class=btn>" + ic("arrow-left", 16) + "Back</span>" if back else ""}'
           f'<span style="margin-left:auto"></span>{extra}' + (f'<span class="btn pri" style="{pri_style}">{cont}{ic("arrow-right", 16)}</span>' if cont else '') + '</div>')
    return (live_bar() + f'<div class="win" role="dialog" aria-label="Install NOVA">{rail(now)}<div class="main">'
            f'<div class="kick">Step {now + 1} of {len(STEPS)}</div><h1>{title}</h1><p class="sub">{sub}</p>'
            f'<div class="body">{body}</div>{nav}</div></div>')

BLACK = '<style>.wall,.dim{display:none}.frame{background:#000}</style>'
S = {}

# 0. Boot splash: the same screen on the USB and on every normal boot
S['boot-splash'] = ('Boot splash', BLACK + f'''
<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
 <img src="{A}nova-star.png" alt="" style="width:132px;height:110px;object-fit:contain;margin-top:-40px">
 <div style="margin-top:70px;width:160px;height:3px;border-radius:2px;background:rgba(255,255,255,.12);overflow:hidden"><i style="display:block;width:58%;height:100%;background:#f2f2f4;border-radius:2px"></i></div>
</div>''')

# 1. Try or install
def choice(icon, title, sub, points, pri=False):
    pts = ''.join(f'<div style="display:flex;gap:9px;align-items:center;font-size:14px;color:#cdcdd2">{ic("check", 15, 2.5)}{p}</div>' for p in points)
    bg = 'background:#f2f2f4;color:#0b0b0e' if pri else 'background:rgba(14,14,18,.86);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(40px)'
    pc = '#3a3a40' if pri else '#cdcdd2'
    return (f'<div style="width:400px;border-radius:24px;{bg};padding:28px;box-sizing:border-box;display:flex;flex-direction:column;gap:14px">'
            f'<div style="width:56px;height:56px;border-radius:16px;background:{"#0b0b0e;color:#f2f2f4" if pri else "rgba(255,255,255,.08)"};display:flex;align-items:center;justify-content:center">{ic(icon, 26)}</div>'
            f'<div style="font-size:26px;font-weight:700">{title}</div><div style="font-size:15px;line-height:1.5;color:{"#3a3a40" if pri else "#a1a1aa"};margin-top:-6px">{sub}</div>'
            f'<div style="display:flex;flex-direction:column;gap:8px;color:{pc}">{pts.replace("#cdcdd2", pc)}</div>'
            f'<span class="btn{"" if pri else ""}" style="margin-top:6px;justify-content:center;height:48px;{"background:#0b0b0e;color:#f2f2f4;border:0" if pri else ""}">{title}{ic("arrow-right", 16)}</span></div>')
S['install-try'] = ('Install: try or install', live_bar() + f'''
<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;z-index:2">
 <img src="{A}nova-star.png" alt="" style="margin-top:118px;width:84px;height:70px;object-fit:contain">
 <div style="margin-top:22px;font-size:52px;font-weight:700;letter-spacing:-.02em">Hi, this is NOVA.</div>
 <div style="margin-top:12px;font-size:18px;color:rgba(255,255,255,.72)">Look around first, or install it now. You can still install after trying.</div>
 <div style="margin-top:40px;display:flex;gap:22px">
  {choice("monitor-play", "Try NOVA", "Runs from the USB drive. Your computer stays exactly as it is.", ["Nothing on your disk changes", "Install any time from the desktop", "A bit slower than installed"])}
  {choice("download", "Install NOVA", "Put NOVA on this computer. It takes about 10 minutes.", ["Next to Windows, or on its own", "Encrypted by default", "We'll check everything first"], pri=True)}
 </div>
 <div style="margin-top:30px"><span class="btn" style="height:44px;border-radius:22px;background:rgba(255,255,255,.1)">{ic("globe", 17)}English (US){ic("chevron-down", 15)}</span></div>
</div>''')

# 2. Before you start
def check(state, title, sub, value=''):
    col = {'ok': ('rgba(52,199,89,.16)', '#5fdc86', 'check'), 'warn': ('rgba(245,146,30,.16)', '#ffae5a', 'triangle-alert'), 'info': ('var(--tint)', 'var(--acc-text)', 'info')}[state]
    return (f'<div class="row" style="min-height:66px"><span style="width:32px;height:32px;border-radius:16px;background:{col[0]};color:{col[1]};display:flex;align-items:center;justify-content:center;flex-shrink:0">{ic(col[2], 16, 2.5)}</span>'
            f'<div style="flex:1"><div class="t1">{title}</div><div class="t2">{sub}</div></div><span style="font-size:14px;font-weight:600;color:{col[1]}">{value}</span></div>')
S['install-checks'] = ('Install: before you start', win(0, 'Before you start', 'A quick check that this PC is ready. Nothing has changed on your computer yet.', f'''
<div style="display:flex;gap:20px">
 <div class="card" style="flex:1;padding:4px 20px">
  {check("ok", "Enough space", "NOVA needs at least 40 GB", "512 GB found")}
  {check("ok", "Memory", "4 GB or more", "16 GB")}
  {check("warn", "Plug in your charger", "Installing on battery can stop halfway if it runs out", "64%")}
  {check("ok", "Internet", "Optional. Used for the latest updates only", "Connected")}
  {check("ok", "Secure Boot", "NOVA is signed, so it can stay on", "On")}
 </div>
 <div style="width:300px;display:flex;flex-direction:column;gap:12px">
  <div style="padding:20px;border-radius:18px;background:rgba(245,146,30,.10);border:1px solid rgba(245,146,30,.24)">
   <div style="display:flex;align-items:center;gap:10px;color:#ffae5a;font-size:15px;font-weight:700">{ic("save", 18)}A friendly note</div>
   <div class="t2" style="font-size:14px;margin-top:8px;line-height:1.5;color:#cdcdd2">We suggest backing up your important files before installing. NOVA is still in beta, so please install at your own risk.</div></div>
  <div class="t2" style="display:flex;gap:8px;padding:0 4px">{ic("file-text", 15)}<span>By continuing you agree to the <span class="link" style="font-size:13px">terms</span>.</span></div>
 </div></div>'''))

# 3. Where to install: alongside Windows, with the split slider
def opt(icon, title, sub, sel=False, tag=''):
    b = 'border:2px solid var(--acc);padding:15px 17px;background:var(--sel)' if sel else 'border:1px solid rgba(255,255,255,.07);padding:16px 18px;background:rgba(255,255,255,.04)'
    radio = (f'<span style="width:20px;height:20px;border-radius:10px;border:{"6px solid var(--acc)" if sel else "2px solid rgba(255,255,255,.25)"};box-sizing:border-box;flex-shrink:0;background:{"#fff" if sel else "transparent"}"></span>')
    return (f'<div style="border-radius:16px;{b};display:flex;align-items:center;gap:14px;box-sizing:border-box">{radio}<div class="tile">{ic(icon, 18)}</div>'
            f'<div style="flex:1"><div class="t1">{title} {tag}</div><div class="t2">{sub}</div></div></div>')
split = f'''<div class="card" style="padding:18px 20px">
 <div style="display:flex;align-items:center;gap:10px"><span style="color:#a1a1aa;display:flex">{ic("hard-drive", 17)}</span><span class="t1" style="font-size:14px">NVMe SSD · 512 GB</span><span class="t2" style="margin:0 0 0 auto">Drag to choose how much NOVA gets</span></div>
 <div style="position:relative;margin-top:16px;height:44px;display:flex;gap:4px">
  <div style="width:43%;border-radius:12px 4px 4px 12px;background:rgba(255,255,255,.10);display:flex;flex-direction:column;justify-content:center;padding:0 14px;box-sizing:border-box">
   <div style="font-size:13px;font-weight:600">Windows</div><div style="font-size:12px;color:#a1a1aa" class="mono">220 GB · 96 GB used</div></div>
  <div style="flex:1;border-radius:4px 12px 12px 4px;background:var(--acc);display:flex;flex-direction:column;justify-content:center;padding:0 14px;box-sizing:border-box;color:#fff">
   <div style="font-size:13px;font-weight:700">NOVA</div><div style="font-size:12px;opacity:.85" class="mono">292 GB</div></div>
  <span style="position:absolute;left:calc(43% - 9px);top:-6px;width:18px;height:56px;border-radius:9px;background:#f2f2f4;display:flex;align-items:center;justify-content:center;color:#0b0b0e">{ic("grip-vertical", 14)}</span>
 </div>
 <div class="t2" style="margin-top:12px;display:flex;gap:8px;align-items:center">{ic("info", 14)}Windows keeps all its files. It just gets smaller.</div></div>'''
S['install-disk'] = ('Install: where to install', win(1, 'Where should NOVA go?', 'We found Windows on this computer. Pick how NOVA should share the disk.', f'''
<div style="display:flex;flex-direction:column;gap:10px">
 {opt("columns-2", "Install next to Windows", "Choose which one to start each time you turn on the PC.", sel=True, tag='<span class="chip a" style="height:22px;font-size:11px;margin-left:6px">Recommended</span>')}
 {split}
 {opt("eraser", "Erase the disk and install NOVA", "Removes Windows and all files on this disk.")}
 {opt("sliders-vertical", "Manual", "Make your own partitions. For experts.")}
</div>'''))

# 4. Encryption + recovery key
key = 'K7QF-2M9X-RT4B-WN8D-6HJP-3CZL'
S['install-encrypt'] = ('Install: encryption', win(2, 'Lock your disk', "Encryption scrambles everything on the disk. Without the password, it's unreadable, even if someone takes the drive out.", f'''
<div style="display:flex;gap:20px">
 <div style="flex:1;display:flex;flex-direction:column;gap:14px">
  <div class="card" style="padding:2px 18px"><div class="row" style="min-height:62px"><div class="tile g">{ic("key-round", 18)}</div><div><div class="t1">Encrypt the disk</div><div class="t2">Recommended. You type the password when the PC starts.</div></div><div class="tog on g"></div></div></div>
  <div><p class="flabel">Disk password</p><div class="field focus"><span style="letter-spacing:.3em">••••••••••••••</span><span style="margin-left:auto;color:#8d8d96;display:flex">{ic("eye", 17)}</span></div>
   <div style="display:flex;align-items:center;gap:12px;margin-top:10px"><div style="display:flex;gap:5px;width:180px">{''.join(f'<i style="flex:1;height:5px;border-radius:3px;background:{"#34c759" if k < 4 else "#3a3a40"}"></i>' for k in range(4))}</div><span style="font-size:13px;font-weight:600;color:#5fdc86">Very strong</span></div></div>
  <div><p class="flabel">Type it again</p><div class="field"><span style="letter-spacing:.3em">••••••••••••••</span><span style="margin-left:auto;color:#5fdc86;display:flex">{ic("check", 16)}</span></div></div>
 </div>
 <div style="width:320px;padding:20px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);box-sizing:border-box">
  <div style="display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700">{ic("life-buoy", 18)}Your recovery key</div>
  <div class="t2" style="margin-top:6px;line-height:1.5">If you forget the password, this key is the only way back in. We can't recover it for you.</div>
  <div class="mono" style="margin-top:14px;padding:14px;border-radius:12px;background:#0b0b0e;border:1px solid rgba(255,255,255,.08);font-size:16px;line-height:1.7;letter-spacing:.06em;text-align:center">{key[:14]}<br>{key[15:]}</div>
  <div style="display:flex;gap:8px;margin-top:12px"><span class="btn" style="flex:1;justify-content:center;height:36px;font-size:13px">{ic("usb", 15)}Save to USB</span><span class="btn" style="flex:1;justify-content:center;height:36px;font-size:13px">{ic("qr-code", 15)}Show QR</span></div>
  <div style="display:flex;align-items:center;gap:10px;margin-top:14px;font-size:13px;font-weight:600"><span style="width:20px;height:20px;border-radius:6px;background:var(--acc);display:flex;align-items:center;justify-content:center">{ic("check", 13, 3)}</span>I saved it somewhere safe</div>
 </div></div>'''))

# 5. Confirm: the one screen that must be impossible to misread
def what(icon, col, t, s):
    return f'<div class="row" style="min-height:62px"><div class="tile" style="background:{col[0]};color:{col[1]}">{ic(icon, 18)}</div><div><div class="t1">{t}</div><div class="t2">{s}</div></div></div>'
S['install-confirm'] = ('Install: confirm', win(3, 'Ready to install', 'Check this once more. Nothing changes on your computer until you press Install.', f'''
<div style="display:flex;gap:20px">
 <div class="card" style="flex:1;padding:4px 20px">
  {what("shrink", ("rgba(245,146,30,.14)", "#ffae5a"), "Windows shrinks from 512 GB to 220 GB", "All its files and apps stay. This takes the longest.")}
  {what("hard-drive-download", ("var(--tint)", "var(--acc-text)"), "NOVA gets 292 GB", "New space on NVMe SSD · 512 GB")}
  {what("key-round", ("rgba(52,199,89,.14)", "#5fdc86"), "Encrypted with your disk password", "Recovery key saved")}
  {what("power", ("var(--tint)", "var(--acc-text)"), "Choose Windows or NOVA when the PC starts", "NOVA is picked after 5 seconds")}
 </div>
 <div style="width:300px;display:flex;flex-direction:column;gap:12px">
  <div class="card" style="padding:18px 20px"><p class="lbl">Disk after install</p>
   <div style="display:flex;gap:3px;height:16px"><i style="width:43%;border-radius:5px 2px 2px 5px;background:rgba(255,255,255,.18)"></i><i style="flex:1;border-radius:2px 5px 5px 2px;background:var(--acc)"></i></div>
   <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:#a1a1aa"><span>Windows · 220 GB</span><span>NOVA · 292 GB</span></div></div>
  <div style="padding:16px 18px;border-radius:18px;background:rgba(245,146,30,.10);border:1px solid rgba(245,146,30,.24);display:flex;gap:10px">
   <span style="color:#ffae5a;display:flex">{ic("triangle-alert", 18)}</span><div class="t2" style="margin:0;color:#cdcdd2;line-height:1.5">Keep the PC plugged in and don't turn it off until it's done.</div></div>
 </div></div>''', cont='Install NOVA'))

# 6. Installing: progress + a calm slideshow of what's coming
S['install-progress'] = ('Install: installing', win(4, 'Installing NOVA', "Sit back, this takes about 10 minutes. You can keep trying NOVA while it works.", f'''
<div style="display:flex;flex-direction:column;gap:18px">
 <div>
  <div style="display:flex;align-items:baseline;gap:12px"><span style="font-size:15px;font-weight:600">Copying NOVA</span><span class="t2" style="margin:0">step 3 of 5</span><span style="margin-left:auto;font-size:15px;font-weight:700" class="mono">64%</span></div>
  <div style="margin-top:10px;height:8px;border-radius:4px;background:rgba(255,255,255,.08);overflow:hidden"><i style="display:block;width:64%;height:100%;border-radius:4px;background:var(--acc)"></i></div>
  <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:13px;color:#8d8d96"><span>About 4 minutes left</span><span style="display:flex;align-items:center;gap:6px">{ic("chevron-down", 14)}Show details</span></div>
 </div>
 <div style="position:relative;height:250px;border-radius:18px;overflow:hidden">
  <img src="{A}wall-ocean.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.72),rgba(0,0,0,0) 70%)"></div>
  <div style="position:absolute;left:28px;top:50%;transform:translateY(-50%);max-width:330px">
   <div style="font-size:12px;font-weight:700;letter-spacing:.08em;color:rgba(255,255,255,.7)">COMING UP</div>
   <div style="font-size:26px;font-weight:700;margin-top:8px">Six wallpapers.<br>Your colour follows.</div>
   <div style="font-size:14px;color:rgba(255,255,255,.75);margin-top:8px">You'll pick one in a minute, right after the first restart.</div></div>
  <div style="position:absolute;right:20px;bottom:16px;display:flex;gap:6px">{''.join(f'<i style="width:{18 if k == 1 else 6}px;height:6px;border-radius:3px;background:{"#fff" if k == 1 else "rgba(255,255,255,.45)"}"></i>' for k in range(5))}</div>
 </div>
</div>''', cont='', back=False))

# 7. Done
S['install-done'] = ('Install: done', live_bar() + f'''
<div class="win" style="flex-direction:column;align-items:center;justify-content:center;text-align:center" role="dialog" aria-label="Install NOVA">
 <div style="width:96px;height:96px;border-radius:48px;background:rgba(52,199,89,.16);color:#5fdc86;display:flex;align-items:center;justify-content:center">{ic("check", 46, 2.5)}</div>
 <div style="margin-top:26px;font-size:40px;font-weight:700;letter-spacing:-.01em">NOVA is installed ✦</div>
 <div style="margin-top:12px;font-size:17px;color:#a1a1aa;line-height:1.5;max-width:560px">Restart, then take out the USB drive when the screen goes black. NOVA will greet you with a quick setup.</div>
 <div style="margin-top:30px;display:flex;align-items:center;gap:18px;padding:16px 22px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)">
  <span style="color:#a1a1aa;display:flex">{ic("usb", 22)}</span><span style="font-size:14px;color:#cdcdd2">Keep the USB drive. It's a handy rescue disk if anything goes wrong.</span></div>
 <div style="margin-top:34px;display:flex;gap:12px"><span class="btn" style="height:48px">Keep trying NOVA</span><span class="btn pri" style="height:48px;padding:0 24px">{ic("rotate-ccw", 16)}Restart now</span></div>
</div>''')

# 8. Error: calm, honest, with a way out
S['install-error'] = ('Install: error', live_bar() + f'''
<div class="win" style="flex-direction:column;align-items:center;justify-content:center;text-align:center" role="alertdialog" aria-label="Installation stopped">
 <div style="width:96px;height:96px;border-radius:48px;background:rgba(245,146,30,.16);color:#ffae5a;display:flex;align-items:center;justify-content:center">{ic("circle-alert", 44, 2.2)}</div>
 <div style="margin-top:26px;font-size:36px;font-weight:700;letter-spacing:-.01em">The install stopped</div>
 <div style="margin-top:12px;font-size:17px;color:#a1a1aa;line-height:1.5;max-width:600px">NOVA couldn't make space next to Windows, because Windows has fast startup turned on and is still holding the disk.</div>
 <div style="margin-top:22px;display:flex;align-items:center;gap:12px;padding:14px 20px;border-radius:16px;background:rgba(52,199,89,.10);border:1px solid rgba(52,199,89,.22)">
  <span style="color:#5fdc86;display:flex">{ic("shield-check", 20)}</span><span style="font-size:15px;font-weight:600">Nothing on your disk was changed. Windows is safe.</span></div>
 <div style="margin-top:20px;max-width:600px;text-align:left;padding:16px 20px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)">
  <div class="t1" style="font-size:14px">How to fix it</div>
  <div class="t2" style="line-height:1.7;margin-top:6px">1. Start Windows, open Power Options, and turn off <b style="color:#f2f2f4">Fast startup</b>.<br>2. Shut down Windows, then start from the NOVA USB again.</div></div>
 <div style="margin-top:28px;display:flex;gap:12px"><span class="btn" style="height:46px">{ic("save", 16)}Save the log to USB</span><span class="btn" style="height:46px">Go back</span><span class="btn pri" style="height:46px;padding:0 22px">{ic("rotate-ccw", 16)}Try again</span></div>
</div>''')

# 9. Every boot after: the disk password, on the boot splash
S['boot-unlock'] = ('Boot: disk password', BLACK + f'''
<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
 <img src="{A}nova-star.png" alt="" style="width:110px;height:92px;object-fit:contain;margin-top:-60px">
 <div style="margin-top:46px;font-size:17px;font-weight:600;color:#e4e4e7">Enter your disk password</div>
 <div style="margin-top:16px;width:320px;height:48px;border-radius:24px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;padding:0 6px 0 20px;box-sizing:border-box">
  <span style="flex:1;letter-spacing:.3em;font-size:18px">••••••••</span><span style="width:36px;height:36px;border-radius:18px;background:#f2f2f4;color:#0b0b0e;display:flex;align-items:center;justify-content:center">{ic("arrow-right", 18)}</span></div>
 <div style="margin-top:14px;font-size:13px;color:#6e6e77;display:flex;align-items:center;gap:6px">{ic("keyboard", 14)}English (US)</div>
</div>
<div style="position:absolute;bottom:34px;left:0;right:0;text-align:center;font-size:13px;color:#4a4a52">Forgot it? Use your recovery key: press <span class="kbd" style="color:#8d8d96">esc</span></div>''')

out = os.path.join(HERE, '..', 'screens')
for name, (title, inner) in S.items():
    open(os.path.join(out, name + '.html'), 'w').write(page(title, inner))
print(len(S), 'install screens')
