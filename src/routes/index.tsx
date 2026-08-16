import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { CriteriaBanner } from "@/components/criteria-banner";
import { WeeklyRitual } from "@/components/ritual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/price";
import { ProductThumb } from "@/components/product-thumb";
import { planTotals } from "@/lib/catalog";
import { useListing } from "@/lib/use-listing";
import { useI18n } from "@/lib/i18n";
import { wholesaleJpyFromLandedCad } from "@/lib/money";
import { growthLabel } from "@/lib/utils";
import { marginPct } from "@/lib/scoring";
import { ArrowUpRight, PackageCheck, TrendingUp } from "lucide-react";
import { risingData } from "@/lib/rising";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { catalog, picks, plan, summary } = useListing();
  const { t } = useI18n();
  const totals = planTotals(plan, catalog);
  const avgMargin = picks.reduce((s, p) => s + marginPct(p), 0) / Math.max(1, picks.length);
  const byCat = Object.entries(
    picks.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, n]) => ({ name: t(`cat.${name}`), n }));

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs tracking-[0.18em] text-subtle uppercase">{t("hq.kicker")}</p>
            <h1 className="mt-1 font-display text-4xl tracking-tight md:text-5xl">{t("hq.title")}</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{t("hq.lede")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/criteria">
              <Button>{t("hq.editRule")}</Button>
            </Link>
            <Link to="/procurement">
              <Button variant="outline">{t("hq.openBuy")}</Button>
            </Link>
          </div>
        </div>

        <CriteriaBanner />
        <RisingStrip />

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label={t("hq.shopList")} value={summary.listed} hint={`${summary.watch} ${t("hq.onWatch")}`} />
          <Stat label={t("hq.liveSeries")} value={summary.live} hint={`${summary.seeded} ${t("hq.stillSeed")}`} />
          <Stat label={t("hq.weekRetail")} value={totals.retail} hint={`${totals.units} ${t("hq.units")}`} currency="CAD" />
          <Stat label={t("hq.avgMargin")} value={`${Math.round(avgMargin * 100)}%`} hint={t("hq.sellVsLanded")} />
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          <div className="border border-border bg-surface p-5 lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl">{t("hq.mix")}</h2>
              <Badge>
                {t("hq.avgMargin")} {Math.round(avgMargin * 100)}%
              </Badge>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCat} barSize={28}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "var(--color-bg)" }}
                    contentStyle={{
                      border: "1px solid var(--color-border)",
                      borderRadius: 2,
                      background: "var(--color-surface)",
                    }}
                  />
                  <Bar dataKey="n" fill="var(--color-primary)" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="border border-border bg-surface p-5 lg:col-span-2">
            <h2 className="font-display text-xl">{t("hq.why")}</h2>
            <ul className="mt-4 space-y-3">
              {picks.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-start gap-3 text-sm">
                  <ProductThumb id={p.id} alt={`${p.brand} ${p.name}`} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{p.brand}</p>
                        <p className="text-xs text-muted">{p.signal.reason}</p>
                      </div>
                      <p className="tabular-nums text-xs text-ok">{growthLabel(p.signal.caGrowth12w)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/trends" className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
              {t("hq.openTrends")} <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <WeeklyRitual />
          <section className="border border-border bg-bg-elevated p-5">
            <div className="flex items-start gap-3">
              <PackageCheck className="mt-0.5 size-5 text-primary" />
              <div>
                <h2 className="font-display text-xl">{t("hq.howTitle")}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t("hq.howBody")}</p>
              </div>
            </div>
          </section>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl">{t("hq.fastest")}</h2>
            <Link to="/catalog" className="text-sm text-muted hover:text-fg">
              {t("hq.openCatalog")}
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {picks
              .slice()
              .sort((a, b) => b.signal.caGrowth12w - a.signal.caGrowth12w)
              .slice(0, 4)
              .map((p) => (
                <article key={p.id} className="flex gap-3 border border-border bg-surface p-4">
                  <ProductThumb id={p.id} alt={`${p.brand} ${p.name}`} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-subtle">{p.brand}</p>
                      <Badge tone="ok">
                        <TrendingUp className="mr-1 size-3" /> CA {growthLabel(p.signal.caGrowth12w)}
                      </Badge>
                    </div>
                    <h3 className="mt-1 text-sm font-medium">{p.name}</h3>
                    <p className="mt-2 text-xs text-muted">{p.signal.reason}</p>
                    <p className="mt-2 text-xs text-subtle">
                      <Price amount={p.sellCad} currency="CAD" />
                      <span className="mx-1.5">·</span>
                      <Price amount={wholesaleJpyFromLandedCad(p.landedCad)} currency="JPY" />
                    </p>
                  </div>
                </article>
              ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function RisingStrip() {
  const bundle = risingData();
  const { t } = useI18n();
  return (
    <section className="border border-border bg-surface p-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-wide text-subtle uppercase">{t("hq.topics")}</p>
          <h2 className="font-display text-xl">{t("hq.goingUp")}</h2>
        </div>
        <Link to="/rising" className="inline-flex items-center gap-1 text-sm text-primary">
          {t("hq.allMarkets")} <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {(["CA", "JP", "HK"] as const).map((geo) => {
          const top = bundle.markets[geo].topics[0];
          return (
            <div key={geo}>
              <p className="text-xs text-subtle">{t(`market.${geo}`)}</p>
              <p className="mt-1 text-sm font-medium">{top?.title ?? "—"}</p>
              <p className="text-xs text-muted">{top ? `${top.trafficLabel} ${t("hq.searches")}` : ""}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
  currency,
}: {
  label: string;
  value: string | number;
  hint: string;
  currency?: "CAD" | "HKD" | "JPY";
}) {
  return (
    <div className="border border-border bg-surface p-4">
      <p className="text-xs tracking-wide text-subtle uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums tracking-tight">
        {currency && typeof value === "number" ? <Price amount={value} currency={currency} compact /> : value}
      </p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}
