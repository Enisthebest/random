# NOVA icons

2,164 line icons for NOVA OS: the full **Lucide** set (2,118, ISC licence, free for commercial use; see `LICENSE-lucide.txt`) plus **46 NOVA icons** made for NOVA's own features. Every icon is 24×24, 2 px stroke, round caps and joins, `currentColor`, the same look as the design kit.

| Folder / file | What it is |
|---|---|
| `svg/` | Every icon as a standalone SVG. NOVA's own start with `nova-`. |
| `gallery.html` | Open in a browser: search by name or tag, click to copy the name. |
| `tags.json` | Search tags for every icon. |
| `NOVA-icons/` | A freedesktop **symbolic icon theme** (202 standard names → NOVA icons, converted to fills so GTK/Qt recolour them). |
| `freedesktop-map.json` | Which standard name uses which icon. |
| `build.py` | Rebuilds everything (needs `lucide-static` and `picosvg`). |

## Rules (for Claude Code)
- **Never draw icons by hand.** Pick one from `svg/` (search `gallery.html` or `tags.json`). If nothing fits, make a badge icon the way `build.py` does (base icon + round cut-out + small badge glyph) and add it to `build.py`, so it stays consistent.
- Size 16–24 px in UI (18 px in sidebars, 16 px in rows and chips, 20 px in the top bar). Stroke stays 2 px at 24 px (scale with the icon, don't thicken).
- Colour = the text colour of where it sits (`currentColor`), accent (`--accent-on-dark`) only when selected. Never multicolour line icons; 3D clay icons are only for apps (dock, app headers).
- In QML: `Image { source: "svg/wifi.svg"; sourceSize: Qt.size(20, 20) }` plus `MultiEffect { colorization: 1; colorizationColor: Theme.text }`, or load the SVG text and replace `currentColor`. In GTK/AGS CSS: use the theme names (`network-wireless-signal-good-symbolic`) with `-gtk-icon-style: symbolic`.

## Install the theme
```
mkdir -p ~/.local/share/icons && cp -r NOVA-icons ~/.local/share/icons/NOVA
gsettings set org.gnome.desktop.interface icon-theme NOVA     # GTK apps
# Qt apps: set Icon Theme = NOVA in qt6ct (and qt5ct)
```
For the NOVA OS image, install it system-wide to `/usr/share/icons/NOVA` and set it as default. Anything not in the map falls back to Adwaita.

## Where each icon goes in NOVA
| Place | Icons |
|---|---|
| Top bar | `wifi` / `wifi-high` / `wifi-low` / `wifi-zero` / `wifi-off`, `bluetooth` / `bluetooth-connected` / `bluetooth-off`, `volume-2` / `volume-1` / `volume` / `volume-x`, `battery-full` / `battery-medium` / `battery-low` / `battery-warning` / `battery-charging`, `keyboard`, `sliders-horizontal` (Control) |
| Control panel | `volume-2`, `headphones`, `speaker`, `bell-off` (Do Not Disturb), `moon` (Night Mode), `nova-night-schedule`, `wifi`, `network`, `usb`, `nova-drive-eject`, `sun` (brightness), `camera-off`, `mic-off`, `keyboard` (Shortcuts) |
| Launcher | `search`, `nova-launcher`, `app-window`, `file-text`, `folder`, `settings`, `calculator`, `arrow-left-right`, `copy`, `lock`, `nova-ace` |
| Shield | `nova-shield`, `nova-private-dns`, `nova-vpn-kill-switch`, `nova-tor-per-app`, `nova-network-watch`, `nova-ip-randomizer`, `nova-mac-randomizer`, `fingerprint`, `nova-guest-mode`, `nova-decoy-login`, `nova-camera-kill`, `nova-mic-kill`, `nova-usb-lock`, `nova-usb-detect`, `nova-boot-tamper`, `nova-sandbox`, `nova-secure-delete`, `nova-clipboard-autoclear`, `nova-metadata-wipe`, `nova-no-tracking`, `activity` |
| Guard | `nova-guard`, `scan-search`, `nova-realtime-protection`, `nova-quarantine`, `nova-threat-definitions`, `history`, `folder-search` |
| Files | `house`, `file-text`, `image`, `download`, `camera`, `hard-drive`, `usb`, `eject`, `trash-2`, `folder`, `layout-grid`, `list`, `chevron-left`, `chevron-right` |
| Monitor | `cpu`, `memory-stick`, `gpu` / `monitor`, `hard-drive`, `thermometer`, `nova-temp-ok`, `fan`, `nova-fan-quiet`, `nova-process-end`, `rocket` (Startup) |
| Ledger | `credit-card`, `ticket`, `receipt`, `nova-ledger-lock`, `nova-ledger-ask`, `nova-ledger-hide`, `globe`, `copy` |
| Images | `images`, `heart`, `album`, `eye-off` (Hidden), `nova-metadata-wipe`, `search` |
| Fix | `nova-checkup`, `hard-drive`, `nova-package-update`, `nova-boot-repair`, `nova-network-repair`, `nova-audio-repair`, `nova-display-repair`, `scroll-text` (Logs), `download` (Export) |
| Settings | `palette`, `nova-accent-match`, `wallpaper`, `monitor`, `volume-2`, `wifi`, `shield`, `keyboard`, `info`, `type` (text size) |
| ACE (Pro) | `nova-ace`, `nova-star`, `nova-ace-command`, `nova-ace-screen`, `send`, `plus`, `sparkles` |
| Power menu | `lock`, `log-out`, `moon-star` (suspend), `rotate-ccw` (restart), `power` |
| Workspaces | `layout-grid`, `nova-workspace-new` |
