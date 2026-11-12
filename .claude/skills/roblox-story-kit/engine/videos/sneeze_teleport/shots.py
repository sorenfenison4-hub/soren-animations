"""sneeze_teleport: "In this world, every time you sneeze, you teleport." 66 shots keyed to script word indices."""
from shotkit import *
from rbx import story
from rbx.story import *
import math, random
from mathutils import Vector

V = Video(__file__)
story.bind(V)
BOARD = "chalk_cat.png"
LOT = (-30.0, -18.0)
PLANE_SKY = (0.0, 0.0, 60.0)


# ------------------------------------------------------------------ cast
def whiskers(t0, t1, expr="happy"):
    return story._live(chars.Char("Whiskers", skin="#f2dbc6", shirt="#f09ac2", pants="#5a4a7a", hair="bun",
                                  hair_color="#8a5a3a", face="girl", sleeves="long", extras=("glasses",)), t0, t1, expr)


def uncle(t0, t1, expr="neutral"):
    return story._live(chars.Char("Uncle", skin="#e9c7a6", shirt="#e8b520", shirt_kind="checker", shirt_c2="#c8761e",
                                  pants="#3b3f4a", hair="short", hair_color="#5a3a22", face="mustache"), t0, t1, expr)


def instructor(t0, t1, expr="neutral"):
    return story._live(chars.Char("Instructor", skin="#f0dcc3", shirt="#f4f4f4", pants="#2a2d36", hair="slick",
                                  hair_color="#9a9a9a", face="plain", extras=("glasses", "collar:#2a2d36")), t0, t1, expr)


def cop(t0, t1):
    return story._live(chars.Char("Cop", skin="#c99a72", shirt="#1e2a4a", pants="#1e2a4a", hair="cap", hair_color="#1e2a4a",
                                  face="mustache", sleeves="long", extras=("collar:#3a4a7a",)), t0, t1, "determined")


def florist(t0, t1):
    f = story._live(chars.Char("Florist", skin="#f2dbc6", shirt="#f4f4f6", pants="#e8e8ec", hair="bob", hair_color="#c87a3a",
                               face="girl", sleeves="long"), t0, t1, "smile")
    W2.astronaut_helmet(f)
    return f


def cat_on_head(ch, name="cat"):
    c = W2.cat(name, (0, 0, 0))
    c.parent = ch.head
    c.location = (0, 0.1, 0.72)
    c.scale = (0.62,) * 3
    return c


def red_nose(ch):
    return sphere(ch.name + "_rednose", 0.13, (0, -0.63, -0.08), mat("rednose", hexc("#e0403a"), 0.3), parent=ch.head,
                  coll=ch.coll)


def yokes():
    Mg = mat("yoke_grey", hexc("#2a2d33"), 0.4, metal=0.3)
    out = []
    for sx in (-1, 1):
        box(f"yoke_col{sx}", (0.3, 0.3, 1.8), (sx * 2.2, 1.7, 2.5), Mg, 0.05)
        piv = empty(f"yoke{sx}", (sx * 2.2, 1.5, 3.5))
        box(f"yoke_bar{sx}", (1.5, 0.18, 0.22), (0, 0, 0), Mg, 0.05, parent=piv)
        for gx in (-1, 1):
            box(f"yoke_g{sx}{gx}", (0.22, 0.2, 0.7), (gx * 0.7, 0, 0.2), Mg, 0.05, parent=piv)
        out.append(piv)
    return out


def cockpit_scene(t0, t1, drift_clouds=True):
    world((0.6, 0.75, 1.0), 0.6)
    K = W.cockpit()
    Y = yokes()
    if drift_clouds:
        for ob in list(D.objects):
            if ob.name.startswith("ck_cloud") and ob.parent is None:
                ob.keyframe_insert("location", frame=F(t0))
                ob.location[0] -= 10 * (t1 - t0)
                ob.keyframe_insert("location", frame=F(t1))
    return K, Y


def seat_pilot(ch, t, side=-1):
    ch.pose(t, loc=(side * 2.2, -0.5, 0.3), rot=180, legL=(85, 3), legR=(85, -3), armL=(70, -10), armR=(70, -10))


def hide_tree(root, t, vis=False, t_before=None):
    obs = [root] + list(root.children_recursive)
    tb = t_before if t_before is not None else t - 1.0 / 30
    for ob in obs:
        sets.set_obj_visible(ob, tb, not vis)
        sets.set_obj_visible(ob, t, vis)


def plane_sky(t0, t1, p0=PLANE_SKY, p1=None, pitch=0.0, pitch1=None, roll=0.0, seed=4):
    W.sky(1.0)
    W.sun(4.0, rot=(52, 0, 30))
    cloud_ring(p0, 48, 140, 30, seed=seed)
    cloud_ring((p0[0], p0[1], p0[2] - 30), 0, 160, 24, seed=seed + 1, dz=(-4, 4), scale=(2.5, 4.5))
    pl = W2.airliner("plane", p0, rot=0)
    p1 = p1 or (p0[0], p0[1] - 40 * (t1 - t0), p0[2])
    pl.rotation_euler[0] = math.radians(pitch)
    pl.rotation_euler[1] = math.radians(roll)
    pl.keyframe_insert("location", frame=F(t0))
    pl.keyframe_insert("rotation_euler", frame=F(t0))
    pl.location = p1
    if pitch1 is not None:
        pl.rotation_euler[0] = math.radians(pitch1)
    pl.keyframe_insert("location", frame=F(t1))
    pl.keyframe_insert("rotation_euler", frame=F(t1))
    set_interp(pl, "location", F(t0), "LINEAR")
    return pl, p1


def convertible(name, loc, color="#d9453a", rot=0):
    c = W.car(name, loc, color, rot=rot)
    top = D.objects.get(name + "_top")
    if top:
        D.objects.remove(top, do_unlink=True)
    box(name + "_seat", (4.0, 3.0, 1.2), (0, 1.2, 1.4), mat("car_seat", hexc("#2a2a2e"), 0.6), 0.2, parent=c)
    box(name + "_wind", (4.2, 0.15, 1.4), (0, -1.6, 3.3), mat("car_wind", (0.8, 0.9, 1.0), 0.05, alpha=0.25, spec=1.0), 0.05,
        parent=c, rot=(-20, 0, 0))
    return c


def clipboard(ch, local=(0.4, -1.1, 4.3)):
    root = empty(ch.name + "_clip", local, parent=ch.root)
    box(ch.name + "_clipb", (1.3, 0.08, 1.7), (0, 0, 0), mat("clip_brown", hexc("#8a5a32"), 0.6), 0.03, parent=root)
    card(ch.name + "_clipp", 1.15, 1.45, (0, -0.06, -0.05), img_mat("failed", os.path.join(W.TEX, "failed.png"), 0.5),
         "-Y", parent=root)
    return root


def kid_scene_class(t0, t1, kids=8, **kw):
    R, ks = class_scene(t0, t1, kids=kids, board=BOARD, **kw)
    return R, ks


# ================================================================== HOOK
@S(1, 0, 5, "HOOK: Eddie's monster sneeze in class, then POOF")
def s01(t0, t1):
    R, ks = kid_scene_class(t0, t1)
    E = eddie(t0, t1, "neutral")
    W.sit(E, t0, E_DESK)
    tc = w(1) + 0.12
    W2.sneeze(E, t0, tc)
    tv = w(4) - 0.02
    W2.vanish(E, tv)
    W2.poof("poof", up(E_SEAT, 4.0), tv, 0.6)
    c = W2.cat("cat", (3.7, 6.4, 3.42), rot=160)
    for k in ks:
        k.face(tc + 0.05, "gasp")
        look_at(k, tc + 0.05, up(E_SEAT, 4.6))
    cam = Cam()
    cam.push(t0, t1, up(E_SEAT, 4.4), 6.0, 4.4, yaw=196, pitch=4, lens=26, yaw1=184)
    cam.crash(tc, 26, 36, 0.08)
    cam.handheld(1.4)
    sfx(tc, "sneeze")
    sfx(tv, "poof")


@S(2, 5, 8, "Airliner roars past through the clouds")
def s02(t0, t1):
    pl, p1 = plane_sky(t0, t1, (0, 14, 60), (0, -10, 60), roll=-8)
    cam = Cam()
    cam.key(t0, (16, -24, 61), (0, 14, 60), lens=22, focus=40.0, fstop=8)
    cam.key(t1, (16, -26, 61), (0, -10, 60), lens=22, focus=28.0, fstop=8)
    cam.handheld(1.2)
    sfx(t0 - 0.05, "jet")


