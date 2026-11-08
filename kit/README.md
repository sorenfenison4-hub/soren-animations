# Cut-out cartoon Shorts kit

Reusable pieces from the elevator Short, so each new video only needs a script, a voice and maybe a prop or two.

- `src/lib/kit.tsx` - camera (2.5D multiplane), layers, the guy with 13 poses, squash pose swaps, object faces,
  sweat, smoke/steam puffs, arrows, stars, badges, code-drawn props (Box, Ball, Rope), projectile arcs, shake, sound layer.
- `LoopOut` (in kit.tsx) - every video ends by sliding back to its opening shot, so the last frame equals frame 0 and
  the Short loops seamlessly. `node scripts/check-loop.mjs <CompositionId>` checks it.
- `src/Template.tsx` - an 8-second example that uses all of it. Copy it for each new video.
- `public/library/char/` - 13 Higgsfield poses (trimmed). Measurements in `src/lib/library.json`.
- `public/library/sfx/` - whoosh, pop, ding, twang, strain, whir.
- `images/` - the original 4K pictures, prompts are in the skill.
- `skill/SKILL.md` + `skill/scripts/gen.sh` - the cutout-cartoon-shorts skill (copy to ~/.claude/skills/cutout-cartoon-shorts/).

Commands:
    npm install
    npx remotion studio src/index.ts
    npx remotion render src/index.ts Template out/video.mp4 --gl=angle      (GPU)  /  --gl=swangle (CPU)
