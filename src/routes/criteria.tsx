import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ALL_CATEGORIES, ALL_ORIGINS, cloneCriteria, criteriaEqual, DEFAULT_CRITERIA, type ListingCriteria } from "@/data/criteria";
import { useCriteriaStore } from "@/lib/criteria-store";
import { signalSummary } from "@/lib/signals";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/criteria")({ component: CriteriaPage });

function CriteriaPage() {
  const saved = useCriteriaStore((s) => s.criteria);
  const revision = useCriteriaStore((s) => s.revision);
  const save = useCriteriaStore((s) => s.setDraftAndSave);
  const reset = useCriteriaStore((s) => s.resetDefaults);
  const [draft, setDraft] = useState<ListingCriteria>(() => cloneCriteria(saved));
  const navigate = useNavigate();
  const { t } = useI18n();
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
    toast.success(t("criteria.savedToast", { n: revision + 1, listed: preview.listed }));
    window.setTimeout(() => navigate({ to: "/catalog" }), 400);
  }

  return (
    <AppShell>
      <Toaster position="top-center" />
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-xs tracking-[0.18em] text-subtle uppercase">{t("criteria.kicker")}</p>
          <h1 className="mt-1 font-display text-3xl tracking-tight">{t("criteria.title")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t("criteria.lede")}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <p className="text-xs text-subtle">{t("criteria.live", { n: revision })}</p>
            <p className="mt-1 font-display text-3xl tabular-nums">{current.listed}</p>
            <p className="text-xs text-muted">{current.watch} on watch</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-primary/30 bg-bg-elevated p-4">
            <p className="text-xs text-subtle">{t("criteria.preview")}</p>
            <p className="mt-1 font-display text-3xl tabular-nums">{preview.listed}</p>
            <p className="text-xs text-muted">
              {preview.listed === current.listed ? t("criteria.same") : t("criteria.vs", { n: `${preview.listed - current.listed > 0 ? "+" : ""}${preview.listed - current.listed}` })}
            </p>
          </div>
        </div>

        <section className="space-y-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="font-display text-xl">{t("criteria.demand")}</h2>
          <SliderRow
            label={t("criteria.minGrowth")}
            hint={t("criteria.minGrowthHint")}
            value={draft.minCaGrowth12w}
            min={0}
            max={80}
            suffix="%"
            onChange={(n) => patch({ minCaGrowth12w: n })}
          />
          <SliderRow
            label={t("criteria.minIndex")}
            hint={t("criteria.minIndexHint")}
            value={draft.minCaIndex}
            min={20}
            max={90}
            onChange={(n) => patch({ minCaIndex: n })}
          />
          <SliderRow
            label={t("criteria.minJp")}
            hint={t("criteria.minJpHint")}
            value={draft.minJpIndex}
            min={0}
            max={80}
            onChange={(n) => patch({ minJpIndex: n })}
          />
          <SliderRow
            label={t("criteria.floor")}
            hint={t("criteria.floorHint")}
            value={draft.stableFloor}
            min={-20}
            max={10}
            suffix="%"
            onChange={(n) => patch({ stableFloor: n })}
          />
        </section>

        <section className="space-y-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="font-display text-xl">{t("criteria.merch")}</h2>
          <SliderRow
            label={t("criteria.minMargin")}
            hint={t("criteria.minMarginHint")}
            value={Math.round(draft.minMarginPct * 100)}
            min={0}
            max={60}
            suffix="%"
            onChange={(n) => patch({ minMarginPct: n / 100 })}
          />
          <SliderRow
            label={t("criteria.maxWeight")}
            hint={t("criteria.maxWeightHint")}
            value={draft.maxWeightG}
            min={50}
            max={1000}
            step={10}
            suffix="g"
            onChange={(n) => patch({ maxWeightG: n })}
          />
          <SliderRow
            label={t("criteria.maxLead")}
            hint={t("criteria.maxLeadHint")}
            value={draft.maxLeadDays}
            min={7}
            max={45}
            suffix="d"
            onChange={(n) => patch({ maxLeadDays: n })}
          />
          <SliderRow
            label={t("criteria.minUnique")}
            hint={t("criteria.minUniqueHint")}
            value={draft.minUniqueness}
            min={0}
            max={10}
            onChange={(n) => patch({ minUniqueness: n })}
          />

          <div>
            <p className="mb-2 text-xs text-subtle">{t("criteria.cats")}</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCat(c)}
                  className={`h-8 rounded-full px-3 text-xs ${draft.categories.includes(c) ? "bg-fg text-bg" : "bg-bg-elevated text-muted"}`}
                >
                  {t(`cat.${c}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-subtle">{t("criteria.origin")}</p>
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
            {t("criteria.save")}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setDraft(cloneCriteria(DEFAULT_CRITERIA));
            }}
          >
            {t("criteria.load")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              setDraft(cloneCriteria(DEFAULT_CRITERIA));
              toast.success(t("criteria.resetToast"));
            }}
          >
            {t("criteria.reset")}
          </Button>
          {dirty ? <Badge tone="warn">{t("criteria.unsaved")}</Badge> : <Badge tone="ok">{t("criteria.synced")}</Badge>}
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
