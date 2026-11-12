---
name: roblox-story-kit
description: Make an original Roblox-style 3D animated story video (9:16 short, 60-120s, "In this world, X makes you Y" format, first-person narrator) end to end on this computer in Blender, with ElevenLabs voice, silences cut, sound effects, fast cuts, captions and music. Use when the user says "roblox story", "roblox animation video", "make a story video about X", "make a roblox short about X", asks for story ideas for this format, or sends popular Roblox animation story videos to learn the pattern from. Also use for first-time setup or updating of the kit ("set up the roblox kit", "update the roblox kit").
---

# Roblox story kit

A complete studio for fast, high-retention Roblox-style story shorts: procedural blocky
characters with expressive faces, sets, camera moves, captions, sound and music, all built
and rendered locally in Blender from Python. One video = one folder `videos/<slug>/`.

## 0. Find the workspace (every time)

The kit's code lives next to this file; videos are made in a separate **workspace**
(default `~/RobloxStories`). `~/.roblox-story-kit.json` holds `{"workspace": ..., "python": ...}`.

- If that file is missing, or the user asks to set up: run
  `python "<this skill's folder>/setup.py"` (add a path to put the workspace elsewhere).
  It copies the engine, makes a private Python env (`.venv`), installs numpy, Pillow,
  faster-whisper and yt-dlp, finds Blender and ffmpeg, downloads the music, and renders one test
  frame. It prints `READY` or exactly what is missing with the command to fix it. Re-running is
  safe. `--update` refreshes the engine code after the kit was updated (never touches videos).
- Missing ffmpeg or Blender: tell the user the fix line setup printed and offer to run it
  (winget on Windows, brew on Mac). Ask first: it installs software. Blender must be 5.x
  (tested on 5.2).
- Afterwards run every command below **from the workspace folder** with the kit's python:
  `PY` = the `python` path in `~/.roblox-story-kit.json`. Never the system python.

