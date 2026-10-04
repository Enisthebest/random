"""Generates the extra ACE (Pro) screens: new chat, screen permission, command draft, message draft, permissions."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'apps2'))
import importlib.util
spec = importlib.util.spec_from_file_location('a2', os.path.join(HERE, '..', 'apps2', 'gen_apps2.py'))
# reuse the app CSS, top bar and icon helper without regenerating the other screens
src = open(os.path.join(HERE, '..', 'apps2', 'gen_apps2.py')).read().split('# ---- Terminal ----')[0]
ns = {'__file__': os.path.join(HERE, '..', 'apps2', 'gen_apps2.py')}; exec(src, ns)
ic, page, BASE_CSS = ns['ic'], ns['page'], ns['CSS']
A = '../assets/'

CSS = '''
.chat{flex:1;display:flex;flex-direction:column;min-width:0}
.msgs{flex:1;padding:28px 32px;display:flex;flex-direction:column;gap:16px;overflow:hidden}
.u{align-self:flex-end;max-width:62%;background:#2f7cf6;color:#fff;padding:11px 18px;border-radius:20px 20px 6px 20px;font-size:15px;line-height:1.5}
.a{display:flex;gap:14px;align-items:flex-start;max-width:78%}
.a .st{width:30px;height:30px;margin-top:6px;flex-shrink:0}
.ab{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);padding:11px 18px;border-radius:20px 20px 20px 6px;font-size:15px;line-height:1.5}
.draft{border-radius:18px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);padding:16px 18px;width:520px;box-sizing:border-box}
.dh{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;margin-bottom:12px}
.cmd{white-space:pre;font-family:"Geist Mono",monospace;font-size:13px;background:rgba(0,0,0,.35);border-radius:12px;padding:12px 14px;line-height:1.75;color:#d6d6db}
.cmd .c{color:#6e6e77}
.why{font-size:13px;color:#a1a1aa;margin-top:10px;display:flex;flex-direction:column;gap:6px}
.why span{display:flex;gap:8px;align-items:center}
.acts{display:flex;gap:10px;align-items:center;margin-top:14px}
.note{flex:1;font-size:12px;color:#8d8d96;display:flex;gap:6px;align-items:center}
.inp{margin:0 32px 26px;height:56px;border-radius:28px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);display:flex;align-items:center;padding:0 8px 0 24px;font-size:15px;color:#8d8d96;gap:10px}
.send{margin-left:auto;width:40px;height:40px;border-radius:20px;background:#f2f2f4;color:#0b0b0e;display:flex;align-items:center;justify-content:center}
.chips{display:flex;gap:10px;margin:0 32px 12px}
.chipb{height:34px;padding:0 16px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);font-size:14px;font-weight:600;display:flex;align-items:center}
.perm{border-radius:18px;background:#ececef;color:#111114;padding:18px;width:520px;box-sizing:border-box}
.perm .t{font-size:16px;font-weight:700}.perm .d{font-size:13px;color:#4a4a52;margin-top:4px;line-height:1.5}
.pb{height:40px;padding:0 18px;border-radius:12px;font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px}
.welcome{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding-bottom:20px}
.sugg{display:grid;grid-template-columns:repeat(2,300px);gap:12px;margin-top:30px}
.sg{border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);padding:14px 16px;display:flex;gap:12px;align-items:flex-start}
.sg b{display:block;font-size:14px;font-weight:600}.sg span{display:block;font-size:12px;color:#a1a1aa;margin-top:3px}
.sg .ti{width:34px;height:34px;border-radius:10px;background:rgba(59,139,255,.14);color:#6aa8ff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.pro{height:28px;padding:0 12px;border-radius:999px;background:rgba(245,146,30,.16);color:#ffae5a;font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px}
'''

def side(active):
    chats = [('Fix this error', 'message-circle'), ('Free up space', 'message-circle'), ('Message Sam', 'message-circle'), ('PC temperatures', 'message-circle')]
    h = (f'<aside class="side"><div class="app"><img src="{A}ace-logo.svg" alt="" style="width:34px;height:34px"><b>ACE</b></div>'
         f'<button class="nav{" on" if active == "new" else ""}">{ic("square-pen", 18)}New chat</button><div class="sec">Today</div>')
    h += ''.join(f'<button class="nav{" on" if active == n else ""}">{ic(i, 18)}{n}</button>' for n, i in chats)
    h += f'<div class="sec">Settings</div><button class="nav{" on" if active == "perm" else ""}">{ic("lock", 18)}Permissions &amp; model</button></aside>'
    return h

def head(title, sub='ACE runs on your device. It only sees what you allow.'):
    return f'<div class="head"><div><h1 class="h1">{title}</h1><p class="sub">{sub}</p></div><span class="pro">{ic("sparkles", 14)}Pro</span></div>'

STAR = f'<img class="st" src="{A}ace-logo.svg" alt="">'
def u(t): return f'<div class="u">{t}</div>'
def a(inner): return f'<div class="a">{STAR}<div style="display:flex;flex-direction:column;gap:10px">{inner}</div></div>'
def ab(t): return f'<div class="ab">{t}</div>'
INPUT = f'<div class="inp">Ask ACE anything<div class="send">{ic("arrow-up", 18)}</div></div>'
def chat(title, msgs, chips=''):
    return f'<div class="main">{head(title)}<div class="chat"><div class="msgs">{msgs}</div>{chips}{INPUT}</div></div>'

S = {}
# 1. new chat
sugg = ''.join(f'<div class="sg"><div class="ti">{ic(i, 17)}</div><div><b>{t}</b><span>{d}</span></div></div>' for i, t, d in [
    ('monitor', 'Explain what\'s on my screen', 'Asks before it looks'), ('hard-drive', 'Free up disk space', 'Shows the commands first'),
    ('message-circle', 'Message someone for me', 'You send the draft'), ('mail', 'Clean up my inbox', 'Sorts, never deletes without asking')])
welcome = (f'<div class="main">{head("New chat")}<div class="chat"><div class="welcome"><img src="{A}ace-happy.svg" alt="" style="width:110px;height:110px">'
           '<div style="font-size:30px;font-weight:700;letter-spacing:-.02em;margin-top:16px">What can I do for you?</div>'
           f'<div style="font-size:14px;color:#a1a1aa;margin-top:8px;display:flex;gap:6px;align-items:center">{ic("shield-check", 15)}Everything stays on this device</div>'
           f'<div class="sugg">{sugg}</div></div>{INPUT}</div></div>')
S['ace-new'] = ('ACE: new chat', side('new') + welcome)

# 2. screen permission
perm_card = (f'<div class="perm"><div style="display:flex;gap:12px;align-items:flex-start">{ic("monitor", 22)}<div style="flex:1"><div class="t">Let ACE see your screen once?</div>'
             '<div class="d">ACE will look at what\'s on your screen right now to read the error. The image stays on this device and is deleted after this answer.</div></div></div>'
             f'<div style="display:flex;gap:10px;margin-top:16px"><span class="pb" style="background:#111114;color:#fff">{ic("eye", 16)}Allow once</span><span class="pb" style="background:rgba(0,0,0,.07)">Don\'t allow</span></div></div>')
msgs = u('What does this error on my screen mean?') + a(ab('I can read it for you, but I need to see your screen first.') + perm_card)
S['ace-screen'] = ('ACE: screen permission', side('Fix this error') + chat('Fix this error', msgs))

# 3. command draft
cmd = (f'<div class="draft"><div class="dh">{ic("square-terminal", 17)}Commands to run<span style="margin-left:auto;font-size:12px;color:#5fdc86;font-weight:600">Frees about 6.8 GB</span></div>'
       '<div class="cmd"><span class="c"># remove old package versions, keep the last 2</span>\nsudo paccache -rk2\n<span class="c"># clear thumbnail cache</span>\nrm -rf ~/.cache/thumbnails/*\n<span class="c"># shrink system logs to 200 MB</span>\nsudo journalctl --vacuum-size=200M</div>'
       '<div class="why"><span>' + ic('check', 14) + 'Your files, photos and apps are not touched</span><span>' + ic('info', 14) + 'Needs your password for the sudo lines</span></div>'
       f'<div class="acts"><span class="note">{ic("lock", 13)}Nothing runs until you press Run</span><span class="btn">Edit</span><span class="btn pri">Run {ic("play", 14)}</span></div></div>')
msgs = u('My disk is almost full, can you free up some space?') + a(ab('Your disk is 94% full. These three are safe to clean and free about 6.8 GB:') + cmd)
S['ace-command'] = ('ACE: command draft', side('Free up space') + chat('Free up space', msgs))

# 4. message draft
mdraft = (f'<div class="draft"><div class="dh">{ic("message-circle", 17)}Draft message<span style="margin-left:auto;font-size:12px;color:#a1a1aa;font-weight:500">To <b style="color:#f2f2f4">Sam</b> · Messages</span></div>'
          '<div style="font-size:15px;line-height:1.55;background:rgba(0,0,0,.25);border-radius:12px;padding:12px 14px">Hey Sam! Running about 15 minutes late, the bus is stuck in traffic. Save me a seat? 🙏</div>'
          f'<div class="acts"><span class="note">{ic("lock", 13)}You send it. ACE never sends on its own.</span><span class="btn">Edit</span><span class="btn pri">Send {ic("send", 14)}</span></div></div>')
msgs = u('Tell Sam I\'ll be 15 min late, bus is stuck') + a(ab('Here\'s a draft. Change anything you like.') + mdraft)
chips = '<div class="chips"><span class="chipb">Make it shorter</span><span class="chipb">More formal</span><span class="chipb">Add an apology</span></div>'
S['ace-message'] = ('ACE: message draft', side('Message Sam') + chat('Message Sam', msgs, chips))

# 5. permissions & model
def prow(icon, t, d, ctrl):
    return f'<div class="row">{ic(icon, 18)}<div class="rt"><b>{t}</b><span>{d}</span></div>{ctrl}</div>'
seg = lambda opts, on: '<div style="display:flex;background:rgba(255,255,255,.06);border-radius:10px;padding:3px;gap:2px">' + ''.join(
    f'<span style="padding:6px 12px;border-radius:8px;font-size:13px;font-weight:600;{"background:#f2f2f4;color:#0b0b0e" if o == on else "color:#a1a1aa"}">{o}</span>' for o in opts) + '</div>'
tog = lambda on: f'<span class="tog{" on" if on else ""}"><span></span></span>'
access = (f'<div class="card"><p class="label">What ACE can use</p>'
          + prow('monitor', 'Your screen', 'Only when you allow it, one look at a time', seg(['Ask first', 'Never'], 'Ask first'))
          + prow('square-terminal', 'Run commands', 'Shows a draft; runs only when you press Run', seg(['Ask first', 'Never'], 'Ask first'))
          + prow('message-circle', 'Messages', 'Writes drafts; you always send', seg(['Drafts only', 'Off'], 'Drafts only'))
          + prow('folder', 'Files', 'Documents and Downloads', f'<span class="btn">Choose folders</span>')
          + prow('globe', 'Web search', 'Private search, no account, no history kept', tog(True)) + '</div>')
model = (f'<div class="card"><p class="label">Model</p><div style="display:flex;align-items:center;gap:16px">'
         f'<div style="width:52px;height:52px;border-radius:14px;background:rgba(245,146,30,.14);color:#ffae5a;display:flex;align-items:center;justify-content:center">{ic("cpu", 24)}</div>'
         '<div style="flex:1"><div style="font-size:18px;font-weight:700">Runs on this device</div><div style="font-size:13px;color:#a1a1aa;margin-top:3px">[MODEL NAME] · [SIZE] GB · using your GPU</div></div>'
         f'</div>'
         '<div style="font-size:13px;color:#a1a1aa;margin-top:14px;line-height:1.6">Works offline. Nothing you ask ACE is sent to a server. Not your chats, not your screen, not your files.</div></div>')
memory = (f'<div class="card"><p class="label">Memory</p>' + prow('brain', 'Remember things about me', 'Kept on this device · 12 notes', tog(True))
          + prow('history', 'Chat history', 'Delete chats after', seg(['7 days', '30 days', 'Never'], '30 days'))
          + f'<div style="display:flex;gap:10px;margin-top:14px"><span class="btn">See what ACE remembers</span><span class="btn" style="color:#ff7b7b">Erase everything</span></div></div>')
perm_page = (f'<div class="main">{head("Permissions &amp; model", "You decide what ACE can see and do.")}'
             f'<div class="body" style="display:grid;grid-template-columns:1.25fr 1fr;gap:16px;align-content:start">{access}<div style="display:flex;flex-direction:column;gap:16px">{model}{memory}</div></div></div>')
S['ace-permissions'] = ('ACE: permissions & model', side('perm') + perm_page)

KIT = os.path.join(HERE, '..')
for name, (title, win) in S.items():
    html = page(title, win, 'win').replace('</style>', CSS + '</style>', 1)
    open(os.path.join(KIT, 'screens', name + '.html'), 'w').write(html)
print(len(S), 'ACE screens')
