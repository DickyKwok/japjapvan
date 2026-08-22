import type { BuyQuote, Product } from "@/data/types";
import raw from "@/data/buy-quotes.json";
import { landedFromQuote, sellFromQuote } from "@/lib/landed";
import { marginPct, profitCad } from "@/lib/scoring-core";

const BUNDLE = raw as { asOf: string; quotes: Record<string, BuyQuote> };

export const BUY_QUOTES = BUNDLE.quotes;
export const QUOTES_AS_OF = BUNDLE.asOf;

export type PricedProduct = Product & {
  buyCad?: number;
  freightCad?: number;
  gstCad?: number;
  shelfLinked: boolean;
};

export function quoteFor(id: string): BuyQuote | undefined {
  return BUY_QUOTES[id];
}

type Priceable = Pick<Product, "id" | "sellCad" | "landedCad" | "weightG">;

export function applyQuote<T extends Priceable>(p: T): T & {
  buyQuote?: BuyQuote;
  buyCad?: number;
  freightCad?: number;
  gstCad?: number;
  shelfLinked: boolean;
} {
  const q = quoteFor(p.id);
  if (!q) {
    return { ...p, shelfLinked: false, buyQuote: undefined };
  }
  const bits = landedFromQuote(q, p.weightG);
  const sellCad = sellFromQuote(p.sellCad, bits.landedCad);
  return {
    ...p,
    buyQuote: q,
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
