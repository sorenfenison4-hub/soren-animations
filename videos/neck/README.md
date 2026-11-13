# What if you woke up with a giraffe's neck? (what-if Short about YOU, day)

18.7 s, 1080x1920 60 fps (CRF 12). Frame 0: the guy lying in the savanna grass with a neck almost 2 m long, waking up
(loops from the ending "Or you could just lie down"). He stands, passes out (THUD), stands again; a "~2 M" arrow from
heart to head; the x-ray blood climbs the neck and stalls ("NOT ENOUGH"); the giraffe's big heart pumps it all the way
("YOU: 1X / GIRAFFE: 2X"); a giant new heart; lies back down and the blood reaches his head. CommentAsk: "What animal
part should you get next?".

`LongGuy` in `src/Neck.tsx` builds a long neck from any library pose: the body PNG clipped just under the head, a drawn
neck tube (with optional x-ray blood), the head clipped as a circle and moved to the top; whole-body rotation lays him
down. Voice tightened with `scripts/tighten.py` (20.8 s -> 17.7 s).

    npm install
    node scripts/check-loop.mjs Neck
    CRF=12 node scripts/render.mjs Neck renders/neck-1080x1920.mp4
    COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0    (then ThumbWide)
