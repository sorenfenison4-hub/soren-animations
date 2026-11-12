"""laugh_float: "In this world, laughing makes you float." 73 shots keyed to script word indices."""
from shotkit import *
import math, random
from mathutils import Vector

V = Video(__file__)
w = V.w
FH = 4.62                                  # root -> head centre (scale 1)
E_DESK, L_DESK = (2.5, 7.0), (7.5, 7.0)    # front row, next to each other
E_SEAT, L_SEAT = W.seat_pos(E_DESK), W.seat_pos(L_DESK)
GUS = (0.0, -30.0, 0.0)                    # Gus stands on the road in front of the school


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
def class_scene(t0, t1, kids=8, sash=None):
    world((0.85, 0.9, 1.0), 0.45)
    R = W.classroom_day()
    h = R["sash"]
    if sash == "open":
        h.rotation_euler[2] = math.radians(100)
        h.keyframe_insert("rotation_euler", index=2, frame=F(t0))
    elif sash is not None:
        for dt, a in ((0.0, 0), (0.12, 118), (0.3, 100)):
            h.rotation_euler[2] = math.radians(a)
            h.keyframe_insert("rotation_euler", index=2, frame=F(sash + dt))
    ks = []
    desks = [d for d in R["desks"] if d not in (E_DESK, L_DESK)]
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


def town_scene(banner=True):
    W.sky(1.0)
    return W.town(banner="banner_joke.png" if banner else None)


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


# ================================================================== HOOK (0 - 15s)
@S(1, 0, 7, "HOOK: Eddie bursts out laughing, already floating out of his chair")
def s01(t0, t1):
    R, ks = class_scene(t0, t1, kids=8)
    E = eddie(t0, t1, "joy")
    sx, sy, sz = E_SEAT
    E.pose(t0, loc=(sx, sy, sz + 0.5), rot=180, legL=(70, 4), legR=(80, -4))
    E.pose(t1, loc=(sx, sy - 0.3, sz + 2.6), legL=(10, 8), legR=(-14, -8))
    laugh(E, t0, t1, flail=True)
    drift(E)
    for k in ks:
        k.face(t0 + 0.1, "gasp")
        look_at(k, t0 + 0.05, (sx, sy, sz + 6))
    cam = Cam()
    cam.push(t0, t1, (sx, sy, sz + 6.0), 6.0, 9.0, yaw=150, pitch=-6, lens=24, yaw1=200, pitch1=6, lens1=24)
    cam.handheld(1.2)
    sfx(0.0, "whoosh")
    sfx(0.1, "rise")


@S(2, 7, 15, "Exterior: Eddie bursts out of a school window and soars up")
def s02(t0, t1):
    town_scene()
    E = eddie(t0, t1, "joy")
    p0, p1 = (-20, 13.0, 8.5), (-16.5, 4.0, 22.0)
    fly(E, t0, t1, p0, p1, rot=-15)
    dangle(E, t0, t1)
    laugh(E, t0, t1, flail=True)
    drift(E)
    Mg = mat("shard", (0.85, 0.92, 1.0), 0.05, alpha=0.4, spec=1.0)
    for i in range(10):
        sh = box(f"shard{i}", (0.5, 0.05, 0.4), (-20 + random.uniform(-1.4, 1.4), 14.2, 11 + random.uniform(-1.5, 1.5)), Mg, 0)
        spin(sh, t0, t0 + 0.9, -6.0, seed=i)
        sh.keyframe_insert("location", frame=F(t0 + 0.9))
    cam = Cam()
    cam.key(t0, (-10, -13, 3.5), up(p0, 4.0), lens=22, focus=up(p0, 4), fstop=8)
    cam.key(t1, (-10, -10, 9.5), up(p1, 4.0), lens=22, focus=up(p1, 4), fstop=8)
    cam.handheld(1.0)
    sfx(t0, "window")
    sfx(t0 + 0.1, "whoosh")


@S(3, 15, 21, "Leo cracks up at his desk and starts to lift")
def s03(t0, t1):
    R, ks = class_scene(t0, t1, kids=6, sash="open")
    L = leo(t0, t1, "joy")
    sx, sy, sz = L_SEAT
    W.sit(L, t0, L_DESK)
    L.pose(t1, loc=(sx, sy, sz + 1.4), legL=(40, 6), legR=(55, -6))
    laugh(L, t0, t1, belly=True, amp=1.2)
    drift(L, 0.6)
    tgt = (sx, sy, sz + FH + 0.6)
    for k in ks:
        look_at(k, t0 + 0.2, tgt)
    cam = Cam()
    cam.push(t0, t1, tgt, 7.5, 5.0, yaw=205, pitch=4, lens=28, yaw1=190)
    cam.crash(t0, 22, 28, 0.15)
    cam.handheld(1.0)
    sfx(t0, "pop")


@S(4, 21, 26, "Exterior: Leo rockets out of the window after Eddie")
def s04(t0, t1):
    town_scene()
    L = leo(t0, t1, "joy")
    E = eddie(t0, t1, "joy")
    pL0, pL1 = (-20, 13.0, 8.5), (-18, 5.0, 24.0)
    fly(L, t0, t1, pL0, pL1, rot=10)
    fly(E, t0, t1, (-15.5, 3.0, 26.0), (-14.5, 1.0, 31.0), rot=-20)
    for c in (L, E):
        dangle(c, t0, t1)
        laugh(c, t0, t1, flail=True)
        drift(c)
    cam = Cam()
    cam.key(t0, (-11, -12, 5), up(pL0, 4), lens=24, focus=up(pL0, 4), fstop=8)
    cam.key(t1, (-11, -10, 12), (-16, 3, 29), lens=20, focus=25.0, fstop=8)
    cam.handheld(1.0)
    sfx(t0, "whoosh")


@S(5, 26, 31, "Aerial: Eddie and Leo floating high over the town")
def s05(t0, t1):
    town_scene()
    cloud_ring((0, 0, 150), 10, 160, 16, seed=2, dz=(-4, 6))
    cloud_ring((0, 0, 80), 40, 160, 10, seed=3, dz=(-4, 6))
    E = eddie(t0, t1, "joy")
    L = leo(t0, t1, "joy")
    fly(E, t0, t1, (-2, 0, 118), (-2, 0.5, 119.5), rot=20)
    fly(L, t0, t1, (3, 1.5, 117), (3.2, 2, 118.8), rot=-25)
    for c in (E, L):
        dangle(c, t0, t1)
        laugh(c, t0, t1, flail=True, amp=0.8)
        drift(c)
    cam = Cam()
    cam.orbit(t0, t1, (0.5, 0.8, 121), 15, 15, 60, pitch=34, lens=24, fstop=11)
    cam.handheld(0.8)
    sfx(t0, "wind", 0.6, dur=1.0)


@S(6, 31, 37, "Sky close: Eddie laughing in the clouds, weightless")
def s06(t0, t1):
    sky_scene(seed=4)
    E = eddie(t0, t1, "joy")
    fly(E, t0, t1, (0, 0, 60), (0, 0, 61.2), rot=0)
    dangle(E, t0, t1)
    laugh(E, t0, t1, belly=True)
    drift(E)
    cam = Cam()
    cam.push(t0, t1, (0, 0, 64.8), 8.0, 5.0, yaw=-25, pitch=6, lens=30, yaw1=10)
    cam.handheld(0.8)
    sfx(t0 + 0.1, "sparkle", 0.6)


@S(7, 37, 45, "The harder he laughs the higher he goes: Eddie rockets up, camera tilts")
def s07(t0, t1):
    sky_scene(seed=5)
    E = eddie(t0, t1, "joy")
    fly(E, t0, t1, (0, 0, 60), (0, 0, 74), interp="QUAD", ease="EASE_IN", rot=0)
    dangle(E, t0, t1)
    laugh(E, t0, t1, flail=True, amp=1.3, eyes="cry")
    drift(E)
    cam = Cam()
    cam.key(t0, (0, -9, 58), (0, 0, 64), lens=22, focus=9.0, fstop=4)
    cam.key(t1, (0, -8, 61), (0, 0, 76), lens=20, focus=16.0, fstop=4)
    cam.handheld(1.0)
    sfx(t0 + 0.2, "rise")
    sfx(w(42), "whoosh")


@S(8, 45, 54, "Comedy club: the audience pinned against the ceiling net")
def s08(t0, t1):
    world((0.12, 0.09, 0.14), 0.4)
    W.comedy_club()
    comic = townie(40, t0, t1, "happy", shirt="#d9453a")
    comic.pose(t0, loc=(0, 4.2, 1.2), rot=0)
    comic.act(t0, "point")
    rnd = random.Random(8)
    aud = []
    for i in range(7):
        k = townie(41 + i, t0, t1, "joy")
        p = (-7 + i * 2.3 + rnd.uniform(-0.4, 0.4), -4.5 + rnd.uniform(-2.5, 2.5), 6.3)
        k.pose(t0, loc=p, rot=180 + rnd.uniform(-30, 30), torso=(0, -10, 0))
        laugh(k, t0, t1, flail=True, rate=rnd.uniform(4, 6))
        dangle(k, t0, t1)
        drift(k, 0.5)
        aud.append(k)
    cam = Cam()
    cam.key(t0, (5.0, 6.4, 5.0), (-1, -3, 9.2), lens=20, focus=(0, -4, 9), fstop=5)
    cam.key(t1, (4.2, 5.0, 6.0), (-1, -3, 10.0), lens=20, focus=(0, -4, 9.5), fstop=5)
    cam.handheld(0.9)
    sfx(t0, "kids_laugh", 0.7, dur=1.6)


