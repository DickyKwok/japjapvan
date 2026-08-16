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

export function risingData(): RisingBundle {
  return risingBundle as RisingBundle;
}

export function skuRisers(geo: Geo, limit = 8) {
  return PRODUCTS.map((p) => {
    const snap = snapshotFor(p.id);
    const growth =
      geo === "CA" ? (snap?.caGrowth12w ?? 0) : geo === "JP" ? (snap?.jpGrowth12w ?? 0) : (snap?.hkGrowth12w ?? 0);
    const latest = snap?.latest[geo] ?? 0;
    return { product: p, growth, latest, source: snap?.source ?? "calibrated-seed" };
  })
    .sort((a, b) => b.growth - a.growth)
    .slice(0, limit);
}

export const MARKET_META = {
  CA: { label: "Canada", city: "Vancouver sell market", lang: "EN" },
  JP: { label: "Japan", city: "Tokyo source market", lang: "JA" },
  HK: { label: "Hong Kong", city: "Diaspora + reverse lane", lang: "ZH" },
} as const;
