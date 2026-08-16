import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { CriteriaBanner } from "@/components/criteria-banner";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/price";
import { ProductThumb } from "@/components/product-thumb";
import { PRODUCTS } from "@/data/products";
import { signalFor } from "@/lib/signals";
import { useCriteriaStore } from "@/lib/criteria-store";
import { growthLabel } from "@/lib/utils";

export const Route = createFileRoute("/preorders")({ component: PreordersPage });

function PreordersPage() {
  const criteria = useCriteriaStore((s) => s.criteria);
  const rows = [...PRODUCTS].filter((p) => p.preorders > 0).sort((a, b) => b.preorders - a.preorders);
  const units = rows.reduce((s, p) => s + p.preorders, 0);
  const cash = rows.reduce((s, p) => s + p.preorders * p.sellCad, 0);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Pre-orders</h1>
          <p className="mt-1 text-sm text-muted">
            Customers pay now in CAD, we ship next month. {units} units committed ·{" "}
            <Price amount={cash} currency="CAD" /> booked.
          </p>
        </div>
        <CriteriaBanner />
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs text-subtle">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Booked</th>
                <th className="px-3 py-2 font-medium">Booked CAD</th>
                <th className="px-3 py-2 font-medium">CA Trends</th>
                <th className="px-3 py-2 font-medium">Cover</th>
                <th className="px-3 py-2 font-medium">Ship window</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const cover = p.stock + p.incoming;
                const gap = p.preorders - cover;
                const signal = signalFor(p, criteria);
                return (
                  <tr key={p.id} className="border-b border-border/70 last:border-0">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <ProductThumb id={p.id} alt={`${p.brand} ${p.name}`} size="sm" />
                        <div>
                          <p className="font-medium">{p.brand}</p>
                          <p className="text-xs text-muted">{p.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">{p.preorders}</td>
                    <td className="px-3 py-2.5 text-xs">
                      <Price amount={p.preorders * p.sellCad} currency="CAD" />
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <Badge tone={signal.eligible ? "ok" : "warn"}>{growthLabel(signal.caGrowth12w)}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      {cover} on hand/in
                      {gap > 0 ? (
                        <Badge tone="warn" className="ml-2">
                          short {gap}
                        </Badge>
                      ) : (
                        <Badge tone="ok" className="ml-2">
                          covered
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted">{p.leadDays} days after PO</td>
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
