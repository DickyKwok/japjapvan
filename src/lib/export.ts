import type { Product, ScoredProduct, WeekPlan } from "@/data/types";
import { imageFileName, productImageUrl } from "@/lib/images";
import { wholesaleJpyFromLandedCad } from "@/lib/money";
import { marginPct } from "@/lib/scoring";
import { signalFor } from "@/lib/signals";

function csvEscape(value: string | number | boolean) {
  const t = String(value);
  if (/[",\n]/.test(t)) return `"${t.replaceAll('"', '""')}"`;
  return t;
}

function triggerDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadText(filename: string, body: string, type = "text/csv;charset=utf-8") {
  triggerDownload(filename, new Blob([body], { type }));
}

export function catalogCsv(products: Array<Product & { score?: ScoredProduct["score"] }>) {
  const header = [
    "id",
    "sku",
    "brand",
    "name",
    "category",
    "origin",
    "keyword",
    "landed_cad",
    "sell_cad",
    "margin_pct",
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
    "ca_growth_12w",
    "list_reason",
    "signal_source",
    "google_trends_url",
    "shopify_eligible",
    "sell_currency",
    "landed_currency",
    "wholesale_jpy",
    "wholesale_currency",
    "rising",
    "stock",
    "incoming",
    "weekly_velocity",
    "preorders",
    "score",
    "shortlist",
    "image",
    "notes",
  ];
  const rows = products.map((p) => {
    const signal = signalFor(p);
    return [
      p.id,
      p.sku,
      csvEscape(p.brand),
      csvEscape(p.name),
      p.category,
      p.origin,
      csvEscape(p.keyword),
      p.landedCad,
      p.sellCad,
      (marginPct(p) * 100).toFixed(1),
      p.weightG,
      p.bulky,
      p.regulatory,
      p.uniqueness,
      p.repeat,
      p.preorderFit,
      csvEscape(p.supplier),
      p.moq,
      p.leadDays,
      p.caTrend,
      p.jpTrend,
      p.hkTrend,
      signal.caGrowth12w,
      csvEscape(signal.reason),
      signal.source,
      signal.googleTrendsUrl,
      signal.eligible,
      "CAD",
      "CAD",
      wholesaleJpyFromLandedCad(p.landedCad),
      "JPY",
      p.rising,
      p.stock,
      p.incoming,
      p.weeklyVelocity,
      p.preorders,
      p.score ? Math.round(p.score.total * 100) : "",
      p.score?.selected ? "true" : "false",
      productImageUrl(p.id),
      csvEscape(p.notes),
    ].join(",");
  });
  return [header.join(","), ...rows].join("\n");
}

export function downloadCatalogCsv(
  products: Array<Product & { score?: ScoredProduct["score"] }>,
  filename = "japjapvan-products.csv",
) {
  downloadText(filename, catalogCsv(products));
}

export function shopifyCsv(products: Product[]) {
  const header = [
    "Handle",
    "Title",
    "Vendor",
    "Type",
    "Tags",
    "Published",
    "Option1 Name",
    "Option1 Value",
    "Variant Price",
    "Variant Inventory Qty",
    "Variant Inventory Tracker",
    "Image Src",
    "Status",
  ];
  const rows = products.map((p) => {
    const signal = signalFor(p);
    return [
      p.id,
      csvEscape(`${p.brand} ${p.name}`),
      csvEscape(p.brand),
      p.category,
      `japjapvan,${p.category},preorder,${p.origin},CAD,${signal.eligible ? "trends-listed" : "watch"}`,
      "true",
      "Title",
      "Default Title",
      p.sellCad,
      0,
      "shopify",
      productImageUrl(p.id),
      signal.eligible ? "active" : "draft",
    ].join(",");
  });
  return [header.join(","), ...rows].join("\n");
}

export function downloadShopifyCsv(products: Product[], filename = "japjapvan-shopify.csv") {
  downloadText(filename, shopifyCsv(products.filter((p) => signalFor(p).eligible)));
}

export function downloadPoCsv(plan: WeekPlan, catalog: ScoredProduct[]) {
  const header = "sku,brand,name,qty,landed_cad,ext_cost_cad,currency,status,supplier,note,image,list_reason";
  const rows = plan.lines.map((l) => {
    const p = catalog.find((x) => x.id === l.productId);
    if (!p) return "";
    return [
      p.sku,
      csvEscape(p.brand),
      csvEscape(p.name),
      l.qty,
      p.landedCad,
      (l.qty * p.landedCad).toFixed(2),
      "CAD",
      l.status,
      csvEscape(p.supplier),
      csvEscape(l.note),
      productImageUrl(p.id),
      csvEscape(p.signal.reason),
    ].join(",");
  });
  downloadText(`japjapvan-${plan.week}.csv`, [header, ...rows.filter(Boolean)].join("\n"));
}

function crc32(data: Uint8Array) {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    c ^= data[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function u16(n: number) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n, true);
  return b;
}

function u32(n: number) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, true);
  return b;
}

function concat(parts: Uint8Array[]) {
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function zipStore(files: { name: string; data: Uint8Array }[]) {
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  const now = new Date();
  const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
  const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

  for (const f of files) {
    const name = new TextEncoder().encode(f.name);
    const crc = crc32(f.data);
    const local = concat([
      u32(0x04034b50),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(dosTime),
      u16(dosDate),
      u32(crc),
      u32(f.data.length),
      u32(f.data.length),
      u16(name.length),
      u16(0),
      name,
      f.data,
    ]);
    locals.push(local);
    centrals.push(
      concat([
        u32(0x02014b50),
        u16(20),
        u16(20),
        u16(0x0800),
        u16(0),
        u16(dosTime),
        u16(dosDate),
        u32(crc),
        u32(f.data.length),
        u32(f.data.length),
        u16(name.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0),
        u32(offset),
        name,
      ]),
    );
    offset += local.length;
  }

  const centralDir = concat(centrals);
  const end = concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ]);
  return new Blob([concat([...locals, centralDir, end])], { type: "application/zip" });
}

export async function downloadSearchPack(
  products: Array<Product & { score?: ScoredProduct["score"] }>,
  filename = "japjapvan-search-results.zip",
) {
  const files: { name: string; data: Uint8Array }[] = [
    { name: "japjapvan-products.csv", data: new TextEncoder().encode("\uFEFF" + catalogCsv(products)) },
  ];

  await Promise.all(
    products.map(async (p) => {
      try {
        const res = await fetch(productImageUrl(p.id));
        if (!res.ok) return;
        const data = new Uint8Array(await res.arrayBuffer());
        files.push({ name: `images/${imageFileName(p.id, p.sku)}`, data });
      } catch {
        /* skip a missing still */
      }
    }),
  );

  triggerDownload(filename, zipStore(files));
}
