"""NOVA OS soundtrack + SFX, synthesized from scratch (no samples).

40 beats per 22s loop. Before the drop the song sits behind a low-pass filter, as if in the
next room; it opens fully on the drop (the Headphones click) and closes again by the loop seam.
Two cycles are rendered and the second is kept, so reverb tails and filters wrap seamlessly.
"""
import json
import numpy as np
from scipy.signal import butter, lfilter, lfilter_zi, fftconvolve
import wave

SR = 48000
TL = json.load(open('out/timeline.json'))
T, B = TL['T'], TL['B']
LOOP = 22.0
N = int(LOOP * SR)
TOT = 2 * N
rng = np.random.default_rng(7)


def t_(n):
    return np.arange(n) / SR


def env_ad(n, a, d):
    """Attack/exponential-decay envelope, times in seconds."""
    t = t_(n)
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)
    return e


def place(buf, sig, at, gain=1.0):
    """Mix sig into buf at time `at` (seconds), wrapping around the 2-loop buffer."""
    i = int(round(at * SR)) % TOT
    n = len(sig)
    end = i + n
    if end <= TOT:
        buf[i:end] += sig * gain
    else:
        k = TOT - i
        buf[i:] += sig[:k] * gain
        buf[:n - k] += sig[k:] * gain


def both(buf, sig, at, gain=1.0):
    for c in (0, LOOP):
        place(buf, sig, at + c, gain)


def bp(x, lo, hi, order=2):
    b, a = butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band')
    return lfilter(b, a, x)


def lp(x, f, order=2):
    b, a = butter(order, f / (SR / 2), 'low')
    return lfilter(b, a, x)


def hp(x, f, order=2):
    b, a = butter(order, f / (SR / 2), 'high')
    return lfilter(b, a, x)


def saw(freq, n, phase=0.0):
    ph = (phase + np.cumsum(np.full(n, freq) / SR)) % 1.0
    return 2 * ph - 1


