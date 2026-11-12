"""Analyse a folder of reference videos: transcript + word timings, cuts, pacing, silence, hook sheets.
Run with the faster-whisper python:  <whisper python> analyze_inspo.py <folder> <out_dir>"""
import json, os, subprocess, sys, re
import numpy as np

src_dir, out_dir = sys.argv[1], sys.argv[2]
os.makedirs(out_dir, exist_ok=True)
from faster_whisper import WhisperModel
try:
    model = WhisperModel("medium.en", device="cuda", compute_type="float16")
except Exception as e:
    print("cuda failed, cpu", e)
    model = WhisperModel("small.en", device="cpu", compute_type="int8")


def cuts(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-vf", "scale=270:-2,scdet=threshold=10:sc_pass=0",
                        "-an", "-f", "null", "-"], capture_output=True, text=True)
    return [float(t) for t in re.findall(r"lavfi\.scd\.time: ([\d.]+)", r.stderr)]


summary = []
for fn in sorted(os.listdir(src_dir)):
    if not fn.lower().endswith(".mp4"):
        continue
    name = os.path.splitext(fn)[0].replace(" ", "_").replace("(", "").replace(")", "")
    path = os.path.join(src_dir, fn)
    od = os.path.join(out_dir, name); os.makedirs(od, exist_ok=True)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                               capture_output=True, text=True).stdout.strip())
    wav = os.path.join(od, "audio16k.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
    pcm = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', wav, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'],
                                   stdout=subprocess.PIPE, check=True).stdout, np.float32).copy()  # not PyAV (see voice.load16k)
    segs, info = model.transcribe(pcm, word_timestamps=True, beam_size=5)
    words, text = [], []
    for s in segs:
        text.append(s.text.strip())
        for w in s.words:
            words.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)})
    json.dump({"text": " ".join(text), "words": words}, open(os.path.join(od, "words.json"), "w"), indent=1)
    c = cuts(path)
    open(os.path.join(od, "cuts.txt"), "w").write("\n".join(f"{t:.3f}" for t in c))
    # pacing metrics
    speech = (words[-1]["e"] - words[0]["s"]) if words else dur
    gaps = [words[i + 1]["s"] - words[i]["e"] for i in range(len(words) - 1)]
    hook_words = [w for w in words if w["s"] < 15]
    hook_cuts = [t for t in c if t < 15]
    shot_lens = np.diff([0] + c + [dur])
    m = dict(file=fn, duration=round(dur, 1), words=len(words), wpm=round(len(words) / speech * 60, 1),
             hook_words_15s=len(hook_words), hook_wpm=round(len(hook_words) / 15 * 60, 1),
             cuts=len(c), cuts_per_min=round(len(c) / dur * 60, 1), hook_cuts_15s=len(hook_cuts),
             avg_shot_s=round(float(np.mean(shot_lens)), 2), median_shot_s=round(float(np.median(shot_lens)), 2),
             first_word_at=words[0]["s"] if words else None,
             gaps_over_0_3s=sum(1 for g in gaps if g > 0.3), gaps_over_0_6s=sum(1 for g in gaps if g > 0.6),
             median_gap=round(float(np.median(gaps)), 3) if gaps else None,
             hook_text=" ".join(w["w"] for w in hook_words))
    json.dump(m, open(os.path.join(od, "metrics.json"), "w"), indent=1)
    summary.append(m)
    # hook sheet: 0-15s every 0.5s (30 tiles) + full video sheet every 2s
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-t", "15", "-i", path, "-vf", "fps=2,scale=144:-2,tile=10x3",
                    "-frames:v", "1", os.path.join(od, "hook_sheet.jpg")], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vf", "fps=0.5,scale=108:-2,tile=12x6",
                    "-frames:v", "1", os.path.join(od, "full_sheet.jpg")], check=True)
    print(json.dumps({k: v for k, v in m.items() if k != "hook_text"}), flush=True)
json.dump(summary, open(os.path.join(out_dir, "summary.json"), "w"), indent=1)
