import type { TrendPoint } from "@/lib/trend-engine";
import type { GeoQuery } from "@/data/trend-queries";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const EXPLORE = "https://trends.google.com/trends/api/explore";
const WIDGET = "https://trends.google.com/trends/api/widgetdata/multiline";
const MIN_CA_POINTS = 6;

type TrendsHit = {
  query: GeoQuery;
  series: TrendPoint[];
  caVolume: boolean;
  jpVolume: boolean;
  hkVolume: boolean;
};

let cookie = "";

function mergeCookies(headers: Headers) {
  const extra = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
  const map = new Map<string, string>();
  for (const part of cookie.split(";").map((s) => s.trim()).filter(Boolean)) {
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

function stripJson(text: string) {
  const cleaned = text.replace(/^\)\]\}'/, "").trim();
  const start = cleaned.search(/[\[{]/);
  if (start < 0) throw new Error(`not json: ${cleaned.slice(0, 80)}`);
  return JSON.parse(cleaned.slice(start));
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function trendsGet(url: string) {
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
    const err = new Error("429") as Error & { status: number };
    err.status = 429;
    throw err;
  }
  if (!res.ok) throw new Error(`Google Trends HTTP ${res.status}`);
  return text;
}

async function warmup() {
  const res = await fetch("https://trends.google.com/trends/?geo=CA", {
    headers: { "User-Agent": UA, "Accept-Language": "en-CA,en;q=0.9" },
  });
  mergeCookies(res.headers);
  await res.arrayBuffer();
}

function ownScale(values: number[]) {
  const peak = Math.max(0, ...values);
  if (peak <= 0) return values.map(() => 0);
  return values.map((v) => Math.max(0, Math.min(100, Math.round((v / peak) * 100))));
}

function weekLabel(unixSec: number) {
  const d = new Date(unixSec * 1000);
  const day = d.getUTCDay();
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - ((day + 6) % 7)));
  return monday.toISOString().slice(0, 10);
}

async function fetchOnce(query: GeoQuery): Promise<TrendsHit | null> {
  const req = {
    comparisonItem: [
      { keyword: query.ca, geo: "CA", time: "today 12-m" },
      { keyword: query.jp, geo: "JP", time: "today 12-m" },
      { keyword: query.hk, geo: "HK", time: "today 12-m" },
    ],
    category: 0,
    property: "",
  };
  const exploreUrl = `${EXPLORE}?hl=en-CA&tz=480&req=${encodeURIComponent(JSON.stringify(req))}`;
  const explore = stripJson(await trendsGet(exploreUrl));
  const ts = (explore.widgets ?? []).find((w: { id?: string }) => w.id === "TIMESERIES");
  if (!ts?.token || !ts.request) return null;
  const midUrl = `${WIDGET}?hl=en-CA&tz=480&req=${encodeURIComponent(JSON.stringify(ts.request))}&token=${encodeURIComponent(ts.token)}`;
  const mid = stripJson(await trendsGet(midUrl));
  const timeline = (mid.default?.timelineData ?? []) as Array<{
    time?: string;
    value?: number[];
  }>;
  if (timeline.length < 16) return null;

  const rawCa: number[] = [];
  const rawJp: number[] = [];
  const rawHk: number[] = [];
  const weeks: string[] = [];
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
  const series: TrendPoint[] = weeks.map((week, i) => ({
    week,
    CA: ca[i] ?? 0,
    JP: jp[i] ?? 0,
    HK: hk[i] ?? 0,
  }));
  const caVolume = rawCa.filter((n) => n > 0).length >= MIN_CA_POINTS;
  const jpVolume = rawJp.filter((n) => n > 0).length >= 4;
  const hkVolume = rawHk.filter((n) => n > 0).length >= 4;
  return { query, series, caVolume, jpVolume, hkVolume };
}

export async function fetchGoogleTrendsSeries(
  query: GeoQuery,
  opts?: { retries?: number },
): Promise<TrendsHit | null> {
  const retries = opts?.retries ?? 3;
  if (!cookie) {
    try {
      await warmup();
    } catch {
      /* still try */
    }
  }
  let wait = 12_000;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetchOnce(query);
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 429 && i < retries) {
        await sleep(wait);
        wait = Math.min(wait * 2, 90_000);
        continue;
      }
      if (i < retries) {
        await sleep(2000);
        continue;
      }
      return null;
    }
  }
  return null;
}

export function hasCanadaVolume(hit: TrendsHit | null) {
  return Boolean(hit?.caVolume);
}
