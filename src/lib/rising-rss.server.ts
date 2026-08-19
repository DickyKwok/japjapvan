import { PRODUCTS } from "@/data/products";
import type { RisingBundle, RisingMarket, RisingTopic } from "@/lib/rising";

const RSS = "https://trends.google.com/trending/rss?geo=";
const UA = "Mozilla/5.0 (compatible; JapJapVan/1.0; merchandising desk)";
const GEOS = ["CA", "JP", "HK"] as const;

function xmlText(block: string, tag: string) {
  const plain = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  if (plain) return decode(plain[1].trim());
  const ns = block.match(new RegExp(`<(?:[\\w]+:)?${tag}>([\\s\\S]*?)</(?:[\\w]+:)?${tag}>`, "i"));
  return ns ? decode(ns[1].trim()) : "";
}

function decode(s: string) {
  return s
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("<![CDATA[", "")
    .replaceAll("]]>", "");
}

function trafficN(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export function matchSkus(title: string) {
  const t = ` ${title.toLowerCase()} `;
  const hits: string[] = [];
  for (const p of PRODUCTS) {
    const brand = p.brand.toLowerCase().trim();
    if (brand.length < 4) continue;
    const token = ` ${brand} `;
    if (t.includes(token)) hits.push(p.id);
  }
  return hits.slice(0, 4);
}

function parseRss(geo: (typeof GEOS)[number], xml: string): RisingMarket {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((m) => m[1]);
  const topics: RisingTopic[] = items
    .map((block) => {
      const title = xmlText(block, "title");
      const traffic = xmlText(block, "approx_traffic");
      return {
        title,
        traffic: trafficN(traffic),
        trafficLabel: traffic || "rising",
        pubDate: xmlText(block, "pubDate"),
        news: xmlText(block, "news_item_title"),
        newsUrl: xmlText(block, "news_item_url"),
        exploreUrl: `https://trends.google.com/trends/explore?geo=${geo}&q=${encodeURIComponent(title)}`,
        matchedSkuIds: matchSkus(title),
      };
    })
    .filter((t) => t.title)
    .sort((a, b) => b.traffic - a.traffic);
  return {
    geo,
    source: "google-trends-rss",
    sourceUrl: `${RSS}${geo}`,
    exploreUrl: `https://trends.google.com/trending?geo=${geo}`,
    fetchedAt: new Date().toISOString(),
    topics,
    wikiTop: [],
    wikiNote: "",
  };
}

export async function fetchRisingRss(): Promise<RisingBundle> {
  const markets = {} as RisingBundle["markets"];
  for (const geo of GEOS) {
    try {
      const res = await fetch(`${RSS}${geo}`, {
        headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/xml" },
      });
      const xml = await res.text();
      markets[geo] = parseRss(geo, xml);
    } catch {
      markets[geo] = parseRss(geo, "");
    }
  }
  return {
    generatedAt: new Date().toISOString(),
    method:
      "Google Trends Trending RSS (https://trends.google.com/trending/rss?geo=CA|JP|HK) — live search topics with approximate traffic.",
    markets,
  };
}
