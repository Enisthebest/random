# Is it possible? (yes: here's how)

Every screen in this kit can be built on Arch + Hyprland. This file says **how**, piece by piece, so nobody has to guess.
If something looks impossible, it's almost always "impossible the first way I tried". Use the tool in the "How" column.

**Rule for Claude Code:** never stop at "it's not possible". Build the closest version you can, show a screenshot, and say exactly what is different from the mockup and why. Then suggest how the last part could be done (a plugin, a shader, a different tool).

Legend: ✅ fully possible · 🟡 possible, with a small difference noted · ⏳ possible later (needs time or someone else)

## Shell
| Piece | | How |
|---|---|---|
| Top bar, dock, Control panel, pickers | ✅ | Quickshell (QML) `PanelWindow` layer surfaces + Hyprland `layerrule = blur` |
| Frosted glass (blur behind panels) | ✅ | Hyprland blur on layers/windows. Blur *inside* one window (a card over content) → QML `MultiEffect` / `ShaderEffectSource` |
| Apple-style "Liquid Glass" (bending light) | 🟡 | Not what NOVA uses. Our flat frosted glass is fully possible; refraction would need a custom shader per panel |
| Launcher | ✅ | Quickshell `PanelWindow` overlay + our own search index (apps from `.desktop` files, files via `plocate`/own index, settings list) |
| Lock screen + clock shrinking into the top bar | ✅ | Quickshell `WlSessionLock` + PAM. (hyprlock can't do the clock animation: don't use it for this) |
| Notifications, folding into the Do Not Disturb moon | ✅ | Quickshell notification server, animate the toast to the moon's position |
| Power menu, OSD | ✅ | Quickshell overlays; `systemctl`/`loginctl`; `wpctl` and `brightnessctl` |
| Floods (circle reveal across the screen) | ✅ | A full-screen Quickshell overlay with a circular clip/shader growing from the click point |
| Windows growing out of their dock icon | 🟡 | Hyprland's built-in `popin` animation is close. The exact "from the icon" rectangle needs a small Hyprland plugin: do `popin` first, plugin later |
| One easing curve everywhere | ✅ | `bezier = nova, .45, 0, .15, 1` in Hyprland; `Easing.BezierSpline [.45,0,.15,1,1,1]` in QML |
| Accent follows the wallpaper, live | ✅ | One QML theme singleton; wallpaper change updates it; everything binds to it |
| Night Mode | ✅ | `hyprsunset` |
| Keyboard shortcuts | ✅ | One Hyprland binds file, also read by Settings and the setup wizard |

## Apps
| Piece | | How |
|---|---|---|
| Shield, Guard, Files, Monitor, Ledger, Images, Fix, Settings | ✅ | QML apps on the shared components; backends in `LINUX_GUIDE.md` §7 |
| Terminal | ✅ | QML UI around a real terminal widget (`qmltermwidget`) or style an existing terminal (foot/kitty) to match |
| Text Editor | ✅ | QML `TextArea` + a syntax highlighter (KSyntaxHighlighting) |
| NOVA Browser | ✅ | Our UI around a real engine: QtWebEngine (Chromium). We never build an engine ourselves |
| Gaming mode (freeze apps, focus lock, no idle) | ✅ | `systemctl --user freeze` on app scopes (launch apps with `uwsm`/`app2unit` so each has a scope), a Hyprland submap for focus lock, `systemd-inhibit`, `powerprofilesctl` |
| ACE (Pro) | ✅ | Local model runtime (llama.cpp / Ollama) + our UI. Speed depends on the PC: tell users the minimum specs |

## Install and first boot
| Piece | | How |
|---|---|---|
| Live USB | ✅ | `archiso` |
| Boot splash + disk password screen | ✅ | Plymouth theme (script or two-step) with the star; `sd-encrypt` hook for the password prompt |
| Installer screens | ✅ | Calamares with custom QML pages + branding. If one page fights back, write that page in our own QML |
| Disk split slider next to Windows | ✅ | Calamares partition logic (KPMcore + `ntfsresize`); our QML slider sets the size |
| Encryption + recovery key | ✅ | LUKS2, recovery key in a second keyslot |
| Boot menu (Windows / NOVA) | ✅ | GRUB + `os-prober`, themed |
| "NOVA is signed" (Secure Boot stays on) | ⏳ | Needs a Microsoft-signed shim. Until then the installer honestly says "turn off Secure Boot for the beta" |
| Setup wizard on first boot | ✅ | A Quickshell/QML app started by greetd in a one-time setup session; it creates the user, then logs in |
| Login screen | ✅ | greetd + a Quickshell greeter (same look as the lock screen), or an SDDM QML theme |

## If Claude says "it's not possible"
Paste this:
```
Read nova-design-kit/FEASIBILITY.md. This piece is listed there with the tool to use.
Don't stop at "not possible": build the closest version with that tool, show me a screenshot,
and list exactly what's different from the mockup and what it would take to close the gap.
```
