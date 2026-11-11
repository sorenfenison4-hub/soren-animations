# Trim, downscale and measure the new pictures -> public/whisper/char/*.png + src/cast.json (same format as library.json)
import json, glob, os, numpy as np, cv2
from PIL import Image
OUT = '../../public/whisper/char'; os.makedirs(OUT, exist_ok=True)
MAXH = 2200
meas = {}
for f in sorted(glob.glob('raw/*.png')):
    name = os.path.basename(f)[:-4]
    im = Image.open(f).convert('RGBA')
    a = np.array(im)[:, :, 3]
    if name == 'adv_scrub':   # drop the scrap of wall + suds the picture drew on its left edge (our wall is in code)
        cols = np.nonzero((a > 128).any(0))[0]; cut = cols[0] + int(0.045 * im.width)
        arr = np.array(im); arr[:, :cut, 3] = 0; im = Image.fromarray(arr); a = arr[:, :, 3]
    ys, xs = np.nonzero(a > 8); x0, x1, y0, y1 = xs.min() - 12, xs.max() + 13, ys.min() - 12, ys.max() + 13
    im = im.crop((max(0, x0), max(0, y0), min(im.width, x1), min(im.height, y1)))
    s = min(1, MAXH / max(im.size)); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    im.save(f'{OUT}/{name}.png', optimize=True)
    a8 = (np.array(im)[:, :, 3] > 128).astype(np.uint8); h, w = a8.shape
    ff = a8.copy(); cv2.floodFill(ff, np.zeros((h + 2, w + 2), np.uint8), (0, 0), 2)
    solid = np.where(ff == 2, 0, 1).astype(np.uint8)
    top = solid.copy(); top[int(h * (0.62 if name == 'king_shock' else 0.45)):] = 0   # the head is in the upper part
    dt = cv2.distanceTransform(top, cv2.DIST_L2, 5); hy, hx = np.unravel_index(dt.argmax(), dt.shape)
    rows = a8[int(h * 0.965):]; fy, fx = np.nonzero(rows)
    feet = [float(np.median(fx)), float(h - 14)] if len(fx) and name != 'king_shock' else None
    meas[name] = {'w': w, 'h': h, 'head': [int(hx), int(hy), round(float(dt[hy, hx]), 1)], 'feet': feet}
    print(name, meas[name])
json.dump(meas, open('../../src/cast.json', 'w'), indent=1)
# QA: head circle + feet dot on each
from PIL import ImageDraw
cells = []
for n, m in meas.items():
    im = Image.open(f'{OUT}/{n}.png').convert('RGBA'); bg = Image.new('RGBA', im.size, (120, 160, 210, 255)); bg.alpha_composite(im)
    d = ImageDraw.Draw(bg); hx, hy, r = m['head']; d.ellipse([hx - r, hy - r, hx + r, hy + r], outline=(255, 0, 0), width=8)
    if m['feet']: fx, fy = m['feet']; d.ellipse([fx - 20, fy - 20, fx + 20, fy + 20], fill=(255, 0, 0))
    s = 420 / bg.height; cells.append((n, bg.convert('RGB').resize((int(bg.width * s), 420))))
W = sum(c[1].width for c in cells) + 10 * len(cells); sheet = Image.new('RGB', (W, 440), 'white'); x = 0
for n, c in cells: sheet.paste(c, (x, 0)); ImageDraw.Draw(sheet).text((x + 4, 424), n, fill=(0, 0, 0)); x += c.width + 10
sheet.save('qa/measure.png'); print(sheet.size)
