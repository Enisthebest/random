# byeno.org: the NOVA OS website

A fast, static site: **no video, no frameworks, no trackers, no cookies, no third-party fonts or scripts.**
First load on a phone is about **120 KB**; screenshots load only when you scroll to them (small WebP versions on phones).

| File | What |
|---|---|
| `index.html` | The home page |
| `privacy.html`, `terms.html` | Built from `../nova-legal/*.md` (plus a "This website" section) |
| `style.css`, `main.js` | All the styling; a tiny script that fades sections in (everything still works without it) |
| `img/`, `fonts/`, `favicon.png` | WebP screenshots (720 + 1440 px), wallpapers, star, social preview `og.jpg`, Geist font (SIL OFL) |
| `build.py` | Regenerates the three pages. Edit `CONFIG` (social links, waitlist) or the text, then `python3 build.py` |
| `preview-desktop.png`, `preview-phone.png` | Full-page previews |

## Before you publish
1. Fill in `[DATE]` and `[CONTACT EMAIL]` in `nova-legal/PRIVACY.md` and `TERMS.md`, then run `python3 build.py`.
2. Check the social links in `CONFIG` in `build.py` (YouTube, TikTok, X).
3. **Waitlist (optional):** set `CONFIG['waitlist_action']` to a form endpoint you control and rebuild. Until then, the "Be there on day one" section shows your socials instead of an email box. Pick a privacy-friendly provider (or your own server) and update the "This website" text in `build.py` if anything changes.

## Put it online
Upload the whole folder (except `build.py`, `README.md` and the previews) to your host's web root. Any static host works (GitHub Pages, Cloudflare Pages, Netlify, or your own server). No build step is needed on the server.
