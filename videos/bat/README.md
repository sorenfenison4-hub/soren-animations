# What if you had a bat's ears? (21.5 s)

Owl formula, animal-powers series. Scene: `src/Bat.tsx` (all code-drawn; guy body = library sprites, head + bat ears in code).
Voice: James, eleven_v4, one take -> `scripts/tighten.py --tempo 1.12` -> `public/bat/vo/tight.mp3` (words from Scribe).
New sounds (synthesized, added to the kit): screech.wav, buzz.wav (190 chirps a second), ring.wav (ear ringing), click.wav (light switch).
Render: `node scripts/render.mjs Bat renders/bat-1080x1920.mp4 1`; thumbnails: `COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0`.
Facts: Surlykke & Kalko 2008 (PLoS ONE): source levels 122-134 dB SPL at 10 cm, Noctilionidae max above 140 dB;
Elemans et al. 2011 (Science): terminal buzz up to 190 calls/s; middle-ear muscle contracts before each call, ~20-30 dB attenuation.
