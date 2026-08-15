import { useEffect, useState } from "react";
import { isoWeekLabel } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { id: "trends", label: "Confirm daily Trends cron ran (CA / JP / HK)" },
  { id: "shortlist", label: "Confirm 15–25 SKU shortlist" },
  { id: "preorders", label: "Cover pre-order gaps" },
  { id: "qty", label: "Lock 採購 quantities + MOQ" },
  { id: "export", label: "Export CSV and place supplier POs" },
  { id: "shopify", label: "Sync Shopify inventory / pre-order" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export function WeeklyRitual() {
  const week = isoWeekLabel();
  const key = `sn-ritual-${week}`;
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* ignore */
    }
  }, [key]);

  function toggle(id: StepId) {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    localStorage.setItem(key, JSON.stringify(next));
  }

  const complete = STEPS.filter((s) => done[s.id]).length;

  return (
    <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-subtle uppercase">Monday desk</p>
          <h2 className="font-display text-xl">Weekly ritual · {week}</h2>
        </div>
        <p className="text-xs tabular-nums text-muted">
          {complete}/{STEPS.length}
        </p>
      </div>
      <ul className="mt-4 space-y-1.5">
        {STEPS.map((step) => {
          const on = Boolean(done[step.id]);
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => toggle(step.id)}
                className="flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-sm)] px-2 text-left text-sm hover:bg-bg-elevated"
              >
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                    on ? "border-primary bg-primary text-primary-fg" : "border-border-strong bg-bg"
                  }`}
                >
                  {on ? <Check className="size-3" strokeWidth={2.5} /> : null}
                </span>
                <span className={on ? "text-muted line-through" : ""}>{step.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
