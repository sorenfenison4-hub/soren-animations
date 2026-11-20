# What if you had a dung beetle's strength? (17.3 s)

The user, 2026-11-20: "next million view idea". Super strength is the top classic wish we had not done yet; the same
premise got 17.6M for a big channel ("What If Humans Had The Strength Of Ants", research/2026-11-19-findings.md). Made as a
single power in the shark formula (backfire on his body by ~3 s), not a second ladder: the flea ladder (videos/jump) went
up a few hours earlier and its numbers decide whether more ladders follow (CLAUDE.md, LADDER FORMAT TEST).

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: super strength - one of the classic superpower wishes. A power you DO (lift), not armour.
2. BACKFIRE: the first big lift crushes your spine. The beetle's strength scaled to you is about 80 tonnes; your spine is a
   stack of small bones that breaks far below that. It hits the very thing you wanted (lifting) and your own body.
3. ICON: a dung beetle rolling its ball of dung - kids know it; "the strongest insect" is a famous fact.
4. FEEL IT NOW: your spine / back - "Your spine is just a stack of little bones" (viewers sit up).
5. SHOW IT: frame 0 = him holding a tower of elephants over his head with a grin (EASY), the smug beetle beside him holding
   its dung ball up the same way; 2.12 s CRUNCH in close-up (face ~40 % of the width, an X-ray flash of his spine cracking).
6. NUMBER: 1,141 times its own weight -> 80 tonnes for you = 13 elephants (one counter each).
Other candidates screened the same day: ant strength (the measured number is only ~9x body mass for leaf-cutter ants -
for you ~650 kg, which a trained spine can take, so no clean backfire); immortal jellyfish (live forever -> you'd turn back
into a baby: strong twist, but passive and no part you feel); Greenland shark (live 400 years: weak icon and the exact
premise of a 5.8M Posit Pixel Short); hibernating bear (weaker wish, frame 0 would be asleep); cheetah, cat eyes, lizard
arm - see PLAN.md. Cadence: the last uploads were camel (drinking), bat wings (hands), flea jump (legs) - spine and a
beetle are new. Upload about 20 h after the flea jump.

## Facts (verified 2026-11-20)
- Bull-headed dung beetle (Onthophagus taurus): the strongest male could pull 1,141 times its own body weight (Knell &
  Simmons 2010, Proc. R. Soc. B; Queen Mary University of London: "the world's strongest insect"; for a 70 kg person about
  80 tonnes). The force was measured as how hard a male holds on inside a tunnel when pulled - so the voice says "pull".
- 70 kg x 1,141 = 79.9 t. Adult male African bush elephants average about 6 t -> 80 t is about 13 elephants (shown as
  13 x 6,154 kg on the counter).
- Adults are about 8-10 mm long (Cornell, Australian dung beetle guides) -> the "1 CM" ruler.
- Small animals are strong for their size: muscle force grows with cross-section, body weight with volume (the
  square-cube law, Haldane 1926) - "It gets away with it because it's tiny."
- The human spine has 24 movable vertebrae (7 neck, 12 chest, 5 lower back) above the sacrum - "a stack of little bones",
  counted in the X-ray. Cadaver lumbar vertebrae fail at a few kN, and even the highest load estimates in powerlifters are
  tens of kN; 80 tonnes is about 785 kN, so no bone number is said - the claim (it would crush) holds for any of them.
- Not used: "ants lift 50 times their weight" (press number; the leaf-cutter study found ~9x); Guinness lists 850x for
  scarab beetles, so "1,141" is credited to the study, not to Guinness.

## Build
Shark formula, animal-powers series, no captions. Scene `src/Beetle.tsx`, all drawn in code:
- the guy = the code-drawn front view on a small IK rig (`rig`, `Limb`, `torsoD`): squash `sq` / `wide` crushes the torso
  (fold marks, the head sinks into the shoulders), `hip` + `knee` give a squat, `ext` = hands above the shoulders; an X-ray
  flash (`xray`) shows a navy torso with a white vertebra stack and red cracks; moods joy / grit / oof / worry / pop
  (eyes on springs) / dizzy / focus;
- `Elephant` (side view, faces calm / worry / smile / sleep / whee / smug / scared, flapping ears, trunk down or up, legs
  dangle when held by the belly) and `Tower` (13 stacked on each other's backs, mild perspective shrink 0.965 per level,
  sway after every hit, number badges, the 13th drops in);
- the dung beetle: `BeetleLift` (standing, holding its ball overhead, hands on hips) and `BeetleWalk` (six legs on 2-segment
  IK, tripod gait, toothed front legs, two curved horns, smug eyes, a rope to its ball); `DungBall` (lumps, straw, flies);
- `SpineXRay`: 24 vertebrae counted in gold (LITTLE BONES counter), an elephant foot "80,000 KG" stomps on the head, the
  stack compresses with red cracks, CRACK, DANGER; counters 1,141 x ITS WEIGHT and 80,000 KG = 13 ELEPHANTS.
Voice: James, eleven_v4, one take (20.0 s) -> `scripts/tighten.py --tempo 1.12 --json src/data/words.json` ->
`public/beetle/vo/tight.mp3` (16.3 s); first word at 0.12 s, "crush" at 2.10 s.
Shots: 0 s tower overhead + smug beetle (comment bubble, EASY), press, 1.55 CREAK; 1.95 close-up, 2.12 CRUNCH (X-ray flash,
squash), OUCH; 3.50 the beetle pulls its ball, which swells while the counter races to 1,141 (STRONGEST INSECT, PULL);
6.40 him squashed, FOR YOU, zoom out to all 13 (numbers pop, KG counter), 8.62 the 13th drops, 8.86 THUD, 13; 9.12
close-up SQUISH, eyes BOING, stars, crowd laugh; 10.05 the beetle, POOF to its real size, tugs the giant ball, 1 CM ruler,
TINY; 11.95 X-RAY: YOUR SPINE (count, 13.72 stomp, CRACK, DANGER), CTA 11.62; 14.35 BOING back up, a careful squat, HUP,
LEGS = frame 0; CommentAsk "What would you lift first?"; 16.8 loop push.
New sound (ElevenLabs sfx, 17 credits, added to the kit library): trumpet.wav (0.95 s cartoon elephant trumpet, loud from 0).
Render: `node scripts/render.mjs Beetle renders/beetle-1080x1920.mp4 1`; `node scripts/check-loop.mjs Beetle` = seamless
loop; thumbnails ("13 ELEPHANTS", the crunch with the X-ray flash): `BUNDLE=work/bundle2 COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0`.
Lessons: a tall stack reads best as a wide zoom-out with numbered badges and the counter beside it (k 0.6, tower at screen
x ~380); keep close-up stickers above the head or beside it so the X-ray flash on the torso stays visible; in the spine
X-ray keep the foot glued to the head top while the stack compresses (the first version stopped 200 units above it).
"> <" eyes over an open mouth read as LAUGHING - for pain use squeezed eyes over clenched teeth (+ sweat); a falling thing
needs ~10 frames on screen to read (the 13th elephant first fell from 1,500 units up and showed for 3 frames).
