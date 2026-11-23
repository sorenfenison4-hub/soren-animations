# Voice splice for Shorts pacing (generic version of videos/starfish/scripts/splice.py): cut a take into segments, speed
# each one up on its own (pitch kept), put a set silence after each, and remap the Scribe word times to video time.
#   python3 scripts/vsplice.py <take.mp3> <out.mp3> <words-take.json> <words.json> "a,b,tempo,gap; a,b,tempo,gap; ..."
# a, b = segment start / end in take seconds (cut inside the pauses pauses.py prints); tempo = atempo factor (line 1 often
# 1.22 so the catch lands by ~2.5 s, the rest 1.12); gap = silence after the segment in output seconds.
# words.json = [{"w", "s", "e"}] in video time (voice placed at 0.1 s), as the kit's Captions and the T tables use.
import subprocess, sys, json, numpy as np
src, out, wfile, jout, spec = sys.argv[1:6]
SEGS = [tuple(float(v) for v in s.split(',')) for s in spec.split(';') if s.strip()]
sr, AT = 44100, 0.1
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"], capture_output=True).stdout, np.int16).astype(np.float32)
def tempo(seg, k):
    r = subprocess.run(["ffmpeg", "-v", "error", "-f", "s16le", "-ar", str(sr), "-ac", "1", "-i", "-", "-af", f"atempo={k}", "-f", "s16le", "-"],
                       input=seg.astype(np.int16).tobytes(), capture_output=True)
    return np.frombuffer(r.stdout, np.int16).astype(np.float32)
parts, t0, maps, fade = [], 0.0, [], int(0.012 * sr)
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
d = json.load(open(wfile)); words = d['words'] if isinstance(d, dict) else d
words = [w for w in words if w.get('type', 'word') == 'word']
print(f"{len(x)/sr:.2f} s -> {len(yy)/sr:.2f} s (speech ends {remap(words[-1]['end']):.2f} s video time)")
print(' '.join(f"{w['text'].strip('.,?')}:{remap(w['start']):.2f}" for w in words))
json.dump([{'w': w['text'], 's': round(remap(w['start']), 3), 'e': round(remap(w['end']), 3)} for w in words], open(jout, 'w'), indent=0)
