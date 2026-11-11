# Why should you never whisper in a round room? (story Short)

71 s, 1080x1920 60 fps, 27 shots, in the format of the big animated-story channels: narrator + character voices, a cut or
snap zoom every ~2 s, word-by-word captions, a music bed. The king's advisor whispers his plan into the wall of a round
hall; the whisper slides around the curved wall to the sweeper 40 m away; nobody believes him; the crown is swapped for a
painted wooden one (it squeaks, a woodpecker moves in); the sweeper puts the king's ear to the far wall and the king hears
every word; a whispering-gallery explainer (St Paul's Cathedral, 34 m); the advisor scrubs the walls - "Stupid round
room." / "I heard that." - and it loops to the opening whisper.

- Voices: James (narrator), Callum - Husky Trickster (advisor), Timothy Pemberton Smythe (king), Alfwyn (sweeper),
  eleven_v4, one take each (`public/whisper/vo/*.mp3`); `scripts/assemble.py` cuts and joins them into
  `public/whisper/vo/dialogue.mp3` + `src/dialogue.json` (word times; Scribe transcripts in work/, not committed).
- Pictures: 12 Higgsfield GPT Image 2.5 cut-outs (`images/whisper/prompts.md`, `gen.sh`, `prep.py` -> `public/whisper/char`,
  `src/cast.json`); the king and the advisor are now in the kit's cast.
- Sounds: Higgsfield ElevenLabs Music v2.5 bed (`public/whisper/sfx/music.mp3`) + Seed Audio effects; kit sounds.
- `src/Whisper.tsx`: hall, crowns, woodpecker, whisper trail, inserts, captions, diagrams, shots; `src/Thumbs.tsx`.

    npm install
    node scripts/check-loop.mjs Whisper
    node scripts/render.mjs Whisper renders/whisper-1080x1920.mp4

The committed render had frames 580-950 re-rendered and spliced in (follow camera fixed: a key every frame) and its
sound re-rendered alone (dialogue loudness-matched); a full render of the current source gives the same video.
