import { PRODUCTS } from "@/data/products";
import { snapshotFor } from "@/lib/signals";
import { buildSeries, type Geo, type TrendPoint } from "@/lib/trend-engine";

export type { Geo, TrendPoint };

export function seriesFor(keyword: string, weeks = 26): TrendPoint[] {
  const p = PRODUCTS.find((x) => x.keyword === keyword || x.id === keyword);
  if (p) {
    const snap = snapshotFor(p.id);
    if (snap?.series?.length) return snap.series;
    return buildSeries({
      id: p.id,
      ca: p.caTrend,
      jp: p.jpTrend,
      hk: p.hkTrend,
      rising: p.rising,
      weeks,
    });
  }
  return buildSeries({ id: keyword, ca: 40, jp: 60, hk: 50, rising: false, weeks });
}

export function latestByGeo(keyword: string) {
  const s = seriesFor(keyword);
  return s[s.length - 1];
}
