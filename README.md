# JapJapVan

Japanese essentials desk for Vancouver — product filter gated by **Google Trends**, bidirectional search (CA · JP · HK), 15–25 SKU shortlist, and a weekly **採購** dashboard.

Shop: **JapJapVan**  
Lanes: Japan / Hong Kong → Vancouver (primary, sell in **CAD**), Canada → Hong Kong (probe, sell in **HKD**). Japan wholesale is shown in **JPY**.

Shopify is the customer storefront. This repo is the merchandising HQ.

## Why a product appears

Nothing is listed “because we like it.” A SKU is Shopify-eligible only when a **data signal** passes:

1. Pull the same keyword in **Canada, Japan, Hong Kong** (Google Trends, last ~26 weeks).
2. Compute **12-week growth** (last 4 weeks vs the 4 weeks starting 12 weeks ago).
3. **List** if Japan source index ≥ 25 **and** either:
   - Canada growth ≥ **+12%**, or
   - Canada index ≥ **55** and not falling worse than −5%.
4. Otherwise it stays on the **watch** list with the reason shown.

Example: *“Google Trends Canada +61% over 12 weeks for Biore Aqua Rich Essence”* → it appears on the shortlist you export to Shopify.

A **daily cron** refreshes those series so yesterday’s spike cannot linger.

## Daily refresh

- In this workspace: `tools/cron-daemon.mjs` (started by `startup.sh`) runs `tools/daily_refresh.sh` when the last run is older than 20 hours.
- On Vercel: `vercel.json` hits `GET /api/cron/refresh-trends` at **13:00 UTC** (06:00 Vancouver).
- Manual: `npm run refresh`

```bash
python3 tools/fetch_trends.py          # writes data/trend_snapshots.json
python3 tools/score.py                 # writes data/final_shortlist.csv
python3 tools/shopify_export.py        # Shopify product import
```

Add `--live` to `fetch_trends.py` if `pytrends` is installed.

## Dashboard

| Page | Use |
| --- | --- |
| HQ | This week’s numbers, why-listed SKUs, Monday ritual |
| Catalog | Shop list vs watch, each card cites Trends + CAD/JPY |
| Trends | Same keyword in CA / JP / HK + the listing reason |
| Shortlist | Signal-backed 20 brands + Shopify CSV |
| Weekly 採購 | Qty, MOQ, status — money in CAD |
| Pre-orders | Coverage vs booked CAD |
| Lanes | Reverse Canada → HK/JP in HKD |

## Money

| Lane | Sell | Landed / cost | Source |
| --- | --- | --- | --- |
| JP → Vancouver | CAD | CAD | JPY wholesale (est.) |
| CA → Hong Kong | HKD | HKD | CAD equivalent |

Every price in the UI is suffixed with **CAD**, **HKD**, or **JPY**. No bare `$`.

## Scoring (same in TS + Python)

| Factor | Weight |
| --- | --- |
| Canada vs source Trends (incl. 12-week growth) | 25% |
| Gross margin after landed cost | 20% |
| Shipping friendliness | 15% |
| Regulatory ease | 10% |
| Local uniqueness | 10% |
| Repeat purchase | 10% |
| Brand diversity | 10% |

## Local

```bash
npm install
npm run dev          # dashboard
npm run refresh      # Trends + score + Shopify CSV
```

After editing `src/data/products.ts`:

```bash
node tools/sync_candidates.mjs
npm run refresh
```
