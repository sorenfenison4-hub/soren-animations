# What if you were as big as a blue whale?

The user, 2026-11-25: "next idea". Shark formula (the backfire hits his body by ~3 s), animal-powers series, no captions.
Cadence: the last three uploads were shark gills (breathing, shark), rabbit (eyes) and lifespan (age ladder) - size / legs and the
blue whale are new (bones were in squeeze, 4 uploads back; legs in the flea, 10+ back). The old "whale swallowed you like Jonah"
Short (11-14) is a different premise.

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: grow into a giant - the classic giant / growing power (giant-man, Godzilla). A power you ARE and USE (stride over a town),
   and the giant picture travels on its own (Malas 3D "As Tall as an Electric Pole" 12M).
2. BACKFIRE: you'd break your legs with every step. Grow 17 times taller (1.8 m -> 30 m) and your weight goes up 17 x 17 x 17 =
   about 5,000 times, but a bone's strength only with its cross-section, 17 x 17 = about 300 times (the square-cube law, Galileo
   1638; Haldane's giants "ten times as high" break their thigh bones when they walk). It hits the very thing you wanted (being
   huge) and your own body.
3. ICON: the blue whale - "the biggest animal that ever lived" is the one fact every kid knows about it.
4. FEEL IT NOW: your legs holding your weight right now (stand up / feel your feet on the floor).
5. SHOW IT: frame 0 = he high-fives a blue whale that breaches straight up beside him - the same height - in a harbour town that
   only reaches his knees (SLAP on frame 0); he steps onto the quay (BOOM), the second step CRACKs at ~2 s (X-ray flash of his leg
   bones snapping), close-up of his face, he topples back into the sea.
6. NUMBER: 17 times taller -> 5,000 times heavier, bones only 300 times stronger (a versus counter, WEIGHT x5,000 vs BONES x300),
   30 M on the height counter.

Candidates screened the same day (the screened list was used up; seeds from 11-24: gorilla, elephant trunk, the cat fall):
- blue whale size (picked: passes all six, a new picture - a giant in a tiny town - and the twist is clean: the whale only gets away
  with it because the sea holds it up);
- cat "always land on your feet" (cats that fall far land on their feet and hit their chin - high-rise syndrome, broken jaws and
  palates; verified, but a mid wish and close to "it doesn't work"; the high fall repeats the flea);
- hairy frog claws (Wolverine claws -> it breaks its own toe bones and stabs them out through its skin, Blackburn et al. 2008,
  Biology Letters: the best backfire of the day, but nobody knows the trick - fails ICON like the glass frog, 1.3K);
- bee sting (a stinger -> one sting rips your insides out: great backfire, weak wish);
- cheetah speed (still no verified body backfire - the overheating story was disproved, Hetem et al. 2013);
- gorilla strength (no reliable strength number; chimp muscle is only ~1.35x ours, O'Neill et al. 2017);
- elephant trunk (no wish); chameleon camouflage (shows your mood: social, not your body); pufferfish puff (breathing again,
  shark gills is one of the last three uploads); tardigrade (weak icon).
Live comments: yt-dlp hit YouTube's sign-in check on all 8 recent Shorts again (not bypassed) and vidIQ has 3 credits (calls cost
5+), so the comment bubble is made up (@splashy_doodle, 3.3K).

## Facts (verified 2026-11-25)
- Blue whales are the largest animals known to have lived; NOAA gives a maximum of about 31 m (100 ft) and Wikipedia a maximum
  confirmed length of 29.9 m -> "30 M" on screen (the voice says no length). Weight estimates 136-199 t.
