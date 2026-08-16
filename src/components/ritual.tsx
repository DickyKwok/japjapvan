import { useEffect, useState } from "react";
import { isoWeekLabel } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Check } from "lucide-react";

const STEPS = [
  { id: "trends", key: "ritual.trends" },
  { id: "shortlist", key: "ritual.shortlist" },
  { id: "preorders", key: "ritual.preorders" },
  { id: "qty", key: "ritual.qty" },
  { id: "export", key: "ritual.export" },
  { id: "shopify", key: "ritual.shopify" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export function WeeklyRitual() {
  const week = isoWeekLabel();
  const key = `sn-ritual-${week}`;
  const [done, setDone] = useState<Record<string, boolean>>({});
  const { t } = useI18n();

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
    <section className="border border-border bg-surface p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-subtle uppercase">{t("ritual.kicker")}</p>
          <h2 className="font-display text-xl">{t("ritual.title", { week })}</h2>
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
                className="flex min-h-11 w-full items-center gap-3 px-2 text-left text-sm hover:bg-bg-elevated"
              >
                <span
                  className={`grid size-5 shrink-0 place-items-center border ${
                    on ? "border-primary bg-primary text-primary-fg" : "border-border-strong bg-bg"
                  }`}
                >
                  {on ? <Check className="size-3" strokeWidth={2.5} /> : null}
                </span>
                <span className={on ? "text-muted line-through" : ""}>{t(step.key)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
