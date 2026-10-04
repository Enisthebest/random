# NOVA OS: what to tell Claude, in order

Copy each **Say** message into Claude Code, one step at a time. Don't start the next step until the current one looks right.

After **every** step:
1. Ask: *"Show me a screenshot."*
2. Compare it with the PNG named in the step (in `nova-design-kit/png/`).
3. If something's off, send the screenshot and say what's wrong.
4. When it looks right, say: *"Looks good, commit it."*

💡 Start a **new Claude Code session** every 2–3 steps. Long sessions get slower, more expensive and worse. The kit and the skill carry everything over, so nothing is lost.

---

## Step 0: Set up (once)
Unzip `nova-design-kit.zip`, `nova-wallpapers.zip` and `nova-icons.zip` into your NOVA project folder, then do the "First" part of `START_HERE.md` (copy the skill, add the `CLAUDE.md` line).

## Step 1: The plan
**Say:**
> Read nova-design-kit/README.md, then do the "Master prompt" in nova-design-kit/PROMPTS.md. Our toolkit is Quickshell + QML. Read FEASIBILITY.md too. Propose the plan and wait for my OK.

Read the plan. If it makes sense, say **"OK, go."**

## Step 2: Theme + shared components
**Say:**
> Do the "Shared components" prompt in nova-design-kit/PROMPTS.md. Use tokens.json for every colour, size and duration.

✅ Check: the component gallery screen (buttons, toggles, cards, rows).

## Step 3: Top bar, dock, Control panel
**Say:**
> Do the "Top bar, dock and Control panel" prompt in nova-design-kit/PROMPTS.md.

✅ Check: `shell-desktop.png`, `shell-control.png`, `shell-wifi.png`, `shell-bluetooth.png`

## Step 4: Keyboard shortcuts
**Say:**
> Do the "Keyboard shortcuts" prompt in nova-design-kit/PROMPTS.md.

✅ Check: Super+Space, Super+E, Super+S, Super+W, Super+X, Super+L all work.

## Step 5: Launcher
**Say:**
> Do the "Launcher" prompt in nova-design-kit/PROMPTS.md.

✅ Check: `launcher-open.png`, `launcher-search.png`, `launcher-calc.png`

## Step 6: Lock screen + login screen
**Say:**
> Do the "Lock screen" prompt in nova-design-kit/PROMPTS.md. Then make the login screen with greetd + a Quickshell greeter that looks exactly like shell-lock-password.png.

✅ Check: `shell-lock.png`, `shell-lock-password.png`

## Step 7: Notifications, power menu, volume popup
**Say:**
> Do the "Notifications", "Power menu" and "Volume and brightness popup (OSD)" prompts in nova-design-kit/PROMPTS.md, one at a time.

✅ Check: `shell-notifications.png`, `shell-power.png`, `shell-osd.png`

## Step 8: Settings + wallpapers
**Say:**
> Do the "Settings" prompt in nova-design-kit/PROMPTS.md. Then read nova-wallpapers/README.md and add the 6 wallpapers with "accent follows the wallpaper".

✅ Check: `settings.png`. Pick another wallpaper → the accent colour changes everywhere.

## Step 9: The apps (one per message)
**Say**, for each app in this order:
> Do the "[APP]" prompt in nova-design-kit/PROMPTS.md.

Files → Shield → NOVA Guard → Monitor → Fix → Ledger → Images → Terminal → Text Editor → NOVA Browser

✅ Check each against its PNG (`files.png`, `shield.png`, …).

## Step 10: Gaming mode
**Say:**
> Do the "Gaming mode" prompt in nova-design-kit/PROMPTS.md.

✅ Check: `gaming-on.png`, `gaming-locked.png`, `gaming-settings.png`, `gaming-off.png`. Test with a real game.

## Step 11: Setup wizard
**Say:**
> Do the "Setup wizard" prompt in nova-design-kit/PROMPTS.md.

✅ Check: `setup-*.png`. Test it with a new user account.

## Step 12: Installer + boot screens
**Say:**
> Do the "Installer + boot screens" prompt in nova-design-kit/PROMPTS.md. We'll test the ISO in a virtual machine first.

✅ Check: `install-*.png`, `boot-*.png`.
⚠️ Test in a **virtual machine** (VirtualBox / GNOME Boxes) or on a **spare disk**. Never on your main disk.

## Step 13: ACE (Pro, last)
**Say:**
> Do the "ACE (Pro)" prompt in nova-design-kit/PROMPTS.md. Use ace-identity/ACE_PERSONALITY.md for Buddy and every line ACE says.

✅ Check: `ace-*.png`, `launcher-ace.png`

---

## Anytime
- **Grey edges or shadows?** Say: *Do the "Fix: remove shadows and grey edges" prompt in nova-design-kit/PROMPTS.md.*
- **Claude says "not possible"?** Paste the prompt at the bottom of `nova-design-kit/FEASIBILITY.md`.
- **Need a new screen with no mockup?** Say: *Design a [thing] for NOVA using the nova-design skill, show me a screenshot first.*
- **Stuck?** Bring a screenshot back to this chat.
