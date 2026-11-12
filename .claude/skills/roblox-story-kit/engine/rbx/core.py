"""Scene, material, primitive, keyframe and camera helpers."""
import math
import bmesh
import bpy
from mathutils import Vector, Euler, Matrix, Quaternion
from . import FPS

D = bpy.data


def F(t):
    """Absolute time (s) -> Blender frame (frame 1 == t 0)."""
    return int(round(t * FPS)) + 1


# ------------------------------------------------------------------ scene
def reset():
    for ob in list(D.objects):
        D.objects.remove(ob, do_unlink=True)
    for coll in list(D.collections):
        D.collections.remove(coll)
    for blk in (D.meshes, D.materials, D.lights, D.cameras, D.curves, D.actions,
                D.particles, D.node_groups, D.worlds, D.fonts):
        for x in list(blk):
            try:
                blk.remove(x)
            except Exception:
                pass
    for im in list(D.images):
        if im.users == 0 or im.name not in ("Render Result", "Viewer Node"):
            try:
                D.images.remove(im)
            except Exception:
                pass
    _MATS.clear()
    try:
        from . import fx
        fx._FIRE.clear()
    except Exception:
        pass


def setup_render(f0, f1, res=(1080, 1920), samples=24, pct=100, blur=True):
    sc = bpy.context.scene
    try:
        sc.render.engine = "BLENDER_EEVEE"
    except TypeError as e:
        print(e)
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = pct
    sc.render.fps = FPS
    sc.frame_start, sc.frame_end = f0, f1
    sc.frame_set(f0)
    ee = sc.eevee
    ee.taa_render_samples = samples
    ee.taa_samples = 8
    ee.use_raytracing = True
    ee.use_shadows = True
    try:
        ee.ray_tracing_options.resolution_scale = "2"
    except Exception:
        pass
    ee.volumetric_samples = 32
    ee.use_volumetric_shadows = True
    sc.render.use_motion_blur = blur
    try:
        sc.render.motion_blur_shutter = 0.5
        ee.motion_blur_steps = 1
    except Exception:
        pass
    sc.render.film_transparent = False
    vs = sc.view_settings
    for vt in ("AgX", "Filmic", "Standard"):
        try:
            vs.view_transform = vt
            break
        except TypeError:
            continue
    for lk in ("AgX - Medium High Contrast", "Medium High Contrast", "None"):
        try:
            vs.look = lk
            break
        except TypeError:
            continue
    vs.exposure = 0.0
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGB"
    try:
        sc.render.image_settings.compression = 15
    except Exception:
        pass
    setup_compositor()


def setup_compositor(bloom=0.35, threshold=1.0):
    sc = bpy.context.scene
    ng = D.node_groups.new("Comp", "CompositorNodeTree")
    ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    rl = ng.nodes.new("CompositorNodeRLayers")
    gl = ng.nodes.new("CompositorNodeGlare")
    out = ng.nodes.new("NodeGroupOutput")
    try:
        gl.inputs["Type"].default_value = "Bloom"
        gl.inputs["Quality"].default_value = "Medium"
        gl.inputs["Threshold"].default_value = threshold
        gl.inputs["Strength"].default_value = bloom
        gl.inputs["Size"].default_value = 0.7
    except Exception as e:
        print("glare", e)
    ng.links.new(rl.outputs["Image"], gl.inputs["Image"])
    ng.links.new(gl.outputs[0], out.inputs[0])
    sc.compositing_node_group = ng
    sc.render.use_compositing = True
    return gl


