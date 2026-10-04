"""Paper-to-NOVA Short: pencil scratches on every stroke, page rustle, plucked acoustic guitar (Karplus-Strong)
building into the POP, then a warm strummed groove with soft claps. Synthesized, no samples."""
import json, wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
D = json.load(open('out/timeline.json'))
T, DUR, STROKES, LINES = D['T'], D['DUR'], D['STROKES'], D['LINES']
N = int(DUR * SR) + SR * 3
rng = np.random.default_rng(41)
BPM = 96; B = 60 / BPM


def t_(n): return np.arange(n) / SR
def lp(x, f, o=2): b, a = butter(o, min(f, SR * .45) / (SR / 2), 'low'); return lfilter(b, a, x)
def hp(x, f, o=2): b, a = butter(o, f / (SR / 2), 'high'); return lfilter(b, a, x)
def bp(x, lo, hi, o=2): b, a = butter(o, [lo / (SR / 2), min(hi, SR * .45) / (SR / 2)], 'band'); return lfilter(b, a, x)
def note(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    return 440 * 2 ** ((names[name[:-1]] + 12 * (int(name[-1]) + 1) - 69) / 12)
def place(buf, sig, at, g=1.0):
    i = int(round(at * SR))
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), len(buf) - i)
    if n > 0: buf[i:i + n] += sig[:n] * g


def pluck(f, dur=2.0, bright=0.5):
    """Karplus-Strong plucked string: a noise burst through a tuned, damped feedback delay (as one IIR filter)."""
    n = int(dur * SR); p = max(2, int(round(SR / f)))
    x = np.zeros(n); x[:p] = lp(rng.standard_normal(p), 2000 + 6000 * bright)
    damp = 0.996 - 0.004 * min(1.0, f / 1000)
    a = np.zeros(p + 2); a[0] = 1; a[p] = -0.5 * damp; a[p + 1] = -0.5 * damp
    return lfilter([1.0], a, x) * np.minimum(1, t_(n) / 0.002)

