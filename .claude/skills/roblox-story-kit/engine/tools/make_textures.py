"""Prop textures (Pillow): signs, papers, crack, clock digits, posters."""
import math, os, random, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = sys.argv[1] if len(sys.argv) > 1 else "assets/tex"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kit  # noqa: E402


def font(name, size):
    return kit.font(name, size)  # Windows font names, with Mac/Linux fallbacks


def save(im, name):
    im.save(os.path.join(OUT, name))


def lotto():
    W, H = 1200, 640
    im = Image.new("RGB", (W, H), (200, 40, 40)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([18, 18, W - 18, H - 18], 30, fill=(245, 205, 60), outline=(150, 20, 20), width=14)
    for i in range(0, W, 46):  # diagonal stripes
        d.line([(i, 30), (i - 200, H - 30)], fill=(250, 220, 90), width=14)
    d.rounded_rectangle([18, 18, W - 18, H - 18], 30, outline=(150, 20, 20), width=14)
    c = (W // 2, 0)
    d.text((W // 2, 110), "LUCKY 7 LOTTO", font=font("ariblk.ttf", 70), fill=(30, 110, 50), anchor="mm")
    d.text((W // 2, 260), "WINNER!", font=font("ariblk.ttf", 140), fill=(25, 120, 45), anchor="mm",
           stroke_width=6, stroke_fill=(255, 255, 255))
    d.text((W // 2, 470), "$2.00", font=font("ariblk.ttf", 210), fill=(200, 25, 25), anchor="mm",
           stroke_width=8, stroke_fill=(255, 255, 255))
    for x in (90, W - 90):
        for y in (260, 470):
            d.text((x, y), "*", font=font("ariblk.ttf", 90), fill=(255, 255, 255), anchor="mm")
    save(im, "lotto.png")


def aplus():
    W, H = 600, 780
    im = Image.new("RGB", (W, H), (250, 250, 248)); d = ImageDraw.Draw(im)
    for y in range(160, H - 40, 44):
        d.line([(40, y), (W - 40, y)], fill=(170, 200, 235), width=3)
    d.line([(90, 0), (90, H)], fill=(235, 150, 150), width=4)
    d.text((W - 150, 150), "A+", font=font("segoeprb.ttf", 150), fill=(215, 30, 30), anchor="mm")
    d.ellipse([W - 270, 50, W - 30, 260], outline=(215, 30, 30), width=10)
    d.text((60, 60), "MATH TEST", font=font("arialbd.ttf", 48), fill=(40, 40, 60))
    save(im, "aplus.png")


def stop_sign():
    W, H = 1200, 760
    rnd = random.Random(5)
    im = Image.new("RGB", (W, H), (196, 150, 98)); d = ImageDraw.Draw(im)
    for i in range(900):   # cardboard / burnt speckle
        x, y = rnd.randrange(W), rnd.randrange(H); r = rnd.randrange(2, 9)
        c = rnd.choice([(170, 120, 75), (150, 100, 60), (120, 70, 40), (90, 40, 25)])
        d.ellipse([x - r, y - r, x + r, y + r], fill=c)
    im = im.filter(ImageFilter.GaussianBlur(1.5)); d = ImageDraw.Draw(im)
    f = font("Inkfree.ttf", 165)
    d.text((W // 2, 250), "STOP TRYING", font=f, fill=(40, 22, 18), anchor="mm", stroke_width=3, stroke_fill=(40, 22, 18))
    d.text((W // 2, 520), "TO SAVE ME", font=f, fill=(40, 22, 18), anchor="mm", stroke_width=3, stroke_fill=(40, 22, 18))
    for i in range(14):    # burnt edges
        x = rnd.choice([0, W]); y = rnd.randrange(H)
        d.ellipse([x - 60, y - 40, x + 60, y + 40], fill=(70, 40, 25))
    save(im, "stop_sign.png")


def crack():
    W = H = 2048
    rnd = random.Random(11)
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    cx, cy = W * 0.52, H * 0.3
    rings = []
    for k in range(16):
        a = k / 16 * math.tau + rnd.uniform(-0.15, 0.15)
        pts = [(cx, cy)]; x, y = cx, cy
        L = rnd.uniform(700, 1600)
        steps = 9
        for s in range(steps):
            a += rnd.uniform(-0.25, 0.25)
            x += math.cos(a) * L / steps; y += math.sin(a) * L / steps
            pts.append((x, y))
        rings.append(pts)
        d.line(pts, fill=(255, 255, 255, 235), width=rnd.randint(4, 8), joint="curve")
    for r in (0.18, 0.38, 0.62):  # concentric web
        for k in range(16):
            p1 = rings[k][int(r * 9) + 1]; p2 = rings[(k + 1) % 16][int(r * 9) + 1]
            mid = ((p1[0] + p2[0]) / 2 + rnd.uniform(-30, 30), (p1[1] + p2[1]) / 2 + rnd.uniform(-30, 30))
            d.line([p1, mid, p2], fill=(255, 255, 255, 200), width=rnd.randint(3, 6))
    d.ellipse([cx - 40, cy - 40, cx + 40, cy + 40], fill=(255, 255, 255, 180))
    glow = im.filter(ImageFilter.GaussianBlur(6))
    out = Image.alpha_composite(glow, im)
    save(out, "crack.png")


def seven_seg(text_, name):
    W, H = 1400, 560
    im = Image.new("RGB", (W, H), (12, 6, 8)); d = ImageDraw.Draw(im)
    SEG = {"0": "abcfed", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd",
           "6": "afgecd", "7": "abc", "8": "abcdefg", "9": "abcdfg"}
    on, off = (255, 40, 30), (55, 12, 12)
    x = 90
    for ch in text_:
        if ch == ":":
            for yy in (190, 370):
                d.ellipse([x + 10, yy - 22, x + 54, yy + 22], fill=on)
            x += 90; continue
        w, h, t = 230, 440, 44
        segs = {"a": [(x + t, 60), (x + w - t, 60 + t)], "d": [(x + t, 60 + h - t), (x + w - t, 60 + h)],
                "g": [(x + t, 60 + h / 2 - t / 2), (x + w - t, 60 + h / 2 + t / 2)],
                "f": [(x, 60 + t), (x + t, 60 + h / 2 - t / 2)], "b": [(x + w - t, 60 + t), (x + w, 60 + h / 2 - t / 2)],
                "e": [(x, 60 + h / 2 + t / 2), (x + t, 60 + h - t)], "c": [(x + w - t, 60 + h / 2 + t / 2), (x + w, 60 + h - t)]}
        for s, r in segs.items():
            d.rounded_rectangle([r[0][0] + 6 * (s in 'adg'), r[0][1], r[1][0] - 6 * (s in 'adg'), r[1][1]], 14,
                                fill=on if s in SEG[ch] else off)
        x += w + 70
    glow = im.filter(ImageFilter.GaussianBlur(10))
    im = Image.blend(im, glow, 0.35)
    save(im, name)


def banner():
    W, H = 2000, 600
    im = Image.new("RGB", (W, H), (150, 25, 30)); d = ImageDraw.Draw(im)
    d.text((W // 2, 230), "WESTBROOK", font=font("arialbd.ttf", 240), fill=(245, 215, 190), anchor="mm")
    d.text((W // 2, 460), "GO WOLVES!", font=font("arialbd.ttf", 150), fill=(245, 215, 190), anchor="mm")
    save(im, "banner.png")


def school_sign():
    W, H = 2400, 360
    im = Image.new("RGB", (W, H), (40, 55, 140)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 26], fill=(240, 240, 240)); d.rectangle([0, H - 26, W, H], fill=(240, 240, 240))
    d.text((W // 2, H // 2), "WESTBROOK SCHOOL", font=font("ariblk.ttf", 190), fill=(250, 250, 250), anchor="mm")
    save(im, "school_sign.png")


def chalkboard():
    W, H = 1600, 700
    im = Image.new("RGB", (W, H), (30, 52, 40)); d = ImageDraw.Draw(im)
    d.text((60, 60), "FRIDAY", font=font("segoepr.ttf", 90), fill=(225, 230, 220))
    d.text((60, 190), "Math p.42", font=font("segoepr.ttf", 60), fill=(200, 210, 200))
    im = im.filter(ImageFilter.GaussianBlur(0.8))
    save(im, "chalkboard.png")


def poster():
    W = H = 800
    im = Image.new("RGB", (W, H)); d = ImageDraw.Draw(im)
    cols = [(232, 120, 40), (40, 60, 150)]
    for i in range(2):
        for j in range(2):
            d.rectangle([i * W // 2, j * H // 2, (i + 1) * W // 2, (j + 1) * H // 2], fill=cols[(i + j) % 2])
    save(im, "poster.png")


def picture():
    W, H = 900, 640
    im = Image.new("RGB", (W, H), (120, 90, 50)); d = ImageDraw.Draw(im)
    d.rectangle([40, 40, W - 40, H - 40], fill=(205, 160, 90))
    d.polygon([(80, H - 80), (360, 200), (560, H - 80)], fill=(150, 110, 60))
    d.polygon([(380, H - 80), (620, 260), (840, H - 80)], fill=(170, 125, 70))
    save(im, "picture.png")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for fn in (lotto, aplus, stop_sign, crack, banner, school_sign, chalkboard, poster, picture):
        fn()
    seven_seg("11:59", "clock_1159.png")
    seven_seg("12:00", "clock_1200.png")
    print("textures ok")
