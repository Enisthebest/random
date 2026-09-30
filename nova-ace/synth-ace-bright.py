"""NOVA OS Pro "Meet ACE" soundtrack, take 2: bright electronic: calm piano + pad, a gentle pulse once the screen appears, synthesized (no samples)."""
import json
import wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
T = json.load(open('out/timeline.json'))
DUR = 45.0
N = int(DUR * SR) + SR * 3          # room for tails, trimmed at the end
rng = np.random.default_rng(11)
BPM = 100
B = 60 / BPM
BAR = 4 * B


def t_(n):
    return np.arange(n) / SR


def lp(x, f, o=2):
    b, a = butter(o, f / (SR / 2), 'low'); return lfilter(b, a, x)


def hp(x, f, o=2):
    b, a = butter(o, f / (SR / 2), 'high'); return lfilter(b, a, x)


def bp(x, lo, hi, o=2):
    b, a = butter(o, [lo / (SR / 2), hi / (SR / 2)], 'band'); return lfilter(b, a, x)


def note(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    n, o = name[:-1], int(name[-1])
    return 440 * 2 ** ((names[n] + 12 * (o + 1) - 69) / 12)


def place(buf, sig, at, g=1.0):
    i = int(round(at * SR))
    if i < 0:
        sig = sig[-i:]; i = 0
    n = min(len(sig), len(buf) - i)
    if n > 0:
        buf[i:i + n] += sig[:n] * g


def piano(f, dur=3.0, vel=1.0):
    n = int(dur * SR); tt = t_(n)
    s = (np.sin(2 * np.pi * f * tt) + 0.45 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / 0.6)
         + 0.2 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt / 0.25) + 0.06 * np.sin(2 * np.pi * 5.02 * f * tt) * np.exp(-tt / 0.08))
    s *= np.minimum(1, tt / 0.004) * np.exp(-tt / (1.6 if f < 400 else 1.1))
    s[:400] += rng.standard_normal(400) * np.linspace(0.02, 0, 400)   # hammer
    return lp(s, 5000) * vel


def pad(freqs, dur):
    n = int(dur * SR); tt = t_(n)
    s = np.zeros(n)
    for f in freqs:
        for k, dt in enumerate((-0.08, 0, 0.08)):
            ph = (k * 0.37 + f * 0.001) % 1
            s += 2 * ((ph + np.cumsum(np.full(n, f * 2 ** (dt / 12))) / SR) % 1) - 1
    s = lp(s, 1100) / (3 * len(freqs))
    return s * np.minimum(1, tt / 1.2) * np.minimum(1, (dur - tt) / 1.0)



# ---------- music: bright electronic in E major, 100 BPM ----------
CH = {
    'Emaj7': ['E2', 'G#3', 'B3', 'D#4', 'E4'],
    'C#m7': ['C#2', 'G#3', 'B3', 'E4', 'G#4'],
    'Amaj9': ['A1', 'G#3', 'B3', 'C#4', 'E4'],
    'B6': ['B1', 'F#3', 'G#3', 'B3', 'D#4'],
}
NBARS = int(np.ceil(DUR / BAR)) + 1
PROG = (['Emaj7', 'C#m7', 'Amaj9', 'B6'] * 6)[:NBARS]
keys = np.zeros(N); pads = np.zeros(N); low = np.zeros(N); perc = np.zeros(N); sfx = np.zeros(N)
CARD, END = T['card'], T['cardOut']


def pluck(f, vel=1.0):
    """Marimba-ish pluck: sine + soft 4th partial, very short."""
    n = int(0.5 * SR); tt = t_(n)
    s = np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 4 * f * tt) * np.exp(-tt / 0.02)
    return s * np.minimum(1, tt / 0.002) * np.exp(-tt / 0.16) * vel


def pad(freqs, dur):
    n = int(dur * SR); tt = t_(n)
    s = np.zeros(n)
    for f in freqs:
        for k, dt in enumerate((-0.1, 0, 0.1)):
            ph = (k * 0.37 + f * 0.001) % 1
            s += 2 * ((ph + np.cumsum(np.full(n, f * 2 ** (dt / 12))) / SR) % 1) - 1
    s = lp(s, 1600) / (3 * len(freqs))
    return s * np.minimum(1, tt / 0.6) * np.minimum(1, (dur - tt) / 0.6)


