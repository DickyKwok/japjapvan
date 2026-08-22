import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Flame } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Economics } from "@/components/economics";
import { ProductThumb } from "@/components/product-thumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useListing } from "@/lib/use-listing";
import { useI18n } from "@/lib/i18n";
import { risingData } from "@/lib/rising";
import { growthLabel } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Discover });

const MERCH = /skincare|serum|lotion|sunscreen|spf|uv|mask|cream|shampoo|hair|mascara|pen|notebook|snack|chocolate|pocky|mayo|cosme|護膚|防曬|文具|零食|コスメ|化粧水|日焼け止め/i;
const SKIP = /ufc|mlb|election|甲子園|高校|vs |trump|rogan|低氣壓|火災|騎手/i;

function Discover() {
  const { catalog, picks, watch, summary } = useListing();
  const { t } = useI18n();
  const rising = risingData();
  const hero = picks[0];
  const miss = watch
    .filter((p) => p.signal.caGrowth12w >= 12)
    .sort((a, b) => b.signal.caGrowth12w - a.signal.caGrowth12w)
    .slice(0, 4);
  const fresh = catalog.filter((p) => p.discovered).slice(0, 6);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs tracking-[0.18em] text-subtle uppercase">{t("disc.kicker")}</p>
            <h1 className="mt-1 font-display text-4xl tracking-tight md:text-5xl">{t("disc.title")}</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{t("disc.lede")}</p>
          </div>
          <Link to="/catalog">
            <Button>
              {t("disc.openBoard")} <ArrowUpRight className="size-4" />
            </Button>
          </Link>
        </div>

        <section className="grid gap-3 sm:grid-cols-3">
          <Stat label={t("disc.listed")} value={summary.top50} hint={t("disc.listedHint")} />
          <Stat label={t("disc.watch")} value={watch.length} hint={t("disc.watchHint")} />
          <Stat label={t("disc.fresh")} value={fresh.length} hint={t("disc.freshHint")} />
        </section>

        {hero ? (
          <Link
            to="/product/$id"
            params={{ id: hero.id }}
            className="grid gap-4 border border-primary/40 bg-surface p-4 md:grid-cols-[220px_1fr] md:p-5"
          >
            <ProductThumb id={hero.id} alt={hero.name} size="lg" className="aspect-square w-full" />
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>
                  <Flame className="mr-1 size-3" /> {t("disc.pick")}
                </Badge>
                <Badge tone={hero.signal.hasLiveDemand ? "ok" : "muted"}>
                  {hero.signal.hasLiveDemand ? `CA ${growthLabel(hero.signal.caGrowth12w)}` : t("signal.nodata")}
                </Badge>
                {hero.preorders > 0 ? (
                  <Badge tone="warn">{t("disc.waiting", { n: hero.preorders })}</Badge>
                ) : null}
              </div>
              <div>
                <p className="text-xs text-subtle">{hero.brand}</p>
                <h2 className="font-display text-2xl">{hero.name}</h2>
                <p className="mt-1 text-sm text-muted">{hero.signal.reason}</p>
              </div>
              <Economics product={hero} compact />
              <p className="text-xs text-subtle">{t("disc.tapDetail")}</p>
            </div>
          </Link>
        ) : null}

        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-xs tracking-wide text-subtle uppercase">{t("disc.markets")}</p>
              <h2 className="font-display text-xl">{t("disc.now")}</h2>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {(["CA", "JP", "HK"] as const).map((geo) => {
              const topics = rising.markets[geo].topics;
              const merch = topics.filter((x) => MERCH.test(x.title) && !SKIP.test(x.title));
              const shown = (merch.length ? merch : topics).slice(0, 4);
              return (
                <div key={geo} className="border border-border bg-surface p-4">
                  <p className="text-xs text-subtle">{t(`market.${geo}`)}</p>
                  <ol className="mt-3 space-y-2">
                    {shown.map((topic, i) => {
                      const merchHit = MERCH.test(topic.title) && !SKIP.test(topic.title);
                      return (
                        <li key={topic.title} className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[11px] text-subtle">#{String(i + 1).padStart(2, "0")}</p>
                            <p className="text-sm font-medium leading-snug">{topic.title}</p>
                            <p className="text-[11px] text-muted">
                              {merchHit ? t("disc.merchFit") : t("disc.notMerch")}
                            </p>
                          </div>
                          <Badge tone={merchHit ? "ok" : "muted"}>{topic.trafficLabel}</Badge>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              );
            })}
          </div>
        </section>

        {fresh.length > 0 ? (
          <section>
            <h2 className="font-display text-xl">{t("disc.newFinds")}</h2>
            <p className="mt-1 text-sm text-muted">{t("disc.newFindsLede")}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fresh.map((p) => (
                <ProductCard key={p.id} id={p.id} brand={p.brand} name={p.name} reason={p.notes} growth={p.signal.caGrowth12w} live={p.signal.hasLiveDemand} product={p} badge={t("product.newFind")} />
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="font-display text-xl">{t("disc.picks")}</h2>
          <p className="mt-1 text-sm text-muted">{t("disc.picksLede")}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {picks.slice(0, 6).map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                brand={p.brand}
                name={p.name}
                reason={p.signal.reason}
                growth={p.signal.caGrowth12w}
                live={p.signal.hasLiveDemand}
                product={p}
                badge={p.preorders > 0 ? t("disc.waiting", { n: p.preorders }) : undefined}
              />
            ))}
          </div>
        </section>

        {miss.length > 0 ? (
          <section>
            <h2 className="font-display text-xl">{t("disc.miss")}</h2>
            <p className="mt-1 text-sm text-muted">{t("disc.missLede")}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {miss.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  brand={p.brand}
                  name={p.name}
                  reason={p.signal.reason}
                  growth={p.signal.caGrowth12w}
                  live={p.signal.hasLiveDemand}
                  product={p}
                  badge={t("product.watch")}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}

function ProductCard({
  id,
  brand,
  name,
  reason,
  growth,
  live,
  product,
  badge,
}: {
  id: string;
  brand: string;
  name: string;
  reason: string;
  growth: number;
  live: boolean;
  product: {
    id: string;
    sellCad: number;
    landedCad: number;
    weightG: number;
    brand: string;
    name: string;
    keyword: string;
  };
  badge?: string;
}) {
  const { t } = useI18n();
  return (
    <Link to="/product/$id" params={{ id }} className="flex gap-3 border border-border bg-surface p-3 hover:border-primary/50">
      <ProductThumb id={id} alt={name} size="md" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] text-subtle">{brand}</p>
            <p className="truncate text-sm font-medium">{name}</p>
          </div>
          <Badge tone={live ? "ok" : "muted"}>{live ? `CA ${growthLabel(growth)}` : t("signal.nodata")}</Badge>
        </div>
        {badge ? <Badge tone="warn">{badge}</Badge> : null}
        <p className="line-clamp-2 text-xs text-muted">{reason}</p>
        <Economics product={product} compact />
      </div>
    </Link>
  );
}

function Stat({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="border border-border bg-surface p-4">
      <p className="text-xs tracking-wide text-subtle uppercase">{label}</p>
      <p className="mt-1 font-display text-3xl tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}
