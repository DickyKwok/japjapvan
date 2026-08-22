export type Category =
  | "skincare"
  | "sunscreen"
  | "hair"
  | "tools"
  | "stationery"
  | "makeup"
  | "daily";

export type Origin = "JP" | "HK";
export type Regulatory = "none" | "cnf" | "food";
export type Lane = "jp-to-ca" | "ca-to-hk";

export type BuySource =
  | "mannings"
  | "watsons"
  | "matsukiyo-hk"
  | "amazon-jp"
  | "official"
  | "cosme";

export type BuyQuote = {
  source: BuySource;
  sourceLabel: string;
  url: string;
  currency: "HKD" | "JPY";
  shelf: number;
  regular?: number;
  asOf: string;
  note?: string;
};

export type Product = {
  id: string;
  brand: string;
  name: string;
  category: Category;
  origin: Origin;
  sku: string;
  keyword: string;
  landedCad: number;
  sellCad: number;
  weightG: number;
  bulky: number;
  regulatory: Regulatory;
  uniqueness: number;
  repeat: number;
  preorderFit: number;
  supplier: string;
  moq: number;
  leadDays: number;
  caTrend: number;
  jpTrend: number;
  hkTrend: number;
  rising: boolean;
  stock: number;
  incoming: number;
  weeklyVelocity: number;
  preorders: number;
  notes: string;
  discovered?: boolean;
  sourceTopic?: string;
  sourceGeo?: "CA" | "JP" | "HK";
  buyQuote?: BuyQuote;
};

export type ScoreBreakdown = {
  trends: number;
  margin: number;
  shipping: number;
  regulatory: number;
  uniqueness: number;
  repeat: number;
  brandDiversity: number;
  drugstore: number;
  total: number;
  selected: boolean;
  reasons: string[];
};

export type DemandSource = "google-trends" | "wikipedia-pageviews" | "rising-rss" | "none";

export type ProductSignal = {
  eligible: boolean;
  gate: "pass" | "watch";
  source: DemandSource;
  hasLiveDemand: boolean;
  fetchedAt: string;
  keyword: string;
  googleTrendsUrl: string;
  evidenceUrl: string;
  evidenceLabel: string;
  caGrowth12w: number;
  jpGrowth12w: number;
  hkGrowth12w: number;
  latest: { CA: number; JP: number; HK: number };
  reason: string;
  whyListed: string;
  filterPass: boolean;
  criteriaVersion: number;
};

export type ScoredProduct = Product & { score: ScoreBreakdown; signal: ProductSignal };

export type PoLine = {
  productId: string;
  qty: number;
  status: "draft" | "ordered" | "in-transit" | "received";
  note: string;
};

export type WeekPlan = {
  week: string;
  lines: PoLine[];
  updatedAt: string;
};
