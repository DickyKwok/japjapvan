export type ReverseSku = {
  id: string;
  brand: string;
  name: string;
  origin: "CA";
  dest: "HK" | "JP";
  keyword: string;
  landedHkd: number;
  sellHkd: number;
  hkTrend: number;
  jpTrend: number;
  caTrend: number;
  rising: boolean;
  notes: string;
  weeklyVelocity: number;
};

export const REVERSE_SKUS: ReverseSku[] = [
  { id: "ca-maple-amber", brand: "Escuminac", name: "Amber Maple Syrup 250ml", origin: "CA", dest: "HK", keyword: "Canadian maple syrup", landedHkd: 68, sellHkd: 128, hkTrend: 71, jpTrend: 54, caTrend: 40, rising: true, notes: "Gift staple HK ↔ family parcels.", weeklyVelocity: 8 },
  { id: "ca-icewine", brand: "Inniskillin", name: "Vidal Icewine 187ml", origin: "CA", dest: "HK", keyword: "icewine Canada", landedHkd: 180, sellHkd: 298, hkTrend: 48, jpTrend: 22, caTrend: 35, rising: false, notes: "Alcohol rules — hold until licence.", weeklyVelocity: 1 },
  { id: "ca-honey", brand: "BeeMaid", name: "Prairie Honey 500g", origin: "CA", dest: "HK", keyword: "Canadian honey", landedHkd: 52, sellHkd: 98, hkTrend: 44, jpTrend: 31, caTrend: 28, rising: false, notes: "Food import into HK is simple.", weeklyVelocity: 3 },
  { id: "ca-vitamin", brand: "Webber Naturals", name: "Vitamin D3 1000IU 180s", origin: "CA", dest: "HK", keyword: "Webber Naturals D3", landedHkd: 78, sellHkd: 148, hkTrend: 66, jpTrend: 18, caTrend: 42, rising: true, notes: "Strong HK search. NPN story.", weeklyVelocity: 6 },
  { id: "ca-omega", brand: "Ascenta", name: "NutraSea Omega-3", origin: "CA", dest: "HK", keyword: "NutraSea omega", landedHkd: 112, sellHkd: 198, hkTrend: 39, jpTrend: 16, caTrend: 33, rising: false, notes: "Softgels ship well.", weeklyVelocity: 2 },
  { id: "ca-protein", brand: "Genuine Health", name: "fermented vegan proteins+", origin: "CA", dest: "HK", keyword: "Genuine Health protein", landedHkd: 168, sellHkd: 268, hkTrend: 28, jpTrend: 12, caTrend: 30, rising: false, notes: "Heavy. Sea only.", weeklyVelocity: 1 },
  { id: "ca-granola", brand: "Grizzly Nuts", name: "Maple pecan granola", origin: "CA", dest: "JP", keyword: "Canadian granola", landedHkd: 48, sellHkd: 88, hkTrend: 22, jpTrend: 36, caTrend: 18, rising: true, notes: "JP gift food. Watch shelf life.", weeklyVelocity: 2 },
  { id: "ca-skincare", brand: "Three Ships", name: "Dew Drops Mushroom Hyaluronic", origin: "CA", dest: "HK", keyword: "Three Ships Beauty", landedHkd: 142, sellHkd: 228, hkTrend: 31, jpTrend: 14, caTrend: 46, rising: true, notes: "Canadian indie beauty reverse.", weeklyVelocity: 1 },
];
