# What if you had a crab's claws?

The user, 2026-11-27 (third session that day): "next idea". Shark formula (the backfire hits his body by ~3 s), animal-powers
series, no captions. Cadence: the last three uploads are speed (legs / running, up 11-27), piranha (teeth) and gibbon (arms / falls);
arms and hands are 3 uploads back after this one. No crab in any earlier Short; beach set last used by the blue whale (6 uploads back).

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: crush anything with one pinch - the coconut crab has the strongest pinch measured in any crustacean (it cracks coconuts).
   The comment bubble asks it as "what if you had a crab's claws??".
2. BACKFIRE: a claw is hard shell and can't grow. To grow, a crab molts: first the big claw muscle wastes away so it can be pulled
   back out through the narrow joints, then the new claw comes out soft. It hits the very claws you wanted, on your own arms: they
   shrink, you pull them out through your wrists, and what comes out is soft.
3. ICON: a crab - every kid knows it; the famous trick is the pinch.
4. FEEL IT NOW: your hands and wrists - squeeze your hand into a fist.
5. SHOW IT: frame 0 = he cracks a coconut in a giant claw beside a smug coconut crab (CRACK on frame 0); 1.9 s the shell splits at
   the wrist, a pale soft claw slides out (FWOOP), the empty shell drops (CLUNK), shocked close-up, SOFT.
6. NUMBER: PINCH 0 -> 180 KG on a carnival strength tester (the crab rings the bell), MUSCLE 100 -> 50 % in the X-ray.

Candidates screened the same day (2026-11-27, third session):
- crab claws (picked; queued on 11-27 for when arms were 3 uploads back) - crush-anything wish + a body backfire with a picture;
- cockroach "survive anything" (lives a week without its head, then dies of thirst) - survive again right after the tardigrade, grim;
- basilisk lizard "walk on water" - for a person it needs about 30 m/s (Glasheen & McMahon 1996): "it doesn't work", and fails ICON;
- eagle eyes (zoom vision) - the catch (huge eyes that barely move) is the owl's again;
- mantis shrimp eyes (see new colours) - they are bad at telling colours apart (Thoen et al. 2014): "it doesn't work";
- octopus camouflage - colour-blind is a weird fact, not a hurt;
- cat "always land on your feet" - chin and jaw injuries (high-rise syndrome); falls right after the gibbon;
- racehorse speed (lungs bleed) - speed right after the speed ladder.
Live comments: yt-dlp hit YouTube's sign-in check on the 8 newest Shorts again (not bypassed); vidIQ has 3 credits (calls cost 5+),
so the comment bubble is made up (@pinchy_doodle, 3.1K).

## Facts (verified 2026-11-27)
- Pinch: 29 wild coconut crabs (Okinawa) pinched 29.4-1,765.2 N; the strongest, a 2.12 kg crab, 1,765.2 N = 180 kg-force - more than
  any other crustacean measured; the 3,300 N for a 4 kg crab is an extrapolation, so it is not used (Oka, Tomita & Miyamoto 2016,
  PLoS ONE 11: e0166108). "90 times its weight" and the lion comparison appear only in press, so neither is used.
- Molt-induced claw muscle atrophy: before the molt the claw closer muscle shrinks so it can be pulled through the narrow basi-ischial
  joint at ecdysis; fully reversible, driven by ecdysteroids (Mykles lab; land crab Gecarcinus lateralis). Size: 30-60 % of the
  muscle protein (Skinner 1966), mass reduced 2-3-fold (SICB abstract, Mykles lab), "up to 60-75 % of their mass" (Medler, Brown,
  Chang & Mykles). The voice says "shrinks by half" - inside every one of these ranges. The muscle grows back over about three weeks
  after the molt (Mykles, CSU release 2006).
- The new shell is soft after the molt (soft-shell crab); coconut crabs molt in a burrow for 3-16 weeks (Animal Diversity Web) and eat
  their old exoskeleton afterwards, reabsorbing the calcium (Pacific Science, after Fletcher et al.) - "to harden it, he eats his old
  claws".
- "Through your wrists": the claw (propodus) is far wider than the joints behind it (the carpus = the crab's wrist, then the
  basi-ischium, the narrowest); for him the first narrow joint is the wrist.

## Script (59 words)
"Get a crab's claws, and you'd have to pull them out through your wrists. A coconut crab can pinch with a hundred and eighty kilos.
But a claw is a shell, and it can't grow. So the muscle inside shrinks by half, and slides out. The new claw comes out soft. To
harden it... he eats his old claws."

Voice: James, eleven_v4, one take (21.6 s, 294 credits) -> `scripts/vsplice.py` (line 1 at 1.22, the rest at 1.12, gaps 0.06-0.30 s)
-> `public/crab/vo/tight.mp3` (16.7 s), first word 0.12 s, "pull" 1.81 s. Word times: Scribe (0 credits) remapped by vsplice, then
refined to the loudness chunks with `scripts/refine_words.py 14,8,3,6,4,7,3,6,3,1,4`.

