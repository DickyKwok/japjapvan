#!/usr/bin/env node
/**
 * Daily Trends refresh. Started from startup.sh.
 * Runs immediately if last run is older than 20h, then checks every hour.
 */
import { spawn } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const STATE = join(ROOT, "data/cron-state.json");
const LOG = "/tmp/japjapvan-cron.log";
const INTERVAL_MS = 60 * 60 * 1000;
const STALE_MS = 20 * 60 * 60 * 1000;

async function lastRun() {
  try {
    const raw = JSON.parse(await readFile(STATE, "utf8"));
    return raw.lastRunAt ? Date.parse(raw.lastRunAt) : 0;
  } catch {
    return 0;
  }
}

function run(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => {
      out += d;
    });
    child.stderr.on("data", (d) => {
      out += d;
    });
    child.on("close", (code) => resolve({ code, out }));
  });
}

async function refresh() {
  const stamp = new Date().toISOString();
  const py = await run("python3", ["tools/fetch_trends.py"]);
  const score = await run("python3", ["tools/score.py"]);
  const shop = await run("python3", ["tools/shopify_export.py"]);
  const line = `[${stamp}] trends=${py.code} score=${score.code} shopify=${shop.code}\n${py.out}\n`;
  await mkdir(join(ROOT, "data"), { recursive: true });
  await writeFile(LOG, line, { flag: "a" }).catch(() => {});
  console.log(line);
}

async function tick() {
  const age = Date.now() - (await lastRun());
  if (age >= STALE_MS) {
    await refresh();
  }
}

await tick();
setInterval(() => {
  tick().catch((err) => console.error(err));
}, INTERVAL_MS);

console.log("[japjapvan-cron] daemon up — daily Trends refresh");
