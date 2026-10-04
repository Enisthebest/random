"""'NOVA OS in 20 seconds' Short: lo-fi hip-hop (Rhodes, swung boom-bap, vinyl) plus real UI sounds on every click and key. Synthesized, no samples."""
import json, wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
D = json.load(open('out/timeline.json'))
T, DUR, SHOTS, CLICKS, KEYS = D['T'], D['DUR'], D['CUTS'], D['CLICKS'], D['KEYS']
N = int(DUR * SR) + SR * 3
rng = np.random.default_rng(23)
BPM = 84; B = 60 / BPM; BAR = 4 * B; SW = 0.62   # swing: the off-16th lands at 62%


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


keys, bass, drums, sfx = (np.zeros(N) for _ in range(4))

# Rhodes-style electric piano: FM bell tone with a soft tremolo
def rhodes(f, dur=2.2, v=1.0):
    n = int(dur * SR); tt = t_(n)
    mod = np.sin(2 * np.pi * f * tt) * 1.4 * np.exp(-tt / 0.4)
    s = np.sin(2 * np.pi * f * tt + mod) * np.exp(-tt / 1.3) * (1 + 0.12 * np.sin(2 * np.pi * 4.5 * tt))
    return lp(s, 3200) * np.minimum(1, tt / 0.004) * v

# Dm9 - G13 - Cmaj9 - A7(b9), one chord per bar
CH = [['D2', 'F3', 'A3', 'C4', 'E4'], ['G2', 'F3', 'B3', 'E4', 'A4'], ['C2', 'E3', 'G3', 'B3', 'D4'], ['A1', 'G3', 'C#4', 'E4', 'A#4']]
END = T['end']
nb = int(DUR / BAR) + 1
for j in range(nb):
    st = j * BAR
    if st >= DUR: break
    ch = CH[j % 4]
    if st < END + 0.3:
        for i, x in enumerate(ch[1:]):  # rolled chord on 1, a softer stab on the "and" of 2
            place(keys, rhodes(note(x), 2.4, 0.5), st + i * 0.018)
            place(keys, rhodes(note(x), 0.9, 0.22), st + 1.5 * B + i * 0.012)
        # bass: root on 1, octave slide on 3
        for at, f, d in [(0, note(ch[0]), 1.6 * B), (2.5 * B, note(ch[0]) * 2 ** (7 / 12), 1.2 * B)]:
            n = int(d * SR); tt = t_(n)
            place(bass, lp(np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt), 400) * np.exp(-tt / (d * 0.8)) * np.minimum(1, tt / 0.01), st + at, 0.45)
# final chord under the end card, then let it ring
for i, x in enumerate(['D2', 'A2', 'F3', 'A3', 'C4', 'E4', 'A4']):
    place(keys, rhodes(note(x), 5.0, 0.45), END + 0.05 + i * 0.03)

# drums: dusty boom-bap
kn = int(0.35 * SR); tk = t_(kn)
kick = lp(np.sin(2 * np.pi * np.cumsum(48 + 90 * np.exp(-tk / 0.03)) / SR) * np.exp(-tk / 0.22), 2000)
sn = int(0.35 * SR); ts = t_(sn)
snare = bp(rng.standard_normal(sn), 900, 6000) * np.exp(-ts / 0.11) * 0.8 + np.sin(2 * np.pi * 180 * ts) * np.exp(-ts / 0.05) * 0.6
hn = int(0.05 * SR); hat = bp(rng.standard_normal(hn), 6000, 12000) * np.exp(-t_(hn) / 0.012)
k = 0
while k * BAR < END:
    st = k * BAR
    for at in (0, 1.75 * B if k % 2 else 2.5 * B):            # kick on 1, then a lazy ghost kick
        place(drums, kick, st + at, 0.7 if at == 0 else 0.45)
    for at in (B, 3 * B): place(drums, snare, st + at, 0.38)   # snare on 2 and 4
    for q in range(8):                                         # swung hats
        at = st + (q // 2) * B + (SW * B if q % 2 else 0)
        place(drums, hat, at, 0.06 if q % 2 else 0.09)
    k += 1

# vinyl crackle and a little tape hiss all the way through
cr = np.zeros(N)
for _ in range(int(DUR * 30)):
    i = rng.integers(0, N - 200); cr[i:i + 40] += rng.standard_normal(40) * np.exp(-np.arange(40) / 5) * rng.uniform(0.1, 0.6)
sfx += hp(cr, 2500) * 0.18 + lp(hp(rng.standard_normal(N), 3000), 9000) * 0.004

# ---------- UI sounds ----------
def click():   # a soft trackpad click
    n = int(0.03 * SR); tt = t_(n)
    return (hp(rng.standard_normal(n), 3000) * np.exp(-tt / 0.002) + np.sin(2 * np.pi * 1900 * tt) * np.exp(-tt / 0.005) * 0.5)
def keytap(v):  # a mechanical key
    n = int(0.07 * SR); tt = t_(n); f = 2400 + 700 * v
    return (bp(rng.standard_normal(n), f, f * 1.9) * np.exp(-tt / 0.005) + np.sin(2 * np.pi * (150 + 60 * v) * tt) * np.exp(-tt / 0.02) * 0.6) * np.minimum(1, tt / 0.0008)
def blip(f, d=0.18):  # soft UI chime when a new screen opens
    n = int(d * SR); tt = t_(n)
    return (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2 * tt)) * np.exp(-tt / (d / 3)) * np.minimum(1, tt / 0.002)
for c in CLICKS: place(sfx, click(), c, 0.5)
for t0, n_keys in KEYS:
    for j in range(n_keys): place(sfx, keytap(rng.random()), t0 + j * 0.12 + 0.02, 0.35)
scale = ['A5', 'C6', 'D6', 'E6', 'G6', 'A6']
for i, s0 in enumerate(SHOTS[1:]):
    place(sfx, blip(note(scale[i % len(scale)])), s0 - 0.05, 0.06)
# unlock: two rising notes; end card: a warm three-note chime
place(sfx, blip(note('D6'), 0.3), SHOTS[2] - 0.1, 0.1); place(sfx, blip(note('A6'), 0.4), SHOTS[2] + 0.02, 0.1)
for i, x in enumerate(['D6', 'F6', 'A6']): place(sfx, blip(note(x), 1.2), END + 0.3 + i * 0.09, 0.09)

# ---------- mix ----------
def reverb(x, secs=1.8, wet=0.25):
    n = int(secs * SR); ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 5000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]
music = reverb(keys, 2.0, 0.3) + bass + drums
music = lp(music, 9000)                                   # lo-fi: roll off the top
mixd = music * 0.9 + reverb(sfx, 1.2, 0.15)
mixd = mixd[:int(DUR * SR)]
tt = t_(len(mixd)); mixd *= np.minimum(1, tt / 0.3) * np.minimum(1, (DUR - tt) / 1.8)
mixd = np.tanh(mixd * 1.0)
st = np.stack([mixd, np.roll(mixd, 21) * 0.96 + mixd * 0.04], 1); st /= np.max(np.abs(st)) * 1.05
with wave.open('out/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote', st.shape[0] / SR, 's')
