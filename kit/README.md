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
- `public/library/char/` - 13 Higgsfield poses (trimmed). Measurements in `src/lib/library.json`.
- `public/library/sfx/` - whoosh, pop, ding, twang, strain, whir, crickets, giggle, zap, chirp, hum (20 s power-line bed),
  splash, bubbles, horn (ship toot), waves (3 s sea lapping, repeat it for a bed).
  `SoundLayer` cues take optional `keys` ([time, dB] fades) and `from`/`to` (play part of a file).
- `scripts/` - run from the video folder: `node scripts/stills.mjs --bundle 0 2.5 ...` (stills at 0.5x; `BUNDLE=work/bundle2` bundles separately so stills can run while a render uses work/bundle),
  `python3 scripts/sheet.py sheet.png 5 324 <same times>` (contact sheet), `node scripts/render.mjs <CompId> renders/x.mp4`
  (CPU render, crf 16), `python3 scripts/popscan.py renders/x.mp4` (pop scan), `python3 scripts/pauses.py vo.mp3` (pauses).
  They use the pre-installed headless Chromium in /opt/pw-browsers with `gl: angle` (about 3x faster than swangle for the
  paper / boil filters on a CPU-only machine: ~3.4 s per 1080x1920 frame per worker; `GL=swangle` to compare).
- `images/` - the original 4K pictures, prompts are in the skill.
- `skill/SKILL.md` + `skill/scripts/gen.sh` - the cutout-cartoon-shorts skill (copy to ~/.claude/skills/cutout-cartoon-shorts/).

Commands:
    npm install
    npx remotion studio src/index.ts
    npx remotion render src/index.ts Template out/video.mp4 --gl=angle      (GPU and CPU: angle beat swangle 3x on CPU)
