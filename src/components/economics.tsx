import { Price } from "@/components/price";
import { wholesaleJpyFromLandedCad } from "@/lib/money";
import { marginPct, profitCad } from "@/lib/scoring-core";
import { useI18n } from "@/lib/i18n";
import { pct } from "@/lib/utils";
import type { Product } from "@/data/types";

export function Economics({
  product,
  compact,
}: {
  product: Pick<Product, "sellCad" | "landedCad">;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const profit = profitCad(product);
  const margin = marginPct(product);
  const wholesale = wholesaleJpyFromLandedCad(product.landedCad);

  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-[10px] tracking-wide text-subtle uppercase">{t("econ.cost")}</p>
          <p className="mt-0.5 font-medium">
            <Price amount={product.landedCad} currency="CAD" compact />
          </p>
        </div>
        <div>
          <p className="text-[10px] tracking-wide text-subtle uppercase">{t("econ.sell")}</p>
          <p className="mt-0.5 font-medium">
            <Price amount={product.sellCad} currency="CAD" compact />
          </p>
        </div>
        <div>
          <p className="text-[10px] tracking-wide text-subtle uppercase">{t("econ.profit")}</p>
          <p className="mt-0.5 font-medium text-ok">
            <Price amount={profit} currency="CAD" compact />
            <span className="ml-1 text-[10px] text-muted">{pct(margin)}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <EconCell label={t("econ.costCad")} value={<Price amount={product.landedCad} currency="CAD" />} />
      <EconCell label={t("econ.wholesale")} value={<Price amount={wholesale} currency="JPY" />} />
      <EconCell label={t("econ.sellCad")} value={<Price amount={product.sellCad} currency="CAD" />} />
      <EconCell
        label={t("econ.profitCad")}
        value={
          <span className="text-ok">
            <Price amount={profit} currency="CAD" />
            <span className="ml-1 text-sm text-muted">{pct(margin)}</span>
          </span>
        }
      />
    </div>
  );
}

function EconCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-border bg-bg-elevated p-3">
      <p className="text-[10px] tracking-wide text-subtle uppercase">{label}</p>
      <p className="mt-1 font-display text-lg tabular-nums">{value}</p>
    </div>
  );
}
