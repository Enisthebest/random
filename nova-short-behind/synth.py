"""Behind NOVA: a warm documentary score at 96 BPM in G major. Felt piano 8ths and pizzicato strings; soft drums come in
with the stack and grow a little with every layer that lands (each landing = a deep thud + a chime); strings swell on
"why"; the status part goes lighter with a ticking pulse; a warm end chord. Voice 4 on top with ducking."""
import json, wave
import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter, fftconvolve, resample_poly

SR = 48000
D = json.load(open('out/timeline.json'))
T, DUR = D['T'], D['DUR']
N = int(DUR * SR) + SR * 3
rng = np.random.default_rng(41)

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
def felt(f, d=2.0, v=1.0):
    n = int(d * SR); tt = t_(n)
    s = sum(np.sin(2 * np.pi * f * h * tt) * np.exp(-tt * (1.0 + 1.6 * h)) / h ** 1.6 for h in (1, 2, 3))
    return lp(s, 2600) * np.minimum(1, tt / 0.006) * v
def pizz(f, d=0.5):
    n = int(d * SR); tt = t_(n)
    s = sum(np.sin(2 * np.pi * f * h * tt) / h ** 1.2 for h in (1, 2, 3, 4)) * np.exp(-tt / 0.12)
    return lp(s, 3000) * np.minimum(1, tt / 0.002)
def strings(fs, d, att=1.2):
    n = int(d * SR); tt = t_(n)
    s = sum(np.sin(2 * np.pi * f * tt + 0.15 * np.sin(2 * np.pi * 5 * tt + k)) + 0.3 * np.sin(2 * np.pi * f * 2.003 * tt) for k, f in enumerate(fs)) / len(fs)
    return lp(s, 2000) * np.minimum(1, tt / att) * np.minimum(1, (d - tt) / 0.5)
def bell(f, d=1.2):
    n = int(d * SR); tt = t_(n)
    return np.sin(2 * np.pi * f * tt + 0.9 * np.exp(-tt / 0.12) * np.sin(2 * np.pi * f * 3.5 * tt)) * np.exp(-tt / (d / 4)) * np.minimum(1, tt / 0.002)

music, drums, sfx, vo = (np.zeros(N) for _ in range(4))
BPM = 96; B = 60 / BPM; BAR = 4 * B
CH = [['G2', 'D3', 'G3', 'B3', 'D4'], ['E2', 'B2', 'E3', 'G3', 'B3'], ['C2', 'G2', 'C3', 'E3', 'G3'], ['D2', 'A2', 'D3', 'F#3', 'A3']]
L = T['layers']; WHY = T['vo'][8]; STAT = T['vo'][10]; END = T['end']
kn = int(0.25 * SR); kick = lp(np.sin(2 * np.pi * np.cumsum(48 + 70 * np.exp(-t_(kn) / 0.03)) / SR) * np.exp(-t_(kn) / 0.13), 900)
cn = int(0.2 * SR); clap = bp(rng.standard_normal(cn), 900, 5000) * np.exp(-t_(cn) / 0.05)
sn = int(0.04 * SR); shaker = bp(rng.standard_normal(sn), 5000, 11000) * np.exp(-t_(sn) / 0.012)
bi = 0; t0 = 0.0
while t0 < DUR:
    ch = CH[bi % 4]; layers_in = sum(1 for x in L if t0 >= x - 0.3)
    in_stack = T['stack'] <= t0 < WHY; in_why = WHY <= t0 < STAT; in_stat = STAT <= t0 < END; ending = t0 >= END
    if ending:
        break
    # felt piano: chord + an 8th-note figure
    for i, nm in enumerate(ch): place(music, felt(note(nm), BAR + 0.4, 0.22), t0 + i * 0.012)
    for k in range(8): place(music, felt(note(ch[2 + k % 3]) * 2, 0.9, 0.09 + 0.02 * (k % 2 == 0)), t0 + k * B / 2)
    # pizzicato strings answer on the off-beats from "one solo developer"
    if t0 >= T['vo'][2] - 0.2:
        for k in (1, 3): place(music, pizz(note(ch[3]) * 2), t0 + k * B + B / 2, 0.12)
    # drums: in with the stack, a bit more with every layer
    if in_stack or in_why or in_stat:
        lvl = 0.5 + 0.15 * layers_in if in_stack else (1.0 if in_why else 0.55)
        for b in range(4):
            place(drums, kick, t0 + b * B, 0.5 * lvl if b % 2 == 0 else 0.0)
            if b % 2: place(drums, clap, t0 + b * B, 0.28 * lvl)
            for k in range(2): place(drums, shaker, t0 + b * B + k * B / 2, 0.05 * lvl)
    if in_why:   # strings swell under "your computer should work for you"
        place(music, strings([note(x) * 2 for x in ch[1:4]], BAR + 0.3, 0.8), t0, 0.22)
    t0 += BAR; bi += 1
