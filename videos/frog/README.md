# What if you had a frog's eyes? (animal powers, owl formula)

18.95 s, 1080x1920 60 fps (CRF 12). The owl recipe (CLAUDE.md, Growth) applied point by point:
(1) the power is on him at frame 0: big frog eyes on his round head, half sunk mid-gulp (GULP, arrows), popping up by 0.38 s;
(2) the smug frog co-star does the same trick next to him; (3) two X-rays: the frog's eye drops into its mouth and PUSHES
the bug to the throat, then YOUR HEART (press the eye in -> the nerve lights up -> SLOWS DOWN, DANGER); (4) live counters:
a 0.07 s stopwatch on the tongue, GULPS PER BUG 2.3 vs 4, a slowing heart monitor; (5) the fly runs through the whole
video; (6) comedy hit from the power: his own tongue THWIP -> eyes sink -> BOING back up spinning, crowd laugh (~11 s);
(7) 56 words, a sticker every ~1.5 s, a cut every 2-3 s; (8) dumb fix (he only drinks smoothies) loops: a fly slides up
the straw, GULP, eyes sink = frame 0; (9) comment bubble opener + "Bat ears or a shark's nose?".

Everything is drawn in code in `src/Frog.tsx` (`GuyHead` with `EyeDome`s that sink into the head, `Frog`, `Tongue`,
`Cup`/`Straw`, `FrogXRay`, `HeartXRay`, `Stopwatch`); the body is the library `front_calm` sprite.
Voice: James, eleven_v4, one take; tighten.py --tempo 1.1: 21.7 s -> 17.9 s. Word times from ElevenLabs Scribe
(the local whisper model could not download in the cloud session).

    npm install
    node scripts/check-loop.mjs Frog
    CRF=12 node scripts/render.mjs Frog renders/frog-1080x1920.mp4
    COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0    (then ThumbWide)
