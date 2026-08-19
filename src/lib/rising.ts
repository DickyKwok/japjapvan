import { PRODUCTS } from "@/data/products";
import risingBundle from "@/data/rising-topics.json";
import { snapshotFor } from "@/lib/signals";
import type { Geo } from "@/lib/trend-engine";

export type RisingTopic = {
  title: string;
  traffic: number;
  trafficLabel: string;
  pubDate: string;
  news: string;
  newsUrl: string;
  exploreUrl: string;
  matchedSkuIds: string[];
};

export type RisingMarket = {
  geo: "CA" | "JP" | "HK";
  source: string;
  sourceUrl: string;
  exploreUrl: string;
  fetchedAt: string;
  topics: RisingTopic[];
  wikiTop: Array<{ title: string; views: number }>;
  wikiNote: string;
};

export type RisingBundle = {
  generatedAt: string;
  method: string;
  markets: Record<"CA" | "JP" | "HK", RisingMarket>;
};

let memoryRising: RisingBundle | null = null;

export function setRisingBundle(bundle: RisingBundle) {
  memoryRising = bundle;
}

export function risingData(): RisingBundle {
  return memoryRising ?? (risingBundle as RisingBundle);
}

export function matchSkus(title: string) {
  const t = ` ${title.toLowerCase()} `;
  const hits: string[] = [];
  for (const p of PRODUCTS) {
    const brand = p.brand.toLowerCase().trim();
    if (brand.length < 4) continue;
    if (t.includes(` ${brand} `)) hits.push(p.id);
  }
  return hits.slice(0, 4);
}

export function skuRisers(geo: Geo, limit = 8) {
  return PRODUCTS.map((p) => {
    const snap = snapshotFor(p.id);
    if (!snap?.hasLiveDemand) return { product: p, growth: 0, latest: 0, source: snap?.source ?? "none" };
    const growth =
      geo === "CA" ? (snap?.caGrowth12w ?? 0) : geo === "JP" ? (snap?.jpGrowth12w ?? 0) : (snap?.hkGrowth12w ?? 0);
    const latest = snap?.latest[geo] ?? 0;
    return { product: p, growth, latest, source: snap?.source ?? "none" };
  })
    .sort((a, b) => b.growth - a.growth)
    .slice(0, limit);
}

export const MARKET_META = {
  CA: { label: "Canada", city: "Vancouver sell market", lang: "EN" },
  JP: { label: "Japan", city: "Tokyo source market", lang: "JA" },
  HK: { label: "Hong Kong", city: "Diaspora + reverse lane", lang: "ZH" },
} as const;
