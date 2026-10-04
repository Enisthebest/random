# Prompts for Claude Code

Paste the **master prompt** first in a Claude Code session opened in your NOVA OS repo (with this `nova-design-kit/` folder inside it). Then paste one app or shell prompt at a time, and review each result before moving on.

Anything in `[BRACKETS]` is for you to fill in.

---

## Master prompt (paste first)

```
You are redesigning the UI of NOVA OS, a privacy-first desktop built on Arch Linux and Hyprland.
The design is finished and lives in ./nova-design-kit/. Your job is to implement it faithfully in our existing stack: [YOUR TOOLKIT, e.g. Quickshell/QML, AGS/GTK, EWW, Electron/Tauri].

Read these first, in this order:
1. nova-design-kit/DESIGN_SYSTEM.md: colours, type, spacing, components, motion.
2. nova-design-kit/tokens.css and tokens.json: the exact values. Define them once as shared theme constants in our codebase and use them everywhere; never hard-code a colour, radius or duration in a component.
3. nova-design-kit/LINUX_GUIDE.md: how this maps to Arch + Hyprland (toolkit, Hyprland animation/blur config, fonts, backends).
   Also nova-design-kit/FEASIBILITY.md: how every piece is built. Nothing in the kit is impossible; never stop at "not possible", build the closest version and tell me what differs.
4. nova-design-kit/png/*.png: what each screen must look like. screens/*.html are the same screens as live HTML you can inspect for exact sizes.

Rules:
- Match the screenshots closely: sizes, spacing, radii, font sizes and weights, colours.
- Build shared components first (Window, Sidebar + NavItem, Header, Card, Row, Toggle, Button, Chip, SearchField, Table, ChatBubble, PermissionCard), then build every app from them.
- Fonts: Geist and Geist Mono (SIL OFL). Icons: Lucide, 2px stroke. App icons: nova-design-kit/assets/.
- NO SHADOWS AND NO GREY EDGES, anywhere: no box-shadow, DropShadow/MultiEffect shadows, glows, Hyprland window shadows or borders, or default theme outlines. Keep everything outside rounded shapes fully transparent so blur leaves no grey rim. See DESIGN_SYSTEM.md → "No shadows, no grey edges".
- Motion: one curve, cubic-bezier(.45,0,.15,1). 800ms for moves and shape changes, 400ms for fades and floods. Incoming content fades in during the second half of a move; outgoing content leaves in the first 40%. Windows grow out of their dock icon and shrink back into it. No bounces, springs or glows.
- Everything in [BRACKETS] in the mockups is a placeholder: wire it to real data, never ship the placeholder.
- Don't invent features that aren't in the mockups or in our code. If a mockup shows a control our backend doesn't support yet, build the UI, leave it disabled, and list it for me.
- Accessibility: real buttons, keyboard focus rings, labels on icon-only buttons, text contrast at least 4.5:1.
- Work one app at a time. After each one, show me what changed and a screenshot if you can.

Start by reading the kit and proposing: (a) where the theme constants and shared components will live in our repo, and (b) the order you'll build things in. Wait for my OK before writing code.
```

---

## Fix: remove shadows and grey edges (use anytime)

```
There are grey outlines / shadows around the UI. NOVA uses no shadows at all. Fix it everywhere:
1. Remove every shadow: box-shadow, DropShadow, MultiEffect shadowEnabled, GTK box-shadow, glow effects.
2. Hyprland: set general:border_size = 0 and decoration:shadow:enabled = false; add layerrule = ignorezero for every blurred layer namespace (try ignorealpha 0.3 if an edge remains).
3. Make every window/layer root background fully transparent outside its rounded shape, and clip blur to the same radius.
4. Reset default theme outlines, frames and focus rings; show focus only as a 2px --accent ring while focused via keyboard.
5. Snap all 1px borders to whole pixels.
Then list every file you changed, and show before/after screenshots if you can.
```

---

## Shared components (do this before any app)

```
Build the shared NOVA components from DESIGN_SYSTEM.md section 5 using the theme tokens: Window, Sidebar, NavItem (with selected state and aria-current), Header, Card (with optional uppercase label), Row (icon tile + title + secondary + right slot), Toggle (46x28, animated knob, green or accent variant), Button (default + primary), Chip (success / warning / accent / danger), SearchField, Table, ChatBubble (user / ACE), PermissionCard. Add the motion helpers: glide (800ms, the NOVA curve), fade (400ms), flood (circle from a point to the farthest corner, 400ms), and "grow from rect" for windows opening from the dock. Make a small gallery screen that shows every component in every state so I can review them.
```

