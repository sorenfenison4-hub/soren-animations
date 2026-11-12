"""Secondary locations: mirror rooms (teacher / school bathroom / dad), street, living room,
dark house hall, school exterior, dark school corridor, classroom, clock close-up, props."""
import math, os, random
import bpy
from mathutils import Vector
from .core import (D, F, mat, hexc, box, cyl, sphere, plane, card, empty, text, light, collection,
                   instance, poly_extrude, img_mat, _MATS, fcurves)
from .sets import (wall_with_hole, frame_rect, tiles, planks, checker_mat, wood, emit_mat, TEX, plant, books,
                   set_obj_visible)
from . import fx

FONT_BOLD = r"C:\Windows\Fonts\ariblk.ttf"


# ------------------------------------------------------------------ generic room with mirror on back wall (y=10)
def mirror_room(prefix, wall="#efe3cf", floor=None, ceil="#f2ede4", mirror=(0.0, 6.2, 4.2, 5.4), frame="#d4a640",
                frame_w=0.32, X=(-9, 9), Y=(-9, 10), H=12.5, lights=True, warm=1.0):
    real = collection(prefix + "_REAL")
    st = collection(prefix + "_static", real)
    lc = collection(prefix + "_lights", real)
    wc = collection(prefix + "_wall")
    Mw = mat(prefix + "_wallm", hexc(wall), 0.85)
    floor = floor or planks(prefix + "_floor", "#a8744f", "#9c6946", "#5a3a28")
    X0, X1 = X; Y0, Y1 = Y
    box(prefix + "_fl", (X1 - X0 + 2, Y1 - Y0 + 2, 0.4), ((X0 + X1) / 2, (Y0 + Y1) / 2, -0.2), floor, 0, coll=st)
    box(prefix + "_ce", (X1 - X0 + 2, Y1 - Y0 + 2, 0.4), ((X0 + X1) / 2, (Y0 + Y1) / 2, H + 0.2), mat(prefix + "_ceil", hexc(ceil), 0.9), 0, coll=st)
    mx, mz, mw, mh = mirror
    wall_with_hole(prefix + "_bk", "y", Y1, (X0 - 1, X1 + 1), (0, H), (mx - mw / 2, mx + mw / 2, mz - mh / 2, mz + mh / 2), 0.6, Mw, wc, +1)
    wall_with_hole(prefix + "_lw", "x", X0, (Y0 - 1, Y1), (0, H), None, 0.6, Mw, st, -1)
    wall_with_hole(prefix + "_rw", "x", X1, (Y0 - 1, Y1), (0, H), None, 0.6, Mw, st, +1)
    wall_with_hole(prefix + "_fw", "y", Y0, (X0 - 1, X1 + 1), (0, H), None, 0.6, Mw, st, -1)
    if frame:
        frame_rect(prefix + "_mf", "y", Y1, (mx, mz), mw, mh, frame_w, 0.3, mat(prefix + "_frame", hexc(frame), 0.3, metal=0.7), wc)
    if lights:
        light(prefix + "_key", "AREA", ((X0 + X1) / 2, (Y0 + Y1) / 2, H - 0.4), 6000 * warm, (1.0, 0.96, 0.9), 8, coll=lc,
              target=((X0 + X1) / 2, (Y0 + Y1) / 2, 0), size_y=8)
        light(prefix + "_fill", "AREA", (X1 - 2, Y0 + 2, 6), 1800, (0.9, 0.93, 1.0), 6, coll=lc, target=(0, 6, 4))
        light(prefix + "_fill2", "AREA", (X0 + 2, Y1 - 3, 7), 1200, (1.0, 0.95, 0.88), 6, coll=lc, target=(0, 0, 4))
    return dict(real=real, static=st, lights=lc, wall=wc, wall_y=Y1, mirror=mirror, X=X, Y=Y, H=H)


def mirror_instance(real, wall_y, name="MirrorWorld"):
    return instance(name, real, (0, 2 * wall_y, 0), (1, -1, 1), collection("MIRROR_FX"))


def red_door(prefix, x, y, coll, facing="+Y", w=3.6, h=8.0, color="#b8312a"):
    M = mat(prefix + "_door", hexc(color), 0.5)
    Mf = mat(prefix + "_doorframe", hexc("#efe6d8"), 0.6)
    s = 1 if facing == "+Y" else -1
    box(prefix + "_d", (w, 0.3, h), (x, y + s * 0.15, h / 2), M, 0.04, coll=coll)
    card(prefix + "_dwin", 0.9, 0.9, (x, y + s * 0.32, h * 0.72), mat("door_window", (0.95, 0.97, 1.0), 0.1, emit=(0.9, 0.95, 1), estr=1.5),
         "-Y" if facing == "-Y" else "+Y", coll=coll)
    box(prefix + "_dfr", (w + 0.6, 0.2, 0.3), (x, y + s * 0.1, h + 0.15), Mf, 0.03, coll=coll)
    for sx in (-1, 1):
        box(f"{prefix}_dfr{sx}", (0.3, 0.2, h), (x + sx * (w / 2 + 0.15), y + s * 0.1, h / 2), Mf, 0.03, coll=coll)
    sphere(prefix + "_knob", 0.14, (x + w / 2 - 0.5, y + s * 0.4, h * 0.45), mat("brass", hexc("#d8b04a"), 0.25, metal=1.0), coll=coll)


