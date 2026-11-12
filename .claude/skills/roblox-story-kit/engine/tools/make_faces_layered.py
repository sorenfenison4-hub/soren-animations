"""Layered face atlases: per character an EYES atlas and a MOUTH atlas (4x4 cells of 512px each),
so any eye shape combines with any mouth, characters blink, and talking flaps only the mouth.
python tools/make_faces_layered.py [out_dir]       -> assets/faces/<name>_eyes.png, <name>_mouth.png
Cell indices are fixed for every character (see EYES / MOUTHS below and rbx/chars.py EXPR)."""
import os, sys
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_faces as F   # drawing primitives (eye, mouth, brow, blood, mustache, sweat, cheeks)

C = F.C
# eye cell specs: (left kind, right kind, extra kwargs)
EYES = [
    ("round", "round", {}),                         # 0 normal
    ("wide", "wide", {"psize": 0.17}),              # 1 shocked (tiny pupils)
    ("half", "half", {}),                           # 2 unimpressed / sleepy
    ("closed", "closed", {}),                       # 3 closed (blink)
    ("happy", "happy", {}),                         # 4 happy ^ ^
    ("squint", "squint", {"look": 1}),              # 5 squint / suspicious
    ("side", "side", {"look": -1}),                 # 6 side-eye left
    ("side", "side", {"look": 1}),                  # 7 side-eye right
    ("spiral", "spiral", {"rings": True}),          # 8 terror (ring pupils + dark rings)
    ("round", "round", {"brows": 28}),              # 9 worried
    ("round", "round", {"brows": -22}),             # 10 angry
    ("wide", "wide", {"brows": 30, "psize": 0.15}), # 11 scared
    ("round", "closed", {}),                        # 12 wink
    ("round", "round", {"pupil": (0, 0.9)}),        # 13 look up
    ("round", "round", {"pupil": (0, -0.9)}),       # 14 look down
    ("round", "round", {"brows": 28, "tears": True}),  # 15 crying
]
MOUTHS = ["flat", "smile", "open_smile", "laugh", "frown", "o", "talk", "talk_wide",
          "grimace", "grimace_wide", "scream", "smirk", "wavy", "yawn", "grin", "ah"]


def draw_eyes(spec_l, spec_r, kw, style):
    im = Image.new("RGBA", (C, C), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    ex, ey, size = style.get("eye_x", 0.2), style.get("eye_y", 0.6), style.get("eye_size", 1.12)
    rings = kw.get("rings", False) or style.get("rings", False)
    for cx, kind, side in ((0.5 - ex, spec_l, 1), (0.5 + ex, spec_r, -1)):
        F.eye(im, d, cx, ey, kind, size, kw.get("pupil", (0, 0)), kw.get("psize", 0.22), rings, side=side, look=kw.get("look"))
    b = kw.get("brows", style.get("brows"))
    if b is not None:
        by = ey + 0.2 * size
        F.brow(d, 0.5 - ex, by, b, 1, w=style.get("brow_w", 10)); F.brow(d, 0.5 + ex, by, b, -1, w=style.get("brow_w", 10))
    if kw.get("tears"):
        for cx in (0.5 - ex, 0.5 + ex):
            F.thick_line(d, [(cx, ey - 0.1), (cx + 0.01, ey - 0.38)], 14 * F.SS, (120, 190, 255, 220))
    if "blood" in style.get("extras", ()):
        F.blood(d, 0.5 - ex, ey)
    if "freckles" in style.get("extras", ()):
        for dx in (-0.06, 0, 0.06):
            for cx in (0.5 - ex, 0.5 + ex):
                F.ell(d, cx + dx, ey - 0.17, 0.008, 0.008, (170, 100, 70, 200))
    if "sweat" in style.get("extras", ()):
        F.sweat(d, 0.5 + ex + 0.15, ey + 0.08)
    return im.resize((512, 512), Image.LANCZOS)


def draw_mouth(kind, style):
    im = Image.new("RGBA", (C, C), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    my, s = style.get("mouth_y", 0.26), style.get("mouth_s", 1.3)
    k = {"talk_wide": "talk", "grin": "open_smile", "ah": "scream"}.get(kind, kind)
    ss = s * (1.35 if kind == "talk_wide" else 0.8 if kind == "ah" else 1.15 if kind == "grin" else 1.0)
    if "mustache" in style.get("extras", ()):
        F.mustache(d, cy=my + 0.12)
    F.mouth(d, k, cy=my, s=ss)
    if "cheeks" in style.get("extras", ()):
        F.cheeks(d)
    return im.resize((512, 512), Image.LANCZOS)


def save_atlas(cells, path):
    A = Image.new("RGBA", (2048, 2048), (0, 0, 0, 0))
    for i, c in enumerate(cells[:16]):
        A.paste(c, ((i % 4) * 512, (i // 4) * 512))
    A.save(path)
    return A


def build(out, name, style):
    eyes = [draw_eyes(l, r, kw, style) for l, r, kw in EYES]
    mouths = [draw_mouth(m, style) for m in MOUTHS]
    a = save_atlas(eyes, os.path.join(out, f"{name}_eyes.png"))
    b = save_atlas(mouths, os.path.join(out, f"{name}_mouth.png"))
    bg = Image.new("RGBA", a.size, (240, 220, 196, 255)); bg.alpha_composite(a); bg.alpha_composite(b)
    bg.convert("RGB").resize((1024, 1024)).save(os.path.join(out, f"_preview_{name}_layers.jpg"))
    print(name)


STYLES = {
    "hero": {},                                                  # Eddie-type lead
    "hero_blood": {"extras": ("blood",), "rings": True},         # injured / reflection version
    "mustache": {"extras": ("mustache",)},                       # teachers, dads, shopkeepers
    "plain": {"eye_size": 0.95},                                 # extras / crowd
    "kid": {"eye_size": 1.2, "extras": ("freckles",)},           # younger sibling
    "villain": {"brows": -18, "brow_w": 13},                     # rivals (always slightly angry)
    "girl": {"eye_size": 1.15, "extras": ("cheeks",)},
}

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "faces")
    os.makedirs(out, exist_ok=True)
    for n, st in STYLES.items():
        build(out, n, st)