# each layer lands: deep thud + a rising chime (one step higher each time)
for k, x in enumerate(L):
    n = int(0.6 * SR); tt = t_(n)
    place(sfx, np.sin(2 * np.pi * np.cumsum(55 + 50 * np.exp(-tt / 0.05)) / SR) * np.exp(-tt / 0.25), x + 0.45, 0.5)
    place(sfx, bell(note(['D6', 'E6', 'G6', 'B6'][k]), 1.2), x + 0.48, 0.08)
    n = int(0.45 * SR); tt = t_(n); r = rng.standard_normal(n)   # a short falling whoosh as it drops in
    place(sfx, bp(r, 600, 3000) * np.sin(np.pi * tt / 0.45) ** 2 * 0.12, x)
# doubt chips pop in at the start; tool chips pop around the developer
for i in range(5): place(sfx, np.sin(2 * np.pi * (520 + 60 * i) * t_(int(0.05 * SR))) * np.exp(-t_(int(0.05 * SR)) / 0.015), 0.25 + i * 0.22 + 0.15, 0.08)
for i in range(4): place(sfx, np.sin(2 * np.pi * (700 + 90 * i) * t_(int(0.05 * SR))) * np.exp(-t_(int(0.05 * SR)) / 0.015), T['vo'][3] + 0.2 + i * 0.25 + 0.15, 0.08)
# status rows: ticks; the "real footage" REC: a soft beep
for k, x in enumerate(sorted(T['st'].values())): place(sfx, bell(note('A6'), 0.4), x + 0.1, 0.07)
place(sfx, np.sin(2 * np.pi * 1000 * t_(int(0.12 * SR))) * np.exp(-t_(int(0.12 * SR)) / 0.05), T['vo'][12] + 2.25, 0.06)
# end: warm chord + chime on the star
for i, nm in enumerate(['G2', 'D3', 'G3', 'B3', 'D4', 'A4']): place(music, felt(note(nm), 4.5, 0.32), END + 0.02 + i * 0.03)
place(music, strings([note(x) for x in ['G3', 'B3', 'D4']], 4.4, 1.0), END, 0.18)
for i, nm in enumerate(['D6', 'G6', 'B6']): place(sfx, bell(note(nm), 2.2), END + 0.3 + i * 0.08, 0.06)

# voice 4 + ducking
for k, at in enumerate(T['vo']):
    a, sr = sf.read(f'assets/vo{k}.wav')
    if a.ndim > 1: a = a.mean(1)
    a = resample_poly(a, SR, sr); place(vo, a / (np.max(np.abs(a)) + 1e-9), at, 2.0)
vo = hp(vo, 90)
env = np.abs(vo); env = lfilter([1 - 0.9995], [1, -0.9995], env); env = np.minimum(1, env / (np.max(env) * 0.35 + 1e-9))
duck = 1 - 0.65 * env
def reverb(x, secs=1.8, wet=0.3):
    n = int(secs * SR); ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 7000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]
mus = reverb(music, 2.2, 0.35) + drums * 0.9 + reverb(sfx, 1.2, 0.2)
mixd = np.tanh(mus * duck * 1.2) / 1.2 + reverb(vo, 0.6, 0.06)
mixd = mixd[:int(DUR * SR)]
tt = t_(len(mixd)); mixd *= np.minimum(1, tt / 0.05) * np.minimum(1, (DUR - tt) / 1.2)
st = np.stack([mixd, np.roll(mixd, 13) * 0.97 + mixd * 0.03], 1); st /= np.max(np.abs(st)) * 1.05
with wave.open('out/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
_m = (np.tanh(mus * duck * 1.2) / 1.2)[:int(DUR * SR)]; _v = reverb(vo, 0.6, 0.06)[:int(DUR * SR)]
for a, b, nm in [(0.4, 8.3, 'intro'), (8.65, 20.7, 'stack'), (21.1, 25.8, 'why'), (26.1, 34.7, 'status'), (35.1, 37.6, 'end')]:
    rm = lambda x: 20 * np.log10(np.sqrt(np.mean(x[int(a * SR):int(b * SR)] ** 2)) + 1e-9)
    print(f'{nm:7s} voice {rm(_v):6.1f}  music {rm(_m):6.1f}')
print('wrote', st.shape[0] / SR, 's')
