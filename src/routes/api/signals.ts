import { createFileRoute } from "@tanstack/react-router";
import { PRODUCTS } from "@/data/products";
import { shortlist } from "@/lib/catalog";
import { lastSignalsAt, signalSummary, fallbackBundle } from "@/lib/signals";

export const Route = createFileRoute("/api/signals")({
  server: {
    handlers: {
      GET: async () => {
        const bundle = fallbackBundle();
        const summary = signalSummary();
        const shop = shortlist().map((p) => ({
          id: p.id,
          brand: p.brand,
          name: p.name,
          sku: p.sku,
          sellCad: p.sellCad,
          sellCurrency: "CAD",
          landedCad: p.landedCad,
          landedCurrency: "CAD",
          reason: p.signal.reason,
          whyListed: p.signal.whyListed,
          caGrowth12w: p.signal.caGrowth12w,
          googleTrendsUrl: p.signal.googleTrendsUrl,
          source: p.signal.source,
        }));
        return Response.json({
          generatedAt: lastSignalsAt(),
          summary,
          method: bundle.method,
          shopifyEligible: shop,
          catalogSize: PRODUCTS.length,
        });
      },
    },
  },
});
