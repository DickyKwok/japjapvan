#!/usr/bin/env python3
"""Find merch-relevant rising products and fetch images.

Cron already refreshes demand for the seed 50. This script is the missing
half: turn live Google Trends (CA/JP/HK) into new SKU candidates with photos.
Sports / politics are dropped. Only beauty, hair, stationery, snacks, daily.
"""

from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "data" / "discovered-products.json"
IMG_DIR = ROOT / "public" / "products"
RISING = ROOT / "src" / "data" / "rising-topics.json"
PRODUCTS_TS = ROOT / "src" / "data" / "products.ts"
UA = "JapJapVan/1.0 (merchandising desk; https://japjapvan.com)"

MERCH_RE = re.compile(
    r"(skincare|serum|lotion|sunscreen|spf|uv|mask|cream|shampoo|hair|mascara|lipstick|"
    r"eyeliner|stationery|pen|notebook|eraser|snack|chocolate|kitkat|pocky|calbee|"
    r"mayo|kewpie|cosme|toner|essence|cleanser|moisturizer|lip|cheek|sunscreen|"
    r"コスメ|日焼け止め|化粧水|美容液|文具|筆記|零食|朱古力|護膚|防曬|面膜|シャンプー|"
    r"化粧品|美容|スキン|メイク|ノート|チョコ|ポッキー|カルビー)",
    re.I,
)
SKIP_RE = re.compile(
    r"(ufc|mlb|nba|nfl|soccer|football|election|shock|甲子園|高校|騎手|試合|vs |対 |"
    r"トランプ|trump|rogan|padres|strikeout|by-election|台風|低氣壓|火災|訃報)",
    re.I,
)

# Japan CPG that Vancouver actually buys and that may not be in the seed 50.
WAVE = [
    {
        "id": "elixir-lotion",
        "brand": "Elixir",
        "name": "Superieur Lift Moist Lotion II",
        "category": "skincare",
        "keyword": "Elixir Superieur lotion",
        "landedCad": 32,
        "sellCad": 62,
        "weightG": 200,
        "supplier": "Shiseido Elixir",
        "moq": 6,
        "notes": "Shiseido prestige drugstore. Strong HK/JP, rising CA anti-age.",
    },
    {
        "id": "transino-ii",
        "brand": "Transino",
        "name": "Whitening II 240 tablets",
        "category": "skincare",
        "keyword": "Transino II",
        "landedCad": 38,
        "sellCad": 74,
        "weightG": 80,
        "supplier": "Daiichi Sankyo",
        "moq": 4,
        "notes": "Oral whitening — check NPN. High HK search.",
    },
    {
        "id": "kewpie-mayo",
        "brand": "Kewpie",
        "name": "Japanese Mayo 350g",
        "category": "daily",
        "keyword": "Kewpie mayonnaise",
        "landedCad": 6.4,
        "sellCad": 13,
        "weightG": 380,
        "supplier": "Kewpie Export",
        "moq": 12,
        "notes": "Pantry staple. Repeat. Watch glass vs squeeze.",
    },
    {
        "id": "royce-nama",
        "brand": "Royce",
        "name": "Nama Chocolate Au Lait",
        "category": "daily",
        "keyword": "Royce Nama Chocolate",
        "landedCad": 14,
        "sellCad": 28,
        "weightG": 130,
        "supplier": "Royce' Hokkaido",
        "moq": 8,
        "notes": "Gift + fridge. Cold-pack last mile in Vancouver.",
    },
    {
        "id": "pocky-giant",
        "brand": "Glico",
        "name": "Pocky Giant Pack Chocolate",
        "category": "daily",
        "keyword": "Pocky chocolate",
        "landedCad": 5.2,
        "sellCad": 11,
        "weightG": 160,
        "supplier": "Glico",
        "moq": 24,
        "notes": "Impulse add-on. Always-on snack.",
    },
    {
        "id": "calbee-jagabee",
        "brand": "Calbee",
        "name": "Jagabee Lightly Salted",
        "category": "daily",
        "keyword": "Calbee Jagabee",
        "landedCad": 4.8,
        "sellCad": 10,
        "weightG": 90,
        "supplier": "Calbee",
        "moq": 24,
        "notes": "Light, high velocity snack.",
    },
    {
        "id": "kate-liner",
        "brand": "KATE",
        "name": "Super Sharp Liner EX",
        "category": "makeup",
        "keyword": "KATE Super Sharp Liner",
        "landedCad": 8.6,
        "sellCad": 18,
        "weightG": 22,
        "supplier": "Kanebo KATE",
        "moq": 12,
        "notes": "Tiny, high margin liner. Easy air.",
    },
    {
        "id": "haba-squa",
        "brand": "HABA",
        "name": "Squa Oil 30ml",
        "category": "skincare",
        "keyword": "HABA Squa",
        "landedCad": 18,
        "sellCad": 36,
        "weightG": 50,
        "supplier": "HABA",
        "moq": 6,
        "notes": "Additive-free story. Repeat oil.",
    },
]


def get(url: str) -> bytes | None:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            return res.read()
    except Exception as e:
        print("fail", url[:80], type(e).__name__, e)
        return None


def existing_ids() -> set[str]:
    text = PRODUCTS_TS.read_text()
    return set(re.findall(r'id: "([^"]+)"', text))


