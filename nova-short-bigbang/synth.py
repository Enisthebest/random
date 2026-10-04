"""Big bang Short: a deep space drone, a pulsing dot, a riser, a huge BANG with a long tail, a shimmering
galaxy melody, a cascade of sparkles as the particles land, a warm chord when NOVA is complete. Synthesized, no samples."""
import json, wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
D = json.load(open('out/timeline.json'))
T, DUR = D['T'], D['DUR']
N = int(DUR * SR) + SR * 4
rng = np.random.default_rng(77)


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
def pad(fs, dur, att=1.0, rel=1.5, cut=1800):
    n = int(dur * SR); tt = t_(n)
    s = sum(np.sin(2 * np.pi * f * tt + 0.3 * np.sin(2 * np.pi * 0.15 * tt + k)) + 0.35 * np.sin(2 * np.pi * f * 2.004 * tt) for k, f in enumerate(fs)) / len(fs)
    return lp(s, cut) * np.minimum(1, tt / att) * np.minimum(1, (dur - tt) / rel)
def bell(f, dur=2.5):
    n = int(dur * SR); tt = t_(n)
    return np.sin(2 * np.pi * f * tt + 0.9 * np.exp(-tt / 0.2) * np.sin(2 * np.pi * f * 3.5 * tt)) * np.exp(-tt / (dur / 3)) * np.minimum(1, tt / 0.003)

music, fx = np.zeros(N), np.zeros(N)
bang, gather, solid, end = T['bang'], T['gather'], T['solid'], T['end']

# 1. darkness: a deep drone, and a soft pulse for the dot that speeds up
place(music, pad([note('A1'), note('E2')], bang + 0.2, 1.5, 0.2, 400), 0, 0.12)
pt, gap = T['dot'], 0.55
while pt < bang - 0.25:
    n = int(0.25 * SR); tt = t_(n)
    place(fx, np.sin(2 * np.pi * np.cumsum(70 + 50 * np.exp(-tt / 0.02)) / SR) * np.exp(-tt / 0.07), pt, 0.25 + 0.25 * (pt - T['dot']) / (bang - T['dot']))
    place(fx, bell(note('A6'), 0.6), pt, 0.025)
    pt += gap; gap = max(0.14, gap * 0.85)
rn = int((bang - T['dot']) * SR); u = t_(rn) / (bang - T['dot']); r = rng.standard_normal(rn); o = np.zeros(rn)
for s0 in range(0, rn, 2048):
    c = 200 + 8000 * u[s0] ** 2.2; o[s0:s0 + 2048] = bp(r[s0:s0 + 2048], c, c * 1.6, 1)
place(fx, o * u ** 2.5 * 0.4, T['dot'])
i0, i1 = int((bang - 0.12) * SR), int(bang * SR)
for b in (music, fx): b[i0:i1] *= np.linspace(1, 0, i1 - i0) ** 0.4

# 2. BANG: a huge sub boom, a crack, a long rumble tail
n = int(5.0 * SR); tt = t_(n)
boom = np.sin(2 * np.pi * np.cumsum(28 + 140 * np.exp(-tt / 0.06)) / SR) * np.exp(-tt / 1.2)
crack = hp(rng.standard_normal(n), 2000) * np.exp(-tt / 0.06)
rumble = lp(rng.standard_normal(n), 300) * np.exp(-tt / 1.6) * 0.8
place(fx, boom * 1.0 + crack * 0.6 + rumble, bang, 0.9)

# 3. galaxy: a shimmering pad and a slow, spacey bell melody
place(music, pad([note(x) for x in ['A2', 'E3', 'B3', 'C#4', 'E4']], gather - bang + 1.5, 1.2, 1.2, 2200), bang + 0.3, 0.6)
for i, nm in enumerate(['E5', 'B5', 'C#6', 'A5', 'E6', 'B5']):
    place(music, bell(note(nm), 3.0), bang + 0.6 + i * 0.5, 0.12)
# a swirling whoosh as the galaxy turns
wn = int((gather - bang) * SR); tw = t_(wn); r = rng.standard_normal(wn); o = np.zeros(wn)
for s0 in range(0, wn, 2048):
    c = 600 + 400 * np.sin(2 * np.pi * 0.5 * tw[s0]); o[s0:s0 + 2048] = bp(r[s0:s0 + 2048], c, c * 2, 1)
place(fx, o * np.sin(np.pi * tw / tw[-1]) * 0.12, bang)

# 4. gathering: rising pad, then a cascade of tiny sparkles as particles land
place(music, pad([note(x) for x in ['F#2', 'C#3', 'A3', 'E4', 'F#4']], solid - gather + 0.6, 1.0, 0.4, 2600), gather, 0.6)
sp = gather + 0.3
scale = [note(x) for x in ['A5', 'B5', 'C#6', 'E6', 'F#6', 'A6', 'B6', 'C#7', 'E7']]
while sp < solid + 0.8:
    u = (sp - gather) / (solid + 0.8 - gather)
    place(fx, bell(scale[int(rng.random() * len(scale))], 0.5), sp, 0.035 + 0.03 * u)
    sp += 0.11 - 0.07 * u + 0.02 * rng.random()

# 5. complete: a big warm chord as the desktop becomes solid and the star lands, a gentle melody under the words
place(music, pad([note(x) for x in ['D2', 'A2', 'D3', 'F#3', 'A3', 'C#4', 'E4']], end - solid + 2.5, 0.08, 1.5, 3000), solid, 0.9)
for i, nm in enumerate(['D6', 'F#6', 'A6', 'C#7']): place(music, bell(note(nm), 3.0), solid + 0.3 + i * 0.07, 0.1)
for i, nm in enumerate(['A5', 'F#5', 'E5', 'F#5', 'A5', 'D6']): place(music, bell(note(nm), 2.0), T['line1'] + i * 0.55, 0.08)
# end card: a last soft chord and chime
place(music, pad([note(x) for x in ['B1', 'F#2', 'B2', 'D3', 'F#3', 'A3', 'C#4']], DUR - end + 0.5, 0.4, 2.0, 2400), end, 0.7)
for i, nm in enumerate(['F#6', 'A6', 'C#7']): place(music, bell(note(nm), 3.0), end + 0.4 + i * 0.12, 0.08)

def reverb(x, secs=3.5, wet=0.5):
    n = int(secs * SR); ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 6000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]
mixd = reverb(music, 4.0, 0.55) + reverb(fx, 2.5, 0.3)
mixd = mixd[:int(DUR * SR)]
tt = t_(len(mixd)); mixd *= np.minimum(1, tt / 0.5) * np.minimum(1, (DUR - tt) / 2.0)
mixd = np.tanh(mixd * 1.1) / 1.1
st = np.stack([mixd, np.roll(mixd, 23) * 0.95 + mixd * 0.05], 1); st /= np.max(np.abs(st)) * 1.05
with wave.open('out/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote', st.shape[0] / SR, 's')
