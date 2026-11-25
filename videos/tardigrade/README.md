# What if you were as tough as a tardigrade?

The user, 2026-11-25: "next idea". Shark formula (the backfire hits his body by ~3 s), animal-powers series, no captions.
Cadence: the blue whale went up the same evening; the last three uploads are blue whale (size, legs and bones), lifespan (age
ladder) and rabbit (eyes). Toughness / the whole body and the tardigrade are new; eyes and legs are kept out of the catch.

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: survive anything - be indestructible (one of the classic wishes in the screen's own list; the comment bubble says it as
   "what if you were as tough as a tardigrade??").
2. BACKFIRE: you'd have to shrivel into a raisin first. The famous survival tricks happen in the dried "tun" state: it loses about
   95 % of its water and its body nearly stops; awake, a hot day can kill it. It hits the very thing you wanted (to be alive and
   unstoppable) and your own body (it dries you out).
3. ICON: the weakest of the six. "The toughest animal on Earth / it survived space" is a famous trick (memes, school science,
   Ant-Man), but a 6-year-old can't name a tardigrade. Picked anyway because every icon-and-wish pair left failed a harder check
   (list below); the frame-0 picture and the first line explain it at once (a cute water bear floating in space next to him).
4. FEEL IT NOW: the water in your body - you are mostly water; 37 °C is the temperature inside you right now (description).
5. SHOW IT: frame 0 = he floats in open space without a suit, an asteroid BONKs off his head and he keeps grinning beside the smug
   tardigrade; 2.55-3.02 s close-up: water sprays out of him, he darkens, wrinkles and turns into a raisin with his tiny face.
6. NUMBER: 95 % of its water gone (WATER 100 -> 5 %), BODY 100 -> 0.01 %, 30 YEARS frozen, 37 °C, 0.5 MM, 10 DAYS in space.

Candidates screened the same day (the screened list was used up again):
- tardigrade "survive anything" (picked);
- porcupine quills (nothing can bite you -> you stab yourself: porcupines that fall from trees quill themselves, and their quills
  carry antibiotic fatty acids, Roze et al. 1990, J. Chem. Ecol.; 30,000 quills) - icon and backfire pass, the WISH does not
  (armour again, like the turtle);
- tiger beetle speed (The Flash -> it runs so fast it goes blind and has to stop, look and run again; it feels its way with its
  antennae held out like a cane - Gilbert 1997, Zurek & Gilbert 2014, Proc. R. Soc. B; 171 body lengths a second = about
  1,000 km/h for you) - the best backfire for super speed, but no icon, and the catch is eyes again (rabbit 3 uploads back);
- axolotl regrowth (the one viewer request, "now grow it like a axolotl" on the lizard) - repeated amputation of the same limb
  stops it growing back and a scar seals it (Bryant et al. 2017, npj Regenerative Medicine), but the count is not in any summary
  and regrowth was done twice (lizard, starfish);
- shrink to ant size (Ant-Man -> one raindrop could trap you: Haldane's "an insect going for a drink...") - the human-sized physics
  is speculative, and size went up the same day (blue whale);
- cat's eyes (see in the dark, the owl's winning wish) - eyes are 3 uploads back; make it after the next upload;
- gibbon swing (Tarzan -> about a third of wild gibbon skeletons have healed fractures, Schultz 1944) - broken bones and casts
  right after the blue whale; keep for later;
- bear hibernation (legs again), cheetah (still no verified body backfire).
Live comments: yt-dlp hit YouTube's sign-in check on all 8 recent Shorts again (not bypassed) and vidIQ has 3 credits (calls cost
5+), so the comment bubble is made up (@waterbear_doodle, 3.8K).

## Facts (verified 2026-11-25)
- Tardigrades ("water bears") are about 0.5 mm long. When their surroundings dry out they retract their legs and curl into a "tun",
  lose about 95 % of their water (University of Montpellier) and their metabolism drops to about 0.01 % of normal (Smithsonian) ->
  "It loses almost all its water, and its body nearly stops."
- Space: dried tardigrades flew on ESA's FOTON-M3 (TARDIS, Jönsson et al. 2008, Current Biology; launched 2007) and survived the
  vacuum and cosmic radiation of open space for 10 days; full solar UV killed most of them (ESA, National Geographic, Smithsonian)
  -> "Dried up, it has survived open space." / 10 DAYS.
- Freezer: Tsujimoto, Imura & Kanda 2016 (Cryobiology 72: 78-81): Acutuncus antarcticus in a moss sample collected in Antarctica in
  November 1983, stored at -20 °C, thawed in May 2014 (30.5 years); one revived adult reproduced, one died 20 days after
  rehydration -> "Frozen, one woke up after thirty years." / -20 °C / YEARS FROZEN 30.
