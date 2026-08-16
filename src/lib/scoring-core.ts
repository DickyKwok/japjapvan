import type { Product } from "@/data/types";

export function marginPct(p: Product) {
  return (p.sellCad - p.landedCad) / p.sellCad;
}
