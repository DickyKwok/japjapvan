#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 tools/fetch_rising.py || true
python3 tools/discover_products.py || true
python3 tools/fetch_live_signals.py || true
python3 tools/fetch_trends.py || true
python3 tools/score.py || true
python3 tools/shopify_export.py || true
echo "daily refresh ok $(date -u +%Y-%m-%dT%H:%M:%SZ)"
