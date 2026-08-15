import { PRODUCTS } from "@/data/products";
import type { PoLine, ScoredProduct, WeekPlan } from "@/data/types";
import { rankProducts, suggestedQty } from "@/lib/scoring";
import { signalFor } from "@/lib/signals";
import { isoWeekLabel } from "@/lib/utils";

export const TARGET_SHORTLIST = 20;

export function scoredCatalog() {
  return rankProducts(PRODUCTS, TARGET_SHORTLIST);
}

/** Only SKUs the Trends gate passed — these are the ones we put on Shopify. */
export function shortlist(): ScoredProduct[] {
  const eligible = PRODUCTS.filter((p) => signalFor(p).eligible);
  const pool = eligible.length >= 15 ? eligible : PRODUCTS;
  return rankProducts(pool, TARGET_SHORTLIST).filter((p) => p.score.selected);
}

export function watchlist(): ScoredProduct[] {
  return scoredCatalog().filter((p) => !p.signal.eligible);
}

export function defaultWeekPlan(): WeekPlan {
  const lines: PoLine[] = [];
  for (const p of shortlist()) {
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
