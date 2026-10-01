---
name: nova-design
description: Design and build any NOVA OS screen, app, panel, dialog or shell piece in the NOVA house style. Use whenever you create or change UI for NOVA OS, including new screens that have no mockup in nova-design-kit.
---

# Designing for NOVA OS

You are the designer as well as the engineer. Every new NOVA screen must look like it came from the same hand as the mockups in `nova-design-kit/png/`. Read `nova-design-kit/DESIGN_SYSTEM.md` and `tokens.json` first; this skill is *how to think* with them.

## 1. Before you draw anything
1. Say in one sentence what this screen is for and the **one main action**. That action gets the only primary (white) button.
2. Find the closest existing mockup in `png/` and reuse its skeleton: window apps → sidebar + header + body (`shield.png`, `settings.png`); quick overlays → centred glass panel (`launcher-*.png`); shell → pills, dock and shell cards.
3. Write the copy first (see Voice). If the copy is short and clear, the layout is usually obvious.

## 2. The look, in rules
- **Dark glass on colour.** Near-black translucent surfaces over the wallpaper; the wallpaper is the only decoration. No extra gradients, patterns, illustrations or borders to "add interest".
- **Flat. No shadows, no glows, no grey edges.** Depth = blur + fill contrast + 1 px hairlines. Everything outside a rounded shape is fully transparent.
- **One accent at a time.** `--accent` (follows the wallpaper) for selection, focus and links. Green = on/safe, orange = Pro/warning, red = danger only. Never decorate with colour.
- **Big and calm.** Generous space: 24/32 px body padding, 16 px gaps, rows ≥ 48 px, controls 40 px. When unsure, add space, not lines.
- **Strong type hierarchy.** One big title (26/700, −2%), secondary text in `#A1A1AA`, uppercase 12/600 section labels. Numbers that change use tabular figures / Geist Mono. Hero moments (a status, a result) get one large number or phrase (22–44 px, 700).
- **Few, grouped things.** Group settings in cards with a label on top; 3–5 rows per card; lists with hairlines, not boxes inside boxes.
- **Icons:** 3D clay icons for apps (`assets/`); every other icon comes from the **`nova-icons/`** set (Lucide + NOVA's own, 2 px line), in a 34–36 px tinted tile (radius 10–11) when they lead a row. Never draw an icon by hand: search `nova-icons/gallery.html`, and follow `nova-icons/README.md` for which icon goes where.
- **Radii:** window 24, panel 24, card 18, row 14, button 12, nav item 11, chip 999. Nested radius is always smaller than its parent.
- **Selected state** = `--surface-selected` fill (accent 18%) + white text + accent icon. Never an outline.

## 3. Voice
Short, human, confident. "You're protected." "2 things need a look." "Nothing phones home. Ever." "Runs on this device. Nothing happens until you press Run."
No jargon when a plain word works, no exclamation marks, no "Successfully…", no "Please". Titles are nouns ("Privacy"), subtitles are one promise ("14 protections. One tap each.").

## 4. Motion
One curve for everything: `cubic-bezier(.45,0,.15,1)`. 800 ms for moves and size changes, 400 ms for fades and floods. Incoming content fades in during the second half; outgoing content leaves in the first 40%. Things grow from where they came from (dock icon → window, pill → panel, clicked swatch → colour flood). Size changes glide, never jump. No bounces, springs, shakes or spinners where a progress fill would do.

## 5. Privacy is part of the design
NOVA's promise is privacy, so the UI shows it: say where things run ("on this device"), show a draft before anything acts on the user's behalf (ACE), ask "Allow once / Don't allow" for sensitive access, never auto-send or auto-run. Placeholder data is for mockups only; wire real data or leave the control disabled.

## 6. Designing a brand-new screen (no mockup exists)
1. Copy the skeleton of the closest mockup (section 1).
2. Hero first: the top card says the state in one line + one action (like Shield's "You're protected" / Fix's "2 things need a look").
3. Then details in labelled cards, 2-column grid on wide windows, 1 column when narrow.
4. Render it, take a screenshot, and put it **side by side with two existing `png/` mockups**. If it looks busier, louder or more colourful than them, remove things until it doesn't.
5. Show the user the screenshot before wiring more features.

## 7. Review checklist (run before saying "done")
- [ ] No shadow, glow, blur halo or grey outline anywhere (check corners on the real desktop, not just the app).
- [ ] Exactly one primary button; accent used only for selection/focus/links.
- [ ] Every value comes from the theme tokens; nothing hard-coded.
- [ ] Spacing on the 4 px grid; rows ≥ 48 px; text contrast ≥ 4.5:1.
- [ ] Copy is short, plain and in NOVA's voice.
- [ ] Every change animates with the NOVA curve; nothing pops or jumps.
- [ ] Keyboard works (focus ring only on keyboard focus, Esc closes overlays).
- [ ] Screenshot compared with the mockups: same family.

## 8. Never
Shadows · gradients on surfaces · coloured borders · more than one accent · emojis in UI · tiny grey text for important info · walls of toggles without grouping · modal dialogs for things an inline row can do · fake data in a finished screen · sending anything off the device without an explicit user action.
