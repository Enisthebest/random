"""Lists the biggest frame-to-frame changes in a video. Every one should be a cut you meant; anything else is a jump to fix."""
import os, subprocess, sys
import numpy as np
FF = os.environ.get('FFMPEG', 'ffmpeg')
raw = subprocess.run([FF, '-v', 'error', '-i', sys.argv[1], '-vf', 'scale=96:96,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
a = np.frombuffer(raw, np.uint8).reshape(-1, 96, 96).astype(float)
d = np.abs(np.diff(a, axis=0)).mean((1, 2))
print(len(a), 'frames; biggest changes (seconds, size):')
for i in np.argsort(d)[-10:][::-1]: print(f'  {(i + 1) / 60:6.2f}s  {d[i]:5.1f}')
