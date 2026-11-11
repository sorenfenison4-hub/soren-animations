# Builds the one dialogue track of the whisper Short from the four voice takes (narrator, advisor, sweeper, king):
# cuts every spoken chunk (times = loud stretches found by pauses.py), speeds the narrator up a little, lays the chunks
# back to back with short gaps, writes public/whisper/vo/dialogue.mp3 and src/dialogue.json (line + word times in
# video time, for the T table and the captions). Run from the video folder: python3 scripts/assemble.py
import json, subprocess, numpy as np, os, tempfile

SR = 48000
VOICE_AT = 0.1          # where the dialogue track starts in the video
PAD0, PAD1 = 0.04, 0.07  # keep a little air before / after each loud stretch
TEMPO = {'narrator': 1.12, 'advisor': 1.0, 'sweeper': 1.0, 'king': 1.0}

def load(name):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'public/whisper/vo/{name}.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def tempo(x, t):
    if abs(t - 1) < 1e-6: return x
    with tempfile.TemporaryDirectory() as d:
        a, b = os.path.join(d, 'a.f32'), os.path.join(d, 'b.f32')
        x.astype(np.float32).tofile(a)
        subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', a, '-filter:a', f'atempo={t}',
                        '-f', 'f32le', '-ar', str(SR), '-ac', '1', b], check=True)
        return np.fromfile(b, np.float32)

# (line id, speaker, take start, take end, gap after) - one row per loud stretch, in story order
CHUNKS = [
    ('never', 'narrator', 0.04, 2.22, 0.18), ('ask', 'narrator', 2.86, 4.28, 0.22), ('earlier', 'narrator', 5.00, 6.04, 0.26),
    ('leaned', 'narrator', 6.70, 9.80, 0.18),
    ('tonight', 'advisor', 0.14, 0.66, 0.16), ('tonight', 'advisor', 1.04, 2.78, 0.22),
    ('forty', 'narrator', 10.50, 11.60, 0.08), ('forty', 'narrator', 11.78, 13.62, 0.10), ('forty', 'narrator', 14.10, 16.12, 0.18),
    ('majesty', 'sweeper', 0.08, 0.84, 0.12), ('majesty', 'sweeper', 1.22, 3.10, 0.18),
    ('ghosts', 'advisor', 3.30, 4.50, 0.20), ('ghosts', 'advisor', 4.96, 6.76, 0.18),
    ('court', 'narrator', 16.80, 17.86, 0.20), ('court', 'narrator', 18.40, 20.12, 0.16),
    ('scrub', 'king', 0.06, 1.64, 0.18), ('scrub', 'king', 2.04, 3.00, 0.22), ('scrub', 'king', 3.40, 4.04, 0.24),
    ('night', 'narrator', 20.76, 21.28, 0.08), ('night', 'narrator', 21.74, 23.14, 0.18),
    ('morning', 'narrator', 23.72, 24.34, 0.06), ('morning', 'narrator', 24.72, 26.14, 0.06), ('morning', 'narrator', 26.40, 27.20, 0.22),
    ('day2', 'narrator', 27.96, 28.66, 0.08), ('day2', 'narrator', 29.24, 30.16, 0.22),
    ('day3', 'narrator', 30.78, 31.44, 0.08), ('day3', 'narrator', 31.94, 33.12, 0.20),
    ('notice', 'narrator', 33.62, 34.86, 0.22),
    ('treasury', 'advisor', 7.18, 7.72, 0.12), ('treasury', 'advisor', 7.98, 8.64, 0.24),
    ('ready', 'narrator', 35.42, 37.02, 0.12), ('ready', 'narrator', 37.58, 39.82, 0.18),
    ('listen', 'sweeper', 3.40, 4.18, 0.24),
    ('fool', 'advisor', 9.18, 11.28, 0.30),
    ('heard', 'narrator', 40.46, 42.32, 0.24),
    ('round', 'narrator', 42.92, 43.88, 0.08), ('round', 'narrator', 44.14, 45.76, 0.14), ('round', 'narrator', 46.26, 49.82, 0.24),
    ('pauls', 'narrator', 50.42, 51.74, 0.08), ('pauls', 'narrator', 52.06, 52.82, 0.06), ('pauls', 'narrator', 53.02, 54.10, 0.08),
    ('pauls', 'narrator', 54.36, 55.86, 0.22),
    ('now', 'narrator', 56.46, 58.82, 0.14), ('now', 'narrator', 59.34, 59.94, 0.30),
    ('stupid', 'advisor', 11.70, 13.32, 0.38),
    ('iheard', 'king', 4.46, 5.30, 0.0),
]

takes = {s: load(s) for s in TEMPO}
words = {s: [w for w in json.load(open(f'work/words/{s}.json'))['words'] if w['type'] == 'word' and not w['text'].startswith('[')] for s in TEMPO}
out, t, lines, wout = [], 0.0, {}, []
for i, (lid, spk, a, b, gap) in enumerate(CHUNKS):
    a0, b0 = max(0, a - PAD0), b + PAD1
    seg = takes[spk][int(a0 * SR):int(b0 * SR)].copy()
    f = int(0.012 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    k = TEMPO[spk]; seg = tempo(seg, k)
    start = VOICE_AT + t
    for w in words[spk]:
        if a0 - 0.14 <= w['start'] < b0 and not any(x['spk'] == spk and x['w'] == w['text'] and abs(x['src'] - w['start']) < 1e-6 for x in wout):
            wout.append({'w': w['text'], 'spk': spk, 'line': lid, 'src': w['start'], 's': round(start + max(0, w['start'] - a0) / k, 3),
                         'e': round(start + (min(w['end'], b0) - a0) / k, 3)})
    L = lines.setdefault(lid, {'id': lid, 'spk': spk, 's': round(start + PAD0 / k, 3)})
    L['e'] = round(start + (b - a0) / k, 3)
    out.append(seg); t += len(seg) / SR
    if gap > 0: out.append(np.zeros(int(gap * SR), np.float32)); t += gap
mix = np.concatenate(out)
peak = np.abs(mix).max(); mix = mix / peak * 10 ** (-3 / 20)   # peak at -3 dBFS
tmp = 'work/dialogue.f32'; mix.astype(np.float32).tofile(tmp)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', tmp, '-c:a', 'libmp3lame', '-b:a', '192k',
                'public/whisper/vo/dialogue.mp3'], check=True)
for x in wout: x.pop('src', None)
json.dump({'voiceAt': VOICE_AT, 'end': round(VOICE_AT + t, 3), 'lines': list(lines.values()), 'words': wout}, open('src/dialogue.json', 'w'), indent=0)
print(f'dialogue {t:.2f} s (video end of last word {VOICE_AT + t:.2f} s), {len(wout)} words')
for L in lines.values(): print(f"  {L['id']:9s} {L['spk']:8s} {L['s']:6.2f} -> {L['e']:6.2f}")
