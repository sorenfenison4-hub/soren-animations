# Soren Animations - standing instructions

Channel: **Soren Animations** - "Weird questions. Quick answers." Vertical cartoon Shorts with the white round-head guy.
Niche: **animal powers** - what if YOU had an animal's part or ability (the user, 2026-11-16; see Growth).

## How every video is made
- Use the `cutout-cartoon-shorts` skill (in `.claude/skills/`) and its section 12 daily workflow.
- Start a new video by copying `kit/` to `videos/<short-name>/` (the kit is a Remotion 4 project: `src/lib/kit.tsx`,
  `src/Template.tsx`, `public/library/char` = 14 poses, `public/library/sfx` = 15 sounds). Run `npm install` there.
- House style = notebook doodle (keep it in every video, it is automatic through the kit): `LoopOut` wraps every
  scene in `Boil` (hand-drawn line wobble 8x a second + blue-ruled notebook paper, red margin, hole punches, felt-tip
  marker streaks); every `Layer` is cut paper (white edge + cast shadow, like stickers in the notebook); `Sky` is blank
  notebook paper; `<Look />` (paper grain + warm vignette) goes over the whole frame after `LoopOut`, as in
  `Template.tsx`. Wrap thumbnails in `<Boil t={0}>` so they match. No accessory on the guy.
- NO EITHER/OR ENDING (the user, 2026-11-18; replaces the 2026-11-16 "voice comment ask"): never end with a pick-two
  animal question ("Octopus arms or shark teeth? Comment below.") - not in the voice, not on screen. The voice ends on
  the story beat that runs straight into frame 0 (owl: "So he turns the slow way."); it never asks for comments, likes
  or subscribes. Comments are asked on screen only (`CallToAction` + `CommentAsk` below).
- Every video asks viewers to like, subscribe and comment - on screen only (`CallToAction`): put
  `<CallToAction t={t} at={T.cta} />` from `kit.tsx` inside the scene function and `...ctaCues(T.cta)` in the cues
  (three doodle stickers LIKE / SUBSCRIBE / COMMENT that a cursor taps, 2.6 s, quiet pops). Once per video, in a calm
  stretch right after the answer lands (about 55-80 % through), never in the first 3 s, finished before the loop push;
  top band by default (y 250), moved with `y` if something important is there. Not in thumbnails.
- Reuse first: library poses, code-drawn props from `kit.tsx`, shared sounds. A new Higgsfield picture only when code
  would look clearly worse; add new poses / sounds back into `kit/` (trim + measure into `src/lib/library.json`).
- Hook (fewer swipe-aways - every video; from the study of top animated "what if" Shorts, see Growth below):
  (1) frame 0 is the impossible / surprising picture ALREADY happening, big (main subject or face about half the frame),
  something moving by 0.3 s and a real sound on frame 0 (a whoosh / boing / hit, not a soft chirp) - never a still or a
  wide establishing shot. Use the TALL frame: the subject upright and big. Never open on the guy lying down or small in a
  wide landscape (the giraffe-neck opening did exactly that and lost 40 % to swipes). Show the PEAK picture of the video
  at frame 0 (the long neck next to the giraffe, already wobbling), not the calm moment before it;
  (2) the voice's first word by 0.2 s (`python3 scripts/check-hook.py <vo.mp3> 0.1`, `--trim` cuts leading silence) and
  the FIRST LINE IS THE WHOLE PREMISE in one breath ("He painted his cow like a zebra... and the flies stopped biting.",
  "If a hummingbird's heart was put in your chest, could you run forever?") - no setup, no "so", no introducing the guy.
  The consequence lands inside the first ~2 s: "Get a giraffe's neck, and you'd faint the second you stand up." beats
  "What if you woke up with a giraffe's neck? ... and pass out." (payoff at 4.3 s);
  (3) `<HookTitle t={t} text="..." hi="..." />` from `kit.tsx` inside the scene function: 2-6 words, on screen at
  frame 0, gone by ~2 s, a CLAIM that sounds wrong ("STRIPES STOP FLIES", "HALF HIS BRAIN IS AWAKE") rather than a
  question, adding to the voice instead of repeating it - and the picture at frame 0 must already show what it claims;
  (4) about YOU / your body when possible; danger or a consequence by ~5 s; one hard number in the first half
  ("under a quarter", "4 cm a year", "for 5 seconds"); a reason to stay to the end (a twist that loops).
  `check-loop.mjs` also fails a still opening.
