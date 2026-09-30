# NOVA OS wallpapers

| File | Name in Settings | Look |
|---|---|---|
| `nova-original.png` | NOVA (default) | Blue, cyan, cream and orange |
| `nova-aurora.png` | Aurora | Green and teal wave into deep blue |
| `nova-ember.png` | Ember | Dark red into pink, orange and gold |
| `nova-lilac.png` | Lilac | Violet into soft pink and peach |
| `nova-ocean.png` | Ocean | Glowing cyan wave over navy |
| `nova-citrus.png` | Citrus | Lime and gold against violet and teal |

All are 3840×2160 (4K); they scale down cleanly to any screen. `preview.png` shows them all.

## For Claude Code: add these to NOVA OS

1. Install them system-wide: copy the `nova-*.png` files to `/usr/share/backgrounds/nova/` (ship them in the NOVA package / ISO build, not just this machine). Generate small thumbnails for the Settings picker at build time.
2. Set `nova-original.png` as the default wallpaper for new users (e.g. `hyprpaper.conf` or `swww img` in the Hyprland autostart, whichever NOVA already uses).
3. List all six in **Settings → Appearance → Wallpaper** with the names in the table above, in that order. Picking one changes the wallpaper live with a 400 ms cross-fade on the NOVA curve `cubic-bezier(.45,0,.15,1)` (`swww img --transition-type fade --transition-duration 0.4`), and saves the choice so it survives reboot.
4. Use the chosen wallpaper everywhere the design uses it: the desktop, the lock screen (blurred 36 px with a 32% black layer) and the blurred glass behind windows.
5. Don't recompress or resize them at runtime; they already have a little grain so gradients don't band.

## Accent follows the wallpaper

Each wallpaper has its own accent colour. Choosing a wallpaper also switches the accent, so toggles, sliders, selection highlights, links, focus rings and the dock's running-app dots all match it.

| Wallpaper | `accent` (fills, toggles, sliders) | `accentOnDark` (accent text and icons on dark glass) | `onAccent` (text/icons on an accent fill) |
|---|---|---|---|
| NOVA | `#3B8BFF` | `#6AA8FF` | `#FFFFFF` |
| Aurora | `#19C995` | `#4FE3B5` | `#0B0B0E` |
| Ember | `#FF4F8B` | `#FF7FAA` | `#0B0B0E` |
| Lilac | `#A26BFF` | `#C4A0FF` | `#0B0B0E` |
| Ocean | `#12B8F0` | `#5AD4FF` | `#0B0B0E` |
| Citrus | `#A8E632` | `#C6F56B` | `#0B0B0E` |

```json
{
  "nova":   { "file": "nova-original.png", "accent": "#3B8BFF", "accentOnDark": "#6AA8FF", "onAccent": "#FFFFFF" },
  "aurora": { "file": "nova-aurora.png",   "accent": "#19C995", "accentOnDark": "#4FE3B5", "onAccent": "#0B0B0E" },
  "ember":  { "file": "nova-ember.png",    "accent": "#FF4F8B", "accentOnDark": "#FF7FAA", "onAccent": "#0B0B0E" },
  "lilac":  { "file": "nova-lilac.png",    "accent": "#A26BFF", "accentOnDark": "#C4A0FF", "onAccent": "#0B0B0E" },
  "ocean":  { "file": "nova-ocean.png",    "accent": "#12B8F0", "accentOnDark": "#5AD4FF", "onAccent": "#0B0B0E" },
  "citrus": { "file": "nova-citrus.png",   "accent": "#A8E632", "accentOnDark": "#C6F56B", "onAccent": "#0B0B0E" }
}
```

Rules for Claude Code:
1. Save the table above as the wallpaper list in the theme (e.g. `wallpapers.json` next to `tokens.json`). The theme's `--accent`, `--accent-on-dark`, `--surface-selected` (accent at 18% opacity) and tinted chips/icon tiles (accent at 14–16%) are derived from the current wallpaper's entry, never hard-coded.
2. Any text or icon drawn **on top of a solid accent fill** (primary accent buttons, the selected accent swatch's check, badges) uses `onAccent`, so it stays readable (at least 4.5:1). Accent text and icons **on the dark glass** use `accentOnDark`.
3. Changing the wallpaper: the wallpaper cross-fades (400 ms) and the new accent floods out as a circle from the wallpaper thumbnail that was clicked to the farthest screen corner (400 ms, NOVA curve), exactly like the accent-colour flood in DESIGN_SYSTEM.md → Motion. Every component updates live, with no restart.
4. Add a toggle under the wallpaper picker in **Settings → Appearance**: **"Match accent to wallpaper"**, on by default. When it's off, the user's manually picked accent swatch is kept whatever the wallpaper.
5. Status colours never change with the wallpaper: green = safe/on (Shield, Guard toggles stay `#2F9E5A`), orange = Pro/warnings, red `#FF5C5C` = danger. Only the accent follows the wallpaper.
6. Save the choice (wallpaper + match on/off + manual accent) so it survives reboot, and apply it before the shell draws, so there is no flash of the old colour at login.
