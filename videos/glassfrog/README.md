# What if you could turn see-through like a glass frog?

## Premise screen (CLAUDE.md, Growth) - written before the voice and the art
1. WISH: turn invisible - one of the classic superpowers ("flight or invisibility?"), and a power you DO (the turtle
   lesson: armour is something that happens to you; every hit was a power you use).
2. BACKFIRE: to go see-through the frog pulls nine in ten of its red blood cells out of its blood and packs them in its
   liver. Your red cells carry your oxygen: hide them and your brain goes dark - you pass out. Packed that tight, they
   would clot. It hits the very thing you wanted (vanishing) and hurts your body.
3. ICON: a frog (any kid can name one); its trick - a see-through belly with the heart showing - reads at a glance.
   Borderline: "glass frog" itself is internet-famous rather than 6-year-old famous.
4. FEEL IT NOW: your blood - the pink in your skin (press a fingernail: white, then pink again).
5. SHOW IT: frame 0 = he is see-through and a toucan flies straight into his chest (BONK - it can't see him); at 2.7 s,
   close-up: his face drains, his eyes roll, he slumps out of frame (THUD).
6. NUMBER: nine in ten red blood cells (89 %), counted live; second counter OXYGEN TO YOUR BRAIN 100 -> 11 %.

Other candidates screened (2026-11-19): flea jump (super jump; the landing = falling off a 25-storey building - fails
FEEL IT NOW, legs), camel drinking (weaker wish, 240 % / 10-minute numbers not confirmed), ant strength (spine-crush catch
is about size, not the ant; Zack D. Films has it at 17.6M), cat eyes (blurry daylight = a weird fact, number unsettled),
lizard arm regrowth (strong, but arms were 2 uploads ago - octopus), bear hibernation and polar bear fur (weak wish).
Within the last 3 uploads: turtle shell, octopus arms, shark teeth - no repeat of body part or animal.

## Build
Owl formula, animal-powers series, word-by-word captions (second captions video after turtle). Scene: `src/GlassFrog.tsx`,
all code-drawn. His see-through body = his normal drawing through an SVG colour matrix (`#glassify`: white -> clear glass,
ink stays ink) in a `paper={false}` layer, with a pink heart and a silver "mirror" liver on top; his head stays solid so his
face always reads; a clipPath wipe with sparkles turns him solid <-> glass. The glass frog: opaque green back, see-through
belly (heart, liver, gut), gold eyes with horizontal pupils. A toucan that can't see him flies into his chest (frame 0 and
the ending).
Shots: 0 s see-through him + toucan BONK + frog; 1.6 s close-up: face drains, eyes roll, he slumps out (THUD 3.1 s);
3.4 s X-RAY GLASS FROG (45 cells, 40 pack into the liver = HIDDEN 0 -> 89 %, MIRROR); 7.8 s X-RAY YOU (cells carry oxygen
dots to the brain; 32 of 36 hide = OXYGEN 100 -> 11 %, brain goes dark, DANGER); 11.1 s blackout, only his eyes blink;
11.6 s he vanishes again, his cells pack into his liver -> CLOT; 13.6 s two-shot: the frog shrugs "???", he keels over like
a plank at its feet (THUD, laugh); 15.5 s the frog yawns and falls asleep (blood hides); 17.1 s he vanishes only in his
sleep, the toucan BONKs into him again = frame 0. CTA 13.65 s, CommentAsk "What would you do see-through?".
Voice: James, eleven_v4, one take (23.9 s) -> `scripts/tighten.py --tempo 1.12 --json src/data/words.json` ->
`public/glassfrog/vo/tight.mp3` (19.6 s); first word at 0.16 s. Mix -22.2 LUFS, peak -5.2 dB.
New sounds (ElevenLabs sfx, trimmed, added to the kit library): thud.wav (body falls flat), shimmer.wav (glassy vanish),
squelch.wav (clot).
Render: `node scripts/render.mjs GlassFrog renders/glassfrog-1080x1920.mp4 1`; thumbnails ("YOU'D FAINT"):
`BUNDLE=work/bundle2 COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then ThumbWide).
Lesson: the z=1000 Layer is skipped above camera k 4 (the first close-ups rendered as empty background) - keep k <= 3.9.

## Facts (verified 2026-11-19)
- Resting glass frogs (Hyalinobatrachium fleischmanni) remove about 89 % of their red blood cells from circulation and
  pack them into the liver, which is covered in reflective guanine crystals ("mirror-coated"); this makes them 2-3 times
  more transparent. When they become active again the cells return to the blood (Taboada et al. 2022, Science; Duke and
  American Museum of Natural History releases). They are most transparent while sleeping during the day.
- Packing that many red cells together would normally risk dangerous clots; the frogs don't clot, and how they avoid it
  (and how they get by with so little circulating hemoglobin) is still unknown - a 2024 report still calls it open.
  Their blood still clots normally at a wound.
- Red blood cells carry oxygen; losing nine in ten of them from circulation would starve your brain of oxygen (you
  would lose consciousness). The X-ray's OXYGEN 11 % is the share of red cells left (shown, not said).
- Shown but not said: a toucan (glass frogs live in Central and South American forests where toucans live).
