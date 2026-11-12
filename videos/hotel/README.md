# Why can't you sleep the first night in a hotel? (story Short, night)

36.1 s, 1080x1920 60 fps (rendered at CRF 12 for extra quality). The guy lies wide awake at 3 AM in a perfect hotel bed:
first night, and every sound wakes him (minibar hum, footsteps under the door, the ice machine). It's his brain: on the
first night somewhere new the left half sleeps lighter and keeps listening, like a night guard (x-ray brain, one half
snoring, one half with a flashlight). The dolphin painting over the bed sleeps with one eye, then turns: the other eye is
open. Night two he snores through the ice machine... except tomorrow he moves to a new hotel, and the loop drops him back
at 3:07, wide awake. On-screen only: like / subscribe / comment stickers while his phone buzzes on the nightstand, then a
"Same for you? Tell us in the comments" sticker. No AskBanner (asked to remove it).

Shading pass (all code in `src/Hotel.tsx`): moonlight from the window (screen-blended beam with the window bars on the
blanket, floating dust), gradient-shaded furniture / head / blanket with a moonlit rim, soft blurred wall shadows,
contact shadows, warm hallway light leaking under the door, glowing clock and phone, a night vignette, and the city
outside the window on a far layer (parallax through the glass).

Voice: James, eleven_v4, one take (`public/hotel/vo/take1-trim.mp3`). New sounds (ElevenLabs sound effects, also added
to the kit): `snore.mp3`, `icemachine.mp3`, `footsteps.mp3`.

    npm install
    node scripts/check-loop.mjs Hotel
    CRF=12 node scripts/render.mjs Hotel renders/hotel-1080x1920.mp4
    COMP=ThumbTall SCALE=1 node scripts/stills.mjs --bundle 0    (then ThumbWide)
