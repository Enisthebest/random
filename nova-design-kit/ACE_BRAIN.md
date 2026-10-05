# ACE: making him smarter

ACE gets smarter from **what he can do and know**, not only from a bigger model. A medium model that can open apps, change settings, read your chosen folders and check its own work beats a huge model that can only chat.

Rules that never change: private by default, nothing leaves the PC unless the user turns it on, every action that changes something is a draft the user confirms, and the user can see and erase everything ACE remembers.

## 1. The brain (model)

- Runs locally with **llama.cpp** or **Ollama**. Use open-weight models whose licence allows shipping them (check each licence).
- **Pick the model by hardware**, automatically, on first start:

| PC | Model size | Feel |
|---|---|---|
| 8 GB RAM, no GPU | ~3–4B, 4-bit | basic help, slower |
| 16 GB RAM or 6–8 GB GPU | ~7–8B, 4-bit | good everyday ACE |
| 12 GB+ GPU | ~14B+, 4-bit | smartest local ACE |

- Show the chosen model in Permissions & model, and let the user switch.
- **Two models working together:** a tiny fast one decides what kind of request it is (question, action, file search) in ~100 ms, and the main one does the thinking. ACE feels instant.
- **Later, NOVA servers (opt-in only):** a bigger model on NOVA's own servers for people whose PC is too weak. Off by default. A clear toggle, encrypted, no logs kept, and the request shows a "sent to NOVA server" badge. Never silent.

## 2. Tools (this is what makes ACE useful)

ACE calls tools instead of guessing. Each tool has a name, typed inputs, and a permission level:

| Tool | Example | Permission |
|---|---|---|
| `open_app` | "open Spotify" | runs |
| `search_files` | "find my CV" | chosen folders only |
| `read_file` | "summarise this PDF" | chosen folders only |
| `settings.get / set` | "turn on Night Mode", "make text bigger" | draft → confirm |
| `system_info` | "why is my PC slow?" (CPU, RAM, disk, top apps) | runs |
| `shell` | "update my system" | draft → confirm, shows the exact command |
| `files.move / rename / delete` | "clean my Downloads" | draft → confirm, undo for 30 days |
| `screen` | "what's this error?" | **Allow once** each time |
| `web_search` | "what's new in Hyprland?" | off by default, private search when on |

Flow for anything that changes something: **plan → show the steps as a draft → user presses Run → do it → check it worked → say what changed (with Undo).**

## 3. Knowledge

- **Your files:** a local index (embeddings) of only the folders the user picks. Re-indexed when files change. Answers say which file they came from.
- **NOVA itself:** ACE ships with NOVA's own docs, every setting and shortcut, so "how do I…" questions are always right.
- **Linux help offline:** an offline copy of the Arch Wiki, indexed locally, so fixes come from a real source, not guesses.

## 4. Memory

- Remembers what the user allows ("I study at night", "my editor is Nova Code"), stored locally and encrypted.
- "See what ACE remembers" lists every memory. Each one can be deleted. "Erase everything" wipes it all.
- Chat history auto-deletes after the time the user picks.

## 5. Getting smarter over time (without spying)

- A **test set of 50 real tasks** ("turn on Night Mode", "find my CV", "why is my PC slow", "move screenshots to a folder"…). Every ACE update must pass more of them, never fewer.
- An optional **thumbs up/down** on answers, stored **locally**, used to tune ACE's prompts and tool choices on that PC only. Nothing is uploaded.

## 6. Personality

Follow `ace-identity/ACE_PERSONALITY.md`: short, warm, direct. Never "As an AI…". Buddy's face reacts: thinking, working, happy, oops.

## Build order

1. Runtime + hardware check + model picker (Permissions & model screen).
2. Chat UI matching `png/ace.png`, streaming answers, Buddy expressions.
3. First 5 tools: `open_app`, `system_info`, `search_files`, `settings.get/set`, `shell` (draft → confirm).
4. The test set: run it, fix what fails.
5. File index + NOVA docs + offline Arch Wiki.
6. Memory screen.
7. Screen "Allow once" + launcher ACE card.
8. (Later) opt-in NOVA servers.
