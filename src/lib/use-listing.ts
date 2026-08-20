import { useMemo } from "react";
import { useCriteriaStore } from "@/lib/criteria-store";
import { defaultWeekPlan, scoredCatalog, shortlist, watchlist } from "@/lib/catalog";
import { signalSummary, useDemandVersion } from "@/lib/signals";

export function useListing() {
  const criteria = useCriteriaStore((s) => s.criteria);
  const revision = useCriteriaStore((s) => s.revision);
  const savedAt = useCriteriaStore((s) => s.savedAt);
  const demandVersion = useDemandVersion();

  const catalog = useMemo(() => scoredCatalog(criteria), [criteria, revision, demandVersion]);
  const picks = useMemo(() => shortlist(criteria), [criteria, revision, demandVersion]);
  const watch = useMemo(() => watchlist(criteria), [criteria, revision, demandVersion]);
  const plan = useMemo(() => defaultWeekPlan(criteria), [criteria, revision, demandVersion]);
  const summary = useMemo(
    () => ({ ...signalSummary(criteria), top50: picks.length }),
    [criteria, revision, demandVersion, picks.length],
  );

  return { criteria, revision, savedAt, catalog, picks, watch, plan, summary };
}
