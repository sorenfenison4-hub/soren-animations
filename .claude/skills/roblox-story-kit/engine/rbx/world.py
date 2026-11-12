"""Bright everyday locations + props for comedy / adventure stories:
classroom_day, town (school + playground + streets, for aerial and ground shots), clouds,
comedy_club, cockpit, tv_room, and props (pigeon, dog, car, crater, toupee, net, debris)."""
import math, os, random
import bpy
from mathutils import Vector
from . import ASSETS
from .core import (D, F, mat, hexc, box, cyl, sphere, plane, card, empty, text, light, collection, img_mat,
                   world as _world, noise, fcurves)
from .sets import wall_with_hole, frame_rect, tiles, planks, checker_mat, wood, emit_mat, plant, books
from . import fx

TEX = os.path.join(ASSETS, "tex")


def sky(strength=1.0, top=(0.03, 0.14, 0.72), bottom=(0.18, 0.42, 0.95)):
    w = D.worlds.new("Sky"); bpy.context.scene.world = w
    w.use_nodes = True; nt = w.node_tree
    bg = next(n for n in nt.nodes if n.type == "BACKGROUND")
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    cr = nt.nodes.new("ShaderNodeValToRGB")
    cr.color_ramp.elements[0].position = 0.45; cr.color_ramp.elements[0].color = (*bottom, 1)
    cr.color_ramp.elements[1].position = 0.85; cr.color_ramp.elements[1].color = (*top, 1)
    nt.links.new(sep.outputs["Z"], cr.inputs[0]); nt.links.new(cr.outputs[0], bg.inputs[0])
    bg.inputs[1].default_value = strength
    return bg


def space_world(strength=1.0):
    w = D.worlds.new("Space"); bpy.context.scene.world = w
    w.use_nodes = True; nt = w.node_tree
    bg = next(n for n in nt.nodes if n.type == "BACKGROUND")
    tx = nt.nodes.new("ShaderNodeTexEnvironment")
    tx.image = D.images.load(os.path.join(TEX, "space_stars.png"), check_existing=True)
    nt.links.new(tx.outputs["Color"], bg.inputs[0]); bg.inputs[1].default_value = strength


def sun(strength=4.0, rot=(48, 0, 35), coll=None):
    return light("sun", "SUN", (0, 0, 50), strength, (1.0, 0.96, 0.9), 2, coll=coll, rot=rot)


# ------------------------------------------------------------------ clouds
def cloud(name, loc, scale=1.0, coll=None, seed=0):
    rnd = random.Random(seed)
    M = mat("cloud_white", (0.97, 0.98, 1.0), 0.95, emit=(0.6, 0.65, 0.75), estr=0.35)
    root = empty(name, loc, coll=coll)
    for i in range(7):
        r = rnd.uniform(1.6, 3.0) * scale
        sphere(f"{name}_{i}", r, (rnd.uniform(-3.5, 3.5) * scale, rnd.uniform(-1.2, 1.2) * scale, rnd.uniform(-0.4, 1.2) * scale),
               M, (1.0, 0.8, 0.7), parent=root, coll=coll, seg=16)
    return root


def cloud_field(prefix, center, spread=(120, 120, 20), n=24, coll=None, seed=1, scale=(1.5, 3.5)):
    rnd = random.Random(seed)
    for i in range(n):
        p = Vector(center) + Vector([rnd.uniform(-s, s) for s in spread])
        cloud(f"{prefix}{i}", tuple(p), rnd.uniform(*scale), coll, seed + i)


# ------------------------------------------------------------------ classroom (day)
CLASS = dict(X=(-12.0, 12.0), Y=(-10.0, 14.0), H=12.5, board_y=14.0, win_x=12.0)