def world(color=(0.8, 0.85, 1.0), strength=0.6):
    w = D.worlds.new("World")
    bpy.context.scene.world = w
    w.use_nodes = True
    bg = next(n for n in w.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs[0].default_value = (*color, 1)
    bg.inputs[1].default_value = strength
    return bg


def collection(name, parent=None):
    c = D.collections.get(name) or D.collections.new(name)
    par = parent or bpy.context.scene.collection
    if c.name not in [x.name for x in par.children]:
        par.children.link(c)
    return c


def _link(ob, coll):
    (coll or bpy.context.scene.collection).objects.link(ob)


# ------------------------------------------------------------------ materials
_MATS = {}


def _bsdf(m):
    return next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")


def mat(name, color=(0.8, 0.8, 0.8), rough=0.45, metal=0.0, emit=None, estr=0.0, alpha=1.0,
        coat=0.0, spec=0.5):
    if name in _MATS:
        return _MATS[name]
    m = D.materials.new(name)
    m.use_nodes = True
    b = _bsdf(m)
    b.inputs["Base Color"].default_value = (*color[:3], 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    try:
        b.inputs["Specular IOR Level"].default_value = spec
        b.inputs["Coat Weight"].default_value = coat
    except KeyError:
        pass
    if emit is not None:
        b.inputs["Emission Color"].default_value = (*emit[:3], 1)
        b.inputs["Emission Strength"].default_value = estr
    if alpha < 1:
        b.inputs["Alpha"].default_value = alpha
        m.surface_render_method = "BLENDED"
    m.diffuse_color = (*color[:3], 1)
    _MATS[name] = m
    return m


def hexc(h):
    """'#rrggbb' sRGB -> linear tuple."""
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


def image(path, colorspace="sRGB"):
    im = D.images.load(path, check_existing=True)
    try:
        im.colorspace_settings.name = colorspace
    except TypeError:
        pass
    return im


def img_mat(name, path, rough=0.5, emit=0.0, alpha=False, proj_box=False):
    """Material with an image texture on UVs."""
    if name in _MATS:
        return _MATS[name]
    m = D.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = _bsdf(m)
    tx = nt.nodes.new("ShaderNodeTexImage")
    tx.image = image(path)
    nt.links.new(tx.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough
    if emit:
        nt.links.new(tx.outputs["Color"], b.inputs["Emission Color"])
        b.inputs["Emission Strength"].default_value = emit
    if alpha:
        nt.links.new(tx.outputs["Alpha"], b.inputs["Alpha"])
    _MATS[name] = m
    return m


# ------------------------------------------------------------------ primitives
def _obj(name, me, coll, loc, rot, parent):
    ob = D.objects.new(name, me)
    _link(ob, coll)
    if parent is not None:
        ob.parent = parent
    ob.location = loc
    ob.rotation_euler = [math.radians(a) for a in rot]
    return ob


def _smooth(me):
    me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))


def bevel(ob, width=0.08, seg=3, harden=True):
    if width <= 0:
        return
    md = ob.modifiers.new("Bevel", "BEVEL")
    md.width = width
    md.segments = seg
    md.limit_method = "ANGLE"
    md.harden_normals = harden
    _smooth(ob.data)


def box(name, size, loc=(0, 0, 0), m=None, bev=0.06, rot=(0, 0, 0), parent=None, coll=None,
        seg=3, cuts_z=None, mats=None):
    """Axis box centred at loc. cuts_z: list of z (local) for horizontal loop cuts,
    mats: list of (zmax, material) to assign by face-centre height, low to high."""
    me = D.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    if cuts_z:
        for z in cuts_z:
            geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
            bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(0, 0, z), plane_no=(0, 0, 1))
    bm.to_mesh(me)
    bm.free()
    ob = _obj(name, me, coll, loc, rot, parent)
    if mats:
        for _, mm in mats:
            me.materials.append(mm)
        for p in me.polygons:
            zc = p.center.z
            for i, (zmax, _) in enumerate(mats):
                if zc <= zmax:
                    p.material_index = i
                    break
    elif m is not None:
        me.materials.append(m)
    bevel(ob, bev, seg)
    return ob


def cyl(name, r, h, loc=(0, 0, 0), m=None, verts=32, bev=0.0, rot=(0, 0, 0), parent=None,
        coll=None, r2=None, seg=3):
    me = D.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r,
                          radius2=r if r2 is None else r2, depth=h)
    bm.to_mesh(me)
    bm.free()
    ob = _obj(name, me, coll, loc, rot, parent)
    if m is not None:
        me.materials.append(m)
    _smooth(me)
    if bev > 0:
        bevel(ob, bev, seg, harden=True)
    return ob


