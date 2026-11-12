"""ElevenLabs over the plain API, for machines without the ElevenLabs connector.
    python tools/eleven.py tts <slug>              videos/<slug>/script.txt -> videos/<slug>/audio/raw.mp3
    python tools/eleven.py sfx <name> "<prompt>"   -> sfx/raw/<name>.mp3 (then run tools/sfxprep.py)
    python tools/eleven.py check                   key present + voice reachable (free call)
Key: env ELEVENLABS_API_KEY, or a line  ELEVENLABS_API_KEY=...  in .env next to config.json.
Voice and models: config.json voice_id, tts_model, sfx_model. The key is never printed."""
import json, os, sys, urllib.error, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kit

API = "https://api.elevenlabs.io/v1"


def call(path, body=None, accept="audio/mpeg"):
    key = kit.api_key()
    if not key:
        sys.exit("No ElevenLabs key. Put  ELEVENLABS_API_KEY=your_key  in " + os.path.join(kit.STUDIO, ".env")
                 + "  (or set the environment variable), then run this again.")
    req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body is not None else None,
                                 method="POST" if body is not None else "GET",
                                 headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": accept})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        msg = e.read().decode("utf-8", "replace")[:600]
        hint = ""
        if e.code == 401:
            hint = "\n(the key was rejected: check it in .env)"
        elif "voice" in msg.lower() and ("not found" in msg.lower() or "does not exist" in msg.lower()):
            hint = "\n(add this voice to your ElevenLabs account from the Voice Library, or set your own voice_id in config.json)"
        elif "quota" in msg.lower() or "credits" in msg.lower():
            hint = "\n(not enough ElevenLabs credits on this account)"
        sys.exit(f"ElevenLabs error {e.code}: {msg}{hint}")


def script_text(slug):
    p = os.path.join(kit.STUDIO, "videos", slug, "script.txt")
    lines = [l.strip() for l in open(p, encoding="utf-8") if l.strip() and not l.lstrip().startswith("#")]
    return "\n".join(lines)


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    c = kit.cfg()
    what = sys.argv[1]
    if what == "check":
        info = json.loads(call(f"/voices/{c['voice_id']}", accept="application/json"))
        print(f"key ok, voice ok: {info.get('name', c['voice_id'])}")
    elif what == "tts":
        slug = sys.argv[2]
        text = script_text(slug)
        out = os.path.join(kit.STUDIO, "videos", slug, "audio", "raw.mp3")
        os.makedirs(os.path.dirname(out), exist_ok=True)
        print(f"generating voice: {len(text)} characters (~{len(text)} credits), model {c['tts_model']}")
        audio = call(f"/text-to-speech/{c['voice_id']}?output_format=mp3_44100_128",
                     {"text": text, "model_id": c["tts_model"]})
        open(out, "wb").write(audio)
        print(f"wrote {out} ({len(audio) // 1024} KB)")
    elif what == "sfx":
        name, prompt = sys.argv[2], " ".join(sys.argv[3:])
        out = os.path.join(kit.STUDIO, "sfx", "raw", name + ".mp3")
        os.makedirs(os.path.dirname(out), exist_ok=True)
        audio = call("/sound-generation", {"text": prompt, "model_id": c["sfx_model"], "prompt_influence": 0.5})
        open(out, "wb").write(audio)
        print(f"wrote {out} ({len(audio) // 1024} KB). Next: python tools/sfxprep.py {os.path.relpath(out, kit.STUDIO)} sfx/{name}.wav")
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
