# What if you had a rabbit's eyes? (17.1 s)

The user, 2026-11-23: "next million view idea" + "make 3 more" - video 3 of the 4 made that day (videos/beaver, videos/squeeze,
videos/rabbit, videos/lifespan; upload order and cadence in PLAN.md). Shark formula, animal-powers series, no captions.
Eyes again, on purpose spaced: the fly's eyes is 6 uploads back by the time this goes up (eyes are the channel's top two: owl, fly).

## Premise screen (CLAUDE.md, Growth) - written before the art
1. WISH: "eyes in the back of your head" - see behind you, nothing can sneak up on you.
2. BACKFIRE: a blind spot right in front of your nose - you'd never see what's coming straight at your face (a pie), and you can't
   see the phone you're holding. It hits the very thing you wanted (seeing everything).
3. ICON: the rabbit - every kid can name it; its side eyes and twitching whiskers.
4. FEEL IT NOW: your eyes, watching this screen right in front of your face.
5. SHOW IT: frame 0 = side view: his eye sits in the middle of the side of his head; a ball flies at his back inside a green
   "vision cone" and he catches it behind his back without turning (SEES BEHIND); close-up at 2.45 s: a cream pie comes straight at
   his face from the front - SPLAT at 2.95 s (NEVER SAW IT). Different from the fly's eyes (BONK into the screen).
6. NUMBER: nearly 360 degrees (a dial 0 -> 360, "YOU: 180").

## Facts (verified 2026-11-23)
- A rabbit's eyes are on the sides of its head; its field of view is nearly 360 degrees, with just a small blind spot at the bridge of
  the nose (Wikipedia, Rabbit); several rabbit-care sources put the blind spot (about 10 degrees) directly in front of the nose and under
  the chin (pet sites - treated as approximate, the voice gives no size).
- It uses its sense of smell and its whiskers to tell what is directly in front of it (rabbit.org; bunnylady).
- People see about 180 degrees across (forward-facing eyes) - the dial's "YOU: 180" (a round figure; sources give 180-200).

## Script (57 words)
"Get a rabbit's eyes, and you'd see behind your back, but not what's right in front of you. A rabbit's eyes sit on the sides of its head.
It sees almost all the way around. But right in front of its nose, there's a blind spot. It finds food by sniffing and feeling with its
whiskers. So now he walks backwards."

## Build
Scene `src/Rabbit.tsx`, all drawn in code:
- the guy = the code-drawn front-view body with a SIDE-VIEW head (`RFace`): one big eye in the middle of the side of his head (how a
  rabbit's eye reads from the side), a mouth at the front; the cream pie on his face is clipped to the head with drips;
- a green dashed vision cone from his eye toward his back (frame 0 and the walk backwards) so "sees behind" reads with the sound off;
- the rabbit (side view): long ears with pink insides, a cotton tail, haunch, snout with a twitching nose and whiskers that reach out;
- a ball thrown at his back (caught behind his back), a cream pie in a tin, a carrot, a phone (screen in front, its back when held
  against the side of his head);
- SEEN FROM ABOVE (a circle panel like the X-rays): the rabbit's head from above, the two eyes' fields sweep round (dial 0 -> 360,
  "NEARLY ALL ROUND", "YOU: 180"), then the wedge in front of the nose flashes red (BLIND SPOT).
Shots: 0 s park, side view, a ball into his hand behind his back (CATCH 0.24, again 1.5; comment bubble, SEES BEHIND); 2.45 close-up: the
pie from the front, SPLAT 2.95 (NEVER SAW IT), the rabbit laughs; 4.05 the rabbit's face (EYES ON THE SIDES); 6.35 SEEN FROM ABOVE: dial
to 360 at 8.0, BLIND SPOT 8.62; 11.0 a carrot in front of its nose: SNIFF SNIFF, the whiskers reach it, CRUNCH (WHISKERS); 13.62 he holds
his phone in front of his face (?), then against the side of his head (AH), the rabbit giggles; 14.42 he walks backwards past the rabbit
and catches the next ball behind his back (WALKS BACKWARDS) = frame 0. CTA 11.15 (top band), CommentAsk "Would you swap your eyes?".
Voice: James, eleven_v4, one take (20.3 s, 309 credits) -> `scripts/vsplice.py` (line 1 at 1.22 with its middle pause cut to 0.1 s, the
rest at 1.12) -> 16.0 s, first word 0.11 s, "front" 3.49 s. Sounds: kit only (whoosh, slap, squelch, splash, crowd laugh, zap, shimmer,
ticks, ding, beep, pfft, squeak, crack, giggle, footsteps).
Render: `node scripts/render.mjs Rabbit renders/rabbit-1080x1920.mp4 1`; `node scripts/check-loop.mjs Rabbit` = seamless loop (frame 0 vs
0.5 s: 14.9, moving). Thumbnails ("BLIND SPOT", the pie an inch from his face while he smugly looks back, the rabbit gasps).
