# What if you could breathe like a shark?

The user, 2026-11-24: "next million view idea". Shark formula (the backfire hits his body by ~3 s), animal-powers series, no captions.
Cadence: the queued uploads are squeeze (11-24, octopus, bones), rabbit (11-25, eyes) and lifespan (11-26, ladder) - this one goes up
11-27 at the earliest. Breathing is new since the gills Short (5 days and 14 uploads back); the shark itself is 12+ uploads back (teeth).

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: breathe underwater - one of the classic superpowers (Aquaman), no tank, no snorkel.
2. BACKFIRE: you could never stop swimming. A great white can't pump water over its gills, so if it stops, no water flows and it
   suffocates. With its gills, so would you. It hits the very thing you wanted (breathing) and your own body.
3. ICON: the great white - every kid knows it; "sharks die if they stop swimming" is a famous shark fact (true for this one).
4. FEEL IT NOW: your breath - viewers hold theirs with him (and the comment ask: "How long can you hold your breath?").
5. SHOW IT: frame 0 = he swims beside a smug great white, breathing underwater, bubbles streaming out of gill slits on his neck; he
   stops to wave at ~1.4 s; close-up at ~2.2 s: his face turns blue, cheeks puff, eyes bulge (GLUG) on "suffocate".
6. NUMBER: 20,000 km in about nine months (a map: South Africa -> Australia -> back, KM 0 -> 20,000).

Candidates screened the same day (the screened list was used up):
- shark breathing (picked: passes all six, facts verified, a new picture - underwater, gills on him, the shark towing him at the end);
- electric eel "shoot lightning" (the biggest wish left, but no study shows eels shock themselves, and "80 % of its body is battery"
  is a body fact, not a hurt - no verified backfire);
