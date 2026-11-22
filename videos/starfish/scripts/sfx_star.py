# Synthesize the starfish Short's new sounds (48 kHz mono 16-bit): rip (paper tear), rip_short, boing, scribble.
import numpy as np, wave, sys
SR = 48000
out = sys.argv[1]
rng = np.random.default_rng(11)
def bandpass(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.clip((f - lo * 0.7) / (lo * 0.3 + 1e-9), 0, 1) * np.clip((hi * 1.3 - f) / (hi * 0.3), 0, 1)
    return np.fft.irfft(X * m, len(x))
def lowpass(x, hz):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * (f < hz), len(x))
def save(name, y, peak_db=-1.0):
    y = y / (np.max(np.abs(y)) + 1e-9) * 10 ** (peak_db / 20)
    with wave.open(f"{out}/{name}", 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
    print(name, f"{len(y)/SR:.2f} s")
def tear(dur, bursts, seed, bright=1.0):
    r = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR
    rasp = bandpass(r.standard_normal(n), 700 * bright, 7000)
    am = np.abs(lowpass(r.standard_normal(n), 220)); am = (am / np.max(am)) ** 1.6
    # crackles: sparse clicks with 1.5 ms decays
    clicks = np.zeros(n); idx = r.random(n) < 900 / SR; clicks[idx] = r.choice([-1, 1], idx.sum()) * (0.4 + r.random(idx.sum()))
    k = np.exp(-np.arange(int(0.0015 * SR)) / (0.0004 * SR)); crack = bandpass(np.convolve(clicks, k)[:n], 1500, 9000)
    # envelope: loud onset, a few tearing bursts, a final snap
    env = np.minimum(1, t / 0.004) * (0.55 + 0.45 * np.abs(np.sin(np.pi * bursts * t / dur)) ** 0.6)
    env[: int(0.06 * SR)] = np.maximum(env[: int(0.06 * SR)], 1.0)
    env *= np.minimum(1, (dur - t) / 0.06)
    y = (rasp / np.max(np.abs(rasp)) * (0.35 + 0.65 * am) + 0.8 * crack / (np.max(np.abs(crack)) + 1e-9)) * env
    return y
# rip: 2.7 s paper tear, loud from frame 0 (a frame-0 hit), bursts every ~0.55 s
save('rip.wav', tear(2.7, 5, 3), -1)
# rip_short: 0.55 s quick tear (the starfish, the clone's first tear)
save('rip_short.wav', tear(0.55, 1, 5, 1.3), -1)
# boing: cartoon spring "bwoing" (0.5 s), onset at 0
n = int(0.5 * SR); t = np.arange(n) / SR
f = 170 + 230 * (1 - np.exp(-t / 0.04)) + 70 * np.sin(2 * np.pi * 13 * t) * np.exp(-t / 0.25)
ph = 2 * np.pi * np.cumsum(f) / SR
y = (np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)) * np.minimum(1, t / 0.003) * np.exp(-t / 0.16)
save('boing.wav', y, -2)
# scribble: pencil scratching back and forth (0.4 s)
n = int(0.4 * SR); t = np.arange(n) / SR
s = bandpass(rng.standard_normal(n), 2200, 7500)
strokes = np.abs(np.sin(2 * np.pi * 11 * t)) ** 0.8 * (0.7 + 0.3 * rng.random(n))
y = s * strokes * np.minimum(1, t / 0.01) * np.minimum(1, (0.4 - t) / 0.05)
save('scribble.wav', y, -3)
