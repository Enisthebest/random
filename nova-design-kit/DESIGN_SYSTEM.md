# NOVA OS Design System

The single source of truth for how NOVA looks and moves. Every app and every piece of the shell uses these tokens and components. Machine-readable versions live in `tokens.css` and `tokens.json`.

Reference screens: `screens/*.html` (open in a browser), with screenshots in `png/*.png`.

---

## 1. Principles

1. **Dark glass on colour.** Windows are near-black, slightly translucent glass floating over the blurred wallpaper. The wallpaper's colour is the only decoration.
2. **One accent at a time.** Blue marks what's selected. Green means safe, healthy or on. Orange means Pro, warnings, and warmth (Night Mode). Red is only for blocking and danger.
3. **Flat and clean. No shadows.** Surfaces are flat glass. Depth comes only from the glass (blur + transparency) and the fill contrast between layers. **No drop shadows, box shadows, glows or grey halos anywhere**: not on windows, cards, buttons, toggles, pills, the dock, the bar, text or icons.
4. **Say it plainly.** Short, human copy: "You're protected", "2 things need a look", "Nothing phones home. Ever."
5. **Nothing jumps.** Every change glides (see Motion). No bounces, no springs, no hard cuts.

---

## 2. Colour

### Surfaces
| Token | Value | Use |
|---|---|---|
| `--bg-desktop` | `#050507` | Behind everything |
| `--surface-window` | `rgba(12,12,16,.90)` + `backdrop-filter: blur(30px)` | App windows |
| `--surface-sidebar` | `rgba(255,255,255,.025)` over the window | Sidebars |
| `--surface-card` | `rgba(255,255,255,.04)` | Cards inside windows |
| `--surface-raised` | `rgba(255,255,255,.06)` | Buttons, inputs, search |
| `--surface-selected` | `rgba(59,139,255,.18)` | Selected nav item / tile |
| `--border-window` | `rgba(255,255,255,.09)` | 1 px window outline |
| `--border-card` | `rgba(255,255,255,.07)` | 1 px card outline |
| `--hairline` | `rgba(255,255,255,.06)` | Dividers |

### Text
| Token | Value | Use |
|---|---|---|
| `--text-primary` | `#F2F2F4` | Titles, body |
| `--text-secondary` | `#A1A1AA` | Subtitles, secondary lines |
| `--text-label` | `#8D8D96` | Uppercase section labels |
| `--text-disabled` | `#6E6E77` | Disabled |

### Accents
| Token | Value | Use |
|---|---|---|
| `--accent` | `#3B8BFF` (icons/text on dark: `#6AA8FF`) | Selection, links, primary focus |
| `--success` | `#34C759` (toggle on: `#2F9E5A`, text: `#5FDC86`) | On, healthy, protected |
| `--warning` / NOVA orange | `#F5921E` (text: `#FFAE5A`) | Pro badge, warnings, warmth |
| `--danger` | `#FF5C5C` | Blocked, destructive |
| `--primary-button` | `#F2F2F4` bg, `#0B0B0E` text | The one main action per screen |

Tinted chips use the accent at 16% opacity for the background and the text colour above (e.g. success chip: `rgba(52,199,89,.16)` + `#5FDC86`).

### Shell (top bar, dock, Control panel) — measured from the live desktop
| Token | Value |
|---|---|
| `--shell-pill` | `#101013` (1 px `rgba(255,255,255,.07)` border) |
| `--shell-card` | gradient `#131317 → #09090D` top to bottom |
| `--shell-button` | `#252528` |
| `--shell-track` | `#222224` |
| `--shell-row-selected` | `#363639` |
| `--shell-slider` | gradient `#1074E4 → #268CFF` |
| `--shell-night` | `#FF9F0A` |
| `--knob` | `#F2F2F4` |

### Wallpaper
The blue→cyan→cream→orange wallpaper (`assets/wallpaper.png`). Behind windows it shows through blurred; on the lock screen it's blurred 36 px with a 32% black layer.

NOVA ships six wallpapers (NOVA, Aurora, Ember, Lilac, Ocean, Citrus) in the separate `nova-wallpapers/` pack. Each one sets its own accent colour: `--accent` follows the current wallpaper unless "Match accent to wallpaper" is off. The values and rules are in `nova-wallpapers/README.md`.

