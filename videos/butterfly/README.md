# What if you could turn into a butterfly?

The user, 2026-11-22: "next million view idea". Shark formula (backfire on his body by ~3 s), animal-powers series, no captions.
Cadence: the last three uploads were dung beetle (spine), fly's eyes (eyes) and lizard (arm); wings were last in the bat wings,
5 uploads back. The butterfly is new as a co-star. Upload about 20 h after the lizard.

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: fly (with big butterfly wings) - turning into an animal and flying are both classic wishes; flying is our best
   wish after see-in-the-dark and a killer bite (bat wings 7.5K, wings 6.7K).
2. BACKFIRE: to get the wings you'd first melt into soup - inside the chrysalis a caterpillar digests its own body - and you'd
   come out with a straw for a mouth, so you could never chew again. It hits your own body (all of it) and the very thing you
   wanted (the wings cost you your body, and then your teeth).
3. ICON: caterpillar -> chrysalis -> butterfly; every kid learns it, and the monarch is the butterfly everyone can draw.
4. FEEL IT NOW: your teeth - bite down; a butterfly can't. (On screen: YOUR TEETH 32 -> 0.)
5. SHOW IT: frame 0 = him flying on huge monarch wings beside a smug monarch, wings flapping, whoosh + flap; ~2.4 s close-up:
   the chrysalis snaps shut around him and his face melts into a puddle inside it (SPLORCH): SOUP.
6. NUMBER: about two weeks in the chrysalis (DAYS 0 -> 14 counter from the first half of the video); YOUR TEETH 32 -> 0.
Other candidates screened the same day: cheetah speed (still no verified body backfire - the overheating story is disproved, and
the lactate explanation is a researcher's guess in a press piece); peregrine falcon dive (blacking out in the pull-out: measured
only ~3 g, ~10 g is a model prediction - not enough to say you'd black out); electric eel (why it doesn't shock itself is still
unknown, and the eel was done in eel/axolotl); polar bear fur (never cold -> overheats when it runs, Hurst/Watts 1982 treadmill
studies - verified, but "never be cold" is a weaker wish; kept as a candidate); spider webs (the silk comes out of your rear and
sticks to you - a huge wish, but the catch does not hurt you); cat's eyes (eyes were 2 uploads back - next session); starfish
"clone yourself" (tear yourself in half - strong, but regrowth again right after the lizard; wait 2-3 uploads); immortal
jellyfish (passive, no part you feel); narwhal tusk (one giant sensitive tooth - the wish is weak).

## Facts (verified 2026-11-22)
- In the chrysalis "the caterpillar digests itself, releasing enzymes to dissolve all of its tissues"; cut one open at the
  right time and "caterpillar soup" oozes out (Scientific American, Jabr 2012, "How Does a Caterpillar Turn into a
  Butterfly?"). Depending on the species some caterpillar muscles and parts of the nervous system are largely kept, so the
  voice says "a few tiny clumps of cells survive", not "only".
- Highly organized groups of cells, the imaginal discs, survive the digestion; there are discs for the eyes, the wings, the
  legs and so on, and they build the adult (same article; National Geographic 2013 on 3-D scans of painted lady pupae).
- Monarch chrysalis: about 8-15 days, most often 10-14, shorter when warm (University of Maryland Extension FS-1144; Espace
  pour la vie; Kansas DOT pollinator page) -> "about two weeks"; the DAYS counter stops at 14.
- Adult butterflies feed through a proboscis, a tube made of two halves (galeae) that the butterfly joins together after it
  comes out; adults have no working chewing mouthparts and only sip liquids - the mandibles are reduced and nonfunctional in
  the Glossata, the group with almost all butterflies and moths (Krenn 2010, Annual Review of Entomology) -> "a straw for a
  mouth. No more chewing."
- An adult has 32 permanent teeth including the 4 wisdom teeth (standard dental anatomy) -> YOUR TEETH 32 -> 0 on screen.

## Script (52 words)
"Turn into a butterfly, and first you'd melt into soup. Inside the chrysalis, a caterpillar digests its own body. A few tiny
clumps of cells survive, and they build the wings. About two weeks later, out you come, with a straw for a mouth. No more
chewing. So he drinks his pizza."

## Build
Scene `src/Butterfly.tsx`, all drawn in code:
- the guy = the code-drawn front view on the IK rig (beetle / fly / lizard) with `WingPair` behind him: monarch fore + hind
  wings (orange, black veins, black border with white dots, black apex), `flap` 0 = spread -> 1 = up over the back (a rotation
  in the picture plane), `crumple` = fresh out of the chrysalis; `Straw` = the proboscis that replaces his mouth: a coil under
  the mouth (spiral) morphing into any curve (`target`, head-local) with a sway, squashed by the pizza (`coilSq`); `meltHeadD` =
  the head outline sagging into drips, then the head sinks and flattens into the soup;
- the monarch (`Monarch`): front view, the same wings at 0.56, black body with white dots, a big dark head with white
  features, antennae, its own coiled straw; moods smug / look / laugh / ew / proud / pop; drawn in its own layer so it flies
  outside the chrysalis;
- the chrysalis (`ChrysShell`, `ChrysSoup`): jade with the gold-dot crown on a stalk under a branch, zips up from the bottom,
  see-through (own paper-free layer), soup rising inside with his eyes floating; dark with the folded orange wings showing
  before he comes out, a crack, two halves that swing out, fall and fade;
- `ChrysXRay`: a curled striped caterpillar fizzes and dissolves into soup (DIGESTS ITSELF), glowing clumps of cells pop up
  (WINGS / LEGS / EYES, SURVIVORS) in a zoomed cut, then they grow into a small butterfly (NEW WINGS); DAYS 0 -> 14 counter;
- meadow: hills, daisies and pink flowers, the branch; the stump with a blender in the last shot; a pizza slice.
Shots: 0 s flying (comment bubble, whoosh + flaps); 1.45 the chrysalis zips up (ZIP); 2.15 close-up, the face drips from 2.3,
SPLORCH 2.4, sinks into the soup by 3.15, SOUP 2.92, his eyes float; 3.55 X-RAY: CHRYSALIS (dissolves 5.72-7.0); 7.15 zoom on
the clumps; 9.4 wide, they build a butterfly 10.06-10.9; 10.95 the dark chrysalis, CRACK 11.7, he pops out 12.35, wings pump
12.42-12.72, TA-DA; 13.05 close-up, the straw BOINGs out 13.46 (STRAW), rolls back 14.16; 14.55 pizza BOING off the coil 14.8,
YOUR TEETH 32 -> 0, NO CHEWING; 15.7 pizza tossed into the blender, WHIRR 16.12, the straw dips in, SLURP 16.86, flies off 17.32
= frame 0. CTA 11.0, CommentAsk "Would you still do it?" from 15.01.
Voice: James, eleven_v4, one take (21.4 s, 278 credits); line 1 tightened at 1.2 (pause cut to 0.14 s), the rest at 1.12 with
pauses cut to 0.26 s, spliced -> `public/butterfly/vo/tight.mp3` (17.4 s); first word 0.14 s, "melt" 2.42 s. Word times (Scribe)
in `src/data/words.json` (video time). No new sounds (flap = wing beats, stretch = zip / wings pumping, squelch + thud = the melt,
bubbles = the soup, crack, twang = the straw, whir = the blender, gulp + glug = the slurp).
Render: `node scripts/render.mjs Butterfly renders/butterfly-1080x1920.mp4 1`; `node scripts/check-loop.mjs Butterfly` = seamless
loop (frame 0 vs 0.5 s: 49.4, moving). Thumbnails: `COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then ThumbWide).