@S(9, 54, 60, "Cockpit: pilot laughs at a cartoon and floats into the ceiling")
def s09(t0, t1):
    world((0.6, 0.75, 1.0), 0.6)
    W.cockpit()
    P = pilot(t0, t1, "happy")
    root0 = (-2.2, -0.5, 0.3)
    P.pose(t0, loc=root0, rot=180, legL=(85, 3), legR=(85, -3), armL=(72, -12), armR=(72, -12))
    tab = card("tablet", 1.6, 1.1, (0, -1.6, 4.2), img_mat("tablet", os.path.join(W.TEX, "tablet_cartoon.png"), 0.4, emit=1.5),
               "+Y", parent=P.root)
    tab.rotation_euler[0] += math.radians(-15)
    box("tablet_back", (1.7, 0.06, 1.2), (0, -1.62, 4.2), mat("tab_black", hexc("#151515"), 0.3), 0.03, parent=P.root)
    tb = t0 + 0.55
    P.face(tb - 0.1, "joy")
    laugh(P, tb - 0.1, t1, belly=False)
    P.pose(tb, loc=root0)
    P.pose(tb + 0.3, loc=up(root0, 2.6), legL=(20, 6), legR=(-10, -6))
    P.pose(tb + 0.36, hipz=-0.2)
    P.pose(t1, loc=up(root0, 2.4), hipz=0.0)
    C = pilot(t0, t1, "neutral", name="CoPilot", shirt="#e8eef8")
    C.pose(t0, loc=(2.2, -0.5, 0.3), rot=180, legL=(85, 3), legR=(85, -3), armL=(60, 4), armR=(60, 4))
    C.face(tb + 0.3, "shock")
    look_at(C, tb + 0.3, (-2.2, -0.5, 7.4))
    cam = Cam()
    cam.whip(t0 + 0.32, t0 + 0.5, (-1.2, -2.8, 6.6), (-2.2, 1.0, 4.3), (-0.6, 2.2, 5.8), (-2.2, -0.5, 5.6), lens=20)
    cam.key(t0, (-1.25, -2.9, 6.55), (-2.2, 1.0, 4.3), lens=22)
    cam.key(t1, (-0.4, 2.3, 5.4), (-2.2, -0.5, 6.9), lens=20)
    cam.handheld(1.0)
    sfx(tb + 0.3, "bonk", 0.8)
    sfx(t0 + 0.1, "ding", 0.6)


@S(10, 60, 65, "Grandma laughing at her show, lifting off the couch")
def s10(t0, t1):
    world((0.85, 0.9, 1.0), 0.5)
    W.tv_room()
    G = grandma(t0, t1, "joy")
    base = (0, 6.0, 0.25)
    G.pose(t0, loc=base, rot=0, legL=(85, 3), legR=(85, -3))
    G.pose(t1, loc=up(base, 1.2), legL=(40, 5), legR=(50, -5))
    laugh(G, t0, t1, belly=False, amp=1.1)
    G.pose(t0, armL=(60, 30), armR=(60, 30))
    drift(G, 0.5)
    cam = Cam()
    cam.push(t0, t1, up(base, FH + 0.5), 9.5, 7.0, yaw=-12, pitch=4, lens=28, yaw1=6, fstop=4)
    cam.handheld(0.8)


@S(11, 65, 71, "Low angle: Grandma's ankle weights keep her from floating away")
def s11(t0, t1):
    world((0.85, 0.9, 1.0), 0.5)
    W.tv_room()
    G = grandma(t0, t1, "joy")
    base = (0, 5.4, 2.4)
    G.pose(t0, loc=base, rot=0, legL=(6, 4), legR=(-6, -4))
    for i in range(4):
        t = t0 + i * 0.3
        G.pose(t, loc=up(base, 0.5 if i % 2 == 0 else 0.0))
    laugh(G, t0, t1, belly=False)
    G.pose(t0, armL=(155, 55), armR=(155, 55))
    cam = Cam()
    cam.key(t0, (4.0, 0.6, 1.4), (0, 5.4, 3.2), lens=20, focus=(0, 5.4, 3), fstop=4)
    cam.key(t1, (3.8, 0.4, 2.2), (0, 5.4, 7.0), lens=20, focus=(0, 5.4, 6), fstop=4)
    cam.handheld(1.0)
    sfx(t0 + 0.3, "clink", 0.8)
    sfx(t0 + 0.9, "clink", 0.6)


# ================================================================== SETUP
@S(12, 71, 76, "But I have a problem: Eddie in the hallway, worried")
def s12(t0, t1):
    world((0.85, 0.9, 1.0), 0.4)
    W.hallway_day()
    E = eddie(t0, t1, "worried")
    E.pose(t0, loc=(0, 8, 0), rot=0)
    E.act(t0 + 0.1, "shrug", 0.7)
    E.shake(t0 + 0.4)
    cam = Cam()
    cam.whip(t0, t0 + 0.18, (-4, 0, 6), (-2, 10, 4.5), (0.6, -1.0, 5.0), (0, 8, FH))
    cam.push(t0 + 0.18, t1, (0, 8, FH), 9.0, 6.4, yaw=4, pitch=3, lens=30)
    cam.crash(w(75), 30, 38, 0.1)
    cam.handheld(0.7)


@S(13, 76, 80, "Eddie sees a WET FLOOR sign and loses it")
def s13(t0, t1):
    world((0.85, 0.9, 1.0), 0.4)
    W.hallway_day()
    E = eddie(t0, t1, "neutral")
    E.pose(t0, loc=(-0.8, 8, 0), rot=0)
    Mw = img_mat("wet", os.path.join(W.TEX, "wet_floor.png"), 0.4)
    card("wet_sign", 1.8, 2.4, (2.4, 5.6, 1.25), Mw, "-Y", rot_extra=-20)
    look_at(E, t0, (2.4, 5.6, 1.5))
    tl = w(77)
    E.face(tl, "joy")
    laugh(E, tl, t1, belly=True)
    fly(E, tl, t1, (-0.8, 8, 0), (-0.8, 8, 1.6))
    cam = Cam()
    cam.push(t0, t1, (0.6, 7.0, 3.9), 9.5, 7.5, yaw=14, pitch=4, lens=24, yaw1=4)
    cam.crash(tl, 26, 36, 0.12)
    cam.handheld(0.9)
    sfx(tl, "pop")
    sfx(tl + 0.1, "rise", 0.7)


@S(14, 80, 90, "School exterior: JOKE DAY banner, kids walking in, confetti")
def s14(t0, t1):
    town_scene()
    for i in range(5):
        k = townie(60 + i, t0, t1, "happy")
        x = -5 + i * 2.6
        k.walk(t0, t1, (x, -14 - (i % 2) * 3, 0), (x * 0.6, 2 - (i % 2) * 2, 0), rate=2.2)
    E = eddie(t0, t1, "happy", extras=("backpack:EDDIE",))
    E.walk(t0, t1, (1.2, -18, 0), (0.8, -3, 0), rate=2.4)
    tj = w(88)
    confetti("cf", (0, 4, 14), (10, 5, 4), tj, 1.2, n=80)
    cam = Cam()
    cam.key(t0, (9, -8, 24), (0, 11.9, 19.8), lens=26, focus=20.0, fstop=11)
    cam.key(t1, (7, -20, 5), (0, -2, 4), lens=26, focus=14.0, fstop=11)
    cam.handheld(0.7)
    sfx(t0, "whoosh", 0.6)
    sfx(tj, "confetti")


@S(15, 90, 98, "Mr. Pickle at the board, ready with his first joke")
def s15(t0, t1):
    R, ks = class_scene(t0, t1, kids=8)
    E = eddie(t0, t1, "happy")
    W.sit(E, t0, E_DESK)
    L = leo(t0, t1, "neutral")
    W.sit(L, t0, L_DESK)
    P = pickle(t0, t1, "happy")
    P.pose(t0, loc=(-1.5, 11.6, 0), rot=0)
    P.act(t0 + 0.1, "wave", 0.9)
    lips(P, w(93), t1)
    cam = Cam()
    cam.push(t0, t1, (-1.5, 11.6, FH), 9.0, 6.5, yaw=14, pitch=2, lens=28, yaw1=6, fstop=4)
    cam.handheld(0.7)


@S(16, 98, 104, "Why was the math book sad? Pickle holds up the book")
def s16(t0, t1):
    R, ks = class_scene(t0, t1, kids=8)
    P = pickle(t0, t1, "talk")
    P.pose(t0, loc=(-1.5, 11.6, 0), rot=0)
    P.act(t0, "hold", 1.0, armL=(150, 10))
    bk = box("mathbook", (1.6, 0.3, 2.0), (1.3, -0.9, 5.7), mat("book_blue", hexc("#2f6fd0"), 0.5), 0.05, parent=P.root)
    text("mathbook_t", "MATH", (1.3, -1.07, 5.9), 0.42, mat("ink_white", (0.95, 0.95, 0.95), 0.5), parent=P.root)
    lips(P, t0, t1)
    P.face(t0, eyes="worried")
    cam = Cam()
    cam.orbit(t0, t1, (-1.0, 11.6, 5.0), 6.0, 22, -12, pitch=3, lens=30, fstop=4)
    cam.handheld(0.7)
    sfx(t0, "paper", 0.7)


@S(17, 104, 109, "It had too many problems! Pickle's big grin, rimshot")
def s17(t0, t1):
    R, ks = class_scene(t0, t1, kids=8)
    P = pickle(t0, t1, "grin")
    P.pose(t0, loc=(-1.5, 11.6, 0), rot=0)
    lips(P, t0, w(108) + 0.4)
    tp = w(108)
    P.act(tp, "cheer", 0.75, expr="grin")
    P.face(tp, eyes="happy", mouth="grin")
    cam = Cam()
    cam.push(t0, t1, (-1.5, 11.6, FH + 0.3), 7.0, 5.5, yaw=14, pitch=2, lens=30)
    cam.crash(tp, 30, 40, 0.1)
    cam.handheld(0.8)
    sfx(V.we(108) + 0.05, "rimshot")


