#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 tools/fetch_trends.py
python3 tools/score.py
python3 tools/shopify_export.py
echo "daily refresh ok $(date -u +%Y-%m-%dT%H:%M:%SZ)"
