import type { ListingCriteria } from "@/data/criteria";
import { DEFAULT_CRITERIA } from "@/data/criteria";
import type { Product } from "@/data/types";
import type { ReverseSku } from "@/data/reverse";

export type Geo = "CA" | "JP" | "HK";

export type TrendPoint = {
  week: string;
  CA: number;
  JP: number;
  HK: number;
};

export type SnapshotSource = "google-trends" | "wikipedia-pageviews" | "calibrated-seed";

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
  const now = opts.now ?? new Date();
  const seed = hash32(opts.id);
  const caG = targetGrowth(opts.id, opts.rising);
  const thenCa = clamp(opts.ca / (1 + caG / 100));
  const thenJp = clamp(opts.jp / (1 + (opts.rising ? 8 : -4) / 100));
  const thenHk = clamp(opts.hk / (1 + (opts.rising ? 6 : -3) / 100));
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

export function evaluateGate(
  latest: { CA: number; JP: number; HK: number },
  caGrowth: number,
  criteria: ListingCriteria = DEFAULT_CRITERIA,
) {
  const sourceAlive = latest.JP >= criteria.minJpIndex;
  const growing = caGrowth >= criteria.minCaGrowth12w;
  const stableDemand = latest.CA >= criteria.minCaIndex && caGrowth >= criteria.stableFloor;
  const eligible = sourceAlive && (growing || stableDemand);
  return { eligible, growing, stableDemand, sourceAlive };
}

export function buildReasons(
  keyword: string,
  latest: { CA: number; JP: number; HK: number },
  caGrowth: number,
  criteria: ListingCriteria = DEFAULT_CRITERIA,
) {
  const { eligible, growing, sourceAlive } = evaluateGate(latest, caGrowth, criteria);
  const g = `${caGrowth > 0 ? "+" : ""}${caGrowth.toFixed(0)}%`;
  if (!sourceAlive) {
    return {
      eligible: false,
      gate: "watch" as const,
      reason: `Watch — Japan source index ${latest.JP} is below your JP ≥ ${criteria.minJpIndex} floor.`,
      whyListed: `Not listed. Japan search index for “${keyword}” is ${latest.JP}/100. Your saved rule requires JP ≥ ${criteria.minJpIndex}.`,
    };
  }
  if (growing) {
    return {
      eligible: true,
      gate: "pass" as const,
      reason: `Canada ${g} over 12 weeks for “${keyword}” (rule ≥ +${criteria.minCaGrowth12w}%)`,
      whyListed: `Listed because Canada search interest in “${keyword}” grew ${g} over 12 weeks. Your rule lists a SKU at ≥ +${criteria.minCaGrowth12w}% while Japan stays ≥ ${criteria.minJpIndex} (now ${latest.JP}/100).`,
    };
  }
  if (eligible) {
    return {
      eligible: true,
      gate: "pass" as const,
      reason: `Canada index ${latest.CA}/100 (12w ${g}) meets your ≥ ${criteria.minCaIndex} stable rule`,
      whyListed: `Listed because “${keyword}” holds a Canada index of ${latest.CA}/100 with a 12-week change of ${g}. Your rule accepts stable demand at index ≥ ${criteria.minCaIndex} and change ≥ ${criteria.stableFloor}%.`,
    };
  }
  return {
    eligible: false,
    gate: "watch" as const,
    reason: `Watch — Canada ${g}, index ${latest.CA}/100. Needs +${criteria.minCaGrowth12w}% or index ≥ ${criteria.minCaIndex}.`,
    whyListed: `Not listed. Canada for “${keyword}” is ${g} at index ${latest.CA}/100. Your saved rule requires growth ≥ +${criteria.minCaGrowth12w}% or a stable index ≥ ${criteria.minCaIndex}.`,
  };
}

export function snapshotFromProduct(
  p: Pick<Product, "id" | "keyword" | "caTrend" | "jpTrend" | "hkTrend" | "rising">,
  opts?: { source?: SnapshotSource; fetchedAt?: string; now?: Date; series?: TrendPoint[] },
): ProductSnapshot {
  const series =
    opts?.series ??
    buildSeries({
      id: p.id,
      ca: p.caTrend,
      jp: p.jpTrend,
      hk: p.hkTrend,
      rising: p.rising,
      now: opts?.now,
    });
  const latest = series[series.length - 1] ?? { week: "", CA: p.caTrend, JP: p.jpTrend, HK: p.hkTrend };
  const caGrowth12w = growth12w(series, "CA");
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
    jpGrowth12w: growth12w(series, "JP"),
    hkGrowth12w: growth12w(series, "HK"),
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
    whyListed: `Reverse lane: Hong Kong search for “${p.keyword}” is ${hkGrowth > 0 ? "+" : ""}${hkGrowth.toFixed(0)}% over 12 weeks.`,
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
      "12-week growth (CA / JP / HK). Prefers live Google Trends, then Wikipedia pageviews (en/ja/zh), else a calibrated seed. Shop listing is decided by the saved criteria, not by this file alone.",
    products: productsMap,
  };
}
