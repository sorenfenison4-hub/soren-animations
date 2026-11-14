# What if you had an owl's eyes? (body + animal powers)

22.25 s, 1080x1920 60 fps (CRF 12). Built on the zebra recipe (CLAUDE.md, Growth): the guy acts (chases a fly with his
head), a smug owl co-star with moods, a comedy hit (WHIP -> dizzy stars + laugh), an X-RAY insert (tube eyes padlocked
in the skull), a versus counter (NECK BONES 14 vs 7), a 270-degree dial on the owl, a neck X-ray of HIS artery tearing,
the owl's roomy artery, and a funny ending (he turns his whole body the slow way) that loops into frame 0.

Frame 0: guy big and upright with huge owl eyes, head already whipping after a fly, the owl beside him mid-turn,
"HIS EYES ARE STUCK", whoosh + twang on frame 0. The guy's head is drawn in code (`GuyHead`, turns with `yaw`) over the
library body; the owl (`Owl`), fly, `XRay`, `NeckPanel`, `NeckXRay`, `Dial`, `Brain` are all in `src/Owl.tsx`.

Voice: James, eleven_v4, one take; tighten.py 24.8 s -> 21.3 s (`public/owl/vo/tight.mp3`).

    npm install
    node scripts/check-loop.mjs Owl
    CRF=12 node scripts/render.mjs Owl renders/owl-1080x1920.mp4
    COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0    (then ThumbWide)
