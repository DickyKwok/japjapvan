import { useMemo } from "react";
import { useCriteriaStore } from "@/lib/criteria-store";
import { defaultWeekPlan, scoredCatalog, shortlist, watchlist } from "@/lib/catalog";
import { signalSummary } from "@/lib/signals";

export function useListing() {
  const criteria = useCriteriaStore((s) => s.criteria);
  const revision = useCriteriaStore((s) => s.revision);
  const savedAt = useCriteriaStore((s) => s.savedAt);

  const catalog = useMemo(() => scoredCatalog(criteria), [criteria, revision]);
  const picks = useMemo(() => shortlist(criteria), [criteria, revision]);
  const watch = useMemo(() => watchlist(criteria), [criteria, revision]);
  const plan = useMemo(() => defaultWeekPlan(criteria), [criteria, revision]);
  const summary = useMemo(() => signalSummary(criteria), [criteria, revision]);

  return { criteria, revision, savedAt, catalog, picks, watch, plan, summary };
}
