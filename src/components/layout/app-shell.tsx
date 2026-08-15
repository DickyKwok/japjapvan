import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isoWeekLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  Menu,
  Package,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";

const NAV = [
  { to: "/", label: "HQ", icon: LayoutDashboard },
  { to: "/catalog", label: "Catalog", icon: Package },
  { to: "/trends", label: "Trends", icon: LineChart },
  { to: "/shortlist", label: "Shortlist", icon: Sparkles },
  { to: "/procurement", label: "採購", icon: ClipboardList },
  { to: "/preorders", label: "Pre-orders", icon: ShoppingBag },
  { to: "/lanes", label: "Lanes", icon: ArrowLeftRight },
] as const;

const MOBILE_PRIMARY = [NAV[0], NAV[1], NAV[4], NAV[3]] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isPending } = useCurrentUserState();
  const week = isoWeekLabel();
  const [moreOpen, setMoreOpen] = useState(false);

  function isActive(to: string) {
    return to === "/" ? pathname === "/" : pathname.startsWith(to);
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="flex min-h-dvh">
        <aside className="hidden w-56 shrink-0 border-r border-border bg-bg-elevated/70 md:flex md:flex-col">
          <div className="px-5 pt-6 pb-4">
            <p className="font-display text-xl tracking-tight">JapJapVan</p>
            <p className="mt-1 text-xs text-muted">Tokyo · HK · Vancouver</p>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 px-3">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex h-10 items-center gap-2.5 rounded-[var(--radius-sm)] px-3 text-sm transition-colors duration-150",
                    isActive(item.to) ? "bg-primary text-primary-fg" : "text-muted hover:bg-surface hover:text-fg",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  {item.label === "採購" ? "Weekly 採購" : item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border px-5 py-4 text-xs text-subtle">Cycle {week}</div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur md:px-8">
            <div className="md:hidden">
              <p className="font-display text-lg">JapJapVan</p>
            </div>
            <p className="hidden text-sm text-muted md:block">Weekly merchandising & 採購 desk</p>
            <div className="flex items-center gap-3">
              {isPending ? (
                <div className="size-8 animate-pulse rounded-full bg-border" />
              ) : (
                <>
                  <SignedOut>
                    <Link to="/login" className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
                      Sign in
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </>
              )}
            </div>
          </header>

          <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">{children}</main>

          {moreOpen ? (
            <div className="fixed inset-0 z-30 md:hidden">
              <button
                type="button"
                aria-label="Close menu"
                className="absolute inset-0 bg-ink/30"
                onClick={() => setMoreOpen(false)}
              />
              <div className="absolute inset-x-0 bottom-0 rounded-t-[var(--radius-xl)] border-t border-border bg-surface px-4 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">All desks</p>
                  <button type="button" className="grid size-10 place-items-center" onClick={() => setMoreOpen(false)}>
                    <X className="size-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {NAV.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          "flex min-h-12 items-center gap-2 rounded-[var(--radius-md)] border border-border px-3 text-sm",
                          isActive(item.to) ? "bg-primary text-primary-fg" : "bg-bg text-fg",
                        )}
                      >
                        <Icon className="size-4" />
                        {item.label === "採購" ? "Weekly 採購" : item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          <nav className="sticky bottom-0 z-20 grid grid-cols-5 border-t border-border bg-bg-elevated/95 px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] md:hidden">
            {MOBILE_PRIMARY.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-xs)] text-[10px]",
                    isActive(item.to) ? "text-primary" : "text-subtle",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-xs)] text-[10px]",
                moreOpen ? "text-primary" : "text-subtle",
              )}
            >
              <Menu className="size-4" />
              More
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
