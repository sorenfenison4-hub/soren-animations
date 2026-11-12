"""Fire cards, embers, smoke volumes, flicker lights, flashes."""
import math, random
import bpy
from mathutils import Vector
from .core import D, F, plane, sphere, box, light, noise, fcurves, mat, _link


def _time_value(nt, speed=1.0):
    """Value node animated linearly forever (frame-based time)."""
    v = nt.nodes.new("ShaderNodeValue")
    v.outputs[0].default_value = 0.0
    v.outputs[0].keyframe_insert("default_value", frame=0)
    v.outputs[0].default_value = speed * 100
    v.outputs[0].keyframe_insert("default_value", frame=3000)
    for fc in fcurves(nt.animation_data.action):
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"
    return v


_FIRE = {}


def fire_material(name="Fire", strength=8.0, speed=0.045, hue="orange"):
    key = (name, strength, hue)
    if key in _FIRE:
        return _FIRE[key]
    m = D.materials.new(name)
    m.use_nodes = True
    m.surface_render_method = "BLENDED"
    m.use_backface_culling = False
    try:
        m.use_transparency_overlap = True
    except Exception:
        pass
    nt = m.node_tree; N, L = nt.nodes, nt.links
    for n in list(N):
        if n.type != "OUTPUT_MATERIAL":
            N.remove(n)
    out = next(n for n in N if n.type == "OUTPUT_MATERIAL")
    tc = N.new("ShaderNodeTexCoord")
    oi = N.new("ShaderNodeObjectInfo")
    t = _time_value(nt, speed)
    # uv -> scrolling noise coords
    sep = N.new("ShaderNodeSeparateXYZ"); L.new(tc.outputs["UV"], sep.inputs[0])
    cmb = N.new("ShaderNodeCombineXYZ")
    rx = N.new("ShaderNodeMath"); rx.operation = "MULTIPLY_ADD"
    L.new(oi.outputs["Random"], rx.inputs[0]); rx.inputs[1].default_value = 37.0
    L.new(sep.outputs["X"], rx.inputs[2])
    ry = N.new("ShaderNodeMath"); ry.operation = "SUBTRACT"
    L.new(sep.outputs["Y"], ry.inputs[0]); L.new(t.outputs[0], ry.inputs[1])
    L.new(rx.outputs[0], cmb.inputs[0]); L.new(ry.outputs[0], cmb.inputs[1]); L.new(oi.outputs["Random"], cmb.inputs[2])
    stretch = N.new("ShaderNodeVectorMath"); stretch.operation = "MULTIPLY"
    stretch.inputs[1].default_value = (2.2, 0.75, 1.0)
    L.new(cmb.outputs[0], stretch.inputs[0])
    nz = N.new("ShaderNodeTexNoise"); nz.noise_dimensions = "3D"
    nz.inputs["Scale"].default_value = 2.6; nz.inputs["Detail"].default_value = 6.0
    nz.inputs["Roughness"].default_value = 0.6; nz.inputs["Distortion"].default_value = 0.4
    L.new(stretch.outputs[0], nz.inputs["Vector"])
    # vertical falloff: 1 at bottom -> 0 at top ; horizontal falloff
    fy = N.new("ShaderNodeMath"); fy.operation = "SUBTRACT"; fy.inputs[0].default_value = 1.0
    L.new(sep.outputs["Y"], fy.inputs[1])
    fx_ = N.new("ShaderNodeMath"); fx_.operation = "SUBTRACT"; fx_.inputs[1].default_value = 0.5
    L.new(sep.outputs["X"], fx_.inputs[0])
    fx2 = N.new("ShaderNodeMath"); fx2.operation = "ABSOLUTE"; L.new(fx_.outputs[0], fx2.inputs[0])
    fx3 = N.new("ShaderNodeMath"); fx3.operation = "MULTIPLY"; fx3.inputs[1].default_value = 2.0
    L.new(fx2.outputs[0], fx3.inputs[0])
    fx4 = N.new("ShaderNodeMath"); fx4.operation = "POWER"; fx4.inputs[1].default_value = 2.0
    L.new(fx3.outputs[0], fx4.inputs[0])
    hx = N.new("ShaderNodeMath"); hx.operation = "SUBTRACT"; hx.inputs[0].default_value = 1.0
    L.new(fx4.outputs[0], hx.inputs[1])
    shape = N.new("ShaderNodeMath"); shape.operation = "MULTIPLY"
    L.new(fy.outputs[0], shape.inputs[0]); L.new(hx.outputs[0], shape.inputs[1])
    # combine with noise : fire = shape*1.5 + (noise-0.5)*1.2 - 0.25
    a = N.new("ShaderNodeMath"); a.operation = "MULTIPLY_ADD"
    L.new(nz.outputs["Fac"], a.inputs[0]); a.inputs[1].default_value = 1.25; a.inputs[2].default_value = -0.85
    b = N.new("ShaderNodeMath"); b.operation = "MULTIPLY_ADD"
    L.new(shape.outputs[0], b.inputs[0]); b.inputs[1].default_value = 1.35; L.new(a.outputs[0], b.inputs[2])
    ramp = N.new("ShaderNodeValToRGB")
    e = ramp.color_ramp.elements
    e[0].position = 0.0; e[0].color = (0, 0, 0, 0)
    e[1].position = 1.0; e[1].color = (1.0, 0.95, 0.75, 1)
    cols = [(0.16, (0.35, 0.02, 0.0, 1)), (0.34, (1.0, 0.12, 0.0, 1)), (0.55, (1.0, 0.35, 0.02, 1)), (0.78, (1.0, 0.62, 0.15, 1))]
    for p, c in cols:
        el = ramp.color_ramp.elements.new(p); el.color = c
    L.new(b.outputs[0], ramp.inputs[0])
    al = N.new("ShaderNodeMapRange"); al.inputs["From Min"].default_value = 0.1; al.inputs["From Max"].default_value = 0.32
    L.new(b.outputs[0], al.inputs["Value"])
    em = N.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = strength
    L.new(ramp.outputs["Color"], em.inputs["Color"])
    tr = N.new("ShaderNodeBsdfTransparent")
    mix = N.new("ShaderNodeMixShader")
    L.new(al.outputs[0], mix.inputs[0]); L.new(tr.outputs[0], mix.inputs[1]); L.new(em.outputs[0], mix.inputs[2])
    L.new(mix.outputs[0], out.inputs["Surface"])
    _FIRE[key] = m
    return m