---

## Apps

### NOVA Shield — `png/shield.png`
```
Build NOVA Shield to match nova-design-kit/png/shield.png and screens/shield.html.
Sidebar: Overview (selected), Network, Identity, Device, Data, then an "Insight" section with Activity.
Header: "Privacy" / "14 protections. One tap each." with a green "Protected" chip.
Hero card: shield icon, "You're protected", "[N] of 14 protections on · nothing phones home", and a "Turn all on" button.
Four cards in a 2-column grid, each a list of rows with a toggle:
- Network: Private DNS, VPN kill switch, Tor per app, Network watch
- Identity: Hide your device ID, Guest mode, Decoy login
- Device: Camera off switch, Lock on USB unplug, Boot tamper check, Sandbox status
- Data: Secure delete, Clipboard auto-clear, Metadata wipe
Each toggle calls our real backend for that protection: [DESCRIBE / LINK THE BACKEND]. The hero count and chip update live. The sidebar sections show only that group's rows.
```

### NOVA Guard — `png/guard.png`
```
Build NOVA Guard (antivirus) to match png/guard.png and screens/guard.html.
Sidebar: Overview (selected), Scans, Quarantine, Real-time, History.
Hero: a 190px ring (green when clean, accent while scanning; the ring fills as the scan progresses) with a check in the centre, "No threats found", "Last scan: [TIME] · [N] files checked", buttons Quick scan (primary), Full scan, Scan a folder.
Three cards: Real-time protection (toggle), Quarantine ([N] items chip), Threat definitions (Up to date chip, updated [DATE]).
Recent scans table: Scan, When, Files, Result.
While scanning: the ring fills, the title becomes "Scanning…" and the file count ticks up in whole numbers. When threats are found: title turns to "[N] threats found", ring and chip turn to --danger, and a Quarantine all button appears.
Backend: [OUR SCAN ENGINE, e.g. ClamAV].
```

### Files — `png/files.png`
```
Build Files to match png/files.png and screens/files.html.
Sidebar: Favorites (Home, Documents, Pictures, Downloads, Screenshots), Devices (mounted drives, e.g. ARCH_202609), More (Trash).
Header: back / forward buttons, current folder name, search field, grid / list view toggle.
Body: "Folders" grid using the 3D folder icon (selected tile gets --surface-selected), and a "Recent" table with Name, Kind, Size, Modified.
Opening a folder glides the tile into the content area. Ejecting a drive removes it from the sidebar with a fade. Double-click opens, Enter opens, Backspace goes back.
```

### Monitor — `png/monitor.png`
```
Build Monitor to match png/monitor.png and screens/monitor.html.
Sidebar: Overview (selected), Processes, Temperatures, Network, Startup.
Header: "What's running" / "Live, on this device only." with a process search field.
Four stat cards (CPU, Memory, GPU, Disk), each with the current value and a 12-bar history chart in its own colour (CPU #6AA8FF, Memory #B48CFF, GPU #5FDC86, Disk #FFAE5A).
Processes table (Name, CPU, Memory, End button) and a Temperatures card (bars for CPU, GPU, SSD that turn from green to orange as they heat, plus "All good. Fans quiet." when everything is normal).
Update once per second; numbers change in whole steps and use Geist Mono so they don't jitter.
```

### Ledger — `png/ledger.png`
```
Build Ledger (card vault) to match png/ledger.png and screens/ledger.html.
Sidebar: Cards (selected), Passes, Receipts, then "Privacy": Locked cards, Activity.
Header: "Card vault" / "Encrypted and stored only on this device." with an "Add card" primary button.
Cards shown as 290x182 tiles with NOVA gradients (never real bank artwork), masked number "•••• [LAST 4]", holder and type. Selecting a card shows its controls on the right: Lock card, Ask before paying, Hide number, Online payments, plus "Copy card number" (requires authentication).
Recent use table for the selected card. Storage: [OUR ENCRYPTED STORE]. Never log or display full numbers without authentication.
```

### Images — `png/images.png`
```
Build Images to match png/images.png and screens/images.html.
Sidebar: Library (selected), Favorites, Screenshots, Albums section (user albums), Private section (Hidden, requires authentication).
Header: "Library" / "[N] photos · [N] videos", a green "Metadata wipe on" chip linked to the Shield setting, and search.
Body: date heading, Years / Months / All photos segmented control, a 6-column square grid with 12px gaps (selected photo gets a 3px accent outline), and a card explaining that shared photos leave without location, with a Manage button.
Thumbnails load lazily; the grid never jumps when they arrive.
```

