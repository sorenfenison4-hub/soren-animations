# Synthesize the beaver Short's new sounds (48 kHz mono 16-bit): chomp (one crunchy bite, loud from 0 = a frame-0 hit),
# gnaw (1.6 s of fast wood gnawing), shing (0.6 s teeth shooting out), creak (0.7 s tree creak before it falls).
#   python3 scripts/sfx_beaver.py public/library/sfx
import numpy as np, wave, sys
SR = 48000
out = sys.argv[1]
rng = np.random.default_rng(7)
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.clip((f - lo * 0.7) / (lo * 0.3 + 1e-9), 0, 1) * np.clip((hi * 1.3 - f) / (hi * 0.3), 0, 1)
    return np.fft.irfft(X * m, len(x))
def save(name, y, peak_db=-1.0):
    y = y / (np.max(np.abs(y)) + 1e-9) * 10 ** (peak_db / 20)
    with wave.open(f"{out}/{name}", 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
    print(name, f"{len(y)/SR:.2f} s")
def bite(dur, seed, bright=1.0, thump=1.0):
    r = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR
    # crunch: dense clicks through a mid/high band with a fast decay
    clicks = np.zeros(n); idx = r.random(n) < 2600 / SR; clicks[idx] = r.choice([-1, 1], idx.sum()) * (0.3 + r.random(idx.sum()))
    k = np.exp(-np.arange(int(0.002 * SR)) / (0.0005 * SR)); cr = band(np.convolve(clicks, k)[:n], 900 * bright, 8000)
    rasp = band(r.standard_normal(n), 1200 * bright, 6000)
    body = np.sin(2 * np.pi * (140 - 60 * t / dur) * t) * np.exp(-t / 0.025) * thump      # the jaw's low thump
    env = np.minimum(1, t / 0.002) * np.exp(-t / (dur * 0.35))
    return (cr / (np.max(np.abs(cr)) + 1e-9) * 0.9 + rasp / (np.max(np.abs(rasp)) + 1e-9) * 0.35) * env + body * 0.8
save('chomp.wav', bite(0.22, 3), -1)
# gnaw: ~11 bites a second, each a small crunch, with a little variation (1.6 s)
n = int(1.6 * SR); y = np.zeros(n)
for i, t0 in enumerate(np.arange(0, 1.55, 1 / 11.0)):
    b = bite(0.09, 20 + i, 1.0 + 0.3 * rng.random(), 0.35) * (0.7 + 0.3 * rng.random())
    a = int((t0 + 0.01 * rng.random()) * SR); y[a:a + len(b)] += b[: n - a]
save('gnaw.wav', y, -2)
# shing: a bright rising sweep with a metallic shimmer (teeth shooting out), 0.6 s
n = int(0.6 * SR); t = np.arange(n) / SR
f = 600 + 2600 * (1 - np.exp(-t / 0.12))
ph = 2 * np.pi * np.cumsum(f) / SR
y = (np.sin(ph) + 0.5 * np.sin(2.01 * ph) + 0.25 * np.sin(3.03 * ph)) * np.minimum(1, t / 0.01) * np.exp(-t / 0.22)
y += band(rng.standard_normal(n), 3000, 11000) * np.exp(-t / 0.1) * 0.25
save('shing.wav', y, -3)
# creak: a slow wooden creak - a low buzzy tone that bends up, rough amplitude (0.7 s)
n = int(0.7 * SR); t = np.arange(n) / SR
f = 95 + 60 * (t / 0.7) ** 1.5 + 6 * np.sin(2 * np.pi * 7 * t)
ph = 2 * np.pi * np.cumsum(f) / SR
saw = 2 * ((ph / (2 * np.pi)) % 1) - 1
grain = 0.6 + 0.4 * np.abs(band(rng.standard_normal(n), 20, 60)) / 0.05
y = band(saw * np.clip(grain, 0, 2), 150, 2400) * np.minimum(1, t / 0.05) * np.minimum(1, (0.7 - t) / 0.12)
save('creak.wav', y, -3)
