# Final audio for a video: voice + sound cues from the sfx/ pack + optional music bed.
#   python tools/mix.py --video <slug>
# reads  videos/<slug>/audio/voice.wav   (tools/voice.py)
#        videos/<slug>/audio/cues.json   (tools/cues.mjs)
#        videos/<slug>/audio/music.*     (optional bed: looped to length, ducked under the voice)
# writes videos/<slug>/audio/mix.m4a     (48k stereo AAC, what tools/render.mjs picks up)
# Without --video it mixes the rent-control demo: source/audio.m4a + out/cues.json -> out/mix_sfx.m4a.
# Any path can be overridden: --voice --cues --music --out. Levels: --sfx-db --music-db --duck-db.
# Everything is decoded and encoded through ffmpeg pipes; the mix itself is numpy.
import argparse, glob, json, os, re, subprocess, sys
import numpy as np

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SR = 48000
VOICE_PEAK_DB = -1.5   # the voice is the loudest thing: its peak is put here
SFX_DB = -12.0         # pack sounds sit about 10-14 dB under the voice peak (cue vol and pack.json trim from here)
MUSIC_DB = -13.0       # music peak in the gaps (~14 dB under the voice while talking, audible on phones)...
DUCK_DB = -5.0         # ...and this much lower while the voice is speaking
CEILING = 10 ** (-1.0 / 20)
REPEAT_WIN, REPEAT_STEP, REPEAT_FLOOR = 0.35, 0.8, 0.5  # the same sound again within 350ms gets quieter each time

db = lambda d: 10 ** (d / 20)


def decode(path, ch=2):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', str(ch), '-ar', str(SR), '-f', 'f32le', '-'], stdout=subprocess.PIPE, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64).reshape(-1, ch)


def encode(path, x):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    codec = ['-c:a', 'pcm_s16le'] if path.endswith('.wav') else ['-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart']
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-'] + codec + [path], stdin=subprocess.PIPE)
    p.communicate(x.astype('<f4').tobytes())
    if p.returncode: sys.exit('ffmpeg failed writing ' + path)


