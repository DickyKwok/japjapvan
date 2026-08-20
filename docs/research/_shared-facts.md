# JapJapVan shared facts (agents: do not drift)

**As of:** 2026-08-20  
**Repo:** japjapvan  
**Canonical tax memo:** `docs/hk-ca-tax-price-advantage-2026.md`

Treat every number below as **locked** unless you find a dated primary source that contradicts it. If you contradict, **flag the conflict** in your note — do not silently overwrite.

This file is a contract for parallel Grok 4.6 research agents. It is not tax or legal advice.

---

## Business

- Shop: **JapJapVan**. Lane: Japan / Hong Kong → Vancouver, sell in **CAD**. Reverse Canada → HK is a probe, not Year 1 P&L.
- Model to analyse: **Hong Kong company**, preorder + weekly consolidate, **no Canadian warehouse**. Fast local delivery and “no PE” cannot both be true.
- Shopify is the customer storefront. This repo is merchandising HQ.

## FX (desk, not invoice)

From `src/lib/money.ts`, mid-2026 desk rates, as of **2026-08-16**:

- CAD/JPY **108**
- CAD/HKD **5.7**

Wholesale JPY estimate: `landedCad × 108 × 0.62` — meaning catalog `landedCad` already embeds ~**38%** freight / duty / loss. Do not add a second 38% on top unless you are replacing landed with a true ex-works price.

## Catalog (50 core SKUs in `src/data/products.ts`)

Computed 2026-08-20 from core products (not discovered extras):

| | |
| --- | ---: |
| SKUs | 50 |
| Median sell | CAD **24** |
| Mean sell | CAD ~46 (prestige outliers: SK-II, ReFa, YA-MAN) |
| Average SKU gross margin | **~51.6%** |
| If every `weeklyVelocity` ran 52 weeks (desk model, **not a forecast**) | GMV ~CAD **345,000**, GP ~CAD **172,000**, GM **49.9%** |
| Sunscreen share of that desk GMV | **~18.8%** (~CAD 65k) |
| Desk GMV mix | skincare 169k · sunscreen 65k · stationery 44k · tools 31k · hair 26k · makeup 8k · daily 3k |

`weeklyVelocity` and `caTrend` are **merchandising hypotheses**, not proven sell-through. Brand-keyword Google Trends only. Empty Canada Trends series stay empty. Do not invent +%.

Default listing hurdle (`src/data/criteria.ts`): CA growth ≥ +12% or index ≥ 55, JP index ≥ 25, margin ≥ 28%.

## Year 1 forecast (from tax memo — use these, do not invent a fourth “desk = Year 1” case)

Boss labour **not** deducted in the nets below.

| Case | Year 1 GMV | Tax-after net (HK co, no PE) |
| --- | ---: | ---: |
| Conservative | CAD 30,000–45,000 | **−5,000 to +8,000** |
| Base (decision case) | CAD 65,000–90,000 | **12,000–22,000** |
| Optimistic | CAD 150,000–220,000 | **32,000–50,000** |

Base calibration used in the tax memo: ~90 orders/month average, AOV CAD **68**, product GM **48%** after consolidate (catalog 52% minus 4 pt for air / damage / FX), ads 8% GMV, payments ~3%, refunds 4%, Shopify+tools ~CAD 80/month.

Year 1 company-tax gap vs a BC small CCPC on CAD 20k profit: about **CAD 550**. Per CAD 24 SKU at CAD 12.5 gross: about **CAD 0.34**.

## Tax (locked)

- HK profits tax: **8.25%** first HKD 2,000,000, then 16.5%. Mannings buy + HK web shop ⇒ **likely Hong Kong-sourced**. Do not plan on 0% offshore.
- BC small CCPC: federal 9% + BC 2% = **11%** on first CAD 500,000 active business income.
- Canada–Hong Kong tax agreement (2013) Art. 5 / 7: no Canadian **corporate income tax** without a PE.
- PE tripwires: Canadian 3PL / FBA / friend’s closet used as stock, dependent agent who habitually concludes contracts, central management in Canada.
- GST/HST still exists. Direct-from-Asia parcels: GST at the border (customer or DDP merchant). Qualifying-goods GST registration if goods sit in a Canadian fulfillment warehouse.
- CBSA de minimis **non-US/MX: CAD 20** for duty **and** tax. Almost every Mannings-style order exceeds it.
- BC PST 7% if soliciting BC sales or BC revenue **> CAD 10,000** / 12 months.
- HS 3304 cosmetics MFN often **6.5%**. Japan CPTPP can be 0% with a valid certification of origin. Hong Kong is **not** a CPTPP party. Parallel JP goods bought in HK still need origin docs to claim CPTPP.

## Compliance (locked)

- Japanese **chemical sunscreens** (Biore Aqua Rich, Anessa, Allie, Skin Aqua, Canmake UV): Health Canada treats SPF products as **NHP or drug** (NPN or DIN). Commercial sale without authorisation is illegal. **Year 1 commercial catalog: no sunscreens.** CBC 2024-09-10 is the public explainer.
- Cosmetics: Cosmetic Notification Form within **10 days** of first sale. Clean commercial path needs a **Canadian importer of record**.
- Do not commercially sell: Transino-type oral whitening, Lycee-type eye drops, unauthorised NHP.
- Food snacks: CFIA + bilingual nutrition if real commercial import.
- JP 100V tools (ReFa, YA-MAN, Panasonic Nanoe): voltage warning + preorder only, or drop.

## Operating rule that binds

**One-parcel DHL on a CAD 21 Melano destroys contribution.** Weekly consolidate (air, 8–12 kg bands) is the survival condition. DDP all-in sticker, not DDU surprise.

## Language and citation

- User-facing docs: **Traditional Chinese (zh-Hant)**.
- English statute names and article numbers stay English.
- Cite `path` or URL. Label estimates as estimates.
- Disclaimer on every money document: 研究筆記，不是稅務或法律意見.

## File ownership (do not write outside your assigned path)

| Agent | Writes |
| --- | --- |
| wave1/01 | `docs/research/01-unit-econ.md` |
| wave1/02 | `docs/research/02-demand-market.md` |
| wave1/03 | `docs/research/03-sourcing-hk.md` |
| wave1/04 | `docs/research/04-sourcing-jp.md` |
| wave1/05 | `docs/research/05-ops-compliance.md` |
| wave1/06 | `docs/research/06-competitor-intel.md` |
| wave2/07 | `docs/feasibility-harvard-econ.md` |
| wave2/08 | `docs/sourcing-channels.md` |
| wave2/09 | `docs/zero-to-one-story.md` |

Do not edit `src/`, `docs/hk-ca-tax-price-advantage-2026.md`, `_shared-facts.md`, or another agent’s file.
