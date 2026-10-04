"""'install nova-os' Short: CRT hum, keyboard clacks, an 8-bit chiptune that speeds up with the download,
a riser under the rising star, a big POP, then a warm modern chord over the desktop. Synthesized, no samples."""
import json, wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
D = json.load(open('out/timeline.json'))
T, DUR, CUTS, KEYT, ENTER, LINES = D['T'], D['DUR'], D['CUTS'], D['KEYT'], D['ENTER'], D['LINES']
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
def square(f, n, duty=0.5): return np.where((f * t_(n)) % 1 < duty, 1.0, -1.0)
def env(n, a=0.002, d=0.1): tt = t_(n); return np.minimum(1, tt / a) * np.exp(-tt / d)


chip, fx, modern = (np.zeros(N) for _ in range(3))

# ---------- 1. CRT: power-on thump + static, a faint hum while it's on ----------
n = int(0.5 * SR); tt = t_(n)
place(fx, np.sin(2 * np.pi * np.cumsum(60 + 300 * np.exp(-tt / 0.02)) / SR) * np.exp(-tt / 0.12) * 0.7 + hp(rng.standard_normal(n), 2000) * np.exp(-tt / 0.08) * 0.3, T['on'])
hum_n = int((T['off'] - T['on']) * SR); th = t_(hum_n)
place(fx, (np.sin(2 * np.pi * 60 * th) * 0.5 + np.sin(2 * np.pi * 120 * th) * 0.3) * np.minimum(1, th / 0.3) * np.minimum(1, (th[-1] - th) / 0.1), T['on'], 0.04)

# ---------- 2. keyboard: a clack per key, a heavier one for Enter ----------
def clack(v, heavy=False):
    n = int(0.08 * SR); tt = t_(n); f = 2200 + 800 * v
    s = bp(rng.standard_normal(n), f, f * 1.8) * np.exp(-tt / (0.007 if heavy else 0.004)) + np.sin(2 * np.pi * (110 if heavy else 160 + 60 * v) * tt) * np.exp(-tt / (0.035 if heavy else 0.018)) * 0.7
    return s * np.minimum(1, tt / 0.0008)
for k in KEYT: place(fx, clack(rng.random()), k, 0.35)
place(fx, clack(0.3, True), ENTER, 0.6)

