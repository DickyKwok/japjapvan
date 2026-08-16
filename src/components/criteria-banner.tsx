import { Link } from "@tanstack/react-router";
import { criteriaLabel } from "@/data/criteria";
import { useCriteriaStore } from "@/lib/criteria-store";

export function CriteriaBanner() {
  const criteria = useCriteriaStore((s) => s.criteria);
  const revision = useCriteriaStore((s) => s.revision);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border bg-bg-elevated px-3 py-2 text-xs">
      <p className="text-muted">
        <span className="font-medium text-fg">Rule v{revision}</span>
        <span className="mx-1.5 text-subtle">·</span>
        {criteriaLabel(criteria)}
      </p>
      <Link to="/criteria" className="text-primary underline-offset-2 hover:underline">
        Edit criteria
      </Link>
    </div>
  );
}
