"""Blocky R6-style characters: hierarchy of pivots, procedural hair/accessories,
2D face atlas projected onto the head, pose / walk / expression / lipsync keyframing."""
import math, os, random
import bpy
from mathutils import Vector
from . import ASSETS, FPS
from .core import (mat, hexc, box, cyl, sphere, empty, poly_extrude, text, F, fcurves, noise,
                   collection, D, set_interp)

FACE_W, FACE_H, FACE_Z = 1.5, 1.5, -0.06
HEAD_R, HEAD_H = 0.62, 1.2
NECK_Z = 4.0
CHARS = {}

BOLT = [(0.05, 0.62), (-0.28, 0.0), (-0.02, 0.02), (-0.16, -0.62), (0.26, 0.12), (0.0, 0.10), (0.20, 0.62)]


def face_material(name, atlas, skin):
    m = D.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    N, L = nt.nodes, nt.links
    b = next(n for n in N if n.type == "BSDF_PRINCIPLED")
    b.inputs["Roughness"].default_value = 0.42
    tc = N.new("ShaderNodeTexCoord")
    sep = N.new("ShaderNodeSeparateXYZ")
    L.new(tc.outputs["Object"], sep.inputs[0])

    def math_node(op, a, bval=None, clamp=False):
        n = N.new("ShaderNodeMath"); n.operation = op; n.use_clamp = clamp
        if isinstance(a, float):
            n.inputs[0].default_value = a
        else:
            L.new(a, n.inputs[0])
        if bval is not None:
            if isinstance(bval, float):
                n.inputs[1].default_value = bval
            else:
                L.new(bval, n.inputs[1])
        return n.outputs[0]
    # u = x / W + 0.5 ; v = (z - Z0)/H + 0.5   (object space of the head)
    u = math_node("ADD", math_node("DIVIDE", sep.outputs["X"], FACE_W), 0.5)
    v = math_node("ADD", math_node("DIVIDE", math_node("SUBTRACT", sep.outputs["Z"], FACE_Z), FACE_H), 0.5)
    # mask: front half (y<0) and inside cell
    m_front = math_node("LESS_THAN", sep.outputs["Y"], -0.05)
    m_u = math_node("MULTIPLY", math_node("GREATER_THAN", u, 0.0), math_node("LESS_THAN", u, 1.0))
    m_v = math_node("MULTIPLY", math_node("GREATER_THAN", v, 0.0), math_node("LESS_THAN", v, 1.0))
    mask = math_node("MULTIPLY", math_node("MULTIPLY", m_u, m_v), m_front)
    cmb = N.new("ShaderNodeCombineXYZ")
    L.new(u, cmb.inputs[0]); L.new(v, cmb.inputs[1])
    mp = N.new("ShaderNodeMapping"); mp.name = "FaceMap"; mp.vector_type = "POINT"
    mp.inputs["Scale"].default_value = (0.25, 0.25, 1)
    mp.inputs["Location"].default_value = (0.0, 0.75, 0)
    L.new(cmb.outputs[0], mp.inputs[0])
    tx = N.new("ShaderNodeTexImage")
    tx.image = D.images.load(os.path.join(ASSETS, "faces", atlas + ".png"), check_existing=True)
    tx.extension = "CLIP"
    tx.interpolation = "Cubic"
    L.new(mp.outputs[0], tx.inputs[0])
    a = math_node("MULTIPLY", tx.outputs["Alpha"], mask)
    mix = N.new("ShaderNodeMix"); mix.data_type = "RGBA"
    mix.inputs[6].default_value = (*skin, 1)
    L.new(a, mix.inputs[0]); L.new(tx.outputs["Color"], mix.inputs[7])
    tint = N.new("ShaderNodeRGB"); tint.name = "Skin"; tint.outputs[0].default_value = (*skin, 1)
    L.new(tint.outputs[0], mix.inputs[6])
    L.new(mix.outputs[2], b.inputs["Base Color"])
    # face lines slightly less glossy
    rr = math_node("ADD", math_node("MULTIPLY", a, 0.25), 0.42)
    L.new(rr, b.inputs["Roughness"])
    m.diffuse_color = (*skin, 1)
    return m


