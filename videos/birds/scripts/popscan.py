# python3 work/popscan.py video.mp4  - mean frame-to-frame difference (blurred, 270x480 grey), flags > 2.2x local median
import subprocess, sys, numpy as np, cv2
W, H = 270, 480
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-vf", f"scale={W}:{H}", "-pix_fmt", "gray", "-f", "rawvideo", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
fr = np.stack([cv2.GaussianBlur(f, (0, 0), 2) for f in fr])
d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))
print(f"{len(fr)} frames, median diff {np.median(d):.3f}")
for i in range(len(d)):
    lo, hi = max(0, i - 15), min(len(d), i + 16)
    med = np.median(np.r_[d[lo:i], d[i + 1:hi]])
    if d[i] > 2.2 * max(med, 0.05) and d[i] > 0.6:
        print(f"  flag frame {i + 1} ({(i + 1) / 60:.2f}s): diff {d[i]:.2f} vs local median {med:.2f}")