def sphere(name, r, loc=(0, 0, 0), m=None, scale=(1, 1, 1), parent=None, coll=None, seg=24, rot=(0, 0, 0)):
    me = D.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=r)
    bm.to_mesh(me)
    bm.free()
    ob = _obj(name, me, coll, loc, rot, parent)
    ob.scale = scale
    if m is not None:
        me.materials.append(m)
    _smooth(me)
    return ob


def plane(name, w, h, loc=(0, 0, 0), m=None, rot=(0, 0, 0), parent=None, coll=None):
    """Plane in local XY (normal +Z), w along X, h along Y, with 0..1 UVs."""
    me = D.meshes.new(name)
    me.from_pydata([(-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0)], [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new()
    for i, c in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)]):
        uv.data[i].uv = c
    ob = _obj(name, me, coll, loc, rot, parent)
    if m is not None:
        me.materials.append(m)
    return ob


def card(name, w, h, loc, m, facing="-Y", parent=None, coll=None, rot_extra=0):
    """Vertical plane facing a world axis (for signs, pictures, fire cards)."""
    rot = {"-Y": (90, 0, 0), "+Y": (90, 0, 180), "-X": (90, 0, -90), "+X": (90, 0, 90)}[facing]
    rot = (rot[0], rot[1], rot[2] + rot_extra)
    return plane(name, w, h, loc, m, rot, parent, coll)


def poly_extrude(name, pts2d, depth, loc, m, rot=(90, 0, 0), parent=None, coll=None, bev=0.0):
    """Extruded 2D polygon (in local XY) along +Z by depth."""
    me = D.meshes.new(name)
    bm = bmesh.new()
    vs = [bm.verts.new((x, y, 0)) for x, y in pts2d]
    f = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    top = [e for e in ext["geom"] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, 0, depth), verts=top)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    ob = _obj(name, me, coll, loc, rot, parent)
    me.materials.append(m)
    if bev:
        bevel(ob, bev, 2)
    return ob


def empty(name, loc=(0, 0, 0), parent=None, coll=None, rot=(0, 0, 0), size=0.3):
    ob = D.objects.new(name, None)
    ob.empty_display_size = size
    _link(ob, coll)
    ob.parent = parent
    ob.location = loc
    ob.rotation_euler = [math.radians(a) for a in rot]
    return ob


def text(name, body, loc, size=1.0, m=None, rot=(90, 0, 0), extrude=0.0, coll=None, font=None,
         align="CENTER", parent=None):
    cu = D.curves.new(name, "FONT")
    cu.body = body
    cu.size = size
    cu.extrude = extrude
    cu.align_x = align
    cu.align_y = "CENTER"
    if font:
        try:
            cu.font = D.fonts.load(font, check_existing=True)
        except Exception as e:
            print("font", e)
    ob = D.objects.new(name, cu)
    _link(ob, coll)
    ob.parent = parent
    ob.location = loc
    ob.rotation_euler = [math.radians(a) for a in rot]
    if m is not None:
        cu.materials.append(m)
    return ob


def instance(name, coll_src, loc=(0, 0, 0), scale=(1, 1, 1), coll=None, rot=(0, 0, 0)):
    ob = D.objects.new(name, None)
    ob.instance_type = "COLLECTION"
    ob.instance_collection = coll_src
    _link(ob, coll)
    ob.location = loc
    ob.scale = scale
    ob.rotation_euler = [math.radians(a) for a in rot]
    return ob


def hide_coll_from_layer(coll):
    """Keep a collection only as an instance source (not rendered directly)."""
    lc = bpy.context.view_layer.layer_collection
    def find(l):
        if l.collection == coll:
            return l
        for c in l.children:
            r = find(c)
            if r:
                return r
    l = find(lc)
    if l:
        l.exclude = True


