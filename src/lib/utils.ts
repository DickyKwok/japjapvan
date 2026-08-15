import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatMoney } from "@/lib/money";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Vancouver sell / landed — always labelled CAD so "$" is never ambiguous. */
export function cad(n: number) {
  return formatMoney(n, "CAD", { compact: true });
}

export function cadExact(n: number) {
  return formatMoney(n, "CAD");
}

/** Reverse-lane Hong Kong prices. */
export function hkd(n: number) {
  return formatMoney(n, "HKD", { compact: true });
}

export function hkdExact(n: number) {
  return formatMoney(n, "HKD");
}

/** Japan source / wholesale. */
export function jpy(n: number) {
  return formatMoney(n, "JPY");
}

export function pct(n: number, digits = 0) {
  return `${(n * 100).toFixed(digits)}%`;
}

export function growthLabel(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(0)}%`;
}

export function isoWeekLabel(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
