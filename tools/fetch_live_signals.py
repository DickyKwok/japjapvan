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
    "naturie-gel": ("Coix_lacryma-jobi", "ハトムギ", "薏仁"),
    "melano-cc": ("Rohto_Pharmaceutical", "ロート製薬", "樂敦製藥"),
    "senka-whip": ("Shiseido", "専科_(化粧品)", "資生堂"),
    "minon-lotion": ("Daiichi_Sankyo", "ミノン", "第一三共"),
    "biore-essence": ("Bioré", "ビオレ", "碧柔"),
    "biore-gel": ("Bioré", "ビオレ", "碧柔"),
    "anessa-milk": ("Anessa", "アネッサ", "安耐晒"),
    "skinaqua-tone": ("Rohto_Pharmaceutical", "ロート製薬", "樂敦製藥"),
    "canmake-uv": ("Canmake", "キャンメイク", "Canmake"),
    "canmake-cheek": ("Canmake", "キャンメイク", "Canmake"),
    "allie-uv": ("Kanebo", "カネボウ", "佳麗寶"),
    "fino-mask": ("Shiseido", "資生堂", "資生堂"),
    "tsubaki-oil": ("Shiseido", "ツバキ_(ヘアケア)", "資生堂"),
    "honey-shampoo": ("Honey", "アンドハニー", "Honey"),
    "diane-repair": ("Moist_Diane", "モイストダイアン", "Moist_Diane"),
    "milbon-oil": ("Milbon", "ミルボン", "Milbon"),
    "refa-iron": ("ReFa", "リファ", "ReFa"),
    "yaman-brush": ("YA-MAN", "ヤーマン", "YA-MAN"),
    "pana-dryer": ("Panasonic", "パナソニック", "松下電器"),
    "salonia-iron": ("Hair_iron", "ヘアアイロン", "直髮夾"),
    "pilot-frixion": ("FriXion", "フリクション_(文具)", "百樂"),
    "uni-one": ("Uni-ball", "ユニボール", "三菱鉛筆"),
    "zebra-sarasa": ("Zebra_(pen_manufacturer)", "サラサ", "斑馬牌"),
    "pentel-energel": ("Pentel", "ぺんてる", "Pentel"),
    "kokuyo-campus": ("Kokuyo", "コクヨ", "國譽"),
    "midori-md": ("Midori_(stationery)", "ミドリ_(文具)", "Midori"),
    "tombow-mono": ("Tombow", "トンボ鉛筆", "蜻蜓鉛筆"),
    "hobonichi-weeks": ("Hobonichi", "ほぼ日刊イトイ新聞", "Hobonichi"),
    "lululun-mask": ("Sheet_mask", "ルルルン", "面膜"),
    "heroine-mascara": ("Mascara", "ヒロインメイク", "睫毛膏"),
    "shu-oil": ("Shu_Uemura", "シュウウエムラ", "植村秀"),
    "obagi-c": ("Obagi", "オバジ", "Obagi"),
    "rohto-lycee": ("Rohto_Pharmaceutical", "ロート製薬", "樂敦製藥"),
    "sana-soy": ("Naris_Cosmetics", "サナ", "Sana"),
    "muji-oil": ("Muji", "無印良品", "無印良品"),
    "attenir-oil": ("Attenir", "アテニア", "Attenir"),
    "decorté-lipo": ("Cosme_Decorte", "コスメデコルテ", "黛珂"),
    "dprogram-lotion": ("Shiseido", "dプログラム", "資生堂"),
    "ikemoto-comb": ("Comb", "櫛", "梳子"),
    "mapepe-brush": ("Hairbrush", "ヘアブラシ", "髮刷"),
    "shiseido-whip": ("Shiseido", "資生堂", "資生堂"),
    "hada-labo": ("Hada_Labo", "肌ラボ", "肌研"),
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

    for pid, (en, ja, zh) in WIKI.items():
        print(pid, "…", flush=True)
        ca = weekly(pageviews("en.wikipedia", en, start_s, end_s))
        time.sleep(0.12)
        jp = weekly(pageviews("ja.wikipedia", ja, start_s, end_s))
        time.sleep(0.12)
        hk = weekly(pageviews("zh.wikipedia", zh, start_s, end_s))
        time.sleep(0.12)
        weeks = sorted(set(ca) | set(jp) | set(hk))
        if len(weeks) < 16:
            print(f"  skip (only {len(weeks)} weeks)")
            continue
        series = norm_series(weeks[-26:], ca, jp, hk)
        products[pid] = {
            "source": "wikipedia-pageviews",
            "fetchedAt": fetched,
            "titles": {"en": en, "ja": ja, "zh": zh},
            "series": series,
        }
        print(f"  weeks={len(series)} last CA/JP/HK={series[-1]['CA']}/{series[-1]['JP']}/{series[-1]['HK']}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            {
                "generatedAt": fetched,
                "method": "Wikimedia pageviews REST API — en.wikipedia (CA proxy), ja.wikipedia (JP), zh.wikipedia (HK). Daily views bucketed to ISO weeks and scaled 0–100 vs the series peak. Google Trends live is attempted separately; 429/400 from trends.google.com is recorded as seed fallback.",
                "products": products,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    print(f"wrote {len(products)} live series → {OUT}")


if __name__ == "__main__":
    main()