@S(3, 8, 13, "POOF: Eddie appears in the cockpit between the pilots")
def s03(t0, t1):
    cockpit_scene(t0, t1)
    P = pilot(t0, t1, "neutral")
    seat_pilot(P, t0, -1)
    C = pilot(t0, t1, "neutral", name="CoPilot", shirt="#e8eef8")
    seat_pilot(C, t0, 1)
    E = eddie(t0, t1, "gasp")
    ta = t0 + 0.08
    E.pose(t0, loc=(0, -2.2, 0), rot=180)
    W2.appear(E, ta, t0)
    W2.poof("poof", (0, -2.2, 3.5), ta, 0.6)
    E.act(ta + 0.05, "shock")
    for ch in (P, C):
        ch.face(ta + 0.25, "shock")
        look_at(ch, ta + 0.25, (0, -2.2, 4.6))
    cam = Cam()
    cam.push(t0, t1, (0, -1.6, 4.4), 7.0, 5.4, yaw=180, pitch=6, lens=20, yaw1=172)
    cam.crash(ta, 20, 26, 0.1)
    cam.handheld(1.0)
    sfx(ta, "poof")


@S(4, 13, 18, "The pilot sneezes too")
def s04(t0, t1):
    cockpit_scene(t0, t1)
    P = pilot(t0, t1, "shock")
    seat_pilot(P, t0, -1)
    E = eddie(t0, t1, "gasp")
    E.pose(t0, loc=(0, -2.2, 0), rot=180)
    tc = w(16) + 0.1
    W2.sneeze(P, t0 + 0.05, tc)
    cam = Cam()
    cam.push(t0, t1, (-2.2, -0.5, 5.2), 4.8, 3.8, yaw=200, pitch=4, lens=24)
    cam.crash(tc, 24, 32, 0.08)
    cam.handheld(1.2)
    sfx(tc, "sneeze", 0.8)


@S(5, 18, 22, "POOF: the pilot vanishes, empty seat")
def s05(t0, t1):
    cockpit_scene(t0, t1)
    P = pilot(t0, t1, "terror")
    seat_pilot(P, t0, -1)
    tv = t0 + 0.06
    W2.vanish(P, tv)
    W2.poof("poof", (-2.2, -0.5, 4.5), tv, 0.6)
    E = eddie(t0, t1, "shock")
    E.pose(t0, loc=(0, -2.2, 0), rot=180)
    E.act(tv + 0.1, "hands_head", expr="terror")
    cam = Cam()
    cam.push(t0, t1, (-1.2, -1.0, 4.4), 6.5, 5.0, yaw=190, pitch=5, lens=22)
    cam.handheld(1.2)
    sfx(tv, "poof")


@S(6, 22, 27, "Eddie flying the plane: panic at the yoke, alarms")
def s06(t0, t1):
    K, Y = cockpit_scene(t0, t1)
    E = eddie(t0, t1, "terror")
    seat_pilot(E, t0, -1)
    E.pose(t0, armL=(80, -14), armR=(80, -14))
    E.face(t0, eyes="terror", mouth="scream")
    yk = Y[0]
    for i in range(6):
        yk.rotation_euler[1] = math.radians(25 if i % 2 else -25)
        yk.keyframe_insert("rotation_euler", index=1, frame=F(t0 + i * 0.22))
    noise(E.hip, "rotation_euler", 2, 0.06, 2)
    cam = Cam()
    cam.push(t0, t1, (-2.2, -0.5, 5.0), 5.2, 4.2, yaw=185, pitch=6, lens=24, roll=0)
    cam.handheld(2.2)
    cam.ob.keyframe_insert("rotation_euler", index=1, frame=F(t0))
    sfx(t0, "alarm")


@S(7, 27, 32, "Exterior: the plane wobbling through the clouds")
def s07(t0, t1):
    pl, p1 = plane_sky(t0, t1, pitch=6, pitch1=-6, roll=-14, seed=7)
    pl.rotation_euler[1] = math.radians(14)
    pl.keyframe_insert("rotation_euler", index=1, frame=F(t1))
    cam = Cam()
    cam.orbit(t0, t1, (0, -20, 60), 36, -60, -20, pitch=10, lens=24, fstop=11)
    cam.handheld(1.0)
    sfx(t0, "jet", 0.8)


@S(8, 32, 36, "Rule: a kid on the school path sneezes")
def s08(t0, t1):
    town_scene()
    k = townie(20, t0, t1, "neutral")
    k.pose(t0, loc=(3, -8, 0), rot=10)
    tc = w(35) + 0.05
    W2.sneeze(k, t0 + 0.05, tc)
    cam = Cam()
    cam.push(t0, t1, (3, -8, 4.4), 7.0, 5.5, yaw=-15, pitch=2, lens=28)
    cam.crash(tc, 28, 36, 0.08)
    cam.handheld(1.0)
    sfx(tc, "sneeze", 0.8)


@S(9, 36, 40, "...and pops up on top of the school canopy")
def s09(t0, t1):
    town_scene()
    k = townie(20, t0, t1, "gasp")
    roof = (0.5, 8.5, 9.4)
    k.pose(t0, loc=roof, rot=0)
    ta = t0 + 0.25
    W2.appear(k, ta, t0)
    W2.poof("poof_b", up(roof, 2.5), ta, 0.9)
    W2.poof("poof_a", (3, -8, 2.5), t0 + 0.02, 0.9)
    k.act(ta + 0.05, "shock")
    k.face(ta + 0.05, "shock")
    cam = Cam()
    cam.whip(t0, ta - 0.04, (6, -20, 3), (3, -8, 3), (5, -6, 9), up(roof, 3.0))
    cam.key(t1, (4.5, -4.5, 9.6), up(roof, 3.2), lens=None)
    cam.handheld(1.0)
    sfx(t0 + 0.02, "poof")
    sfx(ta, "poof", 0.8)


@S(10, 40, 45, "That's why pepper is illegal: a pepper shaker behind bars")
def s10(t0, t1):
    world((0.4, 0.45, 0.55), 0.3)
    J = W2.pepper_jail()
    C = cop(t0, t1)
    C.pose(t0, loc=(4.5, -5.5, 0), rot=facing((4.5, -5.5), (0, -14)))
    C.act(t0, "cross")
    sh = J["shaker"]
    noise(sh, "rotation_euler", 1, 0.05, 6)
    cam = Cam()
    cam.key(t0, (0.5, -13, 4.5), (0, 3, 2.6), lens=28, focus=16.0, fstop=4)
    cam.key(t1, (0.3, -6.0, 3.6), (0, 3, 2.4), lens=28, focus=9.0, fstop=4)
    cam.handheld(0.7)
    sfx(t0 + 0.1, "door", 0.6)


@S(11, 45, 49, "Florists wear space suits: pollen everywhere")
def s11(t0, t1):
    world((0.9, 0.85, 0.9), 0.5)
    W2.flower_shop()
    Fl = florist(t0, t1)
    Fl.pose(t0, loc=(0, 6.0, 1.0), rot=0)
    Fl.act(t0, "hold", 0.8)
    cam = Cam()
    cam.orbit(t0, t1, (0, 6.0, 5.4), 7.0, -25, 20, pitch=4, lens=26, fstop=4)
    cam.handheld(0.7)


@S(12, 49, 57, "Uncle's driving test: he sneezes and the whole car poofs")
def s12(t0, t1):
    town_scene()
    car = convertible("ucar", (0, -20, 0), "#d9453a")
    U = uncle(t0, t1, "determined")
    U.pose(t0, loc=(-1.1, -19.6, -0.6), rot=0, legL=(85, 3), legR=(85, -3), armL=(70, -12), armR=(70, -12))
    I = instructor(t0, t1, "neutral")
    I.pose(t0, loc=(4.8, -22, 0), rot=facing((4.8, -22), (0, -20)))
    clipboard(I, (0.5, -1.0, 3.2))
    I.pose(t0, armL=(60, -15), armR=(60, -15))
    tc = w(52) + 0.12
    W2.sneeze(U, w(51), tc)
    tv = w(56) + 0.05
    W2.vanish(U, tv)
    hide_tree(car, tv)
    W2.poof("poof", (0, -20, 2.5), tv, 1.6)
    I.face(tv + 0.1, "shock")
    cam = Cam()
    cam.push(t0, t1, (0.6, -20.0, 3.8), 11.0, 8.5, yaw=-22, pitch=18, lens=24, yaw1=-8)
    cam.crash(tc, 24, 30, 0.08)
    cam.handheld(0.9)
    sfx(tc, "sneeze", 0.8)
    sfx(tv, "poof")


