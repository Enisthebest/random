# NOVA OS: files for Claude Code

Put both folders in your NOVA OS project folder (unzip them there):

```
your-nova-project/
├── nova-design-kit/     ← from nova-design-kit.zip
└── nova-wallpapers/     ← from nova-wallpapers.zip
```

## Order

**1. The redesign (big job, do it first)**
Open Claude Code in the project and paste the **Master prompt** from `nova-design-kit/PROMPTS.md`.
Let it read the kit and propose a plan, say OK, then give it the other prompts from `PROMPTS.md` **one at a time**:
shared components → Shell (top bar, dock, Control panel) → Lock screen → Notifications → Shield → Guard → Files → Monitor → Ledger → Images → Fix → Settings → ACE.
Check each one before the next.

**2. Wallpapers + accent colours**
When Settings → Appearance is built, say:
> Read nova-wallpapers/README.md and add these wallpapers to the OS, including "accent follows the wallpaper".

**If you see grey outlines or shadows anywhere**
Paste the **"Fix: remove shadows and grey edges"** prompt from `PROMPTS.md`.

## Tips
- One app per session message. Ask for a screenshot after each one and compare it to `nova-design-kit/png/`.
- If something looks off, send it the screenshot and say which `png/` it should match.
- Commit after every app that looks right, so you can always go back.
