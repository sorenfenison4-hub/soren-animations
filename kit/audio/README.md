# Library audio: music beds and the 2026-11-24 sounds

Made with the last Higgsfield credits before the subscription ended (2026-11-24): ElevenLabs Music v2.5 beds
(`force_instrumental`, 40 s) and Seed Audio sound effects. Higgsfield is gone now - for a new sound use the library,
synthesize it in code (`videos/*/scripts/sfx_*.py`) or the ElevenLabs connector's `sfx` node (50 credits), then
run it through `prep_sfx.py` so it joins the library the same way. The ElevenLabs connector in these sessions has no
music (the full ElevenLabs connector, added by the user as a custom connector, has), so these six beds are the
only music at hand.

- `raw/music/*.mp3` + `raw/sfx/*.flac`: the untouched downloads (lossless FLAC for the sounds) with each job's record
  (`*.json`: prompt, job id). `prep_music.py` / `prep_sfx.py` turn them into `../public/library/music/*.mp3` and
  `../public/library/sfx/*.wav`; `build_readme.py` rewrites this file from the catalogs.
- Every new video copies `kit/`, so a cue is just `{f: 'lion_roar.wav', at: 2.4, db: -16}` (or
  `{f: 'library/music/curious.mp3', ...}` for a bed) in the SoundLayer cues.

## Music beds (`public/library/music/`)

All six are about 40 s, start on the first beat (no intro) and fade out at the end, leveled to -20 LUFS - the level of
the whisper Short's bed, which sat under the voice at a cue level of -24 dB. The animal Shorts run without music so
far: a bed is something to A/B test (e.g. `curious` under one upload, none under the next) before using it everywhere.
Use `keys` to dip it under lines and lift it in pauses: `{f: 'library/music/curious.mp3', at: 0, db: -24, keys: [[0, -24], [9.5, -24], [10, -19]]}`.

| File | Mood | BPM | Use for | Length |
|---|---|---|---|---|
| `curious.mp3` | playful, curious: pizzicato strings, glockenspiel, marimba, finger snaps, bouncy bass | 112 | the default "what if" bed: setup and facts | 40 s |
| `uhoh.mp3` | comedic suspense: low pizzicato, ticking woodblock, staccato bassoon, muted trumpet | 104 | the backfire / danger stretch | 40 s |
| `sneaky.mp3` | sneaky, mischievous: tiptoe pizzicato, clarinet + bassoon, brushed snare | 96 | a plan, a sneaky gag, an animal showing off | 40 s |
| `hero.mp3` | comedic superhero: brass fanfare stabs, driving drums, rushing strings | 132 | the power at its best (frame 0 / the wish) | 40 s |
| `dreamy.mp3` | calm, floaty: celesta, warm pad, harp arpeggios (swells every ~6 s) | 76 | underwater, night, sleep, space | 40 s |
| `happy.mp3` | sunny, carefree: ukulele, glockenspiel, claps, light kick | 120 | daily-life gags, a happy ending | 40 s |

## Sounds added on 2026-11-24 (`public/library/sfx/`, 46 files)

Peak -1 dBFS, leading silence cut to 5 ms. `onset` = first moment within 20 dB of the peak (put it on the beat:
`at: beat - onset`), `peak` = loudest moment, `hits` = start of every separate bark / thump / hit, all in seconds.
`level` = RMS of the loud part (dBFS): the louder it is, the lower the cue dB (impacts about -14 to -19 dB under a
voice, beds -26 to -33 dB). All were checked on spectrograms (each is the sound asked for, no speech), none by ear.

### Animals (co-star voices)

