# Wave 2 / 08 — sourcing playbook (user-facing)

You are **Grok 4.6**, running **headless** in the JapJapVan repo. Write **one** file and stop.

**Output path (only file you may write):** `docs/sourcing-channels.md`  
**Language:** Traditional Chinese (zh-Hant).  
**Job:** the owner can buy next week without being dumber than YesStyle or a 溫市代購.

## Required reads (all)

1. `docs/research/_shared-facts.md`
2. `docs/hk-ca-tax-price-advantage-2026.md`
3. `docs/research/01-unit-econ.md` (only the landed / one-parcel / consolidate bits)
4. `docs/research/02-demand-market.md` (legal vs illegal demand)
5. `docs/research/03-sourcing-hk.md`
6. `docs/research/04-sourcing-jp.md`
7. `docs/research/05-ops-compliance.md` (kill/hold/go)
8. `docs/research/06-competitor-intel.md` (what rivals already price)

If wave-1 HK or JP notes are missing, stop; do not invent store maps.

## Required headings

1. **採購層級** — default channel **by category**: skincare, hair, makeup, stationery, tools, food if any, **never-sunscreen**. One default + one fallback.
2. **決策樹：這個星期萬寧 / 去日本或JP網 / Rakuten+集運** — with the unit-econ trigger (when JP saving beats air).
3. **真貨協議** — barcode/JAN, lot, expiry, receipt photo, 製造 vs 輸入, what to do if 深水埗 price is “too good.”
4. **比對手更熟的部分** — table: 他們知道什麼 / 你會系統性知道什麼. Steal the colder-than-them appendix from wave 1 / 06 and the 萬寧 ritual from wave 1 / 03.
5. **首批 20 個可合法賣去加拿大的 SKU** — from `src/data/products.ts` ids, **no DIN sunscreens, no NHP/eye drops**. For each: default buy channel, why, estimated GM using catalog landed/sell, hold-out reason if any (aerosol, bulky).
6. **每週儀式** — paste-ready Monday-to-Sunday from wave 1 / 03, tightened.

Disclaimer at top.

Do not tell them to warehouse in Vancouver. Do not tell them to list Biore.

When `docs/sourcing-channels.md` is written, stop.