---

## 3. Type

Font: **Geist** (400, 500, 600, 700, 800) and **Geist Mono** for numbers in tables, logs and card numbers. Both are free (Vercel, SIL OFL).

| Role | Size / weight / tracking |
|---|---|
| Lock-screen clock | 200 / 600 / -2% |
| Marketing headline | 96–132 / 800 / -3.5% |
| Window title (h1) | 26 / 700 / -2% |
| Hero line in a card | 22–24 / 700 / -2% |
| App name in sidebar | 17 / 700 / -1% |
| Row title | 15 / 600 |
| Body, nav items, buttons | 14 / 500–600 |
| Secondary line | 13 / 400, `--text-secondary` |
| Section label | 12 / 600 / +8%, UPPERCASE, `--text-label` |
| Shell label (Control panel) | 11 / 700 / +8%, UPPERCASE |
| Clock pill | 13 / 600 |

Numbers that change (percentages, temperatures, counters) use tabular figures or Geist Mono so they don't jitter.

---

## 4. Shape, spacing, depth

- **Grid:** 4 px base. Common steps: 4, 8, 12, 16, 20, 24, 32.
- **Radii:** window 24 · card 18 · shell card 10 · button 12 · nav item 11 · icon tile 11 · toggle 14 · chip/pill 999 (fully round) · shell pill 12.
- **Window anatomy:** sidebar 248 px wide (22 px top padding, 14 px sides) · header 76 px (32 px side padding, hairline below) · body padding 24 px × 32 px · 16 px between cards · list rows at least 48 px tall with a hairline between.
- **Touch targets:** at least 40 px (buttons 40 px tall, toggles 46 × 28, round buttons 42).
- **Shadows: none.** No `box-shadow`, no drop shadows, no glow. Separation comes from fills and the 1 px hairline only.

### No shadows, no grey edges (hard rule)
Grey outlines around shapes are always a bug. They come from:
1. **Shadows**: any `box-shadow`, `DropShadow`/`MultiEffect` shadow, GTK `box-shadow`, or Hyprland's window shadow. Remove them all.
2. **Compositor borders and shadows**: Hyprland draws its own border and shadow around windows and layers. Set `general:border_size = 0` and `decoration:shadow:enabled = false`.
3. **Blurred edges on rounded shapes**: blur behind a surface whose corners aren't fully transparent leaves a grey rim. Keep everything outside the rounded shape fully transparent (alpha 0), clip the blur to the same radius, and use `layerrule = ignorezero` (or `ignorealpha`) on blurred layers.
4. **Default toolkit styling**: GTK/Qt themes add focus rings, frames and outlines. Reset them (`outline: none; border: none;` on containers, `background: transparent` on window roots) and draw only the NOVA hairline where the spec asks for it.
5. **Half-pixel strokes**: a 1 px border on a fractional position renders as a 2 px grey smear. Snap borders to whole pixels.

Keyboard focus is still required for accessibility: show it as a 2 px `--accent` ring only while the element has keyboard focus, never as a permanent grey outline.

---

## 5. Components

