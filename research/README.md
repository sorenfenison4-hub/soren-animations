# Shorts research tools (no vidIQ credits needed)

Needs `pip install yt-dlp` and youtube.com / i.ytimg.com allowed in the environment's network (added 2026-11-19).
Only public data: search results, a channel's Shorts list with view counts, and YouTube's public frame images.
From this server YouTube's player asks to sign in ("confirm you're not a bot") - don't try to get around it.

    python3 -I research/channel_shorts.py <outdir> 200 UCv6BUckmVIc4zZ022f7f_jQ    # our channel: live views per Short
    python3 -I research/shorts_search.py <out.json> 40 "what if you had" ...       # Shorts-only search (relevance + most viewed)
    python3 -I research/frames.py <framedir> <sheet.png> "<videoId>|label" ...     # frame 0 + ~25/50/75 % frames, one row per Short

    python3 -I research/report_tables.py <outdir> tables.md data.json             # markdown tables + data json from the files above
                                                                                  # (expects channel_shorts.json, ch_*.json, shorts*.json in <outdir>)

2026-11-22: channel_shorts.py still works; the Shorts-only search (shorts_search.py) now returns only 0-3 results per query
from this server, so it no longer gives a useful sample.

Findings so far: `2026-11-19-findings.md` (raw numbers in `data/2026-11-19.json`). Add a new dated file each time.

`https://i.ytimg.com/vi/<id>/frame0.jpg` is the vertical first frame of a Short (what people see before they swipe);
`maxres1/2/3.jpg` are frames at about 25/50/75 % (16:9 with the Short in the middle; frames.py crops it).
Keep downloaded frames out of the repo (other creators' pictures).
