"""Day-ones thank-you Short: warm and grateful. Soft piano chords and a pad, a gentle beat from the first name, a bright
pluck rising up the scale on every @name, a swell into "Thank you.", a bloom on "Day ones." Voice 4 on top with ducking."""
import json, wave
import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter, fftconvolve, resample_poly

SR = 48000
D = json.load(open('out/timeline.json'))
T, DUR, NAMES, END = D['T'], D['DUR'], D['NAMES'], D['END']; VO = T['vo']
N = int(DUR * SR) + SR * 3
rng = np.random.default_rng(31)
def t_(n): return np.arange(n) / SR
def lp(x, f, o=2): b, a = butter(o, min(f, SR * .45) / (SR / 2), 'low'); return lfilter(b, a, x)
def hp(x, f, o=2): b, a = butter(o, f / (SR / 2), 'high'); return lfilter(b, a, x)
def note(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    return 440 * 2 ** ((names[name[:-1]] + 12 * (int(name[-1]) + 1) - 69) / 12)
def place(buf, sig, at, g=1.0):
    i = int(round(at * SR))
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), len(buf) - i)
    if n > 0: buf[i:i + n] += sig[:n] * g
def piano(f, d=2.0, v=1.0):
    n = int(d * SR); tt = t_(n)
    s = sum(np.sin(2 * np.pi * f * h * tt) * np.exp(-tt * (1.2 + 1.6 * h)) / h ** 1.5 for h in (1, 2, 3, 4))
    return lp(s, 3200) * np.minimum(1, tt / 0.004) * v
def pad(fs, d):
    n = int(d * SR); tt = t_(n)
    s = sum(np.sin(2 * np.pi * f * (1 + dt) * tt) for f in fs for dt in (-0.003, 0, 0.003))
    return lp(s, 1600) * np.minimum(1, tt / 1.0) * np.minimum(1, (d - tt) / 1.0) / (3 * len(fs))
def pluck(f, d=0.9):
    n = int(d * SR); tt = t_(n)
    s = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(4 * np.pi * f * tt) + 0.15 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt / 0.22)
    return s * np.minimum(1, tt / 0.002)
def bell(f, d=2.5):
    n = int(d * SR); tt = t_(n)
    return (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt / 0.3)) * np.exp(-tt / 0.9)

music, sfx, vo = (np.zeros(N) for _ in range(3))
BPM = 90; B = 60 / BPM; BAR = 4 * B
CH = [['F3', 'A3', 'C4', 'E4'], ['A2', 'C4', 'E4', 'G4'], ['D3', 'F3', 'A3', 'C4'], ['A#2', 'D4', 'F4', 'A4']]   # Fmaj7 Am7 Dm7 Bbmaj7
kn = int(0.25 * SR); kick = np.sin(2 * np.pi * np.cumsum(50 + 90 * np.exp(-t_(kn) / 0.02)) / SR) * np.exp(-t_(kn) / 0.09)
sn = int(0.25 * SR); snap = hp(rng.standard_normal(sn), 1800) * np.exp(-t_(sn) / 0.045)
hn = int(0.05 * SR); hat = hp(rng.standard_normal(hn), 8000) * np.exp(-t_(hn) / 0.012)
t0, k = 0.0, 0
while t0 < END + 2:
    ch = CH[k % 4]
    place(music, pad([note(n) for n in ch], BAR + 1.0), t0, 0.5)
    for i, n_ in enumerate(ch): place(music, piano(note(n_), 2.4, 0.22), t0 + i * 0.03)
    place(music, piano(note(ch[2]), 1.5, 0.12), t0 + 2 * B)
    beat = NAMES[0] - 0.05 <= t0 < VO[1] - 0.3
    if beat:
        for b in range(4):
            if b in (0, 2): place(music, kick, t0 + b * B, 0.7)
            if b in (1, 3): place(music, snap, t0 + b * B, 0.18)
        for h in range(8): place(music, hat, t0 + h * B / 2, 0.06 if h % 2 else 0.09)
    t0 += BAR; k += 1
# a rising pluck on every name (F major pentatonic)
SCALE = ['C5', 'D5', 'F5', 'G5', 'A5', 'C6', 'D6', 'F6']
for i, at in enumerate(NAMES): place(sfx, pluck(note(SCALE[i % len(SCALE)])), at, 0.35); place(sfx, bell(note(SCALE[i % len(SCALE)]) * 2, 1.2), at, 0.05)
# swell into "Thank you." and a warm chord on it
sw = int(1.2 * SR); place(sfx, lp(rng.standard_normal(sw), 3000) * (t_(sw) / 1.2) ** 2.5, VO[1] - 1.2, 0.18)
for i, n_ in enumerate(['F2', 'C3', 'A3', 'E4', 'G4', 'C5']): place(music, piano(note(n_), 4.0, 0.3), VO[1] - 0.02 + i * 0.015)
place(sfx, bell(note('C6'), 3.0), VO[1], 0.12)
# bloom on "Day ones." and the final chord with the logo
for i, n_ in enumerate(['A#1', 'F2', 'D3', 'A3', 'C4', 'F4']): place(music, piano(note(n_), 4.0, 0.28), VO[2] - 0.02 + i * 0.015)
for i, n_ in enumerate(['F2', 'C3', 'F3', 'A3', 'E4', 'G4', 'C5']): place(music, piano(note(n_), 5.0, 0.3), END + i * 0.02)
place(music, pad([note(x) for x in ['F3', 'A3', 'C4', 'E4']], DUR - END + 1), END, 0.6)
place(sfx, bell(note('F6'), 3.0), END, 0.1)

for k, at in enumerate(VO):
    a, sr = sf.read(f'assets/vo{k}.wav')
    if a.ndim > 1: a = a.mean(1)
    a = resample_poly(a, SR, sr); a = a / (np.max(np.abs(a)) + 1e-9)
    a = a / (np.sqrt(np.mean(a ** 2)) + 1e-9) * 0.16
    place(vo, np.tanh(a * 1.2) / 1.2, at, 2.0)
vo = hp(vo, 90)
env = np.abs(vo); env = lfilter([1 - 0.9995], [1, -0.9995], env); env = np.minimum(1, env / (np.max(env) * 0.35 + 1e-9))
duck = 1 - 0.55 * env
def reverb(x, secs=1.8, wet=0.25):
    n = int(secs * SR); ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 7000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]
mus = reverb(music, 2.2, 0.3) * 0.75 + reverb(sfx, 1.6, 0.3) * 0.75
mixd = np.tanh(mus * duck * 1.2) / 1.2 + reverb(vo, 0.6, 0.06)
mixd = mixd[:int(DUR * SR)]
tt = t_(len(mixd)); mixd *= np.minimum(1, tt / 0.05) * np.minimum(1, (DUR - tt) / 1.2)
st = np.stack([mixd, np.roll(mixd, 11) * 0.97 + mixd * 0.03], 1); st /= np.max(np.abs(st)) * 1.05
with wave.open('out/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
_m = (np.tanh(mus * duck * 1.2) / 1.2)[:int(DUR * SR)]; _v = reverb(vo, 0.6, 0.06)[:int(DUR * SR)]
for a, b, nm in [(VO[0], VO[0] + 3, 'hook'), (VO[1], VO[1] + 0.7, 'thanks'), (VO[2], VO[2] + 3, 'dayones')]:
    rm = lambda x: 20 * np.log10(np.sqrt(np.mean(x[int(a * SR):int(b * SR)] ** 2)) + 1e-9)
    print(f'{nm:8s} voice {rm(_v):6.1f}  music {rm(_m):6.1f}')
print('wrote', st.shape[0] / SR, 's')
