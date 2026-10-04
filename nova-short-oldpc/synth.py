"""Old-PC Short: a tired, dusty lo-fi loop (vinyl crackle, wobbly slow piano) while the old PC struggles, then bright
future funk from "NOVA doesn't run any of that" (four-on-the-floor, octave bass, chord stabs, claps). Junk blocks pop
in with a thunk, fall away with a whoosh, the reboot chimes, apps fall asleep. Voice 4 on top with ducking."""
import json, wave
import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter, fftconvolve, resample_poly

SR = 48000
D = json.load(open('out/timeline.json'))
T, DUR = D['T'], D['DUR']
N = int(DUR * SR) + SR * 3
rng = np.random.default_rng(31)

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
def bell(f, dur=1.0):
    n = int(dur * SR); tt = t_(n)
    return np.sin(2 * np.pi * f * tt + 1.0 * np.exp(-tt / 0.1) * np.sin(2 * np.pi * f * 3.5 * tt)) * np.exp(-tt / (dur / 4)) * np.minimum(1, tt / 0.002)
def piano(f, d=2.0, v=1.0, wob=0.0):
    n = int(d * SR); tt = t_(n); fr = f * (1 + wob * np.sin(2 * np.pi * 0.7 * tt))
    ph = np.cumsum(fr) / SR
    s = sum(np.sin(2 * np.pi * ph * h) * np.exp(-tt * (1.2 + 1.4 * h)) / h ** 1.5 for h in (1, 2, 3, 4))
    return lp(s, 3200) * np.minimum(1, tt / 0.004) * v

old, sfx, funk, vo = (np.zeros(N) for _ in range(4))
DROP = T['drop']

# ---------- 1. old and tired: slow lo-fi piano in A minor, 72 BPM, wobbly like a worn tape ----------
LB = 60 / 72
CH = [['A2', 'E3', 'G3', 'C4'], ['F2', 'C3', 'E3', 'A3'], ['D2', 'A2', 'C3', 'F3'], ['E2', 'B2', 'D3', 'G#3']]
t = 0.0; j = 0
while t < DROP:
    for i, nm in enumerate(CH[j % 4]): place(old, piano(note(nm), 4 * LB + 0.5, 0.3, 0.006), t + i * 0.03)
    for k in (1, 2.5): place(old, piano(note(CH[j % 4][3]) * 2, 1.2, 0.12, 0.006), t + k * LB)
    for b in range(4):                                      # soft, dusty kick + rim
        n = int(0.2 * SR); place(old, lp(np.sin(2 * np.pi * np.cumsum(50 + 60 * np.exp(-t_(n) / 0.03)) / SR) * np.exp(-t_(n) / 0.1), 600), t + b * LB, 0.35 if b % 2 == 0 else 0)
        if b % 2: place(old, bp(rng.standard_normal(int(0.08 * SR)), 1500, 4000) * np.exp(-t_(int(0.08 * SR)) / 0.02), t + b * LB, 0.18)
    t += 4 * LB; j += 1
crackle = np.zeros(N); pops = rng.random(N) < 0.0007; crackle[pops] = rng.standard_normal(pops.sum()) * 0.6
crackle = hp(crackle, 1500) + lp(rng.standard_normal(N), 900) * 0.015
old += crackle * 0.5
i0 = int(DROP * SR); old = lp(old, 3500); old[i0:] = 0
# the old track slows to a stop as NOVA takes over (tape-stop)
fl = int(0.5 * SR); seg = old[i0 - fl:i0].copy(); idx = np.cumsum(np.linspace(1, 0.1, fl)); idx = idx / idx[-1] * (fl - 1)
old[i0 - fl:i0] = np.interp(idx, np.arange(fl), seg) * np.linspace(1, 0.3, fl)

# ---------- 2. sound effects ----------
def thunk(f):
    n = int(0.25 * SR); tt = t_(n)
    return lp(np.sin(2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-tt / 0.02))) / SR), 1500) * np.exp(-tt / 0.08) + bp(rng.standard_normal(n), 800, 3000) * np.exp(-tt / 0.01) * 0.3