def looped(x, n, xf=int(0.03 * SR)):
    # tile x to n samples, crossfading each join so an ambience loop does not click
    if len(x) >= n: return x[:n]
    xf = max(1, min(xf, len(x) // 4))
    step = len(x) - xf; out = np.zeros((n + len(x),) + x.shape[1:]); w = np.ones(len(x)); r = np.linspace(0, 1, xf)
    w[:xf] = r; w[-xf:] = r[::-1]
    w = w.reshape((-1,) + (1,) * (x.ndim - 1))
    for a in range(0, n, step): out[a:a + len(x)] += x * w
    out[:xf] = x[:xf]  # the very first fade-in is not a join
    return out[:n]


def fade(x, fi, fo):
    x = x.copy(); fi = min(fi, len(x) // 2); fo = min(fo, len(x) // 2); sh = (-1,) + (1,) * (x.ndim - 1)
    if fi: x[:fi] *= np.linspace(0, 1, fi).reshape(sh)
    if fo: x[-fo:] *= np.linspace(1, 0, fo).reshape(sh)
    return x


def pack_sounds(sfx_dir):
    # name -> sorted variant files: poof.wav, poof_1.wav, poof_2.wav ...
    out = {}
    for f in sorted(glob.glob(os.path.join(sfx_dir, '*.wav'))):
        m = re.match(r'^(.*?)(?:_(\d+))?$', os.path.splitext(os.path.basename(f))[0])
        out.setdefault(m.group(1), []).append(f)
    return out


def speaking(voice, hop=int(0.01 * SR)):
    # 0..1 per sample: 1 while the voice is talking (fast in, slow out), for ducking the bed
    mono = voice.mean(axis=1); n = len(mono) // hop
    env = np.sqrt((mono[:n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-12)
    on = (env > env.max() * db(-35)).astype(float)
    g = np.zeros(n); v = 0.0
    for i in range(n):
        v += (on[i] - v) * (0.5 if on[i] > v else 0.04)   # ~20ms attack, ~250ms release
        g[i] = v
    return np.interp(np.arange(len(mono)), (np.arange(n) + 0.5) * hop, g)


def limit(x, ceiling=CEILING, block=48, look=5):
    # look-ahead peak limiter on 1ms blocks: gain dips before a peak and recovers after it
    n = -(-len(x) // block)
    pk = np.abs(np.pad(x, ((0, n * block - len(x)), (0, 0)))).max(axis=1).reshape(n, block).max(axis=1)
    g = np.minimum(1.0, ceiling / np.maximum(pk, 1e-9))
    p = np.pad(g, look, constant_values=1.0)
    g = np.min([p[i:i + n] for i in range(2 * look + 1)], axis=0)             # hold the dip around the peak
    p = np.pad(g, look, mode='edge')
    g = np.minimum(g, np.mean([p[i:i + n] for i in range(2 * look + 1)], axis=0))  # smooth the edges
    gs = np.interp(np.arange(len(x)), (np.arange(n) + 0.5) * block, g)
    gs = np.minimum(gs, np.repeat(g, block)[:len(x)])
    return np.clip(x * gs[:, None], -1.0, 1.0), float(g.min())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--video', default='')
    for k in ('voice', 'cues', 'music', 'out'): ap.add_argument('--' + k, default='')
    ap.add_argument('--sfx', default=os.path.join(ROOT, 'sfx'))
    ap.add_argument('--sfx-db', type=float, default=SFX_DB)
    ap.add_argument('--music-db', type=float, default=MUSIC_DB)
    ap.add_argument('--duck-db', type=float, default=DUCK_DB)
    o = ap.parse_args()
    if o.video:
        d = os.path.join(ROOT, 'videos', o.video, 'audio')
        voice_p, cues_p, out_p = os.path.join(d, 'voice.wav'), os.path.join(d, 'cues.json'), os.path.join(d, 'mix.m4a')
        music = [f for f in sorted(glob.glob(os.path.join(d, 'music.*')))]
        music_p = music[0] if music else ''
    else:
        voice_p, cues_p, out_p, music_p = os.path.join(ROOT, 'source', 'audio.m4a'), os.path.join(ROOT, 'out', 'cues.json'), os.path.join(ROOT, 'out', 'mix_sfx.m4a'), ''
    voice_p, cues_p, out_p, music_p = o.voice or voice_p, o.cues or cues_p, o.out or out_p, o.music or music_p

    voice = decode(voice_p)
    voice *= db(VOICE_PEAK_DB) / max(np.abs(voice).max(), 1e-9)
    cues = json.load(open(cues_p)) if os.path.exists(cues_p) else []
    if not cues: print('warning: no cues at', cues_p)
    sounds = pack_sounds(o.sfx)
    conf = json.load(open(os.path.join(o.sfx, 'pack.json'))) if os.path.exists(os.path.join(o.sfx, 'pack.json')) else {}
    cache = {}

    # ---- sfx bus ----
    placed = []; used = {}; missing = {}; last = {}
    for c in sorted(cues, key=lambda c: c['t']):
        name = c['name']
        if name not in sounds: missing[name] = missing.get(name, 0) + 1; continue
        k = used.get(name, 0); used[name] = k + 1
        f = sounds[name][k % len(sounds[name])]          # variants in rotation: deterministic, never the same one twice in a row
        if f not in cache: cache[f] = decode(f, 1)[:, 0]
        s = cache[f]; cf = conf.get(name, {})
        if c.get('dur'): s = fade(looped(s, int(c['dur'] * SR)), int(0.04 * SR), int(0.12 * SR))
        t0, k0 = last.get(name, (-9, 1.0))
        rep = max(REPEAT_FLOOR, k0 * REPEAT_STEP) if c['t'] - t0 < REPEAT_WIN else 1.0
        last[name] = (c['t'], rep)
        a = int(round((c['t'] - cf.get('lead', 0)) * SR))
        placed.append((a, s * (db(o.sfx_db + cf.get('gain', 0)) * c.get('vol', 1) * rep)))
    for name, k in missing.items(): print(f'warning: no sound "{name}" in the pack ({k} cue{"s" if k > 1 else ""} skipped)')

    n = max([len(voice)] + [a + len(s) for a, s in placed])
    if o.video: n = len(voice); placed = [(a, s[:max(0, n - a)]) for a, s in placed if a < n]   # the video is as long as its voice
    mix = np.zeros((n, 2)); mix[:len(voice)] += voice
    bus = np.zeros(n)
    for a, s in placed:
        if a < 0: s = s[-a:]; a = 0
        bus[a:a + len(s)] += s
    mix += bus[:, None]

    # ---- music bed ----
    if music_p:
        m = decode(music_p)
        m = looped(m, n, int(0.5 * SR)) * (db(o.music_db) / max(np.abs(m).max(), 1e-9))
        talk = np.zeros(n); talk[:len(voice)] = speaking(voice)
        m *= (1 + (db(o.duck_db) - 1) * talk)[:, None]
        mix += fade(m, int(0.3 * SR), int(1.0 * SR))

    mix, dip = limit(mix)
    encode(out_p, mix)
    print(f'wrote {out_p}: {n / SR:.2f}s, {len(placed)} cues placed ({", ".join(f"{k} {v}" for k, v in sorted(used.items(), key=lambda kv: -kv[1]))})'
          + (f', music {os.path.basename(music_p)}' if music_p else '') + f', peak {20 * np.log10(np.abs(mix).max() + 1e-9):.1f} dBFS, limiter max dip {20 * np.log10(dip):.1f} dB')


if __name__ == '__main__':
    main()
