import { DEFAULT_CRITERIA, type ListingCriteria } from "@/data/criteria";
import { PRODUCTS } from "@/data/products";
import { REVERSE_SKUS } from "@/data/reverse";
import type { Product, ProductSignal } from "@/data/types";
import { evaluateListing, signalFromListing } from "@/lib/listing";
import {
  buildBundle,
  growth12w,
  snapshotFromProduct,
  snapshotFromReverse,
  type ProductSnapshot,
  type SnapshotBundle,
  type TrendPoint,
} from "@/lib/trend-engine";
import liveSignals from "@/data/live-signals.json";

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
    }
  >;
};

let memoryBundle: SnapshotBundle | null = null;

export function setSignalBundle(bundle: SnapshotBundle) {
  memoryBundle = bundle;
}

export function applyLiveOverlay(bundle: SnapshotBundle): SnapshotBundle {
  return overlayLive(bundle);
}

function overlayLive(bundle: SnapshotBundle): SnapshotBundle {
  const live = liveSignals as LiveFile;
  const rows = live.products ?? {};
  let hits = 0;
  for (const [id, row] of Object.entries(rows)) {
    if (!row.series?.length) continue;
    const existing = bundle.products[id];
    if (!existing) continue;
    // Use the live series only — never blend with invented seed points.
    const series = row.series;
    const latest = series[series.length - 1];
    const titles = row.titles;
    const brand = titles?.en?.replaceAll("_", " ") ?? existing.keyword;
    const evidenceUrl = titles?.en
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
        source: row.source ?? "wikipedia-pageviews",
        fetchedAt: row.fetchedAt ?? existing.fetchedAt,
        series,
        evidenceUrl,
        evidenceLabel: `Wikipedia · ${brand}`,
        brandTitle: brand,
      },
    );
    bundle.products[id] = rebuilt;
    hits += 1;
  }
  if (hits > 0) {
    bundle.method =
      live.method ??
      "Live Wikipedia pageviews only. Google Trends SKU phrases with no Canada volume are not used as +%.";
    bundle.generatedAt = live.generatedAt ?? bundle.generatedAt;
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
