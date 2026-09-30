"""NOVA "New wallpapers?" TikTok: the catchy pop-EDM track, ticks on each shuffle cut, a chime on the landing. Synthesized, no samples."""
import json
import wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
D = json.load(open('out/timeline.json'))
T, LINES = D['T'], D['LINES']
DUR = D['DUR']
N = int(DUR * SR) + SR * 3
rng = np.random.default_rng(21)
BPM = 60 * 8 / 3.8   # two bars before the drop, so the reveal lands on a downbeat
B = 60 / BPM
BAR = 4 * B


def t_(n): return np.arange(n) / SR
def lp(x, f, o=2): b, a = butter(o, f / (SR / 2), 'low'); return lfilter(b, a, x)
def hp(x, f, o=2): b, a = butter(o, f / (SR / 2), 'high'); return lfilter(b, a, x)
def bp(x, lo, hi, o=2): b, a = butter(o, [lo / (SR / 2), hi / (SR / 2)], 'band'); return lfilter(b, a, x)


def note(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    n, o = name[:-1], int(name[-1])
    return 440 * 2 ** ((names[n] + 12 * (o + 1) - 69) / 12)


def place(buf, sig, at, g=1.0):
    i = int(round(at * SR))
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), len(buf) - i)
    if n > 0: buf[i:i + n] += sig[:n] * g


# intensity per section: 0 calm pad, 1 pulse, 2 groove, 3 full
SECTIONS = [(0, 1), (T['drop'] - 0.01, 3), (T['end'], 0)]
def level(t):
    lv = 0
    for s, v in SECTIONS:
        if t >= s: lv = v
    return lv



# ---------- music: pop-EDM in G major, G - D - Em - C, one hook over and over ----------
CH = {'G': ['G2', 'B3', 'D4', 'G4'], 'D': ['D2', 'A3', 'D4', 'F#4'], 'Em': ['E2', 'G3', 'B3', 'E4'], 'C': ['C2', 'G3', 'C4', 'E4']}
ORDER = ['G', 'D', 'Em', 'C']
# the hook: eighth notes per bar (None = rest), syncopated so it sticks
HOOK = [['D5', None, 'B4', 'D5', None, 'E5', 'D5', 'B4'],
        ['A4', None, 'F#4', 'A4', None, 'B4', 'A4', 'F#4'],
        ['G4', None, 'E4', 'G4', None, 'B4', 'A4', 'G4'],
        ['E5', None, 'D5', 'C5', None, 'B4', 'A4', 'G4']]
pads = np.zeros(N); keys = np.zeros(N); low = np.zeros(N); perc = np.zeros(N); sfx = np.zeros(N); lead = np.zeros(N)


def sawv(f, n, ph=0.0):
    return 2 * ((ph + np.cumsum(np.full(n, f)) / SR) % 1) - 1


def pad(freqs, dur):
    n = int(dur * SR); tt = t_(n); s = np.zeros(n)
    for f in freqs:
        for k, dt in enumerate((-0.12, 0, 0.12)):
            s += sawv(f * 2 ** (dt / 12), n, (k * 0.31 + f * 0.001) % 1)
    return lp(s, 1400) / (3 * len(freqs)) * np.minimum(1, tt / 0.3) * np.minimum(1, (dur - tt) / 0.3)


def lead_note(f, dur, bright=1.0):
    """Bright pop lead: detuned saw + square, quick pluck envelope with a bit of sustain."""
    n = int(dur * SR); tt = t_(n)
    s = sawv(f, n) * 0.45 + sawv(f * 1.006, n, 0.3) * 0.35 + np.sign(np.sin(2 * np.pi * f * 2 * tt)) * 0.12
    env = np.minimum(1, tt / 0.004) * (0.35 + 0.65 * np.exp(-tt / 0.09)) * np.minimum(1, (dur - tt) / 0.02)
    return lp(s, 2200 + 3200 * bright) * env


def piano(f, dur=3.0, v=1.0):
    n = int(dur * SR); tt = t_(n)
    s = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / 0.4) + 0.2 * np.sin(2 * np.pi * 4 * f * tt) * np.exp(-tt / 0.08)
    return s * np.minimum(1, tt / 0.003) * np.exp(-tt / 0.9) * v


