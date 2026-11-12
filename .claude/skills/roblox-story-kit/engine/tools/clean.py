"""Free disk space once a video is finished: deletes videos/<slug>/frames and blend (several GB),
keeps script, shots, audio, previews and out/. Refuses if out/final.mp4 is missing.
    python tools/clean.py <slug>"""
import os, shutil, sys

STUDIO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if len(sys.argv) < 2:
    sys.exit(__doc__)
vdir = os.path.join(STUDIO, "videos", sys.argv[1])
if not os.path.exists(os.path.join(vdir, "out", "final.mp4")):
    sys.exit("out/final.mp4 not found: finish the video first (frames are still needed).")
freed = 0
for d in ("frames", "blend"):
    p = os.path.join(vdir, d)
    if os.path.isdir(p):
        for root, _, files in os.walk(p):
            freed += sum(os.path.getsize(os.path.join(root, f)) for f in files)
        shutil.rmtree(p)
print(f"removed frames/ and blend/, freed {freed / 1e9:.1f} GB")