def note(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    n, o = name[:-1], int(name[-1])
    return 440 * 2 ** ((names[n] + 12 * (o + 1) - 69) / 12)


# ---------------- music ----------------
# bars start on beats 3, 7, ... so beat 15 (the drop) is a downbeat; bar 9 wraps the loop seam.
CHORDS = [
    ['A2', 'C4', 'E4', 'A4'],   # Am
    ['F2', 'A3', 'C4', 'F4'],   # F
    ['C3', 'E4', 'G4', 'C5'],   # C
    ['G2', 'B3', 'D4', 'G4'],   # G
    ['A2', 'C4', 'E4', 'A4'],
    ['F2', 'A3', 'C4', 'F4'],
    ['C3', 'E4', 'G4', 'C5'],
    ['G2', 'B3', 'D4', 'G4'],
    ['F2', 'A3', 'C4', 'F4'],
    ['G2', 'B3', 'D4', 'E4'],
]
BAR = 4 * B
DROP = T['drop']
BREAK = 31 * B      # everything folds into the clock: breakdown


def bar_start(j):
    return (3 + 4 * j) * B


def section(time):
    tm = time % LOOP
    return 'full' if DROP - 0.001 <= tm < BREAK else 'soft'


pads = np.zeros(TOT); bass = np.zeros(TOT); drums = np.zeros(TOT); arp = np.zeros(TOT); fx = np.zeros(TOT)

for cyc in (0, LOOP):
    for j, ch in enumerate(CHORDS):
        st = bar_start(j) + cyc
        n = int((BAR + 0.6) * SR)
        # pad: detuned saws, soft attack, released into the next bar
        p = np.zeros(n)
        for vi, nm in enumerate(ch[1:]):
            f = note(nm)
            for di, dt in enumerate((-0.12, 0, 0.12)):
                # fixed phase per bar/voice so both rendered cycles are identical
                p += saw(f * 2 ** (dt / 12), n, ((j * 7 + vi * 3 + di) * 0.618) % 1)
        e = np.minimum(1, t_(n) / 0.25) * np.minimum(1, np.maximum(0, (BAR + 0.6 - t_(n))) / 0.6)
        p = lp(p, 2400) * e / 9
        place(pads, p, st)
        # bass: sustained sub in the soft parts, offbeat plucks in the full part
        f0 = note(ch[0])
        for k in range(8):
            at = st + k * B / 2
            if section(at) == 'full':
                if k % 2 == 1:
                    m = int(B / 2 * SR * 0.9)
                    s = saw(f0, m) * 0.6 + np.sin(2 * np.pi * f0 * t_(m))
                    s = lp(s, 900) * env_ad(m, 0.004, 0.12)
                    place(bass, s, at, 0.55)
            elif k == 0:
                m = int(BAR * SR)
                s = np.sin(2 * np.pi * f0 * t_(m)) * np.minimum(1, t_(m) / 0.05) * np.minimum(1, (BAR - t_(m)) / 0.08)
                place(bass, s, at, 0.35)
        # arp: sixteenth-note plucks over chord tones
        tones = [note(x) * 2 for x in ch[1:]] + [note(ch[2]) * 4]
        for k in range(16):
            at = st + k * B / 4
            f = tones[[0, 1, 2, 3, 2, 1, 0, 2][k % 8]]
            m = int(0.22 * SR)
            s = (np.sign(np.sin(2 * np.pi * f * t_(m))) * 0.35 + saw(f, m) * 0.5)
            s = lp(s, 3200) * env_ad(m, 0.002, 0.07)
            g = 0.22 if section(at) == 'full' else 0.13
            place(arp, s, at, g * (1.0 if k % 4 == 0 else 0.75))

# drums on the beat grid
kick_n = int(0.4 * SR)
tk = t_(kick_n)
kick = np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-tk / 0.035)) / SR) * np.exp(-tk / 0.22)
kick[:200] += rng.standard_normal(200) * np.linspace(0.4, 0, 200)
clap_n = int(0.25 * SR)
clap = np.zeros(clap_n)
for o in (0, 0.011, 0.022):
    i = int(o * SR)
    clap[i:] += rng.standard_normal(clap_n - i) * np.exp(-t_(clap_n - i) / (0.06 if o == 0.022 else 0.008))
clap = bp(clap, 900, 5000)
hat_n = int(0.06 * SR)
hat = hp(rng.standard_normal(hat_n), 7000) * np.exp(-t_(hat_n) / 0.012)
ohat_n = int(0.25 * SR)
ohat = hp(rng.standard_normal(ohat_n), 6500) * np.exp(-t_(ohat_n) / 0.07)

for cyc in (0, LOOP):
    for k in range(40):
        at = k * B + cyc
        tm = k * B
        full = DROP - 0.001 <= tm < BREAK
        onbar = (k - 3) % 4 == 0
        if full:
            place(drums, kick, at, 0.95)
            if (k - 3) % 2 == 1:
                place(drums, clap, at, 0.5)
            place(drums, ohat, at + B / 2, 0.16)
            for s16 in (1, 3):
                place(drums, hat, at + s16 * B / 4, 0.08)
        else:
            # intro / outro heartbeat: soft kick on bar downbeats and beat 3
            if onbar or (k - 3) % 4 == 2:
                place(drums, kick, at, 0.55)
            if k >= 7 and tm < DROP:
                place(drums, hat, at + B / 2, 0.05)
    # snare roll into the drop
    for i in range(16):
        at = DROP - 2 * B + i * B / 8 + cyc
        place(drums, clap, at, 0.08 + 0.22 * i / 15)

# sidechain: duck pads/bass/arp under every kick in the full section
duck = np.ones(TOT)
for cyc in (0, LOOP):
    for k in range(40):
        tm = k * B
        if DROP - 0.001 <= tm < BREAK:
            i = int((tm + cyc) * SR)
            m = int(B * SR)
            d = 1 - 0.65 * np.exp(-t_(m) / 0.09)
            duck[i:i + m] = np.minimum(duck[i:i + m], d[:len(duck[i:i + m])])

