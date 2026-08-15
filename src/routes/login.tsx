import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6">
      <div className="w-full max-w-sm space-y-5 rounded-[var(--radius-xl)] border border-border bg-surface p-8">
        <div>
          <p className="font-display text-2xl">JapJapVan</p>
          <p className="mt-1 text-sm text-muted">Sign in to save weekly 採購 plans.</p>
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
                Continue with {p.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Sign-in is disabled.</p>
        )}
        <Link to="/" className="block text-center text-sm text-muted underline-offset-4 hover:underline">
          Back to HQ
        </Link>
      </div>
    </main>
  );
}