for k, jt in enumerate(T['junk']): place(sfx, thunk(160 - 15 * k), jt, 0.5)
# junk falls away: a whoosh down per block
for k in range(5):
    n = int(0.6 * SR); tt = t_(n); r = rng.standard_normal(n); w = np.zeros(n)
    for s0 in range(0, n, 1024): f = 2500 - 2000 * s0 / n; w[s0:s0 + 1024] = bp(r[s0:s0 + 1024], f, f * 1.7, 1)
    place(sfx, w * np.sin(np.pi * tt / 0.6) ** 2 * 0.25, T['fall'] + k * 0.09)
# reboot: a soft power-on hum + star chime
n = int(1.2 * SR); tt = t_(n)
place(sfx, np.sin(2 * np.pi * (80 + 140 * tt) * tt) * np.sin(np.pi * tt / 1.2) * 0.15, T['boot'])
for i, nm in enumerate(['E6', 'B6', 'E7']): place(sfx, bell(note(nm), 1.5), T['boot'] + 0.3 + i * 0.07, 0.07)
# squeeze: a little "pfff" of compression
n = int(0.7 * SR); tt = t_(n); place(sfx, bp(rng.standard_normal(n), 700, 2500) * np.sin(np.pi * tt / 0.7) ** 2 * 0.25, T['squeeze'])
# apps fall asleep: tiny descending blips; the one you use wakes with a rising one
for k in range(5):
    n = int(0.12 * SR); tt = t_(n); place(sfx, np.sin(2 * np.pi * np.cumsum(700 - 300 * tt / 0.12) / SR) * np.exp(-tt / 0.05), T['sleep'] + k * 0.1, 0.08)
n = int(0.25 * SR); tt = t_(n); place(sfx, np.sin(2 * np.pi * np.cumsum(500 + 900 * tt / 0.25) / SR) * np.exp(-tt / 0.12), T['wake'], 0.15)

# ---------- 3. future funk from the drop: 118 BPM, D major ----------
BPM = 118; B = 60 / BPM; BAR = 4 * B
def stab(fs, d=0.22):
    n = int(d * SR); tt = t_(n); s = np.zeros(n)
    for f in fs:
        for dt in (-0.1, 0.1): s += 2 * ((f * 2 ** (dt / 12) * tt) % 1) - 1
    return lp(s / len(fs), 3500) * np.exp(-tt / 0.09) * np.minimum(1, tt / 0.003)
def fbass(f, d):
    n = int(d * SR); tt = t_(n)
    s = np.sin(2 * np.pi * f * tt) + 0.5 * np.sign(np.sin(2 * np.pi * f * tt))
    return lp(s, 900) * np.exp(-tt / 0.14) * np.minimum(1, tt / 0.004)
kn = int(0.25 * SR); kick = np.sin(2 * np.pi * np.cumsum(48 + 110 * np.exp(-t_(kn) / 0.025)) / SR) * np.exp(-t_(kn) / 0.12)
cn = int(0.25 * SR); clap = np.zeros(cn)
for o_ in (0, 0.008, 0.016):
    i = int(o_ * SR); clap[i:] += bp(rng.standard_normal(cn - i), 1000, 6000) * np.exp(-t_(cn - i) / (0.09 if o_ == 0.016 else 0.006))
on = int(0.18 * SR); ohat = hp(rng.standard_normal(on), 7000) * np.exp(-t_(on) / 0.06)
FCH = [['D4', 'F#4', 'A4', 'C#5'], ['B3', 'D4', 'F#4', 'A4'], ['G3', 'B3', 'D4', 'F#4'], ['A3', 'C#4', 'E4', 'G4']]
FRT = ['D2', 'B1', 'G1', 'A1']
MEL = [['F#5', None, 'A5', None, 'C#6', 'B5', None, 'A5'], ['F#5', None, None, 'E5', 'F#5', None, 'D5', None],
       ['G5', None, 'B5', None, 'D6', 'C#6', None, 'B5'], ['A5', None, 'G5', 'F#5', 'E5', None, None, None]]
