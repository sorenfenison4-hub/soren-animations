# Tighten a voice take for Shorts pacing: shortens every pause longer than KEEP to KEEP seconds and speeds the take up
# (pitch kept), then remaps Scribe word times so the T table still lines up.
#   python3 scripts/tighten.py <take.mp3> <out.mp3> [words.json] [--keep 0.26] [--tempo 1.06] [--voice-at 0.1]
# words.json = the connector's Scribe `words` list ([{"text":..,"start":..}, ...]); prints "word:video_time" pairs
# (video time = time in out.mp3 + voice-at). Then run check-hook.py on out.mp3. Example: videos/zebra (30.4 s -> 25.9 s).
import subprocess, sys, json, numpy as np
args = [a for a in sys.argv[1:] if not a.startswith('--')]
opt = {k: float(sys.argv[sys.argv.index(k) + 1]) for k in ('--keep', '--tempo', '--voice-at') if k in sys.argv}
args = [a for a in args if a not in [str(v) for v in opt.values()]]
src, out = args[0], args[1]
KEEP, TEMPO, AT = opt.get('--keep', 0.26), opt.get('--tempo', 1.06), opt.get('--voice-at', 0.1)
sr = 44100
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"], capture_output=True).stdout, np.int16).astype(np.float32)
hop = int(0.02 * sr); n = len(x) // hop
db = np.array([20 * np.log10(np.sqrt(np.mean((x[i*hop:(i+1)*hop] / 32768) ** 2)) + 1e-12) for i in range(n)])
pauses, i = [], 0
while i < n:
    if db[i] < -42:
        j = i
        while j < n and db[j] < -42: j += 1
        if i > 0 and j < n and (j - i) * 0.02 > KEEP + 0.04: pauses.append((i * 0.02, j * 0.02))
        i = j
    else: i += 1
cuts = [((a + b) / 2 - (b - a - KEEP) / 2, (a + b) / 2 + (b - a - KEEP) / 2) for a, b in pauses]
keep, prev = [], 0.0
for a, b in cuts: keep.append((prev, a)); prev = b
keep.append((prev, len(x) / sr))
fade, parts = int(0.01 * sr), []
for a, b in keep:
    seg = x[int(a * sr):int(b * sr)].copy(); k = min(fade, len(seg) // 2)
    if k: seg[:k] *= np.linspace(0, 1, k); seg[-k:] *= np.linspace(1, 0, k)
    parts.append(seg)
y = np.concatenate(parts).astype(np.int16)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(sr), "-ac", "1", "-i", "-", "-af", f"atempo={TEMPO}", "-b:a", "192k", out], input=y.tobytes())
remap = lambda t: (t - sum(min(b, max(a, t)) - a for a, b in cuts)) / TEMPO + AT
print(f"{len(x)/sr:.2f} s -> {(len(y)/sr)/TEMPO:.2f} s ({len(cuts)} pauses shortened to {KEEP} s, tempo {TEMPO})")
if len(args) > 2:
    words = json.load(open(args[2]))
    print(' '.join(f"{w['text'].strip('.,?')}:{remap(w['start']):.2f}" for w in words if w.get('type', 'word') == 'word'))
