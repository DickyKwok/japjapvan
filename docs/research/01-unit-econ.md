# JapJapVan 單位經濟（Harvard price theory）

**日期：** 2026-08-20  
**性質：** wave 1 note, not final essay  
**對象：** 之後的 synthesizer（`docs/feasibility-harvard-econ.md`），不是給客人看的可行性文章  
**工作貨幣：** CAD

> **研究筆記，不是稅務或法律意見。**

鎖定數字來自 `docs/research/_shared-facts.md` 與 `docs/hk-ca-tax-price-advantage-2026.md`。目錄數字來自 `src/data/products.ts`、`src/lib/money.ts`、`src/lib/scoring-core.ts`、`src/data/criteria.ts`。公開比價標 URL 與日期。找不到的報價標 **fail**，不以目錄 `weeklyVelocity` 假裝成銷量。

---

## 0. 假設總表（全文共用）

| 符號 | 定義 | 取值 | 來源 |
| --- | --- | ---: | --- |
| FX CAD/JPY | desk，不開發票 | **108** | `src/lib/money.ts` as of 2026-08-16 |
| FX CAD/HKD | desk | **5.7** | 同上 |
| FX USD/CAD | 公開比價用 | **1.38** | Yahoo Finance `CAD=X` 2026-08-20 close 1.3780，四捨五入 |
| P | 見 §1 | 目錄 `sellCad` | 選一種、不改 |
| landed | 已含 ~38% 運／關／損 | `landedCad` | `wholesaleJpyFromLandedCad = landedCad × 108 × 0.62` |
| 毛利率 identity | `(sell − landed) / sell` | — | `src/lib/scoring-core.ts` `marginPct` |
| 上架門檻 | min margin | **28%** | `src/data/criteria.ts` `minMarginPct: 0.28` |
| Year 1 AOV | | CAD **68** | shared-facts／稅 memo 基準 |
| Year 1 貨品 GM | 集運後 | **48%**（目錄 ~52% − 4 pt 空運／破損／FX） | 同上 |
| 支付 | | **3%** GMV（2.9% + CAD 0.30 的近似） | 同上 |
| 廣告 | | **8%** GMV | 同上 |
| 退貨／拒收／清關投訴 | | **4%** GMV | 同上 |
| Shopify + 工具 + 包裝 | | CAD **2,400** / 年（約 80／月含耗材） | 稅 memo 基準盤 |
| 雜項 | 樣品、匯率、破損 | CAD **1,500** / 年 | 同上 |
| F（老闆人工 = 0） | 上兩列之和 | CAD **3,900** / 年 | 本筆記合成 |
| 香港利得稅 | 首 HKD 2,000,000 | **8.25%** | 鎖定 |
| BC 小 CCPC | 首 CAD 500,000 ABI | **11%** | 鎖定 |
| 老闆工時 | Year 1 | **10–15 h／週**（假設；中位 12.5） | 本筆記，非鎖定 |
| `weeklyVelocity` | | **選品假設，不是已驗證週銷** | shared-facts |

**P 的稅務處理（選 B，全文不改）：**

- **P = 目錄 `sellCad`，未含 GST/PST。**
- BC GST 5% + PST 7% 當 **pass-through**：代收代付，不進 π。Year 1 基準已過 PST CAD 10,000 門檻，假設已登記 PST。
- 商家 DDP：客人付 P（或 P + 顯示中的 GST/PST）；**進口 GST 5% × 申報值由商家吸收，進 MC**。申報值用 `landedCad` 近似。目錄 landed 的 ~38% 是 freight／duty／loss，**不是** GST；兩筆不合併、也不把 38% 再疊一次。
- 若改為 DDU，進口 GST 打在客人身上，P 不變、轉換掉——本筆記基準盤是 DDP，不把 DDU 當 Year 1 設計。

---

## 1. Accounting identity

\[
\pi = Q\,(P - \mathrm{MC}) - F
\]

這是 Varian / Pindyck 教科書上的競爭廠商利潤恒等式。JapJapVan 的對號入座：

### 1.1 P

P = DDP 報給客人的 **未稅標價** = 目錄 `sellCad`。中位 SKU CAD **24**；基準客單 CAD **68**（約 2–3 件）。GST/PST 另列、代收。不把公司稅差寫進 P（見 §2）。

### 1.2 MC（邊際成本，每件）

拆開，避免把 landed 再加 38%：

\[
\mathrm{MC}
= \underbrace{c_{\text{ex}}}_{\text{港／日出貨價}}
+ \underbrace{\tau_{\text{in}}}_{\text{入境運＋關＋經紀＋損，已在 landed 的 38%}}
+ \underbrace{\tau_{\text{x}}}_{\text{履約增量：一件一寄或本週集運超出 landed 的部分}}
+ \underbrace{0.03P}_{\text{支付}}
+ \underbrace{0.04P}_{\text{期望退貨（GMV 口徑）}}
+ \underbrace{0.05 \times \text{landed}}_{\text{DDP 進口 GST，吸收}}
\]

廣告 8% GMV **不放進 MC**（不是隨 Q 的物理成本），放進 **contribution** 與期間費用。若把廣告也當變動成本，contribution 再扣 0.08P（§3 兩種口徑都列）。

**用萬寧貨架重建 MC：** 以貨架價 **取代** `landedCad`，再只加 τ_x、支付、退貨、DDP GST。禁止 `貨架價 × 1.38`。

例（Melano CC Intensive Essence，目錄 landed CAD 9.60、P = 21）：

| 重建來源 | 取代 landed 的數字 | 之後還能加的 | 目錄毛利率還剩 |
| --- | ---: | --- | --- |
| 目錄 landed | 9.60 | τ_x + 0.03P + 0.04P + 0.05×landed | 54.3% 毛利起點 |
| Mannings 網店 essence 20ml 標價 HKD 99（≈ CAD 17.37） | **17.37 取代 9.60** | 同上，**不再 ×1.38** | (21−17.37)/21 = **17.3%**，低於 28% 門檻 |
| 香港藥房促銷 HKD 59（Lung Fung e-shop 曾列；≈ CAD 10.35） | 10.35 取代 9.60 | + τ_x ~CAD 2–5 | 毛利 ~50.7% 起；加 τ_x 後仍可過 28% |

