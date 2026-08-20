import { createFileRoute } from "@tanstack/react-router";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const header = request.headers.get("authorization");
  const vercelCron = request.headers.get("x-vercel-cron");
  if (vercelCron) return true;
  return header === `Bearer ${secret}`;
}

export const Route = createFileRoute("/api/cron/refresh-trends")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!authorized(request)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { refreshTrendSnapshots } = await import("@/lib/refresh-trends.server");
        const url = new URL(request.url);
        const batchRaw = Number(url.searchParams.get("batch") || "");
        const { state, bundle } = await refreshTrendSnapshots({
          batch: Number.isFinite(batchRaw) && batchRaw > 0 ? batchRaw : undefined,
        });
        const top = Object.values(bundle.products)
          .filter((p) => p.eligible)
          .sort((a, b) => b.caGrowth12w - a.caGrowth12w)
          .slice(0, 8)
          .map((p) => ({ id: p.id, growth: p.caGrowth12w, reason: p.reason }));
        return Response.json({
          ok: true,
          ...state,
          top,
        });
      },
    },
  },
});
