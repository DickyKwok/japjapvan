import { PRODUCTS } from "@/data/products";
import { REVERSE_SKUS } from "@/data/reverse";
import type { Product, ProductSignal } from "@/data/types";
import {
  buildBundle,
  snapshotFromProduct,
  snapshotFromReverse,
  type ProductSnapshot,
  type SnapshotBundle,
} from "@/lib/trend-engine";

let memoryBundle: SnapshotBundle | null = null;

export function setSignalBundle(bundle: SnapshotBundle) {
  memoryBundle = bundle;
}

export function fallbackBundle(): SnapshotBundle {
  if (!memoryBundle) {
    const extras = REVERSE_SKUS.map((p) => snapshotFromReverse(p));
    memoryBundle = buildBundle(PRODUCTS, extras);
  }
  return memoryBundle;
}

export function activeBundle(): SnapshotBundle {
  return fallbackBundle();
}

export function snapshotFor(id: string): ProductSnapshot | undefined {
  return activeBundle().products[id];
}

export function signalFromSnapshot(snap: ProductSnapshot): ProductSignal {
  return {
    eligible: snap.eligible,
    gate: snap.gate,
    source: snap.source,
    fetchedAt: snap.fetchedAt,
    keyword: snap.keyword,
    googleTrendsUrl: snap.googleTrendsUrl,
    caGrowth12w: snap.caGrowth12w,
    jpGrowth12w: snap.jpGrowth12w,
    hkGrowth12w: snap.hkGrowth12w,
    latest: snap.latest,
    reason: snap.reason,
    whyListed: snap.whyListed,
  };
}

export function signalFor(p: Product): ProductSignal {
  const snap = snapshotFor(p.id) ?? snapshotFromProduct(p);
  return signalFromSnapshot(snap);
}

export function lastSignalsAt() {
  return activeBundle().generatedAt;
}

export function signalSummary() {
  const bundle = activeBundle();
  const jpLane = PRODUCTS.map((p) => bundle.products[p.id]).filter(Boolean);
  const listed = jpLane.filter((s) => s.eligible).length;
  const watch = jpLane.length - listed;
  const avgGrowth =
    jpLane.filter((s) => s.eligible).reduce((s, x) => s + x.caGrowth12w, 0) / Math.max(1, listed);
  return { listed, watch, total: jpLane.length, avgGrowth, generatedAt: bundle.generatedAt, method: bundle.method };
}
