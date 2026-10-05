"""'ok we need to talk' Short: no voice, so the music carries it. Lo-fi at 84 BPM. Quiet keys and vinyl crackle with typing
clicks at the start, the beat drops on "yes. i use ai.", pauses on "still don't trust it?", comes back for the beta testers.
Pops on stickers and diagram steps, soft whooshes on the comment bubbles."""
import json, wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
D = json.load(open('out/timeline.json'))
EV, DUR, END = D['EV'], D['DUR'], D['END']; E = EV['E']
N = int(DUR * SR) + SR * 3
rng = np.random.default_rng(7)
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
def keys(f, d=2.0, v=1.0):                       # soft electric piano
    n = int(d * SR); tt = t_(n)
    s = np.sin(2 * np.pi * f * tt + 0.6 * np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.4)) * np.exp(-tt / 1.1)
    return lp(s, 2600) * np.minimum(1, tt / 0.006) * (1 + 0.04 * np.sin(2 * np.pi * 5 * tt)) * v
def pop(f=900, d=0.12):
    n = int(d * SR); tt = t_(n)
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 1.5 * np.exp(-tt / 0.01))) / SR) * np.exp(-tt / 0.03)
def click():
    n = int(0.03 * SR); return bp(rng.standard_normal(n), 1500, 6000) * np.exp(-t_(n) / 0.004)
def whoosh(d=0.45):
    n = int(d * SR); r = rng.standard_normal(n); o = np.zeros(n)
    for s0 in range(0, n, 1024):
        u = s0 / n; f = 500 + 3500 * u; o[s0:s0 + 1024] = bp(r[s0:s0 + 1024], f, f * 1.7, 1)
    return o * np.sin(np.pi * t_(n) / d) ** 2
def thud(d=0.6):
    n = int(d * SR); tt = t_(n)
    return np.tanh(2 * np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-tt / 0.03)) / SR) * np.exp(-tt / 0.18)) + hp(rng.standard_normal(n), 3000) * np.exp(-tt / 0.02) * 0.4

music, sfx = np.zeros(N), np.zeros(N)
BPM = 84; B = 60 / BPM; BAR = 4 * B
CH = [['D3', 'F3', 'A3', 'C4', 'E4'], ['G2', 'F3', 'A#3', 'D4'], ['C3', 'E3', 'G3', 'A#3', 'D4'], ['A2', 'E3', 'G3', 'C4']]   # Dm9 G7 C9 Am7
kn = int(0.3 * SR); kick = np.sin(2 * np.pi * np.cumsum(48 + 80 * np.exp(-t_(kn) / 0.025)) / SR) * np.exp(-t_(kn) / 0.12)
sn = int(0.3 * SR); snare = bp(rng.standard_normal(sn), 1200, 7000) * np.exp(-t_(sn) / 0.07) + np.sin(2 * np.pi * 190 * t_(sn)) * np.exp(-t_(sn) / 0.04) * 0.4
hn = int(0.05 * SR); hat = hp(rng.standard_normal(hn), 7000) * np.exp(-t_(hn) / 0.015)
beat_on = lambda t: (E['yes'] - 0.05 <= t < E['trust'] - 0.2) or (E['beta'] - 0.05 <= t < END - 0.2)
t0, k = 0.3, 0
while t0 < END + 1:
    ch = CH[k % 4]
    for i, n_ in enumerate(ch): place(music, keys(note(n_), BAR + 0.5, 0.18), t0 + i * 0.02)
    place(music, keys(note(ch[-1]) * 2, 1.0, 0.07), t0 + 2.5 * B)
    for b in range(4):
        tb = t0 + b * B
        if not beat_on(tb): continue
        swing = 0.03
        if b in (0, 2): place(music, kick, tb, 0.8); place(music, keys(note(ch[0]) / 2, 0.9, 0.5), tb)   # bass
        if b == 2: place(music, kick, tb + B * 0.5 + swing, 0.5)
        if b in (1, 3): place(music, snare, tb, 0.28)
        place(music, hat, tb, 0.08); place(music, hat, tb + B / 2 + swing, 0.05)
    t0 += BAR; k += 1
crackle = np.zeros(N); idx = rng.integers(0, N, int(DUR * 40)); crackle[idx] = rng.standard_normal(len(idx)) * 0.6
music += lp(hp(crackle, 1500), 8000) * 0.5 + lp(rng.standard_normal(N), 400) * 0.004

# typing clicks for "ok." and "we need to talk."
for s, t1, cps in [('ok.', E['ok'], 9), ('we need to talk.', E['talk'], 15)]:
    for i in range(len(s)): place(sfx, click(), t1 + i / cps, 0.35)
for t1 in EV['bubbles']: place(sfx, whoosh(0.4), t1 - 0.05, 0.16); place(sfx, pop(700, 0.1), t1 + 0.25, 0.12)
place(sfx, thud(), E['stamp'], 0.55)
for i, t1 in enumerate(EV['nodes']): place(sfx, pop(600 + 150 * i), t1 + 0.05, 0.3)
for t1 in EV['stickers']: place(sfx, pop(1100, 0.1), t1 + 0.05, 0.3); place(sfx, thud(0.3), t1 + 0.05, 0.15)
# end: a warm chord with the logo
for i, n_ in enumerate(['D2', 'A2', 'F3', 'C4', 'E4', 'A4']): place(music, keys(note(n_), 4.0, 0.25), END + i * 0.02)

def reverb(x, secs=1.6, wet=0.25):
    n = int(secs * SR); ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 6000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]
mixd = np.tanh((reverb(lp(music, 5000), 1.8, 0.25) * 0.9 + reverb(sfx, 0.8, 0.12) * 0.8) * 1.1) / 1.1
mixd = mixd[:int(DUR * SR)]
tt = t_(len(mixd)); mixd *= np.minimum(1, tt / 0.05) * np.minimum(1, (DUR - tt) / 1.2)
st = np.stack([mixd, np.roll(mixd, 13) * 0.97 + mixd * 0.03], 1); st /= np.max(np.abs(st)) * 1.05
with wave.open('out/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote', st.shape[0] / SR, 's')
