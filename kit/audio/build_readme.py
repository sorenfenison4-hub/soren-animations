#!/usr/bin/env python3
"""Writes README.md (the catalog of public/library/music and the sounds added on 2026-11-24) from music_catalog.json,
sfx_catalog.json and the notes below. Run from kit/audio after prep_music.py / prep_sfx.py."""
import json

music = json.load(open('music_catalog.json'))
sfx = json.load(open('sfx_catalog.json'))
MUSIC = {   # name: (mood, tempo, where it fits)
    'curious': ('playful, curious: pizzicato strings, glockenspiel, marimba, finger snaps, bouncy bass', '112',
                'the default "what if" bed: setup and facts'),
    'uhoh': ('comedic suspense: low pizzicato, ticking woodblock, staccato bassoon, muted trumpet', '104',
             'the backfire / danger stretch'),
    'sneaky': ('sneaky, mischievous: tiptoe pizzicato, clarinet + bassoon, brushed snare', '96',
               'a plan, a sneaky gag, an animal showing off'),
    'hero': ('comedic superhero: brass fanfare stabs, driving drums, rushing strings', '132',
             'the power at its best (frame 0 / the wish)'),
    'dreamy': ('calm, floaty: celesta, warm pad, harp arpeggios (swells every ~6 s)', '76',
               'underwater, night, sleep, space'),
    'happy': ('sunny, carefree: ukulele, glockenspiel, claps, light kick', '120',
              'daily-life gags, a happy ending'),
}
GROUPS = [
    ('Animals (co-star voices)', ['owl_hoot', 'lion_roar', 'bear_roar', 'gorilla', 'monkey', 'dog_bark', 'cat_hiss', 'cat_purr',
                                  'frog_croak', 'eagle_cry', 'crocodile', 'whale_song', 'sea_lion', 'dolphin', 'wolf_howl',
                                  'rattlesnake', 'bee_buzz', 'mosquito', 'horse_neigh', 'seagulls', 'cow_moo', 'chicken']),
    ('People and crowds', ['crowd_ooh', 'crowd_aww', 'crowd_gasp', 'crowd_cheer', 'kids_laugh', 'sneeze', 'yawn']),
    ('Comedy stings', ['sad_trombone', 'rimshot', 'tada', 'record_scratch', 'drumroll', 'slide_up', 'slide_down', 'dizzy_birds',
                       'splat', 'heartbeat_fast']),
    ('Counters, X-rays and the notebook', ['scanner', 'correct', 'wrong', 'page_flip']),
    ('Weather and impacts', ['thunder', 'ice_crack', 'sizzle']),
]
NOTE = {
    'owl_hoot': 'two soft hoots', 'lion_roar': 'one big roar, a smaller second one, long low tail',
    'bear_roar': 'a growl, then grunts', 'gorilla': 'chest thumps (0-2 s), then a low grunt',
    'monkey': 'ooh-ooh calls, then screeches', 'dog_bark': 'three barks', 'cat_hiss': 'a steady angry hiss',
    'cat_purr': 'a loud steady purr (a bed: loop it)', 'frog_croak': 'three ribbit bursts over a faint tone',
    'eagle_cry': 'one long falling cry', 'crocodile': 'a low hiss, then the jaw SNAP (use hits[0])',
    'whale_song': 'low moans; fades out at the end', 'sea_lion': 'four barks', 'dolphin': 'a burst, a click train, then whistles',
    'wolf_howl': 'one long howl', 'rattlesnake': 'a dry fast rattle', 'bee_buzz': 'a bumblebee buzzing past',
    'mosquito': 'a close whine', 'horse_neigh': 'one neigh', 'seagulls': 'gull calls at a beach', 'cow_moo': 'one long moo',
    'chicken': 'clucks and bawks', 'crowd_ooh': 'small crowd "oooh", impressed', 'crowd_aww': 'small crowd "awww"',
    'crowd_gasp': 'crowd gasp', 'crowd_cheer': 'cheering + clapping', 'kids_laugh': 'kids laughing',
    'sneeze': 'ah... ah... CHOO', 'yawn': 'a long yawn',
    'sad_trombone': 'wah-wah notes (7 hits); cut one wah-wah-wah-wahhh with from/to',
    'rimshot': 'ba-dum ... tss (cymbal at the third hit)', 'tada': 'two brass chords', 'record_scratch': 'scratches, stop',
    'drumroll': 'snare roll into a crash (the crash = peak)', 'slide_up': 'rises until ~0.5 s, then falls back: to 0.5 for up only',
    'slide_down': 'a quick rise, then the long fall', 'dizzy_birds': 'tweets circling a dizzy head',
    'splat': 'a pie splat + drips', 'heartbeat_fast': 'about 130 bpm, bass-heavy: faint on phone speakers, play it loud',
    'scanner': 'a rising hum, beep at the end (peak): start an X-ray panel with it',
    'correct': 'game-show "right" chime', 'wrong': 'game-show buzzer, then a falling wah',
    'page_flip': 'a notebook page flips (a scene change in the notebook style)', 'thunder': 'a crack, then a long rumble',
    'ice_crack': 'ice crackling as it freezes', 'sizzle': 'frying sizzle (overheating, a bed)',
}
L = ['# Library audio: music beds and the 2026-11-24 sounds', '',
     'Made with the last Higgsfield credits before the subscription ended (2026-11-24): ElevenLabs Music v2.5 beds',
     '(`force_instrumental`, 40 s) and Seed Audio sound effects. Higgsfield is gone now - for a new sound use the library,',
     'synthesize it in code (`videos/*/scripts/sfx_*.py`) or the ElevenLabs connector\'s `sfx` node (50 credits), then',
     'run it through `prep_sfx.py` so it joins the library the same way. The ElevenLabs connector in these sessions has no',
     'music (the full ElevenLabs connector, added by the user as a custom connector, has), so these six beds are the',
     'only music at hand.', '',
     '- `raw/music/*.mp3` + `raw/sfx/*.flac`: the untouched downloads (lossless FLAC for the sounds) with each job\'s record',
     '  (`*.json`: prompt, job id). `prep_music.py` / `prep_sfx.py` turn them into `../public/library/music/*.mp3` and',
     '  `../public/library/sfx/*.wav`; `build_readme.py` rewrites this file from the catalogs.',
     '- Every new video copies `kit/`, so a cue is just `{f: \'lion_roar.wav\', at: 2.4, db: -16}` (or',
     '  `{f: \'library/music/curious.mp3\', ...}` for a bed) in the SoundLayer cues.', '',
     '## Music beds (`public/library/music/`)', '',
     'All six are about 40 s, start on the first beat (no intro) and fade out at the end, leveled to -20 LUFS - the level of',
     'the whisper Short\'s bed, which sat under the voice at a cue level of -24 dB. The animal Shorts run without music so',
     'far: a bed is something to A/B test (e.g. `curious` under one upload, none under the next) before using it everywhere.',
     'Use `keys` to dip it under lines and lift it in pauses: `{f: \'library/music/curious.mp3\', at: 0, db: -24, keys: [[0, -24], [9.5, -24], [10, -19]]}`.', '',
     '| File | Mood | BPM | Use for | Length |', '|---|---|---|---|---|']
