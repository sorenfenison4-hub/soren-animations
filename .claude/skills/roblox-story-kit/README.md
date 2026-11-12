# Roblox Story Kit

Makes original Roblox-style 3D story shorts (9:16, 60-120s) from one sentence:
"make a roblox story about hiccups making you shrink". Claude writes the script, gets the voice
from ElevenLabs, cuts the silences, builds every shot in Blender (blocky characters, sets, fast
camera moves), renders, adds sound effects, music and captions, and hands you an mp4.

## What you need

- **Claude Code** (the desktop app's Code tab or the terminal version).
- **Blender 5.2 or newer**: free from blender.org.
- **ffmpeg**: Windows `winget install --id Gyan.FFmpeg -e`, Mac `brew install ffmpeg`.
- **Python 3.10 to 3.13**: from python.org (Windows: tick "Add python to PATH").
- **ElevenLabs** for the voice: either the ElevenLabs connector in Claude, or an API key.
  A video uses about 2,000 credits.
- A computer with a decent graphics card. A 70s video renders in about an hour on a gaming
  laptop, and much slower without a GPU. Each video uses ~5 GB of disk while rendering. The
  kit can delete that afterwards.

## Install (5 minutes)

1. Unzip this folder into your Claude skills folder so the path is:
   - Windows: `C:\Users\<you>\.claude\skills\roblox-story-kit\SKILL.md`
   - Mac: `~/.claude/skills/roblox-story-kit/SKILL.md`
2. Open Claude Code and say: **"set up the roblox kit"**. It runs `setup.py`, which creates
   `~/RobloxStories`, installs what it needs, downloads the music and test-renders one frame.
   If something is missing it tells you the one command to fix it.
3. If you use an API key instead of the connector, open `~/RobloxStories/.env`, remove the `#`
   on the last line, and paste your key after `=`. Don't paste keys into the chat.

## Use

- "make a roblox story about \<idea\>": Claude shows you the script first, then makes the video.
- "give me 10 roblox story ideas"
- "render the example video": makes one of the two included videos with no credits, to see
  the system work.

Finished videos land in `~/RobloxStories/videos/<name>/out/`:
- `final.mp4` is the full-quality upload file.
- `final_phone.mp4` is a smaller copy for your phone.

## Settings (`~/RobloxStories/config.json`)

- `voice_id`: the ElevenLabs narrator voice. Put your own voice's id here if you want.
- `music_mode`: `tempo` keeps the music's pitch (default), `speed` pitches it up.
- `blender`: the path to Blender, if setup couldn't find it.
- To use different music, put any audio file in `~/RobloxStories/music/` (the first one is used).

## Updating

Unzip the new version over the old skill folder, then say "update the roblox kit" (it runs
`setup.py --update`). Your videos and settings are kept.
