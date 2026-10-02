"""Turns the nova-motion template film.js into the privacy-policy TikTok (run once from this folder)."""
s = open('film.js').read()
head = s[:s.index('// ---------- wallpapers ----------')]
tail = s[s.index('const LINES'):]
a = head.index('const T = {'); b = head.index('// ---------- easing')
head = head[:a] + '''const T = {
  label: 0.3, wall: 0.2, count: 1.2, wallOut: 3.55,   // "Most privacy policies:" over a wall of legal text
  drop: 3.8, nova: 3.85, collect: 4.6, collectOut: 7.3,
  list: 7.6, listOut: 10.9,
  more: 11.2, backup: 11.6, beta: 12.3, moreOut: 14.2,
  end: 14.5, soon: 15.4, site: 15.9,
};

''' + head[b:]
head = head.replace('"New wallpapers?" 18s', '"Privacy policy" 18s')
body = open('scene.js').read()
tail = tail.replace(tail[:tail.index(';') + 1],
    "const LINES = [['Most privacy policies:', T.label], [\"NOVA's privacy policy:\", T.nova], ['We collect', T.collect], ['nothing.', T.collect + 0.3], ['A friendly note:', T.more], ['We suggest', T.backup], ['backing up first.', T.backup + 0.25], ['Coming soon.', T.soon]];")
tail = tail.replace("const isFast = t => t >= T.end && t < T.end + 1.1;", "const isFast = () => false;")
tail = tail.replace("CUTS: CUTS.map(c => c.t), STEPS: WALLS.map((_, i) => sT(i))", "CUTS: [], STEPS: [T.list, T.more]")
tail = tail.replace("await Promise.all(WALLS.map(w => load(w.key, `assets/nova-${w.key}-1080p.png`)));", "await load('star', 'assets/nova-star.png');")
open('film.js', 'w').write(head + body + tail)
print('ok')
