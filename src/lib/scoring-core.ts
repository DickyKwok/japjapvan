import type { Product } from "@/data/types";

export function marginPct(p: Pick<Product, "sellCad" | "landedCad">) {
  if (p.sellCad <= 0) return 0;
  return (p.sellCad - p.landedCad) / p.sellCad;
}

export function profitCad(p: Pick<Product, "sellCad" | "landedCad">) {
  return Math.round((p.sellCad - p.landedCad) * 100) / 100;
}