# ---------- 3. chiptune while it installs: speeds up with the download ----------
start, done = ENTER + 0.25, T['done']
ARP = [['A3', 'C4', 'E4', 'A4'], ['F3', 'A3', 'C4', 'F4'], ['C4', 'E4', 'G4', 'C5'], ['G3', 'B3', 'D4', 'G4']]
BASS = ['A2', 'F2', 'C3', 'G2']
t = start; step = 0
while t < done:
    u = (t - start) / (done - start)
    dt = 0.13 - 0.06 * u                    # 16ths get faster as the bar fills
    chord = ARP[(step // 16) % 4]
    f = note(chord[step % 4]) * (2 if u > 0.5 else 1)
    n = int(dt * SR * 0.9)
    place(chip, square(f, n, 0.25) * env(n, 0.001, dt * 0.6), t, 0.10)
    if step % 4 == 0:
        bf = note(BASS[(step // 16) % 4]); bn = int(dt * 3.5 * SR)
        place(chip, square(bf, bn, 0.5) * env(bn, 0.002, dt * 2.5), t, 0.12)
    if step % 2 == 0:                       # noise hat
        hn = int(0.03 * SR); place(chip, hp(rng.standard_normal(hn), 7000) * env(hn, 0.0005, 0.008), t, 0.05)
    if step % 8 == 4 and u > 0.25:          # noise snare
        sn = int(0.12 * SR); place(chip, bp(rng.standard_normal(sn), 1500, 6000) * env(sn, 0.001, 0.05), t, 0.12)
    t += dt; step += 1
# a blip on every wallpaper change
for i, c in enumerate(CUTS):
    bn = int(0.05 * SR); place(chip, square(note('E6') * 2 ** ((i % 5) / 12), bn, 0.5) * env(bn, 0.001, 0.02), c, 0.04)
# "download complete" jingle
for i, nm in enumerate(['C5', 'E5', 'G5', 'C6']):
    n = int(0.16 * SR); place(chip, square(note(nm), n, 0.5) * env(n, 0.002, 0.12), done + i * 0.09, 0.12)
# power-off zap: a falling square + a click
n = int(0.45 * SR); tt = t_(n)
ph = np.cumsum(1200 * np.exp(-tt / 0.08) + 40) / SR
place(fx, np.where(ph % 1 < 0.5, 1.0, -1.0) * np.exp(-tt / 0.15) * 0.5, T['off'], 0.25)

# ---------- 4. the star rises: a riser and a heartbeat, half a beat of silence, then POP ----------
rise, pop = T['rise'], T['pop']
rn = int((pop - rise) * SR); u = t_(rn) / (pop - rise); r = rng.standard_normal(rn); o = np.zeros(rn)
for s0 in range(0, rn, 2048):
    c = 300 + 7000 * u[s0] ** 2; o[s0:s0 + 2048] = bp(r[s0:s0 + 2048], c, c * 1.6, 1)
place(fx, o * u ** 2 * 0.45, rise)
f = 80 * 2 ** (3 * u); place(fx, np.sin(2 * np.pi * np.cumsum(f) / SR) * u ** 2 * 0.25, rise)
beats, bt, gap = [], rise + 0.3, 0.5
while bt < pop - 0.3: beats.append(bt); bt += gap; gap = max(0.22, gap * 0.85)   # heartbeat speeding up
for k, bt in enumerate(beats):
    n = int(0.2 * SR); tt = t_(n)
    place(fx, np.sin(2 * np.pi * np.cumsum(50 + 60 * np.exp(-tt / 0.02)) / SR) * np.exp(-tt / 0.08), bt, 0.25 + 0.05 * k)
i0, i1 = int((pop - 0.15) * SR), int(pop * SR); fx[i0:i1] *= np.linspace(1, 0, i1 - i0)
# POP: a big boom, a bright snap and a cymbal wash
n = int(2.5 * SR); tt = t_(n)
boom = np.sin(2 * np.pi * np.cumsum(38 + 120 * np.exp(-tt / 0.05)) / SR) * np.exp(-tt / 0.6)
snap = hp(rng.standard_normal(n), 2500) * np.exp(-tt / 0.03)
wash = hp(rng.standard_normal(n), 6000) * np.exp(-tt / 0.9) * 0.25
place(fx, boom + snap * 0.6 + wash, pop, 0.8)

# ---------- 5. modern: a warm wide chord over the desktop, a gentle melody, a last chord on the logo ----------
def saw(f, n, ph=0.0): return 2 * ((f * t_(n) + ph) % 1) - 1
def pad(fs, dur, cut=2500):
    n = int(dur * SR); tt = t_(n)
    s = sum(saw(f * 2 ** (d / 12), n, (k * 0.31) % 1) for k, f in enumerate(fs) for d in (-0.08, 0.08)) / (2 * len(fs))
    return lp(s, cut) * np.minimum(1, tt / 0.05) * np.minimum(1, (dur - tt) / 1.2)
place(modern, pad([note(x) for x in ['A2', 'E3', 'A3', 'C#4', 'E4', 'B4']], T['logo'] - pop + 0.6, 3500), pop, 0.55)
place(modern, pad([note(x) for x in ['F#2', 'C#3', 'F#3', 'A3', 'E4', 'A4']], DUR - T['logo'] + 0.5, 2600), T['logo'] - 0.1, 0.5)
for i, nm in enumerate(['C#6', 'E6', 'B5', 'A5', 'E5', 'F#5']):
    n = int(0.5 * SR); tt = t_(n)
    place(modern, (np.sin(2 * np.pi * note(nm) * tt) + 0.3 * np.sin(4 * np.pi * note(nm) * tt)) * np.exp(-tt / 0.35) * np.minimum(1, tt / 0.003), pop + 0.9 + i * 0.5, 0.12)
for i, nm in enumerate(['A5', 'C#6', 'E6']):
    n = int(1.6 * SR); tt = t_(n); place(modern, np.sin(2 * np.pi * note(nm) * tt) * np.exp(-tt / 0.6), T['risk'] + i * 0.12, 0.07)

# ---------- mix ----------
def reverb(x, secs=2.4, wet=0.35):
    n = int(secs * SR); ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 6000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]
mixd = lp(chip, 9000) * 1.7 + reverb(fx, 1.6, 0.2) + reverb(modern, 2.8, 0.45)
mixd = mixd[:int(DUR * SR)]
tt = t_(len(mixd)); mixd *= np.minimum(1, tt / 0.05) * np.minimum(1, (DUR - tt) / 1.8)
mixd = np.tanh(mixd * 1.1) / 1.1
st = np.stack([mixd, np.roll(mixd, 17) * 0.97 + mixd * 0.03], 1); st /= np.max(np.abs(st)) * 1.05
with wave.open('out/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote', st.shape[0] / SR, 's')
