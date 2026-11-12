"""Speed an already-processed voice (voice.wav + words.json + sentences.json) by a further factor,
scaling every timestamp exactly. Use it to hit the target words-per-minute without re-running whisper.
python tools/retempo.py <slug> <factor>        e.g. 1.06
python tools/retempo.py <slug> --wpm 258       computes the factor from the current wpm"""
import json, os, subprocess, sys

STUDIO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
slug = sys.argv[1]
adir = os.path.join(STUDIO, "videos", slug, "audio")
words = json.load(open(os.path.join(adir, "words.json"), encoding="utf-8"))
dur = words[-1]["end"]
wpm = len(words) / dur * 60
f = (float(sys.argv[3]) / wpm) if sys.argv[2] == "--wpm" else float(sys.argv[2])
src, tmp = os.path.join(adir, "voice.wav"), os.path.join(adir, "voice_tmp.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", f"atempo={f:.5f}", "-ar", "48000", "-ac", "1", tmp], check=True)
os.replace(tmp, src)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-c:a", "aac", "-b:a", "192k", os.path.join(adir, "voice.m4a")], check=True)
for w in words:
    w["start"] = round(w["start"] / f, 3); w["end"] = round(w["end"] / f, 3)
json.dump(words, open(os.path.join(adir, "words.json"), "w", encoding="utf-8"), indent=0, ensure_ascii=False)
sp = os.path.join(adir, "sentences.json")
if os.path.exists(sp):
    S = json.load(open(sp, encoding="utf-8"))
    for s in S:
        s["start"] = round(s["start"] / f, 3); s["end"] = round(s["end"] / f, 3)
        s["startFrame"] = int(round(s["start"] * 30)); s["endFrame"] = int(round(s["end"] * 30))
    json.dump(S, open(sp, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
log = os.path.join(adir, "tempo_log.txt")
open(log, "a").write(f"retempo x{f:.4f}: {wpm:.1f} wpm -> {wpm * f:.1f} wpm, {dur:.2f}s -> {dur / f:.2f}s\n")
print(f"x{f:.4f}: {wpm:.1f} -> {wpm * f:.1f} wpm, {dur:.2f}s -> {dur / f:.2f}s")
