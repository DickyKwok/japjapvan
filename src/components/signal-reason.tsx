import { ExternalLink, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProductSignal } from "@/data/types";
import { growthLabel } from "@/lib/utils";

export function SignalReason({
  signal,
  compact,
}: {
  signal: ProductSignal;
  compact?: boolean;
}) {
  const up = signal.caGrowth12w >= 0;
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone={signal.eligible ? "ok" : "warn"}>{signal.eligible ? "Shopify list" : "Watch only"}</Badge>
        <Badge tone={up ? "ok" : "muted"}>
          {up ? <TrendingUp className="mr-1 size-3" /> : <TrendingDown className="mr-1 size-3" />}
          CA {growthLabel(signal.caGrowth12w)}
        </Badge>
        <span className="text-[10px] tracking-wide text-subtle uppercase">{signal.source}</span>
      </div>
      <p className={compact ? "text-xs leading-relaxed text-muted" : "text-sm leading-relaxed text-muted"}>
        {compact ? signal.reason : signal.whyListed}
      </p>
      <a
        href={signal.googleTrendsUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
      >
        Open Google Trends <ExternalLink className="size-3" />
      </a>
    </div>
  );
}
