"""More sets/props: cat, airliner (exterior + cabin), moon, pepper jail, flower shop, parking lot,
seated audience, teleport poof, sneeze acting. Import as W2 (shotkit does)."""
import math, os, random
import bpy
from mathutils import Vector
from . import ASSETS
from .core import (D, F, mat, hexc, box, cyl, sphere, plane, card, empty, text, light, collection, img_mat,
                   noise, set_interp, instance)
from .sets import tiles, planks, checker_mat, wood, set_obj_visible
from . import world as W

TEX = os.path.join(ASSETS, "tex")


# ------------------------------------------------------------------ cat
def cat(name, loc, coll=None, color="#f0a040", rot=0, sit=True, scale=0.6):
    """Chunky orange cat facing -Y. Root at the paws. Returns root (tail/ears wiggle via noise).
    Head pivot is the object named <name>_headpiv."""
    root = empty(name, loc, coll=coll, rot=(0, 0, rot))
    root.scale = (scale,) * 3
    M = mat("cat_" + color, hexc(color), 0.6)
    Mw = mat("cat_white", hexc("#fff4e6"), 0.6)
    Mk = mat("cat_black", hexc("#151515"), 0.3)
    Mp = mat("cat_pink", hexc("#f59bb5"), 0.5)
    if sit:
        box(name + "_body", (0.95, 0.95, 1.05), (0, 0.1, 0.55), M, 0.25, parent=root, coll=coll)
        box(name + "_chest", (0.6, 0.1, 0.6), (0, -0.39, 0.55), Mw, 0.08, parent=root, coll=coll)
    else:
        box(name + "_body", (0.9, 1.6, 0.8), (0, 0.2, 0.6), M, 0.25, parent=root, coll=coll)
    head = empty(name + "_headpiv", (0, -0.2, 1.15 if sit else 1.0), parent=root, coll=coll)
    box(name + "_head", (0.95, 0.8, 0.8), (0, 0, 0.3), M, 0.25, parent=head, coll=coll)
    box(name + "_muzzle", (0.45, 0.12, 0.28), (0, -0.4, 0.18), Mw, 0.06, parent=head, coll=coll)
    sphere(name + "_nose", 0.07, (0, -0.47, 0.3), Mp, (1.2, 0.8, 0.8), parent=head, coll=coll, seg=10)
    for sx in (-1, 1):
        sphere(f"{name}_eye{sx}", 0.09, (sx * 0.2, -0.41, 0.45), Mk, (1, 0.5, 1.3), parent=head, coll=coll, seg=10)
        ear = cyl(f"{name}_ear{sx}", 0.17, 0.32, (sx * 0.3, 0.0, 0.78), M, 4, parent=head, coll=coll, r2=0.01,
                  rot=(0, sx * -12, 45))
        noise(ear, "rotation_euler", 1, 0.15, 6)
        for k in range(2):
            box(f"{name}_wh{sx}{k}", (0.42, 0.015, 0.015), (sx * 0.38, -0.46, 0.2 + k * 0.07), Mw, 0, parent=head,
                coll=coll, rot=(0, sx * (8 - k * 16), 0))
    for sx in (-1, 1):
        box(f"{name}_paw{sx}", (0.26, 0.4, 0.2), (sx * 0.24, -0.35, 0.1), Mw, 0.06, parent=root, coll=coll)
    tail = empty(name + "_tailpiv", (0, 0.55, 0.25), parent=root, coll=coll)
    cyl(name + "_tail", 0.1, 1.2, (0, 0.0, 0.55), M, 10, parent=tail, coll=coll)
    tail.rotation_euler = (math.radians(-35), 0, 0)
    noise(tail, "rotation_euler", 1, 0.5, 8)
    noise(head, "rotation_euler", 2, 0.12, 18)
    return root