@S(18, 109, 111, "Nobody laughed: dead silent class, crickets")
def s18(t0, t1):
    R, ks = class_scene(t0, t1, kids=10)
    for k in ks:
        k.face(t0, "bored")
    E = eddie(t0, t1, "neutral")
    W.sit(E, t0, E_DESK)
    E.face(t0, eyes="squint", mouth="grimace")
    L = leo(t0, t1, "bored")
    W.sit(L, t0, L_DESK)
    cam = Cam()
    cam.key(t0, (-9.5, 11.5, 7.5), (2, 3, 4), lens=20, focus=(2, 3, 4), fstop=8)
    cam.key(t1, (-8.8, 10.8, 7.2), (2, 3, 4.2), lens=21, focus=(2, 3, 4), fstop=8)
    cam.handheld(0.5)
    sfx(t0, "crickets", 1.0, dur=0.9)


@S(19, 111, 113, "Except me: Eddie trying not to laugh")
def s19(t0, t1):
    R, ks = class_scene(t0, t1, kids=8)
    E = eddie(t0, t1, "neutral")
    W.sit(E, t0, E_DESK)
    E.face(t0, eyes="squint", mouth="grimace")
    E.act(t0, "hands_face", 0.95)
    noise(E.hip, "rotation_euler", 2, 0.05, 2.5)
    noise(E.hip, "location", 2, 0.05, 2.0)
    cam = Cam()
    cam.push(t0, t1, (E_SEAT[0], E_SEAT[1], E_SEAT[2] + FH), 5.5, 4.0, yaw=190, pitch=3, lens=30)
    cam.handheld(0.9)


@S(20, 113, 118, "SNORT: Eddie cracks, the class turns")
def s20(t0, t1):
    R, ks = class_scene(t0, t1, kids=8)
    E = eddie(t0, t1, "neutral")
    W.sit(E, t0, E_DESK)
    E.face(t0, eyes="squint", mouth="grimace")
    E.pose(t0, armL=(140, -25), armR=(140, -25))
    ts = w(114)
    E.act(ts, "shock", 0.8)
    laugh(E, ts, t1, flail=False, belly=True)
    tgt = (E_SEAT[0], E_SEAT[1], E_SEAT[2] + FH)
    for k in ks:
        look_at(k, ts + 0.1, tgt)
        k.face(ts + 0.1, "gasp")
    cam = Cam()
    cam.push(t0, t1, tgt, 4.8, 4.2, yaw=176, pitch=4, lens=30)
    cam.crash(ts, 30, 42, 0.1)
    cam.handheld(1.1)
    sfx(ts, "snort")


@S(21, 118, 122, "Low angle: Eddie's feet lift off the floor")
def s21(t0, t1):
    R, ks = class_scene(t0, t1, kids=8)
    E = eddie(t0, t1, "joy")
    W.sit(E, t0, E_DESK)
    sx, sy, sz = E_SEAT
    E.pose(t0 + 0.2, loc=(sx, sy, sz + 0.2), legL=(30, 5), legR=(25, -5))
    E.pose(t1, loc=(sx, sy, sz + 2.0), legL=(-8, 8), legR=(16, -8))
    laugh(E, t0, t1, flail=False, belly=True)
    cam = Cam()
    for ob in list(D.objects):
        if ob.name.startswith(("cd_desk03", "cd_dl03", "cd_seat03", "cd_cback03")):
            D.objects.remove(ob, do_unlink=True)
    cam.key(t0, (10.0, 5.0, 2.8), (2.5, 5.4, 2.4), lens=24, focus=(2.5, 5.4, 2.4), fstop=4)
    cam.key(t1, (9.8, 4.9, 3.4), (2.5, 5.3, 3.9), lens=24, focus=(2.5, 5.3, 3.9), fstop=4)
    cam.handheld(1.0)
    sfx(t0 + 0.1, "rise")


@S(22, 122, 130, "Eddie floating, gripping his desk; Leo looks over")
def s22(t0, t1):
    R, ks = class_scene(t0, t1, kids=8)
    E = eddie(t0, t1, "scared")
    root = (2.5, 4.9, 1.6)
    E.pose(t0, loc=root, rot=180, armL=(30, -8), armR=(30, -8), legL=(-35, 6), legR=(-45, -6), torso=(0, 12, 0))
    for i in range(1, 5):
        E.pose(t0 + i * 0.3, loc=up(root, 0.35 if i % 2 else 0.0), legL=(-50 if i % 2 else -30, 8))
    E.face(t0 + 0.1, eyes="terror", mouth="grimace_wide")
    for nm in ["cd_desk02", "cd_dl02-1-1", "cd_dl02-11", "cd_dl021-1", "cd_dl0211"]:
        ob = D.objects.get(nm)
        if ob:
            for i in range(5):
                ob.location[2] += 0.18 if i % 2 else -0.18 if i else 0.0
                ob.keyframe_insert("location", index=2, frame=F(t0 + i * 0.3))
    L = leo(t0, t1, "neutral")
    W.sit(L, t0, L_DESK)
    look_at(L, w(130), up(root, 4.5))
    cam = Cam()
    cam.orbit(t0, t1, (3.5, 5.4, 4.4), 8.0, 125, 168, pitch=10, lens=24, fstop=4)
    cam.handheld(0.9)


@S(23, 130, 135, "Leo turns and sees Eddie's face")
def s23(t0, t1):
    R, ks = class_scene(t0, t1, kids=8)
    L = leo(t0, t1, "neutral")
    W.sit(L, t0, L_DESK)
    E = eddie(t0, t1, "terror")
    E.pose(t0, loc=(2.5, 4.9, 1.9), rot=180, armL=(30, -8), armR=(30, -8), legL=(-45, 6), legR=(-35, -6), torso=(0, 12, 0))
    E.face(t0, eyes="terror", mouth="grimace_wide")
    drift(E, 0.6)
    look_at(L, t0 + 0.1, (2.5, 4.9, 6.4))
    L.face(t0 + 0.1, eyes="side_l", mouth="flat")
    L.face(t0 + 0.45, "gasp")
    cam = Cam()
    cam.push(t0, t1, (L_SEAT[0], L_SEAT[1], L_SEAT[2] + FH), 6.5, 4.6, yaw=215, pitch=3, lens=30, yaw1=208)
    cam.handheld(0.8)


@S(24, 135, 138, "Leo bursts out laughing")
def s24(t0, t1):
    R, ks = class_scene(t0, t1, kids=8)
    L = leo(t0, t1, "joy")
    W.sit(L, t0, L_DESK)
    laugh(L, t0, t1, flail=False, belly=True, amp=1.3)
    L.act(t0, "recoil", 0.7)
    L.pose(t1, loc=up(L_SEAT, 0.6))
    for k in ks:
        look_at(k, t0 + 0.1, (L_SEAT[0], L_SEAT[1], L_SEAT[2] + FH))
    cam = Cam()
    cam.push(t0, t1, (L_SEAT[0], L_SEAT[1], L_SEAT[2] + FH), 5.0, 4.2, yaw=200, pitch=3, lens=30)
    cam.crash(t0, 24, 34, 0.1)
    cam.handheld(1.1)
    sfx(t0, "pop")


@S(25, 138, 149, "Leo shoots straight up and bonks the ceiling")
def s25(t0, t1):
    R, ks = class_scene(t0, t1, kids=8)
    L = leo(t0, t1, "joy")
    W.sit(L, t0, L_DESK)
    tb = w(143)
    top = up(L_SEAT, 6.95)
    L.pose(t0 + 0.12, loc=up(L_SEAT, 0.3), legL=(40, 5), legR=(50, -5))
    L.pose(tb, loc=top, legL=(-10, 8), legR=(14, -8))
    set_interp(L.root, "location", F(t0 + 0.12), "QUAD", "EASE_IN")
    L.pose(tb + 0.06, hipz=-0.28)
    L.pose(tb + 0.25, hipz=0.0, loc=up(L_SEAT, 6.5))
    L.pose(t1, loc=up(L_SEAT, 6.7))
    laugh(L, t0, tb, flail=True)
    L.face(tb, eyes="closed", mouth="grimace")
    L.face(tb + 0.35, eyes="squint", mouth="wavy")
    L.shake(tb + 0.3, n=4, amp=14)
    for k in ks:
        k.face(t0 + 0.2, "lookup")
        look_at(k, t0 + 0.2, (7.5, 5.0, 10))
    cam = Cam()
    cam.key(t0, (5.0, 13.0, 4.6), (7.5, 5.0, 5.0), lens=22, focus=(7.5, 5, 5), fstop=5)
    cam.key(tb, (5.0, 13.2, 7.4), (7.5, 5.0, 11.4), lens=22, focus=(7.5, 5, 11), fstop=5)
    cam.key(tb + 0.12, (5.0, 13.25, 7.25), (7.5, 5.0, 11.2), lens=22)
    cam.key(t1, (5.1, 13.4, 7.6), (7.5, 5.0, 11.4), lens=23)
    cam.handheld(1.2)
    sfx(tb, "bonk")


@S(26, 149, 150, "BONK! Leo dizzy against the ceiling, stars spinning")
def s26(t0, t1):
    R, ks = class_scene(t0, t1, kids=4)
    L = leo(t0, t1, "neutral")
    root = up(L_SEAT, 6.8)
    L.pose(t0, loc=root, rot=180, legL=(-10, 8), legR=(14, -8), armL=(30, 40), armR=(30, 40))
    L.face(t0, eyes="squint", mouth="wavy")
    L.shake(t0, n=3, amp=12)
    stars_ring(L, t0, t1, 5.9)
    cam = Cam()
    cam.push(t0, t1, up(root, FH), 4.0, 5.0, yaw=200, pitch=-10, lens=26)
    cam.handheld(1.4)
    sfx(t0, "boing")


