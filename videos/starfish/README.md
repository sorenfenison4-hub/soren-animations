# What if you could clone yourself like a starfish?

The user, 2026-11-22: "next million view idea". Shark formula (the backfire hits his body by ~3 s), animal-powers series, no captions.
Cadence: the last three uploads were lizard (arm regrowth), butterfly (wings, melting) and polar bear (fur, heat); the lizard is now
3 uploads back, so a regrowth-family power is allowed again (PLAN.md had the starfish as "make it next"). Cloning, tearing, the
beach and the starfish co-star are all new. Upload about 20 h after the polar bear.

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: clone yourself - two of you, one for the chores, one for fun ("I wish there were two of me", shadow clones).
2. BACKFIRE: to clone yourself like a starfish you'd have to rip yourself in half, then spend a month as two halves with one
   eye, one arm and one leg each. It hits the very thing you wanted it for (twice the hands -> half the hands) and it hurts your
   own body.
3. ICON: the starfish - every kid can name it; its famous trick is growing back lost arms.
4. FEEL IT NOW: your two eyes, two arms, two legs - each half keeps one of each.
5. SHOW IT: frame 0 = him tearing himself in half like notebook paper, both hands pulling his head apart (RIIIP) beside a smug
   starfish; POP at 2.74 s and a close-up at 2.86 s: two halves, one eye and half a mouth each (HALF).
6. NUMBER: about a month (DAYS 0 -> 30 on the X-ray; DAY 1 -> DAY 30 during his month).

Candidates screened the same day:
- starfish clone (picked: passes all six, facts verified, the picture is new);
- cat's eyes (see in the dark -> blurry by day: the "almost blind" catch again, fly's eyes 4 uploads back);
- immortal jellyfish (live forever -> melt back into a baby: passive, melting like the butterfly 2 uploads back);
- octopus three hearts (a spare heart -> the main heart stops when it swims: close to the rejected hummingbird heart, octopus done);
- cheetah speed (still no verified body backfire);
- eagle eyes (eyes again; fixed eyes = the owl);
- crocodile bite (teeth again after the shark and the butterfly's 32 -> 0);
- porcupine quills (armour like the turtle; self-stabbing, Roze).
Live comments checked first (yt-dlp, 3 of 8 Shorts readable): no animal-power suggestions, so the comment bubble is made up
(@starry_doodle, 3.1K).

## Facts (verified 2026-11-22)
- Some starfish reproduce asexually by fission: a furrow crosses the disc, the two sides pull away from each other until the disc
  tears in two, and each part regrows the missing arms (Wikipedia, Asexual reproduction in starfish, citing the Nepanthia belcheri
  work; fissiparity in the Asteriidae is confined to Coscinasterias, Stephanasterias and Sclerasterias, plus the Asterinidae). The
  halves are genetically identical to the parent -> "Some starfish really pull themselves apart", "CLONE".
- Coscinasterias acutispina in the lab: each daughter formed four or five new arms, and by 30 days after the first fission the
  number of arms in each was similar to adults (Zoological Science 28: 313, 2011, "Life Cycle of the Multiarmed Sea Star
  Coscinasterias acutispina in the Laboratory") -> "Each half grows back its missing arms in about a month", DAYS 0 -> 30.
- The pyloric stomach sends a pair of pyloric caeca (digestive glands) into each arm (zoology lab texts) -> X-ray: STOMACH IN
  EVERY ARM. (Gonad position differs between sources - not used.)
- Fissiparous species have 6-10 arms, so the cartoon starfish has six and splits three + three.
- Left out: the 155-million-year-old fossil of a starfish caught mid-split (only press summaries were readable).

## Script (49 words)
"Clone yourself like a starfish, and you'd have to rip yourself in half. Some starfish really pull themselves apart. Each half
grows back its missing arms in about a month. You'd spend that month with one eye, one arm and one leg. And now his clone wants
a clone."

## Build
Scene `src/Starfish.tsx`, all drawn in code:
- the guy = the code-drawn front view (lizard / polar bear rig) built as two halves along a torn zigzag (`zx`, `zzPts`; zero
  crossings at the head top, chin and torso top / bottom so the outlines meet). `Half` draws one side (leg, torso, head, one eye +
  brow, half the mouth through a clip, one arm); the crack opens by shearing every point above the crack tip (`crackD`), the torn
  edge is inked only above the tip, a white seam hides the join below it. `Figure` draws a pair (tearing / whole) or a lone half,
  with the missing side as a dashed pencil sketch (`ghost`) before it grows back;
- the starfish (`Starfish`): six arms from a polar petal formula (`starPath`), bumps, a face on the disc; split = two clipped halves
  with a jagged edge that lean apart about their feet; regrowth = the missing arms lengthen in a paler orange;
- `StarXRay`: top view with the stomach and a pair of lobed digestive glands in every arm (`Glands`, one merged outline); the torn
  side heals and three arms grow while DAYS counts 0 -> 30, CLONE;
- the beach: sea band and sun (far layer), sand, foam line, shells, a barnacled rock (near layer).
Shots: 0 s close medium shot, he tears himself in half (comment bubble, the starfish smug and waving), RIIIP 1.86; POP 2.74
(the halves spring apart, BOING); 2.86 close-up HALF (blink 3.12); 3.40 the starfish: EASY, PULL 4.74, POP 5.31, BYE 5.46 (its right
half hops off); 5.72 X-RAY: STARFISH, STOMACH IN EVERY ARM 5.98, GROWS BACK 6.44, DAYS 6.5 -> 30 at 8.30, CLONE; 8.62 his month: DAY 1
-> 29, ONE EYE 9.96 (blink 10.12), 10.55 wider: ONE ARM 10.67 (wave), ONE LEG 11.44, hop hop BONK 11.8 (dizzy, crowd laugh); DAY 30
12.02, the missing sides sketch in 12.05, POP 12.27 = 2 OF HIM, high five CLAP 12.62; 12.95 his clone grins 13.37, grabs its head
13.73, RIIIP 14.23 (UH-OH, gasp) as the camera settles on frame 0's framing; push 14.8 = frame 0. CTA 8.85 (top band), CommentAsk
"Which one is the real him?" from 12.45.
Voice: James, eleven_v4, one take (17.7 s, 262 credits); line 1 at 1.22 (no pause cut), the rest at 1.12 with sentence pauses cut to
0.24 s (0.5 s before the last line for the high five), spliced by `scripts/splice.py` -> `public/starfish/vo/tight.mp3` (14.4 s);
first word 0.11 s, "rip" 2.23 s, "half" 2.89 s. Word times (Scribe) in `src/data/words.json` (video time). New sounds synthesized in
code and added to the kit (`scripts/sfx_star.py`): rip.wav (2.7 s paper tear, loud from 0: a frame-0 hit), rip_short.wav (0.55 s),
boing.wav (0.5 s cartoon spring), scribble.wav (0.4 s pencil scribble).
Render: `node scripts/render.mjs Starfish renders/starfish-1080x1920.mp4 1`; `node scripts/check-loop.mjs Starfish` = seamless loop
(frame 0 vs 0.5 s: 20.3, moving). Thumbnails: `COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then ThumbWide).
