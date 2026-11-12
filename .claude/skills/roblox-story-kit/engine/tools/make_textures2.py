"""Extra prop textures for story videos (Pillow). python tools/make_textures2.py"""
import os, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "tex")
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kit  # noqa: E402
f = lambda n, s: kit.font(n, s)  # Windows font names, with Mac/Linux fallbacks


def chalk_joke():
    im = Image.new("RGB", (1600, 700), (32, 58, 44)); d = ImageDraw.Draw(im)
    d.text((800, 250), "JOKE DAY!", font=f("segoeprb.ttf", 190), fill=(240, 240, 230), anchor="mm")
    d.text((800, 520), "Why was the math book sad?", font=f("segoepr.ttf", 70), fill=(220, 225, 215), anchor="mm")
    im.filter(ImageFilter.GaussianBlur(0.8)).save(os.path.join(OUT, "chalk_joke.png"))


def banner_joke():
    im = Image.new("RGB", (2000, 500), (250, 200, 40)); d = ImageDraw.Draw(im)
    for i in range(0, 2000, 80):
        d.polygon([(i, 0), (i + 40, 0), (i + 20, 40)], fill=(230, 60, 60))
    d.text((1000, 270), "JOKE DAY!", font=f("ariblk.ttf", 260), fill=(40, 60, 160), anchor="mm",
           stroke_width=10, stroke_fill=(255, 255, 255))
    im.save(os.path.join(OUT, "banner_joke.png"))


def tv_show():
    im = Image.new("RGB", (1280, 720), (90, 170, 230)); d = ImageDraw.Draw(im)
    d.rectangle([0, 470, 1280, 720], fill=(110, 200, 90))
    d.ellipse([340, 200, 620, 480], fill=(255, 220, 120)); d.ellipse([660, 220, 920, 480], fill=(255, 170, 180))
    for cx in (440, 520, 750, 830):
        d.ellipse([cx - 22, 290, cx + 22, 334], fill=(30, 30, 30))
    d.arc([400, 330, 560, 430], 10, 170, fill=(30, 30, 30), width=12)
    d.arc([710, 340, 870, 440], 10, 170, fill=(30, 30, 30), width=12)
    d.text((640, 80), "HA HA HA!", font=f("ariblk.ttf", 110), fill=(255, 255, 255), anchor="mm", stroke_width=6, stroke_fill=(0, 0, 0))
    im.save(os.path.join(OUT, "tv_show.png"))


def tablet_cartoon():
    im = Image.new("RGB", (900, 640), (255, 240, 90)); d = ImageDraw.Draw(im)
    d.ellipse([250, 120, 650, 520], fill=(255, 140, 60), outline=(0, 0, 0), width=10)
    for cx in (380, 520):
        d.ellipse([cx - 40, 240, cx + 40, 320], fill=(255, 255, 255), outline=(0, 0, 0), width=8)
        d.ellipse([cx - 14, 270, cx + 14, 298], fill=(0, 0, 0))
    d.chord([340, 330, 560, 470], 0, 180, fill=(120, 20, 30), outline=(0, 0, 0), width=8)
    d.text((450, 590), "LOL", font=f("ariblk.ttf", 70), fill=(0, 0, 0), anchor="mm")
    im.save(os.path.join(OUT, "tablet_cartoon.png"))


def wet_floor():
    im = Image.new("RGB", (600, 800), (250, 210, 30)); d = ImageDraw.Draw(im)
    d.polygon([(300, 80), (520, 460), (80, 460)], outline=(0, 0, 0), width=18)
    d.text((300, 340), "!", font=f("ariblk.ttf", 200), fill=(0, 0, 0), anchor="mm")
    d.text((300, 600), "WET", font=f("ariblk.ttf", 120), fill=(0, 0, 0), anchor="mm")
    d.text((300, 720), "FLOOR", font=f("ariblk.ttf", 100), fill=(0, 0, 0), anchor="mm")
    im.save(os.path.join(OUT, "wet_floor.png"))


