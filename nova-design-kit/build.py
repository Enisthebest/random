"""Rebuilds screens/*.html (standalone) and png/*.png from the design canvas sources in ../nova-apps."""
import re, glob, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
BLOB = {'7d31e4e8d17b4505882c1cd7aa30b595': 'wallpaper.png', '7648c8f5b886accd3eaf466089cdf7e4': 'nova-star.png', '13f573a93c0b6cd51fc2774545d5e2ec': 'shield.webp',
        'c455cb22b07e6c9a796fb4cac3710390': 'folder.webp', 'a662e4032fa52bbb496ca34c0de1077a': 'settings.webp', 'a026c59a86a658da97d38f270699cb31': 'monitor.png',
        'c7fc646dda7d88134cc171d0c8865bdc': 'ledger.png', 'd50f3718fdad6fe5e6b541c41940ebe2': 'images.png', '3e13560d2fcf399778de665911adabba': 'fix.png'}
NAMES = {'Main': 'shield', 'Guard': 'guard', 'Files': 'files', 'Monitor': 'monitor', 'Ledger': 'ledger', 'Images': 'images', 'Fix': 'fix', 'Settings': 'settings', 'ACE': 'ace'}
for f in glob.glob(os.path.join(HERE, '..', 'nova-apps', 'project', '*.dc.html')):
    s = open(f).read().replace('<script src="./support.js"></script>\n', '')
    s = re.sub(r'</?x-dc>\n?', '', s); s = re.sub(r'</?helmet>\n?', '', s)
    s = re.sub(r'<script type="text/x-dc".*?</script>\n?', '', s, flags=re.S)
    for k, v in BLOB.items(): s = s.replace('/_blob/' + k, '../assets/' + v)
    open(os.path.join(HERE, 'screens', NAMES[os.path.basename(f)[:-8]] + '.html'), 'w').write(s)
print('screens rebuilt')