Mannings 原價不是 COGS。目錄 9.60 隱含的批發回推：`9.60 × 108 × 0.62 ≈ JPY 643`，遠低於萬寧零售。

### 1.3 F

兩種 F，並列，不選「正確」的一種：

| | CAD / 年 | 內容 |
| --- | ---: | --- |
| **F₀**（老闆人工 = 0） | **3,900** | Shopify+工具+包裝 2,400 + 雜項 1,500。稅 memo 基準盤。 |
| **F₂₅**（保留工資 CAD 25/h） | 3,900 + **13,000–19,500** | 10–15 h／週 × 52。中位 12.5 h → +16,250 → F = **20,150** |
| **F₅₀**（CAD 50/h） | 3,900 + **26,000–39,000** | 中位 +32,500 → F = **36,400** |

F 不含香港利得稅（稅在 π 之後）與庫存投資（§5，資產負債表，不是損益）。

### 1.4 四層「賺」——不要互相冒充

對一件貨、以及對整年：

| 層 | 公式 | Year 1 基準盤（鎖定） |
| --- | --- | --- |
| **Gross margin**（目錄） | `(sell − landed) / sell` | 樣本見下；全目錄平均 SKU GM **~51.6%**；桌上模型加權 **49.9%** |
| **貨品 GM（經營）** | 集運後 | **48%**（−4 pt） |
| **Contribution margin** | `P − MC − 0.08P`（若廣告當變動） | 基準盤：0.48 − 0.03 − 0.08 − 0.04 = **0.33** × GMV |
| **EBITDA** | `Q(P−MC) − F₀`（未扣老闆、未扣利得稅；本盤無折舊） | 稅 memo 基準稅前 **20,300** ≈ 此層 |
| **Owner cash** | EBITDA − 香港 8.25% − ΔNWC | 稅後 **~18,600**；若改現貨，ΔNWC 可吃掉 8–15k（§5） |

`weeklyVelocity` **不是** Q。Q 只用 Year 1 預測區間。

### 1.5 目錄樣本（≥12 SKU；防曬只作 counterfactual）

毛利率 = `marginPct`。`weeklyVelocity` 欄標 **假設**，禁止當銷量。

| id | 類 | P | landed | GM | 回推批發 JPY | 重 g | vel／週（假設） |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| hada-lotion | skincare | 24 | 11.50 | 52.1% | 770 | 220 | 11 |
| melano-cc | skincare | 21 | 9.60 | 54.3% | 643 | 55 | 9.4 |
| dhc-oil | skincare | 26 | 12.80 | 50.8% | 857 | 230 | 8.2 |
| curel-cream | skincare | 29 | 14.00 | 51.7% | 937 | 90 | 7.4 |
| fino-mask | hair | 18 | 8.10 | 55.0% | 542 | 280 | 10.5 |
| honey-shampoo | hair | 28 | 13.60 | 51.4% | 911 | 480 | 3.9 |
| pilot-frixion | stationery | 16 | 7.20 | 55.0% | 482 | 45 | 9.8 |
| kokuyo-campus | stationery | 19 | 8.80 | 53.7% | 589 | 520 | 6.8 |
| midori-md | stationery | 24 | 10.60 | 55.8% | 710 | 280 | 2.9 |
| mapepe-brush | tools | 16 | 6.40 | 60.0% | 429 | 70 | 3.3 |
| salonia-iron | tools | 72 | 38.00 | 47.2% | 2,544 | 410 | 1.1 |
| **biore-essence** | **sunscreen，Year 1 不上架** | 24 | 10.80 | 55.0% | 723 | 80 | 18 |

對照（非樣本核心）：`sk2-essence` P 248 / landed 148 / GM **40.3%** —— 低過萬寧貨、仍過 28%，且一件一寄後 contribution 仍正（§3）。

樣本 11 個 Year 1 可賣 SKU 全部 ≥28%。最低是 Salonia 47.2%。合規炸彈不在 margin 門檻，在防曬 DIN／NPN。

---

## 2. Tax incidence（不是定價武器）

### 2.1 鎖定的利潤稅差

HK 8.25% vs BC CCPC 11% = **2.75 個百分點的利潤**，不是售價。

\[
\Delta T = 0.0275 \times \pi_{\text{pre-tax}}
\]

| 口徑 | 數字 | 來源 |
| --- | ---: | --- |
| CAD 20,000 稅前利潤 | ΔT = **CAD 550** | shared-facts |
| CAD 24 SKU、毛利 CAD 12.5 | 0.0275 × 12.5 = **CAD 0.34／件** | 同上 |
| Year 1 基準 vs 同一盤 BC CCPC | ~CAD **530** | 稅 memo 9.2 節 |

### 2.2 為什麼這不移動零售需求曲線

標準價格理論把稅分成兩類（Kotlikoff / Fullerton 歸宿；教科書 Musgrave 區分）：

1. **對 Q 的從量／從價稅（excise, tariff, GST）：** 供給曲線上移（賣方法定歸宿）或需求曲線下移（買方法定歸宿）。均衡 P 與 Q 都變。Pass-through 取決於 ε_D、ε_S。
2. **對 π 的公司所得稅：** 不進入 MC，不進入消費者預算。短期競爭廠商的 P = MC(Q) 決策不變。需求曲線 D(P) **原位**。

香港利得稅與加拿大 corporate income tax 都是第 2 類。2.75 pt 的差距是 **利潤的歸宿**，不是 **標價的歸宿**。

Pass-through bound（極限）：即使把全部公司稅差當成願意少賺、用來降價，

\[
\frac{0.34}{24} \approx 1.4\% \quad \text{of sticker}.
\]

這不是 10–20% 的零售空間。對手是 YesStyle／Amazon grey／微信代購，不是「一間交 11% 的加拿大公司」。

