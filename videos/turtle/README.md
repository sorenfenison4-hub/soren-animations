# What if you had a turtle's shell? (20.1 s)

## Premise screen (CLAUDE.md, Growth) - all six pass
1. WISH: built-in armour, nothing can hurt you ("survive anything").
2. BACKFIRE: the armour is your rib cage. Your ribs would be locked into it, so your chest could never rise: you could
   never take a deep breath again. It hits the very body the shell was meant to protect.
3. ICON: a turtle; famous trick: pulling its head into its shell (he copies it in the gag).
4. FEEL IT NOW: breathe in and feel your ribs lift (BREATHE IN sticker for the viewer).
5. SHOW IT: frame 0 = a dodgeball BONKs off his shell while he stands there smug; at 2.6 s, close-up: his proud deep
   breath won't fit, a padlock CLACKs onto his chest, his face goes purple.
6. NUMBER: over 50 bones in the shell, counted live 0 -> 50+ (second counter: RIBS THAT MOVE 24 -> 0).

Other candidates looked at: camel drinking (weaker wish, needs a medical safety line), bear hibernation (weak "feel it
now"), lizard regrowth (the arm comes back without bones - a "doesn't work" catch), cat eyes (eyes again, number not
settled), cheetah speed / ant strength (no solid body backfire). Within the last 3 uploads: octopus arms, shark teeth,
bat ears - no repeat of body part or animal.

## Build
Owl formula, animal-powers series, FIRST VIDEO WITH WORD-BY-WORD CAPTIONS (the 2026-11-19 test): the kit's `Captions`
over the whole voice-over, words from Scribe via `scripts/tighten.py ... --json src/data/words.json` ("fifty" shown as
"50"), y 1310 (1490 in the close-up so it stays below his face and the padlock). Sticker words kept.
Scene: `src/Turtle.tsx`, all code-drawn - this time the guy's body too (round head, stubby arms and legs, carapace
behind him, plastron in front), so his head can sink into the shell and his arms can cross; the tortoise co-star in
side view with a 3/4 face. Three X-ray panels: TURTLE (ribs run into the shell, 50 bones counted, LOCKED), YOUR RIBS
(they lift on every breath, then a shell slams around them, padlocks, 24 -> 0), TURTLE side cut (the muscle sling pumps
the lungs). Gag (11.2-12.6 s): the turtle pulls its head in (hiss), he copies it, the air is squeezed out of him (PFFFT),
the ball BONKs off the shell, he pops out purple and dizzy. Ending: he stopped dodging and just stands there while the
balls bounce off = frame 0.
Voice: James, eleven_v4, one take (23.8 s) -> `scripts/tighten.py --tempo 1.12` -> `public/turtle/vo/tight.mp3` (19.1 s).
New sounds (ElevenLabs sfx, trimmed, added to the kit library): bonk.wav (hollow ball-on-shell knock, the frame-0 hit),
clack.wav (padlock snap), pfft.wav (air squeezed out), gasp.wav (strained wheezy gasp).
Render: `node scripts/render.mjs Turtle renders/turtle-1080x1920.mp4 1`; thumbnails:
`BUNDLE=work/bundle2 COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then ThumbWide).

## Facts (verified 2026-11-19)
- Turtles' ribs are built into the shell, so they cannot breathe by moving them; they breathe with a sling of abdominal
  muscles instead (Lyson et al. 2014, Nature Communications 5:5211; the stem turtle Eunotosaurus, ~260 million years
  ago, already had the rigid rib cage, and this breathing system is ~50 million years older than the first full shell).
- The shell is made of over 50 bones, including the backbone and ribs (Denver Museum of Nature & Science). Carapace:
  1 nuchal, 8 neurals, 16 costals, 22 peripherals, 2 suprapygals, 1 pygal = 50 (drawn and counted in the X-ray); plastron
  about 9 more. A turtle cannot leave its shell - it is its skeleton.
- You: 24 ribs; when you breathe in, the muscles between the ribs lift them up and out while the diaphragm pulls down
  (the diaphragm does most of the work at rest); 12-20 breaths a minute at rest.
- Shown but not said: the hiss when a turtle pulls its head in (air pushed out of the lungs - only pet-care sources
  describe it). Left out: chest-expansion centimetres (sources disagree).
