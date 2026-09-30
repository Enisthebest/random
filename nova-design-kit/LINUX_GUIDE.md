# Building these designs on Linux (Arch + Hyprland)

Everything in this kit can be built natively on Linux. Here is how the pieces map to real tools.

## 1. Pick one toolkit for everything

| Option | Best for | Why |
|---|---|---|
| **Quickshell + Qt Quick (QML)** — recommended | Shell *and* apps | One language for the top bar, dock, Control panel, lock screen, notifications and every app. Smooth GPU animations, custom easing curves, rounded glass cards, easy theme singletons. |
| AGS / Astal (GTK4 + TypeScript + CSS) | Shell, and apps with GTK4 | Styled with CSS, so `tokens.css` maps almost 1:1. Good if the current shell already uses it. |
| GTK4 apps (Python / Rust / Vala) with custom CSS | Apps only | Native GNOME stack; drop libadwaita's default look and apply the NOVA CSS. |
| Tauri (web UI + Rust) | Apps only | The HTML mockups become the starting point directly. Heavier than QML/GTK, but fastest to match pixel for pixel. |

**If the current NOVA shell already uses one of these, keep it** and build the apps in the same toolkit so everything shares one theme.

## 2. Hyprland does the glass and window motion

Add to `hyprland.conf`:

```ini
# The NOVA curve: cubic-bezier(.45,0,.15,1)
bezier = nova, 0.45, 0, 0.15, 1

animations {
    enabled = true
    # speed is in 100 ms steps: 8 = 800 ms, 4 = 400 ms
    animation = windows, 1, 8, nova, popin 80%
    animation = windowsOut, 1, 8, nova, popin 80%
    animation = fade, 1, 4, nova
    animation = workspaces, 1, 8, nova, slide
    animation = layers, 1, 8, nova, fade
}

decoration {
    rounding = 24
    blur {
        enabled = true
        size = 10
        passes = 3
        vibrancy = 0.2
    }
    shadow {
        enabled = true
        range = 60
        render_power = 3
        color = rgba(00000088)
    }
}

# Blur behind the shell's layer surfaces (use your bar/panel namespaces)
layerrule = blur, nova-bar
layerrule = blur, nova-control
layerrule = ignorezero, nova-control
```

Windows then open and close on the NOVA curve with rounded corners, blur and soft shadows. Hyprland's built-in animations can't grow a window out of its exact dock icon; `popin` is the closest native effect. The toolkit can do the true grow-from-icon inside the shell (e.g. the Control pill growing into the panel).

## 3. The NOVA curve in each toolkit

- **QML:** `easing.type: Easing.BezierSpline; easing.bezierCurve: [0.45, 0, 0.15, 1, 1, 1]; duration: 800`
- **GTK / AGS CSS:** `transition: all 800ms cubic-bezier(.45, 0, .15, 1);`
- **Web / Tauri:** use `--ease` and `--dur-glide` from `tokens.css`.

## 4. Theme once, use everywhere

- **QML:** a `Theme.qml` singleton with every value from `tokens.json` (colours, radii, sizes, durations).
- **GTK / AGS:** import `tokens.css` (as `@define-color` / CSS variables) in one shared stylesheet.

Components never hard-code a colour, radius or duration.

## 5. Fonts and icons

```bash
# Fonts (AUR)
yay -S ttf-geist ttf-geist-mono      # or otf-geist / otf-geist-mono
fc-cache -f
```
- Line icons: **Lucide** (`lucide-static` SVGs, 2 px stroke).
- App icons: the 3D PNG/WebP files in `assets/`.

## 6. Shell pieces

| Piece | How |
|---|---|
| Top bar, dock, Control panel | Layer-shell surfaces (Quickshell `PanelWindow` / AGS windows) with `layerrule = blur`. |
| Lock screen | Quickshell's session lock (`WlSessionLock`) gives full control, including the clock shrinking into the top-bar pill. **hyprlock** is simpler but can't do that animation: use it for the layout only. |
| Notifications | Quickshell's notification server, or AGS's; style the toasts from the kit. |
| Night Mode | `hyprsunset` for the colour temperature; the UI only toggles it. |
| Accent colour | One theme value; changing it updates every component live. |

## 7. What the apps talk to

The designs are UI only. Each app needs a real backend. Typical Arch tools:

| App | Backend examples |
|---|---|
| Shield | nftables/firewalld, WireGuard + kill-switch rules, Tor, macchanger / NetworkManager MAC randomisation, `systemd-resolved` DNS-over-TLS |
| NOVA Guard | ClamAV (`clamd`, `freshclam`) |
| Monitor | `/proc`, `lm_sensors`, `nvidia-smi` / `amdgpu` sysfs |
| Fix | `smartctl`, `pacman -Qu`, `journalctl`, PipeWire (`wpctl`) |
| Files | GIO / `QFileSystemModel`, `udisks2` for drives |
| Ledger | encrypted local store (e.g. libsecret / KeePassXC format / SQLCipher) |
| ACE | a local model runtime (e.g. llama.cpp / Ollama) |

Claude Code should build the UI first with the controls wired to stubs, then connect them one by one, and never fake data in the finished app.
