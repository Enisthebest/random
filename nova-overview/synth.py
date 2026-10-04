"""The Tour: an uplifting deep-house track at 120 BPM in D major (one bar = one screen), with a soft whoosh on every
slide, a lift into every chapter title, a bubbly breakdown for the icons, a build into the wall of screens and a
warm ending. Synthesized with numpy/scipy, no samples."""
import json, wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
D = json.load(open('out/timeline.json'))
T, DUR, SLIDES, LINES = D['T'], D['DUR'], D['CUTS'], D['LINES']
SEC = T['sections']
N = int(DUR * SR) + SR * 3
rng = np.random.default_rng(11)
BAR = T['BAR']; B = BAR / 4


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

def rhodes(f, dur=1.9, v=1.0):
    n = int(dur * SR); tt = t_(n)
    s = np.sin(2 * np.pi * f * tt + 0.9 * np.exp(-tt / 0.25) * np.sin(2 * np.pi * f * tt)) + 0.2 * np.sin(4 * np.pi * f * tt) * np.exp(-tt / 0.4)
    return lp(s, 3000) * np.exp(-tt / 1.4) * np.minimum(1, tt / 0.004) * np.minimum(1, (dur - tt) / 0.05) * v
def pad(fs, dur, att=0.6):
    n = int(dur * SR); tt = t_(n); s = np.zeros(n)
    for f in fs:
        for d in (-0.08, 0, 0.07):
            ph = rng.random() * 6.28; s += np.sign(np.sin(2 * np.pi * f * 2 ** (d / 12) * tt + ph)) * 0.3 + np.sin(2 * np.pi * f * 2 ** (d / 12) * tt + ph)
    return lp(s / len(fs), 1600) * np.minimum(1, tt / att) * np.minimum(1, (dur - tt) / 0.3)
def pluck(f, dur=0.32, bright=4000):
    n = int(dur * SR); tt = t_(n)
    s = sum(np.sign(np.sin(2 * np.pi * f * k * tt)) / k for k in (1, 2)) * 0.5 + np.sin(2 * np.pi * f * tt)
    return lp(s, bright) * np.exp(-tt / 0.09) * np.minimum(1, tt / 0.002)
def bell(f, dur=1.6):
    n = int(dur * SR); tt = t_(n)
    return np.sin(2 * np.pi * f * tt + 1.0 * np.exp(-tt / 0.12) * np.sin(2 * np.pi * f * 3.5 * tt)) * np.exp(-tt / (dur / 3.5)) * np.minimum(1, tt / 0.002)
def sub(f, dur):
    n = int(dur * SR); tt = t_(n)
    return np.sin(2 * np.pi * f * tt) * np.minimum(1, tt / 0.01) * np.minimum(1, (dur - tt) / 0.03)

kn = int(0.35 * SR); kick = np.sin(2 * np.pi * np.cumsum(46 + 110 * np.exp(-t_(kn) / 0.035)) / SR) * np.exp(-t_(kn) / 0.17)
kick += lp(rng.standard_normal(kn), 3000) * np.exp(-t_(kn) / 0.004) * 0.3
hn = int(0.06 * SR); hat = hp(rng.standard_normal(hn), 8000) * np.exp(-t_(hn) / 0.015)
on = int(0.22 * SR); ohat = hp(rng.standard_normal(on), 7000) * np.exp(-t_(on) / 0.08)
cn = int(0.3 * SR); clap = np.zeros(cn)
for o_ in (0, 0.008, 0.016):
    i = int(o_ * SR); clap[i:] += bp(rng.standard_normal(cn - i), 1000, 6000) * np.exp(-t_(cn - i) / (0.09 if o_ == 0.016 else 0.006))
sn = int(0.04 * SR); shaker = bp(rng.standard_normal(sn), 5000, 12000) * np.exp(-t_(sn) / 0.012)

music, drums, bass, fx = (np.zeros(N) for _ in range(4))
side = np.ones(N)   # sidechain envelope: pads and bass duck under each kick

# D major: Dmaj9 - F#m7 - Bm9 - Gmaj7(#11-ish)
CH = [['D3', 'F#3', 'A3', 'C#4', 'E4'], ['F#2', 'A3', 'C#4', 'E4', 'F#4'], ['B2', 'D3', 'F#3', 'A3', 'C#4'], ['G2', 'B3', 'D4', 'F#4', 'A4']]
ROOT = ['D2', 'F#2', 'B1', 'G1']
HOOK = [['A5', None, 'F#5', 'A5', None, 'B5', 'A5', None], ['C#6', None, 'A5', None, 'F#5', None, 'E5', None],
        ['D6', None, 'C#6', 'B5', None, 'A5', None, 'F#5'], ['B5', None, 'A5', None, 'F#5', 'E5', None, None]]
END = T['end']; WALL = T['wall']

