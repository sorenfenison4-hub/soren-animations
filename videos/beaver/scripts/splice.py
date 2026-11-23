# Starfish voice: line 1 sped up on its own (no pause cut), the rest with sentence pauses shortened, then spliced.
#   python3 scripts/splice.py public/starfish/vo/take1.mp3 public/starfish/vo/tight.mp3 public/starfish/vo/words-take.json src/data/words.json
# Segments are given in take seconds: (start, end, tempo); gaps = silence inserted after each segment (s, output time).
import subprocess, sys, json, numpy as np
src, out, wfile, jout = sys.argv[1:5]
sr = 44100
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"], capture_output=True).stdout, np.int16).astype(np.float32)
# (take start, take end, tempo, silence after in output seconds)
SEGS = [(0.04, 3.82, 1.22, 0.24),    # Clone yourself like a starfish, and you'd have to rip yourself in half.
        (4.46, 6.94, 1.12, 0.24),    # Some starfish really pull themselves apart.
        (7.56, 10.42, 1.12, 0.24),   # Each half grows back its missing arms in about a month.
        (11.02, 14.56, 1.12, 0.50),  # You'd spend that month with one eye, one arm and one leg.   (a beat for the high five)
        (15.22, 17.60, 1.12, 0.0)]   # And now his clone wants a clone.
AT = 0.1
def tempo(seg, k):
    r = subprocess.run(["ffmpeg", "-v", "error", "-f", "s16le", "-ar", str(sr), "-ac", "1", "-i", "-", "-af", f"atempo={k}", "-f", "s16le", "-"],
                       input=seg.astype(np.int16).tobytes(), capture_output=True)
    return np.frombuffer(r.stdout, np.int16).astype(np.float32)
parts, t0, maps = [], 0.0, []
fade = int(0.012 * sr)
for a, b, k, gap in SEGS:
    seg = x[int(a * sr):int(b * sr)].copy()
    seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
    y = tempo(seg, k)
    maps.append((a, b, k, t0))
    parts.append(y); parts.append(np.zeros(int(gap * sr), np.float32))
    t0 += len(y) / sr + gap
yy = np.concatenate(parts)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(sr), "-ac", "1", "-i", "-", "-b:a", "192k", out], input=yy.astype(np.int16).tobytes())
def remap(t):
    for a, b, k, o in maps:
        if t <= b + 0.3: return o + (max(t, a) - a) / k + AT
    a, b, k, o = maps[-1]; return o + (t - a) / k + AT
words = json.load(open(wfile))
print(f"{len(x)/sr:.2f} s -> {len(yy)/sr:.2f} s")
print(' '.join(f"{w['text'].strip('.,?')}:{remap(w['start']):.2f}" for w in words))
json.dump([{'w': w['text'], 's': round(remap(w['start']), 3), 'e': round(remap(w['end']), 3)} for w in words], open(jout, 'w'), indent=0)
