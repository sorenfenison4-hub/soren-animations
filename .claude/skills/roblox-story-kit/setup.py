"""One-time setup for the Roblox story kit. Safe to re-run any time.

    python setup.py [workspace] [--update] [--no-pip] [--no-music] [--no-test]

workspace   where videos are made (default: ~/RobloxStories)
--update    refresh the engine code in an existing workspace (videos, config, music untouched)

Steps: copy the engine into the workspace, make a private Python env (.venv) with numpy, Pillow,
faster-whisper and yt-dlp, find ffmpeg and Blender, write config.json, download the music,
render one test frame. Prints READY at the end, or what is missing and how to fix it."""
import json, os, platform, shutil, subprocess, sys, time, venv

KIT = os.path.dirname(os.path.abspath(__file__))
ENGINE = os.path.join(KIT, "engine")
POINTER = os.path.join(os.path.expanduser("~"), ".roblox-story-kit.json")
CODE = ["rbx", "tools", "assets", "sfx", "PLAYBOOK.md"]
DEPS = ["numpy", "pillow", "faster-whisper", "yt-dlp"]
SYSTEM = platform.system()
AUDIO_EXT = (".mp3", ".wav", ".m4a", ".mp4", ".aac", ".ogg", ".flac", ".webm", ".opus")

args = [a for a in sys.argv[1:] if not a.startswith("--")]
flags = {a for a in sys.argv[1:] if a.startswith("--")}
problems = []


def say(ok, what, fix=""):
    tag = {True: "  ok  ", False: "MISSING", None: " note "}[ok]
    print(f"[{tag}] {what}")
    if fix:
        print(f"          fix: {fix}")
    if ok is False:
        problems.append(what)


def install_hint(tool):
    if tool == "ffmpeg":
        return {"Windows": "winget install --id Gyan.FFmpeg -e   (then open a new terminal)",
                "Darwin": "brew install ffmpeg"}.get(SYSTEM, "sudo apt install ffmpeg")
    return {"Windows": "winget install --id BlenderFoundation.Blender -e   (or download from blender.org)",
            "Darwin": "brew install --cask blender   (or download from blender.org)"}.get(
        SYSTEM, "download Blender 5.2+ from blender.org and put its folder in ~/blender")


# ---- 1. python --------------------------------------------------------------------------
print(f"Roblox story kit setup ({SYSTEM}, python {sys.version.split()[0]})")
if sys.version_info < (3, 9):
    say(False, f"python 3.9 or newer is needed (this is {sys.version.split()[0]})",
        "install Python 3.12 from python.org, then run setup.py with it")
    sys.exit(1)

# ---- 2. workspace -------------------------------------------------------------------------
old = {}
if os.path.exists(POINTER):
    try:
        old = json.load(open(POINTER, encoding="utf-8"))
    except Exception:
        old = {}
ws = os.path.abspath(os.path.expanduser(args[0] if args else old.get("workspace") or "~/RobloxStories"))
fresh = not os.path.exists(os.path.join(ws, "tools", "render.py"))
os.makedirs(ws, exist_ok=True)
if fresh or "--update" in flags:
    for name in CODE:
        src, dst = os.path.join(ENGINE, name), os.path.join(ws, name)
        if os.path.isdir(src):
            if name == "sfx" and os.path.isdir(dst):          # keep sounds the user made, refresh ours
                shutil.copytree(src, dst, dirs_exist_ok=True)
            else:
                if os.path.isdir(dst) and name in ("rbx", "tools"):
                    shutil.rmtree(dst)
                shutil.copytree(src, dst, dirs_exist_ok=True, ignore=shutil.ignore_patterns("__pycache__"))
        else:
            shutil.copy2(src, dst)
for d in ("videos", "music"):
    os.makedirs(os.path.join(ws, d), exist_ok=True)
for slug in os.listdir(os.path.join(ENGINE, "videos")):                 # worked examples
    dst = os.path.join(ws, "videos", slug)
    if not os.path.exists(dst):
        shutil.copytree(os.path.join(ENGINE, "videos", slug), dst)
envf = os.path.join(ws, ".env")
if not os.path.exists(envf):
    open(envf, "w", encoding="utf-8").write(
        "# ElevenLabs API key (only needed if you don't use the ElevenLabs connector in Claude).\n"
        "# Remove the # and paste your key after the = sign. Keep this file private.\n"
        "# ELEVENLABS_API_KEY=\n")
say(True, f"workspace: {ws}" + (" (new)" if fresh else (" (engine updated)" if "--update" in flags else "")))

# ---- 3. private python env ---------------------------------------------------------------
vdir = os.path.join(ws, ".venv")
py = os.path.join(vdir, "Scripts", "python.exe") if SYSTEM == "Windows" else os.path.join(vdir, "bin", "python")
if not os.path.exists(py):
    print("          creating .venv ...")
    venv.create(vdir, with_pip=True)
