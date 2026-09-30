# NOVA gradient wallpapers: soft light on black, computed at low res then upscaled.
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, zoom

W, H = 640, 360  # working res (16:9)
yy, xx = np.mgrid[0:H, 0:W].astype(float)
xx /= W; yy /= H

def hexc(h): h = h.lstrip('#'); return np.array([int(h[i:i+2], 16) for i in (0, 2, 4)]) / 255

def blob(cx, cy, rx, ry, ang=0):
    a = np.radians(ang); dx, dy = (xx - cx) * 16/9, yy - cy
    u = dx*np.cos(a) + dy*np.sin(a); v = -dx*np.sin(a) + dy*np.cos(a)
    return np.exp(-(u/rx)**2 - (v/ry)**2)

def ribbon(f, width):  # soft band around the curve y = f(x)
    return np.exp(-((yy - f(xx))/width)**2)

def render(layers, name, base='#000000', exposure=1.0, blur=6):
    img = np.zeros((H, W, 3)) + hexc(base)**2.2
    for mask, col, k in layers:
        img += mask[..., None] * (hexc(col)**2.2) * k
    img = 1 - np.exp(-img * exposure)          # soft tonemap, no clipping
    img = gaussian_filter(img, (blur, blur, 0))
    img = img ** (1/2.2)
    for size, tag in [((3840, 2160), '4k'), ((1920, 1080), '1080p')]:
        z = zoom(img, (size[1]/H, size[0]/W, 1), order=1)  # already blurred, linear is enough
        z = np.clip(z*255 + np.random.default_rng(7).uniform(-0.7, 0.7, z.shape), 0, 255)
        Image.fromarray(z.astype('uint8')).save(f'out/{name}-{tag}.png')
    print(name)

import os; os.makedirs('out', exist_ok=True)

# 1. Aurora — green/teal curtains with violet, sweeping from the top right
render([
    (ribbon(lambda x: 0.95 - 0.9*x + 0.08*np.sin(x*9), 0.10) * blob(1.2, 0.3, 1.0, 0.9), '#19E6A0', 1.6),
    (ribbon(lambda x: 1.15 - 0.9*x + 0.06*np.sin(x*7+1), 0.12) * blob(1.3, 0.5, 1.0, 1.0), '#0FB5C8', 1.2),
    (blob(1.55, 0.05, 0.5, 0.35, -20), '#8A4DFF', 2.0),
    (blob(1.15, 1.0, 0.45, 0.25), '#2A3BFF', 1.0),
], 'nova-aurora', exposure=1.3)

# 2. Ember — red, orange and hot pink rising from the bottom right
render([
    (blob(0.97, 1.02, 0.75, 0.45, -25), '#FF5A1F', 2.0),
    (blob(0.72, 0.95, 0.55, 0.30, -30), '#E0144C', 1.8),
    (blob(0.98, 0.25, 0.45, 0.35), '#FF2E88', 1.4),
    (blob(0.88, 0.72, 0.28, 0.18, -30), '#FFC24A', 1.6),
    (blob(0.45, 1.05, 0.5, 0.2), '#6A0A2A', 1.4),
], 'nova-ember', exposure=1.2)

# 3. Lilac — violet, pink and peach, the brightest of the set
render([
    (blob(0.85, 0.35, 0.55, 0.4, 30), '#7B3CFF', 1.8),
    (blob(0.97, 0.82, 0.55, 0.4), '#FF6FB5', 1.9),
    (blob(0.98, 0.08, 0.45, 0.3), '#FFB88A', 2.0),
    (blob(0.6, 0.95, 0.45, 0.25, -20), '#3A1FA8', 1.4),
    ], 'nova-lilac', base='#030206', exposure=0.7)

# 4. Ocean — navy, cyan and mint wave from the bottom left
render([
    (ribbon(lambda x: 0.75 + 0.18*np.sin(x*5 + 0.5), 0.16) * blob(0.9, 0.8, 1.3, 0.8), '#0A5CFF', 1.9),
    (ribbon(lambda x: 0.85 + 0.16*np.sin(x*5 + 0.9), 0.08) * blob(1.1, 0.85, 1.1, 0.8), '#00D2FF', 1.6),
    (blob(1.6, 1.0, 0.4, 0.25), '#6BFFD0', 1.4),
    (blob(0.25, 1.1, 0.6, 0.3), '#0B1E7A', 1.5),
    (blob(1.7, 0.1, 0.35, 0.25), '#123C9E', 0.8),
], 'nova-ocean', exposure=1.3)

# 5. Citrus — lime and gold against violet, split diagonally
render([
    (blob(0.98, 0.1, 0.45, 0.28, 20), '#B6FF3A', 1.5),
    (blob(0.85, 0.42, 0.3, 0.18, 20), '#FFD23A', 1.2),
    (blob(0.7, 1.0, 0.5, 0.25, -15), '#5B2CFF', 2.0),
    (blob(0.98, 0.92, 0.4, 0.25), '#1FC2A8', 1.4),
    (blob(0.35, 0.1, 0.4, 0.2), '#26104F', 1.0),
], 'nova-citrus', exposure=0.8)
