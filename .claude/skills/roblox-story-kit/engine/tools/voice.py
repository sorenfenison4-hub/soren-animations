# Voice pipeline: raw voiceover + the script it was read from -> tight audio and frame-accurate
# word timings.
#   python tools/voice.py --video <slug> --voice raw_voice.mp3 [--script videos/<slug>/script.txt]
# writes videos/<slug>/audio/voice.wav + voice.m4a   pauses tightened (48k mono)
#        videos/<slug>/audio/words.json              [{word, start, end}] in seconds, script words
#        videos/<slug>/audio/sentences.json          [{text, start, end, startFrame, endFrame, words:[i0,i1]}]
#        src/videos/<slug>/captions.js               [word, startFrame], same format as src/captions.js
#        videos/<slug>/audio/whisper.json            cache of the transcription (reused until the voice file changes)
# Flags: --no-trim keeps the audio timing as it is, --fps 30, --force re-runs whisper,
#        --silence-db -38 (what counts as a pause, relative to speech level),
#        --no-snap leaves whisper's word starts alone (see snap_to_speech).
#
# How it works. The words on screen are the SCRIPT's words, never a transcript: whisper is
# only used as a clock. It transcribes the raw file with word timestamps, its words are
# matched to the script's (difflib on normalised tokens), and script words whisper heard
# differently (digits for numbers, a misheard name) take or share the time of whatever
# whisper put there. Pauses are then found in the audio itself (RMS) and capped, sentence
# ends being known from the script, and every time is shifted by what was cut before it, so
# whisper runs once and the timings stay exact.
#
# Run it with any python that has numpy. faster-whisper lives in its own interpreter on this
# machine (WHISPER_PY below, or env WHISPER_PYTHON); if this python cannot import it, the
# script calls itself there for the transcription step only (--transcribe in out).
import argparse, difflib, json, os, re, subprocess, sys, wave

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kit  # noqa: E402
_CFG = kit.cfg()
WHISPER_PY = os.environ.get('WHISPER_PYTHON') or _CFG.get('whisper_python') or ''
WHISPER_MODEL = os.environ.get('WHISPER_MODEL') or _CFG.get('whisper_model') or 'medium.en'
SR = 48000
PAUSE_SENTENCE = 0.22   # longest pause left after . ! ?
PAUSE_OTHER = 0.10      # longest pause left anywhere else
EDGE = 0.05             # silence kept before the first word and after the last
CAPTION_LAG = 1.3       # frames: in the reference video a caption shows this long after whisper's word start
# word starts after a pause (see snap_to_speech; values fitted on the reference video's hand-checked captions)
SNAP_DIP_DB = 12        # a dip this far under the word's own peak...
SNAP_MIN = 0.10         # ...lasting at least this long...
SNAP_LATE = 0.20        # ...and beginning this soon after whisper's start is the pause, not the word
SNAP_LEAD = 0.11        # the reference shows such a word this long before it is heard (2 frames, with CAPTION_LAG)
SENT_END = re.compile(r'[.!?\u2026]["\')\]\u201d\u2019]*$')


# ---- transcription (runs in the whisper interpreter) -----------------------------------
def load16k(src):
    # ffmpeg -> 16 kHz mono float32 array; avoids PyAV, whose newer releases break faster-whisper's file loading
    import numpy as np
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'],
                         stdout=subprocess.PIPE, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def transcribe(src, dst):
    from faster_whisper import WhisperModel
    audio = load16k(src)
    def run(device, compute):
        m = WhisperModel(WHISPER_MODEL, device=device, compute_type=compute)
        segs, _ = m.transcribe(audio, word_timestamps=True, vad_filter=False)
        return list(segs)
    try: segs = run('cuda', 'float16')
    except Exception as e:
        print('cuda failed, using cpu:', e, file=sys.stderr)
        segs = run('cpu', 'int8')
    words = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in segs for w in s.words]
    json.dump(words, open(dst, 'w'), indent=0)


def whisper_words(src, cache, force=False):
    stamp = [os.path.abspath(src), os.path.getsize(src), int(os.path.getmtime(src))]
    if not force and os.path.exists(cache):
        c = json.load(open(cache))
        if c.get('source') == stamp: return c['words']
    tmp = cache + '.tmp'
    try:
        import faster_whisper  # noqa: F401
        transcribe(src, tmp)
    except ImportError:
        if not WHISPER_PY:
            sys.exit('faster-whisper is not installed in this python. Run setup.py again, or pip install faster-whisper, '
                     'or set "whisper_python" in config.json to a python that has it.')
        subprocess.run([WHISPER_PY, os.path.abspath(__file__), '--transcribe', src, tmp], check=True)
    words = json.load(open(tmp)); os.remove(tmp)
    json.dump({'source': stamp, 'words': words}, open(cache, 'w'))
    return words


# ---- script <-> whisper alignment -------------------------------------------------------
norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())


def script_words(text):
    # display words keep their punctuation; a token with no letters or digits (a lone dash) rides on the word before it
    out = []
    for tok in text.split():
        if norm(tok) or not out: out.append(tok)
        else: out[-1] += ' ' + tok
    return out