# riser into the drop and impact on it
for cyc in (0, LOOP):
    rn = int(4 * B * SR)
    r = rng.standard_normal(rn)
    tt = t_(rn) / (4 * B)
    out = np.zeros(rn)
    blk = 2048
    for s in range(0, rn, blk):
        c = 400 + 6000 * tt[s] ** 2
        out[s:s + blk] = bp(r[s:s + blk], c, min(c * 1.6, 20000), 1)
    place(fx, out * tt ** 2 * 0.35, DROP - 4 * B + cyc)
    im_n = int(1.6 * SR)
    ti = t_(im_n)
    impact = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-ti / 0.08)) / SR) * np.exp(-ti / 0.5)
    crash = hp(rng.standard_normal(im_n), 3000) * np.exp(-ti / 0.45) * 0.35
    place(fx, impact * 0.8 + crash, DROP + cyc)


def reverb(x, secs=1.8, wet=0.25):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5))
    ir = lp(ir, 5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    y = fftconvolve(x, ir)[:len(x)]
    # wrap the tail from the end of the buffer back to its start
    tail = fftconvolve(x[-n:], ir)[n:]
    y[:len(tail)] += tail[:len(y)]
    return x + wet * y


music = (pads * 0.9 + arp) * duck
music = reverb(music, 2.2, 0.35) + bass * duck * 0.9 + drums + fx

# "next room" low-pass: closed before the drop, open on it, closing again after the breakdown
def cutoff(tm):
    if tm < DROP:
        return 650 + 250 * (tm / DROP) ** 3
    if tm < BREAK:
        return 16000
    u = min(1, (tm - BREAK) / (LOOP - BREAK - 0.4))
    return 16000 * (650 / 16000) ** (u ** 0.8)


blk = 256
y = np.zeros(TOT)
zi = None
for s in range(0, TOT, blk):
    fc = cutoff((s / SR) % LOOP)
    b, a = butter(2, min(fc, 20000) / (SR / 2), 'low')
    if zi is None:
        zi = lfilter_zi(b, a) * 0
    y[s:s + blk], zi = lfilter(b, a, music[s:s + blk], zi=zi)
music = y
# the room is quieter than the open song
lvl = np.array([0.55 if (s / SR) % LOOP < DROP or (s / SR) % LOOP > LOOP - 0.3 else 1.0 for s in range(0, TOT, blk)])
lvl = np.repeat(lvl, blk)[:TOT]
lvl = lp(lvl, 12)
music *= lvl

# ---------------- SFX (each placed so its peak lands on the event) ----------------
sfx = np.zeros(TOT)


def peak_place(sig, at, gain):
    pk = int(np.argmax(np.abs(sig)))
    both(sfx, sig, at - pk / SR, gain)


def click():
    n = int(0.03 * SR)
    s = hp(rng.standard_normal(n), 2500) * np.exp(-t_(n) / 0.0025) + np.sin(2 * np.pi * 1800 * t_(n)) * np.exp(-t_(n) / 0.004) * 0.6
    return s


def tick(f=3200, d=0.002):
    n = int(0.012 * SR)
    return np.sin(2 * np.pi * f * t_(n)) * np.exp(-t_(n) / d)


def whoosh(dur=0.8, lo=300, hi=2500):
    n = int(dur * SR)
    r = rng.standard_normal(n)
    u = t_(n) / dur
    out = np.zeros(n)
    for s in range(0, n, 2048):
        c = lo * (hi / lo) ** np.sin(np.pi * u[s] * 0.5)
        out[s:s + 2048] = bp(r[s:s + 2048], c, c * 1.8, 1)
    return out * np.sin(np.pi * u) ** 2


def thud(f=180):
    n = int(0.18 * SR)
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-t_(n) / 0.02))) / SR) * np.exp(-t_(n) / 0.05)


def chime(fs, dur=2.2):
    n = int(dur * SR)
    s = sum(np.sin(2 * np.pi * f * t_(n)) * np.exp(-t_(n) / (dur / (1.5 + i))) for i, f in enumerate(fs))
    return s * np.minimum(1, t_(n) / 0.004)