def wall_clock(prefix, loc, coll, facing="+Y"):
    rot = {"+Y": (90, 0, 180), "-Y": (90, 0, 0)}[facing]
    cyl(prefix + "_rim", 0.75, 0.15, loc, mat("clock_rim", hexc("#2a2a2a"), 0.4), 32, rot=rot, coll=coll)
    s = 1 if facing == "+Y" else -1
    cyl(prefix + "_face", 0.66, 0.05, (loc[0], loc[1] + s * 0.06, loc[2]), mat("clock_face", hexc("#f5f5f2"), 0.5), 32, rot=rot, coll=coll)
    Mh = mat("clock_hand", hexc("#111111"), 0.5)
    box(prefix + "_h1", (0.06, 0.03, 0.45), (loc[0], loc[1] + s * 0.1, loc[2] + 0.2), Mh, 0, coll=coll)
    box(prefix + "_h2", (0.32, 0.03, 0.06), (loc[0] + 0.15, loc[1] + s * 0.1, loc[2]), Mh, 0, coll=coll)


def window(prefix, x, y, z, w, h, coll, facing="+X", sky=(0.75, 0.88, 1.0), estr=2.5, frame="#f2f2f2"):
    Mf = mat(prefix + "_wf", hexc(frame), 0.5)
    Ms = mat(prefix + "_sky", sky, emit=sky, estr=estr)
    if facing in ("+X", "-X"):
        card(prefix + "_glass", w, h, (x, y, z), Ms, "+X" if facing == "+X" else "-X", coll=coll)
        for dy in (-w / 2, 0, w / 2):
            box(f"{prefix}_mv{dy}", (0.3, 0.2, h), (x, y + dy, z), Mf, 0.02, coll=coll)
        for dz in (-h / 2, 0, h / 2):
            box(f"{prefix}_mh{dz}", (0.3, w, 0.2), (x, y, z + dz), Mf, 0.02, coll=coll)
    else:
        card(prefix + "_glass", w, h, (x, y, z), Ms, "-Y" if facing == "-Y" else "+Y", coll=coll)
        for dx in (-w / 2, 0, w / 2):
            box(f"{prefix}_mv{dx}", (0.2, 0.3, h), (x + dx, y, z), Mf, 0.02, coll=coll)
        for dz in (-h / 2, 0, h / 2):
            box(f"{prefix}_mh{dz}", (w, 0.3, 0.2), (x, y, z + dz), Mf, 0.02, coll=coll)


def teacher_room():
    A = mirror_room("tr", wall="#efe2cc", mirror=(0.0, 6.3, 4.4, 5.6), frame="#d9a838", frame_w=0.36)
    st = A["static"]
    red_door("tr_door", 1.5, -9.0, st, "+Y")
    wall_clock("tr_clock", (5.6, -8.85, 8.8), st, "+Y")
    window("tr_win", -8.9, 2.0, 6.5, 4.0, 4.6, st, "+X")
    plant("tr_plant", (-7.6, 7.5, 0), st, 1.4)
    box("tr_cabinet", (4, 2, 3.4), (-6.0, -7.8, 1.7), wood("wood_cab", "#6e4229", "#a06a45", 2.0), 0.05, coll=st)
    box("tr_wainscot", (18.5, 0.15, 0.3), (0, 9.9, 3.2), mat("trim_white", hexc("#f6f2ea"), 0.5), 0, coll=A["wall"])
    return A