def align(script, heard):
    # script: display words. heard: [{w, s, e}]. Returns ([[start, end] per script word], stats).
    heard = [h for h in heard if norm(h['w'])]
    a = [norm(w) for w in script]; b = [norm(h['w']) for h in heard]
    t = [None] * len(a); loose = []; matched = 0
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if tag == 'equal':
            matched += i2 - i1
            for k in range(i2 - i1): t[i1 + k] = [heard[j1 + k]['s'], heard[j1 + k]['e']]
        elif tag == 'replace':
            loose.append((' '.join(script[i1:i2]), ' '.join(h['w'] for h in heard[j1:j2])))
            if i2 - i1 == j2 - j1:   # same count: misheard words, one for one
                for k in range(i2 - i1): t[i1 + k] = [heard[j1 + k]['s'], heard[j1 + k]['e']]
            else:                    # "eight hundred" vs "800", "percent" vs "%": share the stretch by word length
                spread(t, script, i1, i2, heard[j1]['s'], heard[j2 - 1]['e'])
        elif tag == 'delete':
            loose.append((' '.join(script[i1:i2]), ''))
    # script words whisper never heard: fit them between their neighbours
    i = 0
    while i < len(t):
        if t[i] is not None: i += 1; continue
        j = i
        while j < len(t) and t[j] is None: j += 1
        lo = t[i - 1][1] if i else 0.0
        hi = t[j][0] if j < len(t) else (heard[-1]['e'] if heard else lo)
        spread(t, script, i, j, lo, max(hi, lo))
        i = j
    for i in range(1, len(t)):   # starts never run backwards
        if t[i][0] < t[i - 1][0]: t[i][0] = t[i - 1][0]
        t[i][1] = max(t[i][1], t[i][0])
    return t, {'script_words': len(a), 'whisper_words': len(b), 'matched': matched, 'loose': loose}


def spread(t, script, i1, i2, lo, hi):
    n = [max(1, len(norm(w))) for w in script[i1:i2]]; tot = float(sum(n)); acc = 0
    for k in range(i2 - i1):
        t[i1 + k] = [lo + (hi - lo) * acc / tot, lo + (hi - lo) * (acc + n[k]) / tot]; acc += n[k]


# ---- silence trimming ---------------------------------------------------------------------
def load(path):
    import numpy as np
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], stdout=subprocess.PIPE, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def save(path, x):
    import numpy as np
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())


def find_pauses(x, silence_db=-38.0, min_len=0.06):
    # [(start, end)] in seconds of every stretch quieter than silence_db under the speech level
    import numpy as np
    hop = SR // 200  # 5ms
    n = len(x) // hop
    env = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-14)
    level = np.percentile(env, 95)
    quiet = env < max(level * 10 ** (silence_db / 20), 10 ** (-70 / 20))
    out = []; i = 0
    while i < n:
        if not quiet[i]: i += 1; continue
        j = i
        while j < n and quiet[j]: j += 1
        if (j - i) * hop / SR >= min_len or i == 0 or j == n: out.append((i * hop / SR, j * hop / SR if j < n else len(x) / SR))
        i = j
    return out