GST／PST／關稅才是第 1 類。它們 **會** 移動交付價格。香港公司在消費稅層沒有優勢：不登記 GST 則不能 ITC；DDP 墊的進口 GST 可能變成成本。

### 2.3 對比 Samuelson iceberg t

Iceberg 貿易成本 t 是 **每件交付時蒸發的資源**（運、經紀、日數、損壞）。它直接加進 MC，所以：

\[
P_{\text{delivered}} = P^* (1+t)
\]

或在從量口徑：MC′ = MC + τ_x。這 **移動** 供給、移動交付價、移動 Q。§3 顯示 τ_x 的量級是每件 **CAD 2–18**，比 0.34 大一個數量級。稅差可以忽略；iceberg 決定活得下去與否。

股東層（香港居民股息 0%）是 **口袋** 優勢，不是貨架優勢。本筆記不把股息稅差寫進 P。老闆若是加拿大稅務居民，T1134／全球收入另算——synthesizer 去稅 memo §4，這裡不展開。

---

## 3. Iceberg trade costs（Samuelson t）

標的：**CAD 24 貼紙**，主算 `hada-lotion`（P 24、landed 11.50、220 g）；對照 `melano-cc`（P 21、55 g）與 `fino-mask`（P 18、280 g，重貨）。

Contribution 兩種口徑（廣告是否當變動）：

\[
\begin{aligned}
\mathrm{CM}_{\text{narrow}} &= P - \text{landed} - \tau_x - 0.03P - 0.04P - 0.05\times\text{landed} \\
\mathrm{CM}_{\text{full}} &= \mathrm{CM}_{\text{narrow}} - 0.08P
\end{aligned}
\]

Hada：0.05×11.50 = 0.58。為對齊稅 memo 的 15% 變動桶（pay+ads+refund），下表 **主列 CM_full**；DDP GST 0.58 另列，避免和 4 pt 頭髮重複計算時膨脹。

**主列公式（與 Year 1 基準 0.33 contribution 對齊）：**

\[
\mathrm{CM}_{\text{full}} = 0.85P - \text{landed} - \tau_x
\]

Hada：`0.85×24 − 11.50 − τ_x = 8.90 − τ_x`。

### 3.1 一件一寄 DHL／FedEx（0.2–0.5 kg HK→YVR）

**Live quote：失敗。** DHL HK 公開計算機要交互填單，本筆記拿不到 2026-08-20 的 HK→YVR 0.3 kg 門到門數字。DHL Discover 對 **HK→US 0.5 kg A4 文件** 寫約 HK$500（≈ CAD 88）——那是文件／零售門市價，**不用來當化妝品小包計價**。

按任務規定，τ_x 用 **CAD 10–18／件、標 estimate**。中位 CAD 14（稅 memo 用 12–14）。Melano 55 g 取帶下沿；Fino 280 g 取帶上沿。

### 3.2 每週集運 8–12 kg 空運

公開頁（非即時報價）：

- FreightAmigo《Hong Kong to Canada Shipping》，2026-02-27 刊／2026-03-13 更新：100 kg air **USD 8–12／kg**；10 kg express parcel **USD 100–200**（即 USD 10–20／kg）。Vancouver 最低。
- Freightos HK→Canada 頁（抓取 2026-08-20）：示例 10 kg air **USD 53.88／kg**、100 kg **USD 8.75／kg**。10 kg 那一檔是小票公開價，不是 8–12 kg 集運協議價。

8–12 kg 週集運落在「比 100 kg 協議貴、比 10 kg 公開小票便宜」的中間。攤到中位 250 g 件：USD 8–12／kg × 0.25 kg × 1.38 ≈ **CAD 2.8–4.1／件**。任務帶 **CAD 2–5／件** 與公開頁相容。**標 estimate**；沒有 2026-08 的 forwarder 合同。

**注意：** 目錄 landed 已含 ~38% inbound。CAD 2–5 **疊在 landed 上** 會部分雙計空運。Year 1 P&L 已用 52%→48% 的 4 pt（Hada 上 = CAD 0.96／件）代表集運增量。§3 表按任務要求「疊在 catalog landed 上」；§8 不疊第二次。

### 3.3 加拿大倉

較快轉換（2 日 vs 7–21 日）。Last-mile 本地郵政／Uniuni 量級 CAD 6–12／票，可多件均攤。**這不再是 no-PE 模型：** 加拿大 3PL／持貨倉 ≈ 所得稅 PE + qualifying goods GST 正常登記（稅 memo §2.3、§5.1）。本列只作 counterfactual，不寫進 Year 1 π。

### 3.4 表：CAD 24（Hada Labo lotion）

| Fulfilment | Extra CAD（疊在 catalog landed 上） | CM_full = 8.90 − extra | 符號 |
| --- | --- | ---: | --- |
| 一件一寄 DHL／FedEx | **10–18（estimate；無 live quote）** | **−1.10 至 −9.10** | **負** |
| 一件一寄中位 14 | 14 | **−5.10** | **負** |
| 週集運 8–12 kg | **2–5**（FreightAmigo 100 kg 帶 + 10 kg parcel 帶推斷） | **+6.90 至 +3.90** | 正，薄 |
| 若只認 P&L 的 4 pt、不疊 | 0.96 | +7.94 | 正；與基準 0.33×P=7.92 對齊 |
| 加拿大倉 | last-mile ~6–12／票均攤 − 轉換↑；**有 PE** | 未估（模型已換） | 不要假裝 no-PE |

### 3.5 負貢獻的單位（一件一寄）

同一公式 `CM_full = 0.85P − landed − τ_x`：

| SKU | P | landed | τ_x 取 | CM_full | 一件一寄 |
| --- | ---: | ---: | ---: | ---: | --- |
| hada-lotion | 24 | 11.50 | 14 | **−5.10** | 負 |
| hada-lotion | 24 | 11.50 | 10（帶下沿） | **−1.10** | 仍負 |
| melano-cc | 21 | 9.60 | 12 | **−3.75** | 負 |
| melano-cc | 21 | 9.60 | 10 | **−1.75** | 仍負 |
| fino-mask（重） | 18 | 8.10 | 14 | **−6.80** | 負 |
| biore-essence（不上架） | 24 | 10.80 | 12 | **−2.40** | 負；需求標記而已 |
| sk2-essence（對照） | 248 | 148 | 25（稅 memo） | **+37.80** | **仍正** |

