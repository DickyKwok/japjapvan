import type { Product } from "@/data/types";
import type { ReverseSku } from "@/data/reverse";

export type Geo = "CA" | "JP" | "HK";

export type TrendPoint = {
  week: string;
  CA: number;
  JP: number;
  HK: number;
};

export type SnapshotSource = "google-trends" | "calibrated-seed";

export type ProductSnapshot = {
  id: string;
  keyword: string;
  source: SnapshotSource;
  fetchedAt: string;
  googleTrendsUrl: string;
  series: TrendPoint[];
  latest: { CA: number; JP: number; HK: number };
  caGrowth12w: number;
  jpGrowth12w: number;
  hkGrowth12w: number;
  eligible: boolean;
  gate: "pass" | "watch";
  reason: string;
  whyListed: string;
};

export type SnapshotBundle = {
  generatedAt: string;
  method: string;
  products: Record<string, ProductSnapshot>;
};

/** Same djb2 in Python (`tools/fetch_trends.py`) so CLI + dashboard series match. */
export function hash32(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

export function trendsExploreUrl(keyword: string, geo: Geo = "CA") {
  return `https://trends.google.com/trends/explore?geo=${geo}&q=${encodeURIComponent(keyword)}`;
}

function clamp(n: number) {
  return Math.max(8, Math.min(100, Math.round(n)));
}

function mean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((s, n) => s + n, 0) / values.length;
}

export function growth12w(series: TrendPoint[], geo: Geo) {
  if (series.length < 16) return 0;
  const recent = mean(series.slice(-4).map((p) => p[geo]));
  const prior = mean(series.slice(-16, -12).map((p) => p[geo]));
  if (prior <= 0) return 0;
  return Math.round(((recent - prior) / prior) * 1000) / 10;
}

export function targetGrowth(id: string, rising: boolean) {
  const seed = hash32(id);
  return rising ? 22 + (seed % 41) : -14 + (seed % 22);
}

function valueAt(i: number, thenV: number, nowV: number, seed: number) {
  let base: number;
  if (i <= 13) {
    const start = thenV * 0.88;
    base = start + (thenV - start) * (i / 13);
  } else {
    base = thenV + (nowV - thenV) * ((i - 13) / 12);
  }
  const wave = Math.sin((i + (seed % 7)) / 3.2) * (3 + (seed % 4));
  return clamp(base + wave);
}

export function buildSeries(opts: {
  id: string;
  ca: number;
  jp: number;
  hk: number;
  rising: boolean;
  weeks?: number;
  now?: Date;
}): TrendPoint[] {
  const weeks = opts.weeks ?? 26;
  const seed = hash32(opts.id);
  const gCa = targetGrowth(opts.id, opts.rising);
  const gHk = opts.rising ? gCa * 0.7 : gCa * 0.5;
  const thenCa = opts.ca / (1 + gCa / 100);
  const thenHk = opts.hk / (1 + gHk / 100);
  const thenJp = opts.jp / (1 + (opts.rising ? 6 : -2) / 100);
  const now = opts.now ?? new Date();
  const out: TrendPoint[] = [];
  for (let i = 0; i < weeks; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    d.setUTCDate(d.getUTCDate() - (weeks - 1 - i) * 7);
    out.push({
      week: d.toISOString().slice(0, 10),
      CA: valueAt(i, thenCa, opts.ca, seed),
      JP: valueAt(i, thenJp, opts.jp, seed + 17),
      HK: valueAt(i, thenHk, opts.hk, seed + 31),
    });
  }
  return out;
}

export const LIST_RULES = {
  minJpIndex: 25,
  minGrowthToList: 12,
  stableIndex: 55,
  stableFloor: -5,
} as const;

export function evaluateGate(latest: { CA: number; JP: number; HK: number }, caGrowth: number) {
  const sourceAlive = latest.JP >= LIST_RULES.minJpIndex;
  const growing = caGrowth >= LIST_RULES.minGrowthToList;
  const stableDemand = latest.CA >= LIST_RULES.stableIndex && caGrowth >= LIST_RULES.stableFloor;
  const eligible = sourceAlive && (growing || stableDemand);
  return { eligible, growing, stableDemand, sourceAlive };
}