# ------------------------------------------------------------------ airliner
def airliner(name, loc, rot=0, coll=None, scale=1.0, label="FLY HIGH"):
    """White airliner, nose toward -Y (rot 0). Length ~34, wingspan ~32 at scale 1. Root at fuselage centre."""
    root = empty(name, loc, coll=coll, rot=(0, 0, rot))
    root.scale = (scale,) * 3
    Mw = mat("plane_white", hexc("#f4f6f8"), 0.3, coat=0.4)
    Mb = mat("plane_blue", hexc("#2f6fd0"), 0.35)
    Mg = mat("plane_grey", hexc("#9aa3ad"), 0.35, metal=0.5)
    Mk = mat("plane_win", hexc("#1a2433"), 0.15)
    R, Lh = 2.6, 26
    cyl(name + "_fus", R, Lh, (0, 0, 0), Mw, 40, parent=root, coll=coll, rot=(90, 0, 0))
    sphere(name + "_nose", R, (0, -Lh / 2, 0), Mw, (1, 1.6, 1), parent=root, coll=coll, seg=32)
    cyl(name + "_tailc", R, 7, (0, Lh / 2 + 3.5, 0.6), Mw, 40, parent=root, coll=coll, rot=(90 - 8, 0, 0), r2=0.7)
    box(name + "_stripe", (2 * R + 0.06, Lh, 0.5), (0, 0, -0.2), Mb, 0.0, parent=root, coll=coll)
    for k in range(18):
        y = -Lh / 2 + 3 + k * 1.25
        for sx in (-1, 1):
            box(f"{name}_w{k}{sx}", (0.1, 0.6, 0.8), (sx * (R - 0.02), y, 0.7), Mk, 0.1, parent=root, coll=coll)
    for sx in (-1, 1):
        box(f"{name}_cw{sx}", (0.5, 1.4, 0.7), (sx * 1.2, -Lh / 2 - 2.6, 0.9), Mk, 0.15, parent=root, coll=coll,
            rot=(30, 0, sx * -25))
        wing = box(f"{name}_wing{sx}", (14, 5.0, 0.5), (sx * 9.0, 1.5, -1.2), Mw, 0.2, parent=root, coll=coll,
                   rot=(0, sx * -5, sx * -18))
        cyl(f"{name}_eng{sx}", 1.0, 3.6, (sx * 6.5, -1.2, -2.4), Mg, 24, parent=root, coll=coll, rot=(90, 0, 0))
        box(f"{name}_hs{sx}", (5.5, 2.4, 0.3), (sx * 3.4, Lh / 2 + 5.5, 1.2), Mw, 0.1, parent=root, coll=coll,
            rot=(0, 0, sx * -15))
    box(name + "_fin", (0.4, 4.0, 5.5), (0, Lh / 2 + 5.2, 4.3), Mb, 0.15, parent=root, coll=coll, rot=(-25, 0, 0))
    for sx in (-1, 1):
        t = text(f"{name}_lbl{sx}", label, (sx * (R + 0.03), -3.0, 1.9), 1.0, Mb, rot=(90, 0, 90 * sx),
                 extrude=0.02, parent=root, coll=coll)
    for k, y in enumerate((-Lh / 2 + 2, 2.0)):
        for sx in ((0,) if k == 0 else (-1, 1)):
            cyl(f"{name}_gear{k}{sx}", 0.55, 0.5, (sx * 2.0, y, -R - 1.0), mat("tire", hexc("#111111"), 0.7), 16,
                parent=root, coll=coll, rot=(0, 90, 0))
            box(f"{name}_strut{k}{sx}", (0.2, 0.2, 1.2), (sx * 2.0, y, -R - 0.35), Mg, 0, parent=root, coll=coll)
    return root


