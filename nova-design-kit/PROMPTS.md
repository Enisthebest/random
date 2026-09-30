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
4. nova-design-kit/png/*.png: what each screen must look like. screens/*.html are the same screens as live HTML you can inspect for exact sizes.

Rules:
- Match the screenshots closely: sizes, spacing, radii, font sizes and weights, colours.
- Build shared components first (Window, Sidebar + NavItem, Header, Card, Row, Toggle, Button, Chip, SearchField, Table, ChatBubble, PermissionCard), then build every app from them.
- Fonts: Geist and Geist Mono (SIL OFL). Icons: Lucide, 2px stroke. App icons: nova-design-kit/assets/.
- Motion: one curve, cubic-bezier(.45,0,.15,1). 800ms for moves and shape changes, 400ms for fades and floods. Incoming content fades in during the second half of a move; outgoing content leaves in the first 40%. Windows grow out of their dock icon and shrink back into it. No bounces, springs or glows.
- Everything in [BRACKETS] in the mockups is a placeholder: wire it to real data, never ship the placeholder.
- Don't invent features that aren't in the mockups or in our code. If a mockup shows a control our backend doesn't support yet, build the UI, leave it disabled, and list it for me.
- Accessibility: real buttons, keyboard focus rings, labels on icon-only buttons, text contrast at least 4.5:1.
- Work one app at a time. After each one, show me what changed and a screenshot if you can.

Start by reading the kit and proposing: (a) where the theme constants and shared components will live in our repo, and (b) the order you'll build things in. Wait for my OK before writing code.
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

### ACE (Pro) — `png/ace.png`
```
Build the ACE app (Pro only) to match png/ace.png and screens/ace.html.
Sidebar: New chat, Today (conversation list, selected one highlighted), Settings: Permissions.
Header: conversation title / "ACE runs on your device. It only sees what you allow." with an orange "Pro" chip.
Chat: user bubbles right (#2F7CF6), ACE bubbles left with the star, suggestion chips above the input, 54px round input with a white send button.
Right panel: "What ACE can do" list, and two permission cards: "Sees your screen, only when you ask" and "Runs commands, only with your permission".
Rules: the model runs locally [OUR LOCAL MODEL/RUNTIME]; screen access always shows an "Allow once / Don't allow" prompt; commands and messages are shown as a draft the user confirms before anything runs or sends.
```

---

## Shell

### Top bar, dock and Control panel
```
Restyle the shell to match DESIGN_SYSTEM.md section 7 and the screenshots: floating 36px top-bar pills (workspace, clock, tray, keyboard layout, Control), the centred dock (64px, radius 16, 44px icons on a 60px pitch, accent dot under running apps, icons swell gently as the pointer passes), and the Control panel (Sound with output list, Do Not Disturb, Shortcuts, Network, Night Mode with temperature slider, USB & Drives). The Control pill grows into the panel with the 800ms glide; the cards appear one after another.
```

### Lock screen
```
Build the lock screen: blurred wallpaper (36px) with a 32% black layer, clock 200px/600 in the upper third, date 30px/500 below, "Swipe up to unlock" at the bottom. On unlock the big clock shrinks and slides into the top-bar clock pill while the blur and dark layer fade out (800ms, NOVA curve); locking plays it in reverse.
```

### Notifications
```
Build notification toasts: 382x66, radius 16, top-right under the top bar, app icon in a tinted circle, title 14/600, one line 12/400, "now" top-right. They slide in from the right with the glide. With Do Not Disturb on, an incoming toast folds down into the Do Not Disturb moon icon instead of staying.
```