@S(27, 150, 156, "The whole class cracks up and starts floating")
def s27(t0, t1):
    R, ks = class_scene(t0, t1, kids=10, sash=None)
    kids_float(ks, t0, t1, 0.0, 1.6, seed=27)
    E = eddie(t0, t1, "joy")
    fly(E, t0, t1, (2.5, 4.6, 3.0), (2.6, 4.4, 3.8), rot=180)
    dangle(E, t0, t1); laugh(E, t0, t1, flail=True); drift(E)
    L = leo(t0, t1, "joy")
    fly(L, t0, t1, up(L_SEAT, 6.6), up(L_SEAT, 6.4), rot=170)
    dangle(L, t0, t1); laugh(L, t0, t1, flail=True); drift(L, 0.5)
    cam = Cam()
    cam.key(t0, (-1.0, 12.6, 7.8), (2, 2.5, 4.5), lens=18, focus=10.0, fstop=8)
    cam.key(t1, (-4.0, 13.4, 8.6), (2, 2.0, 5.0), lens=19, focus=12.0, fstop=8)
    cam.handheld(0.9)
    sfx(t0, "kids_laugh", 1.0, dur=w(171) - t0 + 0.4)


@S(28, 156, 162, "Thirty kids float up like balloons")
def s28(t0, t1):
    R, ks = class_scene(t0, t1, kids=10)
    kids_float(ks, t0, t1, 1.6, 4.6, seed=28)
    E = eddie(t0, t1, "joy")
    fly(E, t0, t1, (2.6, 4.4, 3.8), (2.7, 4.2, 5.4), rot=180)
    dangle(E, t0, t1); laugh(E, t0, t1, flail=True); drift(E)
    rnd = random.Random(5)
    for i, c in enumerate(["#e8574a", "#f2c14e", "#4aa5e8", "#63c06a", "#f09ac2"]):
        b = sphere(f"balloon{i}", 0.6, (-4 + i * 2.5, rnd.uniform(0, 6), 3 + rnd.uniform(0, 2)), mat("bal" + c, hexc(c), 0.2, coat=0.6),
                   (1, 1, 1.2))
        spin(b, t0, t1, 3.0, (0.05, 0.05, 0.2), seed=i)
    cam = Cam()
    cam.key(t0, (-2.0, 12.8, 2.0), (2, 3, 7.5), lens=18, focus=11.0, fstop=8)
    cam.key(t1, (-1.5, 12.4, 3.0), (2, 3, 8.2), lens=18, focus=11.0, fstop=8)
    cam.handheld(0.8)


@S(29, 162, 164, "Backpacks and pencils float past the camera")
def s29(t0, t1):
    R, ks = class_scene(t0, t1, kids=10)
    kids_float(ks, t0, t1, 4.0, 5.5, seed=29)
    for i, c in enumerate(["#e2582a", "#2f6fd0", "#63c06a", "#9b6ad6"]):
        bp = backpack(f"bp{i}", (-2.5 + i * 2.0, 6.5 - (i % 2) * 1.5, 3.0 + i * 0.6), c)
        spin(bp, t0, t1, 2.4, seed=10 + i)
    rnd = random.Random(29)
    for i in range(10):
        pc = pencil(f"pc{i}", (rnd.uniform(-3, 4), rnd.uniform(5.5, 8.5), rnd.uniform(3, 7)),
                    (rnd.uniform(0, 90), rnd.uniform(0, 90), 0))
        spin(pc, t0, t1, 1.8, (1.0, 0.8, 0.5), seed=20 + i)
    cam = Cam()
    cam.key(t0, (0.5, 11.5, 4.2), (0.5, 5.5, 4.6), lens=24, focus=6.0, fstop=3.5)
    cam.key(t1, (0.8, 11.3, 6.6), (0.6, 5.5, 7.0), lens=24, focus=6.0, fstop=3.5)
    cam.handheld(0.9)
    sfx(t0, "pop")
    sfx(w(163), "pop", 0.8)


@S(30, 164, 171, "Mr. Pickle laughing, his toupee flies off")
def s30(t0, t1):
    R, ks = class_scene(t0, t1, kids=6)
    kids_float(ks, t0, t1, 4.2, 5.2, seed=30)
    P = pickle(t0, t1, "joy")
    root = (-1.5, 11.0, 2.0)
    fly(P, t0, t1, root, up(root, 0.8), rot=0)
    dangle(P, t0, t1); laugh(P, t0, t1, belly=True); drift(P, 0.5)
    tt = w(167)
    tp = P.toupee
    tp.keyframe_insert("location", frame=F(tt))
    tp.keyframe_insert("rotation_euler", frame=F(tt))
    tp.location = (0.5, -0.4, 2.2)
    tp.rotation_euler = (0.6, 0.3, 4.0)
    tp.keyframe_insert("location", frame=F(tt + 0.3))
    tp.keyframe_insert("rotation_euler", frame=F(tt + 0.3))
    tp.location = (2.6, -1.6, 5.5)
    tp.rotation_euler = (1.4, 0.8, 11.0)
    tp.keyframe_insert("location", frame=F(t1))
    tp.keyframe_insert("rotation_euler", frame=F(t1))
    P.face(tt + 0.15, eyes="wide", mouth="o")
    P.act(tt + 0.15, "hands_head", 0.9)
    cam = Cam()
    cam.push(t0, t1, up(root, FH + 0.6), 7.0, 5.2, yaw=25, pitch=2, lens=28, yaw1=12)
    cam.crash(tt, 28, 36, 0.1)
    cam.handheld(0.9)
    sfx(tt, "boing")


@S(31, 171, 176, "The window pops open, light floods in")
def s31(t0, t1):
    tw = w(174)
    R, ks = class_scene(t0, t1, kids=8, sash=tw)
    kids_float(ks, t0, t1, 4.6, 5.4, seed=31)
    lt = D.objects.get("cd_win")
    if lt:
        lt.data.keyframe_insert("energy", frame=F(tw))
        lt.data.energy = 14000
        lt.data.keyframe_insert("energy", frame=F(tw + 0.2))
    cam = Cam()
    cam.key(t0, (3.5, 0.5, 6.4), (12, 3.0, 6.75), lens=22, focus=8.0, fstop=6)
    cam.key(t1, (6.4, 1.6, 6.7), (12, 3.0, 6.8), lens=22, focus=5.0, fstop=6)
    cam.crash(tw, 22, 27, 0.1)
    cam.handheld(0.9)
    sfx(tw, "window")


@S(32, 176, 183, "WHOOSH: the wind sucks the whole class out the window")
def s32(t0, t1):
    R, ks = class_scene(t0, t1, kids=10, sash="open")
    rnd = random.Random(32)
    exitp = (12.0, 3.0, 4.6)
    for i, k in enumerate(ks):
        sx, sy, sz = W.seat_pos(k.desk)
        p0 = (sx, sy, sz + rnd.uniform(4.2, 5.8))
        ta = t0 + 0.15 + i * 0.13
        k.pose(t0, loc=p0, rot=180 + rnd.uniform(-30, 30), legL=(-20, 8), legR=(10, -8))
        k.pose(ta, loc=(exitp[0] - 0.5, exitp[1] + rnd.uniform(-0.8, 0.8), exitp[2] + rnd.uniform(-0.5, 0.5)))
        set_interp(k.root, "location", F(t0), "QUAD", "EASE_IN")
        k.pose(ta + 0.35, loc=(22, exitp[1] + rnd.uniform(-4, 4), exitp[2] + rnd.uniform(0, 4)))
        k.face(t0, "scream" if i % 3 == 0 else "joy")
        k.panic(t0, t1, rate=6)
        drift(k, 1.5)
    cam = Cam()
    cam.key(t0, (-4, -7, 6.5), (12, 3.0, 6.0), lens=20, focus=14.0, fstop=8)
    cam.key(t1, (-1, -5, 6.8), (12, 3.0, 6.4), lens=22, focus=12.0, fstop=8)
    cam.handheld(1.6)
    sfx(t0, "whoosh")
    sfx(t0 + 0.05, "wind", 1.0, dur=t1 - t0)


@S(33, 183, 188, "Floating over the playground")
def s33(t0, t1):
    town_scene()
    cam0, cam1 = (54, -36, 17), (48, -26, 23)
    cast = [eddie(t0, t1, "joy"), leo(t0, t1, "joy")] + [townie(i, t0, t1, "joy") for i in range(5)]
    rnd = random.Random(33)
    for i, c in enumerate(cast):
        p = (30 + rnd.uniform(-6, 6), -14 + rnd.uniform(-6, 6), 18 + rnd.uniform(-2, 3))
        fly(c, t0, t1, p, (p[0] - 2, p[1] + 3, p[2] + 1.5), rot=facing(p, cam0) + rnd.uniform(-25, 25))
        dangle(c, t0, t1); laugh(c, t0, t1, flail=rnd.random() < 0.6); drift(c)
    cam = Cam()
    cam.key(t0, cam0, (32, -14, 20), lens=24, focus=24.0, fstop=8)
    cam.key(t1, cam1, (30, -9, 22), lens=24, focus=20.0, fstop=8)
    cam.handheld(0.8)


