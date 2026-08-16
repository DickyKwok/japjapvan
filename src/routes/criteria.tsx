import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ALL_CATEGORIES, ALL_ORIGINS, cloneCriteria, criteriaEqual, DEFAULT_CRITERIA, type ListingCriteria } from "@/data/criteria";
import { CATEGORY_LABEL } from "@/data/products";
import { useCriteriaStore } from "@/lib/criteria-store";
import { signalSummary } from "@/lib/signals";

export const Route = createFileRoute("/criteria")({ component: CriteriaPage });

function CriteriaPage() {
  const saved = useCriteriaStore((s) => s.criteria);
  const revision = useCriteriaStore((s) => s.revision);
  const save = useCriteriaStore((s) => s.setDraftAndSave);
  const reset = useCriteriaStore((s) => s.resetDefaults);
  const [draft, setDraft] = useState<ListingCriteria>(() => cloneCriteria(saved));
  const navigate = useNavigate();
  const dirty = !criteriaEqual(draft, saved);
  const preview = useMemo(() => signalSummary(draft), [draft]);
  const current = useMemo(() => signalSummary(saved), [saved, revision]);

  function patch(partial: Partial<ListingCriteria>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  function toggleCat(cat: ListingCriteria["categories"][number]) {
    setDraft((d) => {
      const has = d.categories.includes(cat);
      const categories = has ? d.categories.filter((c) => c !== cat) : [...d.categories, cat];
      return { ...d, categories: categories.length ? categories : d.categories };
    });
  }

  function toggleOrigin(o: ListingCriteria["origins"][number]) {
    setDraft((d) => {
      const has = d.origins.includes(o);
      const origins = has ? d.origins.filter((x) => x !== o) : [...d.origins, o];
      return { ...d, origins: origins.length ? origins : d.origins };
    });
  }

  function onSave() {
    save(draft);
    toast.success(`Saved rule v${revision + 1} — ${preview.listed} SKUs now listed`);
    window.setTimeout(() => navigate({ to: "/catalog" }), 400);
  }

  return (
    <AppShell>
      <Toaster position="top-center" />
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-xs tracking-[0.18em] text-subtle uppercase">How SKUs get found</p>
          <h1 className="mt-1 font-display text-3xl tracking-tight">Listing criteria</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Every desk — HQ, catalog, shortlist, 採購, pre-orders — uses this saved rule. Change it, save, and
            the shop list recomputes. A SKU only appears when its demand series passes the Trends gate and the
            merchandising filters.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <p className="text-xs text-subtle">Live with saved rule v{revision}</p>
            <p className="mt-1 font-display text-3xl tabular-nums">{current.listed}</p>
            <p className="text-xs text-muted">{current.watch} on watch</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-primary/30 bg-bg-elevated p-4">
            <p className="text-xs text-subtle">Preview of this draft</p>
            <p className="mt-1 font-display text-3xl tabular-nums">{preview.listed}</p>
            <p className="text-xs text-muted">
              {preview.listed === current.listed ? "Same as saved" : `${preview.listed - current.listed > 0 ? "+" : ""}${preview.listed - current.listed} vs saved`}
            </p>
          </div>
        </div>

        <section className="space-y-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="font-display text-xl">Demand gate</h2>
          <SliderRow
            label="Min Canada 12-week growth"
            hint="Growing topics. A SKU at +40% lists if this is 12."
            value={draft.minCaGrowth12w}
            min={0}
            max={80}
            suffix="%"
            onChange={(n) => patch({ minCaGrowth12w: n })}
          />
          <SliderRow
            label="Min Canada stable index"
            hint="High-but-flat demand still lists if growth is not collapsing."
            value={draft.minCaIndex}
            min={20}
            max={90}
            onChange={(n) => patch({ minCaIndex: n })}
          />
          <SliderRow
            label="Min Japan source index"
            hint="If Japan is dead, we do not import."
            value={draft.minJpIndex}
            min={0}
            max={80}
            onChange={(n) => patch({ minJpIndex: n })}
          />
          <SliderRow
            label="Stable-demand floor"
            hint="Allowed 12-week change when using the high-index path."
            value={draft.stableFloor}
            min={-20}
            max={10}
            suffix="%"
            onChange={(n) => patch({ stableFloor: n })}
          />
        </section>

        <section className="space-y-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="font-display text-xl">Merchandising filters</h2>
          <SliderRow
            label="Min gross margin"
            hint="(sell CAD − landed CAD) / sell CAD"
            value={Math.round(draft.minMarginPct * 100)}
            min={0}
            max={60}
            suffix="%"
            onChange={(n) => patch({ minMarginPct: n / 100 })}
          />
          <SliderRow
            label="Max unit weight"
            hint="Air-friendly SKUs first."
            value={draft.maxWeightG}
            min={50}
            max={1000}
            step={10}
            suffix="g"
            onChange={(n) => patch({ maxWeightG: n })}
          />
          <SliderRow
            label="Max lead time"
            hint="Pre-order cycle is about a month."
            value={draft.maxLeadDays}
            min={7}
            max={45}
            suffix="d"
            onChange={(n) => patch({ maxLeadDays: n })}
          />
          <SliderRow
            label="Min uniqueness"
            hint="How hard it is to find locally in Vancouver."
            value={draft.minUniqueness}
            min={0}
            max={10}
            onChange={(n) => patch({ minUniqueness: n })}
          />

          <div>
            <p className="mb-2 text-xs text-subtle">Categories</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCat(c)}
                  className={`h-8 rounded-full px-3 text-xs ${draft.categories.includes(c) ? "bg-fg text-bg" : "bg-bg-elevated text-muted"}`}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-subtle">Origin</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ORIGINS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => toggleOrigin(o)}
                  className={`h-8 rounded-full px-3 text-xs ${draft.origins.includes(o) ? "bg-fg text-bg" : "bg-bg-elevated text-muted"}`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onSave} disabled={!dirty}>
            Save and refresh all desks
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setDraft(cloneCriteria(DEFAULT_CRITERIA));
            }}
          >
            Load defaults
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              setDraft(cloneCriteria(DEFAULT_CRITERIA));
              toast.success("Reset to defaults");
            }}
          >
            Reset saved
          </Button>
          {dirty ? <Badge tone="warn">Unsaved draft</Badge> : <Badge tone="ok">In sync with desks</Badge>}
        </div>
      </div>
    </AppShell>
  );
}

function SliderRow({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="tabular-nums text-sm">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--color-primary)]"
      />
      <p className="mt-1 text-xs text-subtle">{hint}</p>
    </label>
  );
}