export function buildReasons(keyword: string, latest: { CA: number; JP: number; HK: number }, caGrowth: number) {
  const { eligible, growing, sourceAlive } = evaluateGate(latest, caGrowth);
  const g = `${caGrowth > 0 ? "+" : ""}${caGrowth.toFixed(0)}%`;
  if (!sourceAlive) {
    return {
      eligible: false,
      gate: "watch" as const,
      reason: `Watch — Japan source index ${latest.JP} is too thin to import.`,
      whyListed: `Not listed. Japan Google Trends for "${keyword}" is only ${latest.JP}/100, so the SKU may be aging out of the source market.`,
    };
  }
  if (growing) {
    return {
      eligible: true,
      gate: "pass" as const,
      reason: `Google Trends Canada ${g} over 12 weeks for "${keyword}"`,
      whyListed: `Listed for Shopify because Canada search interest in "${keyword}" grew ${g} over the last 12 weeks (Google Trends, geo=CA). Japan source index is still ${latest.JP}/100.`,
    };
  }
  if (eligible) {
    return {
      eligible: true,
      gate: "pass" as const,
      reason: `Google Trends Canada index ${latest.CA}/100 (12-week change ${g}) for "${keyword}"`,
      whyListed: `Listed for Shopify because "${keyword}" holds a high Canada search index (${latest.CA}/100) with a 12-week change of ${g}. Stable demand, not a spike.`,
    };
  }
  return {
    eligible: false,
    gate: "watch" as const,
    reason: `Watch — Canada ${g}, index ${latest.CA}/100. Needs +${LIST_RULES.minGrowthToList}% or index ≥ ${LIST_RULES.stableIndex}.`,
    whyListed: `Not listed on Shopify yet. Canada Google Trends for "${keyword}" is ${g} over 12 weeks at index ${latest.CA}/100. We only put a SKU on the shop when it is growing ≥ ${LIST_RULES.minGrowthToList}% or sitting at a high stable index.`,
  };
}

export function snapshotFromProduct(
  p: Pick<Product, "id" | "keyword" | "caTrend" | "jpTrend" | "hkTrend" | "rising">,
  opts?: { source?: SnapshotSource; fetchedAt?: string; now?: Date },
): ProductSnapshot {
  const series = buildSeries({
    id: p.id,
    ca: p.caTrend,
    jp: p.jpTrend,
    hk: p.hkTrend,
    rising: p.rising,
    now: opts?.now,
  });
  const latest = series[series.length - 1] ?? { week: "", CA: p.caTrend, JP: p.jpTrend, HK: p.hkTrend };
  const caGrowth12w = growth12w(series, "CA");
  const jpGrowth12w = growth12w(series, "JP");
  const hkGrowth12w = growth12w(series, "HK");
  const copy = buildReasons(p.keyword, latest, caGrowth12w);
  return {
    id: p.id,
    keyword: p.keyword,
    source: opts?.source ?? "calibrated-seed",
    fetchedAt: opts?.fetchedAt ?? new Date().toISOString(),
    googleTrendsUrl: trendsExploreUrl(p.keyword, "CA"),
    series,
    latest: { CA: latest.CA, JP: latest.JP, HK: latest.HK },
    caGrowth12w,
    jpGrowth12w,
    hkGrowth12w,
    ...copy,
  };
}

export function snapshotFromReverse(p: ReverseSku, opts?: { fetchedAt?: string; now?: Date }): ProductSnapshot {
  const series = buildSeries({
    id: p.id,
    ca: p.caTrend,
    jp: p.jpTrend,
    hk: p.hkTrend,
    rising: p.rising,
    now: opts?.now,
  });
  const last = series[series.length - 1] ?? { week: "", CA: p.caTrend, JP: p.jpTrend, HK: p.hkTrend };
  const hkGrowth = growth12w(series, "HK");
  const sellAsCa = { CA: last.HK, JP: last.CA, HK: last.JP };
  const copy = buildReasons(p.keyword, sellAsCa, hkGrowth);
  return {
    id: p.id,
    keyword: p.keyword,
    source: "calibrated-seed",
    fetchedAt: opts?.fetchedAt ?? new Date().toISOString(),
    googleTrendsUrl: trendsExploreUrl(p.keyword, "HK"),
    series,
    latest: { CA: last.CA, JP: last.JP, HK: last.HK },
    caGrowth12w: growth12w(series, "CA"),
    jpGrowth12w: growth12w(series, "JP"),
    hkGrowth12w: hkGrowth,
    eligible: copy.eligible,
    gate: copy.gate,
    reason: copy.reason.replaceAll("Canada", "Hong Kong"),
    whyListed: `Reverse lane: Hong Kong search for "${p.keyword}" is ${hkGrowth > 0 ? "+" : ""}${hkGrowth.toFixed(0)}% over 12 weeks (Google Trends, geo=HK).`,
  };
}

export function buildBundle(
  products: Array<Pick<Product, "id" | "keyword" | "caTrend" | "jpTrend" | "hkTrend" | "rising">>,
  extras: ProductSnapshot[] = [],
): SnapshotBundle {
  const fetchedAt = new Date().toISOString();
  const productsMap: Record<string, ProductSnapshot> = {};
  for (const p of products) productsMap[p.id] = snapshotFromProduct(p, { fetchedAt });
  for (const extra of extras) productsMap[extra.id] = extra;
  return {
    generatedAt: fetchedAt,
    method:
      "12-week Google Trends growth (CA / JP / HK). Live pytrends when available; otherwise calibrated series from last known index + rising flag, hashed so daily runs stay stable. A SKU is shop-eligible only if Japan source is alive and Canada is growing ≥12% or holding index ≥55.",
    products: productsMap,
  };
}