def classroom_day(board="chalk_joke.png", open_window=True):
    """Bright classroom. Kids face +Y (rot 180) toward the board on the y=14 wall.
    Windows on the right wall (x=12); the middle one is hinged ('win_sash', animate rotation z)."""
    c = collection("CLASSDAY")
    X0, X1 = CLASS["X"]; Y0, Y1 = CLASS["Y"]; H = CLASS["H"]
    Mw = mat("cd_wall", hexc("#f0e6d2"), 0.85)
    box("cd_floor", (X1 - X0 + 2, Y1 - Y0 + 2, 0.4), (0, (Y0 + Y1) / 2, -0.2), tiles("cd_floor", "#d8d2c6", "#b8b0a2", 0.35, 1.0, 1.0, 0.4, axis="XY"), 0, coll=c)
    box("cd_ceil", (X1 - X0 + 2, Y1 - Y0 + 2, 0.4), (0, (Y0 + Y1) / 2, H + 0.2), tiles("cd_ceil", "#f4f2ec", "#cfcac0", 0.3, 1.0, 1.0, 0.9, axis="XY"), 0, coll=c)
    for i, (x, y) in enumerate([(-5, 0), (5, 0), (-5, 8), (5, 8)]):
        card(f"cd_lamp{i}", 4.0, 1.2, (x, y, H - 0.02), mat("cd_lamp", (1, 1, 1), emit=(1, 0.98, 0.92), estr=6), "-Y", coll=c).rotation_euler = (math.radians(180), 0, 0)
    wall_with_hole("cd_board_wall", "y", Y1, (X0 - 1, X1 + 1), (0, H), None, 0.5, Mw, c, +1)
    wall_with_hole("cd_back", "y", Y0, (X0 - 1, X1 + 1), (0, H), None, 0.5, Mw, c, -1)
    wall_with_hole("cd_left", "x", X0, (Y0, Y1), (0, H), None, 0.5, Mw, c, -1)
    # right wall with three window holes
    holes = [(-4.5, -1.5), (1.5, 4.5), (7.5, 10.5)]
    Mtrim = mat("cd_trim", hexc("#ffffff"), 0.5)
    prev = Y0
    for k, (a, b) in enumerate(holes):
        box(f"cd_rw_s{k}", (0.5, a - prev, H), (X1 + 0.25, (a + prev) / 2, H / 2), Mw, 0, coll=c)
        box(f"cd_rw_lo{k}", (0.5, b - a, 4.0), (X1 + 0.25, (a + b) / 2, 2.0), Mw, 0, coll=c)
        box(f"cd_rw_hi{k}", (0.5, b - a, H - 9.5), (X1 + 0.25, (a + b) / 2, (9.5 + H) / 2), Mw, 0, coll=c)
        for zz in (4.0, 9.5):
            box(f"cd_wtr{k}{zz}", (0.7, b - a + 0.4, 0.25), (X1, (a + b) / 2, zz), Mtrim, 0.03, coll=c)
        prev = b
    box("cd_rw_end", (0.5, Y1 - prev, H), (X1 + 0.25, (prev + Y1) / 2, H / 2), Mw, 0, coll=c)
    # outside: sky card + distant trees
    card("cd_outside", 60, 30, (X1 + 14, 2, 8), mat("cd_sky", (0.62, 0.8, 1.0), emit=(0.62, 0.8, 1.0), estr=2.2), "-X", coll=c)
    for k in range(6):
        sphere(f"cd_tree{k}", 2.6, (X1 + 9, -8 + k * 4.5, 3.5), mat("bush", hexc("#4f9f45"), 0.9), (1, 1, 1.2), coll=c)
    # window sashes (glass + frame), the middle one hinged on its +Y edge
    Mglass = mat("cd_glass", (0.85, 0.92, 1.0), 0.05, alpha=0.18, spec=1.0)
    sash = None
    for k, (a, b) in enumerate(holes):
        hinge = empty(f"win_hinge{k}", (X1 - 0.1, b, 6.75), coll=c)
        w = b - a
        box(f"win_glass{k}", (0.06, w - 0.2, 5.3), (0, -w / 2, 0), Mglass, 0, coll=c).parent = hinge
        for (dy, sz) in ((-0.05, (0.2, 0.15, 5.5)), (-w + 0.05, (0.2, 0.15, 5.5))):
            box(f"win_fr{k}{dy}", sz, (0, dy, 0), Mtrim, 0.02, coll=c).parent = hinge
        for dz in (-2.7, 0, 2.7):
            box(f"win_frh{k}{dz}", (0.2, w, 0.15), (0, -w / 2, dz), Mtrim, 0.02, coll=c).parent = hinge
        if k == 1:
            sash = hinge
    # board + teacher desk
    card("cd_board", 13, 5.2, (-1.5, Y1 - 0.04, 7.0), img_mat("chalk_joke", os.path.join(TEX, board), 0.85), "-Y", coll=c)
    box("cd_board_tray", (13, 0.4, 0.2), (-1.5, Y1 - 0.2, 4.35), Mtrim, 0, coll=c)
    box("cd_tdesk", (6, 2.6, 3.4), (-7.0, Y1 - 3.6, 1.7), wood("wood_cab", "#6e4229", "#a06a45", 2.0), 0.06, coll=c)
    plant("cd_plant", (-10.5, Y1 - 1.2, 0), c, 1.3)
    poster = card("cd_poster", 3.0, 3.8, (X0 + 0.03, 4.0, 7.5), img_mat("poster", os.path.join(TEX, "poster.png"), 0.6), "+X", coll=c)
    # desks: rows facing the board (+Y)
    Md = wood("wood_desk", "#8a5634", "#c48a58", 1.5)
    Mleg = mat("desk_leg", hexc("#3a3a3a"), 0.4, metal=0.6)
    Mch = mat("chair_blue", hexc("#2a5fd0"), 0.4)
    desks = []
    for r in range(3):
        for k in range(4):
            x = -7.5 + k * 5.0; y = 7.0 - r * 5.5
            box(f"cd_desk{r}{k}", (3.4, 2.2, 0.22), (x, y, 3.3), Md, 0.03, coll=c)
            for sx in (-1, 1):
                for sy in (-1, 1):
                    box(f"cd_dl{r}{k}{sx}{sy}", (0.14, 0.14, 3.2), (x + sx * 1.5, y + sy * 0.9, 1.6), Mleg, 0, coll=c)
            box(f"cd_seat{r}{k}", (2.0, 1.8, 0.22), (x, y - 2.0, 2.1), Mch, 0.05, coll=c)
            box(f"cd_cback{r}{k}", (2.0, 0.22, 1.8), (x, y - 2.9, 3.1), Mch, 0.05, coll=c)
            desks.append((x, y))
    light("cd_key", "AREA", (0, 2, H - 0.5), 9000, (1.0, 0.98, 0.94), 14, coll=c, target=(0, 2, 0), size_y=14)
    light("cd_win", "AREA", (X1 - 0.5, 3, 7), 4000, (0.95, 0.97, 1.0), 10, coll=c, target=(0, 3, 2))
    light("cd_fill", "AREA", (-6, Y0 + 1, 7), 2000, (1.0, 0.95, 0.88), 8, coll=c, target=(0, 8, 3))
    return dict(coll=c, sash=sash, desks=desks, board=(-1.5, Y1, 7.0), win=(X1, 3.0, 6.75))