def snap_to_speech(times, x):
    # Whisper hands the pause before a word to that word, so a word after a comma or a full
    # stop "starts" several frames early. Look inside each word's own stretch of audio: a dip
    # at its beginning is the pause, and the word really starts where the level comes back.
    import numpy as np
    hop = SR // 100; n = len(x) // hop
    env = 10 * np.log10((x[:n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-14)
    out = []
    for s, e in times:
        a, b = int(round(s * 100)), int(round(e * 100)); seg = env[a:b]
        if len(seg) > 8:
            q = seg < seg.max() - SNAP_DIP_DB; j = 0
            while j < len(seg) - 8 and j * 0.01 <= SNAP_LATE:
                if not q[j]: j += 1; continue
                k = j
                while k < len(seg) and q[k]: k += 1
                if (k - j) * 0.01 >= SNAP_MIN and k < len(seg) - 4: s = max(s, (a + k) / 100 - SNAP_LEAD); break
                j = k
        out.append([s, e])
    return out


def plan_cuts(pauses, total, times, script):
    # which stretches to remove so that no pause is longer than its cap; times = per-word [start, end] or None
    cuts = []
    for a, b in pauses:
        if a <= 0: keep_a, keep_b = 0.0, EDGE                 # head
        elif b >= total - 1e-9: keep_a, keep_b = EDGE, 0.0    # tail
        else:
            cap = PAUSE_OTHER
            if times:
                # the word before a pause is the last one that is over by the time the pause is
                prev = None
                for i, (_, e) in enumerate(times):
                    if e <= b: prev = i
                    else: break
                if prev is not None and SENT_END.search(script[prev]): cap = PAUSE_SENTENCE
            keep_a = keep_b = cap / 2
        if b - a > keep_a + keep_b + 0.005: cuts.append((a + keep_a, b - keep_b))
    return cuts


def apply_cuts(x, cuts):
    import numpy as np
    f = int(0.003 * SR); parts = []; pos = 0
    for a, b in cuts:
        seg = x[pos:int(a * SR)].copy()
        if parts and len(seg) > f: seg[:f] *= np.linspace(0, 1, f)   # joins are in silence; the fades just kill clicks
        if len(seg) > f: seg[-f:] *= np.linspace(1, 0, f)
        parts.append(seg); pos = int(b * SR)
    seg = x[pos:].copy()
    if parts and len(seg) > f: seg[:f] *= np.linspace(0, 1, f)
    parts.append(seg)
    return np.concatenate(parts)


def retime(t, cuts):
    # where a moment of the raw file lands after the cuts (int() mirrors apply_cuts exactly)
    gone = 0.0
    for a, b in cuts:
        a, b = int(a * SR) / SR, int(b * SR) / SR
        if t >= b: gone += b - a
        elif t > a: gone += t - a
    return t - gone


# ---- outputs ------------------------------------------------------------------------------
def captions(script, times, fps):
    caps = [[w, int(round(s * fps + CAPTION_LAG))] for w, (s, _) in zip(script, times)]
    if caps: caps[0][1] = 0                    # the first word is up from the first frame
    for i in range(1, len(caps)):              # one word per frame at most
        if caps[i][1] <= caps[i - 1][1]: caps[i][1] = caps[i - 1][1] + 1
    return caps


def sentences(script, times, fps):
    out = []; i0 = 0
    for i, w in enumerate(script):
        if SENT_END.search(w) or i == len(script) - 1:
            s, e = times[i0][0], times[i][1]
            out.append({'text': ' '.join(script[i0:i + 1]), 'start': round(s, 3), 'end': round(e, 3), 'startFrame': int(round(s * fps)), 'endFrame': int(round(e * fps)), 'words': [i0, i]})
            i0 = i + 1
    return out


def main():
    if len(sys.argv) == 4 and sys.argv[1] == '--transcribe': return transcribe(sys.argv[2], sys.argv[3])
    ap = argparse.ArgumentParser()
    ap.add_argument('--video', required=True); ap.add_argument('--voice', required=True)
    ap.add_argument('--script', default=''); ap.add_argument('--fps', type=float, default=30)
    ap.add_argument('--no-trim', action='store_true'); ap.add_argument('--force', action='store_true')
    ap.add_argument('--silence-db', type=float, default=-38.0); ap.add_argument('--no-snap', action='store_true')
    o = ap.parse_args()
    adir = os.path.join(ROOT, 'videos', o.video, 'audio'); cdir = adir
    os.makedirs(adir, exist_ok=True); os.makedirs(cdir, exist_ok=True)
    script_p = o.script or os.path.join(ROOT, 'videos', o.video, 'script.txt')

    heard = whisper_words(o.voice, os.path.join(adir, 'whisper.json'), o.force)
    if os.path.exists(script_p):
        text = ' '.join(l for l in open(script_p, encoding='utf-8').read().splitlines() if not l.lstrip().startswith('#'))
        script = script_words(text)
    else:
        print(f'warning: no script at {script_p}; captions will be whisper\'s own words')
        script = [h['w'] for h in heard if norm(h['w'])]
    times, st = align(script, heard)
    print(f"aligned {st['script_words']} script words to {st['whisper_words']} whisper words: {st['matched']} matched exactly, {len(st['loose'])} loose stretches")
    for s, h in st['loose']: print(f'   script "{s}"  <-  whisper "{h}"')
    if st['matched'] < 0.8 * st['script_words']: print('warning: under 80% of the script matched; is this the right script for this audio?')

    x = load(o.voice); before = len(x) / SR
    if not o.no_snap: times = snap_to_speech(times, x)
    cuts = [] if o.no_trim else plan_cuts(find_pauses(x, o.silence_db), before, times, script)
    y = apply_cuts(x, cuts) if cuts else x
    times = [[retime(s, cuts), retime(e, cuts)] for s, e in times]
    print(f'voice: {before:.2f}s -> {len(y) / SR:.2f}s ({len(cuts)} pauses tightened)' if not o.no_trim else f'voice: {before:.2f}s, timing kept')
    save(os.path.join(adir, 'voice.wav'), y)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(adir, 'voice.wav'), '-c:a', 'aac', '-b:a', '192k', os.path.join(adir, 'voice.m4a')], check=True)

    json.dump([{'word': w, 'start': round(s, 3), 'end': round(e, 3)} for w, (s, e) in zip(script, times)], open(os.path.join(adir, 'words.json'), 'w', encoding='utf-8'), indent=0, ensure_ascii=False)
    json.dump(sentences(script, times, o.fps), open(os.path.join(adir, 'sentences.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    caps = captions(script, times, o.fps)
    with open(os.path.join(cdir, 'captions.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('// [word, startFrame] - generated by tools/voice.py from the script and the voice timing\nexport const CAPTIONS = ' + json.dumps(caps, ensure_ascii=False) + ';\n')
    print(f'wrote {len(caps)} captions, last word at frame {caps[-1][1]} ({len(y) / SR * o.fps:.0f} frames of audio)')


if __name__ == '__main__':
    main()
