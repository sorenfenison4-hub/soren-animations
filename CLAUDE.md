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
- Script 10-20 s (35-50 words), plain spoken English ("so", "basically", "right?"), no hype words, no "!", no narrator
  phrases. The first line names what frame 0 shows. Every fact verified against reliable sources.
- Every video loops seamlessly: wrap the picture in `LoopOut` from `kit.tsx` (the final shot slides out and the
  opening shot slides back in, so the last frame is exactly frame 0) and add a whoosh cue on the push. Make the
  composition about 0.8 s longer than the voice so the push starts after the last word. Where it reads naturally,
  write the last line so it leads back into the first. Before rendering, run `node scripts/check-loop.mjs <CompId>`
  in the video folder; it must report "seamless loop".
- Voice: ElevenLabs connector, "James - Natural. Conversational, Warm" (c1rY2UegY9FCAFayo2PO), eleven_v4, one take.
- Output: 1080x1920 60 fps MP4 only (no 4K - there is no GPU). Offer a 1920x1080 version when asked.
- Do not include sources or links in replies or video descriptions; still verify facts behind the scenes.
- Finish every video with a YouTube title + description, given in the final reply and saved to
  `videos/<short-name>/renders/description.txt`. Title = the plain question (under 60 characters). Description = 2-3
  short plain paragraphs that answer it with the same verified facts as the voice-over (one extra fact is fine), a
  safety line when the topic is dangerous, then the line "Like and subscribe for more weird questions, and leave yours
  in the comments.", then "Weird questions. Quick answers." and 3-4 hashtags starting with #shorts. Same voice rules as the script: no hype words, no "!", no sources or links.
- Finish every video with thumbnails too: a 1080x1920 Shorts cover and a 1280x720 version, made in `src/Thumbs.tsx`
  from the video's own pieces (example: `videos/birds/src/Thumbs.tsx`), rendered with
  `COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0` (then `ThumbWide`) and saved to `renders/` as
  `thumbnail-1080x1920.png` and `thumbnail-1280x720.png`. Style: yellow + black-outlined Inter 900 text, 1-3 words
  that add to the title instead of repeating it; the main subject big in the middle; the guy in it; nothing crossing a
  face. On the cover keep text and faces in the top three quarters (the Shorts shelf covers the bottom).
- Don't stop to ask questions; choose sensible defaults and report choices and credits at the end.

## Saving Claude usage
- One video per session. Keep replies short. One contact sheet + one pop scan per video unless something looks off.

## Accounts
- Higgsfield starter plan: max 4 image jobs at once; monthly credits do not roll over. Cloud login: run
  `higgsfield auth login` in the background (default port 8765), give the user the sign-in URL from
  `/root/higgsfield-auth-*/sign-in.html`, they paste back the localhost callback URL, curl it, then
  `higgsfield workspace set 129a981e-8802-4e4d-88c8-4072f355ebb1`.
- ElevenLabs: use the connector (the saved API key is rejected).

## Progress
- `PLAN.md` lists the next videos: take the next unchecked one, then tick it and commit.
- Finished files go in `videos/<short-name>/renders/` and are committed.
- When the video is finished, merge your branch into `main` and push `main` (new sessions start from `main`, so this
  is how the next session sees the ticked PLAN.md and any new kit pieces). Pull `main` first if another session
  pushed meanwhile.
