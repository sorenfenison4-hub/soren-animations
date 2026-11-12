"""Shorten any gap between words that is longer than --max-gap (default 0.45s) by cutting the excess out
of the middle of the gap (short crossfade), and shift every later timestamp to match.
Catches breaths / dramatic pauses that the silence cutter keeps because they are not fully silent.
python tools/tighten.py <slug> [--max-gap 0.45]"""
import argparse, json, os, subprocess, wave
import numpy as np

STUDIO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument("slug")
ap.add_argument("--max-gap", type=float, default=0.45)
o = ap.parse_args()
adir = os.path.join(STUDIO, "videos", o.slug, "audio")
src = os.path.join(adir, "voice.wav")
with wave.open(src) as w:
    sr, ch, n = w.getframerate(), w.getnchannels(), w.getnframes()
    x = np.frombuffer(w.readframes(n), "<i2").astype(np.float64).reshape(-1, ch)
words = json.load(open(os.path.join(adir, "words.json"), encoding="utf-8"))
cuts = []
for i in range(len(words) - 1):
    a, b = words[i]["end"], words[i + 1]["start"]
    g = b - a
    if g > o.max_gap:
        excess = g - o.max_gap
        mid = (a + b) / 2
        cuts.append((mid - excess / 2, mid + excess / 2))
if not cuts:
    print("no gaps over", o.max_gap)
    raise SystemExit
xf = int(0.012 * sr)
pieces, last = [], 0
for c0, c1 in cuts:
    s0, s1 = int(c0 * sr), int(c1 * sr)
    pieces.append((last, s0))
    last = s1
pieces.append((last, len(x)))
out = x[pieces[0][0]:pieces[0][1]]
for p0, p1 in pieces[1:]:
    seg = x[p0:p1]
    k = min(xf, len(out), len(seg))
    ramp = np.linspace(0, 1, k)[:, None]
    out = np.concatenate([out[:-k], out[-k:] * (1 - ramp) + seg[:k] * ramp, seg[k:]])


def shift(t):
    d = 0.0
    for c0, c1 in cuts:
        if t >= c1:
            d += c1 - c0
        elif t > c0:
            d += t - c0
    return round(t - d, 3)


for w_ in words:
    w_["start"], w_["end"] = shift(w_["start"]), shift(w_["end"])
json.dump(words, open(os.path.join(adir, "words.json"), "w", encoding="utf-8"), indent=0, ensure_ascii=False)
sp = os.path.join(adir, "sentences.json")
if os.path.exists(sp):
    S = json.load(open(sp, encoding="utf-8"))
    for s in S:
        s["start"], s["end"] = shift(s["start"]), shift(s["end"])
        s["startFrame"], s["endFrame"] = int(round(s["start"] * 30)), int(round(s["end"] * 30))
    json.dump(S, open(sp, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
with wave.open(src, "wb") as w:
    w.setnchannels(ch); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes(np.clip(out, -32768, 32767).astype("<i2").tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-c:a", "aac", "-b:a", "192k", os.path.join(adir, "voice.m4a")], check=True)
removed = sum(c1 - c0 for c0, c1 in cuts)
open(os.path.join(adir, "tempo_log.txt"), "a").write(f"tighten: {len(cuts)} gaps over {o.max_gap}s, removed {removed:.2f}s\n")
print(f"tightened {len(cuts)} gaps, removed {removed:.2f}s, voice now {len(out) / sr:.2f}s")
