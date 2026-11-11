# Cut-out cartoon Shorts kit

Reusable pieces from the elevator Short, so each new video only needs a script, a voice and maybe a prop or two.

- `src/lib/kit.tsx` - camera (2.5D multiplane), layers, the guy with 13 poses, squash pose swaps, object faces,
  sweat, smoke/steam puffs, arrows, stars, badges, code-drawn props (Box, Ball, Rope), projectile arcs, shake, sound layer.
- `Sea` (in kit.tsx) - wavy water band for lakes and seas (the see-through version goes in a `paper={false}` Layer);
  `pen(p)` makes any SVG stroke draw itself like a pen doodle. Example of both: `videos/ship/src/Ship.tsx`.
- `HookTitle` (in kit.tsx) - big question / surprising-fact text on screen from frame 0 to ~1.8 s, for sound-off
  viewers (every video, see Template.tsx). `python3 scripts/check-hook.py <vo.mp3> 0.1` checks the first word is heard
  by 0.2 s (`--trim` cuts leading silence); `check-loop.mjs` also fails an opening that does not move by 0.5 s.
- `AskBanner` (in kit.tsx) - "Comment what question you want answered next" sticker in the top band for the whole
  video (every video, outside LoopOut, see Template.tsx).
- `CallToAction` + `ctaCues` (in kit.tsx) - the like / subscribe / comment doodle every video has once (see Template.tsx).
- `LoopOut` (in kit.tsx) - every video ends by sliding back to its opening shot, so the last frame equals frame 0 and
  the Short loops seamlessly. `node scripts/check-loop.mjs <CompositionId>` checks it.
- `src/Template.tsx` - an 8-second example that uses all of it. Copy it for each new video.
- `public/library/char/` - 16 Higgsfield poses (trimmed; sweep + listen hold a broom). Measurements in `src/lib/library.json`.
- `public/library/sfx/` - whoosh, pop, ding, twang, strain, whir, crickets, giggle, zap, chirp, hum (20 s power-line bed),
  splash, bubbles, horn (ship toot), waves (3 s sea lapping, repeat it for a bed), tick / tick2 (wheel clicker),
  confetti (party-popper burst), crack (stone crack: small crackles, the big snap 0.32 s into the file), hiss (2.6 s steam hiss).
- Cracks that draw themselves and then fill (water, dissolved lime, new stone), a code-drawn block with a face and a
  laurel wreath, a hard hat, a mixing trough and the Pantheon: `videos/concrete/src/Concrete.tsx`.
- Story Shorts with several characters (format of the big animated-story channels: narrator + character voices, a cut every
  ~2 s, word-by-word captions, music bed): copy `videos/whisper`. The kit now has the cast from it - `Char` / `castHead`
  (kit.tsx) draw `public/library/cast/` (king_calm / laugh / point / listen / shock, adv_front / whisper / laugh / panic /
  scrub; measured in `src/lib/cast.json`; head-anchored, same head size as the guy; no crown in the king pictures so code
  can draw a gold or wooden one), two more guy poses `sweep` / `listen` (with a broom), `Captions` (kit.tsx) and
  `scripts/assemble.py` (cuts every line of several ElevenLabs takes and lays them back to back into one dialogue track +
  `src/dialogue.json` with word times in video time, loudness-matched to -21.5 LUFS; edit its CHUNKS table per video). New sounds: gulp, squeak, peck,
  rewind, whisper_whoosh, crowd_laugh. Music beds: Higgsfield `elevenlabs_music_v2_5 --duration N --force_instrumental true`
  (~14 credits for 72 s); sound effects `seed_audio` (max 2 at once on the starter plan).
- Night scenes and story Shorts: `videos/tower/src/Tower.tsx` - navy marker sky with star layers, moonlight / window glows,
  a house with a lit window, a tower of thin slabs, a Moon with a face and blush, self-drawing dimension arrows, a heart,
  "HA HA" speech bubbles, a time-lapse with a year badge and clicker ticks.
- Word times when the whisper model download is blocked (cloud sessions): the ElevenLabs connector's
  `creative_transcribe_audio` (eleven_scribe_v1, 0 credits) on the voice's own flow node returns per-word times.
- Yes / no wheel videos: copy `videos/wheel` - its `src/Wheel.tsx` has the prize wheel with a face, the flapper and tick
  model (ticks come from the wheel's own motion), a question card with a YES stamp, a YES sticker and paper confetti.
  `SoundLayer` cues take optional `keys` ([time, dB] fades) and `from`/`to` (play part of a file).
- `scripts/` - run from the video folder: `node scripts/stills.mjs --bundle 0 2.5 ...` (stills at 0.5x; `BUNDLE=work/bundle2` bundles separately so stills can run while a render uses work/bundle),
  `python3 scripts/sheet.py sheet.png 5 324 <same times>` (contact sheet), `node scripts/render.mjs <CompId> renders/x.mp4`
  (CPU render, crf 16; `[scale] [from-to]` renders a frame range to patch in; an `.aac` out renders only the sound), `python3 scripts/popscan.py renders/x.mp4` (pop scan), `python3 scripts/pauses.py vo.mp3` (pauses).
  They use the pre-installed headless Chromium in /opt/pw-browsers with `gl: angle` (about 3x faster than swangle for the
  paper / boil filters on a CPU-only machine: ~3.4 s per 1080x1920 frame per worker; `GL=swangle` to compare).
- `images/` - the original 4K pictures, prompts are in the skill.
- `skill/SKILL.md` + `skill/scripts/gen.sh` - the cutout-cartoon-shorts skill (copy to ~/.claude/skills/cutout-cartoon-shorts/).

Commands:
    npm install
    npx remotion studio src/index.ts
    npx remotion render src/index.ts Template out/video.mp4 --gl=angle      (GPU and CPU: angle beat swangle 3x on CPU)
