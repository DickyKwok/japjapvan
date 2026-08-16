import type { Category, Origin } from "./types";

export const ALL_CATEGORIES: Category[] = [
  "skincare",
  "sunscreen",
  "hair",
  "tools",
  "stationery",
  "makeup",
  "daily",
];

export const ALL_ORIGINS: Origin[] = ["JP", "HK"];

export type ListingCriteria = {
  minCaGrowth12w: number;
  minCaIndex: number;
  minJpIndex: number;
  stableFloor: number;
  minMarginPct: number;
  maxWeightG: number;
  maxLeadDays: number;
  minUniqueness: number;
  categories: Category[];
  origins: Origin[];
};

export const DEFAULT_CRITERIA: ListingCriteria = {
  minCaGrowth12w: 12,
  minCaIndex: 55,
  minJpIndex: 25,
  stableFloor: -5,
  minMarginPct: 0.28,
  maxWeightG: 900,
  maxLeadDays: 30,
  minUniqueness: 0,
  categories: [...ALL_CATEGORIES],
  origins: [...ALL_ORIGINS],
};

export function criteriaLabel(c: ListingCriteria) {
  return `CA ≥ +${c.minCaGrowth12w}% or index ≥ ${c.minCaIndex} · JP ≥ ${c.minJpIndex} · margin ≥ ${Math.round(c.minMarginPct * 100)}%`;
}

export function cloneCriteria(c: ListingCriteria): ListingCriteria {
  return {
    ...c,
    categories: [...c.categories],
    origins: [...c.origins],
  };
}

export function criteriaEqual(a: ListingCriteria, b: ListingCriteria) {
  return JSON.stringify(a) === JSON.stringify(b);
}