@S(34, 188, 191, "Over the school roof")
def s34(t0, t1):
    town_scene()
    cast = [eddie(t0, t1, "joy"), leo(t0, t1, "joy")] + [townie(i, t0, t1, "joy") for i in range(4)]
    rnd = random.Random(34)
    for c in cast:
        p = (rnd.uniform(-5, 5), rnd.uniform(16, 24), rnd.uniform(28, 33))
        fly(c, t0, t1, p, up(p, 1.0), rot=180 + rnd.uniform(-40, 40))
        dangle(c, t0, t1); laugh(c, t0, t1, flail=True); drift(c)
    cam = Cam()
    cam.key(t0, (2, -6, 26), (0, 16, 30), lens=22, focus=24.0, fstop=8)
    cam.key(t1, (1, 6, 33), (0, 26, 32), lens=22, focus=16.0, fstop=8)
    cam.handheld(0.8)
    sfx(t0, "whoosh", 0.7)


@S(35, 191, 195, "Over the entire town: wide pull back")
def s35(t0, t1):
    town_scene()
    cloud_ring((0, 0, 70), 30, 160, 20, seed=35, dz=(-10, 20))
    src = crowd_src("FLY35", t0, t1, [70, 71, 72, 73, 74, 75], spread=3)
    crowd(src, t0, t1, 3, ((-8, 8), (-8, 8)), (58, 62), (60, 64), seed=35)
    cam = Cam()
    cam.key(t0, (40, -70, 80), (0, 0, 58), lens=24, focus=80.0, fstop=16)
    cam.key(t1, (60, -130, 110), (0, 0, 55), lens=24, focus=140.0, fstop=16)
    cam.handheld(0.6)
    sfx(t0, "wind", 0.8, dur=t1 - t0)


# ================================================================== ESCALATION
@S(36, 195, 200, "Leo laughing even harder, rolling in the air")
def s36(t0, t1):
    sky_scene(seed=36)
    L = leo(t0, t1, "joy")
    fly(L, t0, t1, (0, 0, 60), (0, 0, 60.8), rot=-10)
    L.root.keyframe_insert("rotation_euler", index=1, frame=F(t0))
    L.root.rotation_euler[1] = math.radians(-35)
    L.root.keyframe_insert("rotation_euler", index=1, frame=F(t1))
    laugh(L, t0, t1, belly=True, amp=1.4, eyes="cry")
    L.wiggle(t0, t1, "legL", (25, 5), 6.0, (20, 5))
    L.wiggle(t0 + 0.08, t1, "legR", (25, 5), 6.0, (-10, -5))
    E = eddie(t0, t1, "angry")
    fly(E, t0, t1, (-6, 7, 61), (-6, 7, 61.4), rot=facing((-6, 7), (0, 0)))
    E.act(t0, "cross")
    dangle(E, t0, t1); drift(E)
    cam = Cam()
    cam.orbit(t0, t1, (0, 0, 64.2), 6.5, -30, 25, pitch=4, lens=30)
    cam.handheld(0.9)


@S(37, 200, 202, "STOP LAUGHING! Eddie shouts")
def s37(t0, t1):
    sky_scene(seed=37)
    E = eddie(t0, t1, "angry")
    fly(E, t0, t1, (0, 0, 60), (0, 0, 60.3), rot=0)
    E.act(t0, "fists", 1.2, expr="shout")
    lips(E, t0, t1, "shout")
    E.face(t0, eyes="angry")
    dangle(E, t0, t1); drift(E, 0.6)
    L = leo(t0, t1, "joy")
    fly(L, t0, t1, (5, 8, 59), (5, 8, 59.6), rot=20)
    laugh(L, t0, t1, flail=True)
    cam = Cam()
    cam.push(t0, t1, (0, 0, 64.7), 5.5, 4.2, yaw=10, pitch=3, lens=30)
    cam.crash(t0, 24, 32, 0.1)
    cam.handheld(1.3)
    sfx(t0, "whoosh", 0.6)


@S(38, 202, 204, "I can't! Leo crying with laughter")
def s38(t0, t1):
    sky_scene(seed=38)
    L = leo(t0, t1, "joy")
    fly(L, t0, t1, (0, 0, 60), (0, 0, 60.4), rot=0)
    lips(L, t0, t1, "laugh")
    L.face(t0, eyes="cry")
    L.act(t0, "shrug", 1.0)
    dangle(L, t0, t1); drift(L)
    E = eddie(t0, t1, "angry")
    fly(E, t0, t1, (-5, 8, 60), (-5, 8, 60.3), rot=200)
    cam = Cam()
    cam.push(t0, t1, (0, 0, 64.6), 5.4, 4.4, yaw=-10, pitch=3, lens=30)
    cam.handheld(1.0)


@S(39, 204, 208, "It tickles up here! Leo wriggling")
def s39(t0, t1):
    sky_scene(seed=39)
    L = leo(t0, t1, "joy")
    fly(L, t0, t1, (0, 0, 60), (0.3, 0, 61), rot=-15)
    lips(L, t0, t1, "laugh")
    L.face(t0, eyes="happy")
    L.wiggle(t0, t1, "armL", (30, 25), 7.0, (90, 40))
    L.wiggle(t0 + 0.07, t1, "armR", (30, 25), 7.0, (90, 40))
    L.wiggle(t0, t1, "legL", (25, 5), 6.0, (15, 5))
    L.wiggle(t0 + 0.08, t1, "legR", (25, 5), 6.0, (-10, -5))
    noise(L.root, "rotation_euler", 1, 0.15, 6)
    cam = Cam()
    cam.orbit(t0, t1, (0, 0, 64.4), 6.0, 20, -20, pitch=6, lens=28)
    cam.handheld(1.0)


@S(40, 208, 214, "A pigeon lands on Leo's head")
def s40(t0, t1):
    sky_scene(seed=40)
    L = leo(t0, t1, "joy")
    fly(L, t0, t1, (0, 0, 60), (0, 0, 60.5), rot=0)
    laugh(L, t0, t1, belly=True, amp=0.8)
    tl = w(210)
    L.face(tl - 0.15, eyes="up")
    dangle(L, t0, t1); drift(L, 0.4)
    pg = W.pigeon("pigeon", (9, -4, 69))
    pg.rotation_euler[2] = math.radians(facing((9, -4), (0, 0)))
    pg.keyframe_insert("location", frame=F(t0))
    pg.location = (0.2, 0.0, 60 + 5.45)
    pg.keyframe_insert("location", frame=F(tl))
    pg.location = (0.2, 0.0, 60.5 + 5.45)
    pg.keyframe_insert("location", frame=F(t1))
    cam = Cam()
    cam.push(t0, t1, (0, 0, 65.0), 7.5, 5.5, yaw=-15, pitch=4, lens=28, yaw1=-5)
    cam.handheld(0.9)
    sfx(w(209), "pigeon")


@S(41, 214, 224, "Leo giggles so hard he shoots into a cloud")
def s41(t0, t1):
    sky_scene(seed=41)
    W.cloud("bigcloud", (0, 2, 92), 3.4, None, 7)
    L = leo(t0, t1, "joy")
    ts = w(220)
    L.pose(t0, loc=(0, 0, 60), rot=0)
    L.pose(ts, loc=(0, 0, 61))
    L.pose(t1, loc=(0, 1.5, 92))
    set_interp(L.root, "location", F(ts), "EXPO", "EASE_IN")
    laugh(L, t0, t1, flail=True, eyes="cry")
    dangle(L, t0, t1)
    pg = W.pigeon("pigeon", (0.2, 0, 65.45))
    pg.keyframe_insert("location", frame=F(ts))
    pg.location = (5, -3, 64)
    pg.keyframe_insert("location", frame=F(t1))
    E = eddie(t0, t1, "gasp")
    fly(E, t0, t1, (-3.5, -5, 55.8), (-3.5, -5, 56.2), rot=0)
    E.pose(t0, head=(0, -30, 0))
    E.face(t0, "lookup")
    cam = Cam()
    cam.key(t0, (-2, -12, 55), (0, 0, 63.5), lens=22, focus=12.0, fstop=4)
    cam.key(ts, (-2, -12, 55.3), (0, 0, 65), lens=22, focus=12.0, fstop=4)
    cam.key(t1, (-2, -12, 56), (0, 1, 88), lens=22, focus=32.0, fstop=4)
    cam.handheld(1.0)
    sfx(ts, "whoosh")
    sfx(t1 - 0.25, "poof")


@S(42, 224, 231, "Down below the whole town is watching")
def s42(t0, t1):
    town_scene()
    rnd = random.Random(42)
    for i in range(8):
        k = townie(80 + i, t0, t1, "lookup")
        p = (-8 + i * 2.3 + rnd.uniform(-0.5, 0.5), -31 + rnd.uniform(-3, 3), 0)
        k.pose(t0, loc=p, rot=rnd.uniform(-30, 30), head=(0, -34, 0))
        if i % 3 == 0:
            k.pose(t0 + 0.2, armR=(160, -5))
        k.face(t0 + rnd.uniform(0, 0.3), "gasp" if i % 2 else "lookup")
    cam = Cam()
    cam.key(t0, (0, -44, 1.0), (0, -31, 5.0), lens=22, focus=13.0, fstop=5)
    cam.key(t1, (0.5, -42, 1.3), (0, -31, 8.5), lens=22, focus=12.0, fstop=5)
    cam.handheld(0.8)
    sfx(t0 + 0.05, "crowd", 0.8, dur=t1 - t0)


@S(43, 231, 237, "And they thought it was hilarious")
def s43(t0, t1):
    town_scene()
    rnd = random.Random(42)
    for i in range(8):
        k = townie(80 + i, t0, t1, "joy")
        p = (-8 + i * 2.3 + rnd.uniform(-0.5, 0.5), -31 + rnd.uniform(-3, 3), 0)
        k.pose(t0, loc=p, rot=rnd.uniform(-30, 30))
        laugh(k, t0, t1, rate=rnd.uniform(4, 6), belly=i % 2 == 0, flail=False, amp=1.6)
        if i % 2:
            k.pose(t0, armL=(40, 10), armR=(40, 10), torso=(0, 22, 0))
    cam = Cam()
    cam.orbit(t0, t1, (0, -31, 4.0), 12.0, -30, 25, pitch=6, lens=24, fstop=6)
    cam.handheld(0.8)
    sfx(t0, "kids_laugh", 0.6, dur=t1 - t0)


