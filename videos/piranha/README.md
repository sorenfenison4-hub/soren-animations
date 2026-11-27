# What if you had a piranha's teeth?

The user, 2026-11-27: "next idea". Shark formula (the backfire hits his body by ~3 s), animal-powers series, no captions.
Cadence: the last three uploads are gibbon (arms / falls, up 11-27), cat's eyes (eyes) and tardigrade (whole body / water); teeth were
last used by the beaver, 8 uploads back. No piranha, crocodile or fishbowl in any earlier Short.

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: a killer bite - the strongest bite for its size of any bony fish, bite through anything (the shark's wish, our #4 Short).
   The comment bubble asks it as "what if you had a piranha's teeth??".
2. BACKFIRE: a piranha's teeth lock into each other like one saw blade, so they never come out one by one: every tooth on one side
   of the head drops out at once, then later the other side. It hits the very teeth you wanted, on your own face: half your teeth fall
   out in one piece (at the table, into your soup).
3. ICON: the piranha - the fish with the scary teeth every kid knows; the famous trick is the bite.
4. FEEL IT NOW: your teeth - bite down.
5. SHOW IT: frame 0 = a close-up of him crunching a coconut in half with piranha teeth (CHOMP) beside a smug piranha in its bowl;
   2.03 s every tooth on his left side drops out as one piece, 2.30 s CLUNK on the table, shocked close-up, HALF GONE.
6. NUMBER: ITS BITE x1 -> x30 (its own weight); for you, harder than a crocodile.

Candidates screened the same day (2026-11-27):
- piranha teeth (picked) - killer-bite wish + a body backfire with a picture (half the teeth fall out at once);
- crab claws (crush a coconut, 1,765 N measured / ~3,300 N for the biggest, Oka et al. 2016) -> to grow you'd pull your claws out
  through your wrists (the claw muscle shrinks first, Mykles), be soft for 1-3 weeks, and a stuck leg can rip off in the molt (NOAA)
  - a strong backfire, but hands / arms right after the gibbon's arms: make it 3 uploads later;
- pufferfish puff - the breath-holding idea was disproved (McGee & Clark 2014: oxygen use goes up, it keeps breathing); only
  "tired for hours" is left, a weak backfire;
- porcupine quills (they quill themselves in falls; 35.1 % of 37 skeletons had healed fractures, Roze et al. 1990) - falls and
  healed breaks right after the gibbon;
- spiny mouse healing (its skin is about 20x weaker and tears off, Seifert et al. 2012) - best wish + backfire, fails ICON;
- earthworm "cut in half = two of you" (myth: only the front half lives) - the starfish premise again, and myth-based;
- bee flight (wings wear out and never heal) - fails FEEL IT NOW;
- cheetah speed - still no body backfire (sprints cost no more than expected, chases ~38 s; Scantlebury et al. 2014);
- axolotl (the viewer request) - repeated amputation stops regrowth with scarring (Bryant et al. 2017), no count; same animal as the
  old eel/axolotl Short.
Live comments: yt-dlp hit YouTube's sign-in check on the 8 newest Shorts again (not bypassed); vidIQ has 3 credits (calls cost 5+),
so the comment bubble is made up (@chomp_doodle, 2.9K).

## Facts (verified 2026-11-27)
- Tooth replacement: in piranhas all the teeth on one side of the head are lost as a unit and replaced together; the teeth on each
  side interlock (lateral cusps fit into the neighbours) into one saw-like blade; the replacement teeth grow in underneath, the old
  teeth sit on them like "hats"; months later the other side is replaced (Kolmann, Cohen, Bemis, Summers, Irish & Hernandez 2019,
  Evolution & Development; UW / GWU releases, Science News). The "five days" for a new set appears only in press, so it is not used.
- Bite: wild black piranhas (Serrasalmus rhombeus) bit up to more than 320 N for a 1.1 kg fish - the strongest bite force recorded
  for any bony fish (Grubich et al. 2012, Scientific Reports 2: 1009); 320 N / (1.1 kg x 9.81) = about 30 times its weight (the UW
  release and the lead author say the same).
- "For you, harder than a crocodile": 30 x an average adult (62 kg) = about 18,200 N, above the strongest crocodile bite measured,
  16,414 N (saltwater crocodile, Erickson et al. 2012, PLoS ONE). Cartoon scaling, as in the beetle and flea Shorts.

## Script (60 words)
"Get a piranha's teeth, and half of them would fall out at once. They lock together, like one saw blade. It bites with thirty times
its own weight. For you, that's harder than a crocodile. But its teeth don't come out one by one. A whole side drops out together.
Then the other side. So now he only smiles on one side."

## Build
Shark formula, animal-powers series, no captions. Scene `src/Piranha.tsx`, all drawn in code:
- the guy = the code-drawn front view (gibbon / tardigrade rig, normal arms) seated behind a dinner table; his head carries a piranha
  mouth (`Mouth`: lips as parabolas between the corners, gums, 6 upper and 5 lower triangle teeth that interlock when shut; `open`,
  `grin`, and `L` / `R` = how much of each side is there, so a side can drop out (bare gums) or grow back in); `HalfSet` = one side
  of his teeth as one piece (two gum strips, meshed teeth) that falls with gravity and bounces; `GuyTeeth` redraws his upper teeth
  over something he bites (the log), `bite` does the same for the coconut;
- the piranha (`Piranha`): side view facing left, slate body with a darker back and a pale belly, red eye, orange-red underbite jaw
  that rotates about the hinge, teeth standing on the jaw edges (`edgeTooth`), moods smug / grin / laugh / shock / chomp / calm,
  `near` = its near-side teeth (0 = gums), `PBlock` = its dropped side; a fishbowl (`BowlBack` gravel and a plant, `BowlGlass`
  see-through water, surface line, bubbles, rim and highlight in a `paper={false}` layer); a drumstick that it strips and snaps;
- a crocodile (`Croc`: side view, long snout, scutes, teeth on both jaws, a jaw that drops open on a dark mouth, moods calm / strain /
  shock) and a log (`LogP`) bitten from both ends that snaps at his end, his chunk shrinking as he chews;
- sets: a gingham tablecloth, a window with curtains, a clock and a shelf plant (z 1700), coconut halves with fibres, a soup bowl
  with steam and a splash crown, drops that stop at the table top.
- inserts: X-RAY: PIRANHA (both rows slide together and click - each tooth has a cusp bump on one edge and a notch on the other -
  LOCKED; the rows glow as one zigzag - ONE BLADE; the next set waits in the bone - NEW SET), counter ITS BITE x1 -> x30 ITS OWN WEIGHT.
Shots: 0 s close-up, he crunches the coconut in half (CHOMP), holds up the halves, SHING 0.84, sets them down; 1.95 tighter close-up,
2.03 his left side drops out, 2.30 CLUNK on the table, HALF GONE 2.46; 3.05 X-RAY (LOCKED 3.30, NEW SET 3.95, ONE BLADE 4.86); 5.30
the piranha bites a drumstick to the bone, CRACK 5.64, ITS BITE x1 -> x30 6.12-7.24; 7.70 the log bite-off: the croc dents its end,
8.40 he SNAPs his end off and chews, 9.02 the croc's jaw drops (HARDER); 9.80 the piranha: ONE BY ONE? 10.98, NOPE 11.48 (head
shake; CTA 9.95-12.55); 11.75 WHOLE SIDE, 12.85 its near side drops out (CLUNK on the gravel), 13.30 NEW SET slides up; 13.80 soup:
14.12 his other side drops, 14.32 SPLASH (laugh); 14.90 half a smile with a hand over the gap (HALF A SMILE), 16.95 the new set grows
in, full grin; CommentAsk "What would you bite first?" from 14.93; 17.45 loop push.
Voice: James, eleven_v4, one take (22.7 s, 317 credits) -> `scripts/vsplice.py` (line 1 at 1.22, the rest at 1.12, gaps 0.05-0.14 s)
-> `public/piranha/vo/tight.mp3` (17.1 s), first word 0.12 s, "fall" 2.01 s. Word times: Scribe (0 credits) remapped by vsplice, then
refined to the loudness chunks with `scripts/refine_words.py 13,3,7,5,2,5,9,6,4,2,6`.
Sounds: all from the kit library (chomp, whoosh, squelch, splash, shing, pop, whistle, bonk, thud, crowd_gasp, zap, clack, whir, ding,
crack, tick, crocodile, creak, slide_down, crowd_ooh, scribble, wrong, bubbles, splat, crowd_laugh) - no new sounds, 0 credits;
every effect after frame 0 sits 3 dB lower (`mixed`).
Render: `node scripts/render.mjs Piranha renders/piranha-1080x1920.mp4 1`. `node scripts/check-loop.mjs Piranha` = seamless loop
(first vs last 0; frame 0 vs 0.5 s: 22.1, moving). Thumbnails ("HALF GONE": the 2.27 s backfire - his shocked face, the dropped
side below his chin, the smug piranha): `BUNDLE=work/bundle2 COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then ThumbWide).