# ------------------------------------------------------------------ lights
def light(name, kind="AREA", loc=(0, 0, 5), energy=500, color=(1, 1, 1), size=2.0, rot=(0, 0, 0),
          target=None, coll=None, shadow=True, spot=45, blend=0.3, size_y=None):
    ld = D.lights.new(name, kind)
    ld.energy = energy
    ld.color = color
    ld.use_shadow = shadow
    if kind == "AREA":
        ld.size = size
        if size_y:
            ld.shape = "RECTANGLE"
            ld.size_y = size_y
    elif kind in ("POINT", "SPOT"):
        ld.shadow_soft_size = size
        if kind == "SPOT":
            ld.spot_size = math.radians(spot)
            ld.spot_blend = blend
    elif kind == "SUN":
        ld.angle = math.radians(size)
    ob = D.objects.new(name, ld)
    _link(ob, coll)
    ob.location = loc
    if target is not None:
        aim(ob, target)
    else:
        ob.rotation_euler = [math.radians(a) for a in rot]
    return ob


def aim(ob, target, roll=0.0):
    d = Vector(target) - Vector(ob.location)
    q = d.to_track_quat("-Z", "Y")
    if roll:
        q = q @ Quaternion((0, 0, 1), math.radians(roll))
    ob.rotation_euler = q.to_euler()


# ------------------------------------------------------------------ keyframes
def key(ob, path, frame, value=None, interp="BEZIER", index=-1):
    if value is not None:
        tgt = ob
        attr = path
        if isinstance(value, (list, tuple)):
            setattr(tgt, attr, value)
        else:
            if index >= 0:
                getattr(tgt, attr)[index] = value
            else:
                setattr(tgt, attr, value)
    ob.keyframe_insert(path, frame=frame, index=index)
    set_interp(ob, path, frame, interp)


def set_interp(idb, path, frame, interp, ease=None):
    ad = idb.animation_data
    if not ad or not ad.action:
        return
    for fc in fcurves(ad.action):
        if fc.data_path == path:
            for kp in fc.keyframe_points:
                if abs(kp.co[0] - frame) < 0.01:
                    kp.interpolation = interp
                    if ease:
                        kp.easing = ease


def fcurves(action):
    """All fcurves of an action (handles layered actions in Blender 4.4+/5.x)."""
    out = []
    try:
        for layer in action.layers:
            for strip in layer.strips:
                for cb in strip.channelbags:
                    out.extend(cb.fcurves)
    except AttributeError:
        pass
    if not out:
        try:
            out = list(action.fcurves)
        except AttributeError:
            pass
    return out


def noise(ob, path, index, strength, scale=20, phase=None):
    """Add an F-curve noise modifier. Inserts a key first if the channel has no curve yet."""
    def find():
        ad = ob.animation_data
        if ad and ad.action:
            for fc in fcurves(ad.action):
                if fc.data_path == path and fc.array_index == index:
                    return fc
    fc = find()
    if fc is None:
        ob.keyframe_insert(path, index=index, frame=1)
        fc = find()
    if fc is None:
        return None
    md = fc.modifiers.new("NOISE")
    md.strength = strength
    md.scale = scale
    md.phase = phase if phase is not None else (hash(ob.name + str(index)) % 100)
    return md


# ------------------------------------------------------------------ camera
def fix_euler(ob):
    """Unwrap rotation_euler keys so interpolation never spins through 360 degrees."""
    ad = ob.animation_data
    if not ad or not ad.action:
        return
    for fc in fcurves(ad.action):
        if fc.data_path == "rotation_euler":
            prev = None
            for kp in fc.keyframe_points:
                if prev is not None:
                    d = 0.0
                    while kp.co[1] + d - prev > math.pi:
                        d -= 2 * math.pi
                    while kp.co[1] + d - prev < -math.pi:
                        d += 2 * math.pi
                    kp.co[1] += d
                    kp.handle_left[1] += d
                    kp.handle_right[1] += d
                prev = kp.co[1]
            fc.update()


