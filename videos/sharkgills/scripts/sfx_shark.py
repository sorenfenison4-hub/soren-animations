# Synthesize the shark-gills Short's new sounds (48 kHz mono 16-bit): underwater (bed), bubblestream, fwoop.
#   python3 scripts/sfx_shark.py public/library/sfx
import numpy as np, wave, sys
SR = 48000
out = sys.argv[1]
rng = np.random.default_rng(7)
def lowpass(x, hz):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * np.clip((hz * 1.25 - f) / (hz * 0.25), 0, 1), len(x))
def bandpass(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.clip((f - lo * 0.7) / (lo * 0.3 + 1e-9), 0, 1) * np.clip((hi * 1.3 - f) / (hi * 0.3), 0, 1)
    return np.fft.irfft(X * m, len(x))
def save(name, y, peak_db=-1.0):
    y = y / (np.max(np.abs(y)) + 1e-9) * 10 ** (peak_db / 20)
    with wave.open(f"{out}/{name}", 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
    print(name, f"{len(y)/SR:.2f} s")
def bubble(f0, dur, rise=1.8):
    """one bubble: a short sine whose pitch rises as it pops (Minnaert-style blip)"""
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (1 + (rise - 1) * (t / dur) ** 1.5)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.002) * np.exp(-t / (dur * 0.35))
def scatter(y, count, fmin, fmax, dmin, dmax, amp, seed, t0=0.0, t1=None):
    r = np.random.default_rng(seed); n = len(y); t1 = t1 if t1 is not None else n / SR
    for _ in range(count):
        at = int(r.uniform(t0, t1) * SR); b = bubble(r.uniform(fmin, fmax), r.uniform(dmin, dmax)) * amp * r.uniform(0.4, 1.0)
        e = min(n, at + len(b)); y[at:e] += b[: e - at]
    return y
# underwater: 4 s muffled ambience - low rumble that breathes slowly + a few soft distant bubbles; loops (ends match)
n = int(4.0 * SR); t = np.arange(n) / SR
rum = lowpass(rng.standard_normal(n), 320)
rum = rum / np.max(np.abs(rum)) * (0.75 + 0.25 * np.sin(2 * np.pi * t / 4.0))
y = rum + scatter(np.zeros(n), 14, 260, 620, 0.05, 0.12, 0.16, 3, 0.1, 3.8)
fade = int(0.25 * SR); y[:fade] *= np.linspace(0, 1, fade) ** 0.5; y[-fade:] *= np.linspace(1, 0, fade) ** 0.5
save('underwater.wav', y, -3)
# bubblestream: 1.6 s stream of bubbles out of gills (dense, bright, a little hiss), loud from 0
n = int(1.6 * SR); t = np.arange(n) / SR
y = scatter(np.zeros(n), 70, 500, 1500, 0.025, 0.07, 1.0, 5, 0.0, 1.5)
y += 0.12 * bandpass(rng.standard_normal(n), 1500, 6000) * np.exp(-t / 0.9)
y *= np.minimum(1, (1.6 - t) / 0.15)
save('bubblestream.wav', y, -1)
# fwoop: 0.5 s suction pop - something shot out of a tube: a falling resonant "bloop" + a wet pop at the start
n = int(0.5 * SR); t = np.arange(n) / SR
f = 900 * np.exp(-t / 0.09) + 180
y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.003) * np.exp(-t / 0.13)
y += 0.6 * bandpass(rng.standard_normal(n), 600, 3500) * np.exp(-t / 0.012)
y = scatter(y, 6, 700, 1400, 0.03, 0.06, 0.35, 9, 0.08, 0.4)
save('fwoop.wav', y, -1)
