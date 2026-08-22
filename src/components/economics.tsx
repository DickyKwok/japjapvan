import { ExternalLink } from "lucide-react";
import { Price } from "@/components/price";
import { applyQuote, unitEcon } from "@/lib/pricing";
import { formatMoney } from "@/lib/money";
import { useI18n } from "@/lib/i18n";
import { pct } from "@/lib/utils";
import type { Product } from "@/data/types";

export function Economics({
  product,
  compact,
}: {
  product: Pick<Product, "id" | "sellCad" | "landedCad" | "weightG">;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const priced = applyQuote(product);
  const { margin, profit, coversFloor } = unitEcon(priced);
  const q = priced.buyQuote;

  const buyLine = q ? (
    <a
      href={q.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
    >
      {t("econ.buyAt")} {q.sourceLabel} · {formatMoney(q.shelf, q.currency, { compact: q.currency === "JPY" })}
      {q.regular != null ? ` (${t("econ.was")} ${formatMoney(q.regular, q.currency, { compact: q.currency === "JPY" })})` : ""}
      <ExternalLink className="size-3" />
    </a>
  ) : (
    <p className="text-[11px] text-subtle">{t("econ.deskEstimate")}</p>
  );

  if (compact) {
    return (
      <div className="space-y-1.5">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-[10px] tracking-wide text-subtle uppercase">{t("econ.cost")}</p>
            <p className="mt-0.5 font-medium">
              <Price amount={priced.landedCad} currency="CAD" compact />
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-wide text-subtle uppercase">{t("econ.sell")}</p>
            <p className="mt-0.5 font-medium">
              <Price amount={priced.sellCad} currency="CAD" compact />
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-wide text-subtle uppercase">{t("econ.margin")}</p>
            <p className={`mt-0.5 font-medium ${coversFloor ? "text-ok" : "text-warn"}`}>
              {pct(margin)}
            </p>
          </div>
        </div>
        {buyLine}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-4">
        <EconCell label={t("econ.costCad")} value={<Price amount={priced.landedCad} currency="CAD" />} />
        <EconCell label={t("econ.sellCad")} value={<Price amount={priced.sellCad} currency="CAD" />} />
        <EconCell
          label={t("econ.margin")}
          value={
            <span className={coversFloor ? "text-ok" : "text-warn"}>
              {pct(margin)}
              {!coversFloor ? <span className="ml-1.5 text-sm text-muted">{t("econ.belowFloor")}</span> : null}
            </span>
          }
        />
        <EconCell label={t("econ.profitCad")} value={<Price amount={profit} currency="CAD" />} />
      </div>
      {priced.shelfLinked && priced.buyCad != null ? (
        <p className="text-xs text-muted">
          {t("econ.landedBreakdown", {
            buy: formatMoney(priced.buyCad, "CAD"),
            freight: formatMoney(priced.freightCad ?? 0, "CAD"),
            gst: formatMoney(priced.gstCad ?? 0, "CAD"),
          })}
        </p>
      ) : null}
      {buyLine}
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
