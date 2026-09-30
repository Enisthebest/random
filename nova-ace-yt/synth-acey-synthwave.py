"""'Meet ACE' YouTube soundtrack, take 2: synthwave, 2 minutes that build chapter by chapter. Synthesized, no samples."""
import json
import wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
D = json.load(open('out/timeline.json'))
T, LINES, JOBS, TYPE, SEND = D['T'], D['LINES'], D['JOBS'], D['TYPE'], D['SEND']
DUR = 120.0
N = int(DUR * SR) + SR * 3
rng = np.random.default_rng(21)
BPM = 104
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
SECTIONS = [(0, 0), (T['bar'], 1), (T['ch1'] - 0.4, 2), (T['ch6'] - 0.4, 3), (T['ch7'] - 0.4, 0.5), (T['endBlur'], 0)]
def level(t):
    lv = 0
    for s, v in SECTIONS:
        if t >= s: lv = v
    return lv



# ---------- music: synthwave in D minor ----------
CH = {'Dm9': ['D2', 'F3', 'A3', 'C4', 'E4'], 'Bbmaj7': ['A#1', 'D3', 'F3', 'A3', 'D4'], 'Fmaj7': ['F2', 'A3', 'C4', 'E4', 'F4'], 'C6': ['C2', 'E3', 'G3', 'A3', 'C4']}
ORDER = ['Dm9', 'Bbmaj7', 'Fmaj7', 'C6']
pads = np.zeros(N); keys = np.zeros(N); low = np.zeros(N); perc = np.zeros(N); sfx = np.zeros(N)


def sawv(f, n, ph=0.0):
    return 2 * ((ph + np.cumsum(np.full(n, f)) / SR) % 1) - 1


def pad(freqs, dur):
    """Wide detuned saw pad with a slow filter swell."""
    n = int(dur * SR); tt = t_(n); s = np.zeros(n)
    for f in freqs:
        for k, dt in enumerate((-0.14, -0.05, 0.05, 0.14)):
            s += sawv(f * 2 ** (dt / 12), n, (k * 0.29 + f * 0.001) % 1)
    s /= 4 * len(freqs)
    out = np.zeros(n)
    for s0 in range(0, n, 4096):
        c = 700 + 1400 * np.sin(np.pi * min(1, s0 / n))
        out[s0:s0 + 4096] = lp(s[s0:s0 + 4096], c)
    return out * np.minimum(1, tt / 0.6) * np.minimum(1, (dur - tt) / 0.6)


def arp_note(f, v=1.0):
    """Plucky square-ish lead with a quick filter drop."""
    n = int(0.3 * SR); tt = t_(n)
    s = np.sign(np.sin(2 * np.pi * f * tt)) * 0.5 + sawv(f * 1.003, n) * 0.5
    return lp(s, 3800) * np.minimum(1, tt / 0.002) * np.exp(-tt / 0.09) * v


def piano(f, dur=3.0, v=1.0):
    n = int(dur * SR); tt = t_(n)
    s = np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / 0.5)
    return s * np.minimum(1, tt / 0.004) * np.exp(-tt / 1.4) * v


ARP = [0, 2, 1, 3, 2, 4, 3, 1]
nb = int(DUR / BAR) + 1
for j in range(nb):
    st = j * BAR
    ch = CH[ORDER[j % 4]]
    lv = level(st + 0.01)
    place(pads, pad([note(x) for x in ch[1:]], BAR + 0.6), st - 0.1, 0.45 if lv in (0, 0.5) else 0.6)
    if lv == 0.5:
        for i, x in enumerate(ch[1:]):
            place(keys, piano(note(x) * 2, 3.0, 0.16), st + i * 0.05)
        continue
    tones = [note(x) * 2 for x in ch[1:]]
    for k16 in range(16):
        if lv == 0 and k16 % 4: continue
        if lv == 1 and k16 % 2: continue
        f = tones[ARP[k16 % 8] % len(tones)] * (2 if k16 % 8 == 7 else 1)
        place(keys, arp_note(f, 0.18 + 0.05 * lv), st + k16 * B / 4)
    if lv >= 1:
        # driving octave bass on eighths
        for b in range(8):
            n = int(B / 2 * SR * 0.85); tt = t_(n)
            f = note(ch[0]) * (2 if b % 2 else 1)
            s = lp(sawv(f, n) * 0.7 + np.sin(2 * np.pi * f * tt), 700 if lv == 1 else 1100) * np.exp(-tt / 0.2) * np.minimum(1, tt / 0.003)
            place(low, s, st + b * B / 2, 0.32 if lv == 1 else 0.42)

