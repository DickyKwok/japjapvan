#!/bin/sh
# Launch six Grok 4.6 headless research agents concurrently.
# Each prompt file tells the agent to write docs/research/0N-*.md via the write tool.
set -eu

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v grok >/dev/null 2>&1; then
  echo "grok is not on PATH" >&2
  exit 1
fi

mkdir -p docs/research/_logs

echo "wave1: six concurrent grok-4.6 jobs, cwd=$ROOT"

fail=0
for p in docs/prompts/wave1/*.md; do
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

echo "wave1: done. logs in docs/research/_logs/"
echo "expected notes:"
echo "  docs/research/01-unit-econ.md"
echo "  docs/research/02-demand-market.md"
echo "  docs/research/03-sourcing-hk.md"
echo "  docs/research/04-sourcing-jp.md"
echo "  docs/research/05-ops-compliance.md"
echo "  docs/research/06-competitor-intel.md"

if [ "$fail" -ne 0 ]; then
  echo "wave1: at least one grok job exited non-zero — check _logs/*.err" >&2
  exit 1
fi