if "--no-pip" not in flags:
    print("          installing " + ", ".join(DEPS) + " (first time takes a few minutes) ...")
    r = subprocess.run([py, "-m", "pip", "install", "--disable-pip-version-check", "-q"] + DEPS,
                       capture_output=True, text=True)
    if r.returncode:
        print(r.stdout[-1500:], r.stderr[-1500:])
r = subprocess.run([py, "-c", "import numpy, PIL, faster_whisper, yt_dlp"], capture_output=True, text=True)
say(r.returncode == 0, f"python packages in {vdir}",
    "" if r.returncode == 0 else f'"{py}" -m pip install ' + " ".join(DEPS))
deps_ok = r.returncode == 0

# ---- 4. ffmpeg ----------------------------------------------------------------------------
ff = shutil.which("ffmpeg") and shutil.which("ffprobe")
say(bool(ff), "ffmpeg + ffprobe" + (f" ({shutil.which('ffmpeg')})" if ff else ""), "" if ff else install_hint("ffmpeg"))

# ---- 5. Blender + config ------------------------------------------------------------------
sys.path.insert(0, os.path.join(ws, "tools"))
import kit  # noqa: E402

cfgp = os.path.join(ws, "config.json")
c = json.load(open(cfgp, encoding="utf-8")) if os.path.exists(cfgp) else {}
b = c.get("blender") if c.get("blender") and os.path.isfile(c.get("blender", "")) else None
b = b or (kit.blender_candidates() or [None])[0]
ver = kit.blender_version(b) if b else None
if b and ver and ver[0] >= 5:
    say(True, f"Blender {'.'.join(map(str, ver))} ({b})")
    if ver < (5, 2):
        say(None, "the kit was built on Blender 5.2; older 5.x should work, update if something looks off")
    c["blender"] = b
elif b and ver:
    say(False, f"Blender {'.'.join(map(str, ver))} is too old (needs 5.x)", install_hint("blender"))
else:
    say(False, "Blender 5.x", install_hint("blender") + '   or put its path in config.json as "blender"')
for k in ("voice_id", "tts_model", "music_mode", "music_speed"):
    c.setdefault(k, kit.DEFAULTS[k])
json.dump(c, open(cfgp, "w", encoding="utf-8"), indent=2)
blender_ok = bool(b and ver and ver[0] >= 5)

# ---- 6. music -----------------------------------------------------------------------------
mdir = os.path.join(ws, "music")
have = [f for f in os.listdir(mdir) if f.lower().endswith(AUDIO_EXT)]
if not have and "--no-music" not in flags and ff and deps_ok:
    print("          downloading the music bed ...")
    subprocess.run([py, "-m", "yt_dlp", "--no-playlist", "-q", "--no-warnings", "-f", "bestaudio", "-x",
                    "--audio-format", "m4a", "-o", os.path.join(mdir, "music.%(ext)s"),
                    kit.DEFAULTS["music_url"]], capture_output=True, text=True)
    have = [f for f in os.listdir(mdir) if f.lower().endswith(AUDIO_EXT)]
if have:
    say(True, f"music: {have[0]} (sped up 1.5x, same pitch, on every video)")
else:
    say(None, "no music yet: videos will finish without it",
        f"put any audio file in {mdir} (the house track is TEMPOREX - Numbers)")

# ---- 7. ElevenLabs --------------------------------------------------------------------------
if kit.api_key():
    say(True, "ElevenLabs API key found in .env (run tools/eleven.py check to test it)")
else:
    say(None, "no ElevenLabs API key: fine if you use the ElevenLabs connector in Claude",
        f"otherwise paste ELEVENLABS_API_KEY=your_key into {envf}")

# ---- 8. test render -----------------------------------------------------------------------
if blender_ok and "--no-test" not in flags:
    print("          test render (one preview frame of the example video) ...")
    out = os.path.join(ws, "videos", "sneeze_teleport", "preview", "shot_01.png")
    t0 = time.time()
    r = subprocess.run([py, os.path.join(ws, "tools", "blend.py"), "sneeze_teleport", "preview", "1"],
                       cwd=ws, capture_output=True, text=True, encoding="utf-8", errors="replace")
    good = os.path.exists(out) and os.path.getmtime(out) >= t0 - 1
    say(good, f"test render ({time.time() - t0:.0f}s)" + (f": {out}" if good else ""),
        "" if good else "Blender failed, last lines:\n" + "\n".join(r.stdout.strip().splitlines()[-12:]))

# ---- done ---------------------------------------------------------------------------------
json.dump({"workspace": ws, "python": py, "kit": KIT}, open(POINTER, "w", encoding="utf-8"), indent=2)
print()
print(f"workspace: {ws}")
print(f"python:    {py}")
if problems:
    print("NOT READY: " + "; ".join(problems))
    sys.exit(1)
print("READY")