@S(13, 57, 62, "...and lands on the moon, car and all")
def s13(t0, t1):
    W2.moon()
    car = convertible("ucar", (0, 0, 0), "#d9453a", rot=20)
    U = uncle(t0, t1, "terror")
    U.root.parent = car
    U.pose(t0, loc=(-1.1, 0.4, -0.6), rot=0, legL=(85, 3), legR=(85, -3), armL=(70, -12), armR=(70, -12))
    ta = t0 + 0.12
    hide_tree(car, ta, True, t0)
    W2.poof("poof", (0, 0, 2.5), ta, 1.6)
    U.face(ta + 0.1, "terror")
    U.look(ta + 0.3, 30, -10)
    cam = Cam()
    cam.key(t0, (4, -10, 3.2), (0, 0, 2.6), lens=24, focus=11.0, fstop=8)
    cam.key(t1, (8, -16, 5.0), (0, 2, 4.0), lens=24, focus=18.0, fstop=8)
    cam.handheld(0.7)
    sfx(ta, "poof")
    sfx(ta + 0.1, "thud", 0.7)


@S(14, 62, 65, "He still failed: instructor holds up the FAILED sheet")
def s14(t0, t1):
    town_scene()
    I = instructor(t0, t1, "bored")
    p = (4.8, -22, 0)
    I.pose(t0, loc=p, rot=facing(p, (0, -34)))
    clipboard(I, (0.0, -1.2, 4.6))
    I.act(t0, "hold", 1.0, armL=(100, -18), armR=(100, -18))
    I.face(t0, eyes="half", mouth="flat")
    cam = Cam()
    cam.push(t0, t1, up(p, 4.6), 6.0, 4.6, yaw=facing(p, (0, -34)) + 0, pitch=2, lens=30)
    cam.crash(t0 + 0.05, 26, 34, 0.08)
    cam.handheld(0.8)
    sfx(t0 + 0.05, "buzzer", 0.6)


# ================================================================== PIVOT
@S(15, 65, 70, "But I'm allergic to everything: red nose, tissues")
def s15(t0, t1):
    R, ks = kid_scene_class(t0, t1)
    E = eddie(t0, t1, "worried")
    W.sit(E, t0, E_DESK)
    red_nose(E)
    box("tissues", (1.0, 0.7, 0.6), (3.6, 6.6, 3.72), mat("tissue_box", hexc("#6fb3e0"), 0.5), 0.05)
    for i in range(5):
        sphere(f"tissue{i}", 0.25, (1.0 + i * 0.35, 6.3 + (i % 2) * 0.4, 3.55), mat("tissue", hexc("#f4f4f4"), 0.9), (1, 1, 0.6))
    E.shake(t0 + 0.3, n=2, amp=10)
    cam = Cam()
    cam.push(t0, t1, up(E_SEAT, 4.4), 5.8, 4.4, yaw=190, pitch=4, lens=28, yaw1=176)
    cam.handheld(0.8)


@S(16, 70, 74, "And yesterday, my teacher...: the classroom")
def s16(t0, t1):
    R, ks = kid_scene_class(t0, t1, kids=10)
    E = eddie(t0, t1, "neutral")
    W.sit(E, t0, E_DESK)
    Wh = whiskers(t0, t1, "happy")
    Wh.walk(t0, t1, (-8, 12.0, 0), (-2.5, 11.6, 0), rate=2.4)
    cam = Cam()
    cam.key(t0, (9.5, -6, 9.5), (-1, 9, 3.5), lens=20, focus=18.0, fstop=8)
    cam.key(t1, (8.5, -3.5, 8.5), (-2, 10, 4.0), lens=20, focus=16.0, fstop=8)
    cam.handheld(0.6)


@S(17, 74, 81, "Miss Whiskers proudly holds up her cat")
def s17(t0, t1):
    R, ks = kid_scene_class(t0, t1, kids=8)
    Wh = whiskers(t0, t1, "happy")
    Wh.pose(t0, loc=(-1.5, 11.6, 0), rot=0)
    c = W2.cat("cat", (0, 0, 0))
    c.parent = Wh.root
    c.location = (0, -1.2, 3.4)
    c.keyframe_insert("location", frame=F(w(76)))
    c.location = (0, -1.3, 5.6)
    c.keyframe_insert("location", frame=F(w(78)))
    Wh.pose(t0, armL=(60, -20), armR=(60, -20))
    Wh.act(w(78), "cheer", 0.7)
    lips(Wh, t0, w(78))
    Wh.face(w(78), "joy")
    for k in ks:
        k.face(w(78) + 0.1, "happy")
    cam = Cam()
    cam.push(t0, t1, (-1.5, 11.6, 5.0), 8.5, 6.5, yaw=14, pitch=2, lens=28, fstop=4)
    cam.handheld(0.8)
    sfx(w(78), "meow")


# ================================================================== ESCALATION
@S(18, 81, 87, "The cat jumps onto Eddie's desk")
def s18(t0, t1):
    R, ks = kid_scene_class(t0, t1)
    E = eddie(t0, t1, "neutral")
    W.sit(E, t0, E_DESK)
    c = W2.cat("cat", (-3.5, 10.5, 0))
    tl = w(83) + 0.35
    c.keyframe_insert("location", frame=F(t0))
    c.location = (-0.5, 8.8, 5.6)
    c.keyframe_insert("location", frame=F((t0 + tl) / 2))
    c.location = (3.7, 6.4, 3.42)
    c.keyframe_insert("location", frame=F(tl))
    c.rotation_euler[2] = math.radians(-60)
    c.keyframe_insert("rotation_euler", index=2, frame=F(t0))
    c.rotation_euler[2] = math.radians(160)
    c.keyframe_insert("rotation_euler", index=2, frame=F(tl))
    E.act(tl, "recoil", 0.8, expr="gasp")
    cam = Cam()
    cam.push(t0, t1, (2.0, 6.4, 4.4), 7.5, 6.0, yaw=200, pitch=8, lens=24, yaw1=190)
    cam.handheld(0.9)
    sfx(tl, "thud", 0.6)
    sfx(tl + 0.15, "meow")


@S(19, 87, 91, "My nose started tingling: extreme close-up")
def s19(t0, t1):
    R, ks = kid_scene_class(t0, t1, kids=4)
    E = eddie(t0, t1, "neutral")
    W.sit(E, t0, E_DESK)
    W2.cat("cat", (3.7, 6.4, 3.42), rot=160)
    E.face(t0, eyes="squint", mouth="wavy")
    noise(E.neck, "rotation_euler", 2, 0.05, 1.5)
    E.face(t0 + 0.5, eyes="worried", mouth="wavy")
    cam = Cam()
    cam.push(t0, t1, up(E_SEAT, 4.5), 3.6, 2.8, yaw=180, pitch=2, lens=32)
    cam.handheld(0.7)


@S(20, 91, 94, "Ah... ah... CHOO!")
def s20(t0, t1):
    R, ks = kid_scene_class(t0, t1)
    E = eddie(t0, t1, "neutral")
    W.sit(E, t0, E_DESK)
    W2.cat("cat", (3.7, 6.4, 3.42), rot=160)
    tc = w(93)
    W2.sneeze(E, t0, tc)
    cam = Cam()
    cam.push(t0, tc, up(E_SEAT, 4.4), 5.0, 4.0, yaw=186, pitch=4, lens=28)
    cam.key(tc + 0.08, orbit_pos(up(E_SEAT, 4.4), 4.6, 186, 4), up(E_SEAT, 4.4), lens=36)
    cam.key(t1, orbit_pos(up(E_SEAT, 4.4), 4.8, 186, 4), up(E_SEAT, 4.4), lens=34)
    cam.handheld(1.6)
    sfx(tc, "sneeze")


@S(21, 94, 95, "POOF: Eddie is gone, the cat blinks")
def s21(t0, t1):
    R, ks = kid_scene_class(t0, t1)
    E = eddie(t0, t1, "terror")
    W.sit(E, t0, E_DESK)
    W2.vanish(E, t0 + 0.04)
    W2.poof("poof", up(E_SEAT, 4.0), t0 + 0.04, 0.6)
    W2.cat("cat", (3.7, 6.4, 3.42), rot=160)
    cam = Cam()
    cam.push(t0, t1, up(E_SEAT, 3.6), 7.0, 6.2, yaw=192, pitch=10, lens=24)
    cam.handheld(1.2)
    sfx(t0 + 0.04, "poof")