class Cam:
    def __init__(self, name="Cam", lens=35, coll=None):
        cd = D.cameras.new(name)
        cd.lens = lens
        cd.sensor_fit = "VERTICAL"
        cd.sensor_height = 24
        cd.clip_start = 0.05
        cd.clip_end = 600
        self.ob = D.objects.new(name, cd)
        _link(self.ob, coll)
        bpy.context.scene.camera = self.ob
        self.cd = cd

    def key(self, t, loc, target, lens=None, roll=0.0, focus=None, fstop=None, interp="BEZIER", ease=None):
        """Keyframe at absolute time t (s). focus = world point or distance for DOF."""
        f = F(t) if isinstance(t, float) or isinstance(t, int) and not isinstance(t, bool) else t
        ob = self.ob
        ob.location = loc
        aim(ob, target, roll)
        ob.keyframe_insert("location", frame=f)
        ob.keyframe_insert("rotation_euler", frame=f)
        set_interp(ob, "location", f, interp, ease)
        set_interp(ob, "rotation_euler", f, interp, ease)
        if lens is not None:
            self.cd.lens = lens
            self.cd.keyframe_insert("lens", frame=f)
            set_interp(self.cd, "lens", f, interp, ease)
        if focus is not None:
            self.cd.dof.use_dof = True
            dist = focus if isinstance(focus, (int, float)) else (Vector(focus) - Vector(loc)).length
            self.cd.dof.focus_distance = dist
            self.cd.dof.keyframe_insert("focus_distance", frame=f)
            set_interp(self.cd, "dof.focus_distance", f, interp, ease)
        if fstop is not None:
            self.cd.dof.use_dof = True
            self.cd.dof.aperture_fstop = fstop
            self.cd.dof.keyframe_insert("aperture_fstop", frame=f)

    def shake(self, strength=0.03, scale=6):
        """Handheld feel: noise on rotation."""
        for i in range(3):
            noise(self.ob, "rotation_euler", i, strength * (0.5 if i == 1 else 1.0), scale)
        return self

    def euler_fix(self):
        """Make rotation keys continuous (avoid 360 flips)."""
        ad = self.ob.animation_data
        if not ad or not ad.action:
            return
        for fc in fcurves(ad.action):
            if fc.data_path == "rotation_euler":
                prev = None
                for kp in fc.keyframe_points:
                    if prev is not None:
                        while kp.co[1] - prev > math.pi:
                            kp.co[1] -= 2 * math.pi
                        while kp.co[1] - prev < -math.pi:
                            kp.co[1] += 2 * math.pi
                    prev = kp.co[1]
                fc.update()


# ------------------------------------------------------------------ sound cues (collected per build)
CUES = []


def sfx(t, name, vol=1.0, dur=None):
    """Register a sound cue at absolute time t (seconds). tools/build_cues.py collects them."""
    c = {"t": round(float(t), 3), "name": name, "vol": vol}
    if dur:
        c["dur"] = dur
    CUES.append(c)


# ------------------------------------------------------------------ camera moves
def orbit_pos(target, dist, yaw, pitch):
    """Point at distance from target. yaw 0 = in front of a character facing -Y (camera on -Y side),
    yaw 90 = camera on +X side; pitch > 0 = above."""
    y, p = math.radians(yaw), math.radians(pitch)
    return tuple(Vector(target) + dist * Vector((math.sin(y) * math.cos(p), -math.cos(y) * math.cos(p), math.sin(p))))


def _cam_push(self, t0, t1, target, d0, d1, yaw=0.0, pitch=8.0, lens=30, yaw1=None, pitch1=None, lens1=None,
              fstop=2.8, ease="EASE_IN_OUT", roll=0.0, look=None):
    """Dolly from d0 to d1 (push in if d1 < d0) around target, optional drift in yaw/pitch/lens."""
    yaw1 = yaw if yaw1 is None else yaw1; pitch1 = pitch if pitch1 is None else pitch1
    lens1 = lens if lens1 is None else lens1
    aimp = look or target
    self.key(t0, orbit_pos(target, d0, yaw, pitch), aimp, lens=lens, roll=roll, focus=target, fstop=fstop)
    self.key(t1, orbit_pos(target, d1, yaw1, pitch1), aimp, lens=lens1, roll=roll, focus=target, fstop=fstop, ease=ease)
    return self


