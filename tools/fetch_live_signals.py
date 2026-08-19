#!/usr/bin/env python3
"""Pull real demand series: Wikipedia pageviews (en/ja/zh) and optional Google Trends."""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "data" / "live-signals.json"

UA = "JapJapVan/1.0 (merchandising desk; wikipedia pageviews)"

# Brand-level Wikipedia titles. One article per brand is the honest unit —
# Google Trends also collapses to the brand query in Canada.
WIKI = {
    "sk2-essence": ("SK-II", "SK-II", "SK-II"),
    "hada-lotion": ("Hada_Labo", "肌ラボ", "肌研"),
    "hada-foam": ("Hada_Labo", "肌ラボ", "肌研"),
    "shiseido-ultimune": ("Shiseido", "資生堂", "資生堂"),
    "curel-cream": ("Curel", "キュレル", "Curel"),
    "curel-spray": ("Curel", "キュレル", "Curel"),
    "fancl-oil": ("FANCL", "ファンケル", "FANCL"),
    "dhc-oil": ("DHC", "DHC_(企業)", "DHC"),
    "kose-softymo": ("Kose", "コーセー", "高絲"),
    "naturie-gel": ("Job's_tears", "ハトムギ", "薏仁"),
    "melano-cc": ("Melano_CC", "メラノCC", "Melano_CC"),
    "senka-whip": ("Shiseido", "専科_(化粧品)", "資生堂"),
    "minon-lotion": ("Minon", "ミノン", "Minon"),
    "biore-essence": ("Bioré", "ビオレ", "碧柔"),
    "biore-gel": ("Bioré", "ビオレ", "碧柔"),
    "anessa-milk": ("Anessa", "アネッサ", "安耐晒"),
    "skinaqua-tone": ("Skin_Aqua", "スキンアクア", "Skin_Aqua"),
    "canmake-uv": ("Canmake", "キャンメイク", "Canmake"),
    "canmake-cheek": ("Canmake", "キャンメイク", "Canmake"),
    "allie-uv": ("Allie_(sunscreen)", "アリィー", "Allie"),
    "fino-mask": ("Fino_(hair_care)", "フィーノ", "Fino"),
    "tsubaki-oil": ("Tsubaki_(hair_care)", "ツバキ_(ヘアケア)", "Tsubaki"),
    "honey-shampoo": ("&honey", "アンドハニー", "&honey"),
    "diane-repair": ("Moist_Diane", "モイストダイアン", "Moist_Diane"),
    "milbon-oil": ("Milbon", "ミルボン", "Milbon"),
    "refa-iron": ("ReFa", "リファ", "ReFa"),
    "yaman-brush": ("YA-MAN", "ヤーマン", "YA-MAN"),
    "pana-dryer": ("Panasonic", "パナソニック", "松下電器"),
    "salonia-iron": ("SALONIA", "サロニア", "SALONIA"),
    "pilot-frixion": ("FriXion", "フリクション_(文具)", "百樂"),
    "uni-one": ("Uni-ball", "ユニボール", "三菱鉛筆"),
    "zebra-sarasa": ("Zebra_(pen_manufacturer)", "サラサ", "斑馬牌"),
    "pentel-energel": ("Pentel", "ぺんてる", "Pentel"),
    "kokuyo-campus": ("Kokuyo", "コクヨ", "國譽"),
    "midori-md": ("Midori_(stationery)", "ミドリ_(文具)", "Midori"),
    "tombow-mono": ("Tombow", "トンボ鉛筆", "蜻蜓鉛筆"),
    "hobonichi-weeks": ("Hobonichi", "ほぼ日刊イトイ新聞", "Hobonichi"),
    "lululun-mask": ("Lululun", "ルルルン", "Lululun"),
    "heroine-mascara": ("Heroine_Make", "ヒロインメイク", "Heroine_Make"),
    "shu-oil": ("Shu_Uemura", "シュウウエムラ", "植村秀"),
    "obagi-c": ("Obagi", "オバジ", "Obagi"),
    "rohto-lycee": ("Lycee", "リセ", "Lycee"),
    "sana-soy": ("Sana_(cosmetics)", "サナ", "Sana"),
    "muji-oil": ("Muji", "無印良品", "無印良品"),
    "attenir-oil": ("Attenir", "アテニア", "Attenir"),
    "decorté-lipo": ("Cosme_Decorte", "コスメデコルテ", "黛珂"),
    "dprogram-lotion": ("d_program", "dプログラム", "d_program"),
    "ikemoto-comb": ("Ikemoto", "池本刷子", "Ikemoto"),
    "mapepe-brush": ("MaPEPE", "マペペ", "MaPEPE"),
    "shiseido-whip": ("Shiseido", "資生堂", "資生堂"),
    "hada-labo": ("Hada_Labo", "肌ラボ", "肌研"),
    "elixir-lotion": ("ELIXIR", "エリクシール", "ELIXIR"),
    "transino-ii": ("Transino", "トランシーノ", "Transino"),
    "kewpie-mayo": ("Kewpie", "キユーピー", "丘比"),
    "royce-nama": ("Royce'_Confect", "ロイズ", "Royce"),
    "pocky-giant": ("Pocky", "ポッキー", "Pocky"),
    "calbee-jagabee": ("Calbee", "カルビー", "卡樂B"),
    "kate-liner": ("Kate_(cosmetics)", "ケイト_(化粧品)", "KATE"),
    "haba-squa": ("HABA", "ハーバー", "HABA"),
}


