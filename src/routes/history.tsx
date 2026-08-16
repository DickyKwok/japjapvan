import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CriteriaBanner } from "@/components/criteria-banner";
import { ProductThumb } from "@/components/product-thumb";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS } from "@/data/products";
import { criteriaLabel } from "@/data/criteria";
import { useCriteriaStore } from "@/lib/criteria-store";
import { diffVersions, readHistory, seedHistoryIfEmpty, type ListingVersion } from "@/lib/history-store";
import { growthLabel } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function productName(id: string) {
  const p = PRODUCTS.find((x) => x.id === id);
  return p ? `${p.brand} · ${p.name}` : id;
}

function HistoryPage() {
  const criteria = useCriteriaStore((s) => s.criteria);
  const revision = useCriteriaStore((s) => s.revision);
  const [rows, setRows] = useState<ListingVersion[]>([]);
  const { t } = useI18n();

  useEffect(() => {
    seedHistoryIfEmpty(criteria);
    setRows(readHistory().slice().reverse());
  }, [criteria, revision]);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <h1 className="font-display text-3xl tracking-tight">{t("history.title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{t("history.lede")}</p>
        </div>
        <CriteriaBanner />

        {rows.length === 0 ? (
          <p className="text-sm text-muted">No versions yet. Save a criteria rule to start the log.</p>
        ) : (
          <ol className="space-y-4">
            {rows.map((row, i) => {
              const prev = rows[i + 1];
              const { added, dropped } = diffVersions(prev, row);
              return (
                <li key={`${row.version}-${row.savedAt}`} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-subtle">
                        {row.kind} · {row.savedAt.slice(0, 10)}
                      </p>
                      <h2 className="font-display text-xl">{row.label}</h2>
                      <p className="mt-1 text-xs text-muted">{criteriaLabel(row.criteria)}</p>
                    </div>
                    <Badge>{row.listedIds.length} listed</Badge>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <ChangeList title="Entered the list" ids={added} tone="ok" growth={row.growth} />
                    <ChangeList title="Left the list" ids={dropped} tone="warn" growth={row.growth} />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </AppShell>
  );
}

function ChangeList({
  title,
  ids,
  tone,
  growth,
}: {
  title: string;
  ids: string[];
  tone: "ok" | "warn";
  growth: Record<string, number>;
}) {
  return (
    <div>
      <p className="text-xs text-subtle">{title}</p>
      {ids.length === 0 ? (
        <p className="mt-1 text-xs text-muted">No change</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {ids.slice(0, 8).map((id) => (
            <li key={id} className="flex items-center gap-2">
              <ProductThumb id={id} alt={productName(id)} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{productName(id)}</p>
                <Badge tone={tone}>{growthLabel(growth[id] ?? 0)}</Badge>
              </div>
            </li>
          ))}
          {ids.length > 8 ? <li className="text-xs text-subtle">+{ids.length - 8} more</li> : null}
        </ul>
      )}
    </div>
  );
}
