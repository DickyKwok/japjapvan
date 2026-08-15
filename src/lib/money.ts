export type Currency = "CAD" | "HKD" | "JPY";

/** Mid-2026 desk rates — used only to show the other currency, never to invoice. */
export const FX = {
  cadJpy: 108,
  cadHkd: 5.7,
  asOf: "2026-08-16",
} as const;

export function formatMoney(
  amount: number,
  currency: Currency,
  opts?: { compact?: boolean },
) {
  const compact = opts?.compact ?? false;
  const digits = currency === "JPY" ? 0 : compact ? 0 : 2;
  const locale = currency === "JPY" ? "ja-JP" : currency === "HKD" ? "en-HK" : "en-CA";
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
  return `${formatted} ${currency}`;
}

/** Japan wholesale estimate: strip typical freight/duty from landed CAD. */
export function wholesaleJpyFromLandedCad(landedCad: number) {
  return Math.round(landedCad * FX.cadJpy * 0.62);
}

export function cadFromHkd(hkdAmount: number) {
  return hkdAmount / FX.cadHkd;
}