def swell(fs, dur=1.2):
    n = int(dur * SR)
    s = sum(np.sin(2 * np.pi * f * t_(n)) for f in fs)
    return s * np.sin(np.pi * t_(n) / dur) ** 2


G = 0.8
# wake: the minute ticks, the desktop blooms
peak_place(tick(2400, 0.004), T['tick'], 0.35)
peak_place(whoosh(0.9, 120, 900), T['wake'] + 0.45, 0.55)
peak_place(whoosh(G, 200, 1600), T['wakePull'] + 0.45, 0.35)
# clicks
for k in ('ctlClick', 'drop', 'night', 'search', 'pick'):
    peak_place(click(), T[k], 0.5)
peak_place(click(), T['grab'], 0.35)
# glides
for k, g in (('panel', 0.3), ('toSound', 0.22), ('toNight', 0.22), ('toShort', 0.22), ('search', 0.3), ('pick', 0.32), ('term', 0.3), ('collapse', 0.4)):
    peak_place(whoosh(G, 250, 2200), T[k] + 0.45, g)
# control cards land one after another
for off in (0, 0, 0.1, 0.1, 0.2):
    peak_place(thud(200 + 60 * off * 10), T['cards'] + off + G * 0.85, 0.22)
peak_place(thud(160), T['panel'] + G * 0.9, 0.3)
# volume ticks every 5%, placed where the eased drag crosses each step
def bez(x1, y1, x2, y2):
    def f(x):
        if x <= 0: return 0.0
        if x >= 1: return 1.0
        lo, hi, u = 0.0, 1.0, x
        for _ in range(28):
            bx = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u * u * x2 + u ** 3
            if bx < x: lo = u
            else: hi = u
            u = (lo + hi) / 2
        return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u * u * y2 + u ** 3
    return f
ease = bez(.45, 0, .15, 1)
ts = np.linspace(T['grab'], T['grab'] + 0.9, 2000)
vs = np.array([0.45 + 0.55 * ease((x - T['grab'] - 0.05) / 0.8) for x in ts])
for i in range(1, 12):
    k = int(np.searchsorted(vs, 0.45 + 0.05 * i - 1e-9))
    peak_place(tick(2600 + 90 * i, 0.0012), ts[min(k, len(ts) - 1)], 0.12)
# Night Mode: toggle + warm swell
peak_place(tick(1400, 0.006), T['night'] + 0.05, 0.3)
peak_place(swell([note('A3'), note('E4'), note('C#5')], 1.2), T['night'] + 0.55, 0.12)
# typing
for i in range(8):
    peak_place(tick(4200 + 300 * (i % 3), 0.0015), T['type'] + i * 0.42 / 8, 0.18)
for i in range(len('nova --do-more')):
    peak_place(tick(3800 + 250 * (i % 4), 0.0015), T['termType'] + i * 0.5 / 14, 0.16)
peak_place(chime([note('E5'), note('B5')], 0.8), T['termType'] + 0.62, 0.08)
# ending: pill thins, star blooms, folds back, pill returns
peak_place(whoosh(G, 1200, 5000), T['thin'] + 0.5, 0.18)
peak_place(chime([note('A5'), note('E6'), note('C#6'), note('A6') * 1.5]), T['fan'] + 0.55, 0.16)
peak_place(whoosh(G, 4000, 900), T['fold'] + 0.45, 0.16)
peak_place(thud(140), T['thicken'] + G * 0.9, 0.22)

# ---------------- mix + master ----------------
mixd = music + sfx * 0.9
mixd = mixd[N:2 * N]                      # second cycle: tails already wrapped in
mixd = np.tanh(mixd * 0.9) / 0.9          # gentle saturation / safety
st = np.stack([mixd, np.roll(mixd, 11) * 0.98 + mixd * 0.02], 1)  # slight width
st /= np.max(np.abs(st)) * 1.05
with wave.open('out/nova-os-raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote out/nova-os-raw.wav', st.shape[0] / SR, 's')
