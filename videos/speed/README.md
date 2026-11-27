# What if you could run as fast as these animals?

The user, 2026-11-27 (second session that day): "next idea". The third LADDER (after videos/jump, 8.8K, and videos/lifespan, 5.1K):
one question, many animals, one number climbing, the top rung hits his body. Animal-powers series, no captions.
Cadence: the last three uploads are piranha (teeth, up 11-27), gibbon (arms / falls) and cat's eyes (eyes); legs / running and
ostrich / cheetah / tiger beetle are new to the channel (the flea ladder used legs for jumping, 14 uploads back). The crab claws
wait one more upload (arms right after the gibbon).

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: super speed - the biggest classic wish we had not done (The Flash; fly's-eyes commenters called the fly "The Flash").
   The comment bubble asks it as "what if you could run like a cheetah??".
2. BACKFIRE: the top rung - at tiger-beetle speed your eyes can't keep up and you crash. A tiger beetle runs so fast its eyes can't
   collect enough light to make a picture, so it steers with its antennae held out in front; with the antennae clipped, it runs
   straight into obstacles. You have no antennae: WHAM into a tree. It hits the very thing you wanted (running fast) and your body.
3. ICON: ostrich and cheetah - every kid can name them, and "the cheetah is the fastest animal" is the famous fact the ladder breaks
   ("but for its size, a tiger beetle is faster"). The beetle is the surprise top rung (like the flea and the immortal jellyfish).
4. FEEL IT NOW: your eyes ("so fast, its eyes can't keep up") - legs are the weak spot, accepted for the ladder like the flea's.
5. SHOW IT: frame 0 = the first rung mid-action, big: he sprints with ostrich legs beside a smug ostrich, the speed counter racing
   44 -> 70. The backfire (the blur, WHAM into the tree) lands at about half way, on purpose (ladder format), with the reason after it.
6. NUMBER: one live counter - YOUR SPEED 70 -> 93 -> 750 km/h (for your size, a jet beside him) -> 0 (CRASH), the rungs ranked under it.

Candidates screened the same day (2026-11-27, second session):
- speed ladder ostrich -> cheetah -> tiger beetle (picked);
- racehorse speed -> your lungs would bleed: most racehorses bleed into their lungs when they race (exercise-induced pulmonary
  hemorrhage, about half to three quarters on post-race scopes) - verified and on your body, but a grim picture and a weaker icon for
  speed than the cheetah; keep for later;
- crab claws - next upload (arms are then 3 uploads after the gibbon);
- snake shedding -> blind for days before each shed (the eye caps go cloudy) - weak wish, eyes again;
- bear hibernation -> you'd wake too weak to stand - passive, nothing to show by 3 s;
- whale breath-hold -> the heart slows to a few beats a minute (blue whale, Goldbogen et al. 2019) - breathing a third time, tangled;
- cat "always land on your feet" -> chin and jaw injuries - falls again right after the gibbon, cat 3 uploads back;
- spider webs (Spider-Man) - still no hurt to your body (silk from the rear end; spiders walk only on the dry threads).
Live comments: yt-dlp hit YouTube's sign-in check on the 8 newest Shorts again (not bypassed); vidIQ has 3 credits (calls cost 5+),
so the comment bubble is made up.

## Facts (verified 2026-11-27)
- Fastest human: Usain Bolt's peak speed in his 100 m world record (Berlin 2009) was about 44.7 km/h.
- Ostrich: the fastest two-legged animal (Smithsonian's National Zoo); about 70 km/h (PBS; Britannica gives 72.5 km/h for a frightened
  bird; the best measured run is about 61 km/h - all beat the fastest human). Counter: 70.
- Cheetah: 25.9 m/s = 93 km/h, the top speed measured with GPS / motion collars on wild cheetahs in Botswana (Wilson et al. 2013,
  Nature 498: 185-189). "Keep up with cars" = 93 km/h is about 58 mph, road speed.
- Tiger beetle: the fastest running insect, Cicindela (Rivacindela) hudsoni, 2.5 m/s, about 120 body lengths a second (University of
  Florida Book of Insect Records, ch. 39). A cheetah does about 20 body lengths a second (25.9 m/s / ~1.2 m), so for its size the beetle
  is several times faster. Scaled to a 1.75 m person: 120 x 1.75 m = 210 m/s = about 750 km/h ("almost as fast as a jet": airliners
  cruise at about 800-900 km/h). Cartoon scaling, like the flea and beetle Shorts.
- Blind at speed: at top chase speed a tiger beetle's eyes don't collect enough light to form an image of its prey, so it stops for a
  split second to find it again, then runs on (Gilbert 1997, J Comp Physiol A; Cornell press release 2014). The world goes blurry and
  loses contrast while it runs (Gilbert). "Blind" = its vision can't keep up, not lasting blindness - the voice says "its eyes can't
  keep up".
- Antennae: while running, tiger beetles hold their antennae rigidly forward, tips just above the ground, and use them to detect
  obstacles; blinded beetles still cleared a hurdle, but sighted beetles with clipped antennae ran into it (Zurek & Gilbert 2014,
  Proc R Soc B 281: 20133072).

## Script (59 words)
"Run like an ostrich, and you'd outrun the fastest human. Like a cheetah, you'd keep up with cars. But for its size, a tiger beetle is
faster. On you, that's almost as fast as a jet. So fast, its eyes can't keep up. It feels its way with its antennae. You don't have
any. So he's back to ostrich legs."

## Build
Scene `src/Speed.tsx`, all drawn in code:
- the guy = the code-drawn front view (videos/jump rig) with animal legs in profile and a RUN CYCLE: each leg type has 4 keys (contact,
  stance, push, swing) blended with a cyclic Catmull-Rom (`cyc`), the two legs half a stride apart, the hips bobbing twice a stride, the arms
  pumping against the legs (`runArms`); `LEGS` = ost (bare pink drumstick thighs, backward ankles, two toes with a claw, a black feather
  skirt with white tail plumes), chee (spotted, digitigrade, paws, a ringed tail), bug (metallic green, the knee above the hip, spined
  shins, hooked claws, a green shell skirt with cream spots); a `sit` pose (bug legs splayed both ways); at top speed the legs become
  `LegWheel` (a whirling wheel of five leg spokes with feet + motion lines) and the arms stream back;
- speed and stride are integrated once at 240 steps a second (`Xof`, `PHof`), so the land scrolls at his real (cartoon) speed and every
  footfall is known (dust puffs, step sounds); the land = four depth bands drawn only where the camera can see (far hills, mid acacias and
  grass, a road at z 1700 for the car, the main dirt band), which smear into streaks at top speed;
- co-stars: `Ostrich` (the ost leg rig x1.62, long S neck, smug lashes), `Cheetah` (gallop between stretched and gathered, tear marks, smug,
  its jaw drops on "faster"), `Beetle` (tiger beetle: metallic green, cream spots, huge eyes, crossed ivory mandibles, segmented antennae
  that go from relaxed to stiff forward-down), `Car` (videos/jump, mirrored, spinning wheels), `Jet` (an airliner with a face, contrails),
  `Acacia` (the tree he hits);
- panels: FOR ITS SIZE (a magnifier on the running beetle + BODY LENGTHS A SECOND bars, cheetah 20 vs beetle 120, x6); ITS VIEW (the
  beetle's world blurred with a horizontal Gaussian while it runs, sharp when it stops: STOP, LOOK); FEELS ITS WAY (side view, antennae
  stiff forward, TAP on a pebble, a hop) - the panel flips between the two; `Counter` (YOUR SPEED: 70 -> 93 -> 750 km/h following his real
  speed -> 0 CRASH, the rungs ranked under it).
Shots: 0 s sprinting with ostrich legs beside the smug ostrich (comment bubble "what if you could run like a cheetah??", counter 70 km/h),
ZOOM 1.66, FASTEST HUMAN: 44 2.17; 3.0 POOF cheetah legs, the ostrich falls behind, the cheetah slides in, the car with a face (counter
70 -> 93, AS FAST AS A CAR 4.69, HONK 5.22); 5.45 FOR ITS SIZE (TIGER BEETLE 6.76, bars 7.11, x6 7.68, the cheetah's jaw drops); 8.30 POOF
beetle legs, 8.62 launch (WHOOSH), 8.80 the leg wheel, the counter races to 750, the airliner slides in beside him (ALMOST A JET 10.32),
10.42 BLUR, 10.92 WHAM into the acacia (flattened, leaves, laugh), 11.70 he drops to the ground dizzy; 11.50 ITS VIEW (BLURRY, STOP 13.0,
LOOK 13.4; CTA 12.05-14.65), 13.90 flip: FEELS ITS WAY (TAP 14.72, ANTENNAE 15.26); 15.86 close-up: he pats his head, NO ANTENNAE 16.57,
the beetle hops onto his head and taps his forehead (BOOP 16.60, 16.86); 17.0 medium shot, POOF ostrich legs, 17.38 BOING (in the gap after
"So"), he runs off and the ostrich catches up = frame 0; CommentAsk "What would you race first?" from 17.02; 19.2 loop push.
Voice: James, eleven_v4, one take (22.9 s, 300 credits) -> `scripts/vsplice.py` (line 1 at 1.22, the rest at 1.12, the commas shortened,
a 0.70 s gap after "jet." for the crash) -> `public/speed/vo/tight.mp3` (19.0 s), first word 0.12 s. Word times: Scribe (0 credits)
remapped by vsplice, refined to the loudness chunks with `scripts/refine_words.py 8,2,3,5,4,5,2,7,2,5,1,6,4,1,5` (now finds the voice itself).
Sounds: kit library + five synthesized in `scripts/sfx_speed.py` (step = a running footfall, honk = a cartoon car horn, jet = an airliner
roaring past with a falling whine, rustle = leaves shaken off a tree, zip = something tiny shooting off; 0 credits, added to the kit).
Mix: `SpeedFx` is the effects alone (`render.mjs SpeedFx work/fx.wav`); against the voice per 50 ms they sit a median 21.5 dB under it
while he speaks; the footsteps, the launch whoosh (peaks in the gap after "On you,"), the crowd laugh and the dizzy birds were lowered or
moved into pauses; the WHAM sits in the pause after "jet."; frame 0 = a hard footfall + a whoosh tail, mostly gone by the first word.
Checks: `node scripts/check-loop.mjs Speed` = seamless loop (frame 0 vs 0.5 s: 22.8, moving); pop scan flags only the WHAM, the STOP snap,
the LOOK pop, the panel closing, the two cuts and the loop push.
Render: `node scripts/render.mjs Speed renders/speed-1080x1920.mp4 1`. Thumbnails ("750 KM/H": the top rung - the leg wheel, his
screaming face, the airliner with a face): `BUNDLE=work/bundle2 COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then ThumbWide).