### Fix — `png/fix.png`
```
Build Fix (repair tools) to match png/fix.png and screens/fix.html.
Sidebar: Checkup (selected), Disk, Packages, Boot, Network, Audio, then Advanced: Logs.
Hero card: fix icon, "[N] things need a look" (or "Everything looks good" in green when N = 0), "Last checkup: [TIME]", and a "Fix all" primary button.
Checks list: Disk health, Packages, Boot, Network, Audio, Display. Each shows a green "Healthy" chip or an action button (Update, Repair).
Log card on the right in Geist Mono with ✓ / ! markers, and "Export report".
Each check runs a real command: [LIST OUR CHECK COMMANDS]. Never run a repair without the user pressing a button.
```

### Settings — `png/settings.png`
```
Build the Settings app, starting with Appearance, to match png/settings.png and screens/settings.html.
Sidebar: Appearance (selected), Display, Sound, Network, Privacy, Keyboard, then System: About NOVA.
Appearance: Theme (Dark / Light / Auto previews), Accent colour (6 swatches; the ring glides to the chosen one and the new accent floods out from it across the whole OS in 400ms), Text size slider, Wallpaper picker, Transparency toggle, Night Mode schedule toggle.
Changing the accent updates every component that uses --accent live.
```

### ACE (Pro) — `png/ace.png`, `ace-new.png`, `ace-screen.png`, `ace-command.png`, `ace-message.png`, `ace-permissions.png`
```
Build the ACE app (Pro only) to match png/ace.png plus the five ace-*.png screens.
ACE has a face and a personality: read ace-identity/ACE_PERSONALITY.md first. Build Buddy (ace-identity/svg/) as a live QML component with its 9 moods, and write every ACE line in its voice.
Sidebar: ACE + star, New chat, "Today" conversation list (selected highlighted), Settings: Permissions & model.
Header: conversation title / "ACE runs on your device. It only sees what you allow." with an orange "Pro" chip.
Chat: user bubbles right (#2F7CF6, bottom-right corner 6), ACE bubbles left with the star (bottom-left corner 6), suggestion chips above the 56px round input with a white send button.
New chat (ace-new.png): star, "What can I do for you?", "Everything stays on this device", four suggestion cards (each says how ACE stays safe: "Asks before it looks", "Shows the commands first", "You send the draft", "Never deletes without asking").
Screen access (ace-screen.png): ACE never looks on its own. It asks with a light permission card in the chat: "Let ACE see your screen once?", what it will do with the image, Allow once / Don't allow. One look per Allow; the image is deleted after the answer.
Commands (ace-command.png): ACE shows a "Commands to run" card with the exact commands (commented, Geist Mono), what they free/change, what they don't touch, whether a password is needed, and Edit / Run. Nothing runs until Run; sudo uses the normal polkit/sudo prompt.
Messages (ace-message.png): ACE writes a draft card (To, app, text) with Edit / Send and tone chips (shorter, more formal, add an apology). ACE never sends on its own.
Permissions & model (ace-permissions.png): what ACE can use (screen, commands: Ask first / Never; messages: Drafts only / Off; files: chosen folders; private web search), the model card (runs on this device, [MODEL] · [SIZE] · GPU, works offline), memory (remember things about me, chat history auto-delete, see what ACE remembers, erase everything).
Rules: the model runs locally [OUR LOCAL MODEL/RUNTIME]; nothing leaves the device; every action that changes something is a draft the user confirms. On non-Pro editions ACE doesn't appear.
```

### Terminal — `png/terminal.png`
```
Build (or restyle) the Terminal to match png/terminal.png. If we wrap an existing terminal (e.g. foot, kitty or a VTE widget), apply the look; don't rewrite the emulator.
Window: no sidebar; a 52px tab row (app tile, tabs as 34px pills, the active one raised, close ×, + new tab; split, search and menu on the right), the terminal body in Geist Mono 14px / 1.62 line height with 18x22px padding, and a 30px status bar (shell, path, size, encoding).
Colours (ANSI palette): background = the window glass, foreground #D6D6DB, dim #6E6E77, green #5FDC86, blue #6AA8FF, orange #FFAE5A, purple #B48CFF, cyan #5AD4FF, red #FF7B7B, white #F2F2F4. Ship a matching zsh/starship prompt: user@host in green, path in blue, git branch in purple, ❯ in orange. Block cursor, white, no blink.
Ctrl+Shift+T new tab, Ctrl+Shift+D split, Ctrl+Shift+F search.
```

