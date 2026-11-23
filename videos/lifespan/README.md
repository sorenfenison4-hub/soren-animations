# What if you lived as long as these animals? (18.3 s)

The user, 2026-11-23: "next million view idea" + "make 3 more" - video 4 of the 4 made that day (videos/beaver, videos/squeeze,
videos/rabbit, videos/lifespan). The second LADDER test (the first: videos/jump, 8.7K): one question, many animals, one number climbing,
the top rung hits his body - the format of the small-channel million-view Shorts in research/2026-11-20-findings.md.

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: live longer and longer - and at the top, live forever (one of the biggest wishes there is).
2. BACKFIRE: the forever rung: when you got old you'd melt into a blob and turn back into a baby, then start over. It hits the very thing
   you wanted (a long life) and your own body.
3. ICON: tortoise, shark, clam, jellyfish - all nameable by a 6-year-old; "the immortal jellyfish" is a famous fact.
4. FEEL IT NOW: the weak spot (age is not a body part you use) - accepted for the ladder test, like the flea's legs; the beard that
   grows with the counter makes the age visible on his body.
5. SHOW IT: frame 0 = the first rung mid-action: a tortoise shell on his back, his beard growing as the AGE counter races past 118 toward
   190, a smug old tortoise beside him. The backfire (the melt, the blob, the baby) lands at 13-15 s, on purpose (ladder format).
6. NUMBER: one live counter - 190 -> ~400 -> 507 -> infinity -> 0 - with the finished rungs ranked under it.
Cadence: the butterfly (melting) is 6 uploads back by the time this goes up; the octopus puddle (videos/squeeze) 2 back - different picture
(a blob that turns into a baby, not a puddle).

## Facts (verified 2026-11-23)
- Jonathan, a Seychelles giant tortoise (Saint Helena), hatched about 1832; 190 in 2022, the oldest known living land animal (Guinness; his
  age is an estimate) -> "Live like a tortoise, and you'd make it to 190."
- Greenland shark: radiocarbon dating of eye lenses gave the oldest of 28 sharks 392 years (range 272-512; Nielsen et al. 2016, Science)
  -> "about 400" (the rung shows "~400").
- Ocean quahog "Ming", collected off Iceland in 2006: 507 years by its shell growth bands (Butler et al. 2013).
- Turritopsis dohrnii, the immortal jellyfish: when old, injured, starved or stressed, the adult (medusa) can turn back into a polyp, its
  earliest stage, through a cyst-like blob that settles and grows into a new polyp, which buds new jellyfish; it can repeat this (Piraino et
  al. 1996, Biological Bulletin - published as T. nutricula; Britannica). "Immortal" means it doesn't have to die of old age - it can still
  be eaten or get sick (Britannica). "Turn back into a baby" = the polyp, its juvenile stage.

## Script (55 words)
"Live like a tortoise, and you'd make it to 190. Like a Greenland shark, about 400. Like one old clam, 507. But live like the immortal
jellyfish, and you'd never die of old age. When you got old, you'd melt into a blob and turn back into a baby. Then start all over again."

## Build
Scene `src/Lifespan.tsx`, all drawn in code:
- the guy = the code-drawn front view (butterfly rig) with an age: a grey beard (`beardPuffs`: a column of puffs from the chin that turns
  into a heap on the floor once it is longer than he is tall), wrinkles over 150, eye bags over 300, a cane, a hunch and a tremble when
  ancient; rung accessories: a tortoise shell on his back, a shark fin, a clam shell to sit in, a jellyfish bell with tentacles at the sides;
  `melt` squashes him into the floor, then `Blob` (a jelly mound with his worried face), a polyp stalk, `Baby` (diaper, pacifier, WAAH) that
  grows back to full size;
- animals: `Tortoise` (side view, wrinkly neck, round glasses, hex shell), `GShark` (Greenland shark, side view, slow sway, smug),
  `Clam` (an old quahog peeking out between its shells), `Jelly` (bobbing bell, frilly edge, tentacles);
- sets per rung: a beach (sea band, palms), the deep sea, the sea floor, open water; light rays and bubbles;
- `AgeBoard`: YOUR AGE counter (the digits race, spin wildly on the jellyfish rung and land on infinity, then 0 in red) with the finished
  rungs ranked under it (TORTOISE 190, GREENLAND SHARK ~400, OLD CLAM 507, IMMORTAL JELLYFISH infinity).
Rungs: 0 s beach, tortoise, 118 -> 190 (DING 2.2); 2.88 POOF, deep sea, Greenland shark, -> 400 (4.95); 5.2 POOF, sea floor, clam, -> 507
(6.95); 7.72 POOF, jellyfish bell, digits spin -> infinity 10.42 (IMMORTAL JELLYFISH, NEVER DIES OF OLD AGE); 11.55 ancient (cane, beard heap);
13.05 he melts, BLOB 13.7 (MELTS INTO A BLOB); polyp 14.42, POOF, baby 14.6, AGE 0 (BACK TO A BABY, WAAH); 15.62 beach, the baby grows up,
the counter climbs again (AGAIN AND AGAIN) = frame 0. CTA 11.6 (top band), CommentAsk "Would you want to live forever?".
Voice: James, eleven_v4, one take (21.4 s, 271 credits) -> `scripts/vsplice.py` (line 1 at 1.18, the rest at 1.12) -> 17.1 s, first word 0.11
s. Sounds: kit only (rewind, ticks, ding, confetti, pop, bubbles, clack, shimmer, whir, squeak, stretch, squelch, thud, crowd laugh, giggle).
Render: `node scripts/render.mjs Lifespan renders/lifespan-1080x1920.mp4 1`; `node scripts/check-loop.mjs Lifespan` = seamless loop (frame 0 vs
0.5 s: 12.1, moving). Thumbnails ("AGE infinity": ancient, beard heap, the jellyfish bell, the smug jellyfish).
