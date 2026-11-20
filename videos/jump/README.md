# What if you could jump like a flea? (18.2 s)

First test of the escalating "ladder" format from `research/2026-11-20-findings.md` (the small-channel million-view
Shorts in this niche: one question, many animals, one number climbing, the last rung hits a human body). The user,
2026-11-20: "let's try to make one of the million-view video ideas in the last chat" - the proposed "Animal jumps, ranked".

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: a super jump - one of the classic superpower wishes (fly, see in the dark, super strength / speed / jump).
2. BACKFIRE: the jump you wanted throws you over a 30-floor tower, and then you have to come down 30 floors. A flea is so
   light for its size that air slows its fall and it lands fine; a person falling that far does not. It hits the very
   thing you wanted (the jump) and your own body (the landing).
3. ICON: kangaroo, cat, flea - every kid can name them; "a flea jumps many times its own size" is a famous fact.
4. FEEL IT NOW: legs - the weak spot (noted in the research). Accepted for this format test.
5. SHOW IT: frame 0 = him using the power at its best, mid-action (kangaroo legs, mid-hop over a car, the car's eyes look
   up, a smug kangaroo hopping behind). The backfire on his body (the drop, SPLAT in a crater, dizzy close-up) lands at
   11-15 s, not by ~3 s: on purpose, because this tests the ladder format, where the climb holds people ("what's the last
   one?") and the top rung is the hit. Opening shot is new for the channel (street, car, low hop), not the calm medium shot.
6. NUMBER: one live counter, the format's core - KANGAROO 2.4 m -> CAT 6 m -> FLEA 100 m (30 FLOORS), the finished rungs
   ranked under it; on the way down the same counter falls 100 -> 0 m.
Cadence: the last three uploads were glass frog (blood / skin), camel (drinking), bat wings (hands) - legs and
kangaroo / cat / flea are new (the frog was dropped from the ladder because the glass frog is 3 uploads back).
Upload about 20 h after the bat wings.

## Facts (verified 2026-11-20)
- Cat flea (Ctenocephalides felis): adults about 1-3 mm long (University of Florida, Featured Creatures).
- Jumps (Cadiergues, Joubert & Franc 2000, Veterinary Parasitology): cat fleas jumped up to 17 cm high (50 % reached
  13.2 cm) and up to 48 cm long (mean 19.9 cm); dog fleas up to 25 cm high.
- Scaled to a 1.75 m person: 17 cm / 3 mm = 57x -> about 100 m, a ~30-floor tower (conservative: smaller fleas give more).
- Kangaroo: Guinness "highest jump by a kangaroo" - a captive eastern grey cleared a 2.44 m fence (a hunted red kangaroo
  reportedly cleared 3.1 m). A kangaroo is about our size, so 2.4 m = "clear a car".
- Cat: vets quote about 5-6 body lengths in one vertical leap (no study found; Guinness only lists a cat's LONG jump);
  the counter shows a conservative 6 m (about 3.4 body lengths for a 1.75 m person) and the voice only says "onto a roof".
- The flea jump is a catapult: muscles squeeze a pad of resilin (an elastic protein) in the thorax, then it springs back
  (Bennet-Clark & Lucey 1967; Sutton & Burrows 2011, J Exp Biol - the force goes out through the feet).
- Falls: small animals have far more air resistance for their weight, so falls barely hurt them (Haldane, "On Being the
  Right Size", 1926). A 30-floor fall is deadly for a person (safety line in the description).

## Build
Script (James, eleven_v4, one take 21.1 s -> `scripts/tighten.py --tempo 1.12 --json src/data/words.json` ->
`public/jump/vo/tight.mp3`, 17.2 s, first word at 0.12 s): "Jump like a kangaroo, and you'd clear a car. Like a cat,
you'd leap onto a roof. Like a flea, you'd clear a thirty-storey tower. A flea's legs fire like a catapult. But a flea is
so light, air slows its fall. You'd drop all thirty storeys. So he's sticking with kangaroo legs." (53 words)
Scene `src/Jump.tsx`, all code-drawn. The guy is the code-drawn front view (camel / bat wings) with animal LEGS IN
PROFILE: a fur "haunch" over his hips, then hip -> knee -> ankle -> toe blended between four poses (stand, crouch,
extend, tuck; `LEGS` table per animal: kangaroo = drumstick thigh + long foot + thick drooping tail, cat = striped
digitigrade legs + paws + curly tail, flea = knobbly joints, shin spines, segmented foot). A quick `Poof` covers each leg
swap. Co-stars: a smug kangaroo hopping behind the car (z 1500), a smug sitting cat (meows), a smug flea (hops, rides up,
floats down with AIR arrows, lands on his head). Set: street with a car with eyes, a brick house, a 30-floor tower with
painted floor numbers (only the floors near the camera are drawn), skyline, clouds at altitude.
Shots: 0 s mid-hop over the car (comment bubble "what if you could jump like a flea??"), BOING landings; 2.76 house, POOF
cat legs, WIGGLE, POUNCE onto the roof by the cat (MEOW); 5.06 POOF flea legs, the flea hops, LOAD, 6.26 SNAP - he rides
up the tower (counter 6 -> 100 m, speed streaks), 7.30 "30 FLOORS" over the roof; 7.88 X-RAY: FLEA (SPRING squeezes,
LOADED, snaps on "catapult": CATAPULT); 10.30 close-up, he looks down, GULP, drops out of frame while the flea stays
(SO LIGHT, AIR); 12.10 the dive (AAAH, counter 89 -> 0, falling whistle); 14.45 SPLAT in a crater (crowd laugh); 15.18
dizzy close-up, the flea lands on his head (BOOP); 16.26 POOF kangaroo legs, BOING out of the crater = frame 0.
CTA 10.42-13.02 (top band, over the fall's start); CommentAsk "What would you jump over first?" from "So" to the push.
New sounds (ElevenLabs sfx, 17 credits each, added to the kit library): whistle.wav (1.38 s cartoon falling whistle,
descending), meow.wav (0.92 s smug "mrrow").
Render: `node scripts/render.mjs Jump renders/jump-1080x1920.mp4 1`; `node scripts/check-loop.mjs Jump` = seamless loop;
thumbnails ("30 FLOORS UP", him looking down from the top, uh oh): `COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0`.
Lessons: profile legs on a front-view body read only with a fur haunch over the hips and the legs stretched back in the
air (tucked legs + a straight tail looked like a broom); keep the HUD clear by framing his hips around screen y 1080-1150;
`Puffs` linger ~1 s - use the quick `Poof` for transformations; impact dust behind him and short, or it hides his face in
the next close-up.