**萬寧式貨在一件一寄下 contribution 為負。** 這是生存條件，不是優化。集運把 Hada 拉回約 CAD 4–8／件 contribution；稅差 0.34 在誤差內。

窄口徑（廣告不當變動）Hada 一件一寄中位：`0.93×24 − 11.50 − 14 = −3.18`，**仍負**。結論不依賴廣告歸類。

---

## 4. Law of one price / 套利帶

LOOP：同一可貿易 SKU，P_i ≈ P_j × FX + iceberg。套利帶空 = 無法在扣 t 之後低買高賣，或授權通路已是同一 SKU。

公開價 **2026-08-20** 抓取，除非另注。USD 用 1.38。YesStyle 本機 fetch 落到台灣站（TWD）；USD 價來自搜尋爬蟲（shipping to US）。TWD 不強行換 CAD（缺鎖定 TWD/CAD）。

### 4.1 四個指定 SKU

| SKU | 來源 | 價 | CAD 約 | 是否同一 JP 配方 | URL | 日期 |
| --- | --- | ---: | ---: | --- | --- | --- |
| Melano CC 20ml | JapJapVan 目錄 | 21 CAD | 21 | 目錄：Intensive Essence | `src/data/products.ts` `melano-cc` | 2026-08-20 |
| Melano CC Vitamin C Essence 20ml | YesStyle | US$ 10.40（list 12.99，~19% off） | **14.35** | 日本製；標準 essence，**未必是 Premium** | https://www.yesstyle.com/en/rohto-mentholatum-melano-cc-vitamin-c-essence-20ml/info.html/pid.1122834023 | 爬蟲 2026-08-20；同日另一快取 US$ 9.04／11.30 |
| Melano CC | YesStyle（本機） | NT$ 283.13 | （不換） | 同上；台灣站 | 同上 | 2026-08-20 |
| Melano CC Premium 20ml | Amazon.ca（Gemini Image / FBA） | **CAD 33.89** | 33.89 | **Premium** 藥用しみ集中對策プレミアム；與目錄 Intensive 可能不是同一條 | https://www.amazon.ca/Medicinal-Concentration-Countermeasure-Premium-Essence/dp/B08WMJB5WV | 2026-08-20 |
| Melano CC Premium 20ml | マツキヨココカラ online | **¥1,628 稅込** | **15.07** | Premium，JP 藥妝通路 | https://www.matsukiyococokara-online.com/store/catalog/product/view/id/4987241168583 | 爬蟲 2026-08-16 |
| Melano CC 標準 20ml | kakaku.com 最安 | ¥604 | **5.59** | 比價最低；促銷／並行賣家，**不是發票** | https://search.kakaku.com/メラノCC 薬用しみ集中対策プレミアム美容液/ | 2026-08-20 搜 |
| Melano CC Bright Essence 20ml | Mannings HK | **HKD 99** | **17.37** | HK 零售；Bright／Intensive 對號要對包裝 | https://www.mannings.com.hk/zh-hant/mentholatum-melano-cc-bright-vitamin-c-essence-20ml/p/226969 | 搜尋 snippet；**全文 fetch 失敗** |
| Fino Premium Touch 230g | JapJapVan | 18 | 18 | 是 | `fino-mask` | 2026-08-20 |
| Fino 230g | YesStyle | US$ 11.62（list 16.60，30% off） | **16.04** | 日本製 230g | https://www.yesstyle.com/en/shiseido-fino-premium-touch-hair-mask/info.html/pid.1126837080 | 爬蟲 2026-08-15；稍後快取 US$ 13.36 |
| Fino 230g | Amazon.ca（BBD Online Store；另 PREMIUM JAPAN FBA CAD 18.58） | **CAD 18.00**（was 19.77） | 18.00 | 標 Shiseido／Fino 230g；賣家 Place of Business 寫 Shenzhen cosmetics cp ltd —— **灰市、真偽風險** | https://www.amazon.ca/Three-Fino-Premium-penetration-Essence/dp/B00YM1MEJI | 2026-08-20 |
| Hada Labo Gokujyun Premium Lotion 170ml | JapJapVan | 24 | 24 | 是 | `hada-lotion` | 2026-08-20 |
| 同上 | YesStyle | NT$ 435.98（本機）；2 pcs bundle US$ 29.75 → **US$ 14.88／瓶** | **20.53／瓶** | 日本製 Premium Lotion；Reddit 2025-10／2026-01 稱 YesStyle 曾顯示缺貨 | https://www.yesstyle.com/en/rohto-mentholatum-hada-labo-gokujyun-premium-lotion/info.html/pid.1122621936 ；bundle pid.1137891360 | 2026-08-20／bundle 爬蟲 |
| 同上 170ml JP | Amazon.ca | **未拿到 CAD 標價** | — | 搜到 HOSHISU 第三方「Gokujyun Premium 170ml」listing，**價未進入快取** | amazon.ca 搜 `hadalabo` | 2026-08-20 **fail（無價）** |
| Hada Labo JP lotion | Shoppers Drug Mart | **沒有產品頁** | — | 授權通路未見 JP Gokujyun Premium | shoppersdrugmart.ca 搜尋 | 2026-08-20 **fail** |
| Biore UV Aqua Rich Watery Essence SPF50+（JP） | JapJapVan 目錄 | 24 | 24 | JP 化學濾劑 | `biore-essence` | **Year 1 不上架** |
| 同上 JP 70g | YesStyle | US$ 11.68（list 14.60） | **16.12** | JP 旗；**加拿大商業出售違法**（NHP/drug） | https://www.yesstyle.com/en/kao-biore-uv-aqua-rich-watery-essence-sunscreen-spf-50-pa-70g-2025/info.html/pid.1122056968 | 爬蟲 2026-08-20 |
| Bioré UV Aqua Rich Weightless Moisturizer SPF 50 50ml | Amazon.ca | **CAD 16.97** | 16.97 | **加拿大配方，不是 JP SKU** | https://www.amazon.ca/Weightless-Moisturizer-Dermatologist-Invisible-Protection/dp/B0CNQDYGQ1 | 2026-08-20 |
| Stylevana Melano CC 20ml | Stylevana 品牌頁 snippet | Was US$ 16.79，**US$ 9.89** | **13.65** | 未分清 standard vs Premium | https://www.stylevana.com/en_US/brands/rohto-mentholatum/melano-cc.html | 搜尋；**全文 fetch 空頁（JS）** |

