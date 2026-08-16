import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Flame } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CriteriaBanner } from "@/components/criteria-banner";
import { ProductThumb } from "@/components/product-thumb";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS } from "@/data/products";
import { MARKET_META, risingData, skuRisers } from "@/lib/rising";
import { useI18n } from "@/lib/i18n";
import { growthLabel } from "@/lib/utils";

export const Route = createFileRoute("/rising")({ component: RisingPage });

function productById(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

function RisingPage() {
  const bundle = risingData();
  const geos = ["CA", "JP", "HK"] as const;
  const { t } = useI18n();

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-xs tracking-[0.18em] text-subtle uppercase">{t("rising.kicker")}</p>
          <h1 className="mt-1 font-display text-3xl tracking-tight">{t("rising.title")}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {t("rising.lede", { at: bundle.generatedAt.slice(0, 16).replace("T", " ") })}
          </p>
        </div>
        <CriteriaBanner />

        <div className="grid gap-4 lg:grid-cols-3">
          {geos.map((geo) => {
            const market = bundle.markets[geo];
            const meta = MARKET_META[geo];
            return (
              <section key={geo} className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-subtle">
                      {t(`rising.meta.${geo.toLowerCase()}`)} · {meta.lang}
                    </p>
                    <h2 className="font-display text-2xl">{t(`market.${geo}`)}</h2>
                  </div>
                  <a
                    href={market.exploreUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary"
                  >
                    Google Trends <ExternalLink className="size-3" />
                  </a>
                </div>
                <p className="mb-3 text-[11px] text-subtle">{t("rising.source", { source: market.source, n: market.topics.length })}</p>
                <ol className="space-y-3">
                  {market.topics.map((t, i) => (
                    <li key={t.title} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs tabular-nums text-subtle">#{String(i + 1).padStart(2, "0")}</p>
                          <a
                            href={t.exploreUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium leading-snug hover:underline"
                          >
                            {t.title}
                          </a>
                          {t.news ? <p className="mt-1 text-xs leading-relaxed text-muted">{t.news}</p> : null}
                        </div>
                        <Badge tone={t.traffic >= 1000 ? "ok" : "muted"}>
                          <Flame className="mr-1 size-3" />
                          {t.trafficLabel}
                        </Badge>
                      </div>
                      {t.matchedSkuIds.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {t.matchedSkuIds.map((id) => {
                            const p = productById(id);
                            if (!p) return null;
                            return (
                              <span key={id} className="inline-flex items-center gap-1 text-[11px] text-muted">
                                <ProductThumb id={id} alt={p.brand} size="sm" className="size-6" />
                                {p.brand}
                              </span>
                            );
                          })}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>

        <section>
          <h2 className="font-display text-xl">{t("rising.catalogClimb")}</h2>
          <p className="mt-1 text-sm text-muted">{t("rising.catalogLede")}</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {geos.map((geo) => (
              <div key={geo} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
                <p className="text-xs text-subtle">{t("rising.growth", { market: t(`market.${geo}`) })}</p>
                <ul className="mt-3 space-y-2">
                  {skuRisers(geo, 6).map((row) => (
                    <li key={row.product.id} className="flex items-center gap-2">
                      <ProductThumb id={row.product.id} alt={row.product.brand} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{row.product.keyword}</p>
                        <p className="text-[11px] text-subtle">{row.product.brand}</p>
                      </div>
                      <span className="tabular-nums text-xs text-ok">{growthLabel(row.growth)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <p className="text-xs text-subtle">
          {bundle.method}{" "}
          <Link to="/history" className="text-primary hover:underline">
            {t("rising.history")}
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
