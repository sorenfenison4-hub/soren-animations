# What if you could land like a cat?

The user, 2026-11-28: "next idea". Shark formula (the backfire hits his body by ~3 s), animal-powers series, no captions.
Cadence: the last three uploads are crab (claws / arms, made 11-27), speed (legs / running) and piranha (teeth); falls were last
the gibbon and the cat last the cat's eyes (both 5 uploads back after this one). The hurt is the chin / jaw - no teeth fly out
(the piranha's teeth were 3 uploads back).

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: always land on your feet - survive a fall that would hurt anyone else (the superhero landing). The comment bubble asks it
   as "what if you could land like a cat??".
2. BACKFIRE: the landing itself smashes your chin into the ground. Cats that fall from high-rises land on their feet, and then the
   jaw hits the ground: more than half of them hurt their face. It hits the very thing you wanted (the landing) on your own body.
3. ICON: a cat - "cats always land on their feet" is the best-known animal trick there is.
4. FEEL IT NOW: your chin and jaw.
5. SHOW IT: frame 0 = he falls past a high-rise beside a falling smug cat, both flip over in midair and land on all fours (THUD,
   TA-DA); ~1.9 s his arms give and his chin slams the pavement (CRACK) - close-up, his face on the ground, stars.
6. NUMBER: 9 IN 10 survive (a row of ten cats lands, nine light up); FACE HURT 0 -> 57 % (MORE THAN HALF).

Candidates screened the same day (2026-11-28):
- cat "always land on your feet" (picked) - an icon trick with a body backfire you can show in close-up;
- axolotl "regrow anything" (the one animal request in the comments: "now grow it like a axolotl") - repeated amputation makes each
  regrowth worse until it fails (Bryant et al. 2017, npj Regenerative Medicine), but arms / hands come right after the crab:
  make it 2-3 uploads later, with the regrowth on his arm;
- sperm whale breath-hold - even sperm whales' bones show the bends (Moore & Early 2004, Science), but the catch comes from depth,
  not from holding your breath: tangled for 20 s;
- chameleon tongue (grab anything across the room) - no verified hurt;
- kangaroo kick - legs 2 uploads after the speed ladder, and the tail catch does not hurt;
- spider webs - the silk comes out of your rear end: funny, still no hurt;
- shrink to ant size (Ant-Man; a raindrop traps you, Haldane 1926) - a big wish, but no animal part or ability on him;
- chameleon colour (turn invisible) - your skin shows your mood: social, not your body.
Live comments: yt-dlp hit YouTube's sign-in check on the 8 newest Shorts again (not bypassed); vidIQ has 3 credits (calls cost 5+),
so the comment bubble is made up.

## Facts (verified 2026-11-28; article sites are blocked here, so from search summaries of the papers and vet sources)
- Cats have a righting reflex: in a fall they turn over and land on their feet (International Cat Care).
- High-rise syndrome, Animal Medical Center, New York (Whitney & Mehlhaff 1987, JAVMA 191: 1399-1403): 132 cats that fell from
  high-rise buildings; 90 % survived (AMC); facial trauma 57 %, thoracic trauma 90 %, limb fractures 39 %, hard palate and dental
  fractures 17 % each. Other series agree: 96.5 % of 119 cats survived (Vnuk et al. 2004), 94 % of 84 cats survived and 66 % had
  orofacial injuries (Bonner, Reiter & Lewis 2012, J Vet Dent); a 2022 review gives survival above 90 % after treatment.
- "With high falls the jaw often hits the ground and is broken" (International Cat Care); the chin striking the ground is the
  usual explanation of the broken jaws and teeth in fallen cats.
- Not used: the 32-storey cat and the "cats from higher than 7 floors get hurt less" claim (press / disputed, survivorship).

## Script (55 words)
"Land like a cat, and you'd smash your chin into the ground. A falling cat flips over in midair and lands on its paws. Nine in ten
survive falls from high-rise windows. But it lands so hard, its chin hits the ground too. More than half hurt their faces. So now he
takes the stairs."

Voice: James, eleven_v4, one take (20.2 s, 280 credits) -> `scripts/vsplice.py` (line 1 at 1.22, the rest at 1.12, gaps 0.24-0.55 s:
the longer one after "windows" leaves room for the laugh) -> `public/catland/vo/tight.mp3` (17.3 s), first word 0.12 s, "smash" 1.49 s,
"chin" 1.95 s. Word times: Scribe (0 credits) remapped by vsplice, then refined to the loudness chunks with
`scripts/refine_words.py 4,8,7,5,8,11,6,1,5`.

## Build
Shark formula, animal-powers series, no captions. Scene `src/CatLand.tsx`, all drawn in code:
- the guy = the code-drawn front view (crab / cat's-eyes rig, hands) with explicit joints, so one state blends between the poses:
  falling and flipping (the whole body turns 160 -> 0 degrees, arms and legs flail), CROUCH (on all fours after the landing), PLANT (the
  face plant: head on the pavement in front, hips up, arms splayed), sitting, walking down stairs with a hand on the rail, the trip;
  `SkullXR` = his head as an X-ray (skull, jaw, teeth) with a red crack at the chin for the impact flash; `Plaster` on the chin;
- the cat in two drawings: `CatSide` (profile, origin on the ground; the front and back halves turn over separately about the spine -
  the famous twist, front half first - legs stand / reach / run, `crouch` bends the legs, `chin` brings the head down to the ground,
  `xr` draws it as an X-ray with the spine, leg bones and a glowing inner ear) and `CatFront` (sitting, from videos/cateyes: moods
  smug / grin / lick / annoyed, a paw that licks or rubs the chin, a plaster); nine coat colours for the falling cats;
- the high-rise (`Facade`: brick wall, rows of windows with curtains and flower boxes, open dark windows where a cat leaves), the
  pavement and the street, cracks that draw themselves, the fire escape (landing, a flight of 8 steps, the handrail on the wall);
- inserts: X-RAY: CAT (the cat falls belly up past streaming lines, INNER EAR glows with a down arrow, the front half turns, then the back
  half - TWIST, the floor rises, PAWS DOWN), counters SURVIVED 0 -> 90 % (one tick per landing cat) and FACE HURT 0 -> 57 %.
Shots: 0 s falling past the windows, both flipping (the camera follows the fall), 0.70 THUD on all fours, TA-DA, the cat lands 0.72 and
sits smug (0.98); 1.42 his arms wobble, 1.80 they give; 1.88 close-up, 1.92 the chin hits (CRACK, X-ray flash of the jaw cracking until
2.17, cracks, stars, CHIN FIRST 2.35); 3.12 X-RAY: CAT (INNER EAR 3.70, TWIST 4.11 / 4.39, the floor 5.62, PAWS DOWN 6.11); 6.72 wide:
nine cats drop out of the windows (6.80 + 0.17 s each) and land in two rows, SURVIVED counts to 90 %, 9 IN 10 at "ten"; the smug cat
waits in a window and drops onto his head at 9.25 (BONK, laugh); 10.22 SLOW-MO: the cat lands 10.66, its legs give, the chin taps the
ground 11.80 (CHIN, crossed eyes), annoyed at 12.67; CTA 10.95-13.55; 13.36 both sit with a plaster on the chin, the cat rubs its chin
(FACE HURT 0 -> 57 %, MORE THAN HALF); 15.40 the fire escape: he steps down holding the rail (CAREFUL), the cat dashes down between his
feet (ZOOM 16.70), TRIP 16.95, he tumbles off; CommentAsk "Would you still jump?" from 15.1; 17.55 loop push.
Sounds: all from the kit library (whoosh, whistle, wind, thud, tada, meow, strain, crack, bonk, zap, crowd_ooh, dizzy_birds,
whoosh_slow, shing, zip, pop, tick, ding, crowd_laugh, crowd_aww, step, squeak) - no new sounds, 0 credits; every effect after frame 0
sits 3 dB lower, the CTA's pops 8 dB lower than the kit default. Mix check: the `CatFx` composition is the effects alone
(`render.mjs CatFx work/fx.wav`) - against the voice per 50 ms they sit a median 22.4 dB under it while he speaks; the only closer
windows are word tails and gaps (the landing THUD after "cat", the impact in the gap before "chin").
`node scripts/check-loop.mjs Cat` = seamless loop (first vs last 0; frame 0 vs 0.5 s: 50.2, moving).
Thumbnails ("CHIN FIRST": 2.5 s, his dazed face flat on the cracked pavement, the smug cat sitting beside him; no stars in the covers):
`BUNDLE=work/bundle2 COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then ThumbWide, which renders at WideFit 0.9).