### Text Editor — `png/editor.png`
```
Build the Text Editor to match png/editor.png. Sidebar (232px) with the project file tree (chevrons, folder/file icons from nova-icons, selected file highlighted); tab row for open files; editor in Geist Mono 14px / 1.7 with line numbers (#4E4E56) and the current line softly highlighted; a 30px status bar (language, line/column, indentation, encoding, "Saved" in green or "Edited" in orange).
Syntax colours use the same palette as the Terminal (headings/keywords purple, links/types blue, strings orange, comments #8D8D96, commands cyan, list markers green).
Find (Ctrl+F) opens as a floating bar top-right in the editor with match count and up/down/close; matches get an orange highlight. Autosave on focus loss; never lose unsaved text on close (ask).
```

### NOVA Browser — `png/browser-newtab.png`, `browser-site.png`, `browser-shield.png`
```
Restyle NOVA Browser to match png/browser-newtab.png, png/browser-site.png and png/browser-shield.png. Keep our engine: [OUR ENGINE, e.g. QtWebEngine / WebKitGTK / Chromium-based].
Chrome: a tab row on top (pills like the Terminal), then a 56px toolbar: back, forward (dimmed when unavailable), reload, the address field (38px, radius 12, lock + domain in white and the path in grey), the green shield chip "N blocked" inside the right end of the address field, then downloads and menu.
New tab: NOVA star, "NOVA Browser", "Private by default. Nothing you do here leaves this device.", a big 56px round private search field, 6 shortcut tiles (user-editable, letter tiles; no remote favicons fetched without permission), and three stat cards: trackers blocked this week (green), ads blocked, fingerprints taken (blue). Counts come from the browser's own local blocking, never from a server.
Shield panel (click the chip): a 340px panel under it: "You're protected on [site]", counts, and per-site toggles: Block trackers, Block third-party cookies, Fingerprint protection, HTTPS only, Open through Tor (off by default); buttons Site settings and Clear site data. Changes apply on reload and are remembered per site.
Defaults: trackers and third-party cookies blocked, fingerprint protection on, HTTPS-only on, a private search engine, no telemetry, no account, history cleared on close if the user picks that in settings.
```

---

## Shell

### Top bar, dock and Control panel — `png/shell-desktop.png`, `shell-control.png`, `shell-wifi.png`, `shell-bluetooth.png`
```
Restyle the shell to match png/shell-desktop.png, png/shell-control.png, png/shell-wifi.png and png/shell-bluetooth.png (HTML in screens/shell-*.html), following DESIGN_SYSTEM.md section 7.
Top bar: floating 36px pills, radius 12, 9px from the top: workspaces (dots; the active one is a 22px bar), centred clock, then tray (Wi-Fi, Bluetooth, volume, battery %), keyboard layout, and the Control pill (highlighted while the panel is open).
Dock: centred, 64px, radius 16, 44px icons with 16px gaps, a divider before ACE, a 5px accent dot under running apps; icons swell gently as the pointer passes.
Control panel: "Control" title + Edit; left column Sound (slider + output list with the active device highlighted), Do Not Disturb, Shortcuts (screenshot, search, files, lock, power); right column Wi-Fi and Bluetooth cards (tap opens their picker in place), Night Mode (toggle + warmth slider), USB & Drives (eject). The Control pill grows into the panel with the 800ms glide; cards appear one after another.
Wi-Fi / Bluetooth pickers replace the panel in the same spot with a back chevron and an on/off toggle: networks/devices as 48px rows, the connected one highlighted, lock or battery on the right, then a footer action.
Wire everything to the real system: [NetworkManager / iwd, BlueZ, PipeWire (wpctl), hyprsunset, udisks2].
```

### Lock screen — `png/shell-lock.png`, `png/shell-lock-password.png`
```
Build the lock screen to match png/shell-lock.png and png/shell-lock-password.png.
Idle: blurred wallpaper (36px) with a 32% black layer, clock 200px/600, date 30px/500 below, "Swipe up to unlock" with a chevron at the bottom, Wi-Fi and battery top-right.
Any key, click or swipe glides to the password state: the clock shrinks to 96px and moves up (800ms, NOVA curve), the avatar (88px), name and a 48px round password field fade in; the field focuses at once. Wrong password: the field turns red for 1s and clears (no shaking). Unlock: the clock shrinks into the top-bar clock pill while the blur and dark layer fade out; locking plays it in reverse.
Use Quickshell's WlSessionLock (or our lock tool) and PAM for the password.
```