- Add water and a tun revives (within about an hour to a few hours) -> "Just add water, and it's back."
- Heat: Neves et al. 2020 (Scientific Reports): active (awake) Ramazzottius varieornatus - median lethal temperature 37.1 °C after
  24 hours (37.6 °C after a short acclimation); dried tuns 82.7 °C for 1 h -> "But awake, one hot day can kill it." / 37 °C.
- Not used: the often-quoted -272 °C / +150 °C range (older, short exposures) and "survives anything" as a literal fact.

## Script (58 words)
"Survive anything like a tardigrade, and you'd have to shrivel into a raisin first. It loses almost all its water, and its body
nearly stops. Dried up, it has survived open space. Frozen, one woke up after thirty years. Just add water, and it's back. But
awake, one hot day can kill it. So he stays a raisin."

## Build
Shark formula, animal-powers series, no captions. Scene `src/Tardi.tsx`, all drawn in code:
- the guy = the code-drawn front view on the small IK rig (bluewhale); new: `skin` colour, wrinkles (`wr`), shrink about the torso
  (`sc`), sweat drops, red cheeks, a hair dryer in his hand, moods smug / sleep / hot (panting, tongue out); `Face` is split from the
  head so the raisin can wear it;
- raisin him (`Raisin`): a wobbly purple-brown blob with ridges and grooves, his face at 0.8, tiny white arms, hands and feet, a frost
  overlay;
- the tardigrade (`Tardi`): an upright cartoon water bear - four-segment body (a squircle outline with segment bulges), 3 pairs of
  stubby side legs + a bottom pair, three hooked claws each, a round snout with a tube mouth, blush; `tun` morphs it into a wrinkled
  barrel (legs pulled in, snout shrinks, sleeping face), `hot` reddens and droops it, moods smug / wink / happy / worry / yawn / ko /
  sleep, `wave` and `reach` (holds the watering can, `pour` tips it, drops stop at the soil);
- sets: space (navy marker sky, stars, the Earth, a ringed planet, a moon, a satellite, an asteroid / meteor with a trail), a freezer
  with frost and see-through ice cubes that split, a table with a terracotta pot and a window, a hot day (warm sky, sand, a sun with a
  face, heat waves, a thermometer);
- `DropSpray` (water spraying out of a body), `QPoof` (the kit's POOF played 1.7x faster so the face shows again sooner), `Burst`;
- inserts: UNDER A MICROSCOPE (`Microscope`: the real one in a water drop; the drop dries, it curls into a tun, 0.5 MM scale bar) with
  WATER 100 -> 5 % and BODY 100 -> 0.01 % counters + PAUSED, YEARS FROZEN 0 -> 30.
Shots: 0 s space, BONK (comment bubble, out at 1.4 s), the tardigrade winks and waves; 2.45 close-up: the shrivel (SHRIVEL, RAISIN);
4.08 UNDER A MICROSCOPE; 7.92 open space: a meteor BOINGs off raisin him (OPEN SPACE, 10 DAYS); 10.36 the freezer (-20 °C, YEARS
FROZEN, CRACK, the tardigrade yawns), CTA 10.75; 13.12 the flower pot: the tardigrade waters him (JUST ADD WATER), POP 14.37 he springs
up with the pot on his legs (crowd laugh); 15.12 the hot day: 37 °C, both wilt, the tardigrade keels over (TOO HOT); 17.14 the hair
dryer: he dries himself back into a raisin (WHIRR, SAFE AGAIN), CommentAsk "Would you live as a raisin?"; 18.85 loop push.
Voice: James, eleven_v4, one take (24.2 s, 307 credits) -> `scripts/vsplice.py` (line 1 at 1.22, the rest at 1.12, pauses
0.07-0.18 s) -> `public/tardigrade/vo/tight.mp3` (18.6 s), first word 0.16 s, "shrivel" 2.57 s. Scribe word times refined per speech
chunk against the take's loudness (`scripts/refine_words.py 1,4,9,3,3,5,2,5,1,4,2,3,3,2,3,3,1,4`) in `src/data/words.json`. Sounds: all
from the kit library (no new ones). Render: `node scripts/render.mjs Tardi renders/tardigrade-1080x1920.mp4 1`;
`node scripts/check-loop.mjs Tardi` = seamless loop (first vs last 0.39; frame 0 vs 0.5 s: 25.6, moving). Thumbnails ("DRIED UP":
mid-shrivel in space, water spraying out of him, beside the smug tardigrade): `BUNDLE=work/bundle2 COMP=ThumbTall SCALE=1 node
scripts/stills.mjs --bundle 0` (then ThumbWide).
