import { LOCALES } from "@/lib/locale-store";
import { useLocaleStore } from "@/lib/locale-store";
import { cn } from "@/lib/utils";

export function LocaleSwitch() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <div className="inline-flex items-center border border-border bg-bg-elevated" role="group" aria-label="Language">
      {LOCALES.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setLocale(item.id)}
          className={cn(
            "h-8 min-w-10 px-2 text-[11px] font-medium tracking-wide",
            locale === item.id ? "bg-primary text-primary-fg" : "text-muted hover:text-fg",
          )}
          aria-pressed={locale === item.id}
        >
          {item.short}
        </button>
      ))}
    </div>
  );
}