### 4.2 帶何時為空

| 比較 | 帶 | 含義 |
| --- | --- | --- |
| JapJapVan Melano 21 vs YesStyle ~14–16（未含／門檻免運） | **貼紙帶空或反轉** | 純標價打不贏 YesStyle。只剩 DDP、批次、溫市故事。 |
| JapJapVan Melano 21 vs Amazon.ca Premium 33.89 | 表面有帶 | **SKU 可能不同**（Premium vs Intensive）。不能當 LOOP 證據。 |
| JapJapVan Fino 18 vs Amazon.ca 18 | **空** | 灰市已把 JP 230g 錨在 CAD 18。差異是真偽／退貨，不是價。 |
| JapJapVan Fino 18 vs YesStyle ~16 | 窄（~2 CAD） | 免運門檻 US$ 35 後，落地價可低過 18。帶接近空。 |
| JapJapVan Hada 24 vs YesStyle ~20.5／瓶 | 窄 | 同樣：要靠 DDP 一次過，不是靠 3 刀。 |
| Hada JP vs Shoppers 授權 | **授權同一 SKU 不存在**（搜尋失敗） | 這是平行進口存在的理由；LOOP 對「Shoppers 貨架上的歐美 Hada Labo Tokyo」不適用——那不是同一配方。 |
| Biore JP vs Amazon.ca 加拿大版 16.97 | 不是同一 SKU | JP 條是需求標記。商業賣 JP 條違法。帶的寬度與 π 無關。 |
| Muji 卸妝油（目錄 notes） | 授權 CA 店競爭 | 稅 memo 已寫：授權同 SKU → 不要用低價打。本波未重抓 Muji CA 價。 |

**綜合：** 萬寧式英雄 SKU 的加元標價，已經被 YesStyle／Amazon grey 錨住。JapJapVan 的 48% GM 來自 **landed 9–12 vs P 18–24**，不是來自比 YesStyle 再平 10%。LOOP 在「JP 藥妝 ↔ CA 授權」之間因配方不同而寬；在「JP 藥妝 ↔ 跨境電商」之間 **窄到空**。

---

## 5. Working capital

現金轉換週期：

\[
\mathrm{CCC} = \mathrm{DIO} + \mathrm{DSO} - \mathrm{DPO}
\]

### 5.1 預購（Year 1 設計）

順序：**collect → buy → ship。**

- DSO：客人下單即付 → 應收為負（你先拿現金）。量級 −(leadDays)。目錄 lead 14–30 日。
- DPO：萬寧／藥妝零售採購是現金 → **~0**。
- DIO：付款後在途 7–21 日。

故 CCC 可以是 **負**：客人的錢在你付萬寧之前已經在賬。這是預購頁存在的財務理由，不是行銷文案。

### 5.2 現貨

基準盤 GMV CAD 73,400、GM 48% → COGS ≈ **38,200**／年 → 週 COGS ≈ 735。

鎖定：6–10 週庫存 × COGS → 庫存現金 **CAD 8,000–15,000**（shared-facts；比 6×735=4.4k 寬，含安全庫存、在途、MOQ、未售出）。不改此帶。

### 5.3 為什麼 Year 1 淨 CAD 18k 會被現貨吃掉

Owner cash（損益）≈ 18,600。改現貨的 ΔNWC ≈ +8,000 至 +15,000。

\[
\text{自由現金} \approx 18{,}600 - \Delta\mathrm{NWC} \in \{3{,}600,\ldots,10{,}600\}
\]

一次「為了快而改現貨」可以把稅後利潤的 **43–80%** 鎖進庫存。π 還在帳上，現金沒有。預購把 ΔNWC 壓到接近 0（甚至負）。**生存條件 #2：不要在 Year 1 為了兩日達而把 CCC 轉正。** 兩日達另外還觸發 PE（§3.3）。

HKD／CAD 結算滑點 1–2% GMV ≈ CAD 700–1,500／年，已大於公司稅差 550。這是現金，不是稅。

---

## 6. Founder labour

**假設（標 assumed，不選正確工資）：** Year 1 **10–15 h／週**。採購、打包、客服、內容。中位 12.5 h × 52 = **650 h**。

鎖定的稅後淨利 **未扣** 老闆人工。下表扣保留工資之後：

| Year 1 情境 | 鎖定稅後淨（人工=0） | 工時 | @ CAD 25/h | @ CAD 50/h |
| --- | --- | ---: | ---: | ---: |
| 保守 | **−5,000 至 +8,000** | 10 h（520 h） | −18,000 至 −5,000 | −31,000 至 −18,000 |
| 保守 | 同上 | 15 h（780 h） | −24,500 至 −11,500 | −44,000 至 −31,000 |
| 基準 | **12,000–22,000** | 10 h | −1,000 至 +9,000 | −14,000 至 −4,000 |
| 基準 | 同上 | 12.5 h | **−4,250 至 +5,750** | **−20,500 至 −10,500** |
| 基準點估計 18,600 | 18,600 | 12.5 h | **+2,350** | **−13,900** |
| 基準 | 12,000–22,000 | 15 h | −7,500 至 +2,500 | −27,000 至 −17,000 |
| 樂觀 | **32,000–50,000** | 12.5 h | +15,750 至 +33,750 | −500 至 +17,500 |

