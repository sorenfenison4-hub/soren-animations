# usage: python3 -I frames.py <framedir> <sheet.png> <id|label> ...   public frame0 + maxres1-3 (fallback hq1-3) -> one row per Short
import sys, os, urllib.request, io, time
from PIL import Image, ImageDraw, ImageFont
fd, sheet_path = sys.argv[1], sys.argv[2]; items = [a.split('|', 1) for a in sys.argv[3:]]
os.makedirs(fd, exist_ok=True)
def get(vid, name):
    p = os.path.join(fd, f'{vid}_{name}')
    if not os.path.exists(p):
        try:
            with urllib.request.urlopen(f'https://i.ytimg.com/vi/{vid}/{name}', timeout=20) as r: open(p, 'wb').write(r.read())
        except Exception: return None
        time.sleep(0.3)
    try: return Image.open(p).convert('RGB')
    except Exception: return None
FW, FH = 180, 320
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
except Exception: font = ImageFont.load_default()
rows = []
for vid, label in items:
    fr = []
    f0 = get(vid, 'frame0.jpg')
    fr.append(f0.resize((FW, FH)) if f0 else Image.new('RGB', (FW, FH), 'gray'))
    for n in (1, 2, 3):
        im = get(vid, f'maxres{n}.jpg')
        if im is not None:
            w, h = im.size; vw = h * 9 / 16; im = im.crop((int((w - vw) / 2), 0, int((w + vw) / 2), h))
        else:
            im = get(vid, f'hq{n}.jpg')
            if im is not None:
                w, h = im.size; # 480x360 with the 9:16 video centred, black bars top/bottom ~45px
                vh = h - 90; vw = vh * 9 / 16; im = im.crop((int((w - vw) / 2), 45, int((w + vw) / 2), 45 + vh))
        fr.append(im.resize((FW, FH)) if im is not None else Image.new('RGB', (FW, FH), 'gray'))
    rows.append((label, fr))
W = 4 * (FW + 6) + 330
sheet = Image.new('RGB', (W, len(rows) * (FH + 8)), 'white'); d = ImageDraw.Draw(sheet)
for i, (label, fr) in enumerate(rows):
    y = i * (FH + 8)
    for j, im in enumerate(fr): sheet.paste(im, (j * (FW + 6), y))
    words, line, ly = label.split(), '', y + 10
    for w in words:
        if d.textlength(line + ' ' + w, font=font) > 315: d.text((4 * (FW + 6) + 8, ly), line.strip(), fill='black', font=font); ly += 22; line = w
        else: line += ' ' + w
    d.text((4 * (FW + 6) + 8, ly), line.strip(), fill='black', font=font)
sheet.save(sheet_path); print('saved', sheet_path, sheet.size)
