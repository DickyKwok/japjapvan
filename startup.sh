#!/bin/sh
set -eu
cd /workspace

LOCK=/tmp/japjapvan-cron.pid
if [ ! -f "$LOCK" ] || ! kill -0 "$(cat "$LOCK")" 2>/dev/null; then
  node /workspace/tools/cron-daemon.mjs >>/tmp/japjapvan-cron.log 2>&1 &
  echo $! > "$LOCK"
fi

if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >>/tmp/app-startup.log 2>&1 &
