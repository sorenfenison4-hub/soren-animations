# Usage (from the video folder, after vsplice.py wrote src/data/words.json):  python3 scripts/refine_words.py 7,8,5,1,3,4,4,13,3,5,1,5
# The list = words per speech chunk of the tight voice (chunks = loud runs split by >= 0.1 s pauses; the script prints them).
# Refine Scribe word times (video time) per speech chunk against the tight voice's loudness:
# each chunk's words are mapped linearly from [first start, last end] onto [onset, offset] of that chunk.
import subprocess, json, numpy as np, sys
sr, AT = 44100, 0.1
x = np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','public/piranha/vo/tight.mp3','-ac','1','-ar',str(sr),'-f','s16le','-'],capture_output=True).stdout,np.int16).astype(np.float32)/32768
hop = int(0.01*sr); n = len(x)//hop
db = np.array([20*np.log10(np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2))+1e-9) for i in range(n)])
loud = db > -40
# chunks = loud runs separated by >= 0.1 s quiet
chunks, i = [], 0
while i < n:
    if loud[i]:
        j = i
        while True:
            while j < n and loud[j]: j += 1
            k = j
            while k < n and not loud[k]: k += 1
            if k < n and (k - j) < 10: j = k; continue
            break
        chunks.append((i*0.01+AT, j*0.01+AT)); i = j
    else: i += 1
print('chunks', [(round(a,2), round(b,2)) for a,b in chunks])
W = json.load(open('src/data/words.json'))
sizes = [int(v) for v in sys.argv[1].split(',')]
assert sum(sizes) == len(W), (sum(sizes), len(W))
assert len(sizes) == len(chunks), (len(sizes), len(chunks))
out, p = [], 0
for (a, b), m in zip(chunks, sizes):
    ws = W[p:p+m]; p += m
    s0, e0 = ws[0]['s'], ws[-1]['e']
    f = lambda t: a + (t - s0) / max(1e-6, e0 - s0) * (b - a)
    for w in ws: out.append({'w': w['w'], 's': round(f(w['s']), 3), 'e': round(min(b, f(w['e'])), 3)})
json.dump(out, open('src/data/words.json', 'w'), indent=0)
print(' '.join(f"{w['w'].strip('.,?')}:{w['s']:.2f}" for w in out))
print('last end', out[-1]['e'])
