import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { CriteriaBanner } from "@/components/criteria-banner";
import { Price } from "@/components/price";
import { ProductThumb } from "@/components/product-thumb";
import { SignalReason } from "@/components/signal-reason";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { downloadShopifyCsv } from "@/lib/export";
import { wholesaleJpyFromLandedCad } from "@/lib/money";
import { marginPct, WEIGHTS } from "@/lib/scoring";
import { useListing } from "@/lib/use-listing";
import { useI18n } from "@/lib/i18n";
import { pct } from "@/lib/utils";

export const Route = createFileRoute("/shortlist")({ component: ShortlistPage });

function ShortlistPage() {
  const { picks } = useListing();
  const { t } = useI18n();
  const brands = new Set(picks.map((p) => p.brand)).size;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-tight">{t("shortlist.title")}</h1>
            <p className="mt-1 max-w-xl text-sm text-muted">
              {t("shortlist.lede", { n: picks.length, brands })}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <p className="text-xs text-subtle">
              {t("shortlist.weights", { t: WEIGHTS.trends * 100, m: WEIGHTS.margin * 100, s: WEIGHTS.shipping * 100 })}
            </p>
            <Button variant="outline" onClick={() => downloadShopifyCsv(picks)}>
              {t("shortlist.export")}
            </Button>
          </div>
        </div>

        <CriteriaBanner />

        <div className="grid gap-3 md:grid-cols-2">
          {picks.map((p, i) => (
            <article key={p.id} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
              <div className="flex items-start gap-3">
                <ProductThumb id={p.id} alt={`${p.brand} ${p.name}`} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs tabular-nums text-subtle">
                        #{String(i + 1).padStart(2, "0")} · {p.brand}
                      </p>
                      <h2 className="mt-0.5 text-sm font-medium">{p.name}</h2>
                    </div>
                    <Badge tone="ink">{Math.round(p.score.total * 100)}</Badge>
                  </div>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt className="text-subtle">Sell CAD</dt>
                  <dd>
                    <Price amount={p.sellCad} currency="CAD" />
                  </dd>
                </div>
                <div>
                  <dt className="text-subtle">Landed CAD</dt>
                  <dd>
                    <Price amount={p.landedCad} currency="CAD" />
                  </dd>
                </div>
                <div>
                  <dt className="text-subtle">JP wholesale</dt>
                  <dd>
                    <Price amount={wholesaleJpyFromLandedCad(p.landedCad)} currency="JPY" />
                  </dd>
                </div>
              </dl>
              <p className="mt-2 text-xs text-muted">Margin {pct(marginPct(p))} · lead {p.leadDays}d</p>
              <div className="mt-3">
                <SignalReason signal={p.signal} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.score.reasons.map((r) => (
                  <Badge key={r} tone="muted">
                    {r}
                  </Badge>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