DROP, END = T['drop'], T['end']
nb = int(DUR / BAR) + 1
for j in range(nb):
    st = j * BAR
    if st >= DUR: break
    ch = CH[ORDER[j % 4]]
    mel = HOOK[j % 4]
    full = DROP - 0.01 <= st < END
    endc = st >= END - 0.01
    # pads under everything
    place(pads, pad([note(x) for x in ch[1:]], BAR + 0.3), st - 0.05, 0.5 if full else 0.4)
    # the hook: muffled before the drop, bright after it, soft pluck on the end card
    for k, nm in enumerate(mel):
        if nm is None: continue
        at = st + k * B / 2
        if at >= DUR - 0.3: continue
        if full:
            s = lead_note(note(nm), B / 2 * 0.92, 1.0)
            place(lead, s, at, 0.34)
            place(lead, s * 0.32, at + 3 * B / 4)          # dotted-eighth echo
        elif endc:
            place(keys, piano(note(nm), 1.2, 0.16), at)
        else:
            place(lead, lp(lead_note(note(nm), B / 2 * 0.9, 0.0), 900), at, 0.3)
    if full:
        # pumping chord stabs on the offbeats
        for b in range(4):
            n = int(B / 2 * SR * 0.9); tt = t_(n)
            s = sum(sawv(note(x) * 2 ** (dt / 12), n) for x in ch[1:] for dt in (-0.1, 0.1)) / 6
            place(keys, lp(s, 3000) * np.exp(-tt / 0.12), st + b * B + B / 2, 0.22)
        # bouncy octave bass
        for b in range(8):
            n = int(B / 2 * SR * 0.85); tt = t_(n)
            f = note(ch[0]) * (2 if b % 2 else 1)
            s = lp(sawv(f, n) * 0.6 + np.sin(2 * np.pi * f * tt), 900) * np.exp(-tt / 0.15) * np.minimum(1, tt / 0.003)
            place(low, s, st + b * B / 2, 0.42)
    elif not endc:
        n = int(BAR * SR); tt = t_(n)
        place(low, np.sin(2 * np.pi * note(ch[0]) * tt) * np.minimum(1, tt / 0.05) * np.minimum(1, (BAR - tt) / 0.1), st, 0.25)
    else:
        for i, x in enumerate(ch):
            place(keys, piano(note(x) * (2 if i == 0 else 1), 2.5, 0.1), st + i * 0.03)

# drums
kn = int(0.3 * SR); tk = t_(kn)
kick = np.sin(2 * np.pi * np.cumsum(50 + 120 * np.exp(-tk / 0.025)) / SR) * np.exp(-tk / 0.17)
cn = int(0.3 * SR); clap = np.zeros(cn)
for o in (0, 0.009, 0.018, 0.027):
    i = int(o * SR); clap[i:] += bp(rng.standard_normal(cn - i), 1100, 6000) * np.exp(-t_(cn - i) / (0.09 if o == 0.027 else 0.007))
hn = int(0.12 * SR); ohat = hp(rng.standard_normal(hn), 7500) * np.exp(-t_(hn) / 0.04)
sn = int(0.05 * SR); shk = hp(rng.standard_normal(sn), 9000) * np.exp(-t_(sn) / 0.01)
k = 0
while k * B < DUR:
    at = k * B
    if DROP - 0.01 <= at < END:
        place(perc, kick, at, 0.62)
        if k % 2: place(perc, clap, at, 0.3)
        place(perc, ohat, at + B / 2, 0.07)
        for s16 in (1, 3): place(perc, shk, at + s16 * B / 4, 0.04)
    elif at < DROP and k % 4 == 0:
        place(perc, kick, at, 0.35)
    k += 1
# build: snare roll speeding up into the drop, a riser, then an eighth of silence before the hit
for i in range(16):
    at = DROP - BAR + BAR * (1 - (1 - i / 16) ** 1.7) - B / 2
    place(perc, clap, at, 0.05 + 0.22 * i / 15)
rn = int(BAR * SR); r = rng.standard_normal(rn); u = t_(rn) / BAR; o = np.zeros(rn)
for s0 in range(0, rn, 2048):
    c = 500 + 7000 * u[s0] ** 2
    o[s0:s0 + 2048] = bp(r[s0:s0 + 2048], c, min(c * 1.5, 20000), 1)
place(perc, o * u ** 2 * 0.25, DROP - BAR - B / 2)
im = int(1.3 * SR); ti = t_(im)
place(perc, np.sin(2 * np.pi * np.cumsum(38 + 70 * np.exp(-ti / 0.08)) / SR) * np.exp(-ti / 0.45) + hp(rng.standard_normal(im), 4000) * np.exp(-ti / 0.3) * 0.25, DROP, 0.6)
gap0, gap1 = int((DROP - B / 2) * SR), int(DROP * SR)
for buf in (pads, lead, low):
    buf[gap0:gap1] *= np.linspace(1, 0, gap1 - gap0) ** 0.3
