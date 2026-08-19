#!/usr/bin/env node
/**
 * Pull live Google Trends interest-over-time for catalog brands (CA / JP / HK).
 * Writes src/data/live-signals.json. Resumes from data/trends_live_cache.json.
 *
 *   node tools/pull-google-trends.mjs
 *   node tools/pull-google-trends.mjs --limit=8
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const QUERIES = join(ROOT, "src/data/trend-queries.json");
const OUT = join(ROOT, "src/data/live-signals.json");
const CACHE = join(ROOT, "data/trends_live_cache.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const MIN_CA = 6;
const STALE_MS = 20 * 60 * 60 * 1000;

const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.slice(8)) : Infinity;

let cookie = "";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function mergeCookies(headers) {
  const extra = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
  const map = new Map();
  for (const part of cookie
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)) {
    const i = part.indexOf("=");
    if (i > 0) map.set(part.slice(0, i), part.slice(i + 1));
  }
  for (const c of extra) {
    const kv = c.split(";")[0] ?? "";
    const i = kv.indexOf("=");
    if (i > 0) map.set(kv.slice(0, i).trim(), kv.slice(i + 1));
  }
  cookie = [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

function stripJson(text) {
  const cleaned = text.replace(/^\)\]\}'/, "").trim();
  const start = cleaned.search(/[\[{]/);
  if (start < 0) throw new Error(`not json: ${cleaned.slice(0, 80)}`);
  return JSON.parse(cleaned.slice(start));
}

function ownScale(values) {
  const peak = Math.max(0, ...values);
  if (peak <= 0) return values.map(() => 0);
  return values.map((v) => Math.max(0, Math.min(100, Math.round((v / peak) * 100))));
}

function weekLabel(unixSec) {
  const d = new Date(unixSec * 1000);
  const day = d.getUTCDay();
  const monday = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - ((day + 6) % 7)),
  );
  return monday.toISOString().slice(0, 10);
}

async function trendsGet(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-CA,en;q=0.9",
      Referer: "https://trends.google.com/trends/explore",
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });
  mergeCookies(res.headers);
  const text = await res.text();
  if (res.status === 429) {
    const err = new Error("429");
    err.status = 429;
    throw err;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 80)}`);
  return text;
}

async function warmup() {
  const res = await fetch("https://trends.google.com/trends/?geo=CA", {
    headers: { "User-Agent": UA, "Accept-Language": "en-CA,en;q=0.9" },
  });
  mergeCookies(res.headers);
  await res.arrayBuffer();
}

async function fetchQuery(query) {
  const req = {
    comparisonItem: [
      { keyword: query.ca, geo: "CA", time: "today 12-m" },
      { keyword: query.jp, geo: "JP", time: "today 12-m" },
      { keyword: query.hk, geo: "HK", time: "today 12-m" },
    ],
    category: 0,
    property: "",
  };
  const exploreUrl = `https://trends.google.com/trends/api/explore?hl=en-CA&tz=480&req=${encodeURIComponent(JSON.stringify(req))}`;
  const explore = stripJson(await trendsGet(exploreUrl));
  const ts = (explore.widgets ?? []).find((w) => w.id === "TIMESERIES");
  if (!ts?.token || !ts.request) return null;
  const midUrl = `https://trends.google.com/trends/api/widgetdata/multiline?hl=en-CA&tz=480&req=${encodeURIComponent(JSON.stringify(ts.request))}&token=${encodeURIComponent(ts.token)}`;
  const mid = stripJson(await trendsGet(midUrl));
  const timeline = mid.default?.timelineData ?? [];
  if (timeline.length < 16) return null;
  const rawCa = [];
  const rawJp = [];
  const rawHk = [];
  const weeks = [];
  for (const p of timeline) {
    const unix = Number(p.time);
    if (!Number.isFinite(unix)) continue;
    const v = p.value ?? [];
    weeks.push(weekLabel(unix));
    rawCa.push(Number(v[0]) || 0);
    rawJp.push(Number(v[1]) || 0);
    rawHk.push(Number(v[2]) || 0);
  }
  if (weeks.length < 16) return null;
  const ca = ownScale(rawCa);
  const jp = ownScale(rawJp);
  const hk = ownScale(rawHk);
  const series = weeks.map((week, i) => ({ week, CA: ca[i] ?? 0, JP: jp[i] ?? 0, HK: hk[i] ?? 0 }));
  return {
    series,
    caVolume: rawCa.filter((n) => n > 0).length >= MIN_CA,
    jpVolume: rawJp.filter((n) => n > 0).length >= 4,
    hkVolume: rawHk.filter((n) => n > 0).length >= 4,
    rawPeak: { CA: Math.max(0, ...rawCa), JP: Math.max(0, ...rawJp), HK: Math.max(0, ...rawHk) },
  };
}

async function fetchWithRetry(query) {
  let wait = 20_000;
  for (let i = 0; i < 3; i++) {
    try {
      return await fetchQuery(query);
    } catch (err) {
      const status = err?.status;
      const msg = String(err?.message || err).slice(0, 120);
      console.log("  retry", query.ca, status || msg);
      if (status === 429) await sleep(wait);
      else await sleep(4000);
      wait = Math.min(wait * 2, 90_000);
    }
  }
  return null;
}

function uniqueGroups(map) {
  const groups = new Map();
  for (const [id, q] of Object.entries(map)) {
    const key = `${q.ca}|${q.jp}|${q.hk}`;
    const row = groups.get(key) ?? { ...q, productIds: [] };
    row.productIds.push(id);
    groups.set(key, row);
  }
  return [...groups.values()];
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function main() {
  const queryMap = await readJson(QUERIES, {});
  const existing = await readJson(OUT, { products: {} });
  const cache = await readJson(CACHE, { queries: {} });
  const groups = uniqueGroups(queryMap);
  const now = Date.now();
  const fetchedAt = new Date().toISOString();

  await warmup();
  console.log("unique queries", groups.length, "cookie", cookie ? "yes" : "no");

  let pulled = 0;
  let hits = 0;
  for (const g of groups) {
    if (pulled >= LIMIT) break;
    const key = `${g.ca}|${g.jp}|${g.hk}`;
    const prev = cache.queries[key];
    if (prev?.fetchedAt && now - Date.parse(prev.fetchedAt) < STALE_MS && prev.series?.length >= 16) {
      console.log("fresh", g.ca);
      continue;
    }
    console.log("pull", g.ca, "→", g.productIds.join(","));
    const hit = await fetchWithRetry(g);
    pulled += 1;
    if (hit?.series?.length) {
      cache.queries[key] = { ...hit, fetchedAt, query: { ca: g.ca, jp: g.jp, hk: g.hk } };
      hits += 1;
      console.log(
        "  ok",
        g.ca,
        "weeks",
        hit.series.length,
        "caVol",
        hit.caVolume,
        "jpVol",
        hit.jpVolume,
        "peak",
        hit.rawPeak,
      );
    } else {
      console.log("  empty/fail", g.ca);
    }
    await sleep(6000);
  }

  const products = { ...(existing.products || {}) };
  for (const g of uniqueGroups(queryMap)) {
    const key = `${g.ca}|${g.jp}|${g.hk}`;
    const hit = cache.queries[key];
    if (!hit?.series?.length) continue;
    if (!hit.caVolume) continue;
    const url = `https://trends.google.com/trends/explore?geo=CA&q=${encodeURIComponent(g.ca)}`;
    for (const id of g.productIds) {
      products[id] = {
        source: "google-trends",
        fetchedAt: hit.fetchedAt,
        query: { ca: g.ca, jp: g.jp, hk: g.hk },
        googleTrendsUrl: url,
        caVolume: Boolean(hit.caVolume),
        jpVolume: Boolean(hit.jpVolume),
        series: hit.series,
      };
    }
  }

  const gtCount = Object.values(products).filter((p) => p.source === "google-trends" && p.caVolume).length;
  const bundle = {
    generatedAt: fetchedAt,
    method:
      "Google Trends interest-over-time, brand query, geo=CA+JP+HK (localized keywords). Each geo is scaled 0–100 on its own peak. Wikipedia pageviews are used only when Canada Trends has insufficient volume. No invented seed +%.",
    products,
  };

  await mkdir(join(ROOT, "data"), { recursive: true });
  await writeFile(CACHE, JSON.stringify(cache, null, 2));
  await writeFile(OUT, JSON.stringify(bundle, null, 2));
  console.log(JSON.stringify({ pulled, hits, googleTrendsWithCa: gtCount, total: Object.keys(products).length, out: OUT }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
