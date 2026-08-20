# Wave 2 / 07 — Harvard-econ feasibility essay (user-facing)

You are **Grok 4.6**, running **headless** in the JapJapVan repo. Write **one** file and stop.

**Output path (only file you may write):** `docs/feasibility-harvard-econ.md`  
**Language:** Traditional Chinese (zh-Hant). Formulas and statute names in English.  
**Tone:** Harvard econ section notes. Cold. Numerical. Not a pitch deck. Not a story (wave 2 / 09 owns the story).

## Required reads (all of them, in order)

1. `docs/research/_shared-facts.md`
2. `docs/hk-ca-tax-price-advantage-2026.md`
3. `docs/research/01-unit-econ.md`
4. `docs/research/02-demand-market.md`
5. `docs/research/03-sourcing-hk.md`
6. `docs/research/04-sourcing-jp.md`
7. `docs/research/05-ops-compliance.md`
8. `docs/research/06-competitor-intel.md`

If any wave-1 file is missing or a stub, **stop and write nothing except a one-line error in stdout**. Do not invent the missing research.

Do not edit those notes. Do not invent a new GMV range that contradicts `_shared-facts.md`. You may **restate** wave-1 computed figures (one-parcel CM, TAM band, basket prices). If two notes conflict, say so and prefer `_shared-facts.md` then the tax memo.

## Essay structure (required headings)

1. **判決（一段）** — play / don’t play / play **only** as HK company + preorder + weekly consolidate + **no sunscreen**. One paragraph.
2. **模型** — π = Q(P−MC)−F calibrated to JapJapVan. Gross vs contribution vs owner cash. Iceberg t. Tax incidence: CIT gap is not the wedge; trade costs and legality are.
3. **剩餘從哪來** — differentiated JP formula, not 8.25% vs 11%. Cite competitor basket if wave 1 / 06 got prices.
4. **損益** — Year 1 and Year 2, three cases from shared facts. Each case **with founder wage = 0** and **with CAD 25/h and CAD 50/h** using wave 1 / 01 hours. Monthly ramp for Year 1 base.
5. **哪個約束先綁住** — ranked: legality (sunscreen), one-parcel shipping, cash if they stock, CAC, PE temptation, FX. Not “tax.”
6. **殺掉規則** — if X by month 6, stop. Pull thresholds from wave 1 / 02 if present; otherwise conservative defaults labelled as defaults (e.g. <30 paid orders in months 4–6 combined, or contribution negative after consolidate).

Disclaimer at top: 研究筆記，不是稅務或法律意見.

Target length: long enough that a serious reader could decide to spend a month of evenings. Roughly 2,500–5,000 Chinese characters plus tables. No padding.

When `docs/feasibility-harvard-econ.md` is written, stop.
