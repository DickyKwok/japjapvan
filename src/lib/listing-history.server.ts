import { getSql } from "@/lib/db";
import { aisleFor } from "@/data/aisles";
import { drugstoreShelf } from "@/data/drugstore";
import { PRODUCTS } from "@/data/products";
import { shortlist } from "@/lib/catalog";
import { signalFor } from "@/lib/signals";

export type Top50Row = {
  id: string;
  rank: number;
  aisle: string;
  drugstore: string;
  caGrowth12w: number;
  source: string;
  eligible: boolean;
};

export type ListingSnapshot = {
  day: string;
  generatedAt: string;
  lastFullSweepAt: string | null;
  top50: Top50Row[];
  entered: string[];
  left: string[];
  rankDelta: Record<string, number>;
};

export type CronCursor = {
  nextIndex: number;
  cycleStartedAt: string;
  lastFullSweepAt: string | null;
  scannedThisCycle: string[];
  failedThisCycle: string[];
};

const CURSOR_ID = "trends";

export function utcDay(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function buildTop50Rows(): Top50Row[] {
  return shortlist().map((p, i) => {
    const signal = signalFor(p);
    return {
      id: p.id,
      rank: i + 1,
      aisle: aisleFor(p.id),
      drugstore: drugstoreShelf(p.id),
      caGrowth12w: signal.caGrowth12w,
      source: signal.source,
      eligible: signal.eligible,
    };
  });
}

export async function readCronCursor(): Promise<CronCursor | null> {
  try {
    const sql = await getSql();
    const rows = await sql<{ payload: string }>`
      select payload from cron_cursor where id = ${CURSOR_ID} limit 1
    `;
    if (!rows[0]?.payload) return null;
    return JSON.parse(rows[0].payload) as CronCursor;
  } catch {
    return null;
  }
}

export async function saveCronCursor(cursor: CronCursor) {
  try {
    const sql = await getSql();
    const payload = JSON.stringify(cursor);
    await sql`
      insert into cron_cursor (id, payload, updated_at)
      values (${CURSOR_ID}, ${payload}, now())
      on conflict (id)
      do update set payload = excluded.payload, updated_at = now()
    `;
  } catch {
    /* preview */
  }
}

export async function readListingSnapshots(limit = 30): Promise<ListingSnapshot[]> {
  try {
    const sql = await getSql();
    const rows = await sql<{ day: string; payload: string }>`
      select day::text as day, payload
      from listing_snapshots
      order by day desc
      limit ${limit}
    `;
    return rows.map((r) => JSON.parse(r.payload) as ListingSnapshot);
  } catch {
    return [];
  }
}

export async function readListingSnapshot(day: string): Promise<ListingSnapshot | null> {
  try {
    const sql = await getSql();
    const rows = await sql<{ payload: string }>`
      select payload from listing_snapshots where day = ${day} limit 1
    `;
    if (!rows[0]?.payload) return null;
    return JSON.parse(rows[0].payload) as ListingSnapshot;
  } catch {
    return null;
  }
}

export async function saveListingSnapshot(snap: ListingSnapshot) {
  try {
    const sql = await getSql();
    const payload = JSON.stringify(snap);
    await sql`
      insert into listing_snapshots (day, generated_at, payload)
      values (${snap.day}, ${snap.generatedAt}, ${payload})
      on conflict (day)
      do update set generated_at = excluded.generated_at, payload = excluded.payload
    `;
  } catch {
    /* preview */
  }
}

export async function lockDailyTop50(lastFullSweepAt: string): Promise<ListingSnapshot> {
  const day = utcDay();
  const top50 = buildTop50Rows();
  const prev = await readListingSnapshot(
    utcDay(new Date(Date.parse(day + "T00:00:00Z") - 86400000)),
  );
  const was = new Set((prev?.top50 ?? []).map((r) => r.id));
  const now = new Set(top50.map((r) => r.id));
  const prevRank = Object.fromEntries((prev?.top50 ?? []).map((r) => [r.id, r.rank]));
  const rankDelta: Record<string, number> = {};
  for (const row of top50) {
    if (prevRank[row.id] != null) rankDelta[row.id] = prevRank[row.id] - row.rank;
  }
  const snap: ListingSnapshot = {
    day,
    generatedAt: new Date().toISOString(),
    lastFullSweepAt,
    top50,
    entered: top50.map((r) => r.id).filter((id) => !was.has(id)),
    left: [...was].filter((id) => !now.has(id)),
    rankDelta,
  };
  await saveListingSnapshot(snap);
  return snap;
}

export function catalogHealth(cursor: CronCursor | null, productCount = PRODUCTS.length) {
  const last = cursor?.lastFullSweepAt ? Date.parse(cursor.lastFullSweepAt) : 0;
  const stale = !last || Date.now() - last > 36 * 60 * 60 * 1000;
  return {
    lastFullSweepAt: cursor?.lastFullSweepAt ?? null,
    remaining: Math.max(0, productCount),
    scannedThisCycle: cursor?.scannedThisCycle.length ?? 0,
    stale,
  };
}
