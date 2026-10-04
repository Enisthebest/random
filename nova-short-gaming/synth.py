"""Gaming mode Short: in-game synthwave that stutters as the PC lags, a ping for every popup, key clicks, a tape-stop
freeze on Super G, then a phonk drop (distorted 808, cowbell riff, claps). The voice-over (assets/vo*.wav, voice 4)
sits on top and the music ducks under every line. Synthesized with numpy/scipy, no samples."""
import json, wave
import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter, fftconvolve, resample_poly

SR = 48000
D = json.load(open('out/timeline.json'))
T, DUR = D['T'], D['DUR']
N = int(DUR * SR) + SR * 3
rng = np.random.default_rng(23)

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

game, sfx, phonk, vo = (np.zeros(N) for _ in range(4))

# ---------- 1. the game's own music: a little synthwave loop (A minor), 100 BPM ----------
GB = 60 / 100
def saw(f, d):
    n = int(d * SR); tt = t_(n); s = 2 * ((f * tt) % 1) - 1
    return lp(s, 2400) * np.exp(-tt / 0.18) * np.minimum(1, tt / 0.003)
ARP = ['A3', 'C4', 'E4', 'A4', 'F3', 'A3', 'C4', 'F4', 'G3', 'B3', 'D4', 'G4', 'E3', 'G3', 'B3', 'E4']
t = 0.0; k = 0
while t < T['freeze'] + 0.2:
    place(game, saw(note(ARP[k % 16]), 0.25), t, 0.22)
    if k % 4 == 0: place(game, lp(np.sin(2 * np.pi * note(ARP[k % 16]) / 2 * t_(int(GB * SR))), 300) * np.exp(-t_(int(GB * SR)) / 0.4), t, 0.35)
    t += GB / 4; k += 1
# lag: from the first popup the game audio stutters (chunks repeat) and dulls
c0, c1 = int(T['chaos'] * SR), int(T['freeze'] * SR)
i = c0
while i < c1:
    lag = (i - c0) / (c1 - c0)
    blk = int(SR * (0.06 + 0.05 * rng.random()))
    if rng.random() < 0.25 + 0.5 * lag:           # repeat the last chunk: the classic lag stutter
        src = game[i - blk:i].copy() if i - blk > 0 else game[i:i + blk].copy()
        game[i:i + blk] = src[:len(game[i:i + blk])] * 0.9
    i += blk
game[c0:c1] = lp(game[c0:c1], 2500) * 0.85 + game[c0:c1] * 0.15
# the freeze: tape-stop (everything slows and drops in pitch over 0.5 s), then silence
f0 = int(T['freeze'] * SR); fl = int(0.55 * SR)
seg = game[f0 - fl:f0].copy()
idx = np.cumsum(np.linspace(1, 0.05, fl)); idx = idx / idx[-1] * (fl - 1)
game[f0 - fl:f0] = np.interp(idx, np.arange(fl), seg) * np.linspace(1, 0.2, fl)
game[f0:] = 0

# ---------- 2. sound effects ----------
def ping(kind):
    n = int(0.5 * SR); tt = t_(n)
    if kind == 'update': return bell(note('E6'), 0.6) * 0.6 + np.concatenate([np.zeros(int(0.09 * SR)), bell(note('B6'), 0.51)])[:int(0.6 * SR)] * 0.5
    if kind == 'message': return lp(np.sin(2 * np.pi * np.cumsum(900 + 500 * np.exp(-tt / 0.03)) / SR), 5000) * np.exp(-tt / 0.07)
    if kind == 'backup': return bp(rng.standard_normal(n), 1500, 5000) * np.sin(np.pi * tt / 0.5) ** 2 * 0.4
    if kind == 'warn': return np.sign(np.sin(2 * np.pi * 440 * tt)) * np.exp(-tt / 0.12) * 0.25 + np.sign(np.sin(2 * np.pi * 330 * tt)) * np.exp(-np.maximum(0, tt - 0.13) / 0.12) * (tt > 0.13) * 0.25
    return bell(note('A5'), 0.5)
