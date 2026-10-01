"""NOVA hype trailer music: 128 BPM festival EDM in F minor, synthesized (no samples).
Sections follow the film: build (bars 0-10), drop 1 (10-26), breakdown (26-32), drop 2 (32-39), star build (39-40), final hit (40+)."""
import json
import wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
D = json.load(open('out/timeline.json'))
T, LINES, DUR = D['T'], D['LINES'], D['DUR']
BPM = 128
B = 60 / BPM
BAR = 4 * B
N = int(DUR * SR) + SR * 4
rng = np.random.default_rng(7)
DROP1, BRK, DROP2, STAR, END = 10 * BAR, 26 * BAR, 32 * BAR, 39 * BAR, 40 * BAR


def t_(n): return np.arange(n) / SR
def lp(x, f, o=2): b, a = butter(o, min(f, SR * 0.45) / (SR / 2), 'low'); return lfilter(b, a, x)
def hp(x, f, o=2): b, a = butter(o, f / (SR / 2), 'high'); return lfilter(b, a, x)
def bp(x, lo, hi, o=2): b, a = butter(o, [lo / (SR / 2), min(hi, SR * 0.45) / (SR / 2)], 'band'); return lfilter(b, a, x)


def note(name):
    names = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
    n, o = name[:-1], int(name[-1])
    return 440 * 2 ** ((names[n] + 12 * (o + 1) - 69) / 12)


def place(buf, sig, at, g=1.0):
    i = int(round(at * SR))
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), len(buf) - i)
    if n > 0: buf[i:i + n] += sig[:n] * g


def saw(f, n, ph=0.0): return 2 * ((f * t_(n) + ph) % 1) - 1


