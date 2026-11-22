# What if you had a polar bear's fur?

The user, 2026-11-22: "next million view idea", and for this video only: "put a box at the top that says, Subscribe to
@Koolkid7898pogo" (a fixed sticker at the top of the frame for the whole video, outside LoopOut so the loop stays seamless;
not in the thumbnails, not in the description). Shark formula (backfire on his body by ~3 s), animal-powers series, no captions.
Cadence: the last three uploads were fly's eyes (eyes), lizard (arm, regrowth) and butterfly (wings, mouth, melting); fur / skin
and heat are new, the polar bear is a new co-star, and the snow scene looks unlike any earlier Short. Upload about 20 h after
the butterfly.

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: never be cold again - no coat, a snowball fight in shorts, a blizzard feels like a blanket. Timely: winter is starting.
2. BACKFIRE: the coat keeps the heat in so well that one jog would cook you (heat stroke). It hits the very thing you wanted it
   for (warmth turns into too much heat) and it hurts your own body.
3. ICON: the polar bear - every kid can name it; the famous fact "polar bears aren't really white" (clear hairs, black skin).
4. FEEL IT NOW: your skin - right now it lets heat out; with the fur it couldn't.
5. SHOW IT: frame 0 = him standing big in a blizzard in thick white fur beside a smug polar bear, a snowball WHUMPs into his
   chest and he doesn't even blink; he jogs off and by ~2.3 s the close-up: red face, sweat, steam blasting out of his fur
   (kettle whistle): COOKED.
6. NUMBER: fat up to 10 cm thick (a ruler counter 0 -> 10 CM); then YOUR BODY 37 -> 40 °C (104 °F) = heat stroke.

Candidates screened the same day (5-8 per the screen):
- polar bear fur (picked: passes all six, facts verified, fresh body part and setting);
- starfish "clone yourself" (tear yourself in half: the strongest wish left, but regrowth again two uploads after the lizard and
  body-tearing right after the butterfly's melting - make it in 1-2 uploads; the pull-apart mechanics are not verified, only that
  the disc splits and each half regrows, C. acutispina grew 4-5 new arms within 30 days);
- immortal jellyfish "live forever" (turn back into a baby: top wish and a perfect loop, but passive, no part you feel, and it
  melts into a blob like the butterfly);
- cat's eyes (see in the dark -> blurry by day: the same "almost blind" catch as the fly's eyes two uploads back);
- cheetah speed (the comments ask for The Flash, but there is still no verified body backfire; tiger beetles that go blind at
  top speed are verified, Gilbert 1997 / Zurek & Gilbert 2014, but not an icon);
- spider webs (Spider-Man: huge wish, the catch - silk from your rear - does not hurt you);
- eagle eyes (zoom vision: eyes again);
- whale breath-hold (heart at 2 beats a minute -> you pass out: "pass out" stalled with the glass frog).

## Facts (verified 2026-11-22)
- Polar bear hairs are pigment-free, transparent and hollow; they scatter visible light, which makes the coat look white; the
  skin underneath is black (NOAA photo library; Natural Habitat Adventures; the old "fibre-optic hairs" idea is not used).
- Fat: up to about 10-11 cm (Guinness World Records: up to 10 cm; SeaWorld: up to 11 cm / 4.5 in; WWF: up to ~8.6 cm) ->
  "fat up to ten centimetres thick".
- Overheating: a 190 kg polar bear on a treadmill at four walking speeds - deep body temperature rose exponentially with speed,
  "a relative inability to dissipate metabolic heat at high walking speeds", and the cost of walking was twice the usual
  mammal value (Hurst et al. 1982, Canadian Journal of Zoology 60: 40-44); sub-adult bears: the rise in body temperature and the
  cost were "unexpectedly high" (Acta Physiologica Scandinavica 115: 391-395, 1982). Field guides: polar bears move slowly and
  rest often so they don't overheat -> "even a polar bear overheats if it walks fast". No speed number is used (none verified).
