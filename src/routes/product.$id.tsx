import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Economics } from "@/components/economics";
import { ProductThumb } from "@/components/product-thumb";
import { SignalReason } from "@/components/signal-reason";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRODUCTS, productById } from "@/data/products";
import { useListing } from "@/lib/use-listing";
import { useI18n } from "@/lib/i18n";
import { growthLabel } from "@/lib/utils";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const id = decodeURIComponent(params.id);
    return { id, exists: PRODUCTS.some((p) => p.id === id) };
  },
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useLoaderData();
  const { catalog } = useListing();
  const { t } = useI18n();
  const scored = catalog.find((p) => p.id === id);
  const raw = productById(id);
  const p = scored ?? (raw ? { ...raw, score: null, signal: null } : null);

  if (!p) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl py-16 text-center">
          <p className="text-sm text-muted">{t("product.missing")}</p>
          <Link to="/catalog" className="mt-4 inline-block text-sm text-primary">
            {t("product.backBoard")}
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <Link to="/catalog" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-3.5" /> {t("product.backBoard")}
        </Link>

        <div className="grid gap-6 md:grid-cols-[minmax(0,280px)_1fr]">
          <ProductThumb id={p.id} alt={`${p.brand} ${p.name}`} size="lg" className="aspect-square w-full" />
          <div className="space-y-4">
            <div>
              <p className="text-xs tracking-[0.16em] text-subtle uppercase">
                {p.brand} · {p.origin} · {t(`cat.${p.category}`)}
              </p>
              <h1 className="mt-1 font-display text-3xl tracking-tight">{p.name}</h1>
              <p className="mt-2 text-sm text-muted">{p.notes}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {p.discovered ? <Badge>{t("product.newFind")}</Badge> : null}
              {p.signal?.eligible ? (
                <Badge tone="ok">{t("product.fit")}</Badge>
              ) : (
                <Badge tone="warn">{t("product.watch")}</Badge>
              )}
              {p.signal ? <Badge tone="muted">CA {growthLabel(p.signal.caGrowth12w)}</Badge> : null}
            </div>
            <Economics product={p} />
            {p.signal ? <SignalReason signal={p.signal} /> : null}
          </div>
        </div>

        <section className="grid gap-3 sm:grid-cols-3">
          <Fact label={t("product.moq")} value={String(p.moq)} />
          <Fact label={t("product.lead")} value={`${p.leadDays}d`} />
          <Fact label={t("product.weight")} value={`${p.weightG}g`} />
          <Fact label={t("product.stock")} value={String(p.stock)} />
          <Fact label={t("product.preorders")} value={String(p.preorders)} />
          <Fact label={t("product.velocity")} value={`${p.weeklyVelocity}/wk`} />
        </section>

        <div className="flex flex-wrap gap-2">
          <Link to="/catalog">
            <Button variant="outline">{t("product.backBoard")}</Button>
          </Link>
          {p.signal?.googleTrendsUrl ? (
            <a href={p.signal.googleTrendsUrl} target="_blank" rel="noreferrer">
              <Button>
                {t("signal.open")} <ExternalLink className="size-3.5" />
              </Button>
            </a>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-surface p-3">
      <p className="text-[10px] tracking-wide text-subtle uppercase">{label}</p>
      <p className="mt-1 font-display text-xl tabular-nums">{value}</p>
    </div>
  );
}
