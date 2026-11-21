# What if you could regrow your arm like a lizard?

The user, 2026-11-21: "next video idea". Shark formula (backfire on his body by ~3 s), animal-powers series, no captions.
Cadence: the last three uploads were flea jump (legs), dung beetle (spine) and fly's eyes (eyes); arms/hands were last in the
bat wings, 4 uploads back. The lizard is new as a co-star (the gecko feet video was 17 uploads back). Upload about 20 h after
the fly's eyes.

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: grow back anything you lose - "regrow body parts" is one of the classic superpower wishes.
2. BACKFIRE: it comes back with no bones. A lizard's regrown tail has no vertebrae, only one long tube of cartilage, so a
   regrown arm would have no elbow, no wrist and no knuckles - the very thing you wanted (your arm back) is an arm you can't
   bend, and it hits his own body: he tries to scratch his nose and the stiff new arm whacks him in the face (~2.5 s).
3. ICON: a lizard dropping its tail and growing it back - every kid knows it.
4. FEEL IT NOW: the hand holding your phone (bend your elbow, your wrist, your fingers) and the tip of your nose - the same
   kind of cartilage the new tail is made of (squeeze it).
5. SHOW IT: frame 0 = POP, his arm comes off at a dotted line like a lizard's tail, it wriggles on the ground and a new one
   shoots out of his shoulder beside the smug lizard; ~2.5 s close-up WHACK, face about half the frame.
6. NUMBER: your arm has 30 bones; the new one has 0 (counted on an X-ray, 0 -> 30, then 0).
Other candidates screened the same day: bear hibernation (passive, and the backfire can't be shown by 3 s); cat's eyes (eyes
were the last upload); immortal jellyfish (passive, no part you feel); cheetah speed (no verified body backfire); cockroach
toughness (macabre); basilisk lizard running on water (the catch is only "it doesn't work": you'd need about 15 times the
power); starfish regrowth (same wish, weaker icon than the lizard's tail).

## Facts (verified 2026-11-21)
- The regenerated tail of the green anole has no vertebrae: its skeleton is a single, unsegmented tube of hyaline cartilage
  around an ependymal tube (Fisher, Geiger, Stroik et al. 2012, Anatomical Record 295: 1609-1619; Ritzman et al. 2012, same
  issue; ASU news 2012: "a single long tube of cartilage"). Lizard cartilage tubes never segment (Lozito & Tuan 2017 review).
- The tube is described as otherwise rigid, and the authors expect the regrown tail to be less flexible / less capable of
  fine movements than the original (Fisher 2012; Ritzman 2012) - so the cartoon arm is stiff, not floppy. Not said in the
  voice (an inference from anatomy, not a measurement).
- The tip of your nose is held up by the major alar cartilages, which are hyaline cartilage (StatPearls, nasal anatomy;
  Radiopaedia) -> "like the tip of your nose".
- Each upper limb has 30 bones: humerus 1, radius + ulna 2, hand 27 (8 carpals, 5 metacarpals, 14 phalanges) (OpenStax
  Anatomy & Physiology 8.2). The shoulder girdle (clavicle, scapula) is not counted.
- Lizards drop the tail at fracture planes inside the tail vertebrae and the shed tail distracts the predator (Scientific
  Reports 2022, Egernia kingii); a dropped leopard gecko tail can keep moving - swings, flips - for up to 30 minutes (Higham &
  Russell 2010, Biology Letters) -> the dropped arm wriggles on screen (description only, no number in the voice).
- "More than 60 days" to regrow a functional tail is a researcher quote in an ASU press release, not a result in the paper,
  so it is left out.

## Script (56 words, 18.0 s)
"Regrow your arm like a lizard's tail, and it comes back with no bones. A lizard's new tail is one long tube of cartilage,
like the tip of your nose. Fine for a tail. But your arm has thirty bones. The new one has zero. No elbow, no wrist, no
knuckles. So he pops it off and tries again."

## Build
Scene `src/Lizard.tsx`, all drawn in code:
- the guy = the code-drawn front view on the IK rig (beetle / fly); his right arm (screen left) is the lizard arm, `StiffArm`:
  one straight tube in a pale cartilage tint that only turns at the shoulder (`na`: 0 = down, 90 = out, 180 = up), a
  springy bend for twangs (`nwob`), grows from the shoulder (`nlen`), a dotted break line + socket when it pops off;
  `dropArm` = the popped arm tips over onto the sand and flip-flops like a dropped lizard tail; `popSeq` = pop, drop, regrow
  (used at frame 0 and again at the end); `Face` moods incl. strain / deadpan / hope; `ScoopHat` = the cone upside down on
  his head like a horn, the scoop dripping;
- the lizard (`Lizard`): side view facing left, green with a tan regrown tail end (`taper` = a tapered tube along a
  quadratic), toe pads, a pink dewlap that flares, moods smug / proud / laugh / look / down; it wags its stiff tail (FINE);
- `TailXRay`: vertebrae with red dotted break lines along the tail, SNAP, the end falls away, one smooth hollow tube of
  cartilage grows back (BONES, NEW TAIL, 1 LONG TUBE, CARTILAGE); `NoseXRay`: a nose in profile, bone at the bridge, the tip in
  the same cartilage blue, a finger BOOPs it; `ArmXRay`: humerus, radius, ulna, 8 carpals, 5 metacarpals, 14 phalanges, lit
  and counted 0 -> 30 BONES, then a scan line turns the arm into one glowing tube and the counter drops to 0 (X-RAY: NEW ARM);
- desert set: mesas, a sun, saguaros, sand, the lizard's rock.
Shots: 0 s POP (he pulls the arm off at the dotted line, it drops and flip-flops: WIGGLE; a new one shoots out: GROWS BACK;
he raises it and waves: HI); 2.2 close-up, the stiff arm swings across his face: WHACK 2.45, NO BONES 3.08; 3.95 the lizard +
X-RAY: LIZARD TAIL (SNAP 4.2, tube grows 4.42-5.62), 7.2 TIP OF YOUR NOSE inset (BOOP 7.92); 8.36 FINE (the lizard wags its stiff
tail); 9.42 X-RAY: YOUR ARM (count 9.8-10.95, scan 11.62-12.5 -> 0); 13.06 ice cream: the arm swings the cone over, PLOP 13.38
(NO ELBOW / NO WRIST / NO KNUCKLES with red X marks); 15.66 he pops it off again (POP 16.41), a new one grows (TRY AGAIN), he
grabs it = frame 0. CTA 12.98, CommentAsk "Would you still want it?" from 15.72.
Voice: James, eleven_v4, one take (22.2 s, 286 credits); line 1 tightened at 1.18 (no pauses cut), the rest at 1.12 with
pauses cut to 0.26 s, spliced -> `public/lizard/vo/tight.mp3` (17.9 s); first word 0.14 s, "no bones" 3.08 s. Word times
(Scribe) in `src/data/words.json` (video time). No new sounds (pop + squelch = the pop, slap = flip-flops, twang = the stiff arm,
stretch = regrow, squeak = boop, squelch = plop).
Render: `node scripts/render.mjs Lizard renders/lizard-1080x1920.mp4 1`; `node scripts/check-loop.mjs Lizard` = seamless loop
(frame 0 vs 0.5 s: 26.2, moving).