def cabin(rows=10, coll=None):
    """Airliner interior along +Y, aisle at x=0. Seat i,row r root positions in the returned dict."""
    c = coll or collection("CABIN")
    Mw = mat("cab_wall", hexc("#e9ebee"), 0.6)
    cyl("cab_shell", 6.6, 70, (0, 25, 4.0), Mw, 48, coll=c, rot=(90, 0, 0))
    box("cab_floor", (12, 70, 0.4), (0, 25, -0.2), mat("cab_carpet", hexc("#3a4a6a"), 0.9), 0, coll=c)
    box("cab_aisle", (2.0, 70, 0.05), (0, 25, 0.03), mat("cab_aisle", hexc("#c94a3a"), 0.9), 0, coll=c)
    Mseat = mat("cab_seat", hexc("#2f5fb8"), 0.6)
    Mhead = mat("cab_head", hexc("#e8e8e8"), 0.7)
    Mbin = mat("cab_bin", hexc("#f4f4f4"), 0.4)
    Mwin = mat("cab_win", (0.6, 0.82, 1.0), emit=(0.6, 0.82, 1.0), estr=3.0)
    seats = []
    for r in range(rows):
        y = 2 + r * 4.0
        for side in (-1, 1):
            for k in range(3):
                x = side * (2.1 + k * 1.75)
                box(f"cab_s{r}{side}{k}", (1.6, 1.8, 0.6), (x, y, 1.8), Mseat, 0.15, coll=c)
                box(f"cab_b{r}{side}{k}", (1.6, 0.45, 3.2), (x, y + 1.0, 3.2), Mseat, 0.15, coll=c)
                box(f"cab_h{r}{side}{k}", (1.4, 0.5, 0.6), (x, y + 1.0, 4.6), Mhead, 0.1, coll=c)
                seats.append((x, y))
            box(f"cab_win{r}{side}", (0.1, 1.0, 1.3), (side * 6.45, y + 0.4, 5.0), Mwin, 0.2, coll=c,
                rot=(0, side * 12, 0))
        for side in (-1, 1):
            box(f"cab_bin{r}{side}", (3.6, 3.9, 1.6), (side * 4.2, y + 0.5, 8.6), Mbin, 0.2, coll=c, rot=(0, side * -12, 0))
    for i in range(rows):
        card(f"cab_lamp{i}", 1.2, 3.0, (0, 2 + i * 4.0, 10.45), mat("cab_lamp", (1, 1, 1), emit=(1, 0.97, 0.9), estr=4),
             "-Y", coll=c).rotation_euler = (math.radians(180), 0, 0)
    light("cab_key", "AREA", (0, 20, 10), 6000, (1.0, 0.97, 0.92), 4, coll=c, target=(0, 20, 0), size_y=40)
    light("cab_fill", "AREA", (0, -6, 6), 1500, (0.9, 0.95, 1.0), 8, coll=c, target=(0, 20, 3))
    return dict(coll=c, seats=seats)


def seat_root(seat):
    """Root for a passenger sitting in a cabin seat facing -Y (toward the cockpit)."""
    return (seat[0], seat[1] - 0.05, 0.2)


