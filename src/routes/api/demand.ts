import { createFileRoute } from "@tanstack/react-router";
import { readDemandBundle, readRisingBundle } from "@/lib/demand-store.server";
import { activeBundle } from "@/lib/signals";
import { risingData } from "@/lib/rising";

export const Route = createFileRoute("/api/demand")({
  server: {
    handlers: {
      GET: async () => {
        const fromDb = await readDemandBundle();
        const bundle = fromDb ?? activeBundle();
        const rising = (await readRisingBundle()) ?? risingData();
        return Response.json({
          bundle,
          rising,
          generatedAt: bundle.generatedAt,
          method: bundle.method,
        });
      },
    },
  },
});