| Component | Spec |
|---|---|
| **Window** | `--surface-window`, radius 24, 1 px `--border-window` (drawn *inside* the shape), no shadow, sidebar left, content right. No title-bar buttons (Hyprland tiles). |
| **Sidebar nav item** | 40 px tall, radius 11, 18 px Lucide icon + 14/500 label, 12 px gap. Selected: `--surface-selected`, white text, icon `#6AA8FF`, `aria-current="page"`. Section labels between groups. |
| **Header** | h1 + subtitle on the left, actions (search / chip / buttons) on the right. |
| **Card** | `--surface-card`, radius 18, padding 18 × 20, optional uppercase label on top. |
| **Row** | icon tile (36 px, radius 11, accent 14% bg) · title 15/600 + secondary 13 · right-side control. Hairline between rows. |
| **Toggle** | 46 × 28, knob 22 px, off `#3A3A40`, on `#2F9E5A` (Shield/Guard) or `--accent` (Settings). Knob slides; track colour cross-fades. Real `<button aria-pressed>`. |
| **Button** | 40 px, radius 12, raised surface + 1 px border, 14/600. Primary = `--primary-button`. One primary per screen. |
| **Chip** | 28 px round, tinted background + matching text, optional 14 px icon. |
| **Search field** | 40 px, radius 12, raised surface, magnifier icon, placeholder in secondary text. |
| **Table** | uppercase 12 px header in `--text-label`, rows 11 px vertical padding, hairline between, secondary columns in `--text-secondary`, numbers in Geist Mono. |
| **Chat bubble (ACE)** | user: `#2F7CF6`, white text, radius 20 with the bottom-right corner 6. ACE: raised surface + border, star icon on the left, bottom-left corner 6. Input: 54 px round field with a white round send button. |
| **Permission card** | `#ECECEF` background, `#111114` text, icon left, lock icon right, radius 16. Used for promises ("Sees your screen, only when you ask"). |
| **App icons** | 3D clay icons in `assets/` (Shield, Files/folder, Settings/gear, Monitor, Ledger, Images, Fix, NOVA star). Shown at 36 px in the sidebar header and 44 px in the dock. |
| **Line icons** | Lucide, 2 px stroke, round caps and joins, 16–22 px. |

---

## 6. Motion

The whole OS moves with one curve and one duration.

- **Easing:** `cubic-bezier(.45, 0, .15, 1)` for everything.
- **Duration:** 800 ms for anything that changes shape or position (windows, panels, cards, selection, camera-like moves). 400 ms for floods and fades. Toggle knobs use the same curve.
- **Content timing:** incoming text and icons fade in during the *second half* of the glide; outgoing content leaves in the *first 40%*.
- **Windows open by growing out of their dock icon** (icon rect → window rect, radius 11 → 24), and close back into it.
- **Floods:** state changes that affect the whole screen (Night Mode, accent colour, notifications flooding in) spread as a circle from the control that caused them to the farthest corner in 400 ms; the new state is revealed under the circle.
- **Selections glide** from the old item to the new one (nav highlight, accent ring, output device row) instead of blinking.
- **Numbers count** to their new value in whole steps over ~1 s.
- **Lock ↔ desktop:** the big clock shrinks into the top-bar clock pill while the blur and dark layer fade out; locking reverses it.
- **Never:** bounces, springs, shakes, glows, particles, hard cuts, holding a static screen longer than a second in marketing.

---

## 7. Shell layout (1920 × 1080, measured from the live desktop)

- **Top bar:** floating pills 36 px tall, radius 12, 9 px from the top. Left: workspace pill (15–180 px). Centre: clock pill "12:22" (931–988). Right: tray pill (1737–1812), keyboard "us" pill (1827–1866), Control pill (1880–1905).
- **Dock:** centred, 64 px tall, radius 16, 44 px icons on a 60 px pitch, running apps get a 5 px dot underneath in the accent.
- **Control panel:** "Control" title + Edit button, two columns of shell cards (Sound, Do Not Disturb, Shortcuts | Wi-Fi, Bluetooth, Night Mode, USB & Drives) — see `png/shell-control.png`, `shell-wifi.png`, `shell-bluetooth.png`.
- **Launcher:** Super+Space. 720 px glass panel (`rgba(14,14,18,.86)` + 40 px backdrop blur, radius 24, 1 px `--border-window`, no shadow), centred, 150 px from the top; the desktop behind dims 28%. Search row 68 px (22/500 text, accent caret, `esc` keycap). Empty state: 8 pinned app tiles (52 px icons, 12 px labels) + Recent rows. Results: Top hit card (`--surface-selected`, radius 18, 64 px icon, 22/700 title, white Open button), then groups (Settings, Files, Actions, Apps) of 52 px rows, radius 14, with a 34 px icon tile; selected row = `--surface-selected` and shows "Open ↵" in place of the kind label; matched letters bold white, the rest `#C9C9CF`. Quick answers show a 44/700 result with Copy. Pro: the ACE draft card (numbered steps, Edit / Run). Footer 44 px with keycaps (24 px, radius 7, `rgba(255,255,255,.08)`). Opens with a 400 ms fade + scale 0.96→1; height changes glide 800 ms. See `png/launcher-*.png`.
- **Desktop:** `png/shell-desktop.png`. **Power menu:** `png/shell-power.png`. **Volume/brightness OSD:** `png/shell-osd.png`.
- **Lock screen:** blurred wallpaper, clock 200/600 at the upper third, date 30/500 below, "Swipe up to unlock" at the bottom.
- **Notifications:** 382 × 66 toast top-right, radius 16, app icon in a tinted circle, title 14/600 + line 12, "now" top-right.

