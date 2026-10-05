# NOVA redesign: community round 1

Changes asked for on the Discord, plus fixes from the first real build. Do them in this order, one at a time, and show a screenshot after each.

Keep everything in the design system: tokens.json for colours, sizes and durations, Geist for text, no shadows and no grey edges.

## 1. Clean up the top bar (from the first build)

- **One tray, in the top bar only.** Remove the second pill in the bottom-right corner. The top-right tray holds: Wi-Fi, Bluetooth, volume, battery (if there is one), keyboard layout, then the Control panel button. App tray icons (Spotify, Brave…) sit to the left of those, in the same pill.
- **Workspaces as dots.** Top-left: one small dot per workspace. The active one is a wider pill. Click a dot to switch. Match `png/shell-desktop.png`.
- **Nothing floats above the dock.** No widgets or name labels on the desktop by default.

## 2. Control panel redesign (Discord: "the widgets look average")

The panel opened most often should feel special, not like a settings page. Keep the same features (sound + output, Wi-Fi, Bluetooth, Night Mode + brightness, Do Not Disturb, USB drives, shortcuts) but:

- **Top row of big round toggles** (Wi-Fi, Bluetooth, Do Not Disturb, Night Mode, Gaming mode). Tap = on/off. Long-press or the small arrow = details.
- **Two wide sliders** below: volume and brightness, thick (44 px), with the icon inside the track and the value on the right.
- **Now playing** card when media is playing: cover art, title, artist, play/pause/next.
- **Output device** as a compact chip under the volume slider ("LG UltraGear ▾") that opens a small list, instead of a full list always open.
- **USB drives** only appear when one is plugged in.
- **Bottom row**: screenshot, lock, power, and the settings gear.
- One glass card, 380 px wide, 22 px radius, 14 px gaps. It opens from the Control button with a 250 ms slide + fade.

## 3. Info buttons everywhere (Discord: "a little info button that explains each option")

- Every toggle row in **Shield** and **Settings** gets a small ⓘ button at the end of the title line.
- Clicking it opens a popover (max 320 px wide) with:
  - **What it does** in one plain sentence.
  - **Why you'd want it.**
  - **Anything it might break** (if anything), e.g. "Some apps that need your location won't get it."
- No jargon. Write as if for someone who has never used Linux. Store the texts in one file (e.g. `info.json`) so they're easy to edit.
- Examples:
  - **Private DNS:** "Hides which websites you visit from your internet provider. Nothing to set up."
  - **VPN kill switch:** "If your VPN drops, the internet stops instead of leaking your real address. Only matters if you use a VPN."
  - **Tor per app:** "Sends the apps you pick through Tor so websites can't see where you are. Those apps get slower."
  - **Boot tamper check:** "Checks on every start that nobody changed NOVA's system files while the PC was off."
  - **Metadata wipe:** "Removes hidden location and camera info from photos when you share them."

## 4. Font picker (Discord + YouTube: "let us change the font")

- Settings → Appearance gets a **Font** card: 5 choices shown as a big "Aa" sample + name: **Geist** (default), **Inter**, **Manrope**, **IBM Plex Sans**, **JetBrains Mono** for monospace lovers.
- A **"Use another font…"** button that lists every installed font with a search box.
- A **Monospace font** picker for the terminal and code (default Geist Mono).
- The change applies live everywhere in the shell and NOVA apps, no restart.
- All fonts must be free (SIL OFL or similar). Use the Arch repo packages where they exist; otherwise ship the font files with NOVA.

## 5. Minimal NOVA Browser new tab (Discord: "the browser could be more minimal")

- Remove the heading, the subtitle and the three stat cards.
- What stays: the NOVA star (small), **one big search bar** in the middle, and up to 6 shortcut icons below it, no labels until hover.
- One quiet line at the bottom: "🛡 1,284 trackers blocked this week". Clicking it opens the Shield details.
- Lots of empty space. The wallpaper (blurred) is the background.

## After all five

Take screenshots of each and put them in `png/` as `redesign-*.png`, so they can be posted on the Discord: "you suggested it, here it is".
