# Why does his bridge get longer every year? (story Short, Iceland)

29.6 s, 1080x1920 60 fps. A story in the format of the tower video: the guy's house is on the North American plate,
his neighbour's (red bobble hat) on the Eurasian plate. In Iceland they pull apart about 2 cm a year, so every year he
adds one 2 cm plank to the little bridge over the crack. Fifty years, one metre; every morning they still meet in the
middle for coffee. "One more." loops back to the opening plank drop.

Everything is drawn in code (no new Higgsfield pictures). `src/Bridge.tsx` has:
- `Plate` (cut-paper rock slabs with grass and strata; both edges share one crack profile, so at gap 0 they fit),
  `Bridge` (2 cm planks, posts, sagging rope rail), `House`, `Mountains`, `Sun`, `Mug`, `BobbleHat` + `headOf`
  (the neighbour is the guy's cut-out with a hat; the guy wears nothing), `IcelandMap` sticker, `PushArrow`, `DimArrow`;
- a time-lapse: the plates rewind to 1976 (no gap) and pull apart plank by plank with a year badge and clicker ticks.

Voice: James, eleven_v4, one take (`public/bridge/vo/take1-trim.mp3`). Word times from the connector's Scribe transcript.

    npm install
    node scripts/check-loop.mjs Bridge
    node scripts/render.mjs Bridge renders/bridge-1080x1920.mp4
    COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0    (then ThumbWide)