def fire_card(name, loc, w=2.0, h=3.0, yaw=0.0, coll=None, strength=18.0, tilt=0.0):
    m = fire_material(strength=strength)
    ob = plane(name, w, h, loc, m, (90 + tilt, 0, yaw), None, coll)
    ob.visible_shadow = False
    try:
        ob.visible_volume_scatter = False
    except Exception:
        pass
    return ob


def fire_cluster(prefix, center, spread=(3, 1, 0), n=6, h=(2.5, 4.5), w=(1.5, 2.6), coll=None, seed=1,
                 strength=18.0, yaw_base=0.0):
    rnd = random.Random(seed)
    obs = []
    for i in range(n):
        hh = rnd.uniform(*h); ww = rnd.uniform(*w)
        p = Vector(center) + Vector((rnd.uniform(-1, 1) * spread[0], rnd.uniform(-1, 1) * spread[1],
                                     rnd.uniform(-1, 1) * spread[2] + hh / 2))
        obs.append(fire_card(f"{prefix}{i}", p, ww, hh, yaw_base + rnd.uniform(-35, 35), coll, strength))
    return obs


def ceiling_fire(prefix, center, size=(10, 10), n=10, coll=None, seed=3, strength=14.0):
    """Fire rolling along a ceiling: flame cards hanging down/tilted."""
    rnd = random.Random(seed)
    for i in range(n):
        p = Vector(center) + Vector((rnd.uniform(-0.5, 0.5) * size[0], rnd.uniform(-0.5, 0.5) * size[1], -rnd.uniform(0.3, 1.2)))
        ob = fire_card(f"{prefix}{i}", p, rnd.uniform(3, 6), rnd.uniform(2.5, 4), rnd.uniform(0, 180), coll, strength,
                       tilt=180 + rnd.uniform(-25, 25))