@S(44, 237, 239, "Big mistake: Eddie facepalms")
def s44(t0, t1):
    sky_scene(seed=44)
    E = eddie(t0, t1, "bored")
    fly(E, t0, t1, (0, 0, 60), (0, 0, 60.2), rot=0)
    E.act(t0, "facepalm")
    E.face(t0 + 0.1, eyes="closed", mouth="frown")
    dangle(E, t0, t1); drift(E, 0.5)
    cam = Cam()
    cam.push(t0, t1, (0, 0, 64.6), 5.0, 4.4, yaw=-6, pitch=2, lens=30)
    cam.crash(t0 + 0.05, 26, 40, 0.1)
    cam.handheld(1.0)
    sfx(t0, "boom", 0.5)


@S(45, 239, 246, "A thousand people float up at once")
def s45(t0, t1):
    town_scene()
    src = crowd_src("UP45", t0, t1, [90, 91, 92, 93, 94, 95], spread=3.5, seed=45)
    crowd(src, t0, t1, 26, ((-44, 44), (-24, 4)), (0, 0), (6, 26), (0.0, 0.5), seed=45)
    rnd = random.Random(42)
    for i in range(8):
        k = townie(80 + i, t0, t1, "joy")
        p = (-8 + i * 2.3 + rnd.uniform(-0.5, 0.5), -31 + rnd.uniform(-3, 3), 0)
        fly(k, t0 + 0.1, t1, p, up(p, rnd.uniform(4, 9)), rot=rnd.uniform(-30, 30))
        dangle(k, t0, t1); laugh(k, t0, t1, flail=True); drift(k)
    cam = Cam()
    cam.key(t0, (4, -44, 2.2), (0, -5, 9), lens=20, focus=30.0, fstop=10)
    cam.key(t1, (4, -46, 9.0), (0, -5, 18), lens=20, focus=34.0, fstop=10)
    cam.handheld(0.8)
    sfx(t0, "rise")
    sfx(t0 + 0.1, "kids_laugh", 0.7, dur=t1 - t0)


@S(46, 246, 247, "Cars float up")
def s46(t0, t1):
    town_scene()
    src = crowd_src("UP46", t0, t1, [90, 91, 92, 93], spread=3.5, seed=46)
    crowd(src, t0, t1, 10, ((-40, 40), (-50, -10)), (14, 30), (16, 32), seed=46)
    for i, (c, x) in enumerate((("#d9453a", -6), ("#3f7fd9", 2), ("#f2c14e", 10))):
        car = W.car(f"car{i}", (x, -30 + (i % 2) * 2, 2.5 + i), c, rot=90)
        spin(car, t0, t1, 2.5, (0.08, 0.1, 0.12), seed=i)
    cam = Cam()
    cam.key(t0, (3, -50, 4), (2, -30, 5.5), lens=26, focus=20.0, fstop=8)
    cam.key(t1, (2.5, -46, 5.5), (2, -30, 7.0), lens=26, focus=16.0, fstop=8)
    cam.handheld(0.8)
    sfx(t0, "pop")


@S(47, 247, 248, "Dogs float up, paddling")
def s47(t0, t1):
    town_scene()
    d1 = W.dog("dog1", (0, -30, 4.0))
    spin(d1, t0, t1, 0.9, (0.02, 0.03, 0.05), seed=1)
    d2 = W.dog("dog2", (6, -26, 7.0), color="#f0f0f0")
    spin(d2, t0, t1, 1.0, (0.03, 0.03, 0.06), seed=2)
    cam = Cam()
    cam.push(t0, t1, (0, -31, 6.0), 9.0, 7.5, yaw=-10, pitch=0, lens=28, fstop=4)
    cam.handheld(1.0)
    sfx(t0, "boing", 0.7)


@S(48, 248, 251, "Even the mayor!")
def s48(t0, t1):
    town_scene()
    M = mayor(t0, t1, "joy")
    fly(M, t0, t1, (0, -30, 6), (0, -30, 7.6), rot=0)
    laugh(M, t0, t1, belly=False, amp=1.1)
    M.pose(t0, armR=(165, -30), armL=(40, 30))
    dangle(M, t0, t1); drift(M)
    src = crowd_src("UP48", t0, t1, [96, 97, 98], spread=3.5, seed=48)
    crowd(src, t0, t1, 8, ((-30, 30), (-10, 10)), (10, 26), (12, 28), seed=48)
    cam = Cam()
    cam.push(t0, t1, (0, -30, 7 + FH), 7.0, 5.0, yaw=8, pitch=2, lens=30)
    cam.crash(t0 + 0.05, 24, 32, 0.1)
    cam.handheld(1.0)
    sfx(t0 + 0.05, "pop")


@S(49, 251, 259, "The entire town drifting into the sky: epic pull back")
def s49(t0, t1):
    town_scene()
    cloud_ring((0, 0, 110), 40, 180, 18, seed=49, dz=(-5, 15))
    src = crowd_src("UP49", t0, t1, [90, 91, 92, 93, 94, 95], spread=3.5, seed=49)
    crowd(src, t0, t1, 40, ((-90, 90), (-80, 40)), (15, 70), (22, 80), seed=49)
    for i in range(5):
        car = W.car(f"car{i}", (-40 + i * 20, -30 + (i % 2) * 30, 25 + i * 8), ["#d9453a", "#3f7fd9", "#f2c14e", "#63c06a", "#f0f0f0"][i], rot=i * 40)
        spin(car, t0, t1, 5, (0.1, 0.1, 0.15), seed=i)
    cam = Cam()
    cam.key(t0, (0, -95, 40), (0, -20, 42), lens=26, focus=70.0, fstop=16)
    cam.key(t1, (10, -160, 72), (0, -10, 50), lens=26, focus=150.0, fstop=16)
    cam.handheld(0.6)
    sfx(t0, "wind", 0.9, dur=t1 - t0)


# ================================================================== GUS
@S(50, 259, 268, "Only one person still on the ground")
def s50(t0, t1):
    town_scene()
    G = gus(t0, t1, rot=facing(GUS, (-6, -44)))
    G.act(t0, "cross")
    src = crowd_src("UP50", t0, t1, [90, 91, 92, 93], spread=3.5, seed=50)
    crowd(src, t0, t1, 18, ((-40, 40), (-60, 0)), (26, 60), (28, 62), seed=50)
    cam = Cam()
    cam.key(t0, (-7, -46, 36), (0, -30, 2.5), lens=30, focus=(0, -30, 4), fstop=6)
    cam.key(t1, (-4.5, -41, 25), (0, -30, 3.5), lens=30, focus=(0, -30, 4), fstop=6)
    cam.handheld(0.6)
    sfx(t0, "wind", 0.5, dur=t1 - t0)


@S(51, 268, 270, "GRUMPY GUS: crash zoom")
def s51(t0, t1):
    town_scene()
    G = gus(t0, t1)
    G.act(t0, "cross")
    G.face(t0, eyes="angry", mouth="frown")
    hc = up(GUS, FH * 1.35)
    cam = Cam()
    cam.push(t0, t1, hc, 8.5, 7.0, yaw=0, pitch=-8, lens=30, fstop=4)
    cam.crash(t0, 22, 32, 0.1)
    cam.handheld(1.0)
    sfx(t0, "stomp")


@S(52, 270, 279, "The only kid in history who never laughed")
def s52(t0, t1):
    town_scene()
    G = gus(t0, t1)
    G.act(t0, "cross")
    G.shake(t0 + 1.0, n=2, amp=10)
    src = crowd_src("UP52", t0, t1, [90, 91, 92, 93, 94], spread=3.5, seed=52)
    crowd(src, t0, t1, 14, ((-40, 40), (-20, 30)), (22, 45), (24, 47), seed=52)
    cam = Cam()
    cam.orbit(t0, t1, up(GUS, 5.6), 11.0, -40, 35, pitch=-12, lens=24, fstop=5)
    cam.handheld(0.7)


@S(53, 279, 281, "Not once: extreme close up")
def s53(t0, t1):
    town_scene()
    G = gus(t0, t1)
    G.act(t0, "cross")
    G.face(t0, eyes="angry", mouth="frown")
    cam = Cam()
    cam.push(t0, t1, up(GUS, FH * 1.35), 4.4, 3.4, yaw=-5, pitch=-2, lens=35)
    cam.handheld(0.8)


@S(54, 281, 292, "Gus stomps along, leaving craters in the sidewalk")
def s54(t0, t1):
    town_scene()
    p0, p1 = (-8, -30, 0), (4, -30, 0)
    G = gus(t0, t1, loc=p0, rot=90)
    rate = 0.9
    G.walk(t0, t1, p0, p1, rate=rate, swing=22, arm=16, bob=0.1)
    step = 1.0 / (rate * 2)
    t, k = t0 + step, 0
    while t < t1 - 0.05:
        f = (t - t0) / (t1 - t0)
        x = p0[0] + (p1[0] - p0[0]) * f
        side = 0.68 if k % 2 == 0 else -0.68
        cr = W.crater(f"crater{k}", (x + 0.6, -30 + side, 0.02), 1.3)
        sets.set_obj_visible(cr, t0, False)
        for ob in cr.children:
            sets.set_obj_visible(ob, t0, False)
            sets.set_obj_visible(ob, t, True)
        sets.set_obj_visible(cr, t, True)
        sfx(t, "stomp", 0.9)
        t += step
        k += 1
    cam = Cam()
    cam.track(G, t0, t1, offset=(3.0, -13.0, 1.6), look_up=4.2, lens=24, step=0.25, fstop=6)
    cam.handheld(1.6)