- cat "always land on your feet" (cats that fall far land on their feet and hit their chin - broken jaws, chest injuries; verified,
  but the wish is mid and the high-fall part repeats the flea's "light things fall slowly");
- cheetah speed (still no verified body backfire);
- axolotl regrowth (the only real animal suggestion in the comments, on the lizard; its catch - it has to stay a baby forever - is
  no backfire);
- chameleon tongue (grab anything across the room; no verified body hurt);
- tardigrade "survive anything" (only when dried into a husk; weak icon);
- spider webs (Spider-Man; silk from your rear end, no hurt).
Live comments: yt-dlp hit YouTube's sign-in check on all 8 recent Shorts this session (not bypassed) and vidIQ has 3 credits, so the
comment bubble is made up (@gill_doodle, 2.9K).

## Facts (verified 2026-11-24)
- Great white sharks are obligate ram ventilators: they can't pump water over their gills (no buccal pumping), so they swim with
  their mouths open to keep water flowing over the gills and would suffocate if they stopped swimming (Live Science "Must Sharks
  Keep Swimming to Stay Alive?"; Britannica "Do Sharks Really Die if They Stop Swimming?"). Nurse sharks and other bottom
  dwellers can pump water while lying still - most sharks won't die if they stop; the great white and the mako would.
- How these sharks rest is still uncertain (one description: drifting into strong currents) -> the voice makes no claim about
  shark sleep; "You couldn't even stop to sleep" is about him.
- Nicole, a great white tagged in South Africa, swam to Australia (about 11,100 km in 99 days) and was back off South Africa in
  under nine months: a round trip of about 20,000 km, the fastest return migration known for any swimming animal (Bonfil et al.
  2005, Science 310: 100-103; WCS, National Geographic) -> "One swam twenty thousand kilometers in nine months", 20,000 KM.
- Great whites may live 70 years or more (radiocarbon in vertebrae, largest male 73 years; Hamady et al. 2014, PLoS ONE) - used
  only on screen if at all.

## Script (56 words)
"Breathe like a shark, and if you ever stop swimming, you'd suffocate. A great white can't pump water over its gills. It has to keep
swimming with its mouth open, so water rushes through. One swam twenty thousand kilometers in nine months. You couldn't even stop to
sleep. So he lets the shark do the swimming."

## Build
Scene `src/SharkGills.tsx`, all drawn in code:
- the guy on the small IK rig (front view, rotated as a whole: 80-88 degrees = swimming right, 0 = upright, -90 = lying in bed), the
  head drawn upright on the rotated body; crawl stroke (`swimArms`: each hand circles over the head and back past the hip) and a
  flutter kick; three gill slits on each cheek (`Gills`: pulse open while water flows, flutter while he gasps); `GillBubbles` streams
  bubbles out of them (back over his shoulder / up behind his head) while water flows, from frame 0; choke face (blue overlay,
  puffed cheeks, bulging eyes, sweat), a cheek bulge for the fish, a sleep mask;
- the great white (side view, `Shark`): countershaded body, dorsal / pectoral / tail fins, five gill slits, a jaw that drops open about
  a hinge with teeth on both jaws, moods smug / grin / laugh / annoyed / roll (eye roll); `finWorld` = where he holds on;
- the sea: far reef silhouettes, light rays, sand with swaying weeds, rocks and shells, drifting bubbles and speed streaks, all scrolled
  by `scrollAt` (the integral of each shot's swim speed); a bed on the sea floor with a blanket that flies off;
- X-RAY: SHARK GILLS (`SharkXRay`): head in a side cut, jaws, five arches with red filaments; a pump with a red X (NO PUMP) while
  it is still; once it swims the specks stream past, the jaw drops (MOUTH OPEN) and water arrows rush in and out of the slits;
- the map (`MapCard`): Africa, Madagascar, Australia, a little shark drawing the dotted path out and back; `KmCounter` 0 -> 20,000 KM;
  `O2` oxygen meter (bar + number, red and blinking when low).
Shots: 0 s side by side, swimming (comment bubble); 1.3 he stops and waves, the shark keeps going (STOP); 2.15 close-up: blue, puffed,
hands on his throat, GLUG 2.72, OXYGEN 100 -> 12 %, NO AIR on "suffocate", he bolts 3.3 (GO GO GO); 3.7 the shark (GREAT WHITE),
4.3 X-RAY: NO PUMP 4.6, GILLS 5.7, KEEP SWIMMING 7.0, MOUTH OPEN 7.8; 8.18 the fish is sucked into his mouth (GULP 8.64) and FWOOPs out
of his gill 9.07, dizzy, the shark laughs; 10.05 the map, 20,000 KM, 9 MONTHS, NONSTOP; 13.6 the bed: yawn, NAP TIME, zzz, he chokes
awake 14.78 and rockets out (NOPE); 15.35 he floats above the shark, grabs its dorsal fin 16.12, sleep mask, FREE RIDE, zzz, the shark
rolls its eyes = frame 0 (same framing). CTA 10.5 (top band), CommentAsk "How long can you hold your breath?".
Voice: James, eleven_v4, one take (21.2 s, 309 credits) -> `scripts/vsplice.py` (line 1 at 1.22, the rest at 1.12, pauses ~0.26 s) ->
`public/sharkgills/vo/tight.mp3` (17.4 s), first word 0.12 s, "suffocate" 2.98 s. Scribe word times, refined per speech chunk against
the take's loudness, in `src/data/words.json`. New sounds synthesized in code and added to the kit (`scripts/sfx_shark.py`):
underwater.wav (4 s muffled bed, repeat every 3.8 s), bubblestream.wav (1.6 s bubbles out of gills, loud from 0), fwoop.wav (0.5 s
suction pop).
Render: `node scripts/render.mjs Gills renders/sharkgills-1080x1920.mp4 1`; `node scripts/check-loop.mjs Gills` = seamless loop (frame 0
vs 0.5 s: 29.2, moving). Thumbnails ("NEVER STOP": his blue, puffed face with the smug great white beside him):
`COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then ThumbWide).
