#!/usr/bin/env python3
"""Trim + level raw sound effects into the shared library (run from kit/audio):
    python3 prep_sfx.py [name ...]        (no names = every raw/sfx/*.flac or *.wav)
raw/sfx/<name>.flac (lossless masters; .wav works too) -> ../public/library/sfx/<name>.wav: 48 kHz 16-bit, mono when both channels are the same, leading
silence cut to 5 ms (more than 40 dB under the peak counts as silence), trailing silence cut (50 dB) with a 25 ms
fade (300 ms when the take was cut off while still loud, e.g. whale_song), peak-normalised to -1 dBFS. Measures each file into sfx_catalog.json: duration, onset (first moment within
20 dB of the peak - line it up with the beat), peak time, loudness (RMS dBFS of the loud part) and hits (the start of
every separate bark / thump / hit) so cues can be set without listening. Needs ffmpeg.
"""
import glob, json, os, subprocess, sys, wave, numpy as np

SR = 48000
names = sys.argv[1:] or sorted({os.path.splitext(os.path.basename(f))[0] for f in glob.glob('raw/sfx/*.flac') + glob.glob('raw/sfx/*.wav')})
cat_path = 'sfx_catalog.json'
cat = json.load(open(cat_path)) if os.path.exists(cat_path) else {}


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


for name in names:
    x = load(f'raw/sfx/{name}.flac' if os.path.exists(f'raw/sfx/{name}.flac') else f'raw/sfx/{name}.wav')
    if len(x) == 0:
        print('EMPTY', name); continue
    l, r = x[:, 0], x[:, 1]
    mono = np.allclose(l, r, atol=1e-3) or (np.corrcoef(l, r)[0, 1] > 0.995 if l.std() > 0 and r.std() > 0 else True)
    env = np.abs(x).max(1)
    peak = env.max()
    if peak < 1e-4:
        print('SILENT', name); continue
    above = np.nonzero(env > peak * 10 ** (-40 / 20))[0]
    tail = np.nonzero(env > peak * 10 ** (-50 / 20))[0]
    s0 = max(0, above[0] - int(0.005 * SR)); s1 = min(len(x), tail[-1] + int(0.03 * SR))
    y = x[s0:s1] * (10 ** (-1 / 20) / peak)
    fi = min(len(y), int(0.003 * SR)); y[:fi] *= np.linspace(0, 1, fi)[:, None] if s0 > 0 else 1
    # 25 ms fade-out; 300 ms when the take was cut off while still loud (last 0.1 s within 20 dB of the peak)
    cut_off = np.abs(y[-int(0.1 * SR):]).max() > 10 ** (-1 / 20) * 10 ** (-20 / 20)
    fo = min(len(y), int((0.3 if cut_off else 0.025) * SR)); y[-fo:] *= np.linspace(1, 0, fo)[:, None]
    if mono:
        y = y.mean(1, keepdims=True)
    pcm = (np.clip(y, -1, 1) * 32767).astype('<i2')
    out = f'../public/library/sfx/{name}.wav'
    with wave.open(out, 'wb') as wf:
        wf.setnchannels(pcm.shape[1]); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes(pcm.tobytes())
    e = np.abs(y).max(1)
    onset = float(np.nonzero(e > e.max() * 0.1)[0][0]) / SR
    pk = float(e.argmax()) / SR
    loud = e > e.max() * 10 ** (-20 / 20)
    rms = float(20 * np.log10(np.sqrt((y[loud] ** 2).mean()) + 1e-9))
    # hits: each time the 20 ms loudness climbs above -10 dB (re the peak) after falling under -20 dB - every bark, thump
    # or drum hit of a multi-hit sound, so cues can line up with the second bark without listening
    hop, win = int(0.01 * SR), int(0.02 * SR); m = y.mean(1)
    lv = np.array([20 * np.log10(np.sqrt((m[i:i + win] ** 2).mean()) + 1e-9) for i in range(0, max(1, len(m) - win), hop)])
    lv -= lv.max(); hits, armed = [], True
    for i, v in enumerate(lv):
        if armed and v > -10:
            hits.append(round(i * hop / SR, 2)); armed = False
        elif v < -20:
            armed = True
    cat[name] = {'dur': round(len(y) / SR, 2), 'onset': round(onset, 3), 'peak': round(pk, 3), 'rms_db': round(rms, 1),
                 'ch': int(pcm.shape[1]), 'hits': hits[:12]}
    print(name, cat[name])
json.dump(dict(sorted(cat.items())), open(cat_path, 'w'), indent=1)
