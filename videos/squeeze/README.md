# What if you could squeeze like an octopus? (16.1 s)

The user, 2026-11-23: "next million view idea" + "make 3 more" - video 2 of the 4 made that day (videos/beaver, videos/squeeze,
videos/rabbit, videos/lifespan; upload order and cadence in PLAN.md). Shark formula, animal-powers series, no captions.
Not a retry of videos/octopus (that one was the octopus's ARMS taking their own orders); this is the octopus's famous squeeze.

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: squeeze through anything - under doors, through a keyhole, out of any trap (Luffy / Elastigirl stretchiness).
2. BACKFIRE: to do it you would have to lose every bone you have - and then you can't stand: you flop into a puddle. It hits the
   very thing you wanted (getting through) and your own body.
3. ICON: the octopus - famous escape artist, the octopus-through-a-tiny-hole clips.
4. FEEL IT NOW: your bones (the hand holding your phone).
5. SHOW IT: frame 0 = he pours out of a keyhole like toothpaste and piles back up into himself beside a smug octopus (SQUEEZE, POP,
   TA-DA); close-up at 2.28 s: he collapses into a puddle at 2.6 s (SPLORCH, NO BONES).
6. NUMBER: a hole the size of a lemon (a lemon held up to the hole); 206 bones -> 0 on the X-ray.

## Facts (verified 2026-11-23)
- Octopuses have no bones; the beak (chitin, like keratin in hair and nails) is the only hard part, and if the beak fits through a
  gap, the rest of the body follows (Seattle Aquarium, giant Pacific octopus page; Alaska Department of Fish and Game as quoted in a
  news report: "the beak is the only hard part").
- A fully grown giant Pacific octopus can fit through a hole about the size of a lemon (Seattle Aquarium). Other sources give a quarter
  or 2 inches; "a lemon" is the aquarium's own figure. A 2026 study of common and Mayan octopuses found the narrowest gap is not set
  by the beak alone - so the voice only says "a big one can squeeze through a hole the size of a lemon".
- An adult human skeleton has 206 bones; muscles move the body by pulling on them.

## Script (52 words)
"Squeeze like an octopus, and you'd have to lose every bone you have. An octopus has no bones. Only its beak is hard. So a big one
can squeeze through a hole the size of a lemon. Lose your 206 bones, and you'd just flop. So he goes back the way he came."

## Build
Scene `src/Squeeze.tsx`, all drawn in code:
- `SoftGuy`: the guy as one merged outline (an ink pass, then a fill pass) with a flop value f from standing (0) to puddle (1): the
  torso flattens and widens, legs shrink into it, arms become wiggly noodles, the head flattens on the puddle; `wob` sways him, `jig`
  jiggles the puddle; an optional tapered `stream` (`tubeD`) joins him to the keyhole (pouring out at frame 0, slurping back in at the
  end); `sc` shrinks him as he slurps;
- the octopus (front view): mantle with spots, 8 tapered arms with curled tips and suckers (back arms darker), smug lids, a poking arm;
  `OctoPour`: in a fish tank, its left part shrinks into a hole in a divider and its right part grows out of it, joined by two tubes that
  narrow through the hole; a lemon held up to the hole;
- the room (door with panels, knob and keyhole plate, baseboard, floor boards, a picture) and the fish tank (water, sand, weed, bubbles);
- X-RAY: OCTOPUS (a scan line finds no bones, the beak lights up and bites) and X-RAY: YOU (the skeleton in his outline; bone groups pop
  away in random order while the counter falls 206 -> 0).
Shots: 0 s pouring out of the keyhole (comment bubble, SQUEEZE), POP 1.36, TA-DA; 2.28 close-up, wobble, SPLORCH 2.6 (NO BONES); 3.62
X-RAY: OCTOPUS (scan, 0 BONES, BEAK, ONLY HARD PART); 6.78 the fish tank (A BIG ONE), the pour 7.75-9.25 (SQUISH), the lemon 9.42 (SIZE OF
A LEMON); 9.95 X-RAY: YOU 206 -> 0; 11.85 he stands, wobbles, FLOP 12.6 (SPLAT), the octopus pokes the puddle (JIGGLE); 13.25 the puddle
slurps up into the keyhole (SLURP, BACK HE GOES) = frame 0. CTA 10.25 (top band), CommentAsk "Where would you squeeze through first?".
Voice: James, eleven_v4, one take (18.7 s, 252 credits) -> `scripts/vsplice.py` (line 1 at 1.22, the rest at 1.12) -> 14.9 s, first
word 0.11 s, "bone" 2.67 s. Sounds: all from the kit (squelch, stretch, pop, confetti, thud, scribble, beep, ding, clack, bubbles, boing,
crowd laugh, zap, whoosh).
Render: `node scripts/render.mjs Squeeze renders/squeeze-1080x1920.mp4 1`; `node scripts/check-loop.mjs Squeeze` = seamless loop (frame 0
vs 0.5 s: 17.9, moving). Thumbnails ("0 BONES", him as a puddle by the door, the smug octopus): `COMP=ThumbTall SCALE=1 node
scripts/stills.mjs --bundle 0` (then ThumbWide).