@S(55, 292, 296, "Then I noticed something: Eddie's eyes go wide")
def s55(t0, t1):
    sky_scene(seed=55)
    E = eddie(t0, t1, "neutral")
    fly(E, t0, t1, (0, 0, 60), (0, 0, 60.3), rot=0)
    tn = w(294)
    E.face(tn, "gasp")
    E.look(tn + 0.35, 0, 28)
    E.face(tn + 0.35, eyes="down", mouth="o")
    dangle(E, t0, t1); drift(E, 0.5)
    cam = Cam()
    cam.push(t0, t1, (0, 0, 64.6), 6.0, 4.5, yaw=12, pitch=6, lens=30)
    cam.crash(tn, 28, 38, 0.1)
    cam.handheld(0.9)
    sfx(tn, "ding")


@S(56, 296, 304, "POV straight down at Gus: the heaviest kid in the world")
def s56(t0, t1):
    town_scene()
    G = gus(t0, t1, rot=0)
    G.act(t0, "cross")
    G.pose(t0, head=(0, -30, 0))
    src = crowd_src("UP56", t0, t1, [90, 91, 92], spread=3.5, seed=56)
    crowd(src, t0, t1, 10, ((-70, 70), (-90, 30)), (20, 40), (21, 41), seed=56)
    cam = Cam()
    cam.key(t0, (0, -29.0, 72), (0, -30, 0), lens=18, roll=0, focus=72.0, fstop=16)
    cam.key(t1, (0, -29.2, 70), (0, -30, 0), lens=90, focus=70.0, fstop=16)
    set_interp(cam.cd, "lens", F(t0), "EXPO", "EASE_IN")
    cam.handheld(0.5)
    sfx(t0 + 0.3, "whoosh")


@S(57, 304, 310, "So I grabbed the mayor's tie")
def s57(t0, t1):
    sky_scene(seed=57)
    E = eddie(t0, t1, "determined")
    M = mayor(t0, t1, "joy")
    fly(E, t0, t1, (-1.6, 0, 60.5), (-1.6, 0, 60.7), rot=0)
    fly(M, t0, t1, (1.8, 0.5, 62.0), (1.8, 0.5, 62.2), rot=0)
    laugh(M, t0, w(306) + 0.1, belly=True)
    tg = w(306)
    E.act(tg, "idle", armL=(0, 122))
    M.face(tg + 0.1, "gasp")
    M.act(tg + 0.1, "shock", 0.7)
    for c in (E, M):
        dangle(c, t0, t1)
    cam = Cam()
    cam.push(t0, t1, (0.2, 0.2, 64.4), 10.0, 8.0, yaw=0, pitch=4, lens=20)
    cam.handheld(0.9)
    sfx(tg, "pop")


@S(58, 310, 314, "Leo grabbed my shoe")
def s58(t0, t1):
    sky_scene(seed=58)
    E = eddie(t0, t1, "determined")
    fly(E, t0, t1, (0, 0, 60), (0, 0, 60.1), rot=0)
    E.pose(t0, armL=(0, 150), armR=(10, 8))
    L = leo(t0, t1, "joy")
    tg = w(311)
    fly(L, t0, tg, (0.7, 0.3, 52.5), (0.6, 0.2, 54.4), rot=0)
    L.act(tg - 0.15, "cheer", 1.0)
    laugh(L, t0, t1, belly=False)
    E.look(tg + 0.05, 0, 30)
    E.face(tg + 0.05, eyes="down", mouth="o")
    cam = Cam()
    cam.key(t0, (0, -8, 64), (0, 0, 64.2), lens=26, focus=8.0, fstop=4)
    cam.key(t1, (0, -8.5, 58.5), (0, 0, 58.0), lens=26, focus=8.5, fstop=4)
    cam.handheld(0.9)
    sfx(tg, "pop")


def chain_scene(t0, t1, n, bottom_z, with_gus=True, cluster=True):
    town_scene()
    piv = human_chain(t0, t1, n, (GUS[0], GUS[1], bottom_z))
    if cluster:
        src = crowd_src("TOP", t0, t1, [120, 121, 122, 123, 124, 125], spread=4, seed=9)
        topz = bottom_z + n * 5.6
        for i in range(10):
            a = i / 10 * math.tau
            ob = instance(f"top{i}", src, (math.cos(a) * 9, math.sin(a) * 9, 4 + (i % 3) * 5))
            ob.parent = piv
            ob.location = (math.cos(a) * 9, math.sin(a) * 9, n * 5.6 + (i % 3) * 5)
    G = gus(t0, t1, rot=0) if with_gus else None
    return piv, G


@S(59, 314, 320, "A thousand people grab each other: chain forms as the camera dives")
def s59(t0, t1):
    piv, G = chain_scene(t0, t1, 9, 14.0, cluster=False)
    G.face(t0, "lookup")
    G.pose(t0, head=(0, -30, 0))
    G.act(t0, "cross")
    E = eddie(t0, t1, "determined")
    E.pose(t0, loc=(0, -30, 14 + 9 * 5.6 + 1.0), rot=0, armL=(176, 6), armR=(176, 6))
    cam = Cam()
    cam.key(t0, (0, -44, 68), (0, -30, 66), lens=24, focus=14.0, fstop=6)
    cam.key(t1, (0, -46, 12), (0, -30, 10), lens=24, focus=16.0, fstop=6)
    set_interp(cam.ob, "location", F(t0), "QUAD", "EASE_IN_OUT")
    cam.handheld(0.8)
    for i in range(3):
        sfx(t0 + i * 0.4, "pop", 0.8)


@S(60, 320, 327, "The longest human chain ever: wide")
def s60(t0, t1):
    piv, G = chain_scene(t0, t1, 22, 12.0)
    G.face(t0, "lookup")
    G.pose(t0, head=(0, -30, 0))
    cloud_ring((0, -30, 140), 30, 160, 14, seed=60, dz=(-10, 20))
    cam = Cam()
    cam.key(t0, (55, -150, 60), (0, -30, 68), lens=26, focus=130.0, fstop=16)
    cam.key(t1, (70, -185, 72), (0, -30, 72), lens=26, focus=165.0, fstop=16)
    cam.handheld(0.6)
    sfx(t0, "sparkle")


@S(61, 327, 329, "GUS! CATCH! Eddie shouts down")
def s61(t0, t1):
    sky_scene(seed=61)
    E = eddie(t0, t1, "shout")
    fly(E, t0, t1, (0, 0, 60), (0, 0, 60.2), rot=0)
    E.pose(t0, head=(0, 32, 0), armL=(176, 6), armR=(150, -30))
    lips(E, t0, t1, "shout")
    E.face(t0, eyes="angry")
    L = leo(t0, t1, "joy")
    L.pose(t0, loc=(0.4, 0.2, 54.4), rot=0, armL=(176, 6), armR=(176, 6))
    laugh(L, t0, t1, belly=False)
    cam = Cam()
    cam.push(t0, t1, (0, 0, 64.4), 6.5, 5.2, yaw=25, pitch=-22, lens=28)
    cam.crash(t0, 24, 30, 0.1)
    cam.handheld(1.2)


@S(62, 329, 335, "Gus catches the end and pulls")
def s62(t0, t1):
    tc, tp = w(330), w(334)
    piv, G = chain_scene(t0, t1, 10, 9.6, cluster=False)
    piv.keyframe_insert("location", frame=F(t0))
    piv.location[2] = 7.6
    piv.keyframe_insert("location", frame=F(tc))
    piv.keyframe_insert("location", frame=F(tp))
    piv.location[2] = 6.2
    piv.keyframe_insert("location", frame=F(t1))
    G.face(t0, "lookup")
    G.pose(t0, head=(0, -26, 0))
    G.act(t0 + 0.05, "cheer", 1.0)
    G.face(tc, eyes="angry", mouth="grimace")
    G.act(tp, "cheer", 0.75, hipz=-0.35)
    cam = Cam()
    cam.key(t0, (3, -42, 1.5), (0, -30, 8.0), lens=22, focus=12.0, fstop=5)
    cam.key(t1, (2.5, -40.5, 2.0), (0, -30, 9.0), lens=22, focus=11.0, fstop=5)
    cam.handheld(0.9)
    sfx(tc, "clink", 0.7)
    sfx(tp, "rope")


@S(63, 335, 336, "HARD. Gus heaves")
def s63(t0, t1):
    piv, G = chain_scene(t0, t1, 6, 8.4, cluster=False)
    G.face(t0, eyes="angry", mouth="grimace_wide")
    G.pose(t0, armL=(140, 20), armR=(140, 20), torso=(0, -14, 0), hipz=-0.4, head=(0, -10, 0))
    G.pose(t1, armL=(110, 20), armR=(110, 20), torso=(0, -20, 0), hipz=-0.5)
    noise(G.hip, "rotation_euler", 2, 0.04, 1.5)
    cam = Cam()
    cam.push(t0, t1, up(GUS, FH * 1.35), 6.0, 4.6, yaw=10, pitch=-6, lens=30)
    cam.handheld(2.0)
    sfx(t0, "rope")
    sfx(t0 + 0.05, "stomp", 0.6)