def seat_pos(desk):
    """Root position for a kid sitting behind a desk (facing +Y, rot 180)."""
    x, y = desk
    return (x, y - 2.0, 0.25)


def sit(ch, t, desk, **kw):
    """Seated at a desk facing the board."""
    ch.pose(t, loc=seat_pos(desk), rot=180, legL=(85, 3), legR=(85, -3), armL=(76, 6), armR=(76, 6), **kw)


# ------------------------------------------------------------------ town (aerial + ground)
def town(school=True, banner=None, coll=None, extent=140, seed=5):
    """Ground at z=0: school at origin facing -Y, playground to the east, streets and houses around."""
    from . import locs
    c = coll or collection("TOWN")
    if school:
        locs.school_exterior()
        if banner:
            card("joke_banner", 14, 3.0, (0, 11.92, 19.8), img_mat("banner_joke", os.path.join(TEX, banner), 0.5), "-Y", coll=c)
    box("tw_lawn", (3 * extent, 3 * extent, 0.4), (0, 0, -0.26), mat("grass", hexc("#5fb04a"), 0.9), 0, coll=c)
    Mroad = mat("asphalt_day", hexc("#55565e"), 0.8)
    for k, y in enumerate((-30, -70, -110, 50, 90, 130)):
        box(f"tw_road_x{k}", (2 * extent, 6, 0.06), (0, y, 0.04), Mroad, 0, coll=c)
    for k, x in enumerate((-60, -100, -140, 60, 100, 140)):
        box(f"tw_road_y{k}", (6, 2 * extent, 0.07), (x, 0, 0.045), Mroad, 0, coll=c)
    rnd = random.Random(seed)
    cols = ["#e2725b", "#f2c14e", "#6fb3e0", "#9b8fd6", "#f0f0f0", "#8fd18c", "#f59bb5"]
    roofs = ["#a33b2f", "#4a5568", "#7a4a2a"]
    for gx in range(-3, 4):
        for gy in range(-3, 4):
            cx, cy = gx * 40, -30 + gy * 40 + 20
            if abs(cx) < 45 and -55 < cy < 40:
                continue   # leave room for the school, playground and the street in front
            for h in range(4):
                x = cx - 10 + (h % 2) * 20 + rnd.uniform(-2, 2); y = cy - 8 + (h // 2) * 16 + rnd.uniform(-2, 2)
                big = rnd.random() < 0.25 and (abs(cx) > 60 or abs(cy) > 80)
                w, d, hh = (rnd.uniform(10, 14), rnd.uniform(10, 14), rnd.uniform(18, 40)) if big else (rnd.uniform(7, 9), rnd.uniform(7, 9), rnd.uniform(6, 9))
                box(f"tw_b{gx}{gy}{h}", (w, d, hh), (x, y, hh / 2), mat("house" + str(h % 7 + gx % 3), hexc(cols[(h + gx + gy) % 7]), 0.7), 0.15, coll=c)
                if not big:
                    box(f"tw_r{gx}{gy}{h}", (w + 0.8, d + 0.8, 1.2), (x, y, hh + 0.6), mat("roof" + str(h % 3), hexc(roofs[h % 3]), 0.7), 0.2, coll=c)
            sphere(f"tw_tree{gx}{gy}", 2.6, (cx + 12, cy + 12, 4), mat("bush", hexc("#3f8f3a"), 0.9), (1, 1, 1.3), coll=c)
    # playground east of the school
    px, py = 34, -14
    Mred, Myel, Mblu = mat("pg_red", hexc("#d9453a"), 0.4), mat("pg_yel", hexc("#f2c14e"), 0.4), mat("pg_blu", hexc("#3f7fd9"), 0.4)
    box("pg_sand", (22, 18, 0.1), (px, py, 0.05), mat("sand", hexc("#e8d6a0"), 0.95), 0, coll=c)
    box("pg_tower", (4, 4, 5), (px - 4, py, 2.5), Mblu, 0.1, coll=c)
    box("pg_roof", (4.6, 4.6, 0.6), (px - 4, py, 5.6), Mred, 0.2, coll=c)
    box("pg_slide", (2.2, 8, 0.3), (px + 1.5, py, 2.4), Myel, 0.1, coll=c, rot=(0, -28, 90))
    for k in range(2):
        cyl(f"pg_sw{k}", 0.15, 6, (px - 2 + k * 6, py + 7, 3), Mred, 12, coll=c)
    box("pg_swbar", (6.4, 0.3, 0.3), (px + 1, py + 7, 6.0), Mred, 0.05, coll=c)
    return dict(coll=c, school=(0, 18, 0), playground=(px, py, 0))


# ------------------------------------------------------------------ interiors
def comedy_club():
    c = collection("CLUB")
    box("cl_floor", (24, 24, 0.4), (0, 0, -0.2), planks("club_floor", "#5a3a2a", "#4e3224", "#2a1a12"), 0, coll=c)
    Mbrick = tiles("club_brick", "#7a3a2e", "#3a2620", 1.0, 1.6, 0.6, 0.9, c2="#6e3428", axis="XZ")
    box("cl_back", (24, 0.5, 14), (0, 8, 7), Mbrick, 0, coll=c)
    box("cl_stage", (14, 6, 1.2), (0, 5, 0.6), wood("wood_dark", "#6e4229", "#a06a45", 2.5), 0.05, coll=c)
    box("cl_curtain", (14, 0.4, 11), (0, 7.6, 6.7), mat("curtain_red", hexc("#8e1b25"), 0.8), 0.2, coll=c)
    card("cl_sign", 8, 2.3, (0, 7.3, 11.0), img_mat("club_sign", os.path.join(TEX, "club_sign.png"), 0.5, emit=2.0), "-Y", coll=c)
    cyl("cl_micstand", 0.06, 4.6, (0.6, 3.6, 3.4), mat("chrome", hexc("#d0d4da"), 0.15, metal=1.0), 10, coll=c)
    # ceiling net
    Mn = mat("net", hexc("#dddddd"), 0.6)
    for k in range(-10, 11):
        box(f"cl_netx{k}", (0.06, 24, 0.06), (k * 1.2, -2, 11.8), Mn, 0, coll=c)
        box(f"cl_nety{k}", (24, 0.06, 0.06), (0, -2 + k * 1.2, 11.8), Mn, 0, coll=c)
    box("cl_ceil", (24, 24, 0.4), (0, 0, 13.2), mat("club_ceil", hexc("#1a1418"), 0.9), 0, coll=c)
    sp = light("cl_spot", "SPOT", (0, -4, 12), 4500, (1.0, 0.92, 0.8), 0.3, coll=c, spot=35, blend=0.3, target=(0, 4.5, 3))
    light("cl_fill", "AREA", (0, -8, 6), 900, (0.9, 0.6, 1.0), 8, coll=c, target=(0, 0, 6))
    light("cl_net_l", "AREA", (0, -2, 10.5), 600, (1.0, 0.85, 0.7), 10, coll=c, target=(0, -2, 13))
    light("cl_aud_up", "AREA", (0, -3, 3.0), 4500, (1.0, 0.8, 0.9), 12, coll=c, target=(0, -3, 12))
    light("cl_aud_fill", "AREA", (6, 6, 6), 2500, (0.8, 0.6, 1.0), 8, coll=c, target=(-1, -3, 9))
    return dict(coll=c, stage=(0, 4.5, 1.2))


def cockpit():
    c = collection("COCKPIT")
    Mg = mat("ck_grey", hexc("#3c4048"), 0.5)
    box("ck_floor", (10, 10, 0.3), (0, 0, -0.15), mat("ck_floor", hexc("#2a2d33"), 0.7), 0, coll=c)
    box("ck_ceil", (10, 10, 0.4), (0, 0, 8.6), Mg, 0.2, coll=c)
    for sx in (-1, 1):
        box(f"ck_side{sx}", (0.4, 10, 9), (sx * 5, 0, 4.3), Mg, 0.2, coll=c)
    box("ck_dash", (10, 2.6, 2.6), (0, 3.8, 3.2), mat("ck_dash", hexc("#24272c"), 0.6), 0.2, coll=c)
    Msc = mat("ck_screen", (0.1, 0.6, 1.0), emit=(0.2, 0.7, 1.0), estr=3.0)
    for k in range(4):
        card(f"ck_scr{k}", 1.4, 1.0, (-3 + k * 2, 2.48, 4.0), Msc, "-Y", coll=c, rot_extra=0)
    # windshield: sky + clouds outside
    card("ck_sky", 30, 16, (0, 14, 6), mat("ck_skyout", (0.55, 0.78, 1.0), emit=(0.55, 0.78, 1.0), estr=2.5), "-Y", coll=c)
    for k in range(5):
        cloud(f"ck_cloud{k}", (-12 + k * 6, 12, 3 + (k % 2) * 3), 0.8, c, k)
    for k, x in enumerate((-4.2, 0, 4.2)):
        box(f"ck_pillar{k}", (0.3, 0.3, 4.4), (x, 4.6, 6.4), Mg, 0.05, coll=c)
    for sx in (-1, 1):
        box(f"ck_seat{sx}", (2.4, 2.2, 0.6), (sx * 2.2, -0.5, 2.0), mat("ck_seat", hexc("#3a2a20"), 0.6), 0.2, coll=c)
        box(f"ck_seatb{sx}", (2.4, 0.5, 3.6), (sx * 2.2, -1.6, 3.6), mat("ck_seat", hexc("#3a2a20"), 0.6), 0.2, coll=c)
    light("ck_key", "AREA", (0, 3, 8), 2200, (0.85, 0.92, 1.0), 6, coll=c, target=(0, -1, 3))
    light("ck_fill", "AREA", (0, -5, 5), 700, (1.0, 0.95, 0.9), 6, coll=c, target=(0, 0, 4))
    return dict(coll=c, seats=((-2.2, -0.5, 0.0), (2.2, -0.5, 0.0)))


def tv_room():
    from . import locs
    L = locs.living_room()
    c = L["coll"]
    # TV in front of the couch (couch faces -Y)
    box("tv_stand", (6, 2, 2), (0, -6, 1.0), wood("wood_coffee", "#a0703f", "#c89260", 2.0), 0.05, coll=c)
    box("tv_body", (6.4, 0.4, 3.8), (0, -6.2, 4.1), mat("tv_black", hexc("#111114"), 0.3), 0.08, coll=c)
    card("tv_screen", 6.0, 3.4, (0, -5.98, 4.1), img_mat("tv_show", os.path.join(TEX, "tv_show.png"), 0.3, emit=2.5), "+Y", coll=c)
    light("tv_glow", "AREA", (0, -5.5, 4.1), 300, (0.7, 0.85, 1.0), 4, coll=c, target=(0, 6, 3.5))
    return L


def hallway_day():
    """School corridor in daylight (lockers both sides), +Y down the hall."""
    c = collection("HALLDAY")
    box("hd_floor", (14, 60, 0.4), (0, 20, -0.2), checker_mat("hd_floor", "#e6e2da", "#b9c2cf", 0.5, 0.3), 0, coll=c)
    box("hd_ceil", (14, 60, 0.4), (0, 20, 12.2), tiles("hd_ceil", "#f2f0ea", "#c9c4ba", 0.4, 1.0, 1.0, 0.9, axis="XY"), 0, coll=c)
    Mw = mat("hd_wall", hexc("#e9e4d8"), 0.85)
    for sx in (-1, 1):
        box(f"hd_wall{sx}", (0.5, 60, 12), (sx * 6.25, 20, 6), Mw, 0, coll=c)
    Ml = [mat("hd_lk_b", hexc("#2f6fd0"), 0.4, metal=0.3), mat("hd_lk_r", hexc("#d0453a"), 0.4, metal=0.3)]
    for sx in (-1, 1):
        for i in range(26):
            box(f"hd_lk{sx}{i}", (1.3, 1.75, 7.0), (sx * 5.3, -2 + i * 1.8, 3.5), Ml[(i // 5) % 2], 0.04, coll=c)
    for i in range(5):
        card(f"hd_lamp{i}", 3.0, 1.0, (0, i * 10, 12.0 - 0.02), mat("cd_lamp", (1, 1, 1), emit=(1, 0.98, 0.92), estr=6), "-Y", coll=c).rotation_euler = (math.radians(180), 0, 0)
    light("hd_key", "AREA", (0, 10, 11.5), 5000, (1.0, 0.98, 0.94), 6, coll=c, target=(0, 10, 0), size_y=30)
    light("hd_fill", "AREA", (0, -8, 6), 1500, (1.0, 0.96, 0.9), 6, coll=c, target=(0, 10, 3))
    return dict(coll=c)


# ------------------------------------------------------------------ props
def pigeon(name, loc, coll=None):
    root = empty(name, loc, coll=coll)
    Mg, Mw = mat("pigeon_grey", hexc("#8a8f9a"), 0.7), mat("pigeon_dark", hexc("#4a4e5a"), 0.7)
    sphere(name + "_body", 0.45, (0, 0, 0), Mg, (0.8, 1.2, 0.8), parent=root, coll=coll, seg=16)
    sphere(name + "_head", 0.26, (0, -0.55, 0.35), Mw, parent=root, coll=coll, seg=12)
    cyl(name + "_beak", 0.06, 0.2, (0, -0.8, 0.33), mat("beak", hexc("#e8a33a"), 0.5), 8, parent=root, coll=coll, rot=(90, 0, 0), r2=0.01)
    for sx in (-1, 1):
        w = box(f"{name}_wing{sx}", (0.7, 0.8, 0.08), (sx * 0.5, 0.05, 0.1), Mw, 0.04, parent=root, coll=coll)
        w.rotation_euler = (0, math.radians(sx * 20), 0)
        noise(w, "rotation_euler", 1, 0.6, 2)
    return root


def dog(name, loc, coll=None, color="#c98a4a"):
    root = empty(name, loc, coll=coll)
    M = mat("dog_" + color, hexc(color), 0.6)
    box(name + "_body", (1.2, 2.4, 1.2), (0, 0, 1.4), M, 0.2, parent=root, coll=coll)
    box(name + "_head", (1.1, 1.0, 1.0), (0, -1.5, 2.1), M, 0.2, parent=root, coll=coll)
    box(name + "_snout", (0.6, 0.5, 0.45), (0, -2.1, 1.9), M, 0.1, parent=root, coll=coll)
    sphere(name + "_nose", 0.12, (0, -2.36, 2.0), mat("dog_nose", hexc("#151515"), 0.3), parent=root, coll=coll)
    for sx in (-1, 1):
        sphere(f"{name}_eye{sx}", 0.1, (sx * 0.28, -2.0, 2.35), mat("dog_nose", hexc("#151515"), 0.3), parent=root, coll=coll)
        box(f"{name}_ear{sx}", (0.25, 0.4, 0.6), (sx * 0.5, -1.3, 2.5), mat("dog_ear", hexc("#7a4a22"), 0.6), 0.08, parent=root, coll=coll)
        for sy in (-1, 1):
            lg = box(f"{name}_leg{sx}{sy}", (0.35, 0.35, 1.0), (sx * 0.4, sy * 0.8, 0.5), M, 0.08, parent=root, coll=coll)
            noise(lg, "rotation_euler", 0, 0.5, 3)
    t = box(name + "_tail", (0.18, 0.18, 1.0), (0, 1.3, 2.0), M, 0.05, parent=root, coll=coll, rot=(-40, 0, 0))
    noise(t, "rotation_euler", 1, 0.6, 2)
    return root


def car(name, loc, color="#d9453a", coll=None, rot=0):
    root = empty(name, loc, coll=coll, rot=(0, 0, rot))
    M = mat("car_" + color, hexc(color), 0.25, metal=0.4)
    box(name + "_body", (4.6, 9, 2.2), (0, 0, 1.6), M, 0.4, parent=root, coll=coll)
    box(name + "_top", (4.0, 5, 1.8), (0, 0.6, 3.4), mat("car_glass2", hexc("#2a3a4a"), 0.1, metal=0.2), 0.35, parent=root, coll=coll)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl(f"{name}_wh{sx}{sy}", 0.9, 0.6, (sx * 2.2, sy * 3.0, 0.9), mat("tire", hexc("#111111"), 0.7), 18, rot=(0, 90, 0), parent=root, coll=coll)
    return root


def crater(name, loc, r=1.6, coll=None):
    root = empty(name, loc, coll=coll)
    cyl(name + "_hole", r, 0.06, (0, 0, 0.03), mat("crater", hexc("#2b2724"), 0.9), 24, parent=root, coll=coll)
    rnd = random.Random(len(name))
    Mc = mat("concrete_chunk", hexc("#8a8a88"), 0.9)
    for i in range(10):
        a = i / 10 * math.tau
        box(f"{name}_ch{i}", (0.5, 0.4, 0.3), (math.cos(a) * r * 1.05, math.sin(a) * r * 1.05, 0.15), Mc, 0.05,
            parent=root, coll=coll, rot=(rnd.uniform(-30, 30), rnd.uniform(-30, 30), rnd.uniform(0, 90)))
    return root


def toupee(name, coll=None):
    return sphere(name, 0.55, (0, 0, 0), mat("toupee", hexc("#5a3a22"), 0.6), (1.1, 1.0, 0.28), coll=coll, seg=16)


def floaty(ch, t0, t1, rise=3.0, wobble=1.0, laugh=True, flail=True):
    """Floating-while-laughing acting: rise, dangling legs, flailing arms, tilt."""
    p0 = Vector(ch.root.location)
    ch.pose(t0, loc=tuple(p0), legL=(-12, 6), legR=(18, -6), torso=(0, -6, 4))
    ch.pose(t1, loc=tuple(p0 + Vector((0, 0, rise))), legL=(14, 8), legR=(-10, -8), torso=(0, -10, -6))
    noise(ch.root, "rotation_euler", 1, 0.08 * wobble, 12)
    if flail:
        ch.panic(t0, t1, rate=4.5)
    if laugh:
        ch.face(t0, "joy")
        ch.talk(t0, t1, open_m="laugh", wide_m="open_smile", rest="laugh", syll=0.14)
    return ch
