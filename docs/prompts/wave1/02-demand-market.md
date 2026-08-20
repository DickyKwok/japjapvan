# Wave 1 / 02 — demand and market

You are **Grok 4.6**, running **headless** in the JapJapVan repo. Write **one** file and stop.

**Output path (only file you may write):** `docs/research/02-demand-market.md`  
**Language of that file:** Traditional Chinese (zh-Hant).  
**Do not write:** `src/**`, the tax memo, `_shared-facts.md`, or anyone else’s note.  
**Do not** redo the unit-econ P&L (wave 1 / 01 owns that). You may cite shared-facts GMV ranges.

## Required reads

1. `docs/research/_shared-facts.md`
2. `docs/hk-ca-tax-price-advantage-2026.md` (demand-relevant bits only: DDU conversion killer, sunscreen as demand that you cannot legally harvest)
3. `src/data/products.ts` — categories, notes, `caTrend` / `jpTrend` / `hkTrend` as **hypotheses**
4. `src/data/criteria.ts` and `src/lib/listing.ts` or `src/lib/scoring.ts` if needed to explain the listing rule
5. `README.md` — how the desk thinks about Trends

Then search the web (use `web_search` and open the actual pages):

- Vancouver and Toronto Asian / Japanese beauty demand, diaspora counts (StatsCan or city facts, dated)
- J-beauty / Asian sunscreen Reddit and Canadian retail availability (CBC 2024 Asian sunscreens piece is required reading)
- Whether Shoppers/Sephora carry JP-formula Biore, Curel, Fino, Melano CC (yes/no with URL)
- Shipping-time vs conversion literature or Shopify/ecom public benchmarks — label as analogue, not JapJapVan data

If Trends live cache exists (`data/trends_live_cache.json`, `src/data/trend-snapshots.json`), peek. Do **not** claim SKU-level Canada Trends volume if the series is empty. Brand-keyword only.

Empty note is valid only after the required reads **and** at least three live web sources.

## What to answer

### 1. Who is the buyer

Primary: Metro Vancouver. Secondary: Toronto. Split:

- Diaspora (HK/CN/TW/JP/KR) who already know 萬寧 SKUs
- K-/J-beauty converts who learned names from Reddit / Xiaohongshu
- Gift buyers (stationery, Fino)

What they substitute: YesStyle, WeChat 代購, Amazon.ca grey, a trip home, Shoppers Western SPF. **Not** “a Canadian corporation that pays 11% CIT.”

### 2. Two willingness-to-pay curves

- **Differentiation:** “JP formula I cannot buy at Shoppers.” Inelastic-ish if authentic and DDP. This is the only curve Year 1 should sit on.
- **Arbitrage:** “Cheaper Curel than Amazon.” Thin; YesStyle already lives here.

Search goods vs credence goods: fake grey stock, melted chocolate, old lots. Trust is the tax on P.

### 3. Elasticity that actually moves Q

- DDP all-in vs DDU + brokerage surprise
- Days-to-door (7–21 consolidate vs 1–3 local warehouse). Local warehouse = PE — say so, do not recommend it here; just price the conversion gap in words + any public benchmark
- Stockout / preorder wait

### 4. TAM / SAM / SOM — order of magnitude, refuse fake precision

Build a back-of-envelope with sources:

- People in Metro Vancouver who might buy JP drugstore beauty in a year
- Spend / year analogue (even a wide band)
- SOM Year 1 = the shared-facts GMV ranges, as **share** of that SAM

If you cannot defend a TAM within a factor of 3, write “unknown” and still give the SAM logic.

### 5. Catalog as hypothesis, not demand

Table: category, whether Canada authorized exists, whether JP formula differs, whether Year 1 may **legally** sell (sunscreen = no). `weeklyVelocity` is not demand.

Sunscreen is the strongest **stated** demand in the catalog (~19% of desk GMV) and is **illegal to commercially harvest**. Demand without a legal supply is not a TAM for this firm.

### 6. What would falsify the demand story by month 6

Concrete: preorder conversion, repeat rate, refund rate, CAC if you turn on ads. Thresholds can be ranges.

## Output shape

`docs/research/02-demand-market.md`:

- Title, date, disclaimer
- Sections 1–6
- `## Numbers / claims the synthesizer may reuse`
- Sources with URLs

Stop when that file is written.
