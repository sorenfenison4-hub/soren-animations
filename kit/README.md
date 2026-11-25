# Cut-out cartoon Shorts kit

Reusable pieces from the elevator Short, so each new video only needs a script, a voice and maybe a prop or two.

- `src/lib/kit.tsx` - camera (2.5D multiplane), layers, the guy with 13 poses, squash pose swaps, object faces,
  sweat, smoke/steam puffs, arrows, stars, badges, code-drawn props (Box, Ball, Rope), projectile arcs, shake, sound layer.
- `Sea` (in kit.tsx) - wavy water band for lakes and seas (the see-through version goes in a `paper={false}` Layer);
  `pen(p)` makes any SVG stroke draw itself like a pen doodle. Example of both: `videos/ship/src/Ship.tsx`.
- `HookTitle` (in kit.tsx) - big question / surprising-fact text on screen from frame 0 to ~1.8 s, for sound-off
  viewers (every video, see Template.tsx). `python3 scripts/check-hook.py <vo.mp3> 0.1` checks the first word is heard
  by 0.2 s (`--trim` cuts leading silence); `check-loop.mjs` also fails an opening that does not move by 0.5 s.
- `CommentAsk` (in kit.tsx) - comment question sticker near the end of every video ("What should he paint next?"). The old
  always-on `AskBanner` is retired.
- `scripts/tighten.py` - shortens pauses and speeds a voice take up 1.06x, remaps word times.
- `CallToAction` + `ctaCues` (in kit.tsx) - the like / subscribe / comment doodle every video has once (see Template.tsx).
- `LoopOut` (in kit.tsx) - every video ends by sliding back to its opening shot, so the last frame equals frame 0 and
  the Short loops seamlessly. `node scripts/check-loop.mjs <CompositionId>` checks it.
- `src/Template.tsx` - an 8-second example that uses all of it. Copy it for each new video.
- `public/library/char/` - 37 poses of the guy (Higgsfield GPT Image 2.5, trimmed; measured in `src/lib/library.json`, so
  `<Guy pose="run" .../>` just works; `flip` mirrors any of them). The first 16: front_calm, front_worried, front_wave,
  lookup, walk, point_right, shrug, think, scared, surprised, laugh, present, side_stand, tickle_self, sweep + listen (with
  a broom). 21 more made with the last Higgsfield credits on 2026-11-24 (prompts `images/prompts-2026-11-24.md`, QA sheet
  `images/qa/poses-2026-11-24.png`): run (side view), jump (arms up, feet tucked), fall (tipping backwards), sit
  (cross-legged), knockout (lying on his back, X eyes), swim (front crawl, cheeks puffed), fly (superhero), lift (both arms
  straight up, hands empty - draw what he holds), push (side view, palms flat on something not drawn), eat (hand at his wide
  open mouth, nothing in it - draw the food), choke (hands at his throat), ouch (hands over his mouth, tears), dizzy
  (spiral eyes, tongue out), facepalm, cry (kneeling, wailing, blue tears), thumbs_up, arms_crossed (smug), back (seen from
  behind), sneak (side view, tiptoe), phone (looking at a phone), angry. knockout / swim / fly lie flat: about 2.5x as
  wide as tall, `feet` = under the middle of the body. Their head circles are fitted to the outline and stored on the old
  poses' scale (see `images/prep_poses.py`), so swapping between any two poses keeps the head size. All 37 drawn by
  `Guy` side by side: `images/qa/library-all-poses.png`. (A video that draws the guy fully in code can delete
  `public/library/char` from its own copy: 72 MB less in every bundle.)
- `public/library/music/` - 6 instrumental beds (curious, uhoh, sneaky, hero, dreamy, happy; ~40 s, -20 LUFS) and 46 more
  sounds in `public/library/sfx/` (22 animal voices - lion, bear, gorilla, monkey, dog, cat, frog, eagle, crocodile, whale,
  sea lion, dolphin, wolf, rattlesnake, bee, mosquito, horse, seagulls, cow, chicken, owl - crowds, comedy stings, an X-ray
  scanner, a page flip...), made with the last Higgsfield credits on 2026-11-24. Catalog with onsets, peaks and every hit
  time: `audio/README.md`; add new sounds with `audio/prep_sfx.py`.
