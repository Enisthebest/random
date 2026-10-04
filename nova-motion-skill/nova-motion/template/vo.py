"""Voice-over lines with Kokoro (open-source TTS, Apache-2.0): writes assets/vo0.wav, vo1.wav … and assets/vo.json (text + length).
Setup once:  pip install kokoro-onnx soundfile
             curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx
             curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
Usage:       python3 vo.py "First line." "Second line." ...
NOVA's voice is af_bella (bright female, "voice 4"). Then put the start times in film.js (T.vo) from the lengths in vo.json."""
import sys, json
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro('kokoro-v1.0.int8.onnx', 'voices-v1.0.bin')
out = []
for i, s in enumerate(sys.argv[1:]):
    a, sr = k.create(s, voice='af_bella', speed=1.0, lang='en-us')
    nz = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, nz[0] - 200): nz[-1] + 1200]   # trim silence
    sf.write(f'assets/vo{i}.wav', a, sr); out.append([s, round(len(a) / sr, 2)]); print(i, out[-1])
json.dump(out, open('assets/vo.json', 'w'))
