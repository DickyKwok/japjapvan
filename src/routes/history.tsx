import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { CriteriaBanner } from "@/components/criteria-banner";
import { ProductThumb } from "@/components/product-thumb";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS } from "@/data/products";
import { aisleFor } from "@/data/aisles";
import { drugstoreShelf } from "@/data/drugstore";
import { loadListingHistory } from "@/lib/listing-history-fns";
import type { ListingSnapshot, Top50Row } from "@/lib/listing-history.server";
import { useListing } from "@/lib/use-listing";
import { growthLabel } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/history")({
  loader: () => loadListingHistory(),
  component: HistoryPage,
});

function productName(id: string) {
  const p = PRODUCTS.find((x) => x.id === id);
  return p ? `${p.brand} · ${p.name}` : id;
}

function HistoryPage() {
  const serverRows = Route.useLoaderData() as ListingSnapshot[];
  const { picks } = useListing();
  const { t } = useI18n();
  const today = new Date().toISOString().slice(0, 10);
  const live: ListingSnapshot = {
    day: today,
    generatedAt: new Date().toISOString(),
    lastFullSweepAt: serverRows[0]?.lastFullSweepAt ?? null,
    top50: picks.map(
      (p, i): Top50Row => ({
        id: p.id,
        rank: i + 1,
        aisle: aisleFor(p.id),
        drugstore: drugstoreShelf(p.id),
        caGrowth12w: p.signal.caGrowth12w,
        source: p.signal.source,
        eligible: p.signal.eligible,
      }),
    ),
    entered: [],
    left: [],
    rankDelta: {},
  };
  const hasToday = serverRows.some((r) => r.day === today);
  const rows = hasToday ? serverRows : [live, ...serverRows];

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <h1 className="font-display text-3xl tracking-tight">{t("history.title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{t("history.lede")}</p>
        </div>
        <CriteriaBanner />

        {rows.length === 0 ? (
          <p className="text-sm text-muted">{t("history.empty")}</p>
        ) : (
          <ol className="space-y-4">
            {rows.map((row, i) => {
              const prev = rows[i + 1];
              const entered = row.entered.length
                ? row.entered
                : prev
                  ? row.top50.map((r) => r.id).filter((id) => !prev.top50.some((x) => x.id === id))
                  : [];
              const left = row.left.length
                ? row.left
                : prev
                  ? prev.top50.map((r) => r.id).filter((id) => !row.top50.some((x) => x.id === id))
                  : [];
              const isLive = row.day === today && !hasToday;
              return (
                <li key={row.day} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-subtle">
                        {isLive ? t("history.live") : row.day}
                        {row.lastFullSweepAt ? ` · scan ${row.lastFullSweepAt.slice(0, 16)}` : ""}
                      </p>
                      <h2 className="font-display text-xl">Top 50</h2>
                    </div>
                    <Badge>{t("history.listed", { n: row.top50.length })}</Badge>
                  </div>
                  <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                    {row.top50.slice(0, 10).map((item) => {
                      const delta = row.rankDelta[item.id];
                      return (
                        <li key={item.id} className="flex items-center gap-2 text-sm">
                          <ProductThumb id={item.id} alt="" size="sm" className="size-10" />
                          <span className="w-6 tabular-nums text-subtle">{item.rank}</span>
                          <span className="min-w-0 flex-1 truncate">{productName(item.id)}</span>
                          <span className="text-xs text-muted">{growthLabel(item.caGrowth12w)}</span>
                          {delta > 0 ? (
                            <span className="text-[10px] text-ok">{t("history.rankUp", { n: delta })}</span>
                          ) : delta < 0 ? (
                            <span className="text-[10px] text-warn">{t("history.rankDown", { n: Math.abs(delta) })}</span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ol>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <ChangeList title={t("history.entered")} ids={entered} tone="ok" />
                    <ChangeList title={t("history.left")} ids={left} tone="warn" />
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

function ChangeList({ title, ids, tone }: { title: string; ids: string[]; tone: "ok" | "warn" }) {
  const { t } = useI18n();
  return (
    <div>
      <p className="text-xs text-subtle">{title}</p>
      {ids.length === 0 ? (
        <p className="mt-1 text-sm text-muted">{t("history.noChange")}</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {ids.slice(0, 8).map((id) => (
            <li key={id} className={`text-sm ${tone === "ok" ? "text-ok" : "text-warn"}`}>
              {productName(id)}
            </li>
          ))}
          {ids.length > 8 ? <li className="text-xs text-subtle">{t("history.more", { n: ids.length - 8 })}</li> : null}
        </ul>
      )}
    </div>
  );
}
