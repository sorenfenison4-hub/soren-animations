# What if you had a beaver's teeth? (17.9 s)

The user, 2026-11-23: "next million view idea" (+ "make 3 more" - this is video 1 of 4 made that day; upload order and
cadence in PLAN.md). Shark formula (the backfire hits his body by ~3 s), animal-powers series, no captions.
Cadence: the last three uploads were butterfly (wings, melting; teeth only as a sub-beat), polar bear (fur, heat) and starfish
(tearing in half, regrowth). Teeth are the main part for the first time since the shark (13 uploads back).

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: teeth that chew through anything - a killer bite (the shark's wish, our #3 hit), a tree in minutes.
2. BACKFIRE: they never stop growing. Stop gnawing and they grow into your other jaw and you can't eat. It hits the very thing
   you wanted (the teeth) and your own body.
3. ICON: the beaver - every kid knows beavers chew down trees.
4. FEEL IT NOW: your teeth (bite down).
5. SHOW IT: frame 0 = he and a smug beaver gnaw the same birch from both sides, chips flying, CHOMP; it falls (TIMBER); close-up
   at 1.45 s: his teeth shoot out (SHWING) and curl back into his chin at 2.43 s (CRUNCH, INTO YOUR JAW).
6. NUMBER: under 30 seconds for a branch more than 6 cm thick (a stopwatch 0:00 -> 0:28); DAY 1 -> 365; DAYS 0 -> 60.

Candidates screened the same day (5-8, the screened list was used up): beaver teeth (picked), octopus squeeze (made next:
videos/squeeze), rabbit eyes (videos/rabbit), lifespan ladder ending on the immortal jellyfish (videos/lifespan), cheetah speed (still
no verified body backfire), tardigrade "survive anything" (passive, weak icon), whale breath-hold (backfire facts too tangled),
dog nose (weak wish), axolotl regrowth (the only animal suggestion in the comments - "now grow it like a axolotl" on the lizard -
but regrowth is right after the starfish and its catch, never growing up, is no backfire).
Live comments checked first (yt-dlp, 7 of 8 Shorts readable): no other animal-power suggestions, so the comment bubble is made up
(@woodchip_doodle, 2.7K).

## Facts (verified 2026-11-23)
- Beaver incisors grow continuously throughout life and are worn down through daily use; if they get too long they can stop the
  mouth from closing enough for the molars to meet, which could lead to starvation (Smithsonian's National Zoo, beaver page).
- Captive beavers not allowed to gnaw on trees have had their teeth grow into the opposite jaw, which prevents feeding and is fatal
  (National Park Service, Glacier NP "Leave it to Beavers").
- The inner face of the incisors is softer than the outer face and wears faster, which keeps them sharp (UW-Stevens Point
  vertebrate collection); the orange enamel contains iron (Gordon et al. 2015, Science).
- Cutting speed: a beaver cut through a submerged aspen branch over 6 cm in diameter in less than 30 seconds (Bartlett 1974, as
  cited in a later academic paper) -> "under thirty seconds", 6 CM, the stopwatch stops at 0:28.
- Left out: "beaver teeth grow 4 feet a year" (only popular articles, no study).

## Script (58 words)
"Get a beaver's teeth, and they'd grow right into your jaw. A beaver's front teeth never stop growing. They can cut through a thick
branch in under thirty seconds. But it has to gnaw every day to wear them down. If it stops, they grow into its other jaw, and it
can't eat. So he never stops chewing."

## Build
Scene `src/Beaver.tsx`, all drawn in code:
- the guy = the code-drawn front-view body (butterfly / polar bear rig) with a 3/4 head (`GFace`: eyes and mouth shifted to the
  facing side, mirrored by `dir`) so the teeth show; teeth = `jPts`: a J-hook (straight down past the chin, a half turn backwards,
  straight up into the jaw) whose length runs from 15 (normal) to `TOOTH_HOOK`; two strokes (orange front, darker back tooth);
- the beaver (side view, `Beaver`): paddle tail with a scale hatch, belly, dropping lower jaw for chomps, orange incisors, whiskers;
- a birch gnawed into an hourglass (`Birch`: both sides inset by a triangle profile, chew marks, the top falls about the left notch
  edge), a pencil-point stump, wood chips (`Chips`: seeded, gravity, spin), a thick branch that snaps (`Branch`), a stump desk with a
  pencil cup, pencils fed into his teeth like a wood chipper (`Pencil`), a burger;
- X-RAY: BEAVER (skull, molars, long curved incisors with orange fronts, a glow that runs from the roots) and X-RAY: YOUR TEETH (his
  round skull in head coordinates x 2.6, the same J-hook teeth, the jaw turns red where the tip goes in).
Shots: 0 s gnaw race at the birch (comment bubble, CHEWS ANYTHING), creak, CRACK 1.0, TIMBER, thud 1.48; 1.45 close-up: SHWING 1.55
(GROWING), the hook 2.15 -> 2.43 CRUNCH (INTO YOUR JAW); 2.95 X-RAY: BEAVER (NEVER STOP GROWING, IRON); 5.45 the branch, stopwatch
0:00 -> 0:28, SNAP 7.83 (UNDER 30 SECONDS); 8.45 pencils at the stump desk, DAY 1, 2, 3 -> 365 (EVERY DAY, TO WEAR THEM DOWN); 11.35 he
stops, arms crossed (HE STOPS), 11.72 X-RAY: YOUR TEETH, DAYS 0 -> 60, DANGER 13.47; 14.0 the burger BOINGs off the hook (CAN'T EAT),
the beaver laughs; 15.0 back at a new birch (NEVER STOPS) = frame 0. CTA 9.0 (top band), CommentAsk "What would you chew first?".
Voice: James, eleven_v4, one take (20.5 s, 298 credits) -> `scripts/vsplice.py` (new, generic version of the starfish splice: line 1 at
1.22, the rest at 1.12, sentence pauses 0.24 s) -> `public/beaver/vo/tight.mp3` (16.7 s), first word 0.11 s, "jaw" 2.43 s. Word times
(Scribe) in `src/data/words.json`. New sounds synthesized in code and added to the kit (`scripts/sfx_beaver.py`): chomp.wav (one
crunchy bite, loud from 0), gnaw.wav (1.6 s, 11 bites a second), shing.wav (teeth shooting out), creak.wav (a tree about to fall).
Render: `node scripts/render.mjs Beaver renders/beaver-1080x1920.mp4 1` (22 min on 4 CPU workers); `node scripts/check-loop.mjs Beaver`
= seamless loop (frame 0 vs 0.5 s: 21.4, moving); pop scan: every flag is a cut, a panel pop or the loop push. Thumbnails ("NEVER STOPS",
the hooked teeth beside the smug beaver): `COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then ThumbWide).
