# Roblox story video playbook

Built from 9 popular reference videos in this format (analysed with `tools/analyze_inspo.py`).
The strongest style is the first-person "Eddie" story: result-first hook, one impossible rule,
fast cuts. Treat the two worked examples in `videos/` as the gold standard.

## 1. Numbers to hit

| Metric | Gold standard (3 Eddie videos) | All 9 | Our target |
|---|---|---|---|
| Length | 111-123s | 68-140s | 60-120s (default ~110s) |
| Words | 475-518 | 333-608 | ~4.3 words per second of video |
| Words per minute | 256-258 | 158-297 | 255-280 after speed-up and trim |
| Words in first 15s | 67-74 | 44-74 | 68-75 |
| First word at | 0.00s | 0.00s | 0.00s (no intro, no title) |
| Pauses over 0.3s | 2-6 in the whole video | 2-52 | under 6 |
| Pauses over 0.6s | 0-2 | 0-11 | 0 |
| Cuts per minute | 46-60 | 28-60 | 50-60 |
| Average shot | 1.0-1.3s | 1.0-2.1s | 0.9-1.3s |
| Cuts in first 15s | 11-19 | 5-19 | 14-18 |

The slow outliers (`Download (6)`, `(7)`: 158-168 wpm, 28 cuts/min, 50 pauses) are the
pattern to avoid.

## 2. Script formula (beat sheet for ~110s / ~480 words)

**0-3s HOOK LINE (result first).** One sentence: an ordinary action + an impossible, vivid
consequence, ending on the most visual word. It must show a scene the viewer has not
understood yet (open loop).
- "I ran past one guy in a race, and his entire body got glued to my back!"
- "I took one wrong turn in the world's biggest race, and 10,000 runners followed me straight off a cliff."
- "I looked in the mirror this morning, and my reflection was standing inside a burning school, covered in blood!"
- Follow with a 3-6 word contradiction or escalation: "But I didn't have a single scratch!" /
  "Then I overtook another guy! He got stuck too!"

**3-8s RULE.** "You see, in this world, [one-sentence rule]." The rule is a twist on something
everyone knows (racing, mirrors, weather, handshakes, money, building). Concrete, testable,
no lore dump.

**8-15s SOCIETY EXAMPLES.** 2-3 rapid, funny or relatable consequences of the rule, each a
mini-vignette with its own shot: "That's why professional racers never overtake anyone..."
/ "Kids check their reflections before exams. My dad once saw himself getting hit by a car,
so he stayed home the next day."

**~15s THE "BUT" PIVOT.** "But [I accidentally / last Tuesday / there's one rule]..." Puts the
narrator into the worst case of the rule, with a number: "But I'd accidentally entered the
world's biggest race. Ten thousand contestants! And I'd started in last place."
Optionally the narrator intro: "My name is Eddie, and I'm 13."

**15-75s ESCALATION LADDER.** Every 8-12s the situation doubles (one, ten, a hundred, a
thousand). Rules:
- Sentences of 3-10 words. Connectors: Then. Suddenly. But. So. Meanwhile.
- Onomatopoeia on hits, each one gets a sound effect: Boom! Whoosh! Crash! Beep, beep, beep!
- Short shouted dialogue: "Stop running!" "I can't! My shoe is stuck!"
- A named rival with a punchy name (Speedy Steve, Turbo Tom) appears around 40-50%.
- Plant 1-2 new mysteries mid-way (something in his arms, something in the smoke).

**75-95s "THEN I NOTICED SOMETHING."** The clever turn: the protagonist uses the world's rule
itself to win (the glued crowd becomes a human train, the road follows the leader).

**95-110s PAYOFF + BUTTON.** Win or reveal, then a fast comedic or chilling last beat that
re-opens the loop: "The world's biggest swimming race." / "Don't turn around." /
"Good news! Your commute just got shorter." Last line 2-6 words.

Voice: first person past tense ("I") for the Eddie format. Second person present ("you")
works for emotional stories (grandpa / dad) but runs slower; prefer "I" for retention.

## 3. Hook checklist (first 15 seconds decide everything)
- [ ] Word 1 at 0.00s, a cut by 0.6s, 3-4 cuts in the first 3s.
- [ ] Frame 0 is mid-action and mid-camera-move (running, falling, pushing in), never static.
- [ ] The weird thing is ON SCREEN in the first 2s (glued runner, burning reflection).
- [ ] A big reaction close-up of the protagonist (huge eyes) within the first 4s.
- [ ] The rule line is literally illustrated (show the mechanic happening, not people talking).
- [ ] Each society example is its own location and character (teacher, kid, dad).
- [ ] 68-75 words by 15s. No breath pauses.
- [ ] At least one unanswered question carried past 15s.

## 4. Shot grammar
- Every noun gets a picture. When the narration names a thing, it is on screen.
- Alternate scale every cut: wide -> close -> insert -> medium -> POV.
- Cut on the word that introduces a new image, not on sentence ends.
- Reaction close-ups after every surprise, expression change on the beat word.
- Scale shots: top-down or high wide for crowds (10,000 runners), then back to a face.
- Re-use: a set built once is shot from 5-10 angles. Two or three locations per minute.

## 5. Camera (never still)
Every shot has at least one of: push-in (10-25% closer), pull-out, track alongside, orbit,
crane/tilt, handheld shake (panic), whip pan between subjects (motion blur, 4-6 frames),
crash zoom (lens punch over 3-4 frames on a shock word). Hold a perfectly still frame never.
In the first 3 seconds use the fastest moves (whip + crash zoom).

## 6. Acting
- Faces change on beat words: shock (wide eyes + grimace), scream, squint, smug, side-eye, cry.
- Big body language: arms up in shock, hands on head, recoil step back, point, lean in, slump,
  cheer, run with full arm swing. Overshoot and settle (pose pops), never linear tweens.
- Talking characters flap mouths per word; listeners react (nod, blink, side-eye).
- Blinks every 2-4 seconds when a face is held.

## 7. Captions
One word at a time, uppercase, white with a thick black outline, centred at y=1607 of 1920,
on screen from the word's start until the next word. Font: Montserrat Black (Segoe UI Black
stand-in). Keep faces and signs in the upper half, captions own the lower third.

## 8. Sound
- Voice: ElevenLabs voice `skghcThhrhzKre1Ny7M7`, model `eleven_v4`. Then
  `tools/voice_run.py` (speed up, cut silences to ~0.10s inside sentences and ~0.22s between
  sentences, then timestamp). Target 255-280 wpm after processing.
- SFX on every onomatopoeia, every impact, every whoosh/whip pan, every reveal (riser or
  sting). Library in `sfx/`, new sounds via ElevenLabs `eleven_text_to_sound_v2`.
- Music: TEMPOREX "Numbers" (setup.py downloads it), sped up 1.5x at the same pitch, ~14 dB
  under the voice and ducked while it talks (`tools/mix.py`).

## 9. Story ideas bank (format: everyday thing + one impossible rule)
Collect new ideas here before writing. Proven shells: race rules, mirrors/reflections,
weather tied to feelings, body swap by handshake, limited daily powers, wealth = height,
living on the sun.

Made so far: `laugh_float` (laughing makes you float, 88s), `sneeze_teleport` (sneezing
teleports you + anything you touch, 71s).
Next ideas: hiccups make you shrink; every lie grows your hair a foot; yawning is contagious
and puts the whole town to sleep; your shadow does what you really want to do; burping swaps
your voice with the nearest animal; the floor is actually lava one day a year; whatever you
draw in class comes alive at 3pm.

## 10. Production
The full step-by-step (commands, costs, traps) is the kit's `SKILL.md`.
