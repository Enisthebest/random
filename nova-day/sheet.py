import glob, sys
from PIL import Image, ImageDraw
fs = sys.argv[2:] or sorted(glob.glob('out/stills/*.png'), key=lambda f: float(f.split('/t')[-1][:-4]))
S=(480,270); cols=4 if len(fs)>6 else 2; rows=(len(fs)+cols-1)//cols
sh=Image.new('RGB',(cols*S[0], rows*(S[1]+22)),(40,40,40)); d=ImageDraw.Draw(sh)
for i,f in enumerate(fs):
    im=Image.open(f).convert('RGB').resize(S, Image.LANCZOS); x=(i%cols)*S[0]; y=(i//cols)*(S[1]+22)
    sh.paste(im,(x,y+22)); d.text((x+6,y+5),f.split('/')[-1],fill=(230,230,230))
sh.save(sys.argv[1])
