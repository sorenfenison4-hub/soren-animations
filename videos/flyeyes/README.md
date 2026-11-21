# What if you had a fly's eyes? (19.2 s)

The user, 2026-11-21: "next million view idea". Shark formula (backfire on his body by ~3 s), animal-powers series, no captions.
Cadence: the last three uploads were bat wings (hands), flea jump (legs) and dung beetle (spine) - eyes and the fly are new;
the last eye video (frog) was 8 uploads back. Upload about 20 h after the dung beetle.

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: see the world in slow motion and dodge anything (bullet time) - a power you DO, and the reason nobody can swat a fly.
2. BACKFIRE: the same eyes are almost blind - each little eye sees one dot, so the picture is a blurry mosaic. It hits the
   very thing you wanted (seeing) and your own body: he dodges the swatter, then walks face first into your screen (2.22 s).
3. ICON: the housefly - every kid knows one, and its famous trick is that you can never swat it.
4. FEEL IT NOW: your eyes, reading this. The mosaic panel shows his face the way a fly would see it next to the sharp one.
5. SHOW IT: frame 0 = slow-motion dodge of the fly's swatter, huge red fly eyes on his face; 2.22 s BONK on the glass in
   close-up (face ~60 % of the width), slides down it: ALMOST BLIND.
6. NUMBER: four times faster; over 3,000 tiny eyes in each eye (counted 0 -> 3,400); a meter wide to see as sharp as you.
Other candidates screened the same day: lizard arm regrowth (strongest wish left, but hands/arms were 3 uploads back with
the bat wings - next upload); cat's eyes (see in the dark, but the daylight-acuity number is still unsettled); immortal
jellyfish (passive, no part you feel); cheetah speed (no verified body backfire); cockroach toughness (the catch needs an
accident first, macabre); sperm whale breath-hold (the trick is not famous); spider webs (the catch does not hurt you).

## Facts (verified 2026-11-21)
- Housefly (Musca domestica): about 3,400-3,500 facets (ommatidia) per compound eye - females 3,433, males 3,484 on average,
  counted by hand (Sukontason et al. 2008, Parasitology Research). Voice: "over three thousand"; the counter stops at 3,400.
- Each facet is its own little eye with one lens that samples one point of the scene; the picture is a mosaic of those
  points (apposition compound eye; Land & Nilsson, Animal Eyes; Britannica, photoreception).
- Speed: housefly photoreceptors follow flicker up to roughly 230-300 flashes a second (flicker-fusion measurements; Healy
  et al. 2013, Animal Behaviour, compare this across species); people fuse flicker at about 60 a second -> "about four
  times faster". The round "250 vs 60" pair appears only in press write-ups, so no exact rate is shown on screen (x4 only).
- Why you can't swat one: before take-off a fly works out where the threat is and sets its legs to jump away, within about
  100 ms of seeing it (Card & Dickinson 2008, Current Biology, fruit flies) - used in the description only.
- Blur: compound eyes are limited by diffraction through their tiny lenses; insect acuity is around 1 cycle per degree or
  less versus about 60 for people (Caves, Brandley & Johnsen 2018, Trends in Ecology & Evolution) - far below the human
  legal-blindness line, so "almost blind" holds.
- A compound eye as sharp as the human eye would have to be about a meter across (Kirschfeld 1976, The Resolution of Lens
  and Compound Eyes; quoted in Gregory 2008, Evolution: Education and Outreach) -> "they'd have to be a meter wide".

## Build
Scene `src/Fly.tsx`, all drawn in code:
- the guy = the code-drawn front view on the IK rig from videos/beetle plus an upper-body `lean` around the hip, `app`
  (grows around his head = walking at the camera), `rot` (tips over around the feet), `smush` (pressed flat on the glass,
  big palms), `sq` (head squash), `E` (eye size: 1 = fly eyes, 3.25 = a meter wide); `FlyFace` = two red compound-eye
  domes (`Dome`: crescent shade, hexagon mesh `MESH` / `MESH_FINE`, glint) with lids / brows / mouths per mood; `HumanFace`
  for his own eyes after the POOF;
- the fly (`FlyBug`): front view, red domes, four thorax stripes, wings that beat slowly in slow motion (2.6 Hz) and blur at
  normal speed, six bristly legs on 2-segment IK (`hover` / `sit` / `rub` / `hold` a swatter grip), moods smug / laugh /
  yawn / angry / look;
- `Swatter` (yellow handle, blue mesh head) with slow-motion ghost copies + air ripples in a paper-less layer; `BigHand`
  (YOU) from off-screen right; the glass overlay (tint, glare streaks, face smudge, slide trails);
- `EyeZoom`: the fly's head in the X-ray frame, zoom into one eye (hexagon lattice r 10 x3), the facets light up as the
  counter runs 0 -> 3,400 PER EYE, then each one flips to a single dot of his face (`faceColor`) = FLY VISION, with the sharp
  YOU SEE inset; `Tape` + "1 METER" card on the swollen eye.
Shots: 0 s slow-motion sweep of the fly's swatter past his face (SLOW-MO, DODGE), 1.62 SMACK on the ground; 1.72 he struts at
us, 2.22 BONK on the glass, slides down (ALMOST BLIND); 4.00 the fly lands on his head, YOU swing a swatter in slow motion
(x4 SEES FASTER, RUB RUB, YAWN), 7.59 SMACK on his head (MISS); 8.22 ZOOM: FLY EYE (count, mosaic at 11.55, FLY VISION, ONE DOT
EACH); 12.95 he squints, 14.45 his eyes swell to a meter wide, the fly sits on one, tape 1 METER, 15.98 THUD; 16.2 POOF (his
own eyes), the fly fetches a swatter, 17.42 POOF (fly eyes on, FLY FIGHT), the swing = frame 0. CTA 12.98, CommentAsk
"Would you want fly eyes?" from 16.18.
Voice: James, eleven_v4. The first take (23.4 s) had the catch ("almost blind") at 4.4 s, so the first line was re-taken
on its own ("With a fly's eyes, you'd dodge anything, but you'd be almost blind.", 67 credits), tightened at 1.18 and spliced
before the rest of the take (from "A fly sees", tightened at 1.12) -> `public/flyeyes/vo/tight.mp3` (18.3 s); first word
0.16 s, BONK in the pause after "anything" (2.22 s), "blind" 3.59 s. Word times (Scribe) in `src/data/words.json`.
New sounds, synthesized in code (0 credits) and added to the kit library: flybuzz.wav (1.6 s housefly buzz, ~205 Hz wing
beat), flyby.wav (1.1 s buzz passing by), flybuzz_slow.wav (2.4 s the same buzz 3x slower: slow-motion wing beats),
whoosh_slow.wav (3 s whoosh at 0.46x speed: a slow-motion swing; start it 0.42 s in for a frame-0 hit).
Render: `node scripts/render.mjs Fly renders/flyeyes-1080x1920.mp4 1`; `node scripts/check-loop.mjs Fly` = seamless loop
(frame 0 vs 0.5 s: 27.6, moving); thumbnails ("1 METER WIDE", the swollen eyes with the fly on top):
`COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then ThumbWide).
Lessons: a frame-0 near miss needs the swatter path worked out against the lean (an arc around the fly's grip swept
through his leaned head twice) - drive the swatter head along an explicit path and hang the grip and the fly off it; keep the
fly out of the comment bubble's band (frame 0 lowered 60 px); hard faces on the glass read best with palms flat beside the
face, a tint, bold glare and the smudge left behind as he slides down.