- SHOW THE BACKFIRE BY ~3 S (2026-11-19, shark vs the stalled Shorts): frame 0 = him USING the power at its best (shark:
  chomping the apple with shark teeth, CHOMP, a huge smug shark beside him); by ~3 s the catch happens TO HIS BODY in a
  close-up (his face about half the frame) with a hard hit sound (shark: the teeth RIP out into the apple at 2.6 s). Most
  stalled Shorts said the catch over a calm medium shot of a small guy standing next to the animal under a text box -
  every opening looked the same. Vary the first shot from video to video (close-up, low angle, mid-action).
- COMMENT BUBBLE RULE (the user, 2026-11-16): every video opens with the `CommentBubble` (series format) and it is always
  an ANIMAL POWER request ("what if you had a shark's teeth??"). At the start of each session, check the comments
  for animal-power suggestions and use the best one that passes the PREMISE SCREEN (Growth) (pin it; the user can reply
  with the video). If there is none,
  make up the comment yourself with a fake cartoon username (`handle`, e.g. "@curious_doodle", never a real person's
  name) and like count. No either/or animal question at the end (see NO EITHER/OR ENDING).
- No AskBanner any more (the user asked to remove it). Instead every video ends with `<CommentAsk t={t} at={...}
  until={...} text="..." />` from `kit.tsx` inside the scene function: a question about THIS video that people want to
  answer ("Would you want them?", "Same for you?") - never a pick-two animal question; top band y 270, from the last line until ~0.4 s before the
  loop push. Not in thumbnails.
- Script 15-25 s (40-60 words) - stories too: no more 30-70 s videos (completion drops; stalled Shorts usually lose
  people in the middle). Story = premise line, 2-3 quick beats, the answer, a twist line that loops back to frame 0.
  Plain spoken English, no hype words, no "!", no narrator phrases. Every fact verified against reliable sources; when a
  number only appears in press write-ups and not in the study, leave it out.
- Pacing: if the take runs long, `python3 scripts/tighten.py <take.mp3> <tight.mp3> <words.json>` shortens pauses to
  0.26 s and speeds up 1.06x, and prints the remapped word times (zebra: 30.4 s -> 25.9 s).
- Every video loops seamlessly: wrap the picture in `LoopOut` from `kit.tsx` (the final shot slides out and the
  opening shot slides back in, so the last frame is exactly frame 0) and add a whoosh cue on the push. Make the
  composition about 0.8 s longer than the voice so the push starts after the last word. Where it reads naturally,
  write the last line so it leads back into the first. Before rendering, run `node scripts/check-loop.mjs <CompId>`
  in the video folder; it must report "seamless loop".
- Voice: ElevenLabs connector, "James - Natural. Conversational, Warm" (c1rY2UegY9FCAFayo2PO), eleven_v4, one take.
- Output: 1080x1920 60 fps MP4 only (no 4K - there is no GPU). Offer a 1920x1080 version when asked.
- Do not include sources or links in replies or video descriptions; still verify facts behind the scenes.
- Finish every video with a YouTube title + description, given in the final reply and saved to
  `videos/<short-name>/renders/description.txt`. Title = the "what if" / curiosity question
  (under 60 characters, e.g. "What if you painted a cow like a zebra?"). Description: the FIRST LINE is the plain
  question people search for ("Why do zebras have stripes?"), then 2-3 short plain paragraphs that answer it with the same verified facts as the voice-over (one extra fact is fine), a
  safety line when the topic is dangerous, then the line "Like and subscribe for more weird questions, and leave yours
  in the comments.", then "Weird questions. Quick answers." and 3-4 hashtags starting with #shorts. Same voice rules as the script: no hype words, no "!", no sources or links.