@S(22, 95, 103, "Eddie lands on stage at a comedy club")
def s22(t0, t1):
    world((0.12, 0.09, 0.14), 0.4)
    W.comedy_club()
    W2.seated_audience(t0, t1, rows=4, cols=7, origin=(0, -2.0), mode="stare", seed=1)
    E = eddie(t0, t1, "gasp")
    p = (0, 3.6, 1.2)
    E.pose(t0, loc=p, rot=0)
    ta = t0 + 0.1
    W2.appear(E, ta, t0)
    W2.poof("poof", up(p, 3.0), ta, 0.9)
    E.act(ta + 0.05, "shock", expr="shock")
    cam = Cam()
    cam.key(t0, (2.6, -0.6, 2.4), up(p, 4.4), lens=20, focus=5.5, fstop=4)
    cam.key(t1, (2.0, 0.4, 2.8), up(p, 4.6), lens=22, focus=4.5, fstop=4)
    cam.handheld(0.8)
    sfx(ta, "poof")
    sfx(ta + 0.3, "gasp")


@S(23, 103, 109, "Two hundred people stare at him")
def s23(t0, t1):
    world((0.12, 0.09, 0.14), 0.4)
    W.comedy_club()
    W2.seated_audience(t0, t1, rows=5, cols=8, origin=(0, -2.0), mode="stare", seed=2)
    cam = Cam()
    cam.key(t0, (-7, 3.0, 5.5), (-2, -6, 3.6), lens=22, focus=9.0, fstop=4)
    cam.key(t1, (6, 3.0, 5.5), (2, -6, 3.6), lens=22, focus=9.0, fstop=4)
    cam.handheld(0.7)
    sfx(t0 + 0.1, "crickets", 0.7, dur=t1 - t0)


@S(24, 109, 113, "Someone throws a tomato: SPLAT")
def s24(t0, t1):
    world((0.12, 0.09, 0.14), 0.4)
    W.comedy_club()
    W2.seated_audience(t0, t1, rows=3, cols=7, origin=(0, -2.0), mode="stare", seed=3)
    E = eddie(t0, t1, "shock")
    p = (0, 3.6, 1.2)
    E.pose(t0, loc=p, rot=0)
    ts = V.we(112) - 0.05
    W2.tomato("tomato", (-3, -9, 4), up(p, 4.62 - 0.2), t0 + 0.1, ts)
    splat = sphere("splat", 0.5, (0, -0.64, 0.05), mat("splat_red", hexc("#d8241e"), 0.25, coat=0.8), (1.1, 0.25, 0.9),
                   parent=E.head, coll=E.coll)
    sets.set_obj_visible(splat, t0, False)
    sets.set_obj_visible(splat, ts, True)
    E.face(ts, eyes="closed", mouth="grimace")
    E.act(ts, "recoil", 0.8)
    cam = Cam()
    cam.push(t0, t1, up(p, 4.4), 7.0, 5.0, yaw=-8, pitch=2, lens=28)
    cam.crash(ts, 28, 36, 0.08)
    cam.handheld(1.0)
    sfx(ts, "splat")


@S(25, 113, 115, "Tomato face sneeze on stage")
def s25(t0, t1):
    world((0.12, 0.09, 0.14), 0.4)
    W.comedy_club()
    E = eddie(t0, t1, "neutral")
    p = (0, 3.6, 1.2)
    E.pose(t0, loc=p, rot=0)
    sphere("splat", 0.5, (0, -0.64, 0.05), mat("splat_red", hexc("#d8241e"), 0.25, coat=0.8), (1.1, 0.25, 0.9),
           parent=E.head, coll=E.coll)
    tc = w(114)
    W2.sneeze(E, t0, tc)
    cam = Cam()
    cam.push(t0, t1, up(p, 4.4), 5.0, 4.0, yaw=6, pitch=2, lens=30)
    cam.crash(tc, 30, 40, 0.08)
    cam.handheld(1.4)
    sfx(tc, "sneeze")


@S(26, 115, 121, "POOF onto grandma's couch")
def s26(t0, t1):
    world((0.85, 0.9, 1.0), 0.5)
    W.tv_room()
    G = grandma(t0, t1, "smile")
    G.pose(t0, loc=(1.8, 6.0, 0.25), rot=0, legL=(85, 3), legR=(85, -3), armL=(30, -10), armR=(30, -10))
    E = eddie(t0, t1, "gasp")
    p = (-1.9, 6.0, 0.25)
    E.pose(t0, loc=p, rot=0, legL=(85, 3), legR=(85, -3), armL=(20, 20), armR=(20, 20))
    ta = t0 + 0.06
    W2.appear(E, ta, t0)
    W2.poof("poof", up(p, 3.6), ta, 0.9)
    look_at(G, ta + 0.4, up(p, 4.6))
    G.face(ta + 0.4, "shock")
    cam = Cam()
    cam.push(t0, t1, (0, 6.0, 4.6), 10.0, 8.0, yaw=-6, pitch=4, lens=26, fstop=4)
    cam.handheld(0.8)
    sfx(ta, "poof")


@S(27, 121, 125, "Grandma screams")
def s27(t0, t1):
    world((0.85, 0.9, 1.0), 0.5)
    W.tv_room()
    G = grandma(t0, t1, "scream")
    p = (1.8, 6.0, 0.25)
    G.pose(t0, loc=p, rot=-25, legL=(85, 3), legR=(85, -3))
    G.act(t0, "recoil", 1.2, expr="scream")
    lips(G, t0, t1, "shout")
    cam = Cam()
    cam.push(t0, t1, up(p, 4.6), 5.0, 3.8, yaw=-30, pitch=2, lens=28)
    cam.crash(t0, 22, 30, 0.08)
    cam.handheld(1.4)
    sfx(t0, "gasp")


@S(28, 125, 130, "...and smacks him with the TV remote: BONK")
def s28(t0, t1):
    world((0.85, 0.9, 1.0), 0.5)
    W.tv_room()
    G = grandma(t0, t1, "angry")
    G.pose(t0, loc=(1.8, 6.0, 0.25), rot=-20, legL=(85, 3), legR=(85, -3))
    rm = box("remote", (0.32, 0.25, 1.0), (0, 0, -1.75), mat("remote_black", hexc("#18181c"), 0.3), 0.05, parent=G.shR,
             coll=G.coll)
    E = eddie(t0, t1, "gasp")
    p = (-1.9, 6.0, 0.25)
    E.pose(t0, loc=p, rot=0, legL=(85, 3), legR=(85, -3))
    tb = w(126) - 0.02
    G.pose(t0, armR=(40, 10))
    G.pose(tb - 0.25, armR=(165, 35))
    G.pose(tb, armR=(20, 115))
    G.pose(tb + 0.3, armR=(165, 35))
    G.pose(tb + 0.55, armR=(30, 110))
    E.face(tb, eyes="closed", mouth="grimace")
    E.pose(tb + 0.06, head=(0, 12, -18), hipz=-0.15)
    E.pose(tb + 0.3, head=(0, 0, 0), hipz=0.0)
    E.face(tb + 0.4, eyes="squint", mouth="wavy")
    story.stars_ring(E, tb + 0.05, t1, 5.9)
    cam = Cam()
    cam.push(t0, t1, (-0.2, 6.0, 4.8), 8.5, 7.0, yaw=-4, pitch=4, lens=26)
    cam.handheld(1.0)
    sfx(tb, "bonk")
    sfx(tb + 0.55, "bonk", 0.7)


@S(29, 130, 132, "Ah... CHOO! on the couch")
def s29(t0, t1):
    world((0.85, 0.9, 1.0), 0.5)
    W.tv_room()
    E = eddie(t0, t1, "neutral")
    p = (-1.9, 6.0, 0.25)
    E.pose(t0, loc=p, rot=0, legL=(85, 3), legR=(85, -3))
    tc = w(131)
    W2.sneeze(E, t0, tc)
    cam = Cam()
    cam.push(t0, t1, up(p, 4.2), 6.2, 5.2, yaw=8, pitch=2, lens=26)
    cam.crash(tc, 26, 34, 0.08)
    cam.handheld(1.4)
    sfx(tc, "sneeze")


@S(30, 132, 137, "Floating in space!")
def s30(t0, t1):
    W.space_world(1.0)
    W.sun(7.0, rot=(50, 0, 20))
    light("space_fill", "AREA", (6, -14, 12), 2500, (0.8, 0.85, 1.0), 8, target=(0, 0, 5))
    W2.earth()
    E = eddie(t0, t1, "terror")
    fly(E, t0, t1, (0, 0, 4), (0.4, 0, 5), rot=-15)
    dangle(E, t0, t1)
    E.panic(t0, t1, rate=4)
    E.root.keyframe_insert("rotation_euler", index=1, frame=F(t0))
    E.root.rotation_euler[1] = math.radians(25)
    E.root.keyframe_insert("rotation_euler", index=1, frame=F(t1))
    W2.poof("poof", (0, 0, 7), t0 + 0.04)
    cam = Cam()
    cam.orbit(t0, t1, (0, 0, 7.5), 13.0, 20, 60, pitch=18, lens=24, fstop=11)
    cam.handheld(0.6)
    sfx(t0 + 0.04, "poof")