---

## 8. Setup wizard (first boot)

Mockups: `png/setup-*.png`, overview `png/_setup-overview.png`, generator `setup/gen_setup.py`.

| Part | Spec |
|---|---|
| **Backdrop** | Current wallpaper, blur 48 px, saturate 1.15, 42% black layer |
| **Welcome** | Full screen, no window. Star 150 px, title 72/700, subtitle 20/400 at 72% white, "Hello" row 17/600, two 52 px round buttons (language, primary "Get started") |
| **Window** | 1080 × 680, radius 24, `--surface-window`, centred |
| **Step rail** | 268 px, `--surface-sidebar`. Step rows 42 px, radius 11, 24 px number circle. Done = accent circle + check (`onAccent`), current = white circle + `--surface-selected` row, later = `--text-disabled`. ACE carries an orange PRO chip |
| **Content** | Padding 34 / 44. "STEP N OF 8" label 12/700 uppercase, title 30/700, subtitle 15/400 secondary, max 620 px |
| **Nav bar** | Hairline on top, Back (default button) left, optional accent text link + primary button right |
| **Inputs** | 46 px fields, radius 12; focused = 2 px accent border |
| **Choice cards** | Radius 18; selected = 2 px accent border + `--surface-selected` |
| **Defaults** | Every privacy option off; Shield Balanced; updates "Ask me first"; home encryption on; private Wi-Fi address on |
| **Accent** | Follows the wallpaper picked in the Look step from that moment on |
| **Motion** | Steps slide 40 px with the 800 ms glide (out in the first 40%, in during the second half); rail highlight glides; accent change floods from the clicked thumbnail (400 ms) |

---

## 9. Keyboard shortcuts

One list, used by Hyprland, the setup wizard's Finish screen and Settings → Keyboard. Key caps show `super`, `shift`, `space`, `↵` and capital letters.

| Shortcut | Does |
|---|---|
| Super + Space | Launcher |
| Super + E | Files |
| Super + Enter | Terminal |
| Super + S | Shield |
| Super + C | Control panel |
| Super + W | Wallpapers (Settings → Appearance, wallpaper picker) |
| Super + G | Gaming mode on/off (see section 10) |
| Super + Shift + S | Screenshot |
| Super + L | Lock |
| Super + X | Power menu |
| Super + Q | Close window |
| Super + U | Accessibility |
| Super + A | ACE (Pro only) |

---

## 10. Gaming mode

Mockups: `png/gaming-*.png`, overview `png/_gaming-overview.png`, generator `gaming/gen_gaming.py`. "Starfall" and `assets/game-starfall.jpg` are placeholders for whatever game is running.

| Part | Spec |
|---|---|
| **On card** | 560 px glass panel (radius 24) centred over the game, 35% dim. 56 px accent icon tile with `gamepad-2`, title 24/700, then a list of what was done: 44 px rows, green check circle on the left, value on the right in secondary text. Then the focus-lock row with the Super G key caps, then the green Shield line. Shows for 2.5 s |
| **Focus-lock pill** | 56 px glass pill, top centre, 40 px from the top: lock icon, "Focus lock is on", key caps. Shows for 2 s on any blocked shortcut |
| **Overlay pill** | 34 px pill, top right, 16 px in: FPS, CPU °, GPU °, RAM, numbers in Geist Mono. Off by default |
| **Settings page** | Normal Settings window, "Gaming mode" in the nav with `gamepad-2`. Left card: 7 toggle rows. Right column: Start automatically, Overlay, the green "Shield never pauses" note |
| **Off card** | 382 px glass card under the top bar (like notifications): summary, then rows with an accent action on the right (Install, Show). Leaves after 6 s |
| **Motion** | None while Gaming mode is on (that's the point). The off card uses the normal glide, since animations are back |

