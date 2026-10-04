"""Paper-to-NOVA Short: pencil scratches on every stroke, page rustle, a dreamy music box and felt piano,
strings swelling into the POP, then an uplifting piano chorus with a gentle beat. Synthesized, no samples."""
import json, wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
D = json.load(open('out/timeline.json'))
T, DUR, STROKES, LINES = D['T'], D['DUR'], D['STROKES'], D['LINES']
N = int(DUR * SR) + SR * 3
rng = np.random.default_rng(41)
BPM = 84; B = 60 / BPM


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


guitar, perc, fx = (np.zeros(N) for _ in range(3))   # guitar = the tonal music bus

def musicbox(f, dur=2.0):
    """A music-box / celesta tone: FM bell, quick attack, long soft decay."""
    n = int(dur * SR); tt = t_(n)
    s = np.sin(2 * np.pi * f * tt + 1.1 * np.exp(-tt / 0.15) * np.sin(2 * np.pi * f * 4.0 * tt))
    s += 0.25 * np.sin(2 * np.pi * f * 2 * tt) * np.exp(-tt / 0.3)
    return s * np.exp(-tt / 0.7) * np.minimum(1, tt / 0.002)
def felt(f, dur=2.6, v=1.0):
    n = int(dur * SR); tt = t_(n)
    s = sum(np.sin(2 * np.pi * f * h * tt) * np.exp(-tt * (0.9 + 1.5 * h)) / h ** 1.6 for h in (1, 2, 3))
    return lp(s, 2800) * np.minimum(1, tt / 0.005) * v
def strings(fs, dur, attack=1.5):
    n = int(dur * SR); tt = t_(n)
    s = sum(np.sin(2 * np.pi * f * tt + 0.2 * np.sin(2 * np.pi * 5.2 * tt + k)) + 0.4 * np.sin(2 * np.pi * f * 2.002 * tt) for k, f in enumerate(fs)) / len(fs)
    return lp(s, 2200) * np.minimum(1, tt / attack) * np.minimum(1, (dur - tt) / 0.4)

# D major, dreamy: Dmaj7 - Bm7 - Gmaj7 - A6
CH = [['D3', 'F#3', 'A3', 'C#4'], ['B2', 'D3', 'F#3', 'A3'], ['G2', 'B2', 'D3', 'F#3'], ['A2', 'C#3', 'E3', 'F#3']]
MEL = [['F#5', 'A5', 'C#6', 'A5'], ['D6', 'C#6', 'B5', 'F#5'], ['G5', 'B5', 'D6', 'B5'], ['A5', 'E5', 'F#5', None]]
BAR = 4 * B

# 1. while drawing: a music box melody over soft piano chords
t = 0.3; j = 0
while t < T['zoom'] - 0.1:
    ch = CH[j % 4]
    for i, nm in enumerate(ch): place(guitar, felt(note(nm), 2.8, 0.28), t + i * 0.02)
    for k, nm in enumerate(MEL[j % 4]):
        if nm: place(guitar, musicbox(note(nm)), t + k * B, 0.12)
    t += BAR; j += 1

# 2. the dive: strings swell, the music box climbs faster, a soft riser, then a breath of silence
dive = T['pop'] - T['zoom']
place(guitar, strings([note(x) for x in ['D3', 'A3', 'D4', 'F#4', 'A4']], dive + 0.2, dive * 0.8), T['zoom'], 0.55)
t = T['zoom']; step = B / 2; k = 0
climb = ['D5', 'F#5', 'A5', 'D6', 'F#6', 'A6']
while t < T['pop'] - 0.25:
    place(guitar, musicbox(note(climb[k % 6]), 1.0), t, 0.1 + 0.06 * (t - T['zoom']) / dive)
    step = max(0.08, step * 0.92); t += step; k += 1
rn = int(dive * SR); uu = t_(rn) / dive; r = rng.standard_normal(rn); o = np.zeros(rn)
for s0 in range(0, rn, 2048):
    c = 400 + 6000 * uu[s0] ** 2; o[s0:s0 + 2048] = bp(r[s0:s0 + 2048], c, c * 1.6, 1)