@S(31, 137, 140, "I couldn't breathe! Cheeks puffed, hands at throat")
def s31(t0, t1):
    W.space_world(1.0)
    W.sun(7.0, rot=(50, 0, 20))
    light("space_fill", "AREA", (6, -14, 12), 2500, (0.8, 0.85, 1.0), 8, target=(0, 0, 5))
    W2.earth()
    E = eddie(t0, t1, "terror")
    fly(E, t0, t1, (0, 0, 4), (0, 0, 4.4), rot=0)
    E.act(t0, "hands_face", 1.0)
    E.face(t0, eyes="terror", mouth="flat")
    noise(E.neck, "rotation_euler", 2, 0.08, 2)
    cam = Cam()
    cam.push(t0, t1, (0, 0, 8.7), 5.0, 3.8, yaw=6, pitch=4, lens=30)
    cam.handheld(1.0)


@S(32, 140, 142, "Space sneeze sends him spinning")
def s32(t0, t1):
    W.space_world(1.0)
    W.sun(7.0, rot=(50, 0, 20))
    light("space_fill", "AREA", (6, -14, 12), 2500, (0.8, 0.85, 1.0), 8, target=(0, 0, 5))
    W2.earth()
    E = eddie(t0, t1, "neutral")
    E.pose(t0, loc=(0, 0, 4), rot=0)
    tc = w(141)
    W2.sneeze(E, t0, tc)
    E.root.keyframe_insert("rotation_euler", index=0, frame=F(tc))
    E.pose(tc, loc=(0, 0, 4))
    E.root.rotation_euler[0] = math.radians(-70)
    E.root.keyframe_insert("rotation_euler", index=0, frame=F(t1))
    E.pose(t1, loc=(0, 3, 5.5))
    cam = Cam()
    cam.push(t0, t1, (0, 0, 8.5), 6.0, 5.0, yaw=-10, pitch=4, lens=28)
    cam.crash(tc, 28, 38, 0.08)
    cam.handheld(1.2)
    sfx(tc, "sneeze")


@S(33, 142, 148, "POOF: back in class, everyone stares")
def s33(t0, t1):
    R, ks = kid_scene_class(t0, t1, kids=10)
    E = eddie(t0, t1, "gasp")
    W.sit(E, t0, E_DESK)
    ta = t0 + 0.05
    W2.appear(E, ta, t0)
    W2.poof("poof", up(E_SEAT, 4.0), ta, 0.6)
    for k in ks:
        k.face(ta + 0.15, "shock")
        look_at(k, ta + 0.15, up(E_SEAT, 4.6))
    cam = Cam()
    cam.key(t0, (-6, 12.5, 7.5), (2.5, 4.5, 4.0), lens=20, focus=12.0, fstop=8)
    cam.key(t1, (-4.5, 11.8, 6.8), (2.5, 4.5, 4.2), lens=22, focus=11.0, fstop=8)
    cam.handheld(0.8)
    sfx(ta, "poof")


@S(34, 148, 156, "Tilt up: the cat is sitting on his head")
def s34(t0, t1):
    R, ks = kid_scene_class(t0, t1)
    E = eddie(t0, t1, "neutral")
    W.sit(E, t0, E_DESK)
    c = cat_on_head(E)
    E.face(w(152), eyes="up", mouth="flat")
    hc = up(E_SEAT, 4.6)
    cam = Cam()
    cam.key(t0, orbit_pos(hc, 4.6, 184, 0), hc, lens=30, focus=4.6, fstop=3)
    cam.key(t1, orbit_pos(up(hc, 1.6), 4.8, 184, 4), up(hc, 1.6), lens=30, focus=4.8, fstop=3)
    cam.handheld(0.8)
    sfx(w(150), "meow")


@S(35, 156, 159, "Ah... ah... CHOO! with the cat on his head")
def s35(t0, t1):
    R, ks = kid_scene_class(t0, t1)
    E = eddie(t0, t1, "neutral")
    W.sit(E, t0, E_DESK)
    cat_on_head(E)
    tc = w(158)
    W2.sneeze(E, t0, tc)
    cam = Cam()
    cam.push(t0, t1, up(E_SEAT, 5.0), 5.6, 4.4, yaw=176, pitch=2, lens=28)
    cam.crash(tc, 28, 38, 0.08)
    cam.handheld(1.5)
    sfx(tc, "sneeze")


@S(36, 159, 165, "POOF: the airliner thunders through the sky")
def s36(t0, t1):
    pl, p1 = plane_sky(t0, t1, (0, 10, 60), (0, -20, 60), roll=6, seed=36)
    cam = Cam()
    cam.key(t0, (-18, -18, 63), (0, 8, 60), lens=22, focus=32.0, fstop=8)
    cam.key(t1, (-20, -24, 63), (0, -16, 60), lens=22, focus=22.0, fstop=8)
    cam.handheld(1.0)
    sfx(t0, "jet")


@S(37, 165, 169, "Cockpit: Eddie pops in, cat on his head")
def s37(t0, t1):
    cockpit_scene(t0, t1)
    P = pilot(t0, t1, "neutral")
    seat_pilot(P, t0, -1)
    C = pilot(t0, t1, "neutral", name="CoPilot", shirt="#e8eef8")
    seat_pilot(C, t0, 1)
    E = eddie(t0, t1, "gasp")
    E.pose(t0, loc=(0, -2.2, 0), rot=180)
    c = cat_on_head(E)
    ta = t0 + 0.05
    W2.appear(E, ta, t0, extra=[c] + list(c.children_recursive))
    W2.poof("poof", (0, -2.2, 3.5), ta, 0.6)
    cam = Cam()
    cam.push(t0, t1, (0, -1.8, 4.8), 7.0, 5.6, yaw=180, pitch=6, lens=20, yaw1=170)
    cam.handheld(1.0)
    sfx(ta, "poof")


@S(38, 169, 175, "Thirty thousand feet: tiny plane above a sea of clouds")
def s38(t0, t1):
    W.sky(1.0)
    W.sun(4.0, rot=(52, 0, 30))
    for i, z in enumerate((20, 26)):
        cloud_ring((0, 0, z), 0, 260, 60, seed=38 + i, dz=(-3, 3), scale=(2.5, 5.0))
    pl = W2.airliner("plane", (0, 30, 90), rot=0)
    pl.keyframe_insert("location", frame=F(t0))
    pl.location = (0, 30 - 40 * (t1 - t0), 90)
    pl.keyframe_insert("location", frame=F(t1))
    cam = Cam()
    cam.key(t0, (30, -60, 100), (0, 20, 88), lens=26, focus=90.0, fstop=16)
    cam.key(t1, (60, -120, 130), (0, 0, 80), lens=26, focus=150.0, fstop=16)
    cam.handheld(0.5)
    sfx(t0, "wind", 0.7, dur=t1 - t0)


@S(39, 175, 180, "The pilot looks at Eddie")
def s39(t0, t1):
    cockpit_scene(t0, t1)
    P = pilot(t0, t1, "neutral")
    seat_pilot(P, t0, -1)
    E = eddie(t0, t1, "smile")
    E.pose(t0, loc=(0, -2.2, 0), rot=180)
    cat_on_head(E)
    E.act(t0 + 0.4, "wave", 0.7)
    tl = t0 + 0.1
    P.face(tl, eyes="side_r", mouth="flat")
    look_at(P, tl, (0, -2.2, 4.6))
    P.face(tl + 0.4, "shock")
    cam = Cam()
    cam.push(t0, t1, (-1.2, -1.2, 4.8), 6.0, 4.8, yaw=205, pitch=4, lens=24)
    cam.handheld(0.8)


@S(40, 180, 186, "Then he looks up at the cat")
def s40(t0, t1):
    cockpit_scene(t0, t1)
    P = pilot(t0, t1, "shock")
    seat_pilot(P, t0, -1)
    E = eddie(t0, t1, "smile")
    E.pose(t0, loc=(0, -2.2, 0), rot=180)
    c = cat_on_head(E)
    look_at(P, t0, (0, -2.2, 6.0))
    P.face(t0 + 0.2, eyes="up", mouth="o")
    cam = Cam()
    cam.push(t0, t1, (-1.6, -0.9, 5.4), 5.6, 4.4, yaw=196, pitch=2, lens=20)
    cam.handheld(0.9)
    sfx(w(185), "meow", 0.8)


