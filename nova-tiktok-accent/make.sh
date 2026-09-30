#!/bin/sh
# Full pipeline: timeline -> music -> parallel render -> mux + loudness (-14 LUFS) -> jump scan.
# Usage: ./make.sh [output.mp4]   (needs node + playwright, python3 + numpy/scipy, ffmpeg)
set -e
cd "$(dirname "$0")"
OUT=${1:-out/film.mp4}
FF=${FFMPEG:-ffmpeg}; export FFMPEG=$FF
P=${PARTS:-4}
mkdir -p out
PORT=${PORT:-8125}; export PORT
python3 -m http.server $PORT >/dev/null 2>&1 & SRV=$!; trap 'kill $SRV 2>/dev/null' EXIT; sleep 1
node timeline.mjs
python3 synth.py
DUR=$(python3 -c "import json;print(json.load(open('out/timeline.json'))['DUR'])")
N=$(python3 -c "print(int(round($DUR*60)))"); S=$((N / P)); i=0; PIDS=; : > out/parts.txt
while [ $i -lt $P ]; do
  a=$((i * S)); b=$(( (i + 1) * S )); [ $i -eq $((P - 1)) ] && b=$N
  node render-part.mjs $a $b out/part$i.mp4 & PIDS="$PIDS $!"
  echo "file 'part$i.mp4'" >> out/parts.txt; i=$((i + 1))
done
wait $PIDS   # not plain 'wait': that would also wait for the preview server
$FF -y -v error -f concat -safe 0 -i out/parts.txt -c copy out/video.mp4
J=$($FF -hide_banner -i out/music.wav -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
g() { echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
$FF -y -v error -i out/video.mp4 -i out/music.wav -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" \
  -ar 48000 -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT"
rm -f out/part*.mp4 out/parts.txt out/video.mp4
python3 scan.py "$OUT"
echo "wrote $OUT"