ARP = [0, 1, 2, 3, 2, 1, 2, 3, 4, 3, 2, 1, 2, 3, 2, 4]
for j, name in enumerate(PROG):
    st = j * BAR
    if st > DUR:
        break
    ch = CH[name]
    busy = CARD - 0.2 <= st < END
    tones = [note(x) * 2 for x in ch[1:]] + [note(ch[2]) * 4]
    for k16 in range(16):
        at = st + k16 * B / 4
        if not busy and k16 % 2:
            continue
        place(keys, pluck(tones[ARP[k16] % len(tones)], 0.5 if busy else 0.35), at)
    place(pads, pad([note(x) for x in ch[1:]], BAR + 0.8), st - 0.2, 0.5 if st < CARD else 0.7)
    if busy:
        # bass: root on the beat, octave on the offbeat
        for b in range(8):
            n = int(B / 2 * SR * 0.9); tt = t_(n)
            f = note(ch[0]) * (2 if b % 2 else 1)
            s = np.tanh(1.5 * np.sin(2 * np.pi * f * tt)) * np.exp(-tt / 0.14) * np.minimum(1, tt / 0.003)
            place(low, lp(s, 900), st + b * B / 2, 0.45)

# drums while ACE works: four on the floor, claps on 2 and 4, open hats on the offbeat
kn = int(0.3 * SR); tk = t_(kn)
kick = np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-tk / 0.03)) / SR) * np.exp(-tk / 0.16)
cn = int(0.25 * SR); clap = np.zeros(cn)
for o in (0, 0.01, 0.02):
    i = int(o * SR); clap[i:] += bp(rng.standard_normal(cn - i), 1000, 5000) * np.exp(-t_(cn - i) / (0.07 if o == 0.02 else 0.008))
hn = int(0.12 * SR); ohat = hp(rng.standard_normal(hn), 7000) * np.exp(-t_(hn) / 0.04)
k = 0
while k * B < END:
    at = k * B
    if at >= CARD:
        place(perc, kick, at, 0.6)
        if k % 2:
            place(perc, clap, at, 0.22)
        place(perc, ohat, at + B / 2, 0.06)
    elif at >= T['name']:
        if k % 4 == 0:
            place(perc, kick, at, 0.35)
    k += 1
# riser into the screen, then a soft impact as it opens
rn = int(3 * B * SR); r = rng.standard_normal(rn); u = t_(rn) / (3 * B); o = np.zeros(rn)
for s0 in range(0, rn, 2048):
    c = 400 + 6000 * u[s0] ** 2
    o[s0:s0 + 2048] = bp(r[s0:s0 + 2048], c, min(c * 1.5, 20000), 1)
place(perc, o * u ** 2 * 0.25, CARD - 3 * B)
im = int(1.2 * SR); ti = t_(im)
place(perc, np.sin(2 * np.pi * np.cumsum(40 + 60 * np.exp(-ti / 0.08)) / SR) * np.exp(-ti / 0.4), CARD + 0.05, 0.5)


def piano(f, dur=3.0, vel=1.0):
    n = int(dur * SR); tt = t_(n)
    s = np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / 0.5)
    return s * np.minimum(1, tt / 0.004) * np.exp(-tt / 1.4) * vel


# ---------- sound effects (peaks on events) ----------
def peak(sig, at, g):
    place(sfx, sig, at - int(np.argmax(np.abs(sig))) / SR, g)


def whoosh(dur=0.8, lo=300, hi=2500):
    n = int(dur * SR); r = rng.standard_normal(n); u = t_(n) / dur
    o = np.zeros(n)
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


J = json.load(open('out/jobs.json'))
peak(chime([note('A5'), note('E6'), note('F#6')], 3.0), T['star'] + 0.3, 0.07)
peak(whoosh(0.8, 150, 1400), CARD + 0.45, 0.22)