### Power menu — `png/shell-power.png`
```
Build the power menu to match png/shell-power.png: opens from the Control panel's power shortcut or Super+X. A centred glass panel over the desktop dimmed 40%: "Signed in as [NAME]", five 72px round buttons with labels and key hints: Lock (L), Sleep (S), Log out (O), Restart (R), Shut down (P, red tint). Arrow keys move, Enter or the letter runs it, Esc closes. Opens with a 400ms fade + scale 0.96→1. Use loginctl / systemctl.
```

### Volume and brightness popup (OSD) — `png/shell-osd.png`
```
Build the on-screen display to match png/shell-osd.png: a 340x56 glass pill centred 96px above the bottom, icon + a thin 8px white bar + the value. Shows when volume or brightness keys are pressed, the bar glides to the new value (400ms), and it fades out 1.5s after the last change. The icon follows the state (volume-x when muted, sun for brightness).
```

### Launcher — `png/launcher-open.png`, `launcher-search.png`, `launcher-calc.png`, `launcher-ace.png`
```
Redesign our app launcher to match nova-design-kit/png/launcher-*.png and screens/launcher-*.html, following DESIGN_SYSTEM.md → "Launcher". Keep our existing search backend: [DESCRIBE WHAT OUR LAUNCHER SEARCHES TODAY], and restyle and extend the UI.
Layout: a 720px glass panel centred horizontally, 150px from the top, radius 24, over the desktop dimmed 28%. The desktop stays visible; don't blur the whole screen.
- Search row 68px: magnifier, 22px/500 input, accent caret, "esc" keycap on the right.
- Empty query: an "Apps" row of 8 pinned 3D app icons (52px, labels 12px) and a "Recent" list (files, settings, apps used last).
- Typing: a Top hit card (64px icon, 22/700 name, one-line description, white "Open ↵" button), then results grouped under Settings, Files, Actions (and Apps if more than one matches). Matched letters are bold and white; the rest of the title is grey. Group order is by best match.
- Quick answers: maths and unit/currency conversions answer inside the launcher (big 44px result, "Copy ↵"), with "Open in Calculator" below. Currency rates are cached offline: never call the network while the user types.
- Pro only: when the query reads like a sentence or command, show the ACE card: the planned steps as a numbered draft, "Runs on this device. Nothing happens until you press Run.", with Edit and Run buttons. Nothing runs without Run. On non-Pro editions this card doesn't exist.
- Footer 44px: ↑ ↓ move · ↵ open · tab actions on the left, "super space open launcher" on the right.
Keyboard: Super+Space toggles it; typing starts instantly (focus in the field); ↑/↓ move the selection (it glides between rows); ↵ opens; Tab shows actions for the selected item (Open, Show in Files, Copy path, Pin); Esc clears the query, a second Esc closes. Mouse hover moves the selection too.
Motion: opens by fading in and scaling from 0.96 to 1 over 400ms on the NOVA curve while the desktop dims; results resize the panel height with an 800ms glide (never jump); rows fade in over the second half. Closes in 250ms.
Performance: first results within 50ms of a keystroke; index apps, settings and recent files locally. Nothing typed ever leaves the device.
No shadows and no grey edges on the panel (see DESIGN_SYSTEM.md). Match the screenshots closely.
```

### Notifications — `png/shell-notifications.png`
```
Build notification toasts to match png/shell-notifications.png: 382x66, radius 16, top-right under the top bar, stacked with 10px gaps (max 3, older ones collapse). App icon in a tinted circle (green for Shield/Guard, accent for system), title 14/600, one line 12/400, "now" top-right. They slide in from the right with the glide and leave after 5s. Clicking opens the related app. With Do Not Disturb on, an incoming toast folds down into the Do Not Disturb moon icon instead of staying.
```

---

## First boot

