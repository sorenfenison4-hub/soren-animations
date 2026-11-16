# What if you had a woodpecker's head? (animal powers, owl formula)

~20.2 s, 1080x1920 60 fps (CRF 12). Comment-series opener (a made-up animal-power comment at frame 0), the guy with a
beak + red crest already mid-peck into the trunk (BONK, chips, dizzy stars), the smug woodpecker drumming on the other
side. Then he keels over stiff (K.O. + laugh), PECKS A SECOND 0 -> 20 counter on the woodpecker, X-RAY skull (NO SHOCK
ABSORBER spring crossed out -> STIFF HAMMER), YOUR BRAIN slamming the skull (CONCUSSION), BRAIN SIZE card (TINY vs
you, OUCH), his fix: a pillow taped to the tree (FLUMP), comment ask "Shark teeth or octopus arms?", the pillow slips
and his next peck hits bare wood = frame 0.
Everything drawn in code in `src/Woodpecker.tsx` (`GuyHead`, `Woodpecker`, `Trunk`, `Pillow`, `SkullXRay`, `BrainXRay`,
`SizePanel`, `Counter`) over the library body.

Voice: James, eleven_v4, one take; tighten.py --tempo 1.1: 23.9 s -> 19.2 s (`public/woodpecker/vo/tight.mp3`).

    npm install
    node scripts/check-loop.mjs Woodpecker
    CRF=12 node scripts/render.mjs Woodpecker renders/woodpecker-1080x1920.mp4
    COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0    (then ThumbWide)
