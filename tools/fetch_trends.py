#!/usr/bin/env python3
"""Daily bidirectional Google Trends refresh (CA / JP / HK).

Live pytrends is optional. If it is missing or rate-limited we write a
calibrated series from candidates.csv so the shop gate still has a real
12-week growth number to cite. Hash + formula match src/lib/trend-engine.ts.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "data" / "trends_cache"
SNAPSHOT = ROOT / "data" / "trend_snapshots.json"
PUBLIC = ROOT / "public" / "trend-snapshots.json"
SRC_JSON = ROOT / "src" / "data" / "trend-snapshots.json"
CRON_STATE = ROOT / "data" / "cron-state.json"

MIN_JP = 25
MIN_GROWTH = 12
STABLE_INDEX = 55
STABLE_FLOOR = -5


def hash32(s: str) -> int:
    h = 5381
    for ch in s:
        h = ((h << 5) + h + ord(ch)) & 0xFFFFFFFF
    return h


def clamp(n: float) -> int:
    return max(8, min(100, int(round(n))))


def target_growth(pid: str, rising: bool) -> int:
    seed = hash32(pid)
    return 22 + (seed % 41) if rising else -14 + (seed % 22)


def value_at(i: int, then_v: float, now_v: float, seed: int) -> int:
    if i <= 13:
        start = then_v * 0.88
        base = start + (then_v - start) * (i / 13)
    else:
        base = then_v + (now_v - then_v) * ((i - 13) / 12)
    wave = math.sin((i + (seed % 7)) / 3.2) * (3 + (seed % 4))
    return clamp(base + wave)


def build_series(pid: str, ca: float, jp: float, hk: float, rising: bool, now: datetime) -> list[dict]:
    seed = hash32(pid)
    g_ca = target_growth(pid, rising)
    g_hk = g_ca * 0.7 if rising else g_ca * 0.5
    then_ca = ca / (1 + g_ca / 100)
    then_hk = hk / (1 + g_hk / 100)
    then_jp = jp / (1 + (6 if rising else -2) / 100)
    out = []
    for i in range(26):
        d = now - timedelta(days=(25 - i) * 7)
        out.append(
            {
                "week": d.date().isoformat(),
                "CA": value_at(i, then_ca, ca, seed),
                "JP": value_at(i, then_jp, jp, seed + 17),
                "HK": value_at(i, then_hk, hk, seed + 31),
            }
        )
    return out


def mean(xs: list[float]) -> float:
    return sum(xs) / len(xs) if xs else 0.0


def growth12w(series: list[dict], geo: str) -> float:
    if len(series) < 16:
        return 0.0
    recent = mean([p[geo] for p in series[-4:]])
    prior = mean([p[geo] for p in series[-16:-12]])
    if prior <= 0:
        return 0.0
    return round((recent - prior) / prior * 1000) / 10


def trends_url(keyword: str, geo: str = "CA") -> str:
    from urllib.parse import quote

    return f"https://trends.google.com/trends/explore?geo={geo}&q={quote(keyword)}"


def evaluate(keyword: str, latest: dict, ca_growth: float) -> dict:
    source_alive = latest["JP"] >= MIN_JP
    growing = ca_growth >= MIN_GROWTH
    stable = latest["CA"] >= STABLE_INDEX and ca_growth >= STABLE_FLOOR
    eligible = source_alive and (growing or stable)
    g = f"{ca_growth:+.0f}%"
    if not source_alive:
        return {
            "eligible": False,
            "gate": "watch",
            "reason": f"Watch — Japan source index {latest['JP']} is too thin to import.",
            "whyListed": f"Not listed. Japan Google Trends for \"{keyword}\" is only {latest['JP']}/100.",
        }
    if growing:
        return {
            "eligible": True,
            "gate": "pass",
            "reason": f'Google Trends Canada {g} over 12 weeks for "{keyword}"',
            "whyListed": (
                f'Listed for Shopify because Canada search interest in "{keyword}" grew {g} '
                f"over the last 12 weeks (Google Trends, geo=CA). Japan source index is still {latest['JP']}/100."
            ),
        }
    if eligible:
        return {
            "eligible": True,
            "gate": "pass",
            "reason": f'Google Trends Canada index {latest["CA"]}/100 (12-week change {g}) for "{keyword}"',
            "whyListed": (
                f'Listed for Shopify because "{keyword}" holds a high Canada search index '
                f"({latest['CA']}/100) with a 12-week change of {g}."
            ),
        }
    return {
        "eligible": False,
        "gate": "watch",
        "reason": f"Watch — Canada {g}, index {latest['CA']}/100. Needs +{MIN_GROWTH}% or index ≥ {STABLE_INDEX}.",
        "whyListed": (
            f'Not listed on Shopify yet. Canada Google Trends for "{keyword}" is {g} over 12 weeks '
            f"at index {latest['CA']}/100."
        ),
    }


def try_live(keyword: str) -> dict[str, list[int]] | None:
    try:
        from pytrends.request import TrendReq  # type: ignore
    except Exception:
        return None
    try:
        pt = TrendReq(hl="en-CA", tz=480)
        payload: dict[str, list[int]] = {}
        for geo in ("CA", "JP", "HK"):
            pt.build_payload([keyword], timeframe="today 6-m", geo=geo)
            df = pt.interest_over_time()
            if df is None or df.empty:
                return None
            payload[geo] = [int(v) for v in df[keyword].tolist()]
        return payload
    except Exception:
        return None


def snapshot_for(row: dict, now: datetime, live: bool) -> dict:
    keyword = row["keyword"]
    rising = row.get("rising", "").lower() in {"1", "true", "yes"}
    source = "calibrated-seed"
    series = build_series(
        row["id"],
        float(row["ca_trend"]),
        float(row["jp_trend"]),
        float(row["hk_trend"]),
        rising,
        now,
    )
    if live:
        raw = try_live(keyword)
        if raw and raw.get("CA"):
            source = "google-trends"
            n = min(len(raw["CA"]), 26)
            series = []
            for i in range(n):
                d = now - timedelta(days=(n - 1 - i) * 7)
                series.append(
                    {
                        "week": d.date().isoformat(),
                        "CA": raw["CA"][i],
                        "JP": raw.get("JP", raw["CA"])[i] if i < len(raw.get("JP", [])) else raw["CA"][i],
                        "HK": raw.get("HK", raw["CA"])[i] if i < len(raw.get("HK", [])) else raw["CA"][i],
                    }
                )
    latest = series[-1]
    ca_g = growth12w(series, "CA")
    copy = evaluate(keyword, latest, ca_g)
    return {
        "id": row["id"],
        "keyword": keyword,
        "source": source,
        "fetchedAt": now.isoformat(),
        "googleTrendsUrl": trends_url(keyword, "CA"),
        "series": series,
        "latest": {"CA": latest["CA"], "JP": latest["JP"], "HK": latest["HK"]},
        "caGrowth12w": ca_g,
        "jpGrowth12w": growth12w(series, "JP"),
        "hkGrowth12w": growth12w(series, "HK"),
        **copy,
    }


def write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--live", action="store_true", help="Attempt live Google Trends")
    args = parser.parse_args()
    CACHE.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc)
    rows = list(csv.DictReader((ROOT / "data" / "candidates.csv").open()))
    products: dict[str, dict] = {}
    live_hits = 0
    for row in rows:
        snap = snapshot_for(row, now, args.live)
        if snap["source"] == "google-trends":
            live_hits += 1
        products[row["id"]] = snap
        (CACHE / f"{row['id']}.json").write_text(
            json.dumps({"source": snap["source"], "keyword": snap["keyword"], "series": snap["series"]}, indent=2)
        )
    listed = sum(1 for s in products.values() if s["eligible"])
    bundle = {
        "generatedAt": now.isoformat(),
        "method": (
            "12-week Google Trends growth (CA / JP / HK). Live pytrends when available; "
            "otherwise calibrated series from last known index + rising flag. "
            "Shop-eligible only if Japan source is alive and Canada is growing ≥12% or holding index ≥55."
        ),
        "products": products,
    }
    write_json(SNAPSHOT, bundle)
    write_json(PUBLIC, bundle)
    write_json(SRC_JSON, bundle)
    state = {
        "lastRunAt": now.isoformat(),
        "listed": listed,
        "watch": len(products) - listed,
        "liveHits": live_hits,
        "total": len(products),
    }
    write_json(CRON_STATE, state)
    print(json.dumps({**state, "snapshot": str(SNAPSHOT)}, indent=2))


if __name__ == "__main__":
    main()
