# usage: python3 -I channel_shorts.py <outdir> <n> <channel_id>...  -> <outdir>/ch_<id>.json + summary (median, top, bottom)
import sys, json, subprocess, os, statistics, time
out, n = sys.argv[1], sys.argv[2]
for cid in sys.argv[3:]:
    r = subprocess.run([sys.executable, '-I', '-m', 'yt_dlp', '--flat-playlist', '-J', '--playlist-end', n, f'https://www.youtube.com/channel/{cid}/shorts'], capture_output=True, text=True)
    try: d = json.loads(r.stdout)
    except Exception: print('FAIL', cid, r.stderr[-200:]); continue
    es = [{'id': e['id'], 'title': e.get('title'), 'views': e.get('view_count') or 0} for e in d.get('entries', []) if e.get('id')]
    json.dump({'channel': d.get('channel'), 'subs': d.get('channel_follower_count'), 'entries': es}, open(os.path.join(out, f'ch_{cid}.json'), 'w'), indent=1)
    v = [e['views'] for e in es]
    med = statistics.median(v) if v else 0
    print(f"\n### {d.get('channel')} | subs {d.get('channel_follower_count')} | latest {len(es)} Shorts | median {med:,.0f}")
    for e in sorted(es, key=lambda e: -e['views'])[:8]: print(f"  TOP {e['views']:>12,} ({e['views']/max(med,1):5.1f}x) {e['title'][:80]}")
    for e in sorted(es, key=lambda e: e['views'])[:4]: print(f"  LOW {e['views']:>12,} ({e['views']/max(med,1):5.2f}x) {e['title'][:80]}")
    time.sleep(1)
