"""Privacy TikTok, take 2: lo-fi piano intro, then a trap beat (808 slides, hat rolls, bell hook). Synthesized, no samples."""
import json, wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
D = json.load(open('out/timeline.json'))
T, LINES, DUR = D['T'], D['LINES'], D['DUR']
BPM = 60 * 8 / T['drop']          # 8 beats before the drop -> the hit lands on a downbeat
B = 60 / BPM; BAR = 4 * B
N = int(DUR * SR) + SR * 3
rng = np.random.default_rng(5)
DROP, BRK, BRK_END, END = T['drop'], T['more'] - 0.05, T['end'] - 0.3, T['end']

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

# A minor: Am - F - C - G
CH = [['A2', 'C4', 'E4', 'A4'], ['F2', 'A3', 'C4', 'F4'], ['C3', 'E4', 'G4', 'C5'], ['G2', 'B3', 'D4', 'G4']]
BELL = [['E5', None, 'A5', 'C6', None, 'B5', 'A5', None], ['C6', None, 'A5', None, 'F5', 'G5', 'A5', None],
        ['G5', None, 'E5', 'G5', None, 'C6', 'B5', None], ['D6', None, 'B5', None, 'G5', 'A5', 'B5', None]]

keys, bell, low, drums, fx = (np.zeros(N) for _ in range(5))

def piano(f, dur=2.5, v=1.0):
    n = int(dur * SR); tt = t_(n)
    s = sum(np.sin(2 * np.pi * f * h * tt) * np.exp(-tt * (0.9 + 1.2 * h)) / h ** 1.3 for h in (1, 2, 3, 4))
    return s * np.minimum(1, tt / 0.003) * v

def bellv(f, dur=1.2):
    n = int(dur * SR); tt = t_(n)
    s = np.sin(2 * np.pi * f * tt + 1.8 * np.sin(2 * np.pi * f * 3.5 * tt) * np.exp(-tt / 0.25))  # FM bell
    return s * np.exp(-tt / 0.45) * np.minimum(1, tt / 0.002)

def m808(f0, dur, slide_to=None):
    n = int(dur * SR); tt = t_(n)
    f = f0 * np.ones(n) if slide_to is None else f0 * (slide_to / f0) ** np.clip((tt - dur * 0.55) / 0.08, 0, 1)
    s = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.8 * np.exp(-tt / 0.012))) / SR)
    s = np.tanh(s * 2.2) * np.exp(-tt / (dur * 0.9)) * np.minimum(1, (dur - tt) / 0.02)
    return s

nb = int(DUR / BAR) + 1
for j in range(nb):
    st = j * BAR
    if st >= DUR: break
    ch = CH[j % 4]
    groove = DROP - 0.01 <= st < BRK or BRK_END <= st < END
    brk = BRK <= st < BRK_END
    if st < DROP or brk:
        # lo-fi: muffled piano chords, swung
        for i, x in enumerate(ch):
            place(keys, lp(piano(note(x) * (2 if i == 0 else 1), 3.0, 0.5), 1400), st + i * 0.025, 0.5)
    if groove:
        for i, x in enumerate(ch[1:]):
            place(keys, piano(note(x), 2.2, 0.35), st + i * 0.02, 0.4)
        for k, nm in enumerate(BELL[j % 4]):
            if nm: place(bell, bellv(note(nm)), st + k * B / 2, 0.22)
        # 808: root on 1, a hit on the "and" of 2, slide into the next bar
        r = note(ch[0]) / 2 if note(ch[0]) > 90 else note(ch[0])
        nxt = note(CH[(j + 1) % 4][0]); nxt = nxt / 2 if nxt > 90 else nxt
        place(low, m808(r, 1.5 * B), st, 0.7)
        place(low, m808(r, 1.0 * B), st + 1.5 * B, 0.55)
        place(low, m808(r, 1.5 * B, nxt), st + 2.5 * B, 0.6)
    if st >= END:
        for i, x in enumerate(['A1', 'A2', 'E3', 'A3', 'C4', 'E4']):
            place(keys, piano(note(x), 6, 0.6), st + i * 0.03, 0.4)

