import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { LocaleSwitch } from "@/components/locale-switch";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { t } = useI18n();
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6">
      <div className="w-full max-w-sm space-y-5 border border-border bg-surface p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-2xl">JapJapVan</p>
            <p className="mt-1 text-sm text-muted">{t("login.lede")}</p>
          </div>
          <LocaleSwitch />
        </div>
        {authEnabled ? (
          <div className="space-y-2">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/procurement" })}
              >
                {t("login.continue", { p: p.label })}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">{t("login.disabled")}</p>
        )}
        <Link to="/" className="block text-center text-sm text-muted underline-offset-4 hover:underline">
          {t("login.back")}
        </Link>
      </div>
    </main>
  );
}