def shirt_material(name, base, kind=None, c2=None):
    """Torso/sleeve material, optional procedural pattern: stripes, checker, burnt."""
    m = D.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree; N, L = nt.nodes, nt.links
    b = next(n for n in N if n.type == "BSDF_PRINCIPLED")
    b.inputs["Roughness"].default_value = 0.5
    b.inputs["Base Color"].default_value = (*base, 1)
    if kind == "stripes":
        tc = N.new("ShaderNodeTexCoord"); w = N.new("ShaderNodeTexWave")
        w.wave_type = "BANDS"; w.bands_direction = "X"; w.inputs["Scale"].default_value = 1.2
        w.inputs["Distortion"].default_value = 0
        L.new(tc.outputs["Object"], w.inputs[0])
        cr = N.new("ShaderNodeValToRGB"); cr.color_ramp.interpolation = "CONSTANT"
        cr.color_ramp.elements[0].color = (*base, 1); cr.color_ramp.elements[1].position = 0.5
        cr.color_ramp.elements[1].color = (*(c2 or (1, 1, 1)), 1)
        L.new(w.outputs["Fac"], cr.inputs[0]); L.new(cr.outputs[0], b.inputs["Base Color"])
    elif kind == "checker":
        tc = N.new("ShaderNodeTexCoord"); ck = N.new("ShaderNodeTexChecker")
        ck.inputs["Scale"].default_value = 2.6
        ck.inputs["Color1"].default_value = (*base, 1); ck.inputs["Color2"].default_value = (*(c2 or (1, 1, 1)), 1)
        L.new(tc.outputs["Object"], ck.inputs[0]); L.new(ck.outputs[0], b.inputs["Base Color"])
    elif kind == "burnt":
        tc = N.new("ShaderNodeTexCoord"); nz = N.new("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = 6.0; nz.inputs["Detail"].default_value = 6
        L.new(tc.outputs["Object"], nz.inputs[0])
        cr = N.new("ShaderNodeValToRGB")
        e = cr.color_ramp.elements
        e[0].position = 0.55; e[0].color = (*base, 1)
        e[1].position = 0.72; e[1].color = (*(c2 or hexc("#6b1410")), 1)
        L.new(nz.outputs["Fac"], cr.inputs[0])
        nz2 = N.new("ShaderNodeTexNoise"); nz2.inputs["Scale"].default_value = 22.0
        L.new(tc.outputs["Object"], nz2.inputs[0])
        cr2 = N.new("ShaderNodeValToRGB"); e2 = cr2.color_ramp.elements
        e2[0].position = 0.6; e2[0].color = (1, 1, 1, 1); e2[1].position = 0.7; e2[1].color = (0.25, 0.08, 0.05, 1)
        L.new(nz2.outputs["Fac"], cr2.inputs[0])
        mx = N.new("ShaderNodeMix"); mx.data_type = "RGBA"; mx.blend_type = "MULTIPLY"
        mx.inputs[0].default_value = 1.0
        L.new(cr.outputs[0], mx.inputs[6]); L.new(cr2.outputs[0], mx.inputs[7])
        L.new(mx.outputs[2], b.inputs["Base Color"])
        b.inputs["Roughness"].default_value = 0.7
    m.diffuse_color = (*base, 1)
    return m


class Char:
    def __init__(self, name, skin="#f1dfc6", shirt="#8db8ee", pants="#3d5fb8", hair="spiky",
                 hair_color="#a05f37", face="eddie", sleeves="short", bolt=None, vneck=None,
                 shirt_kind=None, shirt_c2=None, pants_kind=None, pants_c2=None, extras=(),
                 loc=(0, 0, 0), rot=0.0, coll=None, scale=1.0, seed=1):
        self.name = name
        self.coll = coll or collection("CH_" + name)
        n = name
        skin_c = hexc(skin) if isinstance(skin, str) else skin
        self.skin_c = skin_c
        M_skin = mat(n + "_skin", skin_c, rough=0.42)
        M_shirt = shirt_material(n + "_shirt", hexc(shirt) if isinstance(shirt, str) else shirt, shirt_kind,
                                 hexc(shirt_c2) if isinstance(shirt_c2, str) else shirt_c2)
        M_pants = shirt_material(n + "_pants", hexc(pants) if isinstance(pants, str) else pants, pants_kind,
                                 hexc(pants_c2) if isinstance(pants_c2, str) else pants_c2)
        self.root = empty(n + "_root", loc, None, self.coll, (0, 0, rot), 0.6)
        self.root.scale = (scale,) * 3
        self.hip = empty(n + "_hip", (0, 0, 2.0), self.root, self.coll)
        self.torso = box(n + "_torso", (2, 1, 2), (0, 0, 1.0), M_shirt, 0.09, parent=self.hip, coll=self.coll)
        self.neck = empty(n + "_neck", (0, 0, 2.0), self.hip, self.coll)
        # head
        self.face_mat = face_material(n + "_face", face, skin_c) if face else M_skin
        self.head = cyl(n + "_head", HEAD_R, HEAD_H, (0, 0, HEAD_H / 2 + 0.02), self.face_mat, 40, bev=0.26,
                        parent=self.neck, coll=self.coll, seg=5)
        # arms: shoulder pivots at the top of the arm block
        self.shL = empty(n + "_shL", (1.5, 0, 1.55), self.hip, self.coll)
        self.shR = empty(n + "_shR", (-1.5, 0, 1.55), self.hip, self.coll)
        cut = {"short": 0.0, "long": -0.9, "none": 0.9}[sleeves]
        for piv, nm in ((self.shL, "_armL"), (self.shR, "_armR")):
            box(n + nm, (1, 1, 2), (0, 0, -0.55), None, 0.09, parent=piv, coll=self.coll,
                cuts_z=[cut], mats=[(cut, M_skin), (5, M_shirt)])
        # legs: hip pivots
        self.hpL = empty(n + "_hpL", (0.5, 0, 0.0), self.hip, self.coll)
        self.hpR = empty(n + "_hpR", (-0.5, 0, 0.0), self.hip, self.coll)
        for piv, nm in ((self.hpL, "_legL"), (self.hpR, "_legR")):
            box(n + nm, (0.98, 1, 2), (0, 0, -1.0), M_pants, 0.09, parent=piv, coll=self.coll)
        # decals on torso front (front = -Y, surface at y=-0.5)
        if vneck:
            M_v = mat(n + "_vneck", hexc(vneck), 0.5)
            poly_extrude(n + "_v", [(-0.42, 0.0), (0.42, 0.0), (0.0, -0.55)], 0.03, (0, -0.505, 1.98), M_v,
                         rot=(90, 0, 0), parent=self.hip, coll=self.coll)
        if bolt:
            M_b = mat(n + "_bolt", hexc(bolt), 0.45, emit=None)
            poly_extrude(n + "_bolt", [(x * 1.05, y * 1.05) for x, y in BOLT], 0.03, (0.05, -0.505, 0.95), M_b,
                         rot=(90, 0, 0), parent=self.hip, coll=self.coll)
        self._hair(hair, hexc(hair_color) if isinstance(hair_color, str) else hair_color, seed)
        for ex in extras:
            getattr(self, "_x_" + ex.split(":")[0])(*(ex.split(":")[1:]))
        self.expr_keys = []
        CHARS[name] = self

    # ------------------------------------------------------------ hair styles (head-local coords)
    def _hair(self, kind, col, seed):
        if kind in (None, "none"):
            return
        n = self.name
        M = mat(n + "_hair", col, rough=0.38, coat=0.3)
        h = self.head
        z0 = 0.0  # head centre in head-local space
        if kind in ("spiky", "slick", "short", "messy"):
            sphere(n + "_cap", 0.7, (0, 0.08, 0.56), M, (1.0, 1.0, 0.5), parent=h, coll=self.coll, seg=32)
            # fringe bumps across forehead (kept above the brow line so expressions read)
            for i, x in enumerate((-0.48, -0.3, -0.1, 0.1, 0.3, 0.48)):
                sphere(f"{n}_fr{i}", 0.19, (x, -0.5 + abs(x) * 0.36, 0.58 - abs(x) * 0.06), M,
                       (1.0, 0.45, 0.5), parent=h, coll=self.coll, seg=16)
            if kind == "spiky":
                rnd = random.Random(seed)
                spikes = [  # (yaw deg around head, tilt from vertical, length, base radius)
                    (0, 18, 0.95, 0.27), (38, 30, 0.85, 0.26), (-38, 30, 0.85, 0.26), (75, 58, 0.7, 0.24),
                    (-75, 58, 0.7, 0.24), (120, 55, 0.65, 0.23), (-120, 55, 0.65, 0.23), (180, 38, 0.7, 0.25),
                    (150, 30, 0.7, 0.24), (-150, 30, 0.7, 0.24), (90, 20, 0.7, 0.24), (-90, 20, 0.7, 0.24),
                    (180, 8, 0.75, 0.25)]
                for i, (yaw, tilt, ln, r) in enumerate(spikes):
                    yaw += rnd.uniform(-8, 8); tilt += rnd.uniform(-5, 5); ln *= rnd.uniform(0.9, 1.1)
                    d = Vector((math.sin(math.radians(yaw)) * math.sin(math.radians(tilt)),
                                -math.cos(math.radians(yaw)) * math.sin(math.radians(tilt)),
                                math.cos(math.radians(tilt))))
                    base = Vector((0, 0.08, 0.54)) + Vector((d.x * 0.42, d.y * 0.42, d.z * 0.2))
                    c = cyl(f"{n}_sp{i}", r, ln, base + d * (ln / 2), M, 20, parent=h, coll=self.coll, r2=0.03)
                    c.rotation_mode = "QUATERNION"
                    c.rotation_quaternion = d.to_track_quat("Z", "Y")
            if kind == "messy":
                for i in range(7):
                    a = i / 7 * math.tau
                    sphere(f"{n}_ms{i}", 0.28, (math.sin(a) * 0.4, math.cos(a) * 0.4 + 0.08, 0.6), M,
                           (1, 1, 0.7), parent=h, coll=self.coll, seg=16)
        elif kind == "cap":   # flat newsboy cap
            sphere(n + "_cap", 0.74, (0, 0.04, 0.36), M, (1.1, 1.14, 0.36), parent=h, coll=self.coll, seg=32)
            sphere(n + "_brim", 0.55, (0, -0.5, 0.3), M, (1.08, 0.62, 0.12), parent=h, coll=self.coll, seg=24, rot=(-8, 0, 0))
        elif kind == "bob":
            sphere(n + "_cap", 0.74, (0, 0.1, 0.3), M, (1.02, 1.0, 0.82), parent=h, coll=self.coll, seg=32)
            for side in (-1, 1):
                box(f"{n}_side{side}", (0.22, 0.9, 1.0), (side * 0.62, 0.1, -0.05), M, 0.1, parent=h, coll=self.coll)
            box(n + "_fringe", (1.15, 0.3, 0.3), (0, -0.48, 0.45), M, 0.12, parent=h, coll=self.coll)
        elif kind == "helmet":
            sphere(n + "_dome", 0.74, (0, 0.02, 0.3), M, (1, 1.05, 0.85), parent=h, coll=self.coll, seg=32)
            cyl(n + "_brim", 0.95, 0.07, (0, 0.12, 0.1), M, 32, parent=h, coll=self.coll, rot=(-8, 0, 0))
            box(n + "_badge", (0.35, 0.05, 0.3), (0, -0.74, 0.45), mat("badge_gold", hexc("#d9a520"), 0.3, 0.8),
                0.03, parent=h, coll=self.coll)
        elif kind == "buzz":       # short buzz cut: thin cap only
            sphere(n + "_cap", 0.66, (0, 0.06, 0.36), M, (1.0, 1.0, 0.5), parent=h, coll=self.coll, seg=32)
        elif kind == "bun":        # grandma bun
            sphere(n + "_cap", 0.7, (0, 0.1, 0.32), M, (1.0, 1.0, 0.62), parent=h, coll=self.coll, seg=32)
            sphere(n + "_bun", 0.34, (0, 0.38, 0.78), M, parent=h, coll=self.coll, seg=20)
        elif kind == "tophat":
            Mh = mat("tophat_black", hexc("#151515"), 0.35)
            cyl(n + "_hatbrim", 0.9, 0.08, (0, 0, 0.6), Mh, 32, parent=h, coll=self.coll)
            cyl(n + "_hattop", 0.6, 1.1, (0, 0, 1.15), Mh, 32, parent=h, coll=self.coll)
            cyl(n + "_hatband", 0.61, 0.18, (0, 0, 0.72), mat("hatband_red", hexc("#b0201c"), 0.4), 32, parent=h, coll=self.coll)
        elif kind == "pilot":
            Mp = mat("pilot_navy", hexc("#1e2a4a"), 0.4)
            cyl(n + "_capt", 0.72, 0.45, (0, 0.02, 0.62), Mp, 32, parent=h, coll=self.coll)
            sphere(n + "_visor", 0.5, (0, -0.55, 0.45), mat("visor_black", hexc("#101010"), 0.2), (1.0, 0.55, 0.1),
                   parent=h, coll=self.coll, seg=20)
            box(n + "_capbadge", (0.3, 0.04, 0.2), (0, -0.73, 0.65), mat("badge_gold", hexc("#d9a520"), 0.3, 0.8),
                0.02, parent=h, coll=self.coll)
        elif kind == "bald":
            pass

    # ------------------------------------------------------------ extras
    def _x_glasses(self, color="#303030"):
        M = mat(self.name + "_glasses", hexc(color), 0.3)
        h = self.head
        for side in (-1, 1):
            cx = side * 0.23
            for (sx, sz, dx, dz) in ((0.4, 0.05, 0, 0.16), (0.4, 0.05, 0, -0.12), (0.05, 0.33, 0.18, 0.02), (0.05, 0.33, -0.18, 0.02)):
                box(f"{self.name}_gl{side}{dx}{dz}", (sx, 0.05, sz), (cx + dx, -0.66, 0.12 + dz), M, 0.015, parent=h, coll=self.coll)
            box(f"{self.name}_arm{side}", (0.04, 0.7, 0.04), (side * 0.62, -0.3, 0.27), M, 0.0, parent=h, coll=self.coll)
        box(self.name + "_bridge", (0.1, 0.04, 0.04), (0, -0.66, 0.2), M, 0.0, parent=h, coll=self.coll)

    def _x_beard(self, color="#f2f0ec"):
        M = mat(self.name + "_beard", hexc(color), 0.85)
        rnd = random.Random(3)
        for i in range(16):
            a = math.radians(-80 + 160 * i / 15)
            x, y = math.sin(a) * 0.55, -math.cos(a) * 0.6
            z = -0.38 + abs(math.sin(a)) * 0.22 + rnd.uniform(-0.03, 0.03)
            sphere(f"{self.name}_bd{i}", 0.13 + rnd.uniform(0, 0.04), (x, y, z), M, parent=self.head, coll=self.coll, seg=12)
        for i, x in enumerate((-0.12, 0.12)):
            sphere(f"{self.name}_ms{i}", 0.12, (x, -0.66, -0.12), M, (1.3, 0.8, 0.8), parent=self.head, coll=self.coll, seg=12)

    def _x_collar(self, color="#c8261e"):
        M = mat(self.name + "_collar", hexc(color), 0.5)
        for side in (-1, 1):
            poly_extrude(f"{self.name}_col{side}", [(0, 0), (side * 0.55, 0.02), (side * 0.18, -0.45)], 0.04,
                         (0, -0.52, 1.98), M, rot=(90, 0, 0), parent=self.hip, coll=self.coll)
        box(self.name + "_placket", (0.12, 0.04, 1.4), (0, -0.52, 1.2), M, 0.01, parent=self.hip, coll=self.coll)
        Mw = mat("button_white", (0.9, 0.9, 0.9), 0.3)
        for i in range(3):
            cyl(f"{self.name}_btn{i}", 0.05, 0.03, (0, -0.55, 1.55 - i * 0.4), Mw, 12, rot=(90, 0, 0),
                parent=self.hip, coll=self.coll)

    def _x_backpack(self, label="EDDIE"):
        M = mat("backpack_orange", hexc("#e2582a"), 0.55)
        Ms = mat("backpack_strap", hexc("#6a2d1a"), 0.6)
        bp = box(self.name + "_bp", (1.7, 0.75, 1.9), (0, 0.9, 1.0), M, 0.14, parent=self.hip, coll=self.coll)
        box(self.name + "_bpp", (1.3, 0.25, 0.9), (0, 1.35, 0.75), M, 0.1, parent=self.hip, coll=self.coll)
        for side in (-1, 1):
            box(f"{self.name}_strap{side}", (0.22, 0.08, 1.9), (side * 0.6, -0.52, 1.0), Ms, 0.03,
                parent=self.hip, coll=self.coll)
            box(f"{self.name}_strapt{side}", (0.22, 1.1, 0.08), (side * 0.6, 0.0, 2.02), Ms, 0.03,
                parent=self.hip, coll=self.coll)
        Mt = mat("tag_white", (0.92, 0.92, 0.9), 0.5)
        box(self.name + "_tag", (1.0, 0.04, 0.42), (0, 1.5, 0.75), Mt, 0.02, parent=self.hip, coll=self.coll)
        text(self.name + "_tagtxt", label, (0, 1.53, 0.75), 0.28, mat("ink", (0.05, 0.05, 0.06), 0.6),
             rot=(90, 0, 180), parent=self.hip, coll=self.coll)
        cyl(self.name + "_handle", 0.25, 0.08, (0, 0.95, 2.05), Ms, 16, rot=(0, 90, 0), parent=self.hip, coll=self.coll)

    def _x_hold(self, what="sign"):
        pass

    # ------------------------------------------------------------ animation
    def piv(self, part):
        return {"armL": self.shL, "armR": self.shR, "legL": self.hpL, "legR": self.hpR,
                "head": self.neck, "torso": self.hip}[part]

    def pose(self, t, interp="BEZIER", **kw):
        """Keyframe at absolute time t (s). Angles in degrees.
        armL/armR/legL/legR = (fwd, out[, twist]) ; head/torso = (yaw, pitch_down, roll);
        loc = root (x,y,z) ; rot = root yaw ; hipz = hip height offset ; face = expression index."""
        f = F(t)
        for part in ("armL", "armR", "legL", "legR"):
            if part in kw:
                v = list(kw[part]) + [0, 0, 0]
                fwd, out, tw = v[0], v[1], v[2]
                side = 1 if part.endswith("L") else -1
                p = self.piv(part)
                p.rotation_euler = (math.radians(-fwd), math.radians(-out * side), math.radians(tw * side))
                p.keyframe_insert("rotation_euler", frame=f)
                set_interp(p, "rotation_euler", f, interp)
        for part in ("head", "torso"):
            if part in kw:
                yaw, pitch, roll = (list(kw[part]) + [0, 0, 0])[:3]
                p = self.piv(part)
                p.rotation_euler = (math.radians(pitch), math.radians(roll), math.radians(yaw))
                p.keyframe_insert("rotation_euler", frame=f)
                set_interp(p, "rotation_euler", f, interp)
        if "loc" in kw:
            self.root.location = kw["loc"]
            self.root.keyframe_insert("location", frame=f)
            set_interp(self.root, "location", f, interp)
        if "rot" in kw:
            self.root.rotation_euler[2] = math.radians(kw["rot"])
            self.root.keyframe_insert("rotation_euler", index=2, frame=f)
            set_interp(self.root, "rotation_euler", f, interp)
        if "hipz" in kw:
            self.hip.location[2] = 2.0 + kw["hipz"]
            self.hip.keyframe_insert("location", index=2, frame=f)
            set_interp(self.hip, "location", f, interp)
        if "face" in kw:
            self.face(t, kw["face"])
        return self

    def face(self, t, idx):
        if not self.face_mat or "FaceMap" not in self.face_mat.node_tree.nodes:
            return
        mp = self.face_mat.node_tree.nodes["FaceMap"]
        col, row = idx % 4, idx // 4
        mp.inputs["Location"].default_value = (col * 0.25, (3 - row) * 0.25, 0)
        f = F(t)
        mp.inputs["Location"].keyframe_insert("default_value", frame=f)
        for fc in fcurves(self.face_mat.node_tree.animation_data.action):
            for kp in fc.keyframe_points:
                kp.interpolation = "CONSTANT"

    def faces(self, seq):
        """seq: list of (t, idx)."""
        for t, i in seq:
            self.face(t, i)

    def lipsync(self, words, t0, t1, open_idx, closed_idx, alt_idx=None):
        """Flap mouth on narration words between t0 and t1."""
        k = 0
        for w in words:
            if t0 <= w["s"] < t1:
                self.face(w["s"], open_idx if (alt_idx is None or k % 2 == 0) else alt_idx)
                mid = w["s"] + max(0.06, (w["e"] - w["s"]) * 0.6)
                if mid < t1:
                    self.face(mid, closed_idx)
                k += 1

    def walk(self, t0, t1, p0, p1, rate=2.4, swing=32, arm=28, bob=0.12, face_dir=True, start_phase=0):
        """Walk root from p0 to p1 over [t0,t1] with leg/arm swing."""
        p0, p1 = Vector(p0), Vector(p1)
        if face_dir:
            d = p1 - p0
            yaw = math.degrees(math.atan2(d.x, -d.y))
            self.pose(t0, rot=yaw)
            self.pose(t1, rot=yaw)
        self.pose(t0, loc=tuple(p0), interp="LINEAR")
        self.pose(t1, loc=tuple(p1), interp="LINEAR")
        step = 1.0 / (rate * 2)
        t, k = t0, start_phase
        while t <= t1 + 1e-4:
            s = 1 if k % 2 == 0 else -1
            self.pose(t, legL=(swing * s, 0), legR=(-swing * s, 0), armL=(-arm * s, 4), armR=(arm * s, 4), hipz=0.0)
            if t + step / 2 <= t1:
                self.pose(t + step / 2, hipz=bob)
            t += step; k += 1
        self.pose(t1, legL=(0, 0), legR=(0, 0), armL=(0, 3), armR=(0, 3), hipz=0.0)

    def idle(self, strength=1.0):
        """Subtle breathing / head drift via noise modifiers."""
        noise(self.neck, "rotation_euler", 2, 0.04 * strength, 25)
        noise(self.neck, "rotation_euler", 0, 0.02 * strength, 30)
        noise(self.hip, "rotation_euler", 2, 0.015 * strength, 40)
        return self

    def set_visible(self, t, vis):
        f = F(t)
        for ob in list(self.coll.all_objects):
            ob.hide_render = not vis
            ob.hide_viewport = not vis
            ob.keyframe_insert("hide_render", frame=f)
            ob.keyframe_insert("hide_viewport", frame=f)


# ------------------------------------------------------------ presets
def eddie(name="Eddie", **kw):
    a = dict(skin="#f1dfc6", shirt="#8db8ee", pants="#3c5cbc", hair="spiky", hair_color="#7c4426",
             face="hero", bolt="#f2c14e", vneck="#a8cdf6")
    a.update(kw)
    return Char(name, **a)


def reflection_eddie(name="Reflect", **kw):
    a = dict(skin="#e9cdb0", shirt="#2d4a44", shirt_kind="burnt", shirt_c2="#6e1a12", pants="#2a3348",
             hair="spiky", hair_color="#74401f", face="hero_blood", bolt="#e8762c", vneck="#3a5a52")
    a.update(kw)
    return Char(name, **a)


def teacher(name="Teacher", **kw):
    a = dict(skin="#f0dcc3", shirt="#7f9fd6", pants="#3f4f7c", hair="cap", hair_color="#b9aa98",
             face="mustache", vneck="#f4f4f4", sleeves="long")
    a.update(kw)
    return Char(name, **a)


def girl(name="Girl", **kw):
    a = dict(skin="#f2dbc6", shirt="#f09ac2", pants="#d47ab0", hair="bob", hair_color="#9a6a4a",
             face="girl", sleeves="long")
    a.update(kw)
    return Char(name, **a)


def dad(name="Dad", **kw):
    a = dict(skin="#efd9c0", shirt="#f4f4f2", pants="#3b3f4a", hair="short", hair_color="#8a6a52",
             face="mustache", extras=("glasses", "beard", "collar"), sleeves="long")
    a.update(kw)
    return Char(name, **a)


def yellow_guy(name="Yellow", **kw):
    a = dict(skin="#d9b48f", shirt="#e8b520", pants="#2b3f8c", hair="slick", hair_color="#1d1a1a",
             face="hero")
    a.update(kw)
    return Char(name, **a)


def firefighter(name="FF", **kw):
    a = dict(skin="#d8b896", shirt="#c9a227", pants="#4a4128", hair="helmet", hair_color="#e0b21c",
             face="plain", sleeves="long", vneck="#d7d34a")
    a.update(kw)
    return Char(name, **a)


KID_COLORS = [("#e8574a", "#2f3f7a"), ("#4aa5e8", "#38404e"), ("#f2c14e", "#3a5a8a"), ("#63c06a", "#4a3a2a"),
              ("#f09ac2", "#5a4a9a"), ("#ffffff", "#2b2b2b"), ("#9b6ad6", "#2d3a58"), ("#ff9a3c", "#1f4f3f")]
SKINS = ["#f1dfc6", "#d9b48f", "#a8714a", "#7a4e33", "#f5d6b8"]
HAIRS = [("short", "#2a1d16"), ("bob", "#9a6a4a"), ("messy", "#e0c060"), ("slick", "#151212"), ("short", "#6b3a1e")]


def kid(i, **kw):
    r = random.Random(i * 7 + 1)
    sh, pa = KID_COLORS[i % len(KID_COLORS)]
    hr, hc = HAIRS[r.randrange(len(HAIRS))]
    a = dict(skin=SKINS[r.randrange(len(SKINS))], shirt=sh, pants=pa, hair=hr, hair_color=hc, face="plain", seed=i)
    a.update(kw)
    return Char(f"Kid{i}", **a)