@S(41, 186, 190, "I'm allergic to cats!")
def s41(t0, t1):
    cockpit_scene(t0, t1)
    P = pilot(t0, t1, "terror")
    seat_pilot(P, t0, -1)
    P.act(t0, "hands_head", 1.0)
    lips(P, t0, t1, "shout")
    P.face(t0, eyes="terror")
    cam = Cam()
    cam.push(t0, t1, (-2.2, -0.5, 5.2), 4.6, 3.6, yaw=196, pitch=4, lens=26)
    cam.crash(t0, 22, 30, 0.08)
    cam.handheld(1.3)


@S(42, 190, 192, "The pilot sneezes")
def s42(t0, t1):
    cockpit_scene(t0, t1)
    P = pilot(t0, t1, "terror")
    seat_pilot(P, t0, -1)
    tc = w(191)
    W2.sneeze(P, t0, tc)
    cam = Cam()
    cam.push(t0, t1, (-2.2, -0.5, 5.0), 5.8, 4.8, yaw=200, pitch=4, lens=24)
    cam.crash(tc, 24, 32, 0.08)
    cam.handheld(1.5)
    sfx(tc, "sneeze", 0.9)


@S(43, 192, 196, "POOF: he's gone")
def s43(t0, t1):
    cockpit_scene(t0, t1)
    P = pilot(t0, t1, "terror")
    seat_pilot(P, t0, -1)
    tv = t0 + 0.04
    W2.vanish(P, tv)
    W2.poof("poof", (-2.2, -0.5, 4.5), tv, 0.6)
    E = eddie(t0, t1, "shock")
    E.pose(t0, loc=(0, -2.2, 0), rot=180)
    cat_on_head(E)
    E.act(tv + 0.15, "shock", expr="shock")
    cam = Cam()
    cam.push(t0, t1, (-1.0, -1.2, 4.6), 6.6, 5.4, yaw=188, pitch=5, lens=22)
    cam.handheld(1.2)
    sfx(tv, "poof")


@S(44, 196, 201, "Eddie in the pilot's seat, flying the plane")
def s44(t0, t1):
    K, Y = cockpit_scene(t0, t1)
    E = eddie(t0, t1, "terror")
    seat_pilot(E, t0, -1)
    cat_on_head(E)
    E.pose(t0, armL=(80, -14), armR=(80, -14))
    E.face(t0, eyes="terror", mouth="scream")
    yk = Y[0]
    for i in range(6):
        yk.rotation_euler[1] = math.radians(28 if i % 2 else -28)
        yk.keyframe_insert("rotation_euler", index=1, frame=F(t0 + i * 0.2))
    noise(E.hip, "rotation_euler", 2, 0.06, 2)
    cam = Cam()
    cam.push(t0, t1, (-2.2, -0.5, 5.4), 5.4, 4.4, yaw=172, pitch=8, lens=24)
    cam.handheld(2.2)
    sfx(t0, "alarm", 0.8)


@S(45, 201, 204, "The co-pilot sneezes")
def s45(t0, t1):
    cockpit_scene(t0, t1)
    C = pilot(t0, t1, "terror", name="CoPilot", shirt="#e8eef8")
    seat_pilot(C, t0, 1)
    tc = w(203)
    W2.sneeze(C, t0, tc)
    cam = Cam()
    cam.push(t0, t1, (2.2, -0.5, 5.2), 4.6, 3.8, yaw=160, pitch=4, lens=26)
    cam.crash(tc, 26, 34, 0.08)
    cam.handheld(1.4)
    sfx(tc, "sneeze", 0.8)


@S(46, 204, 206, "POOF. Gone.")
def s46(t0, t1):
    cockpit_scene(t0, t1)
    C = pilot(t0, t1, "terror", name="CoPilot", shirt="#e8eef8")
    seat_pilot(C, t0, 1)
    tv = t0 + 0.04
    W2.vanish(C, tv)
    W2.poof("poof", (2.2, -0.5, 4.5), tv, 0.6)
    E = eddie(t0, t1, "terror")
    seat_pilot(E, t0, -1)
    cat_on_head(E)
    look_at(E, tv + 0.1, (2.2, -0.5, 4.6))
    cam = Cam()
    cam.push(t0, t1, (0.4, -0.6, 4.6), 4.6, 4.0, yaw=176, pitch=6, lens=18)
    cam.handheld(1.2)
    sfx(tv, "poof")


def passengers(t0, t1, sneeze_at=None, seed=0):
    srcs = []
    for j in range(4):
        src = D.collections.new(f"PAX{j}")
        k = chars.kid(400 + j, coll=src)
        k.pose(t0, loc=(0, 0, 0.1), rot=0, legL=(85, 3), legR=(85, -3), armL=(20, 8), armR=(20, 8))
        k.blink(t0, t1)
        if sneeze_at:
            ts = sneeze_at + j * 0.13
            W2.sneeze(k, ts - 0.35, ts, mist=False)
        else:
            k.face(t0, "worried")
        srcs.append(src)
    return srcs


@S(47, 206, 212, "Two hundred passengers start sneezing")
def s47(t0, t1):
    world((0.9, 0.92, 1.0), 0.5)
    C = W2.cabin(rows=10)
    srcs = passengers(t0, t1, sneeze_at=w(210))
    rnd = random.Random(47)
    for i, s in enumerate(C["seats"]):
        instance(f"pax{i}", srcs[rnd.randrange(4)], W2.seat_root(s), rot=(0, 0, rnd.uniform(-10, 10)))
    cam = Cam()
    cam.key(t0, (0, -3.0, 6.5), (0, 16, 3.8), lens=22, focus=10.0, fstop=6)
    cam.key(t1, (0, 3.0, 6.2), (0, 20, 3.6), lens=22, focus=10.0, fstop=6)
    cam.handheld(1.0)
    for i in range(3):
        sfx(w(210) + i * 0.25, "sneeze", 0.5)


@S(48, 212, 215, "POOF POOF POOF: seats empty one by one")
def s48(t0, t1):
    world((0.9, 0.92, 1.0), 0.5)
    C = W2.cabin(rows=10)
    srcs = passengers(t0, t1)
    rnd = random.Random(48)
    seats = C["seats"]
    order = list(range(len(seats)))
    rnd.shuffle(order)
    beats = [w(212), w(213), w(214)]
    for i, s in enumerate(seats):
        ob = instance(f"pax{i}", srcs[rnd.randrange(4)], W2.seat_root(s), rot=(0, 0, rnd.uniform(-10, 10)))
        b = order.index(i) % 3
        tv = beats[b] + rnd.uniform(0, 0.12)
        sets.set_obj_visible(ob, t0, True)
        sets.set_obj_visible(ob, tv, False)
        if s[1] < 30 and rnd.random() < 0.5:
            W2.poof(f"pp{i}", (s[0], s[1], 4.0), tv, 0.7, n=4, seed=i)
    cam = Cam()
    cam.key(t0, (0, -2.0, 7.0), (0, 18, 3.8), lens=20, focus=10.0, fstop=8)
    cam.key(t1, (0, 1.0, 6.6), (0, 20, 3.6), lens=20, focus=10.0, fstop=8)
    cam.handheld(1.2)
    for b in beats:
        sfx(b, "poof")


@S(49, 215, 218, "BEEP BEEP BEEP: red alarm lights")
def s49(t0, t1):
    K, Y = cockpit_scene(t0, t1)
    E = eddie(t0, t1, "terror")
    seat_pilot(E, t0, -1)
    cat_on_head(E)
    E.face(t0, eyes="terror", mouth="scream")
    lt = light("alarm_red", "POINT", (0, 2.4, 6.5), 0, (1.0, 0.1, 0.08), 1.0)
    for i, b in enumerate((w(215), w(216), w(217))):
        lt.data.energy = 0
        lt.data.keyframe_insert("energy", frame=F(b - 0.02))
        lt.data.energy = 6000
        lt.data.keyframe_insert("energy", frame=F(b + 0.02))
        lt.data.energy = 0
        lt.data.keyframe_insert("energy", frame=F(b + 0.2))
    cam = Cam()
    cam.push(t0, t1, (-2.2, -0.5, 5.2), 4.4, 3.6, yaw=176, pitch=6, lens=26)
    cam.handheld(1.8)
    sfx(t0, "alarm")


