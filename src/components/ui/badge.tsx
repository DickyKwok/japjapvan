import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  children,
}: {
  className?: string;
  tone?: "default" | "ok" | "warn" | "muted" | "ink";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium tracking-wide",
        tone === "default" && "bg-primary/15 text-primary",
        tone === "ok" && "bg-ok/15 text-ok",
        tone === "warn" && "bg-warn/15 text-warn",
        tone === "muted" && "bg-border text-muted",
        tone === "ink" && "bg-fg text-bg",
        className,
      )}
    >
      {children}
    </span>
  );
}