- Square-cube law: scale a body up by k and its weight grows with the volume (k^3) while a bone's strength grows with its
  cross-section (k^2) - Galileo, Two New Sciences (1638); J.B.S. Haldane, "On Being the Right Size" (1926): giants ten times as
  high as a man would weigh a thousand times as much, their thigh bones would have only a hundred times the cross-section, and
  they would break them when they walked (also in the University of Virginia scaling lecture, the MIT Press Reader / Scientific
  American 2026 pieces on why giants can't exist).
- 30 m / 1.75 m = 17.1 -> "seventeen times taller"; 17.1^3 = 5,000 -> "five thousand times heavier" (70 kg -> 350 tonnes, more
  than the heaviest blue whale - on screen only); 17.1^2 = 293 -> "three hundred times stronger".
- Why every step: a femur takes about 30 times body weight in compression (open physics textbooks) and far less in bending; the
  hip already carries about 3 times body weight with each walking step; at 17 times the size the stress in the bone is 17 times
  higher, so 17 x 3 = about 50 times -> it breaks on the step (standing still in pure compression would be about 8-17 times).
- Whales: the water carries their weight (buoyancy). Stranded on a beach, a whale's own weight presses on its chest and crushes its
  organs, which can make its breathing and circulation collapse (National Geographic "Why do whales beach themselves"; NOAA
  Fisheries stranding features) -> "On a beach, its own weight crushes it."

## Script (59 words)
"Grow as big as a blue whale, and you'd break your legs with every step. Seventeen times taller makes you five thousand times
heavier, but your bones only three hundred times stronger. A blue whale gets away with it because the sea holds it up. On a beach,
its own weight crushes it. So he stays in the sea."

## Build
Shark formula, animal-powers series, no captions. Scene `src/Whale.tsx`, all drawn in code:
- the guy = the code-drawn front view on a small IK rig (sharkgills / beetle): hip-relative feet, `stand(xa, xb)` puts his soles on the
  sand / sea floor profile (`sandY`); an X-ray flash over the legs (navy legs, white leg bones, red cracks); white plaster casts that pop
  on (`Cast`, one per leg, a heart doodle); moods joy / happy / grin / focus / oof (gritted teeth) / cry (tears squirting) / pop / worry /
  content; the head can be drawn upright or tilted while he lies in the water;
- the blue whale (`Whale`, side view, facing right or `dir` -1): chunky cartoon body, light belly with throat pleats, mottled spots,
  small dorsal fin, flukes that sway, a flipper that rotates (`fin`: the frame-0 high five), blowhole + `Spout` (merged-outline puffs),
  moods smug / happy / laugh / annoyed / dizzy / pop, `sq` squash;
- the beach town: sand profile out of the sea, wet sand, a promenade with six little houses, two cars and three umbrellas that hop when
  he steps, a lighthouse on a rock, a rowboat (flips when he splashes down), a far layer with the horizon, green hills and clouds;
  `BackSea` + a see-through `FrontSea` clipped to the water body (his legs and the whale's tail show through it), shoreline foam;
- `Splash` (a crown of rounded water columns with drops on their tips, one merged outline, flying drops, a foam ring), `Dust` (sand puffs);
- inserts: the size card (`SizeCard`: tiny him 1.8 M vs big him 30 M on bathroom scales, a tape measure that draws itself, the KG counter
  70 -> 350,000, the big scale bursts: ERROR), X-RAY: YOUR LEG (`LegXRay`: a cartoon thigh bone under a red x5,000 arrow, it thickens a
  little and cracks) with the `VsCounter` (WEIGHT x5,000 vs BONES x1 -> x300), X-RAY: BLUE WHALE (`WhaleXRay`: skull, 26 vertebrae, 11
  ribs, flipper bones; blue arrows = the sea holds it up; the water drains onto sand, red arrows press, the ribcage squashes, the water
  comes back).
Shots: 0 s the high five with the whale breaching straight up beside him (comment bubble, out at 1.4 s), it falls back (SPLASH 0.78);
1.62 two steps onto the beach (BOOM 1.79, CRACK 2.11 + X-ray flash); 2.28 close-up OUCH / SNAP, tears; 3.05 he topples back into the sea
(SPLOOSH 3.33, the rowboat flips); 3.70 size card (x17 TALLER, x5,000 HEAVIER, the scale bursts 7.15); 7.55 X-RAY: YOUR LEG (BREAKS 10.05);
10.40 traction: casts pop on, the smug whale spouts (EASY), TWANG 11.46, the casts BONK its head 11.64 (dizzy stars, crowd laugh);
12.02 X-RAY: BLUE WHALE (HELD UP, ON SAND, ITS WEIGHT, CRUSHED, PHEW), CTA 13.62; 16.35 he floats on his back beside the whale, a gull
lands on his head, the whale spouts (STAYS IN), CommentAsk "What would you do as a giant?"; 18.45 loop push.
Voice: James, eleven_v4, one take (20.9 s, 306 credits) -> `scripts/vsplice.py` (line 1 at 1.22, the rest at 1.12, pauses ~0.1-0.26 s) ->
`public/bluewhale/vo/tight.mp3` (18.2 s), first word 0.12 s, "break" 2.11 s. Scribe word times refined per speech chunk against the take's
loudness (`scripts/refine_words.py 7,8,5,1,3,4,4,13,3,5,1,5`) in `src/data/words.json`. Sounds: all from the kit library (no new ones).
Render: `node scripts/render.mjs Whale renders/bluewhale-1080x1920.mp4 1`; `node scripts/check-loop.mjs Whale` = seamless loop (frame 0
vs 0.5 s: 33.1, moving). Thumbnails ("LEGS SNAP": the cracking X-ray legs on the beach beside the smug whale standing up out of the sea):
`BUNDLE=work/bundle2 COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then ThumbWide).
