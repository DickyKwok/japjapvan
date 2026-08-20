# Wave 1 / 03 — Hong Kong buy map

You are **Grok 4.6**, running **headless** in the JapJapVan repo. Write **one** file and stop.

**Output path (only file you may write):** `docs/research/03-sourcing-hk.md`  
**Language of that file:** Traditional Chinese (zh-Hant). Neighbourhood and chain names in Chinese is expected.  
**Do not write:** Japan wholesale (wave 1 / 04), competitor dossiers (wave 1 / 06), or unit econ P&L.

Goal: a serious 代購 already knows this map. Write it so the owner knows it **colder** — hours, flyers, lot codes, which floor, what not to touch.

## Required reads

1. `docs/research/_shared-facts.md`
2. `docs/hk-ca-tax-price-advantage-2026.md` (sourcing-price bits)
3. `src/data/products.ts` — which SKUs are JP drugstore vs prestige vs stationery vs tools
4. `src/data/discovered-products.json` if present

Then actually search and open pages:

- Mannings / 萬寧 weekly promotions, app, membership
- Watsons HK, Sasa, Bonjour, Don Don Donki HK locations, 日本城, city’super, Yata, AEON Style
- Parallel 藥妝 in 旺角 / 銅鑼灣 / 北角 / 深水埗 — what is known publicly about authenticity risk
- Whether HK retail receipts help with authenticity proof for Canadian buyers
- HK export / personal courier vs commercial invoice (light touch; ops agent owns logistics)

Empty note only after required reads + at least five live web sources on named chains.

## For each channel, a fixed table

Columns: 渠道, 擅長品類, 相對日本藥妝正價, 是否容易拿到發票/批次, 真貨風險, 時間成本, 據點, 筆記.

Cover at least:

- 萬寧 Mannings
- 屈臣氏 Watsons
- 莎莎 Sasa
- 卓悅 Bonjour
- Donki HK
- 日本城
- city’super / Yata / AEON
- 旺角／銅鑼灣／北角 藥妝平行店
- 深水埗 grey (be honest about fakes)
- Any real HK wholesale / cash-and-carry / Cosme Kitchen-type B2B you can verify. If you cannot verify Sogo “back of house,” **do not invent it**.

## Also required

### Weekly procurement ritual

Not a shopping trip. A system:

- Which weekday 萬寧 / Watsons drop promo
- How to read the 萬寧 app / weekly flyer into a buy list **before** leaving home
- Barcode vs JP JAN, 製造 vs 輸入, lot / expiry photo protocol for the customer
- Caps: no more than X minutes per store; no prestige without a preorder
- Restock vs opportunistic promo

### What never to buy in HK for this company

- JP chemical sunscreen destined for Canadian **commercial** sale
- Oral whitening / eye drops / NHP
- Obvious parallel fakes
- JP exclusives that HK shelves do not actually carry (list if you can verify)

### Membership and tax

Donki / AEON membership, 萬寧 app. HK has no GST on most retail; that is a **buy-side** fact, not a Canada sell-side tax advantage. Do not confuse the two.

## Output shape

`docs/research/03-sourcing-hk.md`:

- Channel tables
- Ritual (numbered, a person could follow Monday 10:00)
- Never-buy list
- `## Default HK channel by JapJapVan category` (skincare, hair, makeup, stationery-if-any, tools-if-any)
- Sources

Stop when written.