KINDS = ['update', 'message', 'message', 'message', 'backup', 'warn', 'update', 'warn']
POPT = [4.0, 4.6, 4.78, 4.96, 5.4, 6.0, 6.25, 6.5]
for k, (pt, kind) in enumerate(zip(POPT, KINDS)): place(sfx, ping(kind), pt, 0.35)
# the "Restart required" dialog: an annoying double bonk
n = int(0.3 * SR); tt = t_(n); bonk = lp(np.sin(2 * np.pi * 220 * tt) + 0.5 * np.sign(np.sin(2 * np.pi * 220 * tt)), 1800) * np.exp(-tt / 0.1)
place(sfx, bonk, 6.85, 0.35); place(sfx, bonk, 7.05, 0.3)
# a low rumble of the PC struggling, growing until the freeze
rn = int((T['freeze'] - T['chaos']) * SR); u = t_(rn) / (rn / SR)
place(sfx, lp(rng.standard_normal(rn), 120) * u ** 1.5 * 3.0, T['chaos'])
# key clicks: super, then G
def clack():
    n = int(0.09 * SR); tt = t_(n)
    return bp(rng.standard_normal(n), 1500, 7000) * np.exp(-tt / 0.012) + lp(np.sin(2 * np.pi * 180 * tt), 600) * np.exp(-tt / 0.03) * 0.6
place(sfx, clack(), T['superK'], 0.7); place(sfx, clack(), T['gK'], 0.9)
# freeze: a crystalline ice shimmer
n = int(0.8 * SR); tt = t_(n)
place(sfx, sum(np.sin(2 * np.pi * f * tt + rng.random() * 6) for f in (2637, 3136, 3951, 4699)) * np.exp(-tt / 0.25) * 0.15 + hp(rng.standard_normal(n), 6000) * np.exp(-tt / 0.08) * 0.2, T['freeze'], 0.5)
# drop: the popups get swept away (whoosh) and a shockwave thump
n = int(0.9 * SR); tt = t_(n); r = rng.standard_normal(n); w = np.zeros(n)
for s0 in range(0, n, 1024): f = 3000 - 2600 * s0 / n; w[s0:s0 + 1024] = bp(r[s0:s0 + 1024], f, f * 1.8, 1)
place(sfx, w * np.sin(np.pi * tt / 0.9) ** 2 * 0.5, T['drop'])
# ticks for each row, and a counter blip as the FPS climbs back to 144
for rt in (T['vo'][5] + 0.85, T['vo'][6] + 0.8, T['vo'][7] + 0.7):
    place(sfx, bell(note('A6'), 0.4), rt, 0.12); place(sfx, bell(note('E7'), 0.4), rt + 0.06, 0.08)
for k in range(10): place(sfx, np.sin(2 * np.pi * (600 + 90 * k) * t_(int(0.03 * SR))) * np.exp(-t_(int(0.03 * SR)) / 0.01), T['drop'] + 0.15 + k * 0.11, 0.06)
for k in range(12): place(sfx, np.sin(2 * np.pi * (700 + 80 * k) * t_(int(0.03 * SR))) * np.exp(-t_(int(0.03 * SR)) / 0.01), T['fps'] + k * 0.08, 0.07)

# ---------- 3. phonk from the drop: 130 BPM, F# minor ----------
BPM = 130; B = 60 / BPM; S16 = B / 4; BAR = 4 * B
def cowbell(f, d=0.22):
    n = int(d * SR); tt = t_(n)
    s = np.sign(np.sin(2 * np.pi * f * tt)) + np.sign(np.sin(2 * np.pi * f * 1.4836 * tt))
    s = bp(s, 700, 6500) * (np.exp(-tt / 0.06) + 0.25 * np.exp(-tt / 0.25))
    return np.tanh(2.5 * s) * np.minimum(1, tt / 0.001)
def b808(f, d, slide_to=None):
    n = int(d * SR); tt = t_(n)
    fr = f * (1 + 1.8 * np.exp(-tt / 0.012))
    if slide_to: fr = fr * np.where(tt > d * 0.55, (slide_to / f) ** np.clip((tt - d * 0.55) / 0.08, 0, 1), 1)
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt / (d * 0.8))
    return np.tanh(3.0 * s) * np.minimum(1, (d - tt) / 0.02)
kn = int(0.22 * SR); kick = np.sin(2 * np.pi * np.cumsum(50 + 140 * np.exp(-t_(kn) / 0.02)) / SR) * np.exp(-t_(kn) / 0.09)
kick += hp(rng.standard_normal(kn), 3000) * np.exp(-t_(kn) / 0.004) * 0.5
cn = int(0.3 * SR); clap = np.zeros(cn)
for o_ in (0, 0.007, 0.014, 0.021):
    i = int(o_ * SR); clap[i:] += bp(rng.standard_normal(cn - i), 900, 7000) * np.exp(-t_(cn - i) / (0.12 if o_ == 0.021 else 0.005))
hn = int(0.05 * SR); hat = hp(rng.standard_normal(hn), 8000) * np.exp(-t_(hn) / 0.012)
RIFF = [['F#5', None, 'F#5', None, 'A5', None, 'F#5', None, 'C#6', None, 'B5', None, 'A5', 'F#5', None, None],
        ['F#5', None, 'F#5', None, 'A5', None, 'F#5', None, 'E5', None, None, None, 'C#5', None, 'E5', None]]
