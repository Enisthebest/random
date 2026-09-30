"""NOVA TikTok teaser: 20 seconds, drop on the reveal. Synthesized, no samples."""
import json
import wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
D = json.load(open('out/timeline.json'))
T, LINES = D['T'], D['LINES']
DUR = 20.0
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


CH = {'Amaj7': ['A2', 'C#4', 'E4', 'G#4'], 'F#m9': ['F#2', 'A3', 'E4', 'G#4'], 'Dmaj9': ['D2', 'F#3', 'C#4', 'E4'], 'E6sus': ['E2', 'A3', 'B3', 'C#4']}
ORDER = ['Amaj7', 'F#m9', 'Dmaj9', 'E6sus']
pads = np.zeros(N); keys = np.zeros(N); low = np.zeros(N); perc = np.zeros(N); sfx = np.zeros(N)


def pad(freqs, dur):
    n = int(dur * SR); tt = t_(n); s = np.zeros(n)
    for f in freqs:
        for k, dt in enumerate((-0.09, 0, 0.09)):
            ph = (k * 0.37 + f * 0.001) % 1
            s += 2 * ((ph + np.cumsum(np.full(n, f * 2 ** (dt / 12))) / SR) % 1) - 1
    return lp(s, 1300) / (3 * len(freqs)) * np.minimum(1, tt / 0.8) * np.minimum(1, (dur - tt) / 0.8)


def pluck(f, v=1.0):
    n = int(0.45 * SR); tt = t_(n)
    s = np.sin(2 * np.pi * f * tt) + 0.22 * np.sin(2 * np.pi * 4 * f * tt) * np.exp(-tt / 0.02)
    return s * np.minimum(1, tt / 0.002) * np.exp(-tt / 0.15) * v


def piano(f, dur=3.0, v=1.0):
    n = int(dur * SR); tt = t_(n)
    s = np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / 0.5) + 0.15 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt / 0.2)
    return s * np.minimum(1, tt / 0.004) * np.exp(-tt / 1.3) * v


ARP = [0, 1, 2, 3, 2, 1, 2, 3, 3, 2, 1, 2, 3, 2, 1, 0]
nb = int(DUR / BAR) + 1
for j in range(nb):
    st = j * BAR
    ch = CH[ORDER[j % 4]]
    lv = level(st + 0.01)
    place(pads, pad([note(x) for x in ch[1:]], BAR + 0.8), st - 0.2, 0.38 if lv == 0.5 else 0.55 if lv < 2 else 0.7)
    tones = [note(x) * 2 for x in ch[1:]] + [note(ch[1]) * 4]
    if lv == 0.5:
        for i, x in enumerate(ch):
            place(keys, piano(note(x) * (1 if i else 2), 3.0, 0.22), st + i * 0.04)
        continue
    for k16 in range(16):
        at = st + k16 * B / 4
        if lv == 0 and k16 % 4: continue
        if lv == 1 and k16 % 2: continue
        place(keys, pluck(tones[ARP[k16] % len(tones)], 0.28 + 0.07 * lv), at)
    if lv >= 2:
        for b in range(8):
            n = int(B / 2 * SR * 0.9); tt = t_(n)
            f = note(ch[0]) * (2 if b % 2 else 1)
            s = np.tanh(1.4 * np.sin(2 * np.pi * f * tt)) * np.exp(-tt / 0.14) * np.minimum(1, tt / 0.003)
            place(low, lp(s, 850), st + b * B / 2, 0.42)
    elif lv == 1:
        n = int(BAR * SR); tt = t_(n)
        place(low, np.sin(2 * np.pi * note(ch[0]) * tt) * np.minimum(1, tt / 0.05) * np.minimum(1, (BAR - tt) / 0.1), st, 0.3)

kn = int(0.3 * SR); tk = t_(kn)
kick = np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-tk / 0.03)) / SR) * np.exp(-tk / 0.16)
cn = int(0.25 * SR); clap = np.zeros(cn)
for o in (0, 0.01, 0.02):
    i = int(o * SR); clap[i:] += bp(rng.standard_normal(cn - i), 1000, 5000) * np.exp(-t_(cn - i) / (0.07 if o == 0.02 else 0.008))
hn = int(0.12 * SR); ohat = hp(rng.standard_normal(hn), 7000) * np.exp(-t_(hn) / 0.04)
chn = int(0.04 * SR); chat = hp(rng.standard_normal(chn), 8000) * np.exp(-t_(chn) / 0.01)
k = 0
while k * B < DUR:
    at = k * B; lv = level(at)
    if lv == 1 and k % 4 == 0: place(perc, kick, at, 0.4)
    if lv >= 2:
        place(perc, kick, at, 0.55)
        place(perc, chat, at + B / 2, 0.05)
    if lv >= 3:
        if k % 2: place(perc, clap, at, 0.2)
        place(perc, ohat, at + B / 2, 0.06)
    k += 1

# risers into the big sections, a soft impact as each opens
for s in (T['drop'],):
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
        peak(key(rng.random()), t0 + i * 0.07 + 0.03, 0.12 * (0.8 + 0.4 * rng.random()))
peak(chime([note('A5'), note('E6'), note('C#6')], 2.5), T['drop'] + 0.3, 0.1)
for k in ('b1', 'b2', 'b3', 'b4', 'b5', 'b6'):
    peak(whoosh(0.5, 500, 3000), T[k] + 0.25, 0.14)
for i in range(5):
    peak(tick(1800 + 90 * i, 0.004), T['b2'] + 0.35 + i * 0.12 + 0.2, 0.12)
for i in range(4):
    peak(tick(2200 + 150 * i, 0.003), T['b3'] + 0.3 + i * 0.15 + 0.25, 0.12)
peak(chime([note('D6'), note('A6')], 1.2), T['b5'] + 1.3, 0.08)
peak(chime([note('A5'), note('C#6'), note('E6'), note('A6')], 3.5), T['end'] + 0.5, 0.1)
# final chord under the end card
for i, nm in enumerate(['A2', 'E3', 'C#4', 'E4', 'G#4', 'B4']):
    place(keys, piano(note(nm), 6.0, 0.22), T['end'] + 0.3 + i * 0.04)
place(pads, pad([note(x) for x in ['C#4', 'E4', 'G#4', 'B4']], 12.0), T['end'] + 0.2, 0.4)


def reverb(x, secs=2.8, wet=0.4):
    n = int(secs * SR)
    ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 5000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]


mixd = reverb(keys + pads, 3.0, 0.42) + low + perc + sfx * 0.9
mixd = mixd[:int(DUR * SR)]
mixd *= np.minimum(1, t_(len(mixd)) / 0.05) * np.minimum(1, (DUR - t_(len(mixd))) / 1.5)
mixd = np.tanh(mixd * 0.9) / 0.9
st = np.stack([mixd, np.roll(mixd, 13) * 0.98 + mixd * 0.02], 1)
st /= np.max(np.abs(st)) * 1.05
with wave.open('out/tt-raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote', st.shape[0] / SR, 's')