# ------------------------------------------------------------------ outer space / moon
def earth(name="earth", loc=(0, 0, -62), r=52, coll=None):
    m = D.materials.get("earth_mat")
    if m is None:
        m = D.materials.new("earth_mat")
        m.use_nodes = True
        nt = m.node_tree
        b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
        nz = nt.nodes.new("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = 2.2
        nz.inputs["Detail"].default_value = 6
        cr = nt.nodes.new("ShaderNodeValToRGB")
        cr.color_ramp.interpolation = "CONSTANT"
        cr.color_ramp.elements[0].color = (*hexc("#1f5fbf"), 1)
        cr.color_ramp.elements[1].position = 0.55
        cr.color_ramp.elements[1].color = (*hexc("#3f9f45"), 1)
        nt.links.new(nz.outputs["Fac"], cr.inputs[0])
        nt.links.new(cr.outputs[0], b.inputs["Base Color"])
        b.inputs["Roughness"].default_value = 0.6
    sphere(name, r, loc, m, seg=64, coll=coll)
    sphere(name + "_atmo", r * 1.03, loc, mat("atmo", (0.4, 0.7, 1.0), 0.5, emit=(0.4, 0.7, 1.0), estr=0.6, alpha=0.18),
           seg=64, coll=coll)


def moon(coll=None, seed=3):
    """Grey moon ground at z=0 with craters, starfield, Earth hanging in the sky (toward +Y)."""
    c = coll or collection("MOON")
    W.space_world(1.0)
    m = D.materials.new("moon_ground")
    m.use_nodes = True
    nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 0.08
    nz.inputs["Detail"].default_value = 8
    cr = nt.nodes.new("ShaderNodeValToRGB")
    cr.color_ramp.elements[0].color = (*hexc("#6e6e72"), 1)
    cr.color_ramp.elements[1].color = (*hexc("#b8b8bc"), 1)
    nt.links.new(nz.outputs["Fac"], cr.inputs[0])
    nt.links.new(cr.outputs[0], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.95
    box("moon_ground", (600, 600, 0.4), (0, 0, -0.2), m, 0, coll=c)
    rnd = random.Random(seed)
    Mc = mat("moon_crater", hexc("#5a5a5e"), 0.95)
    Mr = mat("moon_rim", hexc("#a4a4a8"), 0.95)
    for i in range(40):
        p = (rnd.uniform(-120, 120), rnd.uniform(-40, 200), 0.0)
        if abs(p[0]) < 14 and -20 < p[1] < 20:
            continue
        r = rnd.uniform(2, 9)
        cyl(f"mc{i}", r, 0.08, (p[0], p[1], 0.03), Mc, 32, coll=c)
        cyl(f"mr{i}", r * 1.12, 0.4, (p[0], p[1], 0.0), Mr, 32, coll=c, r2=r * 1.0)
    earth("moon_earth", (40, 420, 120), 60, coll=c)
    W.sun(6.0, rot=(55, 0, 25), coll=c)
    light("moon_fill", "AREA", (0, -30, 20), 6000, (0.8, 0.85, 1.0), 20, coll=c, target=(0, 0, 3))
    return dict(coll=c)


def astronaut_helmet(ch, color="#ffffff"):
    """Glass bubble helmet on a character (space-suit florist)."""
    h = sphere(ch.name + "_helmet", 1.05, (0, 0, 0.0), mat("helmet_glass", (0.8, 0.9, 1.0), 0.05, alpha=0.22, spec=1.0),
               parent=ch.head, coll=ch.coll, seg=32)
    cyl(ch.name + "_collarring", 0.95, 0.25, (0, 0, -0.75), mat("suit_ring", hexc("#c8ccd2"), 0.3, metal=0.6), 32,
        parent=ch.head, coll=ch.coll)
    box(ch.name + "_pack", (1.6, 0.7, 1.8), (0, 0.85, 1.1), mat("suit_pack", hexc("#d8dce2"), 0.5), 0.15,
        parent=ch.hip, coll=ch.coll)
    return h


# ------------------------------------------------------------------ society-example sets
def pepper_jail(coll=None):
    """Jail cell (camera side open at -Y) with a pepper shaker locked inside."""
    c = coll or collection("JAIL")
    Mw = tiles("jail_wall", "#9a9a96", "#6a6a66", 1.0, 1.6, 0.8, 0.9, c2="#8e8e8a", axis="XZ")
    box("jail_floor", (20, 20, 0.4), (0, 4, -0.2), mat("jail_floor", hexc("#5a5a58"), 0.9), 0, coll=c)
    box("jail_back", (20, 0.5, 12), (0, 7, 6), Mw, 0, coll=c)
    for sx in (-1, 1):
        box(f"jail_side{sx}", (0.5, 12, 12), (sx * 6, 2, 6), Mw, 0, coll=c)
    Mb = mat("jail_bars", hexc("#2a2a2e"), 0.3, metal=0.8)
    for i in range(13):
        cyl(f"jail_bar{i}", 0.12, 10, (-5.4 + i * 0.9, -3.0, 5), Mb, 10, coll=c)
    for z in (0.3, 9.8):
        box(f"jail_rail{z}", (11.5, 0.3, 0.3), (0, -3.0, z), Mb, 0.02, coll=c)
    box("jail_bench", (5, 1.6, 0.4), (-2.5, 5.8, 2.0), wood("wood_bench", "#6e4229", "#a06a45", 2.0), 0.05, coll=c)
    sh = pepper_shaker("pepper", (0.0, 3.0, 0.0), c, 1.6)
    card("jail_sign", 4.0, 2.2, (2.5, 6.7, 7.5), img_mat("wanted", os.path.join(TEX, "wanted_pepper.png"), 0.5), "-Y", coll=c)
    light("jail_lamp", "SPOT", (0, -2, 11), 9000, (1.0, 0.9, 0.7), 0.3, coll=c, spot=60, target=(0, 3, 0))
    light("jail_fill", "AREA", (0, -10, 6), 3000, (0.7, 0.8, 1.0), 8, coll=c, target=(0, 3, 3))
    return dict(coll=c, shaker=sh)


def pepper_shaker(name, loc, coll=None, s=1.0):
    root = empty(name, loc, coll=coll)
    root.scale = (s,) * 3
    cyl(name + "_glass", 0.55, 1.6, (0, 0, 0.8), mat("pep_glass", (0.85, 0.9, 0.95), 0.05, alpha=0.35, spec=1.0), 24,
        parent=root, coll=coll)
    cyl(name + "_pep", 0.5, 1.0, (0, 0, 0.55), mat("pep_black", hexc("#1e1b18"), 0.9), 24, parent=root, coll=coll)
    sphere(name + "_cap", 0.56, (0, 0, 1.6), mat("pep_metal", hexc("#c8ccd2"), 0.2, metal=1.0), (1, 1, 0.6),
           parent=root, coll=coll, seg=20)
    for sx in (-1, 1):
        sphere(f"{name}_eye{sx}", 0.09, (sx * 0.2, -0.55, 1.1), mat("pep_eye", hexc("#ffffff"), 0.3),
               parent=root, coll=coll, seg=10)
    return root


def flower_shop(coll=None):
    c = coll or collection("FLOWERS")
    box("fs_floor", (24, 24, 0.4), (0, 4, -0.2), planks("fs_floor", "#d8c0a0", "#ccb090", "#8a6a4a"), 0, coll=c)
    box("fs_back", (24, 0.5, 14), (0, 9, 7), mat("fs_wall", hexc("#f2d9e6"), 0.85), 0, coll=c)
    box("fs_counter", (10, 2.4, 3.6), (0, 4.5, 1.8), wood("wood_coffee", "#a0703f", "#c89260", 2.0), 0.08, coll=c)
    cols = ["#e8574a", "#f2c14e", "#f09ac2", "#9b6ad6", "#ffffff", "#ff9a3c"]
    rnd = random.Random(4)
    for b_ in range(7):
        bx, by = -9 + b_ * 3.0, 7.0
        cyl(f"fs_bucket{b_}", 0.8, 1.6, (bx, by, 0.8), mat("fs_bucket", hexc("#7a8a96"), 0.3, metal=0.6), 20, coll=c)
        for k in range(7):
            x, y = bx + rnd.uniform(-0.6, 0.6), by + rnd.uniform(-0.5, 0.5)
            h = rnd.uniform(2.2, 3.4)
            cyl(f"fs_stem{b_}{k}", 0.05, h, (x, y, h / 2 + 0.6), mat("leaf", hexc("#5fae4a"), 0.5), 6, coll=c)
            col = cols[(b_ + k) % len(cols)]
            sphere(f"fs_fl{b_}{k}", 0.38, (x, y, h + 0.7), mat("fl" + col, hexc(col), 0.5), (1, 1, 0.7), coll=c, seg=12)
    # pollen in the air
    Mp = mat("pollen", hexc("#ffe066"), 0.4, emit=hexc("#ffe066"), estr=2.0)
    for i in range(70):
        s = sphere(f"pollen{i}", 0.05, (rnd.uniform(-8, 8), rnd.uniform(-4, 8), rnd.uniform(1, 9)), Mp, seg=6, coll=c)
        for ax in range(3):
            noise(s, "location", ax, 0.6, 30)
    light("fs_key", "AREA", (0, -6, 12), 2800, (1.0, 0.95, 0.9), 12, coll=c, target=(0, 4, 2))
    light("fs_fill", "AREA", (-8, -2, 6), 700, (1.0, 0.9, 0.95), 6, coll=c, target=(0, 4, 3))
    return dict(coll=c)


def parking_lot(center=(-30, -18), coll=None):
    """Painted parking bays on the lawn west of the school, a few parked cars."""
    c = coll or collection("PARKING")
    cx, cy = center
    box("pk_asphalt", (44, 26, 0.08), (cx, cy, 0.05), mat("asphalt_day", hexc("#55565e"), 0.8), 0, coll=c)
    Ml = mat("road_line", hexc("#f2f2f2"), 0.6)
    for row in (-1, 1):
        for i in range(12):
            box(f"pk_l{row}{i}", (0.25, 7, 0.02), (cx - 20 + i * 3.6, cy + row * 8, 0.1), Ml, 0, coll=c)
    rnd = random.Random(2)
    for i, x in enumerate((-18.2, -14.6, 14.2, 17.8)):
        W.car(f"pk_car{i}", (cx + x, cy + (8 if i % 2 else -8), 0), ["#d9453a", "#3f7fd9", "#f2c14e", "#63c06a"][i],
              coll=c, rot=0)
    return dict(coll=c, center=(cx, cy))


def seated_audience(t0, t1, rows=4, cols=7, origin=(0, -6), spacing=(2.6, 3.2), mode="stare", seed=0):
    """Rows of chairs with instanced seated people facing +Y (the stage). One source per variant."""
    from . import chars
    rnd = random.Random(seed)
    srcs = []
    for j in range(3):
        src = D.collections.new(f"AUD_SRC{mode}{j}")
        k = chars.kid(300 + seed * 5 + j, coll=src)
        k.pose(t0, loc=(0, 0, 0.25), rot=180, legL=(85, 3), legR=(85, -3), armL=(10, 6), armR=(10, 6))
        k.blink(t0, t1)
        if mode == "stare":
            k.face(t0, "shock" if j % 2 else "gasp")
        else:
            k.face(t0, "joy")
            k.talk(t0, t1, open_m="laugh", wide_m="open_smile", rest="laugh", syll=0.12)
        srcs.append(src)
    Mc = mat("aud_chair", hexc("#7a1f2a"), 0.6)
    obs = []
    for r in range(rows):
        for q in range(cols):
            x = origin[0] + (q - (cols - 1) / 2) * spacing[0]
            y = origin[1] - r * spacing[1]
            box(f"aud_seat{r}{q}", (1.8, 1.6, 0.3), (x, y, 2.05), Mc, 0.06)
            box(f"aud_back{r}{q}", (1.8, 0.25, 1.8), (x, y - 0.9, 3.0), Mc, 0.06)
            ob = instance(f"aud{r}{q}", srcs[rnd.randrange(3)], (x, y, 0), rot=(0, 0, rnd.uniform(-12, 12)))
            obs.append(ob)
    return srcs, obs


# ------------------------------------------------------------------ effects + acting
def poof(name, loc, t, s=1.0, coll=None, n=7, seed=0):
    """Teleport poof: white puffs bloom and fade, sparkles fly out."""
    rnd = random.Random(seed)
    Mp = mat("poof_white", (0.97, 0.97, 1.0), 0.9, emit=(0.8, 0.85, 1.0), estr=1.2)
    Ms = mat("poof_spark", hexc("#fff4a0"), 0.3, emit=hexc("#fff4a0"), estr=8.0)
    for i in range(n):
        off = Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1), rnd.uniform(-0.6, 1.2))) * 1.0 * s
        p = Vector(loc) + off
        ob = sphere(f"{name}_p{i}", 0.7 * s, tuple(p), Mp, coll=coll, seg=16)
        ob.scale = (0.01,) * 3
        ob.keyframe_insert("scale", frame=F(t - 0.04))
        ob.scale = (1.2 * rnd.uniform(0.8, 1.2),) * 3
        ob.keyframe_insert("scale", frame=F(t + 0.12))
        ob.keyframe_insert("location", frame=F(t + 0.12))
        ob.location = tuple(p + off * 0.5 + Vector((0, 0, 0.6 * s)))
        ob.scale = (0.01,) * 3
        ob.keyframe_insert("scale", frame=F(t + 0.5))
        ob.keyframe_insert("location", frame=F(t + 0.5))
    for i in range(10):
        a = i / 10 * math.tau
        st = sphere(f"{name}_s{i}", 0.12 * s, tuple(loc), Ms, coll=coll, seg=8)
        st.scale = (0.01,) * 3
        st.keyframe_insert("scale", frame=F(t - 0.02))
        st.keyframe_insert("location", frame=F(t - 0.02))
        st.scale = (1, 1, 1)
        st.keyframe_insert("scale", frame=F(t + 0.04))
        st.location = tuple(Vector(loc) + Vector((math.cos(a) * 3.2, rnd.uniform(-1, 1), math.sin(a) * 3.2 + 1)) * s)
        st.scale = (0.01,) * 3
        st.keyframe_insert("location", frame=F(t + 0.4))
        st.keyframe_insert("scale", frame=F(t + 0.4))
    lt = light(f"{name}_flash", "POINT", tuple(Vector(loc) + Vector((0, -1.5, 1))), 0, (0.85, 0.9, 1.0), 2.0, coll=coll)
    lt.data.keyframe_insert("energy", frame=F(t - 0.03))
    lt.data.energy = 8000 * s
    lt.data.keyframe_insert("energy", frame=F(t + 0.02))
    lt.data.energy = 0
    lt.data.keyframe_insert("energy", frame=F(t + 0.3))


