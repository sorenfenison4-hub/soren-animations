"""Locations. Units: studs (character ~5.2 tall). +Y = into the screen for most sets.
Mirrors are portals: a hole in the wall with a 'reflection world' built behind it."""
import math, os, random
import bpy
from mathutils import Vector
from . import ASSETS
from .core import (D, F, mat, hexc, box, cyl, sphere, plane, card, empty, text, light, collection,
                   instance, poly_extrude, img_mat, _MATS, fcurves)
from . import fx

TEX = os.path.join(ASSETS, "tex")


# ------------------------------------------------------------------ materials
def wood(name, c1="#7d4f32", c2="#b07a52", scale=2.0, rough=0.5):
    if name in _MATS:
        return _MATS[name]
    m = D.materials.new(name); m.use_nodes = True
    nt = m.node_tree; N, L = nt.nodes, nt.links
    b = next(n for n in N if n.type == "BSDF_PRINCIPLED")
    tc = N.new("ShaderNodeTexCoord")
    mp = N.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (scale * 0.25, scale * 3.0, scale * 0.25)
    L.new(tc.outputs["Object"], mp.inputs[0])
    nz = N.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 2.5; nz.inputs["Detail"].default_value = 3
    L.new(mp.outputs[0], nz.inputs[0])
    wv = N.new("ShaderNodeTexWave"); wv.wave_type = "RINGS"; wv.inputs["Scale"].default_value = 1.5
    wv.inputs["Distortion"].default_value = 6.0; wv.inputs["Detail"].default_value = 2
    L.new(mp.outputs[0], wv.inputs[0])
    cr = N.new("ShaderNodeValToRGB")
    cr.color_ramp.elements[0].color = (*hexc(c1), 1); cr.color_ramp.elements[1].color = (*hexc(c2), 1)
    cr.color_ramp.elements[0].position = 0.2; cr.color_ramp.elements[1].position = 0.8
    L.new(wv.outputs["Fac"], cr.inputs[0])
    L.new(cr.outputs[0], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough
    m.diffuse_color = (*hexc(c2), 1)
    _MATS[name] = m
    return m


def tiles(name, c1="#f4f4f2", grout="#b8bcc4", scale=1.0, w=1.2, h=1.2, rough=0.25, c2=None, axis="XZ"):
    if name in _MATS:
        return _MATS[name]
    m = D.materials.new(name); m.use_nodes = True
    nt = m.node_tree; N, L = nt.nodes, nt.links
    b = next(n for n in N if n.type == "BSDF_PRINCIPLED")
    tc = N.new("ShaderNodeTexCoord")
    sw = N.new("ShaderNodeMapping")
    # brick texture works in XY -> remap the wall plane axes
    if axis == "XZ":
        sw.inputs["Rotation"].default_value = (math.radians(90), 0, 0)
    elif axis == "YZ":
        sw.inputs["Rotation"].default_value = (math.radians(90), 0, math.radians(90))
    L.new(tc.outputs["Object"], sw.inputs[0])
    br = N.new("ShaderNodeTexBrick")
    br.offset = 0.0 if c2 is None else 0.5
    br.inputs["Scale"].default_value = scale
    br.inputs["Mortar Size"].default_value = 0.025
    br.inputs["Brick Width"].default_value = w
    br.inputs["Row Height"].default_value = h
    br.inputs["Color1"].default_value = (*hexc(c1), 1)
    br.inputs["Color2"].default_value = (*hexc(c2 or c1), 1)
    br.inputs["Mortar"].default_value = (*hexc(grout), 1)
    L.new(sw.outputs[0], br.inputs[0])
    L.new(br.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough
    m.diffuse_color = (*hexc(c1), 1)
    _MATS[name] = m
    return m


def planks(name, c1="#b5764e", c2="#a86a44", line="#5c3a27", scale=1.0):
    """Wood floor: staggered planks with dark seams (brick texture, horizontal XY)."""
    if name in _MATS:
        return _MATS[name]
    m = D.materials.new(name); m.use_nodes = True
    nt = m.node_tree; N, L = nt.nodes, nt.links
    b = next(n for n in N if n.type == "BSDF_PRINCIPLED")
    tc = N.new("ShaderNodeTexCoord")
    br = N.new("ShaderNodeTexBrick"); br.offset = 0.5; br.offset_frequency = 1
    br.inputs["Scale"].default_value = 0.08 * scale
    br.inputs["Mortar Size"].default_value = 0.006
    br.inputs["Brick Width"].default_value = 1.2
    br.inputs["Row Height"].default_value = 0.22
    br.inputs["Color1"].default_value = (*hexc(c1), 1); br.inputs["Color2"].default_value = (*hexc(c2), 1)
    br.inputs["Mortar"].default_value = (*hexc(line), 1)
    L.new(tc.outputs["Object"], br.inputs[0])
    L.new(br.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.42
    m.diffuse_color = (*hexc(c1), 1)
    _MATS[name] = m
    return m


def checker_mat(name, c1, c2, scale=4.0, rough=0.6):
    if name in _MATS:
        return _MATS[name]
    m = D.materials.new(name); m.use_nodes = True
    nt = m.node_tree; N, L = nt.nodes, nt.links
    b = next(n for n in N if n.type == "BSDF_PRINCIPLED")
    tc = N.new("ShaderNodeTexCoord"); ck = N.new("ShaderNodeTexChecker")
    ck.inputs["Scale"].default_value = scale
    ck.inputs["Color1"].default_value = (*hexc(c1), 1); ck.inputs["Color2"].default_value = (*hexc(c2), 1)
    L.new(tc.outputs["Object"], ck.inputs[0]); L.new(ck.outputs[0], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough
    m.diffuse_color = (*hexc(c1), 1)
    _MATS[name] = m
    return m


def emit_mat(name, color, strength):
    return mat(name, color, emit=color, estr=strength)


# ------------------------------------------------------------------ helpers
def wall_with_hole(name, axis, pos, span, zr, hole, thick, m, coll, inner_sign=1):
    """Wall plane perpendicular to axis ('y' or 'x') at pos (inner face), spanning span=(a0,a1) along the
    other horizontal axis and zr=(z0,z1). hole=(a0,a1,z0,z1) or None. Wall thickness grows away from room
    (inner_sign: +1 -> wall extends toward +axis)."""
    a0, a1 = span; z0, z1 = zr
    c = pos + inner_sign * thick / 2
    rects = []
    if hole is None:
        rects.append((a0, a1, z0, z1))
    else:
        h0, h1, hz0, hz1 = hole
        rects += [(a0, h0, z0, z1), (h1, a1, z0, z1), (h0, h1, z0, hz0), (h0, h1, hz1, z1)]
    obs = []
    for i, (x0, x1, y0, y1) in enumerate(rects):
        if x1 - x0 < 1e-3 or y1 - y0 < 1e-3:
            continue
        cx, cz = (x0 + x1) / 2, (y0 + y1) / 2
        if axis == "y":
            obs.append(box(f"{name}{i}", (x1 - x0, thick, y1 - y0), (cx, c, cz), m, 0, coll=coll))
        else:
            obs.append(box(f"{name}{i}", (thick, x1 - x0, y1 - y0), (c, cx, cz), m, 0, coll=coll))
    return obs


def frame_rect(name, axis, pos, center, w, h, bw, depth, m, coll, inner_sign=-1):
    """Picture/mirror frame around rect centred at center=(a,z) on a wall plane."""
    a, z = center
    parts = [(0, h / 2 + bw / 2, w + 2 * bw, bw), (0, -h / 2 - bw / 2, w + 2 * bw, bw),
             (-w / 2 - bw / 2, 0, bw, h), (w / 2 + bw / 2, 0, bw, h)]
    for i, (da, dz, sa, sz) in enumerate(parts):
        if axis == "y":
            box(f"{name}{i}", (sa, depth, sz), (a + da, pos + inner_sign * depth / 2, z + dz), m, 0.04, coll=coll)
        else:
            box(f"{name}{i}", (depth, sa, sz), (pos + inner_sign * depth / 2, a + da, z + dz), m, 0.04, coll=coll)


def set_coll_visible(coll, t, vis):
    f = F(t)
    for ob in list(coll.all_objects):
        ob.hide_render = not vis
        ob.hide_viewport = not vis
        ob.keyframe_insert("hide_render", frame=f)
        ob.keyframe_insert("hide_viewport", frame=f)
        if ob.animation_data and ob.animation_data.action:
            for fc in fcurves(ob.animation_data.action):
                if fc.data_path in ("hide_render", "hide_viewport"):
                    for kp in fc.keyframe_points:
                        kp.interpolation = "CONSTANT"


def set_obj_visible(ob, t, vis):
    f = F(t)
    ob.hide_render = not vis
    ob.hide_viewport = not vis
    ob.keyframe_insert("hide_render", frame=f)
    ob.keyframe_insert("hide_viewport", frame=f)


def plant(name, loc, coll, s=1.0):
    pot = cyl(name + "_pot", 0.45 * s, 0.7 * s, (loc[0], loc[1], loc[2] + 0.35 * s), mat("terracotta", hexc("#c8704a"), 0.6),
              20, bev=0.05, coll=coll, r2=0.36 * s)
    Mg = mat("leaf", hexc("#5fae4a"), 0.5)
    rnd = random.Random(int(loc[0] * 10))
    for i in range(7):
        a = i / 7 * math.tau
        tilt = rnd.uniform(10, 30)
        c = cyl(f"{name}_lf{i}", 0.09 * s, 1.1 * s, (loc[0] + math.cos(a) * 0.15 * s, loc[1] + math.sin(a) * 0.15 * s, loc[2] + 1.2 * s),
                Mg, 8, coll=coll, r2=0.01, rot=(math.cos(a) * tilt, math.sin(a) * tilt, 0))


def books(name, loc, coll, n=3, axis="x", lie=False):
    cols = ["#d4423a", "#4fae5a", "#f0c040", "#3e6fd0", "#f08a3a"]
    for i in range(n):
        if lie:
            box(f"{name}{i}", (1.3, 0.9, 0.22), (loc[0], loc[1], loc[2] + 0.11 + i * 0.23), mat("book" + cols[i % 5], hexc(cols[i % 5]), 0.6), 0.03, coll=coll,
                rot=(0, 0, (i - 1) * 8))
        else:
            box(f"{name}{i}", (0.25, 0.9, 1.25), (loc[0] + i * 0.28, loc[1], loc[2] + 0.62), mat("book" + cols[i % 5], hexc(cols[i % 5]), 0.6), 0.03, coll=coll)


# ------------------------------------------------------------------ BEDROOM
WALL_Y = 10.0
MIRROR = dict(x=3.5, z=6.4, w=3.9, h=5.4)


def bedroom(night=False, bathroom=False, real=None):
    """Eddie's bedroom. Returns anchors. Collections: REAL (static+lights, mirrored by the mirror
    portal), BR_wall (back wall with mirror hole, not mirrored)."""
    real = real or collection("REAL")
    st = collection("BR_static", real)
    lc = collection("BR_lights", real)
    wc = collection("BR_wall")
    Mw = mat("br_wall", hexc("#c4d0e8") if not night else hexc("#9fb3d8"), 0.85)
    Mc = mat("br_ceil", hexc("#dfe6f3"), 0.9)
    Mwhite = mat("white_furn", hexc("#f3f3f1"), 0.45)
    Mwood = wood("wood_dark", "#6e4229", "#a06a45", 2.5)
    Mwood2 = wood("wood_light", "#9a6440", "#c58d5f", 2.0)
    X0, X1, Y0, Y1, H = -11.0, 11.0, -14.0, WALL_Y, 13.0
    box("br_floor", (X1 - X0 + 2, Y1 - Y0 + 2, 0.4), (0, (Y0 + Y1) / 2, -0.2), planks("floor_wood"), 0, coll=st)
    box("br_ceiling", (X1 - X0 + 2, Y1 - Y0 + 2, 0.4), (0, (Y0 + Y1) / 2, H + 0.2), Mc, 0, coll=st)
    # back wall with mirror hole (not mirrored)
    mx, mz, mw, mh = MIRROR["x"], MIRROR["z"], MIRROR["w"], MIRROR["h"]
    wall_with_hole("br_back", "y", Y1, (X0 - 1, X1 + 1), (0, H), (mx - mw / 2, mx + mw / 2, mz - mh / 2, mz + mh / 2), 0.6, Mw, wc, +1)
    wall_with_hole("br_left", "x", X0, (Y0 - 1, Y1), (0, H), None, 0.6, Mw, st, -1)
    door = (-3.0, 2.0, 0, 8.6) if bathroom else None
    wall_with_hole("br_right", "x", X1, (Y0 - 1, Y1), (0, H), door, 0.6, Mw, st, +1)
    wall_with_hole("br_front", "y", Y0, (X0 - 1, X1 + 1), (0, H), None, 0.6, Mw, st, -1)
    # mirror frame (on the wall, part of the wall collection so it is not doubled)
    frame_rect("br_mframe", "y", Y1, (mx, mz), mw, mh, 0.38, 0.32, wood("wood_frame", "#5a3522", "#8c5a3a", 3.0), wc)
    # dresser under the mirror
    dx0, dx1 = mx - 4.0, mx + 4.0
    box("dresser", (dx1 - dx0, 2.5, 3.2), ((dx0 + dx1) / 2, Y1 - 1.25, 1.6), Mwhite, 0.05, coll=st)
    box("dresser_top", (dx1 - dx0 + 0.3, 2.8, 0.32), ((dx0 + dx1) / 2, Y1 - 1.35, 3.36), Mwood2, 0.04, coll=st)
    Mseam = mat("seam", hexc("#c9ccd2"), 0.6)
    for i, z in enumerate((1.1, 2.15)):
        box(f"dr_seam{i}", (dx1 - dx0 - 0.2, 0.05, 0.05), ((dx0 + dx1) / 2, Y1 - 2.51, z), Mseam, 0, coll=st)
    box("dr_mid", (0.05, 0.05, 3.0), ((dx0 + dx1) / 2, Y1 - 2.51, 1.6), Mseam, 0, coll=st)
    plant("dr_plant", (dx1 - 0.9, Y1 - 1.0, 3.52), st)
    cyl("dr_cup", 0.32, 0.8, (dx1 - 2.0, Y1 - 1.0, 3.92), mat("cup_blue", hexc("#7fb0e8"), 0.3), 20, bev=0.03, coll=st)
    books("dr_books", (dx0 + 0.8, Y1 - 1.1, 3.52), st, 3, lie=True)
    # bed (head against the back wall, left side)
    bx0, bx1, by0 = -10.6, -4.6, 0.5
    bcx, bcy = (bx0 + bx1) / 2, (by0 + Y1) / 2
    box("bed_frame", (bx1 - bx0, Y1 - by0, 1.4), (bcx, bcy, 0.9), Mwhite, 0.1, coll=st)
    box("bed_head", (bx1 - bx0, 0.6, 4.2), (bcx, Y1 - 0.3, 2.1), Mwhite, 0.12, coll=st)
    box("mattress", (bx1 - bx0 - 0.2, Y1 - by0 - 0.7, 1.0), (bcx, bcy - 0.2, 2.1), mat("sheet", hexc("#f2f4f8"), 0.7), 0.25, coll=st)
    blanket = checker_mat("blanket", "#2c4fae", "#5b84dc", 1.4)
    box("blanket", (bx1 - bx0 + 0.2, (Y1 - by0) * 0.68, 0.5), (bcx, by0 + (Y1 - by0) * 0.34 - 0.2, 2.55), blanket, 0.22, coll=st)
    box("pillow", (bx1 - bx0 - 1.2, 1.8, 0.7), (bcx, Y1 - 1.6, 2.85), mat("pillow", hexc("#f7f8fb"), 0.7), 0.32, coll=st)
    # nightstand + lamp + alarm clock
    box("nightstand", (2.4, 2.2, 2.9), (-3.2, Y1 - 1.2, 1.45), Mwood, 0.06, coll=st)
    cyl("lamp_base", 0.3, 0.9, (-3.6, Y1 - 1.2, 3.35), Mwhite, 16, coll=st)
    lamp_shade = cyl("lamp_shade", 0.65, 0.9, (-3.6, Y1 - 1.2, 4.2), mat("shade", hexc("#f4efe4"), 0.6,
                     emit=hexc("#ffd9a0") if night else None, estr=0.0), 24, coll=st, r2=0.45)
    box("clock_body", (1.0, 0.5, 0.55), (-2.6, Y1 - 1.4, 3.18), mat("clock_red", hexc("#b8221e"), 0.4), 0.08, coll=st)
    # rug
    cyl("rug", 5.2, 0.06, (-0.5, -1.0, 0.03), mat("rug", hexc("#3aa3b8") if not night else hexc("#2f93b0"), 0.95), 48, coll=st)
    # poster on left wall above bed
    card("poster", 3.0, 3.0, (X0 + 0.02, 5.5, 9.2), img_mat("poster", os.path.join(TEX, "poster.png"), 0.6), "+X", coll=st)
    # shelf with books + picture (right wall front part)
    box("shelf", (1.2, 4.0, 0.25), (X1 - 0.6, -8.0, 7.6), Mwood, 0.03, coll=st)
    for i in range(4):
        box(f"shelf_bk{i}", (0.8, 0.3, 1.1), (X1 - 0.6, -9.4 + i * 0.4, 8.3), mat("book" + str(i), hexc(["#d4423a", "#3e6fd0", "#4fae5a", "#f0c040"][i]), 0.6), 0.03, coll=st)
    card("picture", 3.4, 2.4, (X1 - 0.02, 6.0 if not bathroom else -6.5, 8.0), img_mat("picture", os.path.join(TEX, "picture.png"), 0.6), "-X", coll=st)
    # desk (front right)
    box("desk_top", (6.0, 3.2, 0.3), (7.5, -7.0, 4.0), wood("wood_desk", "#8a5634", "#c48a58", 1.5), 0.04, coll=st)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(f"desk_leg{sx}{sy}", (0.3, 0.3, 4.0), (7.5 + sx * 2.7, -7.0 + sy * 1.3, 2.0), Mwhite, 0.03, coll=st)
    box("phone", (0.5, 0.95, 0.07), (6.6, -7.3, 4.2), mat("phone", hexc("#18181c"), 0.2), 0.04, coll=st)
    cyl("pencil_cup", 0.35, 0.8, (9.0, -6.4, 4.55), mat("cup_blue2", hexc("#4f8fe0"), 0.4), 16, coll=st)
    for i, c in enumerate(("#e04040", "#f0c040", "#40a0e0")):
        cyl(f"pencil{i}", 0.05, 1.5, (9.0 + (i - 1) * 0.12, -6.4, 5.2), mat("pen" + c, hexc(c), 0.4), 8, coll=st, rot=((i - 1) * 10, 0, 0))
    # ---- lighting
    if not night:
        light("br_key", "AREA", (-2, -6, H - 0.5), 9000, (1.0, 0.98, 0.95), 10, coll=lc, target=(0, 2, 0), size_y=8)
        light("br_win", "AREA", (X0 + 1, -4, 8), 3500, (1.0, 0.93, 0.82), 6, coll=lc, target=(5, 2, 2))
        light("br_fill", "AREA", (8, -12, 6), 2500, (0.85, 0.9, 1.0), 8, coll=lc, target=(0, 4, 3))
    else:
        light("br_moon", "AREA", (X0 + 1, -2, 10), 1800, (0.45, 0.6, 1.0), 8, coll=lc, target=(2, 4, 0))
        light("br_fill", "AREA", (6, -12, 8), 700, (0.4, 0.5, 0.95), 10, coll=lc, target=(0, 4, 2))
        light("br_lamp", "POINT", (-3.6, Y1 - 1.6, 4.0), 25, (1.0, 0.75, 0.45), 0.5, coll=lc)
    A = dict(real=real, static=st, lights=lc, wall=wc, wall_y=Y1, mirror=MIRROR, night=night,
             bed=(bcx, bcy), desk=(7.5, -7.0, 4.15), door=(X1, -0.5) if bathroom else None)
    if bathroom:
        A["bath"] = night_bathroom(night)
    return A


def mirror_world(real, wall_y=WALL_Y, name="MirrorWorld", coll=None):
    """Instance the REAL collection mirrored across the wall plane y=wall_y."""
    c = coll or collection("MIRROR_FX")
    return instance(name, real, (0, 2 * wall_y, 0), (1, -1, 1), c)


def mirror_glass(name, cx, wall_y, cz, w, h, coll, crack=False, tint=0.06):
    """Subtle glass sheen in the mirror hole (and optional crack overlay)."""
    m = D.materials.get("mirror_glass") or mat("mirror_glass", (0.9, 0.95, 1.0), rough=0.05, alpha=tint, spec=1.0)
    g = card(name, w, h, (cx, wall_y + 0.05, cz), m, "-Y", coll=coll)
    g.visible_shadow = False
    out = [g]
    if crack:
        mc = img_mat("crack_mat", os.path.join(TEX, "crack.png"), 0.2, emit=0.4, alpha=True)
        mc.surface_render_method = "BLENDED"
        c = card(name + "_crack", w, h, (cx, wall_y - 0.02, cz), mc, "-Y", coll=coll)
        c.visible_shadow = False
        out.append(c)
    return out


# ------------------------------------------------------------------ BURNING HALLWAY (behind the mirror)
def burning_hallway(cx=MIRROR["x"], y0=WALL_Y + 0.6, coll=None, intensity=1.0, open_front=True, seed=4):
    """School hallway on fire. Front edge at y0 (the mirror hole), extends to +Y.
    Returns anchors incl. 'stand' (where the reflection stands)."""
    c = coll or collection("HALL")
    W, L, H = 16.0, 26.0, 12.0
    x0, x1 = cx - W / 2, cx + W / 2
    yb = y0 + L
    Mfloor = tiles("hall_floor", "#6a4a3a", "#3a2a22", 0.25, 1.0, 1.0, 0.35, c2="#5a3e30", axis="XY")
    Mwall = mat("hall_wall", hexc("#6e4636"), 0.8)
    Mceil = tiles("hall_ceil", "#7a5644", "#3a261c", 0.25, 1.0, 1.0, 0.8, axis="XY")
    box("h_floor", (W + 2, L + 2, 0.4), (cx, (y0 + yb) / 2, -0.2), Mfloor, 0, coll=c)
    box("h_ceil", (W + 2, L + 2, 0.4), (cx, (y0 + yb) / 2, H + 0.2), Mceil, 0, coll=c)
    box("h_lwall", (0.5, L, H), (x0 - 0.25, (y0 + yb) / 2, H / 2), Mwall, 0, coll=c)
    box("h_rwall", (0.5, L, H), (x1 + 0.25, (y0 + yb) / 2, H / 2), Mwall, 0, coll=c)
    box("h_bwall", (W, 0.5, H), (cx, yb + 0.25, H / 2), Mwall, 0, coll=c)
    # lockers
    Mlock = mat("locker", hexc("#b4452e"), 0.45, metal=0.3)
    Mvent = mat("locker_vent", hexc("#3a1510"), 0.6)
    Mhandle = mat("locker_handle", hexc("#c8c8c8"), 0.3, metal=0.8)

    def locker_row(prefix, start, axis, n, face):
        for i in range(n):
            if axis == "y":    # along a side wall, facing ±X
                px = start[0]; py = start[1] + i * 1.85; pz = 3.6
                box(f"{prefix}{i}", (1.4, 1.8, 7.2), (px, py, pz), Mlock, 0.05, coll=c)
                for k in range(4):
                    box(f"{prefix}{i}_v{k}", (0.05, 1.0, 0.09), (px + face * 0.71, py, 6.4 - k * 0.22), Mvent, 0, coll=c)
                box(f"{prefix}{i}_h", (0.08, 0.12, 0.5), (px + face * 0.72, py + 0.6, 3.9), Mhandle, 0.02, coll=c)
            else:              # along the back wall, facing -Y
                px = start[0] + i * 1.85; py = start[1]; pz = 3.6
                box(f"{prefix}{i}", (1.8, 1.4, 7.2), (px, py, pz), Mlock, 0.05, coll=c)
                for k in range(4):
                    box(f"{prefix}{i}_v{k}", (1.0, 0.05, 0.09), (px, py - 0.71, 6.4 - k * 0.22), Mvent, 0, coll=c)
                box(f"{prefix}{i}_h", (0.12, 0.08, 0.5), (px + 0.6, py - 0.72, 3.9), Mhandle, 0.02, coll=c)
    locker_row("lk_L", (x0 + 0.75, y0 + 2.0), "y", 12, +1)
    locker_row("lk_B", (x0 + 1.2, yb - 0.75), "x", 8, -1)
    # banner above back lockers
    bn = card("banner", 9.0, 2.7, (cx - 1.0, yb - 0.6, 9.4), img_mat("banner", os.path.join(TEX, "banner.png"), 0.7), "-Y", coll=c)
    # right wall: big shattered windows with fire outside
    Mframe = mat("win_frame", hexc("#5a3a2a"), 0.5)
    Mglass = mat("glass_shard", (0.9, 0.9, 0.85), 0.05, alpha=0.35, spec=1.0)
    rnd = random.Random(seed)
    for j in range(3):
        wy = y0 + 4.0 + j * 6.5
        box(f"win_f{j}_t", (0.4, 5.6, 0.3), (x1 - 0.1, wy, 9.6), Mframe, 0.03, coll=c)
        box(f"win_f{j}_b", (0.4, 5.6, 0.3), (x1 - 0.1, wy, 3.6), Mframe, 0.03, coll=c)
        for k in (-1, 0, 1):
            box(f"win_f{j}_m{k}", (0.4, 0.25, 6.0), (x1 - 0.1, wy + k * 2.7, 6.6), Mframe, 0.03, coll=c)
        # jagged glass teeth along the top bar
        for k in range(8):
            yy = wy - 2.5 + k * 0.7
            ln = rnd.uniform(0.5, 1.6)
            poly_extrude(f"shard{j}_{k}", [(-0.3, 0), (0.3, 0), (rnd.uniform(-0.1, 0.1), -ln)], 0.03,
                         (x1 - 0.15, yy, 9.45), Mglass, rot=(90, 0, 90), coll=c)
        # hole in the wall -> bright fire outside
        glow = card(f"win_glow{j}", 5.4, 5.8, (x1 + 0.6, wy, 6.6), emit_mat("fire_glow", (1.0, 0.32, 0.05), 3 * intensity), "-X", coll=c)
        fx.fire_cluster(f"wfire{j}_", (x1 + 0.35, wy, 3.6), (0.1, 2.4, 0), 5, (3.5, 6.0), (2.0, 3.5), c, seed + j, 10 * intensity, yaw_base=90)
    # cut the right wall at the windows: simple approach -> wall pieces between windows
    D.objects.remove(D.objects["h_rwall"], do_unlink=True)
    for j in range(4):
        ya = y0 + (0 if j == 0 else 4.0 + (j - 1) * 6.5 + 2.75)
        yb2 = (y0 + 4.0 + j * 6.5 - 2.75) if j < 3 else yb
        if yb2 > ya:
            box(f"h_rw{j}", (0.5, yb2 - ya, H), (x1 + 0.25, (ya + yb2) / 2, H / 2), Mwall, 0, coll=c)
    for j in range(3):
        wy = y0 + 4.0 + j * 6.5
        box(f"h_rw_lo{j}", (0.5, 5.5, 3.6), (x1 + 0.25, wy, 1.8), Mwall, 0, coll=c)
        box(f"h_rw_hi{j}", (0.5, 5.5, H - 9.6), (x1 + 0.25, wy, (9.6 + H) / 2), Mwall, 0, coll=c)
    # fire: floor along walls, ceiling, around lockers
    fx.fire_cluster("ffL", (x0 + 1.8, y0 + 9, 0), (0.6, 7, 0), 9, (2.5, 5.5), (1.8, 3.2), c, seed, 9 * intensity)
    fx.fire_cluster("ffR", (x1 - 1.6, y0 + 8, 0), (0.6, 7, 0), 9, (3.0, 6.0), (1.8, 3.2), c, seed + 1, 9 * intensity)
    fx.fire_cluster("ffB", (cx, yb - 2.0, 0), (6, 0.5, 0), 8, (2.0, 5.0), (2.0, 3.5), c, seed + 2, 8 * intensity)
    fx.ceiling_fire("cf", (cx, y0 + 12, H), (W - 4, L - 10), 12, c, seed + 3, 9 * intensity)
    fx.embers("emb", (x0 + 1, y0 + 1, 0.2), (x1 - 1, yb - 2, 6), 90, c, seed + 4, rise=7)
    fx.smoke_volume("smoke", (cx, (y0 + yb) / 2 + 1, H * 0.78), (W - 0.5, L - 2, H * 0.42), c, density=0.12,
                    color=(0.04, 0.03, 0.03), emit=(1.0, 0.25, 0.04), estr=0.06)
    # lights
    lts = fx.fire_lights("hfl", [(x0 + 2, y0 + 6, 2.5), (x1 - 2, y0 + 5, 3), (cx, yb - 3, 2.5), (x1 - 1, y0 + 12, 4),
                                  (cx, y0 + 8, H - 1.5)], 1100 * intensity, color=(1.0, 0.3, 0.06), coll=c, radius=1.5)
    light("h_fill", "AREA", (cx, y0 + 1.0, 7), 160 * intensity, (1.0, 0.33, 0.09), 8, coll=c, target=(cx, y0 + 6, 4))
    return dict(coll=c, stand=(cx, y0 + 4.2, 0), x0=x0, x1=x1, yb=yb, H=H, windows_x=x1, y0=y0)


# ------------------------------------------------------------------ NIGHT BATHROOM (off the bedroom right wall)
def night_bathroom(night=True, coll=None):
    c = coll or collection("BATH", collection("REAL"))
    X0, X1, Y0, Y1, H = 11.6, 21.0, -5.5, 4.5, 12.0
    Mt = tiles("bath_tiles", "#eef0f2", "#a9b0bb", 1.0, 1.0, 1.0, 0.2, axis="YZ")
    Mt2 = tiles("bath_tiles_x", "#eef0f2", "#a9b0bb", 1.0, 1.0, 1.0, 0.2, axis="XZ")
    Mf = checker_mat("bath_floor", "#e8e8e8", "#2a2a30", 1.0, 0.3)
    box("ba_floor", (X1 - X0, Y1 - Y0, 0.4), ((X0 + X1) / 2, (Y0 + Y1) / 2, -0.2), Mf, 0, coll=c)
    box("ba_ceil", (X1 - X0, Y1 - Y0, 0.4), ((X0 + X1) / 2, (Y0 + Y1) / 2, H + 0.2), mat("ba_ceil", hexc("#e6e9ee"), 0.9), 0, coll=c)
    box("ba_lw", (X1 - X0, 0.5, H), ((X0 + X1) / 2, Y0 - 0.25, H / 2), Mt2, 0, coll=c)
    box("ba_rw", (X1 - X0, 0.5, H), ((X0 + X1) / 2, Y1 + 0.25, H / 2), Mt2, 0, coll=c)
    # far wall with mirror hole
    my, mz, mw, mh = -0.5, 6.5, 4.6, 4.8
    wall_with_hole("ba_far", "x", X1, (Y0, Y1), (0, H), (my - mw / 2, my + mw / 2, mz - mh / 2, mz + mh / 2), 0.5, Mt, c, +1)
    frame_rect("ba_mf", "x", X1, (my, mz), mw, mh, 0.2, 0.2, mat("ba_mframe", hexc("#d8dade"), 0.3, metal=0.6), c)
    # vanity + sink
    box("vanity", (2.6, 5.2, 3.6), (X1 - 1.3, my, 1.8), mat("vanity", hexc("#3b3f4a"), 0.5), 0.05, coll=c)
    box("vanity_top", (2.8, 5.5, 0.3), (X1 - 1.4, my, 3.75), mat("counter", hexc("#e9e9ea"), 0.3), 0.04, coll=c)
    cyl("sink", 0.9, 0.3, (X1 - 1.4, my, 3.85), mat("sink", hexc("#f5f5f5"), 0.2), 24, coll=c)
    cyl("faucet", 0.1, 0.8, (X1 - 0.5, my, 4.3), mat("chrome", hexc("#d0d4da"), 0.15, metal=1.0), 12, coll=c)
    # light bar with bulbs
    box("lightbar", (0.3, 3.6, 0.35), (X1 - 0.2, my, 9.6), mat("chrome", hexc("#d0d4da"), 0.15, metal=1.0), 0.05, coll=c)
    Mb = mat("bulb", (1, 1, 1), emit=(1.0, 0.9, 0.75), estr=4.0 if not night else 0.3)
    for i in range(4):
        sphere(f"bulb{i}", 0.25, (X1 - 0.45, my - 1.4 + i * 0.93, 9.35), Mb, coll=c, seg=12)
    if night:
        light("ba_night", "AREA", ((X0 + X1) / 2, my, H - 0.6), 260, (0.55, 0.65, 1.0), 4, coll=c, target=((X0 + X1) / 2, my, 0))
    else:
        light("ba_day", "AREA", ((X0 + X1) / 2, my, H - 0.6), 1500, (1.0, 0.97, 0.92), 5, coll=c, target=((X0 + X1) / 2, my, 0))
    return dict(coll=c, mirror=(X1, my, mz, mw, mh), stand=(X1 - 4.5, my, 0), X0=X0, X1=X1)


def red_reflection_room(X1=21.0, my=-0.5, coll=None):
    """Dark mirrored bathroom behind the night bathroom mirror, lit red."""
    c = coll or collection("REDROOM")
    x0, x1 = X1 + 0.5, X1 + 10.0
    Mt = tiles("red_tiles", "#c9c9cc", "#7a7d85", 1.0, 1.0, 1.0, 0.2, axis="XZ")
    box("rr_floor", (x1 - x0, 10, 0.4), ((x0 + x1) / 2, my, -0.2), mat("rr_floor", hexc("#202024"), 0.4), 0, coll=c)
    box("rr_ceil", (x1 - x0, 10, 0.4), ((x0 + x1) / 2, my, 12.2), mat("rr_ceil", hexc("#2a2a30"), 0.8), 0, coll=c)
    box("rr_back", (0.5, 10, 12), (x1 + 0.25, my, 6), Mt, 0, coll=c)
    box("rr_l", (x1 - x0, 0.5, 12), ((x0 + x1) / 2, my - 5, 6), Mt, 0, coll=c)
    box("rr_r", (x1 - x0, 0.5, 12), ((x0 + x1) / 2, my + 5, 6), Mt, 0, coll=c)
    box("rr_door", (0.3, 3.4, 8.6), (x1, my + 1.8, 4.3), mat("rr_doorway", hexc("#0b0b0e"), 0.8), 0, coll=c)
    lr = light("rr_red", "POINT", (x0 + 2.5, my - 2.5, 6.0), 900, (1.0, 0.08, 0.06), 1.0, coll=c)
    fx.flicker(lr, 0.15, 6)
    light("rr_red2", "AREA", (x0 + 1.0, my, 11.0), 500, (1.0, 0.15, 0.12), 3, coll=c, target=(x0 + 3, my, 4))
    return dict(coll=c, stand=(X1 + 3.4, my, 0))
