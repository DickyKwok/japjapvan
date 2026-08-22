import { ExternalLink } from "lucide-react";
import { applyQuote, offerRegion } from "@/lib/pricing";
import { formatMoney } from "@/lib/money";
import { useI18n } from "@/lib/i18n";
import type { Product, RankedOffer } from "@/data/types";

export function BuyLinks({
  product,
  compact,
}: {
  product: Pick<Product, "id" | "sellCad" | "landedCad" | "weightG" | "brand" | "name" | "keyword">;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const priced = applyQuote(product);
  const offers = priced.buyOffers;
  if (!offers.length) {
    return <p className="text-[11px] text-subtle">{t("econ.deskEstimate")}</p>;
  }

  const visible = compact ? offers.slice(0, 5) : offers;

  return (
    <div className="space-y-1">
      <p className="text-[10px] tracking-wide text-subtle uppercase">
        {t("econ.buyLinks")}
        {priced.shelfLinked ? ` · ${t("econ.cheapestGrounds")}` : ""}
      </p>
      <ul className={compact ? "space-y-0.5" : "space-y-1"}>
        {visible.map((o, i) => (
          <BuyRow key={`${o.source}-${o.url}`} offer={o} index={i} compact={compact} />
        ))}
      </ul>
    </div>
  );
}

function BuyRow({
  offer,
  index,
  compact,
}: {
  offer: RankedOffer;
  index: number;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const region = offerRegion(offer);
  const isShelf = offer.kind === "shelf";
  const shelfTxt =
    isShelf && offer.shelf > 0
      ? formatMoney(offer.shelf, offer.currency, { compact: offer.currency === "JPY" })
      : t("econ.searchOnly");
  const cadTxt =
    isShelf && offer.buyCad != null ? ` · ${formatMoney(offer.buyCad, "CAD", { compact: true })}` : "";

  return (
    <li>
      <a
        href={offer.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex max-w-full items-center gap-1 text-[11px] text-primary hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {isShelf && index === 0 ? <span className="text-ok">{t("econ.cheapest")}</span> : null}
        <span className="text-subtle">{region}</span>
        {offer.sourceLabel}
        <span className="tabular-nums text-fg">
          {shelfTxt}
          {compact ? "" : cadTxt}
        </span>
        <ExternalLink className="size-3 shrink-0" />
      </a>
    </li>
  );
}
