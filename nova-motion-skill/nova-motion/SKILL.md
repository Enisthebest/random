---
name: nova-motion
description: Make NOVA OS promo videos (TikTok, YouTube, ads, showcases) in the NOVA motion style — Apple-like bold text, smooth glides, floods, motion blur, synthesized music on the beat — rendered to MP4 from code. Use when asked for a video, ad, teaser, short, reel or animation about NOVA.
---

# NOVA motion videos

Every NOVA video is **code**: one HTML canvas page where `seek(t)` draws the frame at time `t`, rendered frame by frame with Playwright, piped into ffmpeg, with music and sound effects synthesized in Python from the same timeline. Start from `template/` (the "New wallpapers?" TikTok): it already works end to end.

## Quick start
```
cp -r .claude/skills/nova-motion/template my-video && cd my-video
npm i playwright && npx playwright install chromium   # once
pip install numpy scipy pillow                          # once
python3 -m http.server 8125 &                           # preview at http://127.0.0.1:8125/ (scrub bar at the bottom)
node stills.mjs 0.5 4 10 15                             # check key frames in out/stills/
./make.sh out/my-video.mp4                              # timeline -> music -> render -> mux -> loudness -> scan
```
Set `FFMPEG=/path/to/ffmpeg` if ffmpeg isn't on PATH, and `PORT` if 8125 is taken.

## Workflow (always in this order)
1. **Plan with the user first.** Write the beat map: every scene with its start time, the on-screen words, what moves. Ask for missing inputs (screenshots, logos, copy, length, format). Don't render before they agree.
2. **Build `film.js`**: the timeline object `T` at the top (all times in seconds), then `seek(t)`.
3. **Stills before rendering.** Run `stills.mjs` on 6–10 key moments, look at every image, fix, repeat. Rendering takes minutes, stills take seconds.
4. **Render** with `make.sh`. Then read the scan output: every big change it lists must be a cut you meant.
5. **Deliver an MP4** (H.264 + AAC, `+faststart`). Keep it under the chat's upload limit (re-encode `-crf 21 -b:a 192k` if needed).

## The style
**Type (Apple-like)**
- Geist Variable at weight **800**, tracking −3.5%, pure white on black or over a darkened background. Accent lines in NOVA orange `rgb(255,174,90)`.
- Words rise 26 px and fade in **one after another** (70 ms apart, 700 ms each); the whole line lifts 14 px and fades out together. This is `headline()` — use it for every big line.
- Short lines. One idea per screen. Split anything wider than ~85% of the frame into two lines.
- Readable: each line stays ≥ 1.2 s (≥ 2 s for full sentences). If the user can't read it, the video is too fast — stretch the timeline (`for (const k in T) T[k] *= 1.5`), don't shrink text.
- Vertical (1080×1920): keep text and key content between y 250 and y 1600 (TikTok/Reels UI covers the rest).

**Motion**
- One curve: `cubic-bezier(.45,0,.15,1)` (`ease`). 800 ms (`G`) for moves, zooms and shape changes; 400–600 ms for fades and floods.
- `gl(t, start, dur)` = eased 0→1. Incoming content fades in on the **back half** of a move; outgoing content leaves in the **first 40%**.
- **Floods**: new scenes/colours are revealed by a circle growing from the thing that caused them (a button, a swatch, the name) to the farthest corner.
- **Grow from the source**: windows grow out of their dock icon, panels out of their pill, a full-screen image shrinks into its grid tile (interpolate both the destination rect and the source crop).
- **Camera**: glide the view between anchors with log-interpolated zoom; a slow 3–4% drift keeps still scenes alive. Never hold a static frame longer than ~1 s.
- **Cuts** only on purpose (fast shuffles, beat hits). Everything else glides.
- **Motion blur**: `renderFrame` averages 6 sub-frames (12 during fast moves via `isFast`). Keep it; it's a big part of why it looks expensive.
- Never: bounces, springs, shakes, glows on UI, particles, spinning text, generic "zoom transitions".

**Colour & backgrounds**
- Black, or the NOVA wallpaper (blurred 36 px + 40–50% black when text is on top). `aura()` = soft orange + blue radial light behind hero text (additive, slowly drifting).
- UI shown in videos follows the design kit: flat dark glass, no shadows.

**Endings**: NOVA star + `NOVA OS` wordmark (wide tracking), then "Coming soon." in orange, then `byeno.org`. Pro videos end on "Only in Pro." ACE is Pro-only and runs locally — never show it sending anything without a draft the user confirms.

## Sound (`synth.py`)
- No samples or stock music: everything is synthesized with numpy/scipy, so there are no licence problems.
- The film exports its timings (`timeline.mjs` → `out/timeline.json`); the music reads them so **the drop lands exactly on the reveal**. Pick BPM so the drop is on a downbeat: `BPM = 60 * beats_before_drop / drop_time`.
- Styles used so far: calm pads (Apple ads), bright electronic, synthwave, future bass, catchy pop-EDM with a melody hook (TikTok). Change `CH`, `ORDER`, `HOOK` and the drum pattern for a new song.
- Sound effects via `peak(sig, time, gain)` (aligns the sound's peak to the frame): `key()` typing per word of each headline, `tick()` per cut, `whoosh()` per scene change, `chime()` on reveals and the end card.
- Mix: sidechain pads under the kick, short silence right before the drop, end chord softer than the drop, fade out the last 1.5 s. `make.sh` normalises to −14 LUFS, true peak −1 dB.

## Checklist before sending
- [ ] Stills of every scene looked at; nothing clipped, overlapping or off-frame.
- [ ] Every line readable at normal speed.
- [ ] Scan shows only intended cuts.
- [ ] Music drop lands on the reveal; ending isn't louder than the drop.
- [ ] Correct format (16:9 1920×1080 for YouTube/ads, 9:16 1080×1920 for TikTok/Reels/Shorts), 60 fps, MP4.
- [ ] "Coming soon." / byeno.org / "Only in Pro." as appropriate.

## Files in `template/`
| File | What it does |
|---|---|
| `film.js` | The film: timeline `T`, helpers (easing, `headline`, text, images), `seek(t)`, `renderFrame` (motion blur), assets loading. Edit this. |
| `index.html` | Canvas + fonts + scrub/preview bar. |
| `stills.mjs` | PNGs of chosen times → `out/stills/`. |
| `timeline.mjs` | Exports `T`, `LINES`, `CUTS`, `STEPS`, `DUR` → `out/timeline.json`. |
| `synth.py` | Music + sound effects from the timeline → `out/music.wav`. |
| `render-part.mjs` | Renders a frame range to an MP4 chunk (run in parallel). |
| `make.sh` | Whole pipeline in one command. |
| `scan.py` | Lists the biggest frame-to-frame changes. |
| `fonts/`, `assets/` | Geist fonts (SIL OFL), NOVA wallpapers, NOVA star. Add screenshots/logos here. |
