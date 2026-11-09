# Is today my lucky day? (yes / no wheel)

13.2 s, 1080x1920 60 fps. A wheel-format Short: the guy has just spun a doodle prize wheel, it slows down, stalls on
NO against the last peg, strains, and clicks over to YES. Everything is drawn in code (no new pictures).

`src/Wheel.tsx` has reusable pieces for more wheel videos:
- `Wheel` (frame ring with chasing bulbs, 8 YES / NO wedges, pegs, a hub with an `ObjectFace`) and `Flapper`;
- `wheelAngle(t)` (friction spin-down to a stall on the last peg, push-back, strain, snap) - change `TH_S` / `T` to
  land on another wedge; `PASSES` (every peg passing the flapper) drives both `flapBend` and the tick sounds;
- `QuestionCard` (taped question note that gets a YES stamp), `YesSticker` ("THE WHEEL SAYS" burst), `Confetti`
  (strips, dots, stars, four-leaf clovers from both lower corners), `Sunburst` (game-show rays), `Clover`.

Voice: James, eleven_v4, one take (`public/wheel/vo/take1.mp3`). New shared sounds: `tick.wav`, `tick2.wav` (wheel
clicker, made in code), `confetti.wav` (ElevenLabs sfx).

    npm install
    node scripts/check-loop.mjs Wheel
    node scripts/render.mjs Wheel renders/wheel-1080x1920.mp4
    COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0