def school_bathroom():
    A = mirror_room("sb", wall="#e9edf2", floor=checker_mat("sb_floor", "#d9dde4", "#b9c0cc", 1.2, 0.3),
                    mirror=(0.0, 6.6, 12.0, 4.2), frame="#c8ccd2", frame_w=0.15, X=(-10, 10), Y=(-9, 10))
    st = A["static"]
    Mt = tiles("sb_tiles", "#f1f3f6", "#c3c8d0", 1.0, 1.0, 1.0, 0.2, axis="XZ")
    # counter with sinks under the mirror
    box("sb_counter", (14, 2.4, 0.4), (0, 8.7, 3.6), mat("sb_counter", hexc("#dfe2e8"), 0.25), 0.04, coll=st)
    box("sb_cab", (14, 2.2, 3.4), (0, 8.8, 1.7), mat("sb_cab", hexc("#cfd5de"), 0.4), 0.04, coll=st)
    for i, x in enumerate((-4.5, 0, 4.5)):
        cyl(f"sb_sink{i}", 0.85, 0.25, (x, 8.6, 3.75), mat("sink", hexc("#f5f5f5"), 0.2), 24, coll=st)
        cyl(f"sb_fau{i}", 0.1, 0.9, (x, 9.6, 4.3), mat("chrome", hexc("#d0d4da"), 0.15, metal=1.0), 12, coll=st)
    # blue stalls on the front wall (seen in the mirror / behind the girl)
    Ms = mat("stall_blue", hexc("#3f6fd1"), 0.35)
    for i in range(5):
        x = -8 + i * 4.0
        box(f"sb_stall{i}", (3.7, 0.25, 8.5), (x, -7.0, 4.6), Ms, 0.05, coll=st)
        box(f"sb_div{i}", (0.25, 2.0, 8.5), (x + 1.95, -8.0, 4.6), Ms, 0.05, coll=st)
    # ceiling light panel
    card("sb_panel", 6.0, 2.0, (0, 2.0, A["H"] - 0.05), mat("sb_panel", (1, 1, 1), emit=(1, 1, 1), estr=8), "-Y", coll=st).rotation_euler = (math.radians(180), 0, 0)
    return A


def dad_bathroom():
    A = mirror_room("db", wall="#efe6da", mirror=(0.0, 6.5, 4.6, 5.0), frame="#cfcfcf", frame_w=0.2,
                    floor=tiles("db_floor", "#dad6cf", "#a8a29a", 0.5, 1.0, 1.0, 0.3, axis="XY"))
    st = A["static"]
    box("db_vanity", (6, 2.4, 3.6), (0, 8.7, 1.8), mat("db_vanity", hexc("#f0ece4"), 0.4), 0.05, coll=st)
    cyl("db_sink", 0.9, 0.25, (0, 8.6, 3.75), mat("sink", hexc("#f5f5f5"), 0.2), 24, coll=st)
    window("db_win", 8.9, 0.0, 7.0, 3.4, 3.4, st, "-X", sky=(1.0, 0.85, 0.7))
    return A


