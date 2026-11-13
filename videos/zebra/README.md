# What if you painted a cow like a zebra? (story Short, day)

26.7 s, 1080x1920 60 fps (CRF 12). The first video made with the new hook rules from the hook study: frame 0 is the
impossible picture already happening (a half-striped cow, brush mid-stroke, flies circling), the hook text is a claim
("STRIPES STOP FLIES"), danger by ~5 s (biting flies spread disease), a hard number (flies land on zebras under a quarter
as often as on horses), a fly-vision dazzle shot, the no-brakes dive and BOING, zebra vs horse landing counters, the cow
study, and the whole herd queuing for a paint job, which loops back to the brush. On-screen only: like / subscribe /
comment stickers and "What should he paint next? Tell us in the comments".

Daylight shading: low sun upper left, gradient-shaded animals with a sunlit top edge, cast shadows leaning right, far
sky / hills layers with parallax. All drawn in code in `src/Zebra.tsx` (`Quad` = cow / horse / zebra with paintable
stripes, `Fly`, `diveBounce`, `FlyVision`, `Counter`, `Germs`, `Brush`, `Bucket`).

Voice: James, eleven_v4, one take; pauses shortened and sped up 1.06x into `public/zebra/vo/tight.mp3` (30.4 s -> 25.9 s).

    npm install
    node scripts/check-loop.mjs Zebra
    CRF=12 node scripts/render.mjs Zebra renders/zebra-1080x1920.mp4
    COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0    (then ThumbWide)
