import raw from "./drugstore-heroes.json";
import { aisleFor, type Aisle } from "./aisles";
import type { Product } from "./types";

export type DrugstoreShelf = "both" | "matsukiyo" | "mannings" | "japjapvan";

const MAP = raw as Record<string, DrugstoreShelf>;

export function drugstoreShelf(id: string): DrugstoreShelf {
  return MAP[id] ?? "japjapvan";
}

export function drugstoreScore(id: string) {
  const shelf = drugstoreShelf(id);
  if (shelf === "both") return 1;
  if (shelf === "mannings" || shelf === "matsukiyo") return 0.72;
  return 0.42;
}

export function merchMeta(p: Pick<Product, "id" | "category">) {
  return {
    aisle: aisleFor(p.id, categoryToAisle(p.category)),
    drugstore: drugstoreShelf(p.id),
  };
}

function categoryToAisle(category: Product["category"]): Aisle {
  if (category === "sunscreen") return "sunscreen";
  if (category === "hair") return "hair";
  if (category === "tools") return "tools";
  if (category === "stationery") return "stationery";
  if (category === "makeup") return "makeup";
  if (category === "daily") return "daily";
  return "moisturize";
}
