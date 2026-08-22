import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Images } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CriteriaBanner } from "@/components/criteria-banner";
import { Economics } from "@/components/economics";
import { ProductThumb } from "@/components/product-thumb";
import { SignalReason } from "@/components/signal-reason";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ALL_AISLES, aisleFor, type Aisle } from "@/data/aisles";
import { drugstoreShelf } from "@/data/drugstore";
import { downloadCatalogCsv, downloadSearchPack } from "@/lib/export";
import { loadScanHealth } from "@/lib/listing-history-fns";
import { lastSignalsAt } from "@/lib/signals";
import { useListing } from "@/lib/use-listing";
import { useI18n } from "@/lib/i18n";
import { growthLabel } from "@/lib/utils";

export const Route = createFileRoute("/catalog")({
  loader: () => loadScanHealth(),
  component: CatalogPage,
});

type GateFilter = "top" | "watch" | "all";

function CatalogPage() {
  const [q, setQ] = useState("");
  const [aisle, setAisle] = useState<Aisle | "all">("all");
  const [gate, setGate] = useState<GateFilter>("top");
  const [busy, setBusy] = useState<"csv" | "pack" | null>(null);
  const { catalog, summary, picks, watch } = useListing();
  const health = Route.useLoaderData();
  const { t } = useI18n();
  const fetched = lastSignalsAt().slice(0, 10);

  const rows = useMemo(() => {
    return catalog.filter((p) => {
      if (gate === "top" && !p.score.selected) return false;
      if (gate === "watch" && p.score.selected) return false;
      if (aisle !== "all" && aisleFor(p.id) !== aisle) return false;
      const hay = `${p.brand} ${p.name} ${p.keyword} ${p.sku} ${p.signal.reason} ${aisleFor(p.id)}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [catalog, q, aisle, gate]);

  function slug() {
    const bits = [gate, aisle === "all" ? "all" : aisle];
    if (q.trim()) bits.push(q.trim().replace(/\s+/g, "-").toLowerCase().slice(0, 24));
    return bits.join("-");
  }

  async function onCsv() {
    setBusy("csv");
    try {
      downloadCatalogCsv(rows, `japjapvan-${slug()}.csv`);
    } finally {
      setBusy(null);
    }
  }

  async function onPack() {
    setBusy("pack");
    try {
      await downloadSearchPack(rows, `japjapvan-${slug()}-pack.zip`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-tight">{t("catalog.title")}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              {t("catalog.lede", {
                listed: summary.top50,
                watch: watch.length,
                live: summary.live,
                date: fetched,
              })}
            </p>
            <p className="mt-2 max-w-2xl text-xs text-muted">{t("catalog.priceNote")}</p>
            <p className={`mt-1 text-xs ${health.stale ? "text-warn" : "text-subtle"}`}>
              {health.lastFullSweepAt
                ? t(health.stale ? "catalog.stale" : "catalog.freshScan", {
                    date: health.lastFullSweepAt.slice(0, 10),
                  })
                : t("catalog.scanning", { done: health.scannedThisCycle, total: health.queryCount })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onCsv} disabled={!rows.length || busy !== null}>
              <Download className="size-4" />
              {busy === "csv" ? t("catalog.preparing") : t("catalog.csv")}
            </Button>
            <Button onClick={onPack} disabled={!rows.length || busy !== null}>
              <Images className="size-4" />
              {busy === "pack" ? t("catalog.packing") : t("catalog.images")}
            </Button>
          </div>
        </div>

        <CriteriaBanner />

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["top", t("catalog.top50", { n: picks.length })],
              ["watch", t("catalog.watch", { n: watch.length })],
              ["all", t("catalog.all", { n: summary.total })],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setGate(id)}
              className={`h-10 rounded-full px-4 text-xs ${gate === id ? "bg-primary text-primary-fg" : "bg-surface text-muted"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("catalog.search")}
            className="md:max-w-sm"
          />
          <div className="flex flex-wrap gap-1.5">
            {(["all", ...ALL_AISLES] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAisle(c)}
                className={`h-8 rounded-full px-3 text-xs ${aisle === c ? "bg-fg text-bg" : "bg-surface text-muted"}`}
              >
                {c === "all" ? t("catalog.allCats") : t(`aisle.${c}`)}
              </button>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-10 text-center text-sm text-muted">
            {t("catalog.empty")}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((p) => (
              <article key={p.id} className="overflow-hidden border border-border bg-surface">
                <Link to="/product/$id" params={{ id: p.id }} className="block">
                  <ProductThumb id={p.id} alt={`${p.brand} ${p.name}`} size="lg" className="h-44" />
                </Link>
                <div className="space-y-2 p-4">
                  <Link to="/product/$id" params={{ id: p.id }} className="block">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-subtle">{p.brand}</p>
                        <h2 className="text-sm font-medium leading-snug hover:underline">{p.name}</h2>
                      </div>
                      <Badge tone="ink">{p.signal.hasLiveDemand ? growthLabel(p.signal.caGrowth12w) : t("signal.nodata")}</Badge>
                    </div>
                  </Link>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="muted">{t(`aisle.${aisleFor(p.id)}`)}</Badge>
                    <Badge tone="muted">{t(`drug.${drugstoreShelf(p.id)}`)}</Badge>
                    {p.score.selected ? <Badge>{t("catalog.shortlist")}</Badge> : null}
                    {p.discovered ? <Badge>{t("product.newFind")}</Badge> : null}
                  </div>
                  <Economics product={p} compact />
                  <SignalReason signal={p.signal} compact />
                  <Link to="/product/$id" params={{ id: p.id }} className="inline-block text-xs text-primary hover:underline">
                    {t("product.open")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
