import { getSql } from "@/lib/db";
import type { SnapshotBundle } from "@/lib/trend-engine";
import type { RisingBundle } from "@/lib/rising";

const DEMAND_ID = "latest";
const RISING_ID = "rising";

export async function saveDemandBundle(bundle: SnapshotBundle) {
  try {
    const sql = await getSql();
    const payload = JSON.stringify(bundle);
    await sql`
      insert into demand_bundles (id, payload, generated_at, method)
      values (${DEMAND_ID}, ${payload}, ${bundle.generatedAt}, ${bundle.method})
      on conflict (id)
      do update set payload = excluded.payload, generated_at = excluded.generated_at, method = excluded.method
    `;
  } catch {
    /* preview / missing table — in-memory still used */
  }
}

export async function readDemandBundle(): Promise<SnapshotBundle | null> {
  try {
    const sql = await getSql();
    const rows = await sql<{ payload: string }>`
      select payload from demand_bundles where id = ${DEMAND_ID} limit 1
    `;
    if (!rows[0]?.payload) return null;
    return JSON.parse(rows[0].payload) as SnapshotBundle;
  } catch {
    return null;
  }
}

export async function saveRisingBundle(bundle: RisingBundle) {
  try {
    const sql = await getSql();
    const payload = JSON.stringify(bundle);
    await sql`
      insert into demand_bundles (id, payload, generated_at, method)
      values (${RISING_ID}, ${payload}, ${bundle.generatedAt}, ${bundle.method})
      on conflict (id)
      do update set payload = excluded.payload, generated_at = excluded.generated_at, method = excluded.method
    `;
  } catch {
    /* ignore */
  }
}

export async function readRisingBundle(): Promise<RisingBundle | null> {
  try {
    const sql = await getSql();
    const rows = await sql<{ payload: string }>`
      select payload from demand_bundles where id = ${RISING_ID} limit 1
    `;
    if (!rows[0]?.payload) return null;
    return JSON.parse(rows[0].payload) as RisingBundle;
  } catch {
    return null;
  }
}
