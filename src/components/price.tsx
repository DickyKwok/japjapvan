import { formatMoney, type Currency } from "@/lib/money";
import { cn } from "@/lib/utils";

export function Price({
  amount,
  currency,
  compact,
  className,
}: {
  amount: number;
  currency: Currency;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("tabular-nums", className)} title={`${amount} ${currency}`}>
      {formatMoney(amount, currency, { compact })}
    </span>
  );
}

export function PricePair({
  sell,
  sellCurrency,
  cost,
  costCurrency,
  className,
}: {
  sell: number;
  sellCurrency: Currency;
  cost: number;
  costCurrency: Currency;
  className?: string;
}) {
  return (
    <p className={cn("text-xs text-muted", className)}>
      Sell <Price amount={sell} currency={sellCurrency} />
      <span className="mx-1.5 text-subtle">·</span>
      Cost <Price amount={cost} currency={costCurrency} />
    </p>
  );
}
