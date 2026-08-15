import { writeFileSync } from "node:fs";

// Mirrors src/data/products.ts — run after catalog edits:
//   node tools/sync_candidates.mjs
// The dashboard reads TypeScript; Python tools read this CSV.

const header = [
  "id",
  "brand",
  "name",
  "category",
  "origin",
  "sku",
  "keyword",
  "landed_cad",
  "sell_cad",
  "weight_g",
  "bulky",
  "regulatory",
  "uniqueness",
  "repeat",
  "preorder_fit",
  "supplier",
  "moq",
  "lead_days",
  "ca_trend",
  "jp_trend",
  "hk_trend",
  "rising",
  "stock",
  "incoming",
  "weekly_velocity",
  "preorders",
  "notes",
];

const src = await import("../src/data/products.ts");
const rows = src.PRODUCTS.map((p) =>
  [
    p.id,
    p.brand,
    csv(p.name),
    p.category,
    p.origin,
    p.sku,
    csv(p.keyword),
    p.landedCad,
    p.sellCad,
    p.weightG,
    p.bulky,
    p.regulatory,
    p.uniqueness,
    p.repeat,
    p.preorderFit,
    csv(p.supplier),
    p.moq,
    p.leadDays,
    p.caTrend,
    p.jpTrend,
    p.hkTrend,
    p.rising ? "true" : "false",
    p.stock,
    p.incoming,
    p.weeklyVelocity,
    p.preorders,
    csv(p.notes),
  ].join(","),
);

function csv(s) {
  const t = String(s);
  if (/[",\n]/.test(t)) return `"${t.replaceAll('"', '""')}"`;
  return t;
}

writeFileSync(new URL("../data/candidates.csv", import.meta.url), [header.join(","), ...rows].join("\n") + "\n");
console.log(`wrote ${rows.length} rows`);