def _cam_orbit(self, t0, t1, target, dist, yaw0, yaw1, pitch=8.0, lens=30, steps=4, fstop=2.8, pitch1=None):
    pitch1 = pitch if pitch1 is None else pitch1
    for i in range(steps + 1):
        k = i / steps; t = t0 + (t1 - t0) * k
        self.key(t, orbit_pos(target, dist, yaw0 + (yaw1 - yaw0) * k, pitch + (pitch1 - pitch) * k), target,
                 lens=lens, focus=target, fstop=fstop, interp="BEZIER" if i in (0, steps) else "LINEAR")
    return self


def _cam_crash(self, t, lens_from, lens_to, dur=0.12):
    """Crash zoom (lens punch) between existing position keys."""
    cd = self.cd
    cd.lens = lens_from; cd.keyframe_insert("lens", frame=F(t))
    cd.lens = lens_to; cd.keyframe_insert("lens", frame=F(t + dur))
    set_interp(cd, "lens", F(t), "BEZIER", "EASE_OUT")
    return self


def _cam_handheld(self, strength=1.0, loc=True):
    """Constant handheld drift so no frame is ever static."""
    for i in range(3):
        noise(self.ob, "rotation_euler", i, 0.006 * strength * (0.6 if i == 1 else 1.0), 14)
        if loc:
            noise(self.ob, "location", i, 0.03 * strength, 20)
    return self


def _cam_whip(self, t0, t1, loc0, aim0, loc1, aim1, lens=None, whoosh=True):
    """Fast whip pan between two framings (motion blur does the smear)."""
    self.key(t0, loc0, aim0, lens=lens, interp="BEZIER")
    self.key(t1, loc1, aim1, lens=lens, interp="BEZIER", ease="EASE_IN_OUT")
    if whoosh:
        sfx(t0 - 0.02, "whoosh", 0.8)
    return self


def _cam_track(self, ch, t0, t1, offset=(3.0, -6.0, 1.5), look_up=4.0, lens=26, step=0.25, fstop=4.0):
    """Follow a character's root (sampled from its keys) at a fixed offset."""
    root = ch.root
    t = t0
    while t <= t1 + 1e-6:
        bpy.context.scene.frame_set(F(t))
        p = Vector(root.matrix_world.translation)
        tgt = p + Vector((0, 0, look_up))
        self.key(t, tuple(p + Vector(offset)), tuple(tgt), lens=lens, focus=tuple(tgt), fstop=fstop, interp="LINEAR")
        t += step
    return self


Cam.push = _cam_push
Cam.orbit = _cam_orbit
Cam.crash = _cam_crash
Cam.handheld = _cam_handheld
Cam.whip = _cam_whip
Cam.track = _cam_track


def ensure_motion(cam_ob, t0, t1, min_move=0.05):
    """Guarantee: if the camera barely moves over the shot, add a slow push-in + handheld drift."""
    sc = bpy.context.scene
    sc.frame_set(F(t0)); a = Vector(cam_ob.matrix_world.translation); qa = cam_ob.matrix_world.to_quaternion()
    sc.frame_set(F(t1) - 1); b = Vector(cam_ob.matrix_world.translation); qb = cam_ob.matrix_world.to_quaternion()
    moved = (a - b).length + qa.rotation_difference(qb).angle * 5
    if moved < min_move:
        fwd = qa @ Vector((0, 0, -1))
        cam_ob.location = a; cam_ob.keyframe_insert("location", frame=F(t0))
        cam_ob.location = a + fwd * 0.6; cam_ob.keyframe_insert("location", frame=F(t1))
        cam_ob.rotation_euler = qa.to_euler(); cam_ob.keyframe_insert("rotation_euler", frame=F(t0))
        cam_ob.keyframe_insert("rotation_euler", frame=F(t1))
    has_noise = False
    ad = cam_ob.animation_data
    if ad and ad.action:
        has_noise = any(len(fc.modifiers) for fc in fcurves(ad.action))
    if not has_noise:
        for i in range(3):
            noise(cam_ob, "rotation_euler", i, 0.004 * (0.6 if i == 1 else 1.0), 14)
    return moved