def section_at(t):
    for s in SEC:
        if s['t0'] <= t < s['t1']: return s
    return None

nbar = int(np.ceil(DUR / BAR)) + 1
for bi in range(nbar):
    t0 = bi * BAR; j = bi % 4; ch = CH[j]
    s = section_at(t0 + 0.01)
    intro = t0 < 4.0
    title = s is not None and t0 < s['s0'] - 0.01            # the title bar of a chapter: drums drop out, the pad swells
    icons = s is not None and s['icons'] and not title
    pro = s is not None and s['pro']
    first = s is not None and s['title'] == 'First boot.'
    wall = WALL <= t0 < END
    ending = t0 >= END
    if t0 >= DUR: break

    # chords: rhodes on every bar, pad underneath
    if not ending or t0 < END + 0.1:
        for i, nm in enumerate(ch): place(music, rhodes(note(nm), BAR, 0.32 if not intro else 0.22), t0 + i * 0.012)
    place(music, pad([note(x) for x in ch[:4]], BAR + 0.25, 0.4 if not title else 1.6), t0, 0.16 if (title or intro or icons) else 0.11)

    if intro or ending: continue
    # drums
    full = not title and not icons and not first
    for b in range(4):
        tb = t0 + b * B
        if not title and not icons:
            place(drums, kick, tb, 0.8 if full else 0.55)
            i = int(tb * SR); m = min(N - i, int(0.25 * SR)); side[i:i + m] = np.minimum(side[i:i + m], 1 - 0.6 * np.exp(-t_(m) / 0.09))
        if full or wall:
            place(drums, ohat, tb + B / 2, 0.16)
            if b % 2: place(drums, clap, tb, 0.32)
        if not title:
            for k in range(4): place(drums, shaker, tb + k * B / 4, (0.05 if k % 2 else 0.03) * (0.6 if icons else 1))
    if title:   # a soft half-time pulse keeps it moving under the title
        place(drums, kick, t0, 0.35); place(drums, kick, t0 + 2 * B, 0.25)
    # bass: off-beat sub, D major roots
    if not title and not icons:
        for b in range(4): place(bass, lp(sub(note(ROOT[j]), B * 0.7) + 0.3 * sub(note(ROOT[j]) * 2, B * 0.7), 500), t0 + b * B + B / 2, 0.45)
    # arp: 16th plucks on chord tones, brighter later in the film
    if not title:
        prog = clamp_ = min(1.0, t0 / WALL)
        tones = [note(x) * 2 for x in ch[1:]]
        for k in range(16):
            if icons or full or wall or pro or first:
                f = tones[(k * 3 + bi) % len(tones)] * (2 if k % 8 == 7 else 1)
                place(music, pluck(f, 0.3, 1800 + 4000 * prog + (2500 if icons else 0)), t0 + k * B / 4, (0.07 if not icons else 0.1) * (0.6 + 0.4 * (k % 4 == 0)))
    # the hook on the main chapters and on the wall
    if (full and not pro) or wall:
        for k, nm in enumerate(HOOK[j]):
            if nm: place(music, bell(note(nm), 0.9), t0 + k * B / 2, 0.075)
    if pro and not title:   # ACE: a cute marimba-like answer to the hook
        for k, nm in enumerate(HOOK[(j + 2) % 4]):
            if nm: place(music, rhodes(note(nm) , 0.5, 0.16), t0 + k * B / 2 + B / 4)

# lifts into every chapter title, and a short breath before the next screens start
for s in SEC:
    a = s['t0'] - 1.6; n = int(1.6 * SR); u = t_(n) / 1.6; r = rng.standard_normal(n); o = np.zeros(n)
    for s0 in range(0, n, 2048):
        c = 500 + 6000 * u[s0] ** 2; o[s0:s0 + 2048] = bp(r[s0:s0 + 2048], c, c * 1.5, 1)
    place(fx, o * u ** 2 * 0.22, a)
    n = int(1.2 * SR); tt = t_(n)   # a soft low impact + chime on the title
    place(fx, np.sin(2 * np.pi * np.cumsum(55 + 60 * np.exp(-tt / 0.06)) / SR) * np.exp(-tt / 0.4), s['t0'], 0.35)
    place(fx, bell(note('A6' if not s['pro'] else 'D7'), 1.4), s['t0'] + 0.15, 0.05)
# a whoosh on every slide (centred on the downbeat) and a little click as the caption appears
for c in SLIDES:
    n = int(0.8 * SR); tt = t_(n); env = np.sin(np.pi * tt / 0.8) ** 2
    w = np.zeros(n); r = rng.standard_normal(n)
    for s0 in range(0, n, 1024):
        f = 700 + 2600 * np.sin(np.pi * s0 / n); w[s0:s0 + 1024] = bp(r[s0:s0 + 1024], f, f * 1.8, 1)
    place(fx, w * env * 0.1, c - 0.4)
    m = int(0.02 * SR); place(fx, np.sin(2 * np.pi * 3000 * t_(m)) * np.exp(-t_(m) / 0.004), c + 0.3, 0.05)
