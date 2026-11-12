"""Procedural cartoon face atlases (runs in normal Python with Pillow).
Each atlas = 4x4 grid of 512px cells, transparent background. Cell index = row*4+col.
The face cell maps onto the head front (see rbx/chars.py FACE_W/FACE_H)."""
import math, os, sys
from PIL import Image, ImageDraw

SS = 2            # supersample factor
C = 512 * SS      # cell size while drawing
BLACK = (20, 16, 18, 255); WHITE = (255, 255, 255, 255)
RED = (190, 18, 22, 255); DRED = (120, 8, 12, 255); PINK = (235, 120, 135, 255)
TEETH = (250, 248, 240, 255); MOUTH = (40, 18, 22, 255)


def P(x, y):  # normalized (0..1, y up) -> pixel
    return (x * C, (1 - y) * C)


def ell(d, cx, cy, rx, ry, fill, outline=None, w=0):
    x0, y0 = P(cx - rx, cy + ry); x1, y1 = P(cx + rx, cy - ry)
    if outline is not None and w:
        d.ellipse([x0 - w, y0 - w, x1 + w, y1 + w], fill=outline)
    d.ellipse([x0, y0, x1, y1], fill=fill)


def thick_line(d, pts, w, fill):
    pts = [P(*p) for p in pts]
    d.line(pts, fill=fill, width=int(w), joint="curve")
    r = w / 2
    for (x, y) in (pts[0], pts[-1]):
        d.ellipse([x - r, y - r, x + r, y + r], fill=fill)


