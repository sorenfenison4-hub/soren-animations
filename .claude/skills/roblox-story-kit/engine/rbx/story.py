"""Shared story toolkit for studio videos (runs inside Blender, after shotkit is imported).

In videos/<slug>/shots.py:
    from shotkit import *
    from rbx import story
    from rbx.story import *
    V = Video(__file__); story.bind(V)
    @S(1, 0, 7, "desc")          # shot 1 = script words 0..7 (None = to the end)
    def s01(t0, t1): ...

Cast: eddie, leo, pickle, grandma, pilot, mayor, gus, townie(i)  (each gets blinks + breathing).
Acting: laugh, drift, dangle, fly, look_at, facing, lips (lip flaps on the narration words).
Scenes: class_scene (+kids_float), sky_scene/cloud_ring, town_scene.
Crowds: crowd_src (hidden source group) + crowd (instances that rise/drift), human_chain.
FX/props: confetti, stars_ring, backpack, pencil, spin, puff, earth.
See also rbx.world (W) and rbx.world2 (W2) for sets, props, poof/vanish/appear/sneeze."""
import math, os, random
import bpy
from mathutils import Vector
from .core import *            # noqa: F401,F403
from .core import D, F
from . import chars, sets, acting, world as W   # noqa: F401

V = None
FH = 4.62                                  # root -> head centre (scale 1)
E_DESK, L_DESK = (2.5, 7.0), (7.5, 7.0)    # front row of W.classroom_day
E_SEAT, L_SEAT = W.seat_pos(E_DESK), W.seat_pos(L_DESK)
GUS = (0.0, -30.0, 0.0)                    # open street in front of the school in W.town


def bind(video):
    global V
    V = video


def w(i):
    return V.w(i)


def S(i, a, b, desc=""):
    t0 = w(a)
    t1 = V.end if b is None else w(b)

    def deco(fn):
        V.shot(i, t0, t1, desc)(lambda: (random.seed(i), fn(t0, t1)))
        return fn
    return deco


def up(p, z):
    return (p[0], p[1], p[2] + z)


# ------------------------------------------------------------------ cast
def _live(ch, t0, t1, expr="neutral", br=0.8):
    ch.face(t0, expr)
    ch.blink(t0, t1)
    ch.breathe(br)
    return ch


def eddie(t0, t1, expr="neutral", **kw):
    return _live(chars.eddie(**kw), t0, t1, expr)


def leo(t0, t1, expr="neutral", **kw):
    return _live(chars.Char("Leo", skin="#d9b48f", shirt="#4fbf5a", pants="#2f3f6a", hair="messy",
                            hair_color="#1d1714", face="kid", vneck="#8fe39a", **kw), t0, t1, expr)


def pickle(t0, t1, expr="happy", toupee=True):
    P = chars.Char("Pickle", skin="#f0dcc3", shirt="#5e9a3e", pants="#4a3f30", hair="bald", face="mustache",
                   sleeves="long", extras=("glasses",), vneck="#f4f4f4")
    _live(P, t0, t1, expr)
    P.toupee = None
    if toupee:
        tp = W.toupee("Pickle_toupee", coll=P.coll)
        tp.parent = P.head
        tp.location = (0, 0.05, 0.62)
        P.toupee = tp
    return P


def grandma(t0, t1, expr="joy"):
    G = chars.Char("Grandma", skin="#f2dcc8", shirt="#9a6ad6", pants="#6a5a8a", hair="bun", hair_color="#dcdcdc",
                   face="girl", sleeves="long", extras=("glasses",))
    Mw = mat("ankle_weight", hexc("#2b2d33"), 0.5, metal=0.4)
    for piv in (G.hpL, G.hpR):
        box(G.name + piv.name + "_w", (1.3, 1.3, 0.55), (0, 0, -1.6), Mw, 0.12, parent=piv, coll=G.coll)
        box(G.name + piv.name + "_wb", (1.34, 1.34, 0.12), (0, 0, -1.6), mat("weight_band", hexc("#e2b23a"), 0.4), 0.02,
            parent=piv, coll=G.coll)
    return _live(G, t0, t1, expr)