# sidechain pump on chords, pads and lead under the kick
duck = np.ones(N)
k = 0
while k * B < DUR:
    at = k * B
    if DROP - 0.01 <= at < END:
        i = int(at * SR); m = int(B * SR)
        d = 1 - 0.6 * np.exp(-t_(m) / 0.1); duck[i:i + m] = np.minimum(duck[i:i + m], d[:len(duck[i:i + m])])
    k += 1
keys = keys * duck; pads = pads * duck; lead = lead * (0.4 + 0.6 * duck)

# ---------- sound effects ----------
def peak(sig, at, g): place(sfx, sig, at - int(np.argmax(np.abs(sig))) / SR, g)


def whoosh(dur=0.8, lo=300, hi=2500):
    n = int(dur * SR); r = rng.standard_normal(n); u = t_(n) / dur; o = np.zeros(n)
    for s in range(0, n, 2048):
        c = lo * (hi / lo) ** np.sin(np.pi * u[s] * 0.5)
        o[s:s + 2048] = bp(r[s:s + 2048], c, c * 1.8, 1)
    return o * np.sin(np.pi * u) ** 2


def click():
    n = int(0.03 * SR)
    return hp(rng.standard_normal(n), 2500) * np.exp(-t_(n) / 0.0025) + np.sin(2 * np.pi * 1800 * t_(n)) * np.exp(-t_(n) / 0.004) * 0.6


def tick(f=3000, d=0.002):
    n = int(0.015 * SR); return np.sin(2 * np.pi * f * t_(n)) * np.exp(-t_(n) / d)


def chime(fs, dur=2.5):
    n = int(dur * SR)
    return sum(np.sin(2 * np.pi * f * t_(n)) * np.exp(-t_(n) / (dur / (1.5 + i))) for i, f in enumerate(fs)) * np.minimum(1, t_(n) / 0.004)


def key(v):
    n = int(0.06 * SR); tt = t_(n); f = 2600 + 900 * v
    return (bp(rng.standard_normal(n), f, f * 1.9) * np.exp(-tt / 0.004) + np.sin(2 * np.pi * (170 + 50 * v) * tt) * np.exp(-tt / 0.018) * 0.5) * np.minimum(1, tt / 0.0008)


def thud(f=200):
    n = int(0.18 * SR)
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-t_(n) / 0.02))) / SR) * np.exp(-t_(n) / 0.05)


for line, t0 in LINES:
    for i, _ in enumerate(line.split(' ')):
        peak(key(rng.random()), t0 + i * 0.07 + 0.03, 0.1 * (0.8 + 0.4 * rng.random()))
# the shuffle: a tick on every cut, getting a little louder and lower as it slows
cuts = D['CUTS']
for i, c in enumerate(cuts):
    u = i / (len(cuts) - 1)
    peak(tick(3200 - 900 * u, 0.003 + 0.002 * u), c, 0.07 + 0.08 * u)
peak(chime([note('A5'), note('E6'), note('C#6')], 2.5), T['drop'] + 0.05, 0.12)
for st in D['STEPS'][1:]:
    peak(whoosh(0.6, 400, 3000), st + 0.05, 0.13)
peak(whoosh(1.0, 300, 2000), T['end'] + 0.5, 0.12)
peak(chime([note('A5'), note('C#6'), note('E6'), note('A6')], 3.5), T['soon'] + 0.2, 0.1)
# final chord under the end card
for i, nm in enumerate(['G2', 'D3', 'B3', 'D4', 'G4', 'B4']):
    place(keys, piano(note(nm), 6.0, 0.12), T['end'] + 0.3 + i * 0.04)
place(pads, pad([note(x) for x in ['B3', 'D4', 'G4', 'B4']], 4.0), T['end'] + 0.2, 0.4)


def reverb(x, secs=2.8, wet=0.4):
    n = int(secs * SR)
    ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 5000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]


mixd = reverb(keys + pads + lead * 0.6, 2.2, 0.32) + lead * 0.55 + low + perc + sfx * 0.9
mixd = mixd[:int(DUR * SR)]
mixd *= np.minimum(1, t_(len(mixd)) / 0.05) * np.minimum(1, (DUR - t_(len(mixd))) / 1.5)
mixd = np.tanh(mixd * 0.9) / 0.9
st = np.stack([mixd, np.roll(mixd, 13) * 0.98 + mixd * 0.02], 1)
st /= np.max(np.abs(st)) * 1.05
with wave.open('out/walls-raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote', st.shape[0] / SR, 's')
