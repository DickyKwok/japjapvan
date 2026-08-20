# Wave 1 / 05 — ops, logistics, compliance (not another CIT essay)

You are **Grok 4.6**, running **headless** in the JapJapVan repo. Write **one** file and stop.

**Output path (only file you may write):** `docs/research/05-ops-compliance.md`  
**Language of that file:** Traditional Chinese (zh-Hant).  
**Do not rewrite** the corporate-tax argument. Cite `docs/hk-ca-tax-price-advantage-2026.md` in one short section and move on. You own the **pipe**: money and goods through time.

## Required reads

1. `docs/research/_shared-facts.md`
2. `docs/hk-ca-tax-price-advantage-2026.md` — PE tripwires, GST/PST, de minimis CAD 20, CNF, sunscreen DIN, DDP
3. `src/data/products.ts` — `regulatory` field, `weightG`, `bulky`, notes about aerosol / voltage / eye drops
4. `src/routes/preorders.tsx` / `src/routes/procurement.tsx` — how the desk already thinks in preorder + 採購 (read enough to not contradict the product)
5. `src/data/criteria.ts`

Then search and open:

- Health Canada cosmetic notification (CNF) + importer of record
- Health Canada sunscreen as drug/NHP + CBC 2024-09-10 Asian sunscreens
- CBSA courier de minimis CAD 20
- BC PST extra-provincial / CAD 10,000
- Air cargo HK→YVR: public kg bands, lithium / aerosol restrictions (Curel spray)
- Shopify Payments / Stripe Hong Kong CAD settlement FX

Empty note only after required reads + those official pages.

## What to specify

### 1. The pipe (Year 1 no-PE)

Preorder (Shopify) → weekly buy (HK and/or JP) → consolidate air → CBSA → last mile to customer.

Draw it as a numbered timeline with **who is importer of record** in the DDP case vs DDU case.

### 2. Cost per kg

Public band for 8–12 kg HK→YVR air / courier consolidate. If you cannot get a live quote, give a range and label estimate. Translate to CAD/unit for 40g Melano vs 280g Fino vs 520g Campus.

### 3. DDP vs DDU

Why DDU destroys conversion (second bill from DHL). DDP must sit **inside** the sticker. GST 5% + BC PST 7% when registered + duty if any.

When to voluntarily register GST (ITC on import) vs staying unregistered and letting border GST stick.

### 4. PE in ops language

A Vancouver closet, a friend’s basement, Amazon FBA, a weekend pop-up that keeps leftover stock, a person who confirms orders in CAD on WhatsApp — each as **do / don’t** for the no-PE model. No legal memo, just tripwires.

### 5. Year 1 SKU kill / hold list

From the catalog `regulatory` + notes:

- Kill (do not commercially sell): all SPF sunscreens, Transino, Lycee, anything NHP/drug
- Hold: aerosols on air, 100V tools, food
- Go: ordinary cosmetics with CNF path, stationery, most hair (non-drug)

CNF: 10 days after first sale; Canadian importer of record for a clean path. Bilingual labelling risk — state the practical Year 1 posture (grey vs clean).

### 6. Payments and FX

HK entity, CAD prices, Stripe/Shopify. FX 1–2% can exceed the CIT gap. Chargebacks on grey beauty.

### 7. Returns

A policy that does not bankrupt 48% GM: unopened only, buyer pays return postage, no returns on inbound-seized DDU, photo of lot on dispatch. Write it as a paragraph the store can paste.

## Output shape

`docs/research/05-ops-compliance.md`:

- Pipe
- kg math
- DDP
- PE tripwires
- Kill/hold/go SKUs (use catalog ids)
- Payments, returns
- `## Ops rules wave 2 must not break`
- Sources (canada.ca / CBSA / Health Canada URLs)

Stop when written.