@S(64, 336, 344, "Everyone comes down like a giant kite")
def s64(t0, t1):
    piv, G = chain_scene(t0, t1, 22, 7.6)
    piv.rotation_euler[0] = math.radians(-8)
    piv.keyframe_insert("rotation_euler", index=0, frame=F(t0))
    piv.rotation_euler[0] = math.radians(72)
    piv.keyframe_insert("rotation_euler", index=0, frame=F(t1))
    G.pose(t0, armL=(150, 20), armR=(150, 20), torso=(0, -12, 0), hipz=-0.3)
    G.pose(t1, armL=(120, 20), armR=(120, 20), torso=(0, -16, 0))
    G.face(t0, eyes="angry", mouth="grimace")
    cam = Cam()
    cam.key(t0, (150, -70, 48), (0, -70, 50), lens=24, focus=150.0, fstop=16)
    cam.key(t1, (140, -90, 24), (0, -95, 22), lens=24, focus=140.0, fstop=16)
    cam.handheld(0.6)
    sfx(t0, "whoosh")
    sfx(t0 + 0.1, "wind", 0.8, dur=t1 - t0)


@S(65, 344, 347, "Everybody lands safely")
def s65(t0, t1):
    town_scene()
    rnd = random.Random(65)
    for i in range(7):
        k = townie(80 + i, t0, t1, "joy")
        p = (-8 + i * 2.8, -26 + rnd.uniform(-3, 3), 0)
        tl = t0 + 0.15 + i * 0.1
        fly(k, t0, tl, up(p, 5.5), p, rot=rnd.uniform(-25, 25))
        set_interp(k.root, "location", F(t0), "QUAD", "EASE_IN")
        k.pose(tl, hipz=-0.35)
        k.pose(tl + 0.15, hipz=0.0)
        puff(f"puff{i}", (p[0], p[1], 0.4), tl)
    G = gus(t0, t1, loc=(0, -33, 0), rot=0)
    G.face(t0, eyes="normal", mouth="frown")
    cam = Cam()
    cam.key(t0, (2, -48, 2.5), (0, -27, 3.0), lens=22, focus=20.0, fstop=8)
    cam.key(t1, (1.5, -46, 2.5), (0, -27, 3.2), lens=22, focus=19.0, fstop=8)
    cam.handheld(1.0)
    sfx(t0 + 0.15, "thud")
    sfx(t0 + 0.45, "thud", 0.8)
    sfx(t0 + 0.75, "poof", 0.8)


@S(66, 347, 353, "The whole town cheers for Gus")
def s66(t0, t1):
    town_scene()
    G = gus(t0, t1, rot=0)
    G.face(t0, eyes="wide", mouth="flat")
    rnd = random.Random(66)
    for i in range(9):
        a = i / 9 * math.tau
        p = (math.sin(a) * 7, -30 - math.cos(a) * 7 + 4, 0)
        k = townie(80 + i, t0, t1, "joy")
        k.pose(t0, loc=p, rot=facing(p, GUS))
        k.act(t0 + rnd.uniform(0, 0.2), "cheer")
        k.jump(t0 + rnd.uniform(0.1, 0.4), 1.2, 0.45, loc=p)
        k.talk(t0, t1, open_m="open_smile", wide_m="laugh", rest="open_smile", syll=0.12)
    src = crowd_src("CH66", t0, t1, [130, 131, 132, 133, 134], mode="cheer", spread=4, seed=66)
    crowd(src, t0, t1, 10, ((-30, 30), (-50, -38)), (0, 0), (0, 0), seed=66)
    confetti("cf", (0, -30, 12), (10, 10, 4), t0 + 0.2, 1.3, n=80)
    cam = Cam()
    cam.orbit(t0, t1, up(GUS, 5.0), 15.0, -40, 20, pitch=10, lens=24, fstop=6)
    cam.handheld(0.8)
    sfx(t0, "cheer", 1.0, dur=t1 - t0 + 0.6)
    sfx(t0 + 0.2, "confetti")


@S(67, 353, 361, "And for the first time in his life...")
def s67(t0, t1):
    town_scene()
    G = gus(t0, t1, rot=0)
    G.face(t0, eyes="wide", mouth="flat")
    G.face(t0 + 0.6, eyes="half", mouth="flat")
    src = crowd_src("CH67", t0, t1, [130, 131, 132, 133, 134], mode="cheer", spread=4, seed=67)
    crowd(src, t0, t1, 8, ((-20, 20), (-26, -18)), (0, 0), (0, 0), seed=67)
    cam = Cam()
    cam.push(t0, t1, up(GUS, FH * 1.35), 7.5, 5.5, yaw=-8, pitch=0, lens=32, fstop=2.8)
    cam.handheld(0.6)


@S(68, 361, 363, "Gus smiled")
def s68(t0, t1):
    town_scene()
    G = gus(t0, t1, rot=0)
    ts = w(362)
    G.face(t0, eyes="half", mouth="flat")
    G.face(ts, eyes="normal", mouth="smile")
    G.look(ts, 0, -6)
    cam = Cam()
    cam.push(t0, t1, up(GUS, FH * 1.35), 5.2, 4.5, yaw=-4, pitch=0, lens=32, fstop=2.8)
    cam.crash(ts, 32, 40, 0.1)
    cam.handheld(0.6)
    sfx(ts, "sparkle")


@S(69, 363, 366, "Then he laughed: Gus's feet leave the ground")
def s69(t0, t1):
    town_scene()
    tl = w(365)
    G = gus(t0, t1, rot=0)
    G.face(t0, "smile")
    laugh(G, tl, t1, belly=True, amp=1.2)
    G.pose(tl, loc=GUS)
    G.pose(t1, loc=up(GUS, 1.4), legL=(-12, 6), legR=(18, -6))
    rnd = random.Random(69)
    for i in range(5):
        a = -1.3 + i * 0.65
        p = (math.sin(a) * 8, -30 + math.cos(a) * 6, 0)
        k = townie(80 + i, t0, t1, "joy")
        k.pose(t0, loc=p, rot=facing(p, GUS))
        k.face(tl + 0.2, "gasp")
        k.act(tl + 0.2, "shock", 0.8)
    cam = Cam()
    cam.push(t0, t1, up(GUS, 4.5), 13.0, 11.0, yaw=0, pitch=4, lens=24, fstop=5)
    cam.handheld(0.8)
    sfx(tl, "rise")


@S(70, 366, 368, "Uh oh: Eddie's face")
def s70(t0, t1):
    town_scene()
    E = eddie(t0, t1, "shock")
    E.pose(t0, loc=(-3, -36, 0), rot=facing((-3, -36), (0, -46)))
    E.act(t0, "shock")
    E.look(t0 + 0.1, 20, -12)
    cam = Cam()
    cam.push(t0, t1, (-3, -36, FH), 5.2, 4.2, yaw=10, pitch=0, lens=30)
    cam.crash(t0, 26, 36, 0.1)
    cam.handheld(1.0)
    sfx(t0, "pop", 0.5)


@S(71, 368, 371, "WHOOSH: Gus rockets off the ground")
def s71(t0, t1):
    town_scene()
    G = gus(t0, t1, rot=0)
    G.pose(t0, loc=up(GUS, 1.4))
    G.pose(t1, loc=up(GUS, 70))
    set_interp(G.root, "location", F(t0), "EXPO", "EASE_IN")
    laugh(G, t0, t1, flail=True)
    G.pose(t0, legL=(-10, 4), legR=(10, -4))
    for i in range(8):
        tz = t0 + 0.15 + i * 0.1
        puff(f"trail{i}", (random.uniform(-0.6, 0.6), -30 + random.uniform(-0.6, 0.6), 1 + i * 6), tz, 1.6 + i * 0.2)
    for i in range(4):
        puff(f"dust{i}", (math.cos(i * 1.57) * 2.5, -30 + math.sin(i * 1.57) * 2.5, 0.5), t0 + 0.05, 2.0)
    cam = Cam()
    cam.key(t0, (3, -45, 1.5), (0, -30, 6.5), lens=22, focus=15.0, fstop=6)
    cam.key(t1, (3, -45, 2.5), (0, -30, 60), lens=18, focus=40.0, fstop=6)
    set_interp(cam.ob, "rotation_euler", F(t0), "QUAD", "EASE_IN")
    cam.handheld(1.6)
    sfx(t0 + 0.02, "rocket")


@S(72, 371, 374, "...straight into space")
def s72(t0, t1):
    W.space_world(1.0)
    W.sun(7.0, rot=(50, 0, 20))
    light("space_fill", "AREA", (6, -14, 12), 2500, (0.8, 0.85, 1.0), 8, target=(0, 0, 5))
    earth()
    G = gus(t0, t1, rot=0, loc=(0, 0, 4))
    fly(G, t0, t1, (0, 0, 2), (0, 0, 6), rot=-10)
    laugh(G, t0, t1, flail=True)
    dangle(G, t0, t1)
    drift(G)
    cam = Cam()
    cam.push(t0, t1, (0, 0, 7.5), 16.0, 11.0, yaw=20, pitch=24, lens=24, yaw1=5, fstop=11)
    cam.handheld(0.6)
    sfx(t0 + 0.1, "sparkle")


@S(73, 374, None, "Somebody tell him something sad!")
def s73(t0, t1):
    town_scene()
    E = eddie(t0, t1, "shout")
    ep = (-3, -36, 0)
    E.pose(t0, loc=ep, rot=-10, head=(0, -24, 0), armL=(140, -25), armR=(140, -25))
    lips(E, t0, t1, "shout")
    E.face(t0, eyes="up")
    L = leo(t0, t1, "gasp")
    L.pose(t0, loc=(-1.5, -33, 0), rot=10, head=(0, -30, 0))
    L.face(t0, "lookup")
    for i in range(4):
        k = townie(84 + i, t0, t1, "lookup")
        k.pose(t0, loc=(-12 + i * 3.2, -30 + (i % 2) * 2, 0), rot=random.uniform(-20, 20), head=(0, -32, 0))
    cam = Cam()
    cam.push(t0, t1, (ep[0], ep[1], FH), 7.0, 5.0, yaw=14, pitch=-6, lens=28, yaw1=6)
    cam.crash(w(377), 28, 34, 0.1)
    cam.handheld(1.0)
