# New shared sounds: zap.wav + chirp.wav (ElevenLabs, trimmed + peak-normalised), hum.wav (synthesised power-line hum)
import subprocess, numpy as np, wave
SR = 48000
def load(f):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float64) / 32768
def save(f, x, peak_db=-1.0):
    x = x / np.abs(x).max() * 10 ** (peak_db / 20)
    with wave.open(f, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    print(f, f"{len(x)/SR:.2f}s")
def fade(x, a, b):
    x = x.copy(); na, nb = int(a * SR), int(b * SR)
    if na: x[:na] *= np.linspace(0, 1, na)
    if nb: x[-nb:] *= np.linspace(1, 0, nb)
    return x
out = "public/library/sfx/"
zap = load("work/sfx/zap_raw.mp3")[: int(0.98 * SR)]
save(out + "zap.wav", fade(zap, 0.002, 0.08))
ch = load("work/sfx/chirp_raw.mp3")[int(0.13 * SR): int(0.62 * SR)]
save(out + "chirp.wav", fade(ch, 0.01, 0.03))
# hum: 60 Hz mains family (120 Hz strongest), soft-clipped for buzz, slow wobble, sparse corona crackle
rng = np.random.default_rng(7)
dur = 20.0; t = np.arange(int(dur * SR)) / SR
amps = {1: .25, 2: 1.0, 3: .45, 4: .55, 5: .2, 6: .3, 7: .12, 8: .18, 10: .1, 12: .08}
h = sum(a * np.sin(2 * np.pi * 60 * n * t + rng.uniform(0, 6.28)) for n, a in amps.items())
h = 0.5 * h / np.abs(h).max() + 0.5 * np.tanh(2.2 * h / np.abs(h).max()) / np.tanh(2.2)
h *= 1 + 0.10 * np.sin(2 * np.pi * 0.35 * t) + 0.06 * np.sin(2 * np.pi * 1.3 * t + 1)
cr = np.zeros_like(t)
for c in np.cumsum(rng.exponential(1 / 5, 200)):
    if c > dur - 0.05: break
    i = int(c * SR); n = int(0.004 * SR)
    cr[i:i + n] += rng.uniform(.15, .5) * rng.standard_normal(n) * np.exp(-np.arange(n) / (0.0012 * SR))
cr = np.diff(cr, prepend=0)  # high-pass the clicks
save(out + "hum.wav", fade(h + 0.6 * cr, 0.3, 0.3))
