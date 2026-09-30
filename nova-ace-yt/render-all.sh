#!/bin/sh
# 4 parallel chunks of the 180s film, then a lossless concat.
cd "$(dirname "$0")"
FF=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
N=7200; P=4; S=$((N / P))
i=0; : > out/parts.txt
while [ $i -lt $P ]; do
  a=$((i * S)); b=$(( (i + 1) * S )); [ $i -eq $((P - 1)) ] && b=$N
  node render-part.mjs $a $b out/part$i.mp4 > out/part$i.log 2>&1 &
  echo "file 'part$i.mp4'" >> out/parts.txt
  i=$((i + 1))
done
wait
$FF -y -v error -f concat -safe 0 -i out/parts.txt -c copy out/acey-video.mp4
echo concat-done