讀法：基準盤在 CAD 25/h、12.5 h／週附近是 **打平到微正**；CAD 50/h 下基準盤是 **負的 owner cash**。樂觀盤才能在 50/h 下看見正數。這不是「該不該做」的規範結論，是把 F 從 0 打開後恒等式的結果。

時薪含義：基準 18,600 ÷ 650 h ≈ **CAD 28.6／h 稅後**（未計庫存風險、合規尾部）。低於 50，略高於 25。保守盤多數時候低於 25。

---

## 7. Repeat / LTV（標 assumed）

**資料不存在。** 沒有 cohort、沒有 Shopify 回購、沒有 `weeklyVelocity` 以外的任何 sell-through。以下是 **假設草圖**，供 synthesizer 當敏感度，不當預測。

品類結構（目錄 `repeat` 分數，不是觀察）：

- 化妝水／面膜／文具：高 replenishment（hada-lotion repeat 9，pilot 8）。
- 工具電器：one-shot（refa／yaman／salonia repeat 2）。
- 防曬：repeat 9–10，但是 **Year 1 合法 Q = 0**。

假設：Year 1 基準 ~1,080 單、AOV 68。每張單 contribution = 68 × 0.33 = **CAD 22.44**（廣告當變動）。12 個月內，r 的新客剛好再下一單、不再下第三單：

| r（12 個月回購率，assumed） | 每客訂單 | LTV（contribution） | 若 8% GMV 廣告全是獲客 |
| ---: | ---: | ---: | --- |
| 20% | 1.20 | **26.93** | 粗 CAC ≈ 0.08×68 / (新客佔比)。新客佔比 1/1.20 → CAC ≈ 6.53；LTV/CAC ≈ 4.1 |
| 35% | 1.35 | **30.29** | CAC ≈ 7.34；LTV/CAC ≈ 4.1（廣告隨 GMV，比率穩） |
| 50% | 1.50 | **33.66** | CAC ≈ 8.16；LTV/CAC ≈ 4.1 |

廣告隨 GMV 走時，LTV/CAC 對 r **不敏感**——這是假設的偽穩定，不是已驗證單位經濟。若廣告是固定獲客、回購免費，r 才拉高 LTV/CAC。Year 1 兩種都可能。**寫進可行性文章前必須換成真實 cohort。**

工具權重上升 → 有效 r 下降。文具+化妝水權重上升 → r 上升。防曬若非法銷售，是高 r 品類被刪，LTV 變差——這是合規成本，不是需求消失。

---

## 8. P&L

**只用 shared-facts Year 1 區間。** 桌上模型 CAD 345k **不是** Year 1。老闆人工在本節 = 0（扣人工見 §6）。無加拿大 PE。無防曬。

### 8.1 鎖定的年區間

| 情境 | Year 1 GMV | 稅後淨（HK co，無 PE，人工=0） |
| --- | ---: | ---: |
| 保守 | 30,000–45,000 | **−5,000 至 +8,000** |
| 基準（決策） | 65,000–90,000 | **12,000–22,000** |
| 樂觀 | 150,000–220,000 | **32,000–50,000** |

基準校準點（稅 memo 9.2）：GMV **73,400**，~90 單／月，AOV 68，稅前 20,300，稅 1,670，稅後 **~18,600**。

### 8.2 Year 1 基準月草圖（ramp 40 → 140 單／月）

單量路徑（加總 1,085 ≈ 1,080）：

40, 50, 55, 65, 75, 85, 95, 105, 115, 125, 135, 140。

AOV 68。GP 48%。變動 15% GMV。F 月 = 3,900/12 = **325**。利得稅按年 8.25% 在表底一次扣，月列為稅前。

| 月 | 單 | GMV | GP 48% | 變動 15% | F | 稅前 |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 40 | 2,720 | 1,306 | 408 | 325 | 573 |
| 2 | 50 | 3,400 | 1,632 | 510 | 325 | 797 |
| 3 | 55 | 3,740 | 1,795 | 561 | 325 | 909 |
| 4 | 65 | 4,420 | 2,122 | 663 | 325 | 1,134 |
| 5 | 75 | 5,100 | 2,448 | 765 | 325 | 1,358 |
| 6 | 85 | 5,780 | 2,774 | 867 | 325 | 1,582 |
| 7 | 95 | 6,460 | 3,101 | 969 | 325 | 1,807 |
| 8 | 105 | 7,140 | 3,427 | 1,071 | 325 | 2,031 |
| 9 | 115 | 7,820 | 3,754 | 1,173 | 325 | 2,256 |
| 10 | 125 | 8,500 | 4,080 | 1,275 | 325 | 2,480 |
| 11 | 135 | 9,180 | 4,406 | 1,377 | 325 | 2,704 |
| 12 | 140 | 9,520 | 4,570 | 1,428 | 325 | 2,817 |
| **年** | **1,085** | **73,780** | **35,414** | **11,067** | **3,900** | **20,447** |

年稅 8.25% × 20,447 ≈ **1,687**。稅後 ≈ **18,760**。與鎖定點估計 18,600 相容（單量 1,085 vs 1,080 的圓整）。

Q1 稅前合計 2,279，已能覆蓋 F；不是「前六個月必須虧」。虧來自：退貨尾部、清關、仿貨、以及 §6 的工資——不是來自公司稅。

### 8.3 Year 2 基準（1.6–2.0 × Year 1 GMV；仍無 PE、仍無防曬）

以 Year 1 基準點 73,400 為底（不是 345k）：

| | 1.6× | 1.8× | 2.0× |
| --- | ---: | ---: | ---: |
| GMV | 117,440 | 132,120 | 146,800 |
| 單（AOV 仍 68） | 1,727 | 1,943 | 2,159 |
| 貨品 GM 48% | 56,371 | 63,418 | 70,464 |
| 變動 15% | 17,616 | 19,818 | 22,020 |
| F（仍無倉；工具略升，**假設 4,500**） | 4,500 | 4,500 | 4,500 |
| 稅前 | 34,255 | 39,100 | 43,944 |
| HK 8.25% | 2,826 | 3,226 | 3,625 |
| **稅後（人工=0）** | **~31,400** | **~35,900** | **~40,300** |