def pilot(t0, t1, expr="happy", name="Pilot", shirt="#f4f4f4"):
    return _live(chars.Char(name, skin="#c99a72", shirt=shirt, pants="#1e2a4a", hair="pilot", face="mustache",
                            extras=("collar:#1e2a4a",)), t0, t1, expr)


def mayor(t0, t1, expr="joy"):
    M = chars.Char("Mayor", skin="#efd9c0", shirt="#22232a", pants="#22232a", hair="tophat", face="mustache",
                   sleeves="long", extras=("collar:#f4f4f4",))
    box("Mayor_tie", (0.36, 0.06, 1.3), (0, -0.57, 1.25), mat("tie_red", hexc("#c8261e"), 0.4), 0.03,
        parent=M.hip, coll=M.coll)
    box("Mayor_sash", (0.3, 0.05, 2.3), (0.35, -0.55, 1.05), mat("sash_gold", hexc("#e2b23a"), 0.35, 0.4), 0.02,
        parent=M.hip, coll=M.coll, rot=(0, 30, 0))
    return _live(M, t0, t1, expr)


def gus(t0, t1, expr=None, loc=GUS, rot=0):
    G = chars.Char("Gus", skin="#e9cdb0", shirt="#6f7580", pants="#353a45", hair="buzz", hair_color="#3a2a1e",
                   face="villain", sleeves="long", scale=1.35)
    G.pose(t0, loc=loc, rot=rot)
    _live(G, t0, t1, "neutral", 0.5)
    G.face(t0, eyes="normal", mouth="frown")
    if expr:
        G.face(t0, expr)
    return G


def townie(i, t0, t1, expr="neutral", **kw):
    return _live(chars.kid(i, **kw), t0, t1, expr)


# ------------------------------------------------------------------ acting helpers
def laugh(ch, t0, t1, rate=5.0, belly=True, flail=False, expr="joy", amp=1.0, eyes=None):
    ch.face(t0, expr)
    if eyes:
        ch.face(t0, eyes=eyes)
    ch.talk(t0, t1, open_m="laugh", wide_m="open_smile", rest="laugh", syll=0.1)
    t, k = t0, 0
    while t < t1:
        s = 1 if k % 2 == 0 else -1
        ch.pose(t, torso=(0, (-5 + 5 * s) * amp, 3 * s * amp), head=(4 * s * amp, (-16 + 7 * s) * amp, 5 * s * amp))
        t += 1.0 / rate
        k += 1
    if flail:
        ch.panic(t0, t1, rate=5.0)
    elif belly:
        ch.pose(t0, armL=(42, -30), armR=(42, -30))
    return ch


def drift(ch, s=1.0):
    noise(ch.root, "rotation_euler", 0, 0.05 * s, 14)
    noise(ch.root, "rotation_euler", 1, 0.07 * s, 17)
    noise(ch.root, "location", 2, 0.12 * s, 22)
    return ch


def dangle(ch, t0, t1):
    ch.pose(t0, legL=(-14, 6), legR=(20, -6))
    ch.pose(t1, legL=(16, 8), legR=(-12, -8))
    return ch


def fly(ch, t0, t1, p0, p1, interp="BEZIER", ease=None, rot=None):
    kw = {} if rot is None else dict(rot=rot)
    ch.pose(t0, loc=p0, **kw)
    ch.pose(t1, loc=p1)
    if ease:
        set_interp(ch.root, "location", F(t0), interp, ease)
    return ch


def look_at(ch, t, pt, settle=0.15):
    r = math.degrees(ch.root.rotation_euler[2])
    p = Vector(ch.root.location)
    d = Vector(pt) - (p + Vector((0, 0, FH * ch.root.scale[2])))
    phi = math.degrees(math.atan2(d.x, -d.y))
    yaw = max(-75, min(75, (phi - r + 180) % 360 - 180))
    pitch = max(-40, min(35, -math.degrees(math.atan2(d.z, math.hypot(d.x, d.y)))))
    ch.look(t, yaw, pitch, settle=settle)
    return ch