# drums
kn = int(0.25 * SR); tk = t_(kn)
kick = np.sin(2 * np.pi * np.cumsum(55 + 160 * np.exp(-tk / 0.02)) / SR) * np.exp(-tk / 0.12)
sn_n = int(0.3 * SR); snare = bp(rng.standard_normal(sn_n), 1500, 9000) * np.exp(-t_(sn_n) / 0.09) + np.sin(2 * np.pi * 190 * t_(sn_n)) * np.exp(-t_(sn_n) / 0.04) * 0.5
hn = int(0.04 * SR); hat = hp(rng.standard_normal(hn), 8500) * np.exp(-t_(hn) / 0.008)
k = 0
while k * B < DUR:
    at = k * B; inbar = k % 4
    groove = DROP - 0.01 <= at < BRK or BRK_END <= at < END
    if groove:
        if inbar == 0: place(drums, kick, at, 0.7)
        if inbar == 2: place(drums, snare, at, 0.42)   # half-time snare on 3
        # hats on 8ths, with a 32nd roll every second bar
        roll = (k // 4) % 2 == 1 and inbar == 3
        steps = [i / 8 for i in range(8)] if roll else [0, 0.5]
        for s_ in steps: place(drums, hat, at + s_ * B, 0.06 + (0.03 if roll else 0))
    k += 1

# vinyl crackle under the lo-fi parts
cr = np.zeros(N)
for _ in range(int(DUR * 25)):
    i = rng.integers(0, N - 200); cr[i:i + 40] += rng.standard_normal(40) * np.exp(-np.arange(40) / 6) * rng.uniform(0.1, 0.5)
mask = np.zeros(N); mask[:int(DROP * SR)] = 1; mask[int(BRK * SR):int(BRK_END * SR)] = 1
fx += hp(cr, 2000) * mask * 0.25
# riser into the drop, impact on the drop and on the end
rn = int(1.6 * SR); u = t_(rn) / 1.6; r = rng.standard_normal(rn); o = np.zeros(rn)
for s0 in range(0, rn, 2048):
    c = 600 + 8000 * u[s0] ** 2; o[s0:s0 + 2048] = bp(r[s0:s0 + 2048], c, c * 1.6, 1)
place(fx, o * u ** 2 * 0.4, DROP - 1.6)
def impact(at, g):
    n = int(2.0 * SR); tt = t_(n)
    place(fx, np.sin(2 * np.pi * np.cumsum(35 + 80 * np.exp(-tt / 0.06)) / SR) * np.exp(-tt / 0.7), at, g)
impact(DROP, 0.6); impact(END, 0.55)
for buf in (keys, low, drums, fx):
    i0, i1 = int((DROP - B / 2) * SR), int(DROP * SR); buf[i0:i1] *= np.linspace(1, 0, i1 - i0) ** 0.3

# typing on the on-screen lines, whooshes on scene changes, a soft chime on the end card
def key(v):
    n = int(0.06 * SR); tt = t_(n); f = 2600 + 900 * v
    return (bp(rng.standard_normal(n), f, f * 1.9) * np.exp(-tt / 0.004) + np.sin(2 * np.pi * (170 + 50 * v) * tt) * np.exp(-tt / 0.018) * 0.5) * np.minimum(1, tt / 0.0008)
for line, t0 in LINES:
    for i, _ in enumerate(line.split(' ')): place(fx, key(rng.random()), t0 + i * 0.07 + 0.02, 0.08)
def whoosh(at):
    n = int(0.6 * SR); r = rng.standard_normal(n); u = t_(n) / 0.6; o = np.zeros(n)
    for s0 in range(0, n, 2048):
        c = 400 * 7 ** np.sin(np.pi * u[s0] * 0.5); o[s0:s0 + 2048] = bp(r[s0:s0 + 2048], c, c * 1.8, 1)
    place(fx, o * np.sin(np.pi * u) ** 2, at - 0.3, 0.12)
for s_ in D['STEPS']: whoosh(s_)
for i, f in enumerate([note('A5'), note('E6'), note('C6')]): place(bell, bellv(f, 2.5), T['soon'] + 0.1 + i * 0.08, 0.15)

# mix: duck keys/bells under the kick a little
def reverb(x, secs=2.2, wet=0.3):
    n = int(secs * SR); ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 6000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]
mixd = reverb(keys + bell, 2.4, 0.35) + low + drums + reverb(fx, 1.5, 0.15)
mixd = mixd[:int(DUR * SR)]
tt = t_(len(mixd)); mixd *= np.minimum(1, tt / 0.05) * np.minimum(1, (DUR - tt) / 1.5)
mixd = np.tanh(mixd * 1.1) / 1.1
st = np.stack([mixd, np.roll(mixd, 15) * 0.97 + mixd * 0.03], 1); st /= np.max(np.abs(st)) * 1.05
with wave.open('out/music-trap.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote', st.shape[0] / SR, 's')
