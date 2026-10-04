"""Replying-to-the-comments Short: dark trap at 140 BPM in C minor. A cold piano riff + filtered hats before the first
slash, then the drop: distorted 808 with slides, hard clap on 3, hi-hat rolls. A whoosh + hit on every slash, a cut of
silence before "Mine." and a huge impact on it, a stamp thud, a punch on each zero. Voice 4 on top with ducking."""
import json, wave
import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter, fftconvolve, resample_poly

SR = 48000
D = json.load(open('out/timeline.json'))
T, DUR = D['T'], D['DUR']; VO = T['vo']
N = int(DUR * SR) + SR * 3
rng = np.random.default_rng(66)
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
def piano(f, d=1.2, v=1.0):
    n = int(d * SR); tt = t_(n)
    s = sum(np.sin(2 * np.pi * f * h * tt) * np.exp(-tt * (2.0 + 2.2 * h)) / h ** 1.4 for h in (1, 2, 3, 5))
    return lp(s, 3500) * np.minimum(1, tt / 0.003) * v
def b808(f, d, slide_to=None):
    n = int(d * SR); tt = t_(n); fr = f * (1 + 2.0 * np.exp(-tt / 0.01))
    if slide_to: fr = fr * np.where(tt > d * 0.6, (slide_to / f) ** np.clip((tt - d * 0.6) / 0.07, 0, 1), 1)
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt / (d * 0.9))
    return np.tanh(3.5 * s) * np.minimum(1, (d - tt) / 0.02)
def whoosh(d=0.5, up=True):
    n = int(d * SR); r = rng.standard_normal(n); o = np.zeros(n)
    for s0 in range(0, n, 1024):
        u = s0 / n; f = (400 + 5000 * u) if up else (5000 - 4400 * u); o[s0:s0 + 1024] = bp(r[s0:s0 + 1024], f, f * 1.7, 1)
    return o * np.sin(np.pi * t_(n) / d) ** 2
def impact(d=1.4, low=38):
    n = int(d * SR); tt = t_(n)
    return np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(low + 130 * np.exp(-tt / 0.04)) / SR) * np.exp(-tt / 0.45)) + hp(rng.standard_normal(n), 2500) * np.exp(-tt / 0.05) * 0.5

music, sfx, vo = (np.zeros(N) for _ in range(3))
BPM = 140; B = 60 / BPM; BAR = 4 * B
DROP = VO[2] - 0.05                      # the first slash
kn = int(0.18 * SR); kick = np.sin(2 * np.pi * np.cumsum(55 + 150 * np.exp(-t_(kn) / 0.015)) / SR) * np.exp(-t_(kn) / 0.06) + hp(rng.standard_normal(kn), 3000) * np.exp(-t_(kn) / 0.003) * 0.5
cn = int(0.3 * SR); clap = np.zeros(cn)
for o_ in (0, 0.006, 0.013, 0.02):
    i = int(o_ * SR); clap[i:] += bp(rng.standard_normal(cn - i), 900, 8000) * np.exp(-t_(cn - i) / (0.13 if o_ == 0.02 else 0.005))
hn = int(0.04 * SR); hat = hp(rng.standard_normal(hn), 8500) * np.exp(-t_(hn) / 0.01)
RIFF = ['C5', 'D#5', 'G5', 'D#5', 'C5', 'D#5', 'G#5', 'G5']   # cold minor piano figure, 8ths
ROOTS = [('C2', None), ('C2', 'D#2'), ('G#1', None), ('G1', 'G#1')]

# intro: piano riff + filtered hats leading into the drop (grid counted back from the drop)
t0 = DROP - 4 * BAR
bi = 0
while t0 < DUR:
    intro = t0 < DROP - 0.01
    calm = t0 >= VO[10] - 0.3                  # the ending: drums out
    for k, nm in enumerate(RIFF): place(music, piano(note(nm), 0.9, 0.4 if intro else 0.16), t0 + k * B / 2)
    if not intro and not calm:
        r0, sl = ROOTS[bi % 4]
        place(music, b808(note(r0), BAR * 0.7, note(sl) if sl else None), t0, 0.6)
        place(music, b808(note(r0), BAR * 0.25), t0 + 2.5 * B, 0.45)
        place(music, kick, t0, 0.6); place(music, kick, t0 + 2.5 * B, 0.45)
        place(music, clap, t0 + 2 * B, 0.5)
        for k in range(8): place(music, hat, t0 + k * B / 2, 0.16 if k % 2 == 0 else 0.1)
        if bi % 2 == 1:                          # hi-hat roll into the next bar
            for k in range(6): place(music, hat, t0 + 3 * B + k * B / 6, 0.12)
    elif intro:
        for k in range(8): place(music, lp(hat, 3000), t0 + k * B / 2, 0.12)
    bi += 0 if intro else 1; t0 += BAR