ROOT = [('F#1', None), ('F#1', 'E1'), ('D1', None), ('E1', 'C#1')]
end = T['end']
bi = 0; t0 = T['drop']
while t0 < DUR + 0.5:
    calm = t0 >= end - 0.05                      # end card: drums out, the riff and 808 carry it softly
    r0, sl = ROOT[bi % 4]
    place(phonk, b808(note(r0), BAR * 0.62, note(sl) if sl else None), t0, 0.55 if not calm else 0.35)
    place(phonk, b808(note(r0), BAR * 0.3), t0 + 10 * S16, 0.45 if not calm else 0.25)
    for k, nm in enumerate(RIFF[bi % 2]):
        if nm: place(phonk, cowbell(note(nm)), t0 + k * S16, 0.22 if not calm else 0.16)
    if not calm:
        for k in range(16):
            if k in (0, 6, 10): place(phonk, kick, t0 + k * S16, 0.7)
            if k in (4, 12): place(phonk, clap, t0 + k * S16, 0.45)
            if k % 2 == 0: place(phonk, hat, t0 + k * S16, 0.12)
        if bi % 4 == 3:                          # triplet hat roll at the end of every 4 bars
            for k in range(6): place(phonk, hat, t0 + 3 * B + k * B / 6, 0.1)
    t0 += BAR; bi += 1
# the drop hit itself, and the final hit on "Coming soon."
for at, g in ((T['drop'], 0.9), (T['soon'], 0.5)):
    n = int(1.4 * SR); tt = t_(n)
    place(phonk, np.tanh(2 * np.sin(2 * np.pi * np.cumsum(38 + 120 * np.exp(-tt / 0.04)) / SR) * np.exp(-tt / 0.5)) + hp(rng.standard_normal(n), 3000) * np.exp(-tt / 0.06) * 0.4, at, g)
for i, nm in enumerate(['F#6', 'C#7', 'F#7']): place(phonk, bell(note(nm), 2.0), T['soon'] + 0.1 + i * 0.07, 0.06)

# ---------- 4. the voice-over (voice 4) ----------
for k, at in enumerate(T['vo']):
    a, sr = sf.read(f'assets/vo{k}.wav')
    if a.ndim > 1: a = a.mean(1)
    a = resample_poly(a, SR, sr)
    place(vo, a / (np.max(np.abs(a)) + 1e-9), at, 2.0)
vo = hp(vo, 90)
# ducking: the music dips ~8 dB under the voice
env = np.abs(vo); env = lfilter([1 - 0.9995], [1, -0.9995], env); env = np.minimum(1, env / (np.max(env) * 0.35 + 1e-9))
duck = 1 - 0.72 * env

def reverb(x, secs=1.5, wet=0.25):
    n = int(secs * SR); ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 7000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]
music = reverb(game, 1.2, 0.2) * 0.7 + reverb(sfx, 1.0, 0.15) * 0.8 + reverb(phonk, 1.0, 0.12) * 0.62
mixd = np.tanh(music * duck * 1.1) / 1.1 + reverb(vo, 0.6, 0.06) * 1.0
mixd = mixd[:int(DUR * SR)]
tt = t_(len(mixd)); mixd *= np.minimum(1, tt / 0.05) * np.minimum(1, (DUR - tt) / 1.0)
st = np.stack([mixd, np.roll(mixd, 11) * 0.97 + mixd * 0.03], 1); st /= np.max(np.abs(st)) * 1.05
with wave.open('out/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
for a, b, nm in [(0, 3.9, 'game'), (4, 8.5, 'chaos'), (8.6, 9.35, 'freeze'), (9.4, 11.5, 'drop'), (11.5, 16.7, 'rows'), (18.6, 23, 'end')]:
    seg = mixd[int(a * SR):int(b * SR)]; print(f'{nm:7s} rms {20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9):6.1f} dB')
print('wrote', st.shape[0] / SR, 's')
# balance check: the voice should sit clearly above the ducked music
_m = (np.tanh(music * duck * 1.1) / 1.1)[:int(DUR * SR)]; _v = (reverb(vo, 0.6, 0.06))[:int(DUR * SR)]
for a, b, nm in [(0.4, 3.4, 'intro vo'), (3.9, 7.0, 'chaos vo'), (9.6, 11.2, 'drop vo'), (11.6, 16.5, 'rows vo'), (18.8, 22, 'end vo')]:
    rm = lambda x: 20 * np.log10(np.sqrt(np.mean(x[int(a * SR):int(b * SR)] ** 2)) + 1e-9)
    print(f'{nm:9s} voice {rm(_v):6.1f}  music {rm(_m):6.1f}')
