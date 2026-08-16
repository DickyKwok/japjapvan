import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { PRODUCTS } from "@/data/products";
import { REVERSE_SKUS } from "@/data/reverse";
import { buildBundle, snapshotFromReverse, type SnapshotBundle } from "@/lib/trend-engine";
import { applyLiveOverlay, setSignalBundle } from "@/lib/signals";

const ROOT = process.cwd();

export type CronState = {
  lastRunAt: string;
  listed: number;
  watch: number;
  liveHits: number;
  total: number;
};

export async function refreshTrendSnapshots(): Promise<{ bundle: SnapshotBundle; state: CronState }> {
  const extras = REVERSE_SKUS.map((p) => snapshotFromReverse(p));
  const bundle = applyLiveOverlay(buildBundle(PRODUCTS, extras));
  setSignalBundle(bundle);

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
