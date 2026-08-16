import { Link } from "@tanstack/react-router";
import { criteriaLabel } from "@/data/criteria";
import { useCriteriaStore } from "@/lib/criteria-store";
import { useI18n } from "@/lib/i18n";

export function CriteriaBanner() {
  const criteria = useCriteriaStore((s) => s.criteria);
  const revision = useCriteriaStore((s) => s.revision);
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border border-border bg-bg-elevated px-3 py-2 text-xs">
      <p className="text-muted">
        <span className="font-medium text-fg">{t("criteria.banner", { n: revision })}</span>
        <span className="mx-1.5 text-subtle">·</span>
        {criteriaLabel(criteria)}
      </p>
      <Link to="/criteria" className="text-primary underline-offset-2 hover:underline">
        {t("criteria.edit")}
      </Link>
    </div>
  );
}
