#!/usr/bin/env python3
"""Live rising topics for CA / JP / HK from Google Trends RSS + Wikimedia."""

from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request

import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "data" / "rising-topics.json"
HIST = ROOT / "data" / "history"
UA = "Mozilla/5.0 (compatible; JapJapVan/1.0)"
NS = {"ht": "https://trends.google.com/trending/rss"}
GEOS = ("CA", "JP", "HK")
TRENDS_URL = "https://trends.google.com/trending?geo={geo}"
RSS_URL = "https://trends.google.com/trending/rss?geo={geo}"


def get(url: str) -> bytes | None:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            return res.read()
    except Exception as e:
        print("fail", url, type(e).__name__, e)
        return None


def traffic_n(raw: str) -> int:
    digits = re.sub(r"[^\d]", "", raw or "")
    return int(digits) if digits else 0


def parse_rss(geo: str) -> dict:
    raw = get(RSS_URL.format(geo=geo))
    topics = []
    if raw:
        root = ET.fromstring(raw)
        for item in root.findall("./channel/item"):
            title = (item.findtext("title") or "").strip()
            if not title:
                continue
            traffic = item.findtext("ht:approx_traffic", namespaces=NS) or ""
            pub = item.findtext("pubDate") or ""
            news_el = item.find("ht:news_item", namespaces=NS)
            news = ""
            news_url = ""
            if news_el is not None:
                news = (news_el.findtext("ht:news_item_title", namespaces=NS) or "").strip()
                news_url = (news_el.findtext("ht:news_item_url", namespaces=NS) or "").strip()
            topics.append(
                {
                    "title": title,
                    "traffic": traffic_n(traffic),
                    "trafficLabel": traffic or "rising",
                    "pubDate": pub,
                    "news": news,
                    "newsUrl": news_url,
                    "exploreUrl": f"https://trends.google.com/trends/explore?geo={geo}&q={urllib.parse.quote(title)}",

                }
            )
    topics.sort(key=lambda t: t["traffic"], reverse=True)
    return {
        "geo": geo,
        "source": "google-trends-rss",
        "sourceUrl": RSS_URL.format(geo=geo),
        "exploreUrl": TRENDS_URL.format(geo=geo),
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "topics": topics,
    }


def wiki_country(geo: str, day: str) -> list[dict]:
    # HK is not a Wikimedia country code; Taiwan is the closest public Chinese-language proxy.
    code = {"CA": "CA", "JP": "JP", "HK": "TW"}.get(geo, geo)
    raw = get(
        f"https://wikimedia.org/api/rest_v1/metrics/pageviews/top-per-country/{code}/all-access/{day}"
    )
    if not raw:
        return []
    try:
        data = json.loads(raw.decode())
    except Exception:
        return []
    skip = (
        "Main_Page",
        "メインページ",
        "Special:Search",
        "特別:検索",
        "Wikipedia:Featured_pictures",
        "Wikipédia:Accueil_principal",
    )
    out = []
    for art in data.get("items", [{}])[0].get("articles", []):
        title = art.get("article") or art.get("page_title") or ""
        if not title or title in skip or title.startswith("Special:") or title.startswith("Wikipedia:") or title.startswith("特別:"):
            continue
        views = int(art.get("views_ceil") or art.get("views") or 0)
        out.append({"title": title.replace("_", " "), "views": views})
        if len(out) >= 12:
            break
    return out


def load_products() -> list[dict]:
    text = (ROOT / "src" / "data" / "products.ts").read_text()
    rows = []
    for m in re.finditer(
        r'id: "([^"]+)".*?brand: "([^"]+)".*?name: "([^"]+)".*?keyword: "([^"]+)"',
        text,
        re.S,
    ):
        rows.append({"id": m.group(1), "brand": m.group(2), "name": m.group(3), "keyword": m.group(4)})
    return rows


def match_skus(title: str, products: list[dict]) -> list[str]:
    t = title.lower()
    hits = []
    for p in products:
        tokens = [p["brand"].lower(), p["keyword"].lower(), *p["brand"].lower().split(), *p["keyword"].lower().split()]
        if any(len(tok) >= 3 and tok in t for tok in tokens) or any(len(tok) >= 3 and tok in p["keyword"].lower() for tok in t.split()):
            hits.append(p["id"])
    return hits[:4]


def main() -> None:
    products = load_products()
    day = datetime.now(timezone.utc).strftime("%Y/%m/%d")
    # Wikimedia top is often one day behind
    from datetime import timedelta

    wiki_day = (datetime.now(timezone.utc) - timedelta(days=2)).strftime("%Y/%m/%d")
    markets = {}
    for geo in GEOS:
        block = parse_rss(geo)
        for topic in block["topics"]:
            topic["matchedSkuIds"] = match_skus(topic["title"], products)
        block["wikiTop"] = wiki_country(geo, wiki_day)
        block["wikiNote"] = (
            "Wikimedia top pages in Taiwan (HK country code is not published)."
            if geo == "HK"
            else f"Wikimedia most-viewed pages requested from {geo}."
        )
        markets[geo] = block
        print(geo, "trends", len(block["topics"]), "wiki", len(block["wikiTop"]))

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "method": "Google Trends Trending RSS (https://trends.google.com/trending/rss?geo=CA|JP|HK) — live search topics with approximate traffic. Wikimedia pageviews top-per-country as a second public source (HK proxied via TW).",
        "markets": markets,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2))
    HIST.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    (HIST / f"rising-{stamp}.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2))
    print("wrote", OUT)


if __name__ == "__main__":
    main()