- Heat stroke: a core body temperature of 40 °C (104 °F) or higher (Mayo Clinic) -> YOUR BODY 37 -> 40 °C on screen.
- "One jog would cook you": a jog makes several times your resting heat; with the bear's insulation it could not get out
  (the bear's own data above). Not given a number.
- Left out: "polar bears are invisible to heat cameras" (mixed evidence: some thermal surveys do see them).

## Script (51 words)
"Get a polar bear's fur, and one jog would cook you. Its hairs are clear, hollow tubes over black skin, with fat up to ten
centimetres thick underneath. It traps so much heat that even a polar bear overheats if it walks fast. You'd get heat stroke.
So he never runs."

## Build
Scene `src/PolarBear.tsx`, all drawn in code:
- the guy in polar-bear fur = the code-drawn front view on the small IK rig (beetle / fly / lizard / butterfly) with a scalloped
  fur torso (`scallop` + `blob`), furry limbs made of puffs with one merged outline (`puffRow`, `PuffInk` / `PuffFill`), a fur ruff
  around his face, cream paws; `heat` fills his face red from the chin up; moods incl. `hot` (panting tongue) and `dizzy` (spirals);
- the polar bear (`PolarBear`): front view, cream with a lighter belly and muzzle, black nose, small round ears; moods smug / look /
  laugh / focus / hot / pop / deadpan; walks in place (`walk`, `ph`), red heat fill, its legs sticking out of a snowbank (`BearLegsUp`);
- snow: thrown snowballs (`ballAt`), `SnowBurst` (splat + chunks), falling flakes in screen space (`Flakes`), drifts, icy ridges;
- the treadmill (front view, a belt with moving stripes), a SPEED box on its left post, a thermometer on the right (`Thermo`);
- `FurXRay`: clear hollow hairs (a light ray scatters off one; zoom on the air in the core), the skin turning black, the fat
  growing with a 10 cm ruler, heat arrows bouncing back off the fat;
- `SubscribeBox`: the user's "Subscribe to @Koolkid7898pogo" box, fixed at the top for the whole video, outside LoopOut.
Shots: 0 s blizzard, a snowball WHUMPs into his chest (comment bubble, the bear smug), NOT COLD; 1.42 he jogs toward the camera
(ONE JOG); 2.18 close-up: red face, steam blast + kettle whistle 2.32 (TSSSS), COOKED 2.42, he keels over 2.8; 3.05 X-RAY: POLAR
BEAR FUR (the bear peeks over it): hairs 3.2, CLEAR 3.88, zoom HOLLOW 4.2-5.05, BLACK SKIN 5.2, fat 0 -> 10 CM 6.42-7.45, heat
arrows 8.45, TRAPS HEAT 9.18; 10.0 the bear on a treadmill in the snow (SPEED bars and its thermometer rise), EVEN THE BEAR 10.72,
close on its red panting face 11.3 (TOO HOT), SPROING off the belt 12.62, POMF into the snowbank 12.9 (legs up, steam, laugh);
13.05 YOUR BODY 37 -> 40 °C (104 °F), HEAT STROKE 13.88 + warning beeps, spiral eyes; 14.45 he just stands there, WHUMP 14.86 and
15.42 (the bear laughs), NEVER RUNS 15.2; push 16.1 = frame 0. CTA 10.0 (y 300), CommentAsk "Worth it for winter?" from 14.56 (y 310).
Voice: James, eleven_v4, one take (19.4 s, 265 credits); line 1 tightened at 1.22 (pause to 0.14 s), the rest at 1.12 with pauses
cut to 0.26 s, spliced -> `public/polarbear/vo/tight.mp3` (15.9 s); first word 0.12 s, "cook" 2.41 s. Word times (Scribe) in
`src/data/words.json` (video time). New sounds synthesized in code and added to the kit: snowball.wav (soft "pomf" + crunch),
wind.wav (4 s blizzard gusts, repeat every 3.6 s), kettle.wav (rising whistle), beep.wav (three warning beeps).
Render: `node scripts/render.mjs PolarBear renders/polarbear-1080x1920.mp4 1`; `node scripts/check-loop.mjs PolarBear` = seamless
loop (frame 0 vs 0.5 s: 27.4, moving). Thumbnails: `COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then ThumbWide).
Kit note: a z=1000 Layer disappears at camera k >= 4 (the Layer culls d < 250), so close-ups stay at k <= 3.9.
