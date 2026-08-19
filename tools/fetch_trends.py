#!/usr/bin/env python3
"""Live Google Trends is pulled by tools/pull-google-trends.mjs (no seed series)."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    cmd = ["node", str(ROOT / "tools" / "pull-google-trends.mjs"), *sys.argv[1:]]
    raise SystemExit(subprocess.call(cmd, cwd=ROOT))


if __name__ == "__main__":
    main()
