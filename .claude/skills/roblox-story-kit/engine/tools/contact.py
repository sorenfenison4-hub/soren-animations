"""Contact sheet of preview stills: python tools/contact.py <slug> [ids e.g. 1-20] [cols] [out name]"""
import glob, os, re, sys
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kit  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
slug = sys.argv[1]
sel = sys.argv[2] if len(sys.argv) > 2 else "all"
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 8
name = sys.argv[4] if len(sys.argv) > 4 else "sheet"
d = os.path.join(ROOT, "videos", slug, "preview")
files = sorted(glob.glob(os.path.join(d, "shot_*.png")))
ids = None
if sel != "all":
    ids = set()
    for part in sel.split(","):
        if "-" in part:
            a, b = part.split("-"); ids |= set(range(int(a), int(b) + 1))
        else:
            ids.add(int(part))
files = [f for f in files if ids is None or int(re.findall(r"\d+", os.path.basename(f))[0]) in ids]
W, H = 216, 384
rows = -(-len(files) // cols)
sheet = Image.new("RGB", (cols * W, rows * (H + 22)), (20, 20, 24))
dr = ImageDraw.Draw(sheet)
font = kit.font("arialbd.ttf", 16)
for k, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((W, H))
    x, y = (k % cols) * W, (k // cols) * (H + 22)
    sheet.paste(im, (x, y + 22))
    dr.text((x + 6, y + 2), os.path.basename(f)[5:-4], fill=(255, 220, 80), font=font)
out = os.path.join(ROOT, "videos", slug, f"{name}.jpg")
sheet.save(out, quality=88)
print(out)
