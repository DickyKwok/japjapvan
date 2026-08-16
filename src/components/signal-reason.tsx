import { ExternalLink, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProductSignal } from "@/data/types";
import { useI18n } from "@/lib/i18n";
import { growthLabel } from "@/lib/utils";

export function SignalReason({
  signal,
  compact,
}: {
  signal: ProductSignal;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const live = signal.hasLiveDemand;
  const sourceKey =
    signal.source === "google-trends"
      ? "signal.gt"
      : signal.source === "wikipedia-pageviews"
        ? "signal.wiki"
        : "signal.none";
  const href = signal.evidenceUrl || (signal.source === "google-trends" ? signal.googleTrendsUrl : "");

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone={signal.eligible ? "ok" : "warn"}>{signal.eligible ? t("signal.shop") : t("signal.watch")}</Badge>
        {live ? (
          <Badge tone={signal.caGrowth12w >= 0 ? "ok" : "muted"}>
            {signal.caGrowth12w >= 0 ? <TrendingUp className="mr-1 size-3" /> : <TrendingDown className="mr-1 size-3" />}
            {growthLabel(signal.caGrowth12w)}
          </Badge>
        ) : (
          <Badge tone="muted">{t("signal.nodata")}</Badge>
        )}
        <span className="text-[10px] tracking-wide text-subtle uppercase">{t(sourceKey)}</span>
      </div>
      <p className={compact ? "text-xs leading-relaxed text-muted" : "text-sm leading-relaxed text-muted"}>
        {compact ? signal.reason : signal.whyListed}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
        >
          {live ? signal.evidenceLabel || t("signal.openEvidence") : t("signal.open")}{" "}
          <ExternalLink className="size-3" />
        </a>
      ) : null}
    </div>
  );
}