kn = int(0.3 * SR); tk = t_(kn)
kick = np.sin(2 * np.pi * np.cumsum(48 + 120 * np.exp(-tk / 0.025)) / SR) * np.exp(-tk / 0.18)
sn = int(0.5 * SR); ts = t_(sn)
snare = bp(rng.standard_normal(sn), 900, 6000) * np.exp(-ts / 0.16) * (ts < 0.28) + np.sin(2 * np.pi * 185 * ts) * np.exp(-ts / 0.05) * 0.6
chn = int(0.05 * SR); chat = hp(rng.standard_normal(chn), 8000) * np.exp(-t_(chn) / 0.012)
k = 0
while k * B < DUR:
    at = k * B; lv = level(at)
    if lv >= 2:
        place(perc, kick, at, 0.6)
        if k % 2: place(perc, snare, at, 0.28)
        for h in range(2): place(perc, chat, at + h * B / 2 + B / 4, 0.045)
    elif lv == 1 and k % 2 == 0:
        place(perc, kick, at, 0.4)
    k += 1

# risers into the groove and the final lift, with a soft hit on arrival
for s in (T['ch1'], T['ch6']):
    rn = int(BAR * SR); r = rng.standard_normal(rn); u = t_(rn) / BAR; o = np.zeros(rn)
    for s0 in range(0, rn, 2048):
        c = 400 + 6000 * u[s0] ** 2
        o[s0:s0 + 2048] = bp(r[s0:s0 + 2048], c, min(c * 1.5, 20000), 1)
    place(perc, o * u ** 2 * 0.2, s - BAR)
    im = int(1.2 * SR); ti = t_(im)
    place(perc, np.sin(2 * np.pi * np.cumsum(40 + 60 * np.exp(-ti / 0.08)) / SR) * np.exp(-ti / 0.4), s, 0.45)


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
peak(chime([note('A5'), note('E6'), note('C#6')], 3.0), T['star'] + 0.4, 0.08)
peak(whoosh(0.8, 300, 2400), T['panel'] + 0.45, 0.25)
for c in ('ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7'):
    peak(whoosh(0.8, 400, 2600), T[c] + 0.35, 0.16)
for J in JOBS:
    t0 = T[J['t']]
    q = J['q']
    for i, ch in enumerate(q):
        if ch != ' ':
            peak(key(rng.random()), t0 + 0.1 + i * TYPE / len(q), 0.075 * (0.8 + 0.4 * rng.random()))
    peak(whoosh(0.35, 900, 3500), t0 + SEND + 0.2, 0.07)
    peak(chime([note('A5'), note('E6')], 0.9), t0 + SEND + 0.5, 0.04)
peak(whoosh(0.8, 300, 2000), T['j1'] + SEND + 0.65, 0.12)
peak(whoosh(0.8, 500, 1500), T['j2'] + SEND + 0.7, 0.1)
peak(click(), T['sendClick'], 0.4); peak(whoosh(0.4, 900, 3500), T['sendClick'] + 0.25, 0.1)
for i in range(7):
    peak(tick(2400 + 120 * i, 0.002), T['j6'] + SEND + 0.7 + i * 0.12, 0.08)
peak(chime([note('E5')], 0.8), T['j8'] + SEND + 0.5, 0.05)
for i in range(5):
    peak(chime([note('D6')], 0.5), T['j9'] + SEND + 0.1 + 1.3 + i * 0.28 + 0.2, 0.05)
peak(click(), T['allow'], 0.4)
peak(chime([note('D6'), note('A6')], 1.6), T['pills'] + 0.3, 0.07)
peak(chime([note('A5'), note('C#6'), note('E6'), note('A6')], 4.0), T['endStar'] + 0.6, 0.1)
# final chord under the end card
for i, nm in enumerate(['D2', 'A2', 'F3', 'A3', 'C4', 'E4']):
    place(keys, piano(note(nm), 6.0, 0.4), T['endBlur'] + 0.5 + i * 0.04)
place(pads, pad([note(x) for x in ['F4', 'A4', 'C5', 'E5']], 12.0), T['endBlur'] + 0.3, 0.7)


def reverb(x, secs=2.8, wet=0.4):
    n = int(secs * SR)
    ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 5000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]


mixd = reverb(keys + pads, 3.0, 0.42) + low + perc + sfx * 0.9
mixd = mixd[:int(DUR * SR)]
mixd *= np.minimum(1, t_(len(mixd)) / 0.05) * np.minimum(1, (DUR - t_(len(mixd))) / 4.0)
mixd = np.tanh(mixd * 0.9) / 0.9
st = np.stack([mixd, np.roll(mixd, 13) * 0.98 + mixd * 0.02], 1)
st /= np.max(np.abs(st)) * 1.05
with wave.open('out/acey-synthwave-raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote', st.shape[0] / SR, 's')