def facing(frm, to):
    """Root yaw so a character at frm faces the point to."""
    return math.degrees(math.atan2(to[0] - frm[0], -(to[1] - frm[1])))


def lips(ch, t0, t1, mode="talk"):
    words = V.span(t0, t1)
    if mode == "shout":
        ch.talk(t0, t1, words, open_m="talk_wide", wide_m="scream", rest="grimace")
    elif mode == "laugh":
        ch.talk(t0, t1, words, open_m="laugh", wide_m="open_smile", rest="laugh")
    else:
        ch.talk(t0, t1, words)
    return ch


# ------------------------------------------------------------------ scenes
def class_scene(t0, t1, kids=8, sash=None, board="chalk_joke.png", skip=()):
    world((0.85, 0.9, 1.0), 0.45)
    R = W.classroom_day(board=board)
    h = R["sash"]
    if sash == "open":
        h.rotation_euler[2] = math.radians(100)
        h.keyframe_insert("rotation_euler", index=2, frame=F(t0))
    elif sash is not None:
        for dt, a in ((0.0, 0), (0.12, 118), (0.3, 100)):
            h.rotation_euler[2] = math.radians(a)
            h.keyframe_insert("rotation_euler", index=2, frame=F(sash + dt))
    ks = []
    desks = [d for d in R["desks"] if d not in (E_DESK, L_DESK) and d not in skip]
    for i, d in enumerate(desks[:kids]):
        k = townie(i, t0, t1)
        W.sit(k, t0, d)
        k.desk = d
        ks.append(k)
    return R, ks


def kids_float(ks, t0, t1, h0=0.3, h1=4.5, seed=3, laughing=True, cap=6.6):
    rnd = random.Random(seed)
    for k in ks:
        sx, sy, sz = W.seat_pos(k.desk)
        a = h0 + rnd.uniform(-0.2, 0.5)
        b = min(cap, h1 + rnd.uniform(-1.0, 1.2))
        k.pose(t0, loc=(sx, sy, sz + a), rot=180 + rnd.uniform(-25, 25), legL=(-10, 8), legR=(22, -6))
        k.pose(t1, loc=(sx + rnd.uniform(-0.8, 0.8), sy + rnd.uniform(-0.8, 0.8), sz + b), legL=(18, 8), legR=(-12, -8))
        drift(k, 1.2)
        if laughing:
            laugh(k, t0, t1, flail=rnd.random() < 0.5, rate=rnd.uniform(4.0, 6.0))
    return ks


def cloud_ring(center, r0=22, r1=80, n=22, seed=1, dz=(-14, 10), scale=(1.4, 3.2)):
    rnd = random.Random(seed)
    for i in range(n):
        a = rnd.uniform(0, math.tau)
        r = rnd.uniform(r0, r1)
        p = (center[0] + math.cos(a) * r, center[1] + math.sin(a) * r, center[2] + rnd.uniform(*dz))
        W.cloud(f"cr{seed}_{i}", p, rnd.uniform(*scale), None, seed * 100 + i)


def sky_scene(center=(0, 0, 60), seed=4, n=22):
    W.sky(1.0)
    W.sun(4.0, rot=(52, 0, 30))
    cloud_ring(center, n=n, seed=seed)


def town_scene(banner=None):
    W.sky(1.0)
    return W.town(banner=banner)