def key(v):
    n = int(0.06 * SR); tt = t_(n)
    f = 2600 + 900 * v
    click_ = bp(rng.standard_normal(n), f, f * 1.9) * np.exp(-tt / 0.004)
    thock = np.sin(2 * np.pi * (170 + 50 * v) * tt) * np.exp(-tt / 0.018) * 0.5
    return (click_ + thock) * np.minimum(1, tt / 0.0008)


# headlines and captions: a key per word
LINES = [('You ask your computer', T['l1']), ('for a lot.', T['l1'] + 0.3), ('What if it could', T['l2']), ('actually help?', T['l2'] + 0.3),
         ('Meet ACE.', T['name']), ('Your AI. Built right in.', T['sub']),
         ('It opens your apps.', T['cap1']), ('It searches the web.', T['cap2']), ('It messages your friends.', T['cap3']),
         ('It cleans your inbox.', T['cap4']), ('It watches your temps.', T['cap5']), ('It handles many tasks at once.', T['cap6']),
         ('And it knows its place.', T['capPriv']), ('ACE.', T['endName']), ('Only in Pro.', T['pro'])]
for line, t0 in LINES:
    for i, _ in enumerate(line.split(' ')):
        peak(key(rng.random()), t0 + i * 0.07 + 0.03, 0.11 * (0.8 + 0.4 * rng.random()))
# each request: typed letter by letter, sent, answered
for job in J['jobs']:
    t0 = T[job['t']]
    q = job['q']
    for i, ch in enumerate(q):
        if ch != ' ':
            peak(key(rng.random()), t0 + 0.1 + i * J['TYPE'] / len(q), 0.08 * (0.8 + 0.4 * rng.random()))
    peak(whoosh(0.35, 900, 3500), t0 + J['SEND'] + 0.2, 0.08)
    peak(chime([note('A5'), note('E6')], 0.9), t0 + J['SEND'] + 0.5, 0.045)
# the work itself
peak(whoosh(0.8, 300, 2000), T['s1'] + J['SEND'] + 0.65, 0.12)
for i in range(7):
    peak(tick(2400 + 120 * i, 0.002), T['s4'] + J['SEND'] + 0.7 + i * 0.12, 0.08)
for i in range(5):
    peak(chime([note('D6')], 0.5), T['s6'] + J['SEND'] + 0.1 + 1.3 + i * 0.28 + 0.2, 0.05)
peak(click(), T['allow'], 0.35)
peak(chime([note('D6'), note('A6')], 1.6), T['pills'] + 0.3, 0.07)
peak(whoosh(0.8, 2500, 300), T['cardOut'] + 0.45, 0.2)
peak(chime([note('D6'), note('F#6'), note('A6'), note('D7')], 3.5), T['endStar'] + 0.5, 0.1)

# final open chord under the end card
for i, nm in enumerate(['E2', 'B2', 'G#3', 'B3', 'D#4', 'F#4']):
    place(keys, piano(note(nm), 4.0, 0.45), T['cardOut'] + 0.5 + i * 0.04)
place(pads, pad([note(x) for x in ['B3', 'D#4', 'F#4', 'G#4']], 4.5), T['cardOut'] + 0.3, 0.7)
place(pads, pad([note(x) for x in ['A3', 'C#4', 'E4', 'F#4']], 4.5), T['cardOut'] + 0.3, 0.7)


def reverb(x, secs=2.8, wet=0.4):
    n = int(secs * SR)
    ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]


mixd = reverb(keys + pads, 3.0, 0.45) + low + perc + sfx * 0.9
mixd = mixd[:int(DUR * SR)]
mixd *= np.minimum(1, t_(len(mixd)) / 0.05) * np.minimum(1, (DUR - t_(len(mixd))) / 1.2)   # clean head, gentle tail
mixd = np.tanh(mixd * 0.9) / 0.9
st = np.stack([mixd, np.roll(mixd, 13) * 0.98 + mixd * 0.02], 1)
st /= np.max(np.abs(st)) * 1.05
with wave.open('out/nova-ad-raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote', st.shape[0] / SR, 's')