guitar, perc, fx = (np.zeros(N) for _ in range(3))
# G - D/F# - Em - C, as guitar voicings (low to high)
CH = [['G2', 'B2', 'D3', 'G3', 'B3', 'G4'], ['F#2', 'A2', 'D3', 'A3', 'D4', 'F#4'], ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'], ['C3', 'E3', 'G3', 'C4', 'E4', 'G4']]
cache = {}
def P(nm, dur=2.2, br=0.5):
    k = (nm, dur, br)
    if k not in cache: cache[k] = pluck(note(nm), dur, br)
    return cache[k]

# ---------- 1. while drawing: a gentle fingerpicked pattern ----------
pattern = [0, 3, 2, 4, 1, 3, 2, 5]
t = 0.4; k = 0
while t < T['zoom']:
    ch = CH[(k // 8) % 4]
    place(guitar, P(ch[pattern[k % 8]], 1.8, 0.35), t, 0.28 if k % 8 else 0.38)
    t += B / 2; k += 1
# ---------- 2. the dive: picking speeds up into a tremolo, a riser, then silence ----------
t = T['zoom']; step = B / 2
while t < T['pop'] - 0.2:
    u = (t - T['zoom']) / (T['pop'] - T['zoom'])
    ch = CH[3] if u < 0.5 else CH[1]
    place(guitar, P(ch[3 + (k % 3)], 1.0, round(0.5 + 0.4 * u, 1)), t, 0.22 + 0.15 * u)
    step = max(0.06, step * 0.93); t += step; k += 1
rn = int((T['pop'] - T['zoom']) * SR); uu = t_(rn) / (T['pop'] - T['zoom']); r = rng.standard_normal(rn); o = np.zeros(rn)
for s0 in range(0, rn, 2048):
    c = 400 + 6000 * uu[s0] ** 2; o[s0:s0 + 2048] = bp(r[s0:s0 + 2048], c, c * 1.6, 1)
place(fx, o * uu ** 2.2 * 0.35, T['zoom'])
i0, i1 = int((T['pop'] - 0.2) * SR), int(T['pop'] * SR)
for buf in (guitar, fx): buf[i0:i1] *= np.linspace(1, 0, i1 - i0) ** 0.5
# ---------- 3. POP: a soft boom, a bright full strum, a shimmer ----------
n = int(2.0 * SR); tt = t_(n)
place(fx, np.sin(2 * np.pi * np.cumsum(40 + 100 * np.exp(-tt / 0.05)) / SR) * np.exp(-tt / 0.5) + hp(rng.standard_normal(n), 3000) * np.exp(-tt / 0.04) * 0.5, T['pop'], 0.7)
for i, nm in enumerate(CH[0]): place(guitar, P(nm, 3.0, 0.8), T['pop'] + i * 0.012, 0.4)
for i, nm in enumerate(['G5', 'B5', 'D6', 'G6']): place(guitar, P(nm, 2.0, 0.9), T['pop'] + 0.15 + i * 0.07, 0.12)
# ---------- 4. after the pop: a warm strummed groove with claps ----------
def strum(ch, at, down=True, g=0.3, br=0.6):
    order = ch if down else ch[::-1]
    for i, nm in enumerate(order): place(guitar, P(nm, 1.6, br), at + i * 0.011, g * (0.7 + 0.3 * (i / 5)))
bar = 4 * B; t = T['pop'] + 2 * B; j = 0
groove = [(0, True, 0.34), (1, True, 0.18), (1.5, False, 0.16), (2.5, False, 0.16), (3, True, 0.22), (3.5, False, 0.16)]
while t < DUR - 1.0:
    ch = CH[j % 4]
    for beat, down, g in groove: strum(ch, t + beat * B, down, g * (0.75 if t > T['end'] + 1 else 1))
    t += bar; j += 1
cn = int(0.25 * SR); clap = np.zeros(cn)
for o_ in (0, 0.009, 0.018):
    i = int(o_ * SR); clap[i:] += bp(rng.standard_normal(cn - i), 900, 5000) * np.exp(-t_(cn - i) / (0.07 if o_ == 0.018 else 0.006))
kick = np.sin(2 * np.pi * np.cumsum(50 + 70 * np.exp(-t_(int(0.25 * SR)) / 0.03)) / SR) * np.exp(-t_(int(0.25 * SR)) / 0.12)
t = T['pop'] + 2 * B
while t < DUR - 1.2:
    for bt in range(4):
        if bt % 2: place(perc, clap, t + bt * B, 0.14)
        else: place(perc, kick, t + bt * B, 0.22)
    t += 4 * B
# final chord on "come true with NOVA"
for i, nm in enumerate(CH[0]): place(guitar, P(nm, 4.0, 0.5), T['end'] + 0.85 + i * 0.03, 0.3)

# ---------- pencil and paper sounds ----------
def scratch(d, w):
    n = int(d * SR); tt = t_(n)
    s = bp(rng.standard_normal(n), 2500, 9000) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * (6 + 4 * rng.random()) * tt)))
    return s * np.minimum(1, tt / 0.01) * np.minimum(1, (d - tt) / 0.02)
for t0, d, w in STROKES:
    if d >= 0.06: place(fx, scratch(max(0.06, d), w), t0, 0.04 + 0.012 * w)
# handwriting for the notes and the ending: a longer, softer scratch
for t0, d in [(0.9, 0.9), (1.5, 0.5), (6.3, 0.35), (6.4, 0.6), (6.6, 0.5), (6.8, 0.4), (T['end'], 0.9), (T['end'] + 0.8, 1.0)]:
    place(fx, scratch(d, 2), t0, 0.06)
# a page rustle at the very start
n = int(0.6 * SR); tt = t_(n)
place(fx, bp(rng.standard_normal(n), 800, 6000) * np.sin(np.pi * tt / 0.6) ** 2 * (0.5 + 0.5 * np.sin(2 * np.pi * 18 * tt)), 0.0, 0.12)

# ---------- mix ----------
def reverb(x, secs=2.0, wet=0.3):
    n = int(secs * SR); ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 6000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]
mixd = reverb(guitar, 2.2, 0.32) + perc + reverb(fx, 1.0, 0.12)
mixd = mixd[:int(DUR * SR)]
tt = t_(len(mixd)); mixd *= np.minimum(1, tt / 0.05) * np.minimum(1, (DUR - tt) / 1.8)
mixd = np.tanh(mixd * 1.2) / 1.2
st = np.stack([mixd, np.roll(mixd, 19) * 0.96 + mixd * 0.04], 1); st /= np.max(np.abs(st)) * 1.05
with wave.open('out/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote', st.shape[0] / SR, 's')
