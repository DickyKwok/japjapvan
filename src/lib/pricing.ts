import type { BuyQuote, BuySource, Product, RankedOffer } from "@/data/types";
import raw from "@/data/buy-quotes.json";
import { buyCadFromQuote, landedFromQuote, roundMoney, sellFromQuote } from "@/lib/landed";
import { marginPct, profitCad } from "@/lib/scoring-core";

const BUNDLE = raw as { asOf: string; quotes: Record<string, BuyQuote | BuyQuote[]> };

export const BUY_QUOTES = BUNDLE.quotes;
export const QUOTES_AS_OF = BUNDLE.asOf;

const SEARCH_AS_OF = BUNDLE.asOf;

type Priceable = Pick<Product, "id" | "sellCad" | "landedCad" | "weightG" | "brand" | "name" | "keyword">;

export function shelfQuotesFor(id: string): BuyQuote[] {
  const rawQ = BUY_QUOTES[id];
  if (!rawQ) return [];
  const list = Array.isArray(rawQ) ? rawQ : [rawQ];
  return list.filter((q) => (q.kind ?? "shelf") === "shelf" && q.shelf > 0 && q.url);
}

function searchQuery(p: Pick<Product, "brand" | "name" | "keyword">) {
  return (p.keyword || `${p.brand} ${p.name}`).trim();
}

function searchOffer(source: BuySource, label: string, url: string, currency: "HKD" | "JPY"): RankedOffer {
  return {
    source,
    sourceLabel: label,
    url,
    currency,
    shelf: 0,
    asOf: SEARCH_AS_OF,
    kind: "search",
    buyCad: null,
  };
}

export function searchOffersFor(p: Pick<Product, "brand" | "name" | "keyword">): RankedOffer[] {
  const q = encodeURIComponent(searchQuery(p));
  return [
    searchOffer("mannings", "萬寧搜尋", `https://www.mannings.com.hk/search?text=${q}`, "HKD"),
    searchOffer("watsons", "屈臣氏搜尋", `https://www.watsons.com.hk/zh-hk/search?text=${q}`, "HKD"),
    searchOffer("matsukiyo-hk", "松本清香港搜尋", `https://www.matsukiyo.hk/?s=${q}`, "HKD"),
    searchOffer("amazon-jp", "Amazon.co.jp 搜尋", `https://www.amazon.co.jp/s?k=${q}`, "JPY"),
  ];
}

export function rankedOffers(p: Priceable): RankedOffer[] {
  const shelf: RankedOffer[] = shelfQuotesFor(p.id).map((q) => ({
    ...q,
    kind: "shelf",
    buyCad: roundMoney(buyCadFromQuote(q)),
  }));
  shelf.sort((a, b) => (a.buyCad ?? 9999) - (b.buyCad ?? 9999) || a.sourceLabel.localeCompare(b.sourceLabel));

  const have = new Set(shelf.map((o) => o.source));
  const searches = searchOffersFor(p).filter((o) => !have.has(o.source));
  return [...shelf, ...searches];
}

export function cheapestShelf(p: Priceable): BuyQuote | undefined {
  const shelf = rankedOffers(p).filter((o) => o.kind === "shelf");
  return shelf[0];
}

export function applyQuote<T extends Priceable>(p: T): T & {
  buyQuote?: BuyQuote;
  buyOffers: RankedOffer[];
  buyCad?: number;
  freightCad?: number;
  gstCad?: number;
  shelfLinked: boolean;
} {
  const offers = rankedOffers(p);
  const q = cheapestShelf(p);
  if (!q) {
    return { ...p, shelfLinked: false, buyQuote: undefined, buyOffers: offers };
  }
  const bits = landedFromQuote(q, p.weightG);
  const sellCad = sellFromQuote(p.sellCad, bits.landedCad);
  return {
    ...p,
    buyQuote: q,
    buyOffers: offers,
    buyCad: bits.buyCad,
    freightCad: bits.freightCad,
    gstCad: bits.gstCad,
    landedCad: bits.landedCad,
    sellCad,
    shelfLinked: true,
  };
}

export function unitEcon(p: Pick<Product, "sellCad" | "landedCad">) {
  return {
    margin: marginPct(p),
    profit: profitCad(p),
    coversFloor: marginPct(p) >= 0.28,
  };
}

export function offerRegion(q: Pick<BuyQuote, "source" | "currency">) {
  if (q.currency === "HKD" || q.source === "mannings" || q.source === "watsons" || q.source === "matsukiyo-hk") {
    return "HK" as const;
  }
  return "JP" as const;
}
