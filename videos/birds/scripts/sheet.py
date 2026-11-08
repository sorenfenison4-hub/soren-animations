# python3 work/sheet.py out.png cols cellw times...  (labels each cell with its time)
import sys
from PIL import Image, ImageDraw, ImageFont
out, cols, cw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); times = [float(x) for x in sys.argv[4:]]
ch = cw * 16 // 9
rows = (len(times) + cols - 1) // cols
sheet = Image.new('RGB', (cols * cw, rows * (ch + 26)), 'white'); d = ImageDraw.Draw(sheet)
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
for i, tm in enumerate(times):
    fr = min(1151, round(tm * 60))
    im = Image.open(f'work/stills/f{fr:04d}.png').convert('RGB').resize((cw, ch), Image.LANCZOS)
    x, y = (i % cols) * cw, (i // cols) * (ch + 26)
    sheet.paste(im, (x, y + 26)); d.text((x + 6, y + 3), f'{tm:.2f}s', fill='black', font=font)
sheet.save(out); print(out, sheet.size)
