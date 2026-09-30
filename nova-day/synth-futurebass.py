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


# ---------------- music: future bass in F# minor ----------------
# bars start on beats 3, 7, ... so beat 15 (the drop) is a downbeat; bar 9 wraps the loop seam.
# Dmaj7 - E6 - F#m7 - C#m7, twice, then D - E into the seam.
CHORDS = [
    ['D2', 'F#3', 'A3', 'C#4', 'E4'],
    ['E2', 'G#3', 'B3', 'C#4', 'E4'],
    ['F#2', 'A3', 'C#4', 'E4', 'A4'],
    ['C#2', 'G#3', 'B3', 'E4', 'G#4'],
    ['D2', 'F#3', 'A3', 'C#4', 'E4'],
    ['E2', 'G#3', 'B3', 'C#4', 'E4'],
    ['F#2', 'A3', 'C#4', 'E4', 'A4'],
    ['C#2', 'G#3', 'B3', 'E4', 'G#4'],
    ['D2', 'F#3', 'A3', 'C#4', 'E4'],
    ['E2', 'G#3', 'B3', 'D4', 'E4'],
]
BAR = 4 * B
DROP = T['drop']
BREAK = 31 * B
bar_start = lambda j: (3 + 4 * j) * B
full = lambda tm: DROP - 0.001 <= (tm % LOOP) < BREAK

keys = np.zeros(TOT); chords = np.zeros(TOT); bass = np.zeros(TOT); drums = np.zeros(TOT); lead = np.zeros(TOT); fx = np.zeros(TOT)


def ep(f, n):
    """Soft electric-piano tone: sine + bell partial, fast attack, long decay."""
    tt = t_(n)
    s = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / 0.3) + 0.12 * np.sin(2 * np.pi * 7 * f * tt) * np.exp(-tt / 0.05)
    return s * np.minimum(1, tt / 0.006) * np.exp(-tt / 1.1)


def supersaw(f, n, j, v):
    s = np.zeros(n)
    for d, dt in enumerate((-0.18, -0.07, 0, 0.07, 0.18)):
        s += saw(f * 2 ** (dt / 12), n, ((j * 5 + v * 3 + d) * 0.618) % 1)
    return s / 5


# chop pattern for the drop chords (16th grid within a bar)
CHOP = [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0]
# lead melody: one note per 8th, scale degrees over each chord (vocal-ish chops)
MELODY = [['C#5', None, 'E5', None, 'F#5', 'E5', None, 'C#5'],
          ['B4', None, 'C#5', None, 'E5', None, 'G#5', 'E5'],
          ['F#5', None, 'A5', None, 'G#5', 'E5', None, 'C#5'],
          ['E5', None, 'G#5', None, 'B5', 'G#5', 'E5', None]]

for cyc in (0, LOOP):
    for j, ch in enumerate(CHORDS):
        st = bar_start(j) + cyc
        # keys: always there, the only harmony in the soft sections
        for hit in (0, 1.5, 2.5):
            at = st + hit * B
            n = int(1.6 * SR)
            s = sum(ep(note(x), n) for x in ch[1:])
            place(keys, s, at, 0.10 if full(at) else 0.16)
        # supersaw chord chops in the drop
        for k, on in enumerate(CHOP):
            at = st + k * B / 4
            if not on or not full(at):
                continue
            ln = 3 if k in (6, 12) else 2
            n = int(ln * B / 4 * SR)
            s = sum(supersaw(note(x), n, j, v) for v, x in enumerate(ch[1:]))
            s = lp(s, 5200) * np.minimum(1, t_(n) / 0.004) * np.minimum(1, (n / SR - t_(n)) / 0.02)
            place(chords, s, at, 0.16)
        # 808: long sub on the root, gliding in from above
        f0 = note(ch[0])
        for hit in ((0, 2.5), (2.5, 1.5)):
            at = st + hit[0] * B
            n = int(hit[1] * B * SR)
            tt = t_(n)
            fr = f0 * (1 + 0.5 * np.exp(-tt / 0.03))
            s = np.tanh(1.6 * np.sin(2 * np.pi * np.cumsum(fr) / SR)) * np.minimum(1, tt / 0.004) * np.minimum(1, (n / SR - tt) / 0.03)
            if full(at):
                place(bass, s * np.exp(-tt / 1.2), at, 0.5)
            elif hit[0] == 0:
                place(bass, np.sin(2 * np.pi * f0 * tt) * np.minimum(1, tt / 0.05) * np.minimum(1, (n / SR - tt) / 0.08), at, 0.25)
        # lead chops in the drop: saw through two formant band-passes
        mel = MELODY[j % 4]
        for k, nm in enumerate(mel):
            at = st + k * B / 2
            if nm is None or not full(at):
                continue
            n = int(B / 2 * SR * 0.85)
            f = note(nm)
            src = saw(f, n) + 0.5 * saw(f * 1.004, n)
            s = bp(src, 700, 1100) * 1.2 + bp(src, 1900, 2600) * 0.8
            s *= np.minimum(1, t_(n) / 0.01) * np.exp(-t_(n) / 0.18)
            place(lead, s, at, 0.55)

