# What if you could drink like a camel?

## Premise screen (CLAUDE.md, Growth) - written before the voice and the art
1. WISH: never be thirsty - go twenty days in the desert without a drink, then fill up in minutes. A survival power you
   DO (drinking), not armour that happens to you (the turtle lesson). Weaker than flying / invisibility (noted on
   2026-11-19), but the strongest premise left that passes all six today (see below).
2. BACKFIRE: the refill. A camel drinks up to 110 litres in 10 minutes. Your kidneys clear about one litre an hour, so the
   rest thins your blood, water floods into your cells and your brain swells (water poisoning). It hits the very thing
   you wanted (never being thirsty) and hurts your body.
3. ICON: a camel - every kid can name one; its trick, days in the desert without water, is famous (plus the hump myth:
   the hump is fat, not a water tank).
4. FEEL IT NOW: swallow - your throat and belly; your brain.
5. SHOW IT: frame 0 = he and the camel chug side by side, his belly ballooning, a LITRES counter racing; at ~2.5 s,
   close-up: his head throbs and swells (BWOMP), his eyes bulge.
6. NUMBER: 110 litres in 10 minutes (shown as water-cooler jugs and a counter); your kidneys: 1 litre an hour = 110
   hours on the toilet; camel blood cells stretch to 240 % without bursting (other animals' about 150 %); 20 days.

Other candidates screened 2026-11-20: bat wings (fly -> your hands become the wings) and lizard arm regrowth - both strong,
but arms were 3 uploads ago (octopus) - next; flea jump (super jump, the landing = a 30-storey fall) - fails FEEL IT NOW
(legs); lobster "live forever" (molt out of your own skin) - the immortal lobster is a myth and the 10-15 % molting deaths
are a press quote, not a study; tardigrade "survive anything" (only as a dried-out husk) - not a 6-year-old's animal, a
passive power; cat eyes - the catch (blurry daylight) is a weird fact and its number is unsettled.
Within the last 3 uploads: glass frog (see-through / blood), turtle (shell / ribs / breath), octopus (arms) - no repeat of
body part or animal (the brain / blood cells come up again, so the X-rays look different: balloon cells, a water-logged
brain, no oxygen dots).

## Facts (verified 2026-11-20)
- Dehydrated dromedary camels can drink up to 110 litres within 10 minutes (Ali et al. 2023, Frontiers in Veterinary
  Science, "Effects of long-term dehydration ... in the dromedary camel", citing earlier work; a 1963 Nature letter
  describes a camel taking about 30 gallons in about 10 minutes without its red cells bursting).
- In that study the camels went 20 days without water (fed hay); their humps shrank (they burn the fat).
- Their red blood cells can swell to 240 % of their volume without rupturing; in other species red cells can only swell
  to about 150 % (Ali et al. 2023). Camel red cells are oval.
- A healthy resting kidney excretes about 800-1,000 mL of water an hour (physiologist Joseph Verbalis, Scientific
  American; medical sources agree on 0.8-1 L/h). 110 L at 1 L/h = 110 hours (about 4.5 days) - shown, not said.
- Drinking far more than the kidneys can clear dilutes the sodium in the blood; water moves into the cells and they
  swell; in the brain this can be fatal (water intoxication / hyponatremia; Cleveland Clinic, Medical News Today).

## Build
Owl formula, animal-powers series, word-by-word captions (third captions video after turtle and glass frog). Scene:
`src/Camel.tsx`, all code-drawn: the guy (front view, a belly that balloons with the water, a head that swells with throb
lines and a pink flush), a water-cooler jug (glug bubbles), the camel (side view, facing left: legs that pace, a neck with a
gulp bulge, a head with lashes that drinks / looks up / burps), a trough, a desert (dunes, palms, sun) and a desert outhouse
with a crescent-moon door.
Shots: 0 s he chugs beside the camel (GLUG); 1.5 s close-up: the jug drops, his head balloons (BWOMP 2.2 s, WATER
POISONING); 2.7 s the camel walks through the desert (DAYS 0 -> 20, FAT, NOT WATER on the hump); 5.24 s it drinks (LITRES
0 -> 110, 10 MIN) and burps (7.84 s, laugh); 8.17 s X-RAY CAMEL BLOOD (an oval camel cell stretches to 240 % and holds, a
round one pops at 150 %, NO POP, the camel winks); 11.88 s the outhouse: the sun and moon whizz over it, HOURS 0 -> 110 =
4 1/2 days (laugh); 14.15 s X-RAY YOUR BRAIN (water floods the cells, the brain swells into the skull, DANGER) over his
throbbing head; 17.18 s he sips from a teacup, the slow way, while the camel chugs = frame 0. CTA 11.5 s, CommentAsk "How
much water do you drink a day?".
Voice: James, eleven_v4, one take (22.96 s) -> `scripts/tighten.py --tempo 1.12 --json src/data/words.json` ->
`public/camel/vo/tight.mp3` (18.96 s); first word at 0.12 s. Mix -21 LUFS, true peak -5.5 dB.
New sounds (ElevenLabs sfx, 17 credits each, trimmed, peak -1 dBFS, added to the kit library): glug.wav (water-cooler
glug, the frame-0 sound), stretch.wav (rubber balloon stretching), burp.wav.
Render: `node scripts/render.mjs Camel renders/camel-1080x1920.mp4 1`; thumbnails ("BRAIN SWELLS"):
`BUNDLE=work/bundle2 COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then ThumbWide).
Lessons: the guy is drawn after the camel, so at frame 0 his jug arm hid the camel's face - keep the co-star's face clear
of his arms (the camel moved right); the like/subscribe doodle must be gone before an X-ray panel pops in (its title card
sits right under the top band).
