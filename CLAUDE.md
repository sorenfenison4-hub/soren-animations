# Soren Animations - standing instructions

Channel: **Soren Animations** - "Weird questions. Quick answers." Vertical cartoon Shorts with the white round-head guy.

## How every video is made
- Use the `cutout-cartoon-shorts` skill (in `.claude/skills/`) and its section 12 daily workflow.
- Start a new video by copying `kit/` to `videos/<short-name>/` (the kit is a Remotion 4 project: `src/lib/kit.tsx`,
  `src/Template.tsx`, `public/library/char` = 14 poses, `public/library/sfx` = 15 sounds). Run `npm install` there.
- House style = notebook doodle (keep it in every video, it is automatic through the kit): `LoopOut` wraps every
  scene in `Boil` (hand-drawn line wobble 8x a second + blue-ruled notebook paper, red margin, hole punches, felt-tip
  marker streaks); every `Layer` is cut paper (white edge + cast shadow, like stickers in the notebook); `Sky` is blank
  notebook paper; `<Look />` (paper grain + warm vignette) goes over the whole frame after `LoopOut`, as in
  `Template.tsx`. Wrap thumbnails in `<Boil t={0}>` so they match. No accessory on the guy.
- Every video asks viewers to like, subscribe and comment - on screen only, the voice never asks: put
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
- No AskBanner any more (the user asked to remove it). Instead every video ends with `<CommentAsk t={t} at={...}
  until={...} text="..." />` from `kit.tsx` inside the scene function: a question about THIS video that people want to
  answer ("What should he paint next?", "Same for you?"), top band y 270, from the last line until ~0.4 s before the
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
- Lane: "what if" + your body / animals (what breaks out in this niche: impossible picture in the title, about YOU,
  danger, a number, 25-45 s at most). Keep the guy and the notebook style; stay in the lane for 10-15 videos so YouTube
  learns who to test them on.
- When the user shares Studio numbers: many swipes -> fix frame 0 / first line; a drop in the middle of the retention
  graph -> cut that part; compare topics by median views and do more of the winner.
- Never delete and re-upload a stalled Short. A retry is a NEW upload with a new first frame and first line (the old one
  stays up); reuse the scene code, so it costs only a new voice take.
- Reading the two numbers together: high average % viewed (100 %+) with a high swipe rate (30 %+) = the video is good,
  the first second is not -> fix only frame 0, the first line, the hook text and the frame-0 sound. Low % viewed with a
  low swipe rate = the opening works, the middle drags -> cut where the retention graph drops.

## Results log (add a line whenever the user shares Studio numbers)
| Video | Views | Swiped away | Avg % viewed | Read |
|---|---|---|---|---|
| What if you woke up with a giraffe's neck? (videos/neck, 18.7 s) | 1.8K | 40 % | 113 % | Story + length + loop work (replays); opening loses people: frame 0 = guy lying small in a wide shot, payoff line at 4.3 s, quiet first sound. Fix = peak picture upright and big at frame 0, consequence in the first 2 s. |
- Cadence goal: about one video a day (at least 4 a week) for 3-4 weeks; reuse scenes, props and sounds to make that
  affordable.

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
