---
name: cutout-cartoon-shorts
description: Turn a short script (and optionally a reference picture) into a vertical 2D cartoon Short in the cut-out style of "Can we throw trash in a volcano?" - Higgsfield GPT Image 2.5 transparent cut-outs (every pose / expression, props, set pieces), an ElevenLabs voice in a normal natural voice, and Remotion code that animates it all (2.5D multiplane camera, squash-swap poses, real projectile physics, lava / smoke / steam effects, cartoon faces on objects), sound effects, 4K vertical render. Use when someone asks for a cartoon / cut-out / Oddsoneout-style animation from a script or picture made with Higgsfield + code.
---

# Cut-out cartoon Shorts (Higgsfield pictures + code animation)

What this makes: a vertical Short (1080x1920 comp, 60 fps, delivered 2160x3840) where a simple flat cartoon character
(thick black outlines, flat colours) acts out a script with a voice-over. Every character pose and expression is its own
AI picture with a transparent background; the motion, camera, physics, effects and timing are code. Example built with
this exact method: a white round-head guy throws a trash bag into a volcano, the volcano opens its eyes, erupts and spits
the bag back into his hand on "no thanks" (12.9 s, 7 poses + bag + volcano + rocks, ~50 Higgsfield credits, 170
ElevenLabs credits, 2 min GPU render).

Read the whole file once before starting. Follow the order; each step says what "done" looks like.

---------------------------------------------------------------------------------------------------------------------
## 0. Setup (once)

- Claude Code + a Remotion 4 project (`npx create-video@latest`, React/TypeScript). Compositions are registered in
  `src/Root.tsx`; assets go in `public/`.
- Higgsfield CLI: `curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh`, then
  `higgsfield auth login` (the user logs in themselves) and `higgsfield account status` to see credits.
- ElevenLabs: the ElevenLabs connector in Claude (tools `creative_list_voices`, `creative_generate_speech`,
  `creative_get_flow_run_status`) or the user's own API. Never ask for or paste API keys in chat.
- Python 3 with `pillow numpy opencv-python` (cut-outs, measuring), `faster-whisper` (word times). ffmpeg: Remotion ships
  one in `node_modules/@remotion/compositor-*/ffmpeg(.exe)`.
- Cloud sessions: the Higgsfield and ElevenLabs API hosts must be allowed in the environment's network settings, or every
  call fails. Check that first.
