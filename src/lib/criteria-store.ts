import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  cloneCriteria,
  criteriaEqual,
  DEFAULT_CRITERIA,
  type ListingCriteria,
} from "@/data/criteria";
import { appendHistoryVersion } from "@/lib/history-store";

type CriteriaState = {
  criteria: ListingCriteria;
  revision: number;
  savedAt: string;
  setDraftAndSave: (next: ListingCriteria) => void;
  resetDefaults: () => void;
};

export const useCriteriaStore = create<CriteriaState>()(
  persist(
    (set, get) => ({
      criteria: cloneCriteria(DEFAULT_CRITERIA),
      revision: 1,
      savedAt: new Date().toISOString(),
      setDraftAndSave: (next) => {
        const prev = get().criteria;
        if (criteriaEqual(prev, next)) return;
        const revision = get().revision + 1;
        const savedAt = new Date().toISOString();
        set({ criteria: cloneCriteria(next), revision, savedAt });
        appendHistoryVersion({
          version: revision,
          savedAt,
          label: `Criteria v${revision}`,
          kind: "criteria",
          criteria: cloneCriteria(next),
        });
      },
      resetDefaults: () => {
        get().setDraftAndSave(cloneCriteria(DEFAULT_CRITERIA));
      },
    }),
    { name: "japjapvan-criteria" },
  ),
);

export function getActiveCriteria(): ListingCriteria {
  if (typeof window === "undefined") return cloneCriteria(DEFAULT_CRITERIA);
  return useCriteriaStore.getState().criteria;
}
