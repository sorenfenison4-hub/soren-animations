# Why is he building a tower to the Moon? (story Short, night)

30.6 s, 1080x1920 60 fps. The channel's first story: the guy has spent 60 years building a tower that is only as tall as
his door. He isn't trying to reach the Moon: it drifts away about 3.8 cm a year, so he adds one 3.8 cm slab a year and
they stay exactly as close as the night they met. "One more." loops back to the opening hop.

Everything is drawn in code (no new Higgsfield pictures). `src/Tower.tsx` has:
- a night version of the notebook look: navy marker sky, two star layers (cut-paper sparkles + flat dots), soft
  moonlight and window glows in a `paper={false}` layer;
- `Tower` (thin slabs with one merged outline), `Slab`, `House` (lit window, door as tall as the tower), `Hill`;
- the night `Moon` with a face and optional blush, `DimArrow` (self-drawing double arrow), `Txt` (white / gold world
  text with an ink outline), `Heart`, `HaHa` (laughing speech bubbles);
- a time-lapse: the tower rewinds to 1966 and rebuilds slab by slab with a year badge and clicker ticks, while the Moon
  rises in step so the dashed line between them never changes length.

Voice: James, eleven_v4, one take (`public/tower/vo/take1-trim.mp3`, leading silence trimmed). Word times came from the
ElevenLabs connector's Scribe transcription of the take (the whisper model download is blocked in cloud sessions).

    npm install
    node scripts/check-loop.mjs Tower
    node scripts/render.mjs Tower renders/tower-1080x1920.mp4
    COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0    (then ThumbWide)
