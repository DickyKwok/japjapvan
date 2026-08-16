import type { ListingCriteria } from "@/data/criteria";
import type { Product, ProductSignal } from "@/data/types";
import { marginPct } from "@/lib/scoring-core";
import {
  buildReasons,
  evaluateGate,
  growth12w,
  type ProductSnapshot,
} from "@/lib/trend-engine";

export type ListingVerdict = {
  listed: boolean;
  gatePass: boolean;
  filterPass: boolean;
  filterFail: string | null;
  caGrowth12w: number;
  reason: string;
  whyListed: string;
};

export function filterFailReason(p: Product, c: ListingCriteria): string | null {
  if (!c.categories.includes(p.category)) {
    return `Category “${p.category}” is switched off in the current criteria.`;
  }
  if (!c.origins.includes(p.origin)) {
    return `Origin ${p.origin} is switched off in the current criteria.`;
  }
  const m = marginPct(p);
  if (m < c.minMarginPct) {
    return `Gross margin ${Math.round(m * 100)}% is below your ${Math.round(c.minMarginPct * 100)}% floor.`;
  }
  if (p.weightG > c.maxWeightG) {
    return `Weight ${p.weightG}g exceeds your ${c.maxWeightG}g shipping cap.`;
  }
  if (p.leadDays > c.maxLeadDays) {
    return `Lead time ${p.leadDays}d exceeds your ${c.maxLeadDays}d cap.`;
  }
  if (p.uniqueness < c.minUniqueness) {
    return `Uniqueness ${p.uniqueness}/10 is below your floor of ${c.minUniqueness}.`;
  }
  return null;
}

export function evaluateListing(
  p: Product,
  snap: ProductSnapshot | undefined,
  criteria: ListingCriteria,
): ListingVerdict {
  const latest = snap?.latest ?? { CA: p.caTrend, JP: p.jpTrend, HK: p.hkTrend };
  const caGrowth =
    snap?.caGrowth12w ??
    (snap?.series ? growth12w(snap.series, "CA") : 0);
  const gate = evaluateGate(latest, caGrowth, criteria);
  const copy = buildReasons(p.keyword, latest, caGrowth, criteria);
  const filterFail = filterFailReason(p, criteria);
  const listed = gate.eligible && !filterFail;

  if (filterFail) {
    return {
      listed: false,
      gatePass: gate.eligible,
      filterPass: false,
      filterFail,
      caGrowth12w: caGrowth,
      reason: `Held by criteria — ${filterFail}`,
      whyListed: gate.eligible
        ? `Trends passed, but this SKU is held by your saved merchandising rule: ${filterFail}`
        : `${copy.whyListed} Also held by merchandising: ${filterFail}`,
    };
  }

  return {
    listed,
    gatePass: gate.eligible,
    filterPass: true,
    filterFail: null,
    caGrowth12w: caGrowth,
    reason: copy.reason,
    whyListed: copy.whyListed,
  };
}

export function signalFromListing(
  snap: ProductSnapshot,
  verdict: ListingVerdict,
  criteriaVersion: number,
): ProductSignal {
  return {
    eligible: verdict.listed,
    gate: verdict.listed ? "pass" : "watch",
    source: snap.source,
    fetchedAt: snap.fetchedAt,
    keyword: snap.keyword,
    googleTrendsUrl: snap.googleTrendsUrl,
    caGrowth12w: snap.caGrowth12w,
    jpGrowth12w: snap.jpGrowth12w,
    hkGrowth12w: snap.hkGrowth12w,
    latest: snap.latest,
    reason: verdict.reason,
    whyListed: verdict.whyListed,
    filterPass: verdict.filterPass,
    criteriaVersion,
  };
}
