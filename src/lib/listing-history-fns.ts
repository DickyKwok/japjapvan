import { createServerFn } from "@tanstack/react-start";
import { readCronCursor, readListingSnapshots } from "@/lib/listing-history.server";
import { uniqueTrendQueries } from "@/data/trend-queries";
import { PRODUCTS } from "@/data/products";

export const loadListingHistory = createServerFn({ method: "GET" }).handler(async () => {
  return readListingSnapshots(21);
});

export const loadScanHealth = createServerFn({ method: "GET" }).handler(async () => {
  const cursor = await readCronCursor();
  const queries = uniqueTrendQueries(PRODUCTS).length;
  const last = cursor?.lastFullSweepAt ? Date.parse(cursor.lastFullSweepAt) : 0;
  const stale = !last || Date.now() - last > 36 * 60 * 60 * 1000;
  return {
    lastFullSweepAt: cursor?.lastFullSweepAt ?? null,
    scannedThisCycle: cursor?.scannedThisCycle.length ?? 0,
    remaining: Math.max(0, queries - (cursor?.scannedThisCycle.length ?? 0)),
    queryCount: queries,
    stale,
  };
});
