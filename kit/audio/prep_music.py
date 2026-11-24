#!/usr/bin/env python3
"""Level the raw music beds into the library (run from kit/audio):
    python3 prep_music.py [name ...]      (no names = every raw/music/*.mp3)
raw/music/<name>.mp3 -> ../public/library/music/<name>.mp3: leading silence cut, two-pass loudnorm to -20 LUFS
(true peak -1.5 dBTP, linear gain so the mix is untouched), 192 kb/s. -20 LUFS matches the whisper Short's bed, which
sat under the voice at a cue level of -24 dB; measurements go to music_catalog.json. Needs ffmpeg.
"""
import glob, json, os, re, subprocess, sys

TARGET = -20.0
names = sys.argv[1:] or sorted(os.path.basename(f)[:-4] for f in glob.glob('raw/music/*.mp3'))
cat_path = 'music_catalog.json'
cat = json.load(open(cat_path)) if os.path.exists(cat_path) else {}
os.makedirs('../public/library/music', exist_ok=True)
for name in names:
    src, out = f'raw/music/{name}.mp3', f'../public/library/music/{name}.mp3'
    pre = f'silenceremove=start_periods=1:start_threshold=-50dB,'
    m = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', src, '-af', pre + f'loudnorm=I={TARGET}:TP=-1.5:LRA=11:print_format=json',
                        '-f', 'null', '-'], capture_output=True, text=True).stderr
    j = json.loads(re.findall(r'\{[^{}]*\}', m)[-1])
    ln = (f"loudnorm=I={TARGET}:TP=-1.5:LRA=11:linear=true:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
          f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', pre + ln + ',aresample=44100', '-c:a', 'libmp3lame', '-b:a', '192k', out], check=True)
    chk = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', out, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    lufs = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', chk)[-1])
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out],
                               capture_output=True, text=True).stdout)
    prompt = json.load(open(f'raw/music/{name}.json'))[0]['params'].get('prompt', '') if os.path.exists(f'raw/music/{name}.json') else ''
    cat[name] = {'dur': round(dur, 2), 'lufs': lufs, 'prompt': prompt}
    print(name, cat[name]['dur'], lufs)
json.dump(dict(sorted(cat.items())), open(cat_path, 'w'), indent=1)
