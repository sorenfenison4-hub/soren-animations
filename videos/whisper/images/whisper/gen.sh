#!/usr/bin/env bash
# gen.sh NAME ASPECT "PROMPT" [ref1.png] [ref2.png] - GPT Image 2.5 transparent cut-out in the guy's style.
#   COSTUME=1 uses the costume style block (same character design, but this character wears clothes).
set -euo pipefail
STYLE_CHAR="Flat 2D cartoon in exactly the same drawing style as the reference images: the same simple white character with a big round head, a small soft body, noodle arms with simple four-finger hands and short legs with rounded feet, thick smooth black outlines of even weight, flat white fill with a very soft pale-grey shade on one side, small solid black oval eyes, simple curved black eyebrows, no nose, no hair, no clothes, a pink tongue only when the mouth is open. Clean vector-like linework, flat colours, no texture, no text, no border. Isolated on a fully transparent background: no sky, no ground, no floor shadow."
STYLE_COSTUME="Flat 2D cartoon in exactly the same drawing style as the reference images: the same simple character design with a big round white head, small solid black oval eyes, simple curved black eyebrows, no nose, a small soft body, noodle arms with simple four-finger white hands and short legs with rounded white feet, thick smooth black outlines of even weight, flat colours with one very soft shade, a pink tongue only when the mouth is open. Clean vector-like linework, no texture, no text, no border. Isolated on a fully transparent background: no sky, no ground, no floor shadow."
NAME="$1"; ASPECT="$2"; PROMPT="$3"; shift 3
STYLE="$STYLE_CHAR"; [ "${COSTUME:-0}" = "1" ] && STYLE="$STYLE_COSTUME"
refs=(); for r in "$@"; do refs+=(--image "$r"); done
mkdir -p raw
higgsfield generate create gpt_image_2_5 --prompt "$PROMPT $STYLE" "${refs[@]}" \
  --aspect_ratio "$ASPECT" --resolution 4k --quality high --background transparent \
  --wait --wait-timeout 20m --json > "raw/$NAME.json"
url=$(node -e "console.log(JSON.parse(require('fs').readFileSync('raw/$NAME.json','utf8'))[0].result_url)")
curl -sS -o "raw/$NAME.png" "$url"
echo "raw/$NAME.png"