# drums: soft four in the intro, half-time in the drop
kick_n = int(0.45 * SR)
tk = t_(kick_n)
kick = np.sin(2 * np.pi * np.cumsum(48 + 130 * np.exp(-tk / 0.03)) / SR) * np.exp(-tk / 0.26)
kick[:180] += rng.standard_normal(180) * np.linspace(0.5, 0, 180)
sn_n = int(0.35 * SR)
tsn = t_(sn_n)
snare = bp(rng.standard_normal(sn_n), 1200, 7000) * np.exp(-tsn / 0.09) + np.sin(2 * np.pi * 190 * tsn) * np.exp(-tsn / 0.05) * 0.6
hat_n = int(0.05 * SR)
hat = hp(rng.standard_normal(hat_n), 7500) * np.exp(-t_(hat_n) / 0.01)
for cyc in (0, LOOP):
    for k in range(40):
        tm = k * B
        at = tm + cyc
        pos = (k - 3) % 4
        if full(tm):
            if pos == 0:
                place(drums, kick, at, 1.0)
            if pos == 1:
                place(drums, kick, at + B / 2, 0.7)
            if pos == 2:
                place(drums, snare, at, 0.55)
            for e8 in range(2):
                sw = 0.035 if e8 else 0
                place(drums, hat, at + e8 * B / 2 + sw, 0.07 if e8 else 0.05)
            if pos == 3:
                for r in range(3):
                    place(drums, hat, at + B / 2 + r * B / 6, 0.05)
        else:
            if pos in (0, 2):
                place(drums, kick, at, 0.5)
            if tm < DROP and k >= 7:
                place(drums, hat, at + B / 2, 0.04)
    # build: snare roll accelerating into the drop, then a beat of silence-ish space
    for i in range(24):
        at = DROP - 3 * B + 3 * B * (1 - (1 - i / 24) ** 1.6) + cyc
        place(drums, snare, at, 0.05 + 0.2 * i / 23)

# sidechain pump on the halftime kicks
duck = np.ones(TOT)
for cyc in (0, LOOP):
    for k in range(40):
        tm = k * B
        if not full(tm):
            continue
        pos = (k - 3) % 4
        for off in ([0] if pos == 0 else [B / 2] if pos == 1 else [0] if pos == 2 else []):
            i = int((tm + off + cyc) * SR)
            m = int(B * SR)
            d = 1 - 0.7 * np.exp(-t_(m) / 0.12)
            duck[i:i + m] = np.minimum(duck[i:i + m], d[:len(duck[i:i + m])])

# riser + reverse swell into the drop, sub impact on it
for cyc in (0, LOOP):
    rn = int(4 * B * SR)
    r = rng.standard_normal(rn)
    tt = t_(rn) / (4 * B)
    o = np.zeros(rn)
    for s in range(0, rn, 2048):
        c = 300 + 7000 * tt[s] ** 2
        o[s:s + 2048] = bp(r[s:s + 2048], c, min(c * 1.5, 20000), 1)
    place(fx, o * tt ** 2.2 * 0.35, DROP - 4 * B + cyc)
    im_n = int(1.8 * SR)
    ti = t_(im_n)
    impact = np.sin(2 * np.pi * np.cumsum(34 + 70 * np.exp(-ti / 0.09)) / SR) * np.exp(-ti / 0.6)
    place(fx, impact * 0.8 + hp(rng.standard_normal(im_n), 4000) * np.exp(-ti / 0.35) * 0.25, DROP + cyc)


