"""rbx: procedural Roblox-style story animation toolkit for Blender (bpy).
Modules: core (scene, materials, primitives, camera), chars (blocky rigs + face atlases),
sets (rooms / locations), fx (fire, embers, smoke, flashes)."""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # .../studio
ASSETS = os.path.join(ROOT, "assets")
FPS = 30
