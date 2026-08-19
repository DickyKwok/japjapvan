import { DEFAULT_CRITERIA, type ListingCriteria } from "@/data/criteria";
import { PRODUCTS } from "@/data/products";
import { REVERSE_SKUS } from "@/data/reverse";
import type { Product, ProductSignal } from "@/data/types";
import { evaluateListing, signalFromListing } from "@/lib/listing";
import {
  buildBundle,
  snapshotFromProduct,
  snapshotFromReverse,
  type ProductSnapshot,
  type SnapshotBundle,
  type TrendPoint,
} from "@/lib/trend-engine";
import { googleTrendsExploreUrl, trendQueryFor } from "@/data/trend-queries";
import liveSignals from "@/data/live-signals.json";
import { useEffect, useState } from "react";

type LiveFile = {
  generatedAt?: string;
  method?: string;
  products?: Record<
    string,
    {
      source?: ProductSnapshot["source"];
      fetchedAt?: string;
      series?: TrendPoint[];
      titles?: { en?: string; ja?: string; zh?: string };
      query?: { ca?: string; jp?: string; hk?: string };
      googleTrendsUrl?: string;
      caVolume?: boolean;
    }
  >;
};

let memoryBundle: SnapshotBundle | null = null;
let demandVersion = 0;
const demandListeners = new Set<() => void>();

export function setSignalBundle(bundle: SnapshotBundle) {
  memoryBundle = bundle;
  demandVersion += 1;
  demandListeners.forEach((fn) => fn());
}

export function useDemandVersion() {
  const [v, setV] = useState(demandVersion);
  useEffect(() => {
    const fn = () => setV(demandVersion);
    demandListeners.add(fn);
    return () => {
      demandListeners.delete(fn);
    };
  }, []);
  return v;
}

export function applyLiveOverlay(bundle: SnapshotBundle): SnapshotBundle {
  return overlayLive(bundle);
}

export function applyLiveRows(
  bundle: SnapshotBundle,
  rows: NonNullable<LiveFile["products"]>,
  method?: string,
  generatedAt?: string,
): SnapshotBundle {
  return overlayRows(bundle, rows, method, generatedAt);
}

function overlayLive(bundle: SnapshotBundle): SnapshotBundle {
  const live = liveSignals as LiveFile;
  return overlayRows(bundle, live.products ?? {}, live.method, live.generatedAt);
}

function overlayRows(
  bundle: SnapshotBundle,
  rows: NonNullable<LiveFile["products"]>,
  method?: string,
  generatedAt?: string,
): SnapshotBundle {
  let hits = 0;
  let gt = 0;
  for (const [id, row] of Object.entries(rows)) {
    if (!row.series?.length) continue;
    if (row.source === "google-trends" && row.caVolume === false) continue;
    const existing = bundle.products[id];
    if (!existing) continue;
    const series = row.series;
    const latest = series[series.length - 1];
    const source = row.source ?? "wikipedia-pageviews";
    const q = row.query?.ca || trendQueryFor(id, existing.keyword).ca;
    const titles = row.titles;
    const wikiTitle = titles?.en?.replaceAll("_", " ") ?? q;
    const isGt = source === "google-trends";
    const evidenceUrl = isGt
      ? (row.googleTrendsUrl || googleTrendsExploreUrl(q, "CA"))
      : titles?.en
        ? `https://pageviews.wmcloud.org/?project=en.wikipedia.org&pages=${encodeURIComponent(titles.en)}`
        : "";
    const rebuilt = snapshotFromProduct(
      {
        id,
        keyword: existing.keyword,
        caTrend: latest.CA,
        jpTrend: latest.JP,
        hkTrend: latest.HK,
        rising: true,
      },
      {
        source,
        fetchedAt: row.fetchedAt ?? existing.fetchedAt,
        series,
        evidenceUrl,
        evidenceLabel: isGt ? `Google Trends · ${q}` : `Wikipedia · ${wikiTitle}`,
        brandTitle: isGt ? q : wikiTitle,
        googleTrendsUrl: isGt ? row.googleTrendsUrl || googleTrendsExploreUrl(q, "CA") : "",
      },
    );
    bundle.products[id] = rebuilt;
    hits += 1;
    if (isGt) gt += 1;
  }
  if (hits > 0) {
    bundle.method =
      method ??
      `Live demand: ${gt} Google Trends brand series, ${hits - gt} Wikipedia fallbacks. No invented seed +%.`;
    bundle.generatedAt = generatedAt ?? bundle.generatedAt;
  }
  return bundle;
}

export function fallbackBundle(): SnapshotBundle {
  if (!memoryBundle) {
    const extras = REVERSE_SKUS.map((p) => snapshotFromReverse(p));
    memoryBundle = overlayLive(buildBundle(PRODUCTS, extras));
  }
  return memoryBundle;
}

export function activeBundle(): SnapshotBundle {
  return fallbackBundle();
}

export function snapshotFor(id: string): ProductSnapshot | undefined {
  return activeBundle().products[id];
}

export function signalFor(p: Product, criteria: ListingCriteria = DEFAULT_CRITERIA): ProductSignal {
  const snap = snapshotFor(p.id) ?? snapshotFromProduct(p);
  const verdict = evaluateListing(p, snap, criteria);
  return signalFromListing(snap, verdict, 0);
}

export function lastSignalsAt() {
  return activeBundle().generatedAt;
}

export function signalSummary(criteria: ListingCriteria = DEFAULT_CRITERIA) {
  const bundle = activeBundle();
  const jpLane = PRODUCTS.map((p) => {
    const snap = bundle.products[p.id];
    return evaluateListing(p, snap, criteria);
  });
  const listed = jpLane.filter((s) => s.listed).length;
  const watch = jpLane.length - listed;
  const avgGrowth =
    jpLane.filter((s) => s.listed).reduce((s, x) => s + x.caGrowth12w, 0) / Math.max(1, listed);
  const live = PRODUCTS.filter((p) => {
    const src = bundle.products[p.id]?.source;
    return src === "google-trends" || src === "wikipedia-pageviews";
  }).length;
  return {
    listed,
    watch,
    total: jpLane.length,
    avgGrowth,
    generatedAt: bundle.generatedAt,
    method: bundle.method,
    live,
    seeded: jpLane.length - live,
  };
}
