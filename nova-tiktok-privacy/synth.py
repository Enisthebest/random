"""Privacy TikTok, calm version: warm pads, felt piano and soft sound design that follows the picture. Synthesized, no samples."""
import json, wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
D = json.load(open('out/timeline.json'))
T, DUR = D['T'], D['DUR']
N = int(DUR * SR) + SR * 4
rng = np.random.default_rng(11)


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


pads, piano, low, sfx = (np.zeros(N) for _ in range(4))

# ---------- music: Cmaj7 - Am7 - Fmaj7 - G6, one chord every 1.9 s ----------
CH = [['C3', 'E4', 'G4', 'B4', 'D5'], ['A2', 'C4', 'E4', 'G4', 'B4'], ['F2', 'A3', 'C4', 'E4', 'G4'], ['G2', 'B3', 'D4', 'E4', 'G4']]
CL = 1.9


def pad(freqs, dur):
    n = int(dur * SR); tt = t_(n)
    s = sum(np.sin(2 * np.pi * f * tt + 0.3 * np.sin(2 * np.pi * 0.2 * tt + k)) + 0.35 * np.sin(2 * np.pi * f * 2.003 * tt) for k, f in enumerate(freqs)) / len(freqs)
    return lp(s, 1600) * np.minimum(1, tt / 0.9) * np.minimum(1, (dur - tt) / 0.9)


def felt(f, v=1.0, dur=2.8):
    n = int(dur * SR); tt = t_(n)
    s = sum(np.sin(2 * np.pi * f * h * tt) * np.exp(-tt * (1.0 + 1.6 * h)) / h ** 1.6 for h in (1, 2, 3))
    s += lp(rng.standard_normal(n), 900) * np.exp(-tt / 0.012) * 0.05  # felt hammer
    return lp(s, 2600) * np.minimum(1, tt / 0.006) * v


k = 0
while k * CL < DUR:
    st = k * CL; ch = CH[k % 4]
    place(pads, pad([note(x) for x in ch[1:]], CL + 1.0), st - 0.4, 0.55)
    if st >= T['drop'] - 0.01:
        place(low, np.sin(2 * np.pi * note(ch[0]) * t_(int((CL + 0.3) * SR))) * np.minimum(1, t_(int((CL + 0.3) * SR)) / 0.2) * np.exp(-t_(int((CL + 0.3) * SR)) / 2.5), st, 0.32)
        # slow arpeggio, except during the friendly note where it rests
        if not (T['more'] - 0.1 <= st < T['end'] - 0.2):
            for i, x in enumerate(ch[1:] + [ch[2]]):
                place(piano, felt(note(x) * (2 if i >= 3 else 1), 0.55 - 0.06 * i), st + i * CL / 5)
    else:
        place(piano, felt(note(ch[1]) * 2, 0.35), st + 0.2)  # sparse notes in the intro
    k += 1
# final chord
for i, x in enumerate(['C2', 'C3', 'G3', 'E4', 'B4', 'D5', 'G5']):
    place(piano, felt(note(x), 0.28, 5.0), T['end'] + 0.05 + i * 0.05)
place(pads, pad([note(x) for x in ['C4', 'E4', 'G4', 'B4', 'D5']], 4.0), T['end'] - 0.2, 0.4)

# ---------- sound effects ----------
# paper: soft page rustles under the scrolling wall, more of them as it speeds up
def rustle(d=0.18):
    n = int(d * SR); tt = t_(n)
    s = bp(rng.standard_normal(n), 1800, 7000) * (np.sin(np.pi * tt / d) ** 2) * (0.6 + 0.4 * np.sin(2 * np.pi * 40 * tt))
    return s
at = T['wall'] + 0.2
while at < T['wallOut']:
    u = (at - T['wall']) / (T['wallOut'] - T['wall'])
    place(sfx, rustle(0.16 + 0.1 * rng.random()), at, 0.05 + 0.08 * u)
    at += 0.32 - 0.22 * u + 0.04 * rng.random()

# counter: soft ticks that slow down with the number
def tick(f=2400): n = int(0.02 * SR); return np.sin(2 * np.pi * f * t_(n)) * np.exp(-t_(n) / 0.003)
c = 0.0
while c < 1.0:
    place(sfx, tick(2200 + 600 * c), T['count'] + 1.6 * (1 - (1 - c) ** 0.5), 0.07)
    c += 0.04 + 0.08 * c

# a soft reverse swell as the wall leaves, into the reveal
n = int(1.0 * SR); tt = t_(n)
r = rng.standard_normal(n); swell = np.zeros(n)
for s0 in range(0, n, 2048):  # the filter opens as it rises
    swell[s0:s0 + 2048] = lp(r[s0:s0 + 2048], 1200 + 3000 * (s0 / n) ** 2)
swell *= (tt / 1.0) ** 2.5
place(sfx, swell, T['drop'] - 1.0, 0.18)

def glass(fs, dur=2.6, g=1.0):
    n = int(dur * SR); tt = t_(n)
    s = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / (dur / (2 + i))) * (0.8 ** i) for i, f in enumerate(fs))
    s += sum(np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt / 0.25) * 0.15 for f in fs)  # glassy partial
    return s * np.minimum(1, tt / 0.003) * g
place(sfx, glass([note('E5'), note('B5'), note('G6')]), T['nova'], 0.12)
place(sfx, glass([note('C6'), note('G6'), note('E7')], 3.0), T['collect'] + 0.3, 0.13)

# checks: a soft pop that rises a little each time
def pop(f):
    n = int(0.12 * SR); tt = t_(n)
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-tt / 0.015))) / SR) * np.exp(-tt / 0.04) * np.minimum(1, tt / 0.001)
for i in range(4):
    place(sfx, pop(note(['G5', 'A5', 'C6', 'E6'][i])), T['list'] + i * 0.45 + 0.18, 0.16)

# gentle air whooshes on scene changes
def whoosh(d=0.9):
    n = int(d * SR); r = rng.standard_normal(n); u = t_(n) / d; o = np.zeros(n)
    for s0 in range(0, n, 2048):
        cf = 300 * 6 ** np.sin(np.pi * u[s0] * 0.5); o[s0:s0 + 2048] = bp(r[s0:s0 + 2048], cf, cf * 1.8, 1)
    return o * np.sin(np.pi * u) ** 2
for at in (T['list'] - 0.45, T['more'] - 0.45, T['end'] - 0.45):
    place(sfx, whoosh(), at, 0.06)

# the friendly note: one low, warm piano note under it
place(piano, felt(note('C3'), 0.6, 3.5), T['backup'])
# end card: a warm chime with the star
place(sfx, glass([note('C6'), note('E6'), note('G6'), note('C7')], 4.0), T['end'] + 0.1, 0.08)

# ---------- mix ----------
def reverb(x, secs=3.2, wet=0.45):
    n = int(secs * SR); ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 5000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]
mixd = reverb(pads * 0.8 + piano, 3.4, 0.5) + low + reverb(sfx, 2.2, 0.35)
mixd = mixd[:int(DUR * SR)]
tt = t_(len(mixd)); mixd *= np.minimum(1, tt / 0.6) * np.minimum(1, (DUR - tt) / 2.0)
mixd = np.tanh(mixd * 0.9) / 0.9
st = np.stack([mixd, np.roll(mixd, 19) * 0.96 + mixd * 0.04], 1); st /= np.max(np.abs(st)) * 1.05
with wave.open('out/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote', st.shape[0] / SR, 's')
