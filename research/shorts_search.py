# usage: python3 -I shorts_search.py <out.json> <n> <query>...   (Shorts-only search, by relevance and by view count; merges into out.json)
import sys, json, subprocess, urllib.parse, os, time
out, n = sys.argv[1], sys.argv[2]; qs = sys.argv[3:]
rows = json.load(open(out)) if os.path.exists(out) else {}
for q in qs:
    for sp, how in (('EgIQCQ%3D%3D', 'rel'), ('CAMSAhAJ', 'views')):
        url = 'https://www.youtube.com/results?search_query=' + urllib.parse.quote_plus(q) + '&sp=' + sp
        r = subprocess.run([sys.executable, '-I', '-m', 'yt_dlp', '--flat-playlist', '-J', '--playlist-end', n, url], capture_output=True, text=True)
        try: d = json.loads(r.stdout)
        except Exception: print('FAIL', q, how); continue
        k = 0
        for e in d.get('entries', []):
            if not e or not e.get('id') or '/shorts/' not in (e.get('url') or ''): continue
            k += 1
            x = rows.setdefault(e['id'], {'id': e['id'], 'title': e.get('title'), 'views': e.get('view_count'), 'channel': e.get('channel') or e.get('uploader'),
                                         'channel_id': e.get('channel_id'), 'dur': e.get('duration'), 'queries': []})
            x['views'] = e.get('view_count') or x['views']; x['queries'].append(q)
        print(f'{q!r:45} {how:5} {k}')
        time.sleep(1.0)
json.dump(rows, open(out, 'w'), indent=1)
print('total unique', len(rows))