- Finish every video with thumbnails too: a 1080x1920 Shorts cover and a 1280x720 version, made in `src/Thumbs.tsx`
  from the video's own pieces (example: `videos/birds/src/Thumbs.tsx`), rendered with
  `COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then `ThumbWide`) and saved to `renders/` as
  `thumbnail-1080x1920.png` and `thumbnail-1280x720.png`. Style: yellow + black-outlined Inter 900 text, 1-3 words
  that add to the title instead of repeating it; the main subject big in the middle; the guy in it; nothing crossing a
  face. On the cover keep text and faces in the top three quarters (the Shorts shelf covers the bottom).
- Don't stop to ask questions; choose sensible defaults and report choices and credits at the end.

## Growth (getting out of "1K views jail")
- It is not a penalty: every Short is first shown to a small test audience and only pushed further if it beats similar
  Shorts. Stalling at a few hundred to ~2K views = the test was lost. Nothing to appeal, nothing to wait out.
- What the test reads: "Viewed vs. swiped away" in Studio (the hook; YouTube publishes no target, creator guides say
  aim for 70 %+, stuck channels sit at 50-60 %), average % viewed (over 100 % = replays from the loop), then shares,
  comments, likes. YouTube says it also weighs viewer satisfaction, and that a few good videos beat many low-value ones.
- PREMISE SCREEN (2026-11-19 diagnosis - the FIRST gate for every idea; write the six answers at the top of the video's
  README before any voice or art, and drop the idea if one is a no). Our hits are the classic superpower wishes - see in
  the dark (owl 23K), a killer bite (shark, the best since), flying (wings 6.7K), breathing underwater (gills 4.1K) - and
  the twist breaks the wish. The stalled ones are anatomy nobody wishes for - frog eyes, woodpecker head, snake jaw,
  dolphin blowhole, bat ears, chameleon eyes, giraffe neck (1.2-3.6K) - so the catch is only a weird fact, not a twist.
  Same kit, same length (18-23 s), same voice tempo: the premise decides.
  (1) WISH: would most people say "I want that" before they hear the catch? (fly, see in the dark, a killer bite, super
  strength / speed / jump, breathe underwater, climb walls, regrow body parts, live forever, survive anything, turn
  invisible). Weird anatomy fails.
  (2) BACKFIRE: the catch hits the very thing you wanted it for and hurts YOUR body (owl eyes -> you can't move them;
  shark teeth -> the first bite rips them out; gills -> you drown). Not "it doesn't work" (gecko: you slide off), not
  "it's even cooler" (mantis: the water boils), not "no downside" (eel / axolotl).
  (3) ICON: an animal a 6-year-old can name, with a famous trick (owl head turn, shark teeth that grow back).
  (4) FEEL IT NOW: a body part the viewer is using while watching (eyes, teeth, neck, breath, hands, skin).
  (5) SHOW IT: frame 0 = him using the power at its best; the backfire hits his body in close-up by ~3 s (SHOW THE
  BACKFIRE rule above).
  (6) NUMBER: one number that is a picture (270 degrees, a new row every 2 weeks).
  Write 5-8 candidates and keep the strongest wish that passes all six; PLAN.md "UP NEXT" holds a screened list.
- YOUTUBE IN 2026 (web check 2026-11-19; only what YouTube said or several reports agree on - the rest of the web is
  guesswork): views count every start and replay since 2025-03-31, so public views include people who swiped -
  compare Shorts by "Viewed vs swiped away", average % viewed and engaged views; Shorts lost the dislike button in June
  2026 - "Not interested" / "Don't recommend channel" are now the negative signals, so frame 0 must deliver what it
  promises; Creator Insider, Sep 2026: no single metric decides, satisfaction surveys count, subscribers and new viewers
  are learned separately, and the system keeps learning after the first hours; Oct 1 2026: Shorts recommendations favour
  original content and cut re-uploads of other people's videos - our hand-made videos are on the right side, keep each
  one visibly different; Jan 2026 CEO letter: "managing AI slop" (low-quality, repetitive videos) is a priority - another
  reason for fewer, better, distinct Shorts; Sep 2026: Shorts series (seasons / episodes, a "Watch series" button) for
  Partner Program channels - when the channel joins, put the animal powers in one series; posting often does not hurt a
  single Short (YouTube's Shorts lead), weak and repetitive ones do; unconfirmed analyst reports say Shorts older than
  ~30 days get little new push - don't wait for old ones, retry with a new upload.
- WATCHED THE TOP SHORTS (2026-11-19; public frames of the biggest what-if / animal-power Shorts; all data, channel
  tables and the dated 2026 YouTube changes in `research/2026-11-19-findings.md`; the hummingbird-heart idea below is
  only evidence - the user rejected it on 2026-11-14, never pitch it):
  (1) the WISH test holds outside our channel: Posit Pixel (375K subs, median 2.7M) - "If A Human Had Greenland Shark
  Anatomy" 5.8M (wish: live 500 years -> backfire: a parasite eats your eyes) vs "If A Human Had Giraffe Anatomy" 190K,
  their worst Short (no wish) - our giraffe stalled too; Zack D. Films "What If Humans Had Hummingbird Hearts" 30M
  (endless stamina -> your brain shuts down) and "...Strength Of Ants" 17.6M; a 7K-sub channel's "Imagine Having THESE
  Animal Superpowers" 5.3M (177x its median); "wrong superpower" / "powers that contradict themselves" Shorts 23-170M.
  (2) every big NARRATED one burns in word-by-word CAPTIONS (1-3 words, big, centre-low: Zack, Posit Pixel, CoolFacts,
  Malas 3D, FactoMatic); we have none - only sticker words. TEST from the next video: captions for the whole voice-over
  from the Scribe word times, white Inter 900 with a black outline, the spoken word in yellow, about y 1150-1300 of
  1920, never over his face (move them up or down for that shot); keep the sticker words.
  First test: videos/turtle (2026-11-19; `tighten.py ... --json src/data/words.json` + the kit's `Captions`, y 1310, 1490
  in the close-up). Compare its "Viewed vs swiped away" and average % viewed with shark / octopus before making it a rule.
  2026-11-20: turtle, glass frog and camel had captions (public 1.2K / ~850 / new); the user pointed at the shark (no
  captions) as the model, so videos/batwings went back to the shark build without captions - compare the two groups once
  Studio numbers come in.
  (3) frame 0 is a CLOSE-UP: a face or the strange body part fills most of the frame (Posit Pixel: a face with a
  parasite on the eye; Zack: tweezers on a hummingbird; Malas 3D: their round-headed guy's face) - ours open on a
  small full-body guy beside the animal. Open on his face with the power on it, big; go wide after.
  (4) a black / blank frame 0 is a flop (a "what if" Short that opens on black text: 2.2K).
  (5) no-words visual comedy travels: Malas 3D (a simple round-headed 3D guy, 230K subs) gets 12-22M with daily-life
  gags ("As Tall as an Electric Pole" 12M - head through the roof - while our giraffe neck explained blood pressure,
  3.7K). Give the backfire 1-2 silent daily-life gags, not only X-rays and counters.
- AUDIENCE SETTING: ask the user once to check Studio > Content > the Audience of every Short. Cartoon animals can be set
  (or re-set by YouTube) to "made for kids", which turns comments off and changes who sees it - it could explain ~0
  comments. It must match who the videos are really for; don't game it.
- NICHE (decided, narrowed by the user 2026-11-16): ANIMAL POWERS only - what happens if YOU got an animal's part or
  ability, picked with the PREMISE SCREEN (an owl's eyes, a shark's teeth, bird wings, fish gills). No more
  plain "your body + extreme place / habit" ideas (Mars, -50 C, no shower for a year) - every video needs an animal
  power on the guy and the animal co-star beside him. Pick PLAN.md items that fit first; rewrite the rest as an animal
  power or skip them. Title shape: "What if you had a <animal>'s <part>?".
  What breaks out in this niche: impossible picture in the title, about YOU, danger, a number, 25-45 s at most. Keep
  the guy and the notebook style; stay in the niche for 10-15 videos so YouTube learns who to test them on.
- When the user shares Studio numbers: many swipes -> fix frame 0 / first line; a drop in the middle of the retention
  graph -> cut that part; compare topics by median views and do more of the winner.
- Never delete and re-upload a stalled Short. A retry is a NEW upload with a new first frame and first line (the old one
  stays up); reuse the scene code, so it costs only a new voice take. DON'T RECREATE OLD VIDEOS (the user, 2026-11-19,
  "no dont recreate them"): make a retry only when the user asks for that video; put the effort into new videos.
- WHY THE ZEBRA SHORT WORKED (the user said it did really well; copy this recipe every time - first used in videos/owl):
  (1) the guy DOES something on screen (paints the cow) instead of just standing there while the voice explains;
  (2) an animal co-star with a face and changing moods (annoyed cow, smug zebra) that reacts to him;
  (3) one comedy hit mid-video (the fly's no-brakes dive + BOING + dizzy stars + a short crowd laugh) to stop the drop;
  (4) a POV / inside insert in a circle panel (FLY VISION) - a picture people have never seen;
  (5) the number shown as a live versus counter (LANDINGS 4 vs 20), not just said;
  (6) a sticker word every ~1.5 s (ITCH, DISEASE, NO BRAKES, BOING, UNDER 1/4...) so the screen keeps changing;
  (7) a camera move or cut every 2-3 s; (8) a funny social ending that loops (every cow queues for a paint job);
  (9) a comment question asking viewers to SUGGEST the next thing ("What should he paint next?").
- WHY THE OWL SHORT WORKED (the user said it did really well; the "animal power" version of the zebra recipe - use it
  for every "What if you had a <animal>'s <part>?" video, first used in videos/snake):
  (1) the power is ON HIM at frame 0 and readable at a glance (huge owl eyes on his round head), so the title is the
  picture; his head is drawn in code over the library body (`GuyHead` in videos/owl/src/Owl.tsx) so the part can move;
  (2) the animal co-star stands next to him and does the same thing with ease and a smug face (owl turns 270 while he
  gets stuck at 90) - "it can, you can't" side by side is the whole story;
  (3) two X-ray circle panels: first the animal's secret (tube eyes, padlocked), then YOUR body breaking (YOUR ARTERY
  tearing, DANGER) - the danger shown, not just said;
  (4) two live counters with ticks: a dial on the animal (0 -> 270 degrees) and a versus panel (NECK BONES 14 vs 7);
  (5) a running little character (the fly) that drives what he does and comes back for the loop;
  (6) the comedy hit comes from the power itself (his head whips after the fly -> dizzy stars + laugh, ~7 s);
  (7) short lines, one fact each, 47 words, ~22 s; a sticker word every ~1.5 s (LOCKED, WHIP, 270, STUCK, DANGER, ROOM
  TO SPARE, THE SLOW WAY); a camera cut every 2-3 s between his face and the animal;
  (8) the ending is his dumb-but-funny workaround (turns his whole body the slow way) that runs straight into frame 0;
  (9) the comment ask invites the next animal ("Which animal's eyes next?"). From 2026-11-18 there is no either/or animal ask at the end (NO EITHER/OR ENDING above).
- Reading the two numbers together: high average % viewed (100 %+) with a high swipe rate (30 %+) = the video is good,
  the first second is not -> fix only frame 0, the first line, the hook text and the frame-0 sound. Low % viewed with a
  low swipe rate = the opening works, the middle drags -> cut where the retention graph drops.

## Results log (add a line whenever the user shares Studio numbers)
| Video | Views | Swiped away | Avg % viewed | Read |
|---|---|---|---|---|
| What if you woke up with a giraffe's neck? (videos/neck, 18.7 s) | 1.8K | 40 % | 113 % | Story + length + loop work (replays); opening loses people: frame 0 = guy lying small in a wide shot, payoff line at 4.3 s, quiet first sound. Fix = peak picture upright and big at frame 0, consequence in the first 2 s. |
| What if you had an owl's eyes? (videos/owl, 22.3 s) | 15K (user, 2026-11-15) | ? | ? | The owl formula (Growth) worked: a body-part swap visible on the guy's face from frame 0, the animal doing the power with ease next to him while he fails at it, two X-rays (the animal's secret part + YOUR part breaking), two live counters (270 dial, NECK BONES 14 vs 7), a mid-video comedy hit made by the power itself (head whip -> dizzy), a dumb-but-funny solution that loops. Ask for swipe % + avg % viewed to confirm. |
| What if you had a shark's teeth? (videos/shark, 18.5 s) | doing well (user, 2026-11-19) | ? | ? | First Short after the either/or voice ending was dropped, and a top wish (a killer bite + teeth that grow back) that backfires on your own body. Frame 0 = him chomping an apple beside a huge smug shark; the teeth RIP out in close-up at 2.6 s. Ask for the numbers. |
| What if you had a turtle's shell? (videos/turtle, 20.1 s, first word-by-word captions) | 1.1K public (the user, 2026-11-19: "not doing the best") | ? | ? | Stalled like octopus (1.2K) while shark climbed to 5.4K. The captions test can't be read from one stalled video (premise and captions are tangled); likely the premise: armour is something that happens TO you, while every hit is a power you DO (see in the dark, bite, fly, breathe underwater, climb), and the catch (no deep breath) can't be seen from outside. Keep captions for 2 more videos before judging; ask for swipe % + avg % viewed. |
- LIVE COUNTS 2026-11-20, second check (72 subscribers, median 1.4K): shark 16K (on course to pass the owl); bat ears
  2.1K; camel 2.0K; dolphin 1.7K; turtle 1.5K; glass frog and octopus 1.2K; bat wings 118 (just up). Same day: what the
  million-view Shorts in the niche do (small channels: many animals, one number, escalating) - research/2026-11-20-findings.md.
- LIVE COUNTS 2026-11-20 (68 subscribers): shark 7.1K (still climbing); glass frog 842 (newest); turtle and octopus 1.2K;
  the rest about the same.
- LIVE COUNTS 2026-11-19 evening (67 subscribers): shark 2.8K -> 5.4K in a day (still climbing - the wish formula
  works); turtle 1.1K and octopus 1.2K stalled; dolphin 1.5K, bat 1.4K; the rest unchanged.
- LIVE COUNTS 2026-11-19 (public, research/channel_shorts.py; 63 subscribers): owl 23K; wings 6.7K; zebra 5.9K;
  gecko 4.7K; gills 4.6K; giraffe 3.7K; whale 3.2K; shark 2.8K (1 day old); eel/axolotl 2.1K; whisper 1.6K; dolphin 1.4K
  (the user retitled it "Could You Survive as a Dolphin?"); woodpecker, snake, hotel 1.4K; bat, chameleon, bridge,
  tower 1.3K; frog, mantis 1.2K; riddles 1.0K; octopus 373 (newest; made an hour after shark); the first six
  "Why..." Shorts 42-85. Since 11-17 gecko (3.7K -> 4.7K) and gills (4.1K -> 4.6K) still creep up; the rest have
  mostly stopped.
- VIEW-JAIL STUDY (2026-11-17, vidIQ public counts): owl 23.0K (282 likes); wings 6.7K; zebra 5.9K; gills 4.1K;
  gecko 3.7K; giraffe 3.6K; whale 3.3K; eel/axolotl 2.1K; snake 1.4K; woodpecker 1.3K; mantis 1.3K; frog 1.2K
  (1 day old, still 243 views/h); chameleon 1.2K. Like rate is the same everywhere (owl 1.2 %, others 0.5-1.6 %), so
  people who see them like them equally: the owl won the FEED TEST (swipes / watch time), not on quality. Comments ~0
  on every video, also after the voice comment ask (chameleon 0, frog 0, woodpecker 2). Since the owl, 9 Shorts went up
  in 3 days (4 on 11-16, two 1 h apart), 3 of them "eyes" again. Changes made on 11-16 that the owl did NOT have:
  (a) frame-0 text became a lowercase comment bubble that repeats the title instead of a claim ("HIS EYES ARE STUCK");
  (b) the voice ends on "X or Y? Comment below." instead of a story beat that runs straight into frame 0 (owl: "So he
  turns the slow way.") - an obvious "the end" right before the loop invites a swipe instead of a replay, for no
  comments in return. Suggested tests (ask the user): go back to a claim HookTitle, end the voice on the story beat and
  keep the comment ask on screen only, 1 Short a day, no repeat body part within 3 videos, famous animal tricks only.
- LADDER FORMAT TEST (2026-11-20, videos/jump, "What if you could jump like a flea?"): the million-view format from
  research/2026-11-20-findings.md in our style - one question, three animals (kangaroo 2.4 m -> cat 6 m -> flea 100 m), one
  live counter with the rungs ranked under it, the top rung hits his body (the 30-floor landing) at ~60-80 % instead of by
  ~3 s. Judge it against the shark (single power, backfire by 3 s) on swipe % and average % viewed before doing more.
- DIAGNOSIS (2026-11-19; the user: owl and shark did well, the rest 1-3K, some ~5K): (1) premise drift - after the owl
  we picked weird anatomy instead of wished-for powers (PREMISE SCREEN); (2) most stalled ones said the catch over a
  calm medium shot instead of showing it on his body by ~3 s (SHOW THE BACKFIRE); (3) sameness - 17 Shorts in 6 days,
  three "eyes" videos in three days, near-identical openings (CADENCE); (4) all six Shorts whose voice ended on "X or Y?
  Comment below." stalled (tangled up with weak premises; both fixed now). Not the cause: length (winners and losers
  are 18-23 s), voice tempo (bat and dolphin used shark's 1.12), CallToAction and the comment bubble (owl / shark have
  them). n is small (two hits) - confirm with Studio numbers: Viewed vs swiped away + average % viewed for shark, owl,
  octopus and two stalled ones.
- OWL (15K) vs SNAKE + GECKO (~1K each), same formula and same production: the difference is the PREMISE, not the
  animation. The four checks first written here (part you use now, a surprising cost, a famous animal trick, danger + a
  number) let weak ideas through (blowhole, frog eyes, woodpecker head all passed them) - they are now part of the
  PREMISE SCREEN, which adds the WISH test first. Frame 0: the guy's face must stay visible (no prop over it), and a
  wall / height must read at a glance.
- Still true from the giraffe: frame 0 = ONE big impossible picture (subject about half the frame), the hook text visible
  in that picture, and the first line carries the DANGER, not a mild consequence. Avoid topics people already know.
- RESEARCH (2026-11-16, retention + reach; YouTube publishes no thresholds, blog numbers disagree - treat as directional):
  (1) keep one question OPEN until the last third (the first line raises it, the answer lands late; never give the
  answer away in line 1 like the gecko did); open the next small question before closing the last one;
  (2) the screen never holds the same picture more than ~3 s (we already cut every 2-3 s);
  (3) YouTube's Shorts lead: no magic posting count, better videos beat more videos; deleting / re-uploading is not
  a good strategy; a few hundred to a few thousand views then a stall is the normal test, and some Shorts pick up later;
  (4) turn the comment ask into a series: series videos open with a doodle COMMENT BUBBLE in the top band at frame 0
  instead of HookTitle (`<CommentBubble t={t} text="what if you had a chameleon's eyes??" />` from `kit.tsx`; optional
  handle / likes / y; same timing as HookTitle), holding the premise as if a viewer asked it ("what if you had a chameleon's eyes??") - it does
  not have to be a real comment (the user's call), it shows viewers their comment could be next; use a made-up cartoon
  handle or none, never a real person's name; never post comments from other accounts (YouTube counts that as fake
  engagement); when a real suggestion fits, use it, pin it, and the user can post the video as a reply to it; set every new Short's "Related video" link to the owl (or the newest hit);
  no either/or animal asks at the end any more (the user, 2026-11-18); at the start of each session read the channel's comments once (vidIQ
  vidiq_video_comments with the channel id UCv6BUckmVIc4zZ022f7f_jQ, 5 credits; see the vidIQ line below for the
  balance) - if credits are short, ask the user to paste the top comments;
  (5) screen the premise BEFORE animating: write 5-8 title + first-line pairs, keep the one that passes the PREMISE
  SCREEN (above), only then build the scene - premise decided the owl vs snake / gecko gap, not production.
  (6) comments are ~0 on every video: in the final reply give the user a one-line channel comment to pin under the
  Short (the CommentAsk question, or "Which animal power should he try next?") and remind them to answer the first
  comments - a pinned question from the channel itself is allowed (comments from other accounts are not).
- vidIQ connector: 3 credits left on 2026-11-19 (every call costs 5 or more), refill to 150 on 2026-12-06 - until then
  ask the user for Studio numbers and pasted comments. Since 2026-11-19 the environment allows youtube.com and
  i.ytimg.com: `research/` (README there) gets live public view counts for our Shorts and other channels' Shorts, plus
  frames, for free; most article sites are still blocked (web search summaries work).
- CADENCE (2026-11-19): at most ONE Short a day, about 20 h or more apart. 17 Shorts were made in 6 days (11-13 to
  11-18), often two within an hour, three "eyes" videos in three days, so the same test viewers kept getting
  same-looking openings and the premise screen got skipped to keep up. No same body part or same animal within 3
  uploads. If no idea passes the PREMISE SCREEN, skip the day - a weak Short costs more than a missed day. Reuse scenes,
  props and sounds to keep one a day affordable.

## Saving Claude usage
- One video per session. Keep replies short. One contact sheet + one pop scan per video unless something looks off.

## Accounts
- Higgsfield starter plan: max 4 image jobs at once; monthly credits do not roll over. Cloud login: run
  `higgsfield auth login` in the background (default port 8765), give the user the sign-in URL from
  `/root/higgsfield-auth-*/sign-in.html`, they paste back the localhost callback URL, curl it, then
  `higgsfield workspace set 129a981e-8802-4e4d-88c8-4072f355ebb1`.
- ElevenLabs: use the connector (the saved API key is rejected).

## Progress
- `PLAN.md` lists the next videos (rewritten as "what if" ideas): take the next unchecked one, verify its facts, then
  tick it and commit.
- Finished files go in `videos/<short-name>/renders/` and are committed.
- When the video is finished, merge your branch into `main` and push `main` (new sessions start from `main`, so this
  is how the next session sees the ticked PLAN.md and any new kit pieces). Pull `main` first if another session
  pushed meanwhile.