### Setup wizard — `png/setup-*.png` (overview: `png/_setup-overview.png`)
```
Build the first-boot setup wizard to match nova-design-kit/png/setup-*.png (HTML in screens/setup-*.html), following DESIGN_SYSTEM.md → "Setup wizard". It runs once, full screen, before the first login, and creates the user account.
Screens, in order:
0. Welcome (setup-welcome): full screen, blurred wallpaper with a 42% black layer, NOVA star, "Welcome to NOVA" 72/700, one line below, "Hello" cycling through languages (one bright, the rest 32% white; it moves on every 2s with a 400ms cross-fade), a language pill and the white "Get started" button. Bottom row: Accessibility, keyboard layout, Shut down.
1. Language & region (setup-region): searchable language list with a check on the chosen one, keyboard layout picker, a "Try it" field to test typing, time zone guessed from the language and keyboard (never from location or an online lookup).
2. Internet (setup-wifi): network list (the selected one highlighted), password card with "Private Wi-Fi address" on by default, "Join another network", and "Set up offline" next to Continue. Connecting must not contact any NOVA server.
3. Account (setup-account): avatar with 5 gradient colours or a photo, name, username (auto-filled from the first name, lowercase, checked live), password with a 4-step strength bar and a hint, confirm field, "Encrypt my home folder" on by default. No email, no online account.
4. Privacy (setup-privacy): the green "NOVA collects nothing about you." card, then crash reports, location and lock-screen previews, all OFF by default. Link to the privacy policy.
5. Protection (setup-protection): three Shield level cards (Relaxed, Balanced = recommended + preselected, Strict), then Updates as a 3-way segmented control: Ask me first (default), Install automatically, Only when I check.
6. Look (setup-look): the 6 wallpapers from nova-wallpapers/ in a 3×2 grid, a live mini preview, "Match accent to wallpaper" on. Picking a wallpaper changes the accent of the wizard itself right away (the accent floods out from the clicked thumbnail, 400ms): every later step uses the new accent, as in setup-look/ace/finish.
7. ACE (setup-ace): NOVA Pro only. On other editions this step and its sidebar item don't exist and the steps renumber. Buddy (ace-happy), the greeting bubble, the four promise cards, "Maybe later" and "Turn on ACE".
8. Finish (setup-finish): "You're all set, [FIRST NAME] ✦", twelve shortcut tiles (from DESIGN_SYSTEM.md → "Keyboard shortcuts"; read them from the real keybind config so they never go out of date), chips summing up the choices, three "What's next" cards, and "Start using NOVA", which logs straight into the new desktop.
Layout: a 1080×680 window (radius 24) centred over the blurred wallpaper; left rail 268px with the brand, the numbered steps (done = accent circle with a check, current = white circle on the selected background, later = dimmed) and Accessibility (Super+U) at the bottom; content on the right: "STEP N OF 8" label, title 30/700, one subtitle line, content, then the nav bar (Back on the left; an optional link and the white primary button on the right).
Behaviour: Continue stays disabled until the step is valid; Enter = Continue, Esc = Back. Steps slide: the content glides 40px left and fades out (first 40%) while the next one fades in from the right (second half), 800ms on the NOVA curve; the sidebar highlight glides to the next step. Clicking a finished step in the sidebar jumps back to it. Nothing is applied until Finish, except Wi-Fi and the wallpaper/accent preview; if the PC turns off halfway, the wizard starts again.
On Finish: create the user (useradd + passwd, wheel group), apply locale, keymap, time zone, Shield level, update mode, wallpaper and accent, then remove the wizard's autostart.
Wire it to: [localectl, timedatectl, NetworkManager/iwd, useradd, systemd-homed or fscrypt for encryption, our Shield and update config].
No shadows and no grey edges. Match the screenshots closely.
```

---

## Keyboard shortcuts — `png/setup-finish.png`
```
Set up NOVA's system keyboard shortcuts in Hyprland exactly as listed in DESIGN_SYSTEM.md → "Keyboard shortcuts". Keep them in one keybinds file, and have the setup wizard's Finish screen and Settings → Keyboard read that same file, so what we show always matches what works.
Before adding them, list any existing binds that clash (Super+S, Super+E, Super+W, Super+G, Super+X, Super+U) and tell me what you moved.
Gaming mode (Super+G) is built separately: see the "Gaming mode" prompt.
```

---

