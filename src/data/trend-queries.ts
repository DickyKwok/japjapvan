import type { Product } from "./types";
import raw from "./trend-queries.json";

export type GeoQuery = { ca: string; jp: string; hk: string };

const MAP = raw as Record<string, GeoQuery>;

export function trendQueryFor(id: string, fallback = ""): GeoQuery {
  return MAP[id] ?? { ca: fallback, jp: fallback, hk: fallback };
}

export function uniqueTrendQueries(products: Array<Pick<Product, "id" | "brand" | "keyword">>) {
  const groups = new Map<string, GeoQuery & { productIds: string[] }>();
  for (const p of products) {
    const q = trendQueryFor(p.id, p.brand || p.keyword);
    const key = `${q.ca}\0${q.jp}\0${q.hk}`;
    const row = groups.get(key) ?? { ...q, productIds: [] };
    row.productIds.push(p.id);
    groups.set(key, row);
  }
  return [...groups.values()];
}

export function googleTrendsExploreUrl(query: string, geo: "CA" | "JP" | "HK" = "CA") {
  return `https://trends.google.com/trends/explore?geo=${geo}&q=${encodeURIComponent(query)}`;
}