def arc_pts(cx, cy, rx, ry, a0, a1, n=24):
    return [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
             cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def poly(d, pts, fill):
    d.polygon([P(*p) for p in pts], fill=fill)


def clear_rect(im, x0, y0, x1, y1):
    """Make a normalized rect transparent (y up coords)."""
    a, b = P(x0, y1); c, e = P(x1, y0)
    ImageDraw.Draw(im).rectangle([a, b, c, e], fill=(0, 0, 0, 0))


# ---------------------------------------------------------------- eyes
def eye(im, d, cx, cy, kind, size=1.0, pupil=(0, 0), psize=0.22, ring=False, side=1, look=None):
    rx, ry = 0.105 * size, 0.125 * size
    W = 11 * SS
    if ring:   # dark terror rings
        ell(d, cx, cy - 0.012, rx * 1.38, ry * 1.32, (70, 45, 45, 80))
        thick_line(d, arc_pts(cx, cy - 0.01, rx * 1.28, ry * 1.25, 200, 340), 4 * SS, (40, 30, 30, 210))
    if kind in ("round", "wide"):
        if kind == "wide":
            rx, ry = rx * 1.12, ry * 1.12
        ell(d, cx, cy, rx, ry, WHITE, BLACK, W)
        pr = rx * psize * (0.8 if kind == "wide" else 1.0)
        ell(d, cx + pupil[0] * rx * 0.55, cy + pupil[1] * ry * 0.55, pr, pr, BLACK)
    elif kind == "dot":
        ell(d, cx, cy, rx * 0.32, ry * 0.4, BLACK)
    elif kind == "half":     # sleepy / unimpressed
        ell(d, cx, cy, rx, ry, WHITE, BLACK, W)
        clear_rect(im, cx - rx - 0.04, cy + ry * 0.05, cx + rx + 0.04, cy + ry + 0.04)
        thick_line(d, [(cx - rx - 0.005, cy + ry * 0.05), (cx + rx + 0.005, cy + ry * 0.05)], W * 1.1, BLACK)
        ell(d, cx + pupil[0] * rx * 0.5, cy - ry * 0.3, rx * 0.2, rx * 0.2, BLACK)
    elif kind == "closed":
        thick_line(d, arc_pts(cx, cy + 0.01, rx, ry * 0.5, 200, 340), W, BLACK)
    elif kind == "happy":    # ^ ^
        thick_line(d, arc_pts(cx, cy - 0.03, rx * 0.9, ry * 0.7, 20, 160), W, BLACK)
    elif kind == "squint":
        thick_line(d, [(cx - rx, cy + 0.015 * side), (cx + rx, cy - 0.015 * side)], W, BLACK)
        thick_line(d, [(cx - rx * 0.9, cy - 0.035), (cx + rx * 0.9, cy - 0.03)], W * 0.6, BLACK)
        ell(d, cx + (look or 0) * rx * 0.5, cy - 0.01, rx * 0.16, rx * 0.16, BLACK)
    elif kind == "side":
        ell(d, cx, cy, rx, ry * 0.75, WHITE, BLACK, W)
        clear_rect(im, cx - rx - 0.04, cy + ry * 0.12, cx + rx + 0.04, cy + ry + 0.04)
        thick_line(d, [(cx - rx, cy + ry * 0.12), (cx + rx, cy + ry * 0.12)], W, BLACK)
        ell(d, cx + (look or 1) * rx * 0.55, cy - ry * 0.25, rx * 0.22, rx * 0.22, BLACK)
    elif kind == "spiral":   # wide with ring pupil (terror)
        ell(d, cx, cy, rx * 1.12, ry * 1.12, WHITE, BLACK, W)
        px, py = cx + pupil[0] * rx * 0.4, cy + pupil[1] * ry * 0.4
        ell(d, px, py, rx * 0.42, rx * 0.42, BLACK)
        ell(d, px, py, rx * 0.30, rx * 0.30, WHITE)
        ell(d, px - rx * 0.05, py + ry * 0.05, rx * 0.1, rx * 0.1, BLACK)


def brow(d, cx, cy, angle, side, w=10):
    # angle >0 : inner end raised (worried) ; <0 : inner end lowered (angry)
    L = 0.09; a = math.radians(angle) * side
    dx, dy = L * math.cos(a), L * math.sin(a)
    thick_line(d, [(cx - dx, cy - dy), (cx + dx, cy + dy)], w * SS, BLACK)


# ---------------------------------------------------------------- mouths
def mouth(d, kind, cx=0.5, cy=0.27, s=1.0):
    W = 9 * SS
    if kind == "smile":
        thick_line(d, arc_pts(cx, cy + 0.05, 0.11 * s, 0.07 * s, 200, 340), W, BLACK)
    elif kind == "smirk":
        thick_line(d, arc_pts(cx + 0.03, cy + 0.04, 0.09 * s, 0.05 * s, 210, 345), W, BLACK)
    elif kind == "flat":
        thick_line(d, [(cx - 0.07 * s, cy), (cx + 0.07 * s, cy)], W, BLACK)
    elif kind == "frown":
        thick_line(d, arc_pts(cx, cy - 0.04, 0.08 * s, 0.045 * s, 20, 160), W, BLACK)
    elif kind in ("open_smile", "laugh"):
        k = 1.25 if kind == "laugh" else 1.0
        pts = arc_pts(cx, cy + 0.04, 0.12 * s * k, 0.12 * s * k, 180, 360)
        poly(d, pts, MOUTH)
        poly(d, arc_pts(cx, cy + 0.04 - 0.12 * s * k * 0.62, 0.06 * s * k, 0.04 * s * k, 0, 180), PINK)
        poly(d, [(cx - 0.115 * s * k, cy + 0.04), (cx + 0.115 * s * k, cy + 0.04),
                 (cx + 0.1 * s * k, cy + 0.008), (cx - 0.1 * s * k, cy + 0.008)], TEETH)
        thick_line(d, pts + [pts[0]], 6 * SS, BLACK)
    elif kind == "o":
        ell(d, cx, cy, 0.045 * s, 0.06 * s, MOUTH, BLACK, 6 * SS)
    elif kind == "talk":
        ell(d, cx, cy, 0.07 * s, 0.045 * s, MOUTH, BLACK, 6 * SS)
        ell(d, cx, cy - 0.02 * s, 0.04 * s, 0.018 * s, PINK)
    elif kind in ("grimace", "grimace_wide"):
        w = (0.14 if kind == "grimace_wide" else 0.11) * s; h = 0.06 * s
        top = [(cx - w, cy + h * 0.2), (cx - w * 0.5, cy + h), (cx, cy + h * 0.75), (cx + w * 0.5, cy + h), (cx + w, cy + h * 0.2)]
        bot = [(cx + w * 0.6, cy - h * 0.9), (cx, cy - h * 0.6), (cx - w * 0.6, cy - h * 0.9)]
        outline = top + bot + [top[0]]
        poly(d, top + bot, MOUTH)
        poly(d, [(cx - w * 0.8, cy + h * 0.45), (cx - w * 0.5, cy + h * 0.85), (cx, cy + h * 0.62),
                 (cx + w * 0.5, cy + h * 0.85), (cx + w * 0.8, cy + h * 0.45), (cx, cy + h * 0.3)], TEETH)
        poly(d, [(cx - w * 0.5, cy - h * 0.6), (cx, cy - h * 0.35), (cx + w * 0.5, cy - h * 0.6), (cx, cy - h * 0.7)], PINK)
        thick_line(d, outline, 6 * SS, BLACK)
    elif kind == "scream":
        pts = arc_pts(cx, cy - 0.01, 0.13 * s, 0.13 * s, 0, 360, 40)
        poly(d, pts, MOUTH)
        poly(d, arc_pts(cx, cy - 0.11 * s, 0.08 * s, 0.05 * s, 0, 180), PINK)
        poly(d, [(cx - 0.1 * s, cy + 0.09 * s), (cx + 0.1 * s, cy + 0.09 * s),
                 (cx + 0.11 * s, cy + 0.05 * s), (cx - 0.11 * s, cy + 0.05 * s)], TEETH)
        thick_line(d, pts, 6 * SS, BLACK)
    elif kind == "yawn":
        pts = arc_pts(cx, cy, 0.09 * s, 0.11 * s, 0, 360, 40)
        poly(d, pts, MOUTH); poly(d, arc_pts(cx, cy - 0.07 * s, 0.06 * s, 0.035 * s, 0, 180), PINK)
        thick_line(d, pts, 6 * SS, BLACK)
    elif kind == "wavy":
        pts = [(cx - 0.09 * s + 0.18 * s * i / 16, cy + 0.012 * math.sin(i * 1.4)) for i in range(17)]
        thick_line(d, pts, W, BLACK)


def mustache(d, cx=0.5, cy=0.38):
    thick_line(d, arc_pts(cx - 0.065, cy - 0.005, 0.07, 0.03, 10, 170), 18 * SS, BLACK)
    thick_line(d, arc_pts(cx + 0.065, cy - 0.005, 0.07, 0.03, 10, 170), 18 * SS, BLACK)


def blood(d, cx, cy):
    thick_line(d, arc_pts(cx, cy, 0.125, 0.145, 0, 360, 40), 7 * SS, RED)
    for (ox, ln, wd) in [(-0.07, 0.30, 16), (-0.02, 0.42, 20), (0.04, 0.26, 14), (0.085, 0.18, 11)]:
        x = cx + ox; y0 = cy - 0.06
        thick_line(d, [(x, y0), (x + 0.004, y0 - ln)], wd * SS, RED)
    ell(d, cx - 0.06, cy + 0.11, 0.05, 0.02, RED)
    thick_line(d, [(cx - 0.13, cy + 0.02), (cx - 0.17, cy - 0.12)], 7 * SS, DRED)


def sweat(d, cx, cy):
    poly(d, [(cx, cy + 0.05), (cx - 0.025, cy - 0.005), (cx + 0.025, cy - 0.005)], (150, 200, 255, 255))
    ell(d, cx, cy - 0.01, 0.026, 0.026, (150, 200, 255, 255))


def cheeks(d):
    ell(d, 0.22, 0.36, 0.06, 0.03, (240, 120, 120, 90)); ell(d, 0.78, 0.36, 0.06, 0.03, (240, 120, 120, 90))


def face(spec):
    im = Image.new("RGBA", (C, C), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    ex, ey = spec.get("eye_x", 0.2), spec.get("eye_y", 0.6)
    size = spec.get("eye_size", 1.0)
    L = spec.get("eyeL", spec.get("eyes", "round")); R = spec.get("eyeR", spec.get("eyes", "round"))
    pu = spec.get("pupil", (0, 0)); ps = spec.get("psize", 0.22); ring = spec.get("rings", False)
    eye(im, d, 0.5 - ex, ey, L, size, pu, ps, ring, side=1, look=spec.get("look"))
    eye(im, d, 0.5 + ex, ey, R, size, pu, ps, ring, side=-1, look=spec.get("look"))
    if spec.get("brows") is not None:
        by = ey + 0.19 * size
        brow(d, 0.5 - ex, by, spec["brows"], 1)
        brow(d, 0.5 + ex, by, spec["brows"], -1)
    ext = spec.get("extras", ())
    if "mustache" in ext:
        mustache(d, cy=spec.get("mouth_y", 0.27) + 0.11)
    mouth(d, spec.get("mouth", "flat"), cy=spec.get("mouth_y", 0.27), s=spec.get("mouth_s", 1.0))
    if "blood" in ext: blood(d, 0.5 - ex, ey)
    if "sweat" in ext: sweat(d, 0.5 + ex + 0.14, ey + 0.08)
    if "cheeks" in ext: cheeks(d)
    return im.resize((512, 512), Image.LANCZOS)


def atlas(out, name, specs):
    A = Image.new("RGBA", (2048, 2048), (0, 0, 0, 0))
    for i, s in enumerate(specs[:16]):
        A.paste(face(s), ((i % 4) * 512, (i // 4) * 512))
    A.save(os.path.join(out, name + ".png"))
    bg = Image.new("RGBA", A.size, (240, 224, 200, 255)); bg.alpha_composite(A)
    bg.convert("RGB").resize((1024, 1024)).save(os.path.join(out, "_preview_" + name + ".jpg"))
    print(name, len(specs))


# ---------------------------------------------------------------- expression sets (index = cell)
EDDIE = [
    dict(eyes="round", mouth="flat"),                                         # 0 neutral
    dict(eyes="wide", mouth="grimace", psize=0.18),                           # 1 shocked
    dict(eyes="wide", mouth="scream", psize=0.16, brows=25),                  # 2 scream
    dict(eyes="round", mouth="frown", brows=28),                              # 3 worried
    dict(eyeL="squint", eyeR="squint", mouth="wavy", brows=-12, look=1),      # 4 skeptical squint
    dict(eyes="round", mouth="open_smile"),                                   # 5 smile
    dict(eyeL="round", eyeR="closed", mouth="smile"),                         # 6 wink
    dict(eyes="half", mouth="flat"),                                          # 7 sleepy/unimpressed
    dict(eyes="closed", mouth="yawn", brows=15),                              # 8 yawn
    dict(eyes="wide", mouth="grimace_wide", psize=0.15, rings=True),          # 9 terror rings
    dict(eyes="round", mouth="talk"),                                         # 10 talk
    dict(eyes="closed", mouth="flat"),                                        # 11 eyes closed
    dict(eyes="side", mouth="frown", look=1),                                 # 12 side-eye
    dict(eyes="spiral", mouth="o", rings=True, brows=30),                     # 13 horrified small mouth
    dict(eyeL="squint", eyeR="round", mouth="grimace", brows=-15, look=0),    # 14 angry-confused
    dict(eyes="wide", mouth="o", psize=0.16, brows=30, extras=("sweat",)),    # 15 scared sweat
]
REFLECT = [
    dict(eyes="spiral", mouth="grimace", rings=True, extras=("blood",)),          # 0 shocked bloody
    dict(eyes="spiral", mouth="scream", rings=True, extras=("blood",)),           # 1 scream
    dict(eyes="spiral", mouth="frown", rings=True, extras=("blood",)),            # 2 stare sad
    dict(eyes="spiral", mouth="talk", rings=True, extras=("blood",)),             # 3 talk
    dict(eyeL="closed", eyeR="squint", mouth="frown", rings=True, extras=("blood",)),  # 4 squeezed
    dict(eyes="spiral", mouth="o", rings=True, extras=("blood",)),                # 5 small o
    dict(eyes="spiral", mouth="grimace_wide", rings=True, extras=("blood",)),     # 6 big grimace
    dict(eyes="spiral", mouth="laugh", rings=True, extras=("blood",)),            # 7 open shout
    dict(eyes="round", mouth="flat"),                                             # 8 normal
    dict(eyes="half", mouth="flat"),                                              # 9 bored normal
]
TEACHER = [
    dict(eyes="half", mouth="frown", extras=("mustache",)),                    # 0 unimpressed
    dict(eyes="side", mouth="frown", look=1, extras=("mustache",)),           # 1 side-eye
    dict(eyes="happy", mouth="laugh", extras=("mustache",)),                   # 2 laughing
    dict(eyes="wide", mouth="open_smile", psize=0.3, extras=("mustache",)),    # 3 excited wide
    dict(eyes="round", mouth="open_smile", extras=("mustache",)),              # 4 happy
    dict(eyeL="squint", eyeR="half", mouth="frown", look=0, brows=-10, extras=("mustache",)),  # 5 suspicious
    dict(eyes="round", mouth="o", extras=("mustache",)),                       # 6 surprised
]
GIRL = [
    dict(eyes="round", mouth="o"),
    dict(eyes="half", mouth="smirk"),
    dict(eyes="happy", mouth="open_smile"),
    dict(eyes="round", mouth="smile"),
]
DAD = [
    dict(eyes="squint", mouth="flat", look=0, eye_size=0.8),
    dict(eyes="wide", mouth="frown", eye_size=0.8, psize=0.3),
    dict(eyes="happy", mouth="smile", eye_size=0.8),
    dict(eyes="round", mouth="flat", eye_size=0.8),
    dict(eyes="half", mouth="smirk", eye_size=0.8),
]
YELLOW = [
    dict(eyes="side", mouth="frown", look=-1, brows=-10),
    dict(eyes="round", mouth="flat"),
    dict(eyes="wide", mouth="smirk", psize=0.25, rings=True),
    dict(eyes="half", mouth="frown"),
    dict(eyes="wide", mouth="talk", psize=0.2),
]
PLAIN = [
    dict(eyes="dot", mouth="smile", eye_size=0.8),
    dict(eyes="dot", mouth="o", eye_size=0.8),
    dict(eyes="round", mouth="frown", eye_size=0.8),
    dict(eyes="round", mouth="open_smile", eye_size=0.8),
]

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "assets/faces"
    os.makedirs(out, exist_ok=True)
    for n, s in [("eddie", EDDIE), ("reflect", REFLECT), ("teacher", TEACHER), ("girl", GIRL),
                 ("dad", DAD), ("yellow", YELLOW), ("plain", PLAIN)]:
        atlas(out, n, s)
