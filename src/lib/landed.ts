import { FX } from "@/lib/money";
import { DEFAULT_CRITERIA } from "@/data/criteria";
import type { BuyQuote } from "@/data/types";

/** Year 1 air-consolidate working band (docs/research/05-ops-compliance): CAD 16–24/kg. */
export const AIR_CAD_PER_KG = 20;
export const DDP_GST_RATE = 0.05;
export const PRICE_AS_OF = "2026-08-22";

export function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export function buyCadFromQuote(q: BuyQuote) {
  if (q.currency === "HKD") return q.shelf / FX.cadHkd;
  return q.shelf / FX.cadJpy;
}

export function freightCadFromWeight(weightG: number) {
  return (weightG / 1000) * AIR_CAD_PER_KG;
}

/** Shelf CAD + air kg + DDP GST 5% on the shelf (declared) value. Do not add the old 38% on top. */
export function landedFromQuote(q: BuyQuote, weightG: number) {
  const buyCad = buyCadFromQuote(q);
  const freightCad = freightCadFromWeight(weightG);
  const gstCad = buyCad * DDP_GST_RATE;
  const landedCad = roundMoney(buyCad + freightCad + gstCad);
  return {
    buyCad: roundMoney(buyCad),
    freightCad: roundMoney(freightCad),
    gstCad: roundMoney(gstCad),
    landedCad,
  };
}

export function minSellCad(landedCad: number, minMargin = DEFAULT_CRITERIA.minMarginPct) {
  if (minMargin >= 1) return Math.ceil(landedCad);
  return Math.ceil(landedCad / (1 - minMargin) - 1e-9);
}

/** Never cut a working price. Raise only when the live shelf + air would lose money. */
export function sellFromQuote(currentSell: number, landedCad: number) {
  return Math.max(currentSell, minSellCad(landedCad));
}
