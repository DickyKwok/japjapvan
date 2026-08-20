# Wave 1 / 06 — competitor intelligence

You are **Grok 4.6**, running **headless** in the JapJapVan repo. Write **one** file and stop.

**Output path (only file you may write):** `docs/research/06-competitor-intel.md`  
**Language of that file:** Traditional Chinese (zh-Hant).  
**Do not write:** HK store hours (wave 1 / 03) or JP wholesale MOQs (wave 1 / 04), except one line per rival on **their** sourcing guess.

Goal: the owner should walk into this market **more informed than the field** — not louder, informed. That means prices, days, SKU overlap, and the specific facts 代購 and YesStyle are lazy about.

## Required reads

1. `docs/research/_shared-facts.md`
2. `docs/hk-ca-tax-price-advantage-2026.md` — who the tax memo already named as rivals
3. `src/data/products.ts` — hero SKUs for a price basket

Then **open live storefronts** (web_search + open_page / web_fetch), do not recite memory:

Price basket (CAD delivered to a Vancouver postal code if the site shows it; otherwise list + ship estimate, labelled):

1. Rohto Melano CC essence
2. Fino Premium Touch mask
3. Hada Labo Gokujyun Premium lotion
4. Curel Intensive Moisture Cream (or closest)
5. Canmake Cream Cheek
6. Heroine Make mascara
7. Pilot FriXion or Zebra Sarasa if they carry stationery
8. Biore Aqua Rich **as a demand/price marker only** (flag: JapJapVan must not sell)

Rivals to dossier (skip any you truly cannot load, and say so):

- YesStyle
- Stylevana
- Jolse
- Amazon.ca (sold-by mix)
- eBay.ca grey
- iHerb if relevant
- Japanese-beauty.ca or similar Canadian DTC if you find one
- Shoppers Drug Mart / Sephora.ca — **authorized**, likely different SKU; say when they are not substitutes
- T&T, Daiso, MiniSo, Tokyo Life / konbini-type Vancouver retail (assortment, not a full basket)
- WeChat / Facebook / Xiaohongshu 溫市代購 — qualitative: speed, trust, no CNF, cash

For each **online** rival: assortment bias (KR vs JP vs CN), ship days to Canada, duties policy (DDP/DDU), return policy, fake-risk reputation (cite forums, dated), weakness JapJapVan can use.

## The “colder than them” appendix (required)

A numbered list of **facts a default YesStyle merchandiser or WeChat 代購 does not systematically track**, that this company should:

- 萬寧 flyer timing vs JP 改版 week
- JAN / lot / expiry photos on every dispatch
- Which Amazon.ca listing is US formula vs JP
- Which SKUs Health Canada will seize (sunscreen)
- CPTPP CoO irrelevance at this AOV
- Preorder cash cycle vs their in-stock model
- Vancouver-specific WTP (Curel in winter, not summer gels only)

If you cannot verify a “secret,” do not write it. Better a short true list than a spy novel.

## Output shape

`docs/research/06-competitor-intel.md`:

- Basket table: SKU × rival × price × URL × date
- One subsection per rival
- Substitutability map (who you actually lose a cart to)
- Colder-than-them appendix
- Sources

Stop when written.