## Build
Shark formula, animal-powers series, no captions. Scene `src/Crab.tsx`, all drawn in code:
- the guy = the code-drawn front view (gibbon / piranha rig, normal arms) with a crab claw for each hand (`Claw`: wrist joint at 0,0,
  cuff, palm with granules and a highlight, fixed finger with teeth bumps, movable finger that opens about its pivot, dark tips; `hard`
  1 -> 0 blends the red shell into a pale soft claw, `droop` sags the palm and lets the fingers hang, `shell` = an empty old shell with
  a dark opening at the wrist, `crack` draws the split, `bites` eats it from the tip with a mask, `mid` = what the pincers hold);
  faces from the gibbon rig plus `chew` (cheeks that bulge past the head outline);
- the coconut crab (`Crab`): front view, carapace with a dark top and a pale rim, eyes on stalks with lids, brows, antennae, six
  walking legs with joints and dark tips, two chelipeds by IK with the same `Claw` (its left one bigger); moods smug / grin / laugh /
  shock / chomp / calm;
- the beach (far: sea, horizon, island, doodle clouds; near: sand, two palms), coconuts and halves, a carnival strength tester (`Tester`:
  a PINCH base with a squeeze handle, a 0-180 KG column, a puck, a bell that rings);
- inserts: X-RAY: CRAB CLAW (the shell outline glows - SHELL; the muscle pushes, the shell shakes red - CAN'T GROW; the muscle glows -
  MUSCLE, the narrow joint is ringed - NARROW, the muscle shrinks to half and squeezes out through the joint - EMPTY), counters
  PINCH 0 -> 180 KG (COCONUT CRAB) and MUSCLE 100 -> 50 % (HALF).
Shots: 0 s beach, he cracks a coconut in claw B (CRACK), the halves fly, the crab snips back (SNIP SNIP 1.10); 1.76 close-up, 1.92 the
shell splits at the wrist (CRACK), 2.0-2.42 claw and shell come apart, the soft claw slides out stretched (FWOOP), 2.45 the shell falls,
CLUNK 2.72, the soft claw droops (SOFT 2.95); 3.28 the crab pinches the tester (EASY 4.75), the puck shoots up 5.15-5.98, DING; 6.60
X-RAY (SHELL 7.84, CAN'T GROW 8.93, MUSCLE 9.68, NARROW 10.1, HALF 11.20, EMPTY 12.24; CTA 9.55-12.15); 12.46 his soft claw squeezes a
coconut, 13.50 it squirts up (BOING), 13.86 BONK on his head, dizzy stars, the crab laughs; 14.28 he picks up his old shell, the crab
crunches its own (CRUNCH); 15.26 close-up, the shell sticks out of his mouth, CRUNCH x3 (15.58, 15.92, 16.26), gulp, 16.50 his claws
harden (HARD AGAIN), the crab tosses him a coconut, CATCH 16.98 = the frame-0 pose; CommentAsk "Would you still want them?" from 14.34;
17.20 loop push.
Sounds: all from the kit library (crack, whoosh, splash, seagulls, waves, clack, rip_short, squelch, fwoop, whistle, bonk, thud,
crowd_gasp, squeak, pop, slide_up, tick, ding, crowd_ooh, zap, shing, stretch, creak, wrong, scribble, slide_down, boing, crowd_laugh,
dizzy_birds, chomp, gulp) - no new sounds, 0 credits; every effect after frame 0 sits 3 dB lower. Mix check: the `CrabFx` composition is
the effects alone (`render.mjs CrabFx work/fx.wav`) - against the voice per 50 ms they sit a median 24.5 dB under it while he speaks;
the frame-0 whoosh, the CLUNK, the DING, the BOING and the chomps were lowered where they came within 6 dB of a word.
`node scripts/check-loop.mjs Crab` = seamless loop (first vs last 0; frame 0 vs 0.5 s: 19.5, moving).
Thumbnails ("SOFT CLAWS": the 2.36 s backfire - his shocked face, the soft claw just out of the cracked shell above it, the smug crab):
`BUNDLE=work/bundle2 COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then ThumbWide).
Render: `node scripts/render.mjs Crab renders/crab-1080x1920.mp4 1` (22.7 min on 4 CPUs while other renders ran). The effects were
lowered after the render started, so the sound was rebuilt instead of re-rendered: `CrabFx` (the effects alone, 7 s) + the voice at
0.1 s mixed in ffmpeg (default mono -> stereo upmix, which matches Remotion's level: voice windows within 0.3 dB) and remuxed with
`-c:v copy`. The Remotion render's own AAC decoded 2048 samples (42.7 ms) late with a 17.75 s audio track; the remuxed file has the
voice exactly at 0.1 s and both streams at 17.70 s. Final: 1080x1920, 60 fps, 17.7 s, -21.4 LUFS, peak -4.8 dBFS.
Pop scan (`scripts/popscan.py`): 60 flags, all intended - the cuts, the sticker and counter pop-ins, the CRACK / CLUNK / DING / BONK
hits and shakes, the X-ray opening and closing, the CTA taps, the chomps, the camera pull-back to the frame-0 framing and the loop push.