end = T['end']; bi = 0; t0 = DROP
while t0 < DUR + 0.5:
    calm = t0 >= end - 0.05
    ch = FCH[bi % 4]; root = note(FRT[bi % 4])
    for k in range(8):                                     # octave-jumping funk bass on 8ths
        place(funk, fbass(root * (2 if k % 2 else 1), B / 2 * 0.9), t0 + k * B / 2, 0.5 if not calm else 0.3)
    for k in (1.5, 2.5, 3.5): place(funk, stab([note(x) for x in ch]), t0 + k * B, 0.22 if not calm else 0.15)
    for k, nm in enumerate(MEL[bi % 4]):
        if nm: place(funk, bell(note(nm), 0.6), t0 + k * B / 2, 0.07)
    if not calm:
        for b in range(4):
            place(funk, kick, t0 + b * B, 0.75)
            place(funk, ohat, t0 + b * B + B / 2, 0.14)
            if b % 2: place(funk, clap, t0 + b * B, 0.4)
    t0 += BAR; bi += 1
# drop hit, and a warm final chord on the end card
n = int(1.2 * SR); tt = t_(n)
place(funk, np.sin(2 * np.pi * np.cumsum(40 + 110 * np.exp(-tt / 0.05)) / SR) * np.exp(-tt / 0.4) + hp(rng.standard_normal(n), 4000) * np.exp(-tt / 0.05) * 0.3, DROP, 0.8)
for i, nm in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'E5']): place(funk, piano(note(nm), 3.5, 0.3), T['vo'][10] + 0.75 + i * 0.03)
for i, nm in enumerate(['A6', 'D7', 'F#7']): place(funk, bell(note(nm), 2.0), T['end'] + 0.3 + i * 0.07, 0.06)

# ---------- 4. voice-over (voice 4) + ducking ----------
for k, at in enumerate(T['vo']):
    a, sr = sf.read(f'assets/vo{k}.wav')
    if a.ndim > 1: a = a.mean(1)
    a = resample_poly(a, SR, sr); place(vo, a / (np.max(np.abs(a)) + 1e-9), at, 2.0)
vo = hp(vo, 90)
env = np.abs(vo); env = lfilter([1 - 0.9995], [1, -0.9995], env); env = np.minimum(1, env / (np.max(env) * 0.35 + 1e-9))
duck = 1 - 0.72 * env

def reverb(x, secs=1.5, wet=0.25):
    n = int(secs * SR); ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 7000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]
music = reverb(old, 1.4, 0.25) * 1.05 + reverb(sfx, 1.0, 0.15) * 0.8 + reverb(funk, 1.0, 0.12) * 0.62
mixd = np.tanh(music * duck * 1.1) / 1.1 + reverb(vo, 0.6, 0.06)
mixd = mixd[:int(DUR * SR)]
tt = t_(len(mixd)); mixd *= np.minimum(1, tt / 0.05) * np.minimum(1, (DUR - tt) / 1.0)
st = np.stack([mixd, np.roll(mixd, 11) * 0.97 + mixd * 0.03], 1); st /= np.max(np.abs(st)) * 1.05
with wave.open('out/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
_m = (np.tanh(music * duck * 1.1) / 1.1)[:int(DUR * SR)]; _v = reverb(vo, 0.6, 0.06)[:int(DUR * SR)]
for a, b, nm in [(0.5, 6.8, 'old'), (7.0, 10.3, 'junk'), (10.6, 18.7, 'funk'), (19.0, 22.8, 'power'), (23.2, 25, 'end')]:
    rm = lambda x: 20 * np.log10(np.sqrt(np.mean(x[int(a * SR):int(b * SR)] ** 2)) + 1e-9)
    print(f'{nm:6s} voice {rm(_v):6.1f}  music {rm(_m):6.1f}')
print('wrote', st.shape[0] / SR, 's')
