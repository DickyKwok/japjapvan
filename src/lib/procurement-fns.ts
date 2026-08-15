import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { WeekPlan } from "@/data/types";
import { z } from "zod";

const planSchema = z.object({
  week: z.string(),
  lines: z.array(
    z.object({
      productId: z.string(),
      qty: z.number().int().min(0),
      status: z.enum(["draft", "ordered", "in-transit", "received"]),
      note: z.string(),
    }),
  ),
  updatedAt: z.string(),
});

export const loadWeekPlan = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((week: string) => week)
  .handler(async ({ context, data: week }) => {
    const sql = await getSql();
    const rows = await sql<{ payload: string }>`
      select payload from week_plans
      where user_id = ${context.userId} and week = ${week}
      limit 1
    `;
    if (!rows[0]?.payload) return null;
    return planSchema.parse(JSON.parse(rows[0].payload));
  });

export const saveWeekPlan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((plan: WeekPlan) => planSchema.parse(plan))
  .handler(async ({ context, data: plan }) => {
    const sql = await getSql();
    const payload = JSON.stringify({ ...plan, updatedAt: new Date().toISOString() });
    await sql`
      insert into week_plans (user_id, week, payload, updated_at)
      values (${context.userId}, ${plan.week}, ${payload}, now())
      on conflict (user_id, week)
      do update set payload = excluded.payload, updated_at = now()
    `;
    return { ok: true };
  });