- `public/library/sfx/` - whoosh, pop, ding, twang, strain, whir, crickets, giggle, zap, chirp, hum (20 s power-line bed),
  splash, bubbles, horn (ship toot), waves (3 s sea lapping, repeat it for a bed), tick / tick2 (wheel clicker),
  confetti (party-popper burst), crack (stone crack: small crackles, the big snap 0.32 s into the file), hiss (2.6 s steam hiss).
  snowball / wind (blizzard bed) / kettle / beep are synthesized (videos/polarbear). A furry guy (puff limbs, fur ruff), a front-view
  polar bear, a treadmill and a fur X-ray: `videos/polarbear/src/PolarBear.tsx`.
  rip (paper tear) / rip_short / boing / scribble are synthesized (videos/starfish). The guy split into two halves along a torn
  zigzag (the crack opens by shearing the points above its tip; each half = one leg, one arm, one eye, half a mouth; a dashed pencil
  sketch of the missing side), a six-armed starfish that splits and regrows, a starfish X-ray with a gland in every arm and a beach
  (sea band, foam line, shells, barnacled rock): `videos/starfish/src/Starfish.tsx`.
  More in the SoundLayer comment in `src/lib/kit.tsx` (flybuzz / flyby / flybuzz_slow / whoosh_slow are synthesized, from
  videos/flyeyes). Compound-eye domes, a cartoon housefly on leg IK, a fly swatter with slow-motion ghosts and a hexagon
  mosaic that turns a picture into one dot per little eye: `videos/flyeyes/src/Fly.tsx`.
- Cracks that draw themselves and then fill (water, dissolved lime, new stone), a code-drawn block with a face and a
  laurel wreath, a hard hat, a mixing trough and the Pantheon: `videos/concrete/src/Concrete.tsx`.
- Story Shorts with several characters (format of the big animated-story channels: narrator + character voices, a cut every
  ~2 s, word-by-word captions, music bed): copy `videos/whisper`. The kit now has the cast from it - `Char` / `castHead`
  (kit.tsx) draw `public/library/cast/` (king_calm / laugh / point / listen / shock, adv_front / whisper / laugh / panic /
  scrub; measured in `src/lib/cast.json`; head-anchored, same head size as the guy; no crown in the king pictures so code
  can draw a gold or wooden one), two more guy poses `sweep` / `listen` (with a broom), `Captions` (kit.tsx) and
  `scripts/assemble.py` (cuts every line of several ElevenLabs takes and lays them back to back into one dialogue track +
  `src/dialogue.json` with word times in video time, loudness-matched to -21.5 LUFS; edit its CHUNKS table per video). New sounds: gulp, squeak, peck,
  rewind, whisper_whoosh, crowd_laugh. Music beds: `public/library/music/` (above). Higgsfield, which made the pictures,
  beds and Seed Audio sounds, was cancelled on 2026-11-24.
- Night scenes and story Shorts: `videos/tower/src/Tower.tsx` - navy marker sky with star layers, moonlight / window glows,
  a house with a lit window, a tower of thin slabs, a Moon with a face and blush, self-drawing dimension arrows, a heart,
  "HA HA" speech bubbles, a time-lapse with a year badge and clicker ticks.
- Word times when the whisper model download is blocked (cloud sessions): the ElevenLabs connector's
  `creative_transcribe_audio` (eleven_scribe_v1, 0 credits) on the voice's own flow node returns per-word times.
