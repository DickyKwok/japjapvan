import { DEFAULT_CRITERIA, type ListingCriteria } from "@/data/criteria";
import { PRODUCTS } from "@/data/products";
import type { PoLine, ScoredProduct, WeekPlan } from "@/data/types";
import { rankProducts, suggestedQty } from "@/lib/scoring";
import { isoWeekLabel } from "@/lib/utils";

export const TARGET_SHORTLIST = 50;

export function scoredCatalog(criteria: ListingCriteria = DEFAULT_CRITERIA) {
  return rankProducts(PRODUCTS, TARGET_SHORTLIST, criteria);
}

export function shortlist(criteria: ListingCriteria = DEFAULT_CRITERIA): ScoredProduct[] {
  return rankProducts(PRODUCTS, TARGET_SHORTLIST, criteria).filter((p) => p.score.selected);
}

export function watchlist(criteria: ListingCriteria = DEFAULT_CRITERIA): ScoredProduct[] {
  return scoredCatalog(criteria).filter((p) => !p.score.selected);
}

export function defaultWeekPlan(criteria: ListingCriteria = DEFAULT_CRITERIA): WeekPlan {
  const lines: PoLine[] = [];
  for (const p of shortlist(criteria)) {
    const qty = suggestedQty(p);
    if (qty <= 0) continue;
    lines.push({ productId: p.id, qty, status: "draft", note: p.notes });
  }
  return { week: isoWeekLabel(), lines, updatedAt: new Date().toISOString() };
}

export function planTotals(plan: WeekPlan, catalog: ScoredProduct[]) {
  let units = 0;
  let cost = 0;
  let retail = 0;
  for (const line of plan.lines) {
    const p = catalog.find((x) => x.id === line.productId);
    if (!p) continue;
    units += line.qty;
    cost += line.qty * p.landedCad;
    retail += line.qty * p.sellCad;
  }
  return { units, cost, retail, margin: retail > 0 ? (retail - cost) / retail : 0 };
}
