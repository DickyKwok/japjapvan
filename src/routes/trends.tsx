import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CriteriaBanner } from "@/components/criteria-banner";
import { SignalReason } from "@/components/signal-reason";
import { ProductThumb } from "@/components/product-thumb";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS } from "@/data/products";
import { seriesFor } from "@/data/trends";
import { signalFor } from "@/lib/signals";
import { useCriteriaStore } from "@/lib/criteria-store";
import { useI18n } from "@/lib/i18n";
import { growthLabel } from "@/lib/utils";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/trends")({ component: TrendsPage });

function TrendsPage() {
  const criteria = useCriteriaStore((s) => s.criteria);
  const revision = useCriteriaStore((s) => s.revision);
  const { t } = useI18n();
  const ranked = useMemo(
    () =>
      [...PRODUCTS].sort((a, b) => {
        const sa = signalFor(a, criteria);
        const sb = signalFor(b, criteria);
        if (sa.eligible !== sb.eligible) return sa.eligible ? -1 : 1;
        return sb.caGrowth12w - sa.caGrowth12w;
      }),
    [criteria, revision],
  );
  const [id, setId] = useState(ranked[0]?.id ?? PRODUCTS[0].id);
  const product = PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
  const signal = signalFor(product, criteria);
  const data = useMemo(() => seriesFor(product.keyword), [product.keyword]);
  const latest = data[data.length - 1];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <h1 className="font-display text-3xl tracking-tight">{t("trends.title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            {t("trends.lede", { growth: criteria.minCaGrowth12w, index: criteria.minCaIndex, jp: criteria.minJpIndex })}
          </p>
        </div>
        <CriteriaBanner />

        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <div className="max-h-[70vh] overflow-auto rounded-[var(--radius-lg)] border border-border bg-surface">
            {ranked.map((p) => {
              const s = signalFor(p, criteria);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setId(p.id)}
                  className={`flex w-full items-center gap-2 border-b border-border/70 px-3 py-2.5 text-left last:border-0 ${p.id === id ? "bg-bg-elevated" : ""}`}
                >
                  <ProductThumb id={p.id} alt={`${p.brand} ${p.name}`} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="text-xs text-subtle">{p.brand}</span>
                      <span className={`text-[11px] tabular-nums ${s.eligible ? "text-ok" : "text-subtle"}`}>
                        {growthLabel(s.caGrowth12w)}
                      </span>
                    </span>
                    <span className="block truncate text-sm">{p.name}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <ProductThumb id={product.id} alt={`${product.brand} ${product.name}`} size="md" />
                  <div>
                    <p className="text-xs text-subtle">{product.keyword}</p>
                    <h2 className="font-display text-2xl">{product.brand}</h2>
                    <p className="text-sm text-muted">{product.name}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>CA {latest.CA}</Badge>
                  <Badge tone="muted">JP {latest.JP}</Badge>
                  <Badge tone="muted">HK {latest.HK}</Badge>
                  <Badge tone={signal.eligible ? "ok" : "warn"}>{growthLabel(signal.caGrowth12w)} 12w</Badge>
                </div>
              </div>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 10, fill: "var(--color-subtle)" }}
                      tickFormatter={(v) => String(v).slice(5)}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--color-subtle)" }} width={28} />
                    <Tooltip
                      contentStyle={{
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        background: "var(--color-surface)",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="CA" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="JP" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="HK" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
              <SignalReason signal={signal} />
              <p className="mt-3 text-xs text-subtle">
                Fetched {signal.fetchedAt.slice(0, 10)} · source {signal.source}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Note
                title={t("trends.ca")}
                body={t("trends.caBody", { growth: criteria.minCaGrowth12w, index: criteria.minCaIndex })}
              />
              <Note title={t("trends.jp")} body={t("trends.jpBody", { jp: criteria.minJpIndex })} />
              <Note title={t("trends.hk")} body={t("trends.hkBody")} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Note({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">{body}</p>
    </div>
  );
}
