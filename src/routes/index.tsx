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
import { wholesaleJpyFromLandedCad } from "@/lib/money";
import { growthLabel } from "@/lib/utils";
import { marginPct } from "@/lib/scoring";
import { ArrowUpRight, PackageCheck, TrendingUp } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { catalog, picks, plan, summary } = useListing();
  const totals = planTotals(plan, catalog);
  const avgMargin = picks.reduce((s, p) => s + marginPct(p), 0) / Math.max(1, picks.length);
  const byCat = Object.entries(
    picks.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, n]) => ({ name, n }));

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs tracking-[0.18em] text-subtle uppercase">JapJapVan desk</p>
            <h1 className="mt-1 font-display text-4xl tracking-tight md:text-5xl">This week’s merch HQ</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              SKUs are found by the saved criteria — demand series plus merchandising filters. Change the rule
              and every desk updates. Prices are CAD (sell), JPY (wholesale), HKD (reverse).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/criteria">
              <Button>Edit listing rule</Button>
            </Link>
            <Link to="/procurement">
              <Button variant="outline">Open weekly 採購</Button>
            </Link>
          </div>
        </div>

        <CriteriaBanner />

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Shopify list" value={summary.listed} hint={`${summary.watch} on watch`} />
          <Stat label="Live demand series" value={summary.live} hint={`${summary.seeded} still seed`} />
          <Stat label="Week retail" value={totals.retail} hint={`${totals.units} units`} currency="CAD" />
          <Stat label="Avg shortlist margin" value={`${Math.round(avgMargin * 100)}%`} hint="sell vs landed CAD" />
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl">Shortlist mix</h2>
              <Badge>avg margin {Math.round(avgMargin * 100)}%</Badge>
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
                      borderRadius: 8,
                      background: "var(--color-surface)",
                    }}
                  />
                  <Bar dataKey="n" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 lg:col-span-2">
            <h2 className="font-display text-xl">Why these SKUs</h2>
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
              Open Trends <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <WeeklyRitual />
          <section className="rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5">
            <div className="flex items-start gap-3">
              <PackageCheck className="mt-0.5 size-5 text-primary" />
              <div>
                <h2 className="font-display text-xl">How a SKU gets on the shop</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Demand series (live Wikipedia pageviews en/ja/zh, Google Trends when the endpoint answers, else
                  a labelled seed) is scored against the saved criteria. Growth, Japan source heat, margin, weight
                  and lead time all have to pass. Then it can go on Shopify.
                </p>
              </div>
            </div>
          </section>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl">Fastest-growing listed SKUs</h2>
            <Link to="/catalog" className="text-sm text-muted hover:text-fg">
              Open catalog
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {picks
              .slice()
              .sort((a, b) => b.signal.caGrowth12w - a.signal.caGrowth12w)
              .slice(0, 4)
              .map((p) => (
                <article key={p.id} className="flex gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
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
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <p className="text-xs tracking-wide text-subtle uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums tracking-tight">
        {currency && typeof value === "number" ? <Price amount={value} currency={currency} compact /> : value}
      </p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}
