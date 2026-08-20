# Wave 1 / 01 — unit economics (Harvard price theory)

You are **Grok 4.6**, running **headless** in the JapJapVan repo. Write **one** file and stop.

**Output path (only file you may write):** `docs/research/01-unit-econ.md`  
**Language of that file:** Traditional Chinese (zh-Hant). Keep formula symbols and statute names in English.  
**Do not write:** `src/**`, `docs/hk-ca-tax-price-advantage-2026.md`, `_shared-facts.md`, or any other research note.

This is a research **note** for a later synthesizer, not the final user-facing feasibility essay. Be colder and more formulaic than a blog post.

## Required reads (do these before drafting)

1. `docs/research/_shared-facts.md` — locked numbers. Do not drift.
2. `docs/hk-ca-tax-price-advantage-2026.md` — tax, PE, Year 1 forecast ranges.
3. `src/lib/money.ts` — FX and the 0.62 wholesale back-out.
4. `src/lib/scoring-core.ts` — margin identity.
5. `src/data/products.ts` — landedCad / sellCad / weeklyVelocity / category. Sample at least 12 SKUs across skincare, hair, stationery, tools, sunscreen (sunscreen is for **counterfactual** only; Year 1 commercial catalog excludes it).
6. `src/data/criteria.ts` — min margin 28%.

Use `read_file` / `grep`. Then `web_search` / `web_fetch` only if you need a public price check (YesStyle / Amazon.ca / Mannings) — label those prices with URL and date. If a search fails, say so. Do **not** fill holes with catalog `weeklyVelocity` dressed as sales.

Empty note is valid **only** after you have read the five repo files above and searched at least once for a public comparable on Melano CC, Fino, Hada Labo lotion, and Biore (the last as a “illegal to sell, still a demand marker” row).

## What to compute

Work in CAD. State every assumption.

### 1. Accounting identity

π = Q (P − MC) − F

Define, with JapJapVan numbers:

- P = DDP sticker (GST/PST either in P or broken out — pick one and stay consistent)
- MC = product (ex-HK/JP) + inbound share + duty + brokerage + payment + expected returns + DDP tax if you absorb it
- F = Shopify + tools + founder time (show F both **with founder wage = 0** and **with a reservation wage**)

Separate **gross margin** (catalog (sell−landed)/sell), **contribution margin** (after payment, ads, refunds, extra freight beyond landed), **EBITDA**, **owner cash**.

Catalog landed already includes ~38% freight/duty. If you rebuild MC from a Mannings shelf price, **replace** landed rather than stacking another 38%.

### 2. Tax incidence (not a pricing weapon)

HK 8.25% vs BC CCPC 11% = 2.75 points of **profit**, ≈ CAD 0.34 on a CAD 24 SKU with CAD 12.5 gross, ≈ CAD 550 on CAD 20k profit (shared facts).

Show why this does **not** shift the retail demand curve. Pass-through bound: a tax on profit is not an excise on Q. Compare to iceberg trade cost t (shipping + brokerage + days), which **does** shift the delivered price.

### 3. Iceberg trade costs (Samuelson t)

For a CAD 24 sticker SKU (use Hada Labo lotion or Melano CC from the catalog):

| Fulfilment | Extra CAD on top of catalog landed | Contribution left |
| --- | --- | --- |
| One-parcel DHL/FedEx | research a 0.2–0.5 kg HK→YVR quote; if you cannot get a live quote, band CAD 10–18 and label estimate | |
| Weekly consolidate 8–12 kg air | CAD 2–5 / unit band, cite a public air-cargo or forwarder page if you can | |
| Canadian warehouse | faster conversion, PE + GST normal regime — **do not** pretend this is still the no-PE model |

Show the unit that goes **negative** under one-parcel.

### 4. Law of one price / arbitrage bounds

For at least 4 SKUs, attempt public prices: Mannings or @cosme or a JP drugstore, YesStyle, Amazon.ca, Shoppers if authorized. Table: source, URL, date, CAD equivalent, whether the JP formula is the same SKU.

State when the arbitrage band is empty (authorized same SKU, or YesStyle already at landed+ship).

### 5. Working capital

Cash conversion cycle:

- Preorder: collect → buy → ship. CCC can be negative. This is the Year 1 design.
- Stock: 6–10 weeks inventory × COGS. On base GMV ~73k and 48% GM, COGS ~38k → inventory cash CAD 8–15k.

Show why Year 1 net CAD 18k can be eaten by a stock switch.

### 6. Founder labour

Assume 10–15 hours/week Year 1 (label assumed). Restate conservative / base / optimistic **nets after** CAD 25/hour and after CAD 50/hour. Do not pick a “correct” wage; show both.

### 7. Repeat / LTV (label assumed)

Stationery + lotions = replenishment. Tools = one-shot. Sketch a 12-month cohort with assumed repeat 20% / 35% / 50% and say the data does not exist yet.

### 8. P&L

Use **only** the shared-facts Year 1 ranges. Build a monthly sketch for Year 1 base (ramp 40 → 140 orders/month) and a Year 2 base (1.6–2.0× Year 1 GMV, still no PE, still no sunscreen).

Do **not** treat desk GMV CAD 345k as Year 1. You may show it as a **labelled fiction** “if every catalog velocity were real and sunscreen were legal.”

### 9. Sensitivity tornado

Rank: AOV, GM, ad %, refund %, air CAD/kg, conversion vs ship-days. One-way ±20% on the Year 1 base net.

## Output shape for `docs/research/01-unit-econ.md`

- Title + date + “wave 1 note, not final essay”
- Disclaimer: 研究筆記，不是稅務或法律意見
- Sections 1–9 as above
- A final `## Numbers the synthesizer must not break` bullet list (copy locked facts plus any **new** computed figures you want wave 2 to reuse, e.g. one-parcel CM)
- Sources

When the file is written, your job is done. Do not start wave 2.
