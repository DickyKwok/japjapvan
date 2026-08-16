import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/price";
import { ProductThumb } from "@/components/product-thumb";
import { REVERSE_SKUS } from "@/data/reverse";
import { cadFromHkd } from "@/lib/money";
import { snapshotFor } from "@/lib/signals";
import { useI18n } from "@/lib/i18n";
import { growthLabel } from "@/lib/utils";

export const Route = createFileRoute("/lanes")({ component: LanesPage });

function LanesPage() {
  const { t } = useI18n();
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-display text-3xl tracking-tight">{t("lanes.title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{t("lanes.lede")}</p>
        </div>

        <section className="grid gap-3 md:grid-cols-2">
          <div className="border border-border bg-surface p-5">
            <p className="text-xs text-subtle">{t("lanes.aLive")}</p>
            <h2 className="mt-1 font-display text-2xl">{t("lanes.aTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t("lanes.aBody")}</p>
          </div>
          <div className="border border-border bg-surface p-5">
            <p className="text-xs text-subtle">{t("lanes.bProbe")}</p>
            <h2 className="mt-1 font-display text-2xl">{t("lanes.bTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t("lanes.bBody")}</p>
          </div>
        </section>

        <div className="overflow-x-auto border border-border bg-surface">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-border text-xs text-subtle">
              <tr>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">HK</th>
                <th className="px-3 py-2 font-medium">HK Trends</th>
                <th className="px-3 py-2 font-medium">CAD</th>
                <th className="px-3 py-2 font-medium">HKD</th>
              </tr>
            </thead>
            <tbody>
              {REVERSE_SKUS.map((p) => {
                const snap = snapshotFor(p.id);
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
                    <td className="px-3 py-2.5 text-xs text-muted">{p.dest}</td>
                    <td className="px-3 py-2.5">
                      <Badge>{growthLabel(snap?.hkGrowth12w ?? 0)}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <Price amount={cadFromHkd(p.sellHkd)} currency="CAD" />
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <Price amount={p.sellHkd} currency="HKD" />
                    </td>
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
