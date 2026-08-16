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

export type SnapshotSource = "google-trends" | "wikipedia-pageviews" | "rising-rss" | "none";

export type ProductSnapshot = {
  id: string;
  keyword: string;
  source: SnapshotSource;
  hasLiveDemand: boolean;
  fetchedAt: string;
  googleTrendsUrl: string;
  evidenceUrl: string;
  evidenceLabel: string;
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
  hasLiveDemand = false,
) {
  if (!hasLiveDemand) {
    return { eligible: false, growing: false, stableDemand: false, sourceAlive: false };
  }
  const sourceAlive = latest.JP >= criteria.minJpIndex;
  const growing = caGrowth >= criteria.minCaGrowth12w;
  const stableDemand = latest.CA >= criteria.minCaIndex && caGrowth >= criteria.stableFloor;
  const eligible = sourceAlive && (growing || stableDemand);
  return { eligible, growing, stableDemand, sourceAlive };
}

export function unverifiedCopy(keyword: string) {
  return {
    eligible: false,
    gate: "watch" as const,
    reason: `Demand unverified — Google Trends has no Canada series for “${keyword}”.`,
    whyListed: `Not listed on search growth. Google Trends Canada returns “not enough search data” for “${keyword}” (the empty chart you opened). We do not invent a +% to fill that gap. This SKU stays on watch until a real public series exists (Wikipedia pageviews for the brand, or a live Trends query with volume).`,
  };
}

export function buildReasons(
  keyword: string,
  latest: { CA: number; JP: number; HK: number },
  caGrowth: number,
  criteria: ListingCriteria = DEFAULT_CRITERIA,
  opts?: { hasLiveDemand?: boolean; source?: SnapshotSource; brandTitle?: string },
) {
  const live = Boolean(opts?.hasLiveDemand);
  if (!live) return unverifiedCopy(keyword);

  const { eligible, growing, sourceAlive } = evaluateGate(latest, caGrowth, criteria, true);
  const g = `${caGrowth > 0 ? "+" : ""}${caGrowth.toFixed(0)}%`;
  const brand = opts?.brandTitle || keyword;
  const srcNote =
    opts?.source === "wikipedia-pageviews"
      ? `Wikipedia pageviews for “${brand}” (brand article — not the SKU phrase, which has no Google Trends volume in Canada)`
      : opts?.source === "google-trends"
        ? `Google Trends for “${keyword}”`
        : `Live series for “${keyword}”`;

  if (!sourceAlive) {
    return {
      eligible: false,
      gate: "watch" as const,
      reason: `Watch — Japan source index ${latest.JP} is below your JP ≥ ${criteria.minJpIndex} floor. Source: ${srcNote}.`,
      whyListed: `Not listed. ${srcNote} shows Japan ${latest.JP}/100. Your rule requires JP ≥ ${criteria.minJpIndex}.`,
    };
  }
  if (growing) {
    return {
      eligible: true,
      gate: "pass" as const,
      reason: `${srcNote}: ${g} over 12 weeks (rule ≥ +${criteria.minCaGrowth12w}%)`,
      whyListed: `Listed because ${srcNote} grew ${g} over 12 weeks. Your rule lists at ≥ +${criteria.minCaGrowth12w}% while Japan stays ≥ ${criteria.minJpIndex} (now ${latest.JP}/100). This is not a Google Trends SKU chart — that phrase has insufficient Canada volume.`,
    };
  }
  if (eligible) {
    return {
      eligible: true,
      gate: "pass" as const,
      reason: `${srcNote}: index ${latest.CA}/100 (12w ${g}) meets ≥ ${criteria.minCaIndex} stable rule`,
      whyListed: `Listed because ${srcNote} holds index ${latest.CA}/100 with a 12-week change of ${g}. Not Google Trends for the exact SKU phrase.`,
    };
  }
  return {
    eligible: false,
    gate: "watch" as const,
    reason: `Watch — ${srcNote}: ${g}, index ${latest.CA}/100.`,
    whyListed: `Not listed. ${srcNote} is ${g} at index ${latest.CA}/100. Rule needs ≥ +${criteria.minCaGrowth12w}% or index ≥ ${criteria.minCaIndex}.`,
  };
}

export function snapshotFromProduct(
  p: Pick<Product, "id" | "keyword" | "caTrend" | "jpTrend" | "hkTrend" | "rising">,
  opts?: {
    source?: SnapshotSource;
    fetchedAt?: string;
    now?: Date;
    series?: TrendPoint[];
    evidenceUrl?: string;
    evidenceLabel?: string;
    brandTitle?: string;
  },
): ProductSnapshot {
  const live = Boolean(opts?.series && opts.series.length >= 16);
  const series = live ? opts!.series! : [];
  const latest = live
    ? series[series.length - 1]
    : { week: "", CA: 0, JP: 0, HK: 0 };
  const caGrowth12w = live ? growth12w(series, "CA") : 0;
  const source = live ? (opts?.source ?? "wikipedia-pageviews") : "none";
  const copy = buildReasons(p.keyword, { CA: latest.CA, JP: latest.JP, HK: latest.HK }, caGrowth12w, DEFAULT_CRITERIA, {
    hasLiveDemand: live,
    source,
    brandTitle: opts?.brandTitle,
  });
  return {
    id: p.id,
    keyword: p.keyword,
    source,
    hasLiveDemand: live,
    fetchedAt: opts?.fetchedAt ?? new Date().toISOString(),
    googleTrendsUrl: "",
    evidenceUrl: live ? (opts?.evidenceUrl ?? "") : "",
    evidenceLabel: live ? (opts?.evidenceLabel ?? "Live public series") : "No public series",
    series,
    latest: { CA: latest.CA, JP: latest.JP, HK: latest.HK },
    caGrowth12w,
    jpGrowth12w: live ? growth12w(series, "JP") : 0,
    hkGrowth12w: live ? growth12w(series, "HK") : 0,
    ...copy,
  };
}

export function snapshotFromReverse(p: ReverseSku, opts?: { fetchedAt?: string }): ProductSnapshot {
  const copy = unverifiedCopy(p.keyword);
  return {
    id: p.id,
    keyword: p.keyword,
    source: "none",
    hasLiveDemand: false,
    fetchedAt: opts?.fetchedAt ?? new Date().toISOString(),
    googleTrendsUrl: "",
    evidenceUrl: "",
    evidenceLabel: "No public series",
    series: [],
    latest: { CA: 0, JP: 0, HK: 0 },
    caGrowth12w: 0,
    jpGrowth12w: 0,
    hkGrowth12w: 0,
    eligible: false,
    gate: "watch",
    reason: copy.reason.replaceAll("Canada", "Hong Kong"),
    whyListed: `Reverse lane: no public Hong Kong search series for “${p.keyword}”. Not listed on invented growth.`,
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
      "Demand is live Wikipedia pageviews (brand article) only. Exact SKU Google Trends queries with no Canada volume are not used. No invented seed +%.",
    products: productsMap,
  };
}