def crowd_src(name, t0, t1, ids, mode="laugh", spread=4.0, seed=0, up_arms=False):
    """A hidden source group of a few people (instanced many times)."""
    src = D.collections.new(name)
    rnd = random.Random(seed)
    for j, i in enumerate(ids):
        k = chars.kid(i, coll=src)
        p = (rnd.uniform(-spread, spread), rnd.uniform(-spread, spread), rnd.uniform(-0.6, 0.6)) if spread else (0, 0, 0)
        k.pose(t0, loc=p, rot=rnd.uniform(-35, 35) if spread else 0)
        k.blink(t0, t1)
        if mode == "laugh":
            laugh(k, t0, t1, flail=True, rate=rnd.uniform(4, 6))
            dangle(k, t0, t1)
        elif mode == "chain":
            k.face(t0, "joy")
            k.pose(t0, armL=(176, 6), armR=(176, 6), legL=(6, 2), legR=(-6, 2))
            k.talk(t0, t1, open_m="laugh", wide_m="open_smile", rest="laugh", syll=0.13)
        elif mode == "cheer":
            k.face(t0, "joy")
            k.act(t0, "cheer")
            k.jump(t0 + rnd.uniform(0, 0.3), 1.2, 0.45)
            k.talk(t0, t1, open_m="open_smile", wide_m="laugh", rest="open_smile", syll=0.12)
        elif mode == "lookup":
            k.face(t0, "lookup")
            k.pose(t0, head=(0, -32, 0))
    return src


def crowd(src, t0, t1, n, area, z0=(0, 0), z1=(0, 0), delay=(0.0, 0.0), seed=0, scale=1.0, interp="BEZIER", ease=None):
    """n instances of src scattered in area ((x0,x1),(y0,y1)), rising from z0 to z1 (ranges)."""
    rnd = random.Random(seed)
    out = []
    for i in range(n):
        x, y = rnd.uniform(*area[0]), rnd.uniform(*area[1])
        a, b = rnd.uniform(*z0), rnd.uniform(*z1)
        ob = instance(f"{src.name}_i{i}", src, (x, y, a), (scale,) * 3, rot=(0, 0, rnd.uniform(-180, 180)))
        ts = t0 + rnd.uniform(*delay)
        ob.keyframe_insert("location", frame=F(t0))
        ob.keyframe_insert("location", frame=F(ts))
        ob.location = (x + rnd.uniform(-2, 2), y + rnd.uniform(-2, 2), b)
        ob.keyframe_insert("location", frame=F(t1))
        if ease:
            set_interp(ob, "location", F(ts), interp, ease)
        noise(ob, "rotation_euler", 1, 0.06, 15)
        out.append(ob)
    return out


def human_chain(t0, t1, n, base, spacing=5.6, seed=7):
    """Vertical chain of people (arms up) from base (bottom feet) upward. Returns the pivot empty."""
    srcs = [crowd_src(f"CHAIN{j}", t0, t1, [200 + seed * 10 + j], mode="chain", spread=0) for j in range(4)]
    piv = empty("chain_pivot", base)
    for i in range(n):
        ob = instance(f"chain{i}", srcs[(i * 3 + seed) % 4], (0, 0, i * spacing), rot=(0, 0, (i * 37) % 60 - 30))
        ob.parent = piv
        noise(ob, "rotation_euler", 0, 0.04, 20)
        noise(ob, "rotation_euler", 1, 0.05, 23)
    return piv


def confetti(prefix, center, spread, t0, dur=1.4, n=70, seed=0, fall=12):
    rnd = random.Random(seed)
    cols = ["#e8574a", "#4aa5e8", "#f2c14e", "#63c06a", "#f09ac2", "#9b6ad6", "#ffffff"]
    for i in range(n):
        p = (center[0] + rnd.uniform(-spread[0], spread[0]), center[1] + rnd.uniform(-spread[1], spread[1]),
             center[2] + rnd.uniform(0, spread[2]))
        c = cols[i % len(cols)]
        ob = plane(f"{prefix}{i}", 0.42, 0.26, p, mat("conf" + c, hexc(c), 0.4, emit=hexc(c), estr=0.4),
                   rot=(rnd.uniform(0, 180), rnd.uniform(0, 180), rnd.uniform(0, 180)))
        sets.set_obj_visible(ob, t0 - 0.05, False)
        sets.set_obj_visible(ob, t0, True)
        ob.keyframe_insert("location", frame=F(t0))
        ob.location = (p[0] + rnd.uniform(-2, 2), p[1] + rnd.uniform(-2, 2), p[2] - fall * rnd.uniform(0.6, 1.0))
        ob.keyframe_insert("location", frame=F(t0 + dur))
        for ax in range(3):
            noise(ob, "rotation_euler", ax, 3.0, 5)