## Gaming mode — `png/gaming-on.png`, `gaming-locked.png`, `gaming-settings.png`, `gaming-off.png`
```
Build Gaming mode to match nova-design-kit/png/gaming-*.png (HTML in screens/gaming-*.html), following DESIGN_SYSTEM.md → "Gaming mode". Super+G toggles it; it can also start by itself when a game goes full screen (setting, on by default).
What turning it ON does (each one is a toggle in Settings → Gaming mode, all on by default):
1. Animations off: hyprctl keyword animations:enabled 0, decoration:blur:enabled 0, transparency off. NOVA's own panels skip their motion too.
2. Background apps paused: freeze every user app except the game, the shell, audio (PipeWire), and the "Keep running" list (Voice chat and Music by default, user can add more). Freeze, don't kill: use the systemd user scopes / cgroup freezer (systemctl --user freeze <app scope>) so apps resume exactly where they were. Never touch system services. Count the paused apps and the RAM they hold for the "on" card.
3. Updates, Guard scans and file indexing paused: pause their systemd timers/services and resume them on exit.
4. Focus lock: the game goes full screen and Hyprland switches to a "gaming" submap where every NOVA shortcut is disabled except Super+G; workspace switching, the launcher, Alt+Tab and other windows are blocked. Any blocked attempt shows the "Focus lock is on · Press Super G to leave [GAME]" pill (gaming-locked.png) for 2s.
5. Idle things stopped: systemd-inhibit idle+sleep, hypridle/screensaver/screen dimming off, wallpaper and Buddy idle effects off.
6. Notifications held: Do Not Disturb on, but Shield alerts still show. Everything held is shown when you exit.
7. Performance mode: powerprofilesctl set performance (or gamemoded), restored on exit.
Shield and the firewall NEVER pause in Gaming mode.
Screens:
- gaming-on: a 560px glass card over the game for 2.5s that lists what was done with real numbers (apps paused, GB freed), then fades out (400ms). Its own appearance does not animate in, since animations are now off: it just appears.
- gaming-locked: the focus-lock pill (top centre) and the optional FPS/CPU/GPU/RAM pill (top right, off by default, Settings → Overlay).
- gaming-settings: Settings → Gaming mode page with the 7 toggles, the Keep running chips, Start automatically, Overlay, and the green "Shield never pauses" note.
- gaming-off: back on the desktop, a card under the top bar: "Gaming mode off · You played [GAME] for [TIME]", apps resumed, updates ready (Install), notifications held (Show). It leaves after 6s.
Safety: if the game closes or crashes, Gaming mode turns off by itself and everything resumes. Super+G must always work, even if the game hangs. If NOVA restarts while Gaming mode is on, everything is resumed at login.
Wire it to: [Hyprland IPC, systemd --user, powerprofilesctl or gamemode, our notification daemon, our Shield service].
```

---

## Install experience

### Installer + boot screens — `png/install-*.png`, `png/boot-*.png` (overview: `png/_install-overview.png`)
```
Build NOVA's install experience to match nova-design-kit/png/install-*.png and png/boot-*.png (HTML in screens/), following DESIGN_SYSTEM.md → "Installer and boot". It uses the same window, step rail and controls as the setup wizard, so USB → install → first boot → setup feels like one product.
Order: boot-splash (USB) → install-try → install-checks → install-disk → install-encrypt → install-confirm → install-progress → install-done (or install-error) → restart → boot-unlock → boot-splash → the setup wizard.
Stack (Arch): build the live ISO with archiso. Use Calamares for the install logic (partitioning with KPMcore incl. NTFS resize, LUKS2, users later in the setup wizard, bootloader), but replace its look: a custom branding + QML pages (Calamares supports QML view modules) that match the mockups exactly. If a page can't be matched in Calamares, tell me before you write a custom one.
Screens:
- boot-splash: Plymouth theme. Pure black, the NOVA star (132px) centred, a 160×3 progress line 70px below that only appears if boot takes over 3s. No text, no logos of hardware makers. Same theme on the USB and on every boot.
- install-try: live session, full screen. Two cards: "Try NOVA" (dark glass) and "Install NOVA" (white, primary). A language pill under them. The live top bar always says "Running from USB · nothing is saved". The desktop has an "Install NOVA" icon to come back later.
- install-checks: space (≥40 GB), memory (≥4 GB), power (warning if on battery, not a blocker), internet (optional), Secure Boot. Plus the friendly beta note (soft language: "We suggest backing up…", "please install at your own risk") and the terms link. Only space is a hard blocker.
- install-disk: if Windows (or another OS) is found: "Install next to Windows" (recommended, preselected) with the draggable split bar (Windows part shows its used space, the handle can't go below used space + 20 GB; NOVA minimum 40 GB), "Erase the disk and install NOVA", "Manual". With no other OS: only Erase (preselected) and Manual. With several disks: a disk picker above the options.
- install-encrypt: "Encrypt the disk" ON by default (LUKS2). Password + strength bar + confirm. Generate a recovery key (6 groups of 4, no look-alike characters), add it as a second LUKS keyslot, offer Save to USB and a QR code, and require "I saved it somewhere safe" before Continue.
- install-confirm: plain-language list of exactly what will happen (shrink, new space, encryption, boot menu) and the disk bar after install. If Erase was chosen, the first row is red: "Everything on [DISK] will be deleted: Windows and all files", and the button becomes red "Erase and install" and needs the user to type the disk's name. Nothing touches the disk before this button.
- install-progress: one progress bar with the current step, time left, "Show details" (live log), and a slideshow (5 slides, 8s each, cross-fade 400ms) about NOVA features. The user can keep using the live session.
- install-done: green check, "NOVA is installed ✦", remove-the-USB note, Keep trying / Restart now.
- install-error: never a raw error. Orange icon, one sentence on what happened, a green line saying what is safe ("Nothing on your disk was changed" — only if true), numbered fix steps, Save the log to USB, Go back, Try again. Write friendly messages for the common cases: Windows Fast Startup / hibernation (NTFS "unclean" or hiberfile → the screen shown), BitLocker on the Windows partition (can't resize: suggest suspending BitLocker), not enough free space, disk read errors, no internet when it was needed.
- boot-unlock: the Plymouth password prompt for the encrypted disk (sd-encrypt hook): star, "Enter your disk password", round field, keyboard layout. Esc switches to "Enter your recovery key". Wrong password: the field turns red for 1s and clears.
Bootloader: GRUB with os-prober so Windows shows up; NOVA is the default after 5s; theme the menu black with the NOVA star and Geist.
Secure Boot: if NOVA isn't signed yet (shim/sbctl), the check must say so honestly ("Turn off Secure Boot in your BIOS to install the beta") instead of "On". Don't fake it.
Safety: nothing is written until Confirm; if the install fails before partitioning, say so; after it, say exactly what state the disk is in.
No shadows and no grey edges. Match the screenshots closely.
```

