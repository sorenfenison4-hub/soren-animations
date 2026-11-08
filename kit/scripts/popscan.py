# python3 scripts/popscan.py video.mp4 - pop scan that knows the 8 Hz line boil: boil-step frames are compared with other boil-step frames,
# the rest with the rest; prints every frame whose change is > 2.2x its local median (each must be an intended swap or cut)
import subprocess, sys, numpy as np, cv2
W, H, FPS, RATE = 270, 480, 60, 8
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-vf", f"scale={W}:{H}", "-pix_fmt", "gray", "-f", "rawvideo", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
fr = np.stack([cv2.GaussianBlur(f, (5, 5), 0) for f in fr])
d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))   # d[i] = change from frame i to i+1
step = np.array([int((i + 1) * RATE / FPS + 1e-9) != int(i * RATE / FPS + 1e-9) for i in range(len(d))])
flags = []
for kind in (True, False):
    idx = np.nonzero(step == kind)[0]
    for j, i in enumerate(idx):
        nb = d[idx[max(0, j - 8): j + 9]]
        med = np.median(nb)
        if d[i] > 2.2 * med and d[i] > 0.6:
            flags.append((i + 1, d[i], med, 'boil-step' if kind else 'motion'))
for f, v, m, k in sorted(flags):
    print(f"  flag frame {f} ({f / FPS:.2f}s) {k}: diff {v:.2f} vs local median {m:.2f}")
print(len(flags), 'flags;', 'frames', len(fr))
