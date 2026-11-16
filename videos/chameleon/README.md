# What if you had a chameleon's eyes? (body + animal powers, owl part 2)

23.2 s, 1080x1920 60 fps (CRF 12). Owl formula (CLAUDE.md, Growth) + the comment-series opener: frame 0 = a doodle
comment bubble ("what if you had a chameleon's eyes??") over the guy with two green turret eyes, each chasing its own fly,
and a smug chameleon beside him doing the same. Then: DOUBLE (ghost copy of the picture), SPIN, X-RAY of the coiled
"phone-cord" optic nerve, a 360 dial on the chameleon, HOW FAR YOU SEE 360 vs 200, YOUR BRAIN (one picture -> DOUBLE
VISION when the eyes split), the comedy hit (lunges at the wrong fly of two, BONK on the NO FLIES post, dizzy, laugh),
the chameleon locks both eyes on and strikes (SNAP), he shuts one eye (ONE EYE), the comment ask "Eagle eyes or cat
eyes?" (voice + CommentAsk), and fly B comes back, his eye pops open -> frame 0.
Everything drawn in code in `src/Chameleon.tsx` (`Turret` eye, `GuyHead`, `Chameleon`, `NerveXRay`, `Dial`,
`ViewPanel`, `BrainPanel`) over the library body.

Voice: James, eleven_v4, one take; tighten.py --tempo 1.1: 27.0 s -> 22.2 s (`public/chameleon/vo/tight.mp3`). Word
times from ElevenLabs Scribe.

    npm install
    node scripts/check-loop.mjs Chameleon
    CRF=12 node scripts/render.mjs Chameleon renders/chameleon-1080x1920.mp4
    COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0    (then ThumbWide)