| File | What it is | Length | Onset | Peak | Hits | Level |
|---|---|---|---|---|---|---|
| `owl_hoot.wav` | two soft hoots | 3.34 | 0.19 | 0.39 | 0.2, 2.45 | -8 |
| `lion_roar.wav` | one big roar, a smaller second one, long low tail | 3.76 | 0.23 | 0.62 | 0.32 | -12 |
| `bear_roar.wav` | a growl, then grunts | 3.28 | 0.02 | 0.65 | 0.03, 2.88 | -12 |
| `gorilla.wav` | chest thumps (0-2 s), then a low grunt | 2.82 | 0.01 | 0.06 | 0.03, 0.37, 2.32 | -6 |
| `monkey.wav` | ooh-ooh calls, then screeches | 3.82 | 0.01 | 2.26 | 0.01, 0.38, 0.8, 0.92, 1.54, 2.15, 2.66, 3.03 | -12 |
| `dog_bark.wav` | three barks | 3.21 | 0.04 | 1.43 | 0.03, 1.34, 2.58 | -11 |
| `cat_hiss.wav` | a steady angry hiss | 2.91 | 0.01 | 0.22 | 0.01 | -13 |
| `cat_purr.wav` | a loud steady purr (a bed: loop it) | 4.81 | 0.01 | 2.86 | 0, 2.74 | -14 |
| `frog_croak.wav` | three ribbit bursts over a faint tone | 3.30 | 0.01 | 0.18 | 0.03, 0.11, 0.3, 1.61, 1.71, 1.9, 3.11 | -14 |
| `eagle_cry.wav` | one long falling cry | 3.15 | 0.02 | 0.85 | 0.1 | -11 |
| `crocodile.wav` | a low hiss, then the jaw SNAP (use hits[0]) | 3.28 | 1.28 | 2.19 | 2.15 | -12 |
| `whale_song.wav` | low moans; fades out at the end | 7.32 | 0.01 | 7.03 | 0.42, 5.9 | -13 |
| `sea_lion.wav` | four barks | 2.98 | 0.03 | 0.07 | 0.03, 0.88, 1.91, 2.69 | -12 |
| `dolphin.wav` | a burst, a click train, then whistles | 3.92 | 0.01 | 0.64 | 0, 0.62, 0.71, 0.81, 0.88, 1, 1.08, 1.15 ... | -16 |
| `wolf_howl.wav` | one long howl | 5.16 | 0.01 | 0.32 | 0.07 | -8 |
| `rattlesnake.wav` | a dry fast rattle | 4.41 | 0.01 | 0.82 | 0, 0.21, 0.65, 0.69, 0.77, 0.81, 0.92, 0.95 ... | -14 |
| `bee_buzz.wav` | a bumblebee buzzing past | 4.31 | 0.02 | 0.02 | 0.01 | -15 |
| `mosquito.wav` | a close whine | 4.50 | 0.10 | 3.34 | 0.09 | -16 |
| `horse_neigh.wav` | one neigh | 3.31 | 0.34 | 1.46 | 0.36 | -12 |
| `seagulls.wav` | gull calls at a beach | 4.32 | 0.01 | 0.98 | 0.68, 0.86, 1.23, 1.52, 2.09, 3.41 | -15 |
| `cow_moo.wav` | one long moo | 3.06 | 0.36 | 2.27 | 0.62 | -11 |
| `chicken.wav` | clucks and bawks | 3.81 | 0.17 | 3.05 | 0.31, 0.81, 1, 1.54, 1.73, 2.43, 2.58, 2.74 ... | -13 |

### People and crowds

| File | What it is | Length | Onset | Peak | Hits | Level |
|---|---|---|---|---|---|---|
| `crowd_ooh.wav` | small crowd "oooh", impressed | 3.30 | 0.41 | 1.39 | 0.72 | -14 |
| `crowd_aww.wav` | small crowd "awww" | 1.57 | 0.01 | 0.38 | 0.06 | -14 |
| `crowd_gasp.wav` | crowd gasp | 2.22 | 0.11 | 0.50 | 0.19 | -14 |
| `crowd_cheer.wav` | cheering + clapping | 4.27 | 0.03 | 1.99 | 0.12, 0.3, 1.98, 2.12, 2.65, 2.72, 2.9, 2.95 ... | -17 |
| `kids_laugh.wav` | kids laughing | 3.82 | 0.15 | 1.16 | 0.3 | -15 |
| `sneeze.wav` | ah... ah... CHOO | 2.38 | 0.01 | 0.07 | 0.01, 0.38, 1.51, 2.04 | -12 |
| `yawn.wav` | a long yawn | 3.24 | 0.06 | 0.31 | 0.07, 2.39 | -8 |