## Breather (break app) — `png/breather-app.png`, `breather-warning.png`, `breather-lock.png`, `breather-back.png`, `breather-logo.png`

```
Build Breather, a NOVA app that locks the screen for a short break so the user gets up and moves. Match the screenshots in png/breather-*.png and the logo in assets/breather-icon.svg. Accent mint #3fdcaa (gradient #8ff5d2 → #22b8cf).
Build it as a Quickshell module: a settings window plus a full-screen overlay layer (wlr-layer-shell, exclusive keyboard focus) on every monitor during the break.
Settings saved in ~/.config/nova/breather.json: enabled, work minutes (25/50/90), break minutes (2/5/10), warn 1 min before, skips per day (0 = strict), wait-for list (Gaming mode, apps using the camera or microphone, full-screen video).
Timer: counts active time only (reset if the user is idle 5+ min, via hypridle). Don't start a break while Gaming mode is on or a wait-for item is active; start right after it ends.
Warning: a notification-style card 60 s before, with Start now and 5 more minutes (snooze once per break).
Break screen: countdown ring, "Go move.", one rotating tip (eyes, stretch, water, walk). Skip shows only if skips are left. Holding Esc for 3 s ALWAYS ends the break (safety). Don't lock the session, just cover the screen: audio and downloads keep going.
After: "Welcome back." with the count of breaks today and the next break time. Stats stay on the device; nothing is sent anywhere.
Also: Super + B opens Breather, and a quick toggle in the Control panel turns it on/off.
No shadows and no grey edges. Match the screenshots closely.
```

## NOVA Store — `png/store-discover.png`, `store-app.png`, `store-installed.png`, `store-firstboot.png`

```
Build NOVA Store to match png/store-*.png. Icon: assets/store-icon.svg. Super + A opens it.
Sources:
1) NOVA apps come from NOVA's own pacman repo ([nova] in /etc/pacman.conf). Packages are signed with the NOVA key, and the repo is plain static files (repo-add) hosted on GitHub Releases or any static host.
2) Other apps come from Flathub via Flatpak.
Use PackageKit or call pacman/flatpak through a small privileged helper (polkit). Never run the whole UI as root.
App info lives in an appstream-style JSON per NOVA app: name, one line, description, icon, screenshots, size, version, licence, and "what it can access" (shown on the app page). Every app shows its source (NOVA or Flathub).
Core apps (Files, Settings, Shield, NOVA Browser, Terminal, Store) are marked "Part of NOVA" and can't be removed.
Updates: check once a day at most and show a count. Nothing installs without the user pressing Update.
Privacy: no account and no analytics. The Store only downloads the package lists and the packages you pick.
Also add a "Pick your apps" step to the setup wizard (png/store-firstboot.png). Skip installs nothing.
No shadows and no grey edges. Match the screenshots closely.
```