Read `PLAYBOOK.md` in the workspace before writing anything: the numbers to hit, beat sheet,
hook checklist, shot grammar, camera, acting, captions and sound rules distilled from 9 popular
reference videos. Worked examples: `videos/laugh_float/shots.py` (73 shots, 88s, "laughing makes
you float") and `videos/sneeze_teleport/shots.py` (66 shots, 71s, "sneezing teleports you").
Copy their style. They ship with their voice already processed, so
`$PY tools/blend.py sneeze_teleport final` then `$PY tools/finish.py sneeze_teleport` makes a real
video with no ElevenLabs credits: a good first test if the user wants to see the system work.

Stories must be original: our own characters, our own sets, no real Roblox UI, logos, avatars,
game sounds or copied plots of other creators' videos.

## The pipeline

1. **Idea + script** (`videos/<slug>/script.txt`, `#` lines are notes). Shell: everyday thing +
   one impossible rule. Beat sheet from the playbook: result-first hook line, "You see, in this
   world, ...", 2-3 society examples (each its own location), "But" pivot, escalation ladder
   with onomatopoeia ("Poof!", "Bonk!") and short shouted lines, "Then I noticed something"
   (win using the world's own rule), payoff, 2-6 word button that reopens the loop (a callback
   works great). 300-400 words. Count words: ~65-75 must land in the first 15s.
   Show the user the script before spending credits, unless they said to run on autopilot.
2. **Voice** (costs ~1 ElevenLabs credit per character, 1,700-2,100 per video). Voice id and
   model come from `config.json` (`voice_id`, `tts_model`, default `eleven_v4`). Two ways:
   - The user has the ElevenLabs connector in Claude (tools like `creative_generate_speech`):
     generate with that voice_id and model, `generations_count: 1`, then download the result to
     `videos/<slug>/audio/raw.mp3`.
   - Otherwise: `$PY tools/eleven.py tts <slug>` (reads script.txt, skips `#` lines). It needs an
     API key in `.env` in the workspace (`ELEVENLABS_API_KEY=...`). If there is none, ask the
     user to paste their key into that file themselves; never type, print or echo a key.
     `$PY tools/eleven.py check` tests the key and voice for free.
   If the voice is "not found", the user must add it to their ElevenLabs account from the Voice
   Library, or pick their own voice and put its id in `config.json`.
3. **Voice processing** (from the workspace):
   ```
   $PY tools/voice_run.py --video <slug> --voice videos/<slug>/audio/raw.mp3 --speed 1.15
   $PY tools/tighten.py <slug> --max-gap 0.45
   $PY tools/retempo.py <slug> --wpm 258
   ```
   voice_run = speed up, cut silences (0.10s inside sentences, 0.22s between, so it never
   sounds chopped), then faster-whisper word timestamps aligned to the script (first run
   downloads the whisper model, ~1.5 GB; CPU takes a few minutes). tighten trims breaths the
   silence cutter keeps. Then check `audio/words.json`: 255-280 wpm, 65-75 words before 15s, no
   gap over ~0.45s.
4. **Sound effects**: pack in `sfx/` (`aww boing bonk boom buzzer cashier chat cheer click clink
   coin confetti crickets crowd ding door footsteps gasp glitch hammer jet kids_laugh meow
   paper pigeon place poof pop rimshot rise rocket rope sneeze snort sparkle splat stomp
   teleport thud whoosh wind window zombie alarm`). Only make new ones when the story needs a
   sound the pack lacks: connector (`creative_generate_in_flow`, node_type `sfx`) or
   `$PY tools/eleven.py sfx <name> "<prompt>"` (~17 credits), then
   `$PY tools/sfxprep.py sfx/raw/<name>.mp3 sfx/<name>.wav [--max 0.8] [--events 1]` and add
   `lead`/`gain` to `sfx/pack.json` (lead = seconds before the peak, so the hit lands on the cue).
   If generation fails, synthesize a simple tone with numpy instead of retrying blindly.
5. **Shots** (`videos/<slug>/shots.py`):
   ```python
   from shotkit import *
   from rbx import story
   from rbx.story import *
   V = Video(__file__); story.bind(V)
   @S(1, 0, 7, "HOOK: ...")          # shot = script words 0..7; last shot uses None
   def s01(t0, t1): ...
   ```
   Timing is by script word index, so re-generating the voice never breaks the edit. Cut on the
   word that brings a new image, 50-60 cuts per minute (~1.1s average), every noun on screen,
   reaction close-up after every surprise, alternate wide/close/insert. Every shot needs camera
   motion (`cam.push/orbit/crash/whip/track/handheld`; `ensure_motion` adds a drift if you forget).
   Hook: first frame already mid-action and mid-move, crash zoom and whip in the first 3s.
   Put `sfx(t, "name")` on every hit, whoosh, poof and reveal.
6. **Preview + fix** (fast: ~2 min for 66 shots on a decent GPU):
   ```
   $PY tools/blend.py <slug> preview all
   $PY tools/contact.py <slug> all 12 full        # -> videos/<slug>/full.jpg, look at it
   $PY tools/blend.py <slug> still:12.3 14 16     # one frame of shot 14 at t=12.3s, half res
   ```
   Look at every tile. Fix, re-preview just those shots (`preview 3,7,12`), repeat until every
   frame reads: face visible, subject framed, nothing blocking the lens.
7. **Render**: `$PY tools/blend.py <slug> cues` (writes `audio/cues.json`), then
   `$PY tools/blend.py <slug> final` in the background. Roughly 1.5-2.5 s per frame on a gaming
   laptop GPU (~1h for 80s), much slower without a GPU; never run two finals at once.
8. **Finish**: `$PY tools/finish.py <slug>` mixes voice + SFX + music, burns one-word captions,
   writes `out/final.mp4`, `out/final_nocaptions.mp4` and `out/final_phone.mp4` (720p, ~25 MB,
   small enough to send to a phone). Music: the first audio file in `music/` (setup downloads
   TEMPOREX "Numbers"), sped up 1.5x at the same pitch, ~14 dB under the voice and ducked while
   it talks. `--music-mode speed` pitches it up instead; `--no-music` skips it.
9. **QA the final file**, not just previews: a contact sheet of the real encode
   (`ffmpeg -i videos/<slug>/out/final.mp4 -vf "fps=1/1.8,scale=216:384,tile=10x4" -frames:v 1 videos/<slug>/qa.jpg`).
   Fix any bad shot, `final <ids>` just those shots, re-run finish.
10. **Report**: where the video is, credits spent, anything not checked. You cannot hear the
    mix, so say so and ask the user to watch it with sound. Offer `$PY tools/clean.py <slug>` to
    delete the rendered frames (several GB) once they are happy.

## Toolkit map

- `rbx/core.py` primitives, materials, `Cam` (push, orbit, crash, whip, track, handheld), `sfx`.
- `rbx/chars.py` R6 characters (`Char`, presets `eddie`, `kid(i)`...), hair styles incl.
  buzz/bun/tophat/pilot/bald, extras glasses/beard/collar/backpack.
- `rbx/acting.py` layered faces: `face(t, "shock")` or `face(t, eyes=, mouth=)`, `blink`,
  `talk` (lip flaps), `act(t, gesture)` with overshoot, `look`, `nod`, `shake`, `jump`, `run`,
  `panic`, `wiggle`, `breathe`. Gestures: idle shock hands_head hands_face cheer point point_l
  shrug recoil lean slump think cross phone reach push hold wave fists facepalm brace.
- `rbx/story.py` cast (eddie, leo, pickle, grandma, pilot, mayor, gus, townie), `laugh`, `drift`,
  `dangle`, `fly`, `look_at`, `facing`, `lips`, `class_scene`, `kids_float`, `sky_scene`,
  `cloud_ring`, `town_scene`, `crowd_src` + `crowd` (instanced crowds, cheap), `human_chain`,
  `confetti`, `stars_ring`, `spin`, `puff`.
- `rbx/world.py` (W): `sky`, `space_world`, `sun`, `cloud`, `classroom_day(board=)` (front-row
  desks `E_DESK`/`L_DESK`, hinged window), `town` (school + streets + playground; the area
  around (0,-30) is open street), `comedy_club`, `cockpit`, `tv_room`, `hallway_day`, props
  `pigeon dog car crater toupee`.
- `rbx/world2.py` (W2): `cat`, `airliner`, `cabin` (+`seat_root`), `earth`, `moon`,
  `astronaut_helmet`, `pepper_jail`, `flower_shop`, `parking_lot`, `seated_audience`, and the
  teleport kit `poof`, `vanish`, `appear`, `sneeze` (wind-up + CHOO + mist), `tomato`.
- Older sets in `rbx/sets.py` / `rbx/locs.py`: bedroom, mirrors, burning hallway, bathrooms,
  living room, dusk street, dark hall, school corridor, classroom (dim), fire FX in `rbx/fx.py`.
- Textures: `tools/make_textures2.py` (Pillow) writes signs/boards into `assets/tex`; add a
  function per new sign and use `kit.font("ariblk.ttf", size)` for fonts (works on any OS).
- `tools/analyze_inspo.py <folder> <out>`: pacing/cut/word-timing analysis of reference videos
  the user sends, to learn a pattern (never to copy a plot).

## Traps already hit (check these in every preview)

- **Camera inside a house / prop**: ground cameras in `town` must stay in the open area
  (x -40..40, y -55..10). Blank single-colour preview tiles almost always mean this.
- **Visibility keys on the same frame**: show/hide keys less than one frame apart collapse into
  one key and the object is hidden for the whole shot. `W2.vanish` keys one full frame earlier.
- **Prop scale**: a Roblox head is ~1.24 wide. Cats and props at 0.5-0.6 scale; never put a
  prop between the lens and the face.
- **Props riding on a character** (cat on head, hats): parent to `ch.head` (see `cat_on_head` in
  sneeze_teleport), never to `ch.root` with a guessed offset.
- **Poofs**: `s=0.6` indoors, 1.5-6 outdoors for vehicles.
- **Framing math**: visible width = 2 x distance x 6.75 / lens. Two characters 3 units apart
  need ~5.5 units of width (lens 20 at distance 8).
- **Brows under hair**: keep the fringe above the brow line or angry reads as "wide".
- **Tall buildings shadow the street**; the town keeps the centre low.
- **No custom attributes on bpy objects** (`obj.head = ...` fails): look things up by name.
- Sky looks pale under AgX: `W.sky()` defaults are already saturated, don't wash them out.
- Long Python in a shell heredoc can fail on Windows: write patch scripts to a file and run them.
