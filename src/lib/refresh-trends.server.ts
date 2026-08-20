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
import { lockDailyTop50, readCronCursor, saveCronCursor, type CronCursor } from "@/lib/listing-history.server";

const ROOT = process.cwd();
const BATCH = Math.max(1, Number(process.env.GOOGLE_TRENDS_BATCH || 12));

export type CronState = {
  lastRunAt: string;
  listed: number;
  watch: number;
  liveHits: number;
  total: number;
  scanned: number;
  remaining: number;
  lastFullSweepAt: string | null;
  top50Count: number;
  cycleComplete: boolean;
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

export async function refreshTrendSnapshots(opts?: {
  batch?: number;
}): Promise<{ bundle: SnapshotBundle; state: CronState }> {
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
  const batchSize = Math.max(1, opts?.batch ?? BATCH);
  const fetchedAt = new Date().toISOString();
  let cursor: CronCursor = (await readCronCursor()) ?? {
    nextIndex: 0,
    cycleStartedAt: fetchedAt,
    lastFullSweepAt: null,
    scannedThisCycle: [],
    failedThisCycle: [],
  };

  const batch = [];
  for (let i = 0; i < batchSize && i < groups.length; i++) {
    const g = groups[(cursor.nextIndex + i) % groups.length];
    if (g) batch.push(g);
  }

  const scannedKeys = new Set(cursor.scannedThisCycle);
  for (const g of batch) {
    const key = `${g.ca}|${g.jp}|${g.hk}`;
    const hit = await fetchGoogleTrendsSeries(g);
    scannedKeys.add(key);
    if (!hit?.series?.length) {
      cursor.failedThisCycle = [...new Set([...cursor.failedThisCycle, key])];
      continue;
    }
    const url = googleTrendsExploreUrl(g.ca, "CA");
    for (const id of g.productIds) {
      if (hit.caVolume) {
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
  }

  cursor.scannedThisCycle = [...scannedKeys];
  cursor.nextIndex = (cursor.nextIndex + batch.length) % Math.max(1, groups.length);
  const cycleComplete = cursor.scannedThisCycle.length >= groups.length;
  if (cycleComplete) {
    cursor.lastFullSweepAt = fetchedAt;
    cursor.scannedThisCycle = [];
    cursor.failedThisCycle = [];
    cursor.cycleStartedAt = fetchedAt;
    cursor.nextIndex = 0;
  }
  await saveCronCursor(cursor);

  const method =
    "Google Trends interest-over-time (brand query, geo=CA/JP/HK). Wikipedia fills gaps only. No invented seed +%.";
  const bundle = applyLiveRows(buildBundle(PRODUCTS, extras), rows, method, fetchedAt);
  setSignalBundle(bundle);
  await saveDemandBundle(bundle);
  if (cycleComplete) {
    try {
      await lockDailyTop50(fetchedAt);
    } catch {
      /* history write is best-effort */
    }
  }

  const listed = PRODUCTS.filter((p) => bundle.products[p.id]?.eligible).length;
  const liveHits = PRODUCTS.filter((p) => bundle.products[p.id]?.hasLiveDemand).length;
  const remaining = cycleComplete ? 0 : Math.max(0, groups.length - cursor.scannedThisCycle.length);
  const state: CronState = {
    lastRunAt: bundle.generatedAt,
    listed,
    watch: PRODUCTS.length - listed,
    liveHits,
    total: PRODUCTS.length,
    scanned: batch.length,
    remaining,
    lastFullSweepAt: cursor.lastFullSweepAt,
    top50Count: 50,
    cycleComplete,
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
