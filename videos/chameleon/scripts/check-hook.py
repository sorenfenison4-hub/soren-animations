# Checks the hook timing of the voice: when the first word is heard in the video.
# Run inside a video folder:  python3 scripts/check-hook.py public/<short>/vo/take1.mp3 [voiceAt=0.1] [--trim]
# The first word must start by 0.2 s (voiceAt + the silence at the start of the take). Even 0.3 s of silence at the
# start makes people swipe. --trim cuts the take's leading silence down to 0.02 s (writes <name>-trim.mp3 next to it;
# point SoundLayer at that file and shift the T table earlier by the printed amount).
import subprocess, sys, numpy as np

args = [a for a in sys.argv[1:] if not a.startswith('--')]
path, voice_at = args[0], float(args[1]) if len(args) > 1 else 0.1
sr = 16000
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
hop = int(0.01 * sr)
db = np.array([20 * np.log10(np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2) + 1e-12)) for i in range(len(x) // hop)])
loud = np.nonzero(db > -38)[0]
lead = loud[0] * 0.01 if len(loud) else 0.0
first = voice_at + lead
ok = first <= 0.2
print(f"silence at the start of the take: {lead:.2f} s -> first word at {first:.2f} s in the video -> {'hook OK' if ok else 'TOO LATE (must be <= 0.20 s)'}")
if '--trim' in sys.argv and lead > 0.02:
    out = path.rsplit('.', 1)[0] + '-trim.mp3'
    cut = lead - 0.02
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{cut:.3f}", "-i", path, "-c:a", "libmp3lame", "-q:a", "2", out], check=True)
    print(f"wrote {out} (cut {cut:.2f} s): move every T time {cut:.2f} s earlier")
    ok = voice_at + 0.02 <= 0.2
if not ok:
    sys.exit(1)
