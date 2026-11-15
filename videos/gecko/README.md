# What if you had a gecko's feet? (body + animal powers, owl formula)

20.5 s, 1080x1920 60 fps (CRF 12). Frame 0: the guy spread flat on a tall brick wall on green gecko toe pads, sliding down
(green skid marks), a smug gecko stuck beside him. GECKO TOE X-RAY (pad -> hairs, counter to 6,500,000), the gecko
dangling an ON PAPER weight counting to 130 kg, the comedy hit (his pads peel, he drops, BOING, dizzy, laugh), the
STICKY SKIN NEEDED body map filling to 40 % (= YOUR WHOLE FRONT), and the ending (whole front in pads, SPLAT, stuck high
up, the gecko strolls down past him) that loops into frame 0. Everything drawn in code in `src/Gecko.tsx` - the guy too
(`GuyBody`: spread / arms-down limbs, toe pads, whole-front pads), plus `Gecko` (top-down, smug lids, walking legs).

Voice: James, eleven_v4, one take; tighten.py --tempo 1.1: 23.8 s -> 19.4 s (`public/gecko/vo/tight.mp3`). Word times
from ElevenLabs Scribe.

    npm install
    node scripts/check-loop.mjs Gecko
    CRF=12 node scripts/render.mjs Gecko renders/gecko-1080x1920.mp4
    COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0    (then ThumbWide)