@S(50, 218, 222, "We were going down! Nose dive")
def s50(t0, t1):
    p0 = (0, 0, 60)
    p1 = (0, -50 * (t1 - t0), 60 - 30 * (t1 - t0))
    pl, _ = plane_sky(t0, t1, p0, p1, pitch=10, pitch1=32, seed=50)
    cam = Cam()
    cam.key(t0, (22, 10, 70), p0, lens=24, focus=25.0, fstop=8)
    cam.key(t1, (20, p1[1] + 12, p1[2] + 12), p1, lens=24, focus=25.0, fstop=8)
    cam.handheld(1.6)
    sfx(t0, "jet")
    sfx(t0 + 0.2, "wind", 0.8, dur=t1 - t0)


# ================================================================== THE TURN
@S(51, 222, 226, "Then I noticed something")
def s51(t0, t1):
    cockpit_scene(t0, t1)
    E = eddie(t0, t1, "terror")
    seat_pilot(E, t0, -1)
    cat_on_head(E)
    tn = w(224)
    E.face(tn, "gasp")
    E.look(tn + 0.1, 0, -12)
    cam = Cam()
    cam.push(t0, t1, (-2.2, -0.5, 5.0), 4.8, 3.6, yaw=184, pitch=4, lens=28)
    cam.crash(tn, 28, 38, 0.08)
    cam.handheld(1.0)
    sfx(tn, "ding")


@S(52, 226, 235, "Every time I teleported, the cat came with me")
def s52(t0, t1):
    cockpit_scene(t0, t1)
    E = eddie(t0, t1, "neutral")
    seat_pilot(E, t0, -1)
    c = cat_on_head(E)
    E.face(t0, eyes="up", mouth="o")
    E.pose(t0, head=(0, -14, 0))
    cam = Cam()
    cam.orbit(t0, t1, (-2.2, -0.5, 5.4), 4.2, 150, 210, pitch=8, lens=28, fstop=3)
    cam.handheld(0.7)
    sfx(w(231), "meow", 0.8)


@S(53, 235, 244, "Because anything you touch comes too: the uncle and his car on the moon")
def s53(t0, t1):
    W2.moon()
    car = convertible("ucar", (0, 0, 0), "#d9453a", rot=20)
    U = uncle(t0, t1, "bored")
    U.root.parent = car
    U.pose(t0, loc=(-1.1, 0.4, -0.6), rot=0, legL=(85, 3), legR=(85, -3), armL=(70, -12), armR=(70, -12))
    U.pose(t0 + 0.6, armR=(110, -20))
    for i in range(3):
        sp = sphere(f"glow{i}", 0.3, (0, 0, 0), mat("touch_glow", hexc("#7ad0ff"), 0.3, emit=hexc("#7ad0ff"), estr=6), seg=12)
        sp.parent = car
        sp.location = ((-2.3, 2.3, 0)[i], (-4.6, 0, 4.6)[i], 2.8)
        noise(sp, "location", 2, 0.3, 6)
    cam = Cam()
    cam.orbit(t0, t1, (0, 0, 2.8), 15.0, -50, -10, pitch=14, lens=24, fstop=8)
    cam.handheld(0.6)


@S(54, 244, 250, "So I grabbed the steering wheel")
def s54(t0, t1):
    K, Y = cockpit_scene(t0, t1)
    E = eddie(t0, t1, "determined")
    seat_pilot(E, t0, -1)
    cat_on_head(E)
    tg = w(246)
    E.pose(t0, armL=(40, 10), armR=(40, 10))
    E.act(tg, "hold", 1.1, armL=(84, -16), armR=(84, -16))
    E.face(tg, eyes="angry", mouth="grimace")
    cam = Cam()
    cam.push(t0, t1, (-2.2, 0.4, 4.4), 5.2, 4.0, yaw=150, pitch=12, lens=26)
    cam.crash(tg, 24, 32, 0.08)
    cam.handheld(1.0)
    sfx(tg, "click", 0.8)


@S(55, 250, 254, "...hugged the cat")
def s55(t0, t1):
    cockpit_scene(t0, t1)
    E = eddie(t0, t1, "determined")
    seat_pilot(E, t0, -1)
    c = W2.cat("cat", (0, 0, 0))
    c.parent = E.root
    c.location = (0, -1.1, 3.9)
    c.scale = (0.7,) * 3
    E.pose(t0, armL=(70, -40), armR=(84, -16))
    E.face(t0 + 0.2, eyes="closed", mouth="smile")
    cam = Cam()
    cam.push(t0, t1, (-2.2, -0.5, 4.8), 4.6, 3.8, yaw=200, pitch=4, lens=28)
    cam.handheld(0.8)
    sfx(t0 + 0.1, "meow", 0.7)


@S(56, 254, 261, "...and sneezed the biggest sneeze of my life: the wind-up")
def s56(t0, t1):
    cockpit_scene(t0, t1)
    E = eddie(t0, t1, "determined")
    seat_pilot(E, t0, -1)
    c = W2.cat("cat", (0, 0, 0))
    c.parent = E.root
    c.location = (0, -1.1, 3.9)
    c.scale = (0.7,) * 3
    E.pose(t0, armL=(70, -40), armR=(84, -16))
    E.pose(t1, head=(0, -30, 0), torso=(0, -14, 0))
    E.face(t0, eyes="half", mouth="ah")
    E.face(w(257), eyes="closed", mouth="ah")
    cam = Cam()
    cam.push(t0, t1, (-2.2, -0.5, 5.0), 6.5, 3.4, yaw=186, pitch=4, lens=26, lens1=32)
    cam.handheld(1.0)
    sfx(t0 + 0.1, "rise")


@S(57, 261, 264, "AH... AH... CHOO! The mega sneeze")
def s57(t0, t1):
    cockpit_scene(t0, t1)
    E = eddie(t0, t1, "neutral")
    seat_pilot(E, t0, -1)
    c = W2.cat("cat", (0, 0, 0))
    c.parent = E.root
    c.location = (0.8, -1.0, 3.0)
    c.scale = (0.5,) * 3
    E.pose(t0, armL=(70, -40), armR=(84, -16))
    tc = w(263)
    W2.sneeze(E, t0, tc)
    W2.poof("mega", (-2.2, 1.0, 4.5), tc + 0.08, 2.0, n=10)
    cam = Cam()
    cam.push(t0, tc, (-2.2, -0.5, 5.0), 4.2, 3.6, yaw=200, pitch=4, lens=30)
    cam.key(tc + 0.08, orbit_pos((-2.2, -0.5, 5.0), 3.8, 200, 4), (-2.2, -0.5, 5.0), lens=20)
    cam.key(t1, orbit_pos((-2.2, -0.5, 5.0), 4.4, 200, 4), (-2.2, -0.5, 5.0), lens=20)
    cam.handheld(2.4)
    sfx(tc, "sneeze")
    sfx(tc + 0.05, "boom", 0.6)


@S(58, 264, 269, "POOF: the entire plane vanishes from the sky")
def s58(t0, t1):
    pl, p1 = plane_sky(t0, t1, pitch=20, pitch1=24, seed=58)
    tv = t0 + 0.15
    hide_tree(pl, tv)
    sky_p = (pl.location[0], pl.location[1], pl.location[2])
    W2.poof("mega", (0, -40 * 0.15, 60), tv, 6.0, n=12)
    cam = Cam()
    cam.key(t0, (40, -30, 70), (0, -5, 60), lens=24, focus=48.0, fstop=11)
    cam.key(t1, (46, -40, 74), (0, -10, 60), lens=24, focus=52.0, fstop=11)
    cam.handheld(0.8)
    sfx(tv, "poof")
    sfx(tv + 0.05, "teleport", 0.8)


@S(59, 269, 276, "It lands in the school parking lot")
def s59(t0, t1):
    town_scene()
    W2.parking_lot(LOT)
    pr = (LOT[0], LOT[1], 3.35)
    pl = W2.airliner("plane", pr, rot=90, scale=0.8)
    ta = t0 + 0.12
    hide_tree(pl, ta, True, t0)
    pl.location = up(pr, 3.0)
    pl.keyframe_insert("location", frame=F(ta))
    pl.location = up(pr, -0.35)
    pl.keyframe_insert("location", frame=F(ta + 0.25))
    pl.location = pr
    pl.keyframe_insert("location", frame=F(ta + 0.45))
    W2.poof("mega", up(pr, 4), ta, 5.0, n=12)
    for i in range(6):
        story.puff(f"dust{i}", (LOT[0] + (i - 2.5) * 6, LOT[1] - 6, 0.6), ta + 0.25, 2.2)
    cam = Cam()
    cam.key(t0, (12, -62, 18), (LOT[0], LOT[1], 3.0), lens=22, focus=55.0, fstop=11)
    cam.key(t1, (6, -58, 13), (LOT[0], LOT[1], 3.5), lens=22, focus=50.0, fstop=11)
    cam.handheld(1.2)
    sfx(ta, "poof")
    sfx(ta + 0.25, "boom", 0.8)


