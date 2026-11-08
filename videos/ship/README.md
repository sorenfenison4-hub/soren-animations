# Cut-out cartoon Shorts kit

Reusable pieces from the elevator Short, so each new video only needs a script, a voice and maybe a prop or two.

- `src/lib/kit.tsx` - camera (2.5D multiplane), layers, the guy with 13 poses, squash pose swaps, object faces,
  sweat, smoke/steam puffs, arrows, stars, badges, code-drawn props (Box, Ball, Rope), projectile arcs, shake, sound layer.
- `LoopOut` (in kit.tsx) - every video ends by sliding back to its opening shot, so the last frame equals frame 0 and
  the Short loops seamlessly. `node scripts/check-loop.mjs <CompositionId>` checks it.
- `src/Template.tsx` - an 8-second example that uses all of it. Copy it for each new video.
- `public/library/char/` - 13 Higgsfield poses (trimmed). Measurements in `src/lib/library.json`.
- `public/library/sfx/` - whoosh, pop, ding, twang, strain, whir, crickets, giggle, zap, chirp, hum (20 s power-line bed).
  `SoundLayer` cues take optional `keys` ([time, dB] fades) and `from`/`to` (play part of a file).
- `scripts/` - run from the video folder: `node scripts/stills.mjs --bundle 0 2.5 ...` (stills at 0.5x),
  `python3 scripts/sheet.py sheet.png 5 324 <same times>` (contact sheet), `node scripts/render.mjs <CompId> renders/x.mp4`
  (CPU render, crf 16), `python3 scripts/popscan.py renders/x.mp4` (pop scan), `python3 scripts/pauses.py vo.mp3` (pauses).
  They use the pre-installed headless Chromium in /opt/pw-browsers.
- `images/` - the original 4K pictures, prompts are in the skill.
- `skill/SKILL.md` + `skill/scripts/gen.sh` - the cutout-cartoon-shorts skill (copy to ~/.claude/skills/cutout-cartoon-shorts/).

Commands:
    npm install
    npx remotion studio src/index.ts
    npx remotion render src/index.ts Template out/video.mp4 --gl=angle      (GPU)  /  --gl=swangle (CPU)