def supersaw(f, n, voices=7, spread=0.18):
    det = np.linspace(-spread, spread, voices)
    return sum(saw(f * 2 ** (d / 12), n, (k * 0.137) % 1) * (1 if k == voices // 2 else 0.7) for k, d in enumerate(det)) / voices


def env(n, a=0.005, d=0.2, s=0.0, r=0.05):
    tt = t_(n); e = np.minimum(1, tt / a) * (s + (1 - s) * np.exp(-tt / d))
    return e * np.minimum(1, (n / SR - tt) / r)


# ---------- harmony ----------
CH = {'Fm': ['F2', 'F4', 'Ab4', 'C5'], 'Db': ['Db2', 'Db4', 'F4', 'Ab4'], 'Ab': ['Ab1', 'C4', 'Eb4', 'Ab4'], 'Eb': ['Eb2', 'Eb4', 'G4', 'Bb4']}
ORDER = ['Fm', 'Db', 'Ab', 'Eb']
HOOK = {  # 8 eighth notes per bar, None = rest
    'Fm': ['C6', None, 'Ab5', 'C6', None, 'F6', 'Eb6', 'C6'],
    'Db': ['Db6', None, 'C6', 'Ab5', None, 'F5', 'Ab5', None],
    'Ab': ['C6', None, 'Eb6', 'C6', None, 'Ab5', 'Bb5', 'C6'],
    'Eb': ['Bb5', None, 'G5', 'Eb5', 'F5', None, 'G5', 'Bb5'],
}
chord_at = lambda bar: CH[ORDER[bar % 4]]
hook_at = lambda bar: HOOK[ORDER[bar % 4]]

pads, chords, lead, bass, drums, fx = (np.zeros(N) for _ in range(6))
nbars = int(DUR / BAR) + 1

for j in range(nbars):
    st = j * BAR
    if st >= DUR: break
    ch = chord_at(j)
    drop = DROP1 - 0.01 <= st < BRK or DROP2 - 0.01 <= st < STAR
    intro = st < DROP1
    brk = BRK - 0.01 <= st < DROP2
    # pads: soft supersaw chords, darker in the intro
    if not drop and st < END:
        n = int((BAR + 0.2) * SR)
        cut = 700 + 2600 * (st / DROP1) if intro else 2200
        s = sum(supersaw(note(x), n, 5, 0.12) for x in ch[1:]) / 3
        place(pads, lp(s, cut) * env(n, 0.3, 99, 1, 0.3), st, 0.5)
    # intro / build arp: 16ths over the chord, filter opening
    if intro or (brk and j >= 30):
        prog = st / DROP1 if intro else (st - 30 * BAR) / (2 * BAR)
        tones = [note(x) * 2 for x in ch[1:]] + [note(ch[1]) * 4]
        for k in range(16):
            at = st + k * B / 4
            n = int(B / 4 * SR * 0.9)
            s = saw(tones[k % 4], n) * env(n, 0.002, 0.07)
            place(lead, lp(s, 500 + 6500 * prog ** 2), at, 0.16)
    # drops: sidechained supersaw stabs, hook lead, pumping bass
    if drop:
        for p in (0, 0.75, 1.5, 2.5, 3.0, 3.5):
            n = int(0.24 * SR)
            s = sum(supersaw(note(x), n) for x in ch[1:]) / 3
            place(chords, lp(s, 6500) * env(n, 0.003, 0.14), st + p * B, 0.55)
        for k, nm in enumerate(hook_at(j)):
            if nm is None: continue
            n = int(B / 2 * SR * 0.95)
            s = supersaw(note(nm), n, 5, 0.1) + 0.5 * saw(note(nm) * 2, n)
            place(lead, lp(s, 7000) * env(n, 0.004, 0.25, 0.4, 0.03), st + k * B / 2, 0.30)
            if DROP2 <= st:  # drop 2: an octave below joins in
                place(lead, lp(supersaw(note(nm) / 2, n, 5, 0.1), 4000) * env(n, 0.004, 0.25, 0.4, 0.03), st + k * B / 2, 0.18)
        root = note(ch[0])
        for k in range(8):
            n = int(B / 2 * SR * 0.9); tt = t_(n)
            f = root * (2 if k % 2 else 1)
            s = np.sin(2 * np.pi * f * tt) + 0.45 * lp(supersaw(f * 2, n, 3, 0.15), 1200)
            place(bass, s * env(n, 0.004, 0.18, 0.5, 0.02), st + k * B / 2, 0.55)
    elif brk and j < 30:
        # breakdown: piano chords + a soft hook
        for i, x in enumerate(ch):
            n = int(2.6 * SR); tt = t_(n); f = note(x) * (2 if i == 0 else 1)
            s = sum(np.sin(2 * np.pi * f * h * tt) * np.exp(-tt * (1.2 + h)) / h for h in (1, 2, 3))
            place(pads, s * np.minimum(1, tt / 0.004), st + i * 0.02, 0.16)
        for k, nm in enumerate(hook_at(j)):
            if nm is None: continue
            n = int(B / 2 * SR); tt = t_(n)
            place(lead, np.sin(2 * np.pi * note(nm) * tt) * env(n, 0.005, 0.3, 0.3), st + k * B / 2, 0.12)
    elif intro and st >= 2 * BAR:
        n = int(BAR * SR); tt = t_(n)
        place(bass, np.sin(2 * np.pi * note(ch[0]) * tt) * np.minimum(1, tt / 0.1) * np.minimum(1, (BAR - tt) / 0.1), st, 0.3)

# ---------- drums ----------
kn = int(0.32 * SR); tk = t_(kn)
kick = np.sin(2 * np.pi * np.cumsum(48 + 140 * np.exp(-tk / 0.022)) / SR) * np.exp(-tk / 0.2) + hp(rng.standard_normal(kn), 3000) * np.exp(-tk / 0.004) * 0.3
cn = int(0.3 * SR); clap = np.zeros(cn)
for o in (0, 0.008, 0.017, 0.026):
    i = int(o * SR); clap[i:] += bp(rng.standard_normal(cn - i), 1000, 7000) * np.exp(-t_(cn - i) / (0.11 if o == 0.026 else 0.006))
hn = int(0.14 * SR); ohat = hp(rng.standard_normal(hn), 8000) * np.exp(-t_(hn) / 0.05)
sn = int(0.05 * SR); shk = hp(rng.standard_normal(sn), 9500) * np.exp(-t_(sn) / 0.012)
crn = int(2.5 * SR); crash = hp(rng.standard_normal(crn), 5000) * np.exp(-t_(crn) / 0.7)
k = 0
while k * B < DUR:
    at = k * B
    if DROP1 - 0.01 <= at < BRK or DROP2 - 0.01 <= at < STAR:
        place(drums, kick, at, 0.8)
        if k % 2: place(drums, clap, at, 0.38)
        place(drums, ohat, at + B / 2, 0.09)
        for s16 in ((1, 3) if at < BRK else (1, 2, 3)): place(drums, shk, at + s16 * B / 4, 0.05)
    elif 6 * BAR <= at < DROP1 - BAR:
        place(drums, lp(kick, 900), at, 0.5)
    k += 1
for c in (DROP1, DROP1 + 8 * BAR, DROP2, END):
    place(drums, crash, c, 0.28)


# ---------- builds: snare rolls, risers, half a beat of silence, impacts ----------
def build(start, end):
    n_hits = 32
    for i in range(n_hits):
        u = i / n_hits
        at = start + (end - start - B / 2) * (1 - (1 - u) ** 1.6)
        place(drums, clap, at, 0.06 + 0.3 * u)
    rn = int((end - start) * SR); r = rng.standard_normal(rn); u = t_(rn) / (end - start); o = np.zeros(rn)
    for s0 in range(0, rn, 2048):
        c = 400 + 9000 * u[s0] ** 2
        o[s0:s0 + 2048] = bp(r[s0:s0 + 2048], c, c * 1.6, 1)
    place(fx, o * u ** 2 * 0.5, start)
    sw = saw(1, rn) * 0  # pitch riser
    f = 110 * 2 ** (3 * u); ph = np.cumsum(f) / SR
    place(fx, lp((2 * (ph % 1) - 1) * u ** 2, 5000) * 0.12, start)


def impact(at, g=1.0):
    n = int(2.2 * SR); tt = t_(n)
    s = np.sin(2 * np.pi * np.cumsum(32 + 90 * np.exp(-tt / 0.07)) / SR) * np.exp(-tt / 0.8) + lp(rng.standard_normal(n), 2500) * np.exp(-tt / 0.25) * 0.4
    place(fx, s, at, 0.7 * g)


build(DROP1 - 2 * BAR, DROP1)
build(BRK + 4 * BAR, DROP2)
build(STAR, END)
for a in (DROP1, DROP2, END): impact(a)
for buf in (pads, chords, lead, bass, drums, fx):
    for d in (DROP1, DROP2, END):  # silence for the last half beat before each hit
        i0, i1 = int((d - B / 2) * SR), int(d * SR)
        buf[i0:i1] *= np.linspace(1, 0, i1 - i0) ** 0.25 if buf is not fx else 0.0
# the intro starts quiet and swells into the drop
i1 = int(DROP1 * SR); u = t_(i1) / DROP1
for buf in (pads, lead, bass, drums):
    buf[:i1] *= 0.3 + 0.55 * u ** 2
# star build: the drop's groove stops, only the build plays
for buf in (chords, bass):
    buf[int(STAR * SR):int(END * SR)] = 0

# ---------- the final chord ----------
for i, x in enumerate(['F1', 'F2', 'C3', 'F3', 'Ab3', 'C4', 'F4']):
    n = int(7 * SR); tt = t_(n)
    s = lp(supersaw(note(x), n, 5, 0.12), 2500) * np.exp(-tt / 2.2) * np.minimum(1, tt / 0.01)
    place(pads, s, END + i * 0.01, 0.22)

# ---------- typing on the on-screen lines ----------
def key(v):
    n = int(0.06 * SR); tt = t_(n); f = 2600 + 900 * v
    return (bp(rng.standard_normal(n), f, f * 1.9) * np.exp(-tt / 0.004) + np.sin(2 * np.pi * (170 + 50 * v) * tt) * np.exp(-tt / 0.018) * 0.5) * np.minimum(1, tt / 0.0008)
for line, t0 in LINES:
    for i, _ in enumerate(line.split(' ')):
        place(fx, key(rng.random()), t0 + i * 0.07 + 0.02, 0.09)

# ---------- mix ----------
duck = np.ones(N)
k = 0
while k * B < DUR:
    at = k * B
    if DROP1 - 0.01 <= at < BRK or DROP2 - 0.01 <= at < STAR:
        i = int(at * SR); m = int(B * SR)
        d = 1 - 0.75 * np.exp(-t_(m) / 0.09); duck[i:i + m] = np.minimum(duck[i:i + m], d[:len(duck[i:i + m])])
    k += 1


def reverb(x, secs=2.5, wet=0.3):
    n = int(secs * SR)
    ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 6000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]


mixd = reverb((pads + chords) * duck + lead * (0.5 + 0.5 * duck), 2.4, 0.3) + bass * duck + drums + reverb(fx, 1.8, 0.2)
mixd = mixd[:int(DUR * SR)]
mixd *= np.minimum(1, t_(len(mixd)) / 0.05) * np.minimum(1, (DUR - t_(len(mixd))) / 1.5)
mixd = np.tanh(mixd * 1.1) / 1.1
st = np.stack([mixd, np.roll(mixd, 17) * 0.97 + mixd * 0.03], 1)
st /= np.max(np.abs(st)) * 1.05
with wave.open('out/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote', st.shape[0] / SR, 's')