@S(60, 276, 278, "Perfectly parked: top-down, between the lines")
def s60(t0, t1):
    town_scene()
    W2.parking_lot(LOT)
    W2.airliner("plane", (LOT[0], LOT[1], 3.35), rot=90, scale=0.8)
    cam = Cam()
    cam.key(t0, (LOT[0] + 1, LOT[1] - 2, 70), (LOT[0], LOT[1], 0), lens=24, focus=70.0, fstop=16)
    cam.key(t1, (LOT[0] + 1, LOT[1] - 2, 58), (LOT[0], LOT[1], 0), lens=24, focus=58.0, fstop=16)
    cam.handheld(0.5)
    sfx(t0 + 0.1, "ding")


@S(61, 278, 280, "Everybody cheered")
def s61(t0, t1):
    town_scene()
    W2.parking_lot(LOT)
    W2.airliner("plane", (LOT[0], LOT[1], 3.35), rot=90, scale=0.8)
    camp = (8, -44, 4.0)
    src = crowd_src("CH61", t0, t1, [130, 131, 132, 133, 134], mode="cheer", spread=4, seed=61)
    crowd(src, t0, t1, 6, ((-8, 2), (-30, -8)), (0, 0), (0, 0), seed=61)
    rnd = random.Random(61)
    for i in range(7):
        k = townie(140 + i, t0, t1, "joy")
        p = (-6 + (i % 4) * 2.8 + rnd.uniform(-0.5, 0.5), -26 + (i // 4) * 4 + rnd.uniform(-1, 1), 0)
        k.pose(t0, loc=p, rot=facing(p, camp) + rnd.uniform(-25, 25))
        k.act(t0 + rnd.uniform(0, 0.15), "cheer")
        k.jump(t0 + rnd.uniform(0.05, 0.3), 1.2, 0.45, loc=p)
        k.talk(t0, t1, open_m="open_smile", wide_m="laugh", rest="open_smile", syll=0.12)
    confetti("cf", (-4, -20, 10), (10, 8, 3), t0 + 0.05, 1.2, n=60)
    cam = Cam()
    cam.key(t0, camp, (-8, -20, 4.5), lens=22, focus=16.0, fstop=8)
    cam.key(t1, (7, -42, 4.6), (-8, -20, 5.0), lens=22, focus=15.0, fstop=8)
    cam.handheld(0.9)
    sfx(t0, "cheer", 1.0, dur=t1 - t0 + 1.2)


# ================================================================== PAYOFF + BUTTON
@S(62, 280, 287, "Miss Whiskers runs out and hugs Eddie")
def s62(t0, t1):
    town_scene()
    W2.parking_lot(LOT)
    W2.airliner("plane", (LOT[0], LOT[1], 3.35), rot=90, scale=0.8)
    E = eddie(t0, t1, "smile")
    ep = (-12, -4, 0)
    E.pose(t0, loc=ep, rot=facing(ep, (0, 6)), armL=(70, -40), armR=(60, -30))
    c = W2.cat("cat", (0, 0, 0))
    c.parent = E.root
    c.location = (0, -1.1, 3.6)
    c.scale = (0.7,) * 3
    Wh = whiskers(t0, t1, "joy")
    th = w(285)
    Wh.run(t0, th, (-2, 7, 0), (-9.5, -1.4, 0), rate=3.2)
    Wh.act(th, "hold", 1.0, armL=(80, -35), armR=(80, -35))
    Wh.face(th, eyes="happy", mouth="laugh")
    E.face(th, eyes="happy", mouth="grin")
    cam = Cam()
    cam.key(t0, (-1, -16, 4.5), (-6, 2, 3.5), lens=24, focus=14.0, fstop=5)
    cam.key(t1, (-6, -13, 5.0), (-11, -3, 4.2), lens=26, focus=10.0, fstop=5)
    cam.handheld(0.9)
    sfx(t0 + 0.1, "footsteps", 0.8)


@S(63, 287, 291, "You saved my cat!")
def s63(t0, t1):
    town_scene()
    W2.parking_lot(LOT)
    Wh = whiskers(t0, t1, "joy")
    p = (-9.5, -1.4, 0)
    Wh.pose(t0, loc=p, rot=facing(p, (-12, -4)))
    Wh.act(t0, "cheer", 0.6)
    lips(Wh, t0, t1)
    Wh.face(t0, eyes="cry")
    cam = Cam()
    cam.push(t0, t1, up(p, 4.6), 5.0, 3.9, yaw=facing(p, (-12, -4)), pitch=2, lens=30)
    cam.handheld(0.9)


@S(64, 291, 295, "Then the cat sneezes")
def s64(t0, t1):
    town_scene()
    E = eddie(t0, t1, "happy")
    ep = (-12, -4, 0)
    E.pose(t0, loc=ep, rot=facing(ep, (0, 6)))
    E.act(t0, "cheer", 0.6)
    c = cat_on_head(E)
    c.location = (0, 0.1, 0.95)
    hd = D.objects["cat_headpiv"]
    tc = w(294)
    hd.keyframe_insert("rotation_euler", index=0, frame=F(t0))
    hd.rotation_euler[0] = math.radians(-25)
    hd.keyframe_insert("rotation_euler", index=0, frame=F(tc - 0.05))
    hd.rotation_euler[0] = math.radians(30)
    hd.keyframe_insert("rotation_euler", index=0, frame=F(tc + 0.05))
    hd.rotation_euler[0] = math.radians(5)
    hd.keyframe_insert("rotation_euler", index=0, frame=F(tc + 0.25))
    E.face(tc + 0.1, "shock")
    E.act(tc + 0.1, "shock")
    cam = Cam()
    yaw = facing(ep, (0, 6))
    cam.push(t0, t1, (ep[0] + 0.0, ep[1], 5.75), 4.8, 3.9, yaw=yaw, pitch=7, lens=32, fstop=2.8)
    cam.crash(tc, 32, 36, 0.08)
    cam.handheld(1.0)
    sfx(tc, "sneeze", 0.5)
    sfx(tc + 0.05, "meow", 0.6)


@S(65, 295, 303, "POOF: Eddie, Miss Whiskers and the cat on the moon")
def s65(t0, t1):
    W2.moon()
    E = eddie(t0, t1, "shock")
    Wh = whiskers(t0, t1, "shock")
    E.pose(t0, loc=(-1.0, 0, 0), rot=10)
    Wh.pose(t0, loc=(1.6, 0.6, 0), rot=-10)
    c = cat_on_head(E)
    ta = t0 + 0.06
    W2.appear(E, ta, t0, extra=[c] + list(c.children_recursive))
    W2.appear(Wh, ta, t0)
    W2.poof("poof", (0, 0, 3.0), ta, 1.6, n=9)
    E.act(ta + 0.2, "shock")
    Wh.act(ta + 0.25, "hands_face")
    cam = Cam()
    cam.key(t0, (3, -12, 4.0), (0, 0, 3.6), lens=24, focus=12.0, fstop=8)
    cam.key(t1, (8, -22, 9.0), (0, 8, 6.0), lens=24, focus=22.0, fstop=8)
    cam.handheld(0.7)
    sfx(ta, "poof")


@S(66, 303, None, "Next to my uncle: he waves from his car")
def s66(t0, t1):
    W2.moon()
    car = convertible("ucar", (9, 3, 0), "#d9453a", rot=-30)
    U = uncle(t0, t1, "bored")
    U.root.parent = car
    U.pose(t0, loc=(-1.1, 0.4, -0.6), rot=0, legL=(85, 3), legR=(85, -3), armL=(70, -12))
    U.act(t0 + 0.1, "wave", 1.0)
    U.wiggle(t0 + 0.3, t1, "armR", (18, 10), 5.0, (165, 25))
    U.face(t0 + 0.1, eyes="half", mouth="smile")
    E = eddie(t0, t1, "gasp")
    E.pose(t0, loc=(-1.0, 0, 0), rot=facing((-1, 0), (9, 3)))
    Wh = whiskers(t0, t1, "gasp")
    Wh.pose(t0, loc=(1.6, 0.6, 0), rot=facing((1.6, 0.6), (9, 3)))
    cam = Cam()
    cam.key(t0, (0, -14, 5.0), (2, 1, 3.4), lens=22, focus=14.0, fstop=8)
    cam.key(t1, (4, -13, 5.2), (6.5, 2.5, 3.4), lens=22, focus=16.0, fstop=8)
    cam.handheld(0.7)