def get_json(url: str) -> dict | None:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            return json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        print(f"  HTTP {e.code} {url[-80:]}")
        return None
    except Exception as e:
        print(f"  fail {type(e).__name__}: {e}")
        return None


def pageviews(project: str, title: str, start: str, end: str) -> list[tuple[str, int]]:
    enc = urllib.parse.quote(title, safe="")
    url = (
        f"https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"
        f"{project}/all-access/all-agents/{enc}/daily/{start}/{end}"
    )
    data = get_json(url)
    if not data or "items" not in data:
        return []
    out = []
    for item in data["items"]:
        ts = item.get("timestamp", "")[:8]
        if len(ts) != 8:
            continue
        day = f"{ts[:4]}-{ts[4:6]}-{ts[6:8]}"
        out.append((day, int(item.get("views") or 0)))
    return out


def weekly(points: list[tuple[str, int]]) -> dict[str, int]:
    buckets: dict[str, int] = defaultdict(int)
    for day, views in points:
        y, m, d = map(int, day.split("-"))
        dt = date(y, m, d)
        monday = dt - timedelta(days=dt.weekday())
        buckets[monday.isoformat()] += views
    return dict(sorted(buckets.items()))


def norm_series(weeks: list[str], ca: dict[str, int], jp: dict[str, int], hk: dict[str, int]):
    def scale(src: dict[str, int]) -> dict[str, int]:
        peak = max(src.values()) if src else 0
        if peak <= 0:
            return {w: 0 for w in weeks}
        return {w: max(8, min(100, round(src.get(w, 0) / peak * 100))) for w in weeks}

    sca, sjp, shk = scale(ca), scale(jp), scale(hk)
    return [
        {"week": w, "CA": sca.get(w, 8), "JP": sjp.get(w, 8), "HK": shk.get(w, 8)}
        for w in weeks
    ]


def main() -> None:
    end = date.today()
    start = end - timedelta(days=200)
    start_s = start.strftime("%Y%m%d")
    end_s = end.strftime("%Y%m%d")
    fetched = datetime.now(timezone.utc).isoformat()
    products: dict[str, dict] = {}

    existing: dict[str, dict] = {}
    if OUT.exists():
        try:
            existing = json.loads(OUT.read_text()).get("products") or {}
        except Exception:
            existing = {}

    for pid, (en, ja, zh) in WIKI.items():
        prev = existing.get(pid) or {}
        if prev.get("source") == "google-trends" and prev.get("caVolume") and prev.get("series"):
            print(pid, "skip (google-trends)", flush=True)
            continue
        print(pid, "…", flush=True)
        ca = weekly(pageviews("en.wikipedia", en, start_s, end_s))
        time.sleep(0.25)
        jp = weekly(pageviews("ja.wikipedia", ja, start_s, end_s))
        time.sleep(0.25)
        hk = weekly(pageviews("zh.wikipedia", zh, start_s, end_s))
        time.sleep(0.25)
        weeks = sorted(set(ca) | set(jp) | set(hk))
        if len(weeks) < 16:
            print(f"  skip (only {len(weeks)} weeks) — keep previous if any")
            continue
        series = norm_series(weeks[-26:], ca, jp, hk)
        products[pid] = {
            "source": "wikipedia-pageviews",
            "fetchedAt": fetched,
            "titles": {"en": en, "ja": ja, "zh": zh},
            "series": series,
        }
        print(f"  weeks={len(series)} last CA/JP/HK={series[-1]['CA']}/{series[-1]['JP']}/{series[-1]['HK']}")

    merged = dict(existing)
    wiki_added = 0
    for pid, row in products.items():
        prev = merged.get(pid) or {}
        if prev.get("source") == "google-trends" and prev.get("series"):
            continue
        merged[pid] = row
        wiki_added += 1

    gt = sum(1 for r in merged.values() if r.get("source") == "google-trends")
    method = (
        f"Google Trends brand queries where Canada has volume ({gt} SKUs). "
        "Wikipedia pageviews fill remaining gaps only. No invented seed +%."
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            {
                "generatedAt": fetched,
                "method": method,
                "products": merged,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    print(f"wrote {len(merged)} live series ({wiki_added} wiki, {gt} google-trends) → {OUT}")


if __name__ == "__main__":
    main()
