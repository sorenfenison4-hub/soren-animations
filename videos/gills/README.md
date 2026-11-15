# What if you had a fish's gills? (body + animal powers, story format)

23.4 s, 1080x1920 60 fps (CRF 12). Story like the zebra Short ("He got fish gills... and nearly drowned in the sea."):
the guy gasps with flapping red gills, an AIR vs WATER oxygen panel (30x LESS), buckets poured through his neck with a
live BUCKETS A MINUTE counter (5 -> 40 when he swims), comedy hit (he puffs up like a pufferfish: BOING + stars + laugh),
the smug, cold-blooded fish, the land beat with a YOUR GILLS insert collapsing in air, and the ending (he hands the gills
back, the fish gives him a snorkel) that loops into frame 0. Everything drawn in code in `src/Gills.tsx` over library poses.

Voice: James, eleven_v4, one take; tighten.py --tempo 1.1: 27.4 s -> 22.4 s (`public/gills/vo/tight.mp3`).
(`take_v1.mp3` = the first, non-story script, unused.)

    npm install
    node scripts/check-loop.mjs Gills
    CRF=12 node scripts/render.mjs Gills renders/gills-1080x1920.mp4
    COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0    (then ThumbWide)
