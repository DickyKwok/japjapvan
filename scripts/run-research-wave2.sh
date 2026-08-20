#!/bin/sh
# Launch three Grok 4.6 synthesizers concurrently.
# Requires wave-1 research notes to exist.
set -eu

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v grok >/dev/null 2>&1; then
  echo "grok is not on PATH" >&2
  exit 1
fi

missing=0
for f in \
  docs/research/_shared-facts.md \
  docs/research/01-unit-econ.md \
  docs/research/02-demand-market.md \
  docs/research/03-sourcing-hk.md \
  docs/research/04-sourcing-jp.md \
  docs/research/05-ops-compliance.md \
  docs/research/06-competitor-intel.md \
  docs/hk-ca-tax-price-advantage-2026.md
do
  if [ ! -s "$f" ]; then
    echo "wave2 blocked: missing or empty $f" >&2
    missing=1
  fi
done
if [ "$missing" -ne 0 ]; then
  echo "run scripts/run-research-wave1.sh first and wait until the six notes exist." >&2
  exit 1
fi

mkdir -p docs/research/_logs

echo "wave2: three concurrent grok-4.6 jobs, cwd=$ROOT"

fail=0
for p in docs/prompts/wave2/*.md; do
  name="$(basename "$p" .md)"
  echo "  start $name"
  grok --prompt-file "$p" \
    -m grok-4.6 \
    --cwd "$ROOT" \
    --yolo \
    --no-plan \
    --no-subagents \
    --output-format json \
    >"docs/research/_logs/${name}.json" \
    2>"docs/research/_logs/${name}.err" &
done

for pid in $(jobs -p); do
  if ! wait "$pid"; then
    fail=1
  fi
done

echo "wave2: done. expected user-facing docs:"
echo "  docs/feasibility-harvard-econ.md"
echo "  docs/sourcing-channels.md"
echo "  docs/zero-to-one-story.md"

if [ "$fail" -ne 0 ]; then
  echo "wave2: at least one grok job exited non-zero — check _logs/*.err" >&2
  exit 1
fi
