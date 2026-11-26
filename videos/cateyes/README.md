# What if you had a cat's eyes?

The user, 2026-11-26: "next idea". Shark formula (the backfire hits his body by ~3 s), animal-powers series, no captions.
Cadence: the last three uploads are tardigrade (whole body / water), blue whale (legs and bones) and lifespan (age ladder); eyes
were last used by the rabbit, 4 uploads back (5 back once this goes up) - the "eyes again" block in PLAN.md has run out.

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: see in the dark - the owl's winning wish (23K), in the screen's own list; the comment bubble asks it as
   "what if you had a cat's eyes??".
2. BACKFIRE: the eye is built for the dark, so by day it sees about seven times less detail than yours - it hits the very
   thing you wanted (seeing) and your own eyes. Shown as a BONK: the lights come on, his pupils snap to slits, HIS VIEW goes
   blurry and the next yarn ball hits him in the face.
3. ICON: the cat - every 6-year-old can name it, and "cats see in the dark / cat eyes glow" is the famous trick.
4. FEEL IT NOW: your eyes, reading this sharp right now (the eye chart: you read the bottom line, cat eyes only the big E).
5. SHOW IT: frame 0 = a pitch-dark room in close-up, his huge glowing cat eyes beside the smug cat's, he snatches a yarn ball out
   of the air; 1.72 s lights on; 2.36 s BONK in his face (close-up, dizzy stars).
6. NUMBER: about 7x blurrier (BLURRIER x1 -> x7 on a live counter beside a sharp YOU chart); LIGHT GOES THROUGH: YOU 1 vs CAT 2.

Candidates screened the same day (2026-11-26):
- cat's eyes (picked) - the strongest wish + icon pair left; the daylight number is settled below;
- porcupine quills (nothing can touch you -> you stab yourself when you fall: Roze, Locke & Vatakis 1990 found healed fractures in
  35.1 % of 37 skeletons, so they fall often, and the quills carry antibiotic fatty acids) - icon and backfire pass, the WISH is
  armour again (turtle);
- gibbon swing (Tarzan -> about a third of wild gibbon skeletons have healed fractures, Schultz 1944) - broken bones two uploads
  after the blue whale's broken legs; make it after one more upload;
- axolotl regrowth (the viewer request "now grow it like a axolotl") - repeated amputation compromises regrowth and scars over
  (Bryant et al. 2017, npj Regenerative Medicine, 8 limbs per group; no per-round count in any summary) - a limit, not a hurt;
- crocodile bite (the strongest bite measured, ~16,400 N, Erickson et al. 2012) - the weak jaw-opening muscles (a hand or tape
  holds it shut) don't hurt you, and bites were done twice (shark, beaver);
- hairy "Wolverine" frog claws (breaks its own toe bones to push claws through its skin, Blackburn et al. 2008) - the best claw
  backfire, fails ICON two uploads after the tardigrade's weak icon;
- cheetah (still no verified body backfire; overheating was disproved, Hetem et al. 2013); chameleon colour change (it shows your
  mood - social, not your body).
Live comments: yt-dlp hit YouTube's sign-in check on the 8 recent Shorts again (not bypassed); vidIQ has 3 credits (calls cost 5+),
so the comment bubble is made up (@yarnball_doodle, 4.1K).

## Facts (verified 2026-11-26)
- Cats see much better than people in dim light (not in total darkness): a reflective layer behind the retina, the tapetum lucidum,
  sends light that passed the retina back through it, so the photoreceptors get a second chance; it also makes the eyeshine in
  flash photos (veterinary ophthalmology; PetMD with vet ophthalmologist Paul Miller) -> "a mirror at the back bounces light through
  twice. That's the glow." The often-quoted "a sixth of the light" is only in secondary write-ups, so it is not used.
- Daylight acuity: Caves, Brandley & Johnsen 2018 (Trends in Ecology & Evolution, acuity of ~600 species): people resolve about 60
  cycles per degree, cats under 10; Duke's release on the paper: human eyesight is roughly seven times sharper than a cat's. Many
  studies put cat acuity at about 20/100-20/200 (Miller, PetMD; a single behavioural study's 20/30 is an outlier) -> "By day, a cat
  sees about seven times blurrier than you." / BLURRIER x7 / ONLY THE BIG E (the 20/200 line is the big E, 20/100 the next row).
- The cat retina is rod-dominated with far fewer cones (colour and fine detail) - description only ("mostly night cells").
- Slit pupils: the domestic cat's pupil changes area about 135-fold, a round human pupil about 15-fold (Banks et al. 2015, Science
  Advances 1: e1500391) - description only.

## Script (59 words)
"See in the dark like a cat, and daylight would blur everything. Its eyes are built for the dark: a mirror at the back bounces
light through twice. That's the glow. But by day, a cat sees about seven times blurrier than you. He brushed his teeth with the
cat. So now he naps all day, like the cat."