def merch_topics() -> list[dict]:
    if not RISING.exists():
        return []
    data = json.loads(RISING.read_text())
    out = []
    for geo, market in (data.get("markets") or {}).items():
        for topic in market.get("topics") or []:
            title = topic.get("title") or ""
            if SKIP_RE.search(title) or not MERCH_RE.search(title):
                continue
            out.append(
                {
                    "geo": geo,
                    "title": title,
                    "traffic": topic.get("traffic") or 0,
                    "news": topic.get("news") or "",
                }
            )
    return out


def slug(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:40] or "topic"


def candidate_from_topic(topic: dict) -> dict:
    title = topic["title"]
    cid = f"disc-{slug(title)}"
    sell = 22 if topic["traffic"] < 500 else 28
    landed = round(sell * 0.48, 1)
    return {
        "id": cid,
        "brand": title.split()[0][:24],
        "name": title[:64],
        "category": "daily",
        "origin": "JP",
        "sku": f"SN-DISC-{cid[-8:].upper()}",
        "keyword": title,
        "landedCad": landed,
        "sellCad": sell,
        "weightG": 120,
        "bulky": 2,
        "regulatory": "none",
        "uniqueness": 6,
        "repeat": 5,
        "preorderFit": 7,
        "supplier": "TBD — rising topic",
        "moq": 8,
        "leadDays": 21,
        "caTrend": 55 if topic["geo"] == "CA" else 35,
        "jpTrend": 55 if topic["geo"] == "JP" else 35,
        "hkTrend": 55 if topic["geo"] == "HK" else 35,
        "rising": True,
        "stock": 0,
        "incoming": 0,
        "weeklyVelocity": 1,
        "preorders": 0,
        "notes": f"Discovered from Google Trends {topic['geo']}: {title}. {topic.get('news','')[:160]}",
        "discovered": True,
        "sourceTopic": title,
        "sourceGeo": topic["geo"],
    }


def wave_product(row: dict) -> dict:
    return {
        "id": row["id"],
        "brand": row["brand"],
        "name": row["name"],
        "category": row["category"],
        "origin": "JP",
        "sku": f"SN-WV-{row['id'][:10].upper()}",
        "keyword": row["keyword"],
        "landedCad": row["landedCad"],
        "sellCad": row["sellCad"],
        "weightG": row["weightG"],
        "bulky": 2,
        "regulatory": "none" if row["category"] == "daily" else "cnf",
        "uniqueness": 7,
        "repeat": 7,
        "preorderFit": 8,
        "supplier": row["supplier"],
        "moq": row["moq"],
        "leadDays": 18,
        "caTrend": 58,
        "jpTrend": 76,
        "hkTrend": 64,
        "rising": True,
        "stock": 0,
        "incoming": 0,
        "weeklyVelocity": 2,
        "preorders": 0,
        "notes": row["notes"],
        "discovered": True,
        "sourceTopic": row["keyword"],
        "sourceGeo": "JP",
    }


def fetch_image(query: str, dest: Path) -> bool:
    if dest.exists() and dest.stat().st_size > 2000:
        return True
    # Openverse (CC-licensed)
    url = "https://api.openverse.org/v1/images/?" + urllib.parse.urlencode(
        {"q": query, "page_size": 5, "license_type": "commercial"}
    )
    raw = get(url)
    if raw:
        try:
            hits = json.loads(raw.decode()).get("results") or []
            for hit in hits:
                img = get(hit.get("url") or "")
                if img and len(img) > 3000:
                    dest.write_bytes(img)
                    print("img openverse", dest.name, len(img))
                    return True
        except Exception as e:
            print("openverse parse", e)
    # Wikimedia pageimage
    wiki = (
        "https://en.wikipedia.org/w/api.php?"
        + urllib.parse.urlencode(
            {
                "action": "query",
                "generator": "search",
                "gsrsearch": query,
                "gsrlimit": 3,
                "prop": "pageimages",
                "piprop": "original",
                "format": "json",
            }
        )
    )
    raw = get(wiki)
    if raw:
        try:
            pages = (json.loads(raw.decode()).get("query") or {}).get("pages") or {}
            for page in pages.values():
                src = ((page.get("original") or {}).get("source")) if isinstance(page, dict) else None
                if not src:
                    continue
                img = get(src)
                if img and len(img) > 3000:
                    dest.write_bytes(img)
                    print("img wiki", dest.name, len(img))
                    return True
        except Exception as e:
            print("wiki parse", e)
    return False


def main() -> None:
    have = existing_ids()
    products = []
    for row in WAVE:
        if row["id"] in have:
            continue
        products.append(wave_product(row))
    for topic in merch_topics():
        cand = candidate_from_topic(topic)
        if cand["id"] in have or any(p["id"] == cand["id"] for p in products):
            continue
        products.append(cand)

    IMG_DIR.mkdir(parents=True, exist_ok=True)
    kept = []
    for p in products:
        dest = IMG_DIR / f"{p['id']}.jpg"
        ok = fetch_image(f"{p['brand']} {p['name']} Japan product", dest)
        if not ok:
            fetch_image(p["keyword"], dest)
        if dest.exists():
            kept.append(p)
        else:
            print("no image, still keep", p["id"])
            kept.append(p)

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "method": "Google Trends merch filter + curated JP CPG wave. Images: Openverse / Wikimedia.",
        "products": kept[:16],
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2))
    print("wrote", OUT, "n=", len(payload["products"]))


if __name__ == "__main__":
    main()
