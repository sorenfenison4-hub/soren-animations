# New shared sounds for water scenes: splash, bubbles, horn, waves (ElevenLabs sfx, trimmed + peak-normalised)
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
out = "public/library/sfx/"  # run from the video folder that holds work/sfx/*.mp3
save(out + "splash.wav", fade(load("work/sfx/splash.mp3")[: int(0.75 * SR)], 0.002, 0.15))
save(out + "bubbles.wav", fade(load("work/sfx/bubbles.mp3")[: int(0.62 * SR)], 0.002, 0.1))
save(out + "horn.wav", fade(load("work/sfx/horn.mp3")[: int(1.75 * SR)], 0.01, 0.4))
save(out + "waves.wav", fade(load("work/sfx/waves.mp3"), 0.25, 0.5))
