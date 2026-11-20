# What if you had a bat's wings?

## Premise screen (CLAUDE.md, Growth) - written before the art
The user (2026-11-20): "use the shark teeth video as an example ... make the idea something everyone has wanted".
1. WISH: to fly - the most wished-for power there is (our own "woke up with wings" story Short is the channel's second
   best at 6.7K with no facts at all). A power you DO, not armour that happens to you (the turtle lesson).
2. BACKFIRE: a bat's wing IS a hand - the arm plus four very long fingers with skin stretched between them, only the
   thumb is free. Grow bat wings and you lose your hands: you'd keep 2 of your 10 fingers. It hits the very thing you
   wanted (the wings) and your body (your hands), like the shark's teeth ripping out on the first bite.
3. ICON: a bat - every kid can name one; its tricks (flying at night, hanging upside down by its feet) are famous.
4. FEEL IT NOW: your hand - the one holding the phone. The voice says "Spread your fingers": everyone tries it.
5. SHOW IT: frame 0 = he flies, wings up, grinning, the smug bat hanging from the branch beside him; at 1.98 s his
   wing-hands slap the branch and can't grip, he drops; 2.55 s THUD close-up (face ~ half the frame), NO GRIP.
6. NUMBER: 4 long fingers in the wing (counted 1-4 on the X-ray); FREE FINGERS 10 -> 2 (only the thumbs).

Other candidates screened 2026-11-20 (the "everyone has wanted" list): ant strength (lift 50x your weight -> your spine
gives out) - the 10-50x figure changes by species and there is no clean human failure number; flea jump (super jump ->
the landing) - fails FEEL IT NOW (legs), the flea is hard to read as a co-star; cheetah speed - no solid body backfire
(the overheating story was disproved for cheetahs); lizard arm regrowth - strong wish, but the catch (it grows back as a
boneless tube) is "it doesn't work", and frame 0 would be an arm coming off; spider webs (Spider-Man) - silk comes out of
the rear end, no hurt to your body; tortoise "live 190 years" - no backfire; cat eyes - eyes again and the number is
unsettled. Bat wings passes all six.
Cadence: last three uploads camel (water / brain), glass frog (see-through / blood), turtle (shell / ribs). The bat ears
Short is 8+ uploads back, octopus arms 4 back - no repeat. Upload about 20 h after the camel.

## Facts (verified 2026-11-20)
- Bats (order Chiroptera, Greek for "hand-wing") are the only mammals capable of true powered flight (Britannica, PBS).
- The wing membrane is held up by the arm and four greatly elongated fingers (digits 2-5); the thumb is always free of
  the membrane and ends in a claw, used for climbing or handling food (Animal Diversity Web, Britannica, UC Berkeley UCMP).
- The membrane is two thin layers of skin with blood vessels and nerves between them (Britannica).
- The wing bones are the same bones as your arm and hand (upper arm, forearm, wrist, finger bones), much longer.
- Bats roost hanging upside down by their feet; most launch by dropping from a hang, because taking off from the
  ground is hard for them (Iowa DNR, Live Science) - used only in the picture, not said.
- With bat wings in place of hands, only the two thumbs would stay free: 2 of 10 fingers (follows from the anatomy).

## Build
Shark formula (the user's example), animal-powers series, no captions (like the shark). Scene: `src/BatWings.tsx`, all
code-drawn: the guy (front view, from the camel) whose arms ARE bat wings (white arm and finger bones, a purple skin
membrane, a little thumb claw), a smug bat hanging from a tree branch, a big moon, two X-rays (BAT WING with the four
fingers counted, YOUR HAND spreading, then stretching into a wing), a FREE FINGERS 10 -> 2 counter, gags.
Voice: James, eleven_v4, one take (23.04 s) -> `scripts/tighten.py --tempo 1.12 --json src/data/words.json` ->
`public/batwings/vo/tight.mp3` (18.29 s); first word at 0.12 s.
Shots: 0 s he flies, wings up in a V, the bat hangs smug beside him (comment bubble); 1.5 s up to the branch, 1.98 s his
wing-hands slap it and the fingertips hook behind it (a front copy of the branch), fingers flex, NO GRIP, slip at 2.18 s,
fall; 2.52 s THUD close-up (squash, > <, NO HANDS); 3.38 s the bat opens its wing, 3.56 s X-RAY: BAT WING (IT'S A HAND,
fingers 1-4 ticked, 4 FINGERS, the skin stretches: SKIN, 2 LAYERS THIN); 7.28 s his thumb (THUMB), he scratches his nose and
SLAPs his own face with the whole wing (stars, laugh); 8.68 s X-RAY: YOUR HAND (TRY IT, spread, 1-4, = BAT WING, the fingers
stretch into a wing: BYE, HANDS); 11.44 s two thumbs up, FREE FINGERS 10 -> 2, THUMBS ONLY, CTA 11.55 s; 13.52 s the phone
bounces off his wing (BOING) and CRACKs; 14.44 s pizza SPLAT on his face (sauce stays); 15.36 s the bat offers a high five,
his wing WHAPs it round the branch; 16.38 s he sits and types with his toes (TOE TYPING), CommentAsk "Would you trade your
hands to fly?"; 18.22 s he flaps off; 18.6 s loop push = frame 0.
New sounds (ElevenLabs sfx, 17 credits each, added to the kit library): flap.wav (a low wing whump layered with a skin
snap), slap.wav. Night bed: crickets.mp3 repeated at -37 dB.
Render: `node scripts/render.mjs BatWings renders/batwings-1080x1920.mp4 1`; thumbnails ("NO HANDS"):
`BUNDLE=work/bundle2 COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then ThumbWide).
Lessons: in a front view a "grab" reads only if the fingertips go BEHIND the thing grabbed - draw a front copy of the branch
over him while he holds it; keep the co-star clear of his wing sweep (the slipping wing first crossed the bat's face).