# a short cut of silence before "Mine." (the 808 and drums drop out), then the hit
i0, i1 = int((VO[5] - 0.5) * SR), int((VO[5] - 0.02) * SR)
music[i0:i1] *= np.linspace(1, 0.05, i1 - i0) ** 0.3
place(sfx, impact(1.8, 34), VO[5] - 0.03, 0.9)
# slashes: a quick whoosh + hit; the comments slam in with a thud
for c, s in zip(D['CUTS'], D['SLASH']):
    place(sfx, impact(0.5, 70) * 0.5, c, 0.4)
    place(sfx, whoosh(0.35), s - 0.25, 0.35); place(sfx, impact(1.0, 45), s + 0.05, 0.55)
# montage cuts: a tick on each screen
for t in D['STEPS']: place(sfx, hp(rng.standard_normal(int(0.04 * SR)), 2000) * np.exp(-t_(int(0.04 * SR)) / 0.01), t, 0.25)
# stamp thud, zero punches
place(sfx, impact(0.8, 60), VO[7] + 1.9, 0.5)
for t in D['ZEROS']: place(sfx, impact(0.7, 50), t, 0.45)
# ending: a dark sustained chord and a final hit on "Coming soon."
for i, nm in enumerate(['C3', 'G3', 'D#4', 'G4', 'C5']): place(music, piano(note(nm), 4.0, 0.3), VO[12] - 0.05 + i * 0.02)
place(sfx, impact(2.0, 32), VO[12] - 0.05, 0.6)

# voice 4 + ducking
for k, at in enumerate(VO):
    a, sr = sf.read(f'assets/vo{k}.wav')
    if a.ndim > 1: a = a.mean(1)
    a = resample_poly(a, SR, sr); a = a / (np.max(np.abs(a)) + 1e-9)
    a = a / (np.sqrt(np.mean(a ** 2)) + 1e-9) * 0.16          # every line at the same loudness
    place(vo, np.tanh(a * 1.2) / 1.2, at, 2.0)
vo = hp(vo, 90)
env = np.abs(vo); env = lfilter([1 - 0.9995], [1, -0.9995], env); env = np.minimum(1, env / (np.max(env) * 0.35 + 1e-9))
duck = 1 - 0.78 * env
def reverb(x, secs=1.4, wet=0.2):
    n = int(secs * SR); ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 7000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]
mus = reverb(music, 1.6, 0.22) * 0.4 + reverb(sfx, 1.0, 0.15) * 0.55
mixd = np.tanh(mus * duck * 1.2) / 1.2 + reverb(vo, 0.5, 0.05)
mixd = mixd[:int(DUR * SR)]
tt = t_(len(mixd)); mixd *= np.minimum(1, tt / 0.05) * np.minimum(1, (DUR - tt) / 1.0)
st = np.stack([mixd, np.roll(mixd, 11) * 0.97 + mixd * 0.03], 1); st /= np.max(np.abs(st)) * 1.05
with wave.open('out/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
_m = (np.tanh(mus * duck * 1.2) / 1.2)[:int(DUR * SR)]; _v = reverb(vo, 0.5, 0.05)[:int(DUR * SR)]
for a, b, nm in [(0.4, 5.4, 'intro'), (5.55, 12.0, 'dotfile'), (13.7, 18.0, 'ai'), (20.7, 24.1, 'fake'), (25.4, 29.6, 'zeros'), (30.1, 35.0, 'end')]:
    rm = lambda x: 20 * np.log10(np.sqrt(np.mean(x[int(a * SR):int(b * SR)] ** 2)) + 1e-9)
    print(f'{nm:7s} voice {rm(_v):6.1f}  music {rm(_m):6.1f}')
print('wrote', st.shape[0] / SR, 's')