# ------------------------------------------------------------------ street at dusk
def street_dusk():
    c = collection("STREET")
    box("st_road", (80, 80, 0.4), (0, 20, -0.2), mat("asphalt", hexc("#3a3b44"), 0.8), 0, coll=c)
    Mz = mat("zebra", hexc("#e8e8ee"), 0.6)
    for i in range(7):
        box(f"st_zebra{i}", (14, 1.4, 0.05), (0, -4 + i * 2.6, 0.02), Mz, 0, coll=c)
    Mside = mat("sidewalk", hexc("#9a9aa2"), 0.8)
    for sx in (-1, 1):
        box(f"st_side{sx}", (8, 80, 0.6), (sx * 13, 20, 0.3), Mside, 0.05, coll=c)
    rnd = random.Random(2)
    cols = ["#c99a7a", "#b8b0c8", "#d7c1a1", "#a88fa8", "#c4a090"]
    for sx in (-1, 1):
        for i in range(6):
            h = rnd.uniform(14, 30); y = -6 + i * 9
            box(f"st_bld{sx}{i}", (8, 8.5, h), (sx * 21, y, h / 2), mat(f"bld{i % 5}", hexc(cols[i % 5]), 0.8), 0.1, coll=c)
            Mwin = mat("bld_win_lit", (1.0, 0.85, 0.6), emit=(1.0, 0.8, 0.5), estr=3.0)
            for k in range(int(h // 4)):
                for j in (-1, 1):
                    if rnd.random() < 0.6:
                        card(f"st_w{sx}{i}{k}{j}", 1.6, 2.0, (sx * 16.95, y + j * 2.2, 3 + k * 4), Mwin, "+X" if sx < 0 else "-X", coll=c)
    # car with headlights
    car = empty("car_root", (0, 34, 0), coll=c)
    Mcar = mat("car_body", hexc("#2a2c36"), 0.25, metal=0.5)
    box("car_body", (6.5, 12, 2.6), (0, 0, 2.0), Mcar, 0.4, coll=c).parent = car
    box("car_top", (5.6, 6.5, 2.2), (0, 0.8, 4.2), mat("car_glass", hexc("#11131a"), 0.1, metal=0.3), 0.4, coll=c).parent = car
    Mhl = mat("headlight", (1, 1, 1), emit=(1.0, 0.97, 0.9), estr=60)
    for sx in (-1, 1):
        sphere(f"car_hl{sx}", 0.5, (sx * 2.3, -6.0, 2.3), Mhl, (1, 0.4, 0.8), coll=c).parent = car
        cyl(f"car_wh{sx}", 1.0, 0.6, (sx * 3.1, -3.8, 1.0), mat("tire", hexc("#111111"), 0.7), 20, rot=(0, 90, 0), coll=c).parent = car
        cyl(f"car_whb{sx}", 1.0, 0.6, (sx * 3.1, 3.8, 1.0), mat("tire", hexc("#111111"), 0.7), 20, rot=(0, 90, 0), coll=c).parent = car
        sl = light(f"car_beam{sx}", "SPOT", (sx * 2.3, -6.3, 2.3), 6000, (1.0, 0.95, 0.85), 0.3, coll=c, spot=50, rot=(90, 0, 0))
        sl.parent = car
    return dict(coll=c, car=car)


def dusk_world(strength=1.0):
    w = D.worlds.new("Dusk"); bpy.context.scene.world = w
    w.use_nodes = True; nt = w.node_tree
    bg = next(n for n in nt.nodes if n.type == "BACKGROUND")
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    cr = nt.nodes.new("ShaderNodeValToRGB")
    cr.color_ramp.elements[0].position = 0.45; cr.color_ramp.elements[0].color = (1.0, 0.45, 0.55, 1)
    cr.color_ramp.elements[1].position = 0.75; cr.color_ramp.elements[1].color = (0.18, 0.2, 0.6, 1)
    nt.links.new(sep.outputs["Z"], cr.inputs[0]); nt.links.new(cr.outputs[0], bg.inputs[0])
    bg.inputs[1].default_value = strength


def sky_world(top=(0.35, 0.6, 1.0), bottom=(0.85, 0.92, 1.0), strength=1.0):
    w = D.worlds.new("Sky"); bpy.context.scene.world = w
    w.use_nodes = True; nt = w.node_tree
    bg = next(n for n in nt.nodes if n.type == "BACKGROUND")
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    cr = nt.nodes.new("ShaderNodeValToRGB")
    cr.color_ramp.elements[0].position = 0.5; cr.color_ramp.elements[0].color = (*bottom, 1)
    cr.color_ramp.elements[1].position = 0.8; cr.color_ramp.elements[1].color = (*top, 1)
    nt.links.new(sep.outputs["Z"], cr.inputs[0]); nt.links.new(cr.outputs[0], bg.inputs[0])
    bg.inputs[1].default_value = strength


# ------------------------------------------------------------------ living room
def living_room():
    c = collection("LIVING")
    box("lr_floor", (40, 40, 0.4), (0, 0, -0.2), planks("lr_floor", "#c9a27a", "#bd966e", "#7a5a40"), 0, coll=c)
    Mw = mat("lr_wall", hexc("#cfe0d6"), 0.85)
    box("lr_back", (40, 0.5, 14), (0, 10.25, 7), Mw, 0, coll=c)
    box("lr_trim", (40, 0.6, 1.4), (0, 9.9, 11.3), mat("lr_trim", hexc("#b04a3a"), 0.6), 0.05, coll=c)
    for i in range(4):
        window(f"lr_win{i}", -9 + i * 6, 9.95, 7.0, 4.2, 4.6, c, "-Y", sky=(0.85, 0.92, 1.0), estr=2.0)
    # red car outside
    box("lr_car", (6, 2, 2.5), (2, 14, 2.0), mat("redcar", hexc("#d03030"), 0.3), 0.3, coll=c)
    box("lr_out", (60, 0.4, 30), (0, 20, 10), mat("lr_outside", (0.8, 0.9, 1.0), emit=(0.8, 0.9, 1.0), estr=1.5), 0, coll=c)
    Mc = mat("couch", hexc("#4fb3b8"), 0.6)
    box("couch_seat", (10, 4, 1.6), (0, 6.5, 1.4), Mc, 0.4, coll=c)
    box("couch_back", (10, 1.4, 4.0), (0, 8.6, 2.6), Mc, 0.5, coll=c)
    for sx in (-1, 1):
        box(f"couch_arm{sx}", (1.4, 4.5, 2.8), (sx * 5.4, 6.6, 1.8), Mc, 0.5, coll=c)
    box("coffee_table", (6, 3, 0.35), (0, 0.5, 2.0), wood("wood_coffee", "#a0703f", "#c89260", 2.0), 0.05, coll=c)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(f"ct_leg{sx}{sy}", (0.3, 0.3, 1.9), (sx * 2.6, 0.5 + sy * 1.2, 0.95), mat("ct_leg", hexc("#704a2a"), 0.5), 0.02, coll=c)
    box("lr_phone", (0.6, 1.1, 0.08), (-1.6, 0.0, 2.22), mat("phone", hexc("#18181c"), 0.2), 0.04, coll=c, rot=(0, 0, 20))
    light("lr_key", "AREA", (0, -6, 12), 5000, (1.0, 0.97, 0.92), 10, coll=c, target=(0, 6, 2))
    light("lr_fill", "AREA", (-10, -4, 6), 1500, (0.9, 0.95, 1.0), 6, coll=c, target=(0, 6, 3))
    return dict(coll=c, seat=(0, 6.2, 2.2))


def mug(name, coll):
    return cyl(name, 0.35, 0.7, (0, 0, 0), mat("mug", hexc("#f4f4f4"), 0.3), 16, coll=coll)


# ------------------------------------------------------------------ dark house hall (night)
def dark_hall():
    c = collection("DHALL")
    Mw = mat("dh_wall", hexc("#3550a8"), 0.85)
    box("dh_floor", (12, 60, 0.4), (0, 15, -0.2), planks("dh_floor", "#5a3a2a", "#4e3224", "#2a1a12"), 0, coll=c)
    box("dh_rug", (4.5, 40, 0.06), (0, 12, 0.03), mat("dh_rug", hexc("#6a1f2a"), 0.9), 0, coll=c)
    box("dh_ceil", (12, 60, 0.4), (0, 15, 12.2), mat("dh_ceil", hexc("#1f2b5c"), 0.9), 0, coll=c)
    for sx in (-1, 1):
        box(f"dh_wall{sx}", (0.5, 60, 12), (sx * 5.25, 15, 6), Mw, 0, coll=c)
    box("dh_end", (12, 0.5, 12), (0, 40, 6), Mw, 0, coll=c)
    Mf = mat("dh_doorframe", hexc("#3a4e98"), 0.6)
    for i, y in enumerate((4, 16, 28)):
        for sx in (-1, 1):
            box(f"dh_df{i}{sx}a", (0.3, 0.4, 9), (sx * 4.95, y - 2.0, 4.5), Mf, 0.03, coll=c)
            box(f"dh_df{i}{sx}b", (0.3, 0.4, 9), (sx * 4.95, y + 2.0, 4.5), Mf, 0.03, coll=c)
            box(f"dh_dd{i}{sx}", (0.1, 3.6, 8.6), (sx * 5.0, y, 4.3), mat("dh_dark", hexc("#0d1020"), 0.9), 0, coll=c)
    # night lights (small warm plugs)
    Mn = mat("nightlight", (1, 0.75, 0.4), emit=(1.0, 0.7, 0.35), estr=25)
    for i, y in enumerate((0, 10, 22)):
        for sx in (-1, 1):
            box(f"dh_nl{i}{sx}", (0.15, 0.4, 0.5), (sx * 4.95, y + sx, 1.2), Mn, 0.04, coll=c)
            light(f"dh_nll{i}{sx}", "POINT", (sx * 4.6, y + sx, 1.3), 30, (1.0, 0.6, 0.3), 0.2, coll=c)
    card("dh_pic", 2.4, 1.8, (4.98, 20, 7.5), img_mat("picture", os.path.join(TEX, "picture.png"), 0.6), "-X", coll=c)
    # mirror at hall end (portal to dark mirrored hall: simple)
    light("dh_moon", "AREA", (0, 12, 11.5), 2200, (0.45, 0.55, 1.0), 10, coll=c, target=(0, 12, 0), size_y=24)
    light("dh_moon2", "AREA", (0, -6, 8), 1400, (0.4, 0.5, 1.0), 8, coll=c, target=(0, 20, 3))
    light("dh_moon3", "AREA", (0, 30, 11.5), 1200, (0.45, 0.55, 1.0), 8, coll=c, target=(0, 30, 0))
    return dict(coll=c)


def dark_mirror_end(y=40.0, coll=None):
    """Mirror at the end of the dark hall: a hole + mirrored corridor behind."""
    c = coll or collection("DHALL_MIR")
    D.objects.remove(D.objects["dh_end"], do_unlink=True)
    Mw = mat("dh_wall", hexc("#2c3f86"), 0.85)
    wall_with_hole("dh_endw", "y", y, (-6, 6), (0, 12), (-2.2, 2.2, 3.2, 9.6), 0.5, Mw, c, +1)
    frame_rect("dh_mf", "y", y, (0, 6.4), 4.4, 6.4, 0.3, 0.3, mat("dh_mframe", hexc("#151515"), 0.4), c)
    box("dh_mfloor", (12, 14, 0.4), (0, y + 7, -0.2), planks("dh_floor", "#5a3a2a", "#4e3224", "#2a1a12"), 0, coll=c)
    box("dh_mceil", (12, 14, 0.4), (0, y + 7, 12.2), mat("dh_ceil", hexc("#1f2b5c"), 0.9), 0, coll=c)
    for sx in (-1, 1):
        box(f"dh_mw{sx}", (0.5, 14, 12), (sx * 5.25, y + 7, 6), Mw, 0, coll=c)
    box("dh_mend", (12, 0.5, 12), (0, y + 14, 6), Mw, 0, coll=c)
    light("dh_mlight", "AREA", (0, y + 5, 11), 900, (0.4, 0.5, 1.0), 6, coll=c, target=(0, y + 5, 0))
    return c


# ------------------------------------------------------------------ school exterior
def school_exterior(fire_truck=False):
    c = collection("SCHOOL_EXT")
    box("se_lawn", (200, 200, 0.4), (0, 0, -0.2), mat("grass", hexc("#5fb04a"), 0.9), 0, coll=c)
    box("se_path", (10, 60, 0.1), (0, -20, 0.05), mat("path", hexc("#d9d6cf"), 0.8), 0, coll=c)
    box("se_plaza", (40, 10, 0.12), (0, 6, 0.06), mat("path", hexc("#d9d6cf"), 0.8), 0, coll=c)
    Mcream = mat("se_cream", hexc("#f1ede4"), 0.7)
    Mbrick = tiles("se_brick", "#b4533e", "#d9cfc4", 1.0, 1.6, 0.6, 0.85, c2="#a84a36", axis="XZ")
    # centre block
    box("se_center", (24, 12, 22), (0, 18, 11), Mcream, 0.1, coll=c)
    box("se_roof", (25, 13, 1.0), (0, 18, 22.5), mat("se_roofm", hexc("#d8d2c6"), 0.7), 0.1, coll=c)
    box("se_ped", (8, 1, 4), (0, 11.6, 24.0), Mcream, 0.1, coll=c)
    wall_clock("se_clock", (0, 11.0, 24.0), c, "-Y")
    for sx in (-1, 1):
        box(f"se_wing{sx}", (22, 11, 16), (sx * 23, 20, 8), Mbrick, 0.05, coll=c)
        for i in range(4):
            for k in range(2):
                window(f"se_ww{sx}{i}{k}", sx * (15 + i * 5), 14.4, 4.5 + k * 6.5, 3.0, 3.8, c, "-Y", sky=(0.6, 0.75, 0.9), estr=0.6)
    for i in range(3):
        window(f"se_cw{i}", -7 + i * 7, 11.95, 15.5, 3.4, 5.0, c, "-Y", sky=(0.55, 0.65, 0.8), estr=0.5)
    # entrance: canopy + columns + doors + sign
    box("se_canopy", (20, 7, 0.8), (0, 8.5, 9.0), Mcream, 0.08, coll=c)
    for x in (-9, -3, 3, 9):
        cyl(f"se_col{x}", 0.45, 9.0, (x, 5.6, 4.5), Mcream, 16, coll=c)
    Mdoor = mat("se_doors", hexc("#2a3038"), 0.2, metal=0.3)
    for i in range(4):
        box(f"se_door{i}", (2.6, 0.3, 6.5), (-5.4 + i * 3.6, 11.9, 3.25), Mdoor, 0.03, coll=c)
    card("se_sign", 16, 2.4, (0, 4.95, 10.0), img_mat("school_sign", os.path.join(TEX, "school_sign.png"), 0.5), "-Y", coll=c)
    # iron fence (foreground right)
    Mi = mat("iron", hexc("#151515"), 0.4, metal=0.6)
    for i in range(30):
        cyl(f"fence{i}", 0.08, 3.4, (6 + i * 0.55, -12, 1.7), Mi, 8, coll=c)
    for z in (0.6, 2.8):
        box(f"fence_rail{z}", (17, 0.15, 0.15), (14.2, -12, z), Mi, 0, coll=c)
    # trees / bushes
    for i, (x, y) in enumerate([(-30, 4), (32, 6), (-18, -8), (24, -6)]):
        sphere(f"bush{i}", 3.0, (x, y, 2.4), mat("bush", hexc("#3f8f3a"), 0.9), (1.4, 1.2, 1.0), coll=c)
    if fire_truck:
        tr = empty("truck_root", (-22, -2, 0), coll=c)
        Mr = mat("truck_red", hexc("#c4211c"), 0.3, metal=0.2)
        box("truck_body", (22, 7, 7), (0, 0, 4.2), Mr, 0.3, coll=c).parent = tr
        box("truck_cab", (6, 7, 8.5), (12, 0, 4.9), Mr, 0.3, coll=c).parent = tr
        box("truck_stripe", (28.2, 7.1, 0.7), (3, 0, 3.0), mat("stripe_w", hexc("#f2f2f2"), 0.4), 0.05, coll=c).parent = tr
        Mlb = mat("lightbar_red", (1, 0.1, 0.1), emit=(1, 0.1, 0.08), estr=30)
        box("truck_lb", (1, 5, 0.6), (12, 0, 9.4), Mlb, 0.1, coll=c).parent = tr
        lt = light("truck_flash", "POINT", (-10, -6, 9), 2500, (1, 0.1, 0.08), 1.0, coll=c)
        fx.flicker(lt, 0.9, 1.5)
    sun = light("se_sun", "SUN", (0, 0, 50), 4.0, (1.0, 0.96, 0.9), 2, coll=c, rot=(50, 0, 30))
    return dict(coll=c)


# ------------------------------------------------------------------ dark school corridor (firefighters)
def school_corridor_dark():
    c = collection("CORR")
    box("co_floor", (14, 70, 0.4), (0, 20, -0.2), checker_mat("co_floor", "#6c6a64", "#2a2a2c", 0.5, 0.35), 0, coll=c)
    box("co_ceil", (14, 70, 0.4), (0, 20, 12.2), tiles("co_ceil", "#5a5a5a", "#2a2a2a", 0.4, 1.0, 1.0, 0.9, axis="XY"), 0, coll=c)
    Mw = mat("co_wall", hexc("#8a8478"), 0.85)
    for sx in (-1, 1):
        box(f"co_wall{sx}", (0.5, 70, 12), (sx * 6.25, 20, 6), Mw, 0, coll=c)
    Mr = mat("co_locker_r", hexc("#a32a2a"), 0.45, metal=0.3)
    Mb = mat("co_locker_b", hexc("#2a3d8a"), 0.45, metal=0.3)
    for sx in (-1, 1):
        for i in range(28):
            y = -2 + i * 1.8
            if 12 < y < 18:
                continue
            box(f"co_lk{sx}{i}", (1.3, 1.75, 7.0), (sx * 5.3, y, 3.5), Mr if (i // 6) % 2 == 0 else Mb, 0.04, coll=c)
    # classroom doorway gap on the right at y 12..18
    box("co_doorway", (0.2, 4.5, 8.5), (6.0, 15, 4.25), mat("co_dark", hexc("#050505"), 0.9), 0, coll=c)
    light("co_amb", "AREA", (0, 14, 11.5), 900, (0.75, 0.82, 1.0), 10, coll=c, target=(0, 14, 0), size_y=30)
    return dict(coll=c)


def classroom():
    c = collection("CLASS")
    box("cl_floor", (30, 30, 0.4), (0, 5, -0.2), tiles("cl_floor", "#c9c3b4", "#9a9486", 0.35, 1.0, 1.0, 0.4, axis="XY"), 0, coll=c)
    box("cl_ceil", (30, 30, 0.4), (0, 5, 12.2), mat("cl_ceil", hexc("#d8d6d0"), 0.9), 0, coll=c)
    Mw = mat("cl_wall", hexc("#d6cfc2"), 0.85)
    box("cl_front", (30, 0.5, 12), (0, 16, 6), Mw, 0, coll=c)
    box("cl_lw", (0.5, 30, 12), (-12, 5, 6), Mw, 0, coll=c)
    box("cl_rw", (0.5, 30, 12), (12, 5, 6), Mw, 0, coll=c)
    card("cl_board", 12, 4.5, (-3, 15.7, 7.0), img_mat("chalkboard", os.path.join(TEX, "chalkboard.png"), 0.8), "-Y", coll=c)
    box("cl_tray", (12, 0.4, 0.2), (-3, 15.6, 4.7), mat("trim_white", hexc("#f6f2ea"), 0.5), 0, coll=c)
    for i in range(2):
        window(f"cl_win{i}", 4 + i * 4.6, 15.7, 7.5, 3.6, 5.0, c, "-Y", sky=(1.0, 1.0, 1.0), estr=6.0)
    box("cl_shelf", (3, 1.5, 3), (-9.5, 14.8, 1.5), wood("wood_cab", "#6e4229", "#a06a45", 2.0), 0.05, coll=c)
    Md = wood("wood_desk", "#8a5634", "#c48a58", 1.5)
    Mleg = mat("desk_leg", hexc("#2a2a2a"), 0.4, metal=0.6)
    Mch = mat("chair_blue", hexc("#2a4fb0"), 0.4)
    for r in range(3):
        for k in range(3):
            x = -6 + k * 6; y = 10 - r * 5
            box(f"cl_desk{r}{k}", (3.2, 2.0, 0.2), (x, y, 3.4), Md, 0.03, coll=c)
            for sx in (-1, 1):
                for sy in (-1, 1):
                    box(f"cl_dl{r}{k}{sx}{sy}", (0.12, 0.12, 3.3), (x + sx * 1.4, y + sy * 0.8, 1.65), Mleg, 0, coll=c)
            box(f"cl_seat{r}{k}", (1.8, 1.6, 0.2), (x, y - 1.8, 2.1), Mch, 0.05, coll=c)
            box(f"cl_cback{r}{k}", (1.8, 0.2, 1.6), (x, y - 2.6, 3.0), Mch, 0.05, coll=c)
            if (r + k) % 3 == 0:
                box(f"cl_book{r}{k}", (1.0, 0.7, 0.15), (x + 0.4, y, 3.6), mat("book_red", hexc("#c0302a"), 0.6), 0.02, coll=c)
    light("cl_win_l", "AREA", (6, 15.2, 7.5), 2500, (0.95, 0.97, 1.0), 6, coll=c, target=(0, 0, 2))
    light("cl_amb", "AREA", (0, 4, 11.5), 300, (0.8, 0.85, 1.0), 10, coll=c, target=(0, 4, 0))
    return dict(coll=c)


# ------------------------------------------------------------------ props
def hand_prop(ch, side, obj, offset=(0, -0.6, -1.9), rot=(0, 0, 0)):
    """Parent a prop to a character's arm pivot (hand end)."""
    piv = ch.shL if side == "L" else ch.shR
    obj.parent = piv
    obj.location = offset
    obj.rotation_euler = [math.radians(a) for a in rot]
    return obj


def paper_prop(name, tex, w, h, coll, rough=0.6):
    m = img_mat(name + "_m", os.path.join(TEX, tex), rough)
    ob = plane(name, w, h, (0, 0, 0), m, (90, 0, 0), None, coll)
    return ob


def shadow_monster(name, coll, scale=2.6):
    """Huge dark silhouette that moves through the smoke."""
    from .chars import Char
    ch = Char(name, skin="#0b0908", shirt="#0b0908", pants="#0b0908", hair="messy", hair_color="#0b0908",
              face=None, coll=coll, scale=scale)
    Me = mat("monster_eyes", (1, 0.3, 0.1), emit=(1, 0.35, 0.1), estr=40)
    for sx in (-1, 1):
        sphere(f"{name}_eye{sx}", 0.08, (sx * 0.25, -0.62, 0.15), Me, parent=ch.head, coll=coll, seg=8)
    return ch


def bundle(name, coll):
    """Dark bundle held in arms (the 'something')."""
    M = mat("bundle_char", hexc("#141110"), 0.85)
    root = empty(name, (0, 0, 0), coll=coll)
    rnd = random.Random(9)
    for i in range(7):
        sphere(f"{name}{i}", rnd.uniform(0.45, 0.7), (rnd.uniform(-0.6, 0.6), rnd.uniform(-0.3, 0.3), rnd.uniform(-0.3, 0.3)), M,
               (1.2, 1.0, 0.8), parent=root, coll=coll, seg=12)
    sphere(name + "_ember", 0.08, (0.3, -0.7, 0.2), mat("bundle_ember", (1, 0.4, 0.1), emit=(1, 0.4, 0.1), estr=30), parent=root, coll=coll, seg=8)
    return root


def clock_closeup(night=True):
    c = collection("CLOCK")
    box("ck_table", (12, 8, 0.6), (0, 0, -0.3), wood("wood_dark", "#6e4229", "#a06a45", 2.5), 0.05, coll=c)
    box("ck_body", (5.2, 2.0, 2.4), (0, 0, 1.2), mat("ck_body", hexc("#1d1416"), 0.35), 0.25, coll=c)
    m1 = img_mat("ck_1159", os.path.join(TEX, "clock_1159.png"), 0.3, emit=3.0)
    m2 = img_mat("ck_1200", os.path.join(TEX, "clock_1200.png"), 0.3, emit=3.0)
    d1 = card("ck_disp1", 4.4, 1.75, (0, -1.02, 1.3), m1, "-Y", coll=c)
    d2 = card("ck_disp2", 4.4, 1.75, (0, -1.021, 1.3), m2, "-Y", coll=c)
    box("ck_wall", (40, 0.5, 30), (0, 6, 10), mat("br_wall_n", hexc("#2a3a70"), 0.9), 0, coll=c)
    light("ck_glow", "POINT", (0, -2.0, 1.4), 60, (1.0, 0.1, 0.08), 0.5, coll=c)
    light("ck_moon", "AREA", (-6, -6, 8), 250, (0.4, 0.55, 1.0), 6, coll=c, target=(0, 0, 1))
    return dict(coll=c, d1=d1, d2=d2)
