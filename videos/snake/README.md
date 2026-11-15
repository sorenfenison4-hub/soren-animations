# What if you could swallow like a snake? (body + animal powers, owl formula)

22.7 s, 1080x1920 60 fps (CRF 12). The first video built on the owl formula (CLAUDE.md, Growth): the power is on the guy
at frame 0 (a whole watermelon jammed in his stretched mouth, face going blue), a smug python gulping an egg beside him,
PYTHON JAW X-RAY (two jaw halves, stretchy chin, YOU: 1 BONE), a MOUTH OPENS counter (26 cm vs 5 cm), SNAKE X-RAY (the
windpipe slides forward past the food and breathes), YOUR THROAT (the flap shuts, BREATH PAUSED), the comedy hit (straw
"snorkel" -> the melon shoots out, BOING, dizzy, laugh), and the ending (slices... for now - he eyes a whole melon) that
loops into frame 0. Everything drawn in code in `src/Snake.tsx` (guy head with stretching jaw, `Python`, `Melon`,
`Slice`, the panels) over library poses.

Voice: James, eleven_v4, one take; tighten.py --tempo 1.1: 26.5 s -> 21.8 s (`public/snake/vo/tight.mp3`). Word times
from ElevenLabs Scribe (faster-whisper model download was blocked).

    npm install
    node scripts/check-loop.mjs Snake
    CRF=12 node scripts/render.mjs Snake renders/snake-1080x1920.mp4
    COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0    (then ThumbWide)
