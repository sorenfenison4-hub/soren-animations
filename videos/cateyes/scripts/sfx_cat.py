# Synthesize the cat-eyes Short's new sounds (48 kHz mono 16-bit, same conventions as videos/beaver/scripts/sfx_beaver.py):
#   shutter.wav - a phone-camera snap: two quick mechanical clicks + a short bright flash ping (0.45 s, loud from 0)
#   brush.wav   - toothbrushing: fast back-and-forth bristle scrubs, about 7 strokes a second (1.4 s)
#   python3 scripts/sfx_cat.py public/library/sfx      (then copy into kit/audio/raw/sfx and run kit/audio/prep_sfx.py)
import numpy as np, wave, sys
SR = 48000
out = sys.argv[1]
rng = np.random.default_rng(11)
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.clip((f - lo * 0.7) / (lo * 0.3 + 1e-9), 0, 1) * np.clip((hi * 1.3 - f) / (hi * 0.3), 0, 1)
    return np.fft.irfft(X * m, len(x))
def save(name, y, peak_db=-1.0):
    y = y / (np.max(np.abs(y)) + 1e-9) * 10 ** (peak_db / 20)
    with wave.open(f"{out}/{name}", 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
    print(name, f"{len(y)/SR:.2f} s")
def click(dur, seed, lo=1500, hi=9000, body=0.0, bf=320):
    r = np.random.default_rng(seed); n = int(dur * SR); t = np.arange(n) / SR
    y = band(r.standard_normal(n), lo, hi) * np.exp(-t / (dur * 0.18))
    y = y / (np.max(np.abs(y)) + 1e-9)
    if body: y += body * np.sin(2 * np.pi * bf * t) * np.exp(-t / 0.012)
    return y * np.minimum(1, t / 0.0008)
# shutter: click (0) - clack (0.07) - flash ping (rising whine that fades, from 0.02)
n = int(0.45 * SR); t = np.arange(n) / SR; y = np.zeros(n)
c1 = click(0.05, 1, 1800, 10000, 0.5, 420); y[:len(c1)] += c1
c2 = click(0.06, 2, 1200, 8000, 0.7, 300); a = int(0.07 * SR); y[a:a + len(c2)] += 0.85 * c2
f = 2400 + 2200 * (1 - np.exp(-t / 0.08)); ph = 2 * np.pi * np.cumsum(f) / SR
ping = (np.sin(ph) + 0.3 * np.sin(2 * ph)) * np.clip((t - 0.02) / 0.01, 0, 1) * np.exp(-np.clip(t - 0.02, 0, None) / 0.12) * 0.22
save('shutter.wav', y + ping, -1)
# brush: each stroke = a burst of high bristle noise with a soft wet low band; strokes alternate brightness (back / forth)
n = int(1.4 * SR); y = np.zeros(n)
for i, t0 in enumerate(np.arange(0, 1.36, 1 / 7.0)):
    d = 0.12 + 0.02 * rng.random(); m = int(d * SR); tt = np.arange(m) / SR
    env = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 1.5
    bright = 3200 if i % 2 else 2400
    s = band(rng.standard_normal(m), bright, 11000) * 0.8 + band(rng.standard_normal(m), 250, 1200) * 0.35
    s = s / (np.max(np.abs(s)) + 1e-9) * env * (0.75 + 0.25 * rng.random())
    a = int((t0 + 0.008 * rng.random()) * SR); y[a:a + m] += s[: n - a]
save('brush.wav', y, -3)