def club_sign():
    im = Image.new("RGB", (1400, 400), (20, 10, 30)); d = ImageDraw.Draw(im)
    d.text((700, 200), "COMEDY CLUB", font=f("ariblk.ttf", 170), fill=(255, 60, 160), anchor="mm")
    glow = im.filter(ImageFilter.GaussianBlur(12)); im = Image.blend(im, glow, 0.4)
    ImageDraw.Draw(im).text((700, 200), "COMEDY CLUB", font=f("ariblk.ttf", 170), fill=(255, 150, 210), anchor="mm")
    im.save(os.path.join(OUT, "club_sign.png"))


def space():
    rnd = random.Random(3)
    im = Image.new("RGB", (2048, 2048), (5, 8, 25)); d = ImageDraw.Draw(im)
    for _ in range(900):
        x, y, r = rnd.randrange(2048), rnd.randrange(2048), rnd.choice([1, 1, 1, 2, 2, 3])
        c = rnd.randrange(170, 256); d.ellipse([x - r, y - r, x + r, y + r], fill=(c, c, 255))
    im.save(os.path.join(OUT, "space_stars.png"))


def chalk_cat():
    im = Image.new("RGB", (1600, 700), (32, 58, 44)); d = ImageDraw.Draw(im)
    d.text((800, 230), "CLASS PET DAY!", font=f("segoeprb.ttf", 150), fill=(240, 240, 230), anchor="mm")
    d.ellipse([650, 380, 950, 640], outline=(235, 235, 225), width=8)
    d.polygon([(680, 420), (700, 330), (760, 395)], outline=(235, 235, 225), width=8)
    d.polygon([(920, 420), (900, 330), (840, 395)], outline=(235, 235, 225), width=8)
    for cx in (745, 855):
        d.ellipse([cx - 14, 480, cx + 14, 508], fill=(235, 235, 225))
    d.text((800, 575), "w", font=f("segoepr.ttf", 60), fill=(235, 235, 225), anchor="mm")
    d.text((1250, 520), "No sneezing!", font=f("segoepr.ttf", 64), fill=(255, 200, 200), anchor="mm")
    im.filter(ImageFilter.GaussianBlur(0.8)).save(os.path.join(OUT, "chalk_cat.png"))


def wanted_pepper():
    im = Image.new("RGB", (800, 440), (236, 220, 180)); d = ImageDraw.Draw(im)
    d.rectangle([10, 10, 790, 430], outline=(90, 60, 30), width=10)
    d.text((400, 80), "WANTED", font=f("ariblk.ttf", 110), fill=(120, 30, 20), anchor="mm")
    d.rounded_rectangle([340, 170, 460, 380], 20, fill=(60, 50, 45))
    d.ellipse([330, 140, 470, 210], fill=(190, 195, 200))
    d.text((620, 280), "PEPPER", font=f("ariblk.ttf", 60), fill=(40, 30, 20), anchor="mm")
    d.text((180, 280), "$1000", font=f("ariblk.ttf", 56), fill=(40, 30, 20), anchor="mm")
    im.save(os.path.join(OUT, "wanted_pepper.png"))


def failed():
    im = Image.new("RGB", (700, 900), (250, 250, 246)); d = ImageDraw.Draw(im)
    d.text((350, 90), "DRIVING TEST", font=f("ariblk.ttf", 64), fill=(30, 30, 30), anchor="mm")
    for i in range(6):
        d.line([(80, 200 + i * 70), (620, 200 + i * 70)], fill=(170, 170, 170), width=4)
    d.text((350, 640), "FAILED", font=f("ariblk.ttf", 150), fill=(215, 30, 30), anchor="mm")
    d.rectangle([40, 540, 660, 740], outline=(215, 30, 30), width=12)
    im.save(os.path.join(OUT, "failed.png"))


if __name__ == "__main__":
    for fn in (chalk_joke, banner_joke, tv_show, tablet_cartoon, wet_floor, club_sign, space, chalk_cat, wanted_pepper, failed):
        fn()
    print("ok")
