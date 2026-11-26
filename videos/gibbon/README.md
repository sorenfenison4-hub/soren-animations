# What if you could swing like a gibbon?

The user, 2026-11-26: "next idea". Shark formula (the backfire hits his body by ~3 s), animal-powers series, no captions.
Cadence: the last three uploads are cat's eyes (eyes, up 11-26), tardigrade (whole body / water) and blue whale (broken legs);
broken bones are 3 uploads back once this goes up (PLAN.md 2026-11-26: "the gibbon swing once broken bones are 3 uploads back").
No gibbon, ape or monkey in any earlier Short.

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: swing through the trees like Tarzan - the closest thing to flying without wings, the wish every kid acts out on the
   monkey bars. The comment bubble asks it as "what if you could swing like a gibbon??".
2. BACKFIRE: swinging means missing - even gibbons, the best swingers on Earth, break their bones: about one in three wild gibbons
   had broken bones that healed. It hits the very thing you wanted it for (swinging) and your own arms, and you're about ten times
   heavier than a gibbon. Shown as a fall: the next branch SNAPs, he drops, THUD, an X-ray flash of his cracked arm in close-up.
3. ICON: the swinging ape - the famous trick of every zoo visit (arm over arm through the trees). "Gibbon" is a name kids know less
   than owl or shark; the picture (long arms, white face ring, swinging) carries it, and the title names it.
4. FEEL IT NOW: your arms and wrists, holding the phone (and every monkey bar you ever crossed).
5. SHOW IT: frame 0 = him mid-swing at full speed, big in the tall frame, long furry gibbon arms, beside the smug gibbon; 2.1 s the
   next branch snaps; 2.6 s THUD on the jungle floor, close-up, an X-ray flash shows the crack (CRACK).
6. NUMBER: 1 IN 3 (three gibbons on a branch, an X-ray check: OK, OK, OLD BREAK); HEAVIER x1 -> x10 on a branch that bends and snaps.

Candidates screened the same day (2026-11-26, second session):
- gibbon swing (picked) - the plan's next pick; a movement wish (flea 8.8K, bat wings 9.2K, butterfly 10K) with a fall you feel;
- porcupine quills (nothing can touch you -> you stab yourself when you fall out of a tree; quills carry antibiotic fatty acids,
  Roze et al. 1990) - icon and backfire pass, the WISH is armour again (turtle 4.1K);
- axolotl regrowth (the viewer request) - repeated amputation stops regrowth (Bryant et al. 2017): a limit, not a hurt;
- spiny mouse healing (heal without a scar -> its skin tears like wet paper, Seifert et al. 2012, Nature) - a strong backfire, fails ICON;
- electric eel lightning (about 80 % of the eel is electric organ) - the catch is weird anatomy, not a hurt, and the eel was done;
- wood frog freeze-and-thaw (cryosleep -> a flood of sugar in the blood) - weak wish and icon;
- naked mole rat "no pain" - it only shrugs off acid and chili burn (Park et al. 2008), so "no pain" would be wrong; weak icon;
- cheetah (still no verified body backfire); eagle eyes (eyes again right after the cat).
Live comments: yt-dlp hit YouTube's sign-in check on the 8 newest Shorts again (not bypassed); vidIQ has 3 credits (calls cost 5+),
so the comment bubble is made up (@vine_doodle, 3.6K).

## Facts (verified 2026-11-26)
- Healed fractures: Adolph Schultz's study of wild-shot lar gibbons from Thailand (Schultz 1944, "Age changes and variability in
  gibbons", Am. J. Phys. Anthropol. 2: 1-129; his 1939 "Notes on diseases and healed fractures of wild apes") found old, mostly healed
  fractures in 28 % of adult females and 37 % of adult males (also summarised as 33-36 % of gibbons) - "about one in three wild
  gibbons had broken bones that healed". Later reviews read the high rate as evidence that the apes fall often (and that smaller
  apes survive falls better). The often-quoted brachiation speed (55-56 km/h) and the 15 m leaps only appear in general references,
  not in a measuring study, so they are not used.
- The wrist: gibbons have a wrist that works like a ball-and-socket joint (a ball-and-socket-like midcarpal joint with a meniscus,
  the ulna kept off the wrist bones; Journal of Anatomy reviews, KU Leuven studies) - large mobility in all directions as an
  adaptation to arm-swinging: "Its wrist works like a ball joint, so its body turns under the branch." No angle is claimed.