def reverb(x, secs=1.8, wet=0.25):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-t_(n) / (secs / 5))
    ir = lp(ir, 5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    y = fftconvolve(x, ir)[:len(x)]
    tail = fftconvolve(x[-n:], ir)[n:]
    y[:len(tail)] += tail[:len(y)]
    return x + wet * y


stereo_src = (keys + chords * duck + lead)
music = reverb(stereo_src, 2.6, 0.4) + bass * duck + drums + fx

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
def shutter():
    # two short mechanical noise bursts
    n = int(0.12 * SR)
    s = np.zeros(n)
    for o, g in ((0, 1.0), (0.045, 0.7)):
        i = int(o * SR); m = n - i
        s[i:] += bp(rng.standard_normal(m), 1500, 7000) * np.exp(-t_(m) / 0.008) * g
    return s


def glide(k, g=0.24, lo=250, hi=2200):
    peak_place(whoosh(G, lo, hi), T[k] + 0.45, g)


# unlock: swipe up, the clock settles into the bar
peak_place(whoosh(G, 200, 1800), T['swipe'] + 0.4, 0.4)
peak_place(chime([note('E5'), note('A5')], 1.0), T['unlock'] + 0.78, 0.1)
glide('barOut', 0.16, 600, 3000)
for off in (0, 0.05, 0.1, 0.15, 0.2, 0.25):
    peak_place(thud(190 + 200 * off), T['cards'] + off + G * 0.85, 0.16)
# Files
peak_place(click(), T['filesClick'], 0.5)
glide('files', 0.3)
peak_place(click(), T['shotsClick'], 0.4)
peak_place(click(), T['shotsClick'] + 0.19, 0.35)
glide('openShots', 0.2, 400, 2600)
glide('toShort', 0.22)
# the drop: camera shortcut, selection grows, capture flies home
peak_place(click(), T['drop'], 0.5)
peak_place(shutter(), T['drop'] + 0.02, 0.35)
glide('select', 0.3, 300, 3000)
peak_place(shutter(), T['capture'], 0.45)
glide('capture', 0.32, 3000, 500)
peak_place(thud(220), T['capture'] + G * 0.9, 0.25)
# Settings + accent flood
peak_place(click(), T['gearClick'], 0.5)
glide('settings', 0.3)
peak_place(click(), T['accent'], 0.5)
peak_place(swell([note('C#5'), note('E5'), note('A5')], 0.9), T['accent'] + 0.4, 0.1)
glide('toDnd', 0.22)
# notification arrives, Do Not Disturb swallows it
peak_place(whoosh(G, 900, 3500), T['toast'] + 0.45, 0.18)
peak_place(chime([note('B5'), note('E6')], 1.0), T['toast'] + 0.55, 0.12)
peak_place(click(), T['dnd'], 0.5)
peak_place(tick(1400, 0.006), T['dnd'] + 0.08, 0.3)
peak_place(whoosh(G, 3000, 400), T['dnd'] + 0.5, 0.22)
peak_place(thud(260), T['dnd'] + 0.08 + G * 0.95, 0.2)
# USB eject
glide('toUsb', 0.22)
peak_place(click(), T['eject'], 0.5)
peak_place(whoosh(G, 1500, 400), T['eject'] + 0.4, 0.2)
peak_place(thud(170), T['usbClose'] + G * 0.9, 0.22)
# back to the lock screen
glide('toFull', 0.24)
peak_place(click(), T['lockClick'], 0.5)
peak_place(whoosh(G, 1800, 200), T['lock'] + 0.45, 0.35)
peak_place(thud(120), T['lock'] + G * 0.9, 0.25)

# ---------------- mix + master ----------------
mixd = music + sfx * 0.9
mixd = mixd[N:2 * N]                      # second cycle: tails already wrapped in
mixd = np.tanh(mixd * 0.9) / 0.9          # gentle saturation / safety
st = np.stack([mixd, np.roll(mixd, 11) * 0.98 + mixd * 0.02], 1)  # slight width
st /= np.max(np.abs(st)) * 1.05
with wave.open('out/nova-day-fb-raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote out/nova-day-fb-raw.wav', st.shape[0] / SR, 's')
