import { Link, useRouterState } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { LocaleSwitch } from "@/components/locale-switch";
import { useI18n } from "@/lib/i18n";
import { isoWeekLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Flame,
  Package,
  Settings2,
} from "lucide-react";

const NAV = [
  { to: "/", key: "nav.discover", icon: Flame },
  { to: "/catalog", key: "nav.board", icon: Package },
  { to: "/criteria", key: "nav.settings", icon: Settings2 },
] as const;

const MOBILE_PRIMARY = NAV;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isPending } = useCurrentUserState();
  const week = isoWeekLabel();
  const { t } = useI18n();

  function isActive(to: string) {
    if (to === "/") return pathname === "/";
    if (to === "/catalog") return pathname.startsWith("/catalog") || pathname.startsWith("/product");
    return pathname.startsWith(to);
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="flex min-h-dvh">
        <aside className="hidden w-56 shrink-0 border-r border-border bg-bg-elevated md:flex md:flex-col">
          <div className="px-5 pt-6 pb-4">
            <p className="font-display text-xl tracking-tight">JapJapVan</p>
            <p className="mt-1 text-xs text-muted">{t("nav.tagline")}</p>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 px-3">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex h-10 items-center gap-2.5 px-3 text-sm transition-colors duration-150",
                    isActive(item.to) ? "bg-primary text-primary-fg" : "text-muted hover:bg-surface hover:text-fg",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border px-5 py-4 text-xs text-subtle">
            {t("nav.cycle")} {week}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur md:px-8">
            <div className="md:hidden">
              <p className="font-display text-lg">JapJapVan</p>
            </div>
            <p className="hidden text-sm text-muted md:block">{t("nav.header")}</p>
            <div className="flex items-center gap-3">
              <LocaleSwitch />
              {isPending ? (
                <div className="size-8 animate-pulse bg-border" />
              ) : (
                <>
                  <SignedOut>
                    <Link to="/login" className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
                      {t("nav.signin")}
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

          <nav className="sticky bottom-0 z-20 grid grid-cols-3 border-t border-border bg-bg-elevated/95 px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] md:hidden">
            {MOBILE_PRIMARY.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex min-h-11 flex-col items-center justify-center gap-0.5 text-[10px]",
                    isActive(item.to) ? "text-primary" : "text-subtle",
                  )}
                >
                  <Icon className="size-4" />
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
