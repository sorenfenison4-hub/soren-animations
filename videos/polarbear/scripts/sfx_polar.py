# Synthesize the polar bear Short's new sounds (48 kHz mono 16-bit): snowball, wind, kettle, beep.
import numpy as np, wave, sys
SR = 48000
out = sys.argv[1]
rng = np.random.default_rng(7)
def bandpass(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.clip((f - lo * 0.7) / (lo * 0.3 + 1e-9), 0, 1) * np.clip((hi * 1.3 - f) / (hi * 0.3), 0, 1)
    return np.fft.irfft(X * m, len(x))
def save(name, y, peak_db=-1.0):
    y = y / (np.max(np.abs(y)) + 1e-9) * 10 ** (peak_db / 20)
    with wave.open(f"{out}/{name}", 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
    print(name, f"{len(y)/SR:.2f} s")
# snowball: a soft "pomf" - low thump + a puff of crunchy noise, onset at 0
n = int(0.42 * SR); t = np.arange(n) / SR
thump = np.sin(2 * np.pi * (95 * t - 60 * t * t)) * np.exp(-t / 0.05)
puff = bandpass(rng.standard_normal(n), 400, 3200) * np.exp(-t / 0.07) * (1 - np.exp(-t / 0.002))
crunch = bandpass(rng.standard_normal(n), 2500, 7000) * (rng.random(n) < 0.03) * np.exp(-t / 0.09) * 6
save('snowball.wav', 1.0 * thump + 0.9 * puff / np.max(np.abs(puff)) + 0.35 * crunch / (np.max(np.abs(crunch)) + 1e-9))
# wind: 4 s blizzard gusts (seamless when repeated every 3.6 s with the 0.4 s fades overlapping)
n = int(4.0 * SR); t = np.arange(n) / SR
base = bandpass(rng.standard_normal(n), 180, 1400)
lfo = 0.55 + 0.25 * np.sin(2 * np.pi * 0.35 * t + 1.0) + 0.2 * np.sin(2 * np.pi * 0.83 * t + 0.4)
howl = bandpass(rng.standard_normal(n), 500, 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.5 * t)) * 0.6
env = np.minimum(1, np.minimum(t / 0.4, (4.0 - t) / 0.4))
save('wind.wav', (base / np.max(np.abs(base)) * lfo + howl / np.max(np.abs(howl)) * 0.5) * env, -3)
# kettle: 1.3 s whistle that rises in pitch and wobbles, breathy, attack 0.12 s
n = int(1.3 * SR); t = np.arange(n) / SR
f = 1900 + 650 * (1 - np.exp(-t / 0.35)) + 35 * np.sin(2 * np.pi * 6.5 * t)
ph = 2 * np.pi * np.cumsum(f) / SR
tone = np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
breath = bandpass(rng.standard_normal(n), 1500, 5000) * 0.35
env = np.minimum(1, t / 0.12) * np.minimum(1, (1.3 - t) / 0.15)
save('kettle.wav', (tone * (0.8 + 0.2 * np.sin(2 * np.pi * 3 * t)) + breath) * env, -1)
# beep: three short warning beeps (1.35 kHz, soft square), 0.62 s
n = int(0.62 * SR); t = np.arange(n) / SR
y = np.zeros(n)
for k in range(3):
    a = k * 0.2; m = (t >= a) & (t < a + 0.12)
    tt = t[m] - a
    y[m] = np.tanh(3 * np.sin(2 * np.pi * 1350 * tt)) * np.minimum(1, tt / 0.005) * np.minimum(1, (0.12 - tt) / 0.01)
save('beep.wav', y, -3)
