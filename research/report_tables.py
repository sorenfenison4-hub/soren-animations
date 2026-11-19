# usage: python3 -I report_tables.py <outdir> <tables.md> <data.json> - markdown tables + a compact data json from the
# files the other tools wrote into <outdir> (our channel: channel_shorts.json or ch_<our id>.json; others: ch_*.json;
# searches: shorts*.json)
import json, sys, statistics, re, os
clean = lambda t: re.sub(r'\s+', ' ', re.sub(r'#\S+', '', t or '')).strip().replace('|', '-').strip(' -')
yt, out_md, out_json = sys.argv[1], sys.argv[2], sys.argv[3]
OURS = 'UCv6BUckmVIc4zZ022f7f_jQ'
if os.path.exists(os.path.join(yt, 'channel_shorts.json')):        # plain yt-dlp -J of our /shorts page
    ours = json.load(open(os.path.join(yt, 'channel_shorts.json')))
else:                                                             # channel_shorts.py output for our channel
    c = json.load(open(os.path.join(yt, f'ch_{OURS}.json')))
    ours = {'channel_follower_count': c['subs'], 'entries': [{'id': e['id'], 'title': e['title'], 'view_count': e['views']} for e in c['entries']]}
md = []; data = {'date': '2026-11-19', 'ours': [], 'channels': [], 'top_shorts': []}
md.append('### Our channel (public counts, 2026-11-19, %s subscribers)\n\n| Short | Views | id |\n|---|---|---|' % ours.get('channel_follower_count'))
for e in ours['entries']:
    md.append(f"| {e['title'].split('#')[0].strip()} | {e.get('view_count') or 0:,} | {e['id']} |")
    data['ours'].append({'id': e['id'], 'title': e['title'], 'views': e.get('view_count')})
md.append('\n### Comparable channels: median Short vs their outliers (latest Shorts on the channel page)\n\n| Channel | Subs | Shorts read | Median | Top Shorts (views, x median) | Worst |\n|---|---|---|---|---|---|')
for f in sorted(os.listdir(yt)):
    if not f.startswith('ch_') or OURS in f: continue
    d = json.load(open(os.path.join(yt, f))); es = d['entries']; v = [e['views'] for e in es]
    if not v: continue
    med = statistics.median(v)
    top = sorted(es, key=lambda e: -e['views'])[:4]; low = sorted(es, key=lambda e: e['views'])[:2]
    fmt = lambda e: f"{clean(e['title'])[:60]} ({e['views']/1e6:.1f}M, {e['views']/max(med,1):.0f}x)" if e['views'] >= 1e6 else f"{clean(e['title'])[:60]} ({e['views']:,}, {e['views']/max(med,1):.2f}x)"
    md.append(f"| {d['channel']} | {d['subs']:,} | {len(es)} | {med:,.0f} | {'; '.join(fmt(e) for e in top)} | {'; '.join(fmt(e) for e in low)} |")
    data['channels'].append({'channel': d['channel'], 'subs': d['subs'], 'n': len(es), 'median': med, 'top': top, 'worst': low})
rows = {}
for f in ('shorts.json', 'shorts2.json'):
    p = os.path.join(yt, f)
    if os.path.exists(p): rows.update(json.load(open(p)))
rel = re.compile(r'what if|if you|if humans|if a human|superpower|animal power|happens if|anatomy|abilities', re.I)
kid = re.compile(r'monica toy|cocomelon|nursery|paw patrol|gabby|blippi|kids songs|nick jr', re.I)
sel = [r for r in rows.values() if r.get('views') and rel.search(r.get('title') or '') and not kid.search((r.get('title') or '') + ' ' + (r.get('channel') or ''))]
sel.sort(key=lambda r: -r['views'])
md.append('\n### Most viewed "what if" / superpower / animal-power Shorts found (Shorts-only search, 2026-11-19)\n\n| Views | Length | Channel | Title | id |\n|---|---|---|---|---|')
for r in sel[:30]:
    md.append(f"| {r['views']:,} | {r.get('dur')} s | {r.get('channel')} | {clean(r['title'])[:80]} | {r['id']} |")
    data['top_shorts'].append({k: r.get(k) for k in ('id', 'title', 'views', 'dur', 'channel')})
open(out_md, 'w').write('\n'.join(md) + '\n'); json.dump(data, open(out_json, 'w'), indent=1)
print('ok', len(data['ours']), len(data['channels']), len(data['top_shorts']))