- Yes / no wheel videos: copy `videos/wheel` - its `src/Wheel.tsx` has the prize wheel with a face, the flapper and tick
  model (ticks come from the wheel's own motion), a question card with a YES stamp, a YES sticker and paper confetti.
  `SoundLayer` cues take optional `keys` ([time, dB] fades) and `from`/`to` (play part of a file).
- Captions for a narrated Short (first used in videos/turtle): `python3 scripts/tighten.py take.mp3 tight.mp3 words-take.json --tempo 1.12 --json src/data/words.json`
  writes the Scribe words in video time; then `<Captions t={t} words={WORDS} y={...} size={80} />` inside the scene function (y about 1300,
  moved below his face for close-ups). More sounds: bonk (ball on a shell, frame-0 hit), clack (padlock), pfft (air squeezed out), gasp.
- Animal legs on the code-drawn guy (videos/jump): `Leg` / `Haunch` / `Tail` draw kangaroo, cat or flea legs IN PROFILE under
  his front-view body (hip -> knee -> ankle -> toe blended between stand / crouch / extend / tuck; a fur haunch over the hips
  makes them read as his own), plus a hopping kangaroo, a sitting cat, a flea with a face, a car with eyes, a brick house,
  a 30-floor tower with painted floor numbers (draws only the floors near the camera), a ranked height counter, an X-ray
  spring that snaps (catapult), speed streaks and wavy AIR arrows. `Poof` (now in kit.tsx) = a quick transformation puff.
  Sounds: whistle (falling), meow.
- Bat wings on the code-drawn guy (videos/batwings): `wingGeom` + `GuyWing` turn his arms into bat wings (white arm and
  finger bones, a skin membrane with scalloped edges, a thumb claw; poses are a few angles + a flap rotation), a bat hanging
  upside down from a branch (face upright, wings open / fold / reach), X-ray bone chains with knuckles (`BoneChain`), a hand
  X-ray that spreads and stretches into a wing, a sitting guy holding a phone with his feet. Sounds: flap, slap.
- See-through characters (videos/glassfrog): draw the normal white-and-ink drawing inside `<g filter="url(#glassify)">` (an
  feColorMatrix: white -> clear glass, ink stays ink) in a `paper={false}` Layer at the same z, organs on top; keep the head
  solid in a paper Layer so the face reads; a clipPath wipe swaps solid <-> glass. Also there: a code-drawn guy body (front
  view), a glass frog with a see-through belly, a toucan, blood cells running along smooth loops (`mkLoop` / `along`) and
  packing into a liver (`slotsIn`), a lights-out blackout gag. Sounds: thud (body falls flat), shimmer (vanish), squelch (clot).
- Lifting / squashing on the code-drawn guy (videos/beetle): a small IK rig (`rig`, `Limb`, `torsoD`) - arms reach any hand
  point (overhead lifts), legs squat, `sq` / `wide` crush the torso (fold marks, the head sinks into the shoulders), an
  X-ray flash shows his vertebra stack cracking, eyes that pop out on springs; a cartoon `Elephant` (side view, 7 faces,
  flapping ears, trunk down / up, legs dangle when held by the belly) and a `Tower` of 13 stacked elephants with number
  badges; a dung beetle standing up with its ball overhead (`BeetleLift`) or walking on six IK legs pulling a rope
  (`BeetleWalk`), a `DungBall` with flies; a spine X-ray (24 vertebrae counted, an elephant foot stomps, the stack
  compresses with cracks). Sound: trumpet (elephant).
- Lizard arm on the code-drawn guy (videos/lizard): `StiffArm` (one straight tube that only turns at the shoulder, a springy
  twang bend, grows out of the shoulder), `dropArm` (a popped-off arm tips over and flip-flops on the ground like a dropped
  lizard tail), a side-view green `Lizard` (tan regrown tail end, toe pads, a pink dewlap that flares, `taper` = a tapered
  tube along a quadratic curve for tails), X-ray panels for a lizard tail (vertebrae with break lines -> SNAP -> one smooth
  cartilage tube), a nose in profile (bone + cartilage tip, a finger boops it) and a human arm (all 30 bones counted, then a
  scan line turns it into one tube), an ice cream cone that lands upside down on his head (`ScoopHat`), a desert set
  (mesas, saguaros, a rock).
- Four Shorts from 2026-11-23 (all code-drawn, see each README): `videos/beaver/src/Beaver.tsx` - a 3/4 head on the front-view body
  (`GFace`, mirrored by `dir`) so things can come out of the mouth sideways; J-hook teeth (`jPts`: down past the chin, a half turn, up into
  the jaw); a beaver in side view; a birch gnawed into an hourglass that falls; seeded wood chips; a branch that snaps; a pencil fed into
  the teeth like a wood chipper; a skull X-ray in head coordinates. `videos/squeeze/src/Squeeze.tsx` - `SoftGuy`: the guy as ONE merged
  outline (ink pass, then fill pass) that melts from standing to a puddle (`f`), with noodle limbs and a tapered stream (`tubeD`) to a
  keyhole; a front-view octopus (8 tapered arms, suckers); an octopus pouring through a hole in a fish-tank divider; a skeleton X-ray whose
  bones pop away (206 -> 0). `videos/rabbit/src/Rabbit.tsx` - a side-view head with one big eye in the middle (rabbit eyes), a green
  vision cone, a side-view rabbit, a cream pie that clips to the head with drips, a SEEN FROM ABOVE panel with sweeping fields of view.
  `videos/lifespan/src/Lifespan.tsx` - an age rig (a grey beard that heaps on the floor, wrinkles, a cane), a tortoise, a Greenland shark,
  a clam, a jellyfish, a blob, a baby, and an AGE counter with the ladder's rungs ranked under it. Sounds added: chomp, gnaw, shing, creak
  (synthesized, `videos/beaver/scripts/sfx_beaver.py`). `scripts/vsplice.py` = the starfish splice made generic: per-segment tempo and
  silence from the command line, remaps the Scribe word times.
- Giant scale + a whale (videos/bluewhale): a chunky cartoon blue whale (`Whale`: side view, flipper that rotates for a high five,
  blowhole `Spout`, moods incl. dizzy, `dir` -1 faces left, `sq` squash), a beach rising out of the sea (`sandY` profile; `stand()` puts the
  guy's feet on it), a see-through front sea clipped to the water body, a tiny beach town (houses, cars and umbrellas that hop on his steps,
  a lighthouse, a rowboat that flips), `Splash` (crown of rounded columns with drops, one merged outline), `Dust`, plaster `Cast`s on his
  legs, X-ray legs that crack, a size card on bathroom scales (tape measure, KG counter, the scale bursts), a cartoon-bone leg X-ray with a
  WEIGHT vs BONES counter, and a whale-skeleton X-ray where the water drains and the ribcage squashes. `scripts/refine_words.py` (in that
  folder) maps Scribe word times onto the tight voice's loudness, chunk by chunk.
- Shrivel + a water bear (videos/tardigrade): the code-drawn guy with a `skin` colour, wrinkles (`wr`) and a shrink about his torso
  (`sc`) that sprays water (`DropSpray`) and turns into `Raisin` (a wrinkled purple-brown blob wearing his `Face`, tiny white hands and
  feet, a frost overlay); a cartoon tardigrade (`Tardi`: upright four-segment body, 8 stubby clawed legs, tube snout; `tun` morphs it
  into a dry barrel, `hot` reddens it, it can wave, keel over or hold a watering can that pours); a space set (navy sky, stars, the
  Earth, a ringed planet, a satellite, an asteroid / meteor with a trail), a freezer with see-through ice cubes that split, a table with
  a flower pot, a hot day (sun with a face, heat waves, a thermometer), a hair dryer, a microscope circle insert (`Microscope`),
  `QPoof` (the kit's POOF played faster). Moods added to the guy's face: smug, sleep, hot (panting with the tongue out).
- Close-ups: the z=1000 Layer is skipped when the camera gets closer than 250 units, i.e. above k = 4 - keep close-ups at
  k 3.9 or less (a head at k 3.9 is already about half the frame wide).
- `scripts/` - run from the video folder: `node scripts/stills.mjs --bundle 0 2.5 ...` (stills at 0.5x; `BUNDLE=work/bundle2` bundles separately so stills can run while a render uses work/bundle),
  `python3 scripts/sheet.py sheet.png 5 324 <same times>` (contact sheet), `node scripts/render.mjs <CompId> renders/x.mp4`
  (CPU render, crf 16; `[scale] [from-to]` renders a frame range to patch in; an `.aac` out renders only the sound), `python3 scripts/popscan.py renders/x.mp4` (pop scan), `python3 scripts/pauses.py vo.mp3` (pauses).
  They use the pre-installed headless Chromium in /opt/pw-browsers with `gl: angle` (about 3x faster than swangle for the
  paper / boil filters on a CPU-only machine: ~3.4 s per 1080x1920 frame per worker; `GL=swangle` to compare).
- `images/` - the original 4K pictures, prompts are in the skill.
- `skill/SKILL.md` + `skill/scripts/gen.sh` - the cutout-cartoon-shorts skill (copy to ~/.claude/skills/cutout-cartoon-shorts/).

Commands:
    npm install
    npx remotion studio src/index.ts
    npx remotion render src/index.ts Template out/video.mp4 --gl=angle      (GPU and CPU: angle beat swangle 3x on CPU)