### Comedy stings

| File | What it is | Length | Onset | Peak | Hits | Level |
|---|---|---|---|---|---|---|
| `sad_trombone.wav` | wah-wah notes (7 hits); cut one wah-wah-wah-wahhh with from/to | 4.31 | 0.01 | 0.53 | 0.01, 0.48, 0.91, 1.47, 1.96, 2.44, 3.8 | -12 |
| `rimshot.wav` | ba-dum ... tss (cymbal at the third hit) | 1.51 | 0.01 | 0.13 | 0, 0.12, 1.13 | -14 |
| `tada.wav` | two brass chords | 1.10 | 0.01 | 0.07 | 0.01, 0.4 | -12 |
| `record_scratch.wav` | scratches, stop | 3.49 | 0.01 | 1.95 | 0.04, 0.62, 1.92 | -11 |
| `drumroll.wav` | snare roll into a crash (the crash = peak) | 4.31 | 0.01 | 3.56 | 0, 0.25, 0.36, 0.49, 0.75, 0.86, 0.99, 1.25 ... | -15 |
| `slide_up.wav` | rises until ~0.5 s, then falls back: to 0.5 for up only | 1.33 | 0.08 | 0.35 | 0.13 | -9 |
| `slide_down.wav` | a quick rise, then the long fall | 1.45 | 0.06 | 0.14 | 0.07 | -11 |
| `dizzy_birds.wav` | tweets circling a dizzy head | 3.31 | 0.04 | 1.15 | 0.11, 0.22, 0.32, 0.43, 0.51, 0.6, 0.72, 0.83 ... | -12 |
| `splat.wav` | a pie splat + drips | 3.29 | 0.01 | 0.08 | 0.03 | -9 |
| `heartbeat_fast.wav` | about 130 bpm, bass-heavy: faint on phone speakers, play it loud | 5.32 | 0.01 | 4.61 | 0.01, 0.33, 0.48, 0.8, 0.95, 1.27, 1.4, 1.74 ... | -9 |

### Counters, X-rays and the notebook

| File | What it is | Length | Onset | Peak | Hits | Level |
|---|---|---|---|---|---|---|
| `scanner.wav` | a rising hum, beep at the end (peak): start an X-ray panel with it | 2.46 | 1.21 | 2.14 | 1.72 | -14 |
| `correct.wav` | game-show "right" chime | 1.52 | 0.01 | 0.17 | 0 | -10 |
| `wrong.wav` | game-show buzzer, then a falling wah | 2.29 | 0.01 | 0.82 | 0 | -10 |
| `page_flip.wav` | a notebook page flips (a scene change in the notebook style) | 0.97 | 0.39 | 0.53 | 0.4, 0.5, 0.61 | -15 |

### Weather and impacts

| File | What it is | Length | Onset | Peak | Hits | Level |
|---|---|---|---|---|---|---|
| `thunder.wav` | a crack, then a long rumble | 5.13 | 0.07 | 0.35 | 0.14, 2.38, 3.61 | -15 |
| `ice_crack.wav` | ice crackling as it freezes | 3.43 | 0.00 | 0.09 | 0.07, 0.29, 0.39, 0.51, 0.75, 0.92, 1.98, 2.04 ... | -15 |
| `sizzle.wav` | frying sizzle (overheating, a bed) | 4.32 | 0.01 | 1.60 | 0 | -17 |