def vanish(ch, t, extra=()):
    """Character (and attached props) disappear at t."""
    ch.set_visible(t - 1.0 / 30, True)     # a full frame earlier, so the two keys never share a frame
    ch.set_visible(t, False)
    for ob in extra:
        set_obj_visible(ob, t - 1.0 / 30, True)
        set_obj_visible(ob, t, False)


def appear(ch, t, t0=None, extra=()):
    """Character pops into existence at t (hidden before), with a squash-and-stretch on the root scale."""
    s = ch.root.scale[0]
    if t0 is not None and t0 < t:
        ch.set_visible(t0, False)
        for ob in extra:
            set_obj_visible(ob, t0, False)
    ch.set_visible(t, True)
    for ob in extra:
        set_obj_visible(ob, t, True)
    r = ch.root
    for dt, k in ((-0.02, 0.2), (0.08, 1.18), (0.18, 0.94), (0.26, 1.0)):
        r.scale = (s * k,) * 3
        r.keyframe_insert("scale", frame=F(t + dt))
    r.scale = (s,) * 3


def sneeze(ch, t_ah, t_choo, mist=True, coll=None):
    """Wind-up (head back, eyes squeeze, mouth open) then a violent forward CHOO."""
    ch.pose(t_ah, head=(0, -24, 0), torso=(0, -10, 0), armL=(30, 25), armR=(30, 25))
    ch.face(t_ah, eyes="half", mouth="ah")
    mid = t_ah + (t_choo - t_ah) * 0.55
    ch.pose(mid, head=(0, -32, 4), torso=(0, -14, 0))
    ch.face(mid, eyes="closed", mouth="o")
    ch.pose(t_choo - 0.03, head=(0, -34, 0), torso=(0, -15, 0))
    ch.pose(t_choo + 0.06, head=(0, 34, 0), torso=(0, 24, 0), armL=(70, 20), armR=(70, 20))
    ch.face(t_choo, eyes="closed", mouth="scream")
    ch.pose(t_choo + 0.22, head=(0, 18, 0), torso=(0, 12, 0))
    if mist:
        bpy.context.view_layer.update()
        p = Vector(ch.root.matrix_world.translation) + Vector((0, 0, 4.4 * ch.root.scale[2]))
        fwd = Vector((math.sin(ch.root.rotation_euler[2]), -math.cos(ch.root.rotation_euler[2]), -0.2))
        Mm = mat("mist", (0.9, 0.95, 1.0), 0.3, emit=(0.8, 0.85, 0.9), estr=0.8, alpha=0.6)
        rnd = random.Random(int(t_choo * 100))
        for i in range(14):
            d = (fwd + Vector((rnd.uniform(-0.5, 0.5), rnd.uniform(-0.5, 0.5), rnd.uniform(-0.3, 0.4)))).normalized()
            m = sphere(f"{ch.name}_mist{int(t_choo*100)}_{i}", 0.08, tuple(p), Mm, coll=coll, seg=8)
            m.scale = (0.01,) * 3
            m.keyframe_insert("scale", frame=F(t_choo - 0.02))
            m.keyframe_insert("location", frame=F(t_choo - 0.02))
            m.scale = (1.4, 1.4, 1.4)
            m.location = tuple(p + d * rnd.uniform(2.0, 4.0))
            m.keyframe_insert("scale", frame=F(t_choo + 0.12))
            m.keyframe_insert("location", frame=F(t_choo + 0.12))
            m.scale = (0.01,) * 3
            m.keyframe_insert("scale", frame=F(t_choo + 0.35))
    return ch


def tomato(name, p0, p1, t0, t1, coll=None):
    ob = sphere(name, 0.45, p0, mat("tomato", hexc("#e0302a"), 0.3, coat=0.5), (1, 1, 0.85), coll=coll, seg=16)
    cyl(name + "_stem", 0.12, 0.12, (0, 0, 0.42), mat("leaf", hexc("#5fae4a"), 0.5), 6, parent=ob, coll=coll)
    ob.keyframe_insert("location", frame=F(t0))
    ob.location = p1
    ob.keyframe_insert("location", frame=F(t1))
    for ax in range(3):
        noise(ob, "rotation_euler", ax, 2.0, 4)
    return ob
