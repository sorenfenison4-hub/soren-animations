# One command for the voice step, in the house order: speed up 1.25x, cut the silences, THEN timestamp.
#   python tools/voice_run.py --video <slug> --voice videos/<slug>/audio/raw.mp3 [--speed 1.25]
import argparse, os, shutil, subprocess, sys
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
ap = argparse.ArgumentParser(); ap.add_argument('--video', required=True); ap.add_argument('--voice', required=True); ap.add_argument('--speed', type=float, default=1.25)
o = ap.parse_args()
adir = os.path.join(ROOT, 'videos', o.video, 'audio'); os.makedirs(adir, exist_ok=True)
fast, trimmed = os.path.join(adir, 'raw_fast.wav'), os.path.join(adir, 'trimmed.wav')
voice_py = [sys.executable, os.path.join(ROOT, 'tools', 'voice.py'), '--video', o.video]
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', o.voice, '-af', f'atempo={o.speed}', '-ar', '48000', '-ac', '1', fast], check=True)
subprocess.run(voice_py + ['--voice', fast, '--force'], check=True)                  # pass 1: find and cut the pauses
shutil.copyfile(os.path.join(adir, 'voice.wav'), trimmed)
subprocess.run(voice_py + ['--voice', trimmed, '--no-trim', '--force'], check=True)  # pass 2: time the words on the cut audio
print(f'voice ready: {os.path.join(adir, "voice.wav")} (x{o.speed}, silences cut, then timestamped)')