**此表是本筆記新算，不是鎖定事實。** 假設：GM／廣告／退貨率不變、仍集運、仍無 PE。樂觀 Year 1 上限 220k 已高過 2.0× 基準；不要把 Year 2 再疊一個「再樂觀」。稅 memo 寫過：量上去之後 3PL／兼職會把 PE 風險拉上來——那條路徑的稅率換成 11%，F 上升，不在本列。

### 8.4 桌上模型 = 標明的虛構

> **虛構，不是預測：** 若 50 個核心 SKU 的 `weeklyVelocity` 連跑 52 週，**且防曬可合法賣**。

| | CAD |
| --- | ---: |
| GMV | **344,958** |
| 貨品毛利 | 172,070（49.9%） |
| 其中防曬 | 64,698（18.8% GMV） |
| 扣防曬＋100V 電器後的「成熟年」天花板（稅 memo） | ~240k–250k GMV |

此數是 merchandising desk 節奏，不是 Year 1，也不是 Year 2 的 1.6–2.0×。Synthesizer 若寫「第一年 30 萬 GMV」，即是打破鎖定。

---

## 9. Sensitivity tornado

底：Year 1 基準點 GMV 73,400、contribution rate 0.33、F 3,900、稅前 20,300、稅後 **18,630**。

一次只動一個輸入 **±20%**（相對變動，不是百分點）。空氣運：±20% 作用在 P&L 已承認的 **4 pt 頭髮**（CAD 2,936／年），避免和 landed 38% 雙計。轉換 vs 船期：假設 7–21 日相對 2 日倉使 **訂單數 ±20%**（assumed；無轉換漏斗數據）。

| 排序 | 輸入 | −20% 稅後 | +20% 稅後 | Δ vs 18,630 |
| ---: | --- | ---: | ---: | ---: |
| 1 | **GM**（48% → 38.4% / 57.6%） | 12,180 | 25,110 | **±6.5k** |
| 2 | **AOV**（68 → 54.4 / 81.6；Q 不變） | 14,200 | 23,090 | **±4.4k** |
| 2′ | **轉換 vs ship-days**（Q ±20%，assumed） | 14,200 | 23,090 | **±4.4k**（與 AOV 同構） |
| 4 | **廣告 %**（8% → 6.4 / 9.6） | 19,700 | 17,550 | **±1.1k** |
| 5 | **air CAD／kg**（4 pt 頭髮 ±20%） | 18,090 | 19,170 | **±0.54k** |
| 6 | **退貨 %**（4% → 3.2 / 4.8） | 19,160 | 18,090 | **±0.54k** |

讀圖：

- **毛利率第一。** 相對 ±20% 把 48% 打到 38%，Year 1 淨利腰斬到保守盤。定價／集運／FX 比公司稅重要兩個數量級。
- **AOV 與船期轉換並列第二。** 為 2 日達開倉：若轉換真的 +20%，淨利 +4.4k，但模型變成有 PE、F 上升、GST 制度切換。4.4k 小於稅 memo 樂觀盤「開倉後營運成本 +16k」的量級。**不要用 tornado 的 +20% Q 為開倉辯護**——那是別一條 P&L。
- **廣告、空運、退貨在 ±20% 內是次要。** 一件一寄不是 ±20% 空運，是 τ_x 從 ~3 跳到 ~14（§3），那是離散制度選擇，不是 tornado 能捕捉的連續衝擊。
- 公司稅 8.25% vs 11% 根本進不了這張圖（CAD 550）。

若錯誤地把 CAD 2–5／件 **再疊** 進已是 48% GM 的 P&L，air 會偽造成第一敏感因子。那是雙計。Synthesizer 勿疊。

---

## Numbers the synthesizer must not break

鎖定（來自 `_shared-facts.md` / 稅 memo，本筆記不改）：

- CAD/JPY **108**，CAD/HKD **5.7**（desk 2026-08-16）。landed 已含 ~**38%**；回推批發 `× 108 × 0.62`。禁止第二層 38%。
- 目錄 50 SKU；中位 sell CAD **24**；平均 SKU GM **~51.6%**。桌上模型 GMV **~345k**／GP **~172k**／GM **49.9%** —— **不是 Year 1**。防曬佔該 desk GMV **~18.8%**。
- Year 1 保守 GMV 30–45k、淨 **−5k 至 +8k**；基準 65–90k、淨 **12–22k**；樂觀 150–220k、淨 **32–50k**。基準點 GMV **73.4k**、AOV **68**、貨品 GM **48%**、ads **8%**、pay **~3%**、refund **4%**、Shopify+工具 **~80／月**、稅後 **~18.6k**（人工=0）。
- HK 8.25% vs BC CCPC 11% → CAD 20k 利潤差 **~550**；CAD 24／毛利 12.5 的單件差 **~0.34**。
- 香港利得稅兩級；Mannings + HK 網店 ⇒ 大概率香港來源。Canada–Hong Kong Tax Agreement (2013) Art. 5 / 7：無 PE 則無加拿大 **corporate income tax**。GST/PST／關稅仍在。CBSA de minimis 非美墨 **CAD 20**。BC PST 過 **CAD 10,000**。
- Year 1 **不上架日本化學防曬**。一件一寄摧毀萬寧式 contribution。週集運是生存條件。DDP 一次報價。
- `weeklyVelocity` / `caTrend` = 假設，不是銷量。上架門檻 margin **≥ 28%**。

本筆記新算、建議 wave 2 複用（可改，但要標來源為 01）：

