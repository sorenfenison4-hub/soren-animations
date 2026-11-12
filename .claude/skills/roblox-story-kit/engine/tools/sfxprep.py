# Turns a raw sound (any format ffmpeg reads) into a pack sound: 48k mono wav that starts
# right on its first hit, ends when it has died away, and sits at a common loudness.
#   python tools/sfxprep.py raw.mp3 sfx/poof.wav [--onset-db -12] [--events 1] [--max 0.6] [--loop]
# --onset-db  level (rel. to peak) that counts as the start; lower it to keep a soft lead-in (whoosh)
# --events    how many separate hits to keep (a generation often repeats the sound); 0 = all
# --max       hard length cap in seconds, faded out
# --loop      ambience: no trimming, only level
import argparse, subprocess, sys, wave
import numpy as np

SR = 48000
HOP = 240            # 5ms envelope
GAP = 0.06           # this much near-silence ends an event
TARGET = 10 ** (-10 / 20)   # loudest 100ms of a one-shot sits at -10 dBFS rms...
LOOP_TARGET = 10 ** (-20 / 20)
PEAK = 0.95          # ...unless that would clip


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], stdout=subprocess.PIPE, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def save(path, x):
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())


def envelope(x):
    n = len(x) // HOP
    return np.sqrt((x[:n * HOP].reshape(n, HOP) ** 2).mean(axis=1) + 1e-12)


def prep(x, onset_db=-12.0, events=1, max_len=0.0, loop=False):
    if loop:
        fade = int(0.005 * SR)
        x = x.copy(); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
        return x * min(LOOP_TARGET / np.sqrt((x ** 2).mean()), PEAK / np.abs(x).max())
    env = envelope(x); db = 20 * np.log10(env / env.max())
    start = int(np.argmax(db > onset_db))
    # walk the events: each ends at the first GAP of quiet (-40 dB) after it began
    quiet = db < -40; gap = int(GAP / (HOP / SR)); i = start; end = len(env); found = 0
    while events and i < len(env):
        run = 0; j = i
        while j < len(env) and run < gap: run = run + 1 if quiet[j] else 0; j += 1
        found += 1; end = j - run + 2 if run >= gap else len(env)
        if found >= events or j >= len(env): break
        nxt = np.argmax(db[j:] > onset_db)
        if db[j + nxt] <= onset_db: break          # nothing more above the onset level
        i = j + nxt
    # never keep the dead tail
    live = np.where(db[start:end] > -50)[0]
    end = start + (int(live[-1]) + 3 if len(live) else end - start)
    a = max(0, start * HOP - int(0.004 * SR)); b = min(len(x), end * HOP)
    if max_len: b = min(b, a + int(max_len * SR))
    y = x[a:b].copy()
    fi = min(int(0.002 * SR), len(y)); fo = min(int(0.04 * SR), len(y) // 2)
    y[:fi] *= np.linspace(0, 1, fi); y[-fo:] *= np.linspace(1, 0, fo) ** 2
    win = min(len(y), int(0.1 * SR))
    c = np.cumsum(np.concatenate([[0], y ** 2])); loud = np.sqrt((c[win:] - c[:-win]).max() / win)
    return y * min(TARGET / loud, PEAK / np.abs(y).max())


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('dst')
    ap.add_argument('--onset-db', type=float, default=-12.0)
    ap.add_argument('--events', type=int, default=1)
    ap.add_argument('--max', type=float, default=0.0)
    ap.add_argument('--loop', action='store_true')
    o = ap.parse_args()
    x = load(o.src)
    y = prep(x, o.onset_db, o.events, o.max, o.loop)
    save(o.dst, y)
    print(f'{o.dst}: {len(x) / SR:.2f}s -> {len(y) / SR:.2f}s, peak {np.abs(y).max():.2f}, lead to peak {np.argmax(np.abs(y)) / SR * 1000:.0f}ms')
