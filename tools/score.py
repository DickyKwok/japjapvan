#!/usr/bin/env python3
"""Score catalog and emit a 15–25 SKU shortlist with one-brand-first greedy pick."""

from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "candidates.csv"
OUT = ROOT / "data" / "scored_products.csv"
SHORT = ROOT / "data" / "final_shortlist.csv"

WEIGHTS = {
    "trends": 0.25,
    "margin": 0.20,
    "shipping": 0.15,
    "regulatory": 0.10,
    "uniqueness": 0.10,
    "repeat": 0.10,
    "brand": 0.10,
}


def clamp(n: float) -> float:
    return max(0.0, min(1.0, n))


def score(row: dict, brand_count: dict[str, int]) -> float:
    sell = float(row["sell_cad"])
    landed = float(row["landed_cad"])
    margin = (sell - landed) / sell if sell else 0
    demand = float(row["ca_trend"]) / 100
    source = max(float(row["jp_trend"]), float(row["hk_trend"])) / 100
    t = clamp(demand * 0.45 + source * 0.2 + max(0, float(row["ca_trend"]) - 20) / 80 * 0.35)
    if row.get("rising", "").lower() in {"1", "true", "yes"}:
        t = clamp(t + 0.08)
    m = clamp((margin - 0.28) / 0.42)
    bulky = float(row["bulky"])
    weight = float(row["weight_g"])
    s = clamp((1 - (bulky - 1) / 9) * 0.6 + (1 - min(weight, 1200) / 1200) * 0.4)
    r = {"food": 0.35, "cnf": 0.72}.get(row["regulatory"], 1.0)
    u = float(row["uniqueness"]) / 10
    rp = float(row["repeat"]) / 10
    b = clamp(1 - max(0, brand_count.get(row["brand"], 1) - 1) * 0.35)
    return (
        t * WEIGHTS["trends"]
        + m * WEIGHTS["margin"]
        + s * WEIGHTS["shipping"]
        + r * WEIGHTS["regulatory"]
        + u * WEIGHTS["uniqueness"]
        + rp * WEIGHTS["repeat"]
        + b * WEIGHTS["brand"]
    )


def suggested_qty(row: dict, cover: float = 5) -> int:
    vel = float(row["weekly_velocity"])
    need = vel * cover + float(row["preorders"]) - float(row["stock"]) - float(row["incoming"])
    raw = max(0, int(need + 0.999))
    moq = int(row["moq"])
    if raw == 0:
        return 0
    return max(moq, ((raw + moq - 1) // moq) * moq)


def main(target: int = 20) -> None:
    rows = list(csv.DictReader(DATA.open()))
    remaining = rows[:]
    brands: dict[str, int] = {}
    picked: list[dict] = []
    while remaining and len(picked) < target:
        best = None
        best_s = -1.0
        for row in remaining:
            nxt = dict(brands)
            nxt[row["brand"]] = nxt.get(row["brand"], 0) + 1
            s = score(row, nxt)
            if s > best_s:
                best, best_s = row, s
        assert best
        brands[best["brand"]] = brands.get(best["brand"], 0) + 1
        picked.append({**best, "score": f"{best_s:.4f}", "selected": "1", "buy_qty": str(suggested_qty(best))})
        remaining = [r for r in remaining if r["id"] != best["id"]]

    rest = []
    for row in remaining:
        nxt = dict(brands)
        nxt[row["brand"]] = nxt.get(row["brand"], 0) + 1
        rest.append({**row, "score": f"{score(row, nxt):.4f}", "selected": "0", "buy_qty": str(suggested_qty(row))})

    all_rows = picked + rest
    fields = list(all_rows[0].keys())
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(all_rows)
    with SHORT.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(picked)
    print(json.dumps({"shortlist": len(picked), "catalog": len(all_rows), "out": str(SHORT)}, indent=2))


if __name__ == "__main__":
    main()
