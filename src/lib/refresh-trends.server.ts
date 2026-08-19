import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { PRODUCTS } from "@/data/products";
import { REVERSE_SKUS } from "@/data/reverse";
import { googleTrendsExploreUrl, uniqueTrendQueries } from "@/data/trend-queries";
import { buildBundle, snapshotFromReverse, type ProductSnapshot, type SnapshotBundle } from "@/lib/trend-engine";
import { applyLiveRows, setSignalBundle } from "@/lib/signals";
import { fetchGoogleTrendsSeries } from "@/lib/google-trends.server";
import { fetchRisingRss } from "@/lib/rising-rss.server";
import { saveDemandBundle, saveRisingBundle } from "@/lib/demand-store.server";
import { setRisingBundle } from "@/lib/rising";
import liveSignals from "@/data/live-signals.json";

const ROOT = process.cwd();
const BATCH = Math.max(1, Number(process.env.GOOGLE_TRENDS_BATCH || 8));

export type CronState = {
  lastRunAt: string;
  listed: number;
  watch: number;
  liveHits: number;
  total: number;
};

type LiveRow = {
  source?: ProductSnapshot["source"];
  fetchedAt?: string;
  query?: { ca?: string; jp?: string; hk?: string };
  googleTrendsUrl?: string;
  caVolume?: boolean;
  jpVolume?: boolean;
  series?: SnapshotBundle["products"][string]["series"];
  titles?: { en?: string; ja?: string; zh?: string };
};

export async function refreshTrendSnapshots(): Promise<{ bundle: SnapshotBundle; state: CronState }> {
  const extras = REVERSE_SKUS.map((p) => snapshotFromReverse(p));
  const existing = (liveSignals as { products?: Record<string, LiveRow> }).products ?? {};
  const rows: Record<string, LiveRow> = { ...existing };

  try {
    const rising = await fetchRisingRss();
    setRisingBundle(rising);
    await saveRisingBundle(rising);
  } catch {
    /* RSS optional */
  }

  const groups = uniqueTrendQueries(PRODUCTS);
  const stale = groups.filter((g) => {
    const sample = rows[g.productIds[0] ?? ""];
    if (sample?.source !== "google-trends" || !sample.series?.length) return true;
    const age = Date.now() - Date.parse(sample.fetchedAt ?? "");
    return !Number.isFinite(age) || age > 20 * 60 * 60 * 1000;
  });
  const batch = stale.slice(0, BATCH);
  const fetchedAt = new Date().toISOString();
  for (const g of batch) {
    const hit = await fetchGoogleTrendsSeries(g);
    if (!hit?.series?.length) continue;
    const url = googleTrendsExploreUrl(g.ca, "CA");
    for (const id of g.productIds) {
      rows[id] = {
        source: "google-trends",
        fetchedAt,
        query: { ca: g.ca, jp: g.jp, hk: g.hk },
        googleTrendsUrl: url,
        caVolume: hit.caVolume,
        jpVolume: hit.jpVolume,
        series: hit.series,
      };
    }
  }

  const method =
    "Google Trends interest-over-time (brand query, geo=CA/JP/HK). Wikipedia fills gaps only. No invented seed +%.";
  const bundle = applyLiveRows(buildBundle(PRODUCTS, extras), rows, method, fetchedAt);
  setSignalBundle(bundle);
  await saveDemandBundle(bundle);

  const listed = PRODUCTS.filter((p) => bundle.products[p.id]?.eligible).length;
  const liveHits = PRODUCTS.filter((p) => bundle.products[p.id]?.hasLiveDemand).length;
  const state: CronState = {
    lastRunAt: bundle.generatedAt,
    listed,
    watch: PRODUCTS.length - listed,
    liveHits,
    total: PRODUCTS.length,
  };

  const targets = [
    join(ROOT, "data/trend_snapshots.json"),
    join(ROOT, "public/trend-snapshots.json"),
    join(ROOT, "src/data/trend-snapshots.json"),
    join(ROOT, "data/cron-state.json"),
  ];

  try {
    await mkdir(join(ROOT, "data"), { recursive: true });
    await mkdir(join(ROOT, "public"), { recursive: true });
    await mkdir(join(ROOT, "src/data"), { recursive: true });
    const body = JSON.stringify(bundle, null, 2);
    await writeFile(targets[0], body);
    await writeFile(targets[1], body);
    await writeFile(targets[2], body);
    await writeFile(targets[3], JSON.stringify(state, null, 2));
    await writeFile(
      join(ROOT, "src/data/live-signals.json"),
      JSON.stringify({ generatedAt: fetchedAt, method, products: rows }, null, 2),
    );
  } catch {
    /* Vercel / read-only — in-memory bundle still returned */
  }

  return { bundle, state };
}

export async function readCronState(): Promise<CronState | null> {
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(join(dirname(join(ROOT, "data")), "data/cron-state.json"), "utf8");
    return JSON.parse(raw) as CronState;
  } catch {
    return null;
  }
}