## Build
Shark formula, animal-powers series, no captions. Scene `src/Cat.tsx`, all drawn in code:
- the guy = the code-drawn front view on the IK rig (tardigrade) with `CatEye`s (almond, iris all over, a pupil from a slit `pw` 0 to
  wide `pw` 1, top / bottom lids, `glow`); night = his skin pulled to moonlit blue (`NSKIN`) and `nite()` on every colour; the glow
  halos are a second pass of the same rig in a `paper={false}` layer (`pass="glow"`); holds a yarn ball or a phone (`PhoneG`, flash LED);
  new moods squint / dazed / foam (brushing, foam bubbles); lying down = `rot -90` with the head `tilt` as its world angle;
- the cat (`Cat`): an orange tabby sitting front view - haunches, chest patch, raised paw on a tube (`paw`, `pawSide`, `pawTo`),
  a tapered striped tail (`taper` / `cbez`) that can be pulled to any point (`tailTo`, with a toothpaste blob `paste`), moods smug /
  happy / wide / annoyed / shock / hiss (fangs, ears flatten `ears`, fur puff `puff`); `CatCurl` = curled asleep, eyes pop open;
- sets: the living room (night or lit; wall switch, dresser, lamp, a fish picture, the window always night outside), the eye-chart
  wall by day, the bathroom (tiles, mirror, counter with sink, cup + toothbrush, toothpaste), the nap corner (window sun -> moon,
  rug, a sunbeam in the glow layer);
- inserts: HIS VIEW (the whole set + cat blurred 15 px, a blurred yarn ball growing at the camera), X-RAY: CAT EYE (side view:
  cornea, iris, lens, pink retina, teal-gold MIRROR, optic nerve; a light beam in and back out with badges 1 and 2 and the eyeshine
  at the pupil) + LIGHT GOES THROUGH YOU 1 | CAT 2, a selfie polaroid with four blazing eyes, two eye charts YOU vs CAT EYES (CSS blur
  0 -> 7.5 px with BLURRIER x1 -> x7).
Shots: 0 s dark close-up, the catch (CATCH); 1.66 CLICK, lights on, pupils snap; 1.92 HIS VIEW; 2.36 BONK (BLURRY, dizzy stars);
3.36 the cat in the dark (NIGHT MODE); 5.2 X-RAY (MIRROR, beam 6.40-7.40); 7.98 selfie, 8.28 FLASH, 8.4 the photo (GLOW, crowd laugh);
9.02 BY DAY + charts 9.9 (x7 at 11.7, ONLY THE BIG E 12.05), CTA 12.2; 12.84 the bathroom: tail grabbed 13.0, toothpaste 13.34,
BRUSH BRUSH 13.62, HISS 14.45 (crowd laugh); 14.8 the nap (NAP TIME), dusk 15.95-16.6, eyes open 16.74 (WIDE AWAKE), CommentAsk
"Would you take cat eyes?" from 14.89; 17.25 loop push.
Voice: James, eleven_v4, one take (21.3 s, 296 credits) -> `scripts/vsplice.py` (line 1 at 1.22, the rest at 1.12, gaps 0.03-0.24 s)
-> `public/cateyes/vo/tight.mp3` (16.9 s), first word 0.13 s, "blur" 2.36 s. Word times = the Scribe words remapped per segment (a
word is mapped by the segment that holds its start) in `src/data/words.json`.
New sounds, synthesized in code (`scripts/sfx_cat.py`, 0 credits) and added to the kit library: shutter.wav (phone-camera snap: two
clicks + a flash ping), brush.wav (1.4 s toothbrushing, ~7 strokes a second). The rest from the kit library (click, shing, bonk,
dizzy_birds, cat_hiss, cat_purr, meow, snore, crickets, crowd_laugh, ...).
Render: `node scripts/render.mjs Cat renders/cateyes-1080x1920.mp4 1` (25 min on 4 CPUs); the first mix had effects within 2 dB of the
voice at frame 0, on the BONK and on the X-ray dings, so those cues were lowered, the sound rendered alone (`render.mjs Cat work/sound3.aac`)
and remuxed (`ffmpeg -i video.mp4 -i sound3.aac -map 0:v -map 1:a -c copy`): effects ~10 dB under the voice, -21.6 LUFS, peak -3 dBFS.
Pop scan: every flag is an intended cut, pop-in or hit; `node scripts/check-loop.mjs Cat` = seamless loop (first vs last
0; frame 0 vs 0.5 s: 17.0, moving). Thumbnails ("BLURRY BY DAY": the frame-0 dark close-up, his glowing eyes beside the smug cat):
`BUNDLE=work/bundle2 COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then ThumbWide).
