"""Buddy's short: a cute marimba tune, cartoon 'voice' babble when he talks, and a sound for every mood. Synthesized, no samples."""
import json, wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
D = json.load(open('out/timeline.json'))
T, DUR, ACT, BLINKS, LINES = D['T'], D['DUR'], D['ACT'], D['BLINKS'], D['LINES']
N = int(DUR * SR) + SR * 3
rng = np.random.default_rng(5)
BPM = 112; B = 60 / BPM


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

def marimba(f, dur=0.8):
    n = int(dur * SR); tt = t_(n)
    s = np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.28) + 0.35 * np.sin(2 * np.pi * f * 4 * tt) * np.exp(-tt / 0.04) + 0.15 * np.sin(2 * np.pi * f * 10 * tt) * np.exp(-tt / 0.01)
    return s * np.minimum(1, tt / 0.002)
def pluck_bass(f, dur=0.5):
    n = int(dur * SR); tt = t_(n)
    return lp(np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(4 * np.pi * f * tt), 600) * np.exp(-tt / 0.22) * np.minimum(1, tt / 0.004)
def bell(f, dur=1.2):
    n = int(dur * SR); tt = t_(n)
    return np.sin(2 * np.pi * f * tt + 0.8 * np.exp(-tt / 0.15) * np.sin(2 * np.pi * f * 3.5 * tt)) * np.exp(-tt / (dur / 3)) * np.minimum(1, tt / 0.002)

music, voice, sfx = (np.zeros(N) for _ in range(3))
wake = ACT[1][0]
END = T['end']

# ---------- music: a soft, music-box lullaby while he sleeps, then a bouncy marimba tune ----------
for i, nm in enumerate(['E6', 'G6', 'C7', 'G6', 'E6', 'D6', 'C6', 'D6']):
    place(music, bell(note(nm), 1.6), 0.4 + i * 0.22, 0.05)
CH = [['C3', 'E4', 'G4', 'C5'], ['A2', 'C4', 'E4', 'A4'], ['F2', 'A3', 'C4', 'F4'], ['G2', 'B3', 'D4', 'G4']]
MEL = [['E5', 'G5', None, 'C6', 'B5', 'G5', None, 'E5'], ['C5', 'E5', None, 'A5', 'G5', 'E5', None, None],
       ['F5', 'A5', None, 'C6', 'A5', 'F5', 'G5', None], ['G5', None, 'D5', 'G5', 'B5', None, 'A5', 'G5']]
t = wake + 0.3; j = 0
while t < END + 3.0:
    ch = CH[j % 4]
    place(music, pluck_bass(note(ch[0])), t, 0.45); place(music, pluck_bass(note(ch[0]) * 1.5), t + 2 * B, 0.3)
    for b in range(4):   # off-beat marimba chords
        for nm in ch[1:]: place(music, marimba(note(nm), 0.5), t + b * B + B / 2, 0.06)
    if t > 4.6 and t < END:
        for k, nm in enumerate(MEL[j % 4]):
            if nm: place(music, marimba(note(nm), 0.7), t + k * B / 2, 0.16)
    t += 4 * B; j += 1
# soft shaker + finger-snap groove after he wakes up
sh = hp(rng.standard_normal(int(0.05 * SR)), 7000) * np.exp(-t_(int(0.05 * SR)) / 0.01)
sn_n = int(0.12 * SR); snap = bp(rng.standard_normal(sn_n), 1800, 7000) * np.exp(-t_(sn_n) / 0.02)
k = 0
while (wake + 0.3 + k * B / 2) < END + 2.5:
    at = wake + 0.3 + k * B / 2
    place(music, sh, at, 0.04 if k % 2 else 0.025)
    if k % 4 == 2 and at > 4.6: place(music, snap, at, 0.12)
    k += 1
# ending chord
for i, nm in enumerate(['C3', 'G3', 'C4', 'E4', 'G4', 'C5']): place(music, marimba(note(nm), 1.6), END + 2.6 + i * 0.03, 0.12)

# ---------- his voice: cartoon babble, one blip per syllable, pitch follows the mood ----------
def blip(f, d):
    n = int(d * SR); tt = t_(n)
    vib = 1 + 0.03 * np.sin(2 * np.pi * 18 * tt)
    ph = np.cumsum(f * vib * (1 + 0.15 * np.exp(-tt / 0.02))) / SR
    s = np.sin(2 * np.pi * ph) + 0.35 * np.sin(4 * np.pi * ph) + 0.15 * np.sign(np.sin(2 * np.pi * ph))
    return lp(s, 3500) * np.minimum(1, tt / 0.004) * np.minimum(1, (d - tt) / 0.02)