place(fx, o * uu ** 2.4 * 0.25, T['zoom'])
i0, i1 = int((T['pop'] - 0.22) * SR), int(T['pop'] * SR)
for buf in (guitar, fx): buf[i0:i1] *= np.linspace(1, 0, i1 - i0) ** 0.5

# 3. POP: a soft boom, a sparkle cascade, the full chord
n = int(2.0 * SR); tt = t_(n)
place(fx, np.sin(2 * np.pi * np.cumsum(40 + 100 * np.exp(-tt / 0.05)) / SR) * np.exp(-tt / 0.5) + hp(rng.standard_normal(n), 3000) * np.exp(-tt / 0.04) * 0.4, T['pop'], 0.6)
for i, nm in enumerate(['D6', 'F#6', 'A6', 'D7', 'A6', 'F#6']): place(guitar, musicbox(note(nm), 1.5), T['pop'] + 0.02 + i * 0.06, 0.12)

# 4. after the pop: uplifting piano + pads + a gentle beat, the melody returns an octave up
t = T['pop']; j = 0
while t < DUR - 0.8:
    ch = CH[j % 4]
    place(guitar, strings([note(x) * 2 for x in ch], BAR + 0.3, 0.3), t, 0.35)
    for i, nm in enumerate(ch): place(guitar, felt(note(nm), 2.8, 0.55), t + i * 0.015)
    place(guitar, felt(note(ch[0]) / 2, 3.0, 0.5), t)                       # low root
    for half in range(8):                                                    # soft eighth-note piano pulse
        place(guitar, felt(note(ch[1 + half % 3]) * 2, 0.9, 0.18), t + half * B / 2 + 0.01)
    for k, nm in enumerate(MEL[j % 4]):
        if nm: place(guitar, musicbox(note(nm) * 2), t + k * B, 0.1)
    t += BAR; j += 1
cn = int(0.25 * SR); clap = np.zeros(cn)
for o_ in (0, 0.009, 0.018):
    i = int(o_ * SR); clap[i:] += bp(rng.standard_normal(cn - i), 900, 5000) * np.exp(-t_(cn - i) / (0.07 if o_ == 0.018 else 0.006))
kick = np.sin(2 * np.pi * np.cumsum(50 + 70 * np.exp(-t_(int(0.25 * SR)) / 0.03)) / SR) * np.exp(-t_(int(0.25 * SR)) / 0.12)
sh = hp(rng.standard_normal(int(0.04 * SR)), 8000) * np.exp(-t_(int(0.04 * SR)) / 0.01)
t = T['pop'] + BAR
while t < DUR - 1.2:
    for bt in range(4):
        if bt % 2: place(perc, clap, t + bt * B, 0.10)
        else: place(perc, kick, t + bt * B, 0.24)
        place(perc, sh, t + bt * B + B / 2, 0.05)
    t += BAR
# a final warm chord on "come true with NOVA"
for i, nm in enumerate(['D2', 'A2', 'D3', 'F#3', 'A3', 'D4', 'F#4']): place(guitar, felt(note(nm), 5.0, 0.26), T['end'] + 0.85 + i * 0.03)
for i, nm in enumerate(['A5', 'D6', 'F#6']): place(guitar, musicbox(note(nm), 2.5), T['end'] + 1.0 + i * 0.1, 0.1)

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
mixd = reverb(guitar, 2.8, 0.42) + perc + reverb(fx, 1.0, 0.12)
mixd = mixd[:int(DUR * SR)]
tt = t_(len(mixd)); mixd *= np.minimum(1, tt / 0.05) * np.minimum(1, (DUR - tt) / 1.8)
mixd = np.tanh(mixd * 1.2) / 1.2
st = np.stack([mixd, np.roll(mixd, 19) * 0.96 + mixd * 0.04], 1); st /= np.max(np.abs(st)) * 1.05
with wave.open('out/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote', st.shape[0] / SR, 's')
