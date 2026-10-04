# byeno.org (v2): the NOVA site with the scroll film

- `index.html`: one file, inline CSS + JS. The hero is the NOVA intro film, **scrubbed by scroll** from small WebP frames drawn on a canvas, which is smooth on every device (no video decoding while you scroll).
  - Desktop: `frames/d/` (121 frames, 1280×720, ~1.4 MB total). Phones: `frames/m/` (81 frames, cropped tall, ~0.35 MB).
  - Frame 0 shows instantly; the rest stream in while you scroll. With "reduce motion" or data saver on, the scroll film is skipped and the calm end frame (`media/hero-end*.webp`) shows with the text.
  - After the film settles, the headline, buttons and the "Built on" strip rise in (layout measured on a 1487×1058 comp, height-locked units).
- `media/`: the optimized intro video (`hero-1080.mp4` 2.4 MB, `hero-1080.webm` 1.3 MB, `hero-720.mp4` 1.0 MB) and still frames. Not used by the page right now; ready for a "watch the intro" link or social posts.
- `privacy.html`, `terms.html`: built from `../nova-legal/*.md`.
- `fonts/manrope.woff2`: Manrope (SIL OFL), self-hosted, so the site loads nothing from Google or anyone else. No cookies, no analytics.
- `build.py`: regenerates everything. Edit the text, links (`CONFIG`) or features there, then `python3 build.py`.

**Before publishing:** fill in `[DATE]` and `[CONTACT EMAIL]` in `nova-legal/PRIVACY.md` and `TERMS.md` and rebuild; check the social links.
**Upload:** everything except `build.py`, `README.md`, `shot.mjs`, `rec.mjs` to the web root. No server setup needed.
