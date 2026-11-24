#!/usr/bin/env python3
"""Trim + measure new guy poses into the library (run from kit/images):
    python3 prep_poses.py run jump fall ...
    python3 prep_poses.py --measure-only run jump ...   (re-measure the trimmed library PNGs, no re-trim)
raw/<name>.png (4K Higgsfield cut-out) -> ../public/library/char/<name>.png (alpha box + 12 px, stray specks under
1000 px removed) and an entry in ../src/lib/library.json ({w, h, head: [x, y, r], feet: [x, y]}, the same format as
the first 16 poses; entries for other poses are left alone).
HEAD = circle fitted (RANSAC, radius 330-760 px) to the silhouette's outer outline: the head is a near-perfect circle
and the longest round arc of this character. (The first 16 poses used the largest inscribed disc; on poses with raised
arms or a lean that disc slips down into the shoulders, so the new poses use the outline fit. The drawn heads are a
little oval and the disc reads the narrow side: over the first 16 poses the fit is 1.027x the disc (median), so the
stored radius is fit / 1.027 - the same scale as the old poses, and a pose swap never changes the head size.)
FEET = (centroid x of the bottom 45 % of the silhouette, the lowest row): under the body for standing, running,
jumping and lying poses alike (Guy stands the pose on this point).
Writes qa/measure-<first name>.png with the head circle and the feet dot drawn on every pose.
"""
import json, os, sys, numpy as np, cv2
from PIL import Image, ImageDraw

measure_only = sys.argv[1:2] == ['--measure-only']
names = sys.argv[2:] if measure_only else sys.argv[1:]
LIB = '../src/lib/library.json'
OUT = '../public/library/char'
lib = json.load(open(LIB))


def trim(name):
    arr = np.array(Image.open(f'raw/{name}.png').convert('RGBA'))
    k, lab, st, _ = cv2.connectedComponentsWithStats((arr[:, :, 3] > 8).astype(np.uint8), connectivity=8)
    for i in range(1, k):   # stray specks (a dot beside arms_crossed); tear and sweat drops are far bigger
        if st[i, cv2.CC_STAT_AREA] < 1000:
            arr[lab == i, 3] = 0
    ys, xs = np.nonzero(arr[:, :, 3] > 8)
    im = Image.fromarray(arr).crop((max(0, xs.min() - 12), max(0, ys.min() - 12),
                                    min(arr.shape[1], xs.max() + 13), min(arr.shape[0], ys.max() + 13)))
    im.save(f'{OUT}/{name}.png', optimize=True)
    return im


def head_circle(a8, iters=6000, tol=6.0, rmin=330, rmax=760):
    cs, _ = cv2.findContours(a8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    P = max(cs, key=len)[:, 0, :].astype(np.float64)
    rng = np.random.default_rng(7); best = (0, None)
    for _ in range(iters):
        p1, p2, p3 = P[rng.choice(len(P), 3, replace=False)]
        A = np.array([[p2[0] - p1[0], p2[1] - p1[1]], [p3[0] - p1[0], p3[1] - p1[1]]]) * 2
        if abs(np.linalg.det(A)) < 1e-6:
            continue
        b = np.array([p2 @ p2 - p1 @ p1, p3 @ p3 - p1 @ p1])
        c = np.linalg.solve(A, b); r = np.linalg.norm(p1 - c)
        if not rmin < r < rmax:
            continue
        n = int((np.abs(np.linalg.norm(P - c, axis=1) - r) < tol).sum())
        if n > best[0]:
            best = (n, (c, r))
    c, r = best[1]
    for _ in range(3):   # least-squares refine on the inliers
        Q = P[np.abs(np.linalg.norm(P - c, axis=1) - r) < tol]
        M = np.c_[2 * Q, np.ones(len(Q))]; sol = np.linalg.lstsq(M, (Q ** 2).sum(1), rcond=None)[0]
        c = sol[:2]; r = np.sqrt(sol[2] + c @ c)
    return c[0], c[1], r / OLD_SCALE


OLD_SCALE = 1.027   # median (outline fit / inscribed disc) radius over the first 16 poses
for name in names:
    im = Image.open(f'{OUT}/{name}.png').convert('RGBA') if measure_only else trim(name)
    a8 = (np.array(im)[:, :, 3] > 128).astype(np.uint8); h, w = a8.shape
    hx, hy, hr = head_circle(a8)
    ly, lx = np.nonzero(a8[int(h * 0.55):])
    lib[name] = {'w': w, 'h': h, 'head': [int(round(hx)), int(round(hy)), round(float(hr), 1)],
                 'feet': [round(float(lx.mean()), 1), h - 14]}
    print(name, lib[name])
json.dump(lib, open(LIB, 'w'), indent=0)   # the file's own format (one value per line)

cells = []
for n in names:
    m = lib[n]
    im = Image.open(f'{OUT}/{n}.png').convert('RGBA'); bg = Image.new('RGBA', im.size, (255, 122, 170, 255)); bg.alpha_composite(im)
    d = ImageDraw.Draw(bg); hx, hy, r = m['head']; d.ellipse([hx - r, hy - r, hx + r, hy + r], outline=(0, 90, 255), width=10)
    fx, fy = m['feet']; d.ellipse([fx - 24, fy - 24, fx + 24, fy + 24], fill=(0, 90, 255))
    s = 380 / bg.height; cells.append((n, bg.convert('RGB').resize((max(1, int(bg.width * s)), 380))))
per_row = 7
rows = [cells[i:i + per_row] for i in range(0, len(cells), per_row)]
W = max(sum(c[1].width + 12 for c in r) for r in rows)
sheet = Image.new('RGB', (W, 410 * len(rows)), 'white')
for ri, r in enumerate(rows):
    x = 0
    for n, c in r:
        sheet.paste(c, (x, ri * 410)); ImageDraw.Draw(sheet).text((x + 4, ri * 410 + 386), n, fill=(0, 0, 0)); x += c.width + 12
os.makedirs('qa', exist_ok=True)
sheet.save(f'qa/measure-{names[0]}.png'); print('sheet', sheet.size)
