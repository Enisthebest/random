import sys, glob
from PIL import Image, ImageDraw
files = sys.argv[2:]; out = sys.argv[1]
n = len(files); cols = 3; rows = (n + cols - 1) // cols; S = 480
sheet = Image.new('RGB', (cols * S, rows * (S + 30)), (30, 30, 30))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((S, S), Image.LANCZOS)
    x, y = (i % cols) * S, (i // cols) * (S + 30)
    sheet.paste(im, (x, y + 30)); d.text((x + 8, y + 8), f.split('/')[-1], fill=(220, 220, 220))
sheet.save(out)
