import subprocess, numpy as np, sys
sr = 16000
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
hop = int(0.02 * sr)
n = len(x) // hop
rms = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2) + 1e-12) for i in range(n)])
db = 20 * np.log10(rms)
np.save("work/rms_db.npy", db)
sil = db < -42
# runs of silence >= 0.18 s
runs, i = [], 0
while i < n:
    if sil[i]:
        j = i
        while j < n and sil[j]: j += 1
        if (j - i) * 0.02 >= 0.18 or i == 0 or j == n: runs.append((i * 0.02, j * 0.02))
        i = j
    else: i += 1
print("dur", len(x) / sr, "peak dBFS", 20 * np.log10(np.abs(x).max()))
print("speech chunks (between pauses):")
prev = 0.0
for a, b in runs:
    if a > prev: print(f"  speech {prev:6.2f} -> {a:6.2f}")
    print(f"  pause  {a:6.2f} -> {b:6.2f}  ({b-a:.2f}s)")
    prev = b
if prev < n * 0.02: print(f"  speech {prev:6.2f} -> {n*0.02:6.2f}")