for n, (mood, bpm, use) in MUSIC.items():
    L.append(f'| `{n}.mp3` | {mood} | {bpm} | {use} | {music[n]["dur"]:.0f} s |')
L += ['', '## Sounds added on 2026-11-24 (`public/library/sfx/`, 46 files)', '',
      'Peak -1 dBFS, leading silence cut to 5 ms. `onset` = first moment within 20 dB of the peak (put it on the beat:',
      '`at: beat - onset`), `peak` = loudest moment, `hits` = start of every separate bark / thump / hit, all in seconds.',
      '`level` = RMS of the loud part (dBFS): the louder it is, the lower the cue dB (impacts about -14 to -19 dB under a',
      'voice, beds -26 to -33 dB). All were checked on spectrograms (each is the sound asked for, no speech), none by ear.', '']
for title, names in GROUPS:
    L += [f'### {title}', '', '| File | What it is | Length | Onset | Peak | Hits | Level |', '|---|---|---|---|---|---|---|']
    for n in names:
        c = sfx[n]; hits = ', '.join(f'{h:g}' for h in c['hits'][:8]) + (' ...' if len(c['hits']) > 8 else '')
        L.append(f'| `{n}.wav` | {NOTE[n]} | {c["dur"]:.2f} | {c["onset"]:.2f} | {c["peak"]:.2f} | {hits} | {c["rms_db"]:.0f} |')
    L.append('')
missing = set(sfx) - {n for _, ns in GROUPS for n in ns}
assert not missing, missing
open('README.md', 'w').write('\n'.join(L))
print('README.md', len(L), 'lines')