- Weight: lar gibbons weigh 4.4-7.6 kg (Wisconsin Primate Info Net; Animal Diversity Web, Gron 2010; Britannica: about 5.5 kg);
  an average adult person weighs about 62 kg -> "about ten times heavier".
- Arms longer than legs (picture only): gibbons have the longest arms for their size of any primate.

## Script (58 words)
"Swing like a gibbon, and you'd keep breaking bones. Its wrist works like a ball joint, so its body turns under the branch.
But even gibbons miss. About one in three wild gibbons had broken bones that healed. And you're about ten times heavier.
He crossed the monkey bars in one swing. So now he swings in bubble wrap."

## Build
Shark formula, animal-powers series, no captions. Scene `src/Gibbon.tsx`, all drawn in code:
- the guy = the code-drawn front view (tardigrade rig) with long furry gibbon arms (`FurArm`: one fur tube with a jagged edge and fur
  marks, two 108-unit segments, white hands, fur cuffs on his shoulders); `brach` swings him along a list of handholds (the body hangs from
  its neck base under the pivot hand on a pendulum, the free hand travels behind his head on a curve to the next handhold, hold sides
  alternate); lying poses = `rot -90`; an X-ray arm with a zigzag crack (`XArm`), a plaster cast, a broken twig in his hand, bubble wrap (`Wrap`);
- the gibbon (`Gibbon`): front view, white face ring, white hands and feet, fur-tube arms and tucked legs, moods smug / proud / wide /
  shock / dizzy / calm; `fx` turns it round; `xray` = a navy silhouette with a white skeleton, a glowing wrist ball, an optional healed-break
  `lump` on the left forearm; the same `brach` / `gibHang` move it;
- sets: the jungle (a far parallax layer, trunks, boughs with bark lines, vines and leaf clumps, a dead twig that snaps, the floor with ferns
  and leaves); the playground around x = -3000 (sky, fence, a see-saw on a red pivot that catapults, a tree, monkey bars with rungs and end
  ladders, a sandbox with a sand heap he lands in head first);
- inserts: X-RAY: GIBBON (the skeleton hangs by one hand from a branch and swings; the wrist ball glows - BALL JOINT -; the body turns
  round - TURNS arrows), counters BROKE A BONE 1 IN 3 and YOU'RE HEAVIER x1 -> x10.
Shots: 0 s mid-swing beside the gibbon (WHEEE); 1.52 the gibbon leaps the gap; 1.96 he grabs the dead twig, 2.0 SNAP, 2.17 the drop;
2.40 close-up on the floor: 2.44 THUD, 2.58 X-ray CRACK, 2.72 cast POOF; 2.86 the gibbon hangs one-handed (EASY); 3.28 X-RAY: GIBBON (BALL
JOINT 4.12, turning from 4.78, TURNS 5.73); 6.86 the gibbon swings showing off, 8.08 MISS, 8.30 cut to the floor, 8.42 THUD next to him,
a matching cast (crowd laugh); 8.64 three gibbons, 1 IN 3 at 9.46, X-ray 10.62-11.98 (the old break circled 10.92, HEALED 11.36); 12.06
the see-saw: 12.40 THUMP, the gibbon catapulted (WHEEE), HEAVIER x1 -> x10 12.91-13.45, it catches a branch 13.62 (CTA from 12.3);
14.2 the monkey bars: wind-up, 14.9 release, one swing along the whole set (ONE SWING 15.99), 16.3 head first into the sandpit (OOPS,
kids laugh); 16.56 bubble wrap: 17.5 SNAP, 17.92 BOING, 18.42 back on the bough; CommentAsk "Would you still swing?" from 16.62;
18.70 loop push.
Voice: James, eleven_v4, one take (22.4 s, 317 credits) -> `scripts/vsplice.py` (line 1 at 1.22, the rest at 1.12, gaps 0.03-0.08 s)
-> `public/gibbon/vo/tight.mp3` (18.4 s), first word 0.14 s, "bones" 2.18 s. Word times: the Scribe words remapped by vsplice for lines
1-3 and 5; refined to the loudness chunks (`scripts/refine_words.py`) for lines 4, 6 and 7, where Scribe ran late.
Sounds: all from the kit library (whoosh, whoosh_slow, monkey, slap, creak, crack, gulp, whistle, thud, zap, dizzy_birds, scanner,
shimmer, whir, crowd_laugh, page_flip, scribble, ding, boing, tick, squeak, splat, kids_laugh, pop) - no new sounds, 0 credits.
