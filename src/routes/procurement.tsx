import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { CriteriaBanner } from "@/components/criteria-banner";
import { ProductThumb } from "@/components/product-thumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PoLine, WeekPlan } from "@/data/types";
import { planTotals } from "@/lib/catalog";
import { downloadPoCsv } from "@/lib/export";
import { loadWeekPlan, saveWeekPlan } from "@/lib/procurement-fns";
import { suggestedQty } from "@/lib/scoring";
import { useListing } from "@/lib/use-listing";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cad, cadExact, isoWeekLabel } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/procurement")({ component: ProcurementPage });

const STATUSES: PoLine["status"][] = ["draft", "ordered", "in-transit", "received"];

function ProcurementPage() {
  const week = isoWeekLabel();
  const { catalog, plan: suggested } = useListing();
  const { user, isPending } = useCurrentUserState();
  const [plan, setPlan] = useState<WeekPlan>(suggested);
  const [saving, setSaving] = useState(false);
  const [addId, setAddId] = useState("");
  const { t } = useI18n();

  useEffect(() => {
    const local = localStorage.getItem(`sn-plan-${week}`);
    if (local) {
      try {
        setPlan(JSON.parse(local) as WeekPlan);
        return;
      } catch {
        /* ignore */
      }
    }
    setPlan(suggested);
  }, [week, suggested]);

  useEffect(() => {
    if (isPending || !user) return;
    loadWeekPlan({ data: week })
      .then((remote) => {
        if (remote) setPlan(remote);
      })
      .catch(() => {
        /* guest / first run */
      });
  }, [isPending, user, week]);

  const totals = planTotals(plan, catalog);
  const missing = catalog.filter(
    (p) => p.score.selected && suggestedQty(p) > 0 && !plan.lines.some((l) => l.productId === p.id),
  );
  const byStatus = STATUSES.map((s) => ({
    status: s,
    n: plan.lines.filter((l) => l.status === s).length,
  }));

  function persist(next: WeekPlan) {
    setPlan(next);
    localStorage.setItem(`sn-plan-${next.week}`, JSON.stringify(next));
  }

  function patchLine(id: string, patch: Partial<PoLine>) {
    persist({
      ...plan,
      lines: plan.lines.map((l) => (l.productId === id ? { ...l, ...patch } : l)),
      updatedAt: new Date().toISOString(),
    });
  }

  function removeLine(id: string) {
    persist({ ...plan, lines: plan.lines.filter((l) => l.productId !== id), updatedAt: new Date().toISOString() });
  }

  function addLine() {
    if (!addId || plan.lines.some((l) => l.productId === addId)) return;
    const p = catalog.find((x) => x.id === addId);
    if (!p) return;
    persist({
      ...plan,
      lines: [...plan.lines, { productId: p.id, qty: Math.max(p.moq, suggestedQty(p) || p.moq), status: "draft", note: "" }],
      updatedAt: new Date().toISOString(),
    });
    setAddId("");
  }

  async function saveRemote() {
    if (!user) {
      toast.message("Signed-out plans stay on this device. Sign in to sync.");
      return;
    }
    setSaving(true);
    try {
      await saveWeekPlan({ data: plan });
      toast.success("採購 sheet saved");
    } catch {
      toast.error("Could not save — try signing in again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <Toaster richColors position="top-center" />
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs tracking-[0.16em] text-subtle uppercase">{t("proc.kicker", { week })}</p>
            <h1 className="font-display text-3xl tracking-tight">{t("proc.title")}</h1>
            <p className="mt-1 text-sm text-muted">{t("proc.lede")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => downloadPoCsv(plan, catalog)}>
              Export CSV
            </Button>
            <Button onClick={saveRemote} disabled={saving}>
              {saving ? "Saving…" : user ? "Save to account" : "Save locally"}
            </Button>
          </div>
        </div>

        <CriteriaBanner />

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Kpi label="Lines" value={String(plan.lines.length)} />
          <Kpi label="Landed buy" value={cad(totals.cost)} />
          <Kpi label="Retail if sold" value={cad(totals.retail)} />
          <Kpi label="Units" value={String(totals.units)} />
          <Kpi label="Pipeline" value={byStatus.map((s) => `${s.n} ${s.status}`).join(" · ")} compact />
        </section>

        {missing.length > 0 ? (
          <p className="text-xs text-warn">Shortlist still needs cover: {missing.map((m) => m.brand).join(", ")}</p>
        ) : null}

        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-border text-xs text-subtle">
              <tr>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Need</th>
                <th className="px-3 py-2 font-medium">Qty</th>
                <th className="px-3 py-2 font-medium">Ext. cost CAD</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Note</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {plan.lines.map((line) => {
                const p = catalog.find((x) => x.id === line.productId);
                if (!p) return null;
                const need = suggestedQty(p);
                return (
                  <tr key={line.productId} className="border-b border-border/70 align-top last:border-0">
                    <td className="px-3 py-3">
                      <div className="flex items-start gap-3">
                        <ProductThumb id={p.id} alt={`${p.brand} ${p.name}`} size="sm" />
                        <div>
                          <p className="font-medium">{p.brand}</p>
                          <p className="text-xs text-muted">{p.name}</p>
                          <p className="mt-1 font-mono text-xs text-subtle">
                            {p.sku} · {p.supplier}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">
                      <p>vel {p.weeklyVelocity}/wk</p>
                      <p>
                        stock {p.stock} · in {p.incoming}
                      </p>
                      <p>pre-orders {p.preorders}</p>
                      <p className="mt-1">
                        suggest {need || "—"} (MOQ {p.moq})
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <Input
                        type="number"
                        min={0}
                        value={line.qty}
                        onChange={(e) => patchLine(line.productId, { qty: Number(e.target.value) })}
                        className="w-20"
                      />
                    </td>
                    <td className="px-3 py-3 tabular-nums text-xs">{cadExact(line.qty * p.landedCad)}</td>
                    <td className="px-3 py-3">
                      <select
                        className="h-10 rounded-[var(--radius-sm)] border border-border bg-bg px-2 text-xs"
                        value={line.status}
                        onChange={(e) => patchLine(line.productId, { status: e.target.value as PoLine["status"] })}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <Input value={line.note} onChange={(e) => patchLine(line.productId, { note: e.target.value })} />
                    </td>
                    <td className="px-3 py-3">
                      <button type="button" className="text-xs text-danger" onClick={() => removeLine(line.productId)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            className="h-10 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm"
            value={addId}
            onChange={(e) => setAddId(e.target.value)}
          >
            <option value="">Add SKU…</option>
            {catalog.map((p) => (
              <option key={p.id} value={p.id}>
                {p.brand} — {p.name}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={addLine}>
            Add to sheet
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Kpi({ label, value, compact }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <p className="text-xs text-subtle">{label}</p>
      <p className={`mt-1 font-display tabular-nums ${compact ? "text-sm leading-snug" : "text-2xl"}`}>{value}</p>
    </div>
  );
}
