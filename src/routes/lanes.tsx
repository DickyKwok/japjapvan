import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/price";
import { ProductThumb } from "@/components/product-thumb";
import { REVERSE_SKUS } from "@/data/reverse";
import { cadFromHkd } from "@/lib/money";
import { snapshotFor } from "@/lib/signals";
import { growthLabel } from "@/lib/utils";

export const Route = createFileRoute("/lanes")({ component: LanesPage });

function LanesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Lanes</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Primary lane is Japan / Hong Kong → Vancouver (sell in CAD, buy in JPY). Reverse lane is Canadian
            wellness → Hong Kong (sell in HKD). Same storefront, two books, every price labelled.
          </p>
        </div>

        <section className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <p className="text-xs text-subtle">Lane A · live</p>
            <h2 className="mt-1 font-display text-2xl">JP / HK → Vancouver</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Shopify checkout is CAD. Japan wholesale is shown in JPY. A SKU only lists when Canada Google Trends
              grows or holds.
            </p>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <p className="text-xs text-subtle">Lane B · probe</p>
            <h2 className="mt-1 font-display text-2xl">Canada → Hong Kong</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Sell prices are HKD. Landed cost is HKD. Source retail is shown in CAD so the Vancouver buyer can
              compare.
            </p>
          </div>
        </section>

        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-border text-xs text-subtle">
              <tr>
                <th className="px-3 py-2 font-medium">Reverse SKU</th>
                <th className="px-3 py-2 font-medium">Dest</th>
                <th className="px-3 py-2 font-medium">HK Trends</th>
                <th className="px-3 py-2 font-medium">Sell HKD</th>
                <th className="px-3 py-2 font-medium">Landed HKD</th>
                <th className="px-3 py-2 font-medium">Source CAD</th>
                <th className="px-3 py-2 font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {REVERSE_SKUS.map((p) => {
                const snap = snapshotFor(p.id);
                return (
                  <tr key={p.id} className="border-b border-border/70 last:border-0">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <ProductThumb id={p.id} alt={`${p.brand} ${p.name}`} size="sm" />
                        <div>
                          <p className="font-medium">{p.brand}</p>
                          <p className="text-xs text-muted">{p.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge tone="muted">{p.dest}</Badge>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-xs">
                      {snap ? growthLabel(snap.hkGrowth12w) : "—"}
                      {p.rising ? (
                        <Badge tone="ok" className="ml-2">
                          up
                        </Badge>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <Price amount={p.sellHkd} currency="HKD" />
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <Price amount={p.landedHkd} currency="HKD" />
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <Price amount={cadFromHkd(p.landedHkd)} currency="CAD" />
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted">{snap?.reason ?? p.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
