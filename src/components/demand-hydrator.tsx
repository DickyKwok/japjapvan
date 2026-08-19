import { useEffect } from "react";
import { setRisingBundle } from "@/lib/rising";
import { setSignalBundle } from "@/lib/signals";
import type { SnapshotBundle } from "@/lib/trend-engine";
import type { RisingBundle } from "@/lib/rising";

export function DemandHydrator() {
  useEffect(() => {
    let cancelled = false;
    fetch("/api/demand")
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { bundle?: SnapshotBundle; rising?: RisingBundle } | null) => {
        if (cancelled || !body) return;
        if (body.bundle?.products) setSignalBundle(body.bundle);
        if (body.rising?.markets) setRisingBundle(body.rising);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
