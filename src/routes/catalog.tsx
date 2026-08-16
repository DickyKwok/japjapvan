import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Images } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CriteriaBanner } from "@/components/criteria-banner";
import { Price } from "@/components/price";
import { ProductThumb } from "@/components/product-thumb";
import { SignalReason } from "@/components/signal-reason";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_LABEL } from "@/data/products";
import type { Category } from "@/data/types";
import { downloadCatalogCsv, downloadSearchPack } from "@/lib/export";
import { wholesaleJpyFromLandedCad } from "@/lib/money";
import { marginPct } from "@/lib/scoring";
import { lastSignalsAt } from "@/lib/signals";
import { useListing } from "@/lib/use-listing";
import { growthLabel, pct } from "@/lib/utils";

export const Route = createFileRoute("/catalog")({ component: CatalogPage });

const CATS: Array<Category | "all"> = [
  "all",
  "skincare",
  "sunscreen",
  "hair",
  "tools",
  "stationery",
  "makeup",
  "daily",
];

type GateFilter = "shop" | "watch" | "all";

function CatalogPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [gate, setGate] = useState<GateFilter>("shop");
  const [busy, setBusy] = useState<"csv" | "pack" | null>(null);
  const { catalog, summary } = useListing();
  const fetched = lastSignalsAt().slice(0, 10);

  const rows = useMemo(() => {
    return catalog.filter((p) => {
      if (gate === "shop" && !p.signal.eligible) return false;
      if (gate === "watch" && p.signal.eligible) return false;
      if (cat !== "all" && p.category !== cat) return false;
      const hay = `${p.brand} ${p.name} ${p.keyword} ${p.sku} ${p.signal.reason}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [catalog, q, cat, gate]);

  function slug() {
    const bits = [gate, cat === "all" ? "all" : cat];
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
            <h1 className="font-display text-3xl tracking-tight">Catalog</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Found by the saved criteria. {summary.listed} shop-ready · {summary.watch} watch · {summary.live} live
              series · refreshed {fetched}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onCsv} disabled={!rows.length || busy !== null}>
              <Download className="size-4" />
              {busy === "csv" ? "Preparing…" : "Download CSV"}
            </Button>
            <Button onClick={onPack} disabled={!rows.length || busy !== null}>
              <Images className="size-4" />
              {busy === "pack" ? "Packing…" : "Download images"}
            </Button>
          </div>
        </div>

        <CriteriaBanner />

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["shop", `Shopify list (${summary.listed})`],
              ["watch", `Watch (${summary.watch})`],
              ["all", `All ${summary.total}`],
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
            placeholder="Search brand, product, keyword, or reason"
            className="md:max-w-sm"
          />
          <div className="flex flex-wrap gap-1.5">
            {CATS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`h-8 rounded-full px-3 text-xs ${cat === c ? "bg-fg text-bg" : "bg-surface text-muted"}`}
              >
                {c === "all" ? "All" : CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-10 text-center text-sm text-muted">
            No SKUs match this search and the saved criteria. Relax the rule on Criteria.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
                <ProductThumb id={p.id} alt={`${p.brand} ${p.name}`} size="lg" className="h-44 rounded-none" />
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-subtle">{p.brand}</p>
                      <h2 className="text-sm font-medium leading-snug">{p.name}</h2>
                    </div>
                    <Badge tone="ink">{growthLabel(p.signal.caGrowth12w)}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="muted">{CATEGORY_LABEL[p.category]}</Badge>
                    {p.score.selected ? <Badge>shortlist</Badge> : null}
                  </div>
                  <p className="text-xs text-muted">
                    Sell <Price amount={p.sellCad} currency="CAD" />
                    <span className="mx-1.5 text-subtle">·</span>
                    Landed <Price amount={p.landedCad} currency="CAD" />
                  </p>
                  <p className="text-xs text-subtle">
                    JP wholesale <Price amount={wholesaleJpyFromLandedCad(p.landedCad)} currency="JPY" />
                    <span className="mx-1.5">·</span>
                    {pct(marginPct(p))} margin
                  </p>
                  <SignalReason signal={p.signal} compact />
                  <p className="font-mono text-[11px] text-subtle">{p.sku}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
