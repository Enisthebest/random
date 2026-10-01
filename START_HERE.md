# NOVA OS: files for Claude Code

Put both folders in your NOVA OS project folder (unzip them there):

```
your-nova-project/
├── nova-design-kit/     ← from nova-design-kit.zip
├── nova-wallpapers/     ← from nova-wallpapers.zip
└── nova-icons/          ← from nova-icons.zip (icons for everything + a Linux icon theme)
```

## First: give Claude the NOVA design skill (so it designs like this forever)

Copy the skill into your project once:
```
mkdir -p .claude/skills
cp -r nova-design-kit/skill/nova-design .claude/skills/
```
And add this line to your project's `CLAUDE.md` (create the file if it doesn't exist):
```
For any UI work on NOVA OS, use the nova-design skill and follow nova-design-kit/DESIGN_SYSTEM.md. New screens must look like the mockups in nova-design-kit/png/.
```
Now every future Claude Code session in this project designs in the NOVA style, even for new screens that have no mockup. For a brand-new screen just say: *"Design a [thing] for NOVA using the nova-design skill, show me a screenshot first."*

## Order

**1. The redesign (big job, do it first)**
Open Claude Code in the project and paste the **Master prompt** from `nova-design-kit/PROMPTS.md`.
Let it read the kit and propose a plan, say OK, then give it the other prompts from `PROMPTS.md` **one at a time**:
shared components → Shell (top bar, dock, Control panel, Wi-Fi & Bluetooth pickers) → Launcher → Lock screen → Notifications → Power menu → Volume popup → Shield → Guard → Files → Monitor → Ledger → Images → Fix → Settings → ACE.
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
