"""Per-video shot framework (runs inside Blender).
In videos/<slug>/shots.py:

    from shotkit import *
    V = Video(__file__)
    @V.shot(1, V.w(0), V.w(8), "Eddie sprinting, a runner glued to his back")
    def s01():
        ...build the set, characters, camera; sfx(t, "whoosh")...

Shot times come from the voice timing (audio/words.json), by SCRIPT WORD INDEX, so regenerating
the voice never breaks the edit. V.w(i) = start of word i, V.find("cliff") = index of a word.
The last shot should end at V.end (audio length)."""
import json, os, re, sys
import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
STUDIO = os.path.dirname(HERE)
if STUDIO not in sys.path:
    sys.path.insert(0, STUDIO)
import rbx
rbx.ASSETS = os.path.join(STUDIO, "assets")
from rbx.core import *          # noqa: F401,F403  (reset, setup_render, Cam, mat, box, light, sfx, ...)
from rbx import core, chars, sets, locs, fx, acting, world as W, world2 as W2   # noqa: F401
from rbx.core import CUES, fix_euler, ensure_motion

norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())


class Video:
    def __init__(self, shots_file):
        self.dir = os.path.dirname(os.path.abspath(shots_file))
        self.slug = os.path.basename(self.dir)
        wp = os.path.join(self.dir, "audio", "words.json")
        self.words = json.load(open(wp, encoding="utf-8")) if os.path.exists(wp) else []
        self.end = self.words[-1]["end"] + 0.25 if self.words else 60.0
        self.shots = {}
        self.exposure = {}
        ep = os.path.join(self.dir, "exposure.json")
        if os.path.exists(ep):
            self.exposure = json.load(open(ep))

    # --- timing
    def w(self, i):
        """Start time of script word i (first shot should use 0.0)."""
        return 0.0 if i <= 0 else self.words[i]["start"]

    def we(self, i):
        return self.words[i]["end"]

    def find(self, text, n=1, after=0):
        """Index of the n-th word matching text (normalised), searching from word index `after`."""
        k = 0
        for i in range(after, len(self.words)):
            if norm(self.words[i]["word"]) == norm(text):
                k += 1
                if k == n:
                    return i
        raise KeyError(f"word {text!r} #{n} not found after {after}")

    def t(self, text, n=1, after=0):
        return self.w(self.find(text, n, after))

    def span(self, t0, t1):
        return [w for w in self.words if t0 <= w["start"] < t1]

    # --- registry
    def shot(self, i, t0, t1, desc=""):
        def deco(fn):
            self.shots[i] = dict(id=i, t0=float(t0), t1=float(t1), fn=fn, desc=desc)
            return fn
        return deco

    def check(self):
        """Shots must tile the timeline with no gaps or overlaps."""
        ids = sorted(self.shots)
        problems = []
        prev = 0.0
        for i in ids:
            s = self.shots[i]
            if abs(s["t0"] - prev) > 1e-3:
                problems.append(f"shot {i} starts at {s['t0']:.3f}, previous ended {prev:.3f}")
            if s["t1"] <= s["t0"]:
                problems.append(f"shot {i} has no length")
            prev = s["t1"]
        if abs(prev - self.end) > 0.05:
            problems.append(f"last shot ends {prev:.3f}, audio ends {self.end:.3f}")
        return problems

    def build(self, i, samples=24, pct=100, look="AgX - Punchy"):
        S = self.shots[i]
        reset()
        CUES.clear()
        setup_render(F(S["t0"]), F(S["t1"]) - 1, samples=samples, pct=pct)
        S["fn"]()
        sc = bpy.context.scene
        if sc.camera:
            fix_euler(sc.camera)
            ensure_motion(sc.camera, S["t0"], S["t1"])
        sc.view_settings.exposure = float(self.exposure.get(str(i), 0.0))
        try:
            sc.view_settings.look = look
        except TypeError:
            pass
        sc.frame_set(F(S["t0"]))
        return S