def embers(prefix, region_min, region_max, n=60, coll=None, seed=7, rise=6.0, life=(1.2, 2.6), size=0.035,
           color=(1.0, 0.45, 0.1), strength=40.0):
    """Looping glowing sparks drifting upward (keyframes + cycles + noise, no particle cache)."""
    rnd = random.Random(seed)
    M = mat("ember_" + prefix, (0, 0, 0), emit=color, estr=strength)
    me = None
    for i in range(n):
        p0 = Vector([rnd.uniform(a, b) for a, b in zip(region_min, region_max)])
        L = rnd.uniform(*life)
        ob = sphere(f"{prefix}{i}", size * rnd.uniform(0.6, 1.4), p0, M, coll=coll, seg=6)
        ob.visible_shadow = False
        off = rnd.uniform(0, L)
        f0 = 1 - off * 30
        ob.location = p0
        ob.keyframe_insert("location", frame=f0)
        ob.location = p0 + Vector((rnd.uniform(-1.5, 1.5), rnd.uniform(-1.0, 1.0), rise * rnd.uniform(0.6, 1.2)))
        ob.keyframe_insert("location", frame=f0 + L * 30)
        for fc in fcurves(ob.animation_data.action):
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR"
            fc.modifiers.new("CYCLES")
            nm = fc.modifiers.new("NOISE"); nm.strength = 0.6; nm.scale = 12; nm.phase = rnd.uniform(0, 100)


def smoke_volume(name, loc, size, coll=None, density=0.25, color=(0.25, 0.2, 0.18), emit=(1.0, 0.35, 0.08),
                 estr=0.15, speed=0.02):
    ob = box(name, size, loc, None, 0.0, coll=coll)
    m = D.materials.new(name + "_mat")
    m.use_nodes = True
    nt = m.node_tree; N, L = nt.nodes, nt.links
    for n in list(N):
        if n.type != "OUTPUT_MATERIAL":
            N.remove(n)
    out = next(n for n in N if n.type == "OUTPUT_MATERIAL")
    pv = N.new("ShaderNodeVolumePrincipled")
    pv.inputs["Color"].default_value = (*color, 1)
    pv.inputs["Emission Color"].default_value = (*emit, 1)
    pv.inputs["Emission Strength"].default_value = estr
    tc = N.new("ShaderNodeTexCoord")
    t = _time_value(nt, speed)
    add = N.new("ShaderNodeVectorMath"); add.operation = "ADD"
    cm = N.new("ShaderNodeCombineXYZ"); L.new(t.outputs[0], cm.inputs[2]); L.new(t.outputs[0], cm.inputs[0])
    L.new(tc.outputs["Object"], add.inputs[0]); L.new(cm.outputs[0], add.inputs[1])
    nz = N.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 1.6; nz.inputs["Detail"].default_value = 4
    L.new(add.outputs[0], nz.inputs["Vector"])
    mr = N.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = 0.42; mr.inputs["From Max"].default_value = 0.75
    mr.inputs["To Max"].default_value = density
    L.new(nz.outputs["Fac"], mr.inputs["Value"]); L.new(mr.outputs[0], pv.inputs["Density"])
    L.new(pv.outputs[0], out.inputs["Volume"])
    ob.data.materials.append(m)
    ob.visible_shadow = False
    return ob


def flicker(light_ob, strength=0.25, scale=3.0):
    """Fire flicker on light energy (relative)."""
    ld = light_ob.data
    base = ld.energy
    ld.keyframe_insert("energy", frame=1)
    for fc in fcurves(ld.animation_data.action):
        if fc.data_path == "energy":
            md = fc.modifiers.new("NOISE"); md.strength = base * strength; md.scale = scale
            md.phase = random.uniform(0, 100)


def fire_lights(prefix, points, energy=3000, color=(1.0, 0.45, 0.12), coll=None, radius=1.5):
    obs = []
    for i, p in enumerate(points):
        lo = light(f"{prefix}{i}", "POINT", p, energy, color, radius, coll=coll)
        flicker(lo, 0.35, 2.5)
        obs.append(lo)
    return obs


def white_flash(name, cam_ob, t0, t1, coll=None):
    """Emissive card parented in front of the camera, fading from white."""
    m = mat(name + "_m", (1, 1, 1), emit=(1, 1, 1), estr=30)
    p = plane(name, 4, 4, (0, 0, -0.3), m, (0, 0, 0), cam_ob, coll)
    return p
