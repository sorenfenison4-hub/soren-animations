# Why has Roman concrete lasted 2,000 years?

19.2 s, 1080x1920 60 fps. Everything is drawn in code (no new Higgsfield pictures): `src/Concrete.tsx` has the Roman
concrete block with a laurel wreath and a face (`RomanBlock`: aggregate stones, white lime lumps, cracks that draw
themselves and then fill with water, dissolved lime and new stone - `CrackLine`), the modern block with a hard hat and
steel bars that rust and crack it (`ModernBlock`), a mixing trough with quicklime and steam, and the Pantheon, an aqueduct
and cypress trees behind. Voice: James, eleven_v4, one take (`public/concrete/vo/take1.mp3`). New sounds, also added to
the kit library: `crack.wav` (stone crack: small crackles, the big snap 0.32 s in) and `hiss.wav` (steam hiss, 2.6 s).

    npm install
    node scripts/check-loop.mjs Concrete
    node scripts/render.mjs Concrete renders/concrete-1080x1920.mp4
    COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0     (then ThumbWide)