- Higgsfield login in a cloud session (the browser is on the user's device, the CLI is in the container):
  run `higgsfield auth login` (NO `--port`: only the default callback port 8765 is registered; another port gives
  "redirect_uri does not match") as a background task, read the sign-in URL out of `/root/higgsfield-auth-*/sign-in.html`
  and give it to the user. After they approve, their browser fails to load `http://localhost:8765/callback?code=...`;
  they paste that address back and you `curl` it inside the container to finish. The code works only with the login
  process that created it: if the container restarted in between (the process is gone), start a new login.
  Then `higgsfield workspace list` + `higgsfield workspace set <id>`.
- No Higgsfield CLI install from api.github.com (403 in some sessions)? Get the tag with
  `git ls-remote --tags https://github.com/higgsfield-ai/cli` and pass `--tag vX.Y.Z` to install.sh.
- No ElevenLabs connector and no key? The ElevenLabs connector's `creative_generate_in_flow` with node_type `sfx`
  (`eleven_text_to_sound_v2`, 50 credits each) also makes sound effects.
- Keep the folders apart: `images/<short>/` (prompts.md, ref/, raw/, scripts, qa/) for source pictures,
  `public/<short>/` only for the final trimmed sprites, sfx and voice (Remotion copies `public/` into every bundle).

---------------------------------------------------------------------------------------------------------------------
## 1. Script -> beat sheet (before generating anything)

1. Split the script into lines. 10-15 s Shorts = 4-6 lines, ~25-35 words (20-30 s = ~50-70 words, 8-10 beats). Write
   them like a person talking (plain words, "so", "basically", "right?"), no narrator phrases ("here's the thing",
   "but here's the part"), no hype words (incredible, shocking, amazing, insane) and no "!" lines: they make AI voices
   over-act.
2. One visual beat per line, on the exact word: "throw" = the throw, "steam" = steam, "no THANKS" = the catch.
3. Frame 0 IS the premise: the impossible / surprising picture already happening (a half-striped cow with the brush
   mid-stroke), big in frame, moving by 0.3 s, with a sound on frame 0. No intro, no wide establishing shot.
   Use the tall frame: the subject upright and big, the PEAK picture of the video (not the calm moment before it); never
   open lying down or small in a wide landscape (videos/neck: 40 % swiped away despite 113 % viewed).
   Hook (the first 2 s decide the swipe; full rules in section 14): the first line is the whole premise in one breath,
   about YOU when possible; a HookTitle (section 12) puts a CLAIM that sounds wrong on screen for sound-off viewers;
   danger or a consequence by ~5 s; one hard number; a twist ending that loops.
4. Plan the shots: as few hard cuts as possible (one continuous camera move is best); a cut only for a new shot
   (e.g. the reaction close-up). End on an image that loops back to frame 0.
5. Plan the fun: one gag per beat that a kid would laugh at (an object that comes alive and opens its eyes, an
   anticipation "inhale" before a blast, squeezed "> <" eyes, a sweat drop, a smug smoke ring, the thing coming back).
6. List the pictures you need (section 3) from the beats: every pose, every expression, every prop that moves on its
   own, every set piece. Done = beat sheet table: time / words / what is on screen / which picture / which sound.

---------------------------------------------------------------------------------------------------------------------
## 2. Voice (ElevenLabs) and word times

- Voice: a normal, natural male (or female) voice - not deep, not a narrator. Find it with `creative_list_voices`
  (gender, languages ["en"], search "natural conversational", use_cases ["social_media"]). Good library picks:
  "Tim Riley - Natural. Conversational" (1gZSmkYVRMS8w1i4plmP, everyday American man), "James - Natural",
  "Jerry B.", "Alex". Model `eleven_v4`, plain text (no tags), `generations_count: 1`.
- Poll `creative_get_flow_run_status` once it's done, take `content_url`, download with curl to
  `public/<short>/vo/take1.mp3`.
- Word times: faster-whisper with `word_timestamps=True` (or ElevenLabs Scribe). Whisper word edges are +-0.2 s:
  find the real pauses by loudness (RMS every 20 ms, silence = below -42 dB for >= 0.18 s) and trust those.
- Place the voice at 0.1 s; the first word must be heard by 0.2 s: `python3 scripts/check-hook.py <vo.mp3> 0.1`
  (`--trim` cuts the take's leading silence down to 0.02 s).
- Define every beat as a constant: `T = {turn: 2.05, release: 3.7, land: 4.8, ...}`.
  The composition length = voice end + ~0.5 s. Big sounds (an explosion) go into a pause, not on top of words.
- Done = voice file + words.json + the T table.

---------------------------------------------------------------------------------------------------------------------
## 3. Pictures (Higgsfield GPT Image 2.5, transparent cut-outs)

Model `gpt_image_2_5`, `--resolution 4k --quality high --background transparent` (~4.25 credits each). Aspect: full
body 2:3, waist-up close-up 4:5, props 1:1, wide set pieces 3:2. Pass 1-2 reference crops with `--image` (crop each
panel of a reference picture; the whole collage makes it copy the layout). No reference? First make ONE hero picture of
the main character in the wanted style, approve it, then use it as the reference for every other pose.

Prompt = what is different in THIS picture + a fixed STYLE block (same words every time). Both STYLE blocks
(STYLE_CHAR for characters, STYLE_OBJ for props / set pieces) live in `scripts/gen.sh` next to this file, so they are
always appended word for word.

Pose prompt pattern: framing ("Full body, three-quarter view facing to the right" / "Waist-up close-up, facing the
viewer, centred") + expression ("scared: eyebrows tilted up in the middle, wide eyes, mouth wide open") + exact hands
("the hand on the RIGHT side of the image holds a black tied garbage bag by its knot") + "Whole body in frame with a
margin". Say left/right as "on the left side of the image" - never "his left".

Generate with the script (kept in its own file because Claude Code replaces dollar placeholders in skill text):

```bash
cd images/<short>
S=~/.claude/skills/cutout-cartoon-shorts/scripts/gen.sh   # or .claude/skills/... inside the project
"$S" pose_curious 2:3 "Full body, three-quarter view facing to the right, ..." ref/hero.png &
KIND=obj "$S" bag 1:1 "A black tied garbage bag, ..." ref/hero.png &
wait
```

Run all pictures in parallel (`&` + `wait`); ~1 minute for 8. The starter plan allows only 4 jobs at once
(`rate_limit_reached`, `concurrent_jobs_limit: 4`, nothing charged): run batches of 4 there. Picture list that worked for one gag:
- every pose the story needs (curious shrug + object, looking up, wind-up, follow-through with EMPTY hand, scared +
  empty hand, scared + object), each as its own picture;
- the moving prop ALONE (the bag) - it flies as its own sprite;
- set pieces alone (the volcano) and small dressing (a row of 5 rocks in one picture, split later).

Two poses that must line up exactly (the same pose with and without the object): make the second as an EDIT of the
first (pass `raw/first.png` as the reference, prompt "the same picture with the bag removed, the hand now empty and
open, everything else identical") - then align them (section 4).

Check every cut-out on a coloured background sheet (`qa/sheet.png`) before using it. Known glitch: GPT Image sometimes
makes shaded areas half-transparent (sky showing through a slope). Fix = regenerate with `BG=opaque` (gen.sh then asks
for a plain flat solid light-blue background, #9BCFFD) and key it yourself:

```python
# key.py in.png out.png - flat background colour connected to the border -> transparent; un-blend the black edge
bgc = np.median(np.concatenate([im[0], im[-1], im[:,0], im[:,-1]]), 0)
dist = np.sqrt(((im - bgc) ** 2).sum(2)); near = dist < 60
bg = flood-fill of `near` starting from the border pixels (iterative dilation & near)
edge = 3-px band around bg; alpha = 0 on bg, clip(dist / dist(ink, bgc)) on edge (colour = ink), 1 inside
```

Done = all pictures pass the sheet check; prompts saved in `images/<short>/prompts.md`.

---------------------------------------------------------------------------------------------------------------------
## 4. Prep: trim, measure, align (images/<short>/prep.py -> src/<short>/sprites.ts)

- Trim each PNG to its alpha box + 12 px; save to `public/<short>/`; keep the trim offset (needed for edits/aligning).
- HEAD = largest inscribed disc of the hole-filled silhouette (works for big-head cartoon characters: the head is the
  widest round part). Scale every pose so its head radius is the same in the world -> swaps never change head size.

```python
a8 = (alpha > 128).astype(np.uint8); ff = a8.copy()
cv2.floodFill(ff, np.zeros((h + 2, w + 2), np.uint8), (0, 0), 2)
solid = np.where(ff == 2, 0, 1).astype(np.uint8)
dt = cv2.distanceTransform(solid, cv2.DIST_L2, 5)
hy, hx = np.unravel_index(dt.argmax(), dt.shape); head = (hx, hy, dt[hy, hx])
```
- FEET = middle of the opaque pixels in the bottom 3.5 % rows. Full-body poses stand on the same world feet point;
  waist-up poses put their head where the full-body head is.
- Hands / grip points: extreme points of the alpha (`argmax(x - y)` = raised hand top-right) or read them off a
  marked-up sheet. Object sizes: widest row of the object (dark fill) -> scale the flying sprite to match the drawn one.
- Edited pose pairs: ECC affine on the HEAD region (exclude hands that differ):
```python
warp = np.eye(2, 3, dtype=np.float32)
cc, warp = cv2.findTransformECC(B_gray, A_gray, warp, cv2.MOTION_AFFINE, (3, 500, 1e-6), head_mask, 5)
# warp maps B -> A; invert it and draw A inside B's raw canvas with CSS matrix(a, b, c, d, e, f)
```
- Set pieces: measure what the effects need (the crater lake ellipse = top band of orange pixels; the silhouette top
  profile every 25 px so falling things land on the slope).

---------------------------------------------------------------------------------------------------------------------
## 5. The world: 2.5D multiplane camera

Every picture is a flat layer at a depth Z; the camera has (x, y, z); a layer's scale is k = F / (Z - z) (F = 1000).
Dollying (changing z) makes near things grow much faster than far things = real depth. Units: at camera (540, 960, 0) a
layer at Z 1000 shows 1 world px as 1 screen px.

```tsx
const Layer = ({cam, z, blur = 0, minDepth = 300, children}) => {
  const d = z - cam.z;
  if (d < minDepth) return null;                       // layer is (almost) behind the camera
  const k = 1000 / d;
  return (
    <AbsoluteFill style={{filter: blur ? `blur(${blur}px)` : undefined}}>   {/* blur in SCREEN px */}
      <div style={{position: 'absolute', transformOrigin: '0 0',
        transform: `translate(540px, 960px) scale(${k}) translate(${-cam.x}px, ${-cam.y}px)`}}>{children}</div>
    </AbsoluteFill>
  );
};
```
- Depths that worked: foreground rocks 650, character 1000, mid ground 1800, set piece + horizon 3000; sky = screen-space
  gradient. Ground = flat bands (same colour, only the far one has the black horizon line), each in front of the layer
  behind it; the far band covers the set piece's base.
- Camera: piecewise moves with easing; interpolate SCALE in log space (`exp(lerp(log k0, log k1, u))`) so zooms feel
  even; slow-fast-slow (easeInOutCubic) for glides, easeOutCubic for a blast pull-back; holds are perfectly still.
- Depth of field: blur far layers 2.5-3.6 px only while the camera is close on the character.
- Flying the camera past the character: hide layers closer than ~300 units, tilt the camera up a bit ahead of the dolly
  so the near layer leaves the frame quickly.
- After a hard cut you may re-frame far layers (shift them) so the important thing (the volcano's face) shows beside the
  character's head - and shift anything that comes from there (the bag's return path) the same way.
- Screen shake = sums of sines (13.3 + 7.1 Hz ...) times an amplitude envelope (rumble ramp, blast 30 px decaying, small
  bumps on impacts). Never random per-frame jumps.

---------------------------------------------------------------------------------------------------------------------
## 6. Animating cut-out poses

- NEVER cross-fade two drawings (half-transparent ghosts read as a glitch). Swap on a frame where motion hides it:
  - turn: squash scaleX to ~0.8 (scaleY 1.03) about the feet and swap on the narrowest frame;
  - action: anticipation squash (scaleY 0.94, scaleX 1.04) -> swap -> stretch (1.03) settling with a damped spring;
  - throw: swap to the follow-through pose at release; lean snaps from -5 deg to +5 deg and settles;
  - catch: swap to the "holding" pose the frame the flying object reaches the hand, plus a small weight dip.
- Life on holds: breathing (scaleY 1 +- 0.9 % about the feet at ~0.6 Hz), a tremble when scared (1-2 px sines), a small
  bounce on a key word.
- Contact shadow under full-body poses (soft ellipse, rgba(72, 54, 42, 0.26), 3 px blur).

---------------------------------------------------------------------------------------------------------------------
## 7. Props with real physics

- The thrown object is its own sprite with its own depth. Swing: a few frames along an arc over the head (behind the
  head), then a 3D projectile from the hand (Z 1000) to the target (Z 3000): x and z move at constant speed, y follows a
  gravity parabola with the apex at a chosen fraction of the flight (late apex = low arc that stays in frame):
```ts
const g = (2 * (y0 - y1)) / (ta * ta - (T - ta) * (T - ta));   // ta = apex time, T = flight time
const ya = y0 - 0.5 * g * ta * ta;
const y = (tau: number) => ya + 0.5 * g * (tau - ta) * (tau - ta);
```
- Spin it (~1 turn), let perspective shrink it (constant world size, the layer scale does the rest).
- Sinking into a liquid: clip the sprite at the surface line (a wrapper div with overflow hidden whose bottom edge is
  the surface) and keep moving it down with a wobble.
- A return flight ends EXACTLY on the object drawn in the next pose (same centre, width, rotation 0) so the swap is
  invisible.

---------------------------------------------------------------------------------------------------------------------
## 8. Effects in code (flat cartoon look, matching the outlines)

- Liquid lava: flat orange shapes, NO black outline (#FF6A2B, deep edge #E2501E, hot core #FFA445 / #FFC867).
- Smoke / steam: clusters of circles with ONE merged outline - draw every ink circle (r + outline) first, then every
  fill circle. Grow, drift, then SHRINK away (don't fade outlined puffs). White = steam, grey = smoke. Puffs in pulses
  with gaps, different speeds per jet, so they don't read as identical columns.
- Blobs: born in bursts with random angle/speed, gravity, stretched along their velocity, land on the set piece's
  silhouette profile and leave a splat that shrinks.
- Flows: thick round-capped paths revealed along their length (deep colour under, main, hot core on top), routed
  AROUND anything drawn on the surface (eyes).
- An eruption = a "crown" of 9 pulsing lava fingers fanning out of the crater + blob spray + dark smoke + glowing sky.
  NOT one tall column (it looks phallic).
- Glow: radial gradients (crater heat, sky glow) at low opacity; strong orange washes look cheap.
- Faces on objects (the fun part): white ellipses + black pupils + white glint, eyelids as a grey shape clipped to the
  eye with a black lid line (tilt = angry), thick round brows; pop open with an overshoot; blink; look at the action;
  squeeze shut as "> <" (two chevrons), never fully lidded empty rings; smug = half lids + relaxed brows.
- The object can act: inhale (stretch up 6 %) before a blast, squash to 0.9 on the blast with a damped spring back.
- Sweat drop: light-blue teardrop with an outline and a white glint, pops on, slides along the head, pops off.
- Smoke rings read as halos if too light: use mid-grey.
- Random values (blob angles, puff sizes) come from a seeded generator (Remotion `random(seed)`), never Math.random:
  every frame must render identically on every render worker.

---------------------------------------------------------------------------------------------------------------------
## 9. Sound

- Layers in code: the voice (0 dB) + effects (one cue list: file, start time, dB, optional dB keys over time).
- Whooshes / swish / thud / click from the user's sound library; extra sounds (lava plop, bubbling, steam hiss,
  rumble, boom, roar) from Higgsfield: `higgsfield generate create seed_audio --prompt "Sound effect only, no music, no
  voice: ..." --sample_rate 48000 --format wav --wait` (0.1 credit, usually best) or `mirelo_text_to_audio --duration N`
  (0.75 credit). Judge files by waveform (envelope + where the peak is); slice the useful part, peak-normalise to -1 dBFS.
- Sync each file by its measured onset (impacts) or peak (whooshes) to the beat. Levels under a voice: whooshes -25 to
  -31 dB, impacts -14 to -19 dB, beds (bubbling, roar) -26 to -33 dB, the big blast -8 to -10 dB inside a pause.
  Check the mix: no clipping, peak around -4 dBFS.

```tsx
<Sequence from={Math.round(c.at * FPS)} layout="none">
  <Audio src={staticFile(`short/sfx/${c.f}.wav`)} volume={(f) => 10 ** (dbAt(c.at + f / FPS) / 20)} />
</Sequence>
```

---------------------------------------------------------------------------------------------------------------------
## 10. Check, then render

- Contact sheets: stills at every beat (`renderStill`, scale 0.5) in one grid; check frame 0, every swap, every gag,
  the last frame. Fix and re-check.
- Pop scan: render a 0.5x preview MP4, compute the mean frame-to-frame difference (blurred, 270x480) and flag frames
  above 2.2x the local median; every flag must be an intended swap or cut.
- Render 4K vertical: `npx remotion render src/index.ts <CompId> out/<name>-4K.mp4 --scale=2 --gl=angle
  --image-format=png --crf=16 --pixel-format=yuv420p` (GPU; ~2 min for 13 s; on a machine without a GPU keep
  `--gl=angle` too: measured ~3x faster than `--gl=swangle` with the notebook paper / boil filters). Bundle ONCE to a fixed outDir in scripts (Remotion copies public/
  into a new temp folder every bundle otherwise).
- Verify the file: 2160x3840, 60 fps, frame count = duration x 60, audio present and as long as the picture, the picture
  still moves at the very end.

---------------------------------------------------------------------------------------------------------------------
## 11. Rules that keep it looking hand-made

- Frame 0 = the premise, centred, big, readable, already moving; the first spoken line names what you see and starts by 0.2 s.
- Everything centred and balanced when the camera holds; nothing important cut by the frame edge.
- No motion blur, no cross-fades between drawings, no random jitter. Every move eased; the camera glides >= 1 s.
- One focal action at a time; effects stop when their beat is over.
- Same outline weight family everywhere (pictures + code-drawn effects); flat colours, no gradients on characters.
- Every visual sits on its word; the joke or payoff lands on the last word; the last frame loops to the first.
- Real facts only in the voice-over (cartoon exaggeration is fine for what the characters do).

---------------------------------------------------------------------------------------------------------------------
## 12. Daily-video workflow (reuse everything, spend credits only on what is new)

A starter project lives in `shorts/kit` (Remotion 4): `src/lib/kit.tsx` (camera, layers, Guy + 13-pose library,
squash `swap()`, ObjectFace, Sweat, Puffs, Arrow, Star, Badge, Box / Ball / Rope props, arcY projectile, shake/hit,
SoundLayer), `src/Template.tsx` (an 8 s gag using every piece - copy it per video), `public/library/char/` (13 trimmed
poses, measured in `src/lib/library.json`), `public/library/sfx/` (whoosh, pop, ding, twang, strain, whir).

Per video:
1. Script 15-25 s (40-60 words), stories included. Shorter = cheaper voice and better completion. If the take runs
   long, `scripts/tighten.py` shortens pauses to 0.26 s and speeds up 1.06x, and remaps the word times.
2. Voice: one eleven_v4 take with the same voice every day ("James - Natural", c1rY2UegY9FCAFayo2PO) for a recognisable
   channel. ~1 credit per character (a 45-word script = ~250 credits). Word times + T table as in section 2.
3. Pictures, in this order of preference:
   a. a library pose (front_calm, front_worried, front_wave, lookup, walk, point_right, shrug, think, scared, surprised,
      laugh, present, side_stand; `flip` mirrors any of them);
   b. a prop drawn in code (Box, Ball, Rope, or a small custom SVG in the same style: flat fill, one shade, 8 px ink
      outline) with an ObjectFace when it should come alive;
   c. only when (a)/(b) would look clearly worse: a new Higgsfield picture with front_calm.png as the reference
      (~4.25 credits). New poses go into the library (trim + measure with the prep step) so they are free next time.
4. Sounds: the shared sfx first; a new ElevenLabs sfx (50 credits) only for a sound the library does not have, and
   then add it to `public/library/sfx/`.
5. Contact sheet + pop scan, then render 1080x1920 (about 5 min on CPU; 4K on CPU takes hours - only on a GPU).
6. Loop ending (every video): render the scene as a function of time, then wrap it in
   `<LoopOut t={t} total={DURATION} start={<Scene t={0} />}>` (kit.tsx; see Template.tsx) and add a whoosh cue at
   `DURATION - LOOP_DUR`. The last frame then equals frame 0. Check with `node scripts/check-loop.mjs <CompId>`
   (copied with the kit): it must print "seamless loop".

7. Like / subscribe / comment (every video): `<CallToAction t={t} at={T.cta} />` (kit.tsx) inside the scene function +
   `...ctaCues(T.cta)` in the cues. Three doodle stickers pop in along the top band and a cursor taps LIKE, SUBSCRIBE and
   COMMENT (2.6 s). Place it once, in a calm stretch right after the answer lands (about 55-80 % through), never in the
   first 3 s, finished before the loop push; the voice-over never asks. The description ends with "Like and subscribe
   for more weird questions, and leave yours in the comments." before the channel line.

8. Hook (every video): `<HookTitle t={t} text="STRIPES STOP FLIES" hi="STRIPES" />` (kit.tsx) inside the scene
   function: 2-6 words, a claim rather than a question, fully on screen at frame 0 (no pop-in), pops out at 1.8 s
   (`out`), top band y 350 (`y` moves it). Something moves by 0.3 s and the voice starts by 0.2 s; `check-loop.mjs` also compares frame 0 with 0.5 s and
   fails a still opening, `check-hook.py` checks the voice start.

9. Comment question (every video, near the end): `<CommentAsk t={t} at={...} until={...} text="What should he paint
   next?" />` (kit.tsx) inside the scene function, top band y 270, from the last line until ~0.4 s before the loop
   push: a question about THIS video people want to answer. (The old always-on `AskBanner` is retired.)

Budget per video: Higgsfield 0-10 credits, ElevenLabs ~250-400 credits. Starter plan: max 4 Higgsfield jobs at once.

---------------------------------------------------------------------------------------------------------------------
## 13. Story Shorts (several characters, dialogue)

Model: videos/whisper (71 s, 27 shots). Narrator (James) + one ElevenLabs voice per character, each recorded as ONE take
with all its lines (eleven_v4 tags like [whispering] work for whispers); word times from the ElevenLabs connector's
`creative_transcribe_audio` (Scribe, 0 credits) on each take's own flow node; `scripts/assemble.py` cuts every loud
stretch and lays the lines back to back (narrator ~1.12x, 0.1-0.3 s gaps) into one track + src/dialogue.json. Hook: open
on the climax for ~3 s (the payoff happening), then "X days earlier" with a rewind wipe; captions word by word
(`Captions`), hidden while the HookTitle or a title card shows. Shots = one world + camera keys with cuts (a key 1 ms
before the cut), screen-space close-up inserts for waist-up pictures. New characters: Higgsfield with front_calm.png as
the reference and a costume style block (same head, eyes, outline, white hands/feet, clothes allowed), one hero picture
per character, then every pose with the hero as a second reference. Anchor cast cut-outs by the head (Char), not the
feet: props (broom, bucket) shift the measured feet. Higgsfield login in a cloud session waits only a few minutes: give
the URL and have the callback pasted right away (start a new login if it timed out); reference uploads need
upload.higgsfield.ai allowed in the environment. assemble.py matches loudness (-21.5 LUFS + limiter), not peak: the takes
come out at different levels and a peak-normalized mix of them is ~3 dB quieter than the channel. A camera that follows
something = a key every frame with `e: 'lin'` (sparse keys with the default ease stop and go 4x a second). After the
pop scan, fix a stretch without a full re-render: `render.mjs <Comp> work/patch.mp4 1 <from>-<to>`, splice it in with an
ffmpeg trim + concat re-encode (crf 16); a sound-only fix = `render.mjs <Comp> work/sound.aac` + remux (`-c:v copy`).

---------------------------------------------------------------------------------------------------------------------
## 14. Hooks and growth (what the top animated "what if" Shorts do)

Studied the biggest animated science / "what if" Shorts (Nov 2026: 29 videos over 1M views + 25 breakouts from small
channels; channels with ~40K subscribers got 3-178x their normal views, so the hook decides, not the channel size):
- Title = an impossible picture you see before it plays, about YOU: "What If Your Hair Had Nerves", "What If Humans Had
  Hummingbird Hearts", "What If Your Skeleton Disappeared For 5 Seconds". Textbook questions ("Why does a steel ship
  float?") lose: people have heard them.
- First line = the whole premise as one question in one breath, then a consequence right away. The 23.6M-view
  hummingbird Short opens: "If a hummingbird's heart is removed then stuck into your chest and it was beating almost 20
  times a second, could it ... give you super human endurance? Well, within moments your brain would start shutting
  down..."
- Danger words do the work (bad, dangerous, disappeared, don't want); concrete numbers and time limits ("for 5
  seconds", "24 hours", "20 times a second") make the impossible feel testable.
- Length 26-45 s for the big ones; for a small channel aim 15-25 s.

"1K views jail" = the first test audience did not stay. YouTube shows a new Short to a small group and pushes it only if
it beats similar Shorts on: chose to view vs swiped away (no official target; guides say 70 %+), how much is watched and
replayed (over 100 % = loops), then shares / comments / likes; it also weighs viewer satisfaction and prefers a few good
videos to many low-value ones. So: hook rules above, 15-25 s, a seamless loop, a comment question, one lane
("what if" + your body / animals) for 10-15 videos, about one video a day, never delete + re-upload (a retry needs a new
first frame and first line), and a searchable plain question as the description's first line. Read Studio per video:
many swipes = fix frame 0 / first line; a mid-video drop in retention = cut that part.

Models: videos/zebra (all of this in 26.7 s: frame-0 half-striped cow, "STRIPES STOP FLIES", danger at 4 s, "UNDER 1/4",
twist + loop, CommentAsk), videos/hotel (night shading: screen-blended moonbeam with window bars, dust, warm light under a
door, blurred wall shadows, gradient-shaded head with a rim light), videos/zebra again for day shading (low sun, form
shading per body, cast shadows leaning away from the sun, parallax sky / hills).

First real numbers (videos/neck, 18.7 s): 1.8K views, 113 % average viewed, 40 % swiped away. The content, length and
loop work (people replay); the first second does not. Frame 0 showed the guy lying flat and small in a wide savanna,
the first line took 2 s of setup before "pass out" at 4.3 s, and the first sound was a soft chirp. Rule from it: when %
viewed is high but swipes are high, change only frame 0 (peak picture, upright, big, a hit / whoosh on frame 0), the
first line (the consequence inside ~2 s) and the hook text (what frame 0 already shows). Retry = a new upload with the
reused scene and a new voice take; never delete the original.
