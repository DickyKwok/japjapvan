import type { ListingCriteria } from "@/data/criteria";
import type { Product, ProductSignal } from "@/data/types";
import { marginPct } from "@/lib/scoring-core";
import {
  buildReasons,
  evaluateGate,
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
  const live = Boolean(snap?.hasLiveDemand);
  const latest = live && snap ? snap.latest : { CA: 0, JP: 0, HK: 0 };
  const caGrowth = live && snap ? snap.caGrowth12w : 0;
  const gate = evaluateGate(latest, caGrowth, criteria, live);
  const copy = buildReasons(p.keyword, latest, caGrowth, criteria, {
    hasLiveDemand: live,
    source: snap?.source ?? "none",
    brandTitle: snap?.evidenceLabel || undefined,
  });
  const filterFail = filterFailReason(p, criteria);
  const listed = gate.eligible && !filterFail;

  if (!live) {
    return {
      listed: false,
      gatePass: false,
      filterPass: !filterFail,
      filterFail,
      caGrowth12w: 0,
      reason: copy.reason,
      whyListed: filterFail ? `${copy.whyListed} Also: ${filterFail}` : copy.whyListed,
    };
  }

  if (filterFail) {
    return {
      listed: false,
      gatePass: gate.eligible,
      filterPass: false,
      filterFail,
      caGrowth12w: caGrowth,
      reason: `Held by criteria — ${filterFail}`,
      whyListed: gate.eligible
        ? `Live demand passed, but this SKU is held by your merchandising rule: ${filterFail}`
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
    hasLiveDemand: snap.hasLiveDemand,
    fetchedAt: snap.fetchedAt,
    keyword: snap.keyword,
    googleTrendsUrl: snap.googleTrendsUrl,
    evidenceUrl: snap.evidenceUrl,
    evidenceLabel: snap.evidenceLabel,
    caGrowth12w: snap.hasLiveDemand ? snap.caGrowth12w : 0,
    jpGrowth12w: snap.hasLiveDemand ? snap.jpGrowth12w : 0,
    hkGrowth12w: snap.hasLiveDemand ? snap.hkGrowth12w : 0,
    latest: snap.hasLiveDemand ? snap.latest : { CA: 0, JP: 0, HK: 0 },
    reason: verdict.reason,
    whyListed: verdict.whyListed,
    filterPass: verdict.filterPass,
    criteriaVersion,
  };
}
