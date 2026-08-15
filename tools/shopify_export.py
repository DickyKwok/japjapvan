#!/usr/bin/env python3
"""Shopify product CSV from the shortlist (Handle, Title, Vendor, tags, price)."""

from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data" / "final_shortlist.csv"
OUT = ROOT / "data" / "shopify_import.csv"

FIELDS = [
    "Handle",
    "Title",
    "Vendor",
    "Type",
    "Tags",
    "Published",
    "Option1 Name",
    "Option1 Value",
    "Variant Price",
    "Variant Inventory Qty",
    "Variant Inventory Tracker",
    "Status",
]


def main() -> None:
    if not SRC.exists():
        raise SystemExit("Run tools/score.py first")
    rows = list(csv.DictReader(SRC.open()))
    out = []
    for r in rows:
        handle = r["id"]
        out.append(
            {
                "Handle": handle,
                "Title": f"{r['brand']} {r['name']}",
                "Vendor": r["brand"],
                "Type": r["category"],
                "Tags": f"japjapvan,{r['category']},preorder,{r['origin']},CAD,trends-listed",
                "Published": "true",
                "Option1 Name": "Title",
                "Option1 Value": "Default Title",
                "Variant Price": r["sell_cad"],
                "Variant Inventory Qty": "0",
                "Variant Inventory Tracker": "shopify",
                "Status": "active",
            }
        )
    with OUT.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(out)
    print(f"Wrote {len(out)} Shopify rows → {OUT}")


if __name__ == "__main__":
    main()
