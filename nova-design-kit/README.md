# NOVA OS Design Kit

Everything Claude Code needs to rebuild the NOVA OS interface to this design.

| File / folder | What it is |
|---|---|
| `PROMPTS.md` | **Start here.** A master prompt plus one ready-to-paste prompt per app and shell piece. |
| `DESIGN_SYSTEM.md` | Colours, type, spacing, components, motion, shell layout. |
| `LINUX_GUIDE.md` | How to build it on Arch + Hyprland: toolkit choice, Hyprland config, fonts, backends. |
| `tokens.css`, `tokens.json` | The exact design values, ready to import. |
| `png/` | Screenshot of every app (1440 × 900). `_overview.png` shows them all. |
| `screens/` | The same screens as HTML. Open in a browser or inspect for exact sizes. |
| `assets/` | 3D app icons, NOVA star, wallpaper. |
| `build.py` | Regenerates `screens/` from the design canvas sources in `../nova-apps/`. |

## How to use it

1. Put this `nova-design-kit/` folder inside your NOVA OS repo.
2. Open Claude Code in that repo.
3. Paste the **master prompt** from `PROMPTS.md` (fill in your toolkit). Let it read the kit and propose a plan; approve it.
4. Paste the **shared components** prompt, review the gallery it makes.
5. Paste one app prompt at a time (Shield, Guard, Files, …), reviewing each before the next.

Apps: Shield · NOVA Guard · Files · Monitor · Ledger · Images · Fix · Settings · ACE (Pro).
Shell: top bar · dock · Control panel · lock screen · notifications.
