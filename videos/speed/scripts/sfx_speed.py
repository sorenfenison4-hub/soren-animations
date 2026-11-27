# Synthesize the speed ladder Short's new sounds (48 kHz mono 16-bit): step, honk, jet, rustle, zip.
#   python3 scripts/sfx_speed.py public/library/sfx
import numpy as np, wave, sys
SR = 48000
out = sys.argv[1]
rng = np.random.default_rng(11)
def bandpass(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.clip((f - lo * 0.7) / (lo * 0.3 + 1e-9), 0, 1) * np.clip((hi * 1.3 - f) / (hi * 0.3), 0, 1)
    return np.fft.irfft(X * m, len(x))
def norm(y):
    return y / (np.max(np.abs(y)) + 1e-9)
def save(name, y, peak_db=-1.0):
    y = norm(y) * 10 ** (peak_db / 20)
    with wave.open(f"{out}/{name}", 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
    print(name, f"{len(y)/SR:.2f} s")

# step: one running footfall on dry dirt - a short low thump + a gritty scuff, onset at 0, 0.16 s
n = int(0.16 * SR); t = np.arange(n) / SR
thump = np.sin(2 * np.pi * (120 * t - 180 * t * t)) * np.exp(-t / 0.022)
scuff = bandpass(rng.standard_normal(n), 900, 5200) * np.exp(-t / 0.035) * (1 - np.exp(-t / 0.002))
save('step.wav', norm(thump) + 0.55 * norm(scuff))

# honk: a cartoon car horn, two notes a minor third apart played together, 0.5 s, loud from 0
n = int(0.5 * SR); t = np.arange(n) / SR
y = np.zeros(n)
for f0 in (415, 494):
    ph = 2 * np.pi * f0 * t + 0.6 * np.sin(2 * np.pi * 5.5 * t)
    y += np.tanh(2.2 * (np.sin(ph) + 0.45 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)))
env = np.minimum(1, t / 0.008) * np.minimum(1, (0.5 - t) / 0.05)
save('honk.wav', bandpass(y * env, 200, 4500), -2)

# jet: an airliner roaring past - broadband roar with a turbine whine that falls in pitch (Doppler), 2.6 s, swells to a peak at ~1.1 s
n = int(2.6 * SR); t = np.arange(n) / SR
peak = 1.1
dop = 1 + 0.18 * np.tanh((peak - t) / 0.35)                       # pitch factor: high while it comes, low as it goes
roar = bandpass(rng.standard_normal(n), 60, 2400)
hiss = bandpass(rng.standard_normal(n), 2500, 9000) * 0.35
whine = np.sin(2 * np.pi * np.cumsum(2100 * dop) / SR) * 0.18 + np.sin(2 * np.pi * np.cumsum(3200 * dop) / SR) * 0.08
amp = 1 / (1 + ((t - peak) / 0.42) ** 2)                            # distance swell
env = np.minimum(1, t / 0.05) * np.minimum(1, (2.6 - t) / 0.3)
save('jet.wav', (norm(roar) + norm(hiss) * 0.35 + whine) * amp * env, -1)

# rustle: a burst of leaves shaken off a tree, 0.9 s, loud from 0
n = int(0.9 * SR); t = np.arange(n) / SR
grains = (rng.random(n) < 0.012).astype(float)
grains = np.convolve(grains, np.exp(-np.arange(int(0.012 * SR)) / (0.002 * SR)), 'same')
leaf = bandpass(rng.standard_normal(n), 1500, 8000) * (0.4 + grains * 3)
body = bandpass(rng.standard_normal(n), 300, 1500) * 0.4
env = np.exp(-t / 0.28) * (1 - np.exp(-t / 0.004))
save('rustle.wav', (norm(leaf) + norm(body) * 0.4) * env, -2)

# zip: a quick rising "zip" - something tiny shooting off, 0.32 s
n = int(0.32 * SR); t = np.arange(n) / SR
f = 600 + 5200 * (t / 0.32) ** 1.6
tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.6
air = bandpass(rng.standard_normal(n), 2000, 9000) * 0.5
env = np.minimum(1, t / 0.01) * np.exp(-((t - 0.16) / 0.12) ** 2) * 1.2
save('zip.wav', (tone + norm(air) * 0.5) * env, -2)