def mood_at(tt):
    m = ACT[0][1]
    for a, name in ACT:
        if tt >= a: m = name
    return m
for line, t0 in LINES:
    words = [w for w in line.replace('✦', '').replace('…', '').split(' ') if w]
    syl = sum(max(1, len([c for c in w.lower() if c in 'aeiouy'])) for w in words)
    m = mood_at(t0 + 0.1)
    base = {'happy': 620, 'listening': 560, 'thinking': 440, 'working': 500, 'oops': 380, 'asking': 520, 'idle': 540}.get(m, 540)
    tt = t0 + 0.05
    for s in range(min(syl, 12)):
        f = base * 2 ** ((rng.random() - 0.5) * 0.5) * (1.12 if (s == syl - 1 and line.endswith('?')) else 1)
        d = 0.07 + 0.03 * rng.random()
        place(voice, blip(f, d), tt, 0.12)
        tt += d + 0.035 + (0.05 if rng.random() < 0.2 else 0)

# ---------- mood sounds ----------
for b in BLINKS: place(sfx, np.sin(2 * np.pi * 2400 * t_(int(0.02 * SR))) * np.exp(-t_(int(0.02 * SR)) / 0.004), b, 0.06)
# snores while he sleeps
for st in (0.9, 1.6):
    n = int(0.55 * SR); tt = t_(n)
    place(sfx, lp(rng.standard_normal(n), 500) * np.sin(np.pi * tt / 0.55) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 28 * tt)), st, 0.1)
for a, name in ACT[1:]:
    if name == 'idle' and a < 2.5:      # waking up: a little rising "hm?"
        place(sfx, blip(420, 0.08), a, 0.1); place(sfx, blip(640, 0.12), a + 0.1, 0.1)
    if name == 'happy':
        for i, nm in enumerate(['C6', 'E6', 'G6', 'C7']): place(sfx, bell(note(nm), 0.9), a + 0.05 + i * 0.05, 0.07)
    if name == 'listening':
        place(sfx, blip(700, 0.06), a, 0.06); place(sfx, blip(900, 0.06), a + 0.08, 0.06)
    if name == 'thinking':
        for i in range(5): place(sfx, np.sin(2 * np.pi * 1500 * t_(int(0.03 * SR))) * np.exp(-t_(int(0.03 * SR)) / 0.008), a + 0.15 + i * 0.25, 0.04)
    if name == 'working':
        n = int(0.9 * SR); tt = t_(n)
        place(sfx, np.sin(2 * np.pi * (300 + 200 * tt) * tt) * 0.3 * np.sin(np.pi * tt / 0.9) ** 2, a, 0.08)
    if name == 'oops':                  # a cartoon "boing" going down
        n = int(0.5 * SR); tt = t_(n)
        f = 520 * np.exp(-tt * 2.2) * (1 + 0.15 * np.sin(2 * np.pi * 14 * tt))
        place(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.3), a, 0.14)
    if name == 'asking':                # a curious rising "hmm?"
        n = int(0.35 * SR); tt = t_(n)
        place(sfx, np.sin(2 * np.pi * np.cumsum(380 + 380 * (tt / 0.35) ** 2) / SR) * np.sin(np.pi * tt / 0.35), a, 0.1)
# end card: a sparkle on the title
for i, nm in enumerate(['G6', 'C7', 'E7']): place(sfx, bell(note(nm), 1.5), END + 0.35 + i * 0.07, 0.06)

def reverb(x, secs=1.6, wet=0.25):
    n = int(secs * SR); ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 7000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]
mixd = reverb(music, 1.8, 0.3) * 0.9 + reverb(voice, 0.8, 0.12) + reverb(sfx, 1.2, 0.2)
mixd = mixd[:int(DUR * SR)]
tt = t_(len(mixd)); mixd *= np.minimum(1, tt / 0.3) * np.minimum(1, (DUR - tt) / 1.5)
mixd = np.tanh(mixd * 1.1) / 1.1
st = np.stack([mixd, np.roll(mixd, 13) * 0.97 + mixd * 0.03], 1); st /= np.max(np.abs(st)) * 1.05
with wave.open('out/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote', st.shape[0] / SR, 's')
