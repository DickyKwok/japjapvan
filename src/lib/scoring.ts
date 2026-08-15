import type { Product, ScoreBreakdown, ScoredProduct } from "@/data/types";
import { signalFor } from "@/lib/signals";
import { growthLabel } from "@/lib/utils";

export const WEIGHTS = {
  trends: 0.25,
  margin: 0.2,
  shipping: 0.15,
  regulatory: 0.1,
  uniqueness: 0.1,
  repeat: 0.1,
  brandDiversity: 0.1,
};

export function marginPct(p: Product) {
  return (p.sellCad - p.landedCad) / p.sellCad;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function trendScore(p: Product) {
  const signal = signalFor(p);
  const demand = signal.latest.CA / 100;
  const sourceHot = Math.max(signal.latest.JP, signal.latest.HK) / 100;
  const growth = clamp01((signal.caGrowth12w + 20) / 80);
  return clamp01(demand * 0.35 + sourceHot * 0.2 + growth * 0.45);
}

function marginScore(p: Product) {
  return clamp01((marginPct(p) - 0.28) / 0.42);
}

function shippingScore(p: Product) {
  const bulk = 1 - (p.bulky - 1) / 9;
  const weight = 1 - Math.min(p.weightG, 1200) / 1200;
  return clamp01(bulk * 0.6 + weight * 0.4);
}

function regulatoryScore(p: Product) {
  if (p.regulatory === "food") return 0.35;
  if (p.regulatory === "cnf") return 0.72;
  return 1;
}

export function scoreProduct(p: Product, brandCount: Record<string, number>): ScoreBreakdown {
  const t = trendScore(p);
  const m = marginScore(p);
  const s = shippingScore(p);
  const r = regulatoryScore(p);
  const u = p.uniqueness / 10;
  const rp = p.repeat / 10;
  const brandPenalty = Math.max(0, (brandCount[p.brand] ?? 1) - 1) * 0.35;
  const b = clamp01(1 - brandPenalty);
  const signal = signalFor(p);

  const total =
    t * WEIGHTS.trends +
    m * WEIGHTS.margin +
    s * WEIGHTS.shipping +
    r * WEIGHTS.regulatory +
    u * WEIGHTS.uniqueness +
    rp * WEIGHTS.repeat +
    b * WEIGHTS.brandDiversity;

  const reasons: string[] = [];
  if (signal.caGrowth12w >= 12) {
    reasons.push(`Canada Google Trends ${growthLabel(signal.caGrowth12w)} over 12 weeks`);
  } else if (signal.eligible) {
    reasons.push(`Canada Trends index ${signal.latest.CA}/100 (stable)`);
  }
  if (marginPct(p) >= 0.5) reasons.push("Gross margin ≥ 50%");
  if (p.uniqueness >= 8) reasons.push("Hard to find locally");
  if (p.preorderFit >= 8) reasons.push("Strong pre-order fit");
  if (p.regulatory === "none") reasons.push("Simple import");
  if (p.repeat >= 8) reasons.push("Repeat purchase");
  if (reasons.length === 0) reasons.push(signal.reason);

  return {
    trends: t,
    margin: m,
    shipping: s,
    regulatory: r,
    uniqueness: u,
    repeat: rp,
    brandDiversity: b,
    total,
    selected: false,
    reasons,
  };
}

export function rankProducts(products: Product[], target = 20): ScoredProduct[] {
  const brands: Record<string, number> = {};
  const greedy: ScoredProduct[] = [];
  const remaining = [...products];

  while (greedy.length < target && remaining.length) {
    const scored = remaining.map((p) => {
      const next = { ...brands, [p.brand]: (brands[p.brand] ?? 0) + 1 };
      return { ...p, score: scoreProduct(p, next), signal: signalFor(p) };
    });
    scored.sort((a, b) => {
      if (a.signal.eligible !== b.signal.eligible) return a.signal.eligible ? -1 : 1;
      return b.score.total - a.score.total;
    });
    const pick = scored[0];
    greedy.push({ ...pick, score: { ...pick.score, selected: true } });
    brands[pick.brand] = (brands[pick.brand] ?? 0) + 1;
    const idx = remaining.findIndex((p) => p.id === pick.id);
    remaining.splice(idx, 1);
  }

  const rest = remaining.map((p) => {
    const next = { ...brands, [p.brand]: (brands[p.brand] ?? 0) + 1 };
    return { ...p, score: { ...scoreProduct(p, next), selected: false }, signal: signalFor(p) };
  });

  return [...greedy, ...rest].sort((a, b) => {
    if (a.score.selected !== b.score.selected) return a.score.selected ? -1 : 1;
    return b.score.total - a.score.total;
  });
}

export function suggestedQty(p: Product, coverWeeks = 5) {
  const need = p.weeklyVelocity * coverWeeks + p.preorders - p.stock - p.incoming;
  const raw = Math.max(0, Math.ceil(need));
  if (raw === 0) return 0;
  return Math.max(p.moq, Math.ceil(raw / p.moq) * p.moq);
}