# wallpapers: a sparkle on each new wallpaper; icons: the accent flood is a rising shimmer
for s in SEC:
    if s['walls']:
        for k in range(6):
            for i, nm in enumerate(['D6', 'F#6', 'A6']): place(fx, bell(note(nm) * (1 + k * 0.0), 1.0), s['s0'] + k * BAR + 0.05 + i * 0.05, 0.035)
    if s['icons']:
        n = int(1.2 * SR); tt = t_(n)
        place(fx, sum(np.sin(2 * np.pi * (1200 + 2400 * tt / 1.2) * h * tt) / h for h in (1, 2)) * np.sin(np.pi * tt / 1.2) ** 2, s['s0'] + 2.3, 0.05)
        for k in range(24): place(fx, pluck(note(['D6', 'F#6', 'A6', 'C#7'][k % 4]), 0.15, 7000), s['s0'] - 0.4 + k * 0.06, 0.04)
    if s['pro']:   # Buddy says hi
        for k, f in enumerate([620, 780, 700]):
            n = int(0.09 * SR); tt = t_(n)
            place(fx, lp(np.sin(2 * np.pi * np.cumsum(f * (1 + 0.15 * np.exp(-tt / 0.02))) / SR), 3500) * np.sin(np.pi * tt / 0.09), s['s0'] + 0.5 + k * 0.13, 0.1)
# the wall: a long riser into "Every screen.", a hit on it, and on "Designed."
rt = T['wallLine'] - WALL; n = int(rt * SR); u = t_(n) / rt; r = rng.standard_normal(n); o = np.zeros(n)
for s0 in range(0, n, 2048):
    c = 300 + 7000 * u[s0] ** 2; o[s0:s0 + 2048] = bp(r[s0:s0 + 2048], c, c * 1.5, 1)
place(fx, o * u ** 2.2 * 0.3, WALL)
i0, i1 = int((T['wallLine'] - 0.2) * SR), int(T['wallLine'] * SR)
for buf in (music, drums, bass, fx): buf[i0:i1] *= np.linspace(1, 0.15, i1 - i0)
for at, g in ((T['wallLine'], 0.7), (T['wallLine'] + 1.0, 0.45)):
    n = int(1.6 * SR); tt = t_(n)
    place(fx, np.sin(2 * np.pi * np.cumsum(42 + 90 * np.exp(-tt / 0.05)) / SR) * np.exp(-tt / 0.6) + hp(rng.standard_normal(n), 4000) * np.exp(-tt / 0.05) * 0.4, at, g)
# the end: a warm final chord and a chime on the star
for i, nm in enumerate(['D2', 'A2', 'D3', 'F#3', 'A3', 'C#4', 'E4', 'A4']): place(music, rhodes(note(nm), 5.5, 0.35), END + 0.02 + i * 0.03)
place(music, pad([note(x) for x in ['D3', 'F#3', 'A3', 'E4']], 6.0, 1.0), END, 0.14)
for i, nm in enumerate(['A6', 'D7', 'F#7']): place(fx, bell(note(nm), 2.4), END + 0.35 + i * 0.08, 0.06)
place(fx, bell(note('A6'), 2.0), T['soon'], 0.05)
# intro: the star appears with a soft swell and a chime
place(fx, bell(note('D7'), 2.5), 0.3, 0.07); place(fx, bell(note('A6'), 2.5), 0.38, 0.05)

def reverb(x, secs=2.0, wet=0.3):
    n = int(secs * SR); ir = lp(rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5)), 7000); ir /= np.sqrt(np.sum(ir ** 2))
    return x + wet * fftconvolve(x, ir)[:len(x)]
mixd = reverb(music, 2.4, 0.32) * side * 0.9 + drums * 0.9 + lp(bass, 400) * side + reverb(fx, 1.4, 0.25)
mixd = mixd[:int(DUR * SR)]
tt = t_(len(mixd)); mixd *= np.minimum(1, tt / 0.2) * np.minimum(1, (DUR - tt) / 1.8)
mixd = np.tanh(mixd * 1.15) / 1.15
st = np.stack([mixd, np.roll(mixd, 17) * 0.96 + mixd * 0.04], 1); st /= np.max(np.abs(st)) * 1.05
with wave.open('out/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
# section loudness, to check the balance
for a, b, nm in [(0, 4, 'intro'), (6, 20, 'first boot'), (22, 38, 'desktop'), (102, 108, 'icons'), (110, 122, 'ace'), (126, 130, 'wall'), (130, DUR - 2, 'end')]:
    seg = mixd[int(a * SR):int(b * SR)]; print(f'{nm:11s} rms {20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9):6.1f} dB')
print('wrote', st.shape[0] / SR, 's')