- Hada Labo P 24、一件一寄 τ_x CAD 10–18：**CM_full ≈ −1.1 至 −9.1**（中位 **−5.1**）。Melano P 21、τ_x 12：**CM_full ≈ −3.75**。Fino P 18、τ_x 14：**−6.80**。SK-II τ_x 25：仍 **+37.8**。
- 週集運 τ_x CAD 2–5 疊 landed：Hada CM_full **+3.9 至 +6.9**。與 4 pt 頭髮（CAD 0.96）對齊時 ≈ **+7.9**。
- 一件一寄 **live DHL HK→YVR 0.2–0.5 kg quote = fail**；帶 CAD 10–18 是 estimate。
- YesStyle Melano ≈ **CAD 14.4**（US$ 10.40 × 1.38，2026-08-20）；Fino Amazon.ca **CAD 18.00**（同日）；Fino YesStyle ≈ **CAD 16.0**；Hada YesStyle bundle 折合 ≈ **CAD 20.5／瓶**。對這些通道，**貼紙套利帶空或窄**。
- Amazon.ca Melano CAD 33.89 是 **Premium**，與目錄 Intensive 可能不同 SKU。Amazon.ca Biore CAD 16.97 是 **加拿大配方**。Mannings essence HKD 99 當 COGS 會把 Melano 毛利打到 **17%**（低於 28%）。
- 基準 18.6k 在 12.5 h／週、CAD 25/h 後 ≈ **+2.4k**；CAD 50/h 後 ≈ **−13.9k**。
- Year 2 基準 1.6–2.0× Year 1 GMV、仍無 PE、仍無防曬：稅後人工=0 約 **31–40k**（本筆記延伸，非鎖定）。
- Tornado：GM > AOV ≈ 船期轉換 > 廣告% > air 4 pt ≈ 退貨%。公司稅差不進前六。

---

## Sources

### 倉庫

- `docs/research/_shared-facts.md`（2026-08-20）
- `docs/hk-ca-tax-price-advantage-2026.md`（2026-08-20）
- `src/lib/money.ts`（FX、0.62 回推）
- `src/lib/scoring-core.ts`（`marginPct`）
- `src/data/products.ts`（CORE_PRODUCTS）
- `src/data/criteria.ts`（`minMarginPct: 0.28`）

### 公開價／運費（2026-08 抓）

- YesStyle Melano CC 20ml：https://www.yesstyle.com/en/rohto-mentholatum-melano-cc-vitamin-c-essence-20ml/info.html/pid.1122834023 （2026-08-20；USD 爬蟲 + 本機 TWD）
- YesStyle Fino 230g：https://www.yesstyle.com/en/shiseido-fino-premium-touch-hair-mask/info.html/pid.1126837080 （USD 爬蟲 2026-08-15；本機 2026-08-20 TWD）
- YesStyle Hada Labo Gokujyun Premium Lotion：https://www.yesstyle.com/en/rohto-mentholatum-hada-labo-gokujyun-premium-lotion/info.html/pid.1122621936 ；2pcs https://www.yesstyle.com/en/rohto-mentholatum-hada-labo-gokujyun-premium-lotion-2pcs-bundle-set/info.html/pid.1137891360
- YesStyle Biore UV Aqua Rich Watery Essence 70g：https://www.yesstyle.com/en/kao-biore-uv-aqua-rich-watery-essence-sunscreen-spf-50-pa-70g-2025/info.html/pid.1122056968 （2026-08-20）
- Amazon.ca Fino 230g：https://www.amazon.ca/Three-Fino-Premium-penetration-Essence/dp/B00YM1MEJI （CAD 18.00，2026-08-20）
- Amazon.ca Melano CC Premium 20ml：https://www.amazon.ca/Medicinal-Concentration-Countermeasure-Premium-Essence/dp/B08WMJB5WV （CAD 33.89，2026-08-20）
- Amazon.ca Bioré Canadian SPF50 50ml：https://www.amazon.ca/Weightless-Moisturizer-Dermatologist-Invisible-Protection/dp/B0CNQDYGQ1 （CAD 16.97，2026-08-20；**非 JP SKU**）
- マツキヨ Melano CC Premium：https://www.matsukiyococokara-online.com/store/catalog/product/view/id/4987241168583 （¥1,628 稅込；爬蟲 2026-08-16）
- kakaku.com Melano 比價：https://search.kakaku.com/メラノCC 薬用しみ集中対策プレミアム美容液/ （最安 ¥604，2026-08-20 搜；非發票）
- Mannings Melano CC Bright Essence 20ml：https://www.mannings.com.hk/zh-hant/mentholatum-melano-cc-bright-vitamin-c-essence-20ml/p/226969 （搜尋 snippet HKD 99；**頁面全文 fetch 失敗**）
- Stylevana Melano CC 列表：https://www.stylevana.com/en_US/brands/rohto-mentholatum/melano-cc.html （snippet US$ 9.89；**全文 fetch 空**）
- Shoppers Drug Mart JP Hada Labo Premium：**搜尋無產品頁（2026-08-20 fail）**
- Amazon.ca JP Hada Labo Premium 170ml **CAD 標價：fail**
- FreightAmigo HK→Canada：https://www.freightamigo.com/en/blog/popular-route/hong-kong-to-canada-shipping-2/ （2026-02-27／更新 2026-03-13；100 kg air USD 8–12／kg；10 kg parcel USD 100–200）
- Freightos HK→Canada：https://www.freightos.com/shipping-routes/shipping-from-hong-kong-to-canada/ （抓取 2026-08-20；10 kg 示例 USD 53.88／kg）
- DHL HK→YVR 0.2–0.5 kg **live quote：fail**。DHL Discover HK→US 0.5 kg 文件 ~HK$500：https://www.dhl.com/discover/en-hk/e-commerce-advice/shipping-guides-by-country/ship-from-hk-to-the-us （2025-11-04；**不用作本盤小包價**）
- USD/CAD：Yahoo Finance `CAD=X` 2026-08-20 close 1.3780
- Reddit YesStyle Hada Labo 缺貨討論：https://www.reddit.com/r/AsianBeauty/comments/1o03hg7/ （2025-10）；https://www.reddit.com/r/AsianBeauty/comments/1q2td5n/ （2026-01）

稅、PE、GST、防曬法規的一次文獻在稅 memo 文末，本筆記不重複展開。落地前仍是三個付費核對：HK IRD 來源、加拿大 PE／GST／PST CPA、SKU 級 CNF／DIN。其費用大於 Year 1 公司稅差。
