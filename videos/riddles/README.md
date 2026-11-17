# 3 animal riddles: can you guess all three? (riddle format, animal powers)

56.0 s, 1080x1920 60 fps (CRF 14). The user's format: intro ("Three animal riddles. Comment which ones you get right.")
on a quiz board of three black silhouettes with "?"; then three riddles in "I have... What am I?" form, each with a
RIDDLE n OF 3 card, the power acted out on the guy (X-ray lens with three hearts and blue blood / standing in spaghetti,
then a hop into mud: BLEH / cubes stacking, the last one lands on his head: BOING + laugh) and a 3-second THINK timer;
then "put your answers in the comments", a 3-2-1 countdown, and each card flips with an explanation insert
(octopus X-ray: body heart + two gill hearts, copper = blue; butterfly foot zoom: taste sensors, lands on a leaf;
wombat gut X-ray: blob squeezed into a cube, cubes on a rock = MY TURF). Ends on the board + YOUR SCORE ?/3 and loops
to the intro board. No comment bubble (the riddle card + intro line do that job here).

Everything drawn in code in `src/Riddles.tsx`; the body is the library `front_calm` sprite.
Voice: James, eleven_v4: intro take + main take (tighten.py --tempo 1.06 --keep 0.3), with 3 s think gaps,
a 2.2 s countdown gap and small answer gaps inserted. Camera k must stay under ~3.9 (Layer culls at depth 250).

    npm install
    node scripts/check-loop.mjs Riddles
    CRF=14 node scripts/render.mjs Riddles renders/riddles-1080x1920.mp4
    COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0    (then ThumbWide)
