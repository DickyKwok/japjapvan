import type { ListingCriteria } from "@/data/criteria";
import { DEFAULT_CRITERIA } from "@/data/criteria";
import { PRODUCTS } from "@/data/products";
import { snapshotFor } from "@/lib/signals";
import { evaluateListing } from "@/lib/listing";

export type HistoryKind = "criteria" | "daily" | "as-of";

export type ListingVersion = {
  version: number;
  savedAt: string;
  label: string;
  kind: HistoryKind;
  criteria: ListingCriteria;
  listedIds: string[];
  watchIds: string[];
  growth: Record<string, number>;
};

const KEY = "japjapvan-history";

function snapshotNow(criteria: ListingCriteria) {
  const listedIds: string[] = [];
  const watchIds: string[] = [];
  const growth: Record<string, number> = {};
  for (const p of PRODUCTS) {
    const snap = snapshotFor(p.id);
    const verdict = evaluateListing(p, snap, criteria);
    growth[p.id] = snap?.caGrowth12w ?? 0;
    if (verdict.listed) listedIds.push(p.id);
    else watchIds.push(p.id);
  }
  return { listedIds, watchIds, growth };
}

export function readHistory(): ListingVersion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ListingVersion[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeHistory(rows: ListingVersion[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(rows.slice(-40)));
}

export function appendHistoryVersion(
  meta: Omit<ListingVersion, "listedIds" | "watchIds" | "growth"> &
    Partial<Pick<ListingVersion, "listedIds" | "watchIds" | "growth">>,
) {
  const computed = snapshotNow(meta.criteria);
  const next: ListingVersion = {
    ...meta,
    listedIds: meta.listedIds ?? computed.listedIds,
    watchIds: meta.watchIds ?? computed.watchIds,
    growth: meta.growth ?? computed.growth,
  };
  const prev = readHistory().filter((v) => v.savedAt !== next.savedAt);
  writeHistory([...prev, next]);
  return next;
}

export function seedHistoryIfEmpty(criteria: ListingCriteria = DEFAULT_CRITERIA) {
  if (typeof window === "undefined") return;
  if (readHistory().length > 0) return;
  const versions: ListingVersion[] = [];
  const first = PRODUCTS[0] ? snapshotFor(PRODUCTS[0].id) : undefined;
  const series = first?.series ?? [];
  const cuts = [10, 14, 18, 22, series.length - 1].filter((i) => i > 8 && i < series.length);
  cuts.forEach((end, i) => {
    const listedIds: string[] = [];
    const watchIds: string[] = [];
    const growth: Record<string, number> = {};
    const week = series[end]?.week ?? `cut-${end}`;
    for (const p of PRODUCTS) {
      const snap = snapshotFor(p.id);
      if (!snap) continue;
      const slice = snap.series.slice(0, end + 1);
      const latest = slice[slice.length - 1];
      const fake = { ...snap, series: slice, latest: { CA: latest.CA, JP: latest.JP, HK: latest.HK } };
      const verdict = evaluateListing(p, fake, criteria);
      growth[p.id] = verdict.caGrowth12w;
      if (verdict.listed) listedIds.push(p.id);
      else watchIds.push(p.id);
    }
    versions.push({
      version: i + 1,
      savedAt: `${week}T00:00:00.000Z`,
      label: `As-of ${week}`,
      kind: "as-of",
      criteria,
      listedIds,
      watchIds,
      growth,
    });
  });
  writeHistory(versions);
}

export function diffVersions(prev: ListingVersion | undefined, curr: ListingVersion) {
  const was = new Set(prev?.listedIds ?? []);
  const now = new Set(curr.listedIds);
  const added = curr.listedIds.filter((id) => !was.has(id));
  const dropped = (prev?.listedIds ?? []).filter((id) => !now.has(id));
  return { added, dropped };
}