def stars_ring(ch, t0, t1, z=5.8):
    piv = empty(ch.name + "_stars", (0, 0, z), parent=ch.root)
    Ms = mat("star_yellow", hexc("#ffd23a"), 0.3, emit=hexc("#ffd23a"), estr=3.0)
    for i in range(3):
        a = i / 3 * math.tau
        sphere(f"{ch.name}_star{i}", 0.17, (math.cos(a) * 1.0, math.sin(a) * 1.0, 0), Ms, (1, 1, 0.5), parent=piv)
    piv.keyframe_insert("rotation_euler", index=2, frame=F(t0))
    piv.rotation_euler[2] = math.tau * 2.5
    piv.keyframe_insert("rotation_euler", index=2, frame=F(t1))
    set_interp(piv, "rotation_euler", F(t0), "LINEAR")
    return piv


def backpack(name, loc, color):
    root = empty(name, loc)
    M = mat("bp_" + color, hexc(color), 0.55)
    box(name + "_b", (1.5, 0.7, 1.7), (0, 0, 0), M, 0.14, parent=root)
    box(name + "_p", (1.1, 0.25, 0.8), (0, -0.45, -0.25), M, 0.1, parent=root)
    box(name + "_s", (0.2, 0.9, 0.08), (0.45, 0.1, 0.86), mat("bp_strap", hexc("#3a2a20"), 0.6), 0.02, parent=root)
    return root


def pencil(name, loc, rot=(0, 0, 0)):
    root = empty(name, loc, rot=rot)
    cyl(name + "_b", 0.09, 1.4, (0, 0, 0), mat("pencil_y", hexc("#f2c14e"), 0.4), 6, parent=root)
    cyl(name + "_t", 0.09, 0.3, (0, 0, -0.85), mat("pencil_w", hexc("#e8c9a0"), 0.6), 6, parent=root, r2=0.01)
    cyl(name + "_e", 0.09, 0.18, (0, 0, 0.79), mat("pencil_p", hexc("#f09ac2"), 0.6), 6, parent=root)
    return root


def spin(ob, t0, t1, rise, turns=(0.6, 0.4, 0.3), seed=0):
    rnd = random.Random(seed)
    ob.keyframe_insert("location", frame=F(t0))
    ob.keyframe_insert("rotation_euler", frame=F(t0))
    ob.location = (ob.location[0] + rnd.uniform(-0.6, 0.6), ob.location[1] + rnd.uniform(-0.6, 0.6), ob.location[2] + rise)
    ob.rotation_euler = [ob.rotation_euler[i] + turns[i] * math.tau * rnd.uniform(-1, 1) for i in range(3)]
    ob.keyframe_insert("location", frame=F(t1))
    ob.keyframe_insert("rotation_euler", frame=F(t1))


def puff(name, loc, t, r=1.4):
    ob = sphere(name, r, loc, mat("puff_white", (0.95, 0.95, 0.95), 0.9, emit=(0.6, 0.6, 0.6), estr=0.4), seg=16)
    ob.scale = (0.01,) * 3
    ob.keyframe_insert("scale", frame=F(t - 0.04))
    ob.scale = (1.2, 1.2, 0.8)
    ob.keyframe_insert("scale", frame=F(t + 0.18))
    ob.scale = (0.01,) * 3
    ob.keyframe_insert("scale", frame=F(t + 0.6))
    return ob


def earth(loc=(0, 0, -62), r=52):
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
    sphere("earth", r, loc, m, seg=64)
    sphere("earth_atmo", r * 1.03, loc, mat("atmo", (0.4, 0.7, 1.0), 0.5, emit=(0.4, 0.7, 1.0), estr=0.6, alpha=0.18), seg=64)


